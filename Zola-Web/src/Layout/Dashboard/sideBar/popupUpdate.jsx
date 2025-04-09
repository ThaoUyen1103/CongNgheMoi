import React, { useState } from 'react'
const PopupUpdate = (props) => {
    const [openUpdate, setOpenUpdate] = useState(false)
    const openPopup = (props) => {
        setOpenUpdate(true)
    }
    const closePopup = () => {
        setOpenUpdate(!openUpdate)
    }
    return (
        <div
            style={{
                position: 'fixed',
                top: '0%',
                left: '0%',
                display: 'flex',

                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100%',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '26%',
                    height: '70%',
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
export default PopupUpdate
