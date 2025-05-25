import React, { useState, useMemo, useEffect, useRef,useCallback } from 'react';
import '../styles/ConversationInfoModal.css';
import {
    FaTimes, FaUserPlus, FaBellSlash, FaThumbtack, FaEyeSlash, FaTrashAlt,
    FaPhotoVideo, FaFileAlt, FaLink, FaUsers, FaExclamationTriangle, FaUserEdit,
    FaSignOutAlt, FaUserCog, FaFilm, FaFolderOpen, FaArrowLeft, FaSearch,
    FaSpinner, FaPen, FaEllipsisV, FaDownload,
    FaFileWord, FaFileExcel, FaFilePowerpoint, FaFilePdf, FaFileArchive,FaBan
} from 'react-icons/fa';
import AddMembersModal from './AddMembersModal';
import TargetAccountInfoModal from './TargetAccountInfoModal';
import GroupDetailsModal from './GroupDetailsModal';
import ConfirmationDialog from './ConfirmationDialog';
import RenameGroupModal from './RenameGroupModal';

async function fetchUsersByIds(userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return [];
    }
    const token = localStorage.getItem('user_token');
    try {
        const response = await fetch("http://localhost:3001/user/get-users-by-ids", {
            method: "POST",
            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ userIds }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to fetch user details, Server responded with:", errorText);
            throw new Error("Failed to fetch user details: " + errorText);
        }
        const data = await response.json();
        return data.users || [];
    } catch (error) {
        console.error("Error in fetchUsersByIds:", error);
        return [];
    }
}

