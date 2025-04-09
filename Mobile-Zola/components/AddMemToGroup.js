import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    Dimensions,
    Alert,
} from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { UserType } from '../UserContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { url } from '../utils/constant'

const AddMemToGroup = ({ navigation, route }) => {
    const { accountId, setAccountId, conversations, setConversations } =
        useContext(UserType)
    const [search, setSearch] = useState('')
    const [members, setMembers] = useState([])
    const [users, setUsers] = useState([])
    const [userId, setUserId] = useState('')
    const [friends, setFriends] = useState([])
    const [name, setName] = useState('')

    const conversation = route.params.conversation
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
    const removeAccents = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    }
    const handleAddMember = async () => {
        try {
            const response = await axios.post(
                `${url}/conversation/add-member`,
                {
                    friend_ids: members.map((member) => member._id),
                    conversation_id: conversation._id,
                },
            )
            if (response.status === 200) {
                const newConversations = conversations.map((item) =>
                    item._id === conversation._id
                        ? { ...item, members: response.data.members }
                        : item,
                )

                Alert.alert('Thêm thành công')
                setConversations(newConversations)

                navigation.navigate('ChatInfo', { conversation: conversation })
            }
        } catch (error) {
            console.log('error message', error)
        }
    }
    return (
        <View style={styles.container}>
            <View style={styles.search}>
                <TextInput
                    style={styles.searchFriends}
                    placeholder="Tìm tên hoặc số điện thoại"
                    value={search}
                    onChangeText={(text) => handleFindUser(text)}
                />
            </View>
            <View style={styles.chooseMember}>
                <ScrollView>
                    {users.map((user) => (
                        <TouchableOpacity
                            key={user._id}
                            disabled={conversation.members.includes(user._id)}
                            style={styles.userFriend}
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
                                style={styles.userAvatar}
                                source={{ uri: user.avatar }}
                            />
                            {conversation.members.includes(user._id) ? (
                                <Text
                                    style={{
                                        color: 'gray',
                                        marginLeft: 10,
                                        fontSize: 18,
                                        flex: 1,
                                    }}
                                >
                                    {user.userName}
                                </Text>
                            ) : (
                                <Text style={styles.groupName}>
                                    {user.userName}
                                </Text>
                            )}
                            {members.includes(user) ||
                            conversation.members.includes(user._id) ? (
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
            <View style={styles.btnWrap}>
                <TouchableOpacity style={styles.btn} onPress={handleAddMember}>
                    <Text style={styles.btnText}>Thêm vào nhóm</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default AddMemToGroup
const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
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
        marginTop: 20,
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
