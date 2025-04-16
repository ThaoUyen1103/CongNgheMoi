import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const diaryData = [
    {
        id: '1',
        type: 'post',
        author: 'Nguyễn Sơn',
        time: '19 phút trước',
        content: 'Dịch vụ xe ghép chuyên nghiệp, bao xe tiện lợi, chuyển tuyến linh hoạt!\n📞 Gọi ngay để đặt xe bất cứ lúc nào!',
        images: [
            'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        ],
        likes: 12,
        comments: 3,
    },
    {
        id: '2',
        type: 'post',
        author: 'Môi Trường Xanh',
        time: '1 giờ trước',
        content: '🌿 Chung tay bảo vệ môi trường! Hãy tham gia chương trình thu gom rác thải tái chế cùng chúng tôi vào cuối tuần này! 💚',
        images: [
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        ],
        likes: 25,
        comments: 8,
    },
    {
        id: '3',
        type: 'post',
        author: 'Lan Anh',
        time: '2 giờ trước',
        content: 'Một ngày nắng đẹp để đi dạo công viên! 🌞 Ai muốn tham gia cùng mình không? 🏞️',
        images: [
            'https://images.unsplash.com/photo-1446038275518-1d20d083f9e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        ],
        likes: 18,
        comments: 5,
    },
];

const moments = [
    { id: '1', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
    { id: '2', image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
    { id: '3', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
    { id: '4', image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
];

const DiaryScreen = () => {
    const renderPostItem = ({ item }) => {
        if (item.type === 'post') {
            return (
                <View style={styles.postContainer}>
                    <View style={styles.postHeader}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80' }}
                            style={styles.postAvatar}
                        />
                        <View style={styles.postInfo}>
                            <Text style={styles.postAuthor}>{item.author}</Text>
                            {item.time ? (
                                <Text style={styles.postTime}>{item.time}</Text>
                            ) : null}
                        </View>
                        <TouchableOpacity>
                            <MaterialCommunityIcons name="dots-horizontal" size={24} color="#666666" />
                        </TouchableOpacity>
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
                            <MaterialCommunityIcons name="heart-outline" size={22} color="#666666" />
                            <Text style={styles.actionText}>{item.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="comment-outline" size={22} color="#666666" />
                            <Text style={styles.actionText}>{item.comments}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="share-outline" size={22} color="#666666" />
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
                <TouchableOpacity>
                    <MaterialCommunityIcons name="history" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {['Ảnh', 'Video', 'Album', 'Kỷ niệm'].map((tab, index) => (
                    <TouchableOpacity key={index} style={styles.tab}>
                        <Text style={styles.tabText}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Khoảnh khắc */}
            <View style={styles.momentsWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {moments.map((moment) => (
                        <TouchableOpacity key={moment.id}>
                            <Image source={{ uri: moment.image }} style={styles.momentImage} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Danh sách bài đăng */}
            <FlatList
                data={diaryData}
                renderItem={renderPostItem}
                keyExtractor={(item) => item.id}
                style={styles.postList}
                contentContainerStyle={styles.postListContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#007AFF',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
    },
    tabs: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        marginRight: 24,
        paddingBottom: 4,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#007AFF',
    },
    moments: {
        flexShrink: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
    },
    momentImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    postList: {
        flex: 1,
    },
    postListContent: {
        flexGrow: 1,
        justifyContent: 'flex-start', // Đẩy lên trên
        paddingBottom: 30,
        minHeight: Dimensions.get('window').height - 160,
    },
    postContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    postAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    postInfo: {
        flex: 1,
        marginLeft: 12,
    },
    postAuthor: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C2526',
    },
    postTime: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    postContent: {
        fontSize: 14,
        color: '#1C2526',
        lineHeight: 20,
        marginBottom: 12,
    },
    postImages: {
        marginBottom: 12,
    },
    postImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginRight: 12,
    },
    postActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
        paddingVertical: 4,
    },
    actionText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
});

export default DiaryScreen;