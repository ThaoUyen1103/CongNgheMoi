import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getConversationsByUserIDMobile, getLastMessage, findUserByAccountId, findUserByUserId, getConversationById } from '../services/api';

const ChatListScreen = ({ navigation }) => {
    const [conversations, setConversations] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentAccountId, setCurrentAccountId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const loadConversations = async () => {
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

            const response = await getConversationsByUserIDMobile(userId);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Lỗi khi tải danh sách trò chuyện');
            }

            const conversationsWithLastMessage = await Promise.all(
                response.data.conversation.map(async (convId) => {
                    const conversationResponse = await getConversationById(convId);
                    if (conversationResponse.status !== 200) {
                        console.log('Lỗi lấy conversation:', convId);
                        return null;
                    }
                    const conversation = conversationResponse.data.conversation;

                    const lastMessageResponse = await getLastMessage(convId, userId);
                    const friendId = conversation.members.find((id) => id !== userId);

                    // Gọi API để lấy thông tin bạn bè
                    const friendResponse = await findUserByUserId(friendId);
                    if (friendResponse.status !== 200) {
                        console.log('Lỗi lấy friend:', friendId);
                        return null;
                    }
                    const friend = friendResponse.data.user;

                    // Kiểm tra trạng thái bạn bè
                    const userData = await findUserByUserId(userId);
                    if (userData.status !== 200) {
                        console.log('Lỗi lấy user:', userId);
                        return null;
                    }
                    const isFriend = userData.data.user.friend.some(f => f.friend_id === friendId);

                    // Log dữ liệu chi tiết
                    console.log('Conversation data:', {
                        convId,
                        friendId,
                        friendName: friend?.userName,
                        friendAvatar: friend?.avatar,
                    });

                    // Xử lý avatar giống ContactScreen
                    const avatarUrl = friend?.avatar || 'https://via.placeholder.com/50';

                    return {
                        _id: convId,
                        createdAt: conversation.createdAt,
                        lastMessage: lastMessageResponse.data.message || 'Chưa có tin nhắn',
                        friend_id: friendId,
                        friend_name: friend?.userName || 'Unknown',
                        friend_avatar: avatarUrl,
                        isFriend: isFriend,
                    };
                })
            );

            const validConversations = conversationsWithLastMessage.filter(conv => conv !== null);
            console.log('Conversations loaded:', validConversations);
            setConversations(validConversations);
        } catch (err) {
            console.error('Lỗi tải danh sách trò chuyện:', err);
            setError(err.message || 'Lỗi khi tải danh sách trò chuyện');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConversations();
    }, []);

    const showAddMenu = () => {
        Alert.alert(
            '',
            '',
            [
                { text: 'Thêm bạn', onPress: () => navigation.navigate('AddFriend') },
                { text: 'Tạo nhóm', onPress: () => console.log('Tạo nhóm pressed') },
                { text: 'Cloud của tơi', onPress: () => console.log('Cloud của tơi pressed') },
                { text: 'Lịch Zalo', onPress: () => console.log('Lịch Zalo pressed') },
                { text: 'Tạo cuộc gọi nhóm', onPress: () => console.log('Tạo cuộc gọi nhóm pressed') },
                { text: 'Thiết bị đăng nhập', onPress: () => console.log('Thiết bị đăng nhập pressed') },
                { text: 'Hủy', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };

    const openChat = (item) => {
        if (!item.isFriend) {
            Alert.alert('Thông báo', `Bạn chưa kết bạn với ${item.friend_name}. Vui lòng kết bạn để nhắn tin.`);
            return;
        }
        navigation.navigate('Chat', {
            conversation_id: item._id,
            friend_id: item.friend_id,
            friend_name: item.friend_name,
            friend_avatar: item.friend_avatar,
        });
    };

    const renderChatItem = ({ item }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => openChat(item)}
        >
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: item.friend_avatar }}
                    style={styles.avatar}
                    defaultSource={{ uri: 'https://via.placeholder.com/50' }}
                    onError={(e) => console.log('Lỗi tải avatar:', item.friend_avatar, e.nativeEvent.error)}
                />
            </View>
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.friend_name}</Text>
                    <Text style={styles.chatTime}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={styles.chatMessageContainer}>
                    <Text style={styles.chatMessage} numberOfLines={1}>
                        {typeof item.lastMessage === 'string' ? item.lastMessage : (item.lastMessage?.content || 'Chưa có tin nhắn')}
                    </Text>
                </View>
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
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#888888" />
                    <Text style={styles.searchText}>Tìm kiếm</Text>
                </View>
                <View style={styles.headerIcons}>
                    <MaterialCommunityIcons name="qrcode" size={24} color="#FFFFFF" />
                    <TouchableOpacity onPress={showAddMenu}>
                        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" style={styles.iconSpacing} />
                    </TouchableOpacity>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#FFFFFF" />
                </View>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                    <Text style={[styles.tabText, styles.activeTabText]}>Ưu tiên</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Khác</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>OA</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="filter-variant" size={24} color="#888888" />
                </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <FlatList
                data={conversations}
                renderItem={renderChatItem}
                keyExtractor={(item) => item._id}
                style={styles.chatList}
                ListEmptyComponent={<Text style={styles.emptyText}>Không có cuộc trò chuyện nào</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#0088FF',
        padding: 15,
        paddingTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flex: 1,
        marginRight: 10,
    },
    searchText: {
        marginLeft: 5,
        color: '#888888',
        fontSize: 16,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconSpacing: {
        marginHorizontal: 15,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        alignItems: 'center',
    },
    tab: {
        paddingVertical: 5,
        marginHorizontal: 5,
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
    chatList: {
        flex: 1,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    avatarContainer: {
        marginRight: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    chatTime: {
        fontSize: 12,
        color: '#888888',
    },
    chatMessageContainer: {
        marginTop: 5,
    },
    chatMessage: {
        fontSize: 14,
        color: '#666666',
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        margin: 10,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#888888',
    },
});

export default ChatListScreen;