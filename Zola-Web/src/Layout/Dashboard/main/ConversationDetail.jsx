import React from 'react'
import { useEffect } from 'react'
import { ImCircleUp } from 'react-icons/im'
import { ImCircleDown } from 'react-icons/im'
import { BsStopwatch } from 'react-icons/bs'
import { BsPeople } from 'react-icons/bs'
import { CiBellOn } from 'react-icons/ci'
import { TfiPinAlt } from 'react-icons/tfi'
import { AiOutlineEdit } from 'react-icons/ai'
import { io } from 'socket.io-client'
import { useState } from 'react'
import demo from '../../../Assets/demo.jpg'
import PopupYou from './pupopYou'
import AddPupopYou from './addPupopYou'
import PopupStranger from './pupopStranger'
import AddPupopStranger from './addPupopStranger'
import Modal from 'react-modal'
import axios from 'axios'
import { FaTrash } from 'react-icons/fa'
import { FaTR } from 'react-icons/fa'
import { GrSearch } from 'react-icons/gr'
import { toast, Toaster } from 'react-hot-toast'
import SideBar from '../sideBar/index'
import Popup from '../sideBar/popup'
import { FileIcon, defaultStyles } from 'react-file-icon'
const ConversationDetail = ({
    currentSource,
    conversation_id,
    friend_list,
}) => {
    // Tạo một biến trạng thái để lưu trữ kết nối socket
    const [socket, setSocket] = useState(null)
    const [isPhotoVidOpen, setPhotoVidOpen] = React.useState(true)
    const [isFileOpen, setFileOpen] = React.useState(true)
    const [isLinkOpen, setLinkOpen] = React.useState(true)
    const [openInfoYou, setOpenInfoYou] = useState(false)
    const [openInfoStranger, setOpenInfoStranger] = useState(false)
    // Tạo một state để lưu trữ danh sách thành viên
    const [member_list, setMemberList] = useState([])
    const [friend_ids, setFriend_ids] = useState([])

    const [isModalOpenMember, setIsModalOpenMember] = React.useState(false)
    // tạo 1 state lưu trữ modal nhóm chung
    const [isModalOpenCommonGroup, setIsModalOpenCommonGroup] =
        React.useState(false)

    const [isModalOpenAuthorGroupLeader, setIsModalOpenAuthorGroupLeader] =
        React.useState(false)
    const [checkedItems, setCheckedItems] = useState({})

    const [isButtonPressed, setIsButtonPressed] = useState(false)
    const [isButtonPressed1, setIsButtonPressed1] = useState(false)
    const [isButtonPressed2, setIsButtonPressed2] = useState(false)
    const [isButtonPressed3, setIsButtonPressed3] = useState(false)
    const [isButtonPressed4, setIsButtonPressed4] = useState(false)
    const [isButtonPressed5, setIsButtonPressed5] = useState(false)
    const [isButtonPressed6, setIsButtonPressed6] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [selectedFriend, setSelectedFriend] = useState(null)
    const user_id = localStorage.getItem('user_id').replace(/"/g, '').trim()
    const [user, setUser] = useState('')

    // Thêm trạng thái mới để lưu member_id hiện tại
    const [currentMemberId, setCurrentMemberId] = useState(null)
    const [groupLeaderId, setgroupLeaderId] = useState(null)
    // tạo 1 mảng deputyLeaderIds để lưu trữ danh sách id phó nhóm
    const [deputyLeaderIds, setDeputyLeaderIds] = useState([])

    // tạo 1 list để lưu trữ danh sách ảnh , video của conversation
    const [mediaList, setMediaList] = useState([])

    // hãy fake data của medialist gồm 8 phần tử là link hình ảnh thật
    const mediaListFake = [
        'https://cafebiz.cafebizcdn.vn/162123310254002176/2024/4/2/photo-1-1681864188096974929463-1682044225998-16820442270031529811004-1682059999880-16820600001211239566695-1712016336135724736933.jpg',
        'https://afamilycdn.com/150157425591193600/2020/8/12/15970512419671084945176-15972226002571624600843.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN6SNOMg33K4zzy-Qvd9t0nmLNzqeaJitwIw&usqp=CAU',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7al-zLoropig_jfwUWVR3fKa8ytOi4TxLIQ&usqp=CAU',
        'https://cafebiz.cafebizcdn.vn/162123310254002176/2024/4/2/photo-1-1681864188096974929463-1682044225998-16820442270031529811004-1682059999880-16820600001211239566695-1712016336135724736933.jpg',
        'https://afamilycdn.com/150157425591193600/2020/8/12/15970512419671084945176-15972226002571624600843.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN6SNOMg33K4zzy-Qvd9t0nmLNzqeaJitwIw&usqp=CAU',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7al-zLoropig_jfwUWVR3fKa8ytOi4TxLIQ&usqp=CAU',
        'https://afamilycdn.com/150157425591193600/2020/8/12/15970512419671084945176-15972226002571624600843.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN6SNOMg33K4zzy-Qvd9t0nmLNzqeaJitwIw&usqp=CAU',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7al-zLoropig_jfwUWVR3fKa8ytOi4TxLIQ&usqp=CAU',
    ]
    // tạo 1 list để lưu trữ danh sách file của conversation
    const [fileList, setFileList] = useState([])
    // từ conversation_id gọi useEffect để lấy mediaList
    const fileListFake = [
        {
            fileName: '2024-04-04+10-41-45.mp4',
            fileLink:
                'https://zolabk.s3.ap-southeast-1.amazonaws.com/2024-04-04+10-41-45.mp4',
        },
        {
            fileName: 'helloexcel.xlsx',
            fileLink:
                'https://zolabk.s3.ap-southeast-1.amazonaws.com/helloexcel.xlsx',
        },
        {
            fileName: 'helloword.docx',
            fileLink:
                'https://zolabk.s3.ap-southeast-1.amazonaws.com/helloword.docx',
        },
    ]
    useEffect(() => {
        if (!conversation_id) {
            return
        }
        // Set mediaList to an empty array before making the axios request
        setMediaList([])
        setFileList([])
        axios
            .post('http://localhost:3001/message/getAllMediaWeb', {
                conversation_id: conversation_id,
            })
            .then((res) => {
                if (res.data.thongbao === 'Tìm thấy media!!!') {
                    // toast.success('Lấy danh sách ảnh , video thành công!!!')
                    // alert(JSON.stringify(res.data.mediaList))
                    setMediaList(res.data.media)
                }
                if (res.data.thongbao === 'Không tìm thấy media!!!') {
                    // toast.error('Không tìm thấy media!!!')
                }
            })
            .catch((error) => {
                console.log('Lỗi lấy danh sách ảnh , video : ', error)
            })
    }, [conversation_id])

    // gọi useEffect để lấy danh sách file
    useEffect(() => {
        if (!conversation_id) {
            return
        }
        axios
            .post('http://localhost:3001/message/getAllFileWeb', {
                conversation_id: conversation_id,
            })
            .then((res) => {
                if (res.data.thongbao === 'Tìm thấy file!!!') {
                    setFileList(res.data.files)
                }
                if (res.data.thongbao === 'Không tìm thấy file!!!') {
                    // toast.error('Không tìm thấy file!!!')
                }
            })
            .catch((error) => {
                console.log('Lỗi lấy danh sách file : ', error)
            })
    }, [conversation_id])

    const [isGroup, setIsGroup] = useState(false)
    // tạo 1 biến lưu trữ số lương nhóm chung giữa 2 người user_id và friend_id
    const [groupCommon, setGroupCommon] = useState(0)
    // tạo 1 mảng lưu trữ thông tin nhóm chung
    const [groupCommonList, setGroupCommonList] = useState([])

    useEffect(() => {
        setIsGroup(false)
        const checkIfGroup = async () => {
            try {
                const response = await axios.post(
                    'http://localhost:3001/conversation/checkGroupWeb',
                    {
                        conversation_id: conversation_id, // replace with your conversation id
                    },
                )

                if (response.data.message === 'Conversation là nhóm!!!') {
                    setIsGroup(true)
                }
                if (
                    response.data.message ===
                    'Conversation không phải là nhóm!!!'
                ) {
                    setIsGroup(false)
                }
            } catch (error) {
                console.error(error)
            }
        }
        //check nhóm chung
        setGroupCommon(0)
        const checkGroupCommonWeb = async () => {
            setIsGroup(false)
            if (currentSource) {
                // alert(user_id + ',' + currentSource.friend_id)
                try {
                    const response = await axios.post(
                        'http://localhost:3001/conversation/checkGroupCommonWeb',
                        {
                            user_id: user_id,
                            friend_id: currentSource.friend_id,
                        },
                    )

                    if (response.data.message === 'Có nhóm chung!!!') {
                        // alert('Có nhóm chung!!!')

                        setGroupCommon(response.data.conversationCount)
                        setGroupCommonList(response.data.conversation)
                    }
                    if (response.data.message === 'Không có nhóm chung!!!') {
                        setGroupCommon(0)
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        }

        // alert(JSON.stringify(currentSource.friend_id))
        checkIfGroup()
        checkGroupCommonWeb()
    }, [conversation_id])

    // if (groupCommonList) {
    //     alert(JSON.stringify(groupCommonList))
    // }
    // check xem groupCommonList có phải là mảng đã có phần tử hay không
    //  if (groupCommonList.length > 0) {

    // nếu có mediaList thì hiển thị ra giao diện
    // if (mediaList.length > 0) {
    //     alert(JSON.stringify(mediaList))
    // }

    // useEffect(() => {
    //     if (!conversation_id) {
    //         return
    //     }
    //     const newSocket = io('http://localhost:3001')
    //     newSocket.emit('conversation_id', conversation_id)

    //     setSocket(newSocket)

    //     return () => {
    //         newSocket.disconnect()
    //     }
    // }, [conversation_id])

    const handleInfo = (friend) => {
        setShowPopup(true)
    }
    const handleClose = () => {
        setShowPopup(false)
    }

    const handleOpenModalMember = () => {
        setIsModalOpenMember(true)
    }

    const handleCloseModalMember = () => {
        setIsModalOpenMember(false)
    }

    const handleOpenModalCommonGroup = () => {
        setIsModalOpenCommonGroup(true)
    }
    const handleCloseModalCommonGroup = () => {
        setIsModalOpenCommonGroup(false)
    }

    const handleOpenModalAuthorGroupLeader = () => {
        setIsModalOpenAuthorGroupLeader(true)
    }

    const handleCloseModalAuthorGroupLeader = () => {
        setIsModalOpenAuthorGroupLeader(false)
    }

    const [isModalOpenAddMember, setIsModalOpenAddMember] =
        React.useState(false)

    const handleOpenModalAddMember = () => {
        setIsModalOpenAddMember(true)
    }

    const handleCloseModalAddMember = () => {
        setIsModalOpenAddMember(false)
    }

    const [isModalOpenEditMember, setIsModalOpenEditMember] =
        React.useState(false)

    const handleOpenModalEditMember = (friend) => {
        setSelectedFriend(friend)
        setIsModalOpenEditMember(true)
        setCurrentMemberId(friend.id) // Lưu member_id khi mở modal
    }
    const handleModal = (friend) => {
        setCurrentMemberId(friend.id)
    }

    const handleCloseModalEditMember = () => {
        setIsModalOpenEditMember(false)
    }
    const fetchUser = () => {
        // Hàm để fetch thông tin người dùng
        axios
            .post('http://localhost:3001/user/findUserByUserID', {
                user_id: user_id,
            })
            .then((response) => {
                if (response.data.message === 'Tìm user thành công!!!') {
                    localStorage.setItem(
                        'user',
                        JSON.stringify(response.data.user),
                    )
                    const user = JSON.parse(localStorage.getItem('user'))
                    setUser(user)
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }

    // useEffect lấy danh sách member trong cuộC hội thoại
    useEffect(() => {
        fetchUser()
        if (!conversation_id) {
            return
            // dispatch(getMember(conversation_id))
        } else {
            axios
                .post(
                    'http://localhost:3001/conversation/getMemberFromConversationIDWeb',
                    {
                        conversation_id: conversation_id,
                    },
                )
                .then((res) => {
                    if (
                        res.data.message ===
                        'Lấy danh sách thành viên thành công!!!'
                    ) {
                        // toast.success('Lấy danh sách thành viên thành công!!!')
                        // Duyệt qua mỗi member_id và lấy thông tin của họ
                        Promise.all(
                            res.data.members.map((member_id) => {
                                return axios.post(
                                    'http://localhost:3001/user/getInfoByUserIDWeb',
                                    { sender_id: member_id },
                                )
                            }),
                        ).then((memberInfos) => {
                            // Tạo một mảng mới chứa thông tin của các thành viên
                            const newMemberList = memberInfos.map(
                                (info, index) => {
                                    return {
                                        id: res.data.members[index],
                                        avatar: info.data.avatar,
                                        name: info.data.name,
                                    }
                                },
                            )
                            // Cập nhật state
                            setMemberList(newMemberList)
                            // alert(JSON.stringify(member_list))
                        })
                    }
                })
                .catch((error) => {
                    console.log(
                        'Lỗi lấy danh sách thành viên trong cuộc hội thoại : ',
                        error,
                    )
                })
        }
    }, [conversation_id])

    // useEffect lấy danh sách id  phó nhóm và trưởng nhóm
    useEffect(() => {
        if (!member_list) {
            return
            // dispatch(getMember(conversation_id))
        } else {
            axios
                .post(
                    'http://localhost:3001/conversation/getGroupLeaderAndDeputyLeaderWeb',
                    {
                        conversation_id: conversation_id,
                    },
                )
                .then((res) => {
                    if (
                        res.data.message ===
                        'Lấy GroupLeader và DeputyLeader thành công!!!'
                    ) {
                        // toast.success(
                        //     'Lấy GroupLeader và DeputyLeader thành công!!!',
                        // )
                        // Duyệt qua mỗi member_id và lấy thông tin của họ
                        setgroupLeaderId(res.data.groupLeaderId)
                        setDeputyLeaderIds(res.data.deputyLeaderIds)
                        // alert(
                        //     JSON.stringify(groupLeaderId) +
                        //         ',' +
                        //         JSON.stringify(deputyLeaderIds),
                        // )
                    }
                })
                .catch((error) => {
                    console.log(
                        'Lỗi lấy danh sách thành viên trong cuộc hội thoại : ',
                        error,
                    )
                })
        }
    }, [member_list])
    // Kiểm tra xem người dùng hiện tại có phải là GroupLeader, DeputyLeader hay không
    const isGroupLeader = user_id === groupLeaderId
    const isDeputyLeader = deputyLeaderIds.includes(user_id)

    // replace with your server URL

    //socket là

    useEffect(() => {
        if (!conversation_id) {
            return
        }
        const newSocket = io('http://localhost:3005')
        //const newSocket = io('http://192.168.1.17:3005')

        // gọi tới socket notification
        setSocket(newSocket)

        const user_id = localStorage.getItem('user_id')?.replace(/"/g, '').trim()
        newSocket.emit('join-conversation', { conversation_id, user_id })

        // Add socket event listeners for real-time updates
        newSocket.on('leave-group', (data) => {
            if (data.conversation_id === conversation_id) {
                setMemberList((prevList) =>
                    prevList.filter((member) => member.id !== data.user_id),
                )
            }
        })

        newSocket.on('disband-group', (data) => {
            if (data.conversation_id === conversation_id) {
                setMemberList([])
            }
        })

        newSocket.on('conversation-group', (data) => {
            // Placeholder: handle new group creation if needed
            // For example, refresh group list or notify user
            // console.log('New group created:', data)
        })

        newSocket.on('add-member', (data) => {
            if (data.conversation_id === conversation_id) {
                // Add new members to member_list state
                setMemberList((prevList) => {
                    // Create new members array from friend_ids
                    const newMembers = data.friend_ids.map((id) => {
                        const friend = friend_list.find(
                            (f) => f.friend_id === id,
                        )
                        return {
                            id: id,
                            avatar: friend ? friend.avatar : '',
                            name: friend ? friend.friendName : 'Unknown',
                        }
                    })
                    // Filter out duplicates
                    const existingIds = new Set(prevList.map((m) => m.id))
                    const filteredNewMembers = newMembers.filter(
                        (m) => !existingIds.has(m.id),
                    )
                    return [...prevList, ...filteredNewMembers]
                })
            }
        })

        newSocket.on('remove-member', (data) => {
            if (data.conversation_id === conversation_id) {
                setMemberList((prevList) =>
                    prevList.filter((member) => member.id !== data.friend_id),
                )
            }
        })

        return () => {
            newSocket.off('leave-group')
            newSocket.off('disband-group')
            newSocket.off('conversation-group')
            newSocket.disconnect()
        }
    }, [conversation_id])

    const handleAddMember = () => {
        // alert(JSON.stringify(friend_ids))

        // kiểM tra xem friend_ids có giá trị nào trùng không nếu có giá trị trùng thì chỉ giữ lại 1 giá trị duy nhất đảm bảo friend_ids không có giá trị trùng
        const uniqueFriendIds = [...new Set(friend_ids)]
        setFriend_ids(uniqueFriendIds)
        // alert(JSON.stringify(uniqueFriendIds))

        //gọi tới axio addMemberToConversationGroupWeb
        axios
            .post(
                'http://localhost:3001/conversation/addMemberToConversationGroupWeb',
                {
                    conversation_id: conversation_id,
                    friend_ids: uniqueFriendIds,
                },
            )
            .then((res) => {
                if (
                    res.data.message ===
                    'Thêm thành viên vào nhóm thành công!!!'
                ) {
                    // toast.success('Thêm thành viên vào nhóm thành công!!!')

                    // // Emit an event with the new member info
                    // socket.emit('addMemberToGroup', {
                    //     newMember: friend_list.find(
                    //         (friend) => friend.friend_id === uniqueFriendIds[0],
                    //     ),
                    // })
                    // Đóng modal
                    setIsModalOpenAddMember(false)
                    setIsModalOpenMember(false)

                    // Cập nhật lại danh sách thành viên
                    setMemberList([
                        ...member_list,
                        ...friend_ids.map((id) => {
                            return {
                                id: id,
                                avatar: friend_list.find(
                                    (friend) => friend.friend_id === id,
                                ).avatar,
                                name: friend_list.find(
                                    (friend) => friend.friend_id === id,
                                ).friendName,
                            }
                        }),
                    ])
                    // gọi api createNotificationWeb
                    axios
                        .post(
                            'http://localhost:3001/message/createNotificationWeb',
                            {
                                sender_id: user_id,
                                receiver_id: uniqueFriendIds[0],
                                conversation_id: conversation_id,
                                action: 'add',
                            },
                        )
                        .then((res) => {
                            if (
                                res.data.message === 'Tạo thông báo thành công'
                            ) {
                                toast.success(res.data.notification)
                                // toast.success('Tạo thông báo thành công!!!')
                                // gọi gới socket notification
                                socket.emit('notification', res.data.noti)
                            }
                        })
                        .catch((error) => {
                            console.log('Lỗi tạo thông báo : ', error)
                        })
                }
                if (res.data.message === 'Thành viên đã có trong nhóm!!!') {
                    toast.error('Thành viên đã có trong nhóm!!!')
                }
            })
            .catch((error) => {
                toast.error('Lỗi thêm thành viên vào nhóm!!!')
                console.log('Lỗi thêm thành viên vào nhóm : ', error)
            })
    }
    // xoá thành viên
    const handleDeleteMember = () => {
        // alert(user_id + ',' + conversation_id + ',' + currentMemberId)
        // gọi tới axios removeMemberFromConversationGroupWeb
        axios
            .post(
                'http://localhost:3001/conversation/removeMemberFromConversationGroupWeb',
                {
                    user_id: user_id,
                    conversation_id: conversation_id,
                    friend_id: currentMemberId,
                },
            )
            .then((res) => {
                if (
                    res.data.message ===
                    'Xóa thành viên khỏi nhóm thành công!!!'
                ) {
                    // toast.success('Xoá thành viên khỏi nhóm thành công!!!')
                    // Đóng modal
                    setIsModalOpenEditMember(false)
                    setIsModalOpenMember(false)

                    // Cập nhật lại danh sách thành viên
                    setMemberList(
                        member_list.filter(
                            (member) => member.id !== currentMemberId,
                        ),
                    )
                    // gọi tới api tạo notification xoá nhóm
                    axios
                        .post(
                            'http://localhost:3001/message/createNotificationWeb',
                            {
                                sender_id: user_id,
                                receiver_id: currentMemberId,
                                conversation_id: conversation_id,
                                action: 'remove',
                            },
                        )
                        .then((res) => {
                            if (
                                res.data.message === 'Tạo thông báo thành công'
                            ) {
                                toast.success(res.data.notification)
                                // toast.success('Tạo thông báo thành công!!!')
                                socket.emit('notification', res.data.noti)
                            }
                        })
                        .catch((error) => {
                            console.log('Lỗi tạo thông báo : ', error)
                        })
                }
                if (
                    res.data.message ===
                    'Bạn không có quyền xóa thành viên khỏi nhóm!!!'
                ) {
                    toast.error(
                        'Bạn không có quyền xóa thành viên khỏi nhóm!!!',
                    )
                }
                if (
                    res.data.message ===
                    'Trưởng nhóm không thể bị xóa khỏi nhóm!!!'
                ) {
                    toast.error('Trưởng nhóm không thể bị xóa khỏi nhóm!!!')

                    // // mở modal chuyển quyền trưởng nhóm
                    // setIsModalOpenAuthorGroupLeader(true)

                    // đóng modal
                    setIsModalOpenEditMember(false)
                    setIsModalOpenMember(false)
                }
            })
            .catch((error) => {
                console.log('Lỗi xoá thành viên khỏi nhóm : ', error)
            })
    }
    // giải tán nhóm
    const handledisbandGroupWeb = () => {
        // gọi tới axios disbandGroupWeb
        axios
            .post('http://localhost:3001/conversation/disbandGroupWeb', {
                user_id: user_id,
                conversation_id: conversation_id,
            })
            .then((res) => {
                if (res.data.message === 'Giải tán nhóm thành công!!!') {
                    toast.success('Giải tán nhóm thành công!!!')
                    // Đóng modal
                    setIsModalOpenMember(false)
                    setIsModalOpenEditMember(false)

                    // Cập nhật lại danh sách thành viên
                    setMemberList([])

                    // Emit socket event for disband group
                    if (socket) {
                        socket.emit('disband-group', {
                            conversation_id: conversation_id,
                            user_id: user_id,
                        })
                    }
                }
                if (
                    res.data.message === 'Bạn không có quyền giải tán nhóm!!!'
                ) {
                    toast.error('Bạn không có quyền giải tán nhóm!!!')
                }
            })
            .catch((error) => {
                console.log('Lỗi giải tán nhóm : ', error)
            })
    }
    // rời nhóm
    const handleLeaveGroup = () => {
        // alert(currentMemberId + ',' + conversation_id)
        // gọi tới axios leaveGroupWeb
        axios
            .post('http://localhost:3001/conversation/leaveGroupWeb', {
                user_id: currentMemberId,
                conversation_id: conversation_id,
            })
            .then((res) => {
                if (res.data.message === 'Rời khỏi nhóm thành công!!!') {
                    toast.success('Rời khỏi nhóm thành công!!!')
                    // Đóng modal
                    setIsModalOpenMember(false)
                    setIsModalOpenEditMember(false)

                    // Cập nhật lại danh sách thành viên
                    setMemberList(
                        member_list.filter((member) => member.id !== user_id),
                    )
                    // gọi tới api tạo notification xoá nhóm
                    axios
                        .post(
                            'http://localhost:3001/message/createNotificationWeb',
                            {
                                sender_id: currentMemberId,
                                conversation_id: conversation_id,
                                action: 'exit',
                            },
                        )
                        .then((res) => {
                            if (
                                res.data.message === 'Tạo thông báo thành công'
                            ) {
                                toast.success(res.data.notification)
                                // toast.success('Tạo thông báo thành công!!!')
                                socket.emit('notification', res.data.noti)
                            }
                        })
                        .catch((error) => {
                            console.log('Lỗi tạo thông báo : ', error)
                        })

                    // Emit socket event for leave group
                    if (socket) {
                        socket.emit('leave-group', {
                            conversation_id: conversation_id,
                            user_id: currentMemberId,
                        })
                    }

                    // refesh lại trang
                    window.location.reload()
                }
                if (
                    res.data.message ===
                    'Trưởng nhóm không thể rời khỏi nhóm!!!'
                ) {
                    toast.error(
                        'Bạn cần chuyển quyền trưởng nhóm trước khi rời khởi nhóm!!!',
                    )
                    // mở modal chuyển quyền trưởng nhóm
                    setIsModalOpenAuthorGroupLeader(true)
                    // đóng modal chức năng
                    setIsModalOpenMember(false)
                    setIsModalOpenEditMember(false)
                }
            })
            .catch((error) => {
                console.log('Lỗi rời nhóm : ', error)
            })
    }
    // thêm phó nhóm
    const handleAddDeputyLeader = () => {
        // gọi tới axios addDeputyLeaderWeb
        axios
            .post(
                'http://localhost:3001/conversation/authorizeDeputyLeaderWeb',
                {
                    user_id: user_id,
                    conversation_id: conversation_id,
                    friend_id: currentMemberId,
                },
            )
            .then((res) => {
                if (res.data.message === 'Gán quyền phó nhóm thành công!!!') {
                    toast.success('Thêm thành viên làm Phó Nhóm thành công!!!')
                    // Đóng modal
                    setIsModalOpenEditMember(false)
                    setIsModalOpenMember(false)

                    // gọi tới api tạo notification thêm phó nhóm
                    axios
                        .post(
                            'http://localhost:3001/message/createNotificationWeb',
                            {
                                sender_id: user_id,
                                receiver_id: currentMemberId,
                                conversation_id: conversation_id,
                                action: 'addDeputyLeader',
                            },
                        )
                        .then((res) => {
                            if (
                                res.data.message === 'Tạo thông báo thành công'
                            ) {
                                toast.success(res.data.notification)
                                // toast.success('Tạo thông báo thành công!!!')
                                socket.emit('notification', res.data.noti)
                            }
                        })
                        .catch((error) => {
                            console.log('Lỗi tạo thông báo : ', error)
                        })
                }
                if (res.data.message === 'Bạn không có quyền gán phó nhóm!!!') {
                    toast.error(
                        'Bạn không có quyền thêm thành viên làm Phó Nhóm!!!',
                    )
                }
                if (res.data.message === 'Thành viên đã là phó nhóm rồi!!!') {
                    toast.error('Thành viên đã là phó nhóm rồi!!!')
                }
                if (
                    res.data.message === 'Thành viên đã là trưởng nhóm rồi!!!'
                ) {
                    toast.error('Thành viên đã là trưởng nhóm rồi!!!')
                }
            })
            .catch((error) => {
                console.log('Lỗi thêm thành viên làm Phó Nhóm : ', error)
            })
    }
    // chuyển quyền trưởng nhóm
    const handleAddGroupLeader = (member_id) => {
        // gọi tới 1 thông báo xác nhận xem có chắc chắn muốn chuyển quyền trưởn nhóm không chuyển rồi không chuyển lại được nếu đồng ý chuyển thì mới gọi tới axios
        // alert(member_id)

        // xác nhận chuyển
        // Hiển thị hộp thoại xác nhận
        const confirm = window.confirm(
            'Bạn có chắc chắn muốn chuyển quyền trưởng nhóm không ? Bạn sẽ mất quyền quản lý nhưng vẫn là một thành viên của nhóm . Hành động này không thể phục hồi',
        )
        if (confirm) {
            axios
                .post(
                    'http://localhost:3001/conversation/authorizeGroupLeaderWeb',
                    {
                        user_id: user_id,
                        conversation_id: conversation_id,
                        friend_id: member_id,
                    },
                )
                .then((res) => {
                    if (
                        res.data.message ===
                        'Gán quyền trưởng nhóm thành công!!!'
                    ) {
                        toast.success('Chuyển Trưởng Nhóm thành công!!!')
                        // Đóng modal
                        setIsModalOpenEditMember(false)
                        setIsModalOpenMember(false)
                        // gọi tới api tạo notification chuyển trưởng nhóm
                        axios
                            .post(
                                'http://localhost:3001/message/createNotificationWeb',
                                {
                                    sender_id: user_id,
                                    receiver_id: member_id,
                                    conversation_id: conversation_id,
                                    action: 'changeGroupLeader',
                                },
                            )
                            .then((res) => {
                                if (
                                    res.data.message ===
                                    'Tạo thông báo thành công'
                                ) {
                                    toast.success(res.data.notification)
                                    // toast.success('Tạo thông báo thành công!!!')
                                    socket.emit('notification', res.data.noti)
                                }
                            })
                            .catch((error) => {
                                console.log('Lỗi tạo thông báo : ', error)
                            })
                    }
                    if (
                        res.data.message ===
                        'Bạn không có quyền gán trưởng nhóm!!!'
                    ) {
                        toast.error(
                            'Bạn không có quyền thêm thành viên làm Trưởng Nhóm!!!',
                        )
                    }
                })
                .catch((error) => {
                    console.log('Lỗi thêm thành viên làm Trưởng Nhóm : ', error)
                })
        }
    }
    // xoá phó nhóm
    const handleDeleteDeputyLeader = () => {
        // gọi tới axios deleteDeputyLeaderWeb
        axios
            .post('http://localhost:3001/conversation/deleteDeputyLeaderWeb', {
                user_id: user_id,
                conversation_id: conversation_id,
                friend_id: currentMemberId,
            })
            .then((res) => {
                if (res.data.message === 'Gỡ quyền phó nhóm thành công!!!') {
                    toast.success('Gỡ quyền phó nhóm thành công!!!')
                    // Đóng modal
                    setIsModalOpenEditMember(false)
                    setIsModalOpenMember(false)
                    // gọi tới api create notify gỡ phó nhóm
                    axios
                        .post(
                            'http://localhost:3001/message/createNotificationWeb',
                            {
                                sender_id: user_id,
                                receiver_id: currentMemberId,
                                conversation_id: conversation_id,
                                action: 'deleteDeputyLeader',
                            },
                        )
                        .then((res) => {
                            if (
                                res.data.message === 'Tạo thông báo thành công'
                            ) {
                                toast.success(res.data.notification)
                                // toast.success('Tạo thông báo thành công!!!')
                                socket.emit('notification', res.data.noti)
                            }
                        })
                        .catch((error) => {
                            console.log('Lỗi tạo thông báo : ', error)
                        })
                }
                if (
                    res.data.message ===
                    'Bạn không có quyền gỡ quyền phó nhóm!!!'
                ) {
                    toast.error('Bạn không có quyền gỡ quyền phó nhóm!!!')
                }
            })
            .catch((error) => {
                console.log('Lỗi gỡ phó nhóm : ', error)
            })
    }
    // thay đổi tên nhóm
    const handleRenameConversation = async () => {
        const newConversationName = prompt('Nhập tên mới cho cuộc trò chuyện')

        if (newConversationName) {
            axios
                .post(
                    'http://localhost:3001/conversation/changeConversationNameWeb',
                    {
                        user_id: user_id,
                        conversation_id: conversation_id,
                        conversationName: newConversationName,
                    },
                )
                .then((res) => {
                    if (res.data.message === 'Đổi tên nhóm thành công!!!') {
                        toast.success('Đổi tên nhóm thành công!!!')
                        // gọi tới axios createNotificationWeb đổi tên
                        axios
                            .post(
                                'http://localhost:3001/message/createNotificationWeb',
                                {
                                    sender_id: user_id,
                                    conversation_id: conversation_id,
                                    action: 'rename',
                                    conversationNameNew: newConversationName,
                                },
                            )
                            .then((res) => {
                                if (
                                    res.data.message ===
                                    'Tạo thông báo thành công'
                                ) {
                                    toast.success(res.data.notification)
                                    // toast.success('Tạo thông báo thành công!!!')
                                    socket.emit('notification', res.data.noti)
                                }
                            })
                            .catch((error) => {
                                console.log('Lỗi tạo thông báo : ', error)
                            })
                    }
                })
                .catch((error) => {
                    console.log('Lỗi đổi tên nhóm: ', error)
                })
        }
    }

    return (
        <div
            style={{
                width: '33%',
                height: '100%',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                overflowY: 'auto',
            }}
        >
            <Toaster toastOptions={{ duration: 3500 }} />
            <div
                style={{
                    width: '100%',
                    height: 70,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',

                    borderBottom: '1px solid lightgrey',
                }}
            >
                <label
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginTop: 23,
                    }}
                >
                    Thông tin hội thoại
                </label>
                <div
                    style={{
                        marginTop: 20,
                    }}
                ></div>
            </div>
            <div>
                <img
                    src={
                        currentSource
                            ? currentSource.avatar
                            : 'https://zolabk.s3.ap-southeast-1.amazonaws.com/boy.png'
                    }
                    alt="demo"
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 100,
                        backgroundColor: 'grey',
                        marginTop: 15,
                        border: '3px solid #2596be',
                    }}
                    onClick={() => {
                        // này cho bạn bè
                        // setOpenInfoYou(!openInfoYou)
                        //  này cho người lạ
                        setOpenInfoStranger(!openInfoStranger)
                    }}
                />
            </div>
            {/* này cho người lạ */}
            {openInfoStranger && (
                <PopupStranger
                    content={<AddPupopStranger />}
                    handleClose={() => {
                        setOpenInfoStranger(!openInfoStranger)
                    }}
                />
            )}
            <div style={{ display: 'flex', gap: 10 }}>
                <label
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        textAlign: 'center',
                    }}
                >
                    {currentSource ? currentSource.name : ''}
                </label>

                {isGroup && (
                    <label
                        style={{
                            width: 25,
                            height: 25,
                            borderRadius: 100,
                            backgroundColor: 'whitesmoke',
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        onClick={handleRenameConversation}
                    >
                        <AiOutlineEdit size="1.3rem" />
                    </label>
                )}
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    gap: 20,
                    padding: 15,
                    width: '80%',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            width: 33,
                            height: 33,
                            borderRadius: 100,
                            backgroundColor: 'whitesmoke',
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                        }}
                    >
                        <CiBellOn size="1.3rem" />
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            color: 'grey',
                            flexDirection: 'column',
                            alignContent: 'center',
                        }}
                    >
                        <label>Tắt thông báo</label>
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',

                        alignContent: 'center',
                    }}
                >
                    <div
                        style={{
                            width: 33,
                            height: 33,
                            borderRadius: 100,
                            backgroundColor: 'whitesmoke',
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                        }}
                    >
                        <TfiPinAlt size="1.2rem" />
                    </div>
                    <label
                        style={{
                            fontSize: 12,
                            color: 'grey',
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            alignContent: 'center',
                        }}
                    >
                        Ghim hội thoại
                    </label>
                </div>
                <div
                    style={{
                        display: 'flex',

                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            width: 33,
                            height: 33,
                            borderRadius: 100,
                            backgroundColor: 'whitesmoke',
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',

                        }}
                    >
                        <FaTrash style={{ cursor: 'pointer', }} size="1.2rem" />
                    </div>
                    <label
                        style={{
                            fontSize: 12,
                            color: 'grey',
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            alignContent: 'center',

                        }}
                    >
                        Xóa cuộc trò chuyện
                    </label>
                </div>
            </div>
            <div
                style={{
                    width: '100%',
                    borderBottomWidth: 5,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'whitesmoke',
                }}
            ></div>
            <div
                style={{
                    flex: 'row',
                    width: '100%',
                    flexDirection: 'column',
                    display: 'flex',
                }}
                onClick={() => {
                    handleOpenModalMember()
                    //handleButtonMember()
                }}
            >
                {/* tesst123 */}
                <div
                    style={{
                        paddingLeft: 10,
                        flex: 'row',
                        width: '100%',
                        display: 'flex',
                    }}
                >
                    <BsPeople size="1.3rem" />

                    <label
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        Danh sách thành viên
                    </label>
                </div>
            </div>



            <Modal
                isOpen={isModalOpenCommonGroup}
                onRequestClose={handleCloseModalCommonGroup}
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
                <label
                    htmlFor=""
                    style={{
                        fontSize: 20,
                        fontWeight: 'bold',

                        cursor: 'pointer',
                        color: 'blue',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    Thông tin nhóm chung
                </label>
                <br />
                {groupCommonList.map((group) => (
                    <div
                        key={group._id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                        }}
                    >
                        <img
                            src={group.avatar}
                            alt={'avatar'}
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '60%',
                                border: '3px solid #2596be',
                                marginRight: '10px',
                            }}
                        />
                        <span
                            style={{
                                cursor: 'pointer',

                                fontSize: '16px',
                            }}
                        >
                            <p>{group.conversationName}</p>
                        </span>
                    </div>
                ))}
            </Modal>
            {/* // modal thông tin member  */}
            <Modal
                isOpen={isModalOpenMember}
                onRequestClose={handleCloseModalMember}
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
                <button
                    style={{
                        backgroundColor: '#2596be',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '5px',
                        border: 'none',
                        cursor: 'pointer',
                        marginBottom: '10px',
                        width: '100%',
                    }}
                    onClick={() => {
                        handleOpenModalAddMember()
                    }}
                >
                    Thêm thành viên
                </button>

                {member_list.map((member) => (
                    <div
                        key={member.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '10px',
                        }}
                    >
                        <img
                            src={member.avatar}
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
                            {/* <p>{member.name}</p> */}

                            <p>
                                {member.name}
                                {member.id === groupLeaderId && (
                                    <span
                                        style={{
                                            color: '#8091A8',
                                            fontSize: 'small',
                                        }}
                                    >
                                        {' '}
                                        (TN)
                                    </span>
                                )}
                                {deputyLeaderIds.includes(member.id) && (
                                    <span
                                        style={{
                                            color: '#8091A8',
                                            fontSize: 'small',
                                        }}
                                    >
                                        {' '}
                                        (PN)
                                    </span>
                                )}
                            </p>
                        </b>
                        <button
                            onClick={() =>
                                // handleOpenModalEditMember(

                                //     friend_list.find(
                                //         (friend) =>
                                //             friend.friend_id === member.id,
                                //     ),
                                // )
                                handleOpenModalEditMember(member)
                            }
                        >
                            <b>Chọn</b>
                        </button>
                    </div>
                ))}
            </Modal>
            {/* // modal hiện người mà trưởn nhóm chuyển qua  */}
            <Modal
                isOpen={isModalOpenAuthorGroupLeader}
                onRequestClose={handleCloseModalAuthorGroupLeader}
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
                <label
                    htmlFor=""
                    style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginBottom: 10,
                    }}
                >
                    Chuyển quyền trưởng nhóm
                </label>
                {member_list.map((member) => (
                    <div
                        key={member.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '10px',
                        }}
                    >
                        <img
                            src={member.avatar}
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
                            {/* <p>{member.name}</p> */}

                            <p>
                                {member.name}
                                {member.id === groupLeaderId && (
                                    <span
                                        style={{
                                            color: '#8091A8',
                                            fontSize: 'small',
                                        }}
                                    >
                                        {' '}
                                        (TN)
                                    </span>
                                )}
                                {deputyLeaderIds.includes(member.id) && (
                                    <span
                                        style={{
                                            color: '#8091A8',
                                            fontSize: 'small',
                                        }}
                                    >
                                        {' '}
                                        (PN)
                                    </span>
                                )}
                            </p>
                        </b>
                        <button
                            onClick={() => {
                                handleAddGroupLeader(member.id)
                            }}
                        >
                            <b>Chuyển</b>
                        </button>
                    </div>
                ))}
            </Modal>
            {/* // modal hiển thị thêm bạn bè  */}
            <Modal
                isOpen={isModalOpenAddMember}
                onRequestClose={handleCloseModalAddMember}
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
                        height: '600px',
                    },
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Toaster toastOptions={{ duration: 3500 }} />
                    <div
                        style={{
                            width: '100%',
                            height: '8%',
                            display: 'flex',
                            borderBottom: '1px solid grey',
                        }}
                    >
                        <label
                            style={{
                                fontSize: 17,
                                color: '#000',
                                marginLeft: 20,
                                marginTop: 10,
                            }}
                        >
                            <b>Thêm bạn bè</b>
                        </label>
                    </div>

                    <div
                        style={{
                            width: '100%',
                            height: '6%',
                            display: 'flex',
                            marginTop: 5,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                height: '100%',
                                backgroundColor: 'white',
                                width: '95%',
                                marginLeft: 10,
                                borderRadius: 20,
                                gap: 5,
                                border: '1px solid lightgrey',
                            }}
                        >
                            <div style={{ marginLeft: 10, marginTop: 8 }}>
                                <GrSearch size="1rem" />
                            </div>

                            <input
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    alignItems: 'center',
                                    borderRadius: 10,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    border: 'none',
                                    backgroundColor: 'white',
                                    outline: 'none',
                                    fontSize: 12,
                                }}
                                type="text"
                                placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
                            // value={searchValue}
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%',
                            height: '7%',
                            display: 'flex',
                            flexDirection: 'row',
                            marginTop: 10,
                        }}
                    >
                        <button
                            style={{
                                width: 70,
                                height: 23,
                                border: 'none',
                                backgroundColor: '#2977ff',
                                color: 'white',
                                fontSize: 12,
                                marginLeft: 10,
                                borderRadius: 10,
                            }}
                        >
                            Tất cả
                        </button>
                        <button
                            style={{
                                width: 70,
                                height: 23,
                                border: 'none',
                                backgroundColor: 'whitesmoke',
                                color: 'black',
                                fontSize: 12,
                                marginLeft: 10,
                                borderRadius: 10,
                            }}
                        >
                            Khách hàng
                        </button>
                        <button
                            style={{
                                width: 70,
                                height: 23,
                                border: 'none',
                                backgroundColor: 'whitesmoke',
                                color: 'black',
                                fontSize: 12,
                                marginLeft: 10,
                                borderRadius: 10,
                            }}
                        >
                            Gia đình
                        </button>
                        <button
                            style={{
                                width: 70,
                                height: 23,
                                border: 'none',
                                backgroundColor: 'whitesmoke',
                                color: 'black',
                                fontSize: 12,
                                marginLeft: 10,
                                borderRadius: 10,
                            }}
                        >
                            Công việc
                        </button>
                        <button
                            style={{
                                width: 70,
                                height: 23,
                                border: 'none',
                                backgroundColor: 'whitesmoke',
                                color: 'black',
                                fontSize: 12,
                                marginLeft: 10,
                                borderRadius: 10,
                            }}
                        >
                            Bạn bè
                        </button>
                        <button
                            style={{
                                width: 70,
                                height: 23,
                                border: 'none',
                                backgroundColor: 'whitesmoke',
                                color: 'black',
                                fontSize: 12,
                                marginLeft: 10,
                                borderRadius: 10,
                            }}
                        >
                            Trả lời sau
                        </button>
                    </div>
                    <div
                        style={{
                            width: '100%',
                            height: '10%',
                            display: 'flex',
                            borderTop: '1px solid grey',
                        }}
                    >
                        <label
                            style={{
                                fontSize: 13,
                                color: 'black',
                                marginLeft: 10,
                                marginTop: 5,
                                fontWeight: 'bold',
                            }}
                        >
                            Trò chuyện gần đây
                        </label>
                    </div>

                    <div
                        style={{
                            width: '100%',
                            height: '60%',

                            borderBottom: '1px solid grey',
                            overflowY: 'auto',
                        }}
                    >
                        {friend_list.map((friend) => (
                            <div
                                key={friend.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'start',
                                    marginBottom: '20px',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '60%',
                                        border: '3px solid #2596be',
                                        marginRight: '10px',
                                        marginLeft: '10px',
                                    }}
                                    value={friend.friend_id} // Sửa ở đây
                                    disabled={member_list.some(
                                        (member) =>
                                            member.id === friend.friend_id,
                                    )}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFriend_ids([
                                                ...friend_ids,
                                                e.target.value, // Sửa ở đây
                                            ])
                                        } else {
                                            setFriend_ids(
                                                friend_ids.filter(
                                                    (id) =>
                                                        id !== e.target.value, // Sửa ở đây
                                                ),
                                            )
                                        }
                                    }}
                                />

                                <img
                                    src={friend.avatar}
                                    alt={'avatar'}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '60%',
                                        border: '3px solid #2596be',
                                        marginRight: '10px',
                                    }}
                                />
                                <b
                                    style={{
                                        cursor: 'pointer',
                                        color: 'blue',
                                        fontSize: '16px',
                                    }}
                                >
                                    {/* <p>{friend.friendName}</p> */}
                                    <p>
                                        {friend.friendName}
                                        {friend.friend_id === groupLeaderId &&
                                            ' (Trưởng nhóm)'}
                                        {deputyLeaderIds.includes(
                                            friend.friend_id,
                                        ) && ' (Phó nhóm)'}
                                    </p>
                                </b>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            height: '9%',
                            borderRadius: 5,

                            marginTop: '25px',
                        }}
                    >
                        <button
                            style={{
                                // width: '100%',
                                width: '70px',
                                height: '70%',
                                backgroundColor: 'lightgrey',
                                color: 'white',
                                fontSize: '15px',
                                fontWeight: 'bold',
                                border: 'none',
                                marginLeft: '60%',
                                cursor: 'pointer',
                                borderRadius: 5,
                                marginRight: '10px',
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            style={{
                                // width: '100%',
                                width: '90px',
                                height: '70%',
                                backgroundColor: 'blue',
                                color: 'white',
                                fontSize: '15px',
                                fontWeight: 'bold',
                                border: 'none',

                                cursor: 'pointer',
                                borderRadius: 5,
                                marginRight: '10px',
                            }}
                            onClick={() => {
                                handleAddMember()
                            }}
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
                {/* <button
                    style={{
                        backgroundColor: '#2596be',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '5px',
                        border: 'none',
                        cursor: 'pointer',
                        marginBottom: '10px',
                        width: '100%',
                    }}
                    onClick={() => {
                        handleAddMember()
                    }}
                >
                    Thêm thành viên
                </button> */}
            </Modal>
            {/* // modal chức năng hiển thị bên cạnh nút chọn hiển thị các chức năng  */}
            <Modal
                isOpen={isModalOpenEditMember}
                onRequestClose={handleCloseModalEditMember}
                contentLabel="Edit Member Modal"
                style={{
                    content: {
                        position: 'absolute',
                        top: '50%',
                        left: 'calc(50% + 250px)', // Đặt vị trí của modal 100px bên phải so với giữa màn hình
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',

                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                <button
                    style={{
                        backgroundColor: isButtonPressed
                            ? 'lightgray'
                            : 'white',
                    }}
                    onMouseEnter={() => setIsButtonPressed(true)}
                    onMouseDown={() => setIsButtonPressed(true)}
                    onMouseUp={() => setIsButtonPressed(false)}
                    onMouseLeave={() => setIsButtonPressed(false)}
                    onClick={(e) => {
                        handleInfo(e)
                    }}
                >
                    Xem thông tin
                </button>

                <button
                    style={{
                        backgroundColor: isButtonPressed1
                            ? 'lightgray'
                            : 'white',
                    }}
                    onMouseEnter={() => setIsButtonPressed1(true)}
                    onMouseDown={() => setIsButtonPressed1(true)}
                    onMouseUp={() => setIsButtonPressed1(false)}
                    onMouseLeave={() => setIsButtonPressed1(false)}
                    onClick={() => {
                        // handleOpenModalFriend()
                        handleLeaveGroup(currentMemberId)
                    }}
                >
                    Rời nhóm
                </button>
                {isGroupLeader && (
                    <>
                        <button
                            style={{
                                backgroundColor: isButtonPressed3
                                    ? 'lightgray'
                                    : 'white',
                            }}
                            onMouseEnter={() => setIsButtonPressed3(true)}
                            onMouseDown={() => setIsButtonPressed3(true)}
                            onMouseUp={() => setIsButtonPressed3(false)}
                            onMouseLeave={() => setIsButtonPressed3(false)}
                            onClick={() => {
                                handleDeleteMember(currentMemberId) // Sử dụng member_id hiện tại
                            }}
                        >
                            Xoá thành viên
                        </button>

                        <button
                            style={{
                                backgroundColor: isButtonPressed4
                                    ? 'lightgray'
                                    : 'white',
                            }}
                            onMouseEnter={() => setIsButtonPressed4(true)}
                            onMouseDown={() => setIsButtonPressed4(true)}
                            onMouseUp={() => setIsButtonPressed4(false)}
                            onMouseLeave={() => setIsButtonPressed4(false)}
                            onClick={() => {
                                handledisbandGroupWeb()
                            }}
                        >
                            Giải tán nhóm
                        </button>
                        <button
                            style={{
                                backgroundColor: isButtonPressed5
                                    ? 'lightgray'
                                    : 'white',
                            }}
                            onMouseEnter={() => setIsButtonPressed5(true)}
                            onMouseDown={() => setIsButtonPressed5(true)}
                            onMouseUp={() => setIsButtonPressed5(false)}
                            onMouseLeave={() => setIsButtonPressed5(false)}
                            onClick={() => {
                                handleAddDeputyLeader(currentMemberId)
                            }}
                        >
                            Thêm Phó Nhóm
                        </button>
                        <button
                            style={{
                                backgroundColor: isButtonPressed2
                                    ? 'lightgray'
                                    : 'white',
                            }}
                            onMouseEnter={() => setIsButtonPressed2(true)}
                            onMouseDown={() => setIsButtonPressed2(true)}
                            onMouseUp={() => setIsButtonPressed2(false)}
                            onMouseLeave={() => setIsButtonPressed2(false)}
                            onClick={() => {
                                handleDeleteDeputyLeader(currentMemberId)
                            }}
                        >
                            Gỡ quyền phó nhóm
                        </button>
                        <button
                            style={{
                                backgroundColor: isButtonPressed6
                                    ? 'lightgray'
                                    : 'white',
                            }}
                            onMouseEnter={() => setIsButtonPressed6(true)}
                            onMouseDown={() => setIsButtonPressed6(true)}
                            onMouseUp={() => setIsButtonPressed6(false)}
                            onMouseLeave={() => setIsButtonPressed6(false)}
                            onClick={() => {
                                handleAddGroupLeader(currentMemberId)
                            }}
                        >
                            Chuyển quyền trưởng nhóm
                        </button>
                    </>
                )}

                {isDeputyLeader && (
                    <button
                        style={{
                            backgroundColor: isButtonPressed3
                                ? 'lightgray'
                                : 'white',
                        }}
                        onMouseEnter={() => setIsButtonPressed3(true)}
                        onMouseDown={() => setIsButtonPressed3(true)}
                        onMouseUp={() => setIsButtonPressed3(false)}
                        onMouseLeave={() => setIsButtonPressed3(false)}
                        onClick={() => {
                            handleDeleteMember(currentMemberId) // Sử dụng member_id hiện tại
                        }}
                    >
                        Xoá thành viên
                    </button>
                )}
            </Modal>
            {showPopup && (
                <div
                    style={{
                        zIndex: 1000,
                        position: 'fixed',
                        top: '0%',
                        left: '0%',
                        display: 'flex',
                        background: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        width: '100%',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            width: '25%',
                            height: '95%',
                            background: 'white',
                            marginLeft: '70px',
                            padding: '0px',

                            borderRadius: '10px',
                        }}
                    >
                        <span
                            style={{
                                position: 'absolute',
                                top: '1px',
                                right: '5px',
                                cursor: 'pointer',
                                fontSize: '22px',
                                color: 'black',
                                padding: '5px',
                                borderRadius: '50%',

                                backgroundColor: 'white',
                            }}
                            onClick={handleClose}
                        >
                            X
                        </span>

                        {selectedFriend && (
                            <AddPupopYou friend_id={selectedFriend.id} />
                        )}
                        {/* {selectedFriend &&
                            (selectedFriend.id === user_id ? (
                                <SideBar user={user} />
                            ) : (
                                <AddPupopYou friend_id={selectedFriend.id} />
                            ))} */}
                    </div>
                </div>
            )}
            <div
                style={{
                    flex: 'row',
                    width: '100%',
                    flexDirection: 'column',
                    display: 'flex',
                }}
            >
                {/* tesst123 */}
                <div
                    style={{
                        paddingLeft: 10,
                        flex: 'row',
                        width: '100%',
                        display: 'flex',
                    }}
                >
                    <BsStopwatch size="1.3rem" />

                    <label
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        Danh sách nhắc hẹn
                    </label>
                </div>
            </div>
            {!isGroup && (
                <div
                    style={{
                        flex: 'row',
                        width: '100%',
                        borderBottomWidth: 5,
                        borderBottomStyle: 'solid',
                        borderBottomColor: 'whitesmoke',
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            paddingLeft: 10,
                            flex: 'row',
                            width: '100%',
                            display: 'flex',
                        }}
                        onClick={() => {
                            handleOpenModalCommonGroup()
                            //handleButtonMember()
                        }}
                    >
                        <BsPeople size="1.3rem" />

                        <label
                            style={{
                                paddingLeft: 10,
                            }}
                        >
                            {groupCommon} nhóm chung
                        </label>
                    </div>
                </div>
            )}
            <div
                style={{
                    width: '100%',
                    borderBottomWidth: 5,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'whitesmoke',
                    display: 'flex',
                    gap: 10,
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        // padding: 10,
                    }}
                >
                    <label
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        Ảnh/Video
                    </label>
                    {isPhotoVidOpen ? (
                        <label
                            onClick={() => {
                                setPhotoVidOpen(!isPhotoVidOpen)
                            }}
                        >
                            <ImCircleUp size="1rem" />
                        </label>
                    ) : (
                        <label
                            onClick={() => {
                                setPhotoVidOpen(!isPhotoVidOpen)
                            }}
                        >
                            <ImCircleDown size="1rem" />
                        </label>
                    )}
                </div>
                {isPhotoVidOpen && (
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            height: 200,
                            overflowY: 'auto',

                            // justifyContent: 'space-between',
                            // alignContent: 'start',
                        }}
                    >
                        {' '}
                        {/* Danh sách ảnh và video media */}
                        {mediaList.length > 0 &&
                            mediaList.map((media) => (
                                <div
                                    key={media.id}
                                    style={{
                                        flexBasis: '24%',
                                        display: 'flex',
                                        gap: 10,
                                        alignItems: 'center',
                                        marginBottom: 5,
                                        marginRight: 2,
                                        marginLeft: 0.5,
                                    }}
                                >
                                    {/* <img
                                        src={media}
                                        alt="media"
                                        style={{
                                            width: '100%', // make the image take the full width of the parent div
                                            height: 80,
                                            borderRadius: 5,
                                        }}
                                    /> */}
                                    {media.endsWith('.mp4') ? (
                                        <video
                                            src={media}
                                            style={{
                                                width: '100%', // make the video take the full width of the parent div
                                                height: 80,
                                            }}
                                            controls
                                        />
                                    ) : (
                                        <img
                                            src={media}
                                            alt="media"
                                            style={{
                                                width: '100%', // make the image take the full width of the parent div
                                                height: 80,
                                                borderRadius: 5,
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </div>
            <div
                style={{
                    width: '100%',
                    borderBottomWidth: 5,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'whitesmoke',
                    display: 'flex',
                    gap: 10,
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    <label
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        File
                    </label>
                    {isFileOpen ? (
                        <label
                            onClick={() => {
                                setFileOpen(!isFileOpen)
                            }}
                        >
                            <ImCircleUp size="1rem" />
                        </label>
                    ) : (
                        <label
                            onClick={() => {
                                setFileOpen(!isFileOpen)
                            }}
                        >
                            <ImCircleDown size="1rem" />
                        </label>
                    )}
                </div>
                {isFileOpen && (
                    <div
                        style={{
                            paddingLeft: 10,
                            width: '100%',
                            height: 140,
                            // nếu vượt quá thì tạo scrool
                            overflowY: 'auto',
                        }}
                    >
                        {fileList.length > 0 &&
                            fileList.map((file, index) => {
                                // Get the file extension
                                const extension = file.fileName.split('.').pop()

                                return (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            maxWidth: '100%',
                                            marginBottom: 5,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                maxWidth: '20%',
                                            }}
                                        >
                                            <FileIcon
                                                extension={extension}
                                                {...defaultStyles[extension]}
                                                size={30}
                                            />
                                        </div>
                                        {/* <span style={{ marginLeft: 10 }}>
                                            {file.fileName}
                                        </span> */}

                                        <a
                                            style={{ marginLeft: 10 }}
                                            href={file.fileLink}
                                        >
                                            {file.fileName}
                                        </a>
                                    </div>
                                )
                            })}
                    </div>
                )}
            </div>
            <div
                style={{
                    width: '100%',
                    borderBottomWidth: 5,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'whitesmoke',
                    display: 'flex',
                    gap: 10,
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    <label
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        Links
                    </label>
                    {isLinkOpen ? (
                        <label
                            onClick={() => {
                                setLinkOpen(!isLinkOpen)
                            }}
                        >
                            <ImCircleUp size="1rem" />
                        </label>
                    ) : (
                        <label
                            onClick={() => {
                                setLinkOpen(!isLinkOpen)
                            }}
                        >
                            <ImCircleDown size="1rem" />
                        </label>
                    )}
                </div>
                {isLinkOpen && (
                    <div
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        Danh sách link
                    </div>
                )}
            </div>
            <div></div>
        </div>
    )
}

export default ConversationDetail
