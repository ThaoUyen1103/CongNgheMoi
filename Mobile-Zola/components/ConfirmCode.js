import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Dimensions,
    TouchableOpacity,
    Alert,
    LogBox,
} from 'react-native'
import React, { useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth } from '../utils/firebase';


import { url } from '../utils/constant'

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
])

const ConfirmCode = ({ navigation, route }) => {
    let confirm = route.params.confirm
    const phoneNumber = route.params.phoneNumber
    const type = route.params.type
    const oldPhoneNumber = route.params.oldPhoneNumber

    const [code, setCode] = React.useState('')
    const [time, setTime] = React.useState(60)

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime((prevTime) => {
                if (prevTime === 0) {
                    clearInterval(interval)
                }
                return prevTime - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const confirmCode = async (code) => {
        try {
            const isConfirm = await confirm.confirm(code)
            if (isConfirm) {
                if (type === 'register') {
                    navigation.navigate('Register', {
                        phoneNumber: phoneNumber,
                    })
                } else if (type === 'forgotPassword') {
                    navigation.navigate('EditNewPassword', {
                        phoneNumber: phoneNumber,
                    })
                } else if (type === 'changePhoneNumber') {
                    handleChangeNewPhoneNumber()
                }
            } else {
                Alert.alert('Thông báo', 'Mã xác nhận không hợp lệ')
            }
        } catch (error) {
            Alert.alert('Thông báo', 'Mã xác nhận không hợp lệ')
            console.log(error)
        }
    }

    // const handleChangeNewPhoneNumber = () => {
    //     fetch(
    //         url +
    //         `/account/find-account-by-phone-number?phoneNumber=${oldPhoneNumber}`,
    //     )
    //         .then((res) => res.json())
    //         .then((data) => {
    //             console.log(data)
    //             fetch(url + `/user/updateNewPhoneNumber`, {
    //                 method: 'PUT',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({
    //                     account_id: data._id,
    //                     newPhoneNumber: phoneNumber,
    //                 }),
    //             })
    //                 .then((res) => res.json())
    //                 .then((data) => {
    //                     console.log(data)
    //                 })
    //                 .catch((err) => {
    //                     console.log(err)
    //                 })

    //             fetch(url + `/account/updateNewPhoneNumber`, {
    //                 method: 'PUT',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({
    //                     account_id: data._id,
    //                     newPhoneNumber: phoneNumber,
    //                 }),
    //             })
    //                 .then((res) => res.json())
    //                 .then((data) => {
    //                     console.log(data)
    //                 })
    //         })
    //         .finally(() => {
    //             navigation.navigate('Personal')
    //         })
    //         .catch((err) => {
    //             console.log(err)
    //         })
    // }

    const handleSubmit = () => {
        //Regular expression cho mã xác nhận chỉ chứa 6 chữ số
        const regex = /^[0-9]{6}$/g
        if (code.match(regex)) {
            console.log('code', code)
            confirmCode(code)
        } else {
            Alert.alert('Thông báo', 'Mã xác nhận không hợp lệ')
        }
    }

    // const onAuthStateChanged = (user) => {
    //     if (user) {
    //         auth.currentUser.delete()  // Không cần gọi auth()

    //         if (type === 'register') {
    //             navigation.navigate('Register', {
    //                 phoneNumber: phoneNumber,
    //             });
    //         } else if (type === 'forgotPassword') {
    //             navigation.navigate('EditNewPassword', {
    //                 phoneNumber: phoneNumber,
    //             });
    //         } else if (type === 'changePhoneNumber') {
    //             handleChangeNewPhoneNumber();
    //         }
    //     }
    // }


    // const handleReSendCode = () => {
    //     const formattedPhoneNumber = `+84${phoneNumber.slice(1)}`;
    //     const auth = getAuth();

    //     signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier)
    //         .then((confirmationResult) => {
    //             confirm = confirmationResult;
    //             setTime(60);
    //         })
    //         .catch((error) => {
    //             Alert.alert('Thông báo', 'Gửi lại mã xác nhận thất bại');
    //             console.log(error);
    //         });
    // };


    // React.useEffect(() => {
    //     const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    //     return subscriber
    // }, [])

    return (
        <SafeAreaView style={styles.containerConfirm}>
            <View style={styles.textWrap}>
                <Text style={styles.headerTextConfirm}>
                    Xác nhận số điện thoại
                </Text>
                <Text style={styles.infoConfirm}>
                    Hãy nhập mã xác nhận mà chúng tôi đã gửi đến số điện thoại
                    của bạn.
                </Text>
            </View>

            <View style={styles.input}>
                <Text style={styles.authText}>Nhập mã xác nhận:</Text>
                <TextInput
                    style={styles.authInput}
                    maxLength={6}
                    keyboardType="numeric"
                    onChangeText={(value) => {
                        setCode(value)
                    }}
                />
                <View style={styles.reSendCode}>
                    <Text style={styles.reSendCodeText}>
                        Chưa nhận được mã xác nhận?
                    </Text>
                    <TouchableOpacity
                        style={styles.reSendCodeButton}
                        disabled={time > 0 ? true : false}
                        onPress={() => handleReSendCode()}
                    >
                        <Text style={styles.reSendCodeBtnText}>
                            Gửi lại mã{' '}
                        </Text>
                        <Text style={styles.reSendCodeText}>
                            {time > 0 ? `(${time}s)` : ''}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.buttonWrap}>
                <TouchableOpacity
                    style={styles.buttonAuth}
                    onPress={() => handleSubmit()}
                >
                    <Text style={styles.buttonAuthText}>Xác nhận</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default ConfirmCode

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
    //Confirm
    containerConfirm: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        position: 'relative',
    },
    textWrap: {
        height: windowHeight * 0.3,
        width: '100%',
        alignItems: 'center',
    },
    input: {
        height: windowHeight * 0.3,
        width: windowWidth * 0.8,
        alignItems: 'center',
    },
    buttonWrap: {
        width: '100%',
        height: windowHeight * 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    headerTextConfirm: {
        fontSize: 30,
        fontFamily: 'Inter_600SemiBold',
        textAlign: 'center',
        marginTop: 50,
        width: '90%',
    },
    infoConfirm: {
        fontSize: 17,
        textAlign: 'center',
        marginTop: 50,
        marginHorizontal: 20,
        width: '80%',
        color: '#808080',
    },
    inputAuth: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    authText: {
        fontSize: 20,
        fontFamily: 'Inter_600SemiBold',
        marginTop: 50,
    },

    authInput: {
        width: windowWidth * 0.5,
        height: 40,
        borderWidth: 1,
        borderColor: '#808080',
        borderRadius: 10,
        fontSize: 17,
        padding: 5,
        paddingHorizontal: 15,
    },

    reSendCode: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    reSendCodeText: {
        fontSize: 17,
        color: '#808080',
    },
    reSendCodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reSendCodeBtnText: {
        color: '#5D5AFE',
        fontSize: 17,
    },

    buttonAuth: {
        backgroundColor: '#5D5AFE',
        width: windowWidth * 0.5,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    buttonAuthText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Inter_600SemiBold',
    },
})
