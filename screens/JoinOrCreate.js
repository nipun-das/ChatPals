import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, Image, StatusBar } from 'react-native';
import { updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { database, auth } from '../config/firebase';
import { getCurrentUser, getAuth, signOut } from 'firebase/auth';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useContext } from 'react';
import { AuthenticatedUserContext } from '../App';


const JoinOrCreate = ({ navigation }) => {

    const { user, setUser } = useContext(AuthenticatedUserContext);
    const [userData, setUserData] = useState(null);

    const currentUser = getAuth().currentUser;

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);

                const userDocRef = doc(database, 'users', authUser.uid);
                console.log("auth user in joinorcreate : ", authUser.uid)
                getDoc(userDocRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            setUserData(snapshot.data());
                            // console.log('User Data in JoinOrCreate:--', userData);

                        } else {
                            console.error('User data not found.');
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching user data:', error);
                    });
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);
    useEffect(() => {
        console.log('User Data in JoinOrCreate:', userData);
    }, [userData]);

    // const handleSignOut = async () => {

    //     console.log("handle signout pressed")

    //     try {
    //         if (currentUser && currentUser.uid) {
    //             await signOut(auth);
    //             navigation.navigate('Login');
    //         } else {
    //             console.error('No authenticated user to sign out');
    //         }
    //     } catch (error) {
    //         console.error('Sign-out error: ', error);
    //     }
    // };

    const handleCreateClub = async () => {
        try {
            console.log("user in joinorcreate", currentUser.uid)

            console.log("handle create pressed")

            // if (!currentUser || !currentUser.uid) {
            //     setTimeout(() => handleCreateClub(), 500);
            //     return;
            // }

            // const userDocRef = doc(database, 'users', currentUser.uid);

            // await setDoc(userDocRef, { ...userData, role: 'owner' });

            navigation.navigate('ClubCreationScreen');
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };


    // const handleJoinClub = async () => {
    //     console.log("handle join pressed")

    //     try {
    //         if (currentUser && currentUser.uid) {
    //             const memberDocRef = doc(database, 'members', currentUser.uid);
    //             await setDoc(memberDocRef, {
    //                 uid: currentUser.uid,
    //                 name,
    //                 branch,
    //                 regNo,
    //                 semester,
    //                 interests,
    //             });

    //             navigation.navigate('ClubJoiningScreen');
    //         } else {
    //             console.error('User not authenticated');
    //         }
    //     } catch (error) {
    //         console.error('Error updating user role:', error);
    //     }
    // };

    return (

        <View style={styles.container}>
            <View style={styles.curvedBg} />
            <SafeAreaView style={styles.form}>
                {/* <View style={styles.header}>

                    <Image source={require('../assets/star.png')} style={styles.image} resizeMode="contain" />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Join{'\n'}The{'\n'}Community!</Text>
                    </View>

                </View>
                <View style={styles.mottoContainer}>
                    <Text style={styles.motto1}>Connect.</Text>
                    <Text style={styles.motto2}>Create.</Text>
                    <Text style={styles.motto3}>Collaborate.</Text>
                </View> */}

                {/* <TouchableOpacity style={styles.button1} onPress={handleJoinClub}>
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16, fontFamily: 'Inter-SemiBold' }}>Join a a Club</Text>
                </TouchableOpacity> */}

                <Button
                    title="Create a Club"
                    onPress={handleCreateClub}
                    style={styles.button2} // You may need to remove this line if Button component doesn't support style prop
                    color="black" // You can customize the color if needed
                />

                {/* 
                <View style={{ marginTop: 90, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'black', fontWeight: '600', fontSize: 14, fontFamily: 'Inter-Regular', opacity: 0.7 }}>Do you want to Sign out? </Text>
                    <TouchableOpacity onPress={handleSignOut}>
                        <Text style={{ color: 'black', fontWeight: '600', fontSize: 14, fontFamily: 'Inter-SemiBold', textDecorationLine: 'underline' }}>Sign out</Text>
                    </TouchableOpacity>
                </View> */}

            </SafeAreaView>
            <StatusBar barStyle="light-content" />
        </View>
    );

};




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    styleElement: {
        position: 'absolute',
        top: -190, // Adjust the top position as needed
        left: 120, // Adjust the left position as needed
        width: 90, // Adjust the width as needed
        height: 500, // Adjust the height as needed
        backgroundColor: '#BF0B0B', // Set the desired background color
        // borderRadius: 10,groundColor: 'transparent', // Make it transparent so it doesn't block underlying content
        opacity: 0.12,
        transform: [{ rotate: '-55deg' }]
    },

    title: {
        fontSize: 25,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Regular',
        color: "#005A89",
        alignSelf: "center",
        paddingBottom: 28,
        paddingTop: 70
    },
    input: {
        backgroundColor: "#F6F7FB",
        height: 58,
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
    bgImage: {
        width: "100%",
        height: 340,
        position: "absolute",
        top: 0,
        opacity: 0.85,
        resizeMode: 'cover',
    },
    curvedBg: {
        width: '100%',
        height: '75%',
        position: "absolute",
        bottom: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 60,
    },
    form: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 30,
    },
    button: {
        backgroundColor: '#005A89',
        height: 58,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    form: {
        flex: 1,
        // justifyContent: 'flex-start',
        marginHorizontal: 30,
        fontFamily: 'Poppins-Regular',
        marginTop: 50
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        // marginTop: 50
    },
    image: {
        width: 40, // Set your desired width
        height: 40, // Set your desired height
        position: 'absolute',
        top: 10,
        right: 0,
    },
    titleContainer: {
        flex: 1,
        // alignItems: 'center',

    },
    title: {
        fontSize: 40,
        // fontWeight: 'bold',
        color: 'black',
        marginTop: 80,
        marginBottom: 40,
        fontFamily: 'Poppins-Bold',


    },
    mottoContainer: {
        // flex: 1,
        marginTop: -75,
    },
    motto1: {
        fontSize: 22,
        fontFamily: 'Poppins-Medium',
        color: '#282828'


    },
    motto2: {
        fontSize: 22,
        fontFamily: 'Poppins-Medium',
        color: '#D90505',
        // fontWeight:'500' 
    },
    motto3: {
        fontSize: 22,
        color: '#293DA6',
        fontFamily: 'Poppins-Medium',


    },

    input: {
        backgroundColor: "white",
        height: 50,
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 6,
        padding: 12,
        borderWidth: 0.2,
        marginTop: 2,
        borderColor: '#5B5B5B',
        fontFamily: 'Poppins-Regular'
    },
    bgImage: {
        width: "100%",
        height: 340,
        position: "absolute",
        opacity: 0.85,
        top: 0,
        resizeMode: 'cover',
    },
    curvedBg: {
        width: '100%',
        height: '75%',
        position: "absolute",
        bottom: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 60,
    },
    eyeButton: {
        position: 'absolute', // Position the button absolutely
        top: 16, // Adjust the top position as needed
        right: 15, // Adjust the right position as needed
    },
    button1: {
        backgroundColor: 'black',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    button2: {
        backgroundColor: 'black',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
});

export default JoinOrCreate;