function ConversationInfoModal({
    isOpen,
    onClose,
    chatData,
    currentUserId,
    onConversationDeleted,
    onConversationUpdated
}) {
    const [activeStorageTab, setActiveStorageTab] = useState("media");
    const [currentView, setCurrentView] = useState("info");
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
    const [isTargetAccountInfoModalOpen, setIsTargetAccountInfoModalOpen] = useState(false);
    const [isGroupDetailsModalOpen, setIsGroupDetailsModalOpen] = useState(false);
    const [isLeaveGroupConfirmOpen, setIsLeaveGroupConfirmOpen] = useState(false);
    const [isLeavingGroup, setIsLeavingGroup] = useState(false);
    const [isDisbandGroupConfirmOpen, setIsDisbandGroupConfirmOpen] = useState(false);
    const [isHeaderRenameModalOpen, setIsHeaderRenameModalOpen] = useState(false);
    const [detailedMembers, setDetailedMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [membersError, setMembersError] = useState("");
    const [memberMenuOpen, setMemberMenuOpen] = useState(null);
    const memberMenuRef = useRef(null);
    const [liveChatData, setLiveChatData] = useState(chatData);
    const [currentUserFriends, setCurrentUserFriends] = useState(new Set());
    const [isLoadingCurrentUserFriends, setIsLoadingCurrentUserFriends] = useState(false);
    const [isDisbanding, setIsDisbanding] = useState(false);
    const [fetchedImages, setFetchedImages] = useState([]);
    const [fetchedFilesAndVideos, setFetchedFilesAndVideos] = useState([]);
    const [isLoadingStorage, setIsLoadingStorage] = useState({ media: false, files: false });
    const [storageError, setStorageError] = useState({ media: '', files: '' });

    useEffect(() => {
        if (isOpen) {
            setLiveChatData(chatData);
        }
    }, [isOpen, chatData]);

    useEffect(() => {
        if (isOpen && currentUserId) {
            const fetchCurrentUserFriends = async () => {
                setIsLoadingCurrentUserFriends(true);
                const token = localStorage.getItem('user_token');
                try {
                    const response = await fetch('http://localhost:3001/user/findUserByUserID', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ user_id: currentUserId })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.user && data.user.friend) {
                            const friendIds = new Set(data.user.friend.map(f => f.friend_id.toString()));
                            setCurrentUserFriends(friendIds);
                        } else { setCurrentUserFriends(new Set()); }
                    } else {
                        setCurrentUserFriends(new Set());
                    }
                } catch (error) {
                    setCurrentUserFriends(new Set());
                } finally {
                    setIsLoadingCurrentUserFriends(false);
                }
            };
            fetchCurrentUserFriends();
        } else if (!isOpen) {
            setCurrentUserFriends(new Set());
        }
    }, [isOpen, currentUserId]);

    const enrichedChatData = useMemo(() => {
        if (liveChatData && typeof liveChatData === 'object') {
            const isAdmin = String(liveChatData.groupLeader?._id || liveChatData.groupLeader) === String(currentUserId);
            const isDeputy = Array.isArray(liveChatData.deputyLeaders) && liveChatData.deputyLeaders.map(id => String(id._id || id)).includes(String(currentUserId));
            let generatedGroupLink = liveChatData.groupLink;
            if ((liveChatData.type === "group" || liveChatData.isGroup) && !generatedGroupLink) {
                const idString = String(liveChatData._id || liveChatData.id || '');
                const slicedId = idString.slice(idString.length - 8, idString.length) || "testgrp";
                generatedGroupLink = `https://zalo.me/g/${slicedId}`;
            }
            return {
                ...liveChatData,
                _id: liveChatData._id || liveChatData.id || '',
                name: liveChatData.name || liveChatData.conversationName || "Không có tên",
                avatar: liveChatData.avatar,
                type: liveChatData.type || (liveChatData.groupLeader ? 'group' : 'user'),
                isGroup: liveChatData.isGroup || !!liveChatData.groupLeader,
                members: Array.isArray(liveChatData.members) ? liveChatData.members : [],
                groupLeader: liveChatData.groupLeader,
                deputyLeaders: Array.isArray(liveChatData.deputyLeaders) ? liveChatData.deputyLeaders : [],
                conversationName: liveChatData.conversationName || liveChatData.name || "Không có tên",
                currentUserIsAdmin: isAdmin,
                currentUserIsDeputy: isDeputy,
                coverPhotoUrl: liveChatData.coverPhotoUrl || `https://source.unsplash.com/random/400x150?sig=${liveChatData._id || liveChatData.id || "defaultCover"}`,
                memberCount: (Array.isArray(liveChatData.members) ? liveChatData.members.length : 0),
                groupLink: generatedGroupLink,
            };
        }
        return null;
    }, [liveChatData, currentUserId]);

    useEffect(() => {
        if (isOpen && enrichedChatData?._id) {
            const conversationId = enrichedChatData._id;
            const token = localStorage.getItem('user_token');
            const fetchAllMediaData = async () => {
                setIsLoadingStorage({ media: true, files: true });
                setStorageError({ media: '', files: '' });
                setFetchedImages([]);
                setFetchedFilesAndVideos([]);
                try {
                    const mediaResponse = await fetch('http://localhost:3001/message/getAllMediaWeb', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ conversation_id: conversationId }),
                    });
                    const mediaData = await mediaResponse.json();
                    if (mediaResponse.ok && mediaData.media) {
                        setFetchedImages(mediaData.media);
                    } else {
                        setStorageError(prev => ({ ...prev, media: mediaData.thongbao || 'Lỗi tải ảnh' }));
                    }
                } catch (err) {
                    setStorageError(prev => ({ ...prev, media: 'Lỗi mạng khi tải ảnh' }));
                } finally {
                    setIsLoadingStorage(prev => ({ ...prev, media: false }));
                }
                try {
                    const filesResponse = await fetch('http://localhost:3001/message/getAllFileWeb', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ conversation_id: conversationId }),
                    });
                    const filesData = await filesResponse.json();
                    if (filesResponse.ok && filesData.files) {
                        const processedFiles = filesData.files.map(f => {
                            const extension = f.fileName.split('.').pop().toLowerCase();
                            let type = 'file';
                            if (['mp4', 'mov', 'avi', 'webm', 'mkv', '3gp'].includes(extension)) {
                                type = 'video';
                            }
                            return { ...f, type, url: f.fileLink };
                        });
                        setFetchedFilesAndVideos(processedFiles);
                    } else {
                        setStorageError(prev => ({ ...prev, files: filesData.thongbao || 'Lỗi tải tệp/video' }));
                    }
                } catch (err) {
                    setStorageError(prev => ({ ...prev, files: 'Lỗi mạng khi tải tệp/video' }));
                } finally {
                    setIsLoadingStorage(prev => ({ ...prev, files: false }));
                }
            };
            fetchAllMediaData();
        } else if (!isOpen) {
            setFetchedImages([]);
            setFetchedFilesAndVideos([]);
            setStorageError({ media: '', files: '' });
            setIsLoadingStorage({ media: false, files: false });
            setCurrentView("info");
        }
    }, [isOpen, enrichedChatData?._id]);

    useEffect(() => {
        if (isOpen) {
            setCurrentView("info");
            setSearchTerm("");
            setMembersError("");
            setMemberMenuOpen(null);
        } else {
            setIsAddMembersModalOpen(false);
            setIsTargetAccountInfoModalOpen(false);
            setIsGroupDetailsModalOpen(false);
            setIsLeaveGroupConfirmOpen(false);
            setIsDisbandGroupConfirmOpen(false);
            setIsHeaderRenameModalOpen(false);
            setMemberMenuOpen(null);
        }
    }, [isOpen]);

    const fetchAndSetDetailedMembers = useCallback(async (conversationDataToUse) => {
        if (conversationDataToUse && Array.isArray(conversationDataToUse.members) && conversationDataToUse.members.length > 0) {
            setIsLoadingMembers(true);
            setMembersError("");
            try {
                const memberIds = conversationDataToUse.members.map(m => m._id || m);
                const memberDetails = await fetchUsersByIds(memberIds);
                if (!Array.isArray(memberDetails)) {
                    setDetailedMembers([]);
                    setMembersError("Lỗi định dạng dữ liệu thành viên chi tiết.");
                    return;
                }
                const membersWithRoles = memberDetails.map((member) => {
                    if (!member || typeof member._id === 'undefined') {
                        return { ...member, _id: String(Date.now() + Math.random()), userName: "Lỗi User", role: "Thành viên (Lỗi)" };
                    }
                    let role = "Thành viên";
                    const leaderId = String(conversationDataToUse.groupLeader?._id || conversationDataToUse.groupLeader);
                    const deputyIds = (conversationDataToUse.deputyLeaders || []).map(id => String(id._id || id));

                    if (leaderId && String(member._id) === leaderId) {
                        role = "Trưởng nhóm";
                    } else if (deputyIds.includes(String(member._id))) {
                        role = "Phó nhóm";
                    }
                    return { ...member, role };
                });
                setDetailedMembers(membersWithRoles);
            } catch (error) {
                setMembersError("Lỗi tải và xử lý chi tiết thành viên.");
                setDetailedMembers([]);
            } finally {
                setIsLoadingMembers(false);
            }
        } else {
            setDetailedMembers([]);
            setIsLoadingMembers(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && currentView === "memberList" && enrichedChatData?.isGroup) {
            fetchAndSetDetailedMembers(enrichedChatData);
        }
    }, [isOpen, currentView, enrichedChatData, fetchAndSetDetailedMembers]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (memberMenuRef.current && !memberMenuRef.current.contains(event.target)) {
                if (!event.target.closest(".member-menu-dots-btn")) {
                    setMemberMenuOpen(null);
                }
            }
        };
        if (memberMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [memberMenuOpen]);


    const handleToggleMemberMenu = (memberId, event) => {
        event.stopPropagation();
        setMemberMenuOpen((prev) => (prev === memberId ? null : memberId));
    };

    const handleMemberMenuAction = async (action, memberId, memberName) => {
        setMemberMenuOpen(null);
        if (!enrichedChatData?._id || !currentUserId || !memberId) {
            alert("Thao tác thất bại, thiếu thông tin nhóm hoặc người dùng.");
            return;
        }
        let url = "";
        let payload = {
            conversationId: enrichedChatData._id,
            requesterId: currentUserId, 
        };
        let confirmationMessage = "";
        const token = localStorage.getItem('user_token');

        switch (action) {
            case "removeMember":
                confirmationMessage = `Bạn có chắc chắn muốn xóa ${memberName} khỏi nhóm?`;
                url = 'http://localhost:3001/conversation/removeMemberFromGroup'; // Sử dụng API mới
                payload.memberUserIdToRemove = memberId;
                break;
            case "assignDeputy":
                confirmationMessage = `Bạn có muốn bổ nhiệm ${memberName} làm phó nhóm?`;
                url = 'http://localhost:3001/conversation/addDeputyLeader'; // Sử dụng API mới
                payload.newDeputyUserId = memberId;
                break;
            case "revokeDeputy":
                confirmationMessage = `Bạn có chắc chắn muốn gỡ quyền phó nhóm của ${memberName}?`;
                url = 'http://localhost:3001/conversation/removeDeputyLeader'; // Sử dụng API mới
                payload.deputyUserIdToRemove = memberId;
                break;
            case "transferLeadership":
                confirmationMessage = `Bạn có chắc chắn muốn chuyển quyền trưởng nhóm cho ${memberName}? Hành động này không thể hoàn tác.`;
                url = 'http://localhost:3001/conversation/changeGroupLeader'; // Sử dụng API mới
                payload.newLeaderUserId = memberId;
                break;
            default:
                alert(`Hành động "${action}" chưa được hỗ trợ.`);
                return;
        }
        if (confirmationMessage && !window.confirm(confirmationMessage)) {
            return;
        }
        setIsLoadingMembers(true);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                alert(`Lỗi: ${data.message || 'Thao tác thất bại, vui lòng thử lại.'}`);
            } else {
                alert(data.message || "Thao tác thành công!");
                if (data.conversation) { // Giả sử API trả về conversation đầy đủ
                    setLiveChatData(prev => ({ ...prev, ...data.conversation, type: 'group' }));
                    if(onConversationUpdated) onConversationUpdated(data.conversation);
                } else { // Nếu API không trả về conversation, thì fetch lại
                     fetchAndSetDetailedMembers(enrichedChatData); // Tải lại danh sách member
                }
            }
        } catch (error) {
            alert(`Lỗi kết nối, không thể thực hiện hành động ${action}.`);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    const currentMemberIdsInGroup = useMemo(() => {
        const idsFromChatData = liveChatData?.members?.map((m) => String(m.id || m._id || m)) || [];
        return Array.from(new Set(idsFromChatData));
    }, [liveChatData?.members]);

    const SafeAvatar = ({ data, className }) => {
        const avatarUrlToUse = data?.avatar;
        const nameToUse = data?.name || data?.userName || "?";
        const [localAvatarLoadError, setLocalAvatarLoadError] = useState(false);
        useEffect(() => { setLocalAvatarLoadError(false); }, [avatarUrlToUse]);
        const isValidUrl = typeof avatarUrlToUse === "string" && (avatarUrlToUse.startsWith("http") || avatarUrlToUse.startsWith("data:image"));
        if (localAvatarLoadError || !isValidUrl) {
            const initials = (nameToUse || '?').split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || (nameToUse || '?').charAt(0).toUpperCase();
            return <span className={className}>{initials}</span>;
        }
        return (<img src={avatarUrlToUse} alt={nameToUse} onError={() => setLocalAvatarLoadError(true)} className={className}/>);
    };
    
    const isGroupType = enrichedChatData?.type === "group" || enrichedChatData?.isGroup;
    
    const linkMessages = useMemo(() =>
        (liveChatData?.messages || [])
        .filter(m => m.contentType === "text" && m.content && /https?:\/\/[^\s]+/.test(m.content))
        .map(m => ({ ...m, url: m.content.match(/https?:\/\/[^\s]+/)[0] })),
        [liveChatData?.messages]
    );

    const handleGroupNameUpdatedByModal = (newName, convId) => {
        const updatedConv = { ...liveChatData, name: newName, conversationName: newName };
        setLiveChatData(updatedConv);
        if (onConversationUpdated) {
            onConversationUpdated({ _id: convId, name: newName, conversationName: newName, updatedAt: new Date().toISOString() });
        }
        setIsHeaderRenameModalOpen(false);
    };
    
    const handleHeaderEntityClick = () => {
        if (isGroupType) {
            setIsGroupDetailsModalOpen(true);
        } else {
            setIsTargetAccountInfoModalOpen(true);
        }
    };

    const handleOpenRenameModalFromHeader = (e) => {
        e.stopPropagation();
        if (isGroupType && (enrichedChatData?.currentUserIsAdmin || enrichedChatData?.currentUserIsDeputy)) {
            setIsHeaderRenameModalOpen(true);
        }
    };

    const handleSendFriendRequest = async (targetMemberId) => {
        if (!currentUserId || !targetMemberId) {
            alert("Lỗi: Thiếu thông tin người dùng.");
            return;
        }
        const token = localStorage.getItem('user_token');
        try {
            const response = await fetch('http://localhost:3001/user/sendFriendRequestWeb', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ user_id: currentUserId, friend_id: targetMemberId })
            });
            const data = await response.json();
            alert(data.message || (response.ok ? "Đã gửi lời mời kết bạn!" : "Gửi lời mời thất bại."));
        } catch (error) {
            alert("Lỗi kết nối khi gửi lời mời.");
        }
    };

    const handleAction = (action, data = null) => {
        if (!enrichedChatData) return;
        switch (action) {
            case "view_all_members": if (isGroupType) setCurrentView("memberList"); break;
            case "request_add_member_view": if (isGroupType) setIsAddMembersModalOpen(true); break;
            case "connect_friend": if (data) handleSendFriendRequest(data); break;
            case "leave_group":
                if (isGroupType) {
                    if (enrichedChatData.currentUserIsAdmin) {
                        const otherMembersExist = enrichedChatData.members && enrichedChatData.members.filter(m => String(m._id || m) !== String(currentUserId)).length > 0;
                        if (otherMembersExist) {
                            alert("Bạn là trưởng nhóm. Vui lòng chuyển quyền trưởng nhóm cho một thành viên khác trước khi rời nhóm.");
                        } else { requestLeaveGroupConfirmation(); }
                    } else { requestLeaveGroupConfirmation(); }
                }
                break;
            case "group_settings": if (isGroupType) setIsGroupDetailsModalOpen(true); break;
            default: break;
        }
    };

    const handleConfirmAddMembers = (updatedConversationDataFromApi) => {
        setIsAddMembersModalOpen(false);
        if (updatedConversationDataFromApi && updatedConversationDataFromApi.members) {
            const updatedConv = { ...liveChatData, ...updatedConversationDataFromApi, type: 'group' };
            setLiveChatData(updatedConv);
            if (onConversationUpdated) onConversationUpdated(updatedConv);
             fetchAndSetDetailedMembers(updatedConv);
        }
    };

    const handleGroupAvatarUpdatedByDetailsModal = (updatedConversationFromApi) => {
        const updatedConv = { ...liveChatData, ...updatedConversationFromApi, type: 'group' };
        setLiveChatData(updatedConv);
        if (onConversationUpdated) onConversationUpdated(updatedConv);
    };


    const handleBackToInfo = () => {
        setCurrentView("info");
        setSearchTerm("");
        setMemberMenuOpen(null);
    };

    const handleManageMembersInGroupDetails = () => {
        setIsGroupDetailsModalOpen(false);
        setCurrentView("memberList");
        setSearchTerm("");
    };

    const requestLeaveGroupConfirmation = () => setIsLeaveGroupConfirmOpen(true);
    const requestDisbandGroupConfirmation = () => setIsDisbandGroupConfirmOpen(true);

    const executeLeaveGroup = async () => {
        if (!enrichedChatData?._id || !currentUserId) {
            alert("Lỗi: Thiếu thông tin để rời nhóm.");
            setIsLeaveGroupConfirmOpen(false);
            return;
        }
        setIsLeavingGroup(true);
        const token = localStorage.getItem('user_token');
        try {
            const response = await fetch('http://localhost:3001/conversation/leaveGroup', { // Giả sử API là leaveGroup
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ conversationId: enrichedChatData._id, requesterId: currentUserId }) // Sửa payload
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message || "Rời nhóm thành công!");
                if (onConversationDeleted) { onConversationDeleted(enrichedChatData._id); }
                onClose();
            } else {
                alert(data.message || "Rời nhóm thất bại.");
            }
        } catch (error) {
            alert("Lỗi kết nối, không thể rời nhóm.");
        } finally {
            setIsLeavingGroup(false);
            setIsLeaveGroupConfirmOpen(false);
        }
    };
    
    const executeDisbandGroup = async () => {
        if (!enrichedChatData?._id || !currentUserId) {
            alert("Lỗi: Thiếu thông tin để giải tán nhóm.");
            setIsDisbandGroupConfirmOpen(false);
            return;
        }
        if (!enrichedChatData.currentUserIsAdmin) {
            alert("Bạn không có quyền giải tán nhóm này.");
            setIsDisbandGroupConfirmOpen(false);
            return;
        }
        setIsDisbanding(true);
        const token = localStorage.getItem('user_token');
        try {
            const response = await fetch('http://localhost:3001/conversation/disbandGroup', { // Giả sử API là disbandGroup
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ conversationId: enrichedChatData._id, requesterId: currentUserId }) // Sửa payload
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message || "Giải tán nhóm thành công!");
                if (onConversationDeleted) { onConversationDeleted(enrichedChatData._id); }
                onClose();
            } else {
                alert(data.message || "Giải tán nhóm thất bại.");
            }
        } catch (error) {
            alert("Lỗi kết nối, không thể giải tán nhóm.");
        } finally {
            setIsDisbanding(false);
            setIsDisbandGroupConfirmOpen(false);
        }
    };

    const renderStorageTabContent = () => {
        const displayLimit = 12;
        const fileDisplayLimit = 10;
        switch (activeStorageTab) {
            case "media":
                const videosFromFiles = fetchedFilesAndVideos.filter(f => f.type === 'video');
                const allMediaItems = [
                    ...fetchedImages.map(url => ({ type: 'image', url, id: url + '-img' })),
                    ...videosFromFiles.map(video => ({ type: 'video', ...video, id: video.fileLink + '-vid' }))
                ];
                const isLoadingCurrentTab = isLoadingStorage.media || isLoadingStorage.files;
                const hasActualMediaError = storageError.media && storageError.media !== 'Không tìm thấy media nào trong cuộc trò chuyện này.';
                const hasActualVideoError = storageError.files && videosFromFiles.length === 0 && storageError.files !== 'Không tìm thấy file!!!';

                return (
                    <div className="storage-tab-content media-grid">
                        {isLoadingCurrentTab && (<div className="loading-placeholder"><FaSpinner className="spinner-icon"/> Đang tải...</div>)}
                        {!isLoadingCurrentTab && allMediaItems.length === 0 && (
                            hasActualMediaError ? <p className="error-message">Lỗi tải ảnh: {storageError.media}</p> :
                            hasActualVideoError ? <p className="error-message">Lỗi tải video: {storageError.files}</p> :
                            <p className="empty-tab-message">Chưa có ảnh/video nào được chia sẻ.</p>
                        )}
                        {allMediaItems.length > 0 && allMediaItems.slice(0, displayLimit).map((item, index) => (
                            <div key={item.id || index} className="media-item-preview storage-media-item">
                                {item.type === 'image' ? (
                                    <img src={item.url} alt={`Media ${index + 1}`} onError={(e) => e.target.style.display='none'} />
                                ) : (
                                    <div className="video-placeholder">
                                        <FaFilm className="video-icon-overlay" />
                                        <span>{item.fileName || 'Video'}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {!isLoadingCurrentTab && allMediaItems.length > displayLimit && (
                            <button className="view-all-storage-btn">Xem tất cả ({allMediaItems.length})</button>
                        )}
                    </div>
                );
            case "files":
                const filesOnlyToDisplay = fetchedFilesAndVideos.filter(f => f.type === 'file');
                const isLoadingFilesTab = isLoadingStorage.files;
                const hasActualFileErrorTab = storageError.files && storageError.files !== 'Không tìm thấy file!!!';
                return (
                    <div className="storage-tab-content file-list">
                        {isLoadingFilesTab && <div className="loading-placeholder"><FaSpinner className="spinner-icon"/> Đang tải...</div>}
                        {!isLoadingFilesTab && filesOnlyToDisplay.length === 0 && (
                            hasActualFileErrorTab ? <p className="error-message">{storageError.files}</p> :
                            <p className="empty-tab-message">Chưa có file nào được chia sẻ.</p>
                        )}
                        {filesOnlyToDisplay.length > 0 && filesOnlyToDisplay.slice(0, fileDisplayLimit).map((file, index) => {
                            const extension = file.fileName.split('.').pop().toLowerCase();
                            let fileIcon;
                            let iconClassName = "file-item-icon generic";
                            switch (extension) {
                                case 'doc': case 'docx': fileIcon = <FaFileWord />; iconClassName += " word"; break;
                                case 'xls': case 'xlsx': fileIcon = <FaFileExcel />; iconClassName += " excel"; break;
                                case 'ppt': case 'pptx': fileIcon = <FaFilePowerpoint />; iconClassName += " ppt"; break;
                                case 'pdf': fileIcon = <FaFilePdf />; iconClassName += " pdf"; break;
                                case 'zip': case 'rar': case '7z': fileIcon = <FaFileArchive />; iconClassName += " archive"; break;
                                default: fileIcon = <FaFileAlt />; break;
                            }
                            return (
                                <div key={file.fileLink || index} className="file-item-preview storage-file-item">
                                    <span className={iconClassName}>{fileIcon}</span>
                                    <div className="file-item-details">
                                        <span className="file-item-name" title={file.fileName}>{file.fileName}</span>
                                    </div>
                                    <a href={file.fileLink} target="_blank" rel="noopener noreferrer" download={file.fileName} className="download-icon-storage"><FaDownload /></a>
                                </div>
                            );
                        })}
                        {!isLoadingFilesTab && filesOnlyToDisplay.length > fileDisplayLimit && (
                            <button className="view-all-storage-btn">Xem tất cả ({filesOnlyToDisplay.length})</button>
                        )}
                    </div>
                );
            case "links":
                const currentLinkMessages = linkMessages;
                return (
                    <div className="storage-tab-content link-list">
                        {currentLinkMessages.length > 0 ? (
                            currentLinkMessages.slice(0, fileDisplayLimit).map((msg, index) => (
                                <div key={msg._id || index} className="link-item-preview storage-link-item">
                                    <FaLink className="link-item-icon" />
                                    <div className="link-item-details">
                                        <a href={msg.url} target="_blank" rel="noopener noreferrer" className="link-item-url" title={msg.url}>
                                            {msg.url}
                                        </a>
                                        {msg.senderId?.userName && <span className="link-item-sender">Gửi bởi: {msg.senderId.userName}</span>}
                                    </div>
                                </div>
                            ))
                        ) : ( <p className="empty-tab-message">Chưa có link nào được chia sẻ.</p> )}
                        {currentLinkMessages.length > fileDisplayLimit && (
                            <button className="view-all-storage-btn">Xem tất cả ({currentLinkMessages.length})</button>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const renderInfoContent = () => {
        return (
            <>
                <div className="conv-info-header">
                    <button className="modal-close-btn-conv-info" onClick={onClose} title="Đóng"><FaTimes /></button>
                    <div className={`avatar modal-avatar ${isGroupType ? "group-avatar" : "user-avatar"} ${enrichedChatData?.online && !isGroupType ? "online" : ""}`} onClick={handleHeaderEntityClick} style={{ cursor: "pointer" }}>
                        <SafeAvatar data={enrichedChatData} />
                        {enrichedChatData?.online && !isGroupType && (<span className="online-indicator"></span>)}
                    </div>
                    <div className="conv-info-name-wrapper">
                        <h2 onClick={handleHeaderEntityClick} style={{ cursor: "pointer", display: "inline-block" }} title={isGroupType ? "Xem thông tin nhóm" : "Xem thông tin tài khoản"}>{enrichedChatData?.name}</h2>
                        {isGroupType && (enrichedChatData?.currentUserIsAdmin || enrichedChatData?.currentUserIsDeputy) && ( <FaPen className="conv-info-rename-group-icon" title="Đổi tên nhóm" onClick={handleOpenRenameModalFromHeader}/>)}
                    </div>
                    {isGroupType && <p>{enrichedChatData?.memberCount || 0} thành viên</p>}
                    {!isGroupType && (<p className={enrichedChatData?.online ? "status-online" : "status-offline"}>{enrichedChatData?.online ? "Đang hoạt động" : "Không hoạt động"}</p>)}
                </div>
                <div className="conv-info-actions-bar">
                    <button className="conv-action-item-bar"><FaBellSlash /> <span>Thông báo</span></button>
                    <button className="conv-action-item-bar"><FaThumbtack /> <span>Ghim</span></button>
                    <button className="conv-action-item-bar"><FaEyeSlash /> <span>Ẩn</span></button>
                    {isGroupType && (enrichedChatData?.currentUserIsAdmin || enrichedChatData?.currentUserIsDeputy) && (<button className="conv-action-item-bar" onClick={() => handleAction("view_all_members")}><FaUserCog /> <span>Quản lý</span></button>)}
                </div>
                <div className="conv-info-body">
                    <div className="conv-info-section storage-section">
                        <div className="storage-tabs-nav">
                            <button className={`storage-tab-btn ${activeStorageTab === "media" ? "active" : ""}`} onClick={() => setActiveStorageTab("media")}><FaPhotoVideo /> Ảnh/Video ({fetchedImages.length + fetchedFilesAndVideos.filter(f=>f.type==='video').length})</button>
                            <button className={`storage-tab-btn ${activeStorageTab === "files" ? "active" : ""}`} onClick={() => setActiveStorageTab("files")}><FaFolderOpen /> File ({fetchedFilesAndVideos.filter(f=>f.type==='file').length})</button>
                            <button className={`storage-tab-btn ${activeStorageTab === "links" ? "active" : ""}`} onClick={() => setActiveStorageTab("links")}><FaLink /> Link ({linkMessages.length})</button>
                        </div>
                        {renderStorageTabContent()}
                    </div>
                    {isGroupType && (
                    <div className="conv-info-section">
                        <h3>Thành viên ({enrichedChatData?.memberCount || 0})</h3>
                        <div className="member-list-preview">
                            {(detailedMembers.length > 0 ? detailedMembers : (enrichedChatData?.members || [])).slice(0,6).map(member => {
                                const memberId = String(member._id || member.id || member);
                                const memberName = member.userName || member.name || "Thành viên";
                                return (
                                    <div key={memberId} className="avatar member-avatar-small" title={memberName}>
                                        <SafeAvatar data={member} className="initials-avatar-small"/>
                                    </div>
                                );
                            })}
                            {(enrichedChatData?.memberCount || 0) > 6 && <div className="avatar member-avatar-small more-indicator">+{ (enrichedChatData?.memberCount || 0) - 6}</div>}
                        </div>
                        <div className="conv-info-item" onClick={() => handleAction("view_all_members")}><FaUsers /> Xem danh sách thành viên</div>
                        {(enrichedChatData?.currentUserIsAdmin || enrichedChatData?.currentUserIsDeputy) &&(<div className="conv-info-item" onClick={() => handleAction("request_add_member_view")}><FaUserPlus /> Thêm thành viên</div>)}
                    </div>)}
                    {!isGroupType && (
                    <div className="conv-info-section">
                        <h3>Tuỳ chọn</h3>
                        <div className="conv-info-item"><FaUserPlus /> Tạo nhóm với {enrichedChatData?.name}</div>
                        <div className="conv-info-item"><FaUsers /> Xem nhóm chung</div>
                    </div>)}
                    <div className="conv-info-section conv-info-danger-zone">
                        <h3>Thiết lập bảo mật & khác</h3>
                        {isGroupType && (<div className="conv-info-item" onClick={() => handleAction("group_settings")}><FaUserEdit /> Tuỳ chỉnh nhóm</div>)}
                        <div className="conv-info-item danger"><FaTrashAlt /> Xóa lịch sử trò chuyện</div>
                        {!isGroupType && (<div className="conv-info-item danger"><FaBan /> Chặn {enrichedChatData?.name}</div>)}
                        {isGroupType && (<div className="conv-info-item danger" onClick={requestLeaveGroupConfirmation}><FaSignOutAlt /> Rời nhóm</div>)}
                        {isGroupType && enrichedChatData?.currentUserIsAdmin && (<div className="conv-info-item danger" onClick={requestDisbandGroupConfirmation}><FaExclamationTriangle /> Giải tán nhóm</div>)}
                    </div>
                </div>
            </>
        );
    };

    const renderMemberListContent = () => {
        if (!isGroupType) return null;
        const currentFilteredMembers = detailedMembers.filter((member) => (member?.userName || member?.name || "")?.toLowerCase().includes(searchTerm.toLowerCase()));
        return (
            <>
                <div className="conv-info-header member-list-header-override">
                    <button className="modal-back-btn-conv-info" onClick={handleBackToInfo} title="Quay lại"><FaArrowLeft /></button>
                    <h2>Thành viên ({isLoadingMembers ? <FaSpinner className="spinner-icon-inline"/> : currentFilteredMembers.length})</h2>
                </div>
                <div className="member-list-controls">
                    {(enrichedChatData?.currentUserIsAdmin || enrichedChatData?.currentUserIsDeputy) && (<button className="add-member-btn" onClick={() => handleAction("request_add_member_view")}><FaUserPlus /> Thêm thành viên</button>)}
                    <div className="member-search-bar"><FaSearch className="search-icon" /><input type="text" placeholder="Tìm kiếm thành viên" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                </div>
                <div className="member-list-scrollable">
                    {isLoadingMembers && (<div className="loading-message" style={{ textAlign: "center", padding: "20px" }}><FaSpinner className="spinner-icon" /> Đang tải...</div>)}
                    {membersError && (<div className="error-message" style={{ textAlign: "center", padding: "20px", color: "red" }}>{membersError}</div>)}
                    {!isLoadingMembers && !membersError && currentFilteredMembers.length > 0 ? currentFilteredMembers.map((member) => {
                        if (!member || typeof member._id === 'undefined') { return null; }
                        const memberName = member.userName || member.name || "Không rõ";
                        const memberId = String(member._id);
                        const isSelf = memberId === String(currentUserId);
                        const currentUserIsAdminValue = enrichedChatData?.currentUserIsAdmin === true;
                        const currentUserIsDeputyValue = enrichedChatData?.currentUserIsDeputy === true;
                        const memberIsAdminValue = memberId === String(enrichedChatData?.groupLeader?._id || enrichedChatData?.groupLeader);
                        const memberIsDeputyValue = (enrichedChatData?.deputyLeaders || []).map(id => String(id._id || id)).includes(memberId);
                        const isAlreadyFriendValue = currentUserFriends.has(memberId);
                        let showThreeDotMenu = false;
                        if (!isSelf) {
                            if (currentUserIsAdminValue) { showThreeDotMenu = true; }
                            else if (currentUserIsDeputyValue && !memberIsAdminValue && !memberIsDeputyValue ) { showThreeDotMenu = true; }
                        }
                        return (
                            <div key={memberId} className="member-item">
                                <div className={`avatar member-avatar-item`}>
                                    <SafeAvatar data={member} className="initials-avatar-member-list"/>
                                </div>
                                <div className="member-details"><span className="member-name">{memberName}</span>{member.role && member.role !== "Thành viên" && (<span className="member-role">{member.role}</span>)}</div>
                                {isSelf ? null : showThreeDotMenu ? (
                                    <div className="member-actions-menu-container" ref={memberMenuOpen === memberId ? memberMenuRef : null}>
                                        <button className="member-menu-dots-btn" onClick={(e) => handleToggleMemberMenu(memberId, e)}><FaEllipsisV /></button>
                                        {memberMenuOpen === memberId && (
                                        <div className="member-actions-dropdown">
                                            {currentUserIsAdminValue && !memberIsAdminValue && (<><button onClick={() => handleMemberMenuAction("assignDeputy",memberId,memberName)} disabled={memberIsDeputyValue}>Phân phó nhóm</button><button onClick={() => handleMemberMenuAction("revokeDeputy",memberId,memberName)} disabled={!memberIsDeputyValue}>Gỡ quyền phó nhóm</button><button onClick={() => handleMemberMenuAction("transferLeadership",memberId,memberName)}>Chuyển quyền trưởng nhóm</button></>)}
                                            {(currentUserIsAdminValue && !memberIsAdminValue) || (currentUserIsDeputyValue && !memberIsAdminValue && !memberIsDeputyValue) ? (<button className="action-remove" onClick={() => handleMemberMenuAction("removeMember",memberId,memberName)}>Xóa thành viên</button>) : null}
                                        </div>)}
                                    </div>
                                ) : !isLoadingCurrentUserFriends && !isAlreadyFriendValue && !memberIsAdminValue && !memberIsDeputyValue ? ( <button className="member-action-btn" onClick={() => handleAction("connect_friend", memberId)}>Kết bạn</button>
                                ) : isAlreadyFriendValue && !memberIsAdminValue && !memberIsDeputyValue ? (<span className="friend-status-indicator">Bạn bè</span>) : null }
                            </div>);
                        }) : !isLoadingMembers && !membersError && ( <p className="empty-member-list-message">{searchTerm ? "Không tìm thấy thành viên nào." : "Chưa có thành viên nào trong nhóm."}</p>)}
                </div>
            </>
        );
    };

    if (!isOpen || !enrichedChatData) {
        return null;
    }

    return (
        <>
            <div className={`modal-overlay-conv-info ${isOpen ? "active" : ""}`} onClick={currentView === "info" ? onClose : undefined} >
                <div className="modal-content-conv-info" onClick={(e) => e.stopPropagation()}>
                    {currentView === "info" ? renderInfoContent() : renderMemberListContent()}
                </div>
            </div>
            <AddMembersModal 
                isOpen={isAddMembersModalOpen} 
                onClose={() => setIsAddMembersModalOpen(false)} 
                onConfirm={handleConfirmAddMembers} 
                currentGroupMemberIds={currentMemberIdsInGroup} 
                conversationId={enrichedChatData?._id} 
                currentUserId={currentUserId}
            />
            {!isGroupType && 
                <TargetAccountInfoModal 
                    isOpen={isTargetAccountInfoModalOpen} 
                    onClose={() => setIsTargetAccountInfoModalOpen(false)} 
                    userData={enrichedChatData} 
                    currentUserId={currentUserId} 
                    onSendFriendRequest={handleSendFriendRequest} 
                    currentUserFriends={currentUserFriends}
                />
            }
            {isGroupType && 
                <GroupDetailsModal 
                    isOpen={isGroupDetailsModalOpen} 
                    onClose={() => setIsGroupDetailsModalOpen(false)} 
                    groupData={enrichedChatData} 
                    onManageMembers={handleManageMembersInGroupDetails} 
                    onLeaveGroup={requestLeaveGroupConfirmation} 
                    onRenameGroup={handleGroupNameUpdatedByModal} 
                    onDisbandGroup={requestDisbandGroupConfirmation} 
                    currentUserIsAdmin={enrichedChatData?.currentUserIsAdmin} 
                    currentUserId={currentUserId} 
                    onUpdateGroupAvatar={handleGroupAvatarUpdatedByDetailsModal}
                />
            }
            {isGroupType && 
                <RenameGroupModal 
                    isOpen={isHeaderRenameModalOpen} 
                    onClose={() => setIsHeaderRenameModalOpen(false)} 
                    onConfirmRename={handleGroupNameUpdatedByModal} 
                    currentGroupName={enrichedChatData?.name} 
                    conversationId={enrichedChatData?._id} 
                    currentUserId={currentUserId} 
                />
            }
            <ConfirmationDialog 
                isOpen={isLeaveGroupConfirmOpen} 
                onClose={() => setIsLeaveGroupConfirmOpen(false)} 
                onConfirm={executeLeaveGroup} 
                title="Rời khỏi nhóm?" 
                message={`Bạn có chắc chắn muốn rời khỏi nhóm "${enrichedChatData?.name || "này"}" không? Bạn sẽ không thể xem lại tin nhắn trong nhóm này nữa.`} 
                confirmText={isLeavingGroup ? <FaSpinner className="spinner-icon-inline" /> : "Rời nhóm"} 
                cancelText="Hủy"
                isConfirmDisabled={isLeavingGroup}
            />
            <ConfirmationDialog 
                isOpen={isDisbandGroupConfirmOpen} 
                onClose={() => setIsDisbandGroupConfirmOpen(false)} 
                onConfirm={executeDisbandGroup} 
                title="Giải tán nhóm?" 
                message={`Bạn có chắc chắn muốn giải tán nhóm "${enrichedChatData?.name || "này"}" không? Hành động này không thể hoàn tác và toàn bộ lịch sử trò chuyện sẽ bị xóa.`} 
                confirmText={isDisbanding ? <FaSpinner className="spinner-icon-inline" /> : "Giải tán"} 
                cancelText="Hủy"
                isConfirmDisabled={isDisbanding}
            />
        </>
    );
}

export default ConversationInfoModal;