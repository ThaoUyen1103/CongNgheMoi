import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    Modal,
    TouchableWithoutFeedback,
    Alert,
    ScrollView,
} from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { AntDesign, Entypo, MaterialIcons } from '@expo/vector-icons'
import Tab from '../components/Tab'
import { UserType } from '../UserContext'

import { SafeAreaView } from 'react-native-safe-area-context'
import {
    Feather,
    MaterialCommunityIcons,
    Ionicons,
    FontAwesome,
} from '@expo/vector-icons'
import io from 'socket.io-client'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import ForwardMessage from '../components/ForwardMessage'
import { url } from '../utils/constant'
import { LinearGradient } from 'expo-linear-gradient';

import { Video, ResizeMode, Audio } from 'expo-av'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'

const Cloud = ({ navigation }) => {
    const { cloud, setCloud, accountId, setAccountId } = useContext(UserType)
    console.log(cloud)
    const [cloudMessages, setCloudMessages] = useState([])
    const [socket, setSocket] = useState(null)
    //const [messages, setMessages] = useState([])
    const [newMessageCloud, setNewMessageCloud] = useState('')
    const [sendMessage, setSendMessage] = useState(null)
    const [isShowModalSend, setIsShowModalSend] = useState(false)
    //const [isShowModalRecive, setIsShowModalRecive] = useState(false)
    const [modalForward, setModalForward] = useState(false)
    const [modalMessage, setModalMessage] = useState('')
    const [modalAvatar, setModalAvatar] = useState('')
    const [modalTime, setModalTime] = useState('')
    const [messageId, setMessageId] = useState('')
    const [date, setDate] = useState('')
    const [type, setType] = useState('text')
    const [userConversation, setUserConversation] = useState([])
    const [currentUserId, setCurrentUserId] = useState('')
    const getUserIdByAccountId = async () => {
        const token = await AsyncStorage.getItem('AuthToken')
        const decodedToken = jwtDecode(token)
        setAccountId(decodedToken.accountId)
        console.log(accountId)
        axios
            .get(url + `/user/findUser?account_id=${accountId}`)
            .then((res) => {
                setCurrentUserId(res.data._id)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const fetchMessages = async () => {
        try {
            const response = await fetch(url + `/message/${cloud._id}`)
            const data = await response.json()
            // neu có id của người dùng trong deletedBy thì không hiển thị tin nhắn
            // const dataFilter = data.filter((message) => {
            // if (message.deletedBy.includes(currentUserId)) {
            // return false
            // }
            // return true
            // })
            setCloudMessages(data.reverse())
            // socket.current.emit('join chat', conversation._id) old socket
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (cloud !== null) {
            fetchMessages()
            getUserIdByAccountId()
            const newSocket = io('http://192.168.1.125:3005')
            newSocket.emit('conversation_id', cloud._id)
            newSocket.on('receive-message', (data) => {
                // alert('Received message:', data)
                console.log(data)
                const messageArray = JSON.parse(data)
                // Kiểm tra xem messageArray có phải là mảng hay không
                if (Array.isArray(messageArray)) {
                    setCloudMessages((prevMessages) => [
                        ...messageArray,
                        ...prevMessages,
                    ])
                } else {
                    // Nếu không, chuyển nó thành một mảng và thêm vào messages
                    setCloudMessages((prevMessages) => [
                        messageArray,
                        ...prevMessages,
                    ])
                }
            })
            setSocket(newSocket)
        }
    }, [cloud])

    const handleSendImageMessage = async (imageMessage) => {
        const data = new FormData()
        data.append('file', {
            uri: imageMessage,
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
                console.log('Success:', data)
                const message = {
                    senderId: currentUserId,
                    content: data.url,
                    conversation_id: cloud?._id,
                    contentType: 'image',
                }
                //send message to database
                axios
                    .post(url + `/message/`, message)
                    .then(({ data }) => {
                        setCloudMessages([data, ...cloudMessages])
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            })
            .catch((error) => {
                console.error('Error:', error)
            })
            .finally(() => { })
    }

    const handleSendDocumentMessage = async (uri, mimeType, name) => {
        const data = new FormData()
        data.append('file', {
            uri: uri,
            type: mimeType,
            name: name,
        })
        data.append('upload_preset', 'myzolaapp')
        data.append('cloud_name', 'dpj4kdkxj')

        fetch('https://api.cloudinary.com/v1_1/dpj4kdkxj/upload', {
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
                console.log('Success:', data)
                const message = {
                    senderId: currentUserId,
                    content: data.url,
                    conversation_id: cloud?._id,
                    contentType: 'file',
                }
                //send message to database
                axios
                    .post(url + `/message/`, message)
                    .then(({ data }) => {
                        setCloudMessages([data, ...cloudMessages])
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            })
            .catch((error) => {
                console.error('Error:', error)
            })
            .finally(() => { })
    }

    const handleSendVideoMessage = async (videoMessage) => {
        const data = new FormData()
        data.append('file', {
            uri: videoMessage,
            type: 'video/mp4',
            name: 'video.mp4',
        })
        data.append('upload_preset', 'myzolaapp')
        data.append('cloud_name', 'dpj4kdkxj')

        fetch('https://api.cloudinary.com/v1_1/dpj4kdkxj/video/upload', {
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
                console.log('Success:', data)
                const message = {
                    senderId: currentUserId,
                    content: data.url,
                    conversation_id: cloud?._id,
                    contentType: 'video',
                }
                //send message to database
                axios
                    .post(url + `/message/`, message)
                    .then(({ data }) => {
                        setCloudMessages([data, ...cloudMessages])
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            })
            .catch((error) => {
                console.error('Error:', error)
            })
            .finally(() => { })
    }

    const pickDocument = async () => {
        try {
            console.log('Chọn tệp')
            const result = await DocumentPicker.getDocumentAsync()
            console.log('Tệp đã được chọn:', result)

            if (result) {
                // get file type
                const fileType = result.assets[0].name.split('.').pop()
                if (
                    fileType === 'jpg' ||
                    fileType === 'jpeg' ||
                    fileType === 'png'
                ) {
                    handleSendImageMessage(result.assets[0].uri)
                } else if (fileType === 'mp4') {
                    handleSendVideoMessage(result.assets[0].uri)
                } else {
                    handleSendDocumentMessage(
                        result.assets[0].uri,
                        result.assets[0].mimeType,
                        result.assets[0].name,
                    )
                }
            } else {
                console.log('Hủy chọn tệp')
            }
        } catch (error) {
            console.error('Lỗi chọn tệp:', error)
        }
    }

    const handleSendImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        })

        console.log(result.assets[0])

        if (!result.canceled) {
            //check file if it is image or video
            if (result.assets[0].type === 'image') {
                handleSendImageMessage(result.assets[0].uri)
            } else if (result.assets[0].type === 'video') {
                handleSendVideoMessage(result.assets[0].uri)
            }
        } else {
            console.log('canceled')
        }
    }
    const handleSend = async (e) => {
        e.preventDefault()
        const message = {
            senderId: currentUserId,
            content: newMessageCloud,
            conversation_id: cloud._id,
            contentType: 'text',
        }
        //send message to database
        try {
            const { data } = await axios.post(url + `/message/`, message)
            console.log(data)
            //socket.current.emit('new message', data) old socket
            // socket.emit('send-message', data)
            setCloudMessages([data, ...cloudMessages])
            setNewMessageCloud('')
        } catch (error) {
            console.log(error)
        }
    }
    const handleDelete = async () => {
        alert('Xóa tin nhắn', 'Bạn có chắc chắn muốn xóa tin nhắn này?', [
            {
                text: 'Hủy',
                onPress: () => setIsShowModalSend(false),
                style: 'cancel',
            },
            {
                text: 'Đồng ý',
                onPress: async () => {
                    try {
                        axios
                            .put(url + `/message/deleteMessage`, {
                                message_id: messageId,
                                user_id: currentUserId,
                            })
                            .finally(() => {
                                fetchMessages()
                            })
                        setIsShowModalSend(false)
                    } catch (error) {
                        setIsShowModalSend(false)
                        console.log(error)
                    }
                },
            },
        ])
    }
    const handleForwardMessage = (modalMessage) => {
        console.log('forward', modalMessage)
        setModalForward(true)
        setIsShowModalSend(false)
        //setIsShowModalRecive(false)
        const getConversations = async (currentUserId) => {
            axios
                .get(url + `/conversation/${currentUserId}`)
                .then((res) => {
                    setUserConversation(res.data)
                    console.log(res.data)
                })
                .catch((error) => {
                    console.log('error message', error)
                })
        }
        getConversations(currentUserId)
    }

    const ItemSend = ({ content, createdAt, messageId, recall, type }) => {
        return (
            <View style={styles.RightMsg}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                    }}
                >
                    {!recall ? (
                        <TouchableOpacity
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 5,
                            }}
                            onPress={() => {
                                setIsShowModalSend(true)
                                setModalMessage(content)
                                setModalTime(
                                    moment(createdAt)
                                        .utcOffset('+07:00')
                                        .format('DD/MM/YYYY HH:mm'),
                                )
                                setMessageId(messageId)
                                setDate(createdAt)
                                setType(type)
                            }}
                        >
                            <MaterialCommunityIcons
                                name="dots-vertical"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                    ) : null}
                    <View style={styles.messageSend}>
                        {recall ? (
                            <Text
                                style={{
                                    fontSize: 17,
                                    color: '#8F9BB3',
                                    fontStyle: 'italic',
                                }}
                            >
                                Tin nhắn đã được thu hồi
                            </Text>
                        ) : type === 'text' ? (
                            <Text
                                style={{
                                    fontSize: 17,
                                }}
                            >
                                {content}
                            </Text>
                        ) : type === 'image' ? (
                            <Image
                                source={{ uri: content }}
                                style={{
                                    width: windowWidth * 0.7,

                                    height: 'auto', // 100% 'auto
                                    minHeight: 200,
                                    objectFit: 'contain',
                                    alignSelf: 'center',
                                }}
                            />
                        ) : type === 'video' ? (
                            <View>
                                <Video
                                    style={styles.video}
                                    source={{
                                        uri: content,
                                    }}
                                    resizeMode={ResizeMode.CONTAIN}
                                    isLooping
                                    useNativeControls
                                />
                                {/* <View style={styles.buttons}>
                                    <Button
                                        title={
                                            status.isPlaying ? 'Pause' : 'Play'
                                        }
                                        onPress={() =>
                                            status.isPlaying
                                                ? video.current.pauseAsync()
                                                : video.current.playAsync()
                                        }
                                    />
                                </View> */}
                            </View>
                        ) : type === 'file' ? (
                            <View>
                                <TouchableOpacity
                                    onPress={() => {
                                        handleDownloadFile(content)
                                    }}
                                    style={{
                                        backgroundColor: '#fff',
                                        padding: 10,
                                        borderRadius: 10,
                                        marginVertical: 10,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    {content.split('.').pop() === 'pdf' ? (
                                        <Image
                                            style={{
                                                width: 30,
                                                height: 30,
                                                marginRight: 10,
                                            }}
                                            source={require('../image/pptx-file.png')}
                                        />
                                    ) : content.split('.').pop() === 'docx' ? (
                                        <Image
                                            style={{
                                                width: 30,
                                                height: 30,
                                                marginRight: 10,
                                            }}
                                            source={require('../image/docx-file.png')}
                                        />
                                    ) : content.split('.').pop() === 'rar' ? (
                                        <Image
                                            style={{
                                                width: 30,
                                                height: 30,
                                                marginRight: 10,
                                            }}
                                            source={require('../image/rar.png')}
                                        />
                                    ) : content.split('.').pop() === 'xlsx' ? (
                                        <Image
                                            style={{
                                                width: 30,
                                                height: 30,
                                                marginRight: 10,
                                            }}
                                            source={require('../image/xlsx-file.png')}
                                        />
                                    ) : content.split('.').pop() === 'txt' ? (
                                        <Image
                                            style={{
                                                width: 30,
                                                height: 30,
                                                marginRight: 10,
                                            }}
                                            source={require('../image/txt.png')}
                                        />
                                    ) : (
                                        <Image
                                            style={{
                                                width: 30,
                                                height: 30,
                                                marginRight: 10,
                                            }}
                                            source={require('../image/file.png')}
                                        />
                                    )}
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            maxWidth: windowWidth * 0.5,
                                        }}
                                    >
                                        {content
                                            .split('/')
                                            .pop()
                                            .split('_')
                                            .slice(0, -1)
                                            .join('_') +
                                            '.' +
                                            content.split('.').pop()}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}
                        {
                            // kiểm tra createdAt có phải là hôm nay không
                            moment(createdAt).isSame(new Date(), 'day') ? (
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: '#737373',
                                    }}
                                >
                                    {moment(createdAt)
                                        .utcOffset('+07:00')
                                        .format('HH:mm')}
                                </Text>
                            ) : !moment(createdAt).isSame(
                                new Date(),
                                'year',
                            ) ? (
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: '#737373',
                                    }}
                                >
                                    {moment(createdAt)
                                        .utcOffset('+07:00')
                                        .format('DD/MM/YYYY HH:mm')}
                                </Text>
                            ) : (
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: '#737373',
                                    }}
                                >
                                    {moment(createdAt)
                                        .utcOffset('+07:00')
                                        .format('DD/MM HH:mm')}
                                </Text>
                            )
                        }
                    </View>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#474bff', '#478eff']}
                useAngle={true}
                angle={90}
                style={styles.header}
            >
                <Text style={styles.txtHeader}>{cloud.conversationName}</Text>

                <TouchableOpacity
                    style={{
                        paddingHorizontal: windowWidth * 0.01,
                    }}
                ></TouchableOpacity>
            </LinearGradient>
            <View style={styles.body}>
                <FlatList
                    style={{
                        backgroundColor: '#d4d4d4',
                    }}
                    data={cloudMessages}
                    renderItem={({ item }) => {
                        return (
                            <ItemSend
                                content={item.content}
                                createdAt={item.createdAt}
                                messageId={item._id}
                                recall={item.recalled}
                                type={item.contentType}
                            />
                        )
                    }}
                    keyExtractor={(item) => item._id}
                    inverted
                    scrollEnabled={true}
                ></FlatList>
            </View>
            <View style={styles.chat}>
                <TouchableOpacity style={styles.iconBtn}>
                    <AntDesign name="smileo" size={24} color="black" />
                </TouchableOpacity>
                <TextInput
                    style={{
                        flex: 1,
                        height: 45,
                        borderRadius: 10,
                        fontSize: 17,
                        paddingHorizontal: 10,
                    }}
                    value={newMessageCloud}
                    onChangeText={(value) => setNewMessageCloud(value)}
                    placeholder="Nhập tin nhắn..."
                />
                <TouchableOpacity style={styles.iconBtn} onPress={pickDocument}>
                    <AntDesign name="paperclip" size={26} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={handleSendImage}
                >
                    <Ionicons name="image-outline" size={26} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={handleSend}>
                    <FontAwesome name="send-o" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={isShowModalSend}
            >
                <TouchableWithoutFeedback
                    onPress={() => setIsShowModalSend(false)}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#00000044',
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                bottom: windowHeight * 0.22,
                                right: windowWidth * 0.05,
                                width: windowWidth * 0.9,
                            }}
                        >
                            <View style={styles.modalMessageSend}>
                                {type === 'text' ? (
                                    <Text
                                        style={{
                                            fontSize: 17,
                                        }}
                                    >
                                        {modalMessage}
                                    </Text>
                                ) : (
                                    <Image
                                        source={{ uri: modalMessage }}
                                        style={{
                                            width: windowWidth * 0.7,
                                            height: 200,
                                            objectFit: 'contain',
                                            alignSelf: 'center',
                                        }}
                                    />
                                )}
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: '#737373',
                                    }}
                                >
                                    {modalTime}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.modalWrap}>
                            <TouchableOpacity
                                style={styles.modalBtn}
                                onPress={() =>
                                    handleForwardMessage(modalMessage)
                                }
                            >
                                <Feather name="send" size={24} color="black" />
                                <Text style={styles.modalText}>
                                    Chuyển tiếp
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalBtn}
                                onPress={handleDelete}
                            >
                                <AntDesign
                                    name="delete"
                                    size={24}
                                    color="black"
                                />
                                <Text style={styles.modalText}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalForward}
            >
                <TouchableWithoutFeedback
                    onPress={() => setModalForward(false)}
                    style={{
                        flex: 1,
                        backgroundColor: '#00000044',
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#00000044',
                        }}
                    >
                        <View style={styles.forwardView}>
                            <TouchableOpacity
                                style={styles.modalBtnClose}
                                onPress={() => {
                                    setModalForward(false)
                                    fetchMessages()
                                }}
                            >
                                <AntDesign
                                    name="closecircleo"
                                    size={24}
                                    color="black"
                                />
                            </TouchableOpacity>
                            <View
                                style={{
                                    marginTop: 30,
                                }}
                            >
                                <ScrollView>
                                    {userConversation.map((conversation) => {
                                        return (
                                            <ForwardMessage
                                                data={conversation}
                                                currentUserId={currentUserId}
                                                message={modalMessage}
                                                type={type}
                                                socket={socket}
                                            />
                                        )
                                    })}
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <Tab />
        </SafeAreaView>
    )
}

