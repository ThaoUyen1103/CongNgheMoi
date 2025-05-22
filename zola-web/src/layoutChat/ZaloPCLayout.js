import React, { useState } from 'react';
import '../styles/ZaloPCLayout.css';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import ContactsMainView from './ContactsMainView';
import AccountInfoModal from '../modals/AccountInfoModal';
import SettingsModal from '../modals/SettingsModal';
import UpdateInfoModal from '../modals/UpdateInfoModal';
import AddFriendModal from '../modals/AddFriendModal';
import CreateGroupModal from '../modals/CreateGroupModal'; // Thêm import này

function ZaloPCLayout() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isAccountInfoModalOpen, setIsAccountInfoModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false); // State cho CreateGroupModal

  const [activeView, setActiveView] = useState('chats');
  const [activeContactsNavItem, setActiveContactsNavItem] = useState('friends');

  const [currentUserData, setCurrentUserData] = useState({
    name: "Mến",
    gender: "Nam",
    dob: { day: "01", month: "01", year: "2002" },
    phone: "+84 869 751 637",
    bio: "(k)",
    coverPhoto: "https://i.pinimg.com/originals/b6/1a/a8/b61aa8c8b3a93a9efe969293c871ed51.jpg",
    avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
  });

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setActiveView('chats');
  };

  const closeAllModals = () => {
    setIsAccountInfoModalOpen(false);
    setIsSettingsModalOpen(false);
    setIsUpdateInfoModalOpen(false);
    setIsAddFriendModalOpen(false);
    setIsCreateGroupModalOpen(false);
  }

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
    setCurrentUserData(prevData => ({
      ...prevData,
      name: updatedData.name,
      gender: updatedData.gender,
      dob: updatedData.dob,
    }));
    justCloseUpdateInfoModal();
  };

  return (
    <div className="zalo-pc-layout">
      <Sidebar
        onSelectChat={handleSelectChat}
        currentSelectedChatId={selectedChat ? selectedChat.id : null}
        onOpenAccountInfoModal={openAccountInfoModal}
        onOpenSettingsModal={openSettingsModal}
        onOpenAddFriendModal={openAddFriendModal}
        onOpenCreateGroupModal={openCreateGroupModal} // Truyền hàm này
        activeView={activeView}
        setActiveView={setActiveView}
        activeContactsNavItem={activeContactsNavItem}
        setActiveContactsNavItem={setActiveContactsNavItem}
      />

      {activeView === 'chats' && <MainContent selectedChat={selectedChat} />}
      {activeView === 'contacts' && <ContactsMainView subViewType={activeContactsNavItem} />}

      <AccountInfoModal isOpen={isAccountInfoModalOpen} onClose={closeAccountInfoModal} userData={currentUserData} onOpenUpdateModal={openUpdateInfoModal} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} />
      <UpdateInfoModal isOpen={isUpdateInfoModalOpen} onClose={handleCloseUpdateModalAndReturnToAccountInfo} userData={currentUserData} onUpdate={handleProfileUpdate} />
      <AddFriendModal isOpen={isAddFriendModalOpen} onClose={closeAddFriendModal} />
      <CreateGroupModal isOpen={isCreateGroupModalOpen} onClose={closeCreateGroupModal} /> {/* Render modal mới */}
    </div>
  );
}

export default ZaloPCLayout;