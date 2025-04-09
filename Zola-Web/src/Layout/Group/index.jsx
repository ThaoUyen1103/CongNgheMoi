import Main from './main'
import SideBar from './sideBar'
import SubSideBar from './subSideBar'

const Group = () => {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row'
      }}
    >
      <SideBar />
      <SubSideBar />
      <Main />
    </div>
  )
}

export default Group
