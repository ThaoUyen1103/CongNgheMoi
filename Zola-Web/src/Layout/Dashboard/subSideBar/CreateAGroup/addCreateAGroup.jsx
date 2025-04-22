import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { FaCamera } from 'react-icons/fa'
import { GrSearch } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom'
import '../../../Login/Receiveotp.css'
import { io } from 'socket.io-client'

// Tạo nhóm chat
const AddPopupCreateAGroup = ({ setOpenCreateAGroup }) => {
    const navigate = useNavigate()

    const [activeButton, setActiveButton] = useState(null)

    const handleButtonClick = (buttonIndex) => {
        setActiveButton(buttonIndex)
    }
    const [phoneSearch, setphoneSearch] = useState('')
    const [isUserFound, setIsUserFound] = useState(false)
    const [addFriend, setAddFriend] = useState('Kết Bạn')
    const user_id = localStorage.getItem('user_id').replace(/"/g, '').trim()
    const socket = io('http://localhost:3001')
    const openPopup = (props) => {
        setOpenCreateAGroup(true)
    }
    const closePopup = (props) => {
        setOpenCreateAGroup(false)
    }

    const handleClose = () => {
        setOpenCreateAGroup(false)
    }
    const didMountRef = useRef(false)
    const [refreshKey, setRefreshKey] = useState(0) // Biến state để trigger refresh
    const [friend_list, setFriendList] = useState([])
    const [user, setUser] = useState('')
    const [conversationName, setConversationName] = useState('')

    useEffect(() => {
        // Đặt giá trị mới cho refreshKey mỗi khi component render lại
        setRefreshKey((oldKey) => oldKey + 1)
    }, [])

    // tạo 1 mảng friend_ids
    const [friend_ids, setFriend_ids] = useState([])
    const [selectedFriends, setSelectedFriends] = useState([])

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
    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true
            return
        }
        fetchUser()
    }, [refreshKey])

    useEffect(() => {
        const fetchFriends = async () => {
            if (!user) {
                console.log('Không tìm thấy người dùng!!!')
            } else {
                const friendTestArray = user.friend
                let friendInfoArray = []
                let promises = []

                for (let i = 0; i < friendTestArray.length; i++) {
                    let promise = axios
                        .post('http://localhost:3001/user/getInfoFriendWeb', {
                            friend_id: friendTestArray[i].friend_id,
                        })
                        .then((response) => {
                            if (
                                response.data.message ===
                                'Lấy thông tin friend thành công!!!'
                            ) {
                                friendInfoArray.push(response.data.friendInfo)
                            }
                        })
                        .catch((error) => {
                            console.error(error)
                        })

                    promises.push(promise)
                }

                await Promise.all(promises)
                setFriendList(friendInfoArray)
            }
        }

        fetchFriends()
    }, [user])
    if (!user && !friend_list) {
        return null
    }
    const handleCreateGroup = () => {
        let finalConversationName = conversationName

        if (conversationName === '') {
            // nếu conversationName rỗng thì sẽ lấy tên của các friend được chọn bằng check box cách nhau bởi dấu phẩy
            finalConversationName = friend_ids
                .map((id) => {
                    // Tìm friend có friend_id tương ứng
                    const friend = friend_list.find(
                        (friend) => friend.friend_id === id,
                    )
                    // Trả về tên của friend
                    return friend ? friend.friendName : ''
                })
                .join(', ') // Nối tên các friend lại với nhau bằng dấu phẩy
        }

        axios
            .post(
                'http://localhost:3001/conversation/createConversationsGroupWeb',
                {
                    user_id: user_id,
                    conversationName: finalConversationName,
                    friend_ids: friend_ids,
                },
            )
            .then((response) => {
                if (
                    response.data.message ===
                    'Tạo conversationGroup thành công!!!'
                ) {
                    toast.success('Tạo nhóm thành công!!!')
                    // navigate('/dashboard')
                    handleClose()
                    
                    setRefreshKey((oldKey) => oldKey + 1)
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }

    return (
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
                    Tạo nhóm
                </label>
            </div>
            <div
                style={{
                    width: '100%',
                    height: '10%',

                    display: 'flex',
                    marginTop: 5,
                    flexDirection: 'row',
                }}
            >
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        marginLeft: 10,
                        marginTop: 5,
                        border: '1px solid #aaacad',
                    }}
                >
                    <FaCamera size="1.3rem" />
                </div>
                <input
                    style={{
                        width: '82%',
                        height: '50%',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        border: 'none',
                        backgroundColor: 'white',
                        outline: 'none',
                        borderBottom: '1px solid grey',
                        marginLeft: 10,
                        marginTop: '3%',
                        fontSize: 12,
                    }}
                    type="text"
                    placeholder="Nhập tên nhóm "
                    value={conversationName}
                    onChange={(e) => setConversationName(e.target.value)}
                />
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
                        height: '80%',
                        backgroundColor: 'white',
                        width: '95%',
                        marginLeft: 10,
                        borderRadius: 20,
                        gap: 5,
                        border: '1px solid lightgrey',
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
                    display: 'flex', // Thêm dòng này
                    width: '100%',
                    height: '60%',

                    borderBottom: '1px solid grey',
                    overflowY: 'auto',
                }}
            >
                <div
                    style={{
                        flex: 1, // Thêm dòng này
                        overflowY: 'auto', // Thêm dòng này nếu bạn muốn cuộn trong div này
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
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFriend_ids([
                                            ...friend_ids,
                                            e.target.value, // Sửa ở đây
                                        ])
                                        setSelectedFriends([
                                            ...selectedFriends,
                                            friend,
                                        ]) // Thêm bạn bè vào danh sách đã chọn
                                    } else {
                                        setFriend_ids(
                                            friend_ids.filter(
                                                (id) => id !== e.target.value, // Sửa ở đây
                                            ),
                                        )
                                        setSelectedFriends(
                                            selectedFriends.filter(
                                                (selectedFriend) =>
                                                    selectedFriend.id !==
                                                    friend.id,
                                            ),
                                        ) // Loại bỏ bạn bè khỏi danh sách đã chọn
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
                                <p>{friend.friendName}</p>
                            </b>
                        </div>
                    ))}
                </div>
                {/* <div
                    style={{
                        flex: 1, // Thêm dòng này

                        // backgroundColor: 'orange',
                    }}
                >
                    <p
                        style={{
                            fontSize: '14px',
                            color: 'black',
                            marginLeft: '10px',
                            marginBottom: '10px',
                        }}
                    >
                        Đã chọn
                    </p>
                    {selectedFriends.map((friend) => (
                        <div
                            key={friend.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'start',
                                borderRadius: '10%',
                                width: 'max-content',
                                marginBottom: '20px',
                                // border: '1px solid lightblue',
                            }}
                        >
                            <img
                                src={friend.avatar}
                                alt={'avatar'}
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '60%',
                                    marginLeft: '10px',
                                    marginRight: '10px',
                                }}
                            />
                            <p
                                style={{
                                    color: '#206BDC',
                                    fontSize: '14px',
                                }}
                            >
                                {friend.friendName}
                            </p>
                        </div>
                    ))}
                </div> */}
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
                    onClick={handleClose}
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
                    onClick={handleCreateGroup}
                >
                    Tạo nhóm
                </button>
            </div>
        </div>
    )
}
export default AddPopupCreateAGroup
