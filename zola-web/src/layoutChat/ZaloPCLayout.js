import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import '../styles/ZaloPCLayout.css';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import ContactsMainView from './ContactsMainView';
import AccountInfoModal from '../modals/AccountInfoModal';
import SettingsModal from '../modals/SettingsModal';
import UpdateInfoModal from '../modals/UpdateInfoModal';
import AddFriendModal from '../modals/AddFriendModal';
import CreateGroupModal from '../modals/CreateGroupModal';

const SOCKET_SERVER_URL = 'http://localhost:3005';

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
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setLoggedInUser(parsedUser);
            } catch (error) {
                console.error("ZaloPCLayout: Lỗi đọc user từ localStorage:", error);
                if (typeof onLogout === 'function') onLogout();
            }
        } else {
            if (typeof onLogout === 'function') onLogout();
        }
    }, [onLogout]);

    useEffect(() => {
        if (loggedInUser?._id) {
            const jwtToken = localStorage.getItem('user_token');
            const newSocket = io(SOCKET_SERVER_URL, {
                auth: {
                    token: jwtToken
                }
            });
            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('✅ ZaloPCLayout: Socket connected:', newSocket.id);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('❌ ZaloPCLayout: Socket disconnected:', reason);
            });

            newSocket.on('connect_error', (error) => {
                console.error('🔴 ZaloPCLayout: Socket connection error:', error);
            });

            return () => {
                if (newSocket) {
                    console.log('ZaloPCLayout: Disconnecting socket...');
                    newSocket.disconnect();
                }
                socketRef.current = null;
                setSocket(null);
            };
        } else {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
        }
    }, [loggedInUser]);

    const fetchAllUserConversations = useCallback(async () => {
        if (!loggedInUser?._id) {
            setAllConversations([]);
            return;
        }
        setIsLoadingConversations(true);
        setConversationsError('');
        const token = localStorage.getItem('user_token');

        try {
            const groupPromise = fetch('http://localhost:3001/conversation/getConversationGroupByUserIDWeb', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ user_id: loggedInUser._id }),
            });
            const friendsPromise = fetch(`http://localhost:3001/user/getFriends/${loggedInUser._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const [groupResponse, friendsResponse] = await Promise.all([groupPromise, friendsPromise]);
            let fetchedGroups = [];
            let fetchedFriendsAsConversations = [];

            if (groupResponse.ok) {
                const groupData = await groupResponse.json();
                if (groupData.conversationGroup) {
                    fetchedGroups = groupData.conversationGroup.map(group => ({
                        ...group,
                        type: 'group',
                        name: group.conversationName,
                        updatedAt: group.updatedAt || group.createdAt || new Date(0).toISOString(),
                    }));
                }
            } else {
                console.error('ZaloPCLayout: Lỗi tải nhóm:', await groupResponse.text());
            }

            if (friendsResponse.ok) {
                const friendsData = await friendsResponse.json();
                if (friendsData && Array.isArray(friendsData)) {
                    const conversationPromises = friendsData.map(async (friend) => {
                        try {
                            const convResponse = await fetch('http://localhost:3001/conversation/createConversationsWeb', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ user_id: loggedInUser._id, friend_id: friend._id }),
                            });
                            if (convResponse.ok) {
                                const convData = await convResponse.json();
                                if (convData.conversation) {
                                    return {
                                        _id: convData.conversation._id,
                                        name: friend.userName,
                                        avatar: friend.avatar,
                                        type: 'user',
                                        isGroup: false,
                                        members: convData.conversation.members,
                                        updatedAt: convData.conversation.updatedAt || convData.conversation.createdAt || new Date(0).toISOString(),
                                    };
                                }
                            }
                            return null;
                        } catch (e) { return null; }
                    });
                    fetchedFriendsAsConversations = (await Promise.all(conversationPromises)).filter(Boolean);
                }
            } else {
                console.error('ZaloPCLayout: Lỗi tải bạn bè:', await friendsResponse.text());
            }

            const combinedList = [...fetchedGroups, ...fetchedFriendsAsConversations];
            combinedList.forEach(item => {
                if (!item.updatedAt) item.updatedAt = item.createdAt || new Date(0).toISOString();
            });
            combinedList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setAllConversations(combinedList);
        } catch (error) {
            setConversationsError('Lỗi kết nối, không thể tải danh sách.');
            console.error('ZaloPCLayout: Lỗi fetchAllUserConversations:', error);
        } finally {
            setIsLoadingConversations(false);
        }
    }, [loggedInUser]);

    useEffect(() => {
        if (loggedInUser?._id) {
            fetchAllUserConversations();
        }
    }, [loggedInUser, fetchAllUserConversations]);

    useEffect(() => {
        if (socket) {
            const handleReceiveMessage = (newMessageData) => {
                setAllConversations(prevConvs =>
                    prevConvs.map(conv => {
                        if (conv._id === newMessageData.conversation_id) {
                            let displayMessage = newMessageData.content;
                            if (newMessageData.contentType === 'image' || newMessageData.contentType === 'image_gallery') displayMessage = '[Hình ảnh]';
                            else if (newMessageData.contentType === 'video') displayMessage = '[Video]';
                            else if (newMessageData.contentType === 'file') displayMessage = '[Tệp]';
                            else if (newMessageData.contentType === 'notify') displayMessage = newMessageData.content;


                            return {
                                ...conv,
                                lastMessage: displayMessage,
                                lastMessageSenderName: newMessageData.senderId?.userName,
                                lastMessageTimestamp: newMessageData.createdAt,
                                updatedAt: newMessageData.createdAt,
                                unread: (selectedChat?._id !== newMessageData.conversation_id) ? (conv.unread || 0) + 1 : 0,
                            };
                        }
                        return conv;
                    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                );
            };

            const handleGroupMetadataUpdate = (data) => {
                setAllConversations(prevConvs =>
                    prevConvs.map(conv => {
                        if (conv._id === data.conversationId) {
                            return { 
                                ...conv, 
                                ...data.updatedData,
                                name: data.updatedData.conversationName || conv.name,
                                updatedAt: new Date().toISOString() 
                            }; 
                        }
                        return conv;
                    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                );

                if (selectedChat && selectedChat._id === data.conversationId) {
                    setSelectedChat(prevSelected => ({
                        ...prevSelected,
                        ...data.updatedData,
                        name: data.updatedData.conversationName || prevSelected.name
                    }));
                }
            };

            const handleMemberLeft = (data) => {
                 setAllConversations(prevConvs =>
                    prevConvs.map(conv => {
                        if (conv._id === data.conversationId) {
                            const updatedMembers = Array.isArray(data.updatedMembers) 
                                ? data.updatedMembers 
                                : (conv.members || []).filter(m => (m._id || m) !== data.userId);
                            const updatedDeputyLeaders = Array.isArray(data.updatedDeputyLeaders) 
                                ? data.updatedDeputyLeaders 
                                : (conv.deputyLeaders || []).filter(id => (id._id || id) !== data.userId);
                            return {
                                ...conv,
                                members: updatedMembers,
                                deputyLeaders: updatedDeputyLeaders,
                                updatedAt: new Date().toISOString()
                            };
                        }
                        return conv;
                    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                );
                if (selectedChat && selectedChat._id === data.conversationId) {
                    setSelectedChat(prev => ({
                        ...prev,
                        members: Array.isArray(data.updatedMembers) 
                            ? data.updatedMembers 
                            : (prev.members || []).filter(m => (m._id || m) !== data.userId),
                        deputyLeaders: Array.isArray(data.updatedDeputyLeaders) 
                            ? data.updatedDeputyLeaders 
                            : (prev.deputyLeaders || []).filter(id => (id._id || id) !== data.userId)
                    }));
                }
            };

            const handleGroupDisbanded = (data) => {
                const disbandedConv = allConversations.find(c => c._id === data.conversationId);
                setAllConversations(prevConvs => prevConvs.filter(conv => conv._id !== data.conversationId));
                if (selectedChat && selectedChat._id === data.conversationId) {
                    setSelectedChat(null);
                    alert(`Nhóm "${disbandedConv?.name || 'Đã chọn'}" đã bị giải tán bởi ${data.disbandedBy?.name || 'trưởng nhóm'}.`);
                }
            };

            const handleGroupCreated = (data) => {
                const newGroup = {
                    ...data.conversation,
                    type: 'group',
                    name: data.conversation.conversationName,
                    isGroup: true,
                    updatedAt: data.conversation.updatedAt || data.conversation.createdAt || new Date().toISOString()
                };
                setAllConversations(prevConvs => {
                    if (prevConvs.some(c => c._id === newGroup._id)) {
                        return prevConvs.map(c => c._id === newGroup._id ? newGroup : c)
                                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                    }
                    return [newGroup, ...prevConvs]
                           .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                });
                if (data.conversation.members?.some(m => (m._id || m) === loggedInUser?._id)) {
                    handleSelectChat(newGroup);
                }
            };
            
            socket.on('receive-message', handleReceiveMessage);
            socket.on('group-metadata-updated', handleGroupMetadataUpdate);
            socket.on('member-left', handleMemberLeft);
            socket.on('group-disbanded', handleGroupDisbanded);
            socket.on('group-created', handleGroupCreated);

            return () => {
                socket.off('receive-message', handleReceiveMessage);
                socket.off('group-metadata-updated', handleGroupMetadataUpdate);
                socket.off('member-left', handleMemberLeft);
                socket.off('group-disbanded', handleGroupDisbanded);
                socket.off('group-created', handleGroupCreated);
            };
        }
    }, [socket, loggedInUser, selectedChat, allConversations, fetchAllUserConversations]);


    const handleSelectChat = (chatData) => {
        if (!chatData || !chatData._id) {
            console.error("ZaloPCLayout: handleSelectChat - Invalid chat data", chatData);
            return;
        }
        const fullChatDataFromList = allConversations.find(c => c._id === chatData._id);
        const chatToSelect = fullChatDataFromList ? {...fullChatDataFromList, ...chatData} : chatData;
    
        setAllConversations(prevConvs => 
            prevConvs.map(c => 
                c._id === chatToSelect._id ? { ...c, unread: 0 } : c
            ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        );
        setSelectedChat({...chatToSelect, unread: 0 });
        setActiveView('chats');
    };
    

    const handleInitiateChatWithFriend = async (friend) => {
        if (!loggedInUser || !friend) return;
        const token = localStorage.getItem('user_token');
        try {
            const response = await fetch('http://localhost:3001/conversation/createConversationsWeb', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ user_id: loggedInUser._id, friend_id: friend._id }),
            });
            const data = await response.json();
            if (response.ok && data.conversation) {
                const preparedSelectedChat = {
                    _id: data.conversation._id,
                    name: friend.userName,
                    avatar: friend.avatar,
                    type: 'user',
                    isGroup: false,
                    members: data.conversation.members || [loggedInUser, friend],
                    updatedAt: data.conversation.updatedAt || data.conversation.createdAt || new Date().toISOString(),
                };
                setAllConversations(prev => {
                    const existingIndex = prev.findIndex(c => c._id === preparedSelectedChat._id);
                    if (existingIndex > -1) {
                        const updated = [...prev];
                        updated[existingIndex] = { ...updated[existingIndex], ...preparedSelectedChat, updatedAt: new Date().toISOString() };
                        return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                    }
                    return [preparedSelectedChat, ...prev].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                });
                handleSelectChat(preparedSelectedChat);
            } else {
                console.error('ZaloPCLayout: Không thể tạo/mở cuộc trò chuyện:', data.message || 'Lỗi không xác định');
            }
        } catch (error) {
            console.error('ZaloPCLayout: Lỗi kết nối khi tạo cuộc trò chuyện:', error);
        }
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
        const newLoggedInUser = {
            ...loggedInUser,
            userName: updatedData.name,
            gender: updatedData.gender,
            dateOfBirth: updatedData.dob,
            avatar: updatedData.avatar || loggedInUser.avatar
        };
        setLoggedInUser(newLoggedInUser);
        localStorage.setItem('user', JSON.stringify(newLoggedInUser));
        justCloseUpdateInfoModal();
        setIsAccountInfoModalOpen(true);
    };

    const handleGroupCreated = (newGroupDataFromAPI) => {
        const groupToAdd = { 
            ...newGroupDataFromAPI, 
            type: 'group', 
            isGroup: true,
            name: newGroupDataFromAPI.conversationName, 
            updatedAt: newGroupDataFromAPI.updatedAt || newGroupDataFromAPI.createdAt || new Date().toISOString() 
        };
        setAllConversations(prevConversations => {
            const existingIndex = prevConversations.findIndex(conv => conv._id === groupToAdd._id);
            let updatedConversations;
            if (existingIndex !== -1) {
                updatedConversations = [...prevConversations];
                updatedConversations[existingIndex] = groupToAdd;
            } else {
                updatedConversations = [groupToAdd, ...prevConversations];
            }
            return updatedConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        });
        handleSelectChat(groupToAdd);
        closeCreateGroupModal();
    };

    const handleConversationDeleted = (deletedConversationId) => {
        setAllConversations(prevConversations =>
            prevConversations.filter(conv => (conv._id || conv.id) !== deletedConversationId)
        );
        if (selectedChat && (selectedChat._id || selectedChat.id) === deletedConversationId) {
            setSelectedChat(null);
        }
    };
    
    const handleUserUpdated = (updatedUser) => {
        setLoggedInUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    
        setAllConversations(prevConvs => 
            prevConvs.map(conv => {
                if (conv.type === 'user' && conv.members && conv.members.some(m => (m._id || m) === updatedUser._id)) {
                    const otherUserInConv = conv.members.find(m => (m._id || m) !== updatedUser._id);
                    if(otherUserInConv) { // Check if this is a 1-on-1 chat
                       return {
                           ...conv,
                           name: (otherUserInConv._id || otherUserInConv) === loggedInUser._id ? updatedUser.userName : conv.name,
                           avatar: (otherUserInConv._id || otherUserInConv) === loggedInUser._id ? updatedUser.avatar : conv.avatar,
                           members: conv.members.map(m => (m._id || m) === updatedUser._id ? updatedUser : m)
                       };
                    }
                } else if (conv.type === 'group' && conv.members && conv.members.some(m => (m._id || m) === updatedUser._id)) {
                     return {
                        ...conv,
                        members: conv.members.map(m => (m._id || m) === updatedUser._id ? {...m, userName: updatedUser.userName, avatar: updatedUser.avatar } : m)
                     }
                }
                return conv;
            })
        );
    
        if (selectedChat && selectedChat.type === 'user' && selectedChat.members && selectedChat.members.some(m => (m._id || m) === updatedUser._id)) {
            const otherUserInSelectedChat = selectedChat.members.find(m => (m._id || m) !== updatedUser._id);
            if(otherUserInSelectedChat) {
                setSelectedChat(prev => ({
                    ...prev,
                    name: (otherUserInSelectedChat._id || otherUserInSelectedChat) === loggedInUser._id ? updatedUser.userName : prev.name,
                    avatar: (otherUserInSelectedChat._id || otherUserInSelectedChat) === loggedInUser._id ? updatedUser.avatar : prev.avatar,
                    members: prev.members.map(m => (m._id || m) === updatedUser._id ? updatedUser : m)
                }));
            }
        } else if (selectedChat && selectedChat.type === 'group' && selectedChat.members && selectedChat.members.some(m => (m._id || m) === updatedUser._id)) {
            setSelectedChat(prev => ({
                ...prev,
                members: prev.members.map(m => (m._id || m) === updatedUser._id ? {...m, userName: updatedUser.userName, avatar: updatedUser.avatar } : m)
            }));
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
                socket={socket}
                loggedInUserAvatar={loggedInUser?.avatar}
            />
            {activeView === 'chats' && (
                <MainContent
                    selectedChat={selectedChat}
                    currentLoggedInUserId={loggedInUser?._id}
                    onConversationDeleted={handleConversationDeleted}
                    allConversations={allConversations}
                    socket={socket}
                    key={selectedChat?._id || 'no-chat'}
                />
            )}
            {activeView === 'contacts' && (
                <ContactsMainView
                    subViewType={activeContactsNavItem}
                    currentLoggedInUserId={loggedInUser?._id}
                    onInitiateChatWithFriend={handleInitiateChatWithFriend}
                    fetchAllConversations={fetchAllUserConversations}
                />
            )}
            <AccountInfoModal
                isOpen={isAccountInfoModalOpen}
                onClose={closeAccountInfoModal}
                onOpenUpdateModal={openUpdateInfoModal}
                userData={loggedInUser}
                onUserUpdated={handleUserUpdated}
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
                onFriendRequestSentOrAccepted={fetchAllUserConversations}
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