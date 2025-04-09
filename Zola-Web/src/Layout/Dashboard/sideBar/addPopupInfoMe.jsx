import React, { useState } from 'react'
import Popup from './popup'
import { AiOutlineEdit } from 'react-icons/ai'
import { CiCamera } from 'react-icons/ci'
import PopupUpdate from './popupUpdate'
import AddPupopUpdate from './addPupopUpdate'
import demo from '../../../Assets/demo.jpg'
import { useRef, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast, Toaster } from 'react-hot-toast'

const AddPopupInfoMe = ({ user }) => {
    const [avatarURL, setAvatarURL] = useState()

    const [openUpdate, setOpenUpdate] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const user_id = localStorage.getItem('user_id').replace(/"/g, '').trim()
    const didMountRef = useRef(false)
    const [userMe, setUser] = useState(user_id)

    const fetchUser = () => {
        // Hàm để fetch thông tin người dùng
        axios
            .post('http://localhost:3001/user/findUserByUserID', {
                user_id: user_id,
            })
            .then((response) => {
                if (response.data.message === 'Tìm user thành công!!!') {
                    localStorage.setItem(
                        'user',
                        JSON.stringify(response.data.user),
                    )
                    const user = JSON.parse(localStorage.getItem('user'))
                    setUser(user)
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }
    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true
            return
        }
        fetchUser()
    }, [refreshKey])

    // const user_id = localStorage.getItem('user_id').replace(/"/g, '').trim()

    // nếu mà có user thì mới thực hiện các cấu lệnh dưới

    // format ngày tháng năm sinh từ chuỗi String sang dạng Date
    const [day, month, year] = user.dateOfBirth.split('/')
    const dateOfBirth = new Date(`${month}/${day}/${year}`)
    const formattedDateOfBirth = `${dateOfBirth.getDate()} tháng ${
        dateOfBirth.getMonth() + 1
    }, ${dateOfBirth.getFullYear()}`
    // const formattedPhoneNumber = user.phoneNumber.replace(/^0/, '+84 ')

    // // tạo useEffect để set avatarURL ban đầu
    useEffect(() => {
        setAvatarURL(user.avatar)
    }, [user.avatar])

    // // Tạo một tham chiếu đến thẻ input
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

                // // tự động reload trang để cập nhật lại avatar
                // window.location.reload()
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
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: 30,
                    display: 'flex',
                    gap: 10,
                    marginLeft: 15,
                    marginTop: 10,
                }}
            >
                <label
                    style={{
                        color: 'black',
                        fontSize: 16,
                        fontWeight: 'bold',
                    }}
                >
                    Thông tin tài khoản
                </label>
            </div>
            <div
                style={{
                    width: '100%',
                    height: '30%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <img
                    src={demo}
                    alt="demo"
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'grey',
                        position: 'relative',
                    }}
                />
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
                            width: '5%',
                            height: '20%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <img
                            src={avatarURL}
                            alt="demo"
                            style={{
                                width: 70,
                                height: 70,
                                backgroundColor: 'grey',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '33%',
                                left: '5%',
                            }}
                        />
                        <label
                            style={{
                                width: 25,
                                height: 25,
                                borderRadius: 100,
                                backgroundColor: 'whitesmoke',
                                top: '43%',
                                left: '18%',
                                position: 'absolute',
                            }}
                            onClick={handleCameraClick}
                        >
                            <CiCamera size="1.3rem" />
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={inputRef}
                            onChange={handleFileChange}
                        />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            height: 30,
                            gap: 10,

                            marginTop: 10,
                        }}
                    >
                        <label
                            style={{
                                color: 'black',
                                fontSize: 17,
                                marginLeft: '20%',
                                fontWeight: 'bold',
                            }}
                        >
                            {user.userName}
                        </label>
                        <label
                            style={{
                                width: 25,
                                height: 25,
                                borderRadius: 100,

                                alignItems: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <AiOutlineEdit size="1.3rem" />
                        </label>
                    </div>
                </div>
            </div>
            <div
                style={{
                    width: '100%',
                    height: '30%',
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: '15%',
                }}
            >
                <div
                    style={{
                        flex: 'row',
                        width: '100%',
                        borderTopWidth: 5,
                        borderTopStyle: 'solid',
                        borderTopColor: 'whitesmoke',
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            paddingLeft: 10,
                            fontSize: 15,
                            color: 'black',
                            fontWeight: 'bold',
                            marginTop: 8,
                        }}
                    >
                        Thông tin cá nhân
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <label
                        style={{
                            paddingLeft: 10,
                            fontSize: 13,
                            color: 'grey',
                            marginTop: 10,
                        }}
                    >
                        Giới tính
                    </label>
                    <label
                        style={{
                            paddingLeft: 10,
                            fontSize: 14,
                            color: 'black',
                            marginTop: 10,
                            marginLeft: 35,
                        }}
                    >
                        {user.gender}
                    </label>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <label
                        style={{
                            paddingLeft: 10,
                            fontSize: 13,
                            color: 'grey',
                            marginTop: 10,
                        }}
                    >
                        Ngày sinh
                    </label>
                    <label
                        style={{
                            paddingLeft: 10,
                            fontSize: 14,
                            color: 'black',
                            marginTop: 10,
                            marginLeft: 25,
                        }}
                    >
                        {formattedDateOfBirth}
                    </label>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <label
                        style={{
                            paddingLeft: 10,
                            fontSize: 13,
                            color: 'grey',
                            marginTop: 10,
                        }}
                    >
                        Điện thoại
                    </label>
                    <label
                        style={{
                            paddingLeft: 10,
                            fontSize: 14,
                            color: 'black',
                            marginTop: 10,
                            marginLeft: 23,
                        }}
                    >
                        {/* {formattedPhoneNumber} */}
                        {user.phoneNumber}
                    </label>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <label
                        style={{
                            paddingLeft: 10,
                            fontSize: 13,
                            color: 'grey',
                            marginTop: 10,
                        }}
                    >
                        Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được
                        số này
                    </label>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                    }}
                    onClick={() => {
                        setOpenUpdate(!openUpdate)
                    }}
                >
                    <button
                        style={{
                            backgroundColor: 'white',
                            color: 'black',
                            border: '1px solid lightgrey',
                            borderRadius: 5,
                            width: '100%',
                            height: 43,
                            marginTop: 10,
                            marginBottom: 10,
                            display: 'flex',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            fontWeight: 'bold',
                            fontSize: 14,
                        }}
                    >
                        <label
                            style={{
                                width: 25,
                                height: 25,
                                borderRadius: 100,
                            }}
                        >
                            <AiOutlineEdit size="1.3rem" />
                        </label>
                        Cập nhật
                    </button>
                </div>
                {openUpdate && (
                    <PopupUpdate
                        content={<AddPupopUpdate />}
                        handleClose={() => {
                            setOpenUpdate(!openUpdate)
                        }}
                    />
                )}
            </div>
        </div>
    )
}

export default AddPopupInfoMe
