import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ZaloLogin from './screens/login';
import ZaloRegistration from './screens/register';
import OtpVerification from './screens/otpVerification';
import ForgotPassword from './screens/ForgotPassword'; // THÊM IMPORT NÀY
// import OtpResetPassword from './screens/otpResetPassword'; // Placeholder cho bước tiếp theo
import ZaloPCLayout from './layoutChat/ZaloPCLayout';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleRegisterSuccess = () => {
    console.log('Đăng ký thành công (cần qua bước OTP), chuyển về trang đăng nhập.');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/app" replace />
              ) : (
                <ZaloLogin onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          
          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate to="/app" replace />
              ) : (
                <ZaloRegistration onRegisterSuccess={handleRegisterSuccess} /> 
              )
            }
          />

          <Route
            path="/otp-verification"
            element={
              isLoggedIn ? (
                <Navigate to="/app" replace />
              ) : (
                <OtpVerification /> 
              )
            }
          />

          {/* THÊM ROUTE CHO QUÊN MẬT KHẨU */}
          <Route
            path="/forgot-password"
            element={
              isLoggedIn ? (
                <Navigate to="/app" replace /> 
              ) : (
                <ForgotPassword />
              )
            }
          />
          
          {/* ROUTE PLACEHOLDER CHO OTP ĐẶT LẠI MẬT KHẨU */}
          {/*
          <Route
            path="/otp-reset-password"
            element={
              isLoggedIn ? (
                <Navigate to="/app" replace />
              ) : (
                // <OtpResetPassword /> // Bạn sẽ tạo component này ở bước tiếp theo
                <div>Trang Nhập OTP Để Đặt Lại Mật Khẩu (sẽ được tạo)</div>
              )
            }
          />
          */}

          <Route
            path="/app"
            element={
              isLoggedIn ? (
                <ZaloPCLayout />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? "/app" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;