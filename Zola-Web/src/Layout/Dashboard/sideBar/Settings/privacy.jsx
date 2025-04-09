import React, { useState } from 'react'
import PopupChangePass from '../popupChangePass'
import AddPopupChangePass from '../addPupopChangePass'
const Privacy = () => {
  const [ChangePass, setChangePass] = useState(false)
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '16%',
          display: 'flex',
          borderBottom: '1px solid #dcd9d9'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            marginLeft: 5,
            marginTop: 20
          }}
        >
          <label
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: '#000',
              marginLeft: 10
            }}
          >
            Mật khẩu đăng nhập
          </label>
          <button
            style={{
              marginLeft: 10,
              width: 100,
              height: 30,
              backgroundColor: 'lightgrey',
              color: 'black',
              borderRadius: 5,
              border: 'none',
              cursor: 'pointer',
              marginTop: 10
            }}
            onClick={() => {
              setChangePass(!ChangePass)
            }}
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>
      {ChangePass && (
        <PopupChangePass
          content={<AddPopupChangePass />}
          handleClose={() => {
            setChangePass(!ChangePass)
          }}
        />
      )}

      <div
        style={{
          width: '100%',
          height: '7%',
          display: 'flex'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5
          }}
        >
          <label
            style={{
              fontSize: 14,
              color: '#000',
              fontWeight: 'bold',
              marginTop: 10,
              marginLeft: 10
            }}
          >
            Khóa màn hình Zalo
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '15%',
          display: 'flex',
          borderBottom: '1px solid #dcd9d9'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            marginLeft: 5
          }}
        >
          <label
            style={{
              fontSize: 13,

              color: 'grey',
              marginLeft: 10
            }}
          >
            Khóa màn hình Zalo của bank bằng Ctrl + L khi không sử dụng máy tính
          </label>
          <button
            style={{
              marginTop: 10,
              width: 200,
              height: 30,
              backgroundColor: 'lightblue',
              color: 'blue',
              borderRadius: 5,
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Tạo mã khóa màn hình
          </button>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '6%',
          display: 'flex'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5,
            marginTop: 10
          }}
        >
          <label
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: '#000',
              marginLeft: 10
            }}
          >
            Bảo mật 2 lớp
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '15%',
          display: 'flex'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5,
            marginTop: 10
          }}
        >
          <label
            style={{
              fontSize: 13,

              color: 'grey',
              marginLeft: 10
            }}
          >
            Sau khi bật, bạn sẽ cần nhập mã xác thực mỗi khi đăng nhập Zalo trên
            máy tính mới hoặc trình duyệt mới hoặc sau mỗi 30 ngày đăng nhập
            liên tục trên cùng một thiết bị hoặc trình duyệt web
          </label>
        </div>
      </div>
    </div>
  )
}
export default Privacy
