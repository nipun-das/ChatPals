import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { database } from '../config/firebase';
import { Image } from 'react-native';
const RegisterEvent = ({ route, navigation }) => {
    // const navigation = useNavigation();
    const { eventId, clubId } = route.params;

    console.log("eventId : ", eventId)
    console.log("clubId : ", clubId)

    const [event, setEvent] = useState(null);

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

    const { event_name, event_date, event_time, event_price, event_description, event_location, event_reg_count } = event;
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
            <TouchableOpacity style={styles.createButton} >
                <Text style={styles.createButtonText}>View Registered Members</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} >
                <Text style={styles.closeButtonText}>Close Registration</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    createButton: {
        marginLeft: 30,
        marginRight: 30,
        backgroundColor: 'black',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    createButtonText: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 17,
        fontFamily: 'Inter-SemiBold'
    },
    closeButton: {
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

