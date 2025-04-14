import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WelcomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            {/* Logo Zalo */}
            <Text style={styles.logo}>Zola</Text>

            {/* Hình minh họa */}
            <View style={styles.illustration}>
                <MaterialCommunityIcons name="video" size={100} color="#0088FF" />
                <Text style={styles.illustrationText}>
                    Gọi video ổn định{'\n'}Trò chuyện thật đã với chất lượng hiển thị
                </Text>
            </View>

            {/* Nút Đăng nhập và Đăng ký */}
            <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate('Register')}
            >
                <Text style={styles.registerButtonText}>Đăng ký</Text>
            </TouchableOpacity>

            {/* Chuyển đổi ngôn ngữ */}
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#0088FF',
        marginBottom: 50,
    },
    illustration: {
        alignItems: 'center',
        marginBottom: 50,
    },
    illustrationText: {
        fontSize: 16,
        color: '#000000',
        textAlign: 'center',
        marginTop: 20,
    },
    loginButton: {
        backgroundColor: '#0088FF',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 25,
        marginBottom: 20,
        width: '80%',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerButton: {
        borderWidth: 1,
        borderColor: '#0088FF',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#0088FF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    languageContainer: {
        flexDirection: 'row',
        marginTop: 30,
    },
    languageButton: {
        marginHorizontal: 10,
    },
    languageText: {
        fontSize: 14,
        color: '#888888',
    },
});

export default WelcomeScreen;