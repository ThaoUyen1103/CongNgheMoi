import React from 'react'
import { useState } from 'react'
const AddPupopSearch = () => {
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
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      Hi
    </div>
  )
}
export default AddPupopSearch
