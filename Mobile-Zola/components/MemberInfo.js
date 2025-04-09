import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Dimensions,
    Alert,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { url } from '../utils/constant'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const MemberInfo = ({
    member,
    leader,
    deputyLeader,
    currentUserId,
    id,
    fetchConversation,
}) => {
    const navigation = useNavigation()
    const [userData, setUserData] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [userId, setUserId] = useState(null)

    const getUserData = async () => {
        axios.get(`${url}/user/findUserByUserId/${member}`).then((res) => {
            setUserData(res.data)
        })
    }
    useEffect(() => {
        getUserData()
    }, [member])

    const handleauthorizeDeputyLeader = async (userID) => {
        try {
            await axios
                .put(
                    `${url}/conversation/authorizeDeputyLeader`,
                    {
                        conversation_id: id,
                        user_id: currentUserId,
                        friend_id: userID,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                )
                .then((res) => {
                    console.log(res.data)
                    setModalVisible(!modalVisible)
                })
                .finally(async () => {
                    Alert.alert('Thông báo', 'Gán quyền phó nhóm thành công')
                    fetchConversation()
                    const message = {
                        senderId: currentUserId,
                        content: `${userData?.userName} đã được nhóm trưởng thêm vào vị trí phó nhóm`,
                        conversation_id: conversation._id,
                        contentType: 'notify',
                    }
                    //send message to database
                    try {
                        const { data } = await axios.post(
                            url + `/message/`,
                            message,
                        )
                        // socket.current.emit('new message', data)
                    } catch (error) {
                        console.log(error)
                    }
                })
        } catch (error) {
            console.log(error)
        }
    }

    const handleDeleteMember = async (userID) => {
        try {
            await axios
                .put(
                    `${url}/conversation/removeMemberFromConversationGroup`,
                    {
                        conversation_id: id,
                        user_id: currentUserId,
                        friend_id: userID,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                )
                .then((res) => {
                    console.log(res.data)
                    setModalVisible(!modalVisible)
                })
                .finally(async () => {
                    Alert.alert(
                        'Thông báo',
                        'Xóa thành viên khỏi nhóm thành công',
                    )
                    fetchConversation()
                    const message = {
                        senderId: currentUserId,
                        content: `${userData?.userName} đã bị nhóm trưởng xóa khỏi nhóm`,
                        conversation_id: conversation._id,
                        contentType: 'notify',
                    }
                    //send message to database
                    try {
                        const { data } = await axios.post(
                            url + `/message/`,
                            message,
                        )
                        // socket.current.emit('new message', data)
                    } catch (error) {
                        console.log(error)
                    }
                })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <TouchableOpacity style={styles.wrap}>
            <Image
                source={{ uri: userData?.avatar }}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginLeft: 20,
                }}
            />
            <Text style={styles.userName}>{userData?.userName}</Text>
            {
                // check if member is the current user
                member != currentUserId ? (
                    <TouchableOpacity
                        style={styles.btn}
                        onPress={() => {
                            setModalVisible(!modalVisible)
                        }}
                    >
                        <MaterialCommunityIcons
                            name="dots-vertical"
                            size={24}
                            color="black"
                        />
                    </TouchableOpacity>
                ) : null
            }
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setModalVisible(!modalVisible)
                }}
            >
                <TouchableWithoutFeedback
                    style={{
                        flex: 1,
                        height: windowHeight,
                        width: windowWidth,
                    }}
                    onPress={() => {
                        setModalVisible(!modalVisible)
                    }}
                >
                    <View
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            flex: 1,
                            height: windowHeight,
                            width: windowWidth,
                        }}
                    >
                        <View
                            style={{
                                height: 'auto',
                                backgroundColor: 'white',
                                position: 'absolute',
                                bottom: 0,
                                width: '100%',
                                paddingHorizontal: 10,
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                            }}
                        >
                            <TouchableOpacity
                                style={styles.listItem}
                                onPress={() => {
                                    navigation.navigate('Profile', {
                                        userId: userData._id,
                                    })
                                }}
                            >
                                <Text style={styles.listText}>
                                    Xem thông tin
                                </Text>
                            </TouchableOpacity>
                            {leader === currentUserId ? (
                                <TouchableOpacity
                                    style={styles.listItem}
                                    onPress={() => {
                                        setUserId(userData._id)
                                        handleauthorizeDeputyLeader(
                                            userData._id,
                                        )
                                    }}
                                >
                                    <Text style={styles.listText}>
                                        Làm phó nhóm
                                    </Text>
                                </TouchableOpacity>
                            ) : null}

                            {
                                // Check if the current user is the leader or deputy leader
                                leader === currentUserId ||
                                deputyLeader.includes(member) ? (
                                    <TouchableOpacity
                                        style={styles.listItem}
                                        onPress={() => {
                                            handleDeleteMember(userData._id)
                                        }}
                                    >
                                        <Text style={styles.listText}>
                                            Xóa khỏi nhóm
                                        </Text>
                                    </TouchableOpacity>
                                ) : null
                            }
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </TouchableOpacity>
    )
}

export default MemberInfo

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    userName: {
        marginLeft: 10,
        fontSize: 18,
        color: 'black',
        flex: 1,
    },
    btn: {
        paddingHorizontal: 10,
    },
    listItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: 'gray',
        alignItems: 'center',
    },
    listText: {
        fontSize: 17,
    },
})
