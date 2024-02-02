import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { database, auth } from '../config/firebase';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const ChatScreenOwner = ({ navigation }) => {
    const [clubId, setClubId] = useState('');
    const [clubName, setClubName] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [role, setRole] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [clubDataFetched, setClubDataFetched] = useState(false);
    const [roleFetched, setRoleFetched] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
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

    useEffect(() => {
        const fetchClubName = async () => {
            try {
                const clubDocRef = doc(database, 'clubs', clubId);
                const clubDocSnapshot = await getDoc(clubDocRef);

                if (clubDocSnapshot.exists()) {
                    const clubData = clubDocSnapshot.data();
                    const fetchedClubName = clubData.name;
                    setClubName(fetchedClubName);
                } else {
                    console.error('Club data not found.');
                }
            } catch (error) {
                console.error('Error fetching club data:', error);
            }
        };

        if (clubId) {
            fetchClubName();
        }
    }, [clubId]);
    const handleSendMessage = async () => {
        if (newMessage.trim() === '') {
            return;
        }

        try {
            const messageRef = await addDoc(collection(database, `chatrooms/${clubId}/messages`), {
                senderId: ownerId,
                text: newMessage,
                timestamp: new Date(),
            });
            const messageId = messageRef.id;

            // Update the document with its own ID
            await updateDoc(doc(database, `chatrooms/${clubId}/messages`, messageId), { messageId });

            // Clear the newMessage state
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
        console.log("Message deleted!")
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
        const jsDate = timestamp.toDate();
        return jsDate.toISOString().slice(11, 16);
    };

    const handleCreateButtonPress = () => {
        setModalVisible(true);
    };

    const handleOptionSelect = (option) => {
        if (option === 'CreateEvent') {
            console.log("club id sent bto create event: ", clubId)

            navigation.navigate('CreateEventOwner', { clubId });
            setModalVisible(false); // Close the modal if needed
        }
        if (option === 'ScheduleMeeting') {
            console.log("club id sent bto create event: ", clubId)

            navigation.navigate('ScheduleMeetingOwner', { clubId });
            setModalVisible(false); // Close the modal if needed
        } else {
            // Handle other options if necessary
            setModalVisible(false); // Close the modal for other options as well
        }
    };


    return (
        <View style={styles.container}>

            <View style={styles.topBar}>
                {/* Dummy Image Icon */}

                {/* Club Name */}
                <View style={styles.infoContainer}>
                    <Text style={styles.profileName}>{clubName}</Text>
                    <Text style={styles.clubChat}>Chat Room</Text>
                </View>



                <TouchableOpacity onPress={() => handleDummyAction()}>
                    <Image
                        source={require('../assets/leaderboard.png')} // Add the path to your dummy icon
                        style={styles.leaderboardIcon}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleAdditionalAction()}>
                    <Image
                        source={require('../assets/menu.png')} // Add the path to your additional icon
                        style={styles.hamIcon}
                    />
                </TouchableOpacity>

            </View>
            <View style={styles.inContainer}>

                {/* Chat Messages */}
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
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type message here..."
                            value={newMessage}
                            onChangeText={(text) => setNewMessage(text)}
                        />
                        <TouchableOpacity onPress={handleCreateButtonPress} style={styles.createButton}>
                            <Image
                                source={require('../assets/fraction.png')}
                                style={styles.createIcon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                            <Image
                                source={require('../assets/send2.png')}
                                style={styles.sendIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                    }}
                >
                    <View style={styles.modalContainer}>

                        <View style={styles.modalBackground}>
                            <TouchableOpacity style={styles.downArrowContainer} onPress={() => setModalVisible(false)}>
                                <Image source={require('../assets/down-arrow.png')} style={styles.downArrowIcon} />
                            </TouchableOpacity>
                            <View style={styles.modalContent}>
                                <TouchableOpacity onPress={() => handleOptionSelect('CreateEvent')} style={styles.optionContainer}>
                                    <View style={[styles.optionBox, { backgroundColor: '#FFB6C1' }]}>
                                        <Image source={require('../assets/schedule.png')} style={styles.optionIcon} />
                                    </View>
                                    <Text style={[styles.modalOption, { backgroundColor: '#FFB6C1' }]}>Create Event</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => handleOptionSelect('ScheduleMeeting')} style={styles.optionContainer}>
                                    <View style={[styles.optionBox, { backgroundColor: '#90EE90' }]}>
                                        <Image source={require('../assets/meeting.png')} style={styles.optionIcon} />
                                    </View>
                                    <Text style={[styles.modalOption, { backgroundColor: '#90EE90' }]}>Schedule Meeting</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => handleOptionSelect('OrganizeWorkshop')} style={styles.optionContainer}>
                                    <View style={[styles.optionBox, { backgroundColor: '#FFDAB9' }]}>
                                        <Image source={require('../assets/workshop.png')} style={styles.optionIcon} />
                                    </View>
                                    <Text style={[styles.modalOption, { backgroundColor: '#FFDAB9' }]}>Organize Workshop</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => handleOptionSelect('BrainstormSession')} style={styles.optionContainer}>
                                    <View style={[styles.optionBox, { backgroundColor: '#ADD8E6' }]}>
                                        <Image source={require('../assets/brainstorm.png')} style={styles.optionIcon} />
                                    </View>
                                    <Text style={[styles.modalOption, { backgroundColor: '#ADD8E6' }]}>Brainstorm Session</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 40,
        backgroundColor: 'black',
        fontFamily: 'Poppins-Regular'
    },
    inContainer: {
        flex: 1,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        paddingTop: 15,
        // paddingtopra
        backgroundColor: 'white',

    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        marginBottom: 3,
        height: 80,
        backgroundColor: 'black',
    },
    infoContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    profileName: {
        fontSize: 22,
        fontFamily: 'Poppins-Medium',

        color: 'white',
    },
    clubChat: {
        fontSize: 16,
        color: 'white',
        marginRight: 40,
        marginTop: -5,
        fontFamily: 'Poppins-Regular',

    },
    leaderboardIcon: {
        width: 30,
        height: 30,

        resizeMode: 'contain',
        marginRight: -150,
        marginLeft: 40
    },
    hamIcon: {
        width: 30,
        height: 30,

        resizeMode: 'contain',
        // marginRight: 10,
        // marginLeft:-80
    },
    clubName: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },



    //////////////////////////////////

    messageContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        borderRadius: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
        paddingBottom: 2,
        marginRight: 13,
        maxWidth: '67%',
    },
    messageContent: {
        // alignSelf: 'flex-end',
    },
    messageText: {
        fontSize: 15,
        color: 'white',
        fontFamily: 'Inter-Regular'

    },
    timestamp: {
        color: 'white',
        fontSize: 10,
        alignSelf: 'flex-end',
        fontFamily: 'Poppins-Regular'

    },
    otherUserMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#ECECEC',
        fontFamily: 'Poppins-Regular'
    },
    currentUserMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#005979',
        alignSelf: 'flex-end',
        borderTopRightRadius: 30,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 20,
        borderTopLeftRadius: 20,

    },
    currentUserSenderInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end'
    },
    currentUserSenderInfo: {
        color: 'white',
    },
    currentUserMessageTextBox: {
        flex: 1,
        marginLeft: 8,
        marginRight: 40,
        alignSelf: 'flex-end'
    },
    otherUserMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#ECECEC',
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

    ///////////////////////////////////////////
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
        marginTop: 4,
        height: 58,
        marginBottom: 2,
        // backgroundColor: 'transaparent',
        // // position: 'absolute',
        // bottom: 0,
        // left: 0,
        // right: 0,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#F6F6F6',


    },
    inputWrapper: {
        position: 'relative',
        flex: 1,
        backgroundColor: 'transaparent'
    },
    input: {
        flex: 1,
        backgroundColor: 'transaparent',
        borderRadius: 25,
        paddingLeft: 25,
        marginTop: 5,
        marginLeft: 20,
        marginRight: 20,
        fontFamily: 'Poppins-Regular',
        backgroundColor: 'white'
    },
    sendButton: {
        position: 'absolute',
        top: 8,
        right: 35,
    },
    sendIcon: {
        width: 32,
        height: 32,
        marginTop: 3,
        resizeMode: 'contain',
    },
    createButton: {
        position: 'absolute',
        top: 8,
        right: 75,
    },
    createIcon: {
        width: 32,
        height: 32,
        marginTop: 3,
        resizeMode: 'contain',
    },


    deleteButton: {
        marginLeft: 10,
    },


    // Styles for the modal
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end', // Adjusted to position modal at the bottom

    },
    modalBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'flex-end', // Adjusted to position modal at the bottom
        flex: 1,


    },
    modalContent: {
        backgroundColor: 'white',
        backgroundColor: '#016488',
        padding: 20,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        width: '100%', // Adjusted to take full width
        paddingTop: 33,

    },
    modalOption: {
        fontSize: 18,
        marginBottom: 15,

    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 10,

    },
    optionBox: {
        width: 47,
        height: 47,
        borderRadius: 8,
        justifyContent: 'center',
        elevation: 2,

        alignItems: 'center',
        marginRight: 10,
    },
    optionIcon: {
        width: 27,
        height: 27,
        resizeMode: 'contain',

    },
    modalOption: {
        fontSize: 18,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        overflow: 'hidden',
        fontFamily: 'Poppins-Medium',
        elevation: 2,

        color: 'black', // Adjust the text color
        flex: 1,
        textAlign: 'center'

    },
    downArrowContainer: {
        position: 'absolute',
        top: 440,
        alignSelf: 'center',
        zIndex: 1,
    },
    downArrowIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },

});

export default ChatScreenOwner;



