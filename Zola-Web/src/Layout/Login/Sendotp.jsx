import React, { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './Receiveotp.css'
import { Button, TextField } from '@mui/material'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from './setup'
import 'react-toastify/dist/ReactToastify.css'
import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'
function Sendotp() {
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const handleOtpChange = (e) => {
    let newValue = e.target.value.replace(/\D/g, '') // Lọc chỉ giữ lại số
    newValue = newValue.slice(0, 6) // Giới hạn chỉ cho phép nhập 6 số
    setOtp(newValue)
  }
  if (user) {
    window.location.href = 'http://localhost:3000/dashboard'
  }
  function onCaptchVerify() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            // ...
            onSignUp()
          },
          'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            // ...
          },
          auth,
        }
      )
    }
  }
  function onSignUp() {
    setLoading(true)
    onCaptchVerify()

    const appVerifier = window.recaptchaVerifier
    // const phoneNumber = '+' + phone

    // kiểm tra rỗng và có đúng định dạng số điện thoại không
    if (phone === '') {
      toast.error('Vui lòng nhập số điện thoại!!!')
      setLoading(false)
      return
    } else if (phone.length < 10) {
      toast.error('Số điện thoại không hợp lệ!!!')
      setLoading(false)
      return
    } else {
      axios
        .post('http://localhost:3001/account/login-phone', {
          phoneNumber: phone,
        })
        .then((response) => {
          //window.location.href = 'http://localhost:3000/receiveotp'
          if (response.data.message === 'Đăng nhập thành công!!!') {
            window.location.href = 'http://localhost:3000/receiveotp'
            // Hoặc lưu vào session storage
            sessionStorage.setItem('phoneNumber', response.data.phoneNumber)
          } else {
            // Nếu server trả về message khác 'Đăng nhập thành công!!!'
            alert('Đăng nhập không thành công! Vui lòng thử lại.')
          }
        })
        .catch((error) => {
          // Xử lý lỗi nếu có
          console.error('Đã xảy ra lỗi:', error)
          alert('Đã xảy ra lỗi khi đăng nhập! Vui lòng thử lại.')
        })
    }
  }
  function onVerifyOTP() {
    setLoading(true)
    window.confirmationResult
      .confirm(otp)
      .then(async (res) => {
        console.log(res)
        setUser(res.user)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
      })
  }

  return (
    <div className="phone_body">
      <div className="phone-content">
        <div id="recaptcha-container"></div>
        <Toaster toastOptions={{ duration: 4000 }} />
        <h1 className="h1-name">
          Welcomte to
          <br />
          Zola
          <br />
          {/* <SiZalo size={40} /> */}
        </h1>
        <label htmlFor="ph" className="custom-class">
          Enter Your Phone Number
        </label>
        <br />
        <br />
        <PhoneInput
          country={'vn'}
          onChange={(phone) => setPhone('+' + phone)}
        />
        <Button
          onClick={onSignUp}
          sx={{ marginTop: '10px' }}
          variant="contained"
        >
          Đăng Nhập
        </Button>
        <div x={{ marginTop: '10px' }} id="recaptcha"></div>
      </div>
    </div>
  )
}
export default Sendotp
