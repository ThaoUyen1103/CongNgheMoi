import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../styles/AddFriendModal.css';
import { FaChevronDown, FaUserFriends } from 'react-icons/fa'; // Icon cho dropdown và "Có thể bạn quen"

const mockSuggestedFriends = [
  { id: 1, avatar: 'HN', name: 'Hưng Nguyễn', suggestionSource: 'Từ gợi ý kết bạn' },
  { id: 2, avatar: 'LNQ', name: 'Lê Ngọc Quý', suggestionSource: 'Từ gợi ý kết bạn' },
  { id: 3, avatar: 'MT', name: 'Mai Trang', suggestionSource: 'Từ gợi ý kết bạn' },
];

const AddFriendModal = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  const handleSearch = () => {
    console.log('Tìm kiếm SĐT:', phoneNumber);
    // Thêm logic tìm kiếm ở đây
    // onClose(); // Có thể đóng modal sau khi tìm kiếm
  };

  const handleAddFriend = (friendId) => {
    console.log('Kết bạn với ID:', friendId);
    // Thêm logic kết bạn ở đây
  };

  const modalContent = (
    <div className="add-friend-modal-overlay" onClick={onClose}>
      <div className="add-friend-modal-content" onClick={e => e.stopPropagation()}>
        <div className="add-friend-modal-header">
          <h2>Thêm bạn</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="add-friend-modal-body">
          <div className="phone-input-section">
            <div className="country-code-selector">
              <span className="country-flag">🇻🇳</span>
              <span>(+84)</span>
              <FaChevronDown className="dropdown-arrow" />
            </div>
            <input
              type="tel"
              className="phone-input"
              placeholder="Số điện thoại"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="suggested-friends-section">
            <h3 className="suggested-friends-title">
              <FaUserFriends className="title-icon" /> Có thể bạn quen
            </h3>
            <ul className="suggested-friends-list">
              {mockSuggestedFriends.map(friend => (
                <li key={friend.id} className="suggested-friend-item">
                  <div className="suggested-friend-avatar">
                    {friend.avatarUrl ? <img src={friend.avatarUrl} alt={friend.name} /> : friend.avatar}
                  </div>
                  <div className="suggested-friend-info">
                    <span className="suggested-friend-name">{friend.name}</span>
                    <span className="suggested-friend-source">{friend.suggestionSource}</span>
                  </div>
                  <button 
                    className="add-friend-btn-item"
                    onClick={() => handleAddFriend(friend.id)}
                  >
                    Kết bạn
                  </button>
                </li>
              ))}
            </ul>
            <button className="see-more-btn">Xem thêm</button>
          </div>
        </div>
        <div className="add-friend-modal-footer">
          <button className="cancel-btn-modal" onClick={onClose}>Hủy</button>
          <button className="search-btn-modal" onClick={handleSearch}>Tìm kiếm</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root') // Đảm bảo bạn có div này trong public/index.html
  );
};

export default AddFriendModal;