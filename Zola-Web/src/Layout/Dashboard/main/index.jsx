import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import ConversationDetail from './ConversationDetail'
// import indexMain from './indexMain.css'
import { BsCodeSquare } from 'react-icons/bs'
import { CiVideoOn } from 'react-icons/ci'
import { IoCallOutline } from 'react-icons/io5'
// import { IoMdSend } from 'react-icons/io'
import { MdOutlineAddReaction } from 'react-icons/md'
import { TbMessage2Bolt } from 'react-icons/tb'
import { ImAttachment } from 'react-icons/im'
import { FiAtSign } from 'react-icons/fi'
// import { CiImageOn } from 'react-icons/ci'
import { LuSticker } from 'react-icons/lu'
import { TbCapture } from 'react-icons/tb'
import { TiBusinessCard } from 'react-icons/ti'
import { LuAlarmClock } from 'react-icons/lu'
import { SlLike } from 'react-icons/sl'
import { SlPicture } from 'react-icons/sl'
import { MdFormatColorText } from 'react-icons/md'
import { MdOutlineAssignmentTurnedIn } from 'react-icons/md'
import { MdOutlinePriorityHigh } from 'react-icons/md'
import { toast, Toaster } from 'react-hot-toast'
import { io } from 'socket.io-client'
import moment from 'moment'
import Picker from '@emoji-mart/react'
import Modal from 'react-modal'
// import SubSideBar from '../subSideBar/index'
import { FileIcon, defaultStyles } from 'react-file-icon'
import { useLocation } from 'react-router-dom'


