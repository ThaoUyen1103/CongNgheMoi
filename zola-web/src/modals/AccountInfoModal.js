// File này là thông tin tài khoản nằm trong nút cài đặt

import React from 'react';
import ReactDOM from 'react-dom';
import '../styles/AccountInfoModal.css';

const AccountInfoModal = ({ isOpen, onClose, userData, onOpenUpdateModal  }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content account-info-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thông tin tài khoản</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="account-profile-header">
            <div className="cover-photo">
              <img src="https://via.placeholder.com/560x190?text=Ảnh+bìa" alt="Cover" />
            </div>
            <div className="avatar-section-modal">
              <div className="profile-avatar-wrapper-modal">
                <img src="https://via.placeholder.com/100x100?text=M" alt="Avatar" className="profile-avatar-modal" />
                <button className="change-avatar-btn-modal">📷</button>
              </div>
            </div>
            <div className="profile-name-section-modal">
              <span className="profile-name-modal">Mến</span>
              <button className="edit-name-btn-modal">✏️</button>
            </div>
          </div>
          <div className="account-personal-info">
            <h4>Thông tin cá nhân</h4>
            <div className="info-grid">
              
              <div className="info-item">
                <span className="info-label">Giới tính: </span>
                <span className="info-value">Nam</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày sinh: </span>
                <span className="info-value">01 tháng 01, 2002</span>
              </div>
              <div className="info-item">
                <span className="info-label">Điện thoại: </span>
                <span className="info-value sensitive-info">+84 869 751 637</span>
              </div>
            </div>
            <p className="phone-privacy-note">
              Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="update-profile-btn" onClick={onOpenUpdateModal}>✏️ Cập nhật</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')
  );
};

export default AccountInfoModal;