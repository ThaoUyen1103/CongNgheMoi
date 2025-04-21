// AddMemberScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { findUserByAccountId, findUserByUserId, addMemberToConversationGroupMobile, getConversationById } from '../services/api';

const AddMemberScreen = ({ route, navigation }) => {
    const { conversation_id } = route.params;
    const [friends, setFriends] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            setLoading(true);
            const accountId = await AsyncStorage.getItem('account_id');
            const userResponse = await findUserByAccountId(accountId);
            if (userResponse.status !== 200) throw new Error('Không tìm thấy user');
            setCurrentUserId(userResponse.data._id);

            const userData = await findUserByUserId(userResponse.data._id);
            if (userData.status !== 200) throw new Error('Lỗi lấy thông tin người dùng');

            const conversationResponse = await getConversationById(conversation_id);
            if (conversationResponse.status !== 200) throw new Error('Lỗi lấy thông tin nhóm');
            const currentMembers = conversationResponse.data.conversation.members;

            const friendIds = userData.data.user.friend
                .map(f => f.friend_id)
                .filter(friendId => !currentMembers.includes(friendId));

            const friendDetails = await Promise.all(
                friendIds.map(async (friendId) => {
                    const friendResponse = await findUserByUserId(friendId);
                    if (friendResponse.status !== 200) return null;
                    return {
                        _id: friendId,
                        userName: friendResponse.data.user.userName,
                        avatar: friendResponse.data.user.avatar || 'https://via.placeholder.com/50',
                    };
                })
            );

            setFriends(friendDetails.filter(f => f !== null));
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể tải danh sách bạn bè');
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (userId) => {
        setSelectedMembers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const addMembers = async () => {
        if (selectedMembers.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một thành viên');
            return;
        }

        Alert.alert(
            'Thêm thành viên',
            `Bạn có chắc muốn thêm ${selectedMembers.length} thành viên vào nhóm?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Thêm',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await addMemberToConversationGroupMobile(
                                conversation_id,
                                selectedMembers,
                                currentUserId
                            );
                            if (response.status !== 200) throw new Error(response.data.message || 'Lỗi thêm thành viên');
                            Alert.alert('Thành công', 'Đã thêm thành viên vào nhóm');
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Lỗi', err.message || 'Không thể thêm thành viên');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const renderFriendItem = ({ item }) => (
        <TouchableOpacity style={styles.userItem} onPress={() => toggleMember(item._id)}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} defaultSource={{ uri: 'https://via.placeholder.com/50' }} />
            <Text style={styles.userName}>{item.userName}</Text>
            {selectedMembers.includes(item._id) && (
                <MaterialCommunityIcons name="check-circle" size={24} color="#0088FF" />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Thêm thành viên</Text>
            </View>
            <Text style={styles.sectionTitle}>Chọn bạn bè</Text>
            {loading ? (
                <Text style={styles.loadingText}>Đang tải danh sách bạn bè...</Text>
            ) : friends.length === 0 ? (
                <Text style={styles.emptyText}>Không có bạn bè nào để thêm</Text>
            ) : (
                <FlatList
                    data={friends}
                    renderItem={renderFriendItem}
                    keyExtractor={(item) => item._id}
                    style={styles.userList}
                />
            )}
            <TouchableOpacity style={styles.addButton} onPress={addMembers} disabled={loading}>
                <Text style={styles.addButtonText}>{loading ? 'Đang thêm...' : 'Thêm thành viên'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = {
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { backgroundColor: '#0088FF', padding: 15, paddingTop: 40, alignItems: 'center' },
    headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 20, marginBottom: 10 },
    userList: { flex: 1 },
    userItem: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', marginBottom: 1 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    userName: { flex: 1, fontSize: 16 },
    addButton: { backgroundColor: '#0088FF', padding: 15, margin: 20, borderRadius: 8, alignItems: 'center' },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    loadingText: { fontSize: 16, textAlign: 'center', marginTop: 20 },
    emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: '#888' },
};

export default AddMemberScreen;