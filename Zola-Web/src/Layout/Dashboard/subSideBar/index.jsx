import { AiOutlineUserAdd } from 'react-icons/ai'
import { GrSearch } from 'react-icons/gr'
import { AiOutlineUsergroupAdd } from 'react-icons/ai'
import React, { useState } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import PopupBeFriend from './Befriend/popupBeFriend'
import PopupCreateAGroup from './CreateAGroup/popupCreateAGroup'
import AddPopupCreateAGroup from './CreateAGroup/addCreateAGroup'
import AddPopupBeFriend from './Befriend/addPopupBeFriend'
import PopupSearch from './popupSearch'
import AddPopupSearch from './addpopupSearch'
import { useEffect } from 'react'

const SubSideBar = ({
    user,
    friend_list,
    currentFriend,
    setCurrentFriendProp,
    conversationGroup,
    setCurrentConversationGroup,
    setcurrentConversationMyCloud,
    conversationMyCloud,
    setclickCurrentCount,
}) => {
    const navigate = useNavigate()
    // const [currentFriend, setCurrentFriend] = useState(null)
    // lấy đường dẫn ảnh đại diện của người dùng
    const avatarURL = user.avatar
    const [openSearch, setOpenSearch] = useState(false)
    const openPopup = (props) => {
        setOpenSearch(true)
    }
    const closePopup = () => {
        setOpenSearch(!openSearch)
    }
    const [conversation_id, setConversation_id] = useState('')
    const [conversationGroupID, setConversationGroupID] = useState([])
    const conversationMycloud_id = conversationMyCloud?._id

    const [lastMessageMyCloud, setLastMessageMyCloud] = useState('') // Thêm dòng này

    const [lastMessages, setLastMessages] = useState({}) // Sử dụng một đối tượng thay vì một chuỗi

    // kiểm tra néu có conversationGroup thì set setConversationGroupID ở trong mảng conversationGroup
    useEffect(() => {
        if (conversationGroup.length > 0) {
            // gán các giá trị conversationGroup._id vào mảng conversationGroupID
            setConversationGroupID(conversationGroup.map((group) => group._id))
        }
    }, [conversationGroup])
    // nếu có conversationGroupID không rỗng thì gọi alert ra
    // if (conversationGroupID !== '') {
    //     alert(conversationGroupID)
    // }

    // useEffect gọi tới lấy tin nhắn cuối cùng của mỗi cuộc trò chuyện http://localhost:3001/message/getLastMessageWeb

    useEffect(() => {
        if (conversationMycloud_id) {
            axios
                .post('http://localhost:3001/message/getLastMessageWeb', {
                    user_id: user._id,
                    conversation_id: conversationMycloud_id,
                })
                .then((response) => {
                    if (response.data.thongbao === 'Tìm thấy tin nhắn!!!') {
                        setLastMessageMyCloud(response.data.message)
                    }
                })
                .catch((error) => {
                    console.log('error: ', error)
                })
        }
    }, [conversationMycloud_id])


    useEffect(() => {
        if (conversationGroupID !== '') {
            conversationGroupID.map((conversationGroupID) =>
                axios
                    .post('http://localhost:3001/message/getLastMessageWeb', {
                        user_id: user._id,
                        conversation_id: conversationGroupID,
                    })
                    .then((response) => {
                        if (response.data.thongbao === 'Tìm thấy tin nhắn!!!') {
                            setLastMessages((prevMessages) => ({
                                ...prevMessages,
                                [conversationGroupID]: response.data.message,
                            })) // Cập nhật tin nhắn cho cuộc trò chuyện tương ứng
                        }
                    })
                    .catch((error) => {
                        console.log('error: ', error)
                    }),
            )
        }
    }, [conversationGroupID])

    function handleDashboard(friend) {
        setcurrentConversationMyCloud(null)
        setCurrentFriendProp(friend)
        setCurrentConversationGroup(null) // Thêm dòng này
        navigate('/dashboard')
    }
    function handleDashboard2(group) {
        setcurrentConversationMyCloud(null)
        setCurrentConversationGroup(group)
        setCurrentFriendProp(null) // Thêm dòng này
        navigate('/dashboard')
    }

    //function cloud của tôi
    function handleDashboard3(conversationMyCloud) {
        setCurrentFriendProp(null)
        setCurrentConversationGroup(null)
        setcurrentConversationMyCloud(conversationMyCloud)
        setclickCurrentCount((prevCount) => prevCount + 1) // Tăng số lần nhấp
        navigate('/dashboard')
    }

    // useEffect gọi tới lấy tin nhắn gần nhất http://localhost:3001/message/getLastMessageWeb
    const [OpenBeFriend, setOpenBeFriend] = useState(false)
    const [OpenCreateAGroup, setOpenCreateAGroup] = useState(false)
    console.log('OpenCreateAGroup', OpenCreateAGroup)
    const handleInputChange = (event) => {
        const searchValue = event.target.value

        if (searchValue.length >= 10) {
            console.log('searchValue: ', searchValue)
            axios
                .post('http://localhost:3001/user/findUserByPhoneWeb', {
                    phoneNumber: searchValue,
                })
                .then((res) => {
                    if (res.data.message === 'Không tìm thấy user!!!') {
                        toast.error('Số điện thoại chưa được đăng ký!!!')
                        return
                    }
                    if (res.data.message === 'Tìm user thành công!!!') {
                        toast.success('Tìm user thành công!!!')
                        // lưu thông tin user vào localStorage
                        localStorage.setItem(
                            'userFindBySearch',
                            JSON.stringify(res.data.user),
                        )
                        const userFindBySearch =
                            localStorage.getItem('userFindBySearch')
                        // console.log('userFindBySearch: ', userFindBySearch)
                    }
                })
                .catch((err) => {
                    console.log('err: ', err)
                })
        }
    }

    return (
        <div
            style={{
                width: '25%',
                height: '100%',
                backgroundColor: 'white',
                borderRight: '1px solid black',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 25,
                    height: '3%',
                }}
            >
                <Toaster toastOptions={{ duration: 3500 }} />
                <div
                    style={{
                        display: 'flex',
                        height: '100%',
                        backgroundColor: 'whitesmoke',
                        width: '100%',
                        marginLeft: 20,
                        borderRadius: 10,
                        gap: 5,
                        border: '1px solid black',
                    }}
                >
                    <div style={{ marginLeft: 10, marginTop: 2 }}>
                        <GrSearch size="1rem" />
                    </div>

                    <input
                        style={{
                            width: '100%',
                            height: '90%',
                            alignItems: 'center',
                            borderRadius: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            border: 'none',
                            backgroundColor: 'whitesmoke',
                            outline: 'none',
                        }}
                        onClick={() => {
                            setOpenSearch(!openSearch)
                        }}
                        type="text"
                        placeholder="Tìm kiếm "
                        // value={searchValue}
                        onChange={handleInputChange}
                    />
                </div>
                {openSearch && (
                    <PopupSearch
                        content={<AddPopupSearch />}
                        handleClose={() => {
                            setOpenSearch(!openSearch)
                        }}
                    />
                )}
                <div
                    onClick={() => {
                        setOpenBeFriend(!OpenBeFriend)
                    }}
                >
                    <AiOutlineUserAdd size="1.3rem" />
                </div>
                {OpenBeFriend && (
                    <PopupBeFriend
                        content={<AddPopupBeFriend />}
                        handleClose={() => {
                            setOpenBeFriend(!OpenBeFriend)
                        }}
                    />
                )}
                <div
                    onClick={() => {
                        setOpenCreateAGroup(!OpenCreateAGroup)
                    }}
                >
                    <AiOutlineUsergroupAdd size="1.4rem" />
                </div>
            </div>
            {OpenCreateAGroup && (
                <PopupCreateAGroup
                    content={<AddPopupCreateAGroup />}
                    handleClose={() => {
                        setOpenCreateAGroup(!OpenCreateAGroup)
                    }}
                    setOpenCreateAGroup={setOpenCreateAGroup}
                />
            )}
            <div
                style={{
                    width: '100%',
                    height: '100%',
                
                    gap: 10,
                    overflowY: 'auto',
                    paddingBottom: 100,
                    scrollbarWidth: 'thin', // Đặt chiều rộng của thanh cuộn
                    scrollbarColor: '#888 #f5f5f5', 
                    
                }}
            >
                {/* My  cloud của tôi */}
                <button
                    style={{
                        border: 'none',
                        backgroundColor: 'white', // Đặt màu nền mặc định
                        // backgroundColor: 'whitesmoke',
                        display: 'flex',
                        gap: 10,
                        width: '90%',
                        height: 55,
                        alignItems: 'center',
                        margin: 17,
                        
                        
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#ebf5f6'
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                    }}
                    onClick={() => handleDashboard3(conversationMyCloud)}
                >
                    {conversationMyCloud && (
                        <button
                            style={{
                                border: 'none',
                                display: 'flex',
                                gap: 10,
                                width: '100%',
                                height: 55,
                                alignItems: 'center',
                                
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#ebf5f6'
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent'
                            }}
                            onClick={() => handleDashboard3(conversationMyCloud)}
                        >
                            <img
                                src={conversationMyCloud.avatar}
                                alt="demo"
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 30,
                                    backgroundColor: 'grey',
                                    border: '3px solid #2596be',
                                }}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 5,
                                }}
                            >
                                <label
                                    style={{
                                        fontSize: 15,
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                    }}
                                >
                                    {Array.isArray(conversationGroup) && conversationGroup.length > 0 ? (
                                        conversationGroup.map((conversation, index) => {
                                            if (!conversation || !conversation.conversationName) return null
                                            return (
                                                <b>{conversationMyCloud?.conversationName || 'Cloud của tôi'}</b>

                                            )
                                        })
                                    ) : (
                                        <div >Cloud của tôi</div>
                                    )}

                                    {/* Cloud của tôi    */}
                                </label>
                                <label
                                    style={{
                                        fontSize: 13,
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        maxWidth: 'maxContent',
                                    }}
                                >
                                    {lastMessageMyCloud}
                                </label>
                            </div>
                        </button>
                    )}


                    {/* <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 5,
                        }}
                    >
                        <label
                            style={{
                                fontSize: 15,
                                display: 'flex',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <b>{conversationMyCloud.conversationName}</b>
                        </label>
                        <label
                            style={{
                                fontSize: 13,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                maxWidth: 'maxContent',
                                // backgroundColor: 'red',
                            }}
                        >
                            {lastMessageMyCloud}
                        </label>
                    </div> */}
                </button>
                {friend_list.map((friend) => (
                    <button
                        style={{
                            border: 'none',
                            // backgroundColor: 'whitesmoke',
                            backgroundColor: 'transparent', // Đặt màu nền mặc định
                            display: 'flex',
                            gap: 10,
                            width: '90%',
                            height: 55,
                            alignItems: 'center',
                            margin: 17,
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#ebf5f6'
                        }} // Thay đổi màu nền khi di chuột vào
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent'
                        }} // Khôi phục màu nền khi di chuột rời khỏi
                        onClick={() => handleDashboard(friend)}
                    >
                        <img
                            src={friend.avatar}
                            alt="demo"
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 30,
                                backgroundColor: 'grey',
                                border: '3px solid #2596be',
                            }}
                        />
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 5,
                            }}
                        >
                            <label
                                style={{
                                    fontSize: 15,
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <b>{friend.friendName}</b>
                            </label>
                            <label
                                style={{
                                    fontSize: 13,
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    overflow: 'hidden', // Ẩn phần vượt quá width
                                    whiteSpace: 'nowrap', // Ngăn không cho text xuống dòng
                                    textOverflow: 'ellipsis', // Hiển thị dấu "..." nếu vượt quá width
                                    maxWidth: 'maxContent',
                                }}
                            >
                                chào bạn 345
                            </label>
                        </div>
                    </button>
                ))}

                {conversationGroup.map((group) => (
                    <button
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            display: 'flex',
                            gap: 10,
                            width: '90%',
                            height: 55,
                            alignItems: 'center',
                            margin: 17,
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#ebf5f6'
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent'
                        }}
                        onClick={() => handleDashboard2(group)}
                    >
                        <img
                            src={group.avatar}
                            alt="demo"
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 30,
                                backgroundColor: 'grey',
                                border: '3px solid #2596be',
                            }}
                        />
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 5,
                            }}
                        >
                            <label
                                style={{
                                    fontSize: 15,
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <b>{group.conversationName}</b>
                            </label>
                            <label
                                style={{
                                    fontSize: 13,
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 'maxContent',
                                }}
                            >
                                {lastMessages[group._id]}{' '}
                                {/* Hiển thị tin nhắn cuối cùng của cuộc trò chuyện tương ứng */}
                            </label>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default SubSideBar
