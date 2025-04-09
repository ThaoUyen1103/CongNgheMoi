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

global.atob = decode

export default function EditPassword({ route, navigation }) {
    const [isVisible, setIsVisible] = useState(false)
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [reNewPassword, setReNewPassword] = useState('')
    const [message, setMessage] = useState('')
    console.log('oldPassword', oldPassword)
    console.log('newPassword', newPassword)
    console.log('reNewPassword', reNewPassword)

    const handleInputPassword = () => {
        // regex cho mật khẩu có ít nhất 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
        if (oldPassword === '' || newPassword === '' || reNewPassword === '') {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin')
        } else if (!passwordRegex.test(newPassword)) {
            Alert.alert(
                'Thông báo',
                'Mật khẩu phải có ít nhất 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số',
            )
        } else if (oldPassword === newPassword) {
            Alert.alert(
                'Thông báo',
                'Mật khẩu mới không được trùng với mật khẩu cũ',
            )
        } else if (newPassword !== reNewPassword) {
            Alert.alert('Thông báo', 'Mật khẩu không trùng khớp')
        } else {
            handleUpdatePassword()
        }
    }

    const handleUpdatePassword = async () => {
        const token = await AsyncStorage.getItem('AuthToken')
        const decodedToken = jwtDecode(token)
        const account_id = decodedToken.accountId

        fetch(url + '/account/updatePassword?account_id=' + account_id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: newPassword,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data === 'Update password successfully!!!') {
                    Alert.alert('Thông báo', 'Cập nhật mật khẩu thành công')
                }
            })
            .catch((error) => {
                console.error(error)
                Alert.alert(
                    'Thông báo',
                    'Có lỗi xảy ra xin vui lòng thử lại sau.',
                )
            })
            .finally(() => {
                navigation.navigate('Personal')
            })
    }

    const handleCheckPassword = async () => {
        const token = await AsyncStorage.getItem('AuthToken')
        const decodedToken = jwtDecode(token)
        const account_id = decodedToken.accountId

        fetch(url + '/account/find?account_id=' + account_id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.password !== oldPassword) {
                    setMessage('Mật khẩu không đúng')
                } else {
                    setMessage('')
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }

    return (
        <View style={styles.container}>
            <View style={styles.wrap}>
                <View style={styles.infoWview}>
                    <TouchableOpacity
                        style={styles.visible}
                        onPress={() => setIsVisible(!isVisible)}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                            {isVisible ? 'ẨN' : 'HIỆN'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.infoPassword}>
                        Nhập mật khẩu hiện tại:
                    </Text>
                    <TextInput
                        style={[styles.info, { marginTop: 5 }]}
                        placeholder="Nhập mật hiện tại"
                        secureTextEntry={isVisible ? false : true}
                        onChangeText={(e) => setOldPassword(e)}
                        value={oldPassword}
                        onBlur={() => {
                            handleCheckPassword()
                        }}
                    />
                    <Text style={{ color: 'red', fontSize: 16 }}>
                        {message}
                    </Text>
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
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    wrap: {
        justifyContent: 'center',
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
