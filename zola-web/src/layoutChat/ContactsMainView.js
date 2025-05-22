import React, { useState, useEffect } from 'react';
import '../styles/ContactsMainView.css';
import { FaSearch, FaFilter, FaEllipsisH, FaSortAmountDown, FaAddressBook, FaUsers, FaUserPlus, FaUserClock, FaUserCheck, FaTimesCircle, FaCommentDots } from 'react-icons/fa';

const mockFriends = [
  { id: 'a1', name: 'A2', avatarUrl: 'https://via.placeholder.com/40/FFA07A/000000?Text=A2', mutualFriends: 5 },
  { id: 'a2', name: 'A3', avatarUrl: 'https://via.placeholder.com/40/98FB98/000000?Text=A3', mutualFriends: 2 },
  { id: 'b1', name: 'Bình An', avatarUrl: 'https://via.placeholder.com/40/ADD8E6/000000?Text=BA', mutualFriends: 10 },
];

const mockGroups = [
  { id: 'g1', name: 'CLB D36', avatarUrls: ['https://via.placeholder.com/20/FF0000/FFFFFF?Text=C', 'https://via.placeholder.com/20/00FF00/FFFFFF?Text=L', 'https://via.placeholder.com/20/0000FF/FFFFFF?Text=B'], memberCount: 20, lastActivity: '2 giờ trước' },
  { id: 'g2', name: 'HD_KLTN_HK2_2024_2025', avatarUrls: ['https://via.placeholder.com/20/FFA500/FFFFFF?Text=H', 'https://via.placeholder.com/20/FFFF00/000000?Text=D'], memberCount: 11, lastActivity: 'Hôm qua' },
];

const mockSentFriendRequests = [
    { id: 'sfr1', name: 'Nam Hải', avatarUrl: 'https://via.placeholder.com/60/8E44AD/FFFFFF?Text=NH', statusText: 'Bạn đã gửi lời mời' },
    { id: 'sfr2', name: 'Nguyễn Thị Hồng L...', avatarUrl: 'https://via.placeholder.com/60/2ECC71/FFFFFF?Text=NL', statusText: 'Bạn đã gửi lời mời' },
    { id: 'sfr3', name: 'Trần Văn Hoá', avatarUrl: 'https://via.placeholder.com/60/3498DB/FFFFFF?Text=TH', statusText: 'Bạn đã gửi lời mời' },
    { id: 'sfr4', name: 'Đinh Lệ Khải', avatarUrl: 'https://via.placeholder.com/60/F39C12/FFFFFF?Text=ĐK', statusText: 'Bạn đã gửi lời mời' },
    { id: 'sfr5', name: 'Nguyễn Văn Thiện', avatarUrl: 'https://via.placeholder.com/60/1ABC9C/FFFFFF?Text=NT', statusText: 'Bạn đã gửi lời mời' },
    { id: 'sfr6', name: 'Huỳnh Ngọc Hiền', avatarUrl: 'https://via.placeholder.com/60/E74C3C/FFFFFF?Text=HH', statusText: 'Bạn đã gửi lời mời' },
];

const mockFriendSuggestions = [
    { id: 'sug1', name: 'Hưng Nguyễn', avatarUrl: 'https://via.placeholder.com/60/34495E/FFFFFF?Text=HN', reason: 'Có thể bạn quen' },
    { id: 'sug2', name: 'Lê Ngọc Quý', avatarUrl: 'https://via.placeholder.com/60/9B59B6/FFFFFF?Text=LQ', reason: 'Có thể bạn quen' },
    { id: 'sug3', name: 'Mai Trang', avatarUrl: 'https://via.placeholder.com/60/16A085/FFFFFF?Text=MT', reason: 'Có thể bạn quen' },
    { id: 'sug4', name: 'Nam Khương', avatarUrl: 'https://via.placeholder.com/60/D35400/FFFFFF?Text=NK', reason: 'Có thể bạn quen' },
    { id: 'sug5', name: 'Nguyễn trường kha...', avatarUrl: 'https://via.placeholder.com/60/2980B9/FFFFFF?Text=NK', reason: 'Có thể bạn quen' },
    { id: 'sug6', name: 'Trương Thị Ngọc Ánh', avatarUrl: 'https://via.placeholder.com/60/C0392B/FFFFFF?Text=TA', reason: 'Có thể bạn quen' },
];


function ContactsMainView({ subViewType }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name_asc');
  const [filterType, setFilterType] = useState('all');

  const handleAction = (action, itemId, itemName) => {
    console.log(`Action: ${action} on item ID: ${itemId}, Name: ${itemName}`);
  };


  const renderFriendItem = (contact) => (
    <div key={contact.id} className="contact-list-item">
      <div className="contact-item-main-info">
        <img src={contact.avatarUrl} alt={contact.name} className="contact-item-avatar" />
        <div className="contact-item-info">
          <span className="contact-item-name">{contact.name}</span>
          {contact.mutualFriends > 0 && (
            <span className="contact-item-mutual">{contact.mutualFriends} bạn chung</span>
          )}
        </div>
      </div>
      <button className="contact-item-options-btn" onClick={() => handleAction('options_friend', contact.id, contact.name)}> <FaEllipsisH /> </button>
    </div>
  );

  const renderGroupItem = (group) => (
    <div key={group.id} className="group-list-item">
      <div className="group-item-main-info">
        <div className="group-item-avatar-stack">
          {group.avatarUrls && group.avatarUrls.length > 0 ? group.avatarUrls.slice(0, 3).map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Avatar ${index + 1}`}
              className={`stacked-avatar stacked-avatar-${index}`}
            />
          )) : <div className="group-item-avatar-placeholder"><FaUsers/></div> }
        </div>
        <div className="group-item-info">
          <span className="group-item-name">{group.name}</span>
          <span className="group-item-members">{group.memberCount} thành viên</span>
        </div>
      </div>
      <button className="contact-item-options-btn" onClick={() => handleAction('options_group', group.id, group.name)}> <FaEllipsisH /> </button>
    </div>
  );

  const renderSentRequestItem = (request) => (
    <div key={request.id} className="friend-request-card sent-request-card">
        <img src={request.avatarUrl} alt={request.name} className="request-card-avatar" />
        <div className="request-card-info">
            <span className="request-card-name">{request.name}</span>
            <span className="request-card-status">{request.statusText}</span>
        </div>
        <div className="request-card-actions">
            <button className="request-action-btn withdraw-btn" onClick={() => handleAction('withdraw_request', request.id, request.name)}>Thu hồi lời mời</button>
            <button className="request-action-btn chat-icon-btn" title="Nhắn tin" onClick={() => handleAction('chat_with_pending', request.id, request.name)}>
                <FaCommentDots />
            </button>
        </div>
    </div>
  );

  const renderFriendSuggestionItem = (suggestion) => (
    <div key={suggestion.id} className="friend-request-card suggestion-card">
        <img src={suggestion.avatarUrl} alt={suggestion.name} className="request-card-avatar" />
        <div className="request-card-info">
            <span className="request-card-name">{suggestion.name}</span>
            <span className="request-card-reason">{suggestion.reason}</span>
        </div>
        <div className="request-card-actions">
            <button className="request-action-btn ignore-btn" onClick={() => handleAction('ignore_suggestion', suggestion.id, suggestion.name)}>Bỏ qua</button>
            <button className="request-action-btn add-friend-btn" onClick={() => handleAction('add_suggested_friend', suggestion.id, suggestion.name)}>Kết bạn</button>
        </div>
    </div>
  );


  let title = '';
  let titleIcon = null;
  let searchPlaceholder = "Tìm kiếm...";
  let content = null;

  if (subViewType === 'friends') {
    title = `Bạn bè (${mockFriends.length})`;
    titleIcon = <FaAddressBook className="contacts-title-icon" />;
    searchPlaceholder = "Tìm bạn";
    const filteredFriends = mockFriends.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const groupedFriends = filteredFriends.reduce((acc, contact) => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(contact);
      return acc;
    }, {});

    content = (
        <>
            <div className="contacts-controls">
                <div className="contacts-search-bar">
                <FaSearch className="contacts-search-icon" />
                <input type="text" placeholder={searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="contacts-filters">
                <button className="filter-btn" onClick={() => setSortOrder(sortOrder === 'name_asc' ? 'name_desc' : 'name_asc')}>
                    <FaSortAmountDown /> Tên ({sortOrder === 'name_asc' ? 'A-Z' : 'Z-A'})
                </button>
                <button className="filter-btn"><FaFilter /> Tất cả</button>
                </div>
            </div>
            <div className="contacts-list-container">
                {Object.keys(groupedFriends).sort().map(letter => (
                <div key={letter} className="contact-group">
                    <h3 className="contact-group-letter">{letter}</h3>
                    {groupedFriends[letter].map(contact => renderFriendItem(contact))}
                </div>
                ))}
                {filteredFriends.length === 0 && <p className="no-contacts-found">{searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : "Danh sách bạn bè trống."}</p>}
            </div>
        </>
    );

  } else if (subViewType === 'groups') {
    title = `Nhóm và cộng đồng (${mockGroups.length})`;
    titleIcon = <FaUsers className="contacts-title-icon" />;
    searchPlaceholder = "Tìm nhóm...";
    const filteredGroups = mockGroups.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    content = (
        <>
            <div className="contacts-controls">
                <div className="contacts-search-bar">
                <FaSearch className="contacts-search-icon" />
                <input type="text" placeholder={searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="contacts-filters">
                <button className="filter-btn">
                    <FaSortAmountDown /> Hoạt động (mới → cũ)
                </button>
                <button className="filter-btn"><FaFilter /> Tất cả</button>
                </div>
            </div>
            <div className="contacts-list-container groups-list-container">
                {filteredGroups.map(group => renderGroupItem(group))}
                {filteredGroups.length === 0 && <p className="no-contacts-found">{searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : "Chưa có nhóm nào."}</p>}
            </div>
        </>
    );
  } else if (subViewType === 'friend_requests') {
    title = 'Lời mời kết bạn';
    titleIcon = <FaUserPlus className="contacts-title-icon" />;
    searchPlaceholder = "Tìm theo tên hoặc số điện thoại";
    const filteredSentRequests = mockSentFriendRequests.filter(req => req.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredSuggestions = mockFriendSuggestions.filter(sug => sug.name.toLowerCase().includes(searchTerm.toLowerCase()));

    content = (
        <>
            <div className="contacts-controls friend-requests-controls">
                 <div className="contacts-search-bar">
                    <FaSearch className="contacts-search-icon" />
                    <input type="text" placeholder={searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
            <div className="contacts-list-container friend-requests-container">
                <div className="friend-requests-section">
                    <h3 className="friend-requests-section-title">Lời mời đã gửi ({filteredSentRequests.length})</h3>
                    <div className="friend-request-grid">
                        {filteredSentRequests.length > 0 ? filteredSentRequests.map(request => renderSentRequestItem(request))
                        : !searchTerm && <p className="no-requests-message">Bạn chưa gửi lời mời nào.</p>}
                    </div>
                     {filteredSentRequests.length === 0 && searchTerm && <p className="no-contacts-found">{`Không tìm thấy lời mời nào cho "${searchTerm}"`}</p>}
                </div>

                <div className="friend-requests-section">
                    <h3 className="friend-requests-section-title">Gợi ý kết bạn ({filteredSuggestions.length})</h3>
                    <div className="friend-request-grid">
                        {filteredSuggestions.length > 0 ? filteredSuggestions.map(suggestion => renderFriendSuggestionItem(suggestion))
                        : !searchTerm && <p className="no-requests-message">Hiện chưa có gợi ý nào cho bạn.</p>}
                    </div>
                    {filteredSuggestions.length === 0 && searchTerm && <p className="no-contacts-found">{`Không tìm thấy gợi ý nào cho "${searchTerm}"`}</p>}
                </div>
            </div>
        </>
    );
  }


  return (
    <div className="contacts-main-view">
      <div className="contacts-header-bar">
        <div className="contacts-title-container">
          {titleIcon}
          <h2 className="contacts-view-title">{title}</h2>
        </div>
      </div>
      {content}
    </div>
  );
}

export default ContactsMainView;