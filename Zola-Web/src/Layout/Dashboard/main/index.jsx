import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import ConversationDetail from './ConversationDetail'
import indexMain from './indexMain.css'
import { BsCodeSquare } from 'react-icons/bs'
import { CiVideoOn } from 'react-icons/ci'
import { IoCallOutline } from 'react-icons/io5'
import { IoMdSend } from 'react-icons/io'
import { MdOutlineAddReaction } from 'react-icons/md'
import { TbMessage2Bolt } from 'react-icons/tb'
import { ImAttachment } from 'react-icons/im'
import { FiAtSign } from 'react-icons/fi'
import { CiImageOn } from 'react-icons/ci'
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
import SubSideBar from '../subSideBar/index'
import { FileIcon, defaultStyles } from 'react-file-icon'
import { useLocation } from 'react-router-dom'

const Main = ({
    user,
    friend_list,
    currentFriend,
    currentConversationGroup,
    conversationMyCloud,
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
        // Khi conversation_id hoặc đường dẫn URL thay đổi, đặt replyingTo trở lại null
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
                    // If the reply content is not in the cache, fetch it
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
                                // Store the reply content in the cache
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
        // Replace with the actual path to the message
        alert('Tính năng đang triển khai')
    }

    // fetchMessage lấy tin nhắn từ conversation_id nhóm trò chuyện
    const fetchMessages = async (conversation_id) => {
        // alert(conversation_id)
        const response = await axios.post(
            'http://localhost:3001/message/findAllMessagesWeb',
            {
                conversation_id: conversation_id,
            },
        )

        if (response.data.thongbao === 'Tìm thấy tin nhắn!!!') {
            // alert('Tìm thấy tin nhắn từ conversation_id là', conversation_id)
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
    // useEffect để tạo conversation_id từ currentFriend_Id và friend_id
    useEffect(() => {
        // kieemr tra 2 id có rỗng ko nếu rỗng thì return
        if (!currentFriend_Id || !user_id) {
            // toast.error('Không tìm thấy user_id hoặc friend_id!!!')
            return
        }
        // alert('ĐÃ VÀO USEEFFECT tạo conversation_id từ currentFriend_Id')

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
                    toast.error('Không tìm thấy user_id hoặc friend_id!!!')
                    return
                }

                if (
                    response.data.message === 'Conversation đã tồn tại!!!' ||
                    response.data.message === 'Tạo conversation thành công!!!'
                ) {
                    // alert(response.data.conversation._id)
                    const conversation_id = response.data.conversation._id
                    setConversationId(conversation_id)
                    if (conversation_id) {
                        // alert('conversation_id bạn bè  là : ' + conversation_id)
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
    // useEffect để set chỗ cloud của tôi
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

    // useEffect lấy tất cả tin nhắn thu hồi Recallmessage , Lấy tất cả tin nhắn đã xoá ở chỉ mình tôi từ conversation_id
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
                    // toast.success('Tìm thấy tin nhắn đã thu hồi!!!')
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
                    // toast.success('Không tìm thấy tin nhắn đã thu hồi!!!')
                    setRecalledMessages([])
                }
            })
            .catch((error) => {
                console.error(error)
            })

        // lấy tất cả tin nhắn đã xoá ở chỉ mình tôi
        axios
            .post('http://localhost:3001/message/findAllDeleteMyMessageWeb', {
                conversation_id: conversation_id,
            })
            .then((response) => {
                if (
                    response.data.thongbao ===
                    'Tìm thấy tin nhắn đã bị xoá ở phía tôi!!!'
                ) {
                    // toast.success('Tìm thấy tin nhắn đã thu hồi!!!')
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
                    // toast.success('Không tìm thấy tin nhắn đã thu hồi!!!')
                    setDeleteMyMessage([])
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }, [conversation_id])

    //socket
    useEffect(() => {
        if (!conversation_id) {
            return
        }
        const newSocket = io('http://localhost:3005')
        ///const newSocket = io('http://192.168.1.17:3005')
        // newSocket.on('connect', () => {
        //     console.log('Connected to server')
        // })
        newSocket.emit('conversation_id', conversation_id)

        newSocket.on('receive-message', (data) => {
            const messageArray = JSON.parse(data)
            // alert(JSON.stringify(messageArray))
            // Kiểm tra xem messageArray có phải là mảng hay không
            if (Array.isArray(messageArray)) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    ...messageArray,
                ])
            } else {
                // Nếu không, chuyển nó thành một mảng và thêm vào messages
                setMessages((prevMessages) => [...prevMessages, messageArray])
            }
        })

        // thu hồi socket được nhận là
        newSocket.on('message-recalled', (data) => {
            // kiểm tra xem có lắng nghe được message-recalled từ server không
            const messageArray = JSON.parse(data)

            setRecalledMessages((prevMessages) => [
                ...prevMessages,
                messageArray._id,
            ])

            // Update the messages state to reflect the recalled message
            setMessages((prevMessages) => {
                return prevMessages.map((message) => {
                    if (message._id === messageArray._id) {
                        // If the message is the one that was recalled, mark it as recalled
                        return { ...message, recalled: true }
                    } else {
                        // Otherwise, return the message as is
                        return message
                    }
                })
            })
        })
        newSocket.on('message-deleted', (message_id) => {
            setDeleteMyMessage([...deleteMyMessage, message_id])
        })

        newSocket.on('memberAddedToGroup', (data) => {
            // Update your messages state here with the new member info
            // For example, if you're using React, you might call a setState function
            setMessages([
                ...messages,
                {
                    content: `${data.newMember.name} đã thêm vào nhóm`,
                    type: 'system',
                },
            ])
        })

        // gọi tới thông báo socket notification
        // socket.on('notification', (data) => {
        //     setMessages((prevMessages) => [
        //         ...prevMessages,
        //         {
        //             conversation_id: data.conversation_id, // Generate a random id for this message
        //             content: data.content,
        //             contentType: data.contentType,
        //             senderId: user_id,
        //         },
        //     ])
        // })
        newSocket.on('notification', (data) => {
            setMessages((oldMessages) => [...oldMessages, data])
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [conversation_id])

    const handleRemoveImage = (index) => {
        setImages((prevImages) => prevImages.filter((image, i) => i !== index))
    }

    const handleIconImageClick = () => {
        fileImgRef.current.click() // Kích hoạt sự kiện click trên thẻ input[type="file"]
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0]
        const newImage = {
            file: file,
            previewUrl: URL.createObjectURL(file),
        }
        // Thêm ảnh mới vào mảng
        setImages((prevImages) => [...prevImages, newImage])
    }

    const handleSendMessage = async () => {
        // Th1 chỉ gửi tin nhắn
        if (images.length <= 0) {
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
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            messagesWithAvatar,
                        ])
                    }
                    if (response.data.thongbao === 'Lỗi khi tạo message!!!') {
                        toast.error('Lỗi khi tạo message!!!')
                    }
                })
        }
        // trường hợp 2 chỉ gửi ảnh không gửi tin nhắn th2
        // else if (image && !sendMessage) {
        else if (images.length > 0 && !sendMessage) {
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
                        toast.error('Lỗi khi tạo message!!!')
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

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0]
        // Xử lý tệp đã chọn ở đây, ví dụ: tải lên máy chủ
        if (selectedFile) {
            const formData = new FormData()

            formData.append('media', selectedFile)
            formData.append('conversation_id', conversation_id)
            formData.append('content', sendMessage)
            formData.append('user_id', user_id)

            // kiểm tra xem file được chọn là video hay file media thông thường nếu là video thì contentType là video còn nếu là file media thông thường thì contentType là file
            if (isVideoUrl(selectedFile.name)) {
                formData.append('contentType', 'video')
            } else if (isFileMedia(selectedFile.name)) {
                formData.append('contentType', 'file')
            }

            // formData.append('contentType', 'file') // Đặt loại nội dung là 'file'
            axios
                .post(
                    'http://localhost:3001/message/uploadMediaWeb',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                )
                .then(async (response) => {
                    if (
                        response.data.thongbao === 'Tải media lên thành công!!!'
                    ) {
                        toast.success('Tải media lên thành công!!!')
                        // socket.emit('send-message', response.data.MediaMessage)

                        // // cập nhật MediaMessage vào tin nhắn
                        // setMessages((prevMessages) => [
                        //     ...prevMessages,
                        //     ...response.data.MediaMessage,
                        // ])

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
                        const mediaMessageWithAvatar =
                            response.data.MediaMessage.map((message) => {
                                return {
                                    ...message,
                                    avatar: avatar,
                                    name: name,
                                }
                            })

                        socket.emit('send-message', mediaMessageWithAvatar)

                        // cập nhật MediaMessage vào tin nhắn
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            ...mediaMessageWithAvatar,
                        ])
                    }
                    if (response.data.thongbao === 'Lỗi khi tải media lên!!!') {
                        toast.error('Lỗi khi tải media lên!!!')
                    }
                })
        }
    }

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
                if (
                    response.data.thongbao === 'Thu hồi tin nhắn thành công!!!'
                ) {
                    toast.success('Thu hồi tin nhắn thành công!!!')
                    setRecalledMessages([...recalledMessages, message_id])
                    socket.emit('message-recalled', response.data.message)
                    // đóng modal
                    closeModal()
                }
                if (response.data.thongbao === 'Lỗi khi thu hồi tin nhắn!!!') {
                    toast.error('Lỗi khi thu hồi tin nhắn!!!')
                }
            })
    }
    const deleteMessageForMe = (message_id) => {
        axios
            .post('http://localhost:3001/message/deleteMyMessageWeb', {
                message_id: message_id,
                user_id: user_id,
            })
            .then((response) => {
                if (
                    response.data.thongbao ===
                    'Xoá chỉ ở phía tôi thành công!!!'
                ) {
                    toast.success('Xoá chỉ ở phía tôi thành công!!!!')
                    setDeleteMyMessage([...deleteMyMessage, message_id])
                    // socket.emit('delete-my-message', message_id)
                    // truyền message_id và user_id vào 1 biến data rồi truyền data đó quá socket
                    // create a data object containing message_id and user_id
                    const data = { message_id, user_id }
                    // emit the data object
                    socket.emit('delete-my-message', data)

                    // setRecalledMessages([...recalledMessages, message_id])
                    // socket.emit('message-recalled', response.data.message)
                    // đóng modal
                    closeModal()
                }
                if (response.data.thongbao === 'Tin nhắn không tồn tại') {
                    toast.error('Tin nhắn không tồn tại')
                }
            })
    }
    const handleForwardMessage = (friend_id, _id) => {
        // alert('Chuyển tiếp tin nhắn')
        axios
            .post('http://localhost:3001/conversation/getConversationIDWeb', {
                friend_id: friend_id,
                user_id: user_id,
            })
            .then((response) => {
                if (
                    response.data.thongbao ===
                    'Tìm conversation_id thành công!!!'
                ) {
                    // alert('conversation_id là : ' + response.data.conversation_id)
                    // từ conversation_id gọi tới axios forwardMessageWeb
                    axios
                        .post(
                            'http://localhost:3001/message/forwardMessageWeb',
                            {
                                message_id: _id,
                                conversation_id: response.data.conversation_id,
                            },
                        )
                        .then((response) => {
                            if (
                                response.data.thongbao ===
                                'Chuyển tiếp tin nhắn thành công!!!'
                            ) {
                                toast.success(
                                    'Chuyển tiếp tin nhắn thành công!!',
                                )
                                socket.emit(
                                    'send-message',
                                    response.data.message,
                                )

                                handleCloseModalFriend()
                                closeModal()
                            }
                            // if (
                            //   response.data.thongbao === 'Chuyển tiếp tin nhắn thành công!!'
                            // ) {
                            //   toast.error('Tin nhắn không tồn tại')
                            // }
                        })
                }
            })
    }

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
                        // backgroundColor: '#DACBBA',
                        background: 'linear-gradient(120deg,#BDC4C8, #D9D0BF)',
                        width: '100%',
                        height: '85%',
                        overflow: 'auto', // Thêm dòng này
                    }}
                >
                    {/* {messages.map((message, index) =>
                        // kiểm tra nếu không có tin nhắn thì return
                        !message || message.contentType === 'notify'  */}

                    {sortedMessages.map((message, index) =>
                        // kiểm tra nếu không có tin nhắn thì return
                        !message ? null : (
                            <div
                                key={message._id}
                                style={{
                                    display: 'flex',
                                    // justifyContent:
                                    //     message.senderId === user_id
                                    //         ? 'flex-end'
                                    //         : 'flex-start',
                                    justifyContent:
                                        (typeof message.senderId === 'object' &&
                                        message.senderId !== null
                                            ? message.senderId._id
                                            : message.senderId) === user_id
                                            ? 'flex-end'
                                            : 'flex-start',
                                    alignItems: 'center',
                                    marginLeft: '5px',
                                }}
                            >
                                {/* chỗ này hiện các thông báo ví dụ như xoá khỏi nhóm vv */}
                                {message.contentType === 'notify' ? (
                                    <p
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontSize: 14,
                                            marginBottom: 10,
                                            width: '100%',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: '#798EA2', // Thay đổi màu chữ
                                                backgroundColor: '#ECE9D6', // Thêm màu nền cho văn bản
                                                padding: '2px 5px', // Thêm padding cho văn bản
                                                borderRadius: '5px', // Làm viền tròn cho văn bản
                                            }}
                                        >
                                            {message.content}
                                        </span>
                                    </p>
                                ) : null}
                                {/* chỗ này hiện avatar */}
                                {message.contentType !== 'notify' &&
                                    /* message.senderId !== user_id */
                                    (typeof message.senderId === 'object' &&
                                    message.senderId !== null
                                        ? message.senderId._id
                                        : message.senderId) !== user_id && (
                                        <img
                                            // src={message.avatar}
                                            src={
                                                typeof message.senderId ===
                                                    'object' &&
                                                message.senderId !== null
                                                    ? message.senderId.avatar
                                                    : message.avatar
                                            }
                                            alt="sender avatar"
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '60%', // Make the image round
                                                border: '3px solid #2596be',
                                            }}
                                        />
                                    )}
                                {/* chỗ button hiện cái nút */}
                                {message.contentType !== 'notify' &&
                                    /*  message.senderId === user_id && (  */

                                    (typeof message.senderId === 'object' &&
                                    message.senderId !== null
                                        ? message.senderId._id
                                        : message.senderId) === user_id && (
                                        <button
                                            style={{
                                                border: '1px solid gray',
                                                borderRadius: '5px',
                                                // padding: '5px',
                                                backgroundColor: '#C8D9F0',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: '27px',
                                                height: '18px',
                                            }}
                                            onClick={(event) => {
                                                if (
                                                    !recalledMessages.includes(
                                                        message._id,
                                                    )
                                                ) {
                                                    openModal(message, event)
                                                }
                                            }}
                                        >
                                            •••
                                        </button>
                                    )}
                                {/* // Trong component hiển thị tin nhắn */}
                                {/* {message.replyTo && replyContent && (
                                    <div className="replying-to">
                                        Replying to: {replyContent[message._id]}
                                    </div>
                                )} */}

                                {message.contentType === 'notify' ? null : (
                                    <div>
                                        <p
                                            style={{
                                                maxWidth: '100%',
                                                alignSelf: 'flex-start',
                                                backgroundColor: '#e5e5ea', // light gray
                                                borderRadius: 10,
                                                padding: 10,
                                                marginTop: 10,
                                                marginBottom: 10,
                                                marginLeft: 10,
                                                marginRight: 10,
                                            }}
                                        >
                                            <p>
                                                {message.contentType !==
                                                    'notify' &&
                                                    message.senderId !==
                                                        user_id && (
                                                        <p
                                                            style={{
                                                                maxWidth:
                                                                    '100%',
                                                                color: '#7A8DA5',
                                                                fontSize: 13,
                                                                display: 'flex',
                                                                justifyContent:
                                                                    'flex-start',
                                                                alignItems:
                                                                    'center',
                                                            }}
                                                        >
                                                            <b>
                                                                {message.name}
                                                            </b>
                                                        </p>
                                                    )}
                                            </p>
                                            {message.replyTo &&
                                                replyContent && (
                                                    <div
                                                        className="replying-to"
                                                        style={{
                                                            border: '1px solid #EFF0F2', // Thêm viền màu #EFF0F2
                                                            borderRadius:
                                                                '10px',
                                                            padding: '10px',

                                                            alignSelf:
                                                                'flex-start',
                                                            backgroundColor:
                                                                '#C7E0FF',
                                                            borderRadius: 10,
                                                        }}
                                                        onClick={() =>
                                                            handleReplyClick(
                                                                message.replyTo,
                                                            )
                                                        }
                                                    >
                                                        <div className="reply-content">
                                                            <b>| Trả lời :</b>
                                                            {
                                                                replyContent[
                                                                    message._id
                                                                ]
                                                            }
                                                        </div>
                                                        {/* <div className="reply-message">
                    {message.content}
                </div> */}
                                                    </div>
                                                )}

                                            {message.contentType !== 'notify' &&
                                                message.contentType ===
                                                    'file' &&
                                                message.deletedBy &&
                                                !message.deletedBy.includes(
                                                    user_id,
                                                ) &&
                                                (recalledMessages.includes(
                                                    message._id,
                                                ) ? (
                                                    <p
                                                        style={{
                                                            color: '#8C929C',
                                                        }}
                                                    >
                                                        Tin nhắn đã bị thu hồi
                                                    </p>
                                                ) : message.content
                                                      .split('.')
                                                      .pop() === 'mp4' ? (
                                                    <video
                                                        width="320"
                                                        height="240"
                                                        controls
                                                        style={{
                                                            width: '200px',
                                                            height: '200px',
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <source
                                                            src={
                                                                message.content
                                                            }
                                                            type="video/mp4"
                                                        />
                                                        Your browser does not
                                                        support the video tag.
                                                    </video>
                                                ) : (
                                                    <a
                                                        className="file-link"
                                                        href={message.content}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            color: 'black',
                                                            textDecoration:
                                                                'none',
                                                        }}
                                                        onClick={(event) => {
                                                            if (
                                                                !recalledMessages.includes(
                                                                    message._id,
                                                                )
                                                            ) {
                                                                openModal(
                                                                    message,
                                                                    event,
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        {' '}
                                                        <FileIcon
                                                            extension={message.content
                                                                .split('.')
                                                                .pop()}
                                                            {...defaultStyles[
                                                                message.content
                                                                    .split('.')
                                                                    .pop()
                                                            ]}
                                                        />
                                                        <p
                                                            style={{
                                                                marginLeft: 10,
                                                            }}
                                                        >
                                                            {message.content
                                                                .split('/')
                                                                .pop()}
                                                        </p>
                                                    </a>
                                                ))}

                                            {/* //////////////////////////////// */}

                                            {message.contentType !== 'notify' &&
                                                message.contentType ===
                                                    'video' &&
                                                message.deletedBy &&
                                                !message.deletedBy.includes(
                                                    user_id,
                                                ) &&
                                                (recalledMessages.includes(
                                                    message._id,
                                                ) ? (
                                                    <p
                                                        style={{
                                                            color: '#8C929C',
                                                        }}
                                                    >
                                                        Tin nhắn đã bị thu hồi
                                                    </p>
                                                ) : message.content
                                                      .split('.')
                                                      .pop() === 'mp4' ? (
                                                    <video
                                                        width="320"
                                                        height="240"
                                                        controls
                                                        style={{
                                                            width: '200px',
                                                            height: '200px',
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <source
                                                            src={
                                                                message.content
                                                            }
                                                            type="video/mp4"
                                                        />
                                                        Your browser does not
                                                        support the video tag.
                                                    </video>
                                                ) : (
                                                    <a
                                                        className="file-link"
                                                        href={message.content}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            color: 'black',
                                                            textDecoration:
                                                                'none',
                                                        }}
                                                        onClick={(event) => {
                                                            if (
                                                                !recalledMessages.includes(
                                                                    message._id,
                                                                )
                                                            ) {
                                                                openModal(
                                                                    message,
                                                                    event,
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        {' '}
                                                        <FileIcon
                                                            extension={message.content
                                                                .split('.')
                                                                .pop()}
                                                            {...defaultStyles[
                                                                message.content
                                                                    .split('.')
                                                                    .pop()
                                                            ]}
                                                        />
                                                        <p
                                                            style={{
                                                                marginLeft: 10,
                                                            }}
                                                        >
                                                            {message.content
                                                                .split('/')
                                                                .pop()}
                                                        </p>
                                                    </a>
                                                ))}

                                            {message.contentType !== 'notify' &&
                                                message.contentType ===
                                                    'image' &&
                                                message.deletedBy &&
                                                !message.deletedBy.includes(
                                                    user_id,
                                                ) &&
                                                (recalledMessages.includes(
                                                    message._id,
                                                ) ? (
                                                    <p
                                                        style={{
                                                            color: '#8C929C',
                                                        }}
                                                    >
                                                        Tin nhắn đã bị thu hồi
                                                    </p>
                                                ) : (
                                                    <img
                                                        src={message.content}
                                                        alt="message"
                                                        onClick={(event) => {
                                                            if (
                                                                !recalledMessages.includes(
                                                                    message._id,
                                                                )
                                                            ) {
                                                                openModal(
                                                                    message,
                                                                    event,
                                                                )
                                                            }
                                                        }}
                                                        style={{
                                                            width: '200px',
                                                            height: '200px',
                                                        }}
                                                    />
                                                ))}
                                            {message.contentType !== 'notify' &&
                                                message.contentType ===
                                                    'text' &&
                                                message.deletedBy &&
                                                !message.deletedBy.includes(
                                                    user_id,
                                                ) && (
                                                    <p
                                                        onClick={
                                                            (event) => {
                                                                if (
                                                                    !recalledMessages.includes(
                                                                        message._id,
                                                                    )
                                                                ) {
                                                                    openModal(
                                                                        message,
                                                                        event,
                                                                    )
                                                                }
                                                            }
                                                            // openModal(message, event)
                                                        }
                                                        style={{
                                                            color: 'black',
                                                            fontSize: 16,
                                                            display: 'flex',
                                                            justifyContent:
                                                                message.senderId ===
                                                                user_id
                                                                    ? 'flex-start'
                                                                    : 'flex-start',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        {recalledMessages.includes(
                                                            message._id,
                                                        ) ? (
                                                            <p
                                                                style={{
                                                                    color: '#8C929C',
                                                                }}
                                                            >
                                                                Tin nhắn đã bị
                                                                thu hồi
                                                            </p>
                                                        ) : (
                                                            message.content
                                                        )}
                                                    </p>
                                                )}

                                            {message.contentType !==
                                                'notify' && (
                                                <p
                                                    style={{
                                                        color: '#a5acb7',
                                                        fontSize: 13,
                                                        display: 'flex',
                                                        justifyContent:
                                                            'flex-start',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    {moment(message.createdAt)
                                                        .utcOffset('+07:00')
                                                        .format('HH:mm')}
                                                </p>
                                            )}
                                        </p>
                                    </div>
                                )}
                                {message.contentType !== 'notify' &&
                                    message.senderId !== user_id && (
                                        <button
                                            style={{
                                                border: '1px solid gray',
                                                borderRadius: '5px',
                                                // padding: '5px',
                                                backgroundColor: '#C8D9F0',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: '27px',
                                                height: '18px',
                                            }}
                                            onClick={(event) => {
                                                if (
                                                    !recalledMessages.includes(
                                                        message._id,
                                                    )
                                                ) {
                                                    openModal(message, event)
                                                }
                                            }}
                                        >
                                            •••
                                        </button>
                                    )}
                            </div>
                        ),
                    )}
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
                        Chuyển tiếp
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
                            minWidth: '300px',
                        },
                    }}
                >
                    {friend_list.map((friend) => (
                        <div
                            key={friend.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '10px',
                            }}
                        >
                            <img
                                src={friend.avatar}
                                alt={'avatar'}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '60%',
                                    border: '3px solid #2596be',
                                }}
                            />
                            <b
                                style={{
                                    cursor: 'pointer',
                                    color: 'blue',
                                    fontSize: '16px',
                                }}
                            >
                                <p>{friend.friendName}</p>
                            </b>
                            <button
                                onClick={() =>
                                    handleForwardMessage(
                                        friend.friend_id,
                                        selectedMessage._id,
                                    )
                                }
                            >
                                <b>Gửi</b>
                            </button>
                        </div>
                    ))}
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
                                    style={{cursor: 'pointer'}}
                                />
                                <input
                                    id="fileInput"
                                    type="file"
                                    ref={fileImgRef}
                                    style={{ display: 'none' }} // Ẩn thẻ input[type="file"]
                                    onChange={handleImageChange}
                                />
                            </div>
                            <div>
                                <ImAttachment
                                    size="1.3rem"
                                    onClick={handleIconClick}
                                    style={{cursor: 'pointer'}}
                                />
                                <input
                                    id="fileInput"
                                    type="file"
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
                                style={{cursor: 'pointer'}}
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
