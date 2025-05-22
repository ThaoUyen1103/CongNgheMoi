import React, { useState, useEffect } from 'react';
import '../styles/RenameGroupModal.css'; // Import CSS
import { FaTimes } from 'react-icons/fa';

function RenameGroupModal({
  isOpen,
  onClose,
  onConfirmRename,
  currentGroupName,
  groupMembers = [] // Mảng các thành viên để hiển thị avatar preview
}) {
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewGroupName(currentGroupName || '');
    }
  }, [isOpen, currentGroupName]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (newGroupName.trim() && newGroupName.trim() !== currentGroupName) {
      onConfirmRename(newGroupName.trim());
    }
    onClose(); // Đóng modal dù có đổi tên hay không, hoặc chỉ đóng khi xác nhận
  };

  const firstThreeMembers = groupMembers.slice(0, 3);

  return (
    <div className={`rename-group-modal-overlay ${isOpen ? 'active' : ''}`} onMouseDown={onClose}>
      <div className="rename-group-modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <div className="rename-group-modal-header">
          <span style={{width: '32px'}}></span>
          <h3>Đổi tên nhóm</h3>
          <button className="rename-group-modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="rename-group-modal-body">
          <div className="rename-group-avatar-preview">
            {/* Hiển thị 3 avatar thành viên nếu có */}
            {firstThreeMembers.length > 0 ? (
              firstThreeMembers.map((member, index) => (
                <div key={member.id || index} className="composite-avatar-item">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.name} />
                  ) : (
                    <span>{(member.name || '?').charAt(0).toUpperCase()}</span>
                  )}
                </div>
              ))
            ) : (
              <span style={{fontSize: '24px', color: '#8a8d91'}}> {/* Placeholder nếu không có members */}
                📷
              </span>
            )}
          </div>
          <p className="rename-group-instruction">
            Bạn có chắc chắn muốn đổi tên nhóm, khi xác nhận tên nhóm mới sẽ hiển thị với tất cả thành viên.
          </p>
          <input
            type="text"
            className="rename-group-input"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Nhập tên nhóm mới"
            maxLength={100}
          />
        </div>
        <div className="rename-group-modal-footer">
          <button className="rename-group-btn cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="rename-group-btn confirm"
            onClick={handleConfirm}
            disabled={!newGroupName.trim() || newGroupName.trim() === currentGroupName}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default RenameGroupModal;