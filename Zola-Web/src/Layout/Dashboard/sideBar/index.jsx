import { PiChatCircleText } from 'react-icons/pi'
import { useRef, useEffect } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { BsPersonLinesFill } from 'react-icons/bs'
import { CiCloudOn } from 'react-icons/ci'
import { CiMail } from 'react-icons/ci'
import { useNavigate } from 'react-router-dom'
import { IoSettingsOutline } from 'react-icons/io5'
import { useState } from 'react'
import { IoPersonOutline } from 'react-icons/io5'
import { FiDatabase } from 'react-icons/fi'
import { FiTool } from 'react-icons/fi'
import { MdOutlineLanguage } from 'react-icons/md'
import { AiOutlineEdit } from 'react-icons/ai'
import { IoIosInformationCircleOutline } from 'react-icons/io'
import { CiCamera } from 'react-icons/ci'
import Popup from '../sideBar/popup'
import demo from '../../../Assets/demo.jpg'
import { IoIosArrowForward } from 'react-icons/io'
import AddPupopSetting from './addPopupSetting'
import PopupSetting from './popupSettings'
import PopupUpdate from './popupUpdate'
import AddPupopUpdate from './addPupopUpdate'
import PopupChangePass from './popupChangePass'
import AddPopupChangePass from './addPupopChangePass'
import AddPopupInfoMe from './addPopupInfoMe'

