# Nhóm 6 - Môn: Công nghệ mới trong phát triển ứng dụng CNTT

## Hướng dẫn chạy dự án

### 1. Cài đặt chung (Web, Mobile, Backend)

Tại mỗi thư mục tương ứng (`web/`, `socket/`, `backend/`):

```bash
npm install
npm start
```

---

### 2. Đối với Mobile (React Native - sử dụng Expo)

Cài đặt các package cần thiết:

```bash
npm install @react-navigation/native @react-navigation/stack expo-image-picker expo-document-picker expo-video socket.io-client react-native-vector-icons @react-native-async-storage/async-storage
```

Cài đặt các dependencies bằng Expo:

```bash
npx expo install expo-image-picker expo-document-picker expo-av
```

Khởi chạy app mobile:

```bash
npx expo start
```

---

### 3. Cấu hình môi trường

Tạo folder `config/db` trong **thư mục gốc** của từng phần: `web/`, `mobile/`, `backend/`.

Tạo file `.env` chứa các biến môi trường cần thiết:

```
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=your-region
AWS_BUCKET_NAME=your-bucket-name
```

#### MongoDB

- Có thể sử dụng **link MongoDB Atlas** nếu có.
- Hoặc cấu hình **trực tiếp trong file `config/db/index.js`** (hoặc tương đương).

---

### 4. Test Socket

Để test chức năng socket, **khởi chạy module `New_Socket`**.

(Chi tiết file hoặc command khởi chạy  cd `New_Socket` 
```
npm start
```
---

## Ghi chú

- Đảm bảo mọi file `.env` không bị commit lên Git.
- Sử dụng Node.js phiên bản ổn định.
