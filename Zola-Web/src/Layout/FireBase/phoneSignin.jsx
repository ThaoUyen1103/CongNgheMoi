import React, { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './phoneSignin123.css'
import { Button, TextField } from '@mui/material'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../../config/firebase.config'

function PhoneSignin() {
  const [phone, setPhone] = useState('')
  const [user, setUser] = useState(null)
  const [otp, setOtp] = useState('')
  const sendOTP = async () => {
    try {
      const recaptcha = new RecaptchaVerifier(auth, 'recaptcha', {})
      const confirmation = await signInWithPhoneNumber(auth, phone, recaptcha)

      if (confirmation) {
        setUser(confirmation)
        console.log(confirmation)
        console.log('OTP đã được gửi đến số điện thoại của bạn.')
      } else {
        console.log('Không nhận được confirmation từ Firebase.')
      }
    } catch (error) {
      console.log('Lỗi gửi OTP: ', error)
    }
  }
  const verifyOTP = async () => {
    try {
      const data = await user.confirm(otp)
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="phone_body">
      <div className="phone-content">
        <PhoneInput
          country={'vn'}
          // value={}
          onChange={(phone) => setPhone('+' + phone)}
        />
        <Button
          onClick={sendOTP}
          sx={{ marginTop: '10px' }}
          variant="contained"
        >
          Đăng Nhập
        </Button>
        <div id="recaptcha"></div>
        <div x={{ marginTop: '10px' }} id="recaptcha"></div>
        <br />
        <TextField
          sx={{ marginTop: '10px', width: '300px' }}
          variant="outlined"
          size="small"
          label="Nhập mã xác nhận"
          onChange={(e) => setOtp(e.target.value)}
        ></TextField>{' '}
        <br />
        <Button
          onClick={verifyOTP}
          sx={{ marginTop: '10px' }}
          variant="contained"
          color="success"
        >
          Xác Nhận OTP
        </Button>
      </div>
    </div>
  )
}
export default PhoneSignin