const SideBar = ({ user }) => {
    const navigate = useNavigate()
    const handleCloud = () => {
        navigate('/cloud')
    }
    const handleDashboard = () => {
        navigate('/dashboard')
    }
    const handleListFriend = () => {
        navigate('/listFriend')
    }
    const [activeIndex, setActiveIndex] = useState(false)

    const handleDivClick = (index) => {
        setActiveIndex(index)
    }
    const divs = [{ color: 'lightblue' }]

    const [open, setOpen] = useState(false)
    const [openInfo, setOpenInfo] = useState(false)
    const [openInfoMe, setOpenInfoMe] = useState(false)
    const [openSetting, setOpenSetting] = useState(false)
    const [openUpdate, setOpenUpdate] = useState(false)
    const [OpenBeFriend, setOpenBeFriend] = useState(false)
    const [ChangePass, setChangePass] = useState(false)
    const [avatarURL, setAvatarURL] = useState()
    const user_id = localStorage.getItem('user_id').replace(/"/g, '').trim()

    // nếu mà có user thì mới thực hiện các cấu lệnh dưới

    // format ngày tháng năm sinh từ chuỗi String sang dạng Date
    const [day, month, year] = user.dateOfBirth.split('/')
    const dateOfBirth = new Date(`${month}/${day}/${year}`)
    const formattedDateOfBirth = `${dateOfBirth.getDate()} tháng ${
        dateOfBirth.getMonth() + 1
    }, ${dateOfBirth.getFullYear()}`
    // const formattedPhoneNumber = user.phoneNumber.replace(/^0/, '+84 ')

    // tạo useEffect để set avatarURL ban đầu
    useEffect(() => {
        setAvatarURL(user.avatar)
    }, [user.avatar])

    // Tạo một tham chiếu đến thẻ input
    const formData = new FormData()

    const inputRef = useRef()

    // Hàm xử lý khi chọn file
    const handleFileChange = (event) => {
        const file = event.target.files[0]
        // Xử lý file ở đây
        formData.append('image', file)
        formData.append('user_id', user_id)

        axios
            .post('http://localhost:3001/user/changeImageAvatarWeb', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                toast.success('Upload ảnh thành công!!!')
                // cập nhật lại avatarURL
                const newAvatarURL = response.data.avatarURL
                setAvatarURL(newAvatarURL)

            })
            .catch((error) => {
                console.error(error)
            })
    }

    // Hàm xử lý khi nhấp vào biểu tượng camera
    const handleCameraClick = () => {
        inputRef.current.click()
    }

    return (
        <div
            style={{
                width: '6%',
                height: '100%',
                backgroundColor: '#0091FF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <div
                style={{
                    // padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',

                    width: '100%',
                }}
            >
                <div
                    style={{
                        backgroundColor: '#0091FF',
                        border: 'none',
                        color: 'white',
                        fontSize: 20,
                    }}
                    onClick={() => {
                        setOpenInfo(!openInfo)
                    }}
                >
                    {' '}
                    <img
                        src={avatarURL}
                        alt="demo"
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            backgroundColor: 'grey',
                            cursor: 'pointer',
                        }}
                    />
                </div>
                {openInfo && (
                    <div
                        style={{
                            position: 'absolute',
                            left: '4.6%',
                            top: '2%',
                            background: 'white',
                            height: '10rem',
                            width: '16rem',
                            borderRadius: 5,
                            border: '1px solid lightgrey',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    width: '90%',
                                    height: 30,
                                    display: 'flex',
                                    gap: 10,
                                    marginLeft: 10,
                                    marginTop: 10,
                                    borderBottom: '1px solid lightgrey',
                                }}
                            >
                                <label
                                    style={{
                                        color: 'black',
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        marginLeft: 10,
                                    }}
                                >
                                    {user.userName}
                                </label>
                            </div>
                            <div
                                style={{
                                    width: '90%',
                                    height: 30,
                                    display: 'flex',
                                    gap: 10,
                                    marginLeft: 10,
                                    marginTop: 10,
                                }}
                                onClick={() => {
                                    setOpenInfoMe(!openInfoMe)
                                }}
                            >
                                <label
                                    style={{
                                        color: 'black',
                                        fontSize: 15,
                                        marginLeft: 10,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Hồ sơ của bạn
                                </label>
                            </div>
                            {openInfoMe && (
                                <Popup
                                    content={<AddPopupInfoMe user={user} />}
                                    handleClose={() => {
                                        setOpenInfoMe(!openInfoMe)
                                    }}
                                />
                            )}
                            <div
                                style={{
                                    width: '90%',
                                    height: 30,
                                    display: 'flex',
                                    gap: 10,
                                    marginLeft: 10,
                                    marginTop: 10,
                                    borderBottom: '1px solid lightgrey',
                                    
                                }}
                                onClick={() => {
                                    setOpenSetting(!openSetting)
                                }}
                            >
                                <label
                                    style={{
                                        color: 'black',
                                        fontSize: 15,
                                        cursor: 'pointer',
                                        marginLeft: 10,
                                    }}
                                >
                                    Cài đặt
                                </label>
                            </div>
                            {openSetting && (
                                <PopupSetting
                                    content={<AddPupopSetting />}
                                    handleClose={() => {
                                        setOpenSetting(!openSetting)
                                    }}
                                />
                            )}

                            {/* <div
                style={{
                  width: '90%',
                  height: 30,
                  display: 'flex',
                  gap: 10,
                  marginLeft: 10,
                  marginTop: 10,
                  borderBottom: '1px solid lightgrey',
                }}
                onClick={() => {
                  setChangePass(!ChangePass)
                }}
              >
                <label
                  style={{
                    color: 'black',
                    fontSize: 15,

                    marginLeft: 10,
                  }}
                >
                  Đổi mật khẩu
                </label>
              </div>
              {ChangePass && (
                <PopupChangePass
                  content={<AddPopupChangePass />}
                  handleClose={() => {
                    setChangePass(!ChangePass)
                  }}
                />
              )} */}
                            <div
                                style={{
                                    width: '90%',
                                    height: 30,
                                    display: 'flex',
                                    gap: 10,
                                    marginLeft: 10,
                                    marginTop: 10,
                                }}
                            >
                                <a
                                    href="http://localhost:3000/login"
                                    style={{
                                        width: '90%',
                                        height: 30,
                                        display: 'flex',
                                        gap: 10,
                                        marginLeft: 10,
                                        color: 'black',
                                        fontSize: 15,
                                        textDecoration: 'none',
                                    }}
                                >
                                    Đăng xuất
                                </a>
                                {/* <label
                  style={{
                    color: 'black',
                    fontSize: 15,

                    marginLeft: 10,
                  }}
                >
                  Đăng xuất
                </label> */}
                            </div>
                        </div>
                    </div>
                )}
                <div
                    style={{
                        width: '100%',
                        height: 40,
                        display: 'flex',
                        alignContent: 'center',
                        alignItems: 'center',

                        justifyContent: 'center',
                        marginTop: 10,
                    }}
                >
                    {divs.map((div, index) => (
                        <div
                            key={index}
                            onClick={() => handleDivClick(index)}
                            style={{
                                backgroundColor:
                                    activeIndex === index
                                        ? div.color
                                        : '#0091FF',

                                cursor: 'pointer',
                                width: '100%',
                                alignContent: 'center',
                                alignItems: 'center',
                                height: 40,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <button
                                style={{
                                    border: 'none',
                                    color: 'white',
                                    fontSize: 20,
                                }}
                                onClick={handleDashboard}
                            >
                                <PiChatCircleText size="2rem" />
                            </button>
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        width: '100%',
                        height: 40,
                        alignContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: 10,
                        backgroundColor: 'pink',
                    }}
                >
                    {divs.map((div, index) => (
                        <div
                            key={index}
                            onClick={() => handleDivClick(index)}
                            style={{
                                backgroundColor:
                                    activeIndex === index
                                        ? div.color
                                        : '#0091FF',

                                cursor: 'pointer',
                                width: '100%',
                                alignContent: 'center',
                                alignItems: 'center',
                                height: 40,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <button
                                style={{
                                    // backgroundColor: 'blue',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: 20,
                                }}
                                onClick={handleListFriend}
                            >
                                <BsPersonLinesFill size="2rem" />
                            </button>
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        width: '100%',
                        height: 40,
                        alignContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: 10,
                    }}
                >
                    {divs.map((div, index) => (
                        <div
                            key={index}
                            onClick={() => handleDivClick(index)}
                            style={{
                                backgroundColor:
                                    activeIndex === index
                                        ? div.color
                                        : '#0091FF',

                                cursor: 'pointer',
                                width: '100%',
                                alignContent: 'center',
                                alignItems: 'center',
                                height: 40,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <button
                                style={{
                                    // backgroundColor: 'blue',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: 20,
                                }}
                                onClick={handleCloud}
                            >
                                <CiCloudOn size="2.2rem" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div
                style={{
                    backgroundColor: '#0091FF',
                    border: 'none',
                    color: 'white',
                    fontSize: 20,
                    marginBottom: 20,
                    cursor: 'pointer',
                }}
                onClick={() => {
                    setOpen(!open)
                }}
            >
                {' '}
                <IoSettingsOutline size="1.5rem" />
            </div>
            {open && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '7%',
                        left: '2.5%',
                        background: 'whitesmoke',
                        height: '15rem',
                        width: '13rem',
                        borderRadius: 5,
                    }}
                >
                    {/* code here */}
                    <div >
                        <div
                            style={{
                                width: '100%',
                                height: 30,
                                display: 'flex',
                                gap: 10,
                                marginLeft: 10,
                                marginTop: 10,
                                cursor:"pointer"
                            }}
                            onClick={() => {
                                setOpenInfoMe(!openInfoMe)
                            }}
                        >
                            <IoPersonOutline size="1.5rem" />
                            <label
                                style={{
                                    color: 'black',
                                    fontSize: 15,
                                    cursor:"pointer"
                                }}
                            >
                                Thông tin tài khoản
                            </label>
                        </div>
                        {openInfoMe && (
                            <Popup
                                content={
                                    <>
                                    <AddPopupInfoMe user={user} />
                                    </>
                              
                                }
                                handleClose={() => {
                                    setOpenInfoMe(!openInfoMe)
                                }}
                            />
                        )}
                        <div
                            style={{
                                width: '90%',
                                height: 30,
                                display: 'flex',
                                gap: 10,
                                marginLeft: 10,
                                cursor:"pointer",
                                borderBottom: '1px solid lightgrey',
                                
                                
                            }}
                            onClick={() => {
                                setOpenSetting(!openSetting)
                            }}
                        >
                            <IoSettingsOutline size="1.5rem" />
                            <label
                                style={{
                                    color: 'black',
                                    fontSize: 15,
                                    cursor:"pointer"
                                }}
                            >
                                Cài đặt
                            </label>
                        </div>
                        {openSetting && (
                            <PopupSetting
                                content={<AddPupopSetting />}
                                handleClose={() => {
                                    setOpenSetting(!openSetting)
                                }}
                            />
                        )}
                        <div
                            style={{
                                width: '100%',
                                height: 30,
                                display: 'flex',
                                gap: 10,
                                marginTop: 10,
                                marginLeft: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: '80%',
                                    height: 30,
                                    display: 'flex',
                                    gap: 10,
                                }}
                            >
                                <FiDatabase size="1.5rem" />
                                <label
                                    style={{
                                        color: 'black',
                                        fontSize: 15,
                                    }}
                                >
                                    Dữ liệu
                                </label>
                            </div>
                            <IoIosArrowForward size="1rem" />
                        </div>
                        <div
                            style={{
                                width: '100%',
                                height: 30,
                                display: 'flex',
                                gap: 10,
                                marginLeft: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: '80%',
                                    height: 30,
                                    display: 'flex',
                                    gap: 10,
                                }}
                            >
                                <FiTool size="1.5rem" />
                                <label
                                    style={{
                                        color: 'black',
                                        fontSize: 15,
                                    }}
                                >
                                    Công cụ
                                </label>
                            </div>
                            <IoIosArrowForward size="1rem" />
                        </div>
                        <div
                            style={{
                                width: '100%',
                                height: 30,
                                display: 'flex',
                                gap: 10,
                                marginLeft: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: '80%',
                                    height: 30,
                                    display: 'flex',
                                    gap: 10,
                                }}
                            >
                                <MdOutlineLanguage size="1.4rem" />
                                <label
                                    style={{
                                        color: 'black',
                                        fontSize: 15,
                                    }}
                                >
                                    Ngôn ngữ
                                </label>
                            </div>
                            <IoIosArrowForward size="1rem" />
                        </div>
                        <div
                            style={{
                                width: '91.5%',
                                height: 30,
                                display: 'flex',
                                gap: 10,
                                marginLeft: 10,
                                borderBottom: '1px solid lightgrey',
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: 30,
                                    display: 'flex',
                                    gap: 10,
                                    
                                }}
                            >
                                <IoIosInformationCircleOutline size="1.5rem" />
                                <label
                                    style={{
                                        color: 'black',
                                        fontSize: 15,
                                    }}
                                >
                                    Giới thiệu
                                </label>
                            </div>
                            <IoIosArrowForward size="1rem" />
                        </div>

                        <div
                            style={{
                                width: '100%',
                                height: 30,
                                display: 'flex',
                                gap: 10,
                                marginLeft: 40,
                                marginTop: 10,
                                // borderTop: '1px solid lightgrey'
                            }}
                        >
                            <label
                                style={{
                                    color: 'black',
                                    fontSize: 15,
                                    color: 'red',
                                }}
                            >
                                {/* Đăng xuất */}
                                <a
                                    href="http://localhost:3000/login"
                                    style={{
                                        textDecoration: 'none',
                                    }}
                                >
                                    Đăng xuất
                                </a>
                            </label>
                        </div>
                        
                    </div>
                </div>
            )}
        </div>
    )
}

export default SideBar