export default Cloud

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative',
        width: windowWidth,
    },
    header: {
        height: windowHeight * 0.08,
        width: windowWidth,
        backgroundColor: '#1B96CB',
        flexDirection: 'row',
        alignItems: 'center',
    },
    txtHeader: {
        color: '#fff',
        fontFamily: 'Inter_600SemiBold',
        fontSize: 20,
        flex: 1,
        textAlign: 'center',
    },
    iconCloud: {
        marginLeft: 20,
    },
    body: {
        width: windowWidth,
        height: windowHeight - windowHeight * 0.23,
        backgroundColor: '#fff',
    },
    chat: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        height: windowHeight * 0.07,

        width: windowWidth,
        paddingHorizontal: windowWidth * 0.02,
        alignSelf: 'center',
    },
    avatar: {
        width: windowWidth * 0.1,
        height: windowWidth * 0.1,
        borderRadius: windowWidth * 0.05,
        marginHorizontal: 10,
    },
    senderName: {
        fontSize: 15,
        color: 'green',
    },
    iconemj: {
        marginLeft: 10,
    },
    input: {
        width: windowWidth - 150,
        height: 45,
        borderRadius: 10,
        marginLeft: 10,
    },
    LeftMsg: {
        alignItems: 'flex-start',
        width: windowWidth,
    },
    RightMsg: {
        alignItems: 'flex-end',
        width: windowWidth,
    },
    messageSend: {
        backgroundColor: '#98E4FF', // Messenger b
        color: 'white',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 5,
        maxWidth: '75%',
        marginRight: 10,
        // shadowColor: '#000',
        // shadowOffset: {
        // width: 0,
        // height: 20,
        // },
        // shadowOpacity: 0.2,
        // shadowRadius: 3.84,
        // elevation: 5,
    },
    iconBtn: {
        padding: windowWidth * 0.015,
    },
    modalWrap: {
        backgroundColor: '#fff',
        padding: 10,
        width: windowWidth * 0.9,
        height: windowHeight * 0.15,
        flexDirection: 'row',
        marginTop: windowHeight * 0.8,
        alignSelf: 'center',
        borderRadius: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    modalBtn: {
        padding: 10,
        alignItems: 'center',
        width: windowWidth * 0.3,
    },
    modalText: {
        fontSize: 15,
    },
    modalMessageSend: {
        backgroundColor: '#98E4FF', // Messenger b
        color: 'white',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 5,
        maxWidth: '85%',
        alignSelf: 'flex-end',
    },
    modalMessageRevice: {
        backgroundColor: '#e5e5ea', // light gray
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 5,
        maxWidth: '85%',
        alignSelf: 'flex-start',
    },
    forwardView: {
        backgroundColor: '#fff',
        width: windowWidth * 0.9,
        height: windowHeight * 0.8,
        alignSelf: 'center',
        marginTop: windowHeight * 0.1,
        borderRadius: 20,
        padding: 10,
        position: 'relative',
    },
    modalBtnClose: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
    },
})
