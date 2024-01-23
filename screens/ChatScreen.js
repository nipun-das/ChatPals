// // ChatScreen.js

// import React from 'react';
// import { View, Text, Image, StyleSheet } from 'react-native';
// import BottomNavigation from './BottomNavigation';

// const ChatScreen = () => {
//     return (
//         <View style={styles.container}>
//             <Text style={{ top: 180, display: 'flex', justifyContent: 'center', fontFamily: 'Poppins-Bold', fontSize: 30, textAlign: 'center' }}>Under{'\n'}Development</Text>
//             <Image source={require("../assets/error.png")} style={styles.image} resizeMode="contain" />
//             <Text style={{ top: 320, display: 'flex', justifyContent: 'center', fontFamily: 'Poppins-Medium', fontSize: 18, textAlign: 'center' }}>This feature will arrive soon.</Text>

//             <BottomNavigation />
//         </View>
//     );
// };

// const styles = StyleSheet
// .create({
//     container: {
//         flex: 1,
//         backgroundColor: "white",
//     },
//     image: {
//         width: 260,
//         height: 260,
//         position: 'absolute',
//         top: 210,
//         left: 45
//     },
// })

// export default ChatScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, where, getDocs } from 'firebase/firestore';
import { auth, database } from '../config/firebase';

const ChatScreen = () => {
    const [clubId, setClubId] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const fetchClubData = async () => {
            const currentUser = auth.currentUser;

            // Fetch club data from Firestore based on the ownerId
            const clubsQuery = query(collection(database, 'clubs'), where('ownerId', '==', currentUser.uid));
            const clubsSnapshot = await getDocs(clubsQuery);

            if (!clubsSnapshot.empty) {
                // Assuming a user can own only one club, fetch the first club found
                const clubData = clubsSnapshot.docs[0].data();

                // Assuming 'clubId' and 'ownerId' are fields in the club document
                const fetchedClubId = clubData.cid; // Adjust this based on your actual field name
                const fetchedOwnerId = currentUser.uid;
                console.log("hi--",fetchedClubId)
                console.log("hey--",fetchedOwnerId)

                setClubId(fetchedClubId);
                setOwnerId(fetchedOwnerId);
            }
        };

        fetchClubData();
    }, []);

    useEffect(() => {
        if (!clubId) {
            return;
        }

        const messagesQuery = query(
            collection(database, `chatrooms/${clubId}/messages`),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = snapshot.docs.map((doc) => doc.data());
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [clubId]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') {
            return;
        }

        try {
            const timestamp = new Date();
            await addDoc(collection(database, `chatrooms/${clubId}/messages`), {
                senderId: ownerId,
                text: newMessage,
                timestamp,
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message: ', error);
        }
    };
    return (
        <View>
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item.text}</Text>
                        {/* Add sender information, timestamp, etc. if needed */}
                    </View>
                )}
            />
            <View>
                <TextInput
                    placeholder="Type your message..."
                    value={newMessage}
                    onChangeText={(text) => setNewMessage(text)}
                />
                <Button title="Send" onPress={handleSendMessage} />
            </View>
        </View>
    );
};

export default ChatScreen;


