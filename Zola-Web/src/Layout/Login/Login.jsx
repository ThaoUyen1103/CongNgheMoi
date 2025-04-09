import React from 'react'
import { useState, useEffect, useRef } from 'react'
import './Login.css'
import background from '../../Assets/background.png'
import { Button } from '@mui/material'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
export const Login = () => {
  const [action, setAction] = React.useState('Đăng Nhập')
  const [phoneNumber, setPhoneNumber] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // viết 1 hàm để gửi thông tin đăng nhập lên server
  const login = (e) => {
    e.preventDefault()

    // kiểm tra rỗng
    if (phoneNumber === '' || password === '') {
      toast.error('Vui lòng nhập đầy đủ thông tin!!!')
      // Đặt biến errorShown thành true để chỉ hiển thị một lần

      return
    }

    axios
      .post('http://localhost:3001/account/loginWeb', {
        phoneNumber: phoneNumber,
        password: password
      })
      .then((response) => {
        console.log(response)
        if (response.data.message === 'Account not found!!!') {
          toast.error('Tài khoản không tồn tại!!!')
        } else if (response.data.message === 'Password not match!!!') {
          toast.error('Mật khẩu không đúng!!!')
          setFailedAttempts(failedAttempts + 1)
          if (failedAttempts >= 3) {
            const userConfirmation = window.confirm(
              'Bạn đã đăng nhập sai quá 3 lần. Bạn có muốn chuyển qua trang quên mật khẩu không?'
            )
            if (userConfirmation) {
              localStorage.setItem('phoneNumber', phoneNumber)
              window.location.href =
                'http://localhost:3000/receiveOtp?type=forgotpassword'
            }
          }
        } else if (response.data.message === 'Login successfully!!!') {
          // localStorage.setItem('account_id', response.data.account_id)
          // window.location.href = 'http://localhost:3000/dashboard'
          axios
            .post('http://localhost:3001/user/findUserByAccountIDWeb', {
              account_id: response.data.account_id
            })
            .then((response) => {
              toast.success('Đăng nhập thành công!!!')
              localStorage.setItem(
                'user_id',
                JSON.stringify(response.data.user_id)
              )
              window.location.href = 'http://localhost:3000/dashboard'
            })
        }
      })
  }

  return (
    <div className="contain">
      <div className="container1">
        <div className="header">
          <Toaster toastOptions={{ duration: 2200 }} />
          <div className="text">{action}</div>
          <div className="subtext">
            {' '}
            <b className="zola-style">Zola</b> giúp mọi người kết nối với nhau{' '}
          </div>
        </div>
        <div className="form">
          <div className="labelI">Số di động</div>
          <div className="input1">
            <input
              type="phone"
              placeholder="Nhập số điện thoại"
              onChange={(e) => {
                setPhoneNumber(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault() // Ngăn chặn hành động mặc định của phím "Enter"
                  login(e) // Gọi hàm onSignUp khi nhấn phím "Enter"
                }
              }}
            />
          </div>
          <div className="label">Mật Khẩu</div>
          <div className="input1">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault() // Ngăn chặn hành động mặc định của phím "Enter"
                  login(e) // Gọi hàm onSignUp khi nhấn phím "Enter"
                }
              }}
            />
            <span className="span-eye" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}{' '}
              {/* Sử dụng icon con mắt */}
            </span>
          </div>
          <div className="form-group forgot-password">
            <div className="col-xl-12 col-md-10 col-sm-12 col-12">
              <a href="/forgotpassword"> Quên Mật Khẩu?</a>
            </div>
          </div>

          <div className="summit">
            {/* <div
            className={action === 'Đăng Nhập' ? 'button blue' : 'button'}
            onClick={(e) => {
              login(e)
            }}
          >
            Log In
          </div> */}

            <Button
              onClick={(e) => {
                login(e)
              }}
              sx={{ marginTop: '10px' }}
              variant="contained"
              color="success"
            >
              Đăng nhập
            </Button>
          </div>
          <br />
          <div className="form-group user-register">
            <div className="col-xl-12 col-md-10 col-sm-12 col-12 ">
              Bạn chưa có tài khoản ?{' '}
              <b className="login-style">
                <a href="/register"> Đăng Ký Ngay</a>
              </b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
