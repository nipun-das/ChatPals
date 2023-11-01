import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { signOut } from 'firebase/auth'; 


export default function ClubCreationScreen({ navigation }) {
    const [clubName, setClubName] = useState('');
    const [description, setDescription] = useState('');

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
            // Get the currently authenticated user's UID
            const userId = auth.currentUser.uid;

            // Create a new club document
            const clubRef = await addDoc(collection(database, 'clubs'), {
                name: clubName,
                description,
                ownerId: userId,
                // Add more club details here if needed
            });

            console.log('Club created with ID: ', clubRef.id);

            // Optionally, navigate to a club details screen or another page
            navigation.navigate('ClubCreationSuccess', { clubId: clubRef.id });
        } catch (error) {
            console.error('Error creating club: ', error);
            Alert.alert('Error', 'Failed to create the club. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Button
                title="Sign Out"
                onPress={handleSignOut}
                style={styles.signOutButton}
            />
            <Text style={styles.label}>Club Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter club name"
                onChangeText={text => setClubName(text)}
                value={clubName}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter club description"
                onChangeText={text => setDescription(text)}
                value={description}
                multiline={true}
            />

            <Button
                title="Create Club"
                onPress={handleCreateClub}
                disabled={!clubName || !description}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
});
