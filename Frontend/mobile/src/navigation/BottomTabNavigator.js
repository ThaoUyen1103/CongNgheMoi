import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ChatListScreen from '../screens/ChatListScreen';
import ContactScreen from '../screens/ContactScreen';
import DiaryScreen from '../screens/DiaryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Tin nhắn') iconName = 'message-text-outline';
                    else if (route.name === 'Danh bạ') iconName = 'account-group-outline';
                    else if (route.name === 'Nhật ký') iconName = 'book-open-outline';
                    else if (route.name === 'Cá nhân') iconName = 'account-outline';
                    else iconName = 'help-circle-outline'; // Icon mặc định nếu không tìm thấy

                    // Kiểm tra xem iconName có hợp lệ không
                    if (!iconName) {
                        console.warn(`Icon không hợp lệ cho route: ${route.name}`);
                        iconName = 'help-circle-outline'; // Icon dự phòng
                    }

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#0088ff',
                tabBarInactiveTintColor: '#888',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                },
            })}
        >
            <Tab.Screen name="Tin nhắn" component={ChatListScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Danh bạ" component={ContactScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Nhật ký" component={DiaryScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Cá nhân" component={ProfileScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;