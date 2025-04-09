import { AiOutlineUserAdd } from 'react-icons/ai'
import { useState } from 'react'
import { BsPersonLinesFill } from 'react-icons/bs'
import { AiOutlineUsergroupAdd } from 'react-icons/ai'
import { GrSearch } from 'react-icons/gr'
import { IoPeopleOutline } from 'react-icons/io5'
import { CiMail } from 'react-icons/ci'
import { useNavigate } from 'react-router-dom'
import PopupBeFriend from '../Dashboard/subSideBar/Befriend/popupBeFriend'
import PopupCreateAGroup from '../Dashboard/subSideBar/CreateAGroup/popupCreateAGroup'
import AddPopupCreateAGroup from '../Dashboard/subSideBar/CreateAGroup/addCreateAGroup'
import AddPopupBeFriend from '../Dashboard/subSideBar/Befriend/addPopupBeFriend'
import PopupSearch from '../Dashboard/subSideBar/popupSearch'
import AddPopupSearch from '../Dashboard/subSideBar/addpopupSearch'
const SideBarFriend = () => {
    const navigate = useNavigate()
    const [OpenBeFriend, setOpenBeFriend] = useState(false)
    const [OpenCreateAGroup, setOpenCreateAGroup] = useState(false)
    const handleteam = () => {
        // Thực hiện chuyển hướng khi người dùng nhấp vào biểu tượng
        navigate('/teamlist')
    }
    const handlerequest = () => {
        // Thực hiện chuyển hướng khi người dùng nhấp vào biểu tượng
        navigate('/requestlist')
    }
    const handleListFriend = () => {
        // Thực hiện chuyển hướng khi người dùng nhấp vào biểu tượng
        navigate('/listFriend')
    }
    const [openSearch, setOpenSearch] = useState(false)
    const openPopup = (props) => {
        setOpenSearch(true)
    }
    const closePopup = () => {
        setOpenSearch(!openSearch)
    }
    console.log('OpenCreateAGroup', OpenCreateAGroup)
    return (
        <div style={{ width: '25%', height: '100%', backgroundColor: 'white' }}>
            <div
                style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 20,
                    height: '3%',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        height: '100%',
                        backgroundColor: 'whitesmoke',
                        width: '100%',
                        marginLeft: 20,
                        borderRadius: 10,
                        gap: 5,
                        border: '1px solid black',
                    }}
                >
                    <div style={{ marginLeft: 10, marginTop: 2 }}>
                        <GrSearch size="1rem" />
                    </div>

                    <input
                        style={{
                            width: '100%',
                            height: '90%',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            borderRadius: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            border: 'none',
                            backgroundColor: 'whitesmoke',
                        }}
                        onClick={() => {
                            setOpenSearch(!openSearch)
                        }}
                        type="text"
                        placeholder="Tìm kiếm "
                    />
                </div>
                {openSearch && (
                    <PopupSearch
                        content={<AddPopupSearch />}
                        handleClose={() => {
                            setOpenSearch(!openSearch)
                        }}
                    />
                )}
                <div
                    onClick={() => {
                        setOpenBeFriend(!OpenBeFriend)
                    }}
                >
                    <AiOutlineUserAdd size="1.3rem" />
                </div>
                {OpenBeFriend && (
                    <PopupBeFriend
                        content={<AddPopupBeFriend />}
                        handleClose={() => {
                            setOpenBeFriend(!OpenBeFriend)
                        }}
                    />
                )}
                <div
                    onClick={() => {
                        setOpenCreateAGroup(!OpenCreateAGroup)
                    }}
                >
                    <AiOutlineUsergroupAdd size="1.4rem" />
                </div>
            </div>
            {OpenCreateAGroup && (
                <PopupCreateAGroup
                    content={<AddPopupCreateAGroup />}
                    handleClose={() => {
                        setOpenCreateAGroup(!OpenCreateAGroup)
                    }}
                    setOpenCreateAGroup={setOpenCreateAGroup}
                />
            )}

            <div
                style={{
                    width: '100%',
                    height: '6%',
                    display: 'flex',
                    gap: 10,
                    marginTop: 30,
                    marginLeft: 10,
                }}
            >
                <button
                    style={{
                        border: 'none',
                        backgroundColor: 'white',
                        display: 'flex',
                        gap: 10,
                    }}
                    onClick={handleListFriend}
                >
                    <label>
                        <BsPersonLinesFill size="1.3rem" />
                    </label>
                    <label
                        style={{
                            color: 'black',
                            fontSize: 15,
                        }}
                    >
                        Danh sách bạn bè
                    </label>
                </button>
            </div>
            <div
                style={{
                    width: '100%',
                    height: '6%',
                    display: 'flex',
                    gap: 10,
                    marginTop: 5,
                    marginLeft: 10,
                }}
            >
                <button
                    style={{
                        border: 'none',
                        backgroundColor: 'white',
                        display: 'flex',
                        gap: 10,
                    }}
                    onClick={handleteam}
                >
                    <label>
                        <IoPeopleOutline size="1.5rem" />
                    </label>
                    <label
                        style={{
                            color: 'black',
                            fontSize: 15,
                        }}
                    >
                        Danh sách nhóm
                    </label>
                </button>
            </div>
            <div
                style={{
                    width: '100%',
                    height: '6%',
                    display: 'flex',
                    gap: 10,
                    marginTop: 5,
                    marginLeft: 10,
                }}
            >
                <button
                    style={{
                        border: 'none',
                        backgroundColor: 'white',
                        display: 'flex',
                        gap: 10,
                    }}
                    onClick={handlerequest}
                >
                    <label>
                        <CiMail size="1.5rem" />
                    </label>
                    <label
                        style={{
                            color: 'black',
                            fontSize: 15,
                        }}
                    >
                        Lời mời kết bạn
                    </label>
                </button>
            </div>
        </div>
    )
}

export default SideBarFriend
