import React, { useState, useEffect } from 'react';
import '../styles/ZaloPCLayout.css';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import ContactsMainView from './ContactsMainView';
import AccountInfoModal from '../modals/AccountInfoModal';
import SettingsModal from '../modals/SettingsModal';
import UpdateInfoModal from '../modals/UpdateInfoModal';
import AddFriendModal from '../modals/AddFriendModal';
import CreateGroupModal from '../modals/CreateGroupModal';

function ZaloPCLayout({ onLogout }) {

  const [selectedChat, setSelectedChat] = useState(null);
  const [isAccountInfoModalOpen, setIsAccountInfoModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('chats');
  const [activeContactsNavItem, setActiveContactsNavItem] = useState('friends');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [allConversations, setAllConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setLoggedInUser(parsedUser);
      } catch (error) {
        console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", error);
      }
    }
  }, []);

  
useEffect(() => {
    const fetchAllUserConversations = async () => {
        if (!loggedInUser?._id) {
            setAllConversations([]);
            return;
        }

        setIsLoadingConversations(true);
        setConversationsError('');

        let fetchedGroups = [];
        let fetchedFriendsAsConversations = [];

        try {
            // Lấy danh sách nhóm (đã có type: 'group')
            const groupPromise = fetch('http://localhost:3001/conversation/getConversationGroupByUserIDWeb', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: loggedInUser._id }),
            });

            // Lấy danh sách bạn bè
            const friendsPromise = fetch(`http://localhost:3001/user/getFriends/${loggedInUser._id}`);

            const [groupResponse, friendsResponse] = await Promise.all([groupPromise, friendsPromise]);

            if (groupResponse.ok) {
                const groupData = await groupResponse.json();
                if (groupData.conversationGroup) {
                    fetchedGroups = groupData.conversationGroup.map(group => ({
                        ...group, // Bao gồm _id (là conversationId), members, conversationName, avatar...
                        type: 'group',
                        updatedAt: group.updatedAt || group.createdAt || new Date(0).toISOString(),
                    }));
                }
            } else {
                console.error('Lỗi tải danh sách nhóm:', await groupResponse.text());
            }

            if (friendsResponse.ok) {
                const friendsData = await friendsResponse.json(); // Mảng các object bạn bè
                if (friendsData && Array.isArray(friendsData)) {
                    // Với mỗi người bạn, lấy hoặc tạo cuộc trò chuyện 1-1
                    const conversationPromises = friendsData.map(async (friend) => {
                        try {
                            const convResponse = await fetch('http://localhost:3001/conversation/createConversationsWeb', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    user_id: loggedInUser._id,
                                    friend_id: friend._id, // ID của người bạn
                                }),
                            });
                            if (convResponse.ok) {
                                const convData = await convResponse.json();
                                if (convData.conversation) {
                                    // Chuẩn bị object cho 1-1 chat
                                    return {
                                        _id: convData.conversation._id, // ID của cuộc trò chuyện 1-1
                                        name: friend.userName,          // Tên của người bạn
                                        avatar: friend.avatar,          // Avatar của người bạn
                                        type: 'user',                   // Đánh dấu đây là chat 1-1
                                        members: [loggedInUser, friend], // Lưu thông tin 2 thành viên
                                        updatedAt: convData.conversation.updatedAt || convData.conversation.createdAt || friend.lastActivity || new Date(0).toISOString(),
                                        lastMessage: convData.conversation.lastMessage || null, // Cần backend hỗ trợ trường này
                                        lastMessageTimestamp: convData.conversation.lastMessageTimestamp || null, // Cần backend hỗ trợ
                                    };
                                }
                            } else {
                                console.error(`Lỗi tạo/lấy conversation cho ${friend.userName}:`, await convResponse.text());
                                return null;
                            }
                        } catch (e) {
                            console.error(`Lỗi mạng khi xử lý friend ${friend.userName}:`, e);
                            return null;
                        }
                    });
                    // Đợi tất cả các promise xử lý xong và lọc bỏ những kết quả null
                    fetchedFriendsAsConversations = (await Promise.all(conversationPromises)).filter(Boolean);
                }
            } else {
                console.error('Lỗi tải danh sách bạn bè:', await friendsResponse.text());
            }

            const combinedList = [...fetchedGroups, ...fetchedFriendsAsConversations];
            // Đảm bảo tất cả item đều có updatedAt để sắp xếp
            combinedList.forEach(item => {
                if (!item.updatedAt) {
                    item.updatedAt = item.createdAt || new Date(0).toISOString();
                }
            });
            combinedList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

            setAllConversations(combinedList);

            // Thông báo lỗi chung nếu cả hai API đều thất bại
            if (!groupResponse.ok && !friendsResponse.ok) {
                setConversationsError('Không thể tải danh sách cuộc trò chuyện và bạn bè.');
            }

        } catch (error) {
            console.error('Lỗi kết nối khi tải danh sách trò chuyện:', error);
            setConversationsError('Lỗi kết nối, không thể tải danh sách.');
        } finally {
            setIsLoadingConversations(false);
        }
    };

    // Chỉ gọi fetchAllUserConversations khi loggedInUser._id có giá trị
    if (loggedInUser?._id) {
        fetchAllUserConversations();
    }
    // Thêm loggedInUser vào dependency array để fetch lại khi user thay đổi
}, [loggedInUser]);


  const handleSelectChat = (chat) => {
    console.log("ZaloPCLayout - handleSelectChat - Dữ liệu chat được chọn:", JSON.stringify(chat, null, 2));
    setSelectedChat(chat);
    setActiveView('chats');
  };

  const closeAllModals = () => {
    setIsAccountInfoModalOpen(false);
    setIsSettingsModalOpen(false);
    setIsUpdateInfoModalOpen(false);
    setIsAddFriendModalOpen(false);
    setIsCreateGroupModalOpen(false);
  };

  const openAccountInfoModal = () => { closeAllModals(); setIsAccountInfoModalOpen(true); };
  const closeAccountInfoModal = () => setIsAccountInfoModalOpen(false);

  const openSettingsModal = () => { closeAllModals(); setIsSettingsModalOpen(true); };
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  const openUpdateInfoModal = () => { closeAllModals(); setIsUpdateInfoModalOpen(true); };
  const handleCloseUpdateModalAndReturnToAccountInfo = () => { closeAllModals(); setIsAccountInfoModalOpen(true); };
  const justCloseUpdateInfoModal = () => setIsUpdateInfoModalOpen(false);

  const openAddFriendModal = () => { closeAllModals(); setIsAddFriendModalOpen(true); };
  const closeAddFriendModal = () => setIsAddFriendModalOpen(false);

  const openCreateGroupModal = () => { closeAllModals(); setIsCreateGroupModalOpen(true); };
  const closeCreateGroupModal = () => setIsCreateGroupModalOpen(false);

  const handleProfileUpdate = (updatedData) => {
    setLoggedInUser(prevData => ({
      ...prevData,
      userName: updatedData.name,
      gender: updatedData.gender,
      dateOfBirth: updatedData.dob,
    }));
    justCloseUpdateInfoModal();
  };

  const handleGroupCreated = (newGroupDataFromAPI) => {
    console.log("ZaloPCLayout - handleGroupCreated - Nhóm mới:", JSON.stringify(newGroupDataFromAPI, null, 2));
    setAllConversations(prevConversations => {
      const groupToAdd = { ...newGroupDataFromAPI, type: 'group' };
      const existingIndex = prevConversations.findIndex(conv => conv._id === groupToAdd._id);
      let updatedConversations;
      if (existingIndex !== -1) {
        updatedConversations = [...prevConversations];
        updatedConversations[existingIndex] = groupToAdd;
      } else {
        updatedConversations = [groupToAdd, ...prevConversations];
      }
      return updatedConversations.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    });
    setSelectedChat(newGroupDataFromAPI);
    setActiveView('chats');
    closeCreateGroupModal();
  };

  const handleConversationDeleted = (deletedConversationId) => {
    console.log("ZaloPCLayout: Yêu cầu xóa conversation ID:", deletedConversationId);
    setAllConversations(prevConversations =>
      prevConversations.filter(conv => (conv._id || conv.id) !== deletedConversationId)
    );
    // Nếu cuộc trò chuyện đang được chọn bị xóa, hãy bỏ chọn nó
    if (selectedChat && (selectedChat._id || selectedChat.id) === deletedConversationId) {
      setSelectedChat(null);
    }
    // Có thể bạn muốn chuyển về view mặc định hoặc chọn một conversation khác
  };
