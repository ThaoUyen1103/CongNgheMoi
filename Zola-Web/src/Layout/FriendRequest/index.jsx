import SideBar from '../Dashboard/sideBar/index.jsx'
import FriendRQ from './friendrequest.jsx'
import SideBarFriend from '../listFriend/sideBarFriend.jsx'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { BeatLoader } from 'react-spinners'
import Skeleton from 'react-loading-skeleton'
const FriendRequest = () => {
  const [currentFriend, setCurrentFriendProp] = useState(null)
  const [user, setUser] = useState('')
  const [friend_list, setFriendList] = useState([])

  // tạo 1 bién chứa các firend được yêu cầu kết bạn
  const [friendRequest, setFriendRequest] = useState([])
  const didMountRef = useRef(false)
  const [refreshKey, setRefreshKey] = useState(0) // Biến state để trigger refresh
  if (!localStorage.getItem('user_id')) {
    toast.error('Bạn chưa đăng nhập!!!')
    window.location.href = 'http://localhost:3000/login'
  }
  const user_id = localStorage.getItem('user_id').replace(/"/g, '').trim()
  console.log('user_id trong client là: ' + user_id)

  // kiểm tra nếu chưa có user_id ở localStorage thì sẽ trả về trang login

  const fetchUser = () => {
    // Hàm để fetch thông tin người dùng
    axios
      .post('http://localhost:3001/user/findUserByUserID', {
        user_id: user_id,
      })
      .then((response) => {
        if (response.data.message === 'Tìm user thành công!!!') {
          localStorage.setItem('user', JSON.stringify(response.data.user))
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
      // const list_friend = user.friend
      const friendRequest = user.friendRequests
      // const friend_listTest = user.friendTest

      // Lấy mảng friendTest từ user
      const friendTestArray = user.friend

      // Tạo một mảng để lưu thông tin friend
      let friendInfoArray = []

      // Tạo một mảng để lưu tất cả các promises
      let promises = []

      // Lặp qua mỗi đối tượng trong mảng friendTest
      for (let i = 0; i < friendTestArray.length; i++) {
        // Gửi yêu cầu axios với friend_id từ mỗi đối tượng
        let promise = axios
          .post('http://localhost:3001/user/getInfoFriendWeb', {
            friend_id: friendTestArray[i].friend_id,
          })
          .then((response) => {
            if (
              response.data.message === 'Lấy thông tin friend thành công!!!'
            ) {
              // toast.success('Lấy thông tin friend thành công!!!')
              // Thêm thông tin friend vào mảng
              friendInfoArray.push(response.data.friendInfo)
            }
          })
          .catch((error) => {
            console.error(error)
          })

        // Thêm promise vào mảng promises
        promises.push(promise)
      }

      // Chờ tất cả các promises hoàn thành
      Promise.all(promises).then(() => {
        // Cập nhật state với mảng thông tin friend
        setFriendList(friendInfoArray)
      })

      // if (list_friend) {
      //   setFriendList(list_friend)
      // }
      if (friendRequest) {
        setFriendRequest(friendRequest)
      }
    }
  }, [user])

  if (!user) {
    return null
  }
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Toaster toastOptions={{ duration: 3500 }} />
      {/* {user ? <SideBar user={user} /> : <Skeleton count={5} />} */}
      {user && <SideBar user={user} />}
      <SideBarFriend />
      {user && friend_list ? (
        <FriendRQ
          user={user}
          friend_list={friend_list}
          currentFriend={currentFriend}
          friendRequest={friendRequest}
        />
      ) : (
        <Skeleton count={5} />
      )}
    </div>
  )
}

export default FriendRequest
