
import { Firestore, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { View } from 'react-native'
import { auth, database } from '../config/firebase';
import { Image } from 'react-native';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RegisteredMembers = ({ route, navigation }) => {

    const { eventId, event_registered_members } = route.params;
    const [membersDetails, setMembersDetails] = useState([]);

    useEffect(() => {
        const fetchMembersDetails = async () => {
            try {
                const currentUserID = auth.currentUser.uid;
                const membersPromises = event_registered_members.map(async (currentUserID) => {

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
    }, [event_registered_members]);

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
                <Text style={styles.title}>Registration Details</Text>
            </View>
            {membersDetails.length === 0 ? (
                <View style={[styles.noPostsContainer, {
                    flex: 1,
                    justifyContent: 'center',
                    padding: 0,

                    alignItems: 'center',
                    backgroundColor: '#E5F1FF'
                }]}>
                    <View style={[styles.post, { height: 10 }]}>
                        <Text style={[styles.noPostsText, {
                            fontSize: 18,
                            fontFamily: 'DMSans-Bold',
                            color: '#333',
                            padding: 10,
                            textAlign: 'center'
                        }]}>Seems like no one has{'\n'} registered yet!!</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.postsContainer}>
                    {membersDetails.map((member) => (
                        <View key={member.id} style={styles.post}>
                            <View style={styles.nameAvatarContainer}>
                                <Image source={findAvatarSource(member.avatarId)} style={styles.avatar} />
                                <View style={[styles.detailsContainer, { display: 'flex' }]}>
                                    <View style={[styles.nameRoleContainer, { flexDirection: 'row' }]}>
                                        <Text style={styles.userName}>{member.name}</Text>
                                        <View style={[styles.roleContainer, { backgroundColor: '#EDE6FF', width: 60, height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginLeft: 10, marginTop: 2 }]}>
                                            <Text style={[styles.roleText, { color: '#6E3DF1', fontFamily: 'DMSans-Bold', fontSize: 12 }]}>{member.role === 'owner' ? 'Leader' : 'Member'}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.postDate}>{member.regNo}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}
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
        // marginTop: 30,
    },
    topBar: {
        marginTop: 0.1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopColor: 'white',
        borderWidth: 3,
        // borderTopColor: '#3E96FF',

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

    miniLogo: {
        width: 120,
        resizeMode: 'contain',
        height: 70,
        paddingTop: 18,
        paddingLeft: 12,
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#98C7FF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalTitle: {
        fontSize: 24,
        marginTop: 30,
        textAlign: 'center',
        color: 'black',
        fontFamily: "DMSans-Bold",

    },
    notificationIcon: {
        position: 'absolute',
        top: 26,
        right: 19
    },
    chatIcon: {
        position: 'absolute',
        top: 27,
        right: 60
    },
    fab: {
        position: 'absolute',
        bottom: 22,
        right: 22,
        backgroundColor: 'black',
        width: 60,
        height: 60,
        zIndex: 1000,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 5,
        borderColor: '#3E96FF'
    },

    modalContent: {
        width: '100%',
        backgroundColor: 'white',
        height: '96%',
        overflow: 'hidden',
        padding: 20,
        paddingTop: 50,

    },
    modalHeader: {
        backgroundColor: '#98C7FF',
        width: '100%'
    },

    modalBody: {
        padding: 20,
    },
    textInput: {
        borderWidth: 0.167,
        borderRadius: 9,
        borderColor: 'rgba(0,0,0,0.2)',
        backgroundColor: '#D2D2D2',
        padding: 10,
        marginTop: 5,
        marginBottom: 20,
    },
    uploadContainer: {
        flex: 0.3,
        flexDirection: 'row',
        width: 70,
        paddingLeft: 5,
        justifyContent: 'space-between'
    },
    uploadButton: {
        // marginLeft
    },
    uploadButtonIcon: {
        width: 25,
        height: 25,
    },
    postButton: {
        backgroundColor: 'black',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    postButtonText: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 17,
        fontFamily: 'Inter-SemiBold'
    },

    postsContainer: {
        flex: 1,
        padding: 13,
        backgroundColor: '#E5F1FF'

    },
    post: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#98C7FF',
        borderRadius: 10,
        padding: 10,
        backgroundColor: 'white',
        height: 65
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 40,
        marginRight: 10,
        backgroundColor: '#E4DDDD'
    },
    userName: {
        fontFamily: 'DMSans-Bold',
        fontSize: 17,
    },
    postDate: {
        fontFamily: 'DMSans-Medium',
        fontSize: 13,
        marginTop: 3,
        backgroundColor: 'white',
    },
    nameAvatarContainer: {
        display: 'flex',
        flexDirection: 'row'
    },

    title: {
        fontSize: 24,
        marginTop: 19,
        textAlign: 'center',
        color: 'black',
        fontFamily: "DMSans-Bold",
        // backgroundColor:'red'
    },
    description: {
        fontSize: 14,
        // backgroundColor:'red',
        paddingLeft: 2,
        paddingRight: 1,
        paddingTop: 0,
        marginTop: 8,
        fontFamily: 'DMSans-Medium',
    },


});
export default RegisteredMembers