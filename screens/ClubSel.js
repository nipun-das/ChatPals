import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { updateDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';




const ClubSelectionScreen = ({ navigation }) => {

    const handleCreateClub = async () => {
        try {
            // Update the user's role to "Owner" in Firestore
            const userDocRef = doc(database, 'users', user.uid); // Assuming you have a 'users' collection
            await updateDoc(userDocRef, { role: 'Owner' });

            // Navigate the user to the club creation page
            // You can use React Navigation to do this
            navigation.navigate("ClubCreationScreen");
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    const handleJoinClub = async () => {
        try {
            // Update the user's role to "Member" in Firestore
            const userDocRef = doc(database, 'users', user.uid); // Assuming you have a 'users' collection
            await updateDoc(userDocRef, { role: 'Member' });

            // Navigate the user to the club joining page
            // You can use React Navigation to do this
            navigation.navigate("ClubJoiningScreen");
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };


    return (
        <View>
            <Text>Choose an option:</Text>
            <Button title="Create Club (Owner)" onPress={handleCreateClub} />
            <Button title="Join Club (Member)" onPress={handleJoinClub} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
       flex: 1,
       justifyContent: 'center', // Center items vertically
       alignItems: 'center',     // Center items horizontally
    },
    title: {
       fontSize: 20,
       marginBottom: 20,
    },
 });
 
export default ClubSelectionScreen;
