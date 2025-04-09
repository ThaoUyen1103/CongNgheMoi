import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Alert,
} from 'react-native'
import React from 'react'
import { useState } from 'react'
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'
import { url } from '../utils/constant'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { decode } from 'base-64'
import axios from 'axios'

const DeleteAccount = ({ navigation }) => {
    const [user, setUser] = useState(null)

    const handleDeleteAccount = async () => {
        const token = await AsyncStorage.getItem('AuthToken')
        const decodedToken = jwtDecode(token)
        console.log(decodedToken)
        const account_id = decodedToken.accountId
        Alert.alert(
            'Xác nhận xóa tài khoản',
            'Dữ liệu của bạn sẽ bị xóa sau khi chọn xóa tài khoản. Bạn có chắc chắn muốn xóa tài khoản? ',
            [
                {
                    text: 'Hủy',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Xóa',
                    onPress: () => {
                        fetch(
                            url + `/user/deleteAccount?accountID=` + account_id,
                            {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            },
                        )
                            .then((res) => res.json())
                            .then((data) => {
                                console.log(data)
                            })
                            .finally(() => {
                                fetchUser()
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    },
                },
            ],
        )
    }
    const handleChangePhoneNumber = () => {
        Alert.alert(
            'Xác nhận đổi số điện thoại',
            'Để đổi số điện thoại, bạn cần nhập số điện thoại mới và xác nhận mã OTP. Bạn có chắc chắn muốn đổi số điện thoại?',
            [
                {
                    text: 'Hủy',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Đổi',
                    onPress: () =>
                        navigation.navigate('PhoneInput', {
                            type: 'changePhoneNumber',
                            oldPhoneNumber: user.phoneNumber,
                        }),
                },
            ],
        )
    }

    const fetchUser = async () => {
        const token = await AsyncStorage.getItem('AuthToken')
        const decodedToken = jwtDecode(token)
        const account_id = decodedToken.accountId
        console.log(account_id)

        axios
            .get(url + `/user/findUser?account_id=${account_id}`)
            .then((res) => {
                setUser(res.data)
                console.log(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    React.useEffect(() => {
        fetchUser()
    }, [])

    const handleUndoDeleteAccount = async () => {
        const token = await AsyncStorage.getItem('AuthToken')
        const decodedToken = jwtDecode(token)
        const account_id = decodedToken.accountId

        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn hoàn tác xóa tài khoản?',
            [
                {
                    text: 'Hủy',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: () => {
                        fetch(
                            url +
                                `/user/undoDeleteAccount?accountID=${account_id}`,
                            {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            },
                        )
                            .then((res) => {
                                return res.json()
                            })
                            .then((data) => {
                                console.log(data)
                            })
                            .catch((error) => {
                                console.error('Error:', error)
                            })
                            .finally(() => {
                                fetchUser()
                            })
                    },
                },
            ],
        )
    }

    return (
        <View>
            <View style={styles.wrap}>
                <View style={styles.headerTextWrap}>
                    <FontAwesome name="warning" size={24} color="red" />
                    <Text style={styles.headerText}>Xóa tài khoản sẽ:</Text>
                </View>
                <View style={styles.infoTextWrap}>
                    <Text style={styles.infoText}>
                        - Toàn bộ dữ liệu sẽ bị xóa và sẽ không thể khôi phục
                        lại.
                    </Text>
                    <Text style={styles.infoText}>
                        - Bạn bè và thành viên chung nhóm sẽ không thể gửi tin
                        nhắn đến bạn.
                    </Text>
                    <Text style={styles.infoText}>
                        - Tất cả người từng liên hệ vẫn xem được tin nhắn chung.
                    </Text>
                </View>
                {user?.deleted ? (
                    <TouchableOpacity
                        style={styles.btnForce}
                        onPress={handleUndoDeleteAccount}
                    >
                        <Text style={styles.btnText}>
                            HOÀN TÁC XÓA TÀI KHOẢN
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.btnForce}
                        onPress={handleDeleteAccount}
                    >
                        <Text style={styles.btnText}>XÓA TÀI KHOẢN</Text>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.wrap}>
                <View style={styles.headerTextWrap}>
                    <MaterialCommunityIcons
                        name="cellphone-cog"
                        size={24}
                        color="black"
                    />
                    <Text style={styles.headerText}>
                        Đổi số điện thoại thay vì xóa tài khoản?
                    </Text>
                </View>
                <View style={styles.infoTextWrap}>
                    <Text style={styles.infoText}>
                        - Bạn có thể đổi số điện thoại để tiếp tục sử dụng ứng
                        dụng.
                    </Text>
                    <Text style={styles.infoText}>
                        - Toàn bộ dữ liệu sẽ được chuyển sang số điện thoại mới.
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.btnConfirm}
                    onPress={handleChangePhoneNumber}
                >
                    <Text style={styles.btnText}>ĐỔI SỐ ĐIỆN THOẠI</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

export default DeleteAccount

const styles = StyleSheet.create({
    wrap: {
        width: windowWidth,
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    headerTextWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerText: {
        fontSize: 20,
        fontFamily: 'Inter_600SemiBold',
        paddingHorizontal: 20,
    },
    infoTextWrap: {
        marginBottom: 20,
    },
    infoText: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        marginBottom: 5,
        marginLeft: 20,
        color: '#8a8a8a',
    },
    btnForce: {
        width: windowWidth * 0.7,
        padding: 10,
        backgroundColor: 'red',
        alignSelf: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        textAlign: 'center',
    },
    btnConfirm: {
        width: windowWidth * 0.7,
        padding: 10,
        backgroundColor: '#1B96CB',
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 10,
    },
})
