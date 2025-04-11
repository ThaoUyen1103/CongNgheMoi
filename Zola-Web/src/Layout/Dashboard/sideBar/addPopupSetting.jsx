import React, { useState } from 'react'
import { AiOutlineEdit } from 'react-icons/ai'
import { IoSettingsOutline } from 'react-icons/io5'
import { IoLockClosedOutline } from 'react-icons/io5'
import { IoSyncSharp } from 'react-icons/io5'
import { GoDatabase } from 'react-icons/go'
import { FiEdit } from 'react-icons/fi'
import { IoMdNotificationsOutline } from 'react-icons/io'
import { LiaFacebookMessenger } from 'react-icons/lia'
import { PiPhoneCallLight } from 'react-icons/pi'
import { PiCompassToolDuotone } from 'react-icons/pi'
import { SiTraefikproxy } from 'react-icons/si'
import GeneralSetting from './Settings/generalSetting'
import Privacy from './Settings/privacy'

const AddPupopSetting = () => {
  const [openSetting, setOpenSetting] = useState(false)
  const [openGeneralSetting, setOpenGeneralSetting] = useState(false)
  const [openPrivacy, setOpenPrivacy] = useState(false)
  const [openSync, setOpenSync] = useState(false)
  const [openData, setOpenData] = useState(false)
  const [openTheme, setOpenTheme] = useState(false)
  const [openNotification, setOpenNotification] = useState(false)
  const [openMessage, setOpenMessage] = useState(false)
  const [openCall, setOpenCall] = useState(false)
  const [openTool, setOpenTool] = useState(false)
  const [openProxy, setOpenProxy] = useState(false)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '38%',
          height: '100%',
          borderRight: '1px solid #dcd9d9'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '10%',
            display: 'flex'
          }}
        >
          <label
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: '#000',
              marginLeft: 20,
              marginTop: 20
            }}
          >
            Cài đặt
          </label>
        </div>
        <div
          style={{
            width: '100%',
            height: '7%',
            display: 'flex'
          }}
          onClick={() => {
            setOpenGeneralSetting(!openGeneralSetting)
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              marginLeft: 20,
              marginTop: 20
            }}
          >
            <IoSettingsOutline size="1.1rem" />
            <label
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 10
              }}
            >
              Cài đặt chung
            </label>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            height: '7%',
            display: 'flex'
          }}
          onClick={() => {
            setOpenPrivacy(!openPrivacy)
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              marginLeft: 20,
              marginTop: 20,
              cursor:"pointer"
            }}
          >
            <IoLockClosedOutline size="1.1rem" />
            <label
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 10,
                cursor:"pointer"
              }}
            >
              Riêng tư & bảo mật
            </label>
          </div>
        </div>
        <div
          style={{
            width: '100%',
            height: '7%',
            display: 'flex'
          }}
          onClick={() => {
            setOpenSync(!openSync)
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              marginLeft: 20,
              marginTop: 20
            }}
          >
            <IoSyncSharp size="1.1rem" />
            <label
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 10
              }}
            >
              Đồng bộ tin nhắn
            </label>
          </div>
        </div>
        <div
          style={{
            width: '100%',
            height: '7%',
            display: 'flex'
          }}
          onClick={() => {
            setOpenData(!openData)
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              marginLeft: 20,
              marginTop: 20
            }}
          >
            <GoDatabase size="1.1rem" />
            <label
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 10
              }}
            >
              Quản lý dữ liệu
            </label>
          </div>
        </div>
        <div
          style={{
            width: '100%',
            height: '7%',
            display: 'flex'
          }}
          onClick={() => {
            setOpenTheme(!openTheme)
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              marginLeft: 20,
              marginTop: 20
            }}
          >
            <FiEdit size="1.1rem" />
            <label
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 10
              }}
            >
              Giao diện
            </label>
          </div>
        </div>
        <div
          style={{
            width: '100%',
            height: '7%',
            display: 'flex'
          }}
          onClick={() => {
            setOpenNotification(!openNotification)
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              marginLeft: 20,
              marginTop: 20
            }}
          >
            <IoMdNotificationsOutline size="1.1rem" />
            <label
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 10
              }}
            >
              Thông báo
            </label>
          </div>
        </div>
        <div
          style={{
            width: '100%',
            height: '7%',
            display: 'flex'
          }}
          onClick={() => {
            setOpenMessage(!openMessage)
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              marginLeft: 20,
              marginTop: 20
            }}
          >
            <LiaFacebookMessenger size="1.1rem" />
            <label
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 10
              }}
            >
              Tin nhắn
            </label>
          </div>
        </div>
        <div
          style={{
            width: '100%',
            height: '7%',
            display: 'flex'
          }}
          onClick={() => {
            setOpenCall(!openCall)
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              marginLeft: 20,
              marginTop: 20
            }}
          >
            <PiPhoneCallLight size="1.1rem" />
            <label
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 10
              }}
            >
              Cài đặt cuộc gọi
            </label>
          </div>
        </div>
        <div
          style={{
            width: '100%',
            height: '7%',
            display: 'flex'
          }}
          onClick={() => {
            setOpenTool(!openTool)
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              marginLeft: 20,
              marginTop: 20
            }}
          >
            <PiCompassToolDuotone size="1.1rem" />
            <label
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 10
              }}
            >
              Tiện ích
            </label>
          </div>
        </div>
        <div
          style={{
            width: '100%',
            height: '7%',
            display: 'flex'
          }}
          onClick={() => {
            setOpenProxy(!openProxy)
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              marginLeft: 20,
              marginTop: 20
            }}
          >
            <SiTraefikproxy size="1.1rem" />
            <label
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 10
              }}
            >
              Cấu hình Proxy
            </label>
          </div>
        </div>
      </div>
      <div
        style={{
          width: '62%',
          height: '100%',
          marginTop: '45px'
        }}
      >
        {/* {openGeneralSetting && <GeneralSetting />} */}
        {openPrivacy && <Privacy />}
      </div>
    </div>
  )
}
export default AddPupopSetting
