import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Modal,
    Alert,
} from 'react-native'
import { AntDesign, Feather } from '@expo/vector-icons'
import RadioGroup from 'react-native-radio-buttons-group'
import React, { useMemo, useState, useEffect } from 'react'
import { primaryColor } from '../utils/constant'
import { url } from '../utils/constant'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { decode } from 'base-64'
import DateTimePicker from 'react-native-ui-datepicker'
import dayjs from 'dayjs'

global.atob = decode

export default function Tab({ route, navigation }) {
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

    const [user, setUser] = useState({})
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [selectedId, setSelectedId] = useState(
        user.gender === 'Nam' ? '2' : '1',
    )
    //String ex 24/11/2002 to Date 24/11/2002

    const [dateChoose, setDateChoose] = useState(dayjs())

    const [modalVisible, setModalVisible] = useState(false)

    const fetchUser = async () => {
        const token = await AsyncStorage.getItem('AuthToken')
        const decodedToken = jwtDecode(token)
        const account_id = decodedToken.accountId

        fetch(url + `/user/findUser?account_id=${account_id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                return res.json()
            })
            .then((data) => {
                setUser(data)
            })
            .catch((error) => {
                console.error('Error:', error)
            })
            .finally(() => {})
    }

    React.useEffect(() => {
        fetchUser()
        if (user.gender === 'Nam') {
            setSelectedId('1')
        } else if (user.gender === 'Nữ') {
            setSelectedId('2')
        }
    }, [])

    const handleUpdateInfo = async () => {
        const radioButton = radioButtons.find(
            (button) => button.id === selectedId,
        )
        const gender = radioButton ? radioButton.value : ''
        console.log(gender)
        let firstNameEdit = ''
        let lastNameEdit = ''
        let dateOfBirthEdit = ''
        if (firstName === '') {
            firstNameEdit = user.firstName
        } else {
            firstNameEdit = firstName
        }
        if (lastName === '') {
            lastNameEdit = user.lastName
        } else {
            lastNameEdit = lastName
        }
        if (dateOfBirth === '') {
            dateOfBirthEdit = user.dateOfBirth
        } else {
            dateOfBirthEdit = dateOfBirth
        }
        console.log(firstNameEdit, lastNameEdit, dateOfBirthEdit)

        const token = await AsyncStorage.getItem('AuthToken')
        const decodedToken = jwtDecode(token)
        const account_id = decodedToken.accountId
        fetch(url + `/user/updateInfo?account_id=${account_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: firstNameEdit,
                lastName: lastNameEdit,
                dateOfBirth: dateOfBirthEdit,
                gender: gender,
            }),
        })
            .then((res) => {
                return res.json()
            })
            .then((data) => {
                console.log(data)
                Alert.alert('Thông báo', 'Cập nhật thông tin thành công')
            })
            .catch((error) => {
                console.error('Error:', error)
                Alert.alert('Thông báo', 'Cập nhật thông tin thất bại')
            })
            .finally(() => {
                navigation.navigate('Personal')
            })
    }
    return (
        <View style={styles.container}>
            <View style={styles.wrap}>
                <View style={styles.infoWview}>
                    <View
                        style={{
                            flexDirection: 'row',
                            borderBottomWidth: 1,
                            borderColor: '#ccc',
                            width: '90%',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <TextInput
                            style={styles.info}
                            placeholder=""
                            defaultValue={user.firstName}
                            onChangeText={(text) => setFirstName(text)}
                        />
                        <AntDesign name="edit" size={22} color="black" />
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            borderBottomWidth: 1,
                            borderColor: '#ccc',
                            width: '90%',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <TextInput
                            style={styles.info}
                            placeholder=""
                            defaultValue={user.lastName}
                            onChangeText={(value) => setLastName(value)}
                        />
                        <AntDesign name="edit" size={22} color="black" />
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            borderBottomWidth: 1,
                            borderColor: '#ccc',
                            width: '90%',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <TextInput
                            style={styles.info}
                            placeholder=""
                            value={dateOfBirth ? dateOfBirth : user.dateOfBirth}
                            onChangeText={(text) => setDateOfBirth(text)}
                        />
                        <TouchableOpacity
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <AntDesign name="edit" size={22} color="black" />
                        </TouchableOpacity>

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
                                        let dateFormat = dayjs(
                                            date.date,
                                        ).format('DD/MM/YYYY')
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
                    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                        <RadioGroup
                            radioButtons={radioButtons}
                            onPress={setSelectedId}
                            selectedId={selectedId}
                            layout="row"
                            containerStyle={{
                                width: '80%',
                                justifyContent: 'space-around',
                                marginTop: 20,
                            }}
                            labelStyle={{ fontSize: 18 }}
                        />
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={styles.btn}
                onPress={() => {
                    handleUpdateInfo()
                }}
            >
                <Text
                    style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}
                >
                    LƯU
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    wrap: {
        flexDirection: 'row',
        marginTop: 10,
    },
    avatarView: {
        width: '30%',
    },
    infoWview: {
        width: '80%',
    },
    info: {
        width: 200,
        height: 30,
        fontSize: 18,
        borderColor: '#ccc',
        marginHorizontal: 10,
        marginTop: 12,
        marginBottom: 5,
        paddingHorizontal: 10,
    },
    btn: {
        width: '90%',
        height: 40,
        backgroundColor: primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        marginTop: 30,
    },
})
