import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
} from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

export default function Tab({}) {
    const navigation = useNavigation()
    return (
        <View style={styles.tab}>
            <TouchableOpacity
                style={styles.btn}
                onPress={() => navigation.navigate('Message')}
            >
                <AntDesign name="message1" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.btn}
                onPress={() => navigation.navigate('Contact')}
            >
                <AntDesign name="contacts" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.btn}
                onPress={() => navigation.navigate('Cloud')}
            >
                <AntDesign name="cloudo" size={32} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.btn}
                onPress={() => navigation.navigate('Personal')}
            >
                <AntDesign name="user" size={30} color="black" />
            </TouchableOpacity>
        </View>
    )
}

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    tab: {
        height: windowHeight * 0.08,
        width: windowWidth,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        marginHorizontal: 0,
    },
    btn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
})
