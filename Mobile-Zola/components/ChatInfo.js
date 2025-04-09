import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Modal,
    Alert,
    TextInput,
    Button,
    Pressable,
} from 'react-native'
import React from 'react'
import {
    AntDesign,
    Feather,
    MaterialCommunityIcons,
    Entypo,
    MaterialIcons,
    Ionicons,
} from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { useEffect } from 'react'
import { url } from '../utils/constant'
import axios from 'axios'

const ChatInfo = ({ navigation, route }) => {
    const conver = route.params.conversation

    const [conversation, setConversation] = useState(conversation)
    const currentUserId = route.params.currentUserId

    const [modalVisible, setModalVisible] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [userData, setUserData] = useState(null)
    const handleUpdate = async () => {
        const { data } = axios
            .put(`${url}/conversations/change-groupname`, {
                conversationName: groupName,
                conversation_id: conversation._id,
            })
            .finally(async () => {
                const message = {
                    senderId: currentUserId,
                    content:
                        userData.userName +
                        ' đã đổi tên nhóm thành ' +
                        groupName,
                    conversation_id: conversation._id,
                    contentType: 'notify',
                }
                //send message to database
                try {
                    const { data } = await axios.post(
                        url + `/messages/`,
                        message,
                    )
                    // socket.current.emit('new message', data)
                } catch (error) {
                    console.log(error)
                }
            })

        // Close the modal
        setModalVisible(false)
    }

    const fetchConversation = async () => {
        try {
            axios
                .get(`${url}/conversation/findConversationById/${conver._id}`)
                .then((res) => {
                    setConversation(res.data)
                    setGroupName(res.data.conversationName)
                })
        } catch (error) {
            console.log(error)
        }
    }

    const fetchUserData = async () => {
        try {
            axios
                .get(`${url}/user/findUserByUserId/${currentUserId}`)
                .then((res) => {
                    setUserData(res.data)
                })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchUserData()
        fetchConversation()
        const onFocused = navigation.addListener('focus', () => {
            fetchConversation()
        })
    }, [navigation])

    const updateAvatar = async (urlImage) => {
        try {
            axios
                .put(
                    `${url}/conversation/updateConversationAvatar`,
                    {
                        conversation_id: conversation._id,
                        avatar: urlImage,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                )
                .then((res) => {
                    console.log(res.data)
                })
                .finally(async () => {
                    fetchConversation()
                    Alert.alert(
                        'Thông báo',
                        'Cập nhật ảnh đại diện nhóm thành công',
                    )
                    const message = {
                        senderId: currentUserId,
                        content:
                            userData.userName +
                            ' đã cập nhật ảnh đại diện nhóm',
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

    const handleChangeAvatar = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        const data = new FormData()
        data.append('file', {
            uri: result.assets[0].uri,
            type: 'image/jpeg' || 'image/png' || 'image/jpg',
            name: 'image.jpg',
        })
        data.append('upload_preset', 'myzolaapp')
        data.append('cloud_name', 'dpj4kdkxj')

        fetch('https://api.cloudinary.com/v1_1/dpj4kdkxj/image/upload', {
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                console.log('Success:', data.url)
                updateAvatar(data.url)
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }

    const handleOutGroup = async (userID, conversationID) => {
        if (userID === conversation?.groupLeader) {
            Alert.alert(
                'Thông báo',
                'Bạn không thể rời nhóm khi là trưởng nhóm. Hãy chuyển quyền trưởng nhóm cho thành viên khác trước khi rời nhóm',
            )
        } else {
            Alert.alert(
                'Chuyển quyền trưởng nhóm',
                'Người được chọn sẽ có quyền quản lý nhóm. Bạn sẽ mất quyền trưởng nhóm nhưng vẫn là một thành viên của nhóm. Hành động này không thể phục hồi',
                [
                    {
                        text: 'Hủy',
                        style: 'cancel',
                    },
                    {
                        text: 'Đồng ý',
                        onPress: async () => {
                            try {
                                //chang group leader
                                await axios
                                    .put(
                                        `${url}/conversation/authorizeGroupLeader`,
                                        {
                                            conversation_id: conversationID,
                                            user_id: userID,
                                            friend_id:
                                                conversation?.members[0]._id,
                                        },
                                        {
                                            headers: {
                                                'Content-Type':
                                                    'application/json',
                                            },
                                        },
                                    )
                                    .then((res) => {
                                        console.log(res.data)
                                    })
                                    .finally(() => {
                                        fetchConversation()
                                        Alert.alert(
                                            'Thông báo',
                                            'Chuyển quyền trưởng nhóm thành công',
                                        )
                                    })
                            } catch (error) {
                                console.log(error)
                            }
                        },
                    },
                ],
            )
        }
    }

    const handleDisbandGroup = async (conversationID, userID) => {
        try {
            Alert.alert('Thông báo', 'Bạn có chắc chắn muốn giải tán nhóm?', [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        await axios
                            .put(`${url}/conversation/disbandGroup`, {
                                conversation_id: conversationID,
                                user_id: userID,
                            })
                            .then((res) => {
                                console.log(res.data)
                            })
                            .finally(() => {
                                fetchConversation()
                                Alert.alert(
                                    'Thông báo',
                                    'Giải tán nhóm thành công',
                                )
                                navigation.navigate('Message')
                            })
                    },
                },
            ])
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <ScrollView style={styles.container}>
            <Image
                source={{ uri: conversation?.avatar }}
                style={styles.avatar}
            />
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingBottom: 10,
                }}
            >
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: 20,
                        fontWeight: 'bold',
                    }}
                >
                    {groupName}
                </Text>
                <TouchableOpacity style={styles.btn}>
                    <AntDesign name="edit" size={22} color="black" />
                </TouchableOpacity>
            </View>
            <View style={{ height: 10, backgroundColor: '#e0e0e0' }}></View>
            <TouchableOpacity
                style={styles.wrap}
                onPress={() =>
                    navigation.navigate('AddMemToGroup', { conversation })
                }
            >
                <Feather
                    name="user-plus"
                    size={22}
                    color="black"
                    style={styles.icon}
                />
                <Text style={styles.text}>Thêm thành viên</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.wrap}
                onPress={() =>
                    navigation.navigate('MembersList', {
                        conversation,
                        currentUserId,
                    })
                }
            >
                <MaterialCommunityIcons
                    name="account-group-outline"
                    size={24}
                    color="black"
                    style={styles.icon}
                />
                <Text style={styles.text}>
                    Thành viên nhóm ({conversation?.members.length})
                </Text>
                <Entypo
                    name="chevron-right"
                    size={24}
                    color="black"
                    style={styles.icon}
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.wrap}
                onPress={() => setModalVisible(true)}
            >
                <AntDesign
                    name="edit"
                    size={24}
                    color="black"
                    style={styles.icon}
                />
                <Text style={styles.text}>Chỉnh sửa tên nhóm</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.wrap}
                onPress={() => {
                    handleChangeAvatar()
                }}
            >
                <Ionicons
                    name="camera-reverse-sharp"
                    size={24}
                    color="black"
                    style={styles.icon}
                />
                <Text style={styles.text}>Đổi ảnh nhóm</Text>
            </TouchableOpacity>
            {currentUserId === conversation?.groupLeader ||
            conversation?.deputyLeader?.includes(currentUserId) ? (
                <TouchableOpacity
                    style={styles.wrap}
                    onPress={() => {
                        navigation.navigate('LoadMember', {
                            conversation,
                            currentUserId,
                        })
                    }}
                >
                    <MaterialCommunityIcons
                        name="account-key-outline"
                        size={24}
                        color="black"
                        style={styles.icon}
                    />
                    <Text style={styles.text}>Chuyển quyền trưởng nhóm</Text>
                </TouchableOpacity>
            ) : null}
            {currentUserId === conversation?.groupLeader ? (
                <TouchableOpacity
                    style={styles.wrap}
                    onPress={() => {
                        handleDisbandGroup(conversation._id, currentUserId)
                    }}
                >
                    <MaterialIcons
                        name="group-off"
                        size={24}
                        color="red"
                        style={styles.icon}
                    />
                    <Text style={styles.textForce}>Giải tán nhóm</Text>
                </TouchableOpacity>
            ) : null}
            <TouchableOpacity
                style={styles.wrap}
                onPress={() => {
                    handleOutGroup(currentUserId, conversation._id)
                }}
            >
                <Feather
                    name="log-out"
                    size={24}
                    color="red"
                    style={styles.icon}
                />
                <Text style={styles.textForce}>Rời nhóm</Text>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible)
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={{
                                width: 200,
                                height: 40,
                                marginBottom: 10,
                                borderRadius: 5,
                                fontSize: 17,
                                paddingHorizontal: 10,
                                borderColor: 'gray',
                                borderWidth: 1,
                            }}
                            value={groupName}
                            onChangeText={(text) => setGroupName(text)}
                        />
                        <TouchableOpacity
                            onPress={handleUpdate}
                            style={{
                                backgroundColor: '#2196F3',
                                borderRadius: 15,
                                padding: 5,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 17,
                                    color: '#fff',
                                    paddingHorizontal: 20,
                                }}
                            >
                                Lưu
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    )
}

export default ChatInfo

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignSelf: 'center',
        marginVertical: windowHeight * 0.02,
    },
    btn: {
        paddingHorizontal: 10,
    },
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: windowHeight * 0.02,
        borderBottomWidth: 1,
        borderColor: 'gray',
    },
    text: {
        fontSize: 17,
        flex: 1,
    },
    textForce: {
        fontSize: 17,
        color: 'red',
        flex: 1,
    },
    icon: {
        marginHorizontal: windowWidth * 0.05,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
})
