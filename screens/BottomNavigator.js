import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ClubFeed from './ClubFeed';
import ChatScreenOwner from './ChatScreenOwner';
import ProfileScreen from './ProfileScreen';
import { LogBox, View } from 'react-native';
import LeaderBoard from './LeaderBoard';
LogBox.ignoreLogs(['Bottom Tab Navigator: \'tabBarOptions\' is deprecated.']);


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
                            iconColor = focused ? 'black' : 'black';
                        }

                        else if (route.name === 'ProfileScreen') {
                            iconName = focused ? 'person' : 'person-outline';
                            iconColor = focused ? 'black' : 'black';

                        }
                        //  else if (route.name === 'LeaderBoard') {
                        //     iconName = focused ? 'trophy' : 'trophy-outline'; 
                        //     iconColor = focused ? 'black' : 'black';
                        // }

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
                {/* <Tab.Screen name="LeaderBoard" component={LeaderBoard} /> */}

            </Tab.Navigator>
            <View style={{
                marginBottom: 5, marginLeft: 50,
                borderRadius: 15
            }} />
        </View>
    );
};

export default BottomNavigator;



