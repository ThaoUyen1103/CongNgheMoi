import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginMobile } from '../services/api';

const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!phoneNumber || !password) {
            setError('Vui lòng nhập đầy đủ số điện thoại và mật khẩu');
            return;
        }

        try {
            setLoading(true);
            // Xóa dữ liệu cũ
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('account_id');

            const response = await loginMobile(phoneNumber, password);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Đăng nhập thất bại');
            }

            // Kiểm tra và lưu token
            if (!response.data.token) {
                throw new Error('Không nhận được token từ server');
            }
            await AsyncStorage.setItem('token', response.data.token);

            // Kiểm tra và lưu account_id
            if (!response.data.account_id) {
                throw new Error('Không nhận được account_id từ server');
            }
            await AsyncStorage.setItem('account_id', response.data.account_id);

            Alert.alert('Thành công', 'Đăng nhập thành công!');
            navigation.navigate('Main');
        } catch (err) {
            console.error('Lỗi đăng nhập:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
            setError(errorMessage);
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đăng nhập</Text>
            <Text style={styles.subtitle}>Vui lòng nhập số điện thoại và mật khẩu để đăng nhập</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Số điện thoại (vd: +84...)"
                keyboardType="phone-pad"
            />
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mật khẩu"
                secureTextEntry
            />
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                <Text style={styles.loginButtonText}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
            >
                <Text style={styles.registerText}>Đăng ký</Text>
            </TouchableOpacity>

            <View style={styles.languageContainer}>
                <TouchableOpacity style={styles.languageButton}>
                    <Text style={styles.languageText}>Tiếng Việt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.languageButton}>
                    <Text style={styles.languageText}>English</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#888888',
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
    forgotPassword: {
        fontSize: 14,
        color: '#0088FF',
        textAlign: 'center',
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#0088FF',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 15,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerLink: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
    registerText: {
        fontSize: 14,
        color: '#0088FF',
    },
    languageContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    languageButton: {
        marginHorizontal: 10,
    },
    languageText: {
        fontSize: 14,
        color: '#888888',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default LoginScreen;