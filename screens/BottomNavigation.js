import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const BottomNavigation = ({style}) => {
    const navigation = useNavigation();
    const route = useRoute();

    const isHomeActive = route.name === 'ClubFeed';
    const isChatActive = route.name === 'ChatScreen';
    const isProfileActive = route.name === 'ProfileScreen';

    const calculateLinePosition = () => {
        if (isHomeActive) return '0%';
        if (isChatActive) return '33.33%';
        if (isProfileActive) return '66.66%';
        return '0%';
    };

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity onPress={() => navigation.navigate('ClubFeed')}>
                <View style={[styles.iconContainer, isHomeActive && styles.activeIcon]}>
                    <Icon name="home" size={30} color={isHomeActive ? 'black' : 'grey'} />
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')}>
                <View style={[styles.iconContainer, isChatActive && styles.activeIcon]}>
                    <Icon name="comments" size={30} color={isChatActive ? 'black' : 'grey'} />
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
                <View style={[styles.iconContainer, isProfileActive && styles.activeIcon]}>
                    <Icon name="user" size={30} color={isProfileActive ? 'black' : 'grey'} />
                </View>
            </TouchableOpacity>
            <View style={[styles.line, { left: calculateLinePosition() }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60,
        bottom: -598,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    line: {
        position: 'absolute',
        bottom: 60,
        height: 2,
        backgroundColor: 'black',
        width: '33.33%',
    },
    iconContainer: {
        borderRadius: 10,
        paddingTop: 5,
        paddingRight: 25,
        paddingBottom: 5,
        paddingLeft: 25,
    },
    activeIcon: {
        backgroundColor: 'lightblue',
    },
});

export default BottomNavigation;

