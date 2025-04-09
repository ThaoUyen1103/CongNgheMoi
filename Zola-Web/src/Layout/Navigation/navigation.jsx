import { Login } from '../Login/Login'
import { Register } from '../Login/Register'
import DashBoard from '../Dashboard/index'
import ListFriend from '../listFriend/index'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Cloud from '../Cloud/index'
import FriendRequest from '../FriendRequest/index'
import TeamList from '../TeamList/index'
import Main from '../Dashboard/main'
import DashBoardWait from '../Dashboard/indexwait'

const Navigation = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<DashBoard />} />
                <Route path="/listFriend" element={<ListFriend />} />
                <Route path="/cloud" element={<Cloud />} />
                <Route path="/requestlist" element={<FriendRequest />} />

                <Route path="/teamlist" element={<TeamList />} />
                <Route path="/dashboardwait" element={<DashBoardWait />} />
            </Routes>
        </Router>
    )
}

export default Navigation
