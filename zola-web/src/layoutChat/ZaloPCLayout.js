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

function ZaloPCLayout({onLogout}) {
  
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
        const groupPromise = fetch('http://localhost:3001/conversation/getConversationGroupByUserIDWeb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: loggedInUser._id }),
        });

        const friendsPromise = fetch(`http://localhost:3001/user/getFriends/${loggedInUser._id}`);

        const [groupResponse, friendsResponse] = await Promise.all([groupPromise, friendsPromise]);

        if (groupResponse.ok) {
          const groupData = await groupResponse.json();
          if (groupData.conversationGroup) {
            fetchedGroups = groupData.conversationGroup.map(group => ({
              ...group,
              type: 'group',
            }));
          }
        } else {
          console.error('Lỗi tải danh sách nhóm:', await groupResponse.text());
        }

        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          if (friendsData) {
            fetchedFriendsAsConversations = friendsData.map(friend => ({
              _id: friend._id, 
              name: friend.userName,
              avatar: friend.avatar,
              type: 'user',
              members: [loggedInUser._id, friend._id],
              groupLeader: null,
              deputyLeader: [],
              updatedAt: friend.lastActivity || new Date(0).toISOString(),
            }));
          }
        } else {
          console.error('Lỗi tải danh sách bạn bè:', await friendsResponse.text());
        }
        
        const combinedList = [...fetchedGroups, ...fetchedFriendsAsConversations];
        combinedList.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        
        setAllConversations(combinedList);

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

    fetchAllUserConversations();
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
        />
      }
      {activeView === 'contacts' && 
        <ContactsMainView 
            subViewType={activeContactsNavItem} 
            currentLoggedInUserId={loggedInUser?._id} 
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