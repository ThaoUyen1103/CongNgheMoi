import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const diaryData = [
    {
        id: '1',
        type: 'post',
        author: 'Nguyễn Sơn',
        time: '19 phút trước',
        content: 'XE GHÉP, BAO XE, CHUYỂN TUYẾN\nGiờ nào cũng có alo là có xe',
        images: [
            'https://via.placeholder.com/150',
            'https://via.placeholder.com/150',
            'https://via.placeholder.com/150',
            'https://via.placeholder.com/150',
        ],
        likes: 1,
        comments: 1,
    },
    {
        id: '2',
        type: 'post',
        author: 'CÔNG TY MỜI TRƯỜNG XANH',
        time: '',
        content: 'One moment, please...',
        images: [],
        likes: 0,
        comments: 0,
    },
];

const moments = [
    { id: '1', image: 'https://via.placeholder.com/50' },
    { id: '2', image: 'https://via.placeholder.com/50' },
    { id: '3', image: 'https://via.placeholder.com/50' },
    { id: '4', image: 'https://via.placeholder.com/50' },
];

const DiaryScreen = () => {
    const renderPostItem = ({ item }) => {
        if (item.type === 'post') {
            return (
                <View style={styles.postContainer}>
                    <View style={styles.postHeader}>
                        <Image
                            source={{ uri: 'https://via.placeholder.com/40' }}
                            style={styles.postAvatar}
                        />
                        <View style={styles.postInfo}>
                            <Text style={styles.postAuthor}>{item.author}</Text>
                            {item.time ? (
                                <Text style={styles.postTime}>{item.time}</Text>
                            ) : null}
                        </View>
                        <MaterialCommunityIcons name="dots-horizontal" size={24} color="#888888" />
                    </View>
                    <Text style={styles.postContent}>{item.content}</Text>
                    {item.images.length > 0 && (
                        <ScrollView horizontal style={styles.postImages}>
                            {item.images.map((image, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: image }}
                                    style={styles.postImage}
                                />
                            ))}
                        </ScrollView>
                    )}
                    <View style={styles.postActions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="heart-outline" size={20} color="#888888" />
                            <Text style={styles.actionText}>{item.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="comment-outline" size={20} color="#888888" />
                            <Text style={styles.actionText}>{item.comments}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="share-outline" size={20} color="#888888" />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {/* Thanh tiêu đề */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hôm nay bạn thế nào?</Text>
                <MaterialCommunityIcons name="history" size={24} color="#FFFFFF" />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Video</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Album</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Kỷ niệm</Text>
                </TouchableOpacity>
            </View>

            {/* Khoảnh khắc */}
            <ScrollView horizontal style={styles.moments}>
                {moments.map((moment) => (
                    <Image
                        key={moment.id}
                        source={{ uri: moment.image }}
                        style={styles.momentImage}
                    />
                ))}
            </ScrollView>

            {/* Danh sách bài đăng */}
            <FlatList
                data={diaryData}
                renderItem={renderPostItem}
                keyExtractor={(item) => item.id}
                style={styles.postList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        backgroundColor: '#00A1F2',
        paddingTop: 50,
        paddingBottom: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tabs: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    tab: {
        marginRight: 20,
    },
    tabText: {
        fontSize: 14,
        color: '#888888',
    },
    moments: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    momentImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    postList: {
        flex: 1,
    },
    postContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    postAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    postInfo: {
        flex: 1,
        marginLeft: 10,
    },
    postAuthor: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    postTime: {
        fontSize: 12,
        color: '#888888',
    },
    postContent: {
        fontSize: 14,
        color: '#000000',
        marginTop: 10,
    },
    postImages: {
        marginTop: 10,
    },
    postImage: {
        width: 150,
        height: 150,
        marginRight: 10,
    },
    postActions: {
        flexDirection: 'row',
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#888888',
    },
});

export default DiaryScreen;