// GroupManagementScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    getConversationById,
    addMemberToConversationGroupMobile,
    removeMemberFromConversationGroupMobile,
    authorizeDeputyLeader,
    authorizeGroupLeader,
    disbandGroupMobile,
    findUserByAccountId,
    findUserByUserId,
    unauthorizeDeputyLeader, // Thêm API gỡ phó nhóm
} from '../services/api';

const GroupManagementScreen = ({ route, navigation }) => {
    const { conversation_id, conversationName, groupAvatar } = route.params;
    const [members, setMembers] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [groupLeader, setGroupLeader] = useState(null);
    const [deputyLeaders, setDeputyLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroupInfo();
    }, []);

    const fetchGroupInfo = async () => {
        try {
            setLoading(true);
            const accountId = await AsyncStorage.getItem('account_id');
            const userResponse = await findUserByAccountId(accountId);
            if (userResponse.status !== 200) throw new Error('Không tìm thấy user');
            setCurrentUserId(userResponse.data._id);

            const response = await getConversationById(conversation_id);
            if (response.status !== 200) throw new Error('Lỗi lấy thông tin nhóm');
            const conversation = response.data.conversation;

            const memberDetails = await Promise.all(
                conversation.members.map(async (memberId) => {
                    const userResponse = await findUserByUserId(memberId);
                    if (userResponse.status !== 200) return null;
                    return {
                        _id: memberId,
                        userName: userResponse.data.user.userName,
                        avatar: userResponse.data.user.avatar || 'https://via.placeholder.com/50',
                    };
                })
            );

            setMembers(memberDetails.filter((m) => m !== null));
            setGroupLeader(conversation.groupLeader);
            setDeputyLeaders(conversation.deputyLeader || []);
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể tải thông tin nhóm');
        } finally {
            setLoading(false);
        }
    };

    const addMember = async () => {
        if (currentUserId !== groupLeader && !deputyLeaders.includes(currentUserId)) {
            Alert.alert('Lỗi', 'Chỉ trưởng nhóm hoặc phó nhóm mới có thể thêm thành viên');
            return;
        }
        navigation.navigate('AddMember', { conversation_id });
    };

    const confirmAction = (title, message, onConfirm) => {
        Alert.alert(
            title,
            message,
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xác nhận', onPress: onConfirm, style: 'destructive' },
            ],
            { cancelable: true }
        );
    };

    const removeMember = async (memberId) => {
        if (currentUserId !== groupLeader && !deputyLeaders.includes(currentUserId)) {
            Alert.alert('Lỗi', 'Chỉ trưởng nhóm hoặc phó nhóm mới có thể xóa thành viên');
            return;
        }
        if (memberId === groupLeader) {
            Alert.alert('Lỗi', 'Không thể xóa trưởng nhóm');
            return;
        }

        confirmAction(
            'Xóa thành viên',
            'Bạn có chắc muốn xóa thành viên này khỏi nhóm?',
            async () => {
                try {
                    const response = await removeMemberFromConversationGroupMobile({
                        conversation_id,
                        member_id: memberId,
                        user_id: currentUserId, // Thêm user_id
                    });
                    if (response.status !== 200) throw new Error(response.data.message || 'Lỗi xóa thành viên');
                    setMembers((prev) => prev.filter((m) => m._id !== memberId));
                    Alert.alert('Thành công', 'Đã xóa thành viên');
                } catch (err) {
                    Alert.alert('Lỗi', err.message || 'Không thể xóa thành viên');
                }
            }
        );
    };

    const assignDeputyLeader = async (memberId) => {
        if (currentUserId !== groupLeader) {
            Alert.alert('Lỗi', 'Chỉ trưởng nhóm mới có thể gán quyền phó nhóm');
            return;
        }
        confirmAction(
            'Gán quyền phó nhóm',
            'Bạn có chắc muốn gán quyền phó nhóm cho thành viên này?',
            async () => {
                try {
                    const response = await authorizeDeputyLeader({
                        conversation_id,
                        member_id: memberId,
                        user_id: currentUserId, // Thêm user_id
                    });
                    if (response.status !== 200) throw new Error(response.data.message || 'Lỗi gán quyền');
                    setDeputyLeaders((prev) => [...prev, memberId]);
                    Alert.alert('Thành công', 'Đã gán quyền phó nhóm');
                } catch (err) {
                    Alert.alert('Lỗi', err.message || 'Không thể gán quyền');
                }
            }
        );
    };

    const assignGroupLeader = async (memberId) => {
        if (currentUserId !== groupLeader) {
            Alert.alert('Lỗi', 'Chỉ trưởng nhóm mới có thể chuyển quyền trưởng nhóm');
            return;
        }
        confirmAction(
            'Chuyển quyền trưởng nhóm',
            'Bạn có chắc muốn chuyển quyền trưởng nhóm cho thành viên này?',
            async () => {
                try {
                    const response = await authorizeGroupLeader({
                        conversation_id,
                        member_id: memberId,
                        user_id: currentUserId, // Thêm user_id
                    });
                    if (response.status !== 200) throw new Error(response.data.message || 'Lỗi chuyển quyền');
                    setGroupLeader(memberId);
                    Alert.alert('Thành công', 'Đã chuyển quyền trưởng nhóm');
                } catch (err) {
                    Alert.alert('Lỗi', err.message || 'Không thể chuyển quyền');
                }
            }
        );
    };

    const deleteDeputyLeader = async (memberId) => {
        if (currentUserId !== groupLeader) {
            Alert.alert('Lỗi', 'Chỉ trưởng nhóm mới có thể gỡ quyền phó nhóm');
            return;
        }
        confirmAction(
            'Gỡ quyền phó nhóm',
            'Bạn có chắc muốn gỡ quyền phó nhóm của thành viên này?',
            async () => {
                try {
                    const response = await unauthorizeDeputyLeader({
                        conversation_id,
                        member_id: memberId,
                        user_id: currentUserId, // Thêm user_id
                    });
                    if (response.status !== 200) throw new Error(response.data.message || 'Lỗi gỡ quyền phó nhóm');
                    setDeputyLeaders((prev) => prev.filter((id) => id !== memberId));
                    Alert.alert('Thành công', 'Đã gỡ quyền phó nhóm');
                } catch (err) {
                    Alert.alert('Lỗi', err.message || 'Không thể gỡ quyền phó nhóm');
                }
            }
        );
    };

    const disbandGroup = async () => {
        if (currentUserId !== groupLeader) {
            Alert.alert('Lỗi', 'Chỉ trưởng nhóm mới có thể giải tán nhóm');
            return;
        }
        confirmAction(
            'Giải tán nhóm',
            'Bạn có chắc muốn giải tán nhóm? Hành động này không thể hoàn tác.',
            async () => {
                try {
                    const response = await disbandGroupMobile({
                        conversation_id,
                        user_id: currentUserId,
                    });
                    if (response.status !== 200) throw new Error(response.data.message || 'Lỗi giải tán nhóm');
                    Alert.alert('Thành công', 'Nhóm đã được giải tán');
                    navigation.goBack();
                } catch (err) {
                    Alert.alert('Lỗi', err.message || 'Không thể giải tán nhóm');
                }
            }
        );
    };

    const renderMemberItem = ({ item }) => (
        <View style={styles.memberItem}>
            <Image
                source={{ uri: item.avatar?.startsWith('file://') || !item.avatar ? 'https://placehold.co/50' : item.avatar }}
                style={styles.avatar}
                defaultSource={{ uri: 'https://placehold.co/50' }}
                onError={(e) => console.log('Lỗi tải avatar GroupManagement:', item.avatar, e.nativeEvent.error)}
                key={item.avatar || 'placeholder'} // Thêm key để buộc reload
            />
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.userName || 'Unknown'}</Text>
                <Text style={styles.memberRole}>
                    {item._id === groupLeader ? 'Trưởng nhóm' : deputyLeaders.includes(item._id) ? 'Phó nhóm' : 'Thành viên'}
                </Text>
            </View>
            {currentUserId === groupLeader && item._id !== groupLeader && (
                <View style={styles.memberActions}>
                    {deputyLeaders.includes(item._id) ? (
                        <TouchableOpacity onPress={() => deleteDeputyLeader(item._id)}>
                            <MaterialCommunityIcons name="star-off" size={24} color="#FF4444" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => assignDeputyLeader(item._id)}>
                            <MaterialCommunityIcons name="account-star" size={24} color="#0088FF" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => assignGroupLeader(item._id)}>
                        <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeMember(item._id)}>
                        <MaterialCommunityIcons name="account-remove" size={24} color="#FF4444" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Quản lý nhóm: {conversationName}</Text>
            </View>
            <View style={styles.groupInfo}>
                <Image source={{ uri: groupAvatar }} style={styles.groupAvatar} />
                <Text style={styles.groupName}>{conversationName}</Text>
            </View>
            <TouchableOpacity style={styles.addMemberButton} onPress={addMember}>
                <MaterialCommunityIcons name="account-plus" size={24} color="#fff" />
                <Text style={styles.addMemberText}>Thêm thành viên</Text>
            </TouchableOpacity>
            <FlatList
                data={members}
                renderItem={renderMemberItem}
                keyExtractor={(item) => item._id}
                style={styles.memberList}
                ListEmptyComponent={<Text style={styles.emptyText}>Không có thành viên</Text>}
            />
            {currentUserId === groupLeader && (
                <TouchableOpacity style={styles.disbandButton} onPress={disbandGroup}>
                    <Text style={styles.disbandButtonText}>Giải tán nhóm</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = {
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { backgroundColor: '#0088FF', padding: 15, paddingTop: 40, alignItems: 'center' },
    headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    groupInfo: { alignItems: 'center', padding: 20 },
    groupAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
    groupName: { fontSize: 18, fontWeight: 'bold' },
    addMemberButton: {
        flexDirection: 'row',
        backgroundColor: '#0088FF',
        padding: 10,
        margin: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addMemberText: { color: '#fff', fontSize: 16, marginLeft: 10 },
    memberList: { flex: 1 },
    memberItem: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', marginBottom: 1 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    memberInfo: { flex: 1 },
    memberName: { fontSize: 16, fontWeight: 'bold' },
    memberRole: { fontSize: 14, color: '#888' },
    memberActions: { flexDirection: 'row', alignItems: 'center' },
    disbandButton: { backgroundColor: '#FF4444', padding: 15, margin: 20, borderRadius: 8, alignItems: 'center' },
    disbandButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: '#888' },
};

export default GroupManagementScreen;