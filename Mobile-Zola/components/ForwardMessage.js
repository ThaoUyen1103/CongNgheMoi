import {
    StyleSheet,
    Text,
    Touchable,
    View,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { url } from '../utils/constant'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const ForwardMessage = ({ data, currentUserId, message, type }) => {
    console.log(data)
    const [userData, setUserData] = useState(null)
    const navigation = useNavigation()
    const route = useRoute()

    useEffect(() => {
        const userId = data.members.find((id) => id !== currentUserId)
        const getUserData = async () => {
            axios.get(`${url}/user/findUserByUserId/${userId}`).then((res) => {
                setUserData(res.data)
            })
        }

        getUserData()
    }, [data, currentUserId])
    // console.log(userData)

    const handleForwardMessage = async ({
        userData,
        conversation,
        message,
        type,
    }) => {
        try {
            const messages = {
                senderId: currentUserId,
                content: message,
                conversation_id: conversation._id,
                contentType: type,
            }
            //send message to database
            try {
                const { data } = await axios
                    .post(url + `/message/`, messages)
                    .finally(() => {
                        Alert.alert(
                            'Thông báo',
                            'Chuyển tiếp tin nhắn thành công',
                        )
                    })
                socket.emit('send-message', data)
            } catch (error) {
                console.log(error)
            }
            //send message to socket server
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <TouchableOpacity
            style={{
                marginTop: 15,
            }}
            onPress={() =>
                handleForwardMessage({
                    userData: userData,
                    conversation: data,
                    message: message,
                    type: type,
                })
            }
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <Image
                    source={{ uri: userData?.avatar }}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                    }}
                />
                <View
                    style={{
                        marginLeft: 10,
                        flex: 1,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: 'Inter_600SemiBold',
                            fontSize: 17,
                        }}
                    >
                        {userData?.userName}
                    </Text>
                </View>
                <MaterialCommunityIcons
                    name="message-arrow-right-outline"
                    size={24}
                    color="black"
                />
            </View>
        </TouchableOpacity>
    )
}

export default ForwardMessage

const styles = StyleSheet.create({})
