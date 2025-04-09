import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Dimensions,
    TouchableOpacity,
    Alert,
    Modal,
} from 'react-native'
import React, { useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { url } from '../utils/constant'

const Register = ({ navigation, route }) => {
    const phoneNumber = route.params.phoneNumber

    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [isVisible, setIsVisible] = React.useState(false)

    const radioButtons = useMemo(
        () => [
            {
                id: '1', // acts as primary key, should be unique and non-empty string
                label: 'Nam',
                value: 'Nam',
            },
            {
                id: '2',
                label: 'Nữ',
                value: 'Nữ',
            },
        ],
        [],
    )

    const [selectedId, setSelectedId] = useState()

    const handleCreateAccount = async (
        password,
        confirmPassword,
        phoneNumber
    ) => {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (password === '') {
            Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu');
            return;
        } else if (confirmPassword === '') {
            Alert.alert('Thông báo', 'Vui lòng nhập lại mật khẩu');
            return;
        } else if (password !== confirmPassword) {
            Alert.alert('Thông báo', 'Mật khẩu không trùng khớp');
            return;
        } else if (!passwordRegex.test(password)) {
            Alert.alert(
                'Thông báo',
                'Mật khẩu phải có ít nhất 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số'
            );
            return;
        } else {
            try {
                const response = await fetch(`${url}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phoneNumber,
                        password,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Đăng ký thành công, chuyển sang CreateUser (nếu cần)
                    navigation.navigate('CreateUser', {
                        phoneNumber: phoneNumber,
                        password: password,
                    });
                } else {
                    Alert.alert('Lỗi', data.message || 'Đăng ký thất bại');
                }
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
            }
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View>
                <View style={styles.headerWrap}>
                    <Text style={styles.headerText}>
                        Đăng ký tài khoản của bạn
                    </Text>
                </View>
                <View style={styles.inputWrap}>
                    <Text style={styles.passwordText}>Nhập mật khẩu:</Text>
                    <TextInput
                        placeholder="Nhập mật khẩu"
                        secureTextEntry={isVisible ? false : true}
                        onChangeText={(text) => setPassword(text)}
                        style={styles.passwordInput}
                    />
                    <Text style={styles.passwordText}>Nhập lại mật khẩu:</Text>
                    <TextInput
                        placeholder="Nhập lại mật khẩu"
                        secureTextEntry={isVisible ? false : true}
                        onChangeText={(text) => setConfirmPassword(text)}
                        style={styles.passwordInput}
                    />
                    <TouchableOpacity
                        onPress={() => setIsVisible(!isVisible)}
                        style={styles.hidePasswordButton}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontFamily: 'Inter_600SemiBold',
                            }}
                        >
                            {isVisible ? 'ẨN' : 'HIỆN'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.btnWrap}>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => {
                            handleCreateAccount(
                                password,
                                confirmPassword,
                                phoneNumber,
                            )
                        }}
                    >
                        <Text style={styles.confirmButtonText}>Tiếp tục</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Register

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        height: windowHeight,
    },
    headerWrap: {
        height: windowHeight * 0.1,
        width: windowWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputWrap: {
        alignItems: 'center',
        height: windowHeight * 0.6,
        width: windowWidth,
        position: 'relative',
    },
    btnWrap: {
        alignItems: 'center',
        height: windowHeight * 0.3,
        justifyContent: 'flex-end',
    },
    headerText: {
        fontSize: 24,
        fontFamily: 'Inter_600SemiBold',
        marginTop: 20,
    },
    passwordText: {
        fontSize: 17,
        marginTop: 20,
        alignSelf: 'flex-start',
        marginLeft: windowWidth * 0.1,
    },
    passwordInput: {
        width: windowWidth * 0.8,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 10,
        paddingLeft: 10,
        fontSize: 16,
    },
    hidePasswordButton: {
        position: 'absolute',
        right: windowWidth * 0.1,
        top: 20,
    },

    confirmButton: {
        width: windowWidth * 0.8,
        height: 40,
        backgroundColor: '#5D5AFE',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    confirmButtonText: {
        color: '#fff',
        fontFamily: 'Inter_600SemiBold',
        fontSize: 18,
    },

    inputNameWrap: {
        flexDirection: 'row',
        paddingHorizontal: windowWidth * 0.1,
        width: windowWidth,
        alignItems: 'center',
        height: windowHeight * 0.1,
    },
    inputName: {
        width: windowWidth * 0.28,
        height: 20,
        borderColor: 'gray',
        borderBottomWidth: 1,
        marginLeft: 5,
        fontSize: 17,
        paddingLeft: 5,
    },
    inputText: {
        fontSize: 17,
    },
})
