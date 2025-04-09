import 'text-encoding-polyfill'
import { StyleSheet, Text, View } from 'react-native'
import Login from './screens/Login'
import Message from './screens/Message'
import Personal from './screens/Personal'
import Tab from './components/Tab'
import EditInfo from './components/EditInfo'
import EditPassword from './components/EditPassword'
import Register from './screens/Register'
import ConfirmCode from './components/ConfirmCode'
import PhoneInput from './components/PhoneInput'
import Cloud from './screens/Cloud'
import Login2 from './screens/Login2'
import Contact from './screens/Contact'
import CreateUser from './components/CreateUser'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Chat from './screens/Chat'
import { UserContext } from './UserContext'
import AddFriend from './components/AddFriend'
import EditNewPassword from './components/EditNewPassword'
import Conversation from './components/Conversation'
import ForwardMessage from './components/ForwardMessage'
import CreateGroup from './components/CreateGroup'
import Profile from './components/Profile'
import ChatInfo from './components/ChatInfo'
import MembersList from './components/MembersList'
import MemberInfo from './components/MemberInfo'
import MemberKey from './components/MemberKey'
import AddMemToGroup from './components/AddMemToGroup'
import LoadMember from './components/LoadMember'
import DeleteAccount from './components/DeleteAccount'
import FriendRequest from './components/FriendRequest'
import ChangePhoneNumber from './components/ChangePhoneNumber'

import TextEncoding from 'text-encoding'
global.TextEncoder = TextEncoding.TextEncoder

export default function App() {
    const Stack = createNativeStackNavigator()
    //const LoginStack = createNativeStackNavigator();

    return (
        <UserContext>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    <Stack.Screen
                        name="ChangePhoneNumber"
                        component={ChangePhoneNumber}
                        options={{ headerTitle: 'Thay đổi số điện thoại' }}
                    />
                    <Stack.Screen
                        name="FriendRequest"
                        component={FriendRequest}
                        options={{ headerTitle: 'Lời mời kết bạn' }}
                    />
                    <Stack.Screen
                        name="DeleteAccount"
                        component={DeleteAccount}
                        options={{ headerTitle: 'Xóa tài khoản' }}
                    />
                    <Stack.Screen
                        name="LoadMember"
                        component={LoadMember}
                        options={{ headerTitle: 'Danh sách thành viên' }}
                    />
                    <Stack.Screen
                        name="AddMemToGroup"
                        component={AddMemToGroup}
                        options={{ headerTitle: 'Thêm thành viên' }}
                    />
                    <Stack.Screen
                        name="MemberKey"
                        component={MemberKey}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="MemberInfo"
                        component={'MemberInfo'}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="MembersList"
                        component={MembersList}
                        options={{ headerTitle: 'Danh sách thành viên' }}
                    />
                    <Stack.Screen
                        name="ChatInfo"
                        component={ChatInfo}
                        options={{ headerTitle: 'Tùy chọn' }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={Profile}
                        options={{ headerTitle: 'Thông tin cá nhân' }}
                    />
                    <Stack.Screen
                        name="CreateGroup"
                        component={CreateGroup}
                        options={{ headerTitle: 'Nhóm mới' }}
                    />
                    <Stack.Screen
                        name="ForwardMessage"
                        component={ForwardMessage}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Conversation"
                        component={Conversation}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Chat"
                        component={Chat}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Login"
                        component={Login}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Login2"
                        component={Login2}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Message"
                        component={Message}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Contact"
                        component={Contact}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="AddFriend"
                        component={AddFriend}
                        options={{ headerTitle: 'Thêm Bạn' }}
                    />
                    <Stack.Screen
                        name="Cloud"
                        component={Cloud}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Personal"
                        component={Personal}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Tab"
                        component={Tab}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="EditInfo"
                        component={EditInfo}
                        options={{ title: 'Thay đổi thông tin tài khoản' }}
                    />
                    <Stack.Screen
                        name="EditPassword"
                        component={EditPassword}
                        options={{ title: 'Thay đổi mật khẩu' }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={Register}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ConfirmCode"
                        component={ConfirmCode}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="PhoneInput"
                        component={PhoneInput}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="CreateUser"
                        component={CreateUser}
                        options={{ headerShown: false }}
                    />

                    <Stack.Screen
                        name="EditNewPassword"
                        component={EditNewPassword}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </UserContext>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