const Main = ({
    // user,
    friend_list,
    currentFriend,
    currentConversationGroup,
    // conversationMyCloud,
    currentconversationMyCloud,
    clickCurrentCount,
}) => {
    // alert(conversationMyCloud)
    const [currentSource, setCurrentSource] = useState(null)
    const [currentAvatarSender, setCurrentAvatarSender] = useState(null)

    // const [currentConversationGroup_Id, setCurrentConversationGroupId] =
    //     useState(null)
    const [currentFriend_Id, setCurrentFriendId] = useState(null)
    const user_id = localStorage.getItem('user_id').replace(/"/g, '').trim()

    const [messages, setMessages] = useState([])

    // viết 1 biến gửi tin nhắn
    const [sendMessage, setsendMessage] = useState('')
    // Tạo một biến trạng thái để lưu trữ kết nối socket
    const [socket, setSocket] = useState(null)

    const [conversation_id, setConversationId] = useState('')
    const [isPickerVisible, setPickerVisible] = useState(false)

    // Khởi tạo state là một mảng rỗng để lưu trữ các ảnh
    const [images, setImages] = useState([])

    const [imagePreviewUrl, setImagePreviewUrl] = useState(null)

    // modal bạn bè
    const [isModalOpenFriend, setIsModalOpenFriend] = useState(false)
    const [friends, setFriends] = useState([]) // replace this with actual friends data

    // khởi tạo state để lưu trữ file
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState(null)
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
    const [isButtonPressed, setIsButtonPressed] = useState(false)
    const [isButtonPressed1, setIsButtonPressed1] = useState(false)
    const [isButtonPressed2, setIsButtonPressed2] = useState(false)
    const [isButtonPressed3, setIsButtonPressed3] = useState(false)
    // Tạo một mảng trong state để lưu trữ các tin nhắn đã được thu hồi
    const [recalledMessages, setRecalledMessages] = useState([])
    // Tạo 1 mảng trong state để lưu trữ các  tin nhắn đã được xoá ở chỉ mình tôi
    const [deleteMyMessage, setDeleteMyMessage] = useState([])
    // loading
    const [isLoading, setIsLoading] = useState(false)
    const [groupList, setGroupList] = useState([]);
    const fetchGroups = async () => {
        try {
            const response = await axios.post(
                'http://localhost:3001/conversation/getConversationGroupByUserIDWeb',
                { user_id }
            )
            console.log("Group list response:", response.data)

            if (
                response.data &&
                Array.isArray(response.data.conversationGroup) &&
                response.data.conversationGroup.length > 0
            ) {
                setGroupList(response.data.conversationGroup)
            } else {
                setGroupList([])
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách nhóm:', error)
        }
    }


    useEffect(() => {
        if (isModalOpenFriend) {
            console.log("Modal open, fetching groups...")
            fetchGroups()
        }
    }, [isModalOpenFriend])

    const [pendingForwards, setPendingForwards] = useState([]);



    useEffect(() => {
        if (isLoading) {
            return
        }

        if (currentFriend != null) {
            setIsLoading(true)
            // Rest of your code
        }
    }, [currentFriend])

    useEffect(() => {
        if (isLoading) {
            return
        }

        if (currentConversationGroup != null) {
            setIsLoading(true)
            // Rest of your code
        }
        if (currentconversationMyCloud != null) {
            setIsLoading(true)
            // set currentconversationMyCloud từ localstorage
        }
    }, [currentConversationGroup, currentconversationMyCloud])
    // const [currentGroupId, setCurrentGroupId] = useState(null)
    // Sắp xếp mảng tin nhắn theo thuộc tính 'createdAt'
    const sortedMessages = messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    )

    // Thêm trạng thái mới
    const [replyingTo, setReplyingTo] = useState(null)
    // Cập nhật trạng thái khi người dùng nhấp vào nút "Trả lời"
    const handleReply = (message) => {
        // setReplyingTo(message.content)
        setReplyingTo(message)
    }

    // Tạo một tham chiếu đến thẻ input
    const formData = new FormData()
    // console.log('user_id trong main là : ' + user_id)
    useEffect(() => {
        if (currentFriend != null) {
            setCurrentFriendId(currentFriend.friend_id)
            // // alert(JSON.stringify(currentFriend))
            // console.log(currentFriend)
            setCurrentSource({
                avatar: currentFriend.avatar,
                name: currentFriend.friendName,
                // set thêm friend_id
                friend_id: currentFriend.friend_id,
            })
            //setCurrentAvatarSender(currentFriend.avatar)
        }
    }, [currentFriend])
    const location = useLocation()

    useEffect(() => {
        setReplyingTo(null)
    }, [conversation_id, location])

    const [replyContent, setReplyContent] = useState(null)

    useEffect(() => {
        messages.forEach((message) => {
            if (message.replyTo) {
                // Try to get the reply content from the cache
                const cachedReplyContent = localStorage.getItem(
                    `replyContent_${message._id}`,
                )

                if (cachedReplyContent) {
                    // If the reply content is in the cache, use it
                    setReplyContent((prevReplyContent) => ({
                        ...prevReplyContent,
                        [message._id]: JSON.parse(cachedReplyContent),
                    }))
                } else {
                    axios
                        .post(
                            'http://localhost:3001/message/getMessageReplyContentWeb',
                            {
                                replyTo: message.replyTo,
                            },
                        )
                        .then((response) => {
                            if (
                                response.data.thongbao ===
                                'Tìm thấy tin nhắn!!!'
                            ) {
                                localStorage.setItem(
                                    `replyContent_${message._id}`,
                                    JSON.stringify(response.data.message),
                                )

                                setReplyContent((prevReplyContent) => ({
                                    ...prevReplyContent,
                                    [message._id]: response.data.message,
                                }))
                            }
                        })
                        .catch((error) => {
                            console.error(error)
                        })
                }
            }
        })
    }, [messages])

    const handleReplyClick = (messageId) => {
        alert('Tính năng đang triển khai')
    }

    const fetchMessages = async (conversation_id) => {
        // alert(conversation_id)
        const response = await axios.post(
            'http://localhost:3001/message/findAllMessagesWeb',
            {
                conversation_id: conversation_id,
            },
        )

        async function fetchUserInfo(userId) {
            try {
                const res = await axios.post('http://localhost:3001/user/getInfoByUserIDWeb', {
                    sender_id: userId,
                })
                return {
                    userName: res.data.userName || res.data.name,
                    firstName: res.data.firstName,
                    lastName: res.data.lastName,
                    avatar: res.data.avatar,
                }
            } catch (error) {
                console.error('Error fetching user info:', error)
                return null
            }
        }

        if (response.data.thongbao === 'Tìm thấy tin nhắn!!!') {
            const messagesWithAvatar = await Promise.all(
                response.data.messages.map(async (message) => {
                    let avatar
                    let name
                    const cachedAvatar = localStorage.getItem(
                        `avatar_${message.senderId}`,
                    )
                    const cachedName = localStorage.getItem(
                        `name_${message.senderId}`,
                    )
                    if (cachedAvatar && cachedName) {
                        avatar = cachedAvatar
                        name = cachedName
                    } else {
                        const res = await axios.post(
                            'http://localhost:3001/user/getInfoByUserIDWeb',
                            {
                                sender_id: message.senderId,
                            },
                        )
                        avatar = res.data.avatar
                        name = res.data.name
                        localStorage.setItem(
                            `avatar_${message.senderId}`,
                            avatar,
                        )
                        localStorage.setItem(`name_${message.senderId}`, name)
                    }

                    if (message.originalSender && typeof message.originalSender === 'string') {
                        const userInfo = await fetchUserInfo(message.originalSender)
                        if (userInfo) {
                            message.originalSender = userInfo
                        }
                    }

                    return {
                        ...message,
                        avatar: avatar,
                        name: name,
                        // replyTo: message.replyTo, // Thêm dòng này để xử lý trường replyTo
                    }
                }),
            )
            setMessages(messagesWithAvatar)

            setIsLoading(false)
        } else if (response.data.thongbao === 'Không tìm thấy tin nhắn!!!') {
            setMessages([])
            setIsLoading(false)
        }
    }
    useEffect(() => {
        if (!currentFriend_Id || !user_id) {
            return
        }

        axios
            .post('http://localhost:3001/conversation/createConversationsWeb', {
                user_id: user_id,
                friend_id: currentFriend_Id,
            })
            .then((response) => {
                if (
                    response.data.message ===
                    'Không tìm thấy user_id hoặc friend_id!!!'
                ) {
                    toast('Không tìm thấy user_id hoặc friend_id!!!')
                    return
                }

                if (
                    response.data.message === 'Conversation đã tồn tại!!!' ||
                    response.data.message === 'Tạo conversation thành công!!!'
                ) {
                    const conversation_id = response.data.conversation._id
                    setConversationId(conversation_id)
                    if (conversation_id) {
                        fetchMessages(conversation_id)
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }, [currentFriend_Id, user_id])

    useEffect(() => {
        if (currentConversationGroup != null) {
            setCurrentSource({
                avatar: currentConversationGroup.avatar,
                name: currentConversationGroup.conversationName,
            })
            fetchMessages(currentConversationGroup._id)
            setConversationId(currentConversationGroup._id)
        }
    }, [currentConversationGroup])
    useEffect(() => {
        if (currentconversationMyCloud != null) {
            setCurrentSource({
                avatar: currentconversationMyCloud.avatar,
                name: currentconversationMyCloud.conversationName,
            })
            fetchMessages(currentconversationMyCloud._id)
            setConversationId(currentconversationMyCloud._id)
        }
    }, [currentconversationMyCloud, clickCurrentCount])

    useEffect(() => {
        if (!conversation_id) {
            return
        }
        axios
            .post('http://localhost:3001/message/findAllRecallMessagesWeb', {
                conversation_id: conversation_id,
            })
            .then((response) => {
                if (
                    response.data.thongbao === 'Tìm thấy tin nhắn đã thu hồi!!!'
                ) {
                    const messageIds = response.data.messages.map(
                        (message) => message._id,
                    )
                    setRecalledMessages((prevMessages) => [
                        ...prevMessages,
                        ...messageIds,
                    ])
                }
                if (
                    response.data.thongbao ===
                    'Không tìm thấy tin nhắn đã thu hồi!!!'
                ) {
                    setRecalledMessages([])
                }
            })
            .catch((error) => {
                console.error(error)
            })

        axios
            .post('http://localhost:3001/message/findAllDeleteMyMessageWeb', {
                conversation_id: conversation_id,
            })
            .then((response) => {
                if (
                    response.data.thongbao ===
                    'Tìm thấy tin nhắn đã bị xoá ở phía tôi!!!'
                ) {
                    const messageIds = response.data.messages.map(
                        (message) => message._id,
                    )
                    setDeleteMyMessage((prevMessages) => [
                        ...prevMessages,
                        ...messageIds,
                    ])
                }
                if (
                    response.data.thongbao ===
                    'Không tìm thấy tin nhắn đã bị xoá ở phía tôi!!!'
                ) {
                    setDeleteMyMessage([])
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }, [conversation_id])

    useEffect(() => {
        if (!conversation_id) return;

        const newSocket = io('http://localhost:3005');
        newSocket.emit('join-conversation', { conversation_id, user_id });

        async function fetchUserInfo(userId) {
            try {
                const res = await axios.post('http://localhost:3001/user/getInfoByUserIDWeb', {
                    sender_id: userId,
                });
                return {
                    userName: res.data.userName || res.data.name,
                    firstName: res.data.firstName,
                    lastName: res.data.lastName,
                    avatar: res.data.avatar,
                };
            } catch (error) {
                console.error('Error fetching user info:', error);
                return null;
            }
        }

        async function processMessage(message) {
            if (message.originalSender && typeof message.originalSender === 'string') {
                const userInfo = await fetchUserInfo(message.originalSender);
                if (userInfo) {
                    message.originalSender = userInfo;
                }
            }
            return message;
        }

        newSocket.on('receive-message', async (data) => {
            if (Array.isArray(data)) {
                const processed = await Promise.all(data.map(processMessage));
                setMessages((prev) => [...prev, ...processed]);
            } else {
                const processed = await processMessage(data);
                setMessages((prev) => [...prev, processed]);
            }
        });

       newSocket.on('server-message-recalled', (recalledDataFromServer) => {
    console.log('✅ Client: Received server-message-recalled event:', recalledDataFromServer);

    if (!recalledDataFromServer || !recalledDataFromServer._id) {
        console.error('🔴 Client: Invalid data from server-message-recalled', recalledDataFromServer);
        return;
    }

    setMessages((prevMessages) =>
        prevMessages.map((msg) => {
            if (msg._id === recalledDataFromServer._id) {
                return {
                    ...msg, 
                    recalled: recalledDataFromServer.recalled, 
                    content: recalledDataFromServer.content,   
                    
                };
            }
            return msg;
        })
    );
});

        // Tin nhắn bị người dùng xóa
        newSocket.on('message-deleted', (message_id) => {
            setDeleteMyMessage((prev) => [...prev, message_id]);
        });

        // Nhận thông báo hệ thống
        newSocket.on('notification', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        // Các sự kiện nhóm
        newSocket.on('group-event', ({ event, data }) => {
            let content = '';
            switch (event) {
                case 'rename':
                    content = `${data.userName} đã đổi tên nhóm thành "${data.conversationName}"`;
                    break;
                case 'avatar-updated':
                    content = `${data.userName} đã cập nhật ảnh đại diện nhóm`;
                    break;
                case 'member-added':
                    content = `${data.userName || data.friend_ids?.join(', ')} đã được thêm vào nhóm`;
                    break;
                case 'member-removed':
                    content = `${data.userName || data.friend_id} đã bị xóa khỏi nhóm`;
                    break;
                case 'leader-assigned':
                    content = `${data.userName || data.friend_id} đã được gán làm trưởng nhóm`;
                    break;
                case 'deputy-assigned':
                    content = `${data.userName || data.friend_id} đã được gán làm phó nhóm`;
                    break;
                case 'deputy-removed':
                case 'deleteDeputyLeader':
                    content = `${data.userName || data.friend_id} đã bị gỡ quyền phó nhóm`;
                    break;
                case 'exit':
                    content = `${data.userName || data.user_id} đã rời khỏi nhóm`;
                    break;
                case 'group-disbanded':
                    content = `Nhóm đã bị giải tán bởi trưởng nhóm`;
                    break;
                default:
                    return;
            }

            setMessages((prev) => [
                ...prev,
                {
                    _id: new Date().getTime().toString(),
                    content,
                    contentType: 'notify',
                    type: 'system',
                },
            ]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [conversation_id]);

    const handleRemoveImage = (index) => {
        setImages((prevImages) => prevImages.filter((image, i) => i !== index))
    }

    const handleIconImageClick = () => {
        fileImgRef.current.click() // Kích hoạt sự kiện click trên thẻ input[type="file"]
    }

    // const handleImageChange = (event) => {
    //     const file = event.target.files[0];
    //     const newImage = {
    //         file: file,
    //         previewUrl: URL.createObjectURL(file),
    //     }
    //     // Thêm ảnh mới vào mảng
    //     setImages((prevImages) => [...prevImages, newImage])
    // }
    const handleImageChange = (event) => {
        const files = event.target.files;
        const newImages = Array.from(files).map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setImages((prevImages) => [...prevImages, ...newImages]);
    };

    const handleSendMessage = async () => {


        // Th1 chỉ gửi tin nhắn
        if (images.length <= 0) {
            const formData = new FormData();
            const contentType = 'text'
            formData.append('conversation_id', conversation_id)
            formData.append('content', sendMessage)
            formData.append('user_id', user_id)
            formData.append('contentType', contentType)
            formData.append('replyTo', replyingTo ? replyingTo._id : null)

            axios
                .post(
                    'http://localhost:3001/message/createMessagesWeb',
                    formData,
                )
                .then(async (response) => {
                    if (
                        response.data.thongbao === 'Tạo tin nhắn thành công!!!'
                    ) {
                        let avatar
                        let name
                        const cachedAvatar = localStorage.getItem(
                            `avatar_${user_id}`,
                        )
                        const cachedName = localStorage.getItem(
                            `name_${user_id}`,
                        )
                        if (cachedAvatar && cachedName) {
                            avatar = cachedAvatar
                            name = cachedName
                        } else {
                            const res = await axios.post(
                                'http://localhost:3001/user/getInfoByUserIDWeb',
                                {
                                    sender_id: user_id,
                                },
                            )
                            avatar = res.data.avatar
                            localStorage.setItem(`avatar_${user_id}`, avatar)
                            name = res.data.name
                            localStorage.setItem(`name_${user_id}`, name)
                        }
                        const messagesWithAvatar = {
                            ...response.data.messages,
                            avatar: avatar,
                            name: name,
                        }
                        // alert(JSON.stringify(messagesWithAvatar))

                        socket.emit('send-message', messagesWithAvatar)

                        // socket.emit('send-message', response.data.messages)

                        setsendMessage('')
                        // setImage(null)
                        setImages([])
                        setImagePreviewUrl(null)
                        // setMessages((prevMessages) => [
                        //     ...prevMessages,
                        //     response.data.messages,
                        // ])
                        // setMessages((prevMessages) => [
                        //     ...prevMessages,
                        //     messagesWithAvatar,
                        // ])
                    }
                    if (response.data.thongbao === 'Lỗi khi tạo message!!!') {
                        toast.error('Lỗi khi tạo message!!!')
                    }
                })
        }
        // trường hợp 2 chỉ gửi ảnh không gửi tin nhắn th2
        // else if (image && !sendMessage) {
        else if (images.length > 0 && !sendMessage) {
            const formData = new FormData()
            const contentType = 'image'

            // formData.append('image', images)
            images.forEach((image, index) => {
                formData.append('image', image.file)
            })
            formData.append('conversation_id', conversation_id)
            formData.append('content', sendMessage)
            formData.append('user_id', user_id)
            formData.append('contentType', contentType)
            formData.append('replyTo', replyingTo ? replyingTo._id : null)

            // alert(formData)
            axios
                .post(
                    'http://localhost:3001/message/createMessagesWeb',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                )
                .then(async (response) => {
                    if (
                        response.data.thongbao === 'Tạo tin nhắn thành công!!!'
                    ) {
                        let avatar
                        let name
                        const cachedAvatar = localStorage.getItem(
                            `avatar_${user_id}`,
                        )
                        const cachedName = localStorage.getItem(
                            `name_${user_id}`,
                        )
                        if (cachedAvatar && cachedName) {
                            avatar = cachedAvatar
                            name = cachedName
                        } else {
                            const res = await axios.post(
                                'http://localhost:3001/user/getInfoByUserIDWeb',
                                {
                                    sender_id: user_id,
                                },
                            )
                            avatar = res.data.avatar
                            localStorage.setItem(`avatar_${user_id}`, avatar)
                            name = res.data.name
                            localStorage.setItem(`name_${user_id}`, name)
                        }
                        const messagesWithAvatar = response.data.messages.map(
                            (message) => {
                                return {
                                    ...message,
                                    avatar: avatar,
                                    name: name,
                                }
                            },
                        )

                        socket.emit('send-message', messagesWithAvatar)

                        // socket.emit('send-message', response.data.messages)
                        // setImage(null)
                        setImages([])
                        setImagePreviewUrl(null)
                        setsendMessage('')
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            ...messagesWithAvatar,
                        ])
                    }
                    if (response.data.thongbao === 'Lỗi khi tạo message!!!') {
                        toast.error('Lỗi khi tạo message!!!')
                    }
                })
        }
        // Trường hợp 3 gửi cả ảnh cả tin nhắn
        else if (images.length > 0 && sendMessage) {
            const formData = new FormData()
            const contentType = 'text'
            images.forEach((image, index) => {
                formData.append('image', image.file)
            })
            formData.append('conversation_id', conversation_id)
            formData.append('content', sendMessage)
            formData.append('user_id', user_id)
            formData.append('contentType', contentType)
            formData.append('replyTo', replyingTo ? replyingTo._id : null)

            axios
                .post(
                    'http://localhost:3001/message/createMessagesWeb',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                )
                .then(async (response) => {
                    if (
                        response.data.thongbao === 'Tạo tin nhắn thành công!!!'
                    ) {
                        let avatar
                        let name
                        const cachedAvatar = localStorage.getItem(
                            `avatar_${user_id}`,
                        )
                        const cachedName = localStorage.getItem(
                            `name_${user_id}`,
                        )
                        if (cachedAvatar && cachedName) {
                            avatar = cachedAvatar
                            name = cachedName
                        } else {
                            const res = await axios.post(
                                'http://localhost:3001/user/getInfoByUserIDWeb',
                                {
                                    sender_id: user_id,
                                },
                            )
                            avatar = res.data.avatar
                            localStorage.setItem(`avatar_${user_id}`, avatar)
                            name = res.data.name
                            localStorage.setItem(`name_${user_id}`, name)
                        }
                        const textMessageWithAvatar = {
                            ...response.data.textMessage,
                            avatar: avatar,
                            name: name,
                        }
                        const imageMessagesWithAvatar =
                            response.data.imageMessage.map((message) => {
                                return {
                                    ...message,
                                    avatar: avatar,
                                    name: name,
                                }
                            })

                        socket.emit('send-message', textMessageWithAvatar)
                        imageMessagesWithAvatar.forEach((imageMessage) => {
                            socket.emit('send-message', imageMessage)
                        })
                        // socket.emit('send-message', response.data.textMessage)
                        // response.data.imageMessage.forEach((imageMessage) => {
                        //     socket.emit('send-message', imageMessage)
                        // })
                        setImages([])
                        setImagePreviewUrl(null)
                        setsendMessage('')

                        setMessages((prevMessages) => [
                            ...prevMessages,
                            textMessageWithAvatar,
                            ...imageMessagesWithAvatar,
                        ])
                    }
                    if (response.data.thongbao === 'Lỗi khi tạo message!!!') {
                        toast('Lỗi khi tạo message!!!')
                    }
                })
        }
    }

    const [openDrawer, setOpenDrawer] = React.useState(true)
    const [isSend, setSend] = React.useState(true)
    const messagesEndRef = useRef(null)
    const [prevMessageCount, setPrevMessageCount] = useState(0)
    const messagesContainerRef = useRef(null)

    //gui file bang icon
    const fileInputRef = useRef(null)

    // gửi ảnh
    const fileImgRef = useRef(null)

    const handleIconClick = () => {
        fileInputRef.current.click() // Kích hoạt sự kiện click trên thẻ input[type="file"]
    }
    const handleFileChange = async (event) => {
        const files = event.target.files

        if (files.length > 0) {
            const formData = new FormData()

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                formData.append('media', file)

                // Lần đầu tiên xác định loại contentType thôi (giả định tất cả cùng loại)
                if (i === 0) {
                    if (isVideoUrl(file.name)) {
                        formData.append('contentType', 'video')
                    } else if (isFileMedia(file.name)) {
                        formData.append('contentType', 'file')
                    }
                }
            }

            formData.append('conversation_id', conversation_id)
            formData.append('content', sendMessage)
            formData.append('user_id', user_id)

            try {
                const response = await axios.post(
                    'http://localhost:3001/message/uploadMediaWeb',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )

                if (response.data.thongbao === 'Tải media lên thành công!!!') {
                    toast.success('Tải media lên thành công!!!')

                    let avatar
                    let name
                    const cachedAvatar = localStorage.getItem(`avatar_${user_id}`)
                    const cachedName = localStorage.getItem(`name_${user_id}`)
                    if (cachedAvatar && cachedName) {
                        avatar = cachedAvatar
                        name = cachedName
                    } else {
                        const res = await axios.post(
                            'http://localhost:3001/user/getInfoByUserIDWeb',
                            {
                                sender_id: user_id,
                            }
                        )
                        avatar = res.data.avatar
                        localStorage.setItem(`avatar_${user_id}`, avatar)
                        name = res.data.name
                        localStorage.setItem(`name_${user_id}`, name)
                    }

                    const mediaMessageWithAvatar =
                        response.data.MediaMessage.map((message) => {
                            return {
                                ...message,
                                avatar: avatar,
                                name: name,
                            }
                        })

                    socket.emit('send-message', mediaMessageWithAvatar)

                    setMessages((prevMessages) => [
                        ...prevMessages,
                        ...mediaMessageWithAvatar,
                    ])
                } else {
                    toast('Lỗi khi tải media lên!!!')
                }
            } catch (err) {
                toast('Có lỗi xảy ra khi tải media!')
                console.error(err)
            }
        }
    }


    // const handleFileChange = (event) => {
    //     const selectedFile = event.target.files[0]
    //     // Xử lý tệp đã chọn ở đây, ví dụ: tải lên máy chủ
    //     if (selectedFile) {
    //         const formData = new FormData()

    //         formData.append('media', selectedFile)
    //         formData.append('conversation_id', conversation_id)
    //         formData.append('content', sendMessage)
    //         formData.append('user_id', user_id)

    //         // kiểm tra xem file được chọn là video hay file media thông thường nếu là video thì contentType là video còn nếu là file media thông thường thì contentType là file
    //         if (isVideoUrl(selectedFile.name)) {
    //             formData.append('contentType', 'video')
    //         } else if (isFileMedia(selectedFile.name)) {
    //             formData.append('contentType', 'file')
    //         }

    //         // formData.append('contentType', 'file') // Đặt loại nội dung là 'file'
    //         axios
    //             .post(
    //                 'http://localhost:3001/message/uploadMediaWeb',
    //                 formData,
    //                 {
    //                     headers: {
    //                         'Content-Type': 'multipart/form-data',
    //                     },
    //                 },
    //             )
    //             .then(async (response) => {
    //                 if (
    //                     response.data.thongbao === 'Tải media lên thành công!!!'
    //                 ) {
    //                     toast.success('Tải media lên thành công!!!')
    //                     // socket.emit('send-message', response.data.MediaMessage)

    //                     // // cập nhật MediaMessage vào tin nhắn
    //                     // setMessages((prevMessages) => [
    //                     //     ...prevMessages,
    //                     //     ...response.data.MediaMessage,
    //                     // ])

    //                     let avatar
    //                     let name
    //                     const cachedAvatar = localStorage.getItem(
    //                         `avatar_${user_id}`,
    //                     )
    //                     const cachedName = localStorage.getItem(
    //                         `name_${user_id}`,
    //                     )
    //                     if (cachedAvatar && cachedName) {
    //                         avatar = cachedAvatar
    //                         name = cachedName
    //                     } else {
    //                         const res = await axios.post(
    //                             'http://localhost:3001/user/getInfoByUserIDWeb',
    //                             {
    //                                 sender_id: user_id,
    //                             },
    //                         )
    //                         avatar = res.data.avatar
    //                         localStorage.setItem(`avatar_${user_id}`, avatar)
    //                         name = res.data.name
    //                         localStorage.setItem(`name_${user_id}`, name)
    //                     }
    //                     const mediaMessageWithAvatar =
    //                         response.data.MediaMessage.map((message) => {
    //                             return {
    //                                 ...message,
    //                                 avatar: avatar,
    //                                 name: name,
    //                             }
    //                         })

    //                     socket.emit('send-message', mediaMessageWithAvatar)

    //                     // cập nhật MediaMessage vào tin nhắn
    //                     setMessages((prevMessages) => [
    //                         ...prevMessages,
    //                         ...mediaMessageWithAvatar,
    //                     ])
    //                 }
    //                 if (response.data.thongbao === 'Lỗi khi tải media lên!!!') {
    //                     toast.error('Lỗi khi tải media lên!!!')
    //                 }
    //             })
    //     }
    // }

    function openModal(message, event) {
        const rect = event.target.getBoundingClientRect()
        setModalPosition({ top: rect.top, left: rect.left + rect.width })
        setSelectedMessage(message)
        setModalIsOpen(true)
    }

    function closeModal() {
        setSelectedMessage(null)
        setModalIsOpen(false)
    }
    const handleOpenModalFriend = () => {
        setIsModalOpenFriend(true)
    }

    const handleCloseModalFriend = () => {
        setIsModalOpenFriend(false)
    }

    const scrollToBottom = () => {
        if (messages.length > prevMessageCount) {
            const scrollHeight = messagesContainerRef.current.scrollHeight
            messagesContainerRef.current.scrollTop = scrollHeight
        }
    }
const recallMessage = (message_id) => {
    axios
        .post('http://localhost:3001/message/recallMessageWeb', {
            message_id: message_id,
        })
        .then((response) => {
            if (response.data.thongbao === 'Thu hồi tin nhắn thành công!!!') {
                toast.success('Thu hồi tin nhắn thành công!!!');

                // Cập nhật UI ngay lập tức cho người gửi
                setMessages((prevMessages) =>
                    prevMessages.map((msg) => {
                        if (msg._id === message_id) {
                            // Đánh dấu là đã thu hồi và có thể cập nhật nội dung
                            return { ...msg, recalled: true, content: "Tin nhắn đã được thu hồi" };
                        }
                        return msg;
                    })
                );

                
                if (response.data.message) {
                    socket.emit('message-recalled', response.data.message);
                }
                closeModal();
            } else if (response.data.thongbao === 'Lỗi khi thu hồi tin nhắn!!!') {
                toast.error('Lỗi khi thu hồi tin nhắn!!!');
            } else {
                toast.error(response.data.thongbao || 'Lỗi không xác định khi thu hồi!');
            }
        })
        .catch(error => {
            console.error('Lỗi khi thu hồi tin nhắn:', error);
            toast.error('Lỗi kết nối khi thu hồi tin nhắn!');
        });
};
   
const deleteMessageForMe = (message_id) => {
    axios
        .post('http://localhost:3001/message/deleteMyMessageWeb', {
            message_id: message_id,
            user_id: user_id, // user_id đã được định nghĩa trong scope của component
        })
        .then((response) => {
            if (
                response.data.thongbao ===
                'Xoá chỉ ở phía tôi thành công!!!'
            ) {
                toast.success('Xoá chỉ ở phía tôi thành công!!!!');

                // Cập nhật UI ngay lập tức bằng cách cập nhật 'messages' state
                setMessages((prevMessages) =>
                    prevMessages.map((msg) => {
                        if (msg._id === message_id) {
                            // Thêm user_id vào mảng deletedBy của tin nhắn
                            const updatedDeletedBy = msg.deletedBy
                                ? [...msg.deletedBy, user_id]
                                : [user_id];
                            return { ...msg, deletedBy: updatedDeletedBy };
                        }
                        return msg;
                    })
                );

            
                setDeleteMyMessage((prevDeleteMyMessage) => [...prevDeleteMyMessage, message_id]);

             

                closeModal();
            } else if (response.data.thongbao === 'Tin nhắn không tồn tại') {
                toast.error('Tin nhắn không tồn tại');
            } else {
                toast.error(response.data.thongbao || 'Lỗi khi xoá tin nhắn!');
            }
        })
        .catch((error) => {
            console.error('Lỗi khi xóa tin nhắn ở phía tôi:', error);
            toast.error('Lỗi kết nối khi xoá tin nhắn!');
        });
};

   


    // Gửi tin nhắn với chờ đợi
    const handleForwardMessage = async (receiver_id, message_id, type = 'friend') => {
        const id = `${receiver_id}-${message_id}-${Date.now()}`;

        let url, body;

        // For both user and group, use forwardMessageWeb API
        try {
            let conversation_id = receiver_id;
            if (type !== 'group') {
                // For user, get conversation_id from user_id and friend_id
                const response = await axios.post('http://localhost:3001/conversation/getConversationIDWeb', {
                    user_id: user_id,
                    friend_id: receiver_id,
                });
                conversation_id = response.data.conversation_id;
            }
            url = 'http://localhost:3001/message/forwardMessageWeb';
            body = {
                message_id,
                conversation_id,
                forwarded_by: user_id,
                forwarded_at: new Date().toISOString(),
                original_sender: selectedMessage.senderId,
            };
        } catch (err) {
            toast.error('Không thể lấy được cuộc trò chuyện với người dùng này!');
            return;
        }

        // ⏳ Đợi 5s trước khi gửi (giả lập delay)
        const timeout = setTimeout(async () => {
            try {
                const response = await axios.post(url, body);
                console.log("Response Data:", response.data);
                if (response.data?.message) {
                    const forwardedMessage = {
                        ...response.data.message,
                    };

                    socket.emit('send-message', forwardedMessage);
                    toast.success(`Đã chuyển tiếp tới ${type === 'group' ? 'nhóm' : 'người dùng'} thành công!`);
                }
            } catch (err) {
                toast.error(`Lỗi khi chuyển tiếp: ${err.message}`);
                console.error('Forward error:', err);
            } finally {
                setPendingForwards((prev) => prev.filter((item) => item.id !== id));
            }
        }, 5000);

        setPendingForwards((prev) => [
            ...prev,
            {
                id,
                receiver_id,
                message_id,
                timeout,
                type,
                originalMessage: selectedMessage,
            },
        ]);

        toast('⏰ Tin nhắn sẽ được gửi trong 5 giây...');
    };
    const undoForward = (id) => {
        const pending = pendingForwards.find((item) => item.id === id);
        if (pending) {
            clearTimeout(pending.timeout); // huỷ gửi
            setPendingForwards((prev) => prev.filter((item) => item.id !== id));
            toast('↪️ Đã hoàn tác gửi tin nhắn.');
        }
    };




    useEffect(() => {
        setPrevMessageCount(messages.length)
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        setPickerVisible(false)
        // setImage(null)
        setImages([])
        setImagePreviewUrl(null)
        setsendMessage('')
    }, [conversation_id])
    function isImageUrl(url) {
        return url.match(/\.(jpeg|jpg|gif|png|gif)$/) != null
    }

    function isVideoUrl(url) {
        return url.match(/\.(mp4|webm|ogg)$/) != null
    }
    function isFileMedia(url) {
        return url.match(/\.(doc|docx|pdf|txt|ppt|pptx|xlsx)$/) != null
    }
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'lightgrey',
                display: 'flex',
            }}
        >
            <Toaster toastOptions={{ duration: 3500 }} />
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                {/* // này là code nguyên cái khung đps luôn mà hiện mấy cái image với cái tên*/}
                <div
                    style={{
                        width: '100%',
                        height: 70,
                        backgroundColor: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {/* // này là khúc mà hiện mấy cái image với cái tên*/}
                    <div
                        style={{
                            display: 'flex',
                            gap: 15,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <img
                            src={
                                currentSource
                                    ? currentSource.avatar
                                    : 'https://zolabk.s3.ap-southeast-1.amazonaws.com/boy.png'
                            }
                            alt="friend_image"
                            style={{
                                margin: 10,
                                width: 60,
                                height: 60,
                                borderRadius: 30,
                                backgroundColor: 'grey',
                                border: '3px solid #2596be',
                            }}
                        />
                        <label
                            style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                            }}
                        >
                            {currentSource ? currentSource.name : ''}
                        </label>
                    </div>

                    {/* // này là đoạn mấy nút call và nút bấm hiện thông tin */}
                    <div style={{ display: 'flex', gap: 15 }}>
                        <div>
                            <IoCallOutline size="1.6rem" />
                        </div>
                        <div>
                            <CiVideoOn size="1.6rem" />
                        </div>
                        <div
                            onClick={() => {
                                setOpenDrawer(!openDrawer)
                            }}
                            style={{
                                backgroundColor:
                                    openDrawer === true ? 'white' : 'white',
                            }}
                        >
                            <BsCodeSquare size="1.6rem" />
                        </div>
                    </div>
                </div>

                <div
    ref={messagesContainerRef}
    style={{
        background: 'linear-gradient(120deg,#BDC4C8, #D9D0BF)',
        width: '100%',
        height: '85%',
        overflow: 'auto', 
    }}
>
    {sortedMessages
        .filter(message => {
            // Nếu message không tồn tại thì bỏ qua (mặc dù sortedMessages nên là mảng sạch)
            if (!message) return false;

            // Kiểm tra nếu trường deletedBy tồn tại và có chứa user_id của người dùng hiện tại
            if (message.deletedBy && message.deletedBy.includes(user_id)) {
                return false; // Lọc bỏ tin nhắn này, không render nó
            }
            return true; // Giữ lại tin nhắn này để render
        })
        .map((message, index) => (
            // Phần JSX để render một dòng tin nhắn giữ nguyên như cũ
            // Nó chỉ được gọi cho những tin nhắn không bị lọc ra
            <div
                key={message._id}
                style={{
                    display: 'flex',
                    justifyContent:
                        (typeof message.senderId === 'object' &&
                            message.senderId !== null
                            ? message.senderId._id
                            : message.senderId) === user_id
                            ? 'flex-end'
                            : 'flex-start',
                    alignItems: 'center',
                    marginLeft: '5px',
                    // marginRight: '5px' // Cân nhắc thêm nếu cần
                }}
            >
                {/* ... TOÀN BỘ NỘI DUNG RENDER CHO MỘT TIN NHẮN (avatar, tên, nội dung, nút •••, thời gian) ... */}
                {/* Ví dụ: */}
                {/* Chỗ này hiện các thông báo ví dụ như xoá khỏi nhóm vv */}
                {message.contentType === 'notify' ? (
                    <p /* ... notify styles ... */ >
                        <span /* ... span styles ... */ >
                            {message.content}
                        </span>
                    </p>
                ) : null}

                {/* Avatar (chỉ hiển thị cho tin nhắn của người khác và không phải notify) */}
                {message.contentType !== 'notify' &&
                    (typeof message.senderId === 'object' && message.senderId !== null
                        ? message.senderId._id
                        : message.senderId) !== user_id && (
                    <img
                        src={ message.avatar ? message.avatar : 'https://zolabk.s3.ap-southeast-1.amazonaws.com/boy.png'}
                        alt="sender avatar"
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '60%',
                            border: '3px solid #2596be',
                            marginRight: '5px', // Thêm khoảng cách nếu cần
                        }}
                    />
                )}

                {/* Nút "•••" cho tin nhắn của người gửi (bên trái nội dung) */}
                {message.contentType !== 'notify' &&
                    (typeof message.senderId === 'object' &&
                        message.senderId !== null
                        ? message.senderId._id
                        : message.senderId) === user_id && !message.recalled && ( // Chỉ hiện khi chưa thu hồi
                        <button
                            style={{ /* ... styles ... */ marginRight: '5px' }}
                            onClick={(event) => {
                                if (!message.recalled) { // Double check
                                    openModal(message, event);
                                }
                            }}
                        >
                            •••
                        </button>
                    )}

                {/* Khối nội dung chính của tin nhắn (bong bóng chat) */}
                {message.contentType !== 'notify' && ( // Chỉ render nếu không phải notify
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: ( (typeof message.senderId === 'object' && message.senderId !== null ? message.senderId._id : message.senderId) === user_id ? 'flex-end' : 'flex-start') }}>
                        <p /* Bong bóng chat */
                            style={{
                                maxWidth: '100%', // Hoặc giới hạn kích thước cụ thể
                                alignSelf: ( (typeof message.senderId === 'object' && message.senderId !== null ? message.senderId._id : message.senderId) === user_id ? 'flex-end' : 'flex-start'),
                                backgroundColor: ( (typeof message.senderId === 'object' && message.senderId !== null ? message.senderId._id : message.senderId) === user_id ? '#0084ff' : '#e5e5ea'), // Màu khác nhau cho người gửi/nhận
                                color: ( (typeof message.senderId === 'object' && message.senderId !== null ? message.senderId._id : message.senderId) === user_id ? 'white' : 'black'),
                                borderRadius: 10,
                                padding: 10,
                                marginTop: 5, // Giảm bớt nếu có tên người gửi ở trên
                                marginBottom: 5,
                                marginLeft: ( (typeof message.senderId === 'object' && message.senderId !== null ? message.senderId._id : message.senderId) === user_id ? 0 : 0), // Đã có avatar/nút handle margin
                                marginRight: ( (typeof message.senderId === 'object' && message.senderId !== null ? message.senderId._id : message.senderId) === user_id ? 0 : 0), // Đã có avatar/nút handle margin
                                position: 'relative', // Cho việc định vị thời gian (nếu muốn đặt bên trong)
                            }}
                        >
                            {/* Tên người gửi (cho group chat) */}
                            {message.contentType !== 'notify' && 
                             (typeof message.senderId === 'object' && message.senderId !== null ? message.senderId._id : message.senderId) !== user_id &&
                             currentConversationGroup && // Chỉ hiện tên trong group
                             (
                                <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px', color: '#7A8DA5', fontSize: '13px' }}>
                                    {message.name}
                                </span>
                            )}

                            {/* Thông tin chuyển tiếp */}
                            {message.isForwarded && (
                                <div /* ... forwarded styles ... */ >
                                    ↪️ đã chuyển tiếp tin nhắn từ <b>{typeof message.originalSender === 'object' ? message.originalSender.userName || `${message.originalSender.firstName} ${message.originalSender.lastName}` : message.originalSender}</b>
                                </div>
                            )}
                            {/* Thông tin trả lời */}
                            {message.replyTo && replyContent && replyContent[message._id] && (
                                <div className="replying-to" /* ... reply styles ... */ onClick={() => handleReplyClick(message.replyTo)}>
                                    <div className="reply-content">
                                        <b>| Trả lời :</b> {replyContent[message._id]}
                                    </div>
                                </div>
                            )}

                            {/* Nội dung chính (text, image, file, video) hoặc placeholder "Tin nhắn đã thu hồi" */}
                            {message.recalled ? (
                                <span style={{ color: ( (typeof message.senderId === 'object' && message.senderId !== null ? message.senderId._id : message.senderId) === user_id ? '#e0e0e0' : '#8C929C'), fontStyle: 'italic' }}>Tin nhắn đã bị thu hồi</span>
                            ) : (
                                // Render nội dung dựa trên contentType
                                message.contentType === 'text' ? message.content :
                                message.contentType === 'image' ? <img src={message.content} alt="message" style={{ width: '200px', height: 'auto', borderRadius: '8px' }} /> :
                                message.contentType === 'video' ? <video src={message.content} controls style={{ width: '250px', height: 'auto', borderRadius: '8px' }} /> :
                                message.contentType === 'file' ? (
                                    <a className="file-link" href={message.content} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', color: ( (typeof message.senderId === 'object' && message.senderId !== null ? message.senderId._id : message.senderId) === user_id ? 'white' : 'black'), textDecoration: 'none' }}>
                                        <FileIcon extension={message.content.split('.').pop()} {...defaultStyles[message.content.split('.').pop()]} />
                                        <span style={{ marginLeft: 10 }}>{message.content.split('/').pop()}</span>
                                    </a>
                                ) : null
                            )}

                            {/* Thời gian (chỉ hiển thị nếu CHƯA thu hồi) */}
                            {!message.recalled && (
                                <span style={{
                                    fontSize: 11,
                                    color: ( (typeof message.senderId === 'object' && message.senderId !== null ? message.senderId._id : message.senderId) === user_id ? '#cce6ff' : '#a5acb7'), // Màu nhạt hơn
                                    display: 'block', // Để xuống dòng hoặc ở góc
                                    textAlign: 'right', // Căn phải trong bong bóng
                                    marginTop: '5px',
                                }}>
                                    {moment(message.createdAt).utcOffset('+07:00').format('HH:mm')}
                                </span>
                            )}
                        </p>
                    </div>
                )}

                {/* Nút "•••" cho tin nhắn của người nhận (bên phải nội dung) */}
                {message.contentType !== 'notify' &&
                    (typeof message.senderId === 'object' &&
                        message.senderId !== null
                        ? message.senderId._id
                        : message.senderId) !== user_id && !message.recalled && ( // Chỉ hiện khi chưa thu hồi
                        <button
                            style={{ /* ... styles ... */ marginLeft: '5px' }}
                            onClick={(event) => {
                                if (!message.recalled) { // Double check
                                    openModal(message, event);
                                }
                            }}
                        >
                            •••
                        </button>
                    )}
            </div>
        ))
    }
</div>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Message Options"
                    style={{
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        },
                        content: {
                            top: modalPosition.top,
                            left: modalPosition.left,
                            maxWidth: '175px',
                            // maxHeight: '120px',
                            height: '123px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,

                            // xoá thanh scroll
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            border: '1px solid black',
                            // làm tròn tròn
                        },
                    }}
                >
                    {selectedMessage &&
                        selectedMessage.senderId === user_id && (
                            <button
                                style={{
                                    color: 'red',
                                    border: 'none',
                                    borderRadius: '5px',
                                    marginBottom: '5px',
                                    backgroundColor: isButtonPressed
                                        ? 'lightgray'
                                        : 'white',
                                }}
                                onMouseEnter={() => setIsButtonPressed(true)}
                                onMouseDown={() => setIsButtonPressed(true)}
                                onMouseUp={() => setIsButtonPressed(false)}
                                onMouseLeave={() => setIsButtonPressed(false)}
                                onClick={() =>
                                    recallMessage(selectedMessage._id)
                                }
                            >
                                Thu hồi
                            </button>
                        )}
                    <button
                        style={{
                            color: 'red',
                            border: 'none',
                            borderRadius: '5px',
                            marginBottom: '5px',
                            backgroundColor: isButtonPressed1
                                ? 'lightgray'
                                : 'white',
                        }}
                        onMouseEnter={() => setIsButtonPressed1(true)}
                        onMouseDown={() => setIsButtonPressed1(true)}
                        onMouseUp={() => setIsButtonPressed1(false)}
                        onMouseLeave={() => setIsButtonPressed1(false)}
                        onClick={() => deleteMessageForMe(selectedMessage._id)}
                    >
                        Xoá chỉ ở phía tôi
                    </button>
                    <button
                        style={{
                            color: 'red',
                            border: 'none',
                            borderRadius: '5px',
                            marginBottom: '5px',
                            backgroundColor: isButtonPressed2
                                ? 'lightgray'
                                : 'white',
                        }}
                        onMouseEnter={() => setIsButtonPressed2(true)}
                        onMouseDown={() => setIsButtonPressed2(true)}
                        onMouseUp={() => setIsButtonPressed2(false)}
                        onMouseLeave={() => setIsButtonPressed2(false)}
                        onClick={() => {
                            handleOpenModalFriend()
                        }}
                    >
                        Chia sẻ
                    </button>
                    <button
                        style={{
                            color: 'red',
                            border: 'none',
                            borderRadius: '5px',
                            marginBottom: '5px',
                            backgroundColor: isButtonPressed3
                                ? 'lightgray'
                                : 'white',
                        }}
                        onMouseEnter={() => setIsButtonPressed3(true)}
                        onMouseDown={() => setIsButtonPressed3(true)}
                        onMouseUp={() => setIsButtonPressed3(false)}
                        onMouseLeave={() => setIsButtonPressed3(false)}
                        onClick={() => {
                            handleReply(selectedMessage)
                        }}
                    >
                        Trả lời
                    </button>
                </Modal>

                {/* modal hiện bạn bè chuyển tiếp */}

                <Modal
                    isOpen={isModalOpenFriend}
                    onRequestClose={handleCloseModalFriend}
                    contentLabel="Forward Message Modal"
                    style={{
                        content: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                            minWidth: '400px',
                        },
                    }}
                >
                    <h2
                        style={{
                            textAlign: 'center',
                            marginBottom: '15px',
                            color: '#2596be',
                            fontSize: '22px', // hoặc to hơn như '28px'
                            fontWeight: 'bold',

                        }}
                    >
                        Chia sẻ
                    </h2>
                    <h6 style={{ color: '#444', marginBottom: '10px' }}>Bạn bè</h6>
                    {friend_list.length > 0 ? (
                        friend_list.map((friend) => (
                            <div
                                key={friend.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '10px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', }} >
                                    <img
                                        src={friend.avatar}
                                        alt="avatar"
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '60%',
                                            border: '3px solid #2596be',
                                            marginRight: '15px',
                                        }}
                                    />
                                    <b
                                        style={{

                                            color: 'blue',
                                            fontSize: '16px',
                                        }}
                                    >
                                        <p>{friend.friendName}</p>
                                    </b>
                                </div>

                                <button
                                    style={{ backgroundColor: '#43a3f2', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px' }}
                                    onClick={() =>
                                        handleForwardMessage(
                                            friend.friend_id,
                                            selectedMessage._id,
                                            'user'
                                        )
                                    }
                                >
                                    <b>Gửi</b>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p style={{ fontStyle: 'italic', color: '#888' }}>
                            Không có bạn bè nào.
                        </p>
                    )}

                    {/* Danh sách nhóm */}
                    <h6 style={{ color: '#444', margin: '20px 0 10px' }}>Nhóm</h6>
                    {groupList.length > 0 ? (
                        groupList.map((group) => (
                            <div
                                key={group._id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '10px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', }} >
                                    <img
                                        src={group.avatar}
                                        alt="group-avatar"
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '60%',
                                            border: '3px solid #ffa500',
                                            marginRight: '15px',
                                        }}
                                    />
                                    <b
                                        style={{
                                            cursor: 'pointer',
                                            color: 'darkorange',
                                            fontSize: '16px',
                                        }}
                                    >
                                        <p>{group.conversationName}</p>
                                    </b>
                                </div>
                                <button
                                    style={{ backgroundColor: '#43a3f2', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px' }}

                                    onClick={() =>
                                        handleForwardMessage(
                                            group._id,
                                            selectedMessage._id,
                                            'group'
                                        )
                                    }
                                >
                                    <b>Gửi</b>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p style={{ fontStyle: 'italic', color: '#888' }}>
                            Không có nhóm nào.
                        </p>
                    )}
                    {pendingForwards.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            {pendingForwards.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        backgroundColor: '#fff4e5',
                                        border: '1px solid #ffa500',
                                        padding: '10px',
                                        marginBottom: '10px',
                                        borderRadius: '5px',
                                    }}
                                >
                                    <span>
                                        Đang chờ gửi đến <b>{item.type === 'group' ? 'nhóm' : 'người dùng'}</b> trong 5 giây...
                                    </span>
                                    <button
                                        onClick={() => undoForward(item.id)}
                                        style={{
                                            marginLeft: '10px',
                                            color: 'white',
                                            backgroundColor: 'red',
                                            border: 'none',
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                            borderRadius: '3px',
                                        }}
                                    >
                                        Hoàn tác
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <hr style={{ margin: '15px 0', borderTop: '1px solid #ccc' }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                        <button
                            style={{
                                padding: '5px 10px',
                                backgroundColor: '#2596be',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                            onClick={handleCloseModalFriend}
                        >
                            Xong
                        </button>
                    </div>

                </Modal>

                <div
                    style={{
                        width: '100%',
                        // minHeight: '13%',
                        //nếu mãng images rỗng thì set minheight là 13% còn không thì là 25%
                        // minHeight: images.length > 0 ? '25%' : '13%',
                        minHeight:
                            images.length > 0 || replyingTo != null
                                ? '30%'
                                : '13%',
                        backgroundColor: 'white',
                        display: 'flex',
                        flexDirection: 'column',

                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',

                            marginTop: 5,
                            alignContent: 'space-between',
                            width: '100%',
                            height: '40%',
                            borderBottom: '1px solid lightgrey',
                        }}
                    >
                        <div
                            style={{
                                marginLeft: 10,
                                gap: 20,
                                marginBottom: 5,
                                display: 'flex',
                                color: 'black',
                            }}
                        >
                            <div>
                                <LuSticker size="1.4rem" />
                            </div>
                            <div>
                                <SlPicture
                                    size="1.4rem"
                                    onClick={handleIconImageClick}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    id="fileInput"
                                    type="file"
                                    multiple
                                    ref={fileImgRef}
                                    style={{ display: 'none' }} // Ẩn thẻ input[type="file"]
                                    onChange={handleImageChange}
                                />
                            </div>
                            <div>
                                <ImAttachment
                                    size="1.3rem"
                                    onClick={handleIconClick}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    id="fileInput"
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    style={{ display: 'none' }} // Ẩn thẻ input[type="file"]
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div>
                                <TbCapture size="1.4rem" />
                            </div>
                            <div>
                                <TiBusinessCard size="1.4rem" />
                            </div>
                            <div>
                                <LuAlarmClock size="1.4rem" />
                            </div>
                            <div>
                                <MdOutlineAssignmentTurnedIn size="1.4rem" />
                            </div>
                            <div>
                                <MdFormatColorText size="1.4rem" />
                            </div>
                            <div>
                                <MdOutlinePriorityHigh size="1.4rem" />
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: 3,
                            width: '95%',
                            height: '95%',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div
                            style={{
                                width: '85%',
                            }}
                        >
                            {/* // code hiện chỗ trả lời tin nhắn trong khung chat */}
                            {replyingTo && (
                                <div
                                    className="file-link1"
                                    style={{
                                        backgroundColor: '#EEF0F1',
                                        position: 'relative',
                                    }}
                                >
                                    <b
                                        style={{
                                            fontSize: '15px',
                                        }}
                                    >
                                        Trả lời
                                    </b>
                                    <p>{replyingTo.content}</p>
                                    {/* Add more information about the message being replied to here */}
                                    <button
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            backgroundColor: 'red',
                                            color: 'white',
                                        }}
                                        onClick={() => setReplyingTo(null)}
                                    >
                                        X
                                    </button>
                                </div>
                            )}
                            <input
                                style={{
                                    width: '100%',
                                    height: '85%',
                                    alignItems: 'center',
                                    backgroundColor: 'white',
                                    borderStyle: 'none',
                                    border: 'none',
                                    outline: 'none',
                                }}
                                // type="tin nhan"
                                placeholder="Nhập @, tin nhắn tới  "
                                value={sendMessage}
                                onChange={(e) => {
                                    setsendMessage(e.target.value)
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        if (
                                            sendMessage.trim() !== '' &&
                                            images.length > 0
                                        ) {
                                            // Có cả tin nhắn và hình ảnh để gửi
                                            // xoá hình ảnh trước
                                            setImages([])
                                            setSend(!isSend)

                                            handleSendMessage()
                                            e.preventDefault() // Prevents form submission
                                        } else if (
                                            sendMessage.trim() === '' &&
                                            images.length > 0
                                        ) {
                                            // Chỉ có hình ảnh để gửi
                                            setSend(!isSend)
                                            handleSendMessage()
                                            e.preventDefault() // Prevents form submission
                                        } else if (
                                            sendMessage.trim() !== '' &&
                                            images.length === 0
                                        ) {
                                            // Chỉ có tin nhắn để gửi
                                            setSend(!isSend)
                                            handleSendMessage()
                                            e.preventDefault() // Prevents form submission
                                        }
                                    }
                                }}
                            />
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {' '}
                                {/* Add this div */}
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            position: 'relative',
                                            width: '14%',
                                        }}
                                    >
                                        <img
                                            src={image.previewUrl}
                                            alt="Chosen"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                padding: '2px',
                                            }}
                                        />
                                        <button
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                backgroundColor: 'red',
                                                color: 'white',
                                            }}
                                            onClick={() =>
                                                handleRemoveImage(index)
                                            } // Truyền index để xác định ảnh cần xóa
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>{' '}
                        </div>

                        <TbMessage2Bolt size="1.3rem" />
                        <div style={{ position: 'relative' }}>
                            <MdOutlineAddReaction
                                size="1.3rem"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setPickerVisible((prevState) => !prevState)
                                }}
                            />
                            {isPickerVisible && (
                                <div
                                    style={{
                                        // position: 'relative',
                                        position: 'absolute',
                                        zIndex: 1,
                                        top: -450, // Điều chỉnh vị trí top và left để đặt Picker ở đúng vị trí bạn muốn
                                        right: -200,
                                    }}
                                >
                                    <Picker
                                        // style={{
                                        //   zIndex: 1,
                                        //   position: 'absolute',
                                        // }} // Đặt zIndex thấp hơn để Picker nằm dưới nút đóng
                                        onEmojiSelect={(emoji) => {
                                            setsendMessage(
                                                (prevMessage) =>
                                                    prevMessage + emoji.native,
                                            ) // Thêm emoji vào cuối tin nhắn
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: 0,

                                            cursor: 'pointer',
                                            backgroundColor: 'white',
                                            padding: '5px',
                                            zIndex: 2, // Đặt zIndex cao hơn để nút đóng luôn nằm trên cùng
                                        }}
                                    >
                                        <button
                                            onClick={() => {
                                                setPickerVisible(false)
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <FiAtSign size="1.3rem" />
                        {sendMessage.trim() ||
                            images.length >= 0 ||
                            sendMessage.trim() !== '' ? (
                            <label
                                style={{ color: 'blue' }}
                                onClick={() => {
                                    setSend(!isSend)
                                    handleSendMessage()
                                }}
                            >
                                GỬI
                            </label>
                        ) : (
                            <label
                                onClick={() => {
                                    setSend(!isSend)
                                    handleSendMessage()
                                }}
                            >
                                <SlLike size="1.2rem" />{' '}
                                {/* Set the color of the icon to yellow */}
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {openDrawer === true && (
                <ConversationDetail
                    friend_list={friend_list}

                    conversation_id={conversation_id}
                    currentSource={currentSource}
                />
            )}
        </div>
    )
}

export default Main


