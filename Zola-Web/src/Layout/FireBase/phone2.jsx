import React from 'react' // Import thư viện React
import { useState } from 'react' // Import hook useState từ thư viện React
import OtpInput from 'react-otp-input'
import './phoneSignin123.css'
import { Button, TextField } from '@mui/material'
import { SiZalo } from 'react-icons/si'
import { CgSpinner } from 'react-icons/cg'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../../config/firebase.config'
import 'react-toastify/dist/ReactToastify.css'
import { toast, Toaster } from 'react-hot-toast'
const Phone2 = () => {
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
            onSignUp()
          },
          'expired-callback': () => { },
        }
      )
    }
  }
  function onSignUp() {
    setLoading(true)
    onCaptchVerify()

    const appVerifier = window.recaptchaVerifier
    const phoneNumber = '+' + phone
    console.log(phoneNumber)
    alert(phoneNumber)

    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult
        console.log('OTP đã được gửi đến số điện thoại của bạn.')
        setLoading(false)
        toast.success('OTP đã được gửi đến số điện thoại của bạn.')
      })
      .catch((error) => {
        console.log(error)
        setLoading(false)
      })
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
    <div className="bg-emerald-500 flex-container items-center justify-center h-screen">
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
        Enter Your OTP
      </label>
      <br />
      <PhoneInput
        country={'vn'}
        value={phone}
        onChange={(phone) => setPhone(phone)}
      // value={}
      // onChange={(phone) => setPhone('+' + phone)}
      />
      <Button onClick={onSignUp} sx={{ marginTop: '10px' }} variant="contained">
        {loading && <CgSpinner size={20} className="mt-1 animate-spin" />}
        Đăng Nhập
      </Button>
      <TextField
        sx={{
          marginTop: '10px',
          width: '300px',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white', // Thiết lập màu viền của TextField
            },
            '&:hover fieldset': {
              borderColor: 'white', // Thiết lập màu viền khi di chuột qua TextField
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white', // Thiết lập màu viền khi TextField được focus
            },
            '& input': {
              color: 'white', // Thiết lập màu chữ trong TextField
            },
            '& .MuiInputLabel-root': {
              color: 'white', // Thiết lập màu chữ cho label
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white', // Thiết lập màu viền cho input
            },
            '& .MuiInputBase-input': {
              color: 'white', // Thiết lập màu chữ cho input
            },
          },
        }}
        variant="outlined"
        size="small"
        inputProps={{
          type: 'number',
          maxLength: 6, // Giới hạn chiều dài tối đa là 6 ký tự
        }}
        InputProps={{
          endAdornment: null,
        }}
        onChange={handleOtpChange}
      ></TextField>{' '}
      <br />
      <Button
        onClick={onVerifyOTP}
        sx={{ marginTop: '10px' }}
        variant="contained"
        color="success"
      // onClick={onVerifyOTP()}
      >
        {loading && <CgSpinner size={20} className="mt-1 animate-spin" />}
        Xác Nhận OTP
      </Button>
      <h2 className="text-center text-white font-medium text-2xl">
        👍Login Success
      </h2>
    </div>
  )
}
export default Phone2 // Export component để có thể sử dụng ở các file khác
