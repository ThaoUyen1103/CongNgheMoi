import React, { useState, useMemo, useEffect, useRef } from "react";
import "../styles/ConversationInfoModal.css";
import {
  FaTimes, FaUserPlus, FaBellSlash, FaThumbtack, FaEyeSlash, FaTrashAlt, FaBan,
  FaPhotoVideo, FaFileAlt, FaLink, FaUsers, FaExclamationTriangle, FaUserEdit,
  FaSignOutAlt, FaUserCog, FaFilm, FaFolderOpen, FaArrowLeft, FaSearch,
  FaSpinner, FaPen, FaEllipsisV,
} from "react-icons/fa";
import { FaUserPlus as FaUserPlusForAddMember } from "react-icons/fa";

import AddMembersModal from "./AddMembersModal";
import TargetAccountInfoModal from "./TargetAccountInfoModal";
import GroupDetailsModal from "./GroupDetailsModal";
import ConfirmationDialog from "./ConfirmationDialog";
import RenameGroupModal from "./RenameGroupModal";

async function fetchUsersByIds(userIds) {
  // ... (Giữ nguyên hàm này)
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }
  try {
    const response = await fetch("http://localhost:3001/user/get-users-by-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to fetch user details, Server responded with:",
        errorText
      );
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
    // --- THÊM PROP MỚI CHO VIỆC XÓA CONVERSATION ---
    onConversationDeleted 
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
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [detailedMembers, setDetailedMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [memberMenuOpen, setMemberMenuOpen] = useState(null);
  const memberMenuRef = useRef(null);
  const [liveChatData, setLiveChatData] = useState(chatData);
  const [currentUserFriends, setCurrentUserFriends] = useState(new Set());
  const [isLoadingCurrentUserFriends, setIsLoadingCurrentUserFriends] = useState(false);
  // --- THÊM STATE CHO VIỆC GIẢI TÁN NHÓM ---
  const [isDisbanding, setIsDisbanding] = useState(false);


  useEffect(() => {
    // ... (Giữ nguyên useEffect này)
    if (isOpen && currentUserId) {
        const fetchCurrentUserFriends = async () => {
            setIsLoadingCurrentUserFriends(true);
            try {
                const response = await fetch('http://localhost:3001/user/findUserByUserID', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: currentUserId })
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.user && data.user.friend) {
                        const friendIds = new Set(data.user.friend.map(f => f.friend_id.toString()));
                        setCurrentUserFriends(friendIds);
                    } else {
                         setCurrentUserFriends(new Set());
                    }
                } else {
                    console.error("Lỗi khi lấy danh sách bạn bè của người dùng hiện tại.");
                     setCurrentUserFriends(new Set());
                }
            } catch (error) {
                console.error("Lỗi kết nối khi lấy danh sách bạn bè:", error);
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

  useEffect(() => {
    // ... (Giữ nguyên useEffect này)
    if (isOpen) {
      console.log("Modal Prop: chatData received:",JSON.stringify(chatData, null, 2));
      setLiveChatData(chatData); 
      setAvatarLoadError(false); 
    }
  }, [isOpen, chatData]);

  const enrichedChatData = useMemo(() => {
    // ... (Giữ nguyên useMemo này)
    if (liveChatData && typeof liveChatData === 'object') {
      let generatedGroupLink;
      const isAdmin = String(liveChatData.groupLeader) === String(currentUserId); 
      const isDeputy = Array.isArray(liveChatData.deputyLeader) && liveChatData.deputyLeader.map(id => String(id)).includes(String(currentUserId));

      if (liveChatData.type === "group") {
        if (liveChatData.groupLink) {
          generatedGroupLink = liveChatData.groupLink;
        } else {
          const idString = String(liveChatData._id || liveChatData.id || '');
          const slicedId = idString.slice(0, 8);
          generatedGroupLink = `https://zalo.me/g/${ slicedId || "testgroup123" }`;
        }
      }
      const result = {
        ...liveChatData,
        _id: liveChatData._id || liveChatData.id || '',
        name: liveChatData.name || liveChatData.conversationName || "Không có tên",
        avatar: liveChatData.avatar,
        type: liveChatData.type || (liveChatData.groupLeader ? 'group' : 'user'),
        members: Array.isArray(liveChatData.members) ? liveChatData.members : [],
        groupLeader: liveChatData.groupLeader,
        deputyLeader: Array.isArray(liveChatData.deputyLeader) ? liveChatData.deputyLeader : [],
        conversationName: liveChatData.conversationName || liveChatData.name || "Không có tên",
        updatedAt: liveChatData.updatedAt,
        currentUserIsAdmin: isAdmin,
        currentUserIsDeputy: isDeputy,
        coverPhotoUrl:
          liveChatData.coverPhotoUrl ||
          `https://source.unsplash.com/random/400x150?sig=${
            liveChatData._id || liveChatData.id || "defaultCover"
          }`,
        memberCount: (Array.isArray(liveChatData.members) ? liveChatData.members.length : 0),
        groupLink: generatedGroupLink,
        adminId: liveChatData.groupLeader,
        deputyAdminIds: Array.isArray(liveChatData.deputyLeader) ? liveChatData.deputyLeader : [],
        messages: Array.isArray(liveChatData.messages) ? liveChatData.messages : [],
        gender: liveChatData.gender,
        dob: liveChatData.dob,
        phone: liveChatData.phone,
        online: liveChatData.online || false,
      };
      console.log("enrichedChatData re-calculated:", JSON.stringify(result, null, 2));
      return result;
    }
    console.log("enrichedChatData returning null due to falsy liveChatData");
    return null;
  }, [liveChatData, currentUserId]);

  useEffect(() => {
    // ... (Giữ nguyên useEffect này)
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
      setIsDisbandGroupConfirmOpen(false); // Reset cả state này
      setIsHeaderRenameModalOpen(false);
      setMemberMenuOpen(null);
    }
  }, [isOpen]);

  const fetchAndSetDetailedMembers = async (conversationDataToUse) => {
    // ... (Giữ nguyên hàm này)
    console.log("fetchAndSetDetailedMembers called with data:", JSON.stringify(conversationDataToUse, null, 2));
    if (conversationDataToUse && Array.isArray(conversationDataToUse.members) && conversationDataToUse.members.length > 0) {
      try {
        const memberDetails = await fetchUsersByIds(conversationDataToUse.members);
         if (!Array.isArray(memberDetails)) {
          console.error("fetchUsersByIds did not return an array:", memberDetails);
          setDetailedMembers([]);
          setMembersError("Lỗi định dạng dữ liệu thành viên chi tiết.");
          return;
        }
        const membersWithRoles = memberDetails.map((member) => {
          if (!member || typeof member._id === 'undefined') {
            console.warn("Invalid member object from fetchUsersByIds:", member);
            return { ...member, _id: String(Date.now() + Math.random()), userName: "Lỗi User", name: "Lỗi User", role: "Thành viên (Lỗi)" }; 
          }
          let role = "Thành viên";
          if (conversationDataToUse.groupLeader && String(member._id) === String(conversationDataToUse.groupLeader)) {
            role = "Trưởng nhóm";
          } else if (Array.isArray(conversationDataToUse.deputyLeader) && conversationDataToUse.deputyLeader.map(id => String(id)).includes(String(member._id))) {
            role = "Phó nhóm";
          }
          return { ...member, role };
        });
        console.log("Setting detailedMembers to:", JSON.stringify(membersWithRoles, null, 2));
        setDetailedMembers(membersWithRoles);
      } catch (error) {
        console.error("Error during fetchUsersByIds processing in fetchAndSetDetailedMembers:", error);
        setMembersError("Lỗi tải và xử lý chi tiết thành viên.");
        setDetailedMembers([]);
      }
    } else {
      console.log("Setting detailedMembers to empty: No members or invalid conversationData.", conversationDataToUse);
      setDetailedMembers([]);
    }
  };

  useEffect(() => {
    // ... (Giữ nguyên useEffect này)
    const doFetchDetailedMembers = async () => {
      if (
        currentView === "memberList" &&
        enrichedChatData && 
        enrichedChatData._id &&
        enrichedChatData.type === "group"
      ) {
        console.log("useEffect[currentView, enrichedChatData]: Fetching initial detailed members for convId:", enrichedChatData._id);
        setIsLoadingMembers(true);
        setMembersError("");
        setDetailedMembers([]); 
        try {
          const response = await fetch(
            "http://localhost:3001/conversation/getMemberFromConversationIDWeb",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ conversation_id: enrichedChatData._id }),
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Lỗi ${response.status}` }));
            throw new Error(errorData.message || `Lỗi ${response.status}`);
          }
          const memberListData = await response.json();
          console.log("useEffect[currentView, enrichedChatData]: Received member IDs:", memberListData.members);
          
          await fetchAndSetDetailedMembers({ 
            ...enrichedChatData, 
            members: Array.isArray(memberListData.members) ? memberListData.members : [] 
          });
        } catch (error) {
          console.error("Lỗi khi tải danh sách thành viên (useEffect):", error);
          setMembersError("Không thể tải danh sách thành viên. Vui lòng thử lại.");
        } finally {
          setIsLoadingMembers(false);
        }
      }
    };

    if (isOpen && currentView === "memberList" && enrichedChatData?._id) {
        doFetchDetailedMembers();
    }
  }, [isOpen, currentView, enrichedChatData]);

  const handleToggleMemberMenu = (memberId, event) => {
    // ... (Giữ nguyên hàm này)
    event.stopPropagation();
    setMemberMenuOpen((prev) => (prev === memberId ? null : memberId));
  };

  const handleMemberMenuAction = async (action, memberId, memberName) => {
    // ... (Giữ nguyên hàm này)
    setMemberMenuOpen(null);
    if (!enrichedChatData?._id || !currentUserId || !memberId) {
      alert("Thao tác thất bại, thiếu thông tin nhóm hoặc người dùng.");
      return;
    }

    let url = "";
    let payload = {
      conversation_id: enrichedChatData._id,
      user_id: currentUserId, 
      friend_id: memberId,    
    };
    let confirmationMessage = "";

    switch (action) {
      case "removeMember":
        confirmationMessage = `Bạn có chắc chắn muốn xóa ${memberName} khỏi nhóm?`;
        url = 'http://localhost:3001/conversation/removeMemberFromConversationGroupWeb';
        break;
      case "assignDeputy":
        confirmationMessage = `Bạn có muốn phân ${memberName} làm phó nhóm?`;
        url = 'http://localhost:3001/conversation/authorizeDeputyLeaderWeb';
        break;
      case "revokeDeputy":
        confirmationMessage = `Bạn có chắc chắn muốn gỡ quyền phó nhóm của ${memberName}?`;
        url = 'http://localhost:3001/conversation/deleteDeputyLeaderWeb';
        break;
      case "transferLeadership":
        confirmationMessage = `Bạn có chắc chắn muốn chuyển quyền trưởng nhóm cho ${memberName}? Hành động này không thể hoàn tác.`;
        url = 'http://localhost:3001/conversation/authorizeGroupLeaderWeb';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log(`[${action}] API Response Data:`, JSON.stringify(data, null, 2));

      if (!response.ok) {
        alert(`Lỗi: ${data.message || 'Thao tác thất bại, vui lòng thử lại.'}`);
        setIsLoadingMembers(false); 
        return;
      }
      alert(data.message || "Thao tác thành công!");

      if (data.conversation) {
        console.log(`[${action}] Updating liveChatData with:`, JSON.stringify(data.conversation, null, 2));
        setLiveChatData(prevData => ({
            ...prevData, 
            ...data.conversation, 
            type: 'group' 
        }));
        
        if (action === 'transferLeadership' && data.conversation.groupLeader === memberId) {
          if (data.conversation.groupLeader !== currentUserId) {
            // onClose(); 
          }
        }
      } else {
        console.warn(`[${action}] API response did not contain 'conversation' object. Forcing a refresh based on current enriched data if in memberList.`);
         if (currentView === "memberList" && enrichedChatData?._id) {
          const tempEnrichedData = {...enrichedChatData}; 
          setLiveChatData(tempEnrichedData); 
         }
      }
    } catch (error) {
      console.error(`Lỗi kết nối khi thực hiện hành động ${action}:`, error);
      alert(`Lỗi kết nối, không thể thực hiện hành động ${action}.`);
      setIsLoadingMembers(false); 
    } 
  };
  
  useEffect(() => {
    // ... (Giữ nguyên useEffect này)
    const handleClickOutside = (event) => {
      if (
        memberMenuRef.current &&
        !memberMenuRef.current.contains(event.target)
      ) {
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

  const currentMemberIdsInGroup = useMemo(() => {
    // ... (Giữ nguyên useMemo này)
    const idsFromChatData = liveChatData?.members?.map((m) => String(m.id || m._id || m)) || []; 
    return Array.from(new Set(idsFromChatData));
  }, [liveChatData?.members]);

  const SafeAvatar = ({ data }) => {
    // ... (Giữ nguyên SafeAvatar)
    const avatarUrlToUse = data?.avatar;
    const nameToUse = data?.name || data?.userName || "?";
    const [localAvatarLoadError, setLocalAvatarLoadError] = useState(false);

    useEffect(() => {
        setLocalAvatarLoadError(false); 
    }, [avatarUrlToUse]);


    const isValidUrl =
      typeof avatarUrlToUse === "string" &&
      (avatarUrlToUse.startsWith("http") || avatarUrlToUse.startsWith("data:image"));

    if (localAvatarLoadError || !isValidUrl) {
      const initials =
        (nameToUse || '?')
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() || (nameToUse || '?').charAt(0).toUpperCase();
      return <span>{initials}</span>;
    }
    return (
      <img
        src={avatarUrlToUse}
        alt={nameToUse}
        onError={() => setLocalAvatarLoadError(true)}
      />
    );
  };

  const isGroup = enrichedChatData?.type === "group";
  // ... (Giữ nguyên các khai báo mediaMessages, sharedMediaCount, etc.)
  const mediaMessages =
    enrichedChatData?.messages?.filter(
      (m) => m.type === "image" && m.imageUrl
    ) || [];
  const fileMessages =
    enrichedChatData?.messages?.filter((m) => m.type === "file") || [];
  const linkMessages =
    enrichedChatData?.messages?.filter(
      (m) =>
        m.type === "link" ||
        (m.type === "text" && /https?:\/\/[^\s]+/.test(m.text))
    ) || [];
  const sharedMediaCount = mediaMessages.length;
  const sharedFilesCount = fileMessages.length;
  const sharedLinksCount = linkMessages.length;
  const handleGroupNameUpdatedByModal = (newName, convId) => {
    console.log(`Nhóm ${convId} đã được đổi tên thành: ${newName} (Callback từ RenameGroupModal)`);
    setLiveChatData(prevData => {
        if (prevData && (prevData._id || prevData.id) === convId) {
            return {
                ...prevData,
                name: newName,
                conversationName: newName,
                type: 'group' 
            };
        }
        return prevData;
    });
    setIsHeaderRenameModalOpen(false); 
  };

  const getMemberCountForDisplay = (chatToDisplay) => {
    // ... (Giữ nguyên hàm này)
    if (detailedMembers.length > 0 && !isLoadingMembers && !membersError) {
        return detailedMembers.length;
    }
    if (chatToDisplay?.type === "group") return chatToDisplay.memberCount || 0;
    return 0;
  };
  const memberCountDisplay = getMemberCountForDisplay(enrichedChatData);

  const handleHeaderEntityClick = () => {
    // ... (Giữ nguyên hàm này)
    if (isGroup) {
      setIsGroupDetailsModalOpen(true);
    } else {
      setIsTargetAccountInfoModalOpen(true);
    }
  };

  const handleOpenRenameModalFromHeader = (e) => {
    // ... (Giữ nguyên hàm này)
    e.stopPropagation();
    if (isGroup && enrichedChatData?.currentUserIsAdmin) {
      setIsHeaderRenameModalOpen(true);
    }
  };

  const handleSendFriendRequest = async (targetMemberId) => {
    // ... (Giữ nguyên hàm này)
    if (!currentUserId || !targetMemberId) {
        alert("Lỗi: Thiếu thông tin người dùng.");
        return;
    }
    console.log(`Gửi lời mời kết bạn từ ${currentUserId} đến ${targetMemberId}`);
    try {
        const response = await fetch('http://localhost:3001/user/sendFriendRequestWeb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUserId, friend_id: targetMemberId })
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message || "Đã gửi lời mời kết bạn!");
        } else {
            alert(data.message || "Gửi lời mời thất bại.");
        }
    } catch (error) {
        console.error("Lỗi khi gửi lời mời kết bạn:", error);
        alert("Lỗi kết nối khi gửi lời mời.");
    }
  };

  const handleAction = (action, data = null) => {
    if (!enrichedChatData) {
      console.error("handleAction được gọi khi enrichedChatData chưa sẵn sàng.");
      return;
    }

    switch (action) {
      case "view_all_members":
        if (isGroup) {
          setCurrentView("memberList");
        }
        break;
      case "request_add_member_view":
      case "add_member_to_group":
        if (isGroup) {
          setIsAddMembersModalOpen(true);
        } 
        break;
      case "connect_friend":
        if (data) { // data ở đây là targetMemberId
          handleSendFriendRequest(data);
        } else {
          console.warn("Hành động connect_friend được gọi mà không có targetMemberId.");
        }
        break;
      case "leave_group":
        if (isGroup) {
          if (enrichedChatData.currentUserIsAdmin) {
            const otherMembersExist = enrichedChatData.members && 
                                      enrichedChatData.members.filter(m => String(m.id || m._id || m) !== String(currentUserId)).length > 0;
            if (otherMembersExist) {
              alert("Bạn là trưởng nhóm. Vui lòng chuyển quyền trưởng nhóm cho một thành viên khác trước khi rời nhóm.");
            } else {
              requestLeaveGroupConfirmation(); // Trưởng nhóm là người cuối cùng, backend sẽ xử lý thành giải tán
            }
          } else {
            requestLeaveGroupConfirmation(); // Thành viên thường hoặc phó nhóm
          }
        }
        break;
      
      // Các actions khác có thể được thêm vào đây hoặc xử lý trực tiếp trong JSX
      case "toggle_notifications":
        console.log("Action: Tắt/Mở thông báo cho:", enrichedChatData.name, data);
        // TODO: Implement logic
        break;
      case "pin_conversation":
        console.log("Action: Ghim cuộc trò chuyện:", enrichedChatData.name, data);
        // TODO: Implement logic
        break;
      case "hide_conversation":
        console.log("Action: Ẩn cuộc trò chuyện:", enrichedChatData.name, data);
        // TODO: Implement logic
        break;
      case "manage_members_main": // Giả sử action này cũng là mở danh sách thành viên
         if (isGroup && (enrichedChatData.currentUserIsAdmin || enrichedChatData.currentUserIsDeputy)) {
            setCurrentView("memberList");
         } else if (isGroup) {
            alert("Bạn không có quyền quản lý thành viên nhóm này.");
         }
        break;
      case "group_settings":
        if (isGroup) {
          setIsGroupDetailsModalOpen(true); // Mở GroupDetailsModal
        }
        break;
      case "delete_history":
        console.log("Action: Xóa lịch sử trò chuyện:", enrichedChatData.name, data);
        
        alert("Chức năng Xóa lịch sử trò chuyện sẽ được triển khai sau.");
        break;
      case "block_user":
        if (!isGroup) {
          console.log("Action: Chặn người dùng:", enrichedChatData.name, data);
          
          alert(`Chức năng Chặn ${enrichedChatData.name} sẽ được triển khai sau.`);
        }
        break;
      case "create_group_with_user":
         if (!isGroup && enrichedChatData?._id) {
            console.log(`Action: Tạo nhóm với ${enrichedChatData.name} (ID: ${enrichedChatData._id})`);
            // TODO: Mở modal tạo nhóm và truyền ID của người này vào
            alert(`Chức năng Tạo nhóm với ${enrichedChatData.name} sẽ được triển khai sau.`);
         }
        break;
      case "view_common_groups":
         if (!isGroup && enrichedChatData?._id) {
            console.log(`Action: Xem nhóm chung với ${enrichedChatData.name} (ID: ${enrichedChatData._id})`);
            // TODO: Gọi API lấy nhóm chung và hiển thị
            alert(`Chức năng Xem nhóm chung với ${enrichedChatData.name} sẽ được triển khai sau.`);
         }
        break;
      
      default:
        console.log(
          `Hành động chưa được xử lý: ${action}`,
          data
            ? `với dữ liệu: ${JSON.stringify(data)}`
            : `cho cuộc trò chuyện ID: ${enrichedChatData?._id}, Tên: ${enrichedChatData?.name}`
        );
    }
  };

  const handleConfirmAddMembers = async (updatedConversationData) => {
    // ... (Giữ nguyên hàm này)
    setIsAddMembersModalOpen(false); 
    if (updatedConversationData && updatedConversationData.members) {
        console.log("handleConfirmAddMembers: Setting liveChatData with:", JSON.stringify(updatedConversationData, null, 2));
        setLiveChatData(prevData => ({
            ...prevData,
            ...updatedConversationData,
            type: 'group' 
        }));
    } else {
        console.warn("handleConfirmAddMembers không nhận được conversation cập nhật hoặc không có members.");
        if(currentView === "memberList" && enrichedChatData?._id) {
           //  doFetchDetailedMembers(); 
        }
    }
  };
  
  const handleGroupAvatarUpdated = (updatedConversationData) => {
    console.log("Avatar nhóm đã được cập nhật (callback từ GroupDetailsModal):", updatedConversationData);
    setLiveChatData(prevData => ({
        ...prevData, 
        ...updatedConversationData,
        type: 'group' 
    }));
  };

  const handleBackToInfo = () => {
    // ... (Giữ nguyên)
    setCurrentView("info");
    setSearchTerm("");
    setMemberMenuOpen(null);
  };

  const handleManageMembersInGroupDetails = () => {
    // ... (Giữ nguyên)
    setIsGroupDetailsModalOpen(false);
    setCurrentView("memberList");
    setSearchTerm("");
  };

  const requestLeaveGroupConfirmation = () => {
    setIsLeaveGroupConfirmOpen(true);
  };

  const executeLeaveGroup = async () => {
    if (!enrichedChatData?._id || !currentUserId) {
        alert("Lỗi: Thiếu thông tin để rời nhóm.");
        setIsLeaveGroupConfirmOpen(false);
        return;
    }

    setIsLeavingGroup(true);
    try {
        const response = await fetch('http://localhost:3001/conversation/leaveGroupWeb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversation_id: enrichedChatData._id,
                user_id: currentUserId 
            })
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Rời nhóm thành công!");
            if (onConversationDeleted) { 
                onConversationDeleted(enrichedChatData._id);
            }
            onClose(); 
        } else {
            alert(data.message || "Rời nhóm thất bại.");
        }
    } catch (error) {
        console.error("Lỗi khi rời nhóm:", error);
        alert("Lỗi kết nối, không thể rời nhóm.");
    } finally {
        setIsLeavingGroup(false);
        setIsLeaveGroupConfirmOpen(false);
    }
  };

  const handleRenameGroupConfirmed = (newName, convId) => { // Nhận thêm convId
    console.log(`Yêu cầu đổi tên nhóm ${convId} thành: ${newName} (từ GroupDetailsModal -> ConversationInfoModal)`);
    // Hàm này được gọi bởi GroupDetailsModal, nó đã tự gọi API
    // Chúng ta chỉ cần cập nhật liveChatData ở đây
    setLiveChatData(prev => {
        if (prev && (prev._id || prev.id) === convId) {
            return {...prev, name: newName, conversationName: newName, type: 'group'};
        }
        return prev;
    });
  };

  const handleConfirmRenameFromHeader = (newName, convId) => { // Nhận thêm convId
    console.log(`Yêu cầu đổi tên nhóm ${convId} thành: ${newName} (từ Header -> ConversationInfoModal)`);
     // Hàm này được gọi bởi RenameGroupModal (cho header), nó đã tự gọi API
    setLiveChatData(prev => {
        if (prev && (prev._id || prev.id) === convId) {
            return {...prev, name: newName, conversationName: newName, type: 'group'};
        }
        return prev;
    });
    setIsHeaderRenameModalOpen(false);
  };

  const requestDisbandGroupConfirmation = () => {
    setIsDisbandGroupConfirmOpen(true);
  };

  // --- BẮT ĐẦU: TÍCH HỢP API GIẢI TÁN NHÓM ---
  const executeDisbandGroup = async () => {
    if (!enrichedChatData?._id || !currentUserId) {
        alert("Lỗi: Thiếu thông tin để giải tán nhóm.");
        setIsDisbandGroupConfirmOpen(false);
        return;
    }
    // Kiểm tra lại quyền admin, mặc dù nút đã được ẩn nếu không phải admin
    if (!enrichedChatData.currentUserIsAdmin) {
        alert("Bạn không có quyền giải tán nhóm này.");
        setIsDisbandGroupConfirmOpen(false);
        return;
    }

    setIsDisbanding(true); // Bắt đầu loading

    try {
        const response = await fetch('http://localhost:3001/conversation/disbandGroupWeb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversation_id: enrichedChatData._id,
                user_id: currentUserId 
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Giải tán nhóm thành công!");
            if (onConversationDeleted) {
                onConversationDeleted(enrichedChatData._id); // Thông báo cho cha để xóa khỏi danh sách
            }
            onClose(); // Đóng ConversationInfoModal
        } else {
            alert(data.message || "Giải tán nhóm thất bại.");
        }
    } catch (error) {
        console.error("Lỗi khi giải tán nhóm:", error);
        alert("Lỗi kết nối, không thể giải tán nhóm.");
    } finally {
        setIsDisbanding(false); // Kết thúc loading
        setIsDisbandGroupConfirmOpen(false); // Đóng dialog xác nhận
        // isGroupDetailsModalOpen và onClose() đã được xử lý ở trên hoặc sẽ tự đóng
    }
  };
  // --- KẾT THÚC: TÍCH HỢP API GIẢI TÁN NHÓM ---

  // ... (Giữ nguyên các hàm render: uniqueSendersPreview, renderStorageTabContent, renderMemberListContent, renderInfoContent)
  const uniqueSendersPreview = isGroup
    ? Array.from(
        new Set(
          enrichedChatData?.messages
            ?.filter((msg) => msg.sender && msg.sender !== "me") 
            .map((msg) => msg.sender?.userName || msg.sender?.name || "Unknown") 
        )
      ).slice(0, 4)
    : [];

    const renderStorageTabContent = () => {
     switch (activeStorageTab) {
      case "media":
        return (
          <div className="storage-tab-content media-grid">
            {sharedMediaCount > 0 ? (
              mediaMessages.slice(0, 12).map((msg, index) => (
                <div
                  key={msg.id || msg._id || index} 
                  className="media-item-preview"
                  onClick={() => handleAction("view_media_item", msg)}
                >
                  <img
                    src={msg.imageUrl || msg.content} 
                    alt={msg.text || `Media ${index + 1}`}
                  />
                  {msg.type === "video" && (
                    <FaFilm className="video-icon-overlay" />
                  )}
                </div>
              ))
            ) : (
              <p className="empty-tab-message">
                Chưa có ảnh/video nào được chia sẻ.
              </p>
            )}
            {sharedMediaCount > 12 && (
              <button
                className="view-all-storage-btn"
                onClick={() => handleAction("view_all_media")}
              >
                Xem tất cả ({sharedMediaCount})
              </button>
            )}
          </div>
        );
      case "files":
        return (
          <div className="storage-tab-content file-list">
            {sharedFilesCount > 0 ? (
              fileMessages.slice(0, 10).map((msg, index) => (
                <div
                  key={msg.id || msg._id || index}
                  className="file-item-preview"
                  onClick={() => handleAction("view_file_item", msg)}
                >
                  <FaFileAlt className="file-item-icon" />
                  <div className="file-item-details">
                    <span className="file-item-name">
                      {msg.fileName || msg.content?.split('/').pop() ||`Tập tin ${index + 1}`}
                    </span>
                    <span className="file-item-meta">
                      {msg.fileSize || ""} - {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-tab-message">
                Chưa có file nào được chia sẻ.
              </p>
            )}
            {sharedFilesCount > 10 && (
              <button
                className="view-all-storage-btn"
                onClick={() => handleAction("view_all_files")}
              >
                Xem tất cả ({sharedFilesCount})
              </button>
            )}
          </div>
        );
      case "links":
        return (
          <div className="storage-tab-content link-list">
            {sharedLinksCount > 0 ? (
              linkMessages.slice(0, 10).map((msg, index) => {
                const urlMatch = msg.text?.match(/https?:\/\/[^\s]+/);
                const url = urlMatch ? urlMatch[0] : (msg.content || "#");
                return (
                  <div
                    key={msg.id || msg._id || index}
                    className="link-item-preview"
                    onClick={() => handleAction("view_link_item", msg)}
                  >
                    <FaLink className="link-item-icon" />
                    <div className="link-item-details">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-item-url"
                      >
                        {url}
                      </a>
                      <span className="link-item-sender">
                        Gửi bởi: {msg.senderId?.userName || "Không rõ"} - {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="empty-tab-message">
                Chưa có link nào được chia sẻ.
              </p>
            )}
            {sharedLinksCount > 10 && (
              <button
                className="view-all-storage-btn"
                onClick={() => handleAction("view_all_links")}
              >
                Xem tất cả ({sharedLinksCount})
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderMemberListContent = () => {
    if (!isGroup) return null;

    const currentFilteredMembers = detailedMembers.filter((member) =>
      (member?.userName || member?.name || "")
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    return (
      <>
        <div className="conv-info-header member-list-header-override">
          <button className="modal-back-btn-conv-info" onClick={handleBackToInfo} title="Quay lại">
            <FaArrowLeft />
          </button>
          <h2>Thành viên ({isLoadingMembers ? <FaSpinner className="spinner-icon-inline"/> : currentFilteredMembers.length})</h2>
        </div>
        <div className="member-list-controls">
          { (
            <button className="add-member-btn" onClick={() => handleAction("request_add_member_view")}>
              <FaUserPlusForAddMember /> Thêm thành viên
            </button>
          )}
          <div className="member-search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Tìm kiếm thành viên" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="member-list-scrollable">
          {isLoadingMembers && (<div className="loading-message" style={{ textAlign: "center", padding: "20px" }}><FaSpinner className="spinner-icon" /> Đang tải...</div>)}
          {membersError && (<div className="error-message" style={{ textAlign: "center", padding: "20px", color: "red" }}>{membersError}</div>)}
          {!isLoadingMembers && !membersError && currentFilteredMembers.length > 0
            ? currentFilteredMembers.map((member) => {
                if (!member || typeof member._id === 'undefined') { return null; }
                const memberName = member.userName || member.name || "Không rõ";
                const memberAvatar = member.avatar;
                const memberId = String(member._id); 
                const currentDeputyIds = enrichedChatData?.deputyAdminIds?.map(id => String(id)) || [];
                const isSelf = memberId === String(currentUserId);
                const currentUserIsAdmin = enrichedChatData?.currentUserIsAdmin === true;
                const currentUserIsDeputy = enrichedChatData?.currentUserIsDeputy === true;
                const memberIsAdmin = memberId === String(enrichedChatData?.adminId);
                const memberIsDeputy = currentDeputyIds.includes(memberId);
                const isAlreadyFriend = currentUserFriends.has(memberId);
                let showThreeDotMenu = false;
                if (!isSelf) {
                  if (currentUserIsAdmin) { showThreeDotMenu = true; } 
                  else if (currentUserIsDeputy && !memberIsAdmin && !memberIsDeputy ) { showThreeDotMenu = true; }
                }
                return (
                  <div key={memberId} className="member-item">
                    <div className={`avatar member-avatar-item ${memberAvatar ? "" : "initial-avatar"}`}>{memberAvatar ? <img src={memberAvatar} alt={memberName} /> : memberName ? memberName.charAt(0).toUpperCase() : "?"}</div>
                    <div className="member-details"><span className="member-name">{memberName}</span>{member.role && member.role !== "Thành viên" && (<span className="member-role">{member.role}</span>)}</div>
                    {isSelf ? null : showThreeDotMenu ? (
                      <div className="member-actions-menu-container" ref={memberMenuOpen === memberId ? memberMenuRef : null}>
                        <button className="member-menu-dots-btn" onClick={(e) => handleToggleMemberMenu(memberId, e)}><FaEllipsisV /></button>
                        {memberMenuOpen === memberId && (
                          <div className="member-actions-dropdown">
                            {currentUserIsAdmin && !memberIsAdmin && (<>
                                <button onClick={() => handleMemberMenuAction("assignDeputy",memberId,memberName)} disabled={memberIsDeputy}>Phân phó nhóm</button>
                                <button onClick={() => handleMemberMenuAction("revokeDeputy",memberId,memberName)} disabled={!memberIsDeputy}>Gỡ quyền phó nhóm</button>
                                <button onClick={() => handleMemberMenuAction("transferLeadership",memberId,memberName)}>Chuyển quyền trưởng nhóm</button></>)}
                            {(currentUserIsAdmin && !memberIsAdmin) || (currentUserIsDeputy && !memberIsAdmin && !memberIsDeputy) ? (
                               <button className="action-remove" onClick={() => handleMemberMenuAction("removeMember",memberId,memberName)}>Xóa thành viên</button>) : null}
                          </div>)}
                      </div>
                    ) : !isLoadingCurrentUserFriends && !isAlreadyFriend ? ( 
                       <button className="member-action-btn" onClick={() => handleAction("connect_friend", memberId)}>Kết bạn</button>
                    ) : isAlreadyFriend ? (<span className="friend-status-indicator">Bạn bè</span>) : null }
                  </div>);
              })
            : !isLoadingMembers && !membersError && ( <p className="empty-member-list-message">{searchTerm ? "Không tìm thấy thành viên nào." : "Chưa có thành viên nào trong nhóm."}</p>)}
        </div>
      </>
    );
  };
  
  const renderInfoContent = () => {
     return (
      <>
        <div className="conv-info-header">
          <button className="modal-close-btn-conv-info" onClick={onClose} title="Đóng"><FaTimes /></button>
          <div className={`avatar modal-avatar ${isGroup ? "group-avatar" : "user-avatar"} ${enrichedChatData?.online && !isGroup ? "online" : ""}`} onClick={handleHeaderEntityClick} style={{ cursor: "pointer" }}>
            <SafeAvatar data={enrichedChatData} />
            {enrichedChatData?.online && !isGroup && (<span className="online-indicator"></span>)}
          </div>
          <div className="conv-info-name-wrapper">
            <h2 onClick={handleHeaderEntityClick} style={{ cursor: "pointer", display: "inline-block" }} title={isGroup ? "Xem thông tin nhóm" : "Xem thông tin tài khoản"}>{enrichedChatData?.name}</h2>
            {isGroup && (enrichedChatData?.currentUserIsAdmin || enrichedChatData?.currentUserIsDeputy) && ( <FaPen className="conv-info-rename-group-icon" title="Đổi tên nhóm" onClick={handleOpenRenameModalFromHeader}/>)}
          </div>
          {isGroup && <p>{memberCountDisplay} thành viên</p>}
          {!isGroup && (<p className={enrichedChatData?.online ? "status-online" : "status-offline"}>{enrichedChatData?.online ? "Đang hoạt động" : "Không hoạt động"}</p>)}
        </div>
        <div className="conv-info-actions-bar">
          <button className="conv-action-item-bar" onClick={() => handleAction("toggle_notifications")}><FaBellSlash /> <span>Thông báo</span></button>
          <button className="conv-action-item-bar" onClick={() => handleAction("pin_conversation")}><FaThumbtack /> <span>Ghim</span></button>
          <button className="conv-action-item-bar" onClick={() => handleAction("hide_conversation")}><FaEyeSlash /> <span>Ẩn</span></button>
          {isGroup && (enrichedChatData?.currentUserIsAdmin || enrichedChatData?.currentUserIsDeputy) && (<button className="conv-action-item-bar" onClick={() => handleAction("view_all_members")}><FaUserCog /> <span>Quản lý</span></button>)}
        </div>
        <div className="conv-info-body">
          <div className="conv-info-section storage-section">
            <div className="storage-tabs-nav">
              <button className={`storage-tab-btn ${activeStorageTab === "media" ? "active" : ""}`} onClick={() => setActiveStorageTab("media")}><FaPhotoVideo /> Ảnh/Video ({sharedMediaCount})</button>
              <button className={`storage-tab-btn ${activeStorageTab === "files" ? "active" : ""}`} onClick={() => setActiveStorageTab("files")}><FaFolderOpen /> File ({sharedFilesCount})</button>
              <button className={`storage-tab-btn ${activeStorageTab === "links" ? "active" : ""}`} onClick={() => setActiveStorageTab("links")}><FaLink /> Link ({sharedLinksCount})</button>
            </div>
            {renderStorageTabContent()}
          </div>
          {isGroup && (
            <div className="conv-info-section">
              <h3>Thành viên ({memberCountDisplay})</h3>
              <div className="member-list-preview">{detailedMembers.length > 0 ? detailedMembers.slice(0,4).map(member => (<div key={member._id} className="avatar member-avatar-small" title={member.userName || member.name}>{member.avatar ? <img src={member.avatar} alt={member.userName || member.name} /> : (member.userName || member.name || '?').charAt(0).toUpperCase()}</div>)) : uniqueSendersPreview.map((senderName, idx) => ( <div key={idx} className="avatar member-avatar-small" title={senderName}>{senderName.charAt(0).toUpperCase()}</div>))}</div>
              <div className="conv-info-item" onClick={() => handleAction("view_all_members")}><FaUsers /> Xem danh sách thành viên</div>
             {(<div className="conv-info-item" onClick={() => handleAction("add_member_to_group")}><FaUserPlus /> Thêm thành viên</div>)}
            </div>)}
          {!isGroup && (
            <div className="conv-info-section">
              <h3>Tuỳ chọn</h3>
              <div className="conv-info-item" onClick={() => handleAction("create_group_with_user")}><FaUserPlus /> Tạo nhóm với {enrichedChatData?.name}</div>
              <div className="conv-info-item" onClick={() => handleAction("view_common_groups")}><FaUsers /> Xem nhóm chung</div>
            </div>)}
          <div className="conv-info-section conv-info-danger-zone">
            <h3>Thiết lập bảo mật & khác</h3>
            {isGroup && (<div className="conv-info-item" onClick={() => handleAction("group_settings")}><FaUserEdit /> Tuỳ chỉnh nhóm</div>)}
            <div className="conv-info-item danger" onClick={() => handleAction("delete_history")}><FaTrashAlt /> Xóa lịch sử trò chuyện</div>
            {!isGroup && (<div className="conv-info-item danger" onClick={() => handleAction("block_user")}><FaBan /> Chặn {enrichedChatData?.name}</div>)}
            
            {isGroup && (<div className="conv-info-item danger" onClick={() => handleAction("leave_group")}><FaSignOutAlt /> Rời nhóm</div>)}
            {isGroup && enrichedChatData?.currentUserIsAdmin && (
                <div className="conv-info-item danger" onClick={requestDisbandGroupConfirmation}>
                    <FaTrashAlt /> Giải tán nhóm
                </div>
            )}
          </div>
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
      {/* ... (Giữ nguyên các modals con khác) ... */}
      <AddMembersModal isOpen={isAddMembersModalOpen} onClose={() => setIsAddMembersModalOpen(false)} onConfirm={handleConfirmAddMembers} currentGroupMemberIds={currentMemberIdsInGroup} conversationId={enrichedChatData?._id} currentUserId={currentUserId}/>
      <TargetAccountInfoModal isOpen={isTargetAccountInfoModalOpen} onClose={() => setIsTargetAccountInfoModalOpen(false)} userData={enrichedChatData} />
      {isGroup && <GroupDetailsModal isOpen={isGroupDetailsModalOpen} onClose={() => setIsGroupDetailsModalOpen(false)} groupData={enrichedChatData} onManageMembers={handleManageMembersInGroupDetails} onLeaveGroup={requestLeaveGroupConfirmation} onRenameGroup={handleRenameGroupConfirmed} onDisbandGroup={requestDisbandGroupConfirmation} currentUserIsAdmin={enrichedChatData?.currentUserIsAdmin} currentUserId={currentUserId} onUpdateGroupAvatar={handleGroupAvatarUpdated}/>}
      {isGroup && <RenameGroupModal isOpen={isHeaderRenameModalOpen} onClose={() => setIsHeaderRenameModalOpen(false)} onConfirmRename={handleConfirmRenameFromHeader} currentGroupName={enrichedChatData?.name} groupMembers={enrichedChatData?.members || []} conversationId={enrichedChatData?._id} currentUserId={currentUserId} />}
      <ConfirmationDialog isOpen={isLeaveGroupConfirmOpen} onClose={() => setIsLeaveGroupConfirmOpen(false)} onConfirm={executeLeaveGroup} title="Rời khỏi nhóm?" message={`Bạn có chắc chắn muốn rời khỏi nhóm "${enrichedChatData?.name || "này"}" không? Bạn sẽ không thể xem lại tin nhắn trong nhóm này nữa.`} confirmText="Rời nhóm" cancelText="Hủy"/>
      <ConfirmationDialog
        isOpen={isDisbandGroupConfirmOpen}
        onClose={() => setIsDisbandGroupConfirmOpen(false)}
        onConfirm={executeDisbandGroup}
        title="Giải tán nhóm?"
        message={`Bạn có chắc chắn muốn giải tán nhóm "${enrichedChatData?.name || "này"}" không? Hành động này không thể hoàn tác và toàn bộ lịch sử trò chuyện sẽ bị xóa.`}
        confirmText={isDisbanding ? <FaSpinner className="spinner-icon-inline" /> : "Giải tán"}
        cancelText="Hủy"
        isConfirmDisabled={isDisbanding} // Vô hiệu hóa nút khi đang xử lý
      />
    </>
  );
}

export default ConversationInfoModal;