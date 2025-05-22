import React, { useState, useEffect, useRef } from 'react';
import '../styles/Sidebar.css';

import { MdOutlinePersonAddAlt, MdOutlineGroupAdd } from "react-icons/md";
import { FaUsers, FaAddressBook } from "react-icons/fa";
import { IoMdSettings, IoIosCloud, IoIosChatbubbles, IoIosContacts } from "react-icons/io";
import { RiContactsBookLine } from "react-icons/ri";

const mockChats = [
  { id: 1, avatar: 'TU', name: 'Thảo Uyên', message: 'Hình ảnh', time: '31 phút', unread: 0, type: 'user', online: true, messages: [ {id: 'm1', sender: 'Thảo Uyên', text: 'Bạn gửi một ảnh.', type: 'image', time: '13:14'}, {id: 'm2', sender: 'me', text: 'Ok bạn', type: 'text', time: '13:15'}] },
  { id: 2, avatar: 'CL', name: 'CLB D36', message: 'Công Đức: @All nhớ cập nhật vi...', time: '3 giờ', unread: 5, type: 'group', messages: [{id: 'm3', sender: 'Công Đức', text: '@All nhớ cập nhật thông tin câu lạc bộ đầy đủ nhé các thành viên ơi.', type: 'text', time: '10:00'}] },
];

function Sidebar({
  onSelectChat,
  currentSelectedChatId,
  onOpenAccountInfoModal,
  onOpenSettingsModal,
  onOpenAddFriendModal,
  onOpenCreateGroupModal, // Thêm prop này
  activeView,
  setActiveView,
  activeContactsNavItem,
  setActiveContactsNavItem
}) {
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const settingsRef = useRef(null);

  const settingsMenuItems = [
    { id: 'profile', label: 'Thông tin tài khoản', action: () => { if(onOpenAccountInfoModal) onOpenAccountInfoModal(); } },
    { id: 'settings', label: 'Cài đặt', action: () => { if(onOpenSettingsModal) onOpenSettingsModal(); } },
    { id: 'logout', label: 'Đăng xuất', separatorBefore: true, action: () => console.log('Logout') },
  ];

  const toggleSettingsDropdown = (event) => {
    event.stopPropagation();
    setIsSettingsDropdownOpen(prev => !prev);
  };

  const handleMenuItemClick = (itemAction) => {
    if (itemAction) {
      itemAction();
    }
    setIsSettingsDropdownOpen(false);
  };

  const handleChatItemClick = (chat) => {
    if (onSelectChat) {
      onSelectChat(chat);
    }
    if (setActiveView) {
        setActiveView('chats');
    }
  };

  const handleIconBarClick = (viewName) => {
    if (setActiveView) {
      setActiveView(viewName);
    }
  };

  const handleContactsNavItemClick = (itemId) => {
    if (setActiveContactsNavItem) {
      setActiveContactsNavItem(itemId);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target) &&
          !event.target.closest('.settings-btn')) {
        setIsSettingsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsRef]);

  const contactsNavItems = [
    { id: 'friends', label: 'Danh sách bạn bè', icon: <RiContactsBookLine /> },
    { id: 'groups', label: 'Danh sách nhóm và cộng đồng', icon: <FaUsers /> },
    { id: 'friend_requests', label: 'Lời mời kết bạn', icon: <MdOutlinePersonAddAlt /> },
  ];

  return (
    <>
      <div className="sidebar">
        <div className="icon-bar">
           <div className="icon-bar-top">
            <button className="icon-btn brand-icon" title="Zalo">Z</button>
            <div className="separator"></div>
            <button
              className={`icon-btn ${activeView === 'chats' ? 'active-icon-bar' : ''}`}
              title="Tin nhắn"
              onClick={() => handleIconBarClick('chats')}
            >
              <IoIosChatbubbles />
              <span className="notification-badge">5+</span>
            </button>
            <button
              className={`icon-btn ${activeView === 'contacts' ? 'active-icon-bar' : ''}`}
              title="Danh bạ"
              onClick={() => handleIconBarClick('contacts')}
            >
              <IoIosContacts />
            </button>
          </div>
          <div className="icon-bar-middle">
            <button className="icon-btn" title="Cloud của tôi"><IoIosCloud /></button>
          </div>
          <div className="icon-bar-bottom" ref={settingsRef}>
            <div className="separator"></div>
            <button className="icon-btn settings-btn" title="Cài đặt" onClick={toggleSettingsDropdown}><IoMdSettings /></button>
            {isSettingsDropdownOpen && (
            <div className="settings-dropdown">
                <ul>
                {settingsMenuItems.map(item => (
                    <React.Fragment key={item.id}>
                    {item.separatorBefore && <li className="dropdown-separator"></li>}
                    <li onClick={() => handleMenuItemClick(item.action)}>
                        <a href="#">{item.label}</a>
                    </li>
                    </React.Fragment>
                ))}
                </ul>
            </div>
            )}
          </div>
        </div>

        <div className="main-sidebar-area">
          {activeView === 'chats' && (
            <>
              <div className="sidebar-header">
                <div className="search-bar-container">
                  <span className="search-icon">🔍</span>
                  <input type="text" placeholder="Tìm kiếm" className="search-input" />
                </div>
                <div className="action-icons">
                  <button 
                    className="action-icon-btn" 
                    title="Thêm bạn"
                    onClick={onOpenAddFriendModal} 
                  >
                    <MdOutlinePersonAddAlt />
                  </button>
                  {/* Nút Tạo nhóm chat sẽ gọi onOpenCreateGroupModal */}
                  <button 
                    className="action-icon-btn" 
                    title="Tạo nhóm chat"
                    onClick={onOpenCreateGroupModal} // Gọi hàm mở modal tạo nhóm
                  >
                    <MdOutlineGroupAdd />
                  </button>
                </div>
              </div>
              <div className="chat-tabs">
                <button className="tab-button active">Tất cả</button>
                <button className="tab-button">Chưa đọc</button>
                <button className="tab-button">
                    Phân loại
                    <span className="dropdown-icon">▼</span>
                </button>
              </div>
              <div className="chat-list">
                {mockChats.map(chat => (
                    <div
                    key={chat.id}
                    className={`chat-item ${chat.unread ? 'unread' : ''} ${currentSelectedChatId === chat.id ? 'active-chat' : ''}`}
                    onClick={() => handleChatItemClick(chat)}
                    >
                    <div className={`avatar ${chat.type === 'group' ? 'group-avatar' : 'user-avatar'} ${chat.online && chat.type ==='user' ? 'online' : ''}`}>
                        {chat.avatar}
                        {chat.online && chat.type === 'user' && <span className="online-indicator"></span>}
                    </div>
                    <div className="chat-details">
                        <div className="chat-name-time">
                        <span className="chat-name">{chat.name}</span>
                        <span className="chat-time">{chat.time}</span>
                        </div>
                        <div className="chat-message-unread">
                        <p className="chat-message">{chat.message}</p>
                        {chat.unread > 0 && (
                            <span className="unread-count">{chat.unread > 9 ? '9+' : chat.unread}</span>
                        )}
                        </div>
                    </div>
                    </div>
                ))}
              </div>
            </>
          )}

          {activeView === 'contacts' && (
            <div className="contacts-sidebar-panel">
                <div className="sidebar-header contacts-sidebar-header">
                    <FaAddressBook className="contacts-panel-title-icon" />
                    <h2 className="contacts-panel-title">Danh bạ</h2>
                </div>
                <nav className="contacts-nav-list">
                {contactsNavItems.map(item => (
                    <a
                        key={item.id}
                        href="#"
                        className={`contacts-nav-item ${activeContactsNavItem === item.id ? 'active-contacts-nav' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            handleContactsNavItemClick(item.id);
                        }}
                    >
                        <span className="contacts-nav-icon">{item.icon}</span>
                        {item.label}
                    </a>
                ))}
                </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;