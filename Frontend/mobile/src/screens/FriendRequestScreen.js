import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showFriendRequestsMobile, showSentFriendRequestsMobile, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, findUserByAccountId } from '../services/api';
import io from 'socket.io-client';

const socket = io('http://192.168.1.33:3001', { transports: ['websocket'] });

const FriendRequestScreen = ({ navigation }) => {
    const [friendRequests, setFriendRequests] = useState([]);
    const [sentFriendRequests, setSentFriendRequests] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('received');

    const loadData = async () => {
        try {
            setLoading(true);
            const accountId = await AsyncStorage.getItem('account_id');
            if (!accountId) throw new Error('Không tìm thấy account_id');

            const userResponse = await findUserByAccountId(accountId);
            if (userResponse.status !== 200 || !userResponse.data._id) {
                throw new Error('Không tìm thấy user từ account_id');
            }
            const userId = userResponse.data._id;
            setCurrentUserId(userId);

            const friendRequestsResponse = await showFriendRequestsMobile(userId);
            setFriendRequests(friendRequestsResponse.status === 200 ? friendRequestsResponse.data : []);

            const sentFriendRequestsResponse = await showSentFriendRequestsMobile(userId);
            setSentFriendRequests(sentFriendRequestsResponse.status === 200 ? sentFriendRequestsResponse.data : []);
        } catch (err) {
            console.error('Lỗi tải dữ liệu:', err);
            setError(err.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        socket.on('friend-accepted', ({ conversationId }) => {
            loadData();
        });

        return () => {
            socket.off('friend-accepted');
        };
    }, []);

    const acceptRequest = async (friendId) => {
        try {
            const response = await acceptFriendRequest(currentUserId, friendId);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Lỗi khi chấp nhận yêu cầu kết bạn');
            }
            Alert.alert('Thành công', 'Đã chấp nhận yêu cầu kết bạn');
            await loadData();
            socket.emit('friend-accepted', { userId: currentUserId, friendId, conversationId: response.data.conversation._id });
        } catch (err) {
            console.error('Lỗi chấp nhận yêu cầu kết bạn:', err);
            Alert.alert('Lỗi', err.message || 'Lỗi khi chấp nhận yêu cầu kết bạn');
        }
    };

    const rejectRequest = async (friendId) => {
        try {
            const response = await rejectFriendRequest(currentUserId, friendId);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Lỗi khi từ chối yêu cầu kết bạn');
            }
            Alert.alert('Thành công', 'Đã từ chối yêu cầu kết bạn');
            await loadData();
        } catch (err) {
            console.error('Lỗi từ chối yêu cầu kết bạn:', err);
            Alert.alert('Lỗi', err.message || 'Lỗi khi từ chối yêu cầu kết bạn');
        }
    };

    const cancelRequest = async (friendId) => {
        try {
            const response = await cancelFriendRequest(currentUserId, friendId);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Lỗi khi hủy yêu cầu kết bạn');
            }
            Alert.alert('Thành công', 'Đã hủy yêu cầu kết bạn');
            await loadData();
        } catch (err) {
            console.error('Lỗi hủy yêu cầu kết bạn:', err);
            Alert.alert('Lỗi', err.message || 'Lỗi khi hủy yêu cầu kết bạn');
        }
    };

    const renderRequestItem = ({ item }) => (
        <View style={styles.requestItem}>
            <Image
                source={{ uri: item.avatar || 'https://via.placeholder.com/150' }}
                style={styles.avatar}
            />
            <View style={styles.requestInfo}>
                <Text style={styles.userName}>{item.userName}</Text>
                <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
                {activeTab === 'received' ? (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.acceptButton]}
                            onPress={() => acceptRequest(item._id)}
                        >
                            <Text style={styles.buttonText}>Chấp nhận</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.rejectButton]}
                            onPress={() => rejectRequest(item._id)}
                        >
                            <Text style={styles.buttonText}>Từ chối</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => cancelRequest(item._id)}
                    >
                        <Text style={styles.buttonText}>Hủy yêu cầu</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'received' && styles.activeTab]}
                    onPress={() => setActiveTab('received')}
                >
                    <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
                        Đã nhận ({friendRequests.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
                    onPress={() => setActiveTab('sent')}
                >
                    <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
                        Đã gửi ({sentFriendRequests.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <FlatList
                data={activeTab === 'received' ? friendRequests : sentFriendRequests}
                keyExtractor={(item) => item._id}
                renderItem={renderRequestItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Không có yêu cầu kết bạn</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        marginBottom: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#0088FF',
    },
    tabText: {
        fontSize: 16,
        color: '#888888',
    },
    activeTabText: {
        color: '#0088FF',
        fontWeight: 'bold',
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    requestInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    phoneNumber: {
        fontSize: 14,
        color: '#888888',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 5,
    },
    button: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    acceptButton: {
        backgroundColor: '#0088FF',
    },
    rejectButton: {
        backgroundColor: '#FF4444',
    },
    cancelButton: {
        backgroundColor: '#FF4444',
        marginTop: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#888888',
    },
});

export default FriendRequestScreen;