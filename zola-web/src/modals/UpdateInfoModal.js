import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/UpdateInfoModal.css'; // Đảm bảo bạn có CSS cho nút quay lại nếu cần

const UpdateInfoModal = ({ isOpen, onClose, userData, onUpdate }) => {
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.name || '');
      setGender(userData.gender || 'Nam');
      setDay(userData.dob?.day || '01');
      setMonth(userData.dob?.month || '01');
      setYear(userData.dob?.year || '2002');
    }
  }, [userData]);

  if (!isOpen) return null;

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  const handleSubmit = () => {
    onUpdate({
      name: displayName,
      gender,
      dob: { day, month, year },
    });
  };

  const modalContent = (
    <div className="update-modal-overlay" onClick={onClose}> {/* Kích lớp phủ cũng sẽ quay lại */}
      <div className="update-modal-content" onClick={e => e.stopPropagation()}>
        <div className="update-modal-header">
          {/* Nút mũi tên quay lại */}
          <button className="update-modal-back-btn" onClick={onClose}>
            &#x2190; {/* Ký tự mũi tên trái */}
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
            <label>Thông tin cá nhân</label>
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
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="update-modal-footer">
          {/* Nút Hủy giờ cũng sẽ gọi props.onClose để quay lại */}
          <button className="cancel-btn" onClick={onClose}>Hủy</button>
          <button className="submit-btn" onClick={handleSubmit}>Cập nhật</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')
  );
};

export default UpdateInfoModal;