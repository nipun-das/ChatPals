// AvatarSelectionScreen.js
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, getAuth, updateProfile as updateProfileFirebase } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';

const auth = getAuth();
const updateProfile = updateProfileFirebase;
const db = getFirestore();
const avatars = [
    { id: 1, source: require('../assets/avatar1.png') },
    { id: 2, source: require('../assets/avatar2.png') },
    { id: 3, source: require('../assets/avatar3.png') },
    { id: 4, source: require('../assets/avatar4.png') },
    { id: 5, source: require('../assets/avatar5.png') },
    { id: 6, source: require('../assets/avatar6.png') },
    { id: 7, source: require('../assets/avatar7.png') },
    { id: 8, source: require('../assets/avatar8.png') },
    { id: 9, source: require('../assets/avatar9.png') },
];

const UserAvatar = ({ navigation }) => {
    // const navigation = useNavigation();
    const route = useRoute();
    const [selectedAvatar, setSelectedAvatar] = useState(null);

    const handleAvatarSelection = (avatar) => {
        // console.log("Avatar:", avatar);
        console.log("handleAvatarSelection : ", avatar.id)
        setSelectedAvatar(avatar.id);
    };


    const handleContinue = async () => {

        const { name, email, password, branch, regNo, semester, interests } = route.params;
        console.log("Sign up recv by useravatar: ", name, email, password, branch, regNo, semester, interests)

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("user created!!")
        const user = userCredential.user;
        if (!user) {
            console.error('User uid not provided.');
            return;
        }

        try {
            await setDoc(doc(db, 'users', user.uid), {
                name,
                branch,
                regNo,
                semester,
                interests,
                avatarId: selectedAvatar,
                uid: user.uid,
            });
            console.log('user avatar page -->Name:', name);
            console.log('Branch:', branch);
            console.log('Reg No:', regNo);
            console.log('Semester:', semester);
            console.log('Interests:', interests);
            console.log("avatarId : ", selectedAvatar)
            navigation.navigate('JoinOrCreate');
        } catch (error) {
            console.error('Error updating user profile:', error);
        };
    }
    const avatarsInRows = chunkArray(avatars, 3);

    const backgroundColors = ['#589BF7', '#FFC562', '#9A7ED9', '#E84B23', '#33A1FF', '#97CE64', '#F9CEC4', '#9A7ED9', '#FFC562'];


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={require('../assets/star.png')} style={styles.image} resizeMode="contain" />
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Choose your Avatar</Text>
                </View>
            </View>
            {avatarsInRows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.avatarRow}>
                    {row.map((avatar, colIndex) => (
                        <TouchableOpacity
                            key={colIndex}
                            onPress={() => handleAvatarSelection(avatar)}
                            style={{ backgroundColor: backgroundColors[rowIndex * 3 + colIndex], margin: 5, position: 'relative' }}
                        >
                            <Image source={avatar.source} style={styles.avatar} />
                            {selectedAvatar === avatar.id ? (
                                <FontAwesome name="check-circle" size={24} color="white" style={styles.checkmark} />
                            ) : null}
                        </TouchableOpacity>
                    ))}


                </View>
            ))}
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    title: {
        fontSize: 26,
        marginBottom: 60,
        marginTop: 30,
        fontFamily: 'Poppins-Bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: -20,
    },
    image: {
        width: 40,
        height: 40,
        position: 'absolute',
        top: -70,
        right: -10,
    },
    avatarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 30,
        margin: 15,
        borderRadius: 50
    },
    avatar: {
        width: 95,
        height: 95,
        borderRadius: 40,
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
    },

    continueButton: {
        backgroundColor: 'black',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        width: 150
    },
    continueButtonText: {
        color: '#fff', fontSize: 17, fontFamily: 'Inter-SemiBold',
    },
    avatarRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
});
function chunkArray(array, chunkSize) {
    return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
        array.slice(index * chunkSize, (index + 1) * chunkSize)
    );
}
export default UserAvatar;
