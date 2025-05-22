import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../styles/OtpVerification.css'; // Import CSS

const OTP_LENGTH = 6; // Số lượng chữ số OTP

function OtpVerification() {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30); // Thời gian đếm ngược để gửi lại OTP
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  const phoneNumber = location.state?.phoneNumber || "số điện thoại của bạn";
  const fullName = location.state?.fullName;


  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timerId;
    if (resendTimer > 0 && !canResend) {
      timerId = setTimeout(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearTimeout(timerId);
  }, [resendTimer, canResend]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false; // Chỉ cho phép nhập số

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    setError(''); // Xóa lỗi khi người dùng bắt đầu nhập

    // Chuyển focus sang input tiếp theo
    if (element.value !== "" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Chuyển focus về input trước đó khi nhấn Backspace và input hiện tại rỗng
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text').slice(0, OTP_LENGTH);
    if (/^\d+$/.test(pasteData)) {
        const newOtp = [...otp];
        for (let i = 0; i < pasteData.length; i++) {
            if (i < OTP_LENGTH) {
                newOtp[i] = pasteData[i];
            }
        }
        setOtp(newOtp);
        const lastFilledIndex = Math.min(pasteData.length -1, OTP_LENGTH -1);
        if(inputRefs.current[lastFilledIndex]){
            inputRefs.current[lastFilledIndex].focus();
        }
    }
    e.preventDefault();
  };


  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== OTP_LENGTH) {
      setError(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số OTP.`);
      return;
    }
    console.log('Đang xác thực OTP:', enteredOtp, 'cho SĐT:', phoneNumber);
    // --- Logic xác thực OTP giả lập ---
    // Trong thực tế, bạn sẽ gọi API để xác thực OTP
    if (enteredOtp === "123456") { // Mã OTP giả lập để test
      alert('Xác thực OTP thành công!');
      // Chuyển hướng đến trang đăng nhập hoặc trang chính của ứng dụng
      // Giả sử onOtpSuccess được truyền từ App.js để cập nhật trạng thái đăng nhập
      // onOtpSuccess(); // Nếu bạn muốn tự động đăng nhập
      navigate('/login'); // Hoặc navigate('/app') nếu tự động đăng nhập
    } else {
      setError('Mã OTP không chính xác. Vui lòng thử lại.');
      setOtp(new Array(OTP_LENGTH).fill("")); // Xóa OTP đã nhập
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    console.log('Yêu cầu gửi lại OTP cho:', phoneNumber);
    // --- Logic gửi lại OTP giả lập ---
    // Trong thực tế, bạn sẽ gọi API để yêu cầu gửi lại OTP
    alert(`Đã gửi lại mã OTP đến ${phoneNumber} (giả lập).`);
    setCanResend(false);
    setResendTimer(30); // Reset bộ đếm
    setOtp(new Array(OTP_LENGTH).fill("")); // Xóa OTP đã nhập
    setError('');
    if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
  };

  return (
    <div className="otp-verification-container">
      <header className="zalo-header">
        <h1>Zalo</h1>
      </header>

      <main className="otp-verification-form-wrapper">
        <h2>Xác thực tài khoản</h2>
        <p className="otp-instruction">
          Một mã OTP gồm {OTP_LENGTH} chữ số đã được gửi đến <br/> số điện thoại <strong>{phoneNumber}</strong>.
          {fullName && <> <br/>Xin chào <strong>{fullName}</strong>, vui lòng nhập mã để tiếp tục.</>}
        </p>

        <form onSubmit={handleVerifyOtp}>
          <div className="otp-input-fields" onPaste={handlePaste}>
            {otp.map((data, index) => {
              return (
                <input
                  className="otp-input"
                  type="text"
                  name="otp"
                  maxLength="1"
                  key={index}
                  value={data}
                  onChange={e => handleChange(e.target, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  onFocus={e => e.target.select()}
                  ref={el => (inputRefs.current[index] = el)}
                  required
                />
              );
            })}
          </div>

          {error && <p className="otp-error-message">{error}</p>}

          <div className="resend-otp-section">
            Không nhận được mã?{' '}
            <button 
                type="button" 
                className="resend-otp-button" 
                onClick={handleResendOtp}
                disabled={!canResend}
            >
              Gửi lại OTP
            </button>
            {!canResend && <span className="otp-timer">({resendTimer}s)</span>}
          </div>

          <button type="submit" className="verify-otp-button" disabled={otp.join("").length !== OTP_LENGTH}>
            Xác nhận
          </button>
        </form>
        <div className="login-link-section" style={{marginTop: '20px'}}>
            <Link to="/login" className="back-to-login-link">Quay lại Đăng nhập</Link>
        </div>
      </main>
    </div>
  );
}

export default OtpVerification;