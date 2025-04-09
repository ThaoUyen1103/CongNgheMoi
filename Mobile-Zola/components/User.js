import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { UserType } from '../UserContext'
import { useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import jwtDecode from 'jwt-decode'
import { url } from '../utils/constant'

const User = ({ item }) => {
    const { accountId, setAccountId } = useContext(UserType)
    const [userId, setUserId] = useState([])
    const [requestSent, setRequestSent] = useState(false)
    const [friendRequests, setFriendRequests] = useState([])
    const [userFriends, setUserFriends] = useState([])
    useEffect(() => {
        const getUserIdByAccountId = async () => {
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

        /*const fetchFriendRequests = async()=>{
        try {
            const response = await fetch(`http://localhost:3000/friend-request/sent/${userId}`);
            const data = await response.json();
            if (response.ok) {
              setFriendRequests(data);
            } else {
              console.log("error", response.status);
            }
          } catch (error) {
            console.log("error", error);
          }
        };
        fetchFriendRequests();*/
    }, [])
    console.log(userId)
    const sendFriendRequest = async (currentUserId, selectedUserId) => {
        try {
            const response = await fetch(url + '/user/friend-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currentUserId, selectedUserId }),
            })

            if (response.ok) {
                setRequestSent(true)
            }
        } catch (error) {
            console.log('error message', error)
        }
    }
    console.log('friend requests sent', friendRequests)
    console.log('user friends', userFriends)
    return (
        <View style={styles.user}>
            <Image src={item.avatar} style={styles.avatar} />
            <Text style={styles.name}>{item.userName}</Text>
            <TouchableOpacity
                style={styles.add}
                onPress={() => sendFriendRequest(userId, item._id)}
            >
                <Text style={styles.txtAdd}>Kết bạn</Text>
            </TouchableOpacity>
        </View>
    )
}

export default User

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    user: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    name: {
        marginLeft: 15,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold',
    },
    add: {
        backgroundColor: '#1B96CB',
        width: windowWidth * 0.25,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 10,
    },
    txtAdd: {
        color: 'white',
        fontSize: 17,
    },
})
