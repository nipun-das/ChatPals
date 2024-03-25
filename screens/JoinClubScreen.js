import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, FlatList, StatusBar, Image, Modal } from 'react-native';
import { arrayUnion, collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { database } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';



const JoinClubScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showModalIn, setShowModalIn] = useState(false);
    const [clubDetails, setClubDetails] = useState('');


    useEffect(() => {
        // Call handleSearch whenever searchQuery changes
        handleSearch();
    }, [searchQuery]);

    const handleSearch = async () => {
        try {
            const clubsRef = collection(database, 'clubs');
            const querySnapshot = await getDocs(clubsRef);
            const clubs = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                    clubs.push({ id: doc.id, ...data });
                }
            });

            setSearchResults(clubs);
        } catch (error) {
            console.error('Error searching clubs:', error);
        }
    };

    const handleJoinClub = async (clubId) => {
        try {
            const clubRef = doc(database, 'clubs', clubId);
            const clubDoc = await getDoc(clubRef);
            console.log("clicked : ", clubId)
            if (clubDoc.exists()) {
                const clubData = clubDoc.data();
                setClubDetails(clubData);
                console.log("club data--->", clubData)
                console.log(clubDetails.name)
                setShowModal(true);
            } else {
                console.error('Club not found');
            }
        } catch (error) {
            console.error('Error fetching club details:', error);
        }
    };


    const handleJoinClubButton = async (clubId) => {
        try {
            console.log("click", clubId)

            // const userId = getCurrentUserId(); 
            const currentUser = getAuth().currentUser;
            const userId = currentUser.uid;
            console.log("user id in joinclubscreen:", userId);
            // await setDoc(doc(database, 'users', userId), {
            //     id: userId,
            //     clubId: clubId,
            //     role: 'member'
            // });

            await updateDoc(doc(database, 'users', userId), {
                clubId: clubId,
                role: "member",
            });


            const clubRef = doc(database, 'clubs', clubId);
            await updateDoc(clubRef, {
                members: arrayUnion(userId),
            });

            navigation.navigate("ClubJoinSuccess");
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const handleJoinButton = () => {
        setShowModalIn(true);
    }
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            {/* onPress={() => handleJoinClub(item.id)} */}
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'white' }}>

                    <Text style={styles.clubName}>{item.name}</Text>

                    {/* Member Count to be updated later */}
                    <View style={{ flexDirection: 'row', backgroundColor: 'white' }}>
                        <Image source={require('../assets/user.png')} style={{
                            backgroundColor: 'white', width: 14, height: 14, resizeMode: 'contain', marginTop: 10
                        }} />
                        <Text style={{ fontSize: 12, fontFamily: 'DMSans-Bold', marginLeft: 5, marginTop: 12 }}>10</Text>
                        <View style={[styles.roleContainer, { backgroundColor: '#EDE6FF', width: 40, height: 15, marginTop: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 5, }]}>
                            <Text style={[styles.roleText, { color: '#6E3DF1', fontFamily: 'DMSans-Bold', fontSize: 12 }]}>Club</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={() => handleJoinClub(item.id)}>

                    <View style={{ backgroundColor: '#005979', justifyContent: 'center', padding: 8, borderRadius: 8, height: 35 }}>
                        <Text style={{ fontFamily: 'DMSans-Medium', fontSize: 12, color: 'white', paddingLeft: 2, paddingRight: 2, }}>View Details</Text>
                    </View>
                </TouchableOpacity>

            </View>


        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="black" />

            <View style={styles.createContainer}>
                <Text style={styles.title}>Search Clubs</Text>
            </View>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                    placeholder="Enter the topic..."
                />
            </View>
            <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                <FlatList
                    data={searchResults}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            </View>
            <View style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                justifyContent: 'flex-end',
                flex: 1,
            }}>
                <Modal
                    visible={showModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <StatusBar backgroundColor="black" />
                        <View style={[styles.createContainerModal, {
                            backgroundColor: '#A6D3E3', height: 70, width: '89%', flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: 'black', borderTopLeftRadius: 10, borderTopRightRadius: 10,
                        }]}>
                            <TouchableOpacity style={[styles.backButton, { marginLeft: 20, marginTop: 17, height: 40 }]} onPress={() => setShowModal(false)}>
                                <Ionicons name="arrow-back" size={30} color="black" />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { fontSize: 23, textAlign: 'center', width: '71%', justifyContent: 'center', alignContent: 'center', marginTop: 20, color: 'black', fontFamily: "DMSans-Medium", }]}>{clubDetails.name}</Text>
                            {/* <TouchableOpacity style={[styles.backButton, {marginLeft:100, marginTop:17,height:40 ,backgroundColor:'yellow',}]}>
                            <Ionicons name="arrow-back" size={30} color="#A6D3E3" />
                        </TouchableOpacity> */}
                        </View>
                        <View style={[styles.modalContent, {
                            width: '89%',
                            backgroundColor: 'white',
                            // height: '60%',
                            borderBottomLeftRadius: 10,
                            borderBottomRightRadius: 10,
                            // padding:100,
                            overflow: 'hidden',
                            padding: 20,
                            paddingTop: 50,


                        }]}>
                            <View style={[styles.contentContainer, { backgroundColor: 'white', }]}>
                                {/* <Text style={[styles.clubName, { fontFamily: "DMSans-Medium", fontSize: 25 }]}>{clubDetails.name}</Text> */}
                                <Text style={[styles.clubDescription, { fontFamily: "DMSans-Regular", marginTop: 3, fontSize: 20.7, marginLeft: 0.5, marginRight: 0.5, textAlign: 'center' }]}>{clubDetails.description}</Text>
                                <Image source={require('../assets/curlycomp.png')} style={{
                                    backgroundColor: 'white', width: "100%", height: 60, resizeMode: 'contain',
                                }} />
                                <Text style={[styles.clubDescription, { fontFamily: "DMSans-Medium", fontSize: 19, textAlign: 'center' }]}>{clubDetails.motto}</Text>
                                {/* <View style={styles.additionalDetailsContainer}> */}
                                {/* <Text style={styles.additionalDetailsText}>Location: {clubDetails.location}</Text> */}
                                {/* <Text style={styles.additionalDetailsText}>Category: {clubDetails.category}</Text> */}
                                {/* <Text style={styles.additionalDetailsText}>Members: {clubDetails.members}</Text> */}
                                {/* </View> */}
                                <TouchableOpacity style={[styles.joinButton, { marginLeft: 0, marginRight: 0, backgroundColor: 'black', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 20, }]}
                                    onPress={() => handleJoinButton()}>
                                    <Text style={[styles.joinButtonText, { color: 'white', fontSize: 17, fontFamily: 'Inter-SemiBold' }]}>Join the Club</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* --------------------------------------------- */}

                <Modal
                    visible={showModalIn}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowModalIn(false)}
                >
                    <View style={styles.modalContainer}>
                        <StatusBar backgroundColor="black" />
                        <View style={[styles.createContainerModal, {
                            backgroundColor: '#A6D3E3', height: 70, width: '89%', flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: 'black', borderTopLeftRadius: 10, borderTopRightRadius: 10,
                        }]}>
                            <TouchableOpacity style={[styles.backButton, { marginLeft: 20, marginTop: 17, height: 40 }]} onPress={() => setShowModalIn(false)}>
                                <Ionicons name="arrow-back" size={30} color="black" />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { fontSize: 23, textAlign: 'center', width: '71%', justifyContent: 'center', alignContent: 'center', marginTop: 20, color: 'black', fontFamily: "DMSans-Medium", }]}>{clubDetails.name}</Text>

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
                                {/* <Text style={[styles.clubName, { fontFamily: "DMSans-Medium", fontSize: 25 }]}>{clubDetails.name}</Text> */}
                                <Text style={[styles.clubDescription, { fontFamily: "DMSans-Regular", marginTop: 3, fontSize: 20.7, marginLeft: 0.5, marginRight: 0.5, textAlign: 'center' }]}>Do you want to join this club?</Text>
                                <Image source={require('../assets/loading.gif')} style={{
                                    backgroundColor: 'white', width: "100%", height: 60, resizeMode: 'contain',
                                }} />

                                <TouchableOpacity style={[styles.joinButton, { marginLeft: 0, marginRight: 0, backgroundColor: 'black', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 20, }]}
                                    onPress={() => handleJoinClubButton(clubDetails.cid)}>
                                    <Text style={[styles.joinButtonText, { color: 'white', fontSize: 17, fontFamily: 'Inter-SemiBold' }]}>Join the Club</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        // flex: 1,
        // padding: 16,
    },
    // backButton: {

    // },
    searchContainer: {
        marginBottom: 16,
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20
    },
    searchInput: {
        height: 43,
        fontFamily: 'DMSans-Regular',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    card: {
        // backgroundColor: 'red',
        padding: 16,
        height: 80,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        // shadowColor: '#000',
        borderColor: 'black',
        // shadowOpacity: 0.2,
        // shadowOffset: { width: 0, height: 2 },
        // elevation: 2,
    },
    title: {
        fontSize: 24,
        marginTop: 19,
        textAlign: 'center',
        color: 'black',
        fontFamily: "DMSans-Bold",
        // backgroundColor:'red'
    },
    clubName: {
        fontSize: 21,
        marginTop: -6,
        fontFamily: "DMSans-Medium",
        // fontWeight: 'bold',
    },
    createContainer: {
        backgroundColor: '#A6D3E3',
        height: 70,
        width: '100%',
        borderBottomWidth: 2,
        borderBottomColor: 'black'
        // marginTop: 30,
    },

    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },

});

export default JoinClubScreen;
