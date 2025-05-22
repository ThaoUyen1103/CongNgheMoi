// Tạo nhóm

import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import '../styles/CreateGroupModal.css';
import { FaCamera, FaSearch } from 'react-icons/fa';

const mockContactsData = [
  { id: 'u1', name: 'Thảo Uyên', avatar: 'TU', category: 'recent', avatarUrl: 'https://i.pravatar.cc/40?u=u1' },
  { id: 'u2', name: 'C4', avatar: 'C4', category: 'recent', avatarUrl: 'https://i.pravatar.cc/40?u=u2' },
  { id: 'u3', name: 'Mạnh', avatar: 'M', category: 'recent', avatarUrl: 'https://i.pravatar.cc/40?u=u3' },
  { id: 'u4', name: 'Trương Thị Tường Vi', avatar: 'TV', category: 'recent', avatarUrl: 'https://i.pravatar.cc/40?u=u4' },
  { id: 'u5', name: 'Nguyen Thi Hanh', avatar: 'NH', category: 'recent', avatarUrl: 'https://i.pravatar.cc/40?u=u5' },
  { id: 'u6', name: 'A2', avatar: 'A2', category: 'friends', avatarUrl: 'https://i.pravatar.cc/40?u=u6' },
  { id: 'u7', name: 'A3', avatar: 'A3', category: 'friends', avatarUrl: 'https://i.pravatar.cc/40?u=u7' },
  { id: 'u8', name: 'Bình An', avatar: 'BA', category: 'family', avatarUrl: 'https://i.pravatar.cc/40?u=u8' },
  { id: 'u9', name: 'Bảo Châu', avatar: 'BC', category: 'work', avatarUrl: 'https://i.pravatar.cc/40?u=u9' },
  { id: 'u10', name: 'Khách Hàng VIP', avatar: 'KH', category: 'customers', avatarUrl: 'https://i.pravatar.cc/40?u=u10' },
];

// filterTabs không còn được sử dụng trong JSX nhưng logic lọc vẫn có thể dựa vào nó
// Nếu bạn muốn khôi phục filter tabs, hãy bỏ comment phần JSX liên quan.

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [activeFilterTab, setActiveFilterTab] = useState('all'); // Giữ lại nếu logic lọc vẫn dùng
  const [groupAvatarPreview, setGroupAvatarPreview] = useState(null); // State để lưu ảnh preview (URL)
  const [groupAvatarFile, setGroupAvatarFile] = useState(null); // State để lưu File object

  const avatarInputRef = useRef(null); // Ref cho input file ẩn

  const filteredAndSearchedContacts = useMemo(() => {
    let contacts = mockContactsData;
    if (activeFilterTab !== 'all' && activeFilterTab !== 'recent') {
      contacts = contacts.filter(c => c.category === activeFilterTab);
    } else if (activeFilterTab === 'recent') {
        contacts = contacts.filter(c => c.category === 'recent');
    }

    if (searchTerm) {
      contacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return contacts.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, activeFilterTab]);

  const groupedContacts = useMemo(() => {
    return filteredAndSearchedContacts.reduce((acc, contact) => {
      const firstLetter = contact.name[0]?.toUpperCase() || '?';
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(contact);
      return acc;
    }, {});
  }, [filteredAndSearchedContacts]);

  useEffect(() => {
    // Reset state khi modal đóng hoặc mở
    if (isOpen) {
        setGroupName('');
        setSearchTerm('');
        setSelectedMemberIds([]);
        setActiveFilterTab('all');
        setGroupAvatarPreview(null);
        setGroupAvatarFile(null);
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const handleMemberSelect = (memberId) => {
    setSelectedMemberIds(prevSelected =>
      prevSelected.includes(memberId)
        ? prevSelected.filter(id => id !== memberId)
        : [...prevSelected, memberId]
    );
  };

  const handleCreateGroup = () => {
    console.log('Tạo nhóm:', groupName);
    console.log('Thành viên đã chọn:', selectedMemberIds);
    console.log('Ảnh đại diện nhóm (file):', groupAvatarFile); 
    // Tại đây bạn sẽ xử lý việc upload groupAvatarFile (nếu có) và tạo nhóm
    onClose();
  };
  
  const handleAvatarUploadButtonClick = () => {
    avatarInputRef.current.click(); // Kích hoạt input file ẩn
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setGroupAvatarFile(file); // Lưu File object
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupAvatarPreview(reader.result); // Tạo URL để preview
      };
      reader.readAsDataURL(file);
    } else {
      // Xử lý nếu file không phải là ảnh (ví dụ: thông báo lỗi)
      console.log('Vui lòng chọn một file ảnh.');
      setGroupAvatarFile(null);
      setGroupAvatarPreview(null);
    }
    event.target.value = null; // Reset input để có thể chọn lại cùng file
  };

  const modalContent = (
    <div className="create-group-modal-overlay" onClick={onClose}>
      <div className="create-group-modal-content" onClick={e => e.stopPropagation()}>
        <div className="create-group-modal-header">
          <h2>Tạo nhóm</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="create-group-modal-body">
          <div className="group-name-input-section">
            <button className="group-avatar-upload-btn" onClick={handleAvatarUploadButtonClick}>
              {groupAvatarPreview ? (
                <img src={groupAvatarPreview} alt="Group Avatar Preview" className="group-avatar-preview" />
              ) : (
                <FaCamera />
              )}
            </button>
            {/* Input file ẩn */}
            <input
              type="file"
              ref={avatarInputRef}
              style={{ display: 'none' }}
              accept="image/*" // Chỉ chấp nhận file ảnh
              onChange={handleAvatarFileChange}
            />
            <input
              type="text"
              className="group-name-input"
              placeholder="Nhập tên nhóm..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className="member-search-input-section">
            <FaSearch className="search-icon-members" />
            <input
              type="text"
              className="member-search-input"
              placeholder="Nhập tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Bỏ comment phần này nếu bạn muốn sử dụng lại filter tabs
          <div className="filter-tabs-container">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                className={`filter-tab-btn ${activeFilterTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveFilterTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          */}

          <div className="contact-list-section">
            {Object.keys(groupedContacts).length > 0 ? (
              Object.entries(groupedContacts).map(([letter, contacts]) => (
                <div key={letter} className="contact-group-by-letter">
                  {/* Điều chỉnh logic hiển thị tiêu đề nếu cần */}
                  {(activeFilterTab === 'all' && !searchTerm) && <h4 className="contact-letter-header">{letter}</h4>}
                  {/* Ví dụ: hiển thị "Trò chuyện gần đây" nếu activeFilterTab là 'recent' */}
                  {/* {activeFilterTab === 'recent' && letter === Object.keys(groupedContacts)[0] && (
                     <h4 className="contact-list-title">Trò chuyện gần đây</h4>
                  )} */}

                  <ul className="contact-list-modal">
                    {contacts.map(contact => (
                      <li key={contact.id} className="contact-item-modal">
                        <label htmlFor={`member-${contact.id}`} className="contact-item-label">
                          <input
                            type="checkbox"
                            id={`member-${contact.id}`}
                            className="member-select-checkbox"
                            checked={selectedMemberIds.includes(contact.id)}
                            onChange={() => handleMemberSelect(contact.id)}
                          />
                          <div className="contact-avatar-modal">
                            {contact.avatarUrl ? <img src={contact.avatarUrl} alt={contact.name} /> : contact.avatar}
                          </div>
                          <span className="contact-name-modal">{contact.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="no-contacts-found">{searchTerm ? 'Không tìm thấy liên hệ nào.' : 'Không có liên hệ để hiển thị.'}</p>
            )}
          </div>
        </div>
        <div className="create-group-modal-footer">
          <button className="cancel-btn-modal" onClick={onClose}>Hủy</button>
          <button 
            className="create-group-btn-modal" 
            onClick={handleCreateGroup}
            disabled={!groupName || selectedMemberIds.length === 0}
          >
            Tạo nhóm ({selectedMemberIds.length})
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root') // Đảm bảo có thẻ div với id="modal-root" trong index.html của bạn
  );
};

export default CreateGroupModal;