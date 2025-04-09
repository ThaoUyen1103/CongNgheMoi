import React, { useState } from 'react'
const PopupYou = (props) => {
  const [openInfoYou, setOpenInfoYou] = useState(false)
  const openPopup = (props) => {
    setOpenInfoYou(true)
  }
  const closePopup = () => {
    setOpenInfoYou(!openInfoYou)
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
        width: '100%'
      }}
      onClick={props.handleClose}
    >
      <div
        style={{
          position: 'relative',
          width: '25%',
          height: '95%',
          background: 'white',
          padding: '0px',
          borderRadius: '10px'
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

            backgroundColor: 'white'
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
export default PopupYou
