import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ClubFeed from './ClubFeed';
import ChatScreenOwner from './ChatScreenOwner';
import ProfileScreen from './ProfileScreen';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();

const BottomNavigator = () => {
    return (
        <View style={{
            flex: 1,  backgroundColor: '#E5F1FF'
        }}>
            <Tab.Navigator

                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        let iconColor;
                        if (route.name === 'ClubFeed') {
                            iconName = focused ? 'home' : 'home-outline';
                            iconColor = focused ? '#206CC6' : '#206CC6';
                        }

                        else if (route.name === 'ProfileScreen') {
                            iconName = focused ? 'person' : 'person-outline';
                            iconColor = focused ? '#206CC6' : '#206CC6';

                        }

                        return <Ionicons name={iconName} size={size} color={iconColor} />;
                    },
                })}
                tabBarOptions={{
                    style: {
                        height: 80,
                    }
                    , labelStyle: {
                        display: 'none',
                    },
                }}
            >
                <Tab.Screen name="ClubFeed" component={ClubFeed} />
                <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
            </Tab.Navigator>
            <View style={{
                marginBottom: 5, marginLeft: 50,
                borderRadius: 15
            }} />
        </View>
    );
};

export default BottomNavigator;



