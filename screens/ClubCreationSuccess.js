import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, LogBox } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
// import { SafeAreaView } from 'react-native-safe-area-context';
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state. Check:']);
function ClubCreationSuccess({ route,navigation }) {
    const { clubName, userId } = route.params || {};
    console.log(route.params);

    useEffect(() => {
        console.log("recv", clubName)
    }, []);
    const handleProceed = async () => {
        navigation.navigate('MainScreen',navigation)
    }
    return (
        <ImageBackground source={require('../assets/success.png')} style={styles.bgImage}>
            <View style={styles.container}>
                <View style={styles.form}>
                    <View style={styles.header}>
                        <Image source={require('../assets/star.png')} style={styles.image} resizeMode="contain" />
                        <View style={styles.titleContainer}>
                            <Text style={styles.title1}>Hooray!🎈</Text>
                            <Text style={styles.title2}>{clubName}</Text>
                            <Text style={styles.title3}>is now alive in the campus.{'\n'}Make it amazing!</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleProceed}>
                        <Text style={{ color: '#fff', fontSize: 17, fontFamily: 'Inter-SemiBold' }}>Proceed</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        backgroundColor: 'transparent'
    },
    form: {
        flex: 1,
        justifyContent: 'flex-start',
        marginHorizontal: 30,
        fontFamily: 'Poppins-Regular',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 50,

    },
    image: {
        width: 40,
        height: 40,
        position: 'absolute',
        top: -35,
        right: 0,

    },
    image1: {
        width: 340,
        height: 340,
        position: 'absolute',
        // top: -35,
        left: -11,
        marginTop: 33,

    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title1: {
        fontSize: 40,
        color: 'black',
        marginTop: 18,
        fontFamily: 'Poppins-Bold',
    },
    title2: {
        fontSize: 25,
        color: '#D90505',
        marginTop: 10,
        fontFamily: 'Poppins-Medium',

    },
    title3: {
        fontSize: 19,
        color: 'black',
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
        marginTop: -5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgImage: {
        width: "100%",
        flex: 1,
        resizeMode: 'cover',
    },
    eyeButton: {
        position: 'absolute',
        top: 16,
        right: 15,
    },
    button: {
        backgroundColor: 'black',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 380,
    },
});

export default ClubCreationSuccess;
