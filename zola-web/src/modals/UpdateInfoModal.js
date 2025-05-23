import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/UpdateInfoModal.css';

const UpdateInfoModal = ({ isOpen, onClose, userData }) => {
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const mapGenderToUI = (value) => {
    if (!value) return '';
    return value.toLowerCase() === 'male' ? 'Nam' : value.toLowerCase() === 'female' ? 'Nữ' : '';
  };

  const mapGenderToServer = (value) => {
    if (!value) return '';
    return value === 'Nam' ? 'male' : value === 'Nữ' ? 'female' : '';
  };

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.userName || '');
      setGender(mapGenderToUI(userData.gender));
      setDay(userData.dateOfBirth?.day || '01');
      setMonth(userData.dateOfBirth?.month || '01');
      setYear(userData.dateOfBirth?.year || '2000');
    }
  }, [userData]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setDisplayName(storedUser.userName || '');
      setGender(mapGenderToUI(storedUser.gender));
      const dob = storedUser.dateOfBirth || '01/01/2000';
      const [d, m, y] = dob.split('/');
      setDay(d || '01');
      setMonth(m || '01');
      setYear(y || '2000');
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchUser = async () => {
      if (isOpen && userData?._id) {
        try {
          const res = await fetch('http://localhost:3001/user/findUserByUserID', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userData._id }),
          });

          const result = await res.json();
          const user = result.user;

          if (user) {
            setDisplayName(user.userName || '');
            setGender(mapGenderToUI(user.gender));
            const dob = user.dateOfBirth || '01/01/2000';
            const [parsedDay, parsedMonth, parsedYear] = dob.split('/');
            setDay(parsedDay || '01');
            setMonth(parsedMonth || '01');
            setYear(parsedYear || '2000');
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
      }
    };

    fetchUser();
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  const handleSubmit = async () => {
    try {
      const formattedDOB = `${day}/${month}/${year}`;
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const genderServer = mapGenderToServer(gender);

      const response = await fetch('http://localhost:3001/user/updateUserWeb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: storedUser._id,
          userName: displayName,
          gender: genderServer,
          dateOfBirth: formattedDOB,
        }),
      });

      const data = await response.json();
      if (data.message === 'Cập nhật thông tin thành công!!!') {
        alert('Cập nhật thành công!');
        localStorage.setItem('user', JSON.stringify(data.user));
        onClose();
      } else {
        alert('Cập nhật thất bại!');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật thông tin:', err);
      alert('Lỗi kết nối server!');
    }
  };

  const modalContent = (
    <div className="update-modal-overlay" onClick={onClose}>
      <div className="update-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="update-modal-header">
          <button className="update-modal-back-btn" onClick={onClose}>
            &#x2190;
          </button>
          <h2>Cập nhật thông tin cá nhân</h2>
          <button className="update-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="update-modal-body">
          <div className="form-group">
            <label htmlFor="displayName">Tên hiển thị</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <div className="gender-options">
              <label htmlFor="male">
                <input
                  type="radio"
                  id="male"
                  name="gender"
                  value="Nam"
                  checked={gender === 'Nam'}
                  onChange={(e) => setGender(e.target.value)}
                />
                Nam
              </label>
              <label htmlFor="female">
                <input
                  type="radio"
                  id="female"
                  name="gender"
                  value="Nữ"
                  checked={gender === 'Nữ'}
                  onChange={(e) => setGender(e.target.value)}
                />
                Nữ
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <div className="dob-selects">
              <select value={day} onChange={(e) => setDay(e.target.value)}>
                {days.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                {months.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="update-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Hủy</button>
          <button className="submit-btn" onClick={handleSubmit}>Cập nhật</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.getElementById('modal-root'));
};

export default UpdateInfoModal;
