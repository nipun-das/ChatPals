import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, FlatList, StatusBar } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { database } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';



const JoinClubScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

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

    const handleJoinClub = (clubId) => {
        console.log('Joining club with ID:', cid);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleJoinClub(item.id)}>
            <Text style={styles.clubName}>{item.name}</Text>
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
            <FlatList
                data={searchResults}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // padding: 16,
    },
    searchContainer: {
        marginBottom: 16,
        marginTop:20
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
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
        fontSize: 16,
        fontWeight: 'bold',
    },
    createContainer: {
        backgroundColor: '#A6D3E3',
        height: 70,
        borderBottomWidth: 2,
        borderBottomColor: 'black'
        // marginTop: 30,
    },
});

export default JoinClubScreen;
