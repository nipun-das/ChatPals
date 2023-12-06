// ChatScreen.js

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import BottomNavigation from './BottomNavigation';

const ChatScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={{ top: 180, display: 'flex', justifyContent: 'center', fontFamily: 'Poppins-Bold', fontSize: 30, textAlign: 'center' }}>Under{'\n'}Development</Text>
            <Image source={require("../assets/error.png")} style={styles.image} resizeMode="contain" />
            <Text style={{ top: 320, display: 'flex', justifyContent: 'center', fontFamily: 'Poppins-Medium', fontSize: 18, textAlign: 'center' }}>This feature will arrive soon.</Text>

            <BottomNavigation />
        </View>
    );
};

const styles = StyleSheet
.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    image: {
        width: 260,
        height: 260,
        position: 'absolute',
        top: 210,
        left: 45
    },
})

export default ChatScreen;
