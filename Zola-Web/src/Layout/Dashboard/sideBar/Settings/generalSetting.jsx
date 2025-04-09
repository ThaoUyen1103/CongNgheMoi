const GeneralSetting = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '7%',
          display: 'flex'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5,
            marginTop: 20
          }}
        >
          <label
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: '#000',
              marginLeft: 10
            }}
          >
            Danh bạ
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '7%',
          display: 'flex'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5,
            marginTop: 5
          }}
        >
          <label
            style={{
              fontSize: 13,

              color: 'grey',
              marginLeft: 10
            }}
          >
            Danh sách bạn bè được hiển thị trong danh bạ
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '6%',
          display: 'flex'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5
          }}
        >
          <label
            style={{
              fontSize: 14,

              color: '#000',
              marginLeft: 10
            }}
          >
            Hiển thị tất cả bạn bè
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '5%',
          display: 'flex',
          borderBottom: '1px solid #dcd9d9'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5
          }}
        >
          <label
            style={{
              fontSize: 14,

              color: '#000',
              marginLeft: 10
            }}
          >
            Chỉ hiển thị bạn bè đang sử dung Zola
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '6%',
          display: 'flex'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5,
            marginTop: 10
          }}
        >
          <label
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: '#000',
              marginLeft: 10
            }}
          >
            Ngôn ngữ (Language)
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '8%',
          display: 'flex',
          borderBottom: '1px solid #dcd9d9'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5,
            marginTop: 15
          }}
        >
          <label
            style={{
              fontSize: 14,

              color: '#000',
              marginLeft: 10
            }}
          >
            Thay đổi ngôn ngữ
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '6%',
          display: 'flex'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5,
            marginTop: 10
          }}
        >
          <label
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: '#000',
              marginLeft: 10
            }}
          >
            khởi động & ghi nhớ tài khoản
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '8%',
          display: 'flex'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5,
            marginTop: 15
          }}
        >
          <label
            style={{
              fontSize: 14,

              color: '#000',
              marginLeft: 10
            }}
          >
            Khởi động Zola khi mở máy
          </label>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '8%',
          display: 'flex',
          borderBottom: '1px solid #dcd9d9'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            marginLeft: 5,
            marginTop: 10
          }}
        >
          <label
            style={{
              fontSize: 14,

              color: '#000',
              marginLeft: 10
            }}
          >
            Ghi nhớ tài khoản đăng nhập
          </label>
        </div>
      </div>
    </div>
  )
}
export default GeneralSetting
