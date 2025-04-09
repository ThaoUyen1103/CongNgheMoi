// firebase.config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJRLTZyy-bPtHg9IKiwViwfQvVCTVG1Ns",
    authDomain: "zola-95ff6.firebaseapp.com",
    projectId: "zola-95ff6",
    storageBucket: "zola-95ff6.firebasestorage.app",
    messagingSenderId: "244275166168",
    appId: "1:244275166168:web:9fbbe693a82e12df0890ad",
    measurementId: "G-ESYLGKZX90"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) { // Kiểm tra nếu chưa khởi tạo
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
        });
    }
};


// Hàm gửi OTP
const sendOTP = async (phoneNumber) => {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
        });
    }

    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult; // 👈 TRẢ VỀ để component sử dụng
};

// Xác thực OTP từ confirmationResult
const verifyOTP = (confirmationResult, otp) => {
    return confirmationResult.confirm(otp);
};

export { auth, sendOTP, verifyOTP };
