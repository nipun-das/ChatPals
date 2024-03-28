import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, StatusBar, TouchableOpacity, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { Image } from 'react-native';
const RegisterEvent = ({ route, navigation }) => {
    const { eventId, clubId } = route.params;

    // console.log("eventId : ", eventId)
    // console.log("clubId : ", clubId)


    const [role, setRole] = useState('');
    const [roleFetched, setRoleFetched] = useState(false);
    const [event, setEvent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);



    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const checkRegistrationStatus = async () => {
            try {
                const currentUserUID = auth.currentUser.uid;
                const eventDocRef = doc(database, `clubs/${clubId}/events/${eventId}`);
                const eventDocSnapshot = await getDoc(eventDocRef);
                if (eventDocSnapshot.exists()) {
                    const eventData = eventDocSnapshot.data();
                    if (eventData.event_registered_members.includes(currentUserUID)) {
                        setIsRegistered(true);
                        console.log("already registered")
                    } else {
                        setIsRegistered(false);
                        console.log("not registered")

                    }
                } else {
                    console.error('Event document not found.');
                }
            } catch (error) {
                console.error('Error checking registration status:', error);
            }
        };

        checkRegistrationStatus();
    }, [clubId, eventId]);



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
                    console.log("role fetched : ",fetchedRole)
                    setRoleFetched(true);
                } else {
                    console.error('User data not found.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }

        };

        if (!roleFetched) {
            fetchRole();
        }

    }, [roleFetched]);



    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const eventDocRef = doc(database, `clubs/${clubId}/events/${eventId}`);
                const eventDocSnapshot = await getDoc(eventDocRef);

                if (eventDocSnapshot.exists()) {
                    const eventData = eventDocSnapshot.data();
                    setEvent(eventData);
                } else {
                    console.error('Event data not found.');
                }
            } catch (error) {
                console.error('Error fetching event data:', error);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    if (!event) {
        return null;
    }
    const registerForEvent = async () => {
        try {
            const currentUserUID = auth.currentUser.uid;
            const eventDocRef = doc(database, `clubs/${clubId}/events/${eventId}`);
            await updateDoc(eventDocRef, {
                event_registered_members: arrayUnion(currentUserUID),
            });
        } catch (error) {
            console.error('Error registering for event:', error);
        }
    };

    const { event_name, event_date, event_time, event_price, event_description, event_location, event_reg_count, event_reg_status, event_status } = event;
    const [year, month, day] = event_date.split('-');
    const shortMonth = month.slice(0, 3).toUpperCase();

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="black" />

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>

            <View style={styles.createContainer}>
                <Text style={styles.title}>Event Details</Text>
            </View>

            <Text style={styles.eventName}>{event_name}</Text>

            <View style={styles.dateTimeContainer}>

                <View style={styles.dateContainer}>
                    <Text style={styles.eventMonth}>{shortMonth}</Text>
                    <Text style={styles.eventDay}>{day}</Text>
                </View>

                <View style={styles.timePriceContainer}>

                    <View style={[styles.timeContainer, { backgroundColor: '#D9E7EC', padding: 3, borderRadius: 7, width: 90 }]}>
                        <Text style={[styles.eventTime, { fontSize: 19, fontFamily: 'DMSans-Bold' }]}>{event_time}</Text>
                    </View>

                    <View style={[styles.priceContainer, { backgroundColor: '#D1FFAD', padding: 3, borderRadius: 7, width: 65, marginTop: 2 }]}>
                        <Text style={[styles.eventPrice, { fontSize: 19, fontFamily: 'DMSans-Bold' }]}>{event_price.toUpperCase()}</Text>
                    </View>
                </View>

            </View>
            <View style={[styles.locationContainer, { backgroundColor: 'white', height: 100 }]}>
                <Image source={require('../assets/placeholder.png')} style={[styles.locationIcon, { width: 22, resizeMode: 'contain', marginTop: -225, marginLeft: 30 }]} />
                <Text style={[styles.eventLocation, { fontSize: 17, fontFamily: 'DMSans-Medium', marginTop: -266, marginLeft: 56 }]}>{event_location}</Text>
            </View>

            <View style={[styles.descContainer, { marginLeft: 30, marginRight: 30, marginTop: -30, textAlign: 'left' }]}>
                <Text style={[styles.desc, { fontSize: 17, fontFamily: 'DMSans-Medium' }]}>{event_description}</Text>
            </View>
            <View style={[styles.regCount, { backgroundColor: '#FFEFF2', width: 150, marginLeft: 30, marginTop: 20, borderRadius: 8, flexDirection: 'row' }]}>
                <View style={{ padding: 6, }}>
                    <Text style={{ fontSize: 15, fontFamily: 'DMSans-Medium' }}>Registration</Text>
                    <Text style={{ fontSize: 15, fontFamily: 'DMSans-Medium' }}>Count</Text>

                </View>
                <View style={{ borderLeftColor: 'white', borderLeftWidth: 2.5, }}>
                    <Text style={{ fontSize: 30, fontFamily: 'DMSans-Bold', textAlign: 'center', width: 50 }}>{event_reg_count}</Text>
                </View>
            </View>

            {role === 'owner' && (
                <>
                    <View style={styles.ownerButtons}>
                        <TouchableOpacity style={styles.viewButton}>
                            <Text style={styles.viewButtonText}>View Registered Members</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close Registration</Text>
                        </TouchableOpacity>
                    </View>
                </>

            )}

            {role === 'member' && event_reg_status === 'open' && event_status === 'open' && (
                <>
                    <View style={styles.ownerButtons}>
                        <TouchableOpacity style={styles.regButton} onPress={() => setModalVisible(true)}>
                            <Text style={styles.regButtonText}>Register Now</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <StatusBar backgroundColor="black" />
                    <View style={[styles.createContainerModal, {
                        backgroundColor: '#A6D3E3', height: 70, width: '89%', flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: 'black', borderTopLeftRadius: 10, borderTopRightRadius: 10,
                    }]}>
                        <TouchableOpacity style={[styles.backButton, { marginLeft: 20, marginTop: 17, height: 40 }]} onPress={() => setModalVisible(false)}>
                            <Ionicons name="arrow-back" size={30} color="black" />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { fontSize: 23, textAlign: 'center', width: '71%', justifyContent: 'center', alignContent: 'center', marginTop: 20, color: 'black', fontFamily: "DMSans-Medium", }]}></Text>

                    </View>
                    <View style={[styles.modalContent, {
                        width: '89%',
                        backgroundColor: 'white',
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        overflow: 'hidden',
                        padding: 20,
                        paddingTop: 50,


                    }]}>
                        <View style={[styles.contentContainer, { backgroundColor: 'white', }]}>
                            <Text style={[styles.clubDescription, { fontFamily: "DMSans-Regular", marginTop: 3, fontSize: 20.7, marginLeft: 0.5, marginRight: 0.5, textAlign: 'center' }]}>Do you want to register for this event?</Text>
                            <Image source={require('../assets/loading.gif')} style={{
                                backgroundColor: 'white', width: "100%", height: 60, resizeMode: 'contain',
                            }} />

                            <TouchableOpacity style={[styles.joinButton, { marginLeft: 0, marginRight: 0, backgroundColor: 'black', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 20, }]}
                                onPress={() => {
                                    registerForEvent();
                                    setModalVisible(false);
                                }}>
                                <Text style={[styles.joinButtonText, { color: 'white', fontSize: 17, fontFamily: 'Inter-SemiBold' }]}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {isRegistered &&(
                <>
                    <View style={styles.ownerButtons}>
                        <TouchableOpacity style={styles.viewButton}>
                            <Text style={styles.viewButtonText}>You have already registered ✅</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

        </View>
    );
}

const styles = StyleSheet.create({

    ownerButtons: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: -500,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    viewButton: {
        width: '90%',
        marginLeft: 30,
        marginRight: 30,
        backgroundColor: 'black',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    viewButtonText: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 17,
        fontFamily: 'Inter-SemiBold'
    },
    closeButton: {
        width: '80%',
        marginLeft: 30,
        marginRight: 30,
        backgroundColor: '#D34444',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 17,
        fontFamily: 'Inter-SemiBold'
    },
    regButton: {
        width: '80%',
        marginLeft: 30,
        marginRight: 30,
        backgroundColor: '#119D17',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },

    regButtonText: {
        color: 'white',
        fontSize: 17,
        fontFamily: 'Inter-SemiBold'
    },
    container: {
        backgroundColor: 'white',
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },

    backButton: {
        position: 'absolute',
        top: 16,
        left: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        marginTop: 19,
        textAlign: 'center',
        color: 'black',
        fontFamily: "DMSans-Bold",
        // backgroundColor:'red'
    },
    createContainer: {
        backgroundColor: '#A6D3E3',
        height: 70,
        borderBottomWidth: 2,
        borderBottomColor: 'black'
        // marginTop: 30,
    },
    eventName: {
        fontSize: 28,
        fontFamily: 'DMSans-Medium',
        color: 'black',
        height: 60,
        paddingLeft: 26,
        justifyContent: 'center',
        alignContent: 'center',
        paddingTop: 20,
        // backgroundColor: 'blue'
    },
    dateTimeContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    dateContainer: {
        marginRight: 10,
        padding: 10,
        width: 65,
        borderRadius: 9,
        marginLeft: 30,
        backgroundColor: '#143946'
    },
    eventMonth: {
        fontSize: 16,
        fontFamily: 'DMSans-Medium',
        color: 'white',
        textAlign: 'center'

    },
    eventDay: {
        fontSize: 29,
        fontFamily: 'DMSans-Medium',
        color: 'white',
        marginTop: -5,
        textAlign: 'center'
    },
    timePriceContainer: {
        flexDirection: 'column',

    },
    priceContainer: {
        // marginTop:2
    },
    eventTime: {
        fontSize: 18,
        padding: 2,
        color: '#143946',
    },
    eventPrice: {
        fontSize: 18,
        padding: 2,
        color: '#143946',

    },
});

export default RegisterEvent;

