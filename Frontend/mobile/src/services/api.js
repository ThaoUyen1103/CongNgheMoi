import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: 'http://192.168.34.235:3001',
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log('API response:', response.data);
        return response;
    },
    (error) => {
        console.error('Axios error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config,
        });
        return Promise.reject(error);
    }
);

export default api;

// Kiểm tra số điện thoại đã tồn tại
export const checkPhoneNumber = async (phoneNumber) => {
    try {
        const response = await api.get(`/user/findUserByPhoneNumber/${phoneNumber}`);
        return response.status === 200 && response.data;
    } catch (err) {
        return false;
    }
};

// Đăng ký tài khoản
export const registerAccount = async (phoneNumber, password) => {
    return await api.post('/account/registerMobile', { phoneNumber, password });
};

// Tạo hồ sơ người dùng
export const createUserProfile = async (account_id, userName, firstName, lastName, phoneNumber, dateOfBirth, gender, avatar, coverImage) => {
    return await api.post('/user/registerMobile', {
        account_id,
        userName,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        gender,
        avatar,
        coverImage,
    });
};

// Đăng nhập
export const loginMobile = async (phoneNumber, password) => {
    return await api.post('/account/loginMobile', { phoneNumber, password });
};

// Lấy thông tin người dùng theo account_id
export const findUserByAccountId = async (accountId) => {
    return await api.get('/user/findUser', { params: { account_id: accountId } });
};

// Lấy thông tin người dùng theo user_id
export const findUserByUserId = async (userId) => {
    try {
        const response = await api.post('/user/findUserByUserID', { user_id: userId });
        return response;
    } catch (error) {
        console.error('Lỗi tìm user by ID:', error);
        throw error;
    }
};

// Cập nhật thông tin người dùng
export const updateUser = async (account_id, firstName, lastName, dateOfBirth, gender) => {
    return await api.put('/user/updateInfo', {
        firstName,
        lastName,
        dateOfBirth,
        gender,
    }, { params: { account_id } });
};

// Cập nhật ảnh đại diện
export const updateAvatar = async (account_id, avatar) => {
    return await api.put('/user/updateAvatar', { avatar }, { params: { account_id } });
};

// Cập nhật ảnh bìa
export const updateCoverImage = async (account_id, coverImage) => {
    return await api.put('/user/updateCoverImage', { coverImage }, { params: { account_id } });
};

// Tìm người dùng theo số điện thoại
export const findUserByPhoneNumber = async (phoneNumber) => {
    return await api.get(`/user/findUserByPhoneNumber/${phoneNumber}`);
};

// Gửi yêu cầu kết bạn
export const sendFriendRequest = async (currentUserId, selectedUserId) => {
    return await api.post('/user/friend-request', { currentUserId, selectedUserId });
};

// Hủy yêu cầu kết bạn
export const cancelFriendRequest = async (user_id, friend_id) => {
    return await api.post('/user/recallsentRequest', { user_id, friend_id });
};

// Chấp nhận yêu cầu kết bạn
export const acceptFriendRequest = async (user_id, friend_id) => {
    return await api.post('/user/friend-request/accept', { user_id, friend_id });
};

// Từ chối yêu cầu kết bạn
export const rejectFriendRequest = async (user_id, friend_id) => {
    return await api.post('/user/friend-request/reject', { user_id, friend_id });
};

// Đổi mật khẩu
export const changePassword = async (account_id, password) => {
    return await api.put('/account/updatePassword', { password }, { params: { account_id } });
};

// Quên mật khẩu
export const forgotPassword = async (phoneNumber, password) => {
    return await api.put('/account/updatePasswordByPhone', { password }, { params: { phoneNumber } });
};

// Xóa bạn bè
export const deleteFriend = async (userId, friendId) => {
    return await api.post('/user/deleteFriend', { userId, friendId });
};

// Gửi yêu cầu kết bạn (mobile)
export const sendFriendRequestMobile = async (currentUserId, selectedUserId) => {
    return await api.post('/user/friend-request-mobile', { currentUserId, selectedUserId });
};

// Hiển thị danh sách yêu cầu kết bạn (mobile)
export const showFriendRequestsMobile = async (userId) => {
    return await api.get(`/user/friend-request-mobile/${userId}`);
};

// Hiển thị danh sách yêu cầu kết bạn đã gửi (mobile)
export const showSentFriendRequestsMobile = async (userId) => {
    return await api.get(`/user/sent-friend-request-mobile/${userId}`);
};

// Lấy danh sách tất cả người dùng trừ người hiện tại
export const getAllUsersExceptCurrent = async (currentUserId) => {
    return await api.get('/user/findAllExceptCurrentUser', { params: { currentUserId } });
};

