import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity, Modal, StatusBar, Vibration, TouchableHighlight } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { database, auth } from '../config/firebase';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';


const Stack = createStackNavigator();

const ChatScreenOwner = ({ route, navigation }) => {
    const [clubId, setClubId] = useState('');
    const [clubName, setClubName] = useState('');
    const [ownerId, setOwnerId] = useState('');

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [clubDataFetched, setClubDataFetched] = useState(false);
    const [role, setRole] = useState('');
    const [roleFetched, setRoleFetched] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const flatListRef = useRef(null);



    const fetchClubData = async (clubId) => {
        try {
            if (!clubId) {
                console.error('ClubId is undefined.');
                return;
            }
            console.log("clubid : ", clubId)
            console.log("fetchClubData running!!!")
            const currentUser = auth.currentUser;
            console.log("Current User in Chat : ", currentUser.uid);

            const clubsQuery = query(collection(database, 'clubs'), where('cid', '==', clubId));
            const clubsSnapshot = await getDocs(clubsQuery);

            if (!clubsSnapshot.empty) {
                console.log("yes!!!!!")
                const clubData = clubsSnapshot.docs[0].data();
                console.log("Snapshot----------->", clubsSnapshot.docs[0].data())

                const fetchedClubId = clubData.cid;
                const fetchedOwnerId = clubData.ownerId;

                console.log("fetchedClubId: ", fetchedClubId, " owner: ", fetchedOwnerId)

                setClubId(fetchedClubId);
                setOwnerId(fetchedOwnerId);
                setClubDataFetched(true);
            }
            else {
                console.log("Snapshot is empty")
            }
        } catch (error) {
            console.error('Error fetching club data:', error);
        }
    };
    useEffect(() => {

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
        // if (!clubDataFetched) {
        //     fetchClubData(clubId);
        // }

        if (!roleFetched) {
            fetchRole();
        }

    }, [clubDataFetched, roleFetched]);

    useEffect(() => {
        if (clubId && ownerId && role) {
            const messagesQuery = query(collection(database, `chatrooms/${clubId}/messages`), orderBy('timestamp', 'asc'));

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

    useEffect(() => {
        const { clubId } = route.params;
        console.log("received:", clubId)
        if (clubId) {
            setClubId(clubId);
            fetchClubData(clubId);
        }
    }, []);


    // --------------------------------------------------------


    const handleSendMessage = async () => {
        if (newMessage.trim() === '') {
            return;
        }
        console.log("clubid in chat:", clubId)
        try {
            const currentUser = auth.currentUser;

            const senderDoc = await getDoc(doc(database, 'users', currentUser.uid));
            const senderName = senderDoc.exists() ? senderDoc.data().name : 'Unknown';

            const messageRef = await addDoc(collection(database, `chatrooms/${clubId}/messages`), {
                senderId: currentUser.uid,
                senderName: senderName,
                text: newMessage,
                timestamp: new Date(),
                messageType: 'normalMessage',
            });
            const messageId = messageRef.id;

            await updateDoc(doc(database, `chatrooms/${clubId}/messages`, messageId), { messageId });

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
            console.log("club id sent to create event: ", clubId)
            navigation.navigate('CreateEventOwner', { clubId });
            setModalVisible(false);
        }
        if (option === 'ScheduleMeeting') {
            console.log("club id sent to scdhule meet: ", clubId)
            navigation.navigate('ScheduleMeetingOwner', { clubId });
            setModalVisible(false);
        }
        if (option === 'OrganizeWorkshopOwner') {
            console.log("club id sent to org workshop: ", clubId)
            navigation.navigate('OrganizeWorkshopOwner', { clubId });
            setModalVisible(false);
        }
        else {
            setModalVisible(false);
        }
    };

    const goBack = () => {
        navigation.navigate("ClubFeed")
    }

    const handleTouch = () => {
        Vibration.vibrate(110);
    };

    const handleRenderMessage = (item) => {
        if (item.messageType === 'normalMessage') {
            const currentUserId = auth.currentUser.uid;
            console.log(item.senderId)

            return (
                <TouchableWithoutFeedback onLongPress={() => { if (role === 'owner') { handleLongPress(item); } }}>
                    <View
                        style={[
                            styles.messageContainer,
                            item.senderId === currentUserId ? styles.currentUserMessage : styles.otherUserMessage,
                        ]}
                    >
                        <View style={styles.messageContent}>
                            <View>
                                <View style={item.senderId === currentUserId ? styles.currentUserSenderInfoContainer : styles.otherUserSenderInfoContainer}>
                                    <Text style={item.senderId === currentUserId ? styles.currentUserSenderInfo : styles.otherUserSenderInfo}>
                                        {item.senderId === currentUserId ? ' ' : item.senderName}
                                    </Text>
                                </View>

                            </View>
                            <View style={item.senderId === currentUserId ? styles.currentUserMessageTextBox : styles.otherUserMessageTextBox}>
                                <Text style={styles.messageText}>{item.text}</Text>
                            </View>
                            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            );
        } else if (item.messageType === 'eventMessage') {
            const handleEventPress = () => {
                Vibration.vibrate(110);
                console.log(item.eventId, "-------------", clubId);

                navigation.navigate('RegisterEvent', { eventId: item.eventId, clubId: item.clubId });
            }
            const dateComponents = item.eventDate.split('-');
            console.log("dateevent:", dateComponents)
            const year = parseInt(dateComponents[0]);
            const monthName = dateComponents[1];
            const day = parseInt(dateComponents[2]);
            const monthIndex = new Date(Date.parse(monthName + ' 1, 2000')).getMonth();
            const eventDateObj = new Date(year, monthIndex, day);
            const formattedDate = `${day} ${monthName}`;


            return (
                <TouchableHighlight onPress={handleEventPress} underlayColor="transparent">
                    <View style={styles.eventMessageContainer}>
                        <View style={styles.contentContainer}>
                            <View style={styles.leftSection}>
                                <Image source={require('../assets/schedule.png')} style={styles.icon} />
                                <View style={styles.eventDetails}>
                                    <Text style={styles.eventName}>{item.eventName}</Text>
                                    <Text style={styles.eventDate}>{formattedDate}</Text>
                                    <Text style={styles.eventLocation}>{item.eventLocation}</Text>
                                </View>
                            </View>

                            <View style={styles.rightSection}>
                                <View style={[styles.eventTag, { backgroundColor: '#FFB6C1', }]}>
                                    <Text style={styles.eventTagText}>Event</Text>
                                </View>
                                <Image source={require('../assets/right-arrow.png')} style={styles.arrowIcon} />
                            </View>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        else if (item.messageType === 'meetingMessage') {
            const handleMeetingPress = () => {
                Vibration.vibrate(110);
                console.log(item.meetingId, "-------------", clubId);

                navigation.navigate('RegisterMeeting', { meetingId: item.meetingId, clubId: item.clubId });
            }

            const dateComponents = item.meetingDate.split('-');
            console.log("datemeet:", dateComponents)
            const year = parseInt(dateComponents[0]);
            const monthName = dateComponents[1];
            const day = parseInt(dateComponents[2]);
            const monthIndex = new Date(Date.parse(monthName + ' 1, 2000')).getMonth();
            const eventDateObj = new Date(year, monthIndex, day);
            const formattedDate = `${day} ${monthName}`;
            return (
                <TouchableHighlight onPress={handleMeetingPress} underlayColor="transparent">
                    <View style={styles.eventMessageContainer}>
                        <View style={[styles.contentContainer, { backgroundColor: '#211155' }]}>
                            <View style={styles.leftSection}>
                                <Image source={require('../assets/meeting.png')} style={styles.icon} />
                                <View style={styles.eventDetails}>
                                    <Text style={styles.eventName}>{item.meetingTopic}</Text>
                                    <Text style={styles.eventDate}>{formattedDate}</Text>
                                    <Text style={styles.eventLocation}>Google Meet : {item.meetingLink}</Text>
                                </View>
                            </View>

                            <View style={styles.rightSection}>
                                <View style={[styles.eventTag, { backgroundColor: '#90EE90', }]}>
                                    <Text style={styles.eventTagText}>Meeting</Text>
                                </View>
                                <Image source={require('../assets/right-arrow.png')} style={styles.arrowIconMeeting} />
                            </View>
                        </View>

                    </View>
                </TouchableHighlight>
            );
        }
        else if (item.messageType === 'workshopMessage') {
            const handleWorkshopPress = () => {
                Vibration.vibrate(110);
                console.log(item.workshopId, "-------------", clubId);

                navigation.navigate('RegisterWorkshop', { workshopId: item.workshopId, clubId: item.clubId });
            }


            const dateComponents = item.workshopDate.split('-');
            console.log("dateworkshop:", dateComponents)
            const year = parseInt(dateComponents[0]);
            const monthName = dateComponents[1];
            const day = parseInt(dateComponents[2]);
            const monthIndex = new Date(Date.parse(monthName + ' 1, 2000')).getMonth();
            const eventDateObj = new Date(year, monthIndex, day);
            const formattedDate = `${day} ${monthName}`;
            return (
                <TouchableHighlight onPress={handleWorkshopPress} underlayColor="transparent">
                    <View style={styles.eventMessageContainer}>
                        <View style={[styles.contentContainer, { backgroundColor: '#00160A' }]}>
                            <View style={styles.leftSection}>
                                <Image source={require('../assets/workshop.png')} style={styles.icon} />
                                <View style={styles.eventDetails}>
                                    <Text style={styles.eventName}>{item.workshopTopic}</Text>
                                    <Text style={styles.eventDate}>{formattedDate}</Text>
                                    <Text style={styles.eventLocation}>{item.workshopLocation}</Text>
                                </View>
                            </View>

                            <View style={styles.rightSection}>
                                <View style={[styles.eventTag, { backgroundColor: '#90EE90', }]}>
                                    <Text style={styles.eventTagText}>Workshop</Text>
                                </View>
                                <Image source={require('../assets/right-arrow.png')} style={styles.arrowIconMeeting} />
                            </View>
                        </View>

                    </View>
                </TouchableHighlight>
            );
        }
        return null;
    };




    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="black" />
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={30} color="black" />
                </TouchableOpacity>
                <View style={styles.infoContainer}>
                    <Text style={[styles.profileName, {
                        fontSize: 21, fontFamily: 'DMSans-Bold', marginBottom: 5, color: 'black',
                    }]}>{clubName}</Text>
                    <View style={[styles.roleContainer, { backgroundColor: '#EDE6FF', marginBottom: 0, width: 68, height: 15, justifyContent: 'center', alignItems: 'center', borderRadius: 5, }]}>
                        <Text style={[styles.roleText, { color: '#6E3DF1', fontFamily: 'DMSans-Bold', fontSize: 12, }]}>Chatroom</Text>
                    </View>
                </View>

                {/* <TouchableOpacity style={styles.leaderboardIcon} onPress={() => handleDummyAction()}>
                    <Ionicons name="trophy-outline" size={25} color="black" />
                </TouchableOpacity>


                <TouchableOpacity onPress={() => handleAdditionalAction()} style={styles.hamIcon}>
                    <Ionicons name="ellipsis-vertical" size={25} color="black" />
                </TouchableOpacity> */}

            </View>
            <View style={styles.inContainer}>
                <View style={styles.topLeftPadding} />
                <View style={styles.topRightPadding} />

                <FlatList
                    // inverted
                    data={messages}
                    ref={flatListRef}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => handleRenderMessage(item)}
                    onLayout={() => {
                        if (flatListRef.current) {
                            flatListRef.current.scrollToEnd({ animated: true });
                        }
                    }}
                />

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.input, { height: Math.max(35, newMessage.split('\n').length * 20) }]}
                            placeholder="Type message here..."
                            value={newMessage}
                            multiline
                            onChangeText={(text) => setNewMessage(text)}
                        />
                        {role === 'owner' && (
                            <TouchableOpacity onPress={handleCreateButtonPress} style={styles.createButton}>
                                <Image
                                    source={require('../assets/fraction.png')}
                                    style={styles.createIcon}
                                />
                            </TouchableOpacity>
                        )}

                        {/* <TouchableOpacity onPress={()=>{if(role=='owner'){handleCreateButtonPress;}}} style={styles.createButton}>
                            <Image
                                source={require('../assets/fraction.png')}
                                style={styles.createIcon}
                            />
                        </TouchableOpacity> */}



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
                                <TouchableHighlight onPress={() => { handleTouch(); handleOptionSelect('CreateEvent'); }} underlayColor="transparent" >
                                    <View style={styles.optionContainer}>
                                        <View style={[styles.optionBox, { backgroundColor: '#FFB6C1' }]}>
                                            <Image source={require('../assets/schedule.png')} style={styles.optionIcon} />
                                        </View>
                                        <Text style={[styles.modalOption, { backgroundColor: '#FFB6C1' }]}>Create Event</Text>
                                    </View>
                                </TouchableHighlight>

                                <TouchableHighlight onPress={() => { handleTouch(); handleOptionSelect('ScheduleMeeting'); }} underlayColor="transparent" >
                                    <View style={styles.optionContainer}>

                                        <View style={[styles.optionBox, { backgroundColor: '#90EE90' }]}>
                                            <Image source={require('../assets/meeting.png')} style={styles.optionIcon} />
                                        </View>
                                        <Text style={[styles.modalOption, { backgroundColor: '#90EE90' }]}>Schedule Meeting</Text>
                                    </View>
                                </TouchableHighlight>

                                <TouchableHighlight onPress={() => { handleTouch(); handleOptionSelect('OrganizeWorkshopOwner'); }} underlayColor="transparent" >
                                    <View style={styles.optionContainer}>

                                        <View style={[styles.optionBox, { backgroundColor: '#FFDAB9' }]}>
                                            <Image source={require('../assets/workshop.png')} style={styles.optionIcon} />
                                        </View>
                                        <Text style={[styles.modalOption, { backgroundColor: '#FFDAB9' }]}>Organize Workshop</Text>
                                    </View>
                                </TouchableHighlight>

                                {/* <TouchableHighlight onPress={() => { handleTouch(); handleOptionSelect('BrainstormSession'); }} underlayColor="transparent" >
                                    <View style={styles.optionContainer}>

                                        <View style={[styles.optionBox, { backgroundColor: '#ADD8E6' }]}>
                                            <Image source={require('../assets/brainstorm.png')} style={styles.optionIcon} />
                                        </View>
                                        <Text style={[styles.modalOption, { backgroundColor: '#ADD8E6' }]}>Brainstorm Session</Text>
                                    </View>
                                </TouchableHighlight> */}
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
        // backgroundColor: 'black',
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 20,
        zIndex: 1,
    },
    backIcon: {
        width: 18,
        height: 18,
    },
    inContainer: {
        flex: 1,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        paddingTop: 15,
        backgroundColor: 'white',

    },
    topLeftPadding: {
        position: 'absolute',
        top: 13,
        left: 9.5,
        borderTopRightRadius: 1050,
        borderTopLeftRadius: 150,
        width: 16,
        height: 5,
        backgroundColor: 'white',
        position: 'absolute',
        transform: [{ rotate: '-45deg' }],
        zIndex: 1000
    },
    topRightPadding: {
        position: 'absolute',
        top: 13,
        right: 9.5,
        borderTopLeftRadius: 1050,
        borderTopRightRadius: 150,
        width: 16,
        height: 5,
        backgroundColor: 'white',
        position: 'absolute',
        transform: [{ rotate: '45deg' }],
        zIndex: 1000
    },
    topBar: {
        padding: 15,
        marginBottom: 3,
        height: 75,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 0.17,
        borderColor: '#CDCDCD',
        backgroundColor: 'white',



    },
    infoContainer: {
        marginLeft: 45,
        flexDirection: 'column',
        alignItems: 'flex-start',
    },

    leaderboardIcon: {
        position: 'absolute',
        top: 27,
        right: 60
    },
    hamIcon: {
        position: 'absolute',
        top: 26,
        right: 19
    },


    // notificationIcon: {
    //     padding: 10,
    //     marginTop: 13,
    //     marginRight: 8
    //   },
    //   chatIcon: {
    //     position: 'absolute',
    //     top: 27,
    //     right: 60
    //   },








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
        marginLeft: 13,
        maxWidth: '67%',
    },
    // ---------------------------------------------------------------------------------------------------------------







    eventMessageContainer: {

        position: 'relative',
        marginBottom: 10,
    },


    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#143946',
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 10,

    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginBottom: 10
    },
    icon: {
        width: 42,
        height: 42,
        marginRight: 10,
        marginLeft: 20,
        marginBottom: 30
    },
    eventDetails: {
        flex: 1,

    },
    eventName: {
        fontFamily: 'Poppins-Bold',
        marginTop: 10,
        fontSize: 21,
        color: 'white'

    },
    eventDate: {
        color: 'white',
        fontFamily: 'Poppins-Medium',
        fontSize: 13,

    },
    eventLocation: {
        color: 'white',
        fontFamily: 'Poppins-Medium',
        fontSize: 13,



    },
    rightSection: {
        position: 'absolute',
        top: 7,
        right: 8,
        marginBottom: 10
    },
    eventTag: {
        paddingLeft: 8,
        paddingRight: 8,
        borderRadius: 3,
        height: 19
    },
    eventTagText: {
        color: 'black',
        fontFamily: 'Poppins-Bold',
        fontSize: 12
    },
    arrowIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
        marginLeft: 10,
        marginTop: 25
    },
    arrowIconMeeting: {
        width: 24,
        height: 24,
        marginRight: 10,
        marginLeft: 28,
        marginTop: 25
    },

    //------------------------------------------------------------------------------------------------------------

    messageContent: {
        // alignSelf: 'flex-end',
    },
    messageText: {
        fontSize: 15,
        color: 'white',
        fontFamily: 'DMSans-Regular'

    },
    timestamp: {
        color: 'white',
        fontSize: 10,
        alignSelf: 'flex-end',
        fontFamily: 'Poppins-Regular'

    },

    currentUserMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#185D76',
        borderTopRightRadius: 20,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 20,
        borderTopLeftRadius: 20,
    },
    currentUserSenderInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',

        // alignSelf: 'flex-end'
    },
    currentUserSenderInfo: {
        color: 'lightgreen',
        fontFamily: 'Poppins-Regular',
        marginTop: -20
    },
    currentUserMessageTextBox: {
        flex: 1,
        marginLeft: 8,
        marginRight: 40,
        alignSelf: 'flex-end'
    },
    otherUserMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 20,
        paddingRight: 10,
        marginLeft: 13

    },
    otherUserSenderInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: '#222222',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        marginLeft: 0,
        marginBottom: 5

    },
    otherUserSenderInfo: {
        color: 'lightgreen',
        fontFamily: 'DMSans-Regular',
        paddingLeft: 8,
    },
    otherUserMessageTextBox: {
        flex: 1,
        marginLeft: 8,
        marginRight: 40,
        alignSelf: 'flex-end',
    },
    eventMessageTitle: {
        color: 'black'
    },
    ///////////////////////////////////////////
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
        marginTop: 4,
        height: 58,
        marginBottom: 2,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#F6F6F6',
        minHeight: 35,

    },
    inputWrapper: {
        position: 'relative',
        flex: 1,
        backgroundColor: 'transaparent'
    },
    input: {
        flex: 1,
        width: 225,
        backgroundColor: 'transaparent',
        borderRadius: 25,
        paddingLeft: 25,
        marginTop: 5,
        marginLeft: 20,
        marginRight: 20,
        fontFamily: 'DMSans-Regular',
        backgroundColor: 'white',

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


    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',

    },
    modalBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'flex-end',
        flex: 1,


    },
    modalContent: {
        backgroundColor: 'white',
        backgroundColor: '#016488',
        padding: 20,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        width: '100%',
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

        color: 'black',
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



