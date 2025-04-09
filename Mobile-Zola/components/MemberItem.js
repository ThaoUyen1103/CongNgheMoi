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

const MemberItem = ({ member, leader, deputyLeader, currentUserId, id }) => {
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

    const handleChangeGroupLeader = async (userID) => {
        try {
            await axios
                .put(
                    `${url}/conversation/authorizeGroupLeader`,
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
                })
                .finally(() => {
                    Alert.alert(
                        'Thông báo',
                        'Chuyển nhượng quyền quản trị viên thành công',
                    )
                })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <TouchableOpacity
            style={styles.wrap}
            onPress={() => {
                handleChangeGroupLeader(userData._id)
            }}
        >
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
        </TouchableOpacity>
    )
}

export default MemberItem

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
