import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/ForgotPassword.css'; // Import CSS mới
import { FaPhoneAlt } from 'react-icons/fa';

function ForgotPassword() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại của bạn.');
      return;
    }
    // Giả sử số điện thoại hợp lệ cần có 9 hoặc 10 chữ số sau mã vùng +84
    // và không tính số 0 ở đầu nếu người dùng nhập.
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (phoneDigits.length < 9 || phoneDigits.length > 10) {
        setError('Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.');
        return;
    }

    setIsLoading(true);
    console.log('Yêu cầu đặt lại mật khẩu cho SĐT (sau +84):', phoneDigits);

   
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    // ------------------------

    setIsLoading(false);
    alert(`Nếu số điện thoại +84 ${phoneDigits} đã được đăng ký, một hướng dẫn đặt lại mật khẩu (hoặc mã OTP) sẽ được gửi đến bạn.`);
    
    
    navigate('/otp-reset-password', { state: { phoneNumber: `+84 ${phoneDigits}` } });
   
   
  };

  return (
    <div className="forgot-password-container">
      <header className="zalo-header">
        <h1>Zalo</h1>
      </header>

      <main className="forgot-password-form-wrapper">
        <h2>Quên mật khẩu?</h2>
        <p className="forgot-password-instruction">
          Đừng lo lắng! Vui lòng nhập số điện thoại đã đăng ký Zalo của bạn để chúng tôi có thể hỗ trợ bạn đặt lại mật khẩu.
        </p>

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="country-code-selector-forgot">+84</span>
            <input
              type="tel"
              placeholder="Số điện thoại "
              className="input-field phone-input-forgot"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className="error-message-fp">{error}</p>}

          <button type="submit" className="forgot-password-button" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
          </button>
        </form>

        <div className="back-to-login-section">
          <Link to="/login" className="back-to-login-link-fp">
            Quay lại Đăng nhập
          </Link>
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;