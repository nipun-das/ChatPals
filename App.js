import { StatusBar } from 'expo-status-bar';
import React, { useState, createContext, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import Chat from './screens/Chat';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Home from './screens/Home';
import { auth } from './config/firebase';
import { ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import ClubSel from './screens/ClubSel';
import UserAvatar from './screens/UserAvatar';
import ClubCreationScreen from './screens/ClubCreationScreen';
import ClubCreationSuccess from './screens/ClubCreationSuccess';
import ClubFeed from './screens/ClubFeed';
import { useFonts } from '@expo-google-fonts/poppins';
import TestPage from './screens/TestPage';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreenOwner from './screens/ChatScreenOwner';
import MainScreen from './screens/MainScreen';
import CreateEventOwner from './screens/CreateEventOwner';
import ScheduleMeetingOwner from './screens/ScheduleMeetingOwner';
import OrganizeWorkshopOwner from './screens/OrganizeWorkshopOwner';

LogBox.ignoreLogs(['AsyncStorage has been extracted']);


const Stack = createStackNavigator();
export const AuthenticatedUserContext = createContext({});

export const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  )
}

// for authenticated users
function ChatStack() {
  return (
    <Stack.Navigator defaultScreenOptions={Home} screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      cardStyleInterpolator: ({ current }) => ({
        cardStyle: {
          opacity: current.progress,
        },
      }),
    }} >
      {/* <Stack.Screen name="ClubSel" component={ClubSel} /> */}
      {/* <Stack.Screen name="ClubCreationScreen" component={ClubCreationScreen} /> */}
      {/* <Stack.Screen name="ClubCreationSuccess" component={ClubCreationSuccess} /> */}
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen name="ClubFeed" component={ClubFeed} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="ChatScreenOwner" component={ChatScreenOwner} />
      <Stack.Screen name="CreateEventOwner" component={CreateEventOwner} options={{
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress,
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        }),
      }} />
      <Stack.Screen name="ScheduleMeetingOwner" component={ScheduleMeetingOwner} options={{
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress,
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        }),
      }} />
      <Stack.Screen name="OrganizeWorkshopOwner" component={OrganizeWorkshopOwner} options={{
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress,
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        }),
      }} />




    </Stack.Navigator>
  )
}

// for unauthenticated users
function AuthStack() {
  return (
    <Stack.Navigator defaultScreenOptions={Login} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="UserAvatar" component={UserAvatar} />
    </Stack.Navigator>
  )
}

function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      setUser(authenticatedUser);
      setLoading(false);
      await SplashScreen.hideAsync();
    });

    return async () => {
      await unsubscribe();
    };
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }
  return (
    <NavigationContainer>
      {user ? <ChatStack /> : <AuthStack />}
    </NavigationContainer>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('./assets/fonts/poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('./assets/fonts/poppins/Poppins-Bold.ttf'),
    'Inter-Regular': require('./assets/fonts/inter/Inter-Regular.ttf'),
    'Inter-SemiBold': require('./assets/fonts/inter/Inter-SemiBold.ttf'),
  });


  return (
    <AuthenticatedUserProvider>
      <StatusBar style="light" backgroundColor='white' />
      <RootNavigator />
    </AuthenticatedUserProvider>)
}


