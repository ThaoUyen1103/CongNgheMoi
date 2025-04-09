import React, { useEffect, useRef } from 'react' // Import thư viện React
import { useState } from 'react' // Import hook useState từ thư viện React
import './Receiveotp.css'
import { Button, TextField } from '@mui/material'
import { CgSpinner } from 'react-icons/cg'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from './setup'
import 'react-toastify/dist/ReactToastify.css'
import { toast, Toaster } from 'react-hot-toast'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import './Login.css'
import axios from 'axios'
const Resetpassword = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)

    const [passwordnew, setPasswordnew] = useState('') // Khai báo state passwordnew để lưu giá trị mật khẩu mới
    const didMountRef = useRef(false)

    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }
    // Trong trang resetpassword
    const phoneNumber = localStorage.getItem('phoneNumber')
    // const phoneNumber = sessionStorage.getItem('phoneNumber')
    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true
            return
        }

        if (!phoneNumber) {
            toast.error(
                'Không tìm thấy số điện thoại , Tự động trở về trang quên mật khẩu',
            )
            // Đặt độ trễ trước khi chuyển hướng trang
            const delay = 3000 // Độ trễ trong milliseconds (5 giây)

            // Sử dụng setTimeout để chờ đợi trước khi chuyển hướng trang
            const timer = setTimeout(() => {
                window.location.href = 'http://localhost:3000/forgotpassword'
            }, delay)

            // Xóa timer khi component unmount
            return () => clearTimeout(timer)
        }
    }, [phoneNumber]) //
    if (user) {
        window.location.href = 'http://localhost:3000/dashboard'
    }
    function OnSetupPassword() {
        setLoading(true)
        // kiểm tra nếu mà passwordnew bé hơn 8 ký tự thì báo lỗi

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
        if (!passwordRegex.test(passwordnew)) {
            toast.error(
                'Mật khẩu mới phải có ít nhất 8 ký tự có ít nhất 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số',
            )
            setLoading(false)
            return
        }

        // gọi hàm axios và post đến code http://localhost:3001/account/forgot-account
        axios
            .post('http://localhost:3001/account/forgot-account', {
                phoneNumber: phoneNumber,
                passwordnew: passwordnew,
            })
            .then((response) => {
                if (
                    response.data.message ===
                    'Mật khẩu mới không được trùng mật khẩu cũ'
                ) {
                    toast.error('Mật khẩu mới không được trùng mật khẩu cũ')
                    setLoading(false)
                }

                if (
                    response.data.message ===
                    'Mật khẩu đã được thay đổi thành công!!!'
                ) {
                    // sau khi đổi thì xoá phoneNumber trong localStorage
                    localStorage.removeItem('phoneNumber')
                    window.location.href = 'http://localhost:3000/dashboard'
                    toast.success('Mật khẩu đã được thay đổi thành công')
                }
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
                className="h1-name"
                style={{
                    color: 'blue',
                }}
            >
                Chào mừng bạn quay trở lại
                <br />
                Zola
                <br />
                {/* <SiZalo size={40} /> */}
            </h1>
            <label
                htmlFor="ph"
                className="custom-class"
                style={{
                    color: '#2E7D32',
                }}
            >
                Nhập mật khẩu mới
            </label>
            <br />

            <div className="div-texteye">
                <TextField
                    sx={{
                        marginTop: '10px',
                        width: '300px',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#2E7D32', // Thiết lập màu viền của TextField
                            },
                            '&:hover fieldset': {
                                borderColor: '#2E7D32', // Thiết lập màu viền khi di chuột qua TextField
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'blue', // Thiết lập màu viền khi TextField được focus
                            },
                            '& input': {
                                color: 'blue', // Thiết lập màu chữ trong TextField
                            },
                            '& .MuiInputLabel-root': {
                                color: 'blue', // Thiết lập màu chữ cho label
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'blue', // Thiết lập màu viền cho input
                            },
                            '& .MuiInputBase-input': {
                                color: 'blue', // Thiết lập màu chữ cho input
                            },
                        },
                    }}
                    variant="outlined"
                    size="small"
                    inputProps={{
                        type: showPassword ? 'text' : 'password',
                        // giới hạn ít nhất là 8 ký tự
                        minLength: 8,
                    }}
                    InputProps={{
                        endAdornment: null,
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            OnSetupPassword()
                        }
                    }}
                    onChange={(e) => setPasswordnew(e.target.value)}
                ></TextField>{' '}
                <span className="span-eyers" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}{' '}
                </span>
            </div>

            <br />
            <Button
                onClick={OnSetupPassword}
                // Gán giá trị của ô input vào state passwordnew
                sx={{ marginTop: '10px' }}
                variant="contained"
                color="success"

                // onClick={onVerifyOTP()}
            >
                {loading && (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                )}
                Xác Nhận
            </Button>
        </div>
    )
}
export default Resetpassword // Export component để có thể sử dụng ở các file khác
