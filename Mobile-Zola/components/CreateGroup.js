import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { UserType } from '../UserContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { url } from '../utils/constant'

const CreateGroup = ({ navigation, route }) => {
    const [search, setSearch] = useState('')
    const [members, setMembers] = useState([])
    const [groupName, setGroupName] = useState('')
    const [groupAvatar, setGroupAvatar] = useState('')
    const [users, setUsers] = useState([])
    const { accountId, setAccountId, conversations, setConversations } =
        useContext(UserType)
    const [userId, setUserId] = useState('')
    const [friends, setFriends] = useState([])
    const [name, setName] = useState('')
    useEffect(() => {
        const getUserIdByAccountId = async () => {
            const token = await AsyncStorage.getItem('AuthToken')
            const decodedToken = jwtDecode(token)
            const accountId = decodedToken.accountId
            setAccountId(accountId)
            axios
                .get(`${url}/user/findUser?account_id=${accountId}`)
                .then((res) => {
                    setUserId(res.data._id)
                    setName(res.data.lastName)
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        getUserIdByAccountId()
    }, [])
    const fetchFriends = async () => {
        try {
            const response = await axios.get(`${url}/user/getFriends/${userId}`)
            if (response.status === 200) {
                const friendsData = response.data.map((friend) => ({
                    _id: friend._id,
                    userName: friend.userName,
                    phoneNumber: friend.phoneNumber,
                    lastName: friend.lastName,
                    avatar: friend.avatar,
                }))
                setFriends(friendsData)
            }
        } catch (error) {
            console.log('error message', error)
        }
    }
    useEffect(() => {
        if (userId !== '') {
            fetchFriends(userId)
        }
    }, [userId])
    useEffect(() => {
        setUsers(friends)
    }, [friends])
    console.log(users)
    const removeAccents = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    }
    const handleFindUser = (search) => {
        setSearch(search)
        if (search === '') {
            setUsers(friends)
        } else {
            setUsers(
                friends.filter(
                    (user) =>
                        user.phoneNumber.includes(search) ||
                        removeAccents(user.userName)
                            .toLowerCase()
                            .includes(removeAccents(search).toLowerCase()),
                ),
            )
        }
    }
    const createGroup = async () => {
        if (members.length < 2) {
            return alert('Nhóm phải có ít nhất 3 thành viên')
        }
        try {
            const { data } = await axios
                .post(`${url}/conversation/create-group`, {
                    user_id: userId,
                    friend_ids: members.map((member) => member._id),
                    members: [userId, ...members.map((member) => member._id)],
                    conversationName:
                        groupName === '' ? defaultGroupName : groupName,
                    groupLeader: userId,
                })
                .finally(() => {
                    navigation.navigate('Message')
                })

            setConversations([data, ...conversations])
            console.log('create group success')
        } catch (error) {
            console.log('create fail', error)
        }
    }
    const defaultGroupName =
        members.map((member) => member.lastName).join(', ') + ` ,${name}`
    return (
        <View style={style.container}>
            <View style={style.groupInfo}>
                <Image
                    style={style.groupAvatar}
                    source={require('../image/file.png')}
                />
                <TextInput
                    style={style.groupName}
                    placeholder="Đặt tên nhóm"
                    value={groupName}
                    onChangeText={(text) => setGroupName(text)}
                />
            </View>
            <View style={style.search}>
                <TextInput
                    style={style.searchFriends}
                    placeholder="Tìm tên hoặc số điện thoại"
                    value={search}
                    onChangeText={(text) => handleFindUser(text)}
                />
            </View>
            <View style={style.chooseMember}>
                <ScrollView>
                    {users.map((user) => (
                        <TouchableOpacity
                            key={user._id}
                            style={style.userFriend}
                            onPress={() => {
                                if (members.includes(user)) {
                                    setMembers(
                                        members.filter(
                                            (item) => item._id !== user._id,
                                        ),
                                    )
                                } else {
                                    setMembers([...members, user])
                                }
                            }}
                        >
                            <Image
                                style={style.userAvatar}
                                source={{ uri: user.avatar }}
                            />
                            <Text style={style.groupName}>{user.userName}</Text>
                            {members.includes(user) ? (
                                <Feather
                                    name="check-square"
                                    size={24}
                                    color="black"
                                />
                            ) : (
                                <Feather
                                    name="square"
                                    size={24}
                                    color="black"
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View style={style.btnWrap}>
                <TouchableOpacity
                    style={style.btn}
                    onPress={() => {
                        createGroup()
                    }}
                >
                    <Text style={style.btnText}>Tạo nhóm</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default CreateGroup

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    groupInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: windowHeight * 0.02,
        marginHorizontal: windowWidth * 0.05,
    },
    groupAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    groupName: {
        marginLeft: 10,
        fontSize: 18,
        flex: 1,
    },
    search: {
        marginBottom: windowHeight * 0.02,

        marginHorizontal: windowWidth * 0.05,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: 'gray',
        paddingHorizontal: 10,
    },
    searchFriends: {
        height: 40,
        fontSize: 17,
    },
    chooseMember: {
        flex: 1,
    },
    userFriend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: windowWidth * 0.05,
        marginVertical: windowHeight * 0.01,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },

    btnWrap: {
        height: windowHeight * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btn: {
        width: windowWidth * 0.9,
        height: windowHeight * 0.06,
        backgroundColor: '#1B96CB',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    btnText: {
        color: 'white',
        fontSize: 20,
    },
})
