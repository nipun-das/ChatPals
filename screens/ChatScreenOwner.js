// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, Button, FlatList } from 'react-native';
// import { collection, query, orderBy, onSnapshot, addDoc, where, getDocs } from 'firebase/firestore';
// import { auth, database } from '../config/firebase';

// const ChatScreenOwner = () => {
//     const [clubId, setClubId] = useState('');
//     const [ownerId, setOwnerId] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');

//     useEffect(() => {
//         const fetchClubData = async () => {
//             const currentUser = auth.currentUser;

//             // Fetch club data from Firestore based on the ownerId
//             const clubsQuery = query(collection(database, 'clubs'), where('ownerId', '==', currentUser.uid));
//             const clubsSnapshot = await getDocs(clubsQuery);

//             if (!clubsSnapshot.empty) {
//                 // Assuming a user can own only one club, fetch the first club found
//                 const clubData = clubsSnapshot.docs[0].data();

//                 // Assuming 'clubId' and 'ownerId' are fields in the club document
//                 const fetchedClubId = clubData.cid; // Adjust this based on your actual field name
//                 const fetchedOwnerId = currentUser.uid;
//                 console.log("hi--",fetchedClubId)
//                 console.log("hey--",fetchedOwnerId)

//                 setClubId(fetchedClubId);
//                 setOwnerId(fetchedOwnerId);
//             }
//         };

//         fetchClubData();
//     }, []);

//     useEffect(() => {
//         if (!clubId) {
//             return;
//         }

//         const messagesQuery = query(
//             collection(database, `chatrooms/${clubId}/messages`),
//             orderBy('timestamp', 'asc')
//         );

//         const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
//             const newMessages = snapshot.docs.map((doc) => doc.data());
//             setMessages(newMessages);
//         });

//         return () => unsubscribe();
//     }, [clubId]);

//     const handleSendMessage = async () => {
//         if (newMessage.trim() === '') {
//             return;
//         }

//         try {
//             const timestamp = new Date();
//             await addDoc(collection(database, `chatrooms/${clubId}/messages`), {
//                 senderId: ownerId,
//                 text: newMessage,
//                 timestamp,
//             });
//             setNewMessage('');
//         } catch (error) {
//             console.error('Error sending message: ', error);
//         }
//     };
//     return (
//         <View>
//             <FlatList
//                 data={messages}
//                 keyExtractor={(item, index) => index.toString()}
//                 renderItem={({ item }) => (
//                     <View>
//                         <Text>{item.text}</Text>
//                         {/* Add sender information, timestamp, etc. if needed */}
//                     </View>
//                 )}
//             />
//             <View>
//                 <TextInput
//                     placeholder="Type your message..."
//                     value={newMessage}
//                     onChangeText={(text) => setNewMessage(text)}
//                 />
//                 <Button title="Send" onPress={handleSendMessage} />
//             </View>
//         </View>
//     );
// };

// export default ChatScreenOwner;



import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, where, getDocs } from 'firebase/firestore';
import { database, auth } from '../config/firebase';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const ChatScreenOwner = () => {
    const [clubId, setClubId] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [role, setRole] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [clubDataFetched, setClubDataFetched] = useState(false);
    const [roleFetched, setRoleFetched] = useState(false);

    useEffect(() => {
        const fetchClubData = async () => {
            try {
                const currentUser = auth.currentUser;

                const clubsQuery = query(collection(database, 'clubs'), where('ownerId', '==', currentUser.uid));
                const clubsSnapshot = await getDocs(clubsQuery);

                if (!clubsSnapshot.empty) {
                    const clubData = clubsSnapshot.docs[0].data();
                    const fetchedClubId = clubData.cid;
                    const fetchedOwnerId = currentUser.uid;

                    console.log("club: ", fetchedClubId, " owner: ", fetchedOwnerId)

                    setClubId(fetchedClubId);
                    setOwnerId(fetchedOwnerId);
                    setClubDataFetched(true);
                }
            } catch (error) {
                console.error('Error fetching club data:', error);
            }
        };

        const fetchRole = async () => {
            try {
                const currentUser = auth.currentUser;

                const userDocRef = doc(database, 'users', currentUser.uid);
                const userDocSnapshot = await getDoc(userDocRef);

                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    const fetchedRole = userData.role;
                    setRole(fetchedRole);
                    setRoleFetched(true);
                } else {
                    console.error('User data not found.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (!clubDataFetched) {
            fetchClubData();
        }

        if (!roleFetched) {
            fetchRole();
        }
    }, [clubDataFetched, roleFetched]);

    useEffect(() => {
        if (clubId && ownerId && role) {
            const messagesQuery = query(
                collection(database, `chatrooms/${clubId}/messages`),
                orderBy('timestamp', 'asc')
            );

            const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                const newMessages = snapshot.docs.map((doc) => doc.data());
                setMessages(newMessages);
            });

            return () => unsubscribe();
        }
    }, [clubId, ownerId, role]);

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

    const handleDeleteMessage = async (messageId) => {
        try {
            await deleteDoc(doc(database, `chatrooms/${clubId}/messages`, messageId));
        } catch (error) {
            console.error('Error deleting message: ', error);
        }
    };
    const handleLongPress = (message) => {
        const options = [
            { text: 'Delete Message', onPress: () => handleDeleteMessage(message.messageId) },
            { text: 'View User Profile', onPress: () => handleViewUserProfile(message.senderId) },
            { text: 'Cancel', onPress: () => { } },
        ];

        Alert.alert('Message Options', null, options);
    };

    const handleViewUserProfile = (userId) => {
        console.log("view")
    };

    const formatTimestamp = (timestamp) => {
        // Implement your own timestamp formatting logic (e.g., using Moment.js)
        const jsDate = timestamp.toDate(); // Convert to JavaScript Date object
        return jsDate.toISOString().slice(11, 16);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableWithoutFeedback onLongPress={() => handleLongPress(item)}>
                        <View
                            style={[
                                styles.messageContainer,
                                item.senderId === ownerId ? styles.currentUserMessage : styles.otherUserMessage,
                            ]}
                        >
                            <View style={styles.messageContent}>
                                {item.senderId !== ownerId && (
                                    <View style={item.senderId === ownerId ? styles.currentUserSenderInfoContainer : styles.otherUserSenderInfoContainer}>
                                        <Text style={item.senderId === ownerId ? styles.currentUserSenderInfo : styles.otherUserSenderInfo}>
                                            {item.senderId === ownerId ? ' ' : 'Sender: ' + item.senderId}
                                        </Text>
                                    </View>
                                )}
                                <View style={item.senderId === ownerId ? styles.currentUserMessageTextBox : styles.otherUserMessageTextBox}>
                                    <Text style={styles.messageText}>{item.text}</Text>
                                </View>
                                <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                )}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChangeText={(text) => setNewMessage(text)}
                />
                <Button title="Send" onPress={handleSendMessage} style={styles.sendButton} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 40,
        marginBottom: 8,
        paddingLeft: 15,
        paddingRight: 15,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        borderRadius: 8,
        padding: 8,
        maxWidth: '80%', // Adjusted to set a maximum width for the message container
    },
    messageContent: {
        flex: 1,
    },
    messageTextBox: {
        // backgroundColor:'gray',
        padding: 4,
        borderRadius: 4,
        marginBottom: 4,
    },
    senderInfoContainer: {
        // backgroundColor: 'gray',
        padding: 4,
        borderRadius: 4,
        marginBottom: 4,
    },
    senderInfo: {
        color: 'white',
    },
    messageText: {
        fontSize: 20,
        color: 'white',
    },
    timestamp: {
        color: 'white',
        alignSelf: 'flex-end',

    },
    currentUserMessage: {
        alignSelf: 'flex-end',
        backgroundColor: 'black',
    },
    otherUserMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#ECECEC',
    },
    deleteButton: {
        marginLeft: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        marginRight: 10,
        borderWidth: 1,
        borderRadius: 5,
        padding: 8,
    },
    sendButton: {
        width: 100,
    },
    currentUserMessage: {
        alignSelf: 'flex-end',
        backgroundColor: 'black', // Color for messages sent by the current user
    },
    currentUserSenderInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    currentUserSenderInfo: {
        color: 'white',
    },
    currentUserMessageTextBox: {
        flex: 1,
        marginLeft: 8,
    },

    // Styles for messages sent by other users
    otherUserMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#ECECEC', // Color for messages sent by other users
    },
    otherUserSenderInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    otherUserSenderInfo: {
        color: 'black',
    },
    otherUserMessageTextBox: {
        flex: 1,
        marginLeft: 8,
    },
});

export default ChatScreenOwner;



