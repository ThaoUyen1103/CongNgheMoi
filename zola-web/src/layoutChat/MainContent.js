// file này là màn hình chat chính

import React, { useState, useRef, useEffect } from 'react';
import '../styles/MainContent.css';
import { FaPhoneAlt, FaVideo, FaInfoCircle, FaPaperclip, FaImage, FaEllipsisH, FaSmile } from 'react-icons/fa'; // Thêm FaSmile
import ConversationInfoModal from '../modals/ConversationInfoModal';
import MessageContextMenu from '../modals/MessageContextMenu';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'; // Import emoji picker

function MainContent({ selectedChat }) {
  const messagesEndRef = useRef(null);
  const messageAreaRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null); // Ref cho input file đính kèm
  const imageInputRef = useRef(null); // Ref cho input file hình ảnh
  const emojiPickerRef = useRef(null); // Ref cho emoji picker (để xử lý click outside)

  const [isConvInfoModalOpen, setIsConvInfoModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState({ messageId: null, x: 0, y: 0 });
  const [inputText, setInputText] = useState(''); // State cho nội dung tin nhắn
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State cho emoji picker

  const openConvInfoModal = () => {
    if (selectedChat) {
      setIsConvInfoModalOpen(true);
    }
  };

  const closeConvInfoModal = () => {
    setIsConvInfoModalOpen(false);
  };

  const scrollToBottom = (behavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    if (selectedChat && selectedChat.messages && selectedChat.messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom("auto");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedChat?.id]);

  useEffect(() => {
    if (selectedChat && selectedChat.messages && selectedChat.messages.length > 0) {
      const latestMessage = selectedChat.messages[selectedChat.messages.length - 1];
      if (latestMessage) {
        scrollToBottom();
      }
    }
    setIsConvInfoModalOpen(false);
    setActiveMenu({ messageId: null, x: 0, y: 0 });
    setInputText(''); // Reset input text khi đổi chat
    setShowEmojiPicker(false); // Ẩn emoji picker khi đổi chat
  }, [selectedChat?.id, selectedChat?.messages]);


  // Xử lý click outside cho emoji picker
  useEffect(() => {
    const handleClickOutsideEmojiPicker = (event) => {
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && !event.target.closest('.emoji-button')) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutsideEmojiPicker);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideEmojiPicker);
    };
  }, [showEmojiPicker]);


  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      if (activeMenu.messageId && menuRef.current && !menuRef.current.contains(event.target)) {
        if (!event.target.closest('.message-menu-trigger-btn')) {
          handleCloseMenu();
        }
      }
    };
    if (activeMenu.messageId) {
      document.addEventListener('mousedown', handleClickOutsideMenu);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMenu);
    };
  }, [activeMenu.messageId]);

  const handleOpenMenu = (message, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    let xPosition = event.clientX;
    let yPosition = event.clientY;

    const menuWidth = 180; 
    const menuHeight = 150; 

    if (xPosition + menuWidth > window.innerWidth) {
        xPosition = window.innerWidth - menuWidth - 10;
    }
    if (yPosition + menuHeight > window.innerHeight) {
        yPosition = window.innerHeight - menuHeight - 10;
    }
    if (xPosition < 0) xPosition = 10;
    if (yPosition < 0) yPosition = 10;

    setActiveMenu({
      messageId: message.id,
      x: xPosition,
      y: yPosition,
    });
  };

  const handleCloseMenu = () => {
    setActiveMenu({ messageId: null, x: 0, y: 0 });
  };

  const handleRecallMessage = (messageId) => {
    console.log(`Thu hồi tin nhắn: ${messageId}`);
  };

  const handleDeleteForMe = (messageId) => {
    console.log(`Xóa tin nhắn ở phía tôi: ${messageId}`);
  };

  const handleReplyMessage = (messageId) => {
    console.log(`Trả lời tin nhắn: ${messageId}`);
  };

  const handleForwardMessage = (messageId) => {
    console.log(`Chuyển tiếp tin nhắn: ${messageId}`);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'inherit';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  };

  const onEmojiClick = (emojiObject) => {
    setInputText(prevInput => prevInput + emojiObject.emoji);
    // setShowEmojiPicker(false); // Tùy chọn: ẩn picker sau khi chọn
  };
  
  const toggleEmojiPicker = (event) => {
    event.stopPropagation(); // Ngăn việc click outside của emoji picker bị trigger ngay lập tức
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleFileAttachment = () => {
    fileInputRef.current.click();
  };

  const handleImageAttachment = () => {
    imageInputRef.current.click();
  };

  const onFileSelected = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('File(s) selected:', files);
      // Xử lý file tại đây (ví dụ: upload, hiển thị preview)
    }
    event.target.value = null; // Reset input để có thể chọn lại cùng file
  };
  
  const onImageSelected = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Image(s) selected:', files);
      // Xử lý hình ảnh tại đây
    }
    event.target.value = null; // Reset input
  };


  const renderMessageContent = (msg) => {
    switch (msg.type) {
      case 'text':
        return <p className="message-text-content">{msg.text}</p>;
      case 'image':
        return (
          <div className="message-image-container">
            <img
              src={msg.imageUrl || "https://via.placeholder.com/250x180/e0e0e0/757575?Text=Image"}
              alt={msg.text || "Hình ảnh"}
              className="message-image-content"
            />
            {(!msg.imageUrl && msg.text) && <span className="image-text-overlay">{msg.text}</span>}
          </div>
        );
      case 'file':
        return (
          <div className="message-file">
            <span className="file-icon">📄</span>
            <div className="file-info">
              <span className="file-name">{msg.fileName}</span>
              <span className="file-meta">
                {msg.fileSize} - {msg.status}
              </span>
            </div>
            <div className="file-actions">
              <button className="file-action-btn" title="Lưu về máy">💾</button>
              <button className="file-action-btn" title="Tải xuống">🔽</button>
            </div>
          </div>
        );
      case 'text-with-image-reply':
        return (
          <div className="text-with-reply-wrapper">
            <div className="reply-preview-message">
              <span className="reply-preview-sender">
                {msg.originalSender}
              </span>
              <span className="reply-preview-text">{msg.replyTo}</span>
            </div>
            <p className="main-reply-text">{msg.text}</p>
          </div>
        );
      case 'system':
        return <div className="system-message-text">{msg.text}</div>;
      default:
        return <p className="message-text-content">{msg.text || 'Tin nhắn không xác định'}</p>;
    }
  };

  if (!selectedChat) {
    const features = [
      { name: 'Tin nhắn tự động', icon: '💬' },
      { name: 'Nhãn dán Business', icon: '🏷️' },
      { name: 'Mời cộng danh bạ', icon: '👥' },
      { name: 'Mở rộng nhóm', icon: '➕' },
    ];
    return (
      <div className="main-content no-chat-selected">
        <div className="welcome-section">
          <h2>Chào mừng đến với Zalo PC!</h2>
          <p className="welcome-subtitle">
            Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng
            <br />
            người thân, bạn bè được tối ưu cho máy tính của bạn.
          </p>
          <div className="welcome-visual">
            <div className="visual-left placeholder-image">
              Ảnh minh họa Zalo PC
              <button className="upgrade-button">NÂNG CẤP NGAY</button>
            </div>
            <div className="visual-right">
              {features.map((feature) => (
                <div key={feature.name} className="feature-item">
                  <span className="feature-icon">{feature.icon}</span>
                  <span className="feature-name">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getGroupMembersCount = (chat) => {
    if (chat.type === 'group') {
      if (chat.membersCount) return chat.membersCount;
      if (chat.members && chat.members.length > 0) return chat.members.length; // Thêm kiểm tra này
      if (chat.messages && chat.messages.length > 0) {
        const members = new Set();
        chat.messages.forEach(msg => {
          if (msg.sender && msg.sender !== 'me') {
            members.add(msg.sender);
          }
        });
        const meSentMessage = chat.messages.some(m => m.sender === 'me');
        return members.size + (meSentMessage || members.size === 0 ? 1 : 0);
      }
      return chat.name.toLowerCase().includes("nhóm") || chat.name.toLowerCase().includes("group") || chat.name.toLowerCase().includes("clb") ? 2 : 1;
    }
    return null;
  }

  const currentActiveMessage = selectedChat.messages.find(msg => msg.id === activeMenu.messageId);

  return (
    <>
      <div className={`main-content-wrapper ${isConvInfoModalOpen ? 'info-sidebar-active' : ''}`}>
        <div className="main-content chat-view">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className={`avatar header-avatar ${selectedChat.type === 'group' ? 'group-avatar' : 'user-avatar'} ${selectedChat.online && selectedChat.type === 'user' ? 'online' : ''}`}>
                {selectedChat.avatar && (typeof selectedChat.avatar === 'string' && selectedChat.avatar.startsWith('http')) ? <img src={selectedChat.avatar} alt="avatar"/> : selectedChat.avatar || selectedChat.name?.substring(0,1).toUpperCase() || '?'}
                {selectedChat.online && selectedChat.type === 'user' && <span className="online-indicator"></span>}
              </div>
              <div className="chat-header-name-status">
                <span className="chat-header-name">{selectedChat.name}</span>
                {selectedChat.type === 'user' && (
                  <span className="chat-header-status">
                    {selectedChat.online ? 'Đang hoạt động' : (selectedChat.lastSeen || 'Không hoạt động')}
                  </span>
                )}
                {selectedChat.type === 'group' && (
                  <span className="chat-header-status">
                    {getGroupMembersCount(selectedChat)} thành viên
                  </span>
                )}
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="action-btn" title="Gọi thoại"><FaPhoneAlt /></button>
              <button className="action-btn" title="Gọi video"><FaVideo /></button>
              <button
                className="action-btn"
                title="Thông tin hội thoại"
                onClick={openConvInfoModal}
              >
                <FaInfoCircle />
              </button>
            </div>
          </div>

          <div className="message-area" ref={messageAreaRef} onClick={(e) => { if (!e.target.closest('.message-menu-trigger-btn') && !e.target.closest('.emoji-picker-container')) handleCloseMenu(); setShowEmojiPicker(false);}}>
            {selectedChat.messages && selectedChat.messages.length > 0 ? (
              selectedChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-item ${msg.sender === 'me' ? 'sent' : msg.type === 'system' ? 'system' : 'received'}`}
                >
                  {msg.type !== 'system' && msg.sender !== 'me' && (
                    <div className={`avatar message-avatar ${selectedChat.type === 'group' ? 'group-message-avatar' : 'user-message-avatar'}`}>
                      {selectedChat.type === 'group' ? (msg.senderAvatar || msg.sender?.substring(0,1).toUpperCase() || '?') : (selectedChat.avatar && (typeof selectedChat.avatar === 'string' && selectedChat.avatar.startsWith('http')) ? <img src={selectedChat.avatar} alt="avatar"/> : selectedChat.avatar || selectedChat.name?.substring(0,1).toUpperCase())}
                    </div>
                  )}
                  <div className="message-content-wrapper">
                    {selectedChat.type === 'group' && msg.sender !== 'me' && msg.type !== 'system' && (
                      <span className="message-sender-name">{msg.sender}</span>
                    )}
                    <div className={`message-bubble ${msg.type === 'image' ? 'image-bubble' : ''} ${msg.type === 'file' ? 'file-bubble' : ''}`}>
                      {renderMessageContent(msg)}
                      {msg.type !== 'system' && (
                           <button 
                            className="message-menu-trigger-btn" 
                            onClick={(e) => handleOpenMenu(msg, e)}
                            title="Tùy chọn"
                          >
                            <FaEllipsisH />
                          </button>
                      )}
                    </div>
                    {msg.time && <span className="message-time">{msg.time}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-messages-info">
                <div className="no-messages-icon">💬</div>
                <p>Chưa có tin nhắn nào.</p>
                <p>Hãy bắt đầu cuộc trò chuyện với {selectedChat.name}!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-area">
            <div className="input-actions-left">
              <button className="input-action-btn" title="Đính kèm file" onClick={handleFileAttachment}><FaPaperclip /></button>
              <button className="input-action-btn" title="Gửi hình ảnh" onClick={handleImageAttachment}><FaImage /></button>
            </div>
            <textarea
              className="message-input"
              placeholder="Nhập tin nhắn @, tin nhắn nhanh /"
              rows="1"
              value={inputText}
              onChange={handleInputChange}
            />
            <div className="input-actions-right">
              <div style={{ position: 'relative' }} ref={emojiPickerRef}>
                <button className="input-action-btn emoji-button" title="Emoji" onClick={toggleEmojiPicker}>
                  <FaSmile />
                </button>
                {showEmojiPicker && (
                  <div className="emoji-picker-container" onClick={(e) => e.stopPropagation()}> {/* Ngăn click vào picker đóng picker */}
                     <EmojiPicker 
                        onEmojiClick={onEmojiClick} 
                        emojiStyle={EmojiStyle.NATIVE}
                        height={350}
                        width="100%"
                        lazyLoadEmojis={true}
                        searchDisabled={false}
                        previewConfig={{showPreview: false}}
                     />
                  </div>
                )}
              </div>
              <button className="input-action-btn primary" title="Gửi tin nhắn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConversationInfoModal
        isOpen={isConvInfoModalOpen}
        onClose={closeConvInfoModal}
        chatData={selectedChat}
      />
      {activeMenu.messageId && currentActiveMessage && (
        <MessageContextMenu
          ref={menuRef}
          message={currentActiveMessage}
          position={activeMenu}
          onClose={handleCloseMenu}
          onRecall={() => handleRecallMessage(currentActiveMessage.id)}
          onDeleteForMe={() => handleDeleteForMe(currentActiveMessage.id)}
          onReply={() => handleReplyMessage(currentActiveMessage.id)}
          onForward={() => handleForwardMessage(currentActiveMessage.id)}
        />
      )}
      {/* Input ẩn để chọn file */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={onFileSelected}
        multiple // Cho phép chọn nhiều file
      />
      <input 
        type="file" 
        ref={imageInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" // Chỉ cho phép chọn file ảnh
        onChange={onImageSelected}
        multiple
      />
    </>
  );
}

export default MainContent;