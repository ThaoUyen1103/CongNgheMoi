// AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ChatScreen from '../screens/ChatScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import AddFriendScreen from '../screens/AddFriendScreen';
import FriendRequestScreen from '../screens/FriendRequestScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import UpdateProfileScreen from '../screens/UpdateProfileScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import GroupManagementScreen from '../screens/GroupManagementScreen';
import AddMemberScreen from '../screens/AddMemberScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Trò chuyện' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Đổi mật khẩu' }} />
            <Stack.Screen name="AddFriend" component={AddFriendScreen} options={{ title: 'Thêm bạn' }} />
            <Stack.Screen name="FriendRequest" component={FriendRequestScreen} options={{ title: 'Lời mời kết bạn' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Quên mật khẩu' }} />
            <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} options={{ title: 'Cập nhật thông tin' }} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Tạo nhóm' }} />
            <Stack.Screen name="GroupManagement" component={GroupManagementScreen} options={{ title: 'Quản lý nhóm' }} />
            <Stack.Screen name="AddMember" component={AddMemberScreen} options={{ title: 'Thêm thành viên' }} />
        </Stack.Navigator>
    </NavigationContainer>
);

export default AppNavigator;