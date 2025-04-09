import React, { useEffect, useRef } from 'react' // Import thư viện React
import { useState } from 'react' // Import hook useState từ thư viện React
import './Receiveotp.css'
import { Button, TextField } from '@mui/material'
import { CgSpinner } from 'react-icons/cg'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../../config/firebase.config'
import 'react-toastify/dist/ReactToastify.css'
import { toast, Toaster } from 'react-hot-toast'
const Receiveotp = () => {
  const [otp, setOtp] = useState('')
  // const [phone, setPhone] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const didMountRef = useRef(false)
  const type = new URLSearchParams(window.location.search).get('type')
  const handleOtpChange = (e) => {
    let newValue = e.target.value.replace(/\D/g, '') // Lọc chỉ giữ lại số
    newValue = newValue.slice(0, 6) // Giới hạn chỉ cho phép nhập 6 số
    setOtp(newValue)
  }
  const phoneNumber = localStorage.getItem('phoneNumber')
  const user_id = localStorage.getItem('user_id')
  function getGreeting() {
    const currentTime = new Date()
    const currentHour = currentTime.getHours()

    if (currentHour >= 5 && currentHour < 12) {
      return 'Chào buổi sáng'
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Chào buổi chiều'
    } else {
      return 'Chào buổi tối'
    }
  }

  useEffect(() => {
    // hàm này để cho nó chạy 1 lần duy nhất khi component được render
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    //alert(phoneNumber)
    if (!phoneNumber && type === 'register') {
      toast.error('Không tìm thấy số điện thoại . Tự động trở về trang đăng ký')

      // Đặt độ trễ trước khi chuyển hướng trang
      const delay = 3000 // Độ trễ trong milliseconds (3 giây)

      // Sử dụng setTimeout để chờ đợi trước khi chuyển hướng trang
      const timer = setTimeout(() => {
        window.location.href =
          'http://localhost:3000/receiveOtp?type=forgotpassword'
      }, delay)

      // Xóa timer khi component unmount
      return () => clearTimeout(timer)
    } else if (!phoneNumber && type === 'forgotpassword') {
      toast.error(
        'Không tìm thấy số điện thoại . Tự động trở về trang quên mật khẩu'
      )

      // Đặt độ trễ trước khi chuyển hướng trang
      const delay = 3000 // Độ trễ trong milliseconds (3 giây)

      // Sử dụng setTimeout để chờ đợi trước khi chuyển hướng trang
      const timer = setTimeout(() => {
        window.location.href = 'http://localhost:3000/forgotpassword'
      }, delay)

      // Xóa timer khi component unmount
      return () => clearTimeout(timer)
    }

    onSignUp()
  }, [phoneNumber]) //
  if (type === 'register' && user) {
    toast.success('Đăng nhập thành công')

    // localStorage.removeItem('phoneNumber')
    // localStorage.setItem('user_id', JSON.stringify(user_id))
    window.location.href = 'http://localhost:3000/dashboardwait'
  }
  // Kiểm tra nếu trang trước đó là quên mật khẩu, chuyển hướng đến trang quên mật khẩu
  else if (type === 'forgotpassword' && user) {
    toast.success('Thành công chuyển hướng đến trang đổi mật khẩu')
    // localStorage.setItem('user_id', JSON.stringify(user_id))
    window.location.href = `http://localhost:3000/resetpassword`
  }
  // if (type === 'register') {
  //   alert('Trang được gọi từ register')
  // }
  // if (type === 'forgotpassword') {
  //   alert('Trang được gọi từ forgotPassword')
  // }

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
    onCaptchVerify()
    const phoneNumber2 = '+84' + phoneNumber.slice(1)
    const appVerifier = window.recaptchaVerifier
    signInWithPhoneNumber(auth, phoneNumber2, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult
        console.log('OTP đã được gửi đến số điện thoại của bạn.')
        setLoading(false)
        toast.success('OTP đã được gửi đến số điện thoại của bạn.')
      })
      .catch((error) => {
        console.log('Lỗi xảy ra khi gửi OTP: ', error)
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
        // Xử lý trường hợp OTP không đúng
        toast.error('Mã OTP không đúng. Vui lòng nhập lại.')
        // Đặt lại giá trị của OTP để người dùng nhập lại
        setOtp('')
      })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundImage: `url(${require('../../Assets/background.png')})`,
        backgroundSize: 'cover',

        backgroundRepeat: 'no-repeat',
      }}
    >
      <div id="recaptcha-container"></div>
      <Toaster toastOptions={{ duration: 4000 }} />
      <h1
        style={{
          color: 'blue',
          fontSize: '40px',
          marginBottom: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontWeight: 'bold',
        }}
      >
        <div style={{ color: 'blue' }}>
          <b>{getGreeting()}</b>
        </div>
        Zola
      </h1>
      <label
        style={{
          color: 'white',
          fontSize: '20px',
          marginTop: '10px',
          fontWeight: 'bold',
        }}
      >
        Nhập mã OTP
      </label>
      <br />
      <TextField
        sx={{
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
              color: 'black', // Thiết lập màu chữ trong TextField
            },
            '& .MuiInputLabel-root': {
              color: 'black', // Thiết lập màu chữ cho label
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white', // Thiết lập màu viền cho input
            },
            '& .MuiInputBase-input': {
              color: 'black', // Thiết lập màu chữ cho input
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
        Xác Nhận
      </Button>
    </div>
  )
}
export default Receiveotp // Export component để có thể sử dụng ở các file khác
