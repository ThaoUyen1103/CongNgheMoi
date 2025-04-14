import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { forgotPassword } from '../services/api';

const ForgotPasswordScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleForgotPassword = async () => {
        if (!phoneNumber || !newPassword) {
            setError('Vui lòng nhập số điện thoại và mật khẩu mới');
            return;
        }

        try {
            const response = await forgotPassword(phoneNumber, newPassword);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Khôi phục mật khẩu thất bại');
            }
            Alert.alert('Thành công', 'Mật khẩu đã được đặt lại!', [
                { text: 'OK', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (err) {
            console.error('Lỗi khôi phục mật khẩu:', err);
            setError(err.response?.data?.message || 'Khôi phục mật khẩu thất bại');
            Alert.alert('Lỗi', err.message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Quên mật khẩu</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Số điện thoại"
                keyboardType="phone-pad"
            />
            <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mật khẩu mới"
                secureTextEntry
            />
            <TouchableOpacity style={styles.resetButton} onPress={handleForgotPassword}>
                <Text style={styles.resetButtonText}>Đặt lại mật khẩu</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.loginText}>Quay lại đăng nhập</Text>
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
    resetButton: {
        backgroundColor: '#0088FF',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 15,
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 20,
    },
    loginText: {
        fontSize: 14,
        color: '#0088FF',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default ForgotPasswordScreen;