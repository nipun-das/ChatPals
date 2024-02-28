import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ClubFeed from './ClubFeed';
import ChatScreenOwner from './ChatScreenOwner';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomNavigator = () => {
    return (
        <Tab.Navigator

            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'ClubFeed') {
                        iconName = focused ? 'home' : 'home-outline';
                    } 
                    // else if (route.name === 'ChatScreenOwner') {
                    //     iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                    // } 
                    else if (route.name === 'ProfileScreen') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
            tabBarOptions={{
                "tabBarActiveTintColor": "tomato",
                "tabBarInactiveTintColor": "gray",
                "headerShown": "false",
                "tabBarStyle": [
                    {
                        "display": "flex"
                    },
                    null
                ]
            }}
        >
            <Tab.Screen name="ClubFeed" component={ClubFeed} />
            {/* <Tab.Screen name="ChatScreenOwner" component={ChatScreenOwner} /> */}
            <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default BottomNavigator;
