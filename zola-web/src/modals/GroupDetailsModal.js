import React, { useState, useRef, useEffect } from 'react';
import '../styles/GroupDetailsModal.css';
import {
    FaTimes, FaPen, FaUserFriends, FaCamera, FaLink, FaCopy, FaShareSquare,
    FaCog, FaSignOutAlt, FaTrashAlt, FaSpinner
} from 'react-icons/fa';
import RenameGroupModal from './RenameGroupModal';

function GroupDetailsModal({
    isOpen,
    onClose,
    groupData,
    onManageMembers,
    onLeaveGroup,
    onCopyLink,
    onRenameGroup, // This prop will be used by RenameGroupModal, but this modal opens it
    onDisbandGroup,
    currentUserIsAdmin,
    onUpdateGroupAvatar,
    currentUserId
}) {
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [avatarLoadError, setAvatarLoadError] = useState(false);
    const groupAvatarInputRef = useRef(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [internalGroupData, setInternalGroupData] = useState(groupData);

    useEffect(() => {
        if (isOpen) {
            setInternalGroupData(groupData);
            setAvatarLoadError(false);
            setIsUploadingAvatar(false);
        }
    }, [isOpen, groupData]);

    if (!isOpen || !internalGroupData) {
        return null;
    }

    const groupName = internalGroupData.name || internalGroupData.conversationName || "Tên nhóm";
    const members = internalGroupData.members || [];
    const memberCount = internalGroupData.memberCount || members.length || 0;
    const groupLink = internalGroupData.groupLink || `https://zalo.me/g/${(internalGroupData._id || internalGroupData.id || '').slice(0, 10) || 'testgroup123'}`;

    const SafeAvatar = () => {
        const avatarUrl = internalGroupData?.avatar;
        const name = internalGroupData?.name || internalGroupData?.conversationName || '?';
        const isValidUrl = typeof avatarUrl === 'string' && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:image'));

        if (avatarLoadError || !isValidUrl) {
            const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || name.charAt(0).toUpperCase();
            return <span>{initials}</span>;
        }
        return <img src={avatarUrl} alt={name} onError={() => setAvatarLoadError(true)} />;
    };

    const handleOpenRenameModal = () => {
        if (currentUserIsAdmin || internalGroupData?.currentUserIsDeputy) {
            setIsRenameModalOpen(true);
        }
    };

    const handleConfirmRename = (newName, convId) => {
        if (onRenameGroup) {
             onRenameGroup(newName, convId); // Let parent (ConversationInfoModal) handle API & state
        }
        setInternalGroupData(prev => ({...prev, name: newName, conversationName: newName}));
        setIsRenameModalOpen(false);
    };

    const handleGroupAvatarUploadClick = () => {
        if (groupAvatarInputRef.current && !isUploadingAvatar && (currentUserIsAdmin || internalGroupData?.currentUserIsDeputy)) {
            groupAvatarInputRef.current.click();
        }
    };

    const handleGroupAvatarFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            alert("Vui lòng chọn một tệp hình ảnh hợp lệ.");
            event.target.value = null;
            return;
        }

        if (!internalGroupData?._id || !currentUserId) {
            alert("Lỗi: Thiếu thông tin để cập nhật avatar (ID nhóm hoặc ID người dùng).");
            event.target.value = null;
            return;
        }

        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversation_id', internalGroupData._id);
        formData.append('user_id', currentUserId);

        try {
            const response = await fetch('http://localhost:3001/conversation/updateConversationAvatarWeb', {
                method: 'PUT',
                body: formData,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Cập nhật ảnh đại diện nhóm thành công!');
                if (onUpdateGroupAvatar && data.conversation) {
                    onUpdateGroupAvatar(data.conversation);
                    setInternalGroupData(prev => ({...prev, avatar: data.conversation.avatar}));
                }
            } else {
                alert(data.message || 'Cập nhật ảnh đại diện nhóm thất bại.');
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật avatar nhóm:", error);
            alert("Lỗi kết nối hoặc xử lý phía máy chủ, không thể cập nhật avatar.");
        } finally {
            setIsUploadingAvatar(false);
            if(event.target) event.target.value = null;
        }
    };

    const canEdit = currentUserIsAdmin || internalGroupData?.currentUserIsDeputy;

    return (
        <>
            <div className={`group-details-modal-overlay ${isOpen ? 'active' : ''}`} onMouseDown={onClose}>
                <div className="group-details-modal-content" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="group-details-modal-header">
                        <span style={{ width: '32px' }}></span>
                        <h3>Thông tin nhóm</h3>
                        <button className="group-details-modal-close-btn" onClick={onClose} disabled={isUploadingAvatar}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="group-details-modal-body">
                        <div className="group-main-info-section">
                            <div
                                className={`group-main-avatar ${canEdit && !isUploadingAvatar ? 'editable' : ''}`}
                                style={{ cursor: canEdit && !isUploadingAvatar ? 'pointer' : 'default' }}
                                onClick={canEdit ? handleGroupAvatarUploadClick : undefined}
                                title={canEdit ? "Đổi ảnh đại diện nhóm" : "Ảnh đại diện nhóm"}
                            >
                                {isUploadingAvatar ? (
                                    <FaSpinner className="avatar-spinner" />
                                ) : (
                                    <SafeAvatar />
                                )}
                                {canEdit && !isUploadingAvatar && <span className="camera-icon-overlay"><FaCamera /></span>}
                            </div>
                            <input
                                type="file"
                                ref={groupAvatarInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleGroupAvatarFileChange}
                                disabled={isUploadingAvatar}
                            />
                            <div className="group-name-container">
                                <h2>{groupName}</h2>
                                {canEdit && (
                                    <FaPen className="edit-icon" onClick={handleOpenRenameModal} title="Đổi tên nhóm" />
                                )}
                            </div>
                        </div>

                        <div className="group-info-section">
                            <div className="group-info-list-item" onClick={onManageMembers || (() => console.log("View members"))}>
                                <FaUserFriends className="item-icon" />
                                <span className="item-label">Thành viên ({memberCount})</span>
                            </div>
                            <div className="members-preview-container">
                                {members.slice(0, 5).map(member => {
                                    const memberNameOrInitial = member.userName || member.name || '?';
                                    return (
                                        <div key={member._id || member.id} className="member-avatar-preview" title={memberNameOrInitial}>
                                            {member.avatar ? <img src={member.avatar} alt={memberNameOrInitial} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = memberNameOrInitial.charAt(0).toUpperCase(); }}/> : memberNameOrInitial.charAt(0).toUpperCase()}
                                        </div>
                                    );
                                })}
                                {members.length > 5 && <div className="more-members-indicator">+{members.length - 5}</div>}
                            </div>
                        </div>

                        <div className="group-info-section">
                            <div className="group-info-list-item" style={{ cursor: 'default' }}>
                                <FaLink className="item-icon" />
                                <span className="item-label">Link tham gia nhóm</span>
                            </div>
                            <div className="group-link-display">
                                <span className="link-text">{groupLink}</span>
                                <div className="group-link-actions">
                                    <button title="Sao chép link" onClick={() => onCopyLink ? onCopyLink(groupLink) : navigator.clipboard.writeText(groupLink).then(() => alert('Đã sao chép link!'))}>
                                        <FaCopy />
                                    </button>
                                    <button title="Chia sẻ link" onClick={() => console.log("Share link clicked for:", groupLink)}>
                                        <FaShareSquare />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="group-info-section">
                            <div className="group-info-list-item" onClick={() => onManageMembers ? onManageMembers() : console.log("Manage group clicked")}>
                                <FaCog className="item-icon" />
                                <span className="item-label">Quản lý thành viên & vai trò</span>
                            </div>
                            <div className="group-info-list-item danger-action" onClick={onLeaveGroup || (() => console.log("Leave group clicked"))}>
                                <FaSignOutAlt className="item-icon" />
                                <span className="item-label">Rời nhóm</span>
                            </div>
                            {currentUserIsAdmin && (
                                <div className="group-info-list-item danger-action" onClick={onDisbandGroup || (() => console.log("Disband group clicked"))}>
                                    <FaTrashAlt className="item-icon" />
                                    <span className="item-label">Giải tán nhóm</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <RenameGroupModal
                isOpen={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                onConfirmRename={handleConfirmRename}
                currentGroupName={groupName}
                conversationId={internalGroupData?._id || internalGroupData?.id}
                currentUserId={currentUserId}
            />
        </>
    );
}

export default GroupDetailsModal;