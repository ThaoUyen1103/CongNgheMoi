import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
} from 'react-native'
import { primaryColor } from '../utils/constant'
import React, { useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { decode } from 'base-64'
import { url } from '../utils/constant'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios'

global.atob = decode

export default function EditNewPassword({ route, navigation }) {
    const phoneNumber = route.params.phoneNumber
    const [isVisible, setIsVisible] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [reNewPassword, setReNewPassword] = useState('')

    const handleInputPassword = () => {
        // regex cho mật khẩu có ít nhất 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
        if (newPassword === '' || reNewPassword === '') {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin')
        } else if (!passwordRegex.test(newPassword)) {
            Alert.alert(
                'Thông báo',
                'Mật khẩu phải có ít nhất 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số',
            )
        } else if (newPassword !== reNewPassword) {
            Alert.alert('Thông báo', 'Mật khẩu không trùng khớp')
        } else {
            handleUpdatePassword()
        }
    }

    const handleUpdatePassword = async () => {
        console.log('phoneNumber', phoneNumber)
        fetch(
            url + '/account/updatePasswordByPhone?phoneNumber=' + phoneNumber,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: newPassword,
                }),
            },
        )
            .then((response) => response.json())
            .then((data) => {
                if (data === 'Update password successfully!!!') {
                    Alert.alert('Thông báo', 'Cập nhật mật khẩu thành công')
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally(() => {
                const account = {
                    phoneNumber: phoneNumber,
                    password: newPassword,
                }
                axios
                    .post(url + '/account/login', account)
                    .then((res) => {
                        console.log(res)
                        const token = res.data.token
                        AsyncStorage.setItem('AuthToken', token)
                        navigation.navigate('Message')
                    })
                    .catch((err) => {
                        Alert.alert(
                            'Đăng nhập thất bại!!!',
                            'Vui lòng kiểm tra lại tài khoản và mật khẩu của bạn!',
                        )
                        console.log('Error at login', err)
                    })
            })
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.wrap}>
                <Text
                    style={{
                        fontSize: 25,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        paddingHorizontal: 50,
                    }}
                >
                    Nhâp mật khẩu mới của bạn
                </Text>
                <View style={styles.infoWview}>
                    <TouchableOpacity
                        style={styles.visible}
                        onPress={() => setIsVisible(!isVisible)}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                            {isVisible ? 'ẨN' : 'HIỆN'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.infoPassword}>Nhập mật khẩu mới:</Text>
                    <TextInput
                        style={[styles.info, { marginTop: 5 }]}
                        placeholder="Nhập mật khẩu mới của bạn"
                        secureTextEntry={isVisible ? false : true}
                        onChangeText={(e) => setNewPassword(e)}
                        value={newPassword}
                    />
                    <TextInput
                        style={[styles.info, { marginTop: 10 }]}
                        placeholder="Nhập lại mật khẩu mới của bạn"
                        secureTextEntry={isVisible ? false : true}
                        onChangeText={(e) => setReNewPassword(e)}
                        value={reNewPassword}
                    />
                </View>
            </View>
            <TouchableOpacity
                style={[styles.btn, { backgroundColor: primaryColor }]}
                onPress={() => handleInputPassword()}
            >
                <Text
                    style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}
                >
                    Cập nhật
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    wrap: {
        justifyContent: 'center',
        marginTop: 30,
    },
    avatarView: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    infoWview: {
        width: '100%',
        paddingHorizontal: 20,
        position: 'relative',
        marginTop: 20,
    },
    infoPassword: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
    info: {
        width: '100%',
        height: 40,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        fontSize: 18,
        paddingLeft: 10,
    },
    btn: {
        width: 200,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        alignSelf: 'center',
        marginTop: 30,
    },
    visible: {
        position: 'absolute',
        right: 20,
        top: 20,
        zIndex: 100,
    },
})
