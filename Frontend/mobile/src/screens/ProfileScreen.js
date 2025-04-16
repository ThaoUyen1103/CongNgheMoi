import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { findUserByAccountId, updateAvatar, updateCoverImage } from '../services/api';

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadUserData = async () => {
        try {
            setLoading(true);
            const accountId = await AsyncStorage.getItem('account_id');
            if (!accountId) {
                throw new Error('Không tìm thấy account_id');
            }

            const response = await findUserByAccountId(accountId);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Lỗi khi tải thông tin người dùng');
            }
            setUser(response.data);
        } catch (err) {
            console.error('Lỗi tải thông tin người dùng:', err);
            setError(err.message || 'Lỗi khi tải thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();

        const unsubscribe = navigation.addListener('focus', loadUserData);

        return unsubscribe;
    }, [navigation]);

    const pickImage = async (type) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Quyền truy cập bị từ chối', 'Cần cấp quyền truy cập thư viện ảnh để chọn ảnh.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            try {
                const accountId = await AsyncStorage.getItem('account_id');
                const response = type === 'avatar'
                    ? await updateAvatar(accountId, imageUri)
                    : await updateCoverImage(accountId, imageUri);

                if (response.status !== 200) {
                    throw new Error(response.data.message || `Lỗi khi cập nhật ${type === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'}`);
                }
                Alert.alert('Thành công', `Cập nhật ${type === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'} thành công`);
                await loadUserData();
            } catch (err) {
                console.error(`Lỗi cập nhật ${type}:`, err);
                Alert.alert('Lỗi', err.message || `Lỗi khi cập nhật ${type === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'}`);
            }
        }
    };

    const handleUpdateProfile = () => {
        navigation.navigate('UpdateProfile', { user });
    };

    const handleChangePassword = () => {
        navigation.navigate('ChangePassword');
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('account_id');
            await AsyncStorage.removeItem('token');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (err) {
            console.error('Lỗi đăng xuất:', err);
            Alert.alert('Lỗi', 'Lỗi khi đăng xuất');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.coverImageContainer}
                onPress={() => pickImage('cover')}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: user.coverImage || 'https://via.placeholder.com/300x100' }}
                    style={styles.coverImage}
                />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
                <TouchableOpacity
                    onPress={() => pickImage('avatar')}
                    activeOpacity={0.7}
                >
                    <Image
                        source={{ uri: user.avatar || 'https://via.placeholder.com/150' }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user.userName}</Text>
            <Text style={styles.phoneNumber}>{user.phoneNumber}</Text>
            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Họ:</Text>
                    <Text style={styles.infoText}>{user.lastName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tên:</Text>
                    <Text style={styles.infoText}>{user.firstName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày sinh:</Text>
                    <Text style={styles.infoText}>{user.dateOfBirth}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Giới tính:</Text>
                    <Text style={styles.infoText}>{user.gender}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>Cập nhật thông tin</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                <Text style={styles.buttonText}>Đổi mật khẩu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={styles.buttonText}>Đăng xuất</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    coverImageContainer: {
        height: 150,
        backgroundColor: '#CCCCCC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: -50,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
    },
    phoneNumber: {
        fontSize: 16,
        color: '#888888',
        textAlign: 'center',
        marginBottom: 20,
    },
    infoContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    infoText: {
        fontSize: 16,
    },
    button: {
        backgroundColor: '#0088FF',
        paddingVertical: 15,
        marginHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#FF4444',
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
    },
    error: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 50,
    },
});

export default ProfileScreen;