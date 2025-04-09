import {
    Pressable,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    Button,
} from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { UserType } from '../UserContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import { url } from '../utils/constant'

const FriendRequest = ({ navigation }) => {
    const { accountId, setAccountId } = useContext(UserType)
    const [userId, setUserId] = useState([])
    const [showButton, setShowButton] = useState(true)
    const [friendRequests, setFriendRequests] = useState([])
    const [sentFriendRequests, setSentFriendRequests] = useState([])
    const [currentView, setCurrentView] = useState(true)
    const toggleButton = () => {
        setShowButton(!showButton)
    }
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
                    //fetchFriendRequests(res.data._id)
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        getUserIdByAccountId()
    }, [])
    console.log(userId)

    const fetchFriendRequests = async () => {
        try {
            const response = await axios.get(
                url + `/user/friend-request/${userId}`,
            )
            if (response.status === 200) {
                const friendRequestsData = response.data.map(
                    (friendRequest) => ({
                        _id: friendRequest._id,
                        userName: friendRequest.userName,
                        phoneNumber: friendRequest.phoneNumber,
                        avatar: friendRequest.avatar,
                    }),
                )
                setFriendRequests(friendRequestsData)
            }
        } catch (error) {
            console.log('error message', error)
        }
    }
    const fetchSentFriendRequests = async () => {
        try {
            const response = await axios.get(
                url + `/user/getSentFriendRequests/${userId}`,
            )
            if (response.status === 200) {
                const sentFriendRequestsData = response.data.map(
                    (sentFriendRequest) => ({
                        _id: sentFriendRequest._id,
                        userName: sentFriendRequest.userName,
                        phoneNumber: sentFriendRequest.phoneNumber,
                        avatar: sentFriendRequest.avatar,
                    }),
                )
                setSentFriendRequests(sentFriendRequestsData)
            }
        } catch (error) {
            console.log('error message', error)
        }
    }

    useEffect(() => {
        const onFocused = navigation.addListener('focus', () => {
            fetchFriendRequests(userId)
            fetchSentFriendRequests(userId)
        })
        fetchFriendRequests(userId)
        fetchSentFriendRequests(userId)
    }, [userId, navigation])
    // console.log(friendRequests)
    const acceptRequest = async (friendRequestId) => {
        try {
            const response = await fetch(url + `/user/friend-request/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    friend_id: friendRequestId,
                }),
            }).finally(() => {
                Alert.alert('Thông báo', 'Chấp nhận lời mời kết bạn thành công')
                fetchFriendRequests(userId)
            })
            if (response.ok) {
                setFriendRequests(
                    friendRequests.filter(
                        (request) => request._id !== friendRequestId,
                    ),
                )
            }
        } catch (error) {
            console.log('error accept friend request', error)
        }
    }
    const recallRequest = async (sentfriendRequestId) => {
        try {
            const response = await fetch(url + `/user/recallsentRequest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    friend_id: sentfriendRequestId,
                }),
            })
            if (response.ok) {
                setSentFriendRequests(
                    sentFriendRequests.filter(
                        (request) => request._id !== sentfriendRequestId,
                    ),
                )
            }
        } catch (error) {
            console.log('error recall friend request', error)
        }
    }
    const declineRequest = async (friendRequestId) => {
        try {
            const response = await fetch(url + `/user/friend-request/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    friend_id: friendRequestId,
                }),
            })
            if (response.ok) {
                setFriendRequests(
                    friendRequests.filter(
                        (request) => request._id !== friendRequestId,
                    ),
                )
            }
        } catch (error) {
            console.log('error decline friend request', error)
        }
    }

    const ReceivedRequests = () => {
        // Fetch and render received friend requests
        return (
            <View>
                {/* {friendRequests.length > 0 && <Text>Your Friend Requests </Text>} */}
                {friendRequests.map((item, index) => {
                    return (
                        <View key={index} style={styles.reciveWrap}>
                            <View style={styles.request}>
                                <Image
                                    style={{
                                        height: 50,
                                        width: 50,
                                        borderRadius: 25,
                                    }}
                                    source={{ uri: item?.avatar }}
                                />
                                <Text style={styles.txtName}>
                                    {item?.userName} đã gửi cho bạn lời mời kết
                                    bạn
                                </Text>
                            </View>
                            <View style={styles.action}>
                                <TouchableOpacity
                                    style={styles.btnAccept}
                                    onPress={() => acceptRequest(item?._id)}
                                >
                                    <Text style={styles.txtBtn}>Chấp nhận</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.btnDecline}
                                    onPress={() => declineRequest(item?._id)}
                                >
                                    <Text style={styles.txtBtn}>Từ chối</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                })}
            </View>
        )
    }

    const SentRequests = () => {
        // Fetch and render sent friend requests
        return (
            <View>
                {/* {sentFriendRequests.length > 0 && <Text>Your Sent Friend Requests </Text>} */}
                {sentFriendRequests.map((item, index) => {
                    return (
                        <View key={index} style={styles.reciveWrap}>
                            <View style={styles.recive}>
                                <Image
                                    style={{
                                        height: 50,
                                        width: 50,
                                        borderRadius: 25,
                                    }}
                                    source={{ uri: item?.avatar }}
                                />
                                <Text style={styles.txtName}>
                                    {item?.userName}
                                </Text>
                                <TouchableOpacity
                                    style={styles.recall}
                                    onPress={() => recallRequest(item?._id)}
                                >
                                    <Text
                                        style={{
                                            color: '#fff',
                                            fontSize: 16,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Thu hồi
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                })}
            </View>
        )
    }
    // const [index, setIndex] = useState(0)
    // const [routes] = useState([
    // { key: 'first', title: 'Đã nhận' },
    // { key: 'second', title: 'Đã gửi' },
    // ])
    // const renderScene = SceneMap({
    // first: ReceivedRequests,
    // second: ReceivedRequests,
    // })

    return (
        // <TabView
        // navigationState={{ index, routes }}
        // renderScene={renderScene}
        // onIndexChange={setIndex}
        // initialLayout={{ width: Dimensions.get('window').width }}
        // renderTabBar={(props) => (
        // <TabBar
        // {...props}
        // style={{ backgroundColor: '#086dff' }}
        // labelStyle={{ color: 'white', fontWeight: 600 }}
        // />
        // )}
        // />
        <View style={styles.wrap}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={currentView ? styles.onFocus : styles.notFocus}
                    onPress={() => setCurrentView(true)}
                >
                    <Text
                        style={
                            currentView
                                ? { color: 'white', fontSize: 18 }
                                : { color: 'black', fontSize: 18 }
                        }
                    >
                        Đã nhận
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={!currentView ? styles.onFocus : styles.notFocus}
                    onPress={() => setCurrentView(false)}
                >
                    <Text
                        style={
                            !currentView
                                ? { color: 'white', fontSize: 18 }
                                : { color: 'black', fontSize: 18 }
                        }
                    >
                        Đã gửi
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.body}>
                {currentView ? <ReceivedRequests /> : <SentRequests />}
            </View>
        </View>
    )
}
export default FriendRequest

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    reciveWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // margin: 10,
        width: windowWidth,
        borderTopColor: 'gray',
        borderTopWidth: 1,
        paddingVertical: 10,
    },
    request: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: windowWidth * 0.8,
        alignSelf: 'center',
    },
    action: {
        flexDirection: 'row',
        alignSelf: 'center',
    },
    btnAccept: {
        backgroundColor: '#1B96CB',
        borderRadius: 15,
        width: 120,
        height: 40,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnDecline: {
        backgroundColor: 'red',
        borderRadius: 15,
        width: 120,
        height: 40,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    txtName: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        marginLeft: 15,
    },
    txtBtn: {
        color: 'white',
        fontSize: 16,
    },
    recall: {
        backgroundColor: 'blue',
        borderRadius: 15,
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
    },
    wrap: {
        //flexDirection: 'row',
        //justifyContent: 'space-around',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        backgroundColor: '#fff',
    },
    body: {
        backgroundColor: '#fff',
    },
    txtRequest: {
        fontSize: 18,
        color: 'black',
    },
    onFocus: {
        backgroundColor: '#086dff',
        alignItems: 'center',
        padding: 10,
        width: windowWidth / 2,
    },
    notFocus: {
        backgroundColor: 'white',
        padding: 10,
        alignItems: 'center',
        width: windowWidth / 2,
    },
    recive: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: windowWidth * 0.9,
        alignSelf: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
})
