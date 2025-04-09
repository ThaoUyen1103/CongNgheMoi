import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
    ScrollView,
} from 'react-native'
import React, { useContext } from 'react'
import { Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter'
import Tab from '../components/Tab'
import moment from 'moment'
import {
    EvilIcons,
    MaterialCommunityIcons,
    Ionicons,
    AntDesign,
} from '@expo/vector-icons'
import { UserType } from '../UserContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { ImageBackground } from 'react-native'
import { url } from '../utils/constant'
import Conversation from '../components/Conversation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient';


const Message = ({ navigation, route }) => {
    const {
        accountId,
        setAccountId,
        conversations,
        setConversations,
        cloud,
        setCloud,
    } = useContext(UserType)
    const [userId, setUserId] = useState({})
    const [user, setUser] = useState({})
    // const [conversations, setConversations] = useState([])
    useEffect(() => {
        const getUserIdByAccountId = async () => {
            const token = await AsyncStorage.getItem('AuthToken')
            const decodedToken = jwtDecode(token)
            setAccountId(decodedToken.accountId)
            axios
                .get(url + `/user/findUser?account_id=${accountId}`)
                .then((res) => {
                    setUserId(res.data._id)
                    setUser(res.data)
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        const getConversations = async (userId) => {
            axios
                .get(url + `/conversation/${userId}`)
                .then((res) => {
                    setConversations(res.data)
                })
                .catch((error) => {
                    console.log('error message', error)
                })
        }
        const fetchCloud = async () => {
            if (userId !== undefined && userId !== '') {
                axios
                    .post(url + '/conversation/createMyCloudConversationWeb', {
                        user_id: userId,
                    })
                    .then((response) => {
                        if (
                            response.data.message ===
                            'Tạo ConversationCloud thành công!!!'
                        ) {
                            //alert('Tạo ConversationCloud đã tồn tại!!!')
                            // toast.success('Tạo conversation thành công!!!')
                            //setConversationMyCloud(response.data.conversation)
                            // lưu biến conversationMyCloud vào localStorage
                            // localStorage.setItem(
                            // 'conversationMyCloud',
                            // JSON.stringify(response.data.conversation),
                            console.log(response.data.conversation._id)
                            setCloud(response.data.conversation)
                        }
                        if (
                            response.data.message ===
                            'ConversationCloud đã tồn tại!!!'
                        ) {
                            // alert('ConversationCloud đã tồn tại!!!')
                            // toast.success('Conversation đã tồn tại!!!')
                            // setConversationMyCloud(response.data.conversation)
                            // lưu biến conversationMyCloud vào localStorage
                            // localStorage.setItem(
                            // 'conversationMyCloud',
                            // JSON.stringify(response.data.conversation),
                            // )
                            console.log(response.data.conversation._id)
                            setCloud(response.data.conversation)
                        }
                    })
                    .catch((error) => {
                        console.error(error)
                    })
            }
        }
        getUserIdByAccountId()
        getConversations(userId)
        fetchCloud()
        const onFocused = navigation.addListener('focus', () => {
            getConversations(userId)
            getUserIdByAccountId()
        })

        //bắt sk navigate
    }, [userId, navigation])

    useFonts({ Inter_600SemiBold })
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <LinearGradient
                    colors={['#474bff', '#478eff']}
                    useAngle={true}
                    angle={90}
                    style={styles.header}
                >
                    <TouchableOpacity style={styles.search}>
                        <EvilIcons
                            name="search"
                            style={styles.iconSearch}
                            size={30}
                            color="white"
                        />
                        <Text style={styles.txtSearch}>Tìm kiếm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn}>
                        <MaterialCommunityIcons
                            style={styles.iconQR}
                            name="qrcode-scan"
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.btn,
                            {
                                marginRight: windowWidth * 0.02,
                            },
                        ]}
                        onPress={() => navigation.navigate('CreateGroup')}
                    >
                        <AntDesign
                            name="addusergroup"
                            size={25}
                            color="white"
                        />
                    </TouchableOpacity>
                </LinearGradient>

                <ScrollView style={styles.body}>
                    {user?.deleted ? (
                        <View
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: windowWidth,
                                height: 'auto',
                                backgroundColor: 'red',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 20,
                                    color: 'white',
                                    paddingHorizontal: 30,
                                    textAlign: 'center',
                                    marginVertical: 5,
                                }}
                            >
                                Tài khoản của bạn sẽ bị xóa sau{' '}
                                {moment(user.deletedAt)
                                    .clone()
                                    .add(30, 'days')
                                    .diff(moment(), 'days')}{' '}
                                ngày nữa
                            </Text>
                        </View>
                    ) : null}
                    {conversations.map((conversation) => {
                        return (
                            <Conversation
                                data={conversation}
                                currentUserId={userId}
                                key={conversation._id}
                            />
                        )
                    })}
                </ScrollView>
                <Tab />
            </View>
        </SafeAreaView>
    )
}

export default Message

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative',
    },
    header: {
        height: windowHeight * 0.08,
        backgroundColor: '#1B96CB',
        flexDirection: 'row',
        alignItems: 'center',
    },
    search: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconSearch: {
        marginLeft: windowWidth * 0.02,
    },
    btn: {
        padding: windowWidth * 0.01,
        marginRight: windowWidth * 0.01,
    },
    txtSearch: {
        marginLeft: 15,
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
    },
    iconQR: {
        width: 28,
        height: 28,
        marginLeft: 10,
    },
    iconAdd: {
        width: 35,
        height: 35,
        marginLeft: 15,
    },
    body: {
        height: windowHeight - windowHeight * 0.16,
    },
})
