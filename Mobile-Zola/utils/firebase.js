// utils/firebase.js
import firebase from '@react-native-firebase/app';

// OPTIONAL: nếu muốn kiểm tra app có được init không
if (firebase.apps.length === 0) {
  console.log('Chưa có Firebase App nào được khởi tạo');
} else {
  console.log('Firebase App đã sẵn sàng:', firebase.apps);
}

export default firebase;