// Conversation APIs
export const getConversationsByUserIDMobile = async (user_id) => {
    return await api.post('/conversation/getConversationsByUserIDMobile', { user_id });
};

// Lấy thông tin cuộc trò chuyện theo ID
export const getConversationById = async (conversation_id) => {
    return await api.get(`/conversation/getConversationById/${conversation_id}`);
};

// Tạo nhóm
export const createConversationsGroupMobile = async (data) => {
    return await api.post('/conversation/create-group', data);
};

// Thêm thành viên vào nhóm
export const addMemberToConversationGroupMobile = async (conversation_id, member_ids, user_id) => {
    return await api.post('/conversation/add-member', { conversation_id, member_ids, user_id });
};

// Xóa thành viên khỏi nhóm
export const removeMemberFromConversationGroupMobile = async ({ conversation_id, member_id, user_id }) => {
    return await api.put('/conversation/removeMemberFromConversationGroup', {
        conversation_id,
        member_id,
        user_id,
    });
};

// Gán quyền phó nhóm
export const authorizeDeputyLeader = async ({ conversation_id, member_id, user_id }) => {
    return await api.put('/conversation/authorizeDeputyLeader', {
        conversation_id,
        member_id,
        user_id,
    });
};

// Gỡ quyền phó nhóm
export const unauthorizeDeputyLeader = async ({ conversation_id, member_id, user_id }) => {
    return await api.put('/conversation/unauthorizeDeputyLeader', {
        conversation_id,
        member_id,
        user_id,
    });
};

// Gán quyền trưởng nhóm
export const authorizeGroupLeader = async ({ conversation_id, member_id, user_id }) => {
    return await api.put('/conversation/authorizeGroupLeader', {
        conversation_id,
        member_id,
        user_id,
    });
};

// Giải tán nhóm
export const disbandGroupMobile = async ({ conversation_id, user_id }) => {
    return await api.put('/conversation/disbandGroup', {
        conversation_id,
        user_id,
    });
};

// Rời nhóm
export const leaveGroup = async ({ conversation_id, user_id }) => {
    return await api.put('/conversation/leaveGroup', { conversation_id, user_id });
};

// Message APIs
export const sendMessage = async (conversation_id, user_id, content, contentType = 'text', replyTo = null) => {
    return await api.post('/message/createMessagesWeb', {
        conversation_id,
        user_id,
        content,
        contentType,
        replyTo,
    });
};

export const sendFileMobile = async (conversation_id, user_id, fileUri, contentType) => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const formData = new FormData();
            formData.append('conversation_id', conversation_id);
            formData.append('user_id', user_id);
            formData.append('contentType', contentType);
            formData.append('file', {
                uri: fileUri,
                type: contentType === 'video' ? 'video/mp4' :
                    contentType === 'image' ? 'image/jpeg' :
                        contentType === 'audio' && fileUri.endsWith('.3gp') ? 'audio/3gpp' :
                            contentType === 'file' && fileUri.includes('.pdf') ? 'application/pdf' :
                                contentType === 'file' && fileUri.includes('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                                    contentType === 'file' && fileUri.includes('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                                        'application/octet-stream',
                name: fileUri.split('/').pop(),
            });

            console.log('Chuẩn bị gửi tệp:', { conversation_id, user_id, contentType, fileUri });
            console.log('FormData:', JSON.stringify(formData));

            const response = await api.post('/message/createMessagesMobile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000,
            });

            console.log('Phản hồi gửi tệp:', response.data);
            return response;
        } catch (error) {
            attempt++;
            console.error('Lỗi gửi tệp (lần thử', attempt, '):', error);
            if (attempt === maxRetries) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

export const getMessages = async (conversation_id) => {
    return await api.post('/message/findAllMessagesWeb', { conversation_id });
};

export const getLastMessage = async (conversation_id, user_id) => {
    return await api.post('/message/getLastMessageMobile', { conversation_id, user_id });
};

export const deleteMyMessage = async (message_id, user_id) => {
    return await api.post('/message/deleteMyMessageWeb', { message_id, user_id });
};

export const recallMessage = async (message_id) => {
    return await api.post('/message/recallMessageWeb', { message_id });
};

// API mới cho Mobile
export const createNotificationMobile = async (data) => {
    return await api.post('/message/createNotificationMobile', data);
};

export const forwardMessageMobile = async (message_id, conversation_id, user_id) => {
    return await api.post('/message/forwardMessageMobile', { message_id, conversation_id, user_id });
};

export const getAllMediaMobile = async (conversation_id) => {
    return await api.post('/message/getAllMediaMobile', { conversation_id });
};

export const getAllFileMobile = async (conversation_id) => {
    return await api.post('/message/getAllFileMobile', { conversation_id });
};