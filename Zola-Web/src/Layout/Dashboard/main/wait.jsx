import React from 'react'
// import zola from '../../../Assets/zola.png'
import image from '../../../Assets/image.png'
// import Lottie from '@lottiefiles/react-lottie'

const Wait = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        // backgroundColor: 'lightgrey',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '90%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // animation: 'spin 3s linear infinite' // Thêm dòng này
        }}
      >
        <img src={image} alt="" />
      </div>
      {/* <lottie-player
        src="https://lottie.host/90722bdc-4804-4647-b1d9-3f974a79b2cf/q4EdyqWklx.json"
        background="Transparent"
        speed="1"
        style={{ width: '100%', height: '100%' }}
        direction="1"
        mode="normal"
        loop
        autoplay
      ></lottie-player> */}
    </div>
  )
}
export default Wait
