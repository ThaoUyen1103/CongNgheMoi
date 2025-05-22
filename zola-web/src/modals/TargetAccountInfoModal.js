// thông tin chi tiết tài khoản của người dùng

import React from 'react';
import '../styles/TargetAccountInfoModal.css'; // Import CSS
import { FaTimes, FaPhone, FaCommentDots } from 'react-icons/fa'; // Ví dụ icon

function TargetAccountInfoModal({ isOpen, onClose, userData }) {
  if (!isOpen || !userData) {
    return null;
  }

  // Sử dụng placeholder nếu thiếu thông tin
  const name = userData.name || "Không có tên";
  const avatar = userData.avatar; // Chữ cái đầu
  const avatarUrl = userData.avatarUrl; // URL ảnh
  const coverPhotoUrl = userData.coverPhotoUrl || "https://via.placeholder.com/400x150?text=Ảnh+bìa"; // Placeholder
  const gender = userData.gender || "Chưa cập nhật";
  const dob = userData.dob || "Chưa cập nhật";
  const phone = userData.phone || "Chưa cập nhật";

  return (
    <div className={`target-account-info-overlay ${isOpen ? 'active' : ''}`} onMouseDown={onClose}>
      <div className="target-account-info-modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <div className="target-account-info-header">
          <span style={{width: '32px'}}></span> {/* Spacer để tiêu đề căn giữa */}
          <h3>Thông tin tài khoản</h3>
          <button className="target-account-info-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="target-profile-section">
          <div className="target-cover-photo">
            <img src={coverPhotoUrl} alt="Ảnh bìa" onError={(e) => e.target.src = "https://via.placeholder.com/400x150?text=Ảnh+bìa"} />
          </div>
          <div className="target-profile-avatar-container">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} onError={(e) => e.target.style.display = 'none'}/>
            ) : (
              <div className="avatar-content">{avatar || name.charAt(0).toUpperCase()}</div>
            )}
             {/* Nếu avatarUrl lỗi hoặc không có, và avatar (chữ) cũng không có, thì hiển thị chữ cái đầu của tên */}
            {!avatarUrl && !avatar && name && <div className="avatar-content">{name.charAt(0).toUpperCase()}</div>}
          </div>
        </div>

        <h2 className="target-profile-name">{name}</h2>

        {/* Các nút hành động ví dụ */}
        <div className="target-profile-actions">
          <button className="target-profile-action-btn">
            <FaPhone style={{ marginRight: '5px' }} /> Gọi điện
          </button>
          <button className="target-profile-action-btn primary">
            <FaCommentDots style={{ marginRight: '5px' }} /> Nhắn tin
          </button>
        </div>

        <div className="target-details-section">
          <h4>Thông tin cá nhân</h4>
          <div className="target-info-item">
            <strong>Giới tính:</strong>
            <span>{gender}</span>
          </div>
          <div className="target-info-item">
            <strong>Ngày sinh:</strong>
            <span>{dob}</span>
          </div>
          <div className="target-info-item">
            <strong>Điện thoại:</strong>
            <span>{phone}</span>
          </div>
        </div>
        
        {/* Các section khác có thể thêm ở đây */}
        {/* Ví dụ:
        <div className="target-details-section">
          <h4>Hình ảnh</h4>
          <p className="target-placeholder-text">Chưa có ảnh nào được chia sẻ.</p>
        </div>
        */}

      </div>
    </div>
  );
}

export default TargetAccountInfoModal;