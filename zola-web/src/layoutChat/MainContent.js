import React, { useState, useRef, useEffect } from 'react';
import '../styles/MainContent.css';
import { 
    FaPhoneAlt, FaVideo, FaInfoCircle, FaPaperclip, FaImage, FaEllipsisH, FaSmile, FaSpinner, FaDownload,
    FaFileWord, FaFileExcel, FaFilePowerpoint, FaFilePdf, FaFileAlt, FaFileArchive 
} from 'react-icons/fa';
import ConversationInfoModal from '../modals/ConversationInfoModal';
import MessageContextMenu from '../modals/MessageContextMenu';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import ForwardMessageModal from '../modals/ForwardMessageModal'; // Đảm bảo import này đúng

// Thêm prop allConversations
function MainContent({ selectedChat, currentLoggedInUserId, onConversationDeleted, allConversations }) { 
    const messagesEndRef = useRef(null);
    const menuRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const replyInputPreviewRef = useRef(null); 

    const [replyingToMessage, setReplyingToMessage] = useState(null);
    const [isConvInfoModalOpen, setIsConvInfoModalOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState({ messageId: null, x: 0, y: 0 });
    const [inputText, setInputText] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [messagesError, setMessagesError] = useState('');
    const [forwardingMessageId, setForwardingMessageId] = useState(null);
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState([]);

    const openConvInfoModal = () => {
        if (selectedChat) setIsConvInfoModalOpen(true);
    };
    const closeConvInfoModal = () => setIsConvInfoModalOpen(false);

    const scrollToBottom = (behavior = "smooth") => {
        if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior });
    };

    useEffect(() => {
        const conversationId = selectedChat?._id || selectedChat?.id;
        if (!conversationId) {
            setMessages([]);
            return;
        }
        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            setMessagesError('');
            try {
                const res = await fetch(`http://localhost:3001/message/${conversationId}`);
                const data = await res.json();
                if (res.ok) {
                    if (Array.isArray(data)) {
                        const filtered = data.filter(m => !(m.deletedBy?.includes(currentLoggedInUserId)));
                        setMessages(filtered);
                    } else { setMessages([]); }
                } else {
                    setMessagesError(data.message || data.error || "Lỗi tải tin nhắn");
                    setMessages([]);
                }
            } catch (err) {
                setMessagesError("Lỗi kết nối khi tải tin nhắn.");
                setMessages([]);
            } finally {
                setIsLoadingMessages(false);
            }
        };
        fetchMessages();
    }, [selectedChat?._id, currentLoggedInUserId]);

    useEffect(() => {
        if (messages && messages.length > 0) {
            const timer = setTimeout(() => scrollToBottom("auto"), 100);
            return () => clearTimeout(timer);
        }
    }, [messages]);

    useEffect(() => {
        const handleClickOutsideEmojiPicker = (event) => {
            if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && !event.target.closest('.emoji-button')) {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) document.addEventListener('mousedown', handleClickOutsideEmojiPicker);
        return () => document.removeEventListener('mousedown', handleClickOutsideEmojiPicker);
    }, [showEmojiPicker]);

    useEffect(() => {
        const handleClickOutsideMenu = (event) => {
            if (activeMenu.messageId && menuRef.current && !menuRef.current.contains(event.target) &&
                !event.target.closest('.message-menu-trigger-btn') && !event.target.closest('.media-item-menu-trigger')) {
                handleCloseMenu();
            }
        };
        if (activeMenu.messageId) document.addEventListener('mousedown', handleClickOutsideMenu);
        return () => document.removeEventListener('mousedown', handleClickOutsideMenu);
    }, [activeMenu.messageId]);
    
    const onMediaSelected = (event) => {
        const files = Array.from(event.target.files);
        const newFiles = files.filter(file => !selectedMedia.some(existingFile => existingFile.name === file.name && existingFile.size === file.size));
        setSelectedMedia(prev => [...prev, ...newFiles]);
        event.target.value = null;
    };

    const sendMessage = async () => {
        const conversationId = selectedChat._id || selectedChat.id;
        if (!conversationId || !currentLoggedInUserId) return;

        const textContentTrimmed = inputText.trim();
        const hasText = textContentTrimmed !== '';
        const hasMedia = selectedMedia.length > 0;
        const currentReplyToId = replyingToMessage ? replyingToMessage._id : null;

        if (!hasText && !hasMedia) return;

        const imagesToSend = selectedMedia.filter(f => f.type.startsWith('image/'));
        const otherFilesToSend = selectedMedia.filter(f => !f.type.startsWith('image/'));
        
        const uploadPromises = [];

        if (hasText || imagesToSend.length > 0) {
            const formData = new FormData();
            formData.append('conversation_id', conversationId);
            formData.append('user_id', currentLoggedInUserId);
            if (hasText) formData.append('content', textContentTrimmed);
            if (currentReplyToId) formData.append('replyTo', currentReplyToId);

            if (imagesToSend.length > 0) {
                formData.append('contentType', hasText ? 'text' : 'image');
                imagesToSend.forEach(img => formData.append('image', img));
            } else {
                formData.append('contentType', 'text');
            }
            
            const textAndImagePromise = fetch('http://localhost:3001/message/createMessagesWeb', { method: 'POST', body: formData })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    console.error("Lỗi từ server (createMessagesWeb):", data);
                    throw new Error(data.thongbao || data.message || data.error || 'Lỗi gửi ảnh/text');
                }
                return data;
            })
            .then(data => {
                let newMsgs = [];
                if (data.textMessage) newMsgs.push(data.textMessage);
                if (data.imageMessage && Array.isArray(data.imageMessage)) newMsgs = newMsgs.concat(data.imageMessage);
                else if (data.imageMessage) newMsgs.push(data.imageMessage);
                if (data.message) newMsgs.push(data.message);
                if (newMsgs.length === 0) {
        console.warn("Không có tin nhắn hợp lệ từ /createMessagesWeb (response.ok=true), response data:", data);
    }
                return newMsgs.filter(Boolean);
            });
            uploadPromises.push(textAndImagePromise);
        }

        if (otherFilesToSend.length > 0) {
            otherFilesToSend.forEach(file => {
                const fileFormData = new FormData();
                fileFormData.append('conversation_id', conversationId);
                fileFormData.append('user_id', currentLoggedInUserId);
                const fileContentType = file.type.startsWith('video/') ? 'video' : 'file';
                fileFormData.append('contentType', fileContentType);
                fileFormData.append('media', file);
                if (currentReplyToId) fileFormData.append('replyTo', currentReplyToId);

                const filePromise = fetch('http://localhost:3001/message/uploadMediaWeb', { method: 'POST', body: fileFormData })
                .then(async response => {
                    const data = await response.json();
                    if (!response.ok) {
                        console.error("Lỗi từ server (uploadMediaWeb):", data);
                        throw new Error(data.thongbao || data.message || data.error || `Lỗi gửi file ${file.name}`);
                    }
                    return data;
                })
                .then(data => {
                    if (!data.MediaMessage || data.MediaMessage.length === 0) {
        console.warn(`Không có MediaMessage từ /uploadMediaWeb cho file ${file.name} (response.ok=true), response data:`, data);
        return [];
    }
                    return data.MediaMessage.filter(Boolean);
                });
                uploadPromises.push(filePromise);
            });
        }

        try {
            const results = await Promise.all(uploadPromises);
            const newMessagesToAdd = results.flat().filter(Boolean); 
            if (newMessagesToAdd.length > 0) {
                setMessages(prev => [...prev, ...newMessagesToAdd]);
            } else {
                 console.log("sendMessage: Không có tin nhắn mới nào được thêm vào UI sau khi xử lý promises.");
            }
        } catch (error) {
            console.error("Đã xảy ra lỗi trong quá trình gửi một hoặc nhiều tin nhắn:", error.message);
        } finally {
            setInputText('');
            setSelectedMedia([]);
            setReplyingToMessage(null);
            scrollToBottom();
        }
    };

    const handleOpenMenu = (message, event) => {
        event.preventDefault();
        event.stopPropagation();
        let xPosition = event.clientX;
        let yPosition = event.clientY;
        const menuWidth = 180;
        const menuHeight = 160; 
        if (xPosition + menuWidth > window.innerWidth) xPosition = window.innerWidth - menuWidth - 10;
        if (yPosition + menuHeight > window.innerHeight) yPosition = window.innerHeight - menuHeight - 10;
        if (xPosition < 0) xPosition = 10;
        if (yPosition < 0) yPosition = 10;
        setActiveMenu({ messageId: message._id, x: xPosition, y: yPosition });
    };

    const handleCloseMenu = () => setActiveMenu({ messageId: null, x: 0, y: 0 });

    const handleRecallMessage = async (messageId) => {
        try {
            const response = await fetch('http://localhost:3001/message/recallMessageWeb', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message_id: messageId }) });
            const data = await response.json();
            if (response.ok && data.message) {
                setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, recalled: true, content: 'Tin nhắn đã được thu hồi' } : msg));
            } else { console.error('Thu hồi tin nhắn thất bại:', data.thongbao || data.message || data.error); }
        } catch (err) { console.error('Lỗi khi thu hồi tin nhắn:', err); }
        handleCloseMenu();
    };

    const handleDeleteForMe = async (messageId) => {
        try {
            const response = await fetch('http://localhost:3001/message/deleteMyMessageWeb', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message_id: messageId, user_id: currentLoggedInUserId }) });
            const data = await response.json();
            if (response.ok && data.message) {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            } else { console.error('Xóa tin nhắn thất bại:', data.thongbao || data.message || data.error); }
        } catch (err) { console.error('Lỗi khi xóa tin nhắn:', err); }
        handleCloseMenu();
    };

    const handleReplyMessage = (messageId) => {
        const msg = messages.find(m => m._id === messageId);
        if (msg && !msg.recalled) {
            setReplyingToMessage(msg);
            const textarea = document.querySelector('.message-input');
            if (textarea) textarea.focus();
        }
        handleCloseMenu();
    };

    const handleForwardMessage = (messageId) => {
        setForwardingMessageId(messageId);
        setIsForwardModalOpen(true);
        handleCloseMenu();
    };

    const confirmForward = async (targetConversationId) => {
        const messageToForward = messages.find(m => m._id === forwardingMessageId);
        if (!messageToForward || !targetConversationId) {
            console.error("Không tìm thấy tin nhắn để chuyển tiếp hoặc không có cuộc trò chuyện đích.");
            setIsForwardModalOpen(false);
            setForwardingMessageId(null);
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/message/forwardMessageWeb', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    message_id: forwardingMessageId, 
                    conversation_id: targetConversationId, 
                    forwarded_by: currentLoggedInUserId, 
                    // original_sender đã có trong messageToForward.senderId
                    original_sender: messageToForward.senderId?._id || messageToForward.senderId 
                }) 
            });
            const data = await response.json();
            if (response.ok && data.message) {
                alert("Chuyển tiếp tin nhắn thành công!");
                if ((selectedChat._id || selectedChat.id) === targetConversationId) {
                    setMessages(prev => [...prev, data.message]);
                    scrollToBottom();
                }
            } else { 
                console.error('Chuyển tiếp thất bại:', data.thongbao || data.message || data.error); 
                alert(`Chuyển tiếp thất bại: ${data.thongbao || data.message || 'Lỗi không xác định'}`);
            }
        } catch (err) { 
            console.error('Lỗi chuyển tiếp:', err); 
            alert("Lỗi kết nối khi chuyển tiếp tin nhắn.");
        } finally {
            setIsForwardModalOpen(false);
            setForwardingMessageId(null);
        }
    };

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
    
    const ReplyPreviewBubble = ({ messageId, currentUserId }) => {
        const originalMessage = messages.find(m => m._id === messageId);
        if (!originalMessage) {
            return <div className="reply-preview-bubble missing" onClick={(e) => e.stopPropagation()}><em>Tin nhắn không còn tồn tại</em></div>;
        }
        if (originalMessage.recalled) {
             return <div className="reply-preview-bubble recalled" onClick={(e) => e.stopPropagation()}><em>Trả lời một tin nhắn đã thu hồi</em></div>;
        }
        let previewContent = originalMessage.content;
        let senderName = "Một ai đó";

        if (originalMessage.senderId) {
            const sender = originalMessage.senderId;
            if (String(sender._id || sender) === String(currentUserId)) {
                senderName = "Bạn";
            } else {
                senderName = sender.userName || "Người gửi";
            }
        }
       
        if (originalMessage.contentType === 'text') {
            previewContent = String(originalMessage.content).substring(0, 70) + (String(originalMessage.content).length > 70 ? '...' : '');
        } else if (originalMessage.contentType?.includes('image')) {
            previewContent = '[Hình ảnh]';
        } else if (originalMessage.contentType === 'video') {
            previewContent = '[Video]';
        } else if (originalMessage.contentType === 'file') {
            const fileName = typeof originalMessage.content === 'string' ? originalMessage.content.split('/').pop() : "Tệp";
            previewContent = `[Tệp: ${fileName}]`;
        } else {
            previewContent = `[${originalMessage.contentType || 'Tin nhắn'}]`;
        }
    
        return (
            <div className="reply-preview-bubble" onClick={(e) => e.stopPropagation()}>
                <div className="reply-preview-sender">{senderName}</div>
                <div className="reply-preview-text">{previewContent}</div>
            </div>
        );
    };

    const renderMessageContent = (msg) => {
        const contentType = msg.contentType || msg.type;
        let content = msg.content || msg.text;
            
        if (msg.recalled) {
            return <p className="message-text-content recalled-message"><i>Tin nhắn đã được thu hồi</i></p>;
        }
        
        const commonMenuButton = !msg.recalled && msg.contentType !== 'system' && msg.contentType !== 'notify' && (
            <button 
                className={contentType === 'text' ? "message-menu-trigger-btn" : "media-item-menu-trigger"} 
                onClick={(e) => handleOpenMenu(msg, e)} 
                title="Tùy chọn"
            >
                <FaEllipsisH />
            </button>
        );
    
        switch (contentType) {
            case 'text':
                return ( <div className="text-message-wrapper"> {msg.replyTo && <ReplyPreviewBubble messageId={msg.replyTo} currentUserId={currentLoggedInUserId} />} <p className="message-text-content">{content}</p> {commonMenuButton} </div> );
            case 'image': {
                const imageUrl = msg.imageUrl || content;
                const fileName = typeof imageUrl === 'string' ? imageUrl.substring(imageUrl.lastIndexOf('/') + 1) : 'image.jpg';
                return ( <div className="message-media-container"> {msg.replyTo && <ReplyPreviewBubble messageId={msg.replyTo} currentUserId={currentLoggedInUserId} />} <div className="message-image-wrapper"> <img src={imageUrl} alt="Hình ảnh" className="message-image-content" onError={(e) => { e.target.style.display='none';}}/> <a href={imageUrl} download={fileName} className="message-image-download-btn" title="Tải ảnh xuống" onClick={(e) => e.stopPropagation()}><FaDownload /></a> {commonMenuButton} </div> </div> );
            }
            case 'image_gallery': {
                const galleryItems = Array.isArray(content) ? content : (typeof content === 'string' ? [content] : []);
                return ( <div className="message-media-container"> {msg.replyTo && <ReplyPreviewBubble messageId={msg.replyTo} currentUserId={currentLoggedInUserId} />} <div className="message-image-gallery-container"> {galleryItems.map((url, index) => { const galleryFileName = typeof url === 'string' ? url.substring(url.lastIndexOf('/') + 1) : `gallery_image_${index + 1}.jpg`; return ( <div key={index} className="message-image-wrapper gallery-image-item"> <img src={url} alt={`Hình ảnh ${index + 1}`} className="message-image-content" onError={(e) => { e.target.style.display='none';}}/> <a href={url} download={galleryFileName} className="message-image-download-btn" title="Tải ảnh xuống" onClick={(e) => e.stopPropagation()}><FaDownload /></a> </div> ); })} </div> {commonMenuButton} </div> );
            }
            case 'file':
            case 'video': {
                const fullFileName = typeof content === 'string' ? content.split('/').pop() : (msg.fileName || "Tệp đính kèm");
                const extension = typeof fullFileName === 'string' ? fullFileName.substring(fullFileName.lastIndexOf('.') + 1).toLowerCase() : '';
                let fileIconElement; let iconClassName = "file-type-icon generic";
                switch (extension) {
                    case 'doc': case 'docx': 
                        fileIconElement = <FaFileWord style={{ color: '#2b579a' }} />; 
                        iconClassName = "file-type-icon word"; 
                        break;
                    case 'xls': case 'xlsx': 
                        fileIconElement = <FaFileExcel style={{ color: '#1d6f42' }} />; 
                        iconClassName = "file-type-icon excel"; 
                        break;
                    case 'ppt': case 'pptx': 
                        fileIconElement = <FaFilePowerpoint style={{ color: '#d04423' }} />; 
                        iconClassName = "file-type-icon ppt"; 
                        break;
                    case 'pdf': 
                        fileIconElement = <FaFilePdf style={{ color: '#B30B00' }} />; 
                        iconClassName = "file-type-icon pdf"; 
                        break;
                    case 'zip': case 'rar': case '7z': 
                        fileIconElement = <FaFileArchive style={{ color: '#fab005' }} />; 
                        iconClassName = "file-type-icon archive"; 
                        break;
                    default: 
                        if (contentType === 'video') { 
                            fileIconElement = '🎬'; 
                        } else { 
                            fileIconElement = <FaFileAlt style={{ color: '#868e96' }} />; 
                        }
                        break;
                }
                return ( <div className="message-media-container"> {msg.replyTo && <ReplyPreviewBubble messageId={msg.replyTo} currentUserId={currentLoggedInUserId} />} <div className={`message-file ${contentType === 'video' ? 'message-video' : ''}`}> <span className={`file-icon ${iconClassName}`}>{fileIconElement}</span> <div className="file-info"><span className="file-name">{fullFileName}</span></div> <div className="file-actions-group"> <a href={content} target="_blank" rel="noopener noreferrer" download={fullFileName} className="file-action-btn" title="Tải xuống"><FaDownload /></a> {commonMenuButton} </div> </div> </div> );
            }
            case 'notify': case 'system': return <div className="system-message-text">{content}</div>;
            default: return <p className="message-text-content">{String(content) || 'Tin nhắn không xác định'}</p>;
        }
    };

    if (!selectedChat) {
        const features = [ { name: 'Tin nhắn tự động', icon: '💬' }, { name: 'Nhãn dán Business', icon: '🏷️' }, { name: 'Mời cộng danh bạ', icon: '👥' }, { name: 'Mở rộng nhóm', icon: '➕' }, ];
        return ( <div className="main-content no-chat-selected"><div className="welcome-section"><h2>Chào mừng đến với Zalo PC!</h2><p className="welcome-subtitle">Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng<br />người thân, bạn bè được tối ưu cho máy tính của bạn.</p><div className="welcome-visual"><div className="visual-left placeholder-image">Ảnh minh họa Zalo PC<button className="upgrade-button">NÂNG CẤP NGAY</button></div><div className="visual-right">{features.map((feature) => (<div key={feature.name} className="feature-item"><span className="feature-icon">{feature.icon}</span><span className="feature-name">{feature.name}</span></div>))}</div></div></div></div>);
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
                                {selectedChat.avatar && (typeof selectedChat.avatar === 'string' && (selectedChat.avatar.startsWith('http') || selectedChat.avatar.startsWith('data:image'))) ? <img src={selectedChat.avatar} alt="avatar" /> : selectedChat.name?.substring(0, 2).toUpperCase() || '?'}
                            </div>
                            <div className="chat-header-name-status">
                                <span className="chat-header-name">{selectedChat.name}</span>
                                {selectedChat.type === 'user' && (<span className="chat-header-status">{'Đang hoạt động'}</span>)}
                                {selectedChat.type === 'group' && (<span className="chat-header-status">{getGroupMembersCount(selectedChat)} thành viên</span>)}
                            </div>
                        </div>
                        <div className="chat-header-actions">
                            <button className="action-btn" title="Gọi thoại"><FaPhoneAlt /></button>
                            <button className="action-btn" title="Gọi video"><FaVideo /></button>
                            <button className="action-btn" title="Thông tin hội thoại" onClick={openConvInfoModal}><FaInfoCircle /></button>
                        </div>
                    </div>
                    <div className="message-area" onClick={(e) => { if (!e.target.closest('.message-menu-trigger-btn') && !e.target.closest('.media-item-menu-trigger') && !e.target.closest('.emoji-picker-container')) handleCloseMenu(); setShowEmojiPicker(false); }}>
                        {isLoadingMessages && <div className="loading-messages-container"><FaSpinner className="spinner-icon" /> Đang tải tin nhắn...</div>}
                        {messagesError && <div className="error-messages-container">{messagesError}</div>}
                        {!isLoadingMessages && !messagesError && messages.length > 0 ? (
                            messages.map((msg) => (
                                <div key={msg._id || msg.id || Math.random().toString()} className={`message-item ${msg.senderId?._id === currentLoggedInUserId || msg.senderId === currentLoggedInUserId ? 'sent' : (msg.contentType === 'system' || msg.contentType === 'notify') ? 'system' : 'received'}`}>
                                    {(msg.contentType !== 'system' && msg.contentType !== 'notify' && (msg.senderId?._id !== currentLoggedInUserId && msg.senderId !== currentLoggedInUserId)) && (
                                        <div className={`avatar message-avatar ${selectedChat.type === 'group' ? 'group-message-avatar' : 'user-message-avatar'}`}>
                                            {selectedChat.type === 'group' ? (msg.senderId?.avatar ? <img src={msg.senderId.avatar} alt="avatar" /> : msg.senderId?.userName?.substring(0, 1).toUpperCase() || '?') : (selectedChat.avatar && (typeof selectedChat.avatar === 'string' && (selectedChat.avatar.startsWith('http') || selectedChat.avatar.startsWith('data:image'))) ? <img src={selectedChat.avatar} alt="avatar" /> : selectedChat.name?.substring(0, 1).toUpperCase())}
                                        </div>
                                    )}
                                    <div className="message-content-wrapper">
                                        {selectedChat.type === 'group' && (msg.senderId?._id !== currentLoggedInUserId && msg.senderId !== currentLoggedInUserId) && msg.contentType !== 'system' && msg.contentType !== 'notify' && (<span className="message-sender-name">{msg.senderId?.userName || 'Không rõ'}</span>)}
                                        <div className={`message-bubble ${(msg.contentType || msg.type)?.includes('image') ? 'image-bubble' : ''} ${(msg.contentType || msg.type) === 'file' || (msg.contentType || msg.type) === 'video' ? 'file-bubble' : ''}`}>
                                            {renderMessageContent(msg)}
                                        </div>
                                        {msg.createdAt && <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>}
                                    </div>
                                </div>
                            ))
                        ) : ( !isLoadingMessages && !messagesError && <div className="no-messages-info"><div className="no-messages-icon">💬</div><p>Chưa có tin nhắn nào.</p>{selectedChat && <p>Hãy bắt đầu cuộc trò chuyện với {selectedChat.name}!</p>}</div>)}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="message-input-area">
                        {replyingToMessage && (
                            <div className="reply-preview-bar" ref={replyInputPreviewRef}>
                                <div className="reply-preview-bar-content">
                                    <span className="reply-bar-header">Đang trả lời <strong>{
                                        replyingToMessage.senderId?._id === currentLoggedInUserId ? "chính bạn" :
                                        (replyingToMessage.senderId?.userName || "một tin nhắn")
                                    }</strong></span>
                                    <span className="reply-bar-text-snippet">
                                        {replyingToMessage.contentType === 'text' ? String(replyingToMessage.content).substring(0, 50) + (String(replyingToMessage.content).length > 50 ? '...' : '') 
                                        : replyingToMessage.contentType?.includes('image') ? '[Hình ảnh]' 
                                        : replyingToMessage.contentType === 'video' ? '[Video]'
                                        : replyingToMessage.contentType === 'file' ? `[Tệp: ${String(replyingToMessage.content).split('/').pop()}]`
                                        : `[${replyingToMessage.contentType || 'Tin nhắn'}]`}
                                    </span>
                                </div>
                                <button onClick={() => setReplyingToMessage(null)} className="cancel-reply-bar-btn" title="Hủy trả lời">&times;</button>
                            </div>
                        )}
                        <div className="main-input-controls">
                            <div className="input-actions-left">
                                <button className="input-action-btn" title="Đính kèm file" onClick={handleFileAttachment}><FaPaperclip /></button>
                                <button className="input-action-btn" title="Gửi hình ảnh" onClick={handleImageAttachment}><FaImage /></button>
                            </div>
                            {selectedMedia.length > 0 && (
                                <div className="preview-container">
                                    {selectedMedia.map((media, index) => (
                                        <div key={`${media.name}-${index}`} className="preview-item">
                                            {media.type.startsWith('image/') ? ( <img src={URL.createObjectURL(media)} className="preview-image" alt="preview"/>
                                            ) : ( <div className="file-preview-item"><span className="file-preview-icon">
                                                        { media.name.endsWith('.doc') || media.name.endsWith('.docx') ? <FaFileWord className="file-type-icon word"/> :
                                                          media.name.endsWith('.xls') || media.name.endsWith('.xlsx') ? <FaFileExcel className="file-type-icon excel"/> :
                                                          media.name.endsWith('.ppt') || media.name.endsWith('.pptx') ? <FaFilePowerpoint className="file-type-icon ppt"/> :
                                                          media.name.endsWith('.pdf') ? <FaFilePdf className="file-type-icon pdf"/> :
                                                          media.name.endsWith('.zip') || media.name.endsWith('.rar') || media.name.endsWith('.7z') ? <FaFileArchive className="file-type-icon archive"/> :
                                                          <FaFileAlt className="file-type-icon generic"/>}
                                                    </span> <span className="file-preview-name">{media.name}</span></div>)}
                                            <button className="remove-media-btn" onClick={() => setSelectedMedia(prev => prev.filter((_, i) => i !== index))}>&times;</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <textarea className="message-input" placeholder="Nhập tin nhắn @, tin nhắn nhanh /" rows="1" value={inputText} onChange={handleInputChange} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}/>
                            <div className="input-actions-right">
                                <div style={{ position: 'relative' }} ref={emojiPickerRef}>
                                    <button className="input-action-btn emoji-button" title="Emoji" onClick={toggleEmojiPicker}><FaSmile /></button>
                                    {showEmojiPicker && (<div className="emoji-picker-container" onClick={(e) => e.stopPropagation()}><EmojiPicker onEmojiClick={onEmojiClick} emojiStyle={EmojiStyle.NATIVE} height={350} width="100%" lazyLoadEmojis={true} searchDisabled={false} previewConfig={{ showPreview: false }}/></div>)}
                                </div>
                                <button className="input-action-btn primary" title="Gửi tin nhắn" onClick={sendMessage}><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ForwardMessageModal
                isOpen={isForwardModalOpen}
                onClose={() => setIsForwardModalOpen(false)}
                onConfirm={confirmForward} // Truyền hàm confirmForward vào modal
                currentUserId={currentLoggedInUserId}
                messageToForward={messages.find(m => m._id === forwardingMessageId)} // Tin nhắn cần chuyển tiếp
                allConversations={allConversations || []} // Truyền danh sách các cuộc trò chuyện
            />
            <ConversationInfoModal isOpen={isConvInfoModalOpen} onClose={closeConvInfoModal} chatData={selectedChat} onConversationDeleted={onConversationDeleted} currentUserId={currentLoggedInUserId}/>
            {activeMenu.messageId && currentActiveMessage && (<MessageContextMenu ref={menuRef} message={currentActiveMessage} position={activeMenu} onClose={handleCloseMenu} onRecall={() => handleRecallMessage(activeMenu.messageId)} onDeleteForMe={() => handleDeleteForMe(activeMenu.messageId)} onReply={() => handleReplyMessage(activeMenu.messageId)} onForward={() => handleForwardMessage(activeMenu.messageId)} currentLoggedInUserId={currentLoggedInUserId}/>)}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={onMediaSelected} multiple />
            <input type="file" ref={imageInputRef} style={{ display: 'none' }} accept="image/*" onChange={onMediaSelected} multiple />
        </>
    );
}

export default MainContent;