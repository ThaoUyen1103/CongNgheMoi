import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Image,
    Dimensions,
} from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { AntDesign } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { UserType } from '../UserContext'
import User from './User'
import { url } from '../utils/constant'

const AddFriend = ({ navigation, route }) => {
    const { accountId, setAccountId } = useContext(UserType)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [user, setUser] = useState()
    // useEffect(() => {
    // const fetchUser= async()=>{
    // const token=await AsyncStorage.getItem('AuthToken')
    // const decodedToken=jwtDecode(token);
    // const accountId=decodedToken.accountId;
    // setAccountId(accountId)
    // axios.get(`http://localhost:3000/user/findAllExceptCurrentUser?account_id=${accountId}`).then((res)=>{
    //setUsers(res.data)
    // }).catch((err)=>{
    // console.log(err)
    // });
    // };
    // fetchUser();
    // }
    //, [])

    const handleSearch = async () => {
        try {
            const response = await axios.get(
                url + `/user/findUserByPhoneNumber/${phoneNumber}`,
            )
            if (response.status === 200) {
                setUser(response.data)
                console.log(user)
            }
        } catch (error) {
            console.log('Not found')
            console.log(error)
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.search}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập số điện thoại"
                    onChangeText={(text) => setPhoneNumber(text)}
                    keyboardType="numeric"
                    // defaultValue={phoneNumber}
                />
                <TouchableOpacity>
                    <AntDesign
                        name="search1"
                        size={24}
                        color="black"
                        onPress={() => {
                            handleSearch()
                        }}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.recommend}>
                <Text style={styles.txtRecommend}>Kết quả</Text>
                <ScrollView style={styles.list}>
                    {!user ? (
                        <Text
                            style={{
                                fontSize: 17,
                                marginHorizontal: 10,
                                textAlign: 'center',
                                marginTop: 10,
                            }}
                        >
                            Không tìm thấy người dùng
                        </Text>
                    ) : (
                        <User item={user} />
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default AddFriend

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    search: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        width: windowWidth * 0.9,
        alignSelf: 'center',
    },
    input: {
        width: windowWidth * 0.7,
        height: 40,
        backgroundColor: '#E5E5E5',
        borderRadius: 10,
        paddingHorizontal: 10,
        fontSize: 16,
        marginRight: 20,
    },
    recommend: {
        marginTop: 10,
        paddingHorizontal: 10,
        width: windowWidth * 0.9,
        alignSelf: 'center',
    },
    txtRecommend: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
    list: {
        height: Math.round(windowHeight) - 60,
    },
})
