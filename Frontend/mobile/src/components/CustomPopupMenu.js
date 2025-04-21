import React from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomPopupMenu = ({ visible, onClose, onSelect }) => {
    const menuItems = [
        { label: 'Thêm bạn', action: 'add-friend' },
        { label: 'Tạo nhóm', action: 'create-group' },
        { label: 'Cloud của tơi', action: 'cloud' },
        { label: 'Lịch Zalo', action: 'calendar' },
        { label: 'Tạo cuộc gọi nhóm', action: 'call-group' },
        { label: 'Thiết bị đăng nhập', action: 'devices' },
    ];

    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
                <View style={styles.menu}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.item} onPress={() => onSelect(item.action)}>
                            <Text style={styles.text}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 10,
        backgroundColor: 'transparent',
    },
    menu: {
        width: 200,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    item: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
});

export default CustomPopupMenu;
