import React, { useState } from 'react'
const PopupSearch = (props) => {
    const [openSearch, setOpenSearch] = useState(false)
    const openPopup = (props) => {
        setOpenSearch(true)
    }
    const closePopup = () => {
        setOpenSearch(!openSearch)
    }
    return (
        <div
            style={{
                position: 'fixed',
                top: '0%',
                left: '0%',
                display: 'flex',

                // justifyContent: 'center',
                // alignItems: 'center',
                height: '100vh',
                width: '100%',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '19%',
                    height: '100%',
                    background: 'white',
                    padding: '0px',

                    marginLeft: '4.5%',
                    marginTop: '4%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {props.content}
            </div>
        </div>
    )
}
export default PopupSearch
