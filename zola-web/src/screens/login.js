import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa'; // Thêm FaLock vào đây

function ZaloLogin({ onLoginSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // Thêm e.preventDefault() nếu đây là form submit
    console.log('Đăng nhập với:', { phoneNumber, password });
    
    // Logic đăng nhập giả lập
    // Trong thực tế, bạn sẽ gọi API ở đây
    // Ví dụ: if (phoneNumber === "0123456789" && password === "password123")
    const loginWasSuccessful = true; 

    if (loginWasSuccessful) {
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      navigate('/app');
    } else {
      console.log('Đăng nhập thất bại!');
      alert('Số điện thoại hoặc mật khẩu không đúng!');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="zalo-login-container">
      <header className="zalo-header">
        <h1>Zalo</h1>
        <p>Đăng nhập tài khoản Zalo để kết nối với ứng dụng Zalo Web</p>
      </header>

      <main className="login-form-wrapper">
        <form className="login-form" onSubmit={handleLogin}> 
          <h2>Đăng nhập với mật khẩu</h2>
          <div className="input-group">
            <div className="country-code-selector">
              <span>+84</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 10l5 5 5-5H7z"></path>
              </svg>
            </div>
            <input
              type="tel"
              placeholder="Số điện thoại"
              className="input-field"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
              required
            />
          </div>
          <div className="input-group password-group">
            <span className="input-icon">
              <FaLock />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password-button"
              onClick={toggleShowPassword}
              title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {/* Đổi type của button này thành "submit" */}
          <button type="submit" className="login-button"> 
            Đăng nhập
          </button>
          <Link to="/forgot-password" /* Hoặc path thực tế của bạn */ className="forgot-password-link"> 
            Quên mật khẩu
          </Link>
        </form>

        <div className="create-account-section">
          <p>Chưa có tài khoản?</p>
          <Link to="/register" className="create-account-link">
            Tạo tài khoản mới
          </Link>
        </div>
      </main>

      <footer className="qr-login-footer">
        {/* Bạn có thể thêm link đăng nhập bằng QR code ở đây nếu muốn */}
        {/* <Link to="/qr-login" className="qr-login-link">Đăng nhập với mã QR</Link> */}
      </footer>
    </div>
  );
}

export default ZaloLogin;