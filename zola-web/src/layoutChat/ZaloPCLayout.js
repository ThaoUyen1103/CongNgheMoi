import React, { useState, useEffect } from 'react'; // Thêm useEffect
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

  // Giữ lại currentUserData nếu bạn vẫn dùng nó cho các modal khác
  const [currentUserData, setCurrentUserData] = useState({
    name: "Mến",
    gender: "Nam",
    dob: { day: "01", month: "01", year: "2002" },
    phone: "+84 869 751 637",
    bio: "(k)",
    coverPhoto: "https://i.pinimg.com/originals/b6/1a/a8/b61aa8c8b3a93a9efe969293c871ed51.jpg",
    avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
  });

  // State mới để lưu thông tin người dùng đang đăng nhập
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setLoggedInUser(parsedUser);
        // Bạn có thể cập nhật currentUserData từ đây nếu muốn đồng bộ
        // setCurrentUserData(prevData => ({
        //   ...prevData, // Giữ lại các giá trị mock nếu cần
        //   _id: parsedUser._id,
        //   name: parsedUser.userName,
        //   avatar: parsedUser.avatar,
        //   coverPhoto: parsedUser.coverPhoto || parsedUser.coverImage, 
        //   // Các trường khác nếu có trong localStorage
        // }));
      } catch (error) {
        console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", error);
      }
    }
  }, []);


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
        onOpenCreateGroupModal={openCreateGroupModal}
        activeView={activeView}
        setActiveView={setActiveView}
        activeContactsNavItem={activeContactsNavItem}
        setActiveContactsNavItem={setActiveContactsNavItem}
        onLogoutFromLayout={onLogout}
        currentLoggedInUserId={loggedInUser?._id}
      />

      {activeView === 'chats' && <MainContent selectedChat={selectedChat} />}
      {activeView === 'contacts' && <ContactsMainView subViewType={activeContactsNavItem} currentLoggedInUserId={loggedInUser?._id}  />}

      <AccountInfoModal 
        isOpen={isAccountInfoModalOpen} 
        onClose={closeAccountInfoModal} 
        onOpenUpdateModal={openUpdateInfoModal} 
      />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} />
      <UpdateInfoModal 
        isOpen={isUpdateInfoModalOpen} 
        onClose={justCloseUpdateInfoModal} // Sửa lại đây để không bị lỗi
        onReturnToAccountInfo={handleCloseUpdateModalAndReturnToAccountInfo}
        userData={loggedInUser} // Nên truyền user thật
        onUpdate={handleProfileUpdate} 
      />
      <AddFriendModal 
        isOpen={isAddFriendModalOpen} 
        onClose={closeAddFriendModal} 
        currentLoggedInUserId={loggedInUser?._id} // TRUYỀN ID VÀO ĐÂY
      />
      <CreateGroupModal isOpen={isCreateGroupModalOpen} onClose={closeCreateGroupModal} currentLoggedInUserId={loggedInUser?._id}/>
    </div>
  );
}

export default ZaloPCLayout;