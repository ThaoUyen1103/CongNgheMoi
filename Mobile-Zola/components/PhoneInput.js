import {
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Alert,
} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import auth from '@react-native-firebase/auth';

import { url } from '../utils/constant';

const PhoneInput = ({ navigation, route }) => {
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const type = route.params.type;
    let oldPhoneNumber = '';
    if (route.params.oldPhoneNumber) oldPhoneNumber = route.params.oldPhoneNumber;

    console.log("Type:", type);

    const signUpPhoneNumber = async (phoneNumber) => {
        const apiUrl = `${url}/account/find-account-by-phone-number?phoneNumber=${phoneNumber}`;
        console.log("Calling API:", apiUrl);

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            console.log("API response:", data);

            const formattedPhoneNumber = '+84' + phoneNumber.substring(1);

            if (data.message === 'Account not found!!!') {
                if (type === 'register') {
                    console.log("Số điện thoại chưa có tài khoản -> Gửi OTP");
                    const confirm = await sendOTP(formattedPhoneNumber);
                    if (confirm) {
                        navigation.navigate('ConfirmCode', {
                            confirm,
                            phoneNumber,
                            type,
                            oldPhoneNumber,
                        });
                    }
                } else {
                    Alert.alert('Thông báo', 'Không tìm thấy tài khoản cho số điện thoại này');
                }

            } else if (response.status === 200) {
                if (type === 'register') {
                    Alert.alert('Thông báo', 'Số điện thoại đã tồn tại');
                } else {
                    console.log("Tài khoản tồn tại -> Gửi OTP quên mật khẩu");
                    const confirm = await sendOTP(formattedPhoneNumber);
                    if (confirm) {
                        navigation.navigate('ConfirmCode', {
                            confirm,
                            phoneNumber,
                            type,
                            oldPhoneNumber,
                        });
                    }
                }

            } else if (response.status === 400) {
                if (type === 'register') {
                    console.log("Số điện thoại chưa có tài khoản -> Gửi OTP (status 400)");
                    const confirm = await sendOTP(formattedPhoneNumber);
                    if (confirm) {
                        navigation.navigate('ConfirmCode', {
                            confirm,
                            phoneNumber,
                            type,
                            oldPhoneNumber,
                        });
                    }
                } else {
                    Alert.alert('Thông báo', 'Không tìm thấy tài khoản');
                }

            } else {
                console.warn("Lỗi không xác định:", data);
                Alert.alert('Lỗi', data.message || 'Đã xảy ra lỗi, vui lòng thử lại');
            }

        } catch (error) {
            console.error("Lỗi gọi API:", error);
            Alert.alert('Lỗi', 'Không thể kết nối tới máy chủ');
        }
    };



    const sendOTP = async (phoneNumber) => {
        try {
          const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
          console.log('OTP sent:', confirmation);
          // lưu `confirmation` để xác minh OTP sau này
        } catch (error) {
          console.error('Lỗi gửi OTP:', error);
        }
      };



    const testPhoneNumber = () => {
        if (!phoneNumber) {
            Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
            return;
        }
        const regexPhoneNumber = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!regexPhoneNumber.test(phoneNumber)) {
            Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
            return;
        }
        signUpPhoneNumber(phoneNumber); // <- Phải gọi hàm này
    };


    return (
        <SafeAreaView style={styles.screenWrap}>
            <SafeAreaView style={styles.container}>
                <View style={styles.textWrap}>
                    <Text style={styles.headerText}>Nhập số điện thoại</Text>
                    <Text style={styles.info}>
                        Để tiếp tục, vui lòng nhập số điện thoại của bạn. Chúng tôi sẽ gửi mã xác nhận đến số điện thoại của bạn. Hãy chắc chắn rằng bạn có thể truy cập vào số điện thoại này.
                    </Text>
                </View>
                <View style={styles.input}>
                    <Text style={styles.phoneText}>Nhập số điện thoại:</Text>
                    <TextInput
                        style={styles.phoneInput}
                        placeholder="e.g., 0123456789"
                        keyboardType="numeric"
                        onChangeText={(text) => {
                            const cleanText = text.replace(/[^0-9]/g, '');
                            setPhoneNumber(cleanText.startsWith('0') ? cleanText : '0' + cleanText);
                        }}
                        value={phoneNumber}
                    />
                </View>
                <View style={styles.buttonWrap}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            console.log('Button pressed');
                            testPhoneNumber(phoneNumber);
                        }}
                    >
                        <Text style={styles.buttonText}>Tiếp theo</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaView>
    );
};

export default PhoneInput;

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    screenWrap: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        height: windowHeight,
    },
    textWrap: {
        height: windowHeight * 0.3,
        width: '100%',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 30,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    info: {
        fontSize: 17,
        textAlign: 'center',
        marginTop: 50,
        marginHorizontal: 20,
        width: '80%',
        color: '#808080',
    },
    input: {
        height: windowHeight * 0.3,
    },
    phoneText: {
        marginTop: 50,
        fontSize: 17,
        marginBottom: 10,
    },
    phoneInput: {
        height: 40,
        borderColor: '#000',
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        fontSize: 17,
        width: windowWidth * 0.8,
    },
    buttonWrap: {
        width: '100%',
        height: windowHeight * 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    button: {
        backgroundColor: '#5D5AFE',
        width: windowWidth * 0.4,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
