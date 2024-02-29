import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, StatusBar, ImageBackground } from 'react-native';
import { collection, addDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, database, realtimeDatabase } from '../config/firebase';
import { signOut } from 'firebase/auth';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ref, set } from 'firebase/database';


const ClubCreationScreen = ({ navigation }) => {
    const [clubName, setClubName] = useState('');
    const [description, setDescription] = useState('');
    const [motto, setMotto] = useState('');

    // console.log(navigation)

    const handleSignOut = async () => {
        try {
            if (currentUser && currentUser.uid) {
                await signOut(auth);
                navigation.navigate('Login');
            } else {
                console.error('No authenticated user to sign out');
            }
        } catch (error) {
            console.error('Sign-out error: ', error);
        }
    };

    const handleCreateClub = async () => {
        try {
            const userId = auth.currentUser.uid;

            console.log("user in clubcreationscreen", userId)
            const clubRef = await addDoc(collection(database, 'clubs'), {
                name: clubName,
                description,
                motto: motto || '',
                ownerId: userId,
                cid: '',
                members: [],
            });
            console.log("Club created")

            const clubId = clubRef.id;
            await updateDoc(doc(database, 'clubs', clubId), { cid: clubId });
            console.log("clubid as cid added to clubs")


            await updateDoc(doc(database, 'users', userId), { role: 'owner', clubId });
            console.log("clubid and role=owner added to users")


            const chatroomRef = doc(database, 'chatrooms', clubId);

            const chatroomData = {
                clubId: clubId,
                messages: [],
            };

            await setDoc(chatroomRef, chatroomData);

            console.log('Chat room created for club ID: ', clubId);

            console.log("sent", clubName);
            navigation.navigate('ClubCreationSuccess', { clubName: clubName, userId: userId });
        } catch (error) {
            console.error('Error creating club: ', error);
            Alert.alert('Error', 'Failed to create the club. Please try again.');
        }
    };
    return (
        <ImageBackground source={require('../assets/createclub.png')} style={styles.bgImage}>
            <View style={styles.container}>
                <View style={styles.form}>
                    <View style={styles.header}>
                        <Image source={require('../assets/star.png')} style={styles.image} resizeMode="contain" />
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Create Club</Text>
                        </View>
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter club name"
                            onChangeText={text => setClubName(text)}
                            value={clubName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter club description"
                            onChangeText={(text) => setDescription(text)}
                            value={description}
                            multiline={true}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter club motto"
                            onChangeText={text => setMotto(text)}
                            value={motto}
                            multiline={true}
                        />
                    </View>


                    <TouchableOpacity style={styles.button} onPress={handleCreateClub}>
                        <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16, fontFamily: 'Inter-SemiBold' }}>Create</Text>
                    </TouchableOpacity>


                </View>
                <StatusBar barStyle="light-content" />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    label: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        marginBottom: 8,
    },
    input: {
        backgroundColor: "white",
        // height: 50,
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 6,
        padding: 12,
        borderWidth: 0.2,
        borderColor: '#5B5B5B',
        fontFamily: 'Poppins-Regular',
    },

    bgImage: {
        width: "100%",
        height: "100%",
        justifyContent: 'center',
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    form: {
        flex: 1,
        justifyContent: 'flex-start',
        marginHorizontal: 30,
        fontFamily: 'Poppins-Regular'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        // marginTop: 50
    },
    image: {
        width: 40, 
        height: 40,
        position: 'absolute',
        top: 0,
        right: 0,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        // fontWeight: 'bold',
        color: 'black',
        marginTop: 30,
        fontFamily: 'Poppins-Bold',
    },

    inputContainer: {
    },
    
    curvedBg: {
        width: '100%',
        height: '75%',
        position: "absolute",
        bottom: 0,
        backgroundColor: '#fff',
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
        marginTop: 250,
    },
});
export default ClubCreationScreen;