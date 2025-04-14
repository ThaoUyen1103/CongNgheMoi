import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllUsersExceptCurrent, sendFriendRequestMobile, deleteFriend, showFriendRequestsMobile, showSentFriendRequestsMobile, findUserByAccountId } from '../services/api';
import io from 'socket.io-client';

const socket = io('http://192.168.1.33:3001', { transports: ['websocket'] });

const ContactScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentAccountId, setCurrentAccountId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('suggestions');
    const [friendRequests, setFriendRequests] = useState([]);
    const [sentFriendRequests, setSentFriendRequests] = useState([]);

    const loadData = async () => {
        try {
            setLoading(true);
            const accountId = await AsyncStorage.getItem('account_id');
            if (!accountId) {
                throw new Error('Không tìm thấy account_id');
            }
            setCurrentAccountId(accountId);

            const userResponse = await findUserByAccountId(accountId);
            if (userResponse.status !== 200 || !userResponse.data._id) {
                throw new Error('Không tìm thấy user từ account_id');
            }
            const userId = userResponse.data._id;
            setCurrentUserId(userId);
            console.log('Current User ID (_id):', userId);

            const response = await getAllUsersExceptCurrent(userId);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Lỗi khi tải danh sách người dùng');
            }
            setUsers(response.data);

            const friendRequestsResponse = await showFriendRequestsMobile(userId);
            setFriendRequests(friendRequestsResponse.status === 200 ? friendRequestsResponse.data : []);

            const sentFriendRequestsResponse = await showSentFriendRequestsMobile(userId);
            setSentFriendRequests(sentFriendRequestsResponse.status === 200 ? sentFriendRequestsResponse.data : []);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu:', err);
            setError(err.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        socket.on('friend-accepted', ({ userId, friendId, conversationId }) => {
            if (currentUserId === userId || currentUserId === friendId) {
                loadData();
            }
        });

        const unsubscribe = navigation.addListener('focus', loadData);

        return () => {
            socket.off('friend-accepted');
            unsubscribe();
        };
    }, [navigation, currentUserId]);

    const sendFriendRequest = async (receiverId) => {
        try {
            const response = await sendFriendRequestMobile(currentUserId, receiverId);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Lỗi khi gửi yêu cầu kết bạn');
            }
            Alert.alert('Thành công', 'Đã gửi yêu cầu kết bạn');
            await loadData();
        } catch (err) {
            console.error('Lỗi gửi yêu cầu kết bạn:', err);
            Alert.alert('Lỗi', err.response?.data?.message || err.message || 'Lỗi khi gửi yêu cầu kết bạn');
        }
    };

    const deleteFriendAction = async (friendId) => {
        try {
            const response = await deleteFriend(currentUserId, friendId);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Lỗi khi xóa bạn bè');
            }
            Alert.alert('Thành công', 'Đã xóa bạn bè thành công');
            await loadData();
        } catch (err) {
            console.error('Lỗi xóa bạn bè:', err);
            Alert.alert('Lỗi', err.message || 'Lỗi khi xóa bạn bè');
        }
    };

    const openChat = (friend) => {
        navigation.navigate('ChatScreen', {
            conversation_id: friend.conversation_id?.[0]?.conversation_id || 'new_conversation', // Giả sử có conversation_id
            friend_id: friend._id,
            friend_name: friend.userName,
            friend_avatar: friend.avatar || 'https://via.placeholder.com/150',
        });
    };

    const suggestedUsers = users.filter(user =>
        user._id !== currentUserId &&
        !user.friend?.some(f => f.friend_id === currentUserId) &&
        !friendRequests.some(req => req._id === user._id) &&
        !sentFriendRequests.some(req => req._id === user._id)
    );
    const friends = users.filter(user => user.friend?.some(f => f.friend_id === currentUserId));

    const renderUserItem = ({ item }) => (
        <TouchableOpacity onPress={() => openChat(item)}>
            <View style={styles.userItem}>
                <View style={styles.userInfo}>
                    <Image
                        source={{ uri: item.avatar || 'https://via.placeholder.com/150' }}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.userName}>{item.userName}</Text>
                        <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
                    </View>
                </View>
                {activeTab === 'suggestions' ? (
                    <TouchableOpacity onPress={() => sendFriendRequest(item._id)} style={styles.actionButton}>
                        <Text style={styles.actionText}>Kết bạn</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => deleteFriendAction(item._id)} style={styles.deleteButton}>
                        <Text style={styles.deleteText}>Xóa kết bạn</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
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
            <TouchableOpacity
                style={styles.friendRequestButton}
                onPress={() => navigation.navigate('FriendRequest')}
            >
                <Text style={styles.friendRequestText}>Lời mời kết bạn ({friendRequests.length})</Text>
            </TouchableOpacity>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
                    onPress={() => setActiveTab('suggestions')}
                >
                    <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
                        Gợi ý kết bạn ({suggestedUsers.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
                    onPress={() => setActiveTab('friends')}
                >
                    <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
                        Bạn bè ({friends.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <FlatList
                data={activeTab === 'suggestions' ? suggestedUsers : friends}
                keyExtractor={(item) => item._id}
                renderItem={renderUserItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Không có {activeTab === 'suggestions' ? 'gợi ý kết bạn' : 'bạn bè'}</Text>}
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
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
    },
    friendRequestButton: {
        backgroundColor: '#0088FF',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 20,
    },
    friendRequestText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
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
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    phoneNumber: {
        fontSize: 14,
        color: '#888888',
    },
    actionButton: {
        backgroundColor: '#0088FF',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#FF4444',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    deleteText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
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

export default ContactScreen;