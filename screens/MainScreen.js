import React, { useState } from 'react';
import { View } from 'react-native';
import ClubFeed from './ClubFeed';
import ChatScreen from './ChatScreen';
import ProfileScreen from './ProfileScreen';
import BottomNavigation from './BottomNavigation';

const MainScreen = () => {
    const [activeScreen, setActiveScreen] = useState('ClubFeed');

    const renderScreen = () => {
        switch (activeScreen) {
            case 'ChatScreen':
                console.log("render-->", activeScreen)
                return <ChatScreen />;
            case 'ProfileScreen':
                console.log("render-->", activeScreen)
                return <ProfileScreen />;
            default:
                console.log("render-->", activeScreen)

                return <ClubFeed />;
        }

    };

    return (
        <View style={{ flex: 1 }}>
            {renderScreen()}
            <BottomNavigation setActiveScreen={setActiveScreen} />
        </View>
    );
};

export default MainScreen;
