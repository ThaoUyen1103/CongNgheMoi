import React, { useState } from 'react'
import '../../../Login/Receiveotp.css'
const PopupBeFriend = (props) => {
    const [OpenBeFriend, setOpenBeFriend] = useState(false)
    const openPopup = (props) => {
        setOpenBeFriend(true)
    }
    const closePopup = () => {
        setOpenBeFriend(!OpenBeFriend)
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
                    width: '25%',
                    height: '60%',
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
                        padding: '0px 5px 0px 0px',
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
export default PopupBeFriend
