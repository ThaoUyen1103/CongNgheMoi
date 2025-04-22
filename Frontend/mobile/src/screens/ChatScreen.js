import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, Alert, Modal, Dimensions, ScrollView, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio, Video } from 'expo-av';
import { sendMessage, getMessages, sendFileMobile, findUserByAccountId, findUserByUserId, deleteMyMessage, recallMessage, getConversationsByUserIDMobile, getConversationById, leaveGroup } from '../services/api';
import io from 'socket.io-client';

const { width, height } = Dimensions.get('window');

const socket = io('http://192.168.34.235:3005', {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
});

const ChatScreen = ({ route, navigation }) => {
    const { conversation_id, friend_name, friend_avatar, isGroup = false, friend_id } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, messageId: null, isCurrentUser: false, content: null, contentType: null });
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [friendsList, setFriendsList] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [replyToMessage, setReplyToMessage] = useState(null);
    const [isGroupActive, setIsGroupActive] = useState(true);
    const [userCache, setUserCache] = useState({}); // Cache thông tin người dùng
    const flatListRef = useRef();
    const [loading, setLoading] = useState(true)
    const [isGroupLeader, setIsGroupLeader] = useState(false);
    const videoRef = useRef(null);

    // Danh sách emoji mở rộng
    const emojis = [
        '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
        '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗',
        '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥',
        '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝',
        '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁',
        '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩',
        '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡',
        '😠', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥳', '🥴',
        '🥺', '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿',
        '👹', '👺', '💀', '👻', '👽', '👾', '🤖', '😺', '😸', '😹',
        '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '💋',
        '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️',
        '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍',
        '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '🗨️',
        '🗯️', '💭', '💤'
    ];

    const joinRoom = () => {
        if (conversation_id && currentUserId) {
            socket.emit('join-conversation', {
                conversation_id,
                user_id: currentUserId
            });
            console.log('✅ Đã emit join-conversation:', conversation_id);
        }
    };

    const checkGroupStatus = async () => {
        try {
            setLoading(true);
            const accountId = await AsyncStorage.getItem('account_id');
            if (!accountId) {
                console.log('Không tìm thấy account_id trong AsyncStorage');
                throw new Error('Không tìm thấy account_id');
            }

            const userResponse = await findUserByAccountId(accountId);
            if (userResponse.status !== 200) {
                console.log('Lỗi lấy user từ account_id:', userResponse.data);
                throw new Error('Không tìm thấy user');
            }
            setCurrentUserId(userResponse.data._id);

            const response = await getConversationById(conversation_id);
            if (response.status !== 200 || !response.data.conversation || response.data.conversation.deleted) {
                console.log('Lỗi lấy thông tin nhóm:', response.data);
                setIsGroupActive(false);
                Alert.alert('Thông báo', 'Nhóm đã bị giải tán hoặc không tồn tại');
                return;
            }

            const conversation = response.data.conversation;
            // Kiểm tra người dùng hiện tại có trong nhóm không
            if (!conversation.members.includes(userResponse.data._id)) {
                console.log('Người dùng không còn trong nhóm:', userResponse.data._id);
                setIsGroupActive(false);
                Alert.alert('Thông báo', 'Bạn không còn trong nhóm này.');
                navigation.goBack();
                return;
            }

            // Lấy vai trò trưởng nhóm
            setIsGroupLeader(conversation.groupLeader === userResponse.data._id);

            setIsGroupActive(true);
            loadMessages();
        } catch (err) {
            console.log('Lỗi trong checkGroupStatus:', err.message);
            Alert.alert('Lỗi', err.message || 'Không thể kiểm tra trạng thái nhóm');
        } finally {
            setLoading(false);
        }
    };

    const checkFriendStatus = async (retries = 5, delay = 2000) => {
        try {
            setLoading(true); // Bắt đầu tải
            const accountId = await AsyncStorage.getItem('account_id');
            if (!accountId) {
                console.log('Không tìm thấy account_id trong AsyncStorage');
                throw new Error('Không tìm thấy account_id');
            }

            const userResponse = await findUserByAccountId(accountId);
            if (userResponse.status !== 200 || !userResponse.data._id) {
                console.log('Lỗi lấy user từ account_id:', userResponse.data);
                throw new Error('Không tìm thấy user từ account_id');
            }
            const userId = userResponse.data._id;
            setCurrentUserId(userId);

            let isFriend = false;
            for (let i = 0; i < retries; i++) {
                const userData = await findUserByUserId(userId);
                if (userData.status !== 200) {
                    console.log('Lỗi lấy thông tin người dùng:', userData.data);
                    throw new Error('Không lấy được thông tin người dùng');
                }
                isFriend = userData.data.user.friend.some(f => f.friend_id === friend_id);
                if (isFriend) break;
                if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, delay));
            }

            if (!isFriend && !isGroup) {
                Alert.alert('Thông báo', 'Bạn chưa kết bạn với người này. Vui lòng kết bạn để nhắn tin.');
            }
            loadMessages();
        } catch (err) {
            console.log('Lỗi trong checkFriendStatus:', err.message);
            Alert.alert('Lỗi', err.message || 'Không thể kiểm tra trạng thái bạn bè');
        } finally {
            setLoading(false); // Kết thúc tải
        }
    };

    const loadMessages = async () => {
        try {
            const response = await getMessages(conversation_id);
            if (response.status !== 200) throw new Error(response.data.message || 'Lỗi khi tải tin nhắn');
            setMessages(response.data.messages || []);
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể tải tin nhắn');
        }
    };

    const fetchFriends = async () => {
        try {
            const accountId = await AsyncStorage.getItem('account_id');
            const userResponse = await findUserByAccountId(accountId);
            if (userResponse.status !== 200 || !userResponse.data._id) {
                throw new Error('Không tìm thấy user từ account_id');
            }
            const userId = userResponse.data._id;

            const userData = await findUserByUserId(userId);
            if (userData.status !== 200) throw new Error('Không lấy được thông tin người dùng');

            const friends = await Promise.all(
                userData.data.user.friend.map(async (f) => {
                    const friendData = await findUserByUserId(f.friend_id);
                    if (friendData.status !== 200) return null;
                    return {
                        friend_id: f.friend_id,
                        friend_name: friendData.data.user.userName || 'Unknown',
                        friend_avatar: friendData.data.user.avatar || 'https://via.placeholder.com/50',
                    };
                })
            );

            setFriendsList(friends.filter(f => f !== null));
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể lấy danh sách bạn bè');
        }
    };

    const fetchUserInfo = async (userId) => {
        if (userCache[userId]) return userCache[userId];
        try {
            const response = await findUserByUserId(userId);
            if (response.status === 200) {
                const user = {
                    ...response.data.user,
                    avatar: response.data.user.avatar?.startsWith('file://') || !response.data.user.avatar
                        ? 'https://placehold.co/50'
                        : response.data.user.avatar,
                };
                setUserCache((prev) => ({ ...prev, [userId]: user }));
                return user;
            }
        } catch (err) {
            console.log('Lỗi tải thông tin người dùng:', err);
        }
        return { userName: 'Unknown', avatar: 'https://placehold.co/50' };
    };

    const forwardMessageToFriend = async (friend) => {
        try {
            if (!contextMenu.content && !contextMenu.contentType) {
                throw new Error('Nội dung tin nhắn không hợp lệ');
            }

            const response = await getConversationsByUserIDMobile(currentUserId);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Lỗi lấy danh sách trò chuyện');
            }

            let targetConversationId;
            for (const convId of response.data.conversation) {
                const convResponse = await getConversationById(convId);
                if (convResponse.status !== 200) continue;
                if (convResponse.data.conversation.members.includes(friend.friend_id)) {
                    targetConversationId = convId;
                    break;
                }
            }

            if (!targetConversationId) {
                const createConvResponse = await fetch('http://192.168.34.235:3001/conversation/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ members: [currentUserId, friend.friend_id] }),
                });
                const createConvData = await createConvResponse.json();
                if (createConvResponse.status !== 200) {
                    throw new Error(createConvData.message || 'Lỗi tạo cuộc trò chuyện');
                }
                targetConversationId = createConvData.conversation._id;
            }

            let res;
            if (contextMenu.contentType === 'text') {
                res = await sendMessage(targetConversationId, currentUserId, contextMenu.content, 'text');
            } else {
                res = await sendFileMobile(targetConversationId, currentUserId, contextMenu.content, contextMenu.contentType);
            }

            if (res.status !== 200) {
                throw new Error(res.data.message || `Lỗi gửi ${contextMenu.contentType === 'text' ? 'tin nhắn' : 'tệp'}`);
            }

            socket.emit('send-message', res.data.messages);
            Alert.alert('Thành công', `Đã chuyển tiếp tin nhắn đến ${friend.friend_name}`);
            setShowForwardModal(false);
            setContextMenu({ visible: false, messageId: null, isCurrentUser: false, content: null, contentType: null });
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể chuyển tiếp tin nhắn');
        }
    };

    const checkFileSize = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const sizeInMB = blob.size / (1024 * 1024);
            if (sizeInMB > 100) {
                throw new Error('Kích thước file vượt quá 100MB');
            }
            return true;
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể kiểm tra kích thước file');
            return false;
        }
    };

    const pickMultipleImages = async () => {
        if (!isGroupActive && !isGroup) {
            Alert.alert('Thông báo', 'Bạn chưa kết bạn với người này.');
            return;
        }
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                console.log('Quyền truy cập thư viện ảnh bị từ chối:', permissionResult);
                Alert.alert('Quyền truy cập bị từ chối', 'Cần cấp quyền truy cập thư viện ảnh. Vui lòng kiểm tra cài đặt quyền trên thiết bị.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Sửa thành enum hợp lệ
                allowsMultipleSelection: true,
                quality: 1,
            });

            console.log('Kết quả chọn nhiều hình:', result);

            if (!result.canceled && result.assets) {
                for (const asset of result.assets) {
                    console.log('Gửi hình:', asset.uri);
                    await handleSendFile(asset.uri, 'image');
                }
                Alert.alert('Thành công', `Đã gửi ${result.assets.length} hình ảnh`);
            } else {
                console.log('Người dùng hủy chọn hình hoặc không có hình nào được chọn');
            }
        } catch (err) {
            console.error('Lỗi trong pickMultipleImages:', err);
            Alert.alert('Lỗi', err.message || 'Không thể chọn ảnh');
        }
    };

    const pickImage = async () => {
        if (!isGroupActive && !isGroup) {
            Alert.alert('Thông báo', 'Bạn chưa kết bạn với người này.');
            return;
        }
        try {
            // Kiểm tra quyền truy cập camera
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                console.log('Quyền truy cập camera bị từ chối:', permissionResult);
                Alert.alert('Quyền truy cập bị từ chối', 'Cần cấp quyền truy cập camera. Vui lòng kiểm tra cài đặt quyền trên thiết bị.');
                return;
            }

            // Mở camera để chụp ảnh
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Chỉ chụp ảnh
                allowsEditing: true, // Cho phép chỉnh sửa ảnh sau khi chụp
                quality: 1, // Chất lượng ảnh cao nhất
            });

            console.log('Kết quả chụp ảnh:', result);

            if (!result.canceled && result.assets?.length > 0) {
                console.log('Gửi ảnh chụp:', result.assets[0].uri);
                await handleSendFile(result.assets[0].uri, 'image');
            } else {
                console.log('Người dùng hủy chụp ảnh hoặc không có ảnh nào được chụp');
            }
        } catch (err) {
            console.error('Lỗi trong pickImage (camera):', err);
            Alert.alert('Lỗi', err.message || 'Không thể chụp ảnh');
        }
    };

    const handleLeaveGroup = async () => {
        if (!currentUserId) {
            Alert.alert('Lỗi', 'Không thể xác định người dùng. Vui lòng thử lại sau.');
            return;
        }
        if (isGroupLeader) {
            Alert.alert('Lỗi', 'Trưởng nhóm không thể rời nhóm. Hãy chuyển quyền trưởng nhóm hoặc giải tán nhóm.');
            return;
        }
        Alert.alert(
            'Rời nhóm',
            'Bạn có chắc muốn rời nhóm này không?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Rời',
                    onPress: async () => {
                        try {
                            const response = await leaveGroup({
                                conversation_id,
                                user_id: currentUserId,
                            });
                            if (response.status !== 200) throw new Error(response.data.message || 'Lỗi khi rời nhóm');
                            Alert.alert('Thành công', 'Bạn đã rời nhóm');
                            await checkGroupStatus();
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Lỗi', err.message || 'Không thể rời nhóm');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const pickFile = async () => {
        if (!isGroupActive && !isGroup) {
            Alert.alert('Thông báo', 'Bạn chưa kết bạn với người này.');
            return;
        }
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'video/mp4',
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0 && (await checkFileSize(result.assets[0].uri))) {
                const mimeType = result.assets[0].mimeType || 'application/octet-stream';
                const type = mimeType.includes('video') ? 'video' :
                    mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('excel') ? 'file' : 'file';
                await handleSendFile(result.assets[0].uri, type);
            }
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể chọn tệp');
        }
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Quyền truy cập bị từ chối', 'Cần cấp quyền truy cập microphone.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true, // Cho phép ghi âm khi app ở background
            });

            // Reset recording nếu có
            if (recording) {
                await recording.stopAndUnloadAsync();
                setRecording(null);
            }

            const newRecording = new Audio.Recording();
            try {
                await newRecording.prepareToRecordAsync({
                    ...Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
                    android: {
                        extension: '.m4a',
                        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
                        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
                        sampleRate: 44100,
                        numberOfChannels: 1, // Giảm xuống 1 kênh có thể giảm kích thước file
                        bitRate: 128000,
                    },
                    ios: {
                        extension: '.m4a',
                        outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
                        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                        sampleRate: 44100,
                        numberOfChannels: 1, // Giảm xuống 1 kênh
                        bitRate: 128000,
                    }
                });

                console.log('Bắt đầu ghi âm...');
                await newRecording.startAsync();
                setRecording(newRecording);
                setIsRecording(true);

                let duration = 0;
                const interval = setInterval(() => {
                    duration += 1;
                    setRecordingDuration(duration);
                }, 1000);

                newRecording.setOnRecordingStatusUpdate((status) => {
                    console.log('Trạng thái ghi âm:', status);
                    if (!status.isRecording) {
                        clearInterval(interval);
                    }
                });
            } catch (err) {
                console.error('Lỗi cấu hình ghi âm:', err);
                if (newRecording) {
                    try {
                        await newRecording.stopAndUnloadAsync();
                    } catch (stopErr) {
                        console.error('Lỗi khi dừng recording sau khi gặp lỗi:', stopErr);
                    }
                }
                throw err;
            }
        } catch (err) {
            console.error('Lỗi trong startRecording:', err);
            Alert.alert('Lỗi', `Không thể bắt đầu ghi âm: ${err.message}`);
        }
    };

    const stopRecording = async () => {
        if (!recording) {
            console.log('Không có phiên ghi âm đang hoạt động');
            return;
        }

        try {
            console.log('Đang dừng ghi âm...');
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            console.log('File ghi âm URI:', uri);

            setIsRecording(false);
            setRecordingDuration(0);

            // Thêm thời gian chờ ngắn để đảm bảo file đã được lưu hoàn toàn
            await new Promise(resolve => setTimeout(resolve, 300));

            if (!uri) {
                throw new Error('Không nhận được URI của file ghi âm');
            }

            // Không cần kiểm tra file tồn tại, URI từ recording sẽ hợp lệ
            try {
                await handleSendFile(uri, 'audio');
                setRecording(null);
                Alert.alert('Thành công', 'Đã gửi tin nhắn thoại');
            } catch (sendErr) {
                console.error('Lỗi gửi file âm thanh:', sendErr);
                throw new Error(`Không thể gửi file âm thanh: ${sendErr.message}`);
            }
        } catch (err) {
            console.error('Lỗi trong stopRecording:', err);
            Alert.alert('Lỗi', `Không thể gửi tin nhắn thoại: ${err.message}`);
            setRecording(null);
            setIsRecording(false);
        }
    };

    const playAudio = async (uri) => {
        try {
            const { sound } = await Audio.Sound.createAsync({ uri });
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    sound.unloadAsync();
                }
            });
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể phát tin nhắn thoại');
        }
    };

    useEffect(() => {
        if (isGroup) {
            checkGroupStatus();
        } else {
            checkFriendStatus();
        }
    }, []);

    useEffect(() => {
        socket.connect();
        joinRoom();

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket.id);
            joinRoom();
        });

        socket.on('reconnect', () => {
            console.log('🔁 Socket reconnected:', socket.id);
            joinRoom();
            loadMessages();
        });

        socket.on('receive-message', (data) => {
            try {
                const message = typeof data === 'string' ? JSON.parse(data) : data;
                if (message.conversation_id === conversation_id) {
                    setMessages((prev) => {
                        if (prev.some((msg) => msg._id === message._id)) return prev;
                        return [...prev, message];
                    });
                    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
                }
            } catch (err) {
                console.error('Lỗi xử lý tin nhắn:', err);
            }
        });

        socket.on('message-deleted', (messageId) => {
            setMessages((prev) => prev.map((msg) =>
                msg._id === messageId && !msg.deletedBy.includes(currentUserId)
                    ? { ...msg, deletedBy: [...(msg.deletedBy || []), currentUserId] }
                    : msg
            ));
        });

        socket.on('message-recalled', (data) => {
            try {
                const recalledMessage = typeof data === 'string' ? JSON.parse(data) : data;
                const recalledId = recalledMessage._id || recalledMessage.message_id;
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === recalledId
                            ? { ...msg, recalled: true, content: 'Tin nhắn đã bị thu hồi' }
                            : msg
                    )
                );
            } catch (err) {
                console.error('Lỗi parse tin nhắn thu hồi:', err);
            }
        });

        socket.on('group-event', ({ conversation_id: convId, event, data }) => {
            if (convId === conversation_id) {
                if (event === 'member-added') {
                    setMessages((prev) => [...prev, {
                        _id: `notify-${Date.now()}`,
                        conversation_id,
                        contentType: 'notify',
                        content: `${data.userName} đã được thêm vào nhóm`,
                        createdAt: new Date(),
                    }]);
                } else if (event === 'member-removed') {
                    setMessages((prev) => [...prev, {
                        _id: `notify-${Date.now()}`,
                        conversation_id,
                        contentType: 'notify',
                        content: `${data.userName} đã bị xóa khỏi nhóm`,
                        createdAt: new Date(),
                    }]);
                } else if (event === 'group-disbanded') {
                    setIsGroupActive(false);
                    Alert.alert('Thông báo', 'Nhóm đã bị giải tán');
                    navigation.goBack();
                } else if (event === 'deputy-assigned') {
                    setMessages((prev) => [...prev, {
                        _id: `notify-${Date.now()}`,
                        conversation_id,
                        contentType: 'notify',
                        content: `${data.userName} đã được gán quyền phó nhóm`,
                        createdAt: new Date(),
                    }]);
                } else if (event === 'leader-assigned') {
                    setMessages((prev) => [...prev, {
                        _id: `notify-${Date.now()}`,
                        conversation_id,
                        contentType: 'notify',
                        content: `${data.userName} đã được gán quyền trưởng nhóm`,
                        createdAt: new Date(),
                    }]);
                } else if (event === 'deleteDeputyLeader') {
                    setMessages((prev) => [...prev, {
                        _id: `notify-${Date.now()}`,
                        conversation_id,
                        contentType: 'notify',
                        content: `${data.userName} đã bị gỡ quyền phó nhóm`,
                        createdAt: new Date(),
                    }]);
                } else if (event === 'member-left') {
                    setMessages((prev) => [...prev, {
                        _id: `notify-${Date.now()}`,
                        conversation_id,
                        contentType: 'notify',
                        content: `${data.userName} đã rời nhóm`,
                        createdAt: new Date(),
                    }]);
                    // Kiểm tra người dùng hiện tại có phải người rời không
                    if (data.userId === currentUserId) {
                        setIsGroupActive(false);
                        Alert.alert('Thông báo', 'Bạn đã rời nhóm này.');
                        navigation.goBack();
                    }
                }
            }
        });

        socket.on('connect_error', (err) => {
            console.error('🚫 Socket connect error:', err);
            setTimeout(() => socket.connect(), 3000);
        });

        return () => {
            socket.off('connect');
            socket.off('reconnect');
            socket.off('receive-message');
            socket.off('message-deleted');
            socket.off('message-recalled');
            socket.off('group-event');
            socket.off('connect_error');
            socket.disconnect();
        };
    }, [conversation_id, isGroup, currentUserId]);

    useEffect(() => {
        navigation.setOptions({
            title: friend_name,
            headerStyle: { backgroundColor: '#0088FF' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerRight: () => (
                <View style={styles.headerRight}>
                    {isGroup && (
                        <>
                            <TouchableOpacity onPress={() => navigation.navigate('GroupManagement', {
                                conversation_id,
                                conversationName: friend_name,
                                groupAvatar: friend_avatar,
                            })}>
                                <MaterialCommunityIcons name="account-group" size={24} color="#fff" style={styles.headerIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLeaveGroup} disabled={loading}>
                                <MaterialCommunityIcons
                                    name="exit-to-app"
                                    size={24}
                                    color={loading ? '#888' : '#fff'} // Màu xám khi đang tải
                                    style={styles.headerIcon}
                                />
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity onPress={() => Alert.alert('Gọi thoại', 'Tính năng đang phát triển')}>
                        <MaterialCommunityIcons name="phone" size={24} color="#fff" style={styles.headerIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert('Gọi video', 'Tính năng đang phát triển')}>
                        <MaterialCommunityIcons name="video" size={24} color="#fff" style={styles.headerIcon} />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, friend_name, friend_avatar, isGroup, loading]);

    useEffect(() => {
        const loadUserInfoForMessages = async () => {
            const uniqueSenderIds = [...new Set(messages.map((msg) => typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId))];
            for (const senderId of uniqueSenderIds) {
                if (!userCache[senderId] && senderId !== currentUserId) {
                    await fetchUserInfo(senderId);
                }
            }
        };
        if (messages.length > 0 && currentUserId) {
            loadUserInfoForMessages();
        }
    }, [messages, currentUserId]);

    const sendText = async () => {
        if (!isGroupActive) {
            Alert.alert('Thông báo', 'Bạn đã rời nhóm và không thể gửi tin nhắn.');
            return;
        }
        if (!isGroupActive && !isGroup) {
            Alert.alert('Thông báo', 'Bạn chưa kết bạn với người này.');
            return;
        }
        if (!newMessage.trim() && !replyToMessage) return;

        try {
            let content = newMessage;
            let contentType = 'text';
            if (replyToMessage) {
                const previewText = replyToMessage.contentType === 'text' && replyToMessage.content
                    ? replyToMessage.content.split(' ').slice(0, 5).join(' ') + (replyToMessage.content.split(' ').length > 5 ? '...' : '')
                    : `[${replyToMessage.contentType}]`;
                content = `Trả lời: "${previewText}"\n${newMessage}`;
            }

            const res = await sendMessage(conversation_id, currentUserId, content, contentType, replyToMessage?._id);
            if (res.status !== 200) throw new Error(res.data.message || 'Lỗi khi gửi tin nhắn');

            setMessages((prev) => [...prev, res.data.messages]);
            socket.emit('send-message', res.data.messages);
            setNewMessage('');
            setReplyToMessage(null);
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể gửi tin nhắn');
        }
    };

    const pickEmoji = (emoji) => {
        setNewMessage((prev) => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleSendFile = async (uri, type) => {
        if (!isGroupActive) {
            Alert.alert('Thông báo', 'Bạn đã rời nhóm và không thể gửi tệp.');
            return;
        }
        try {
            console.log('Bắt đầu gửi file:', { uri, type, conversation_id, user_id: currentUserId });
            const res = await sendFileMobile(conversation_id, currentUserId, uri, type);
            console.log('Kết quả gửi file:', res);
            if (res.status !== 200) {
                throw new Error(res.data.message || 'Lỗi khi gửi file');
            }
            setMessages((prev) => [...prev, res.data.messages]);
            socket.emit('send-message', res.data.messages);
        } catch (err) {
            console.error('Lỗi trong handleSendFile:', err);
            Alert.alert('Lỗi', err.message || 'Không thể gửi file');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        const message = messages.find(msg => msg._id === messageId);
        if (!message) {
            Alert.alert('Lỗi', 'Tin nhắn không tồn tại hoặc đã bị xoá');
            return;
        }

        try {
            const res = await deleteMyMessage(messageId, currentUserId);
            if (res.status !== 200) throw new Error(res.data.message || 'Lỗi khi xóa tin nhắn');

            socket.emit('delete-my-message', { message_id: messageId, user_id: currentUserId });

            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, deletedBy: [...(msg.deletedBy || []), currentUserId] }
                        : msg
                )
            );

            setContextMenu({ visible: false, messageId: null, isCurrentUser: false, content: null, contentType: null });
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể xóa tin nhắn');
        }
    };

    const handleRecallMessage = async (messageId) => {
        try {
            const res = await recallMessage(messageId);
            if (res.status !== 200) throw new Error(res.data.message || 'Lỗi khi thu hồi tin nhắn');
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, recalled: true, content: 'Tin nhắn đã bị thu hồi' }
                        : msg
                )
            );
            if (!messageId) {
                console.warn('❌ messageId bị null khi recall');
                return;
            }
            socket.emit('message-recalled', { _id: messageId, conversation_id });
            setContextMenu({ visible: false, messageId: null, isCurrentUser: false, content: null, contentType: null });
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể thu hồi tin nhắn');
        }
    };

    const handleForwardMessage = (message) => {
        if (!message || !message._id || !message.content || !message.contentType) {
            Alert.alert('Lỗi', 'Dữ liệu tin nhắn không hợp lệ để chuyển tiếp');
            return;
        }

        fetchFriends();
        setContextMenu({
            visible: false,
            messageId: message._id,
            isCurrentUser: typeof message.senderId === 'object'
                ? message.senderId?._id === currentUserId
                : message.senderId === currentUserId,
            content: message.content,
            contentType: message.contentType,
        });
        setShowForwardModal(true);
    };

    const handleReplyMessage = (messageId, content, contentType) => {
        setReplyToMessage({ _id: messageId, content, contentType });
        setContextMenu({ visible: false, messageId: null, isCurrentUser: false, content: null, contentType: null });
    };

    const cleanFileName = (url) => {
        const fileName = url.split('/').pop().replace(/^zola_(image|video|file|audio)_/, '');
        return fileName;
    };

    const renderMessage = ({ item }) => {
        const senderId = typeof item.senderId === 'object' ? item.senderId?._id : item.senderId;
        const isCurrentUser = senderId === currentUserId;
        const isDeleted = item.deletedBy?.includes(currentUserId);
        const isReply = item.content && item.content.includes('Trả lời:');
        let replyPreview = '';
        let mainContent = item.content || '';

        const senderInfo = typeof item.senderId === 'object' && item.senderId?.userName
            ? { ...item.senderId, avatar: item.senderId.avatar?.startsWith('file://') || !item.senderId.avatar ? 'https://placehold.co/50' : item.senderId.avatar }
            : userCache[senderId] || { userName: 'Unknown', avatar: 'https://placehold.co/50' };

        if (isReply && item.contentType === 'text') {
            const parts = item.content.split('\n');
            replyPreview = parts[0].replace('Trả lời: ', '');
            mainContent = parts.slice(1).join('\n');
        }

        if (item.contentType === 'notify') {
            return (
                <View style={styles.notifyMessage}>
                    <Text style={styles.notifyText}>{item.content}</Text>
                </View>
            );
        }

        if (isDeleted) {
            return (
                <View style={[styles.messageWrapper, isCurrentUser ? styles.messageWrapperRight : {}]}>
                    <View style={[styles.messageBubble, isCurrentUser ? styles.bubbleRight : styles.bubbleLeft]}>
                        <Text style={[styles.messageText, { fontStyle: 'italic', color: '#888' }]}>
                            Bạn đã xóa tin nhắn này
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <TouchableOpacity
                onLongPress={() => {
                    if (item.contentType !== 'notify' && !isDeleted) {
                        setContextMenu({
                            visible: true,
                            messageId: item._id,
                            isCurrentUser,
                            content: item.content,
                            contentType: item.contentType,
                        });
                    }
                }}
                style={[styles.messageWrapper, isCurrentUser ? styles.messageWrapperRight : {}]}
            >
                <View
                    style={[
                        styles.messageBubble,
                        isCurrentUser ? styles.bubbleRight : styles.bubbleLeft,
                    ]}
                >
                    {!isCurrentUser && isGroup && (
                        <View style={styles.senderContainer}>
                            <Text style={styles.senderName}>{senderInfo.userName}</Text>
                        </View>
                    )}
                    {item.recalled ? (
                        <Text style={[styles.messageText, { fontStyle: 'italic', color: '#888' }]}>
                            Tin nhắn đã bị thu hồi
                        </Text>
                    ) : (
                        <>
                            {isReply && item.contentType === 'text' && (
                                <View style={styles.replyContainer}>
                                    <Text style={styles.replyText}>{replyPreview}</Text>
                                </View>
                            )}
                            {item.contentType === 'text' ? (
                                <Text style={styles.messageText}>{mainContent}</Text>
                            ) : item.contentType === 'image' ? (
                                <TouchableOpacity onPress={() => setPreviewImage(item.content)}>
                                    <Image
                                        source={{ uri: item.content || 'https://placehold.co/200' }}
                                        style={styles.image}
                                        defaultSource={{ uri: 'https://placehold.co/200' }}
                                        onError={(e) => console.log('Lỗi tải ảnh tin nhắn:', item.content, e.nativeEvent.error)}
                                        key={item.content || 'placeholder'}
                                    />
                                </TouchableOpacity>
                            ) : item.contentType === 'video' ? (
                                <View style={styles.videoContainer}>
                                    <Video
                                        ref={videoRef}
                                        source={{ uri: item.content }}
                                        style={styles.video}
                                        useNativeControls
                                        resizeMode="cover"
                                        isLooping={false}
                                        onError={(e) => console.log('Lỗi tải video:', item.content, e)}
                                    />
                                </View>
                            ) : item.contentType === 'audio' ? (
                                <TouchableOpacity onPress={() => playAudio(item.content)} style={styles.audioContainer}>
                                    <MaterialCommunityIcons name="play-circle" size={40} color="#0088FF" />
                                    <Text style={styles.audioText}>Tin nhắn thoại</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => Linking.openURL(item.content)}>
                                    <View style={styles.fileContainer}>
                                        {item.content.includes('.pdf') ? (
                                            <MaterialCommunityIcons name="file-pdf-box" size={40} color="#FF0000" />
                                        ) : item.content.includes('.doc') || item.content.includes('.docx') ? (
                                            <MaterialCommunityIcons name="file-word" size={40} color="#2B579A" />
                                        ) : item.content.includes('.xls') || item.content.includes('.xlsx') ? (
                                            <MaterialCommunityIcons name="file-excel" size={40} color="#217346" />
                                        ) : (
                                            <MaterialCommunityIcons name="file-document" size={40} color="#888" />
                                        )}
                                        <Text style={styles.fileText}>
                                            {item.content.includes('.pdf') ? 'PDF' :
                                                item.content.includes('.doc') || item.content.includes('.docx') ? 'Word' :
                                                    item.content.includes('.xls') || item.content.includes('.xlsx') ? 'Excel' : 'Tệp'}:
                                            {cleanFileName(item.content)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            <Text style={styles.messageTime}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderFriendItem = ({ item }) => (
        <TouchableOpacity style={styles.friendItem} onPress={() => forwardMessageToFriend(item)}>
            <Image source={{ uri: item.friend_avatar }} style={styles.friendAvatar} defaultSource={{ uri: 'https://via.placeholder.com/50' }} />
            <Text style={styles.friendName}>{item.friend_name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {isGroupActive || !isGroup ? (
                <>
                    {Platform.OS === 'web' ? (
                        <ScrollView style={styles.webScrollView} contentContainerStyle={styles.scrollViewContent} ref={flatListRef}>
                            {messages.map((item) => (
                                <View key={item._id}>{renderMessage({ item })}</View>
                            ))}
                        </ScrollView>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item._id}
                            initialNumToRender={20}
                            windowSize={10}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            onScroll={(e) => {
                                const offsetY = e.nativeEvent.contentOffset.y;
                                const contentHeight = e.nativeEvent.contentSize.height;
                                const layoutHeight = e.nativeEvent.layoutMeasurement.height;
                                setShowScrollToBottom(offsetY < contentHeight - layoutHeight - 300);
                            }}
                            style={styles.mobileFlatList}
                            contentContainerStyle={styles.flatListContent}
                        />
                    )}

                    {showScrollToBottom && (
                        <TouchableOpacity
                            style={styles.scrollBtn}
                            onPress={() => {
                                if (Platform.OS === 'web') {
                                    flatListRef.current.scrollTo({ y: flatListRef.current.scrollHeight, animated: true });
                                } else {
                                    flatListRef.current?.scrollToEnd({ animated: true });
                                }
                            }}
                        >
                            <Text style={styles.scrollBtnText}>↓ Tin nhắn mới</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.inputContainer}>
                        {replyToMessage && (
                            <View style={styles.replyPreview}>
                                <Text style={styles.replyPreviewText}>
                                    Trả lời: {replyToMessage.contentType === 'text' && replyToMessage.content
                                        ? replyToMessage.content.split(' ').slice(0, 5).join(' ') + (replyToMessage.content.split(' ').length > 5 ? '...' : '')
                                        : `[${replyToMessage.contentType}]`}
                                </Text>
                                <TouchableOpacity onPress={() => setReplyToMessage(null)}>
                                    <MaterialCommunityIcons name="close" size={20} color="#888" />
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={styles.inputRow}>
                            <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
                                <MaterialCommunityIcons name="emoticon-outline" size={24} color="#888" />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.input}
                                value={newMessage}
                                onChangeText={setNewMessage}
                                placeholder="Nhập tin nhắn..."
                                placeholderTextColor="#888"
                                multiline
                                editable={isGroupActive || !isGroup}
                            />
                            <TouchableOpacity onPress={pickImage}>
                                <MaterialCommunityIcons name="camera" size={24} color="#888" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={pickMultipleImages}>
                                <MaterialCommunityIcons name="image-multiple" size={24} color="#888" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={pickFile}>
                                <MaterialCommunityIcons name="paperclip" size={24} color="#888" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} disabled={!isGroupActive && isGroup}>
                                <MaterialCommunityIcons
                                    name={isRecording ? "stop-circle" : "microphone"}
                                    size={24}
                                    color={isRecording ? "#FF4444" : "#0088FF"}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={sendText}>
                                <MaterialCommunityIcons name="send" size={24} color="#0088FF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isRecording && (
                        <View style={styles.recordingIndicator}>
                            <Text style={styles.recordingText}>
                                Đang ghi âm: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                            </Text>
                        </View>
                    )}

                    {showEmojiPicker && (
                        <View style={styles.emojiPicker}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {emojis.map((emoji, index) => (
                                    <TouchableOpacity key={index} onPress={() => pickEmoji(emoji)} style={styles.emojiButton}>
                                        <Text style={styles.emojiText}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </>
            ) : (
                <View style={styles.noGroupContainer}>
                    <Text style={styles.noGroupText}>Nhóm không còn tồn tại.</Text>
                </View>
            )}

            <Modal visible={contextMenu.visible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.contextMenuOverlay}
                    onPress={() => setContextMenu({ visible: false, messageId: null, isCurrentUser: false, content: null, contentType: null })}
                >
                    <View style={styles.contextMenu}>
                        {contextMenu.isCurrentUser ? (
                            <>
                                <TouchableOpacity style={styles.contextMenuItem} onPress={() => handleRecallMessage(contextMenu.messageId)}>
                                    <Text style={styles.contextMenuText}>Thu hồi</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contextMenuItem} onPress={() => handleDeleteMessage(contextMenu.messageId)}>
                                    <Text style={styles.contextMenuText}>Xóa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contextMenuItem} onPress={() => handleForwardMessage({
                                    _id: contextMenu.messageId,
                                    content: contextMenu.content,
                                    contentType: contextMenu.contentType,
                                    senderId: contextMenu.isCurrentUser ? currentUserId : friend_id,
                                })}>
                                    <Text style={styles.contextMenuText}>Chuyển tiếp</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contextMenuItem} onPress={() => handleReplyMessage(contextMenu.messageId, contextMenu.content, contextMenu.contentType)}>
                                    <Text style={styles.contextMenuText}>Trả lời</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.contextMenuItem}
                                    onPress={() => handleForwardMessage({
                                        _id: contextMenu.messageId,
                                        content: contextMenu.content,
                                        contentType: contextMenu.contentType,
                                        senderId: contextMenu.isCurrentUser ? currentUserId : friend_id,
                                    })}
                                >
                                    <Text style={styles.contextMenuText}>Chuyển tiếp</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contextMenuItem} onPress={() => handleReplyMessage(contextMenu.messageId, contextMenu.content, contextMenu.contentType)}>
                                    <Text style={styles.contextMenuText}>Trả lời</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contextMenuItem} onPress={() => setContextMenu({ visible: false, messageId: null, isCurrentUser: false, content: null, contentType: null })}>
                                    <Text style={styles.contextMenuText}>Hủy</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={showForwardModal} transparent animationType="slide">
                <TouchableOpacity style={styles.forwardModalOverlay} onPress={() => setShowForwardModal(false)}>
                    <View style={styles.forwardModal}>
                        <Text style={styles.forwardModalTitle}>Chọn bạn bè để chuyển tiếp</Text>
                        <FlatList
                            data={friendsList}
                            renderItem={renderFriendItem}
                            keyExtractor={(item) => item.friend_id}
                            style={styles.friendList}
                            ListEmptyComponent={<Text style={styles.emptyText}>Không có bạn bè nào</Text>}
                        />
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowForwardModal(false)}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={!!previewImage} transparent>
                <TouchableOpacity style={styles.modal} onPress={() => setPreviewImage(null)}>
                    <Image source={{ uri: previewImage }} style={styles.fullImage} />
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#F6F6F6',
        ...(Platform.OS === 'web' ? {
            minHeight: '100vh',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
        } : {}),
    },
    webScrollView: {
        flex: 1,
        ...(Platform.OS === 'web' ? {
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 'auto',
            position: 'relative',
            overflow: 'auto',
            paddingBottom: 100,
        } : {}),
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    mobileFlatList: {
        flex: 1,
    },
    flatListContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    messageWrapper: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginVertical: 5,
        alignItems: 'flex-end',
    },
    messageWrapperRight: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginVertical: 5,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 8,
    },
    messageBubble: {
        padding: 10,
        borderRadius: 16,
        maxWidth: width * 0.7,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    bubbleLeft: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    bubbleRight: {
        backgroundColor: '#E5F3FF',
    },
    messageText: {
        fontSize: 16,
        color: '#000',
        lineHeight: 22,
    },
    senderName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    image: {
        width: width * 0.6,
        height: 200,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    videoContainer: {
        width: width * 0.6,
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    audioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    audioText: {
        fontSize: 14,
        color: '#000',
        marginLeft: 8,
    },
    fileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    fileText: {
        fontSize: 14,
        color: '#000',
        marginLeft: 8,
    },
    messageTime: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        textAlign: 'right',
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#E5E5E5',
        ...(Platform.OS === 'web' ? {
            flexShrink: 0,
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
        } : {}),
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginHorizontal: 8,
        fontSize: 16,
        maxHeight: 100,
    },
    replyContainer: {
        backgroundColor: '#F0F0F0',
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    replyText: {
        fontSize: 14,
        color: '#555',
        fontStyle: 'italic',
    },
    replyPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 10,
        marginVertical: 5,
    },
    replyPreviewText: {
        fontSize: 14,
        color: '#555',
        fontStyle: 'italic',
    },
    scrollBtn: {
        position: 'absolute',
        bottom: 80,
        alignSelf: 'center',
        backgroundColor: '#0088FF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    scrollBtnText: {
        color: '#fff',
        fontSize: 14,
    },
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '90%',
        height: '70%',
        resizeMode: 'contain',
    },
    headerRight: {
        flexDirection: 'row',
        marginRight: 10,
    },
    headerIcon: {
        marginHorizontal: 8,
    },
    contextMenuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contextMenu: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        width: 200,
        elevation: 5,
    },
    contextMenuItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    contextMenuText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
    },
    emojiPicker: {
        backgroundColor: '#fff',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#E5E5E5',
        ...(Platform.OS === 'web' ? {
            flexShrink: 0,
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
        } : {}),
    },
    emojiButton: {
        padding: 10,
    },
    emojiText: {
        fontSize: 24,
    },
    noGroupContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noGroupText: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
    },
    forwardModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    forwardModal: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        width: '80%',
        maxHeight: '70%',
    },
    forwardModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    friendList: {
        flexGrow: 0,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    friendAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    friendName: {
        fontSize: 16,
        color: '#000',
    },
    cancelButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#FF4444',
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#888888',
    },
    notifyMessage: {
        alignItems: 'center',
        padding: 10,
    },
    notifyText: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
    },
    recordingIndicator: {
        position: 'absolute',
        bottom: 80,
        alignSelf: 'center',
        backgroundColor: '#FF4444',
        padding: 8,
        borderRadius: 12,
    },
    recordingText: {
        color: '#fff',
        fontSize: 14,
    },
    senderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    senderAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 6,
    },
};

export default ChatScreen;