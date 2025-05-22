import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/register.css';
import { FaEye, FaEyeSlash, FaUser, FaPhoneAlt, FaCalendarAlt, FaVenusMars, FaLock } from 'react-icons/fa';

function ZaloRegistration() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [gender, setGender] = useState(''); // 'male', 'female', 'other'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Mật khẩu nhập lại không khớp!');
      return;
    }
    const formData = {
      fullName,
      phoneNumber,
      dateOfBirth: `${dobDay}/${dobMonth}/${dobYear}`,
      gender,
      password,
    };
    console.log('Dữ liệu đăng ký:', formData);
    alert('Đăng ký thành công! (Đây là giả lập, vui lòng quay lại đăng nhập)');
    navigate('/login');
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="zalo-register-container">
      <header className="zalo-header">
        <h1>Zalo</h1>
        <p>Tạo tài khoản mới để bắt đầu kết nối</p>
      </header>

      <main className="register-form-wrapper">
        <form className="register-form" onSubmit={handleRegister}>
          <h2>Tạo tài khoản</h2>

          <div className="input-group">
            <span className="input-icon"><FaUser /></span>
            <input
              type="text"
              placeholder="Họ và tên"
              className="input-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon"><FaPhoneAlt /></span>
             <div className="country-code-selector-register">
              <span>+84</span>
            </div>
            <input
              type="tel"
              placeholder="Số điện thoại"
              className="input-field phone-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <label className="form-label dob-label"><FaCalendarAlt /> Ngày sinh</label>
          <div className="dob-group">
            <select value={dobDay} onChange={(e) => setDobDay(e.target.value)} required className="dob-select">
              <option value="">Ngày</option>
              {days.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
            <select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} required className="dob-select">
              <option value="">Tháng</option>
              {months.map(month => <option key={month} value={month}>{month}</option>)}
            </select>
            <select value={dobYear} onChange={(e) => setDobYear(e.target.value)} required className="dob-select">
              <option value="">Năm</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <label className="form-label gender-label"><FaVenusMars /> Giới tính</label>
          <div className="gender-group">
            <label className="radio-label">
              <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={(e) => setGender(e.target.value)} required /> Nam
            </label>
            <label className="radio-label">
              <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={(e) => setGender(e.target.value)} /> Nữ
            </label>
            {/* <label className="radio-label">
              <input type="radio" name="gender" value="other" checked={gender === 'other'} onChange={(e) => setGender(e.target.value)} /> Khác
            </label> */}
          </div>

          <div className="input-group password-group">
            <span className="input-icon"><FaLock /></span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password-button"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="input-group password-group">
            <span className="input-icon"><FaLock /></span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password-button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="register-button">
            Đăng ký
          </button>

          <div className="login-link-section">
            <p>Đã có tài khoản?</p>
            <Link to="/login" className="back-to-login-link">Đăng nhập ngay</Link>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ZaloRegistration;