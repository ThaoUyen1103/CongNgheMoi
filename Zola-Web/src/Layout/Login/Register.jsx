import React, { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { BsFillShieldLockFill } from 'react-icons/bs';
import { CgSpinner } from 'react-icons/cg';
import './Register.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { Button } from '@mui/material';
import { toast, Toaster } from 'react-hot-toast';
import OtpInput from 'otp-input-react';
import { sendOTP, verifyOTP } from '../../config/firebase.config';

export const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('Nam');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [expiryTime, setExpiryTime] = useState(60);
    const confirmationResultRef = useRef(null);

    useEffect(() => {
        let timer;
        if (showOTP && expiryTime > 0) {
            timer = setInterval(() => {
                setExpiryTime((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showOTP, expiryTime]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            toast.error("Vui lòng nhập số điện thoại hợp lệ!");
            return;
        }
        setLoading(true);
        try {
            const result = await sendOTP(`+84${phoneNumber.slice(1)}`);
            confirmationResultRef.current = result;
            setShowOTP(true);
            setExpiryTime(60);
            toast.success("Mã OTP đã được gửi!");
        } catch (error) {
            toast.error("Gửi mã OTP thất bại!");
            console.error(error);
        }
        setLoading(false);
    };

    const onOTPVerify = async () => {
        setLoading(true);
        try {
            await verifyOTP(confirmationResultRef.current, otp);
            toast.success('Xác thực OTP thành công!');
            handleFinalRegister(); // Thực hiện đăng ký sau khi xác thực OTP
        } catch (error) {
            toast.error('Mã OTP không chính xác!');
        }
        setLoading(false);
    };

    const handleFinalRegister = () => {
        const date = dateOfBirth.getDate();
        const month = dateOfBirth.getMonth() + 1;
        const year = dateOfBirth.getFullYear();
        const dateOfBirthFormatted = `${date}/${month}/${year}`;

        axios
            .post('http://localhost:3001/account/addAccountWeb', {
                phoneNumber,
                password,
            })
            .then((response) => {
                if (response.data.message === 'Số điện thoại đã được đăng ký!!!') {
                    toast.error('Số điện thoại đã được đăng ký!');
                    return;
                }

                if (response.data.message === 'Đăng ký thành công!!!') {
                    axios
                        .post('http://localhost:3001/user/registerWeb', {
                            account_id: response.data.account_id,
                            firstName,
                            lastName,
                            phoneNumber,
                            dateOfBirth: dateOfBirthFormatted,
                            gender,
                            password,
                        })
                        .then((res) => {
                            toast.success('Đăng ký tài khoản thành công!');
                            localStorage.setItem('phoneNumber', phoneNumber);
                            localStorage.setItem('user_id', JSON.stringify(res.data.user_id));
                            window.location.href = '/';
                        });
                }
            });
    };

    const register = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không trùng khớp!');
            return;
        }

        if (!firstName || !lastName || !phoneNumber || !dateOfBirth || !gender) {
            toast.error('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (!password.match(passwordRegex)) {
            toast.error('Mật khẩu phải chứa ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường và 1 số!');
            return;
        }

        if (dateOfBirth > new Date()) {
            toast.error('Năm sinh không hợp lệ!');
            return;
        }

        handleSendOTP();
    };

    return (
        <div className="contain">
            <Toaster toastOptions={{ duration: 3500 }} />
            <div className="register-container">
                <div className="container">
                    <div className="header-re">
                        <div className="text">Đăng Ký</div>
                        <div className="subtext">Tạo tài khoản chóng và dễ dàng.</div>
                    </div>

                    {showOTP ? (
                        <div className="content-otp-register">
                            <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full">
                                <BsFillShieldLockFill size={30} color="#0190F3" />
                            </div>
                            <label className="font-bold text-xl text-black text-center">Nhập mã OTP</label>
                            <OtpInput
                                value={otp}
                                onChange={setOtp}
                                OTPLength={6}
                                otpType="number"
                                autoFocus
                                inputStyles={{
                                    border: "1px solid black",
                                    padding: "10px",
                                    margin: "5px",
                                    fontSize: "18px",
                                    borderRadius: "5px"
                                }}
                            />
                            <button
                                onClick={onOTPVerify}
                                className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                                style={{ backgroundColor: "#0190F3", marginTop: "10px" }}
                            >
                                {loading && <CgSpinner size={20} className="animate-spin" />}
                                <span>Xác thực OTP</span>
                            </button>
                            {expiryTime > 0 ? (
                                <div style={{ fontSize: "14px", color: "red", fontWeight: "bold" }}>
                                    Mã OTP hết hạn sau: {expiryTime}s
                                </div>
                            ) : (
                                <button onClick={handleSendOTP} className="resend-otp-button">
                                    Gửi lại OTP
                                </button>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={register} className="form">
                            <div className="labelA">
                                <div className="inputA">
                                    <div className="labelA">Nhập Họ</div>
                                    <div className="labelAB">Nhập Tên</div>
                                </div>
                                <div className="inputA">
                                    <div className="inputIA">
                                        <input
                                            type="firstname"
                                            placeholder="Nhập họ của bạn"
                                            onChange={(e) => {
                                                setFirstName(e.target.value)
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault() // Ngăn chặn hành động mặc định của phím "Enter"
                                                    register(e) // Gọi hàm register khi nhấn phím "Enter"
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="inputIAB">
                                        <input
                                            type="lastname"
                                            placeholder="Nhập tên của bạn"
                                            onChange={(e) => {
                                                setLastName(e.target.value)
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault() // Ngăn chặn hành động mặc định của phím "Enter"
                                                    register(e) // Gọi hàm register khi nhấn phím "Enter"
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="label">Nhập số điện thoại</div>
                            <input
                                type="tel"
                                placeholder="Nhập số điện thoại"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <div className="label">Nhập ngày sinh </div>
                            <div className="inputA">
                                <div className="inputB">
                                    <DatePicker
                                        //showIcon
                                        placeholderText="Chọn ngày sinh "
                                        selected={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e)}
                                        dateFormat="dd/MM/yyyy"
                                        showYearDropdown
                                        // scrollYearDropdown
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault() // Ngăn chặn hành động mặc định của phím "Enter"
                                                register(e) // Gọi hàm register khi nhấn phím "Enter"
                                            }
                                        }}
                                    />
                                </div>
                                <div className="inputC">
                                    <div className="div-gender">
                                        <label for="select"> Giới tính </label>
                                        <select
                                            className="form-select"
                                            id="select"
                                            value={gender}
                                            onChange={(e) =>
                                                setGender(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault() // Ngăn chặn hành động mặc định của phím "Enter"
                                                    register(e) // Gọi hàm register khi nhấn phím "Enter"
                                                }
                                            }}
                                        >
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="label">Nhập mật khẩu</div>
                            <div className="inputIB">
                                <input
                                    // type="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Nhập mật khẩu"
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault() // Ngăn chặn hành động mặc định của phím "Enter"
                                            register(e) // Gọi hàm register khi nhấn phím "Enter"
                                        }
                                    }}
                                />
                                <span
                                    className="span-eye"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}{' '}
                                    {/* Sử dụng icon con mắt */}
                                </span>
                            </div>
                            <div className="label">Nhập lại mật khẩu </div>
                            <div className="inputIB">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Nhập lại mật khẩu"
                                    // set lấy giá trị confirm password
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault() // Ngăn chặn hành động mặc định của phím "Enter"
                                            register(e) // Gọi hàm register khi nhấn phím "Enter"
                                        }
                                    }}
                                />
                            </div>
                            <Button type="submit" variant="contained" color="success">
                                Đăng ký
                            </Button>
                        </form>
                    )}
                </div>
            </div>
            <div id="recaptcha-container"></div>
        </div>


    );
};
