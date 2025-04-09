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
import RadioGroup from 'react-native-radio-buttons-group'
import DateTimePicker from 'react-native-ui-datepicker'
import dayjs from 'dayjs'
import uploadDefaultAvatar from '../utils/uploadDefaultAvatar'
import { url } from '../utils/constant'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Register = ({ navigation, route }) => {
    const phoneNumber = route.params.phoneNumber
    const password = route.params.password
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [gender, setGender] = React.useState('')
    const [dateOfBirth, setDateOfBirth] = React.useState('')
    const [dateChoose, setDateChoose] = useState(dayjs())
    const [modalVisible, setModalVisible] = useState(false)

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

    const handleCreateUser = async (
        firstName,
        lastName,
        gender,
        dateOfBirth,
        phoneNumber,
    ) => {
        const radioButton = radioButtons.find(
            (button) => button.id === selectedId,
        )
        gender = radioButton ? radioButton.value : ''
        if (firstName === '') {
            Alert.alert('Thông báo', 'Vui lòng nhập họ')
            return
        } else if (lastName === '') {
            Alert.alert('Thông báo', 'Vui lòng nhập tên')
            return
        } else if (gender === '') {
            Alert.alert('Thông báo', 'Vui lòng chọn giới tính')
        } else if (dateOfBirth === '') {
            Alert.alert('Thông báo', 'Vui lòng chọn ngày sinh')
            return
        } else {
            try {
                const avatar = uploadDefaultAvatar(lastName)
                const coverImage =
                    'https://res.cloudinary.com/dpj4kdkxj/image/upload/v1713537768/Avatar/csf5zjkyt7g6x5a4sgsb.jpg'
                console.log('avatar', avatar)
                const userName = lastName + ' ' + firstName
                console.log('------------------------------')

                //gửi request lên server
                fetch(url + `/account/create-account`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phoneNumber: phoneNumber,
                        password: password,
                    }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log(data)
                        fetch(url + '/user/register', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                account_id: data._id,
                                userName: userName,
                                firstName: firstName,
                                lastName: lastName,
                                phoneNumber: phoneNumber,
                                dateOfBirth: dateOfBirth,
                                gender: gender,
                                avatar: avatar,
                                coverImage: coverImage,
                            }),
                        })
                            .then((res) => {
                                res.json()
                            })
                            .then((data) => {
                                console.log(data)
                                navigation.navigate('Login2')
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    })
                    .finally(() => {
                        const account = {
                            phoneNumber: phoneNumber,
                            password: password,
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
            } catch (error) {
                console.log(error)
            }
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <View style={styles.headerWrap}>
                    <Text style={styles.headerText}>
                        Đăng ký tài khoản của bạn
                    </Text>
                </View>

                <View style={styles.inputWrap}>
                    <View style={styles.inputNameWrap}>
                        <Text style={styles.inputText}>Họ:</Text>
                        <TextInput
                            onChangeText={(text) => setFirstName(text)}
                            style={styles.inputName}
                        />

                        <Text
                            style={[
                                styles.inputText,
                                { marginLeft: windowWidth * 0.05 },
                            ]}
                        >
                            Tên:
                        </Text>
                        <TextInput
                            onChangeText={(text) => setLastName(text)}
                            style={styles.inputName}
                        />
                    </View>
                    <View style={styles.genderWrap}>
                        <Text style={styles.inputText}>Giới tính:</Text>
                        <RadioGroup
                            radioButtons={radioButtons}
                            onPress={setSelectedId}
                            selectedId={selectedId}
                            layout="row"
                            containerStyle={{
                                justifyContent: 'space-around',
                                width: windowWidth * 0.8,
                                marginTop: 10,
                            }}
                            labelStyle={{
                                fontSize: 17,
                            }}
                        />
                    </View>

                    <View style={styles.dateOfBirthWrap}>
                        <Text style={styles.inputText}>Ngày sinh:</Text>
                        <TouchableOpacity
                            style={styles.dateOfBirth}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text
                                style={{
                                    fontSize: 17,
                                    color: 'gray',
                                    alignSelf: 'center',
                                }}
                            >
                                {!dateOfBirth
                                    ? '--Chọn ngày sinh--'
                                    : dateOfBirth}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Modal animationType="fade" visible={modalVisible}>
                        <View
                            style={{
                                backgroundColor: '#fff',
                                height: windowHeight * 0.6,
                                width: windowWidth,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <DateTimePicker
                                mode="single"
                                date={dateChoose}
                                onChange={(date) => {
                                    let dateFormat = dayjs(date.date).format(
                                        'DD/MM/YYYY',
                                    )
                                    setDateOfBirth(dateFormat)
                                    setDateChoose(date.date)
                                }}
                                locale={'vi'}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={{
                                backgroundColor: '#5D5AFE',
                                width: windowWidth * 0.5,
                                height: 40,
                                borderRadius: 5,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: windowHeight * 0.1,
                                alignSelf: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: 18,
                                }}
                            >
                                OK
                            </Text>
                        </TouchableOpacity>
                    </Modal>
                </View>

                <View style={styles.btnWrap}>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => {
                            handleCreateUser(
                                firstName,
                                lastName,
                                gender,
                                dateOfBirth,
                                phoneNumber,
                            )
                        }}
                    >
                        <Text style={styles.confirmButtonText}>Đăng ký</Text>
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

    genderWrap: {
        alignItems: 'flex-start',
        height: windowHeight * 0.1,
        width: windowWidth,
        paddingHorizontal: windowWidth * 0.1,
    },

    dateOfBirthWrap: {
        flexDirection: 'row',
        paddingHorizontal: windowWidth * 0.1,
        width: windowWidth,
        alignItems: 'center',
        height: windowHeight * 0.1,
    },
    dateOfBirth: {
        width: windowWidth * 0.5,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        marginLeft: 10,
    },
})
