import React from 'react'
import ConversationCloud from './ConversationCloud'
import { BsCodeSquare } from 'react-icons/bs'

import { MdOutlineAddReaction } from 'react-icons/md'
import { ImAttachment } from 'react-icons/im'
import { CiSearch } from 'react-icons/ci'
import cloud from '../../Assets/cloud.png'
import { LuSticker } from 'react-icons/lu'
import { TbCapture } from 'react-icons/tb'
import { TiBusinessCard } from 'react-icons/ti'
import { LuAlarmClock } from 'react-icons/lu'
import { SlLike } from 'react-icons/sl'
import { SlPicture } from 'react-icons/sl'
import { MdFormatColorText } from 'react-icons/md'
import { MdOutlineAssignmentTurnedIn } from 'react-icons/md'
import { MdOutlinePriorityHigh } from 'react-icons/md'
import { TbMessage2Bolt } from 'react-icons/tb'
import { FiAtSign } from 'react-icons/fi'
import SubSideBar from '../Dashboard/subSideBar/index'

const MainCloud = () => {
  const [openDrawer, setOpenDrawer] = React.useState(true)
  const [isSend, setSend] = React.useState(true)
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'lightgrey',
        display: 'flex'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div
          style={{
            width: '100%',
            height: 70,
            backgroundColor: 'white',
            display: 'flex',
            // justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 15,
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <img
              src={cloud}
              alt="cloud"
              style={{
                margin: 10,
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'grey'
              }}
            />
            <label
              style={{
                fontSize: 18,
                fontWeight: 'bold'
              }}
            >
              Cloud của tôi
            </label>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 15,
              marginLeft: '60%'
            }}
          >
            <div>
              <CiSearch size="1.6rem" />
            </div>
            <div
              onClick={() => {
                setOpenDrawer(!openDrawer)
              }}
              style={{
                backgroundColor: openDrawer === true ? 'white' : 'white'
              }}
            >
              <BsCodeSquare size="1.6rem" />
            </div>
          </div>
        </div>
        <div></div>
        <div
          style={{
            width: '100%',
            height: '13%',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',

            alignItems: 'center'
          }}
        >
          <div
            style={{
              display: 'flex',
              marginTop: 5,
              alignContent: 'space-between',
              width: '100%',
              height: '40%',
              borderBottom: '1px solid lightgrey'
            }}
          >
            <div
              style={{
                marginLeft: 10,
                gap: 20,
                marginBottom: 5,
                display: 'flex',
                color: 'black'
              }}
            >
              <LuSticker size="1.4rem" />

              <SlPicture size="1.4rem" />

              <ImAttachment size="1.3rem" />
              <TbCapture size="1.4rem" />
              <TiBusinessCard size="1.4rem" />
              <LuAlarmClock size="1.4rem" />
              <MdOutlineAssignmentTurnedIn size="1.4rem" />
              <MdFormatColorText size="1.4rem" />
              <MdOutlinePriorityHigh size="1.4rem" />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 2,
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginRight: 10
            }}
          >
            <input
              style={{
                width: '85%',
                height: '85%',
                alignItems: 'center',
                backgroundColor: 'white',
                borderStyle: 'none',
                border: 'none',
                outline: 'none',
                marginLeft: 10
              }}
              type="tin nhan"
              placeholder="Nhập @, tin nhắn tới  "
            />
            <TbMessage2Bolt size="1.3rem" />
            <MdOutlineAddReaction size="1.3rem" />
            <FiAtSign size="1.3rem" />

            {isSend ? (
              <label
                onClick={() => {
                  setSend(!isSend)
                }}
              >
                GỬI
              </label>
            ) : (
              <label
                onClick={() => {
                  setSend(!isSend)
                }}
              >
                <SlLike size="1.5rem" />
              </label>
            )}
          </div>
        </div>
      </div>
      {openDrawer === true && <ConversationCloud />}
    </div>
  )
}

export default MainCloud
