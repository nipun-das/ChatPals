import { StatusBar } from 'expo-status-bar';
import React, { useState, createContext, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen } from 'expo-splash-screen';
import Chat from './screens/Chat';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Home from './screens/Home';
import { auth } from './config/firebase';
import { ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
// import { AppLoading } from 'expo';
import ClubSel from './screens/ClubSel';
import UserAvatar from './screens/UserAvatar';
import ClubCreationScreen from './screens/ClubCreationScreen';
import ClubCreationSuccess from './screens/ClubCreationSuccess';
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import AppLoading from 'expo-app-loading';
LogBox.ignoreLogs(['AsyncStorage has been extracted']);


const Stack = createStackNavigator();
const AuthenticatedUserContext = createContext({});

const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  )
}

function ChatStack() {
  return (
    <Stack.Navigator defaultScreenOptions={Home} screenOptions={{ headerShown: false }} >
      <Stack.Screen name="UserAvatar" component={UserAvatar} />
      <Stack.Screen name="ClubSel" component={ClubSel} />
      <Stack.Screen name="ClubCreationScreen" component={ClubCreationScreen} />
      <Stack.Screen name="ClubCreationSuccess" component={ClubCreationSuccess} />
    </Stack.Navigator>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator defaultScreenOptions={Login} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="UserAvatar" component={UserAvatar} />
      <Stack.Screen name="ClubSel" component={ClubSel} />
      <Stack.Screen name="ClubCreationScreen" component={ClubCreationScreen} />
      <Stack.Screen name="ClubCreationSuccess" component={ClubCreationSuccess} />
    </Stack.Navigator>
  )
}

function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth,
      async authenticatedUser => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
        setLoading(false);
      }
    );
    return () => unsubscribe();
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
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Inter-Regular': require('./assets/fonts/inter/static/Inter-Regular.ttf'),
    'Inter-SemiBold': require('./assets/fonts/inter/static/Inter-SemiBold.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),


  });


  if (!fontsLoaded) {
    return <AppLoading />;
  }

  
  return (
    <AuthenticatedUserProvider>
      <StatusBar style="light" backgroundColor='white' />
      <RootNavigator />
    </AuthenticatedUserProvider>)
}


