import React, { useState } from 'react'
const PopupSetting = (props) => {
    const [openSetting, setOpenSetting] = useState(false)
    const openPopup = (props) => {
        setOpenSetting(true)
    }
    const closePopup = () => {
        setOpenSetting(!openSetting)
    }
    return (
        <div
            style={{
                position: 'fixed',
                top: '0%',
                left: '0%',
                display: 'flex',
                background: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100%',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '38%',
                    height: '78%',
                    background: 'white',
                    padding: '0px',
                    borderRadius: '10px',
                }}
            >
                <span
                    style={{
                        position: 'absolute',
                        top: '1px',
                        right: '5px',
                        cursor: 'pointer',
                        fontSize: '22px',
                        color: 'black',
                        padding: '5px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                    }}
                    onClick={props.handleClose}
                >
                    X
                </span>
                {props.content}
            </div>
        </div>
    )
}
export default PopupSetting
