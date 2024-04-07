import { Firestore, arrayUnion, doc, getDoc, increment, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity } from 'react-native';
import { View } from 'react-native'
import { auth, database } from '../config/firebase';
import { Image } from 'react-native';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MarkMeeting = ({ route, navigation }) => {

    const { meetingId, meeting_registered_members, role, clubId } = route.params;
    console.log("recv clubId", clubId)

    const [membersDetails, setMembersDetails] = useState([]);

    const handleAttendance = async (memberId, index) => {
        try {

            const userDocRef = doc(database, 'users', memberId);
            await updateDoc(userDocRef, {
                points: increment(10) 
            });

            // Update event's event_attended array
            console.log(clubId, "<->", meetingId)
            const meetingDocRef = doc(database, `clubs/${clubId}/meetings/${meetingId}`);
            await updateDoc(meetingDocRef, {
                meeting_attended: arrayUnion(memberId)
            });

            // Show toast message
            ToastAndroid.show('Attendance marked successfully!', ToastAndroid.SHORT);
            setMembersDetails(prevDetails => {
                const updatedDetails = [...prevDetails];
                updatedDetails[index].attendanceMarked = true;
                return updatedDetails;
            });

        } catch (error) {
            console.error('Error marking attendance:', error);
            ToastAndroid.show('Failed to mark attendance. Please try again.', ToastAndroid.SHORT);
        }
    };

    useEffect(() => {
        const fetchMembersAttendanceStatus = async () => {
            try {
                const membersData = await Promise.all(meeting_registered_members.map(async (memberId) => {
                    const userDocRef = doc(database, 'users', memberId);
                    const userDocSnapshot = await getDoc(userDocRef);
                    if (userDocSnapshot.exists()) {
                        const userData = userDocSnapshot.data();
                        // Check if memberId exists in the event_attended array
                        const meetingDocRef = doc(database, `clubs/${clubId}/meetings/${meetingId}`);
                        const meetingDocSnapshot = await getDoc(meetingDocRef);
                        if (meetingDocSnapshot.exists()) {
                            const meetingAttendees = meetingDocSnapshot.data().meeting_attended || [];
                            const attendanceMarked = meetingAttendees.includes(memberId);
                            return { id: memberId, ...userData, attendanceMarked };
                        }
                    }
                    return null;
                }));
                setMembersDetails(membersData.filter(member => member !== null));
            } catch (error) {
                console.error('Error fetching members attendance status:', error);
            }
        };

        fetchMembersAttendanceStatus();
    }, [meeting_registered_members, clubId, meetingId]);






    useEffect(() => {
        const fetchMembersDetails = async () => {
            try {
                const currentUserID = auth.currentUser.uid;

                const membersPromises = meeting_registered_members.map(async (currentUserID) => {

                    const userDocRef = doc(database, 'users', currentUserID);
                    const userDocSnapshot = await getDoc(userDocRef);

                    if (userDocSnapshot.exists()) {
                        return { id: currentUserID, ...userDocSnapshot.data() };
                    } else {
                        return null;
                    }

                });
                const membersData = await Promise.all(membersPromises);
                setMembersDetails(membersData.filter(member => member !== null));
            } catch (error) {
                console.error('Error fetching members details:', error);
            }
        };

        fetchMembersDetails();
    }, [meeting_registered_members]);

    const findAvatarSource = (avatarId) => {
        const avatars = [
            { id: 1, source: require('../assets/avatar1.png') },
            { id: 2, source: require('../assets/avatar2.png') },
            { id: 3, source: require('../assets/avatar3.png') },
            { id: 4, source: require('../assets/avatar4.png') },
            { id: 5, source: require('../assets/avatar5.png') },
            { id: 6, source: require('../assets/avatar6.png') },
            { id: 7, source: require('../assets/avatar7.png') },
            { id: 8, source: require('../assets/avatar8.png') },
            { id: 9, source: require('../assets/avatar9.png') },
        ];

        const avatar = avatars.find((avatar) => avatar.id === avatarId);
        return "../assets/avatar" + avatar + ".png" ? avatar.source : null;
    };


    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="black" />

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>

            <View style={styles.createContainer}>
                <Text style={styles.title}>Mark Attendance</Text>
            </View>
            <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
                {membersDetails.length === 0 ? (
                    <View style={[styles.noPostsContainer, { flex: 1, justifyContent: 'center', padding: 0, alignItems: 'center', backgroundColor: '#E5F1FF' }]}>
                        <View style={[styles.post, { height: 10 }]}>
                            <Text style={[styles.noPostsText, { fontSize: 18, fontFamily: 'DMSans-Bold', color: '#333', padding: 10, textAlign: 'center' }]}>Seems like no one has{'\n'} registered yet!!</Text>
                        </View>
                    </View>
                ) : (
                    <View style={[styles.postsContainer, { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }]}>
                        {membersDetails.map((member, index) => (
                            <View key={member.id} style={styles.postBox}>
                                <View style={styles.nameAvatarContainer}>
                                    <Image source={findAvatarSource(member.avatarId)} style={styles.avatar} />
                                    <View style={[styles.detailsContainer, { display: 'flex', justifyContent: 'center', alignItems: 'center', alignContent: 'center' }]}>
                                        <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
                                            <Text style={styles.userName}>{member.name}</Text>
                                            <View style={{ backgroundColor: '#EDE6FF', width: 60, height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', alignContent: 'center', borderRadius: 5, marginLeft: 0, marginTop: 2 }}>
                                                <Text style={[styles.roleText, { color: '#6E3DF1', fontFamily: 'DMSans-Bold', fontSize: 12 }]}>{member.role === 'owner' ? 'Leader' : 'Member'}</Text>
                                            </View>
                                        </View>
                                        <Text style={{ fontFamily: 'DMSans-Medium', fontSize: 14, marginTop: 6, backgroundColor: 'white', }}>{member.regNo}</Text>
                                        <TouchableOpacity onPress={() => handleAttendance(member.id, index)} style={styles.iconContainer}>
                                            <Image source={member.attendanceMarked ? require('../assets/accept.png') : require('../assets/accept-no.png')} style={member.attendanceMarked ? styles.acceptIcon : styles.acceptNoIcon} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>


    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,

    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 20,
        zIndex: 1,
    },
    createContainer: {
        backgroundColor: '#A6D3E3',
        height: 70,
        borderBottomWidth: 2,
        borderBottomColor: 'black'
    },
    topBar: {
        marginTop: 0.1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopColor: 'white',
        borderWidth: 3,
        borderBottomColor: '#3E96FF'
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 20,
        zIndex: 1,
    },
    label: {
        fontSize: 17,
        color: 'black',
        fontFamily: "DMSans-Medium",
        marginBottom: 5
    },
    backIcon: {
        width: 18,
        height: 18,
    },
    postsContainer: {
        flex: 1,
        padding: 13,
        backgroundColor: 'white',


    },
    postBox: {
        marginBottom: 10,
        borderRadius: 3.84,
        alignItems: 'center',
        padding: 10,
        width: '48%',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5

    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 40,
        marginTop: 2,
        marginBottom: 5,
        backgroundColor: '#E4DDDD',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 40,
        marginTop: 2,
        marginBottom: 5,
        // backgroundColor: 'red',
        // borderWidth: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    },
    acceptIcon: {
        width: 42,
        height: 42,
        borderRadius: 40,
        backgroundColor: 'white',
    },
    acceptNoIcon: {
        width: 30,
        height: 30,
        borderRadius: 40,
        backgroundColor: 'white',
        resizeMode: 'contain',
    },
    userName: {
        fontFamily: 'DMSans-Bold',
        fontSize: 19,
    },

    nameAvatarContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center'
    },
    title: {
        fontSize: 24,
        marginTop: 19,
        textAlign: 'center',
        color: 'black',
        fontFamily: "DMSans-Bold",
    },


});
export default MarkMeeting