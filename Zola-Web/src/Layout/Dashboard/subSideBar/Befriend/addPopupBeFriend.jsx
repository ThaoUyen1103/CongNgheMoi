import React, { useState, useEffect } from 'react'
import PhoneInput from 'react-phone-input-2'
import '../../../Login/Receiveotp.css'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'

const AddPopupBeFriend = (props) => {
  const [phoneSearch, setphoneSearch] = useState('')
  const [OpenBeFriend, setOpenBeFriend] = useState(false)
  const [isUserFound, setIsUserFound] = useState(false)
  const [addFriend, setAddFriend] = useState('Kết Bạn')
  const user_id = localStorage.getItem('user_id').replace(/"/g, '').trim()
  const openPopup = (props) => {
    setOpenBeFriend(true)
  }
  const closePopup = () => {
    setOpenBeFriend(!OpenBeFriend)
  }
  // const userFindBySearch = JSON.parse(localStorage.getItem('userFindBySearch'))
  // const [userFindBySearch, setUserFindBySearch] = useState(
  //   JSON.parse(localStorage.getItem('userFindBySearch'))
  // )
  const [userFindBySearch, setUserFindBySearch] = useState()
  useEffect(() => {
    const updateUser = () => {
      setUserFindBySearch(JSON.parse(localStorage.getItem('userFindBySearch')))
    }

    window.addEventListener('storage', updateUser)

    return () => {
      window.removeEventListener('storage', updateUser)
    }
  }, [])
  const handSearchFriend = (e) => {
    e.preventDefault()

    // kiểm tra rỗng và có đúng định dạng số điện thoại không
    if (phoneSearch === '') {
      toast.error('Vui lòng nhập số điện thoại!!!')
      return
    }
    // chuyển hết phone từ định dạng +840367909181 hoặc +84367909181 về dạng 0367909181
    let phoneNumberFormat // Khai báo biến ở mức độ phạm vi toàn cục
    if (phoneSearch.startsWith('+84')) {
      // Kiểm tra xem số điện thoại có đúng định dạng +84XXXXXXXXX không
      const regex = /^\+84\d{9}$/ // Biểu thức chính quy để kiểm tra
      if (regex.test(phoneSearch)) {
        phoneNumberFormat = phoneSearch.replace('+84', '0') // Thay thế +84 bằng 0
      } else {
        phoneNumberFormat = phoneSearch.replace('+840', '0') // Thay thế +840 bằng 0
      }
    }
    axios
      .post('http://localhost:3001/user/findUserByPhoneWeb', {
        phoneNumber: phoneNumberFormat,
      })
      .then((response) => {
        if (response.data.message === 'Không tìm thấy user!!!') {
          toast.error('Số điện thoại chưa được đăng ký tài khoản !!!')
          return
        } else if (response.data.message === 'Tìm user thành công!!!') {
          toast.success('Tìm user thành công!!!')
          // lưu thông tin user vào localStorage
          localStorage.setItem(
            'userFindBySearch',
            JSON.stringify(response.data.user)
            // setUserFindBySearch(JSON.stringify(response.data.user)),
          )
          setUserFindBySearch(response.data.user)
          setIsUserFound(true)
        } else {
          setIsUserFound(false) // Cập nhật state
        }
      })
  }
  const handAddFriend = (e) => {
    // tiến hành đổi tên button thành "Thu hồi lời mời kết bạn"
    setAddFriend(addFriend === 'Kết Bạn' ? 'Huỷ lời mời kết bạn' : 'Kết Bạn')

    // lấy id của userFindBySearch
    const friend_id = userFindBySearch._id

    // Nếu mà addFriend = "Kết Bạn" thì thực hiện axios sau
    if (addFriend === 'Kết Bạn') {
      axios
        .post('http://localhost:3001/user/sendFriendRequestWeb', {
          user_id: user_id,
          friend_id: friend_id,
        })
        .then((response) => {
          if (response.data.message === 'Gửi yêu cầu kết bạn thành công!!!') {
            toast.success('Kết bạn thành công!!!')
          } else {
            toast.error('Kết bạn thất bại!!!')
          }
        })
    } else if (addFriend === 'Huỷ lời mời kết bạn') {
      axios
        .post('http://localhost:3001/user/cancelFriendRequestWeb', {
          user_id: user_id,
          friend_id: friend_id,
        })
        .then((response) => {
          if (response.data.message === 'Huỷ lời mời kết bạn thành công!!!') {
            toast.success('Huỷ yêu cầu kết bạn thành công!!!')
          } else {
            toast.error('Huỷ yêu cầu kết bạn thất bại!!!')
          }
        })
    }
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
          height: '10%',
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
          Thêm bạn
        </label>
      </div>
      <div
        style={{
          width: '100%',
          height: '13%',
          // display: 'flex',
          borderBottom: '1px solid grey',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        {/* <input
          style={{
            width: '65%',
            height: '50%',
            alignItems: 'center',

            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            border: 'none',
            backgroundColor: 'white',
            outline: 'none',
            borderBottom: '1px solid grey',
            marginLeft: '35%',
            marginTop: '3%',
            fontSize: 12
          }}
          type="text"
          placeholder="Số điện thoại "
          // value={searchValue}
        /> */}

        <PhoneInput
          country={'vn'}
          // sx={{
          //   width: '-webkit-fill-available',
          // }}
          className="friendinput"
          onChange={(phone) => setphoneSearch('+' + phone)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault() // Ngăn chặn hành động mặc định của phím "Enter"
              handSearchFriend(e)
              // onSignUp() // Gọi hàm onSignUp khi nhấn phím "Enter"
            }
          }}
          // onKeyPress={(e) => {
          //   if (e.key === 'Enter') {
          //     e.preventDefault() // Prevents form submission
          //     handSearchFriend(e)
          //   }
          // }}

          // kích hoạt sự kiện khi nhấn Enter
        />
      </div>
      <div
        style={{
          width: '100%',
          height: '10%',
          display: 'flex',
        }}
      >
        <label
          style={{
            fontSize: 12,
            color: 'grey',
            marginLeft: 10,
            marginTop: 20,
          }}
        >
          Kết quả gần nhất
        </label>
      </div>
      {isUserFound && (
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
          // onMouseEnter={(e) => {
          //   e.target.style.backgroundColor = '#ebf5f6'
          // }} // Thay đổi màu nền khi di chuột vào
          // onMouseLeave={(e) => {
          //   e.target.style.backgroundColor = 'transparent'
          // }} // Khôi phục màu nền khi di chuột rời khỏi
          // // onClick={() => handleDashboard(friend)}
        >
          <img
            src={userFindBySearch.avatar}
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
              <b>{userFindBySearch.userName}</b>
            </label>
            <p>{userFindBySearch.phoneNumber}</p>
          </div>
          <button
            style={{
              // backgroundColor: 'blue',
              // borderRadius: 5,
              // color: 'white',
              // marginRight: 'auto',
              width: 'max-content',
              height: 'max-content',
              padding: '3px',
              backgroundColor: 'blue',
              color: 'white',
              fontSize: '15px',
              marginLeft: 'auto',
              cursor: 'pointer',
              borderRadius: 5,
              marginRight: '10px',
            }}
            onClick={(e) => handAddFriend(e)}
          >
            {addFriend}
          </button>
        </button>
      )}

      <div
        style={{
          width: '100%',
          height: '54%',
          display: 'flex',
          borderBottom: '1px solid grey',
        }}
      ></div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height:
            '10%' /* Đặt chiều cao của inner div là 10% của chiều cao của div cha */,
          borderRadius: 5,
          // backgroundColor: 'lightblue',
          marginTop: '5px',
          marginBottom: '5px',
        }}
      >
        <button
          style={{
            // width: '100%',
            width: '100px',
            height: '100%',
            backgroundColor: 'blue',
            color: 'white',
            fontSize: '15px',
            fontWeight: 'bold',
            border: 'none',
            marginLeft: 'auto',
            cursor: 'pointer',
            borderRadius: 5,
            marginRight: '10px',
          }}
          onClick={(e) => handSearchFriend(e)}
        >
          Tìm Kiếm
        </button>
      </div>
    </div>
  )
}
export default AddPopupBeFriend
