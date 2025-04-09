import React, { useState } from 'react'
import { CiMail } from 'react-icons/ci'
import axios from 'axios'
import { useEffect, useRef } from 'react'
import { toast, Toaster } from 'react-hot-toast'

const FriendRQ = () => {
    const [names, setNames] = useState([])

    const sortNames = () => {
        const sortedNames = [...names].sort((a, b) => a.localeCompare(b))
        setNames(sortedNames)
    }
    const [currentFriend, setCurrentFriendProp] = React.useState(null)
    const [user, setUser] = useState('')
    const [friend_list, setFriendList] = useState([])

    // tạo 1 bién chứa các firend được yêu cầu kết bạn
    const [friendRequest, setFriendRequest] = useState([])
    const [sentFriendRequests, setSentFriendRequests] = useState([])
    const didMountRef = useRef(false)
    const [refreshKey, setRefreshKey] = useState(0) // Biến state để trigger refresh
    if (!localStorage.getItem('user_id')) {
        toast.error('Bạn chưa đăng nhập!!!')
        window.location.href = 'http://localhost:3000/login'
    }
    const user_id = localStorage.getItem('user_id').replace(/"/g, '').trim()
    console.log('user_id trong client là: ' + user_id)

    // handle huỷ yêu cầu
    const handleCancelFriendRQ = (e, friendId) => {
        axios
            .post('http://localhost:3001/user/cancelFriendRequestWeb', {
                user_id: user_id,
                friend_id: friendId,
            })
            .then((response) => {
                if (
                    response.data.message ===
                    'Huỷ lời mời kết bạn thành công!!!'
                ) {
                    toast.success('Huỷ yêu cầu kết bạn thành công!!!')
                    setRefreshKey((oldKey) => oldKey + 1)
                } else {
                    toast.error('Huỷ yêu cầu kết bạn thất bại!!!')
                }
            })
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
    useEffect(() => {
        // Đặt giá trị mới cho refreshKey mỗi khi component render lại
        setRefreshKey((oldKey) => oldKey + 1)
    }, [])

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true
            return
        }
        fetchUser()
    }, [refreshKey])

    useEffect(() => {
        if (!user) {
            console.log('Không tìm thấy người dùng!!!')
        } else {
            const list_friend = user.friend
            const friendRequest = user.friendRequests
            const sentFriendRequests = user.sentFriendRequests
            if (list_friend) {
                setFriendList(list_friend)
            }
            let fetchFriendRequests
            let fetchSentFriendRequests
            if (friendRequest) {
                // setFriendRequest(friendRequest)
                fetchFriendRequests = async () => {
                    try {
                        const response = await axios.get(
                            `http://localhost:3001/user/friend-request/${user_id}`,
                        )
                        if (response.status === 200) {
                            const friendRequestsData = response.data.map(
                                (friendRequest) => ({
                                    _id: friendRequest._id,
                                    userName: friendRequest.userName,
                                    phoneNumber: friendRequest.phoneNumber,
                                    avatar: friendRequest.avatar,
                                }),
                            )
                            setFriendRequest(friendRequestsData)
                        }
                    } catch (error) {
                        console.log('error message', error)
                    }
                }
            }
            // nếu mảng sentFriendRequests >0 thì gọi hàm fetchSentFriendRequests

            if (sentFriendRequests) {
                fetchSentFriendRequests = async () => {
                    try {
                        const response = await axios.get(
                            `http://localhost:3001/user/getSentFriendRequests/${user_id}`,
                        )
                        if (response.status === 200) {
                            const sentFriendRequestsData = response.data.map(
                                (sentFriendRequest) => ({
                                    _id: sentFriendRequest._id,
                                    userName: sentFriendRequest.userName,
                                    phoneNumber: sentFriendRequest.phoneNumber,
                                    avatar: sentFriendRequest.avatar,
                                }),
                            )
                            setSentFriendRequests(sentFriendRequestsData)
                        }
                    } catch (error) {
                        console.log('error message', error)
                    }
                }
            }
            fetchFriendRequests()
            fetchSentFriendRequests()
            // alert(sentFriendRequests)

            //alert(friendRequestsData)
        }
    }, [user])

    if (!user) {
        return null
    }
    console.table(user)
    console.log('friendRequest là : ' + friendRequest)
    console.log(
        'Kiểm tra xem friendRequest có phải là mảng không: ' +
            Array.isArray(friendRequest),
    )
    const handleDeleteFriendRQ = (e, friendId) => {
        axios
            .post('http://localhost:3001/user/deleteFriendRequestWeb', {
                user_id: user_id,
                friend_id: friendId,
            })
            .then((response) => {
                if (
                    response.data.message ===
                    'Từ chối lời mời kết bạn thành công!!!'
                ) {
                    toast.success('Từ chối lời mời kết bạn thành công!!!')
                    setRefreshKey((oldKey) => oldKey + 1)
                    // window.location.reload()
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }
    const handleAccpectFriendRQ = (e, friendId) => {
        axios
            .post('http://localhost:3001/user/acceptFriendRequestWeb', {
                user_id: user_id,
                friend_id: friendId,
            })
            .then((response) => {
                if (
                    response.data.message === 'Đã chấp nhận yêu cầu kết bạn!!!'
                ) {
                    toast.success('Đã chấp nhận yêu cầu kết bạn!!!')
                    setRefreshKey((oldKey) => oldKey + 1)
                    window.location.reload()
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
                backgroundColor: 'whitesmoke',
            }}
        >
            <Toaster toastOptions={{ duration: 3500 }} />
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
                <div
                    style={{
                        display: 'flex',
                        gap: 15,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginLeft: 20,
                    }}
                >
                    <label>
                        <CiMail size="1.5rem" />
                    </label>
                    <label
                        style={{
                            fontSize: 18,
                        }}
                    >
                        Lời mời kết bạn
                    </label>
                </div>
            </div>

            <div
                style={{
                    width: '100%',
                    height: 60,
                    backgroundColor: 'whitesmoke',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <label style={{ fontSize: 15, marginLeft: 15 }}>
                    Lời mời đã nhận ({friendRequest.length})
                </label>
            </div>
            <div
                style={{
                    width: '98%',
                    height: 610,
                    backgroundColor: 'white',
                    display: 'flex',
                    margin: 'auto',
                    // justifyContent: 'space-between',
                    flexDirection: 'column', // Thay đổi ở đây
                }}
            >
                <div
                    style={{
                        width: '100%',
                        // height: 50,
                        height: '40%',
                        // backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        // display: 'flex',
                        gap: 10,
                        marginLeft: 10,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 20,
                    }}
                >
                    {friendRequest.map((friend) => (
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
                                outline: 'none',
                            }}
                        >
                            <img
                                src={friend.avatar}
                                // src="https://zolabk.s3.ap-southeast-1.amazonaws.com/tinh-1711801870350.jpg"
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
                                    {/* <b>{userFindBySearch.userName}</b> */}
                                    <b>{friend.userName}</b>
                                </label>
                                <p>{friend.phoneNumber}</p>
                            </div>

                            <button
                                style={{
                                    width: 'max-content',
                                    height: 'max-content',
                                    padding: '5px',
                                    backgroundColor: '#de1212',
                                    color: 'white',
                                    fontSize: '15px',
                                    marginLeft: 'auto',
                                    cursor: 'pointer',
                                    borderRadius: 5,
                                    marginRight: '10px',
                                    outline: 'none',
                                }}
                                onClick={(e) =>
                                    handleDeleteFriendRQ(e, friend._id)
                                }
                            >
                                Bỏ Qua
                            </button>

                            <button
                                style={{
                                    width: 'max-content',
                                    height: 'max-content',
                                    padding: '5px',
                                    backgroundColor: 'blue',
                                    color: 'white',
                                    fontSize: '15px',
                                    // marginLeft: 'auto',
                                    cursor: 'pointer',
                                    borderRadius: 5,
                                    marginRight: '10px',
                                    outline: 'none',
                                }}
                                onClick={(e) =>
                                    handleAccpectFriendRQ(e, friend._id)
                                }
                            >
                                Kết Bạn
                            </button>
                        </button>
                    ))}
                </div>

                <div
                    style={{
                        width: '100%',
                        // height: 50,
                        height: '60%',
                        //  backgroundColor: 'yellow',
                        // display: 'flex',
                        gap: 10,
                        marginLeft: 10,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 20,
                        // nếu vượt quá thì sẽ scroll theo chiều Y
                        overflowY: 'scroll',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: 40,
                            backgroundColor: 'whitesmoke',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <label style={{ fontSize: 15, marginLeft: 15 }}>
                            Lời mời bạn đã gửi ({sentFriendRequests.length})
                        </label>
                    </div>
                    {sentFriendRequests.map((friend) => (
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
                                outline: 'none',
                            }}
                        >
                            <img
                                src={friend.avatar}
                                // src="https://zolabk.s3.ap-southeast-1.amazonaws.com/tinh-1711801870350.jpg"
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
                                    {/* <b>{userFindBySearch.userName}</b> */}
                                    <b>{friend.userName}</b>
                                </label>
                                <p>{friend.phoneNumber}</p>
                            </div>

                            <button
                                style={{
                                    width: 'max-content',
                                    height: 'max-content',
                                    padding: '5px',
                                    backgroundColor: '#E9EDEF',

                                    fontSize: '15px',
                                    marginLeft: 'auto',
                                    cursor: 'pointer',
                                    borderRadius: 5,
                                    marginRight: '10px',
                                    outline: 'none',
                                    color: 'black',
                                }}
                                onClick={(e) =>
                                    handleCancelFriendRQ(e, friend._id)
                                }
                            >
                                <b>Huỷ yêu cầu</b>
                            </button>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
export default FriendRQ
