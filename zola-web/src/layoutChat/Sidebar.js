import React, { useState, useEffect, useRef } from 'react';
import '../styles/Sidebar.css';
import { MdOutlinePersonAddAlt, MdOutlineGroupAdd } from "react-icons/md";
import { FaUsers, FaAddressBook, FaSpinner } from "react-icons/fa";
import { IoMdSettings, IoIosCloud, IoIosChatbubbles, IoIosContacts } from "react-icons/io";
import { RiContactsBookLine } from "react-icons/ri";

function Sidebar({
  onSelectChat,
  currentSelectedChatId,
  onOpenAccountInfoModal,
  onOpenSettingsModal,
  onOpenAddFriendModal,
  onOpenCreateGroupModal,
  activeView,
  setActiveView,
  activeContactsNavItem,
  setActiveContactsNavItem,
  onLogoutFromLayout,
  currentLoggedInUserId,
}) {
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const settingsRef = useRef(null);

  const [chatListItems, setChatListItems] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [chatsError, setChatsError] = useState('');

  const settingsMenuItems = [
    { id: 'profile', label: 'Thông tin tài khoản', action: () => { if (onOpenAccountInfoModal) onOpenAccountInfoModal(); } },
    { id: 'settings', label: 'Cài đặt', action: () => { if (onOpenSettingsModal) onOpenSettingsModal(); } },
    {
      id: 'logout',
      label: 'Đăng xuất',
      separatorBefore: true,
      action: () => {
        if (onLogoutFromLayout) {
          onLogoutFromLayout();
        }
      }
    },
  ];

  useEffect(() => {
    if (activeView === 'chats' && currentLoggedInUserId) {
      const fetchChatListItems = async () => {
        setIsLoadingChats(true);
        setChatsError('');
        setChatListItems([]);
        
        let fetchedGroups = [];
        let fetchedFriends = [];

        try {
          const groupPromise = fetch('http://localhost:3001/conversation/getConversationGroupByUserIDWeb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentLoggedInUserId }),
          });

          const friendsPromise = fetch(`http://localhost:3001/user/getFriends/${currentLoggedInUserId}`);

          const [groupResponse, friendsResponse] = await Promise.all([groupPromise, friendsPromise]);

          if (groupResponse.ok) {
            const groupData = await groupResponse.json();
            if (groupData.conversationGroup) {
              fetchedGroups = groupData.conversationGroup.map(group => ({
                id: group._id,
                name: group.conversationName,
                avatar: group.avatar,
                type: 'group',
                message: group.members ? `${group.members.length} thành viên` : 'Nhóm chat',
                time: group.updatedAt ? new Date(group.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
                timestamp: group.updatedAt ? new Date(group.updatedAt).getTime() : 0,
                unread: 0,
              }));
            }
          } else {
            console.error('Lỗi tải danh sách nhóm:', await groupResponse.text());
          }

          if (friendsResponse.ok) {
            const friendsData = await friendsResponse.json();
            if (friendsData) {
              fetchedFriends = friendsData.map(friend => ({
                id: friend._id, 
                name: friend.userName,
                avatar: friend.avatar,
                type: 'user',
                message: 'Bắt đầu trò chuyện',
                time: '', 
                timestamp: 0, 
                unread: 0,
              }));
            }
          } else {
            console.error('Lỗi tải danh sách bạn bè:', await friendsResponse.text());
          }
          
          const combinedList = [...fetchedGroups, ...fetchedFriends];
          combinedList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // Sort by time, newest first
          setChatListItems(combinedList);

          if (!groupResponse.ok && !friendsResponse.ok) {
            setChatsError('Không thể tải danh sách cuộc trò chuyện.');
          }

        } catch (error) {
          console.error('Lỗi kết nối khi tải danh sách chat:', error);
          setChatsError('Lỗi kết nối, không thể tải danh sách.');
        } finally {
          setIsLoadingChats(false);
        }
      };
      fetchChatListItems();
    }
  }, [activeView, currentLoggedInUserId]);

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

  const contactsNavItems = [
    { id: 'friends', label: 'Danh sách bạn bè', icon: <RiContactsBookLine /> },
    { id: 'groups', label: 'Danh sách nhóm', icon: <FaUsers /> },
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
                        <a style={{ cursor: 'pointer' }}>{item.label}</a>
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
                  <input type="text" placeholder="Tìm kiếm trong danh sách chat..." className="search-input" />
                </div>
                <div className="action-icons">
                  <button
                    className="action-icon-btn"
                    title="Thêm bạn"
                    onClick={onOpenAddFriendModal}
                  >
                    <MdOutlinePersonAddAlt />
                  </button>
                  <button
                    className="action-icon-btn"
                    title="Tạo nhóm chat"
                    onClick={onOpenCreateGroupModal}
                  >
                    <MdOutlineGroupAdd />
                  </button>
                </div>
              </div>
              <div className="chat-tabs">
                <button className="tab-button active">Tất cả</button>
                <button className="tab-button">Chưa đọc</button>
              </div>
              <div className="chat-list">
                {isLoadingChats && <div className="loading-message"><FaSpinner className="spinner-icon" /> Đang tải...</div>}
                {chatsError && <div className="error-message">{chatsError}</div>}
                {!isLoadingChats && !chatsError && chatListItems.length === 0 && <div className="no-chats-message">Không có cuộc trò chuyện nào.</div>}
                {!isLoadingChats && !chatsError && chatListItems.map(chat => (
                  <div
                    key={chat.id}
                    className={`chat-item ${chat.unread ? 'unread' : ''} ${currentSelectedChatId === chat.id ? 'active-chat' : ''}`}
                    onClick={() => handleChatItemClick(chat)}
                  >
                    <div className={`avatar ${chat.type === 'group' ? 'group-avatar' : 'user-avatar'}`}>
                      {chat.avatar ? (
                        <img src={chat.avatar} alt={chat.name} className="chat-list-avatar-img" />
                      ) : (
                        chat.name ? chat.name.substring(0, 2).toUpperCase() : (chat.type === 'group' ? 'GR' : '??')
                      )}
                    </div>
                    <div className="chat-details">
                      <div className="chat-name-time">
                        <span className="chat-name">{chat.name}</span>
                        {chat.time && <span className="chat-time">{chat.time}</span>}
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