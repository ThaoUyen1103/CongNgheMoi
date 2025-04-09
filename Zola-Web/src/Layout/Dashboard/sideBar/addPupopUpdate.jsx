import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { LuUndo2 } from 'react-icons/lu'

const AddPupopUpdate = () => {
  // const [avatarImage, setAvatarImage] = useState('')
  const [open, setOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [gender, setGender] = useState('')
  const user_id = localStorage.getItem('user_id').replace(/"/g, '').trim()
  const formData = new FormData()
  // formData.append('image', avatarImage)
  formData.append('user_id', user_id)
  formData.append('userName', userName)
  formData.append('gender', gender)

  const handleGenderChange = (event) => {
    setGender(event.target.value)
  }
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const handleDayChange = (event) => {
    setDay(event.target.value)
  }
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const years = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - i
  )
  // lấy biến user_id từ localStorage

  const handleMonthChange = (event) => {
    setMonth(event.target.value)
  }
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [marginTop, setMarginTop] = useState(5)
  // hàm này sẽ chạy mỗi khi màn hình thay đổi kích thước
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (windowWidth <= 770) {
      setMarginTop(150)
    } else {
      setMarginTop(0)
    }
  }, [windowWidth])

  const handleYearChange = (event) => {
    setYear(event.target.value)
  }
  // viết sự kiện khi bấm nút sẽ xoá thông tin
  const handleDelete = (e) => {
    e.preventDefault()
    setUserName('')
    setGender('')
    setDay('')
    setMonth('')
    setYear('')
  }
  const handUpdate = (e) => {
    if (
      userName === '' ||
      gender === '' ||
      day === '' ||
      month === '' ||
      year === ''
    ) {
      toast.error('Vui lòng nhập đầy đủ thông tin!!!')
      return
    }

    let formattedMonth = month
    if (month >= 1 && month <= 9) {
      formattedMonth = '0' + month
    }

    const dateOfBirth = day + '/' + formattedMonth + '/' + year
    formData.append('dateOfBirth', dateOfBirth)
    axios
      .post('http://localhost:3001/user/updateUserWeb', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        toast.success('Cập nhật thông tin thành công!!!')
        handleDelete(e)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toaster toastOptions={{ duration: 3500 }} />
      <div
        style={{
          width: '100%',
          height: '8%',
          display: 'flex',
          marginTop: 15,

          borderBottom: '1px solid #e9e5e5',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <label
            style={{ fontSize: '17px', fontWeight: 'bold', marginLeft: 10 }}
          >
            Cập nhật thông tin cá nhân
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '6%',
          display: 'flex',
          marginTop: 15,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%%',
            height: '100%',
          }}
        >
          <label style={{ fontSize: '15px', marginLeft: 15 }}>
            Tên hiển thị
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '6%',
          display: 'flex',
        }}
      >
        <input
          style={{
            width: '90%',
            height: '100%',
            marginLeft: 15,
            borderRadius: 5,
            border: '1px solid #e9e5e5',
          }}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <div
        style={{
          width: '100%',
          height: '6%',
          display: 'flex',
          marginTop: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%%',
            height: '100%',
            marginTop: 5,
          }}
        >
          <label
            style={{ fontSize: '15px', fontWeight: 'bold', marginLeft: 15 }}
          >
            Thông tin cá nhân
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '6%',
          display: 'flex',
          marginTop: 5,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%%',
            height: '100%',
            marginTop: 5,
            marginLeft: 15,
            // gap: 40,
            fontSize: '15px',
          }}
        >
          <label
            style={{
              width: 70,
            }}
          >
            <input
              type="radio"
              value="Nam"
              checked={gender === 'Nam'}
              onChange={handleGenderChange}
              marginRight={10}
            />
            Nam
          </label>
          <label
            style={{
              width: 70,
            }}
          >
            <input
              type="radio"
              value="Nữ"
              checked={gender === 'Nữ'}
              onChange={handleGenderChange}
              marginRight={10}
            />
            Nữ
          </label>
          {/* // thêm 1 input chọn hình ảnh avatar chỉ cho nhập file ảnh */}
          {/* <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarImage(e.target.files[0])}
          /> */}
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '6%',
          display: 'flex',
          marginTop: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%%',
            height: '100%',
            marginTop: 5,
          }}
        >
          <label style={{ fontSize: '15px', marginLeft: 15 }}>Ngày sinh</label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '7%',
          display: 'flex',
          marginTop: 5,
          marginLeft: 15,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%%',
            height: '100%',
            gap: 40,
            flexWrap: 'wrap',
          }}
        >
          <select value={day} onChange={handleDayChange}>
            <option value="">Chọn ngày</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select value={month} onChange={handleMonthChange}>
            <option value="">Chọn tháng</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select value={year} onChange={handleYearChange}>
            <option value="">Chọn năm</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '10%',
          display: 'flex',
          marginTop: '31%',
          // borderTop: '1px solid #e9e5e5',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%%',
            height: '90%',
            gap: 20,
            // marginLeft: 158,
            // marginTop: 5,
            marginTop: `${marginTop}px`,
            marginRight: 10,
            borderRadius: 5,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              borderRadius: 5,
              backgroundColor: 'lightgray',
            }}
          >
            <button
              style={{
                // width: '100%',
                width: '100px',
                height: '100%',
                backgroundColor: 'lightgray',
                color: 'black',
                fontSize: '15px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={(e) => handleDelete(e)}
            >
              Xoá thông tin
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              borderRadius: 5,
              backgroundColor: 'lightblue',
            }}
          >
            <button
              style={{
                // width: '100%',
                width: '100px',
                height: '100%',
                backgroundColor: 'blue',
                color: 'white',
                fontSize: '15px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={(e) => handUpdate(e)}
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AddPupopUpdate
