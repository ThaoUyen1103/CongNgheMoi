import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser } from '../services/api';

const UpdateProfileScreen = ({ route, navigation }) => {
    const { user } = route.params; // Nhận thông tin người dùng từ ProfileScreen
    const [firstName, setFirstName] = useState(user.firstName || '');
    const [lastName, setLastName] = useState(user.lastName || '');
    const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
    const [gender, setGender] = useState(user.gender || 'Nam');

    // Hàm xử lý cập nhật thông tin
    const handleUpdate = async () => {
        try {
            if (!firstName.trim() || !lastName.trim() || !dateOfBirth.trim()) {
                Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
                return;
            }

            const accountId = await AsyncStorage.getItem('account_id');
            if (!accountId) {
                throw new Error('Không tìm thấy account_id');
            }

            const response = await updateUser(accountId, firstName, lastName, dateOfBirth, gender);
            if (response.status !== 200) {
                throw new Error(response.data.message || 'Lỗi khi cập nhật thông tin');
            }

            Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err) {
            console.error('Lỗi cập nhật thông tin:', err);
            Alert.alert('Lỗi', err.message || 'Lỗi khi cập nhật thông tin');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cập nhật thông tin</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Họ</Text>
                <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Nhập họ"
                    placeholderTextColor="#888"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Tên</Text>
                <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Nhập tên"
                    placeholderTextColor="#888"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Ngày sinh</Text>
                <TextInput
                    style={styles.input}
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    placeholder="Nhập ngày sinh (VD: 24/11/1969)"
                    placeholderTextColor="#888"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.genderContainer}>
                    <TouchableOpacity
                        style={[styles.genderButton, gender === 'Nam' && styles.genderButtonSelected]}
                        onPress={() => setGender('Nam')}
                    >
                        <Text style={[styles.genderText, gender === 'Nam' && styles.genderTextSelected]}>Nam</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.genderButton, gender === 'Nữ' && styles.genderButtonSelected]}
                        onPress={() => setGender('Nữ')}
                    >
                        <Text style={[styles.genderText, gender === 'Nữ' && styles.genderTextSelected]}>Nữ</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                <Text style={styles.updateButtonText}>Cập nhật</Text>
            </TouchableOpacity>
        </View>
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
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        color: '#000',
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    genderButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    genderButtonSelected: {
        backgroundColor: '#0088FF',
        borderColor: '#0088FF',
    },
    genderText: {
        fontSize: 16,
        color: '#333',
    },
    genderTextSelected: {
        color: '#FFFFFF',
    },
    updateButton: {
        backgroundColor: '#0088FF',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default UpdateProfileScreen;