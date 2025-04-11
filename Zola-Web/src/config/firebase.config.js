// firebase.config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyBrMqKUL1Ic_yyWMIhKwMF0VP13QznDQvs',
    authDomain: 'zola-app-7dc37.firebaseapp.com',
    projectId: 'zola-app-7dc37',
    storageBucket: 'zola-app-7dc37.firebasestorage.app',
    messagingSenderId: '226712242308',
    appId: '1:226712242308:web:a3b48942dbe9aae8271ad1',
    measurementId: 'G-0T5TKLF35S',
}
// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
        // Kiểm tra nếu chưa khởi tạo
        window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            'recaptcha-container',
            {
                size: 'invisible',
            },
        )
    }
}

// Hàm gửi OTP
const sendOTP = async (phoneNumber) => {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            'recaptcha-container',
            {
                size: 'invisible',
            },
        )
    }

    const appVerifier = window.recaptchaVerifier
    const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier,
    )
    return confirmationResult // 👈 TRẢ VỀ để component sử dụng
}

// Xác thực OTP từ confirmationResult
const verifyOTP = (confirmationResult, otp) => {
    return confirmationResult.confirm(otp)
}

export { auth, sendOTP, verifyOTP }