const handleInitiateChatWithFriend = async (friend) => {
    if (!loggedInUser || !friend) {
        console.error("Thiếu thông tin người dùng hoặc bạn bè.");
        return;
    }

    console.log(`ZaloPCLayout: Bắt đầu chat với:`, friend);
    try {
        // Gọi API để lấy hoặc tạo cuộc trò chuyện
        const response = await fetch('http://localhost:3001/conversation/createConversationsWeb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: loggedInUser._id,
                friend_id: friend._id,
            }),
        });
        const data = await response.json();

        if (response.ok && data.conversation) {
            // Chuẩn bị object selectedChat cho MainContent
            const preparedSelectedChat = {
                _id: data.conversation._id, // ID của cuộc trò chuyện
                name: friend.userName,      // Tên của người bạn
                avatar: friend.avatar,      // Avatar của người bạn
                type: 'user',               // Đánh dấu là chat 1-1
                members: [loggedInUser, friend], // Bao gồm cả thông tin người dùng hiện tại và bạn bè
                updatedAt: data.conversation.updatedAt || data.conversation.createdAt,
                // Bạn có thể thêm các trường khác từ data.conversation nếu cần
            };

            // Cập nhật danh sách allConversations nếu cuộc trò chuyện này chưa có hoặc cần update timestamp
            setAllConversations(prevConversations => {
                const existingIndex = prevConversations.findIndex(c => c._id === preparedSelectedChat._id);
                let updatedConversations;
                if (existingIndex > -1) { // Nếu đã có, cập nhật nó (chủ yếu là updatedAt để đưa lên đầu)
                    updatedConversations = [...prevConversations];
                    updatedConversations[existingIndex] = { ...updatedConversations[existingIndex], ...preparedSelectedChat, updatedAt: new Date().toISOString() };
                } else { // Nếu chưa có, thêm mới vào đầu danh sách
                    updatedConversations = [preparedSelectedChat, ...prevConversations];
                }
                return updatedConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            });

            handleSelectChat(preparedSelectedChat); // Hàm này đã có sẵn, dùng để chọn chat và chuyển view
        } else {
            console.error('Không thể tạo/mở cuộc trò chuyện:', data.message || 'Lỗi không xác định từ server');
            // Có thể hiển thị thông báo lỗi cho người dùng ở đây
        }
    } catch (error) {
        console.error('Lỗi kết nối khi tạo cuộc trò chuyện:', error);
        // Có thể hiển thị thông báo lỗi cho người dùng ở đây
    }
};
  return (
    <div className="zalo-pc-layout">
      <Sidebar
        conversations={allConversations}
        isLoadingConversations={isLoadingConversations}
        conversationsError={conversationsError}
        onSelectChat={handleSelectChat}
        currentSelectedChatId={selectedChat ? (selectedChat._id || selectedChat.id) : null}
        onOpenAccountInfoModal={openAccountInfoModal}
        onOpenSettingsModal={openSettingsModal}
        onOpenAddFriendModal={openAddFriendModal}
        onOpenCreateGroupModal={openCreateGroupModal}
        activeView={activeView}
        setActiveView={setActiveView}
        activeContactsNavItem={activeContactsNavItem}
        setActiveContactsNavItem={setActiveContactsNavItem}
        onLogoutFromLayout={onLogout}
        currentLoggedInUserId={loggedInUser?._id}

      />

      {activeView === 'chats' &&
        <MainContent
          selectedChat={selectedChat}
          currentLoggedInUserId={loggedInUser?._id}
          onConversationDeleted={handleConversationDeleted}
          allConversations={allConversations}
        />
      }
      {activeView === 'contacts' &&
        <ContactsMainView
          subViewType={activeContactsNavItem}
          currentLoggedInUserId={loggedInUser?._id}
          onInitiateChatWithFriend={handleInitiateChatWithFriend}
        />
      }

      <AccountInfoModal
        isOpen={isAccountInfoModalOpen}
        onClose={closeAccountInfoModal}
        onOpenUpdateModal={openUpdateInfoModal}
        userData={loggedInUser}
      />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} />
      <UpdateInfoModal
        isOpen={isUpdateInfoModalOpen}
        onClose={justCloseUpdateInfoModal}
        onReturnToAccountInfo={handleCloseUpdateModalAndReturnToAccountInfo}
        userData={loggedInUser}
        onUpdate={handleProfileUpdate}
      />
      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={closeAddFriendModal}
        currentLoggedInUserId={loggedInUser?._id}
      />
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={closeCreateGroupModal}
        currentLoggedInUserId={loggedInUser?._id}
        onGroupCreated={handleGroupCreated}
      />


    </div>
  );
}

export default ZaloPCLayout;