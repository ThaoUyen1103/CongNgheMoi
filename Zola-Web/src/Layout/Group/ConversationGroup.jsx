import React from 'react'
import { ImCircleUp } from 'react-icons/im'
import { ImCircleDown } from 'react-icons/im'
import { BsStopwatch } from 'react-icons/bs'
import { BsPeople } from 'react-icons/bs'
import { CiBellOn } from 'react-icons/ci'
import { TfiPinAlt } from 'react-icons/tfi'
import { AiOutlineEdit } from 'react-icons/ai'
import { IoSettingsOutline } from 'react-icons/io5'
const ConversationGroup = () => {
    const [isPhotoVidOpen, setPhotoVidOpen] = React.useState(true)
    const [isFileOpen, setFileOpen] = React.useState(true)
    const [isLinkOpen, setLinkOpen] = React.useState(true)
    return (
        <div
            style={{
                width: '33%',
                height: '100%',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
            }}
        >
            <label
                style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginTop: 20,
                }}
            >
                Thông tin hội thoại
            </label>

            <div>
                <img
                    src="https://www.w3schools.com/howto/img_avatar.png"
                    alt="demo"
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 100,
                        backgroundColor: 'grey',
                        marginTop: 15,
                    }}
                />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                <label
                    style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                    }}
                >
                    Nhóm 8
                </label>
                <label
                    style={{
                        width: 25,
                        height: 25,
                        borderRadius: 100,
                        backgroundColor: 'whitesmoke',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <AiOutlineEdit size="1.3rem" />
                </label>
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    gap: 20,
                    padding: 15,
                    width: '80%',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            width: 33,
                            height: 33,
                            borderRadius: 100,
                            backgroundColor: 'whitesmoke',
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                        }}
                    >
                        <CiBellOn size="1.3rem" />
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            color: 'grey',
                            flexDirection: 'column',
                            alignContent: 'center',
                        }}
                    >
                        <label>Tắt thông báo</label>
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',

                        alignContent: 'center',
                    }}
                >
                    <div
                        style={{
                            width: 33,
                            height: 33,
                            borderRadius: 100,
                            backgroundColor: 'whitesmoke',
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                        }}
                    >
                        <TfiPinAlt size="1.2rem" />
                    </div>
                    <label
                        style={{
                            fontSize: 12,
                            color: 'grey',
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            alignContent: 'center',
                        }}
                    >
                        Ghim hội thoại
                    </label>
                </div>
                <div
                    style={{
                        display: 'flex',

                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            width: 33,
                            height: 33,
                            borderRadius: 100,
                            backgroundColor: 'whitesmoke',
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                        }}
                    >
                        <BsPeople size="1.2rem" />
                    </div>
                    <label
                        style={{
                            fontSize: 12,
                            color: 'grey',
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            alignContent: 'center',
                        }}
                    >
                        Thêm thành viên
                    </label>
                </div>
                <div
                    style={{
                        display: 'flex',

                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            width: 33,
                            height: 33,
                            borderRadius: 100,
                            backgroundColor: 'whitesmoke',
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                        }}
                    >
                        <IoSettingsOutline size="1.2rem" />
                    </div>
                    <label
                        style={{
                            fontSize: 12,
                            color: 'grey',
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            alignContent: 'center',
                        }}
                    >
                        Quản lý nhóm
                    </label>
                </div>
            </div>
            <div
                style={{
                    width: '100%',
                    borderBottomWidth: 5,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'whitesmoke',
                }}
            ></div>
            <div
                style={{
                    flex: 'row',
                    width: '100%',
                }}
            >
                <label
                    style={{
                        paddingLeft: 10,
                    }}
                >
                    <BsPeople size="1.3rem" />
                </label>
                <label
                    style={{
                        paddingLeft: 10,
                    }}
                >
                    "M" thành viên
                </label>
            </div>
            <div
                style={{
                    flex: 'row',
                    width: '100%',
                    borderBottomWidth: 5,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'whitesmoke',
                    gap: 10,
                }}
            >
                <label
                    style={{
                        paddingLeft: 10,
                    }}
                >
                    <BsPeople size="1.3rem" />
                </label>
                <label
                    style={{
                        paddingLeft: 10,
                    }}
                >
                    Link tham gia nhóm
                </label>
            </div>
            <div
                style={{
                    width: '100%',
                    borderBottomWidth: 5,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'whitesmoke',
                }}
            ></div>
            <div
                style={{
                    flex: 'row',
                    width: '100%',
                }}
            >
                <label
                    style={{
                        paddingLeft: 10,
                    }}
                >
                    <BsStopwatch size="1.3rem" />
                </label>
                <label
                    style={{
                        paddingLeft: 10,
                    }}
                >
                    Danh sách nhắc hẹn
                </label>
            </div>
            <div
                style={{
                    flex: 'row',
                    width: '100%',
                    borderBottomWidth: 5,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'whitesmoke',
                    gap: 10,
                }}
            >
                <label
                    style={{
                        paddingLeft: 10,
                    }}
                >
                    <BsPeople size="1.3rem" />
                </label>
                <label
                    style={{
                        paddingLeft: 10,
                    }}
                >
                    Ghi chú, ghim, bình chọn
                </label>
            </div>
            <div
                style={{
                    width: '100%',
                    borderBottomWidth: 5,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'whitesmoke',
                    display: 'flex',
                    gap: 10,
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        // padding: 10,
                    }}
                >
                    <label
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        Ảnh/Video11
                    </label>
                    {isPhotoVidOpen ? (
                        <label
                            onClick={() => {
                                setPhotoVidOpen(!isPhotoVidOpen)
                            }}
                        >
                            <ImCircleUp size="1rem" />
                        </label>
                    ) : (
                        <label
                            onClick={() => {
                                setPhotoVidOpen(!isPhotoVidOpen)
                            }}
                        >
                            <ImCircleDown size="1rem" />
                        </label>
                    )}
                </div>
                {isPhotoVidOpen && (
                    <div
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        {' '}
                        Danh sách ảnh và video
                    </div>
                )}
            </div>
            <div
                style={{
                    width: '100%',
                    borderBottomWidth: 5,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'whitesmoke',
                    display: 'flex',
                    gap: 10,
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    <label
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        File
                    </label>
                    {isFileOpen ? (
                        <label
                            onClick={() => {
                                setFileOpen(!isFileOpen)
                            }}
                        >
                            <ImCircleUp size="1rem" />
                        </label>
                    ) : (
                        <label
                            onClick={() => {
                                setFileOpen(!isFileOpen)
                            }}
                        >
                            <ImCircleDown size="1rem" />
                        </label>
                    )}
                </div>
                {isFileOpen && (
                    <div
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        Danh sách file
                    </div>
                )}
            </div>
            <div
                style={{
                    width: '100%',
                    borderBottomWidth: 5,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'whitesmoke',
                    display: 'flex',
                    gap: 10,
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    <label
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        Links
                    </label>
                    {isLinkOpen ? (
                        <label
                            onClick={() => {
                                setLinkOpen(!isLinkOpen)
                            }}
                        >
                            <ImCircleUp size="1rem" />
                        </label>
                    ) : (
                        <label
                            onClick={() => {
                                setLinkOpen(!isLinkOpen)
                            }}
                        >
                            <ImCircleDown size="1rem" />
                        </label>
                    )}
                </div>
                {isLinkOpen && (
                    <div
                        style={{
                            paddingLeft: 10,
                        }}
                    >
                        Danh sách link
                    </div>
                )}
            </div>
            <div></div>
        </div>
    )
}

export default ConversationGroup
