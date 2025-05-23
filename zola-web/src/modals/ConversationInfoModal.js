import React, { useState, useMemo, useEffect } from 'react';
import '../styles/ConversationInfoModal.css';
import {
  FaTimes, FaUserPlus, FaBellSlash, FaThumbtack, FaEyeSlash, FaTrashAlt, FaBan,
  FaPhotoVideo, FaFileAlt, FaLink, FaUsers, FaExclamationTriangle, FaUserEdit, FaSignOutAlt, FaUserCog,
  FaFilm, FaFolderOpen, FaArrowLeft, FaSearch,
  FaPen
} from 'react-icons/fa';
import { FaUserPlus as FaUserPlusForAddMember } from 'react-icons/fa';

import AddMembersModal from './AddMembersModal';
import TargetAccountInfoModal from './TargetAccountInfoModal';
import GroupDetailsModal from './GroupDetailsModal';
import ConfirmationDialog from './ConfirmationDialog';
import RenameGroupModal from './RenameGroupModal';

function ConversationInfoModal({ isOpen, onClose, chatData, currentUserId }) {
  const [activeStorageTab, setActiveStorageTab] = useState('media');
  const [currentView, setCurrentView] = useState('info');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [isTargetAccountInfoModalOpen, setIsTargetAccountInfoModalOpen] = useState(false);
  const [isGroupDetailsModalOpen, setIsGroupDetailsModalOpen] = useState(false);
  const [isLeaveGroupConfirmOpen, setIsLeaveGroupConfirmOpen] = useState(false);
  const [isDisbandGroupConfirmOpen, setIsDisbandGroupConfirmOpen] = useState(false);
  const [isHeaderRenameModalOpen, setIsHeaderRenameModalOpen] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentView('info');
      setSearchTerm('');
      setAvatarLoadError(false);
    } else {
      setIsAddMembersModalOpen(false);
      setIsTargetAccountInfoModalOpen(false);
      setIsGroupDetailsModalOpen(false);
      setIsLeaveGroupConfirmOpen(false);
      setIsDisbandGroupConfirmOpen(false);
      setIsHeaderRenameModalOpen(false);
    }
  }, [isOpen]);

  const currentMemberIdsInGroup = useMemo(() => {
    const idsFromChatData = chatData?.members?.map(m => m.id) || [];
    return Array.from(new Set(idsFromChatData));
  }, [chatData?.members]);

  const enrichedChatData = useMemo(() => {
    if (chatData) {
        let generatedGroupLink;
        const isAdmin = chatData.type === 'group' && chatData.adminId === currentUserId;

        if (chatData.type === 'group') {
            if (chatData.groupLink) {
                generatedGroupLink = chatData.groupLink;
            } else {
                const idString = chatData.id != null ? String(chatData.id) : '';
                const slicedId = idString.slice(0, 8);
                generatedGroupLink = `https://zalo.me/g/${slicedId || 'testgroup123'}`;
            }
        }
        return {
            ...chatData,
            currentUserIsAdmin: isAdmin,
            coverPhotoUrl: chatData.coverPhotoUrl || `https://source.unsplash.com/random/400x150?sig=${chatData.id || 'defaultCover'}`,
            gender: chatData.gender || (chatData.type !== 'group' ? (Math.random() > 0.5 ? 'Nam' : 'Nữ') : undefined),
            dob: chatData.dob || (chatData.type !== 'group' ? `0${Math.floor(Math.random()*9)+1}/0${Math.floor(Math.random()*9)+1}`: undefined),
            phone: chatData.phone || (chatData.type !== 'group' ? `090****${Math.floor(Math.random()*900)+100}`: undefined),
            memberCount: chatData.members?.length || chatData.memberCount || 0,
            groupLink: generatedGroupLink,
        };
    }
    return chatData;
  }, [chatData, currentUserId]);

  if (!enrichedChatData) {
    return null;
  }

  const SafeAvatar = ({ data }) => {
    const avatarUrl = data?.avatar;
    const name = data?.name || '?';
    const isValidUrl = typeof avatarUrl === 'string' && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:image'));

    if (avatarLoadError || !isValidUrl) {
      const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || name.charAt(0).toUpperCase();
      return <span>{initials}</span>;
    }

    return <img src={avatarUrl} alt={name} onError={() => setAvatarLoadError(true)} />;
  };

  const isGroup = enrichedChatData.type === 'group';
  const mediaMessages = enrichedChatData.messages?.filter(m => m.type === 'image' && m.imageUrl) || [];
  const fileMessages = enrichedChatData.messages?.filter(m => m.type === 'file') || [];
  const linkMessages = enrichedChatData.messages?.filter(m => m.type === 'link' || (m.type === 'text' && /https?:\/\/[^\s]+/.test(m.text))) || [];
  const sharedMediaCount = mediaMessages.length;
  const sharedFilesCount = fileMessages.length;
  const sharedLinksCount = linkMessages.length;

  const getMemberCountForDisplay = (chat) => {
    if (chat.type === 'group') return chat.memberCount || (chat.members && chat.members.length > 0 ? chat.members.length : (chat.membersCount || 0));
    return 0;
  }
  const memberCountDisplay = getMemberCountForDisplay(enrichedChatData);

  const handleHeaderEntityClick = () => {
    if (isGroup) {
        setIsGroupDetailsModalOpen(true);
    } else {
        setIsTargetAccountInfoModalOpen(true);
    }
  };

  const handleOpenRenameModalFromHeader = (e) => {
    e.stopPropagation();
    if (isGroup && enrichedChatData.currentUserIsAdmin) {
      setIsHeaderRenameModalOpen(true);
    }
  };

  const handleAction = (action, data = null) => {
    if (action === 'view_all_members') {
      setCurrentView('memberList');
    } else if (action === 'request_add_member_view' || action === 'add_member_to_group') {
      setIsAddMembersModalOpen(true);
    } else if (action === 'connect_friend') {
      console.log('Request to connect with member ID:', data);
    }
    else if (action === 'leave_group' && isGroup) {
        requestLeaveGroupConfirmation();
    } else {
      console.log(`Action: ${action}`, data ? `with data: ${JSON.stringify(data)}` : `on chat ID: ${enrichedChatData.id}, Name: ${enrichedChatData.name}`);
    }
  };

  const handleConfirmAddMembers = (newUserIds) => {
    console.log('Thêm các thành viên mới vào nhóm (ID):', newUserIds);
    setIsAddMembersModalOpen(false);
  };

  const handleBackToInfo = () => {
    setCurrentView('info');
  };

  const handleManageMembersInGroupDetails = () => {
    setIsGroupDetailsModalOpen(false);
    setCurrentView('memberList');
    setSearchTerm('');
  };

  const requestLeaveGroupConfirmation = () => {
    setIsLeaveGroupConfirmOpen(true);
  };

  const executeLeaveGroup = () => {
    console.log("Đã xác nhận rời nhóm:", enrichedChatData.id);
    setIsLeaveGroupConfirmOpen(false);
    setIsGroupDetailsModalOpen(false);
    onClose();
  };

  const handleRenameGroupConfirmed = (newName) => {
    console.log(`Yêu cầu đổi tên nhóm ${enrichedChatData.id} thành: ${newName} (từ GroupDetailsModal)`);
    alert(`Đã đổi tên nhóm thành: ${newName} (cần logic cập nhật thực tế)`);
  };

  const handleConfirmRenameFromHeader = (newName) => {
    console.log(`Yêu cầu đổi tên nhóm ${enrichedChatData.id} thành: ${newName} (từ Header)`);
    alert(`Đã đổi tên nhóm thành: ${newName} (cần logic cập nhật thực tế)`);
    setIsHeaderRenameModalOpen(false);
  };

  const requestDisbandGroupConfirmation = () => {
    setIsDisbandGroupConfirmOpen(true);
  };

  const executeDisbandGroup = () => {
    console.log("Đã xác nhận GIẢI TÁN nhóm:", enrichedChatData.id);
    setIsDisbandGroupConfirmOpen(false);
    setIsGroupDetailsModalOpen(false);
    onClose();
  };

  const members = enrichedChatData?.members || [];
  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueSendersPreview = isGroup ?
    Array.from(new Set(enrichedChatData.messages
      ?.filter(msg => msg.sender && msg.sender !== 'me')
      .map(msg => msg.sender)))
      .slice(0, 4)
    : [];

  const renderStorageTabContent = () => {
    switch (activeStorageTab) {
      case 'media':
        return (
          <div className="storage-tab-content media-grid">
            {sharedMediaCount > 0 ? (
              mediaMessages.slice(0, 12).map((msg, index) => (
                <div key={msg.id || index} className="media-item-preview" onClick={() => handleAction('view_media_item', msg)}>
                  <img src={msg.imageUrl} alt={msg.text || `Media ${index + 1}`} />
                  {msg.type === 'video' && <FaFilm className="video-icon-overlay" />}
                </div>
              ))
            ) : (
              <p className="empty-tab-message">Chưa có ảnh/video nào được chia sẻ.</p>
            )}
            {sharedMediaCount > 12 && <button className="view-all-storage-btn" onClick={() => handleAction('view_all_media')}>Xem tất cả ({sharedMediaCount})</button>}
          </div>
        );
      case 'files':
        return (
          <div className="storage-tab-content file-list">
            {sharedFilesCount > 0 ? (
              fileMessages.slice(0,10).map((msg, index) => (
                <div key={msg.id || index} className="file-item-preview" onClick={() => handleAction('view_file_item', msg)}>
                  <FaFileAlt className="file-item-icon" />
                  <div className="file-item-details">
                    <span className="file-item-name">{msg.fileName || `Tập tin ${index + 1}`}</span>
                    <span className="file-item-meta">{msg.fileSize || ''} - {msg.time || ''}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-tab-message">Chưa có file nào được chia sẻ.</p>
            )}
              {sharedFilesCount > 10 && <button className="view-all-storage-btn" onClick={() => handleAction('view_all_files')}>Xem tất cả ({sharedFilesCount})</button>}
          </div>
        );
      case 'links':
        return (
          <div className="storage-tab-content link-list">
            {sharedLinksCount > 0 ? (
              linkMessages.slice(0,10).map((msg, index) => {
                const urlMatch = msg.text?.match(/https?:\/\/[^\s]+/);
                const url = urlMatch ? urlMatch[0] : '#';
                return (
                  <div key={msg.id || index} className="link-item-preview" onClick={() => handleAction('view_link_item', msg)}>
                      <FaLink className="link-item-icon" />
                    <div className="link-item-details">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="link-item-url">{url}</a>
                        <span className="link-item-sender">Gửi bởi: {msg.sender === 'me' ? 'Bạn' : msg.sender} - {msg.time}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="empty-tab-message">Chưa có link nào được chia sẻ.</p>
            )}
            {sharedLinksCount > 10 && <button className="view-all-storage-btn" onClick={() => handleAction('view_all_links')}>Xem tất cả ({sharedLinksCount})</button>}
          </div>
        );
      default:
        return null;
    }
  };

  const renderMemberListContent = () => {
    if (!isGroup) return null;

    return (
      <>
        <div className="conv-info-header member-list-header-override">
          <button className="modal-back-btn-conv-info" onClick={handleBackToInfo} title="Quay lại">
            <FaArrowLeft />
          </button>
          <h2>Thành viên ({filteredMembers.length})</h2>
        </div>

        <div className="member-list-controls">
          <button className="add-member-btn" onClick={() => handleAction('request_add_member_view')}>
            <FaUserPlusForAddMember /> Thêm thành viên
          </button>
          <div className="member-search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm thành viên"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="member-list-scrollable">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div key={member.id} className="member-item">
                <div className={`avatar member-avatar-item ${member.avatarUrl ? '' : 'initial-avatar'}`}>
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.name} />
                  ) : (
                    member.name ? member.name.charAt(0).toUpperCase() : '?'
                  )}
                </div>
                <div className="member-details">
                  <span className="member-name">{member.name}</span>
                  {member.role && member.role !== 'Thành viên' && (
                    <span className="member-role">{member.role}</span>
                  )}
                </div>
                {member.id !== currentUserId && !member.isCurrentUser && (
                    <button className="member-action-btn" onClick={() => handleAction('connect_friend', member.id)}>
                        Kết bạn
                    </button>
                )}
              </div>
            ))
          ) : (
            <p className="empty-member-list-message">
              {searchTerm ? 'Không tìm thấy thành viên nào.' : (members.length > 0 ? 'Không tìm thấy thành viên nào khớp.' : 'Chưa có thành viên nào trong nhóm.')}
            </p>
          )}
        </div>
      </>
    );
  };

  const renderInfoContent = () => {
    return (
    <>
      <div className="conv-info-header">
        <button className="modal-close-btn-conv-info" onClick={onClose} title="Đóng">
          <FaTimes />
        </button>
        <div
          className={`avatar modal-avatar ${isGroup ? 'group-avatar' : 'user-avatar'} ${enrichedChatData.online && !isGroup ? 'online' : ''}`}
          onClick={handleHeaderEntityClick}
          style={{ cursor: 'pointer' }}
        >
          <SafeAvatar data={enrichedChatData} />
          {enrichedChatData.online && !isGroup && <span className="online-indicator"></span>}
        </div>
        <div className="conv-info-name-wrapper">
            <h2
            onClick={handleHeaderEntityClick}
            style={{ cursor: 'pointer', display: 'inline-block' }}
            title={isGroup ? "Xem thông tin nhóm" : "Xem thông tin tài khoản"}
            >
            {enrichedChatData.name}
            </h2>
            {isGroup && enrichedChatData.currentUserIsAdmin && (
            <FaPen
                className="conv-info-rename-group-icon"
                title="Đổi tên nhóm"
                onClick={handleOpenRenameModalFromHeader}
            />
            )}
        </div>
        {isGroup && <p>{memberCountDisplay} thành viên</p>}
        {!isGroup && <p className={enrichedChatData.online ? 'status-online' : 'status-offline'}>{enrichedChatData.online ? "Đang hoạt động" : "Không hoạt động"}</p>}
      </div>
      <div className="conv-info-actions-bar">
        <button className="conv-action-item-bar" onClick={() => handleAction('toggle_notifications')}>
          <FaBellSlash /> <span>Thông báo</span>
        </button>
        <button className="conv-action-item-bar" onClick={() => handleAction('pin_conversation')}>
          <FaThumbtack /> <span>Ghim</span>
        </button>
        <button className="conv-action-item-bar" onClick={() => handleAction('hide_conversation')}>
          <FaEyeSlash /> <span>Ẩn</span>
        </button>
        {isGroup && (
          <button className="conv-action-item-bar" onClick={() => handleAction('manage_members_main')}>
            <FaUserCog /> <span>Quản lý</span>
          </button>
        )}
      </div>
      <div className="conv-info-body">
        <div className="conv-info-section storage-section">
          <div className="storage-tabs-nav">
            <button
              className={`storage-tab-btn ${activeStorageTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveStorageTab('media')}
            >
              <FaPhotoVideo /> Ảnh/Video ({sharedMediaCount})
            </button>
            <button
              className={`storage-tab-btn ${activeStorageTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveStorageTab('files')}
            >
              <FaFolderOpen /> File ({sharedFilesCount})
            </button>
            <button
              className={`storage-tab-btn ${activeStorageTab === 'links' ? 'active' : ''}`}
              onClick={() => setActiveStorageTab('links')}
            >
              <FaLink /> Link ({sharedLinksCount})
            </button>
          </div>
          {renderStorageTabContent()}
        </div>
        {isGroup && (
          <div className="conv-info-section">
            <h3>Thành viên ({memberCountDisplay})</h3>
            <div className="member-list-preview">
              {uniqueSendersPreview.map((senderName, idx) => (
                <div key={idx} className="avatar member-avatar-small" title={senderName}>{senderName.charAt(0).toUpperCase()}</div>
              ))}
            </div>
            <div className="conv-info-item" onClick={() => handleAction('view_all_members')}>
              <FaUsers /> Xem danh sách thành viên
            </div>
            <div className="conv-info-item" onClick={() => handleAction('add_member_to_group')}>
              <FaUserPlus /> Thêm thành viên
            </div>
          </div>
        )}
        {!isGroup && (
          <div className="conv-info-section">
            <h3>Tuỳ chọn</h3>
            <div className="conv-info-item" onClick={() => handleAction('create_group_with_user')}>
              <FaUserPlus /> Tạo nhóm với {enrichedChatData.name}
            </div>
            <div className="conv-info-item" onClick={() => handleAction('view_common_groups')}>
              <FaUsers /> Xem nhóm chung
            </div>
          </div>
        )}
        <div className="conv-info-section conv-info-danger-zone">
          <h3>Thiết lập bảo mật & khác</h3>
          {isGroup && (
            <div className="conv-info-item" onClick={() => handleAction('group_settings')}>
              <FaUserEdit /> Tuỳ chỉnh nhóm
            </div>
          )}
          <div className="conv-info-item danger" onClick={() => handleAction('delete_history')}>
            <FaTrashAlt /> Xóa lịch sử trò chuyện
          </div>
          {!isGroup && (
            <div className="conv-info-item danger" onClick={() => handleAction('block_user')}>
              <FaBan /> Chặn {enrichedChatData.name}
            </div>
          )}
          <div className="conv-info-item danger" onClick={() => handleAction('report_user_or_group')}>
            <FaExclamationTriangle /> Báo xấu
          </div>
          {isGroup && (
            <div className="conv-info-item danger" onClick={() => handleAction('leave_group')}>
              <FaSignOutAlt /> Rời nhóm
            </div>
          )}
        </div>
      </div>
    </>
    );
  };

  return (
    <>
      <div className={`modal-overlay-conv-info ${isOpen ? 'active' : ''}`} onClick={currentView === 'info' ? onClose : undefined}>
        <div className="modal-content-conv-info" onClick={(e) => e.stopPropagation()}>
          {currentView === 'info' ? renderInfoContent() : renderMemberListContent()}
        </div>
      </div>

      <AddMembersModal
        isOpen={isAddMembersModalOpen}
        onClose={() => setIsAddMembersModalOpen(false)}
        onConfirm={handleConfirmAddMembers}
        currentGroupMemberIds={currentMemberIdsInGroup}
      />

      <TargetAccountInfoModal
        isOpen={isTargetAccountInfoModalOpen}
        onClose={() => setIsTargetAccountInfoModalOpen(false)}
        userData={enrichedChatData}
      />

      <GroupDetailsModal
        isOpen={isGroupDetailsModalOpen}
        onClose={() => setIsGroupDetailsModalOpen(false)}
        groupData={enrichedChatData}
        onManageMembers={handleManageMembersInGroupDetails}
        onLeaveGroup={requestLeaveGroupConfirmation}
        onRenameGroup={handleRenameGroupConfirmed}
        onDisbandGroup={requestDisbandGroupConfirmation}
        currentUserIsAdmin={enrichedChatData.currentUserIsAdmin}
      />

      <RenameGroupModal
        isOpen={isHeaderRenameModalOpen}
        onClose={() => setIsHeaderRenameModalOpen(false)}
        onConfirmRename={handleConfirmRenameFromHeader}
        currentGroupName={enrichedChatData.name}
        groupMembers={enrichedChatData.members || []}
      />

      <ConfirmationDialog
        isOpen={isLeaveGroupConfirmOpen}
        onClose={() => setIsLeaveGroupConfirmOpen(false)}
        onConfirm={executeLeaveGroup}
        title="Rời khỏi nhóm?"
        message={`Bạn có chắc chắn muốn rời khỏi nhóm "${enrichedChatData?.name || 'này'}" không? Bạn sẽ không thể xem lại tin nhắn trong nhóm này nữa.`}
        confirmText="Rời nhóm"
        cancelText="Hủy"
      />

      <ConfirmationDialog
        isOpen={isDisbandGroupConfirmOpen}
        onClose={() => setIsDisbandGroupConfirmOpen(false)}
        onConfirm={executeDisbandGroup}
        title="Giải tán nhóm?"
        message={`Bạn có chắc chắn muốn giải tán nhóm "${enrichedChatData?.name || 'này'}" không? Hành động này không thể hoàn tác và toàn bộ lịch sử trò chuyện sẽ bị xóa.`}
        confirmText="Giải tán"
        cancelText="Hủy"
      />
    </>
  );
}

export default ConversationInfoModal;