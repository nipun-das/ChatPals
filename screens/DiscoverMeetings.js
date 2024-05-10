import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { database } from '../config/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const DiscoverMeetings = ({ route, navigation }) => {

    const { clubId, role } = route.params;
    console.log("role recv", role)

    const [meetings, setMeetings] = useState([]);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const clubMeetingsCollectionRef = collection(database, 'clubs', clubId, 'meetings');
                const meetingsQuery = query(clubMeetingsCollectionRef);
                const querySnapshot = await getDocs(meetingsQuery);

                const meetingsArray = [];
                querySnapshot.forEach((doc) => {
                    meetingsArray.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                });

                setMeetings(meetingsArray);
            } catch (error) {
                console.error('Error fetching meetings:', error);
            }
        };

        fetchMeetings();
    }, [clubId]);

    const formatDate = (dateString) => {
        if (!dateString) return '';

        const [year, month, day] = dateString.split('-');

        const months = [
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ];

        const monthName = months.find(m => m.toLowerCase() === month.toLowerCase());

        return `${parseInt(day)} ${monthName}`;
    };

    const images = [
        require('../assets/cover-1.png'),
        require('../assets/cover-2.png'),
        require('../assets/cover-3.png'),
        require('../assets/cover-4.png')
    ];

    const goToRegisterMeeting = (id) => {
        console.log("meetingid clicked in discover", id)
        navigation.navigate('RegisterMeeting', { meetingId: id, clubId: clubId })
    }


    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="black" />

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>

            <View style={styles.createContainer}>
                <Text style={styles.title}>Discover Meeting</Text>
            </View>

            <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>

                {meetings.length === 0 ? (
                    <View style={[styles.noPostsContainer, {
                        justifyContent: 'center',
                        padding: 0,
                        alignItems: 'center',
                        backgroundColor: '#E5F1FF',
                        height:'100%'
                    }]}>
                        <View style={{
                            marginBottom: 10,
                            borderWidth: 1,
                            borderColor: '#98C7FF',
                            borderRadius: 10,
                            padding: 10,
                            backgroundColor: 'white',
                            height: 90,
                            justifyContent: 'center'
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'DMSans-Bold',
                                color: 'black',
                                padding: 0,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>Seems like no meetings are {'\n'}live for registration!!</Text>
                        </View>
                    </View>
                ) : (
                    meetings.map((meeting, index) => (
                        <TouchableOpacity
                            key={meeting.id}
                            style={{
                                width: '90%', backgroundColor: 'white', height: 140, borderRadius: 8, marginTop: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2, },
                                shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, alignSelf: 'center', overflow: 'visible', position: 'relative'
                            }}>
                            {meeting.meeting_reg_status === 'open' && (
                                <View style={{ backgroundColor: 'green', width: 50, position: 'absolute', left: 5, zIndex: 60000, borderRadius: 5, top: -10 }}>
                                    <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 10, padding: 5, color: 'white', textAlign: 'center' }}>Open</Text>
                                </View>
                            )}
                            {meeting.meeting_reg_status === 'closed' && (
                                <View style={{ backgroundColor: '#D34444', width: 50, position: 'absolute', left: 5, zIndex: 60000, borderRadius: 5, top: -10 }}>
                                    <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 10, padding: 5, color: 'white', textAlign: 'center' }}>Closed</Text>
                                </View>
                            )}
                            <Image
                                source={images[index % images.length]}
                                style={{ width: '100%', height: '25%', borderTopLeftRadius: 8, borderTopRightRadius: 8, resizeMode: 'cover' }}
                            />

                            <View style={{ padding: 10 }}>
                                <Text style={{ fontSize: 24, fontFamily: 'DMSans-Bold', marginBottom: 10 }}>{meeting.meeting_topic}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                    <Image source={require('../assets/calendar.png')} style={{ width: 20, height: 20, marginRight: 5 }} />
                                    <Text style={{ fontSize: 15, fontFamily: 'DMSans-Medium', color: '#535353' }}>{formatDate(meeting.meeting_date)}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image source={require('../assets/time.png')} style={{ width: 20, height: 20, marginRight: 5 }} />
                                    <Text style={{ fontSize: 15, fontFamily: 'DMSans-Medium', color: '#535353' }}>{meeting.meeting_time}</Text>
                                </View>
                            </View>

                            {role === 'owner' && (
                                <TouchableOpacity
                                    style={{ position: 'absolute', bottom: 15, right: 10, backgroundColor: 'black', paddingHorizontal: 20, paddingVertical: 7, borderRadius: 5, }} onPress={() => goToRegisterMeeting(meeting.meeting_id)}
                                >
                                    <Text style={{ color: 'white', fontFamily: 'DMSans-Medium', fontSize: 16 }}>View</Text>
                                </TouchableOpacity>
                            )}
                            {role === 'member' && (
                                <TouchableOpacity
                                    style={{ position: 'absolute', bottom: 15, right: 10, backgroundColor: 'black', paddingHorizontal: 20, paddingVertical: 7, borderRadius: 5, }} onPress={() => goToRegisterMeeting(meeting.meeting_id)}
                                >
                                    <Text style={{ color: 'white', fontFamily: 'DMSans-Medium', fontSize: 16 }}>Join</Text>
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>

                    ))
                )}
            </ScrollView>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    createContainer: {
        backgroundColor: '#A6D3E3',
        height: 70,
        borderBottomWidth: 2,
        borderBottomColor: 'black'
        // marginTop: 30,
    },
    title: {
        fontSize: 24,
        marginTop: 19,
        textAlign: 'center',
        color: 'black',
        fontFamily: "DMSans-Bold",
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 20,
        zIndex: 1,
    },
})

export default DiscoverMeetings;

