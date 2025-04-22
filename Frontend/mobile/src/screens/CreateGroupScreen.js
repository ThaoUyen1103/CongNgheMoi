import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import io from 'socket.io-client';
import { findUserByAccountId, findUserByUserId, createConversationsGroupMobile } from '../services/api';

const socket = io('http://192.168.34.235:3005', {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
});

const CreateGroupScreen = ({ navigation }) => {
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [friends, setFriends] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [groupAvatar, setGroupAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

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

            const friendIds = userData.data.user.friend.map(f => f.friend_id);
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

    const pickAvatar = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Quyền truy cập bị từ chối', 'Cần cấp quyền truy cập thư viện ảnh.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled && result.assets?.length > 0) {
                setGroupAvatar(result.assets[0].uri);
            }
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

    const uploadImageToS3 = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const fileName = `group_avatar_${Date.now()}.jpg`;
            const formData = new FormData();
            formData.append('file', {
                uri,
                type: 'image/jpeg',
                name: fileName,
            });
            formData.append('user_id', currentUserId);
            formData.append('contentType', 'image');

            const uploadResponse = await fetch('http://192.168.34.235:3001/message/createMessagesMobile', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                },
            });

            const uploadData = await uploadResponse.json();
            if (uploadResponse.status !== 200) {
                throw new Error(uploadData.message || 'Lỗi upload ảnh');
            }
            return uploadData.messages.content; // URL S3
        } catch (err) {
            throw new Error(err.message || 'Lỗi upload ảnh');
        }
    };

    const createGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên nhóm');
            return;
        }

        if (selectedMembers.length < 1) {
            Alert.alert('Lỗi', 'Nhóm phải có ít nhất 2 thành viên');
            return;
        }

        if (!groupAvatar) {
            Alert.alert('Lỗi', 'Vui lòng chọn ảnh nhóm');
            return;
        }

        try {
            setLoading(true);
            let avatarUrl = groupAvatar;
            if (groupAvatar.startsWith('file://')) {
                avatarUrl = await uploadImageToS3(groupAvatar);
            }

            const members = [...selectedMembers, currentUserId];
            const response = await createConversationsGroupMobile({
                members,
                conversationName: groupName,
                avatar: avatarUrl,
                groupLeader: currentUserId,
            });

            if (response.status !== 200) throw new Error(response.data.message || 'Lỗi tạo nhóm');

            Alert.alert('Thành công', 'Nhóm đã được tạo');

            socket.emit('conversation_id', response.data.conversation._id);

            //  Emit group-event cho từng thành viên được thêm vào nhóm
            selectedMembers.forEach((memberId) => {
                socket.emit('group-event', {
                    conversation_id: response.data.conversation._id,
                    event: 'member-added',
                    data: {
                        userId: memberId,
                        userName: friends.find(f => f._id === memberId)?.userName || 'Bạn',
                    },
                });
            });
            navigation.navigate('Chat', {
                conversation_id: response.data.conversation._id,
                friend_name: groupName,
                friend_avatar: avatarUrl,
                isGroup: true,
            });
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể tạo nhóm');
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (userId) => {
        setSelectedMembers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
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
                <Text style={styles.headerText}>Tạo nhóm</Text>
            </View>
            <View style={styles.groupInfo}>
                <TouchableOpacity onPress={pickAvatar}>
                    <Image source={{ uri: groupAvatar || 'https://via.placeholder.com/80' }} style={styles.groupAvatar} />
                    <Text style={styles.changeAvatarText}>Thay đổi ảnh nhóm</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.groupNameInput}
                    placeholder="Nhập tên nhóm"
                    value={groupName}
                    onChangeText={setGroupName}
                />
            </View>
            <Text style={styles.sectionTitle}>Chọn bạn bè</Text>
            {loading ? (
                <Text style={styles.loadingText}>Đang tải danh sách bạn bè...</Text>
            ) : friends.length === 0 ? (
                <Text style={styles.emptyText}>Bạn chưa có bạn bè nào</Text>
            ) : (
                <FlatList
                    data={friends}
                    renderItem={renderFriendItem}
                    keyExtractor={(item) => item._id}
                    style={styles.userList}
                />
            )}
            <TouchableOpacity style={styles.createButton} onPress={createGroup} disabled={loading}>
                <Text style={styles.createButtonText}>{loading ? 'Đang tạo...' : 'Tạo nhóm'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = {
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { backgroundColor: '#0088FF', padding: 15, paddingTop: 40, alignItems: 'center' },
    headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    groupInfo: { alignItems: 'center', padding: 20 },
    groupAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
    changeAvatarText: { color: '#0088FF', fontSize: 16, marginBottom: 20 },
    groupNameInput: { width: '80%', padding: 10, backgroundColor: '#fff', borderRadius: 8, fontSize: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 20, marginBottom: 10 },
    userList: { flex: 1 },
    userItem: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', marginBottom: 1 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    userName: { flex: 1, fontSize: 16 },
    createButton: { backgroundColor: '#0088FF', padding: 15, margin: 20, borderRadius: 8, alignItems: 'center' },
    createButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    loadingText: { fontSize: 16, textAlign: 'center', marginTop: 20 },
    emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: '#888' },
};

export default CreateGroupScreen;