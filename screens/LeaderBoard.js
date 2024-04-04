import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, StatusBar, TouchableOpacity, ImageBackground } from 'react-native';
import { collection, query, getDocs, orderBy, limit, where, onSnapshot, doc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';


const LeaderBoard = ({ route, navigation }) => {
    const [topThreeUsers, setTopThreeUsers] = useState([]);
    const [otherUsers, setOtherUsers] = useState([]);
    const [userPoints, setUserPoints] = useState(0)
    const [userDetails, setUserDetails] = useState(null);


    const { clubId, role } = route.params;
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const currentUser = auth.currentUser;
                const userQuerySnapshot = await getDocs(query(collection(database, 'users'), where('uid', '==', currentUser.uid)));
                const userData = userQuerySnapshot.docs.map(doc => doc.data())[0];
                setUserDetails(userData);
                setUserPoints(userData.points);

                const unsubscribe = onSnapshot(doc(collection(database, 'users'), currentUser.uid), (doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        setUserDetails(userData);
                        setUserPoints(userData.points);
                    } else {
                        console.log("No such document!");
                    }
                });

                // Return unsubscribe function to clean up listener on component unmount
                return () => unsubscribe();

            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, []);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                // Query for the top 3 users based on points in descending order
                const topThreeQuerySnapshot = await getDocs(query(collection(database, 'users'), where('points', '>', 0), orderBy('points', 'desc'), limit(3)));


                // Query for other users
                const otherUsersQuerySnapshot = await getDocs(query(collection(database, 'users'), orderBy('points', 'desc')));


                const topThreeUsersData = topThreeQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const otherUsersData = otherUsersQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setTopThreeUsers(topThreeUsersData);

                setOtherUsers(otherUsersData.filter(user => !topThreeUsersData.some(topUser => topUser.id === user.id)));
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            }
        };

        fetchLeaderboardData();
    }, []);
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
    const renderUserCard = ({ item, index }) => (
        <View style={{
            borderBottomWidth: 1, borderBottomColor: '#CBCBCB', paddingBottom: 10, paddingLeft: 25, paddingRight: 20, backgroundColor: 'white',
            justifyContent: 'center', alignContent: 'center', alignItems: 'center'
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 17 }}>
                <Text style={{ fontSize: 15, fontFamily: 'DMSans-Bold', marginRight: 20 }}>{index + 4}</Text>
                <Image source={findAvatarSource(item.avatarId)} style={{
                    width: 40, height: 40, borderRadius: 25, marginRight: 20, borderWidth: 1.2,
                    borderColor: 'black'
                }} />
                <Text style={{ fontSize: 16, flex: 1, fontFamily: 'DMSans-Bold', color: 'black' }}>{item.name}</Text>
                <Text style={{ fontSize: 16, fontFamily: 'DMSans-Bold', color: '#6C6C6C' }}>{item.points}</Text>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>

            <StatusBar backgroundColor="black" />

            <TouchableOpacity style={{ position: 'absolute', top: 16, left: 20, zIndex: 1, }} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>

            <View style={{ backgroundColor: '#A6D3E3', height: 70, borderBottomWidth: 2, borderBottomColor: 'black' }}>
                <Text style={{ fontSize: 24, marginTop: 19, textAlign: 'center', color: 'black', fontFamily: "DMSans-Bold", }}>Leaderboard </Text>
            </View>
            <View style={{ flex: 1, }}>

                {role === 'owner' && (
                    <ImageBackground
                        source={require('../assets/lead-owner.png')}
                        style={{ flex: 1, resizeMode: 'cover' }}
                    >
                        <Image source={require('../assets/crown.gif')} style={{
                            width: 47, height: 47,
                            resizeMode: 'contain',
                            top: 31, left: 210, right: 0, bottom: 0, position: 'absolute',
                            alignItems: 'center', transform: [{ rotate: '44deg' }],
                        }}></Image>

                        {topThreeUsers.map((user, index) => {
                            let avatarStyle = {};
                            let nameStyle = {};
                            let pointsStyle = {};

                            if (index === 0) {
                                avatarStyle = { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white' };
                                nameStyle = { fontSize: 15, fontFamily: 'DMSans-Bold' };
                                pointsStyle = { fontSize: 15, fontFamily: 'DMSans-Bold' };
                            } else if (index === 1) {
                                avatarStyle = { width: 65, height: 65, borderRadius: 40 };
                                nameStyle = { fontSize: 13, fontFamily: 'DMSans-Bold' };
                                pointsStyle = { fontSize: 13, fontFamily: 'DMSans-Bold' };
                            } else if (index === 2) {
                                avatarStyle = { width: 55, height: 55, borderRadius: 30 };
                                nameStyle = { fontSize: 11, fontFamily: 'DMSans-Bold' };
                                pointsStyle = { fontSize: 11, fontFamily: 'DMSans-Bold', zIndex };
                            }

                            return (
                                <View key={user.id} style={[
                                    { alignItems: 'center', marginBottom: 10 },
                                    index === 0 && { marginLeft: 'auto', marginRight: 'auto', position: 'absolute', left: 0, right: 0, top: 68 },
                                    index === 1 && { marginRight: 250, position: 'absolute', top: 134, left: 23 },
                                    index === 2 && { marginLeft: 50, position: 'absolute', top: 146, right: 12 },
                                ]}>
                                    <Image source={findAvatarSource(user.avatarId)} style={[avatarStyle, { marginBottom: 5 }]} />
                                    <Text numberOfLines={2} style={[nameStyle, { width: 80, flexWrap: 'wrap', textAlign: 'center' }]}>{user.name}</Text>
                                    <Text style={[pointsStyle]}>{user.points}</Text>
                                </View>
                            );
                        })}
                        <View style={{ position: 'absolute', width: '92%', left: 15, right: 0, top: 370, bottom: 0, height: '40%', borderBottomLeftRadius: 50 }}>
                            <FlatList
                                data={otherUsers}
                                keyExtractor={user => user.id}
                                renderItem={renderUserCard}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    </ImageBackground >
                )}
                {role === 'member' && (
                    <ImageBackground
                        source={require('../assets/lead8.png')}
                        style={{ flex: 1, resizeMode: 'cover' }}

                    >
                        <Text style={{ fontSize: 16, fontFamily: 'DMSans-Bold', position: 'absolute', right: 20, top: 11, zIndex: 6000 }}>
                            {userPoints}
                        </Text>
                        <Image source={require('../assets/crown.gif')} style={{
                            width: 47, height: 47,
                            resizeMode: 'contain',
                            top: 30, left: 208, right: 0, bottom: 0, position: 'absolute',
                            alignItems: 'center', transform: [{ rotate: '45deg' }],
                        }}></Image>

                        {topThreeUsers.map((user, index) => {
                            let avatarStyle = {};
                            let nameStyle = {};
                            let pointsStyle = {};

                            if (index === 0) {
                                avatarStyle = { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white' };
                                nameStyle = { fontSize: 15, fontFamily: 'DMSans-Bold' };
                                pointsStyle = { fontSize: 15, fontFamily: 'DMSans-Bold' };
                            } else if (index === 1) {
                                avatarStyle = { width: 65, height: 65, borderRadius: 40 };
                                nameStyle = { fontSize: 13, fontFamily: 'DMSans-Bold' };
                                pointsStyle = { fontSize: 13, fontFamily: 'DMSans-Bold' };
                            } else if (index === 2) {
                                avatarStyle = { width: 55, height: 55, borderRadius: 30 };
                                nameStyle = { fontSize: 11, fontFamily: 'DMSans-Bold' };
                                pointsStyle = { fontSize: 11, fontFamily: 'DMSans-Bold' };
                            }
                            return (
                                <View key={user.id} style={[
                                    { alignItems: 'center', marginBottom: 10 },
                                    index === 0 && { marginLeft: 'auto', marginRight: 'auto', position: 'absolute', left: 0, right: 0, top: 68 },
                                    index === 1 && { marginRight: 250, position: 'absolute', top: 134, left: 23 },
                                    index === 2 && { marginLeft: 50, position: 'absolute', top: 146, right: 12 },
                                ]}>
                                    <Image source={findAvatarSource(user.avatarId)} style={[avatarStyle, { marginBottom: 5 }]} />
                                    <Text numberOfLines={2} style={[nameStyle, { width: 80, flexWrap: 'wrap', textAlign: 'center' }]}>{user.name}</Text>
                                    <Text style={[pointsStyle]}>{user.points}</Text>
                                </View>
                            );
                        })}
                        <View style={{ position: 'absolute', width: '92%', left: 15, right: 0, top: 370, bottom: 0, height: '40%', borderBottomLeftRadius: 50 }}>
                            <FlatList
                                data={otherUsers}
                                keyExtractor={user => user.id}
                                renderItem={renderUserCard}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    </ImageBackground >
                )}
            </View>
        </View>


    );
};

export default LeaderBoard;
