import React, { useState, useRef, useEffect } from 'react';
import '../styles/GroupDetailsModal.css';
import { FaTimes, FaPen, FaCommentDots, FaUserFriends, FaCamera, FaLink, FaCopy, FaShareSquare, FaCog, FaSignOutAlt, FaPhotoVideo, FaTrashAlt } from 'react-icons/fa';
import RenameGroupModal from './RenameGroupModal';

function GroupDetailsModal({
    isOpen,
    onClose,
    groupData,
    onManageMembers,
    onLeaveGroup,
    onCopyLink,
    onRenameGroup,
    onDisbandGroup,
    currentUserIsAdmin,
    onUpdateGroupAvatar
}) {
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [avatarLoadError, setAvatarLoadError] = useState(false); // Thêm state quản lý lỗi tải ảnh
    const groupAvatarInputRef = useRef(null);

    // Reset lỗi avatar mỗi khi modal mở với dữ liệu mới
    useEffect(() => {
        if (isOpen) {
            setAvatarLoadError(false);
        }
    }, [isOpen]);

    if (!isOpen || !groupData) {
        return null;
    }

    // === BẮT ĐẦU SỬA LỖI: Chuẩn hóa lại cách lấy dữ liệu và tạo SafeAvatar ===
    const groupName = groupData.name || "Tên nhóm";
    const members = groupData.members || [];
    const memberCount = groupData.memberCount || members.length || 0;
    const groupLink = groupData.groupLink || `https://zalo.me/g/${groupData.id?.slice(0,10) || 'testgroup123'}`;

    // Component con để render avatar một cách an toàn
    const SafeAvatar = () => {
        const avatarUrl = groupData?.avatar; // Luôn lấy từ groupData.avatar
        const name = groupData?.name || '?';
        const isValidUrl = typeof avatarUrl === 'string' && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:image'));

        if (avatarLoadError || !isValidUrl) {
            const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || name.charAt(0).toUpperCase();
            return <span>{initials}</span>;
        }

        return <img src={avatarUrl} alt={name} onError={() => setAvatarLoadError(true)} />;
    };
    // === KẾT THÚC SỬA LỖI ===

    const handleOpenRenameModal = () => {
        setIsRenameModalOpen(true);
    };

    const handleConfirmRename = (newName) => {
        if (onRenameGroup) {
            onRenameGroup(newName);
        }
        setIsRenameModalOpen(false);
    };

    const handleGroupAvatarUploadClick = () => {
        if (groupAvatarInputRef.current) {
            groupAvatarInputRef.current.click();
        }
    };

    const handleGroupAvatarFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            if (onUpdateGroupAvatar) {
                onUpdateGroupAvatar(file);
            }
        }
        event.target.value = null;
    };

    return (
        <>
            <div className={`group-details-modal-overlay ${isOpen ? 'active' : ''}`} onMouseDown={onClose}>
                <div className="group-details-modal-content" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="group-details-modal-header">
                        <span style={{width: '32px'}}></span>
                        <h3>Thông tin nhóm</h3>
                        <button className="group-details-modal-close-btn" onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="group-details-modal-body">
                        <div className="group-main-info-section">
                            {/* === SỬA LỖI: Dùng SafeAvatar thay cho logic cũ === */}
                            <div className="group-main-avatar" style={{cursor: 'pointer'}} onClick={handleGroupAvatarUploadClick} title="Đổi ảnh đại diện nhóm">
                                <SafeAvatar />
                                <span className="camera-icon-overlay"><FaCamera /></span>
                            </div>
                            {/* === KẾT THÚC SỬA LỖI === */}
                            <input
                                type="file"
                                ref={groupAvatarInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleGroupAvatarFileChange}
                            />
                            <div className="group-name-container">
                                <h2>{groupName}</h2>
                                {currentUserIsAdmin && <FaPen className="edit-icon" onClick={handleOpenRenameModal} title="Đổi tên nhóm"/>}
                            </div>
                            <button className="group-action-button" onClick={() => console.log("Message group clicked")}>
                                <FaCommentDots style={{ marginRight: '5px' }} /> Nhắn tin
                            </button>
                        </div>

                        <div className="group-info-section">
                            <div className="group-info-list-item" onClick={onManageMembers || (() => console.log("View members"))}>
                                <FaUserFriends className="item-icon" />
                                <span className="item-label">Thành viên ({memberCount})</span>
                            </div>
                            <div className="members-preview-container">
                                {members.slice(0, 3).map(member => (
                                    <div key={member.id} className="member-avatar-preview" title={member.name}>
                                        {member.avatarUrl ? <img src={member.avatarUrl} alt={member.name} /> : (member.name ? member.name.charAt(0).toUpperCase() : '?')}
                                    </div>
                                ))}
                                {members.length > 3 && <div className="more-members-indicator">...</div>}
                            </div>
                        </div>
                        
                        <div className="group-info-section">
                            <div className="group-info-list-item" style={{cursor: 'default'}}>
                                <FaPhotoVideo className="item-icon" />
                                <span className="item-label">Ảnh/Video</span>
                            </div>
                            <p className="group-placeholder-text">Chưa có ảnh nào được chia sẻ trong nhóm này</p>
                        </div>

                        <div className="group-info-section">
                            <div className="group-info-list-item" style={{cursor: 'default'}}>
                                <FaLink className="item-icon" />
                                <span className="item-label">Link tham gia nhóm</span>
                            </div>
                            <div className="group-link-display">
                                <span className="link-text">{groupLink}</span>
                                <div className="group-link-actions">
                                    <button title="Sao chép link" onClick={() => onCopyLink ? onCopyLink(groupLink) : navigator.clipboard.writeText(groupLink).then(()=>alert('Đã sao chép link!'))}>
                                        <FaCopy />
                                    </button>
                                    <button title="Chia sẻ link" onClick={() => console.log("Share link clicked")}>
                                        <FaShareSquare />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="group-info-section">
                            <div className="group-info-list-item" onClick={() => console.log("Manage group clicked")}>
                                <FaCog className="item-icon" />
                                <span className="item-label">Quản lý nhóm</span>
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
                groupMembers={members}
            />
        </>
    );
}

export default GroupDetailsModal;