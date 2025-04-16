import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findUserByPhoneNumber, sendFriendRequest } from '../services/api';

const AddFriendScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');

    const handleAddFriend = async () => {
        if (!phoneNumber) {
            setError('Vui lòng nhập số điện thoại');
            return;
        }

        try {
            const userId = await AsyncStorage.getItem('account_id');
            if (!userId) {
                throw new Error('Không tìm thấy user_id');
            }
            const response = await findUserByPhoneNumber(phoneNumber);
            if (response.status !== 200 || !response.data) {
                throw new Error(response.data.message || 'Không tìm thấy người dùng');
            }
            const friendId = response.data._id;
            const friendResponse = await sendFriendRequest(userId, friendId);
            if (friendResponse.status !== 200) {
                throw new Error(friendResponse.data.message || 'Gửi yêu cầu kết bạn thất bại');
            }
            Alert.alert('Thành công', 'Yêu cầu kết bạn đã được gửi!');
            setPhoneNumber('');
        } catch (err) {
            console.error('Lỗi thêm bạn:', err);
            setError(err.response?.data?.message || 'Thêm bạn thất bại');
            Alert.alert('Lỗi', err.message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Thêm bạn</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Số điện thoại"
                keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
                <Text style={styles.addButtonText}>Gửi yêu cầu</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#0088FF',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 15,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default AddFriendScreen;