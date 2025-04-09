import React, { useState, useEffect } from 'react'
import { AiOutlineEdit } from 'react-icons/ai'
import demo from '../../../Assets/demo.jpg'
import { BsPeople } from 'react-icons/bs'
import { TiBusinessCard } from 'react-icons/ti'
import { MdBlock } from 'react-icons/md'
import { LuAlertTriangle } from 'react-icons/lu'
import { FaRegTrashAlt } from 'react-icons/fa'
import PopupYou from './pupopYou'
import PopupStranger from './pupopStranger'
import axios from 'axios'
import toast from 'react-hot-toast'
const AddPupopYou = ({ friend_id }) => {
  const [friendDetails, setFriendDetails] = useState('')
  //const friend_id = localStorage.getItem('friend_id')
  // alert('Friend là : ', friend)
  useEffect(() => {
    if (friend_id) {
      // alert('Có friend nha')
      // alert('Friend là : ', friend)
      axios
        .post(`http://localhost:3001/user/findUserByUserID`, {
          user_id: friend_id,
        })
        .then((response) => {
          if (response.data.message === 'Tìm user thành công!!!') {
            localStorage.setItem(
              'friendDetails',
              JSON.stringify(response.data.user)
            )
            const friendDetails = JSON.parse(
              localStorage.getItem('friendDetails')
            )
            setFriendDetails(friendDetails)
          }
        })
        .catch((error) => {
          console.error('There was an error!', error)
        })
    } else {
      alert('Không có friend')
    }
  }, [friend_id])
  // alert(friendDetails)

  const [openInfoYou, setOpenInfoYou] = useState(false)
  return (
    // <PopupYou
    //   content={
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 30,
          display: 'flex',
          gap: 10,
          marginLeft: 15,
          marginTop: 7,
        }}
      >
        <label
          style={{
            color: 'black',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          Thông tin tài khoản
        </label>
      </div>
      <div
        style={{
          width: '100%',
          height: '25%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <img
          src={demo}
          alt="demo"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'grey',
            position: 'relative',
          }}
        />
        <div
          style={{
            width: '100%',
            height: 30,
            display: 'flex',
            gap: 10,
            marginLeft: 10,
          }}
        >
          <div
            style={{
              width: '5%',
              height: '20%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <img
              src={friendDetails.avatar}
              // src=""
              alt="demo"
              style={{
                width: 70,
                height: 70,
                backgroundColor: 'grey',
                borderRadius: '50%',
                position: 'absolute',
                top: '28%',
                left: '5%',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              width: '100%',
              height: 30,
              gap: 10,

              marginTop: 10,
            }}
          >
            <label
              style={{
                color: 'black',
                fontSize: 17,
                marginLeft: '20%',
                fontWeight: 'bold',
              }}
            >
              {friendDetails.userName}
            </label>
            <label
              style={{
                width: 25,
                height: 25,
                borderRadius: 100,

                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <AiOutlineEdit size="1.3rem" />
            </label>
          </div>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '2%',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '14%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <button
            style={{
              backgroundColor: 'whitesmoke',
              color: 'black',
              border: '1px solid lightgrey',
              borderRadius: 5,
              width: '40%',
              height: 28,
              marginTop: 10,

              display: 'flex',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              marginLeft: '5%',
              fontSize: 14,
            }}
          >
            Gọi điện
          </button>
          <button
            style={{
              backgroundColor: 'lightblue',
              color: 'blue',
              border: '1px solid lightgrey',
              borderRadius: 5,
              width: '40%',
              height: 28,
              marginTop: 10,

              display: 'flex',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              marginLeft: '5%',
              fontSize: 14,
            }}
          >
            Nhắn tin
          </button>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '20%',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '10%',
        }}
      >
        <div
          style={{
            flex: 'row',
            width: '100%',
            borderTopWidth: 5,
            borderTopStyle: 'solid',
            borderTopColor: 'whitesmoke',
            gap: 10,
          }}
        >
          <div
            style={{
              paddingLeft: 10,
              fontSize: 15,
              color: 'black',
              fontWeight: 'bold',
              marginTop: 8,
            }}
          >
            Thông tin cá nhân
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <label
            style={{
              paddingLeft: 10,
              fontSize: 13,
              color: 'grey',
              marginTop: 10,
            }}
          >
            Giới tính
          </label>
          <label
            style={{
              paddingLeft: 10,
              fontSize: 14,
              color: 'black',
              marginTop: 10,
              marginLeft: 35,
            }}
          >
            {friendDetails.gender}
          </label>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <label
            style={{
              paddingLeft: 10,
              fontSize: 13,
              color: 'grey',
              marginTop: 10,
            }}
          >
            Ngày sinh
          </label>
          <label
            style={{
              paddingLeft: 10,
              fontSize: 14,
              color: 'black',
              marginTop: 10,
              marginLeft: 25,
            }}
          >
            {friendDetails.dateOfBirth}
          </label>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <label
            style={{
              paddingLeft: 10,
              fontSize: 13,
              color: 'grey',
              marginTop: 10,
            }}
          >
            Điện thoại
          </label>
          <label
            style={{
              paddingLeft: 10,
              fontSize: 14,
              color: 'black',
              marginTop: 10,
              marginLeft: 23,
            }}
          >
            {friendDetails.phoneNumber}
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '15%',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '0%',
        }}
      >
        <div
          style={{
            flex: 'row',
            width: '100%',
            borderTopWidth: 5,
            borderTopStyle: 'solid',
            borderTopColor: 'whitesmoke',
            gap: 10,
          }}
        >
          <div
            style={{
              paddingLeft: 10,
              fontSize: 15,
              color: 'black',
              fontWeight: 'bold',
              marginTop: 8,
            }}
          >
            Hình ảnh
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 'row',
          width: '100%',
          borderTopWidth: 5,
          borderTopStyle: 'solid',
          borderTopColor: 'whitesmoke',
          gap: 10,
        }}
      >
        <div
          style={{
            paddingLeft: 10,
            fontSize: 15,
            color: 'black',
            display: 'flex',
            marginTop: 12,
          }}
        >
          <BsPeople size="1.3rem" />
          <div
            style={{
              paddingLeft: 10,
              fontSize: 15,
              color: 'black',
            }}
          >
            Nhóm chung ()
          </div>
        </div>
        <div
          style={{
            paddingLeft: 10,
            fontSize: 15,
            color: 'black',
            display: 'flex',
            marginTop: 12,
          }}
        >
          <TiBusinessCard size="1.3rem" />
          <div
            style={{
              paddingLeft: 10,
              fontSize: 15,
              color: 'black',
            }}
          >
            Chia sẻ danh thiếp
          </div>
        </div>
        <div
          style={{
            paddingLeft: 10,
            fontSize: 15,
            color: 'black',
            display: 'flex',
            marginTop: 12,
          }}
        >
          <MdBlock size="1.3rem" />
          <div
            style={{
              paddingLeft: 10,
              fontSize: 15,
              color: 'black',
            }}
          >
            Chặn tin nhắn và cuộc gọi
          </div>
        </div>
        <div
          style={{
            paddingLeft: 10,
            fontSize: 15,
            color: 'black',
            display: 'flex',
            marginTop: 12,
          }}
        >
          <LuAlertTriangle size="1.3rem" />
          <div
            style={{
              paddingLeft: 10,
              fontSize: 15,
              color: 'black',
            }}
          >
            Báo xấu
          </div>
        </div>
        <div
          style={{
            paddingLeft: 10,
            fontSize: 15,
            color: 'black',
            display: 'flex',
            marginTop: 12,
          }}
        >
          <FaRegTrashAlt size="1.3rem" />
          <div
            style={{
              paddingLeft: 10,
              fontSize: 15,
              color: 'black',
            }}
          >
            Xóa khỏi danh sách bạn bè
          </div>
        </div>
      </div>
    </div>
    //   }
    //   handleClose={() => {
    //     setOpenInfoYou(!openInfoYou)
    //   }}
    // />
  )
}
export default AddPupopYou
