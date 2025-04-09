import { StyleSheet, Text, View, Image, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'

import { url } from '../utils/constant'

const Profile = ({ navigation, route }) => {
    const userId = route.params.userId
    const [user, setUser] = useState()

    React.useEffect(() => {
        //find user by userId
        fetch(url + '/user/findUserByUserId/' + userId)
            .then((response) => response.json())
            .then((data) => {
                setUser(data)
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }, [])
    return (
        <View style={styles.container}>
            <View
                style={{
                    height: windowHeight - windowHeight * 0.08,
                }}
            >
                <View>
                    <Image
                        source={{
                            uri: user?.coverImage,
                        }}
                        style={styles.background}
                    />
                    <Image
                        source={{
                            uri: user?.avatar,
                        }}
                        style={styles.avatar}
                    />
                </View>
                <Text style={styles.userName}>{user?.userName}</Text>

                <View style={styles.infor}>
                    <Text style={styles.inforHeader}>Thông tin cá nhân</Text>
                    <View style={styles.inforWrap}>
                        <Text style={styles.inforKey}>Giới tính</Text>
                        <Text style={styles.inforValue}>{user?.gender}</Text>
                    </View>
                    <View style={styles.inforWrap}>
                        <Text style={styles.inforKey}>Ngày sinh</Text>
                        <Text style={styles.inforValue}>
                            {user?.dateOfBirth}
                        </Text>
                    </View>
                    <View>
                        <View
                            style={{
                                flexDirection: 'row',
                                marginHorizontal: 20,
                                marginTop: 10,
                                marginBottom: 10,
                                paddingVertical: 5,
                            }}
                        >
                            <Text style={styles.inforKey}>Điện thoại</Text>
                            <Text style={styles.inforValue}>
                                {user?.phoneNumber}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default Profile

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        width: windowWidth,
    },

    background: {
        width: '100%',
        height: windowHeight * 0.3,
        backgroundColor: '#ccc',
        objectFit: 'cover',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    avatar: {
        width: windowWidth * 0.28,
        height: windowWidth * 0.28,
        borderRadius: windowWidth * 0.14,
        borderWidth: 2,
        borderColor: '#fff',
        position: 'absolute',
        bottom: -windowWidth * 0.14,
        left: windowWidth * 0.5 - windowWidth * 0.14,
        objectFit: 'cover',
    },
    userName: {
        fontFamily: 'K2D_700Bold',
        fontSize: 27,
        color: '#000',
        width: windowWidth * 0.7,
        marginTop: windowWidth * 0.14,
        textAlign: 'center',
        alignSelf: 'center',
    },

    infor: {
        width: windowWidth,
        flex: 1,
        marginTop: 20,
    },
    inforHeader: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#000',
        marginLeft: 20,
    },
    inforWrap: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingVertical: 5,
    },
    inforKey: {
        fontSize: 17,
        color: '#000',
        width: windowWidth * 0.3,
    },
    inforValue: {
        fontSize: 17,
        color: '#000',
        alignSelf: 'flex-start',
        flex: 1,
    },
})
