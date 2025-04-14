import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changePassword } from '../services/api';

const ChangePasswordScreen = ({ navigation }) => {
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleChangePassword = async () => {
        if (!newPassword) {
            setError('Vui lòng nhập mật khẩu mới');
            return;
        }

        try {
            const accountId = await AsyncStorage.getItem('account_id');
            if (!accountId) {
                throw new Error('Không tìm thấy account_id');
            }
            const response = await changePassword(accountId, newPassword);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Đổi mật khẩu thất bại');
            }
            Alert.alert('Thành công', 'Đổi mật khẩu thành công!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err) {
            console.error('Lỗi đổi mật khẩu:', err);
            setError(err.response?.data?.message || 'Đổi mật khẩu thất bại');
            Alert.alert('Lỗi', err.message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Đổi mật khẩu</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mật khẩu mới"
                secureTextEntry
            />
            <TouchableOpacity style={styles.updateButton} onPress={handleChangePassword}>
                <Text style={styles.updateButtonText}>Đổi mật khẩu</Text>
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
    updateButton: {
        backgroundColor: '#0088FF',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 15,
    },
    updateButtonText: {
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

export default ChangePasswordScreen;