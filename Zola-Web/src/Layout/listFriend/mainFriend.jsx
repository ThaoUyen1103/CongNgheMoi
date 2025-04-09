import React, { useState, useEffect } from 'react'
import { BsPersonLinesFill } from 'react-icons/bs'
import { SlArrowDown } from 'react-icons/sl'
import { BsArrowDownUp } from 'react-icons/bs'
import { CiFilter } from 'react-icons/ci'
import Modal from 'react-modal'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import AddPupopYou from '../Dashboard/main/addPupopYou'
import PopupYou from '../Dashboard/main/pupopYou'
const MainFriend = ({ friend_list }) => {
    const [isHovered, setIsHovered] = useState({})
    const [names, setNames] = useState([])
    const sortNames = () => {
        const sortedNames = [...names].sort((a, b) => a.localeCompare(b))
        setNames(sortedNames)
    }
    const user_id = localStorage.getItem('user_id').replace(/"/g, '').trim()

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [selectedFriend, setSelectedFriend] = useState(null)
    const [showPopup, setShowPopup] = useState(false)
    const handleButtonClick = (friend) => {
        setSelectedFriend(friend)
        setModalIsOpen(true)
    }
    const handleInfo = (friend) => {
        setShowPopup(true)
    }

    const handleDelete = () => {
        // Xử lý xóa bạn ở đây

        axios
            .post('http://localhost:3001/user/deleteFriendWeb', {
                user_id: user_id,
                friend_id: selectedFriend.friend_id,
            })
            .then((response) => {
                if (response.data.message === 'Xóa bạn bè thành công!!!') {
                    toast.success('Xóa bạn bè thành công!!!')
                    window.location.reload()
                }
            })
            .catch((error) => {
                console.error(error)
            })

        // ...
        setModalIsOpen(false)
    }
    const handleClose = () => {
        setShowPopup(false)
    }
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'whitesmoke',
            }}
        >
            <Toaster toastOptions={{ duration: 3500 }} />
            <div
                style={{
                    width: '100%',
                    height: 70,
                    backgroundColor: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: 15,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginLeft: 20,
                    }}
                >
                    <label>
                        <BsPersonLinesFill size="1.5rem" />
                    </label>
                    <label
                        style={{
                            fontSize: 18,
                        }}
                    >
                        Danh sách bạn bè
                    </label>
                </div>
            </div>

            <div
                style={{
                    width: '100%',
                    height: 60,
                    backgroundColor: 'whitesmoke',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <label style={{ fontSize: 15, marginLeft: 15 }}>
                    Bạn bè ({friend_list.length})
                </label>
            </div>
            <div
                style={{
                    width: '98%',
                    height: 610,
                    backgroundColor: 'white',
                    // display: 'flex',
                    margin: 'auto',
                    justifyContent: 'space-between',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: 50,
                        display: 'flex',
                        gap: 10,
                        marginLeft: 10,
                        alignItems: 'center',
                        // backgroundColor: 'blue',
                        justifyContent: 'space-between',
                    }}
                >
                    <input
                        style={{
                            width: '27%',
                            height: 20,
                            alignItems: 'center',
                            backgroundColor: 'whitesmoke',
                            borderRadius: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            marginLeft: 10,
                        }}
                        type="text"
                        placeholder="Search "
                    />

                    <div
                        style={{
                            width: '20%',
                            height: 26,
                            alignItems: 'center',
                            display: 'flex',
                            borderRadius: 5,
                            backgroundColor: 'whitesmoke',
                        }}
                    >
                        <BsArrowDownUp size="1rem" />
                        <button
                            onClick={sortNames}
                            style={{
                                width: '80%',
                                height: 26,
                                borderRadius: 5,
                                backgroundColor: 'whitesmoke',
                                border: 'none',
                            }}
                        >
                            Tên (A-Z)
                        </button>
                        <SlArrowDown size="1rem" />
                    </div>
                    <div
                        style={{
                            width: '20%',
                            height: 26,
                            alignItems: 'center',
                            display: 'flex',
                            borderRadius: 5,
                            backgroundColor: 'whitesmoke',
                        }}
                    >
                        <CiFilter size="1rem" />
                        <button
                            onClick={sortNames}
                            style={{
                                width: '80%',
                                height: 26,
                                borderRadius: 5,
                                backgroundColor: 'whitesmoke',
                                border: 'none',
                            }}
                        >
                            Tất cả
                        </button>
                        <SlArrowDown size="1rem" />
                    </div>

                    <div
                        style={{
                            width: '30%',
                            height: 20,
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                    ></div>
                </div>

                <div
                    style={{
                        width: '100%',
                        height: 500,

                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflowY: 'scroll',
                        // backgroundColor: 'yellow',
                    }}
                >
                    {friend_list.map((friend) => (
                        <div
                            key={friend._id} // giả sử mỗi bạn bè có một id duy nhất
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px',
                                marginBottom: '20px',
                                backgroundColor: '#fdf8f1',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}
                            >
                                <img
                                    src={friend.avatar}
                                    alt={friend.friendName}
                                    style={{
                                        width: '70px', // thay đổi kích thước này để phù hợp
                                        height: '70px', // thay đổi kích thước này để phù hợp
                                        borderRadius: '50%',
                                        border: '3px solid #2596be',
                                    }}
                                />
                                <span>
                                    <b>{friend.friendName}</b>
                                </span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}
                            >
                                <button
                                    style={{
                                        color: '#0000FF',
                                        border: 'none',
                                        borderRadius: '5px',
                                    }}
                                    onClick={() => handleButtonClick(friend)}
                                >
                                    <b>Chọn</b>
                                </button>
                                <Modal
                                    isOpen={modalIsOpen}
                                    style={{
                                        overlay: {
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.25)',
                                        },
                                        content: {
                                            width: '300px',
                                            height: '100px',
                                            position: 'relative',
                                            left: '10px', // adjust this value to move the modal left or right
                                            marginTop: '300px',
                                            marginLeft: '700px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        },
                                    }}
                                >
                                    <button
                                        onClick={() => setModalIsOpen(false)}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            background: 'transparent',
                                            border: 'none',
                                            fontSize: '1.5em',
                                        }}
                                    >
                                        <p>X</p>
                                    </button>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                        }}
                                    >
                                        <button
                                            style={{
                                                backgroundColor: 'blue',
                                                borderRadius: '5px',
                                                color: 'white',
                                            }}
                                            onClick={(e) => handleInfo(e)}
                                        >
                                            Xem thông tin
                                        </button>
                                        {showPopup && (
                                            <div
                                                style={{
                                                    position: 'fixed',
                                                    top: '0%',
                                                    left: '0%',
                                                    display: 'flex',
                                                    background:
                                                        'rgba(0,0,0,0.5)',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: '100vh',
                                                    width: '100%',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        position: 'relative',
                                                        width: '25%',
                                                        height: '95%',
                                                        background: 'white',
                                                        marginLeft: '70px',
                                                        padding: '0px',

                                                        borderRadius: '10px',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            position:
                                                                'absolute',
                                                            top: '1px',
                                                            right: '5px',
                                                            cursor: 'pointer',
                                                            fontSize: '22px',
                                                            color: 'black',
                                                            padding: '5px',
                                                            borderRadius: '50%',

                                                            backgroundColor:
                                                                'white',
                                                        }}
                                                        onClick={handleClose}
                                                    >
                                                        X
                                                    </span>

                                                    {selectedFriend && (
                                                        <AddPupopYou
                                                            friend_id={
                                                                selectedFriend.friend_id
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            style={{
                                                backgroundColor: 'red',
                                                borderRadius: '5px',
                                                color: 'white',
                                            }}
                                            onClick={handleDelete}
                                        >
                                            Xoá bạn
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setModalIsOpen(false)}
                                    ></button>
                                </Modal>
                            </div>
                        </div>

                        // thêm 1 dòng kẻ ngang khi hết cái div
                    ))}
                </div>
            </div>
        </div>
    )
}
export default MainFriend
