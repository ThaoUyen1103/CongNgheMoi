import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MemberItem from './MemberItem'

const LoadMember = ({ navigation, route }) => {
    const conversation = route.params.conversation
    const currentUserId = route.params.currentUserId
    console.log(conversation)

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.text}>Thành viên</Text>
            </View>

            <View style={styles.body}>
                {conversation.members.map((member) => (
                    <MemberItem
                        member={member}
                        leader={conversation.leader}
                        deputyLeader={conversation.deputyLeader}
                        id={conversation._id}
                        currentUserId={currentUserId}
                    />
                ))}
            </View>
        </View>
    )
}

export default LoadMember

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,

        backgroundColor: 'white',
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    textActive: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        color: 'blue',
    },
    list: {
        marginTop: 10,
        backgroundColor: 'white',
    },
})
