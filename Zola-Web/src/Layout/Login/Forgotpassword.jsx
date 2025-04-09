import React, { useState, useEffect } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './Receiveotp.css'
import { Button, TextField } from '@mui/material'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from './setup'
import 'react-toastify/dist/ReactToastify.css'
import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'
function Forgotpassword() {
    const [otp, setOtp] = useState('')
    const [phone, setPhone] = useState('')
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)

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
                },
            )
        }
    }
    function onSignUp() {
        setLoading(true)
        onCaptchVerify()

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
                .post('http://localhost:3001/account/loginPhoneWeb', {
                    phoneNumber: phone,
                })
                .then((response) => {
                    if (
                        response.data.message ===
                        'Số điện thoại chưa được đăng ký!!!'
                    ) {
                        // Nếu server trả về message là 'Số điện thoại chưa được đăng ký!!!'
                        alert('Số điện thoại chưa được đăng ký!!!')
                        setLoading(false)
                        return
                    }

                    //window.location.href = 'http://localhost:3000/receiveotp'
                    if (response.data.message === 'Đăng nhập thành công!!!') {
                        // Nếu thành công thì chuyển hướng đến trang nhận OTP
                        window.location.href =
                            'http://localhost:3000/receiveOtp?type=forgotpassword'
                        // làm đở gửi tới luôn trang reset password
                        // window.location.href = 'http://localhost:3000/resetpassword'
                        // // Hoặc lưu vào session storage
                        localStorage.setItem(
                            'phoneNumber',
                            response.data.phoneNumber,
                        )
                        localStorage.setItem('user_id', response.data.user_id)
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
            <div className="phone-content">
                <div id="recaptcha-container"></div>
                <Toaster toastOptions={{ duration: 2000 }} />
                <h1 className="h1-name">
                    Quên Mật Khẩu
                    <br />
                    Zola
                    <br />
                    {/* <SiZalo size={40} /> */}
                </h1>
                <label htmlFor="ph" className="custom-class">
                    Nhập số điện thoại bạn đã đăng ký
                </label>
                <br />
                <br />
                <PhoneInput
                    country={'vn'}
                    onChange={(phone) => setPhone('+' + phone)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault() // Ngăn chặn hành động mặc định của phím "Enter"
                            onSignUp() // Gọi hàm onSignUp khi nhấn phím "Enter"
                        }
                    }}
                />
                <Button
                    onClick={onSignUp}
                    sx={{ marginTop: '10px' }}
                    variant="contained"
                >
                    Tiếp tục
                </Button>
            </div>
        </div>
    )
}
export default Forgotpassword
