import React, { useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
const AddPupopChangePass = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [reNewPassword, setReNewPassword] = useState('')
  const user = JSON.parse(localStorage.getItem('user'))
  const phoneNumber = user.phoneNumber

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  const handleUpdatePassword = (e) => {
    e.preventDefault()
    // kiểm tra rỗng cả 3 mật khẩu
    if (!currentPassword || !newPassword || !reNewPassword) {
      toast.error('Mật khẩu không được để trống!!!')
      return
    }
    // kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
    if (currentPassword === newPassword) {
      toast.error('Mật khẩu mới không được trùng với mật khẩu cũ!!!')
      return
    }
    // kiểm tra mật khẩu mới có trùng với mật khẩu nhập lại không
    if (newPassword !== reNewPassword) {
      toast.error('Mật khẩu mới không trùng với mật khẩu nhập lại!!!')
      return
    }
    // regex cho mật khẩu mới có ít nhất 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    if (!newPassword.match(passwordRegex)) {
      toast.error(
        'Mật khẩu phải chứa ít nhất 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường và 1 số!!!'
      )
      return
    }
    // alert(currentPassword + ' ' + newPassword + ' ' + reNewPassword)
    axios
      .post('http://localhost:3001/account/changePasswordWeb', {
        phoneNumber: phoneNumber,
        password: currentPassword,
        passwordnew: newPassword,
      })
      .then((response) => {
        if (
          response.data.message === 'Mật khẩu mới không được trùng mật khẩu cũ'
        ) {
          toast.error('Mật khẩu mới không được trùng mật khẩu cũ!!!')
          return
        }
        if (response.data.message === 'Mật khẩu cũ không đúng') {
          toast.error('Mật khẩu hiện tại không đúng!!!')
          return
        }
        if (response.data.message === 'Mật khẩu đã được thay đổi thành công') {
          toast.success('Mật khẩu đã được thay đổi thành công')
          // đóng popup
        }
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
          height: '13%',
          display: 'flex',
          borderBottom: '1px solid lightgrey',
        }}
      >
        <label
          style={{
            fontSize: 16,
            color: '#000',
            marginLeft: 10,
            marginTop: 10,
          }}
        >
          <b>Tạo mật khẩu mới</b>
        </label>
      </div>
      <div
        style={{
          width: '95%',
          height: '10%',
          marginLeft: 10,
        }}
      >
        <label
          style={{
            fontSize: 12,
            color: 'black',
            fontWeight: 'bold',
            marginTop: 10,
          }}
        >
          Lưu ý:
        </label>
        <label
          style={{
            fontSize: 12,
            color: 'grey',
            marginLeft: 5,
            marginTop: 10,
          }}
        >
          Mật khẩu bao gồm chữ kèm theo số hoặc ký tự đặc biệt, tối thiểu 8 ký
          tự trở lên & tối đa 32 ký tự
        </label>
      </div>
      <div
        style={{
          width: '100%',
          height: '15%',
          display: 'flex',
          flexDirection: 'column',
          marginTop: 20,
        }}
      >
        <label
          style={{
            fontSize: 13,
            color: '#000',
            marginLeft: 10,
          }}
        >
          Mật khẩu hiện tại
        </label>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '95%',
            height: '100%',
            border: '1px solid lightgrey',
            borderRadius: 5,
            marginLeft: 10,
          }}
        >
          <input
            // type="password"
            type={showPassword ? 'text' : 'password'}
            style={{
              width: '95%',
              height: '100%',
              border: 'none',
              borderRadius: 5,
              outline: 'none',
              fontSize: 13,
            }}
            placeholder="Nhập mật khẩu hiện tại"
            onChange={(e) => {
              setCurrentPassword(e.target.value)
            }}
          />
          <div
            style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}{' '}
              {/* Sử dụng icon con mắt */}
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '15%',
          display: 'flex',
          flexDirection: 'column',
          marginTop: 10,
        }}
      >
        <label
          style={{
            fontSize: 13,
            color: '#000',
            marginLeft: 10,
          }}
        >
          Mật khẩu mới
        </label>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '95%',
            height: '100%',
            border: '1px solid lightgrey',
            borderRadius: 5,
            marginLeft: 10,
          }}
        >
          <input
            type={showPassword ? 'text' : 'password'}
            style={{
              width: '95%',
              height: '100%',
              outline: 'none',
              borderRadius: 5,
              border: 'none',
              fontSize: 13,
            }}
            placeholder="Nhập mật khẩu mới"
            onChange={(e) => {
              setNewPassword(e.target.value)
            }}
          />
          <div
            style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}{' '}
              {/* Sử dụng icon con mắt */}
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '15%',
          display: 'flex',
          flexDirection: 'column',
          marginTop: 10,
        }}
      >
        <label
          style={{
            fontSize: 13,
            color: '#000',
            marginLeft: 10,
          }}
        >
          Nhập lại mật khẩu mới
        </label>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '95%',
            height: '100%',
            border: '1px solid lightgrey',
            borderRadius: 5,
            marginLeft: 10,
          }}
        >
          <input
            type={showPassword ? 'text' : 'password'}
            style={{
              width: '95%',
              height: '100%',
              outline: 'none',
              borderRadius: 5,
              border: 'none',
              fontSize: 13,
            }}
            placeholder="Nhập lại mật khẩu mới"
            onChange={(e) => {
              setReNewPassword(e.target.value)
            }}
          />
          <div
            style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}{' '}
              {/* Sử dụng icon con mắt */}
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '15%',
          display: 'flex',
          flexDirection: 'row',
          marginTop: 10,
          marginLeft: '60%',
        }}
      >
        <button
          style={{
            width: '15%',
            height: '75%',
            marginLeft: 10,
            marginTop: 2,
            borderRadius: 5,
            border: '1px solid lightgrey',
            fontSize: 13,
            backgroundColor: 'lightgrey',
            color: 'black',
          }}
        >
          Hủy
        </button>
        <button
          style={{
            width: '15%',
            height: '75%',
            marginLeft: 10,
            marginTop: 2,
            borderRadius: 5,
            border: '1px solid lightgrey',
            fontSize: 13,
            backgroundColor: 'lightblue',
            color: '#0000FF',
          }}
          placeholder="Nhập lại mật khẩu mới"
          onClick={(e) => handleUpdatePassword(e)}
        >
          Cập nhật
        </button>
      </div>
    </div>
  )
}
export default AddPupopChangePass
