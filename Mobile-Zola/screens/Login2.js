import {
    Alert,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, Entypo } from '@expo/vector-icons'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { decode } from 'base-64'
import { url } from '../utils/constant'
import { LinearGradient } from 'expo-linear-gradient';


const Login2 = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState()
    const [password, setPassword] = useState()
    const [isShowPassword, setIsShowPassword] = useState(false)
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('AuthToken')
                if (token) {
                    navigation.navigate('Message')
                }
            } catch (error) {
                console.log(error)
            }
        }
        checkLoginStatus()
    }, [])

    checkUser = async () => {
        try {
            const token = await AsyncStorage.getItem('AuthToken')
            if (token) {
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleLogin = () => {
        if (!phoneNumber || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin')
            return
        }

        // Giả lập đăng nhập thành công nếu phoneNumber là "123" và password là "123"
        if (phoneNumber === '123' && password === '123') {
            Alert.alert('Thành công', 'Đăng nhập thành công!')
            navigation.navigate('Message')
        } else {
            Alert.alert(
                'Đăng nhập thất bại',
                'Số điện thoại hoặc mật khẩu không đúng'
            )
        }
    }


    // const handleLogin = () => {
    //     //kiểm tra hợp lệ
    //     /*if (phoneNumber == null || password == null) {
    //         alert('Vui lòng nhập đầy đủ thông tin')
    //         return
    //     }
    //     //gửi request lên server
    //     fetch(`http://172.21.73.92:3000/account/login?phoneNumber=${phoneNumber}`)
    //         .then((res) => res.json())
    //         .then((data) => {
    //             if (data == 'Account not found') {
    //                 alert('Tài khoản không tồn tại')
    //             } else {
    //                 if (data.password == password) {
    //                     alert('Đăng nhập thành công')
    //                     navigation.navigate('Message')
    //                 } else {
    //                     alert('Mật khẩu không đúng')
    //                 }
    //             }
    //         })
    //         .catch((err) => {
    //             console.log(err)
    //         })*/
    //     const account = {
    //         phoneNumber: phoneNumber,
    //         password: password,
    //     }
    //     axios
    //         .post(url + '/account/login', account)
    //         .then((res) => {
    //             console.log(res)
    //             const token = res.data.token
    //             AsyncStorage.setItem('AuthToken', token)
    //             navigation.navigate('Message')
    //         })
    //         .catch((err) => {
    //             Alert.alert(
    //                 'Đăng nhập thất bại!!!',
    //                 'Vui lòng kiểm tra lại tài khoản và mật khẩu của bạn!',
    //             )
    //             console.log('Error at login', err)
    //         })
    // }
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView>
                <LinearGradient
                    colors={['#474bff', '#478eff']}
                    useAngle={true}
                    angle={90}
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <AntDesign
                            style={styles.back}
                            name="left"
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                    <Text style={styles.login}>Đăng nhập</Text>
                </LinearGradient>
                <View style={styles.info}>
                    <Text style={styles.direction}>
                        Vui lòng nhập số điện thoại và mật khẩu để đăng nhập
                    </Text>
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder="Số điện thoại"
                            onChangeText={setPhoneNumber}
                        />
                    </View>
                    <View style={styles.inputWrap}>
                        <TextInput
                            onChangeText={setPassword}
                            style={styles.input}
                            placeholder="Mật khẩu"
                            secureTextEntry={!isShowPassword}
                        />
                        {isShowPassword ? (
                            <TouchableOpacity
                                onPress={() => setIsShowPassword(false)}
                            >
                                <Entypo name="eye" size={24} color="black" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => setIsShowPassword(true)}
                            >
                                <Entypo
                                    name="eye-with-line"
                                    size={24}
                                    color="black"
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.getPwd}
                        onPress={() =>
                            navigation.navigate('PhoneInput', {
                                type: 'forgotPassword',
                            })
                        }
                    >
                        <Text style={styles.txtGetPwd}>Lấy lại mật khẩu</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnLogin}
                        onPress={handleLogin}
                    >
                        <Text style={styles.txtLogin}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Login2

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        backgroundColor: '#1B96CB',
    },
    login: {
        color: 'white',
        fontSize: 20,
        marginLeft: 15,
        fontWeight: 'bold',
    },
    back: {
        marginLeft: 15,
    },
    direction: {
        fontSize: 18,
        marginTop: 30,
        textAlign: 'center',
        marginBottom: 10,
        paddingHorizontal: 50,
    },
    info: {
        //alignItems: 'center',
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        fontSize: 17,
        marginHorizontal: 25,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        fontSize: 17,
    },

    getPwd: {
        marginLeft: 15,
    },
    txtGetPwd: {
        color: '#1B96CB',
        fontSize: 18,
    },
    btnLogin: {
        alignItems: 'center',
        marginTop: 30,
        justifyContent: 'center',
        width: 200,
        height: 40,
        backgroundColor: '#474bff',
        borderRadius: 20,
        alignSelf: 'center',
    },
    txtLogin: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
    },
})
