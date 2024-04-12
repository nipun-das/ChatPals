import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { collection, query, onSnapshot, addDoc, orderBy, getDocs, where } from 'firebase/firestore';
import { database } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';


const Notification = ({ route, navigation }) => {
    const { currentUserUid } = route.params;
    console.log("currentuserid->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", currentUserUid)
    const [notifications, setNotifications] = useState([]);

    const addNotificationEvent = async (uid, eventId, message) => {
        try {
            const userNotificationsRef = collection(database, `users/${uid}/notifications`);
            setTimeout(async () => {
                try {
                    const notificationsQuery = query(userNotificationsRef,
                        where('eventId', '==', eventId),
                        where('message', '==', message));
                    const querySnapshot = await getDocs(notificationsQuery);
                    if (querySnapshot.empty) {
                        await addDoc(userNotificationsRef, {
                            eventId,
                            message,
                            timestamp: new Date(),
                            type: 'eventAlert',
                        });
                        console.log('Notification added:', message);
                    } else {
                        console.log('Notification already exists for this event and user:', message);
                    }
                } catch (error) {
                    console.error('Error checking existing notifications:', error);
                }
            }, 3000);
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    };

    const addNotificationCancelEvent = async (uid, eventId, message) => {
        try {
            const userNotificationsRef = collection(database, `users/${uid}/notifications`);
            setTimeout(async () => {
                try {
                    const notificationsQuery = query(userNotificationsRef,
                        where('eventId', '==', eventId),
                        where('message', '==', message));
                    const querySnapshot = await getDocs(notificationsQuery);

                    console.log("Query snapshot:", querySnapshot);
                    if (querySnapshot.empty) {
                        await addDoc(userNotificationsRef, {
                            eventId,
                            message,
                            timestamp: new Date(),
                            type: 'cancelEvent',
                        });
                        console.log('Notification added:', message);
                    } else {
                        console.log('Notification already exists for this event and user:', message);
                    }
                } catch (error) {
                    console.error('Error checking existing notifications:', error);
                }
            }, 3000);
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    };
   
    useEffect(() => {
        const fetchEvents = async () => {
            const clubsRef = collection(database, 'clubs');
            const unsubscribe = onSnapshot(clubsRef, (snapshot) => {
                snapshot.forEach((clubDoc) => {
                    const eventsRef = collection(clubDoc.ref, 'events');
                    const eventsQuery = query(eventsRef);
                    onSnapshot(eventsQuery, (eventsSnapshot) => {
                        eventsSnapshot.forEach((eventDoc) => {
                            const eventData = eventDoc.data();
                            const eventDateParts = eventData.event_date.split('-');
                            const yearrr = parseInt(eventDateParts[0]);
                            const monthIndex = eventDateParts[1];
                            const day = parseInt(eventDateParts[2]);
                            console.log("event date parts :----->", eventDateParts)

                            const months = [
                                "January", "February", "March", "April", "May", "June",
                                "July", "August", "September", "October", "November", "December"
                            ];

                            const monthIndexx = months.indexOf(monthIndex);
                            const eventDate = new Date(yearrr, monthIndexx, day);
                            console.log("Event date:", eventDate);

                            const currentDate = new Date();
                            console.log("current date : ", currentDate)
                            const daysDifference = Math.floor((eventDate - currentDate) / (1000 * 60 * 60 * 24));

                            console.log("event id ", eventData.event_id, "days diff : ", daysDifference)

                            if (daysDifference === 1) {
                                const registeredMembers = eventData.event_registered_members || [];
                                registeredMembers.forEach((memberUid) => {
                                    const notificationMessage = `The Event you registered :\n${eventData.event_name} starts in 1 day`;
                                    addNotificationEvent(memberUid, eventData.event_id, notificationMessage);
                                });
                            }
                            if(eventData.event_status==='cancelled'){
                                const registeredMembers = eventData.event_registered_members || [];
                                registeredMembers.forEach((memberUid) => {
                                    const cancelMessage = `The Event you registered :\n${eventData.event_name} has been cancelled`;
                                    addNotificationCancelEvent(memberUid, eventData.event_id, cancelMessage);
                                });
                            }
                        });
                    });
                });
            });

            return unsubscribe;
        };

        fetchEvents();
    }, [currentUserUid]);

// ----------------MEETING-----------------------------------------------MEETING----------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------
const addNotificationMeeting = async (uid, meetingId, message) => {
    try {
        const userNotificationsRef = collection(database, `users/${uid}/notifications`);
        setTimeout(async () => {
            try {
                const notificationsQuery = query(userNotificationsRef,
                    where('meetingId', '==', meetingId),
                    where('message', '==', message));
                const querySnapshot = await getDocs(notificationsQuery);
                if (querySnapshot.empty) {
                    await addDoc(userNotificationsRef, {
                        meetingId,
                        message,
                        timestamp: new Date(),
                        type: 'meetingAlert',
                    });
                    console.log('Notification added:', message);
                } else {
                    console.log('Notification already exists for this meeting and user:', message);
                }
            } catch (error) {
                console.error('Error checking existing notifications:', error);
            }
        }, 3000);
    } catch (error) {
        console.error('Error adding notification:', error);
    }
};

const addNotificationCancelMeeting = async (uid, meetingId, message) => {
    try {
        const userNotificationsRef = collection(database, `users/${uid}/notifications`);
        setTimeout(async () => {
            try {
                const notificationsQuery = query(userNotificationsRef,
                    where('meetingId', '==', meetingId),
                    where('message', '==', message));
                const querySnapshot = await getDocs(notificationsQuery);

                if (querySnapshot.empty) {
                    await addDoc(userNotificationsRef, {
                        meetingId,
                        message,
                        timestamp: new Date(),
                        type: 'cancelMeeting',
                    });
                    console.log('Notification added:', message);
                } else {
                    console.log('Notification already exists for this meeting and user:', message);
                }
            } catch (error) {
                console.error('Error checking existing notifications:', error);
            }
        }, 3000);
    } catch (error) {
        console.error('Error adding notification:', error);
    }
};

useEffect(() => {
    const fetchMeetings = async () => {
        const clubsRef = collection(database, 'clubs');
        const unsubscribe = onSnapshot(clubsRef, (snapshot) => {
            snapshot.forEach((clubDoc) => {
                const eventsRef = collection(clubDoc.ref, 'meetings');
                const eventsQuery = query(eventsRef);
                onSnapshot(eventsQuery, (eventsSnapshot) => {
                    eventsSnapshot.forEach((eventDoc) => {
                        const eventData = eventDoc.data();
                        const eventDateParts = eventData.meeting_date.split('-');
                        const yearrr = parseInt(eventDateParts[0]);
                        const monthIndex = eventDateParts[1];
                        const day = parseInt(eventDateParts[2]);
                        console.log("event date parts :----->", eventDateParts)

                        const months = [
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                        ];

                        const monthIndexx = months.indexOf(monthIndex);
                        const eventDate = new Date(yearrr, monthIndexx, day);
                        console.log("meeting date:", eventDate);

                        const currentDate = new Date();
                        console.log("current date : ", currentDate)
                        const daysDifference = Math.floor((eventDate - currentDate) / (1000 * 60 * 60 * 24));

                        console.log("meeting id ", eventData.meeting_id, "days diff : ", daysDifference)

                        if (daysDifference === 1) {
                            const registeredMembers = eventData.event_registered_members || [];
                            registeredMembers.forEach((memberUid) => {
                                const notificationMessage = `The Meeting you registered :\n${eventData.meeting_topic} starts in 1 day`;
                                addNotificationMeeting(memberUid, eventData.meeting_id, notificationMessage);
                            });
                        }
                        if(eventData.meeting_status==='cancelled'){
                            const registeredMembers = eventData.meeting_registered_members || [];
                            registeredMembers.forEach((memberUid) => {
                                const cancelMessage = `The Meeting you registered :\n${eventData.meeting_topic} has been cancelled`;
                                addNotificationCancelMeeting(memberUid, eventData.meeting_id, cancelMessage);
                            });
                        }
                    });
                });
            });
        });

        return unsubscribe;
    };

    fetchMeetings();
}, [currentUserUid]);



// ---------------------------WORKSHOP-------------------------------------WORKSHOP---------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------
const addNotificationWorkshop = async (uid, workshopId, message) => {
    try {
        const userNotificationsRef = collection(database, `users/${uid}/notifications`);
        setTimeout(async () => {
            try {
                const notificationsQuery = query(userNotificationsRef,
                    where('workshopId', '==', workshopId),
                    where('message', '==', message));
                const querySnapshot = await getDocs(notificationsQuery);
                if (querySnapshot.empty) {
                    await addDoc(userNotificationsRef, {
                        workshopId,
                        message,
                        timestamp: new Date(),
                        type: 'workshopAlert',
                    });
                    console.log('Notification added:', message);
                } else {
                    console.log('Notification already exists for this workshop and user:', message);
                }
            } catch (error) {
                console.error('Error checking existing notifications:', error);
            }
        }, 3000);
    } catch (error) {
        console.error('Error adding notification:', error);
    }
};

const addNotificationCancelWorkshop = async (uid, workshopId, message) => {
    try {
        const userNotificationsRef = collection(database, `users/${uid}/notifications`);
        setTimeout(async () => {
            try {
                const notificationsQuery = query(userNotificationsRef,
                    where('workshopId', '==', workshopId),
                    where('message', '==', message));
                const querySnapshot = await getDocs(notificationsQuery);

                if (querySnapshot.empty) {
                    await addDoc(userNotificationsRef, {
                        workshopId,
                        message,
                        timestamp: new Date(),
                        type: 'cancelWorkshop',
                    });
                    console.log('Notification added:', message);
                } else {
                    console.log('Notification already exists for this workshop and user:', message);
                }
            } catch (error) {
                console.error('Error checking existing notifications:', error);
            }
        }, 3000);
    } catch (error) {
        console.error('Error adding notification:', error);
    }
};

useEffect(() => {
    const fetchWorkshops = async () => {
        const clubsRef = collection(database, 'clubs');
        const unsubscribe = onSnapshot(clubsRef, (snapshot) => {
            snapshot.forEach((clubDoc) => {
                const eventsRef = collection(clubDoc.ref, 'workshops');
                const eventsQuery = query(eventsRef);
                onSnapshot(eventsQuery, (eventsSnapshot) => {
                    eventsSnapshot.forEach((eventDoc) => {
                        const eventData = eventDoc.data();
                        const eventDateParts = eventData.workshop_date.split('-');
                        const yearrr = parseInt(eventDateParts[0]);
                        const monthIndex = eventDateParts[1];
                        const day = parseInt(eventDateParts[2]);
                        console.log("event date parts :----->", eventDateParts)

                        const months = [
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                        ];

                        const monthIndexx = months.indexOf(monthIndex);
                        const eventDate = new Date(yearrr, monthIndexx, day);
                        console.log("Event date:", eventDate);

                        const currentDate = new Date();
                        console.log("current date : ", currentDate)
                        const daysDifference = Math.floor((eventDate - currentDate) / (1000 * 60 * 60 * 24));

                        console.log("event id ", eventData.workshop_id, "days diff : ", daysDifference)

                        if (daysDifference === 1) {
                            const registeredMembers = eventData.workshop_registered_members || [];
                            registeredMembers.forEach((memberUid) => {
                                const notificationMessage = `The Workshop you registered :\n${eventData.workshop_topic} starts in 1 day`;
                                addNotificationEvent(memberUid, eventData.workshop_id, notificationMessage);
                            });
                        }
                        if(eventData.workshop_status==='cancelled'){
                            const registeredMembers = eventData.workshop_registered_members || [];
                            registeredMembers.forEach((memberUid) => {
                                const cancelMessage = `The Workshop you registered :\n${eventData.workshop_topic} has been cancelled`;
                                addNotificationCancelEvent(memberUid, eventData.workshop_id, cancelMessage);
                            });
                        }
                    });
                });
            });
        });

        return unsubscribe;
    };

    fetchWorkshops();
}, [currentUserUid]);



























    useEffect(() => {
        if (currentUserUid) {
            const fetchNotifications = async () => {
                const userRef = collection(database, `users/${currentUserUid}/notifications`);
                const notificationsQuery = query(userRef, orderBy('timestamp', 'desc'));

                const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
                    const fetchedNotifications = [];
                    snapshot.forEach((doc) => {
                        fetchedNotifications.push({ id: doc.id, ...doc.data() });
                    });
                    setNotifications(fetchedNotifications);
                }, (error) => {
                    console.error("Error fetching notifications:", error);
                });
                return unsubscribe;
            };

            fetchNotifications();
        }
    }, [currentUserUid]);


    const formatDate = (dateObject) => {
        if (!dateObject || !dateObject.toDate) return '';

        const date = dateObject.toDate();
        if (isNaN(date.getTime())) return '';
        const [monthh, day, yearr] = date.toLocaleDateString().split('/');

        const months = [
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ];

        const monthName = months[parseInt(monthh) - 1];

        return `${parseInt(day)} ${monthName}`;
    };
    return (
        <View style={{ flex: 1, backgroundColor: '#E5F1FF' }}>

            <StatusBar backgroundColor="black" />
            <TouchableOpacity style={{ position: 'absolute', top: 16, left: 20, zIndex: 1, }} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>
            <View style={{ backgroundColor: 'white', height: 70, borderBottomWidth: 0.19999999, borderBottomColor: 'black' }}>
                <Text style={{ fontSize: 24, marginTop: 19, textAlign: 'center', color: 'black', fontFamily: "DMSans-Bold", }}>Notifications</Text>
            </View>

            <ScrollView>
                <View style={{ flex: 1, marginTop: 10, paddingLeft: 9, paddingRight: 9 }}>
                    {notifications.map((notification) => (
                        <View
                            key={notification.id}
                            style={[
                                {
                                    backgroundColor: '#fff',
                                    borderRadius: 10,
                                    padding: 15,
                                    marginBottom: 10,
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                    
                                },
                                notification.type === 'eventCreate' && { backgroundColor: '#143946', },
                                notification.type === 'eventAlert' && { backgroundColor: '#143946', },
                                notification.type === 'cancelEvent' && { backgroundColor: '#B51515', },

                                notification.type === 'meetingCreate' && { backgroundColor: '#90EE90', },
                                notification.type === 'meetingAlert' && { backgroundColor: '#143946', },
                                notification.type === 'cancelMeeting' && { backgroundColor: '#B51515', },

                                notification.type === 'workshopCreate' && { backgroundColor: '#FFDAB9', },
                                notification.type === 'workshopAlert' && { backgroundColor: '#143946', },
                                notification.type === 'cancelWorkshop' && { backgroundColor: '#B51515', },


                            ]}
                        >
                            <Text style={[{
                                fontSize: 16, marginBottom: 5, fontFamily: 'DMSans-Medium'
                            },
                            notification.type === 'eventCreate' && { color: 'white' },
                            notification.type === 'eventAlert' && { color: 'white' },
                            notification.type === 'cancelEvent' && { color: 'white' },

                            notification.type === 'meetingCreate' && { color: 'black' },
                            notification.type === 'meetingAlert' && { color: 'white' },
                            notification.type === 'cancelMeeting' && { color: 'white' },

                            notification.type === 'workshopCreate' && { color: 'black' },
                            notification.type === 'workshopAlert' && { color: 'white' },
                            notification.type === 'cancelWorkshop' && { color: 'white' },
                            ]}
                            >
                                {notification.message}</Text>
                            <Text style={[{
                                fontSize: 12, marginBottom: 5, fontFamily: 'DMSans-Regular'
                            },
                            notification.type === 'eventCreate' && { color: '#afa' },
                            notification.type === 'eventAlert' && { color: '#afa' },
                            notification.type === 'cancelEvent' && { color: '#afa' },

                            notification.type === 'meetingCreate' && { color: 'black' },
                            notification.type === 'meetingAlert' && { color: '#afa' },
                            notification.type === 'cancelMeeting' && { color: 'white' },

                            notification.type === 'workshopCreate' && { color: 'black' },
                            notification.type === 'workshopAlert' && { color: '#afa' },
                            notification.type === 'cancelWorkshop' && { color: 'white' },
                            ]}
                            >
                                {formatDate(notification.timestamp)}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    notificationList: {
        flex: 1,
    },
    notification: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    message: {
        fontSize: 16,
        marginBottom: 5,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
    },
});

export default Notification;
