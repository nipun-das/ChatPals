// import React from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { updateDoc, doc, setDoc } from 'firebase/firestore';
// import { useNavigation } from '@react-navigation/native';
// import { useRoute } from '@react-navigation/native';
// import { auth, database } from '../config/firebase';
// import { signOut } from 'firebase/auth';

// const ClubSelectionScreen = ({ navigation }) => {
//     // const route = useRoute();
//     // // const { name, branch, regNo, semester, interests } = route.params;
//     // // const route = useRoute();
//     // const name = route.params && route.params.name ? route.params.name : '';
//     // const branch = route.params && route.params.branch ? route.params.branch : '';
//     // const regNo = route.params && route.params.regNo ? route.params.regNo : '';
//     // const semester = route.params && route.params.semester ? route.params.semester : '';
//     // const interests = route.params && route.params.interests ? route.params.interests : '';
//     // // console.log("Club sel page : ", name, branch, regNo, semester, interests, auth.currentUser.uid)


//     // const route = useRoute();
//     // const { name, branch, regNo, semester, interests } = route.params;
//     const route = useRoute();

//     // Check if route.params is defined before accessing its properties
//     const { name, branch, regNo, semester, interests } = route.params || {};
//     console.log("Club sel page : ", name, branch, regNo, semester, interests, auth.currentUser.uid)

//     const handleSignOut = async () => {
//         try {
//             // Check if there is a currently authenticated user

//             const currentUser = auth.currentUser;
//             console.log("Club sel page signout ",currentUser)

//             if (currentUser && currentUser.uid) {
//                 // Call the Firebase signOut function to log the user out
//                 await new Promise((resolve) => setTimeout(resolve, 1000)); 
//                 await signOut(auth);
//                 navigation.navigate('Login');
//             } else {
//                 console.error('No authenticated user to sign out');
//             }
//         } catch (error) {
//             console.error('Sign-out error: ', error);
//         }
//     };


//     const handleCreateClub = async () => {
//         try {
//             // Update the user's role to "Owner" in Firestore
//             const currentUser = auth.currentUser;

//             if (currentUser && currentUser.uid) {
//                 // Create a new owner document in the "owners" collection
//                 const ownerDocRef = doc(database, 'owners', currentUser.uid);
//                 await setDoc(ownerDocRef, {
//                     name,
//                     branch,
//                     regNo,
//                     semester,
//                     interests,
//                 });

//                 // Now, navigate the user to the club creation page
//                 navigation.navigate('ClubCreationScreen');
//             } else {
//                 console.error('User not authenticated');
//             }
//         } catch (error) {
//             console.error('Error updating user role:', error);
//         }
//     };



//     // const handleJoinClub = async () => {
//     //     try {
//     //         // Get the currently authenticated user
//     //         const currentUser = auth.currentUser;

//     //         if (currentUser) {
//     //             // Update the user's role to "Member" in Firestore
//     //             const userDocRef = doc(database, 'users', currentUser.uid); // Assuming you have a 'users' collection
//     //             await updateDoc(userDocRef, { role: 'Member' });

//     //             // Navigate the user to the club joining page
//     //             // You can use React Navigation to do this
//     //             console.log("Club sel page : ", name, branch, regNo, semester, interests, currentUser.uid)

//     //             navigation.navigate("ClubJoiningScreen");
//     //         } else {
//     //             console.error("User not authenticated");
//     //         }
//     //     } catch (error) {
//     //         console.error("Error updating user role:", error);
//     //     }
//     // };


//     return (
//         <View>
//             <Button
//                 title="Sign Out"
//                 onPress={handleSignOut}
//                 style={styles.signOutButton}
//             />
//             <Text>Choose an option:</Text>
//             <Button title="Create Club (Owner)" onPress={handleCreateClub} />
//             {/* <Button title="Join Club (Member)" onPress={handleJoinClub} /> */}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center', // Center items vertically
//         alignItems: 'center',     // Center items horizontally
//     },
//     title: {
//         fontSize: 20,
//         marginBottom: 20,
//     },
// });

// export default ClubSelectionScreen;



import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { updateDoc, doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { auth, database } from '../config/firebase';
import { signOut } from 'firebase/auth';

const ClubSelectionScreen = ({ navigation }) => {

    
    const route = useRoute();
    const { name, branch, regNo, semester, interests } = route.params || {};

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Check if there is a currently authenticated user
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
        });

        // Clean up the subscription when the component unmounts
        return () => unsubscribe();
    }, []);

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
            if (currentUser && currentUser.uid) {
                console.log("Recv. by ClubSel: ", name, branch, regNo, semester, interests)
                const ownerDocRef = doc(database, 'owners', currentUser.uid);
                await setDoc(ownerDocRef, {
                    uid: currentUser.uid,
                    name,
                    branch,
                    regNo,
                    semester,
                    interests,
                });

                navigation.navigate('ClubCreationScreen');
            } else {
                console.error('User not authenticated');
            }
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    // const handleJoinClub = async () => {
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
        <View>
            <Button
                title="Sign Out"
                onPress={handleSignOut}
                style={styles.signOutButton}
            />
            <Text>Choose an option:</Text>
            <Button title="Create Club (Owner)" onPress={handleCreateClub} />
            {/* <Button title="Join Club (Member)" onPress={handleJoinClub} /> */}

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
