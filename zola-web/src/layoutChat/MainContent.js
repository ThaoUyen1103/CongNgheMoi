import React, { useState, useRef, useEffect } from 'react';
import '../styles/MainContent.css';
import { FaPhoneAlt, FaVideo, FaInfoCircle, FaPaperclip, FaImage, FaEllipsisH, FaSmile, FaSpinner } from 'react-icons/fa';
import ConversationInfoModal from '../modals/ConversationInfoModal';
import MessageContextMenu from '../modals/MessageContextMenu';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';

function MainContent({ selectedChat, currentLoggedInUserId,onConversationDeleted }) {
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const [isConvInfoModalOpen, setIsConvInfoModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState({ messageId: null, x: 0, y: 0 });
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState('');

  const openConvInfoModal = () => {
    if (selectedChat) {
      setIsConvInfoModalOpen(true);
    }
  };
  const closeConvInfoModal = () => setIsConvInfoModalOpen(false);

  const scrollToBottom = (behavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    if (selectedChat && selectedChat.id) {
      const fetchMessages = async () => {
        setIsLoadingMessages(true);
        setMessagesError('');
        setMessages([]);
        try {
          const response = await fetch(`http://localhost:3001/message/${selectedChat.id}`); 
          if (response.ok) {
            const data = await response.json();
            setMessages(data || []);
          } else {
            setMessagesError('Không thể tải tin nhắn cho cuộc trò chuyện này.');
            console.error('Lỗi tải tin nhắn:', await response.text());
          }
        } catch (error) {
          setMessagesError('Lỗi kết nối khi tải tin nhắn.');
          console.error('Lỗi kết nối:', error);
        } finally {
          setIsLoadingMessages(false);
        }
      };
      fetchMessages();
    } else {
      setMessages([]); 
    }
    setIsConvInfoModalOpen(false);
    setActiveMenu({ messageId: null, x: 0, y: 0 });
    setInputText('');
    setShowEmojiPicker(false);
  }, [selectedChat?.id]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom("auto");
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [messages]);

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
    if (xPosition + menuWidth > window.innerWidth) xPosition = window.innerWidth - menuWidth - 10;
    if (yPosition + menuHeight > window.innerHeight) yPosition = window.innerHeight - menuHeight - 10;
    if (xPosition < 0) xPosition = 10;
    if (yPosition < 0) yPosition = 10;
    setActiveMenu({ messageId: message._id, x: xPosition, y: yPosition });
  };

  const handleCloseMenu = () => setActiveMenu({ messageId: null, x: 0, y: 0 });
  const handleRecallMessage = (messageId) => console.log(`Thu hồi tin nhắn: ${messageId}`);
  const handleDeleteForMe = (messageId) => console.log(`Xóa tin nhắn ở phía tôi: ${messageId}`);
  const handleReplyMessage = (messageId) => console.log(`Trả lời tin nhắn: ${messageId}`);
  const handleForwardMessage = (messageId) => console.log(`Chuyển tiếp tin nhắn: ${messageId}`);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    e.target.style.height = 'inherit';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  };

  const onEmojiClick = (emojiObject) => setInputText(prevInput => prevInput + emojiObject.emoji);
  const toggleEmojiPicker = (event) => {
    event.stopPropagation();
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleFileAttachment = () => fileInputRef.current?.click();
  const handleImageAttachment = () => imageInputRef.current?.click();

  const onFileSelected = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) console.log('File(s) selected:', files);
    event.target.value = null;
  };
  
  const onImageSelected = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) console.log('Image(s) selected:', files);
    event.target.value = null;
  };

  const renderMessageContent = (msg) => {
    const contentType = msg.contentType || msg.type;
    const content = msg.content || msg.text;
    switch (contentType) {
      case 'text':
        return <p className="message-text-content">{content}</p>;
      case 'image':
        return (
          <div className="message-image-container">
            <img
              src={msg.imageUrl || content || "https://via.placeholder.com/250x180/e0e0e0/757575?Text=Image"}
              alt={content || "Hình ảnh"}
              className="message-image-content"
            />
            {(!msg.imageUrl && !content && (msg.text)) && <span className="image-text-overlay">{msg.text}</span>}
          </div>
        );
      case 'file':
        return (
          <div className="message-file">
            <span className="file-icon">📄</span>
            <div className="file-info">
              <span className="file-name">{msg.fileName || content.split('/').pop()}</span>
              <span className="file-meta">{msg.fileSize}</span>
            </div>
            <div className="file-actions">
              <button className="file-action-btn" title="Lưu về máy">💾</button>
              <button className="file-action-btn" title="Tải xuống">🔽</button>
            </div>
          </div>
        );
      case 'notify':
      case 'system':
        return <div className="system-message-text">{content}</div>;
      default:
        return <p className="message-text-content">{content || 'Tin nhắn không xác định'}</p>;
    }
  };

  if (!selectedChat) {
    const features = [
      { name: 'Tin nhắn tự động', icon: '💬' }, { name: 'Nhãn dán Business', icon: '🏷️' },
      { name: 'Mời cộng danh bạ', icon: '👥' }, { name: 'Mở rộng nhóm', icon: '➕' },
    ];
    return (
      <div className="main-content no-chat-selected">
        <div className="welcome-section">
          <h2>Chào mừng đến với Zalo PC!</h2>
          <p className="welcome-subtitle">
            Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng<br />
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
      if (chat.members && chat.members.length > 0) return chat.members.length;
      return chat.name.toLowerCase().includes("nhóm") || chat.name.toLowerCase().includes("group") || chat.name.toLowerCase().includes("clb") ? 2 : 1;
    }
    return null;
  };

  const currentActiveMessage = messages.find(msg => (msg._id || msg.id) === activeMenu.messageId);

  return (
    <>
      <div className={`main-content-wrapper ${isConvInfoModalOpen ? 'info-sidebar-active' : ''}`}>
        <div className="main-content chat-view">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className={`avatar header-avatar ${selectedChat.type === 'group' ? 'group-avatar' : 'user-avatar'}`}>
                {selectedChat.avatar && (typeof selectedChat.avatar === 'string' && (selectedChat.avatar.startsWith('http') || selectedChat.avatar.startsWith('data:image'))) ? <img src={selectedChat.avatar} alt="avatar"/> : selectedChat.name?.substring(0,2).toUpperCase() || '?'}
              </div>
              <div className="chat-header-name-status">
                <span className="chat-header-name">{selectedChat.name}</span>
                {selectedChat.type === 'user' && (
                  <span className="chat-header-status">
                    {'Đang hoạt động'}
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
              <button className="action-btn" title="Thông tin hội thoại" onClick={openConvInfoModal}>
                <FaInfoCircle />
              </button>
            </div>
          </div>

          <div className="message-area" onClick={(e) => { if (!e.target.closest('.message-menu-trigger-btn') && !e.target.closest('.emoji-picker-container')) handleCloseMenu(); setShowEmojiPicker(false);}}>
            {isLoadingMessages && <div className="loading-messages-container"><FaSpinner className="spinner-icon" /> Đang tải tin nhắn...</div>}
            {messagesError && <div className="error-messages-container">{messagesError}</div>}
            {!isLoadingMessages && !messagesError && messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg._id} 
                  className={`message-item ${msg.senderId?._id === currentLoggedInUserId || msg.senderId === currentLoggedInUserId ? 'sent' : (msg.contentType === 'system' || msg.contentType === 'notify') ? 'system' : 'received'}`}
                >
                  {(msg.contentType !== 'system' && msg.contentType !== 'notify' && (msg.senderId?._id !== currentLoggedInUserId && msg.senderId !== currentLoggedInUserId)) && (
                    <div className={`avatar message-avatar ${selectedChat.type === 'group' ? 'group-message-avatar' : 'user-message-avatar'}`}>
                      {selectedChat.type === 'group' ? (msg.senderId?.avatar || msg.senderId?.userName?.substring(0,1).toUpperCase() || '?') : (selectedChat.avatar && (typeof selectedChat.avatar === 'string' && (selectedChat.avatar.startsWith('http')||selectedChat.avatar.startsWith('data:image'))) ? <img src={selectedChat.avatar} alt="avatar"/> : selectedChat.name?.substring(0,1).toUpperCase())}
                    </div>
                  )}
                  <div className="message-content-wrapper">
                    {selectedChat.type === 'group' && (msg.senderId?._id !== currentLoggedInUserId && msg.senderId !== currentLoggedInUserId) && msg.contentType !== 'system' && msg.contentType !== 'notify' && (
                      <span className="message-sender-name">{msg.senderId?.userName || 'Không rõ'}</span>
                    )}
                    <div className={`message-bubble ${(msg.contentType || msg.type) === 'image' ? 'image-bubble' : ''} ${(msg.contentType || msg.type) === 'file' ? 'file-bubble' : ''}`}>
                      {renderMessageContent(msg)}
                      {(msg.contentType !== 'system' && msg.contentType !== 'notify') && (
                            <button 
                              className="message-menu-trigger-btn" 
                              onClick={(e) => handleOpenMenu(msg, e)}
                              title="Tùy chọn"
                            >
                              <FaEllipsisH />
                            </button>
                      )}
                    </div>
                    {msg.createdAt && <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>}
                  </div>
                </div>
              ))
            ) : (
              !isLoadingMessages && !messagesError && 
              <div className="no-messages-info">
                <div className="no-messages-icon">💬</div>
                <p>Chưa có tin nhắn nào.</p>
                {selectedChat && <p>Hãy bắt đầu cuộc trò chuyện với {selectedChat.name}!</p>}
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
                  <div className="emoji-picker-container" onClick={(e) => e.stopPropagation()}>
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick} 
                      emojiStyle={EmojiStyle.NATIVE}
                      height={350} width="100%"
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
        onConversationDeleted={onConversationDeleted}
        currentUserId={currentLoggedInUserId}
      />
      {activeMenu.messageId && currentActiveMessage && (
        <MessageContextMenu
          ref={menuRef}
          message={currentActiveMessage}
          position={activeMenu}
          onClose={handleCloseMenu}
          onRecall={() => handleRecallMessage(activeMenu.messageId)}
          onDeleteForMe={() => handleDeleteForMe(activeMenu.messageId)}
          onReply={() => handleReplyMessage(activeMenu.messageId)}
          onForward={() => handleForwardMessage(activeMenu.messageId)}
        />
      )}
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={onFileSelected} multiple />
      <input type="file" ref={imageInputRef} style={{ display: 'none' }} accept="image/*" onChange={onImageSelected} multiple />
    </>
  );
}

export default MainContent;