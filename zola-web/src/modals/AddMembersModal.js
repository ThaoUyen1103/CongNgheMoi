import React, { useState, useEffect, useMemo } from 'react';
import '../styles/AddMembersModal.css';
import { FaTimes, FaSearch } from 'react-icons/fa';

function AddMembersModal({
  isOpen,
  onClose,
  onConfirm,
  recentConversations = [],
  contacts = [],
  currentGroupMemberIds = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('all'); 
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setActiveFilterTab('all');
      const preSelectedMembers = contacts
        .filter(c => currentGroupMemberIds.includes(c.id))
        .map(c => c.id);
      setSelectedUserIds(preSelectedMembers);
    } else {
      setSelectedUserIds([]);
    }
  }, [isOpen, contacts, currentGroupMemberIds]);

  const getIsAlreadyMember = (userId) => currentGroupMemberIds.includes(userId);

  const handleToggleUserSelection = (userId) => {
    if (getIsAlreadyMember(userId)) return;

    setSelectedUserIds(prevSelected =>
      prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const cleanUserName = (name) => {
    if (typeof name !== 'string') return '';
    return name.replace(/\s*\(Liên hệ\)|\s*\(Đã trong nhóm\)/gi, '').trim();
  };

  const processedContacts = useMemo(() => {
    return contacts.map(contact => ({
      ...contact,
      name: cleanUserName(contact.name),
      isAlreadyMember: getIsAlreadyMember(contact.id)
    }));
  }, [contacts, currentGroupMemberIds]);
  
  const filteredContactsForDisplay = useMemo(() => {
    return processedContacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedContacts, searchTerm]);

  const groupedContacts = useMemo(() => {
    const groups = {};
    filteredContactsForDisplay.forEach(contact => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (/[A-ZÀÁẠẢÃĂẰẮẶẲẴÂẦẤẬẨẪĐÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ]/.test(firstLetter)) {
        if (!groups[firstLetter]) {
          groups[firstLetter] = [];
        }
        groups[firstLetter].push(contact);
      } else { 
        if (!groups['#']) groups['#'] = [];
        groups['#'].push(contact);
      }
    });
    Object.keys(groups).forEach(letter => {
        groups[letter].sort((a,b) => a.name.localeCompare(b.name, 'vi'));
    });
    const sortedGroupEntries = Object.entries(groups).sort(([keyA], [keyB]) => {
        if (keyA === '#') return 1;
        if (keyB === '#') return -1;
        return keyA.localeCompare(keyB, 'vi');
    });
    return sortedGroupEntries;
  }, [filteredContactsForDisplay]);

  const recentContactsToDisplay = useMemo(() => {
    return recentConversations
        .map(contact => ({ 
            ...contact, 
            name: cleanUserName(contact.name),
            isAlreadyMember: getIsAlreadyMember(contact.id) 
        }))
        .filter(contact => contact.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [recentConversations, searchTerm, currentGroupMemberIds]);


  const renderUserItem = (user) => {
    const isSelected = selectedUserIds.includes(user.id);
    
    return (
      <div key={user.id} className="add-members-user-item">
        {/* THAY ĐỔI THỨ TỰ: Checkbox lên trước */}
        <div className="checkbox-container">
            <input
                type="checkbox"
                id={`add-member-${user.id}`}
                checked={user.isAlreadyMember || isSelected}
                onChange={() => handleToggleUserSelection(user.id)}
                disabled={user.isAlreadyMember}
            />
        </div>
        {/* Avatar và Tên/Status theo sau */}
        <div className="user-identification-wrapper"> 
            <div className={`avatar ${user.avatarUrl ? '' : 'initial-avatar'}`}>
            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : (user.name ? user.name.charAt(0).toUpperCase() : '?')}
            </div>
            <div className="add-members-user-info">
            <span className="name">{user.name}</span>
            {user.isAlreadyMember && <span className="status">Đã tham gia</span>}
            </div>
        </div>
      </div>
    );
  };

  const handleConfirm = () => {
    const newMembersToAdd = selectedUserIds.filter(id => !getIsAlreadyMember(id));
    onConfirm(newMembersToAdd); 
  };
  
  const newSelectionsCount = selectedUserIds.filter(id => !getIsAlreadyMember(id)).length;

  if (!isOpen) {
    return null;
  }

  const noResultsFound = searchTerm && recentContactsToDisplay.length === 0 && filteredContactsForDisplay.length === 0;

  return (
    <div className={`add-members-modal-overlay ${isOpen ? 'active' : ''}`} onMouseDown={onClose}>
      <div className="add-members-modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <div className="add-members-modal-header">
          <h3>Thêm thành viên</h3>
          <button className="add-members-modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="add-members-modal-body">
          <div className="add-members-search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Nhập tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="add-members-list-section">
            {recentContactsToDisplay.length > 0 && (
              <>
                <h4>Trò chuyện gần đây</h4>
                {recentContactsToDisplay.map(user => renderUserItem(user))}
              </>
            )}
            
            {groupedContacts.length > 0 && groupedContacts.map(([letter, usersInGroup]) => {
                const usersToShowInGroup = usersInGroup.filter(u => !recentContactsToDisplay.find(rc => rc.id === u.id));
                if (usersToShowInGroup.length === 0) return null;

                return (
                    <div key={letter}>
                    <h4>{letter}</h4>
                    {usersToShowInGroup.map(user => renderUserItem(user))}
                    </div>
                )
            })}

            {noResultsFound && <p className="empty-add-members-list">Không tìm thấy kết quả nào.</p>}
            {!searchTerm && recentContactsToDisplay.length === 0 && filteredContactsForDisplay.length === 0 && (
                 <p className="empty-add-members-list">Không có liên hệ nào để hiển thị.</p>
            )}
            
          </div>
        </div>
        <div className="add-members-modal-footer">
          <button className="add-members-footer-btn cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="add-members-footer-btn confirm"
            onClick={handleConfirm}
            disabled={newSelectionsCount === 0} 
          >
            Xác nhận {newSelectionsCount > 0 ? `(${newSelectionsCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddMembersModal;