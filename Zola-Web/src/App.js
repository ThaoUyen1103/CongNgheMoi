import './App.css'
import { Login } from './Layout/Login/Login'
import { Register } from './Layout/Login/Register'
import DashBoard from './Layout/Dashboard/index'
import ListFriend from './Layout/listFriend'
import PhoneSignin from './Layout/FireBase/phoneSignin'
import Phone2 from './Layout/FireBase/phone2'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Receiveotp from './Layout/Login/Receiveotp'
import Sendotp from './Layout/Login/Sendotp'
import Cloud from './Layout/Cloud'

import Forgot from './Layout/Login/Forgotpassword'
import Forgotpassword from './Layout/Login/Forgotpassword'
import Resetpassword from './Layout/Login/Resetpassword'
import Navigation from './Layout/Navigation/navigation'

function App() {
  return (
    <div>
      <Navigation />
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/register" />} />

          {/* <Route path="*" element={<Navigate to="/register" />} /> */}
          <Route path="/register" element={<Register />} />
          <Route path="/receiveotp" element={<Receiveotp />} />

          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/listfriend" element={<ListFriend />} />
          <Route path="/phonesignin" element={<PhoneSignin />} />
          <Route path="/phone" element={<Phone2 />} />
          <Route path="/sendotp" element={<Sendotp />} />
          <Route path="/cloud" element={<Cloud />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          <Route path="/resetpassword" element={<Resetpassword />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
