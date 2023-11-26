import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';

const ClubFeed = ({ navigation }) => {
    // Dummy data for club feed
    const clubFeedData = [
        {
            id: '1',
            clubName: 'Coding Club',
            postText: 'Exciting coding session today at 4 PM. Don\'t miss it!',
            imageUrl: require('../assets/avatar1.png'),
        },
        {
            id: '2',
            clubName: 'Sports Club',
            postText: 'Join us for a friendly football match this weekend. Everyone is welcome!',
            imageUrl: require('../assets/avatar2.png'),
        },
        // Add more dummy data as needed
    ];

    const renderClubPost = ({ item }) => (
        <TouchableOpacity
            style={styles.postContainer}
            onPress={() => navigation.navigate('ClubPostDetail', { post: item })}
        >
            <Text style={styles.clubName}>{item.clubName}</Text>
            <Image source={item.imageUrl} style={styles.postImage} />
            <Text style={styles.postText}>{item.postText}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={clubFeedData}
                keyExtractor={(item) => item.id}
                renderItem={renderClubPost}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    postContainer: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 16,
    },
    clubName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    postImage: {
        height: 200,
        borderRadius: 8,
        marginBottom: 8,
    },
    postText: {
        fontSize: 16,
    },
});

export default ClubFeed;
