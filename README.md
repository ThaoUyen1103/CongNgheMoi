Nhóm 6 Môn: Công nghệ mới trong phát triển ứng dụng CNTT
Cách run:
Các thư mục: npm install ròi chạy npm start
Riêng Mobile: 
npm install @react-navigation/native @react-navigation/stack expo-image-picker expo-document-picker expo-video socket.io-client react-native-vector-icons @react-native-async-storage/async-storage
npx expo install expo-image-picker expo-document-picker expo-av
npx expo start

Tạo folder config/db trong thư mục gốc của web, mobile, backend.
Tạo file .env biến môi trường kết nối AWS và MongoDB bao gồm: 
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=your-region
AWS_BUCKET_NAME=your-bucket-name
MongoDB: Link nếu có hoặc cấu hình trực tiếp trong file db thư mục config

Test socket khởi chạy New_Socket
