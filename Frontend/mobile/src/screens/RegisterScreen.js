import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkPhoneNumber, registerAccount, createUserProfile } from '../services/api';

const RegisterScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!phoneNumber || !password || !userName || !firstName || !lastName || !dateOfBirth || !gender) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            // Kiểm tra số điện thoại đã tồn tại
            const phoneExists = await checkPhoneNumber(phoneNumber);
            if (phoneExists) {
                setError('Số điện thoại đã được đăng ký');
                Alert.alert('Lỗi', 'Số điện thoại đã được đăng ký');
                return;
            }

            // Bước 1: Tạo tài khoản
            const accountResponse = await registerAccount(phoneNumber, password);
            if (accountResponse.status !== 200) {
                throw new Error(accountResponse.data.message || 'Đăng ký tài khoản thất bại');
            }

            // Bước 2: Tạo hồ sơ người dùng, không gửi avatar để backend gán mặc định
            const userResponse = await createUserProfile(
                accountResponse.data.account_id || '',
                userName,
                firstName,
                lastName,
                phoneNumber,
                dateOfBirth,
                gender,
                null,
                null
            );
            if (userResponse.status !== 200) {
                throw new Error(userResponse.data.message || 'Tạo hồ sơ người dùng thất bại');
            }

            // Lưu account_id
            if (accountResponse.data.account_id) {
                await AsyncStorage.setItem('account_id', accountResponse.data.account_id);
            }

            Alert.alert('Thành công', 'Đăng ký thành công!');
            navigation.navigate('Main');
        } catch (err) {
            console.error('Lỗi đăng ký:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Đăng ký thất bại';
            setError(errorMessage);
            Alert.alert('Lỗi', errorMessage);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Đăng ký</Text>
            <Text style={styles.subtitle}>Vui lòng nhập thông tin để đăng ký</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
                style={styles.input}
                value={userName}
                onChangeText={setUserName}
                placeholder="Tên người dùng"
            />
            <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Họ"
            />
            <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Tên"
            />
            <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Số điện thoại (vd: +84...)"
                keyboardType="phone-pad"
            />
            <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="Ngày sinh (dd/mm/yyyy)"
            />
            <TextInput
                style={styles.input}
                value={gender}
                onChangeText={setGender}
                placeholder="Giới tính (Nam/Nữ/Khác)"
            />
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mật khẩu"
                secureTextEntry
            />
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Đăng ký</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.loginText}>Đăng nhập</Text>
            </TouchableOpacity>

            <View style={styles.languageContainer}>
                <TouchableOpacity style={styles.languageButton}>
                    <Text style={styles.languageText}>Tiếng Việt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.languageButton}>
                    <Text style={styles.languageText}>English</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
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
    registerButton: {
        backgroundColor: '#0088FF',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 15,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
    loginText: {
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

export default RegisterScreen;