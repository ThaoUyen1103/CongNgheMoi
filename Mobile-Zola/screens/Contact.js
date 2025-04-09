import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Image,
    ScrollView,
} from 'react-native'
import React, { useEffect, useContext, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
    MaterialIcons,
    EvilIcons,
    AntDesign,
    FontAwesome5,
    Feather,
} from '@expo/vector-icons'
import Tab from '../components/Tab'
import { UserType } from '../UserContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { url } from '../utils/constant'

const Contact = ({ navigation }) => {
    const { accountId, setAccountId } = useContext(UserType)
    const [userId, setUserId] = useState('')
    const [friends, setFriends] = useState([])
    const [users, setUsers] = useState([])

    useEffect(() => {
        const getUserIdByAccountId = async () => {
            const token = await AsyncStorage.getItem('AuthToken')
            const decodedToken = jwtDecode(token)
            const accountId = decodedToken.accountId
            setAccountId(accountId)
            axios
                .get(url + `/user/findUser?account_id=${accountId}`)
                .then((res) => {
                    setUserId(res.data._id)
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        getUserIdByAccountId()
    }, [])
    const fetchFriends = async () => {
        try {
            const response = await axios.get(url + `/user/getFriends/${userId}`)
            if (response.status === 200) {
                const friendsData = response.data.map((friend) => ({
                    _id: friend._id,
                    userName: friend.userName,
                    phoneNumber: friend.phoneNumber,
                    avatar: friend.avatar,
                }))
                setFriends(friendsData)
                console.log(friends)
            }
        } catch (error) {
            console.log('error message', error)
        }
    }
    useEffect(() => {
        if (userId) {
            fetchFriends(userId)
        }
    }, [userId])
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.search}>
                    <View style={styles.iconSearch}>
                        <Feather name="search" size={26} color="white" />
                    </View>
                    <Text style={styles.txtSearch}>Tìm kiếm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.add}
                    onPress={() => {
                        navigation.navigate('AddFriend')
                    }}
                >
                    <MaterialIcons
                        name="person-add-alt-1"
                        size={30}
                        color="white"
                        style={styles.iconAdd}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.option}>
                <TouchableOpacity
                    style={{
                        width: windowWidth * 0.4,
                        alignItems: 'center',
                    }}
                >
                    <Text style={styles.txtOption}>Bạn bè</Text>
                </TouchableOpacity>
                <Text
                    style={{
                        fontSize: 18,
                        margin: 0,
                        padding: 0,
                    }}
                >
                    |
                </Text>
                <TouchableOpacity
                    style={{
                        width: windowWidth * 0.4,
                        alignItems: 'center',
                    }}
                >
                    <Text style={styles.txtOption}>Nhóm</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.FriendRequests}>
                <TouchableOpacity
                    style={styles.btnRequest}
                    onPress={() => {
                        navigation.navigate('FriendRequest')
                    }}
                >
                    <FontAwesome5
                        name="user-friends"
                        size={24}
                        color="#1B96CB"
                    />
                    <Text style={styles.txtRequest}>Lời mời kết bạn</Text>
                </TouchableOpacity>
            </View>
            <ScrollView>
                <View style={styles.list}>
                    {friends.map((item) => {
                        return (
                            <View key={item._id}>
                                <TouchableOpacity style={styles.contact}>
                                    <View style={styles.avatarWrap}>
                                        <Image
                                            src={item.avatar}
                                            style={styles.avatar}
                                        />
                                    </View>

                                    <Text style={styles.name}>
                                        {item.userName}
                                    </Text>
                                    <TouchableOpacity style={styles.message}>
                                        <AntDesign
                                            name="message1"
                                            size={24}
                                            color="black"
                                        />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </View>
                        )
                    })}
                </View>
            </ScrollView>

            <View />
            <Tab />
        </SafeAreaView>
    )
}

export default Contact

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ddd',
        width: windowWidth,
    },
    header: {
        width: windowWidth,
        height: 60,
        backgroundColor: '#086dff',
        flexDirection: 'row',
        alignItems: 'center',
    },
    search: {
        flexDirection: 'row',
        alignItems: 'center',
        width: windowWidth * 0.8,
    },
    iconSearch: {
        width: windowWidth * 0.2,
        alignItems: 'center',
    },
    txtSearch: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        flex: 1,
    },
    iconAdd: {
        width: 28,
        height: 28,
    },
    add: {
        width: windowWidth * 0.2,
        alignItems: 'center',
    },

    option: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 40,
        backgroundColor: '#fff',
    },
    FriendRequests: {
        height: 50,
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    btnRequest: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
    },
    txtRequest: {
        marginLeft: 20,

        fontSize: 18,
        color: 'black',
    },
    txtOption: {
        fontSize: 18,
        color: 'black',
    },

    list: {
        height: Math.round(windowHeight) - 60,
        width: windowWidth,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    contact: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    avatarWrap: {
        width: windowWidth * 0.25,
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    name: {
        fontSize: 18,
        color: 'black',
        width: windowWidth * 0.6,
    },
    message: {
        width: windowWidth * 0.15,

        alignItems: 'center',
    },
})
