import { StatusBar } from 'expo-status-bar';
import React, { useState, createContext, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import Login from './screens/Login';
import Signup from './screens/Signup';
import { auth, database } from './config/firebase';
import { ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import JoinOrCreate from './screens/JoinOrCreate';
import UserAvatar from './screens/UserAvatar';
import ClubCreationScreen from './screens/ClubCreationScreen';
import ClubCreationSuccess from './screens/ClubCreationSuccess';
import ClubFeed from './screens/ClubFeed';
import { useFonts } from '@expo-google-fonts/poppins';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreenOwner from './screens/ChatScreenOwner';
import CreateEventOwner from './screens/CreateEventOwner';
import ScheduleMeetingOwner from './screens/ScheduleMeetingOwner';
import OrganizeWorkshopOwner from './screens/OrganizeWorkshopOwner';
import { doc, getDoc } from 'firebase/firestore';
import BottomNavigator from './screens/BottomNavigator';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RegisterEvent from './screens/RegisterEvent';
import JoinClubScreen from './screens/JoinClubScreen';
import ClubJoinSuccess from './screens/ClubJoinSuccess';
import RegisteredMembers from './screens/RegisteredMembers';
import DiscoverEvents from './screens/DiscoverEvents';
import MarkEvent from './screens/MarkEvent';
import LeaderBoard from './screens/LeaderBoard';
import Store from './screens/Store';
import StoreFeed from './screens/StoreFeed';
import BottomNavigatorStore from './screens/BottomNavigatorStore';
import TrackPreviousOrder from './screens/TrackPreviousOrder';
import RegisterMeeting from './screens/RegisterMeeting';
import MarkMeeting from './screens/MarkMeeting';
import DiscoverMeetings from './screens/DiscoverMeetings';
import RegisterWorkshop from './screens/RegisterWorkshop';
import MarkWorkshop from './screens/MarkWorkshop';
import DiscoverWorkshops from './screens/DiscoverWorkshops';



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
// function ChatStack() {
//   return (
//     <Stack.Navigator defaultScreenOptions={Home} screenOptions={{
//       headerShown: false,
//       gestureEnabled: true,
//       gestureDirection: 'horizontal',
//       cardStyleInterpolator: ({ current }) => ({
//         cardStyle: {
//           opacity: current.progress,
//         },
//       }), 
//     }} >

//       <Stack.Screen name="MainScreen" component={MainScreen} />
//       <Stack.Screen name="ClubFeed" component={ClubFeed} />
//       <Stack.Screen name="HomeScreen" component={HomeScreen} />
//       <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
//       <Stack.Screen name="ChatScreenOwner" component={ChatScreenOwner} />
//       <Stack.Screen name="CreateEventOwner" component={CreateEventOwner} options={{
//         cardStyleInterpolator: ({ current }) => ({
//           cardStyle: {
//             opacity: current.progress,
//             transform: [
//               {
//                 translateX: current.progress.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [100, 0],
//                 }),
//               },
//             ],
//           },
//         }),
//       }} />
//       <Stack.Screen name="ScheduleMeetingOwner" component={ScheduleMeetingOwner} options={{
//         cardStyleInterpolator: ({ current }) => ({
//           cardStyle: {
//             opacity: current.progress,
//             transform: [
//               {
//                 translateX: current.progress.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [100, 0],
//                 }),
//               },
//             ],
//           },
//         }),
//       }} />
//       <Stack.Screen name="OrganizeWorkshopOwner" component={OrganizeWorkshopOwner} options={{
//         cardStyleInterpolator: ({ current }) => ({
//           cardStyle: {
//             opacity: current.progress,
//             transform: [
//               {
//                 translateX: current.progress.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [100, 0],
//                 }),
//               },
//             ],
//           },
//         }),
//       }} />




//     </Stack.Navigator>
//   )
// }

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />

      <Stack.Screen name="Signup" component={Signup} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="UserAvatar" component={UserAvatar} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="JoinOrCreate" component={JoinOrCreate} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />

      <Stack.Screen name="JoinClubScreen" component={JoinClubScreen} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />


      <Stack.Screen name="ClubJoinSuccess" component={ClubJoinSuccess} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />

      <Stack.Screen name="BottomNavigator" component={BottomNavigator} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="ChatScreenOwner" component={ChatScreenOwner} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />

      <Stack.Screen name="RegisterEvent" component={RegisterEvent} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="RegisterMeeting" component={RegisterMeeting} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="RegisterWorkshop" component={RegisterWorkshop} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="CreateEventOwner" component={CreateEventOwner} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="ScheduleMeetingOwner" component={ScheduleMeetingOwner} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="OrganizeWorkshopOwner" component={OrganizeWorkshopOwner} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="RegisteredMembers" component={RegisteredMembers} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />

      <Stack.Screen name="DiscoverEvents" component={DiscoverEvents} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />

      <Stack.Screen name="DiscoverMeetings" component={DiscoverMeetings} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="DiscoverWorkshops" component={DiscoverWorkshops} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="MarkEvent" component={MarkEvent} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="MarkMeeting" component={MarkMeeting} options={{
        ...TransitionPresets.ModalSlideFromRightIOS
      }} />

      <Stack.Screen name="MarkWorkshop" component={MarkWorkshop} options={{
        ...TransitionPresets.ModalSlideFromRightIOS
      }} />

      <Stack.Screen name="LeaderBoard" component={LeaderBoard} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="Store" component={Store} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="StoreFeed" component={StoreFeed} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />

      <Stack.Screen name="BottomNavigatorStore" component={BottomNavigatorStore} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="TrackPreviousOrder" component={TrackPreviousOrder} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />


      {/* <Stack.Screen name="ClubFeed" component={ClubFeed} /> */}

    </Stack.Navigator>
  );
}



function AuthStack() {
  return (
    <Stack.Navigator defaultScreenOptions={Login} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="UserAvatar" component={UserAvatar} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="JoinOrCreate" component={JoinOrCreate} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="JoinClubScreen" component={JoinClubScreen} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />

      <Stack.Screen name="ClubCreationScreen" component={ClubCreationScreen} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="ClubCreationSuccess" component={ClubCreationSuccess} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="ClubJoinSuccess" component={ClubJoinSuccess} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="BottomNavigator" component={BottomNavigator} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="ChatScreenOwner" component={ChatScreenOwner} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="RegisterEvent" component={RegisterEvent} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="RegisterMeeting" component={RegisterMeeting} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="RegisterWorkshop" component={RegisterWorkshop} options={{
        ...TransitionPresets.SlideFromRightIOS
      }} />
      <Stack.Screen name="CreateEventOwner" component={CreateEventOwner} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="ScheduleMeetingOwner" component={ScheduleMeetingOwner} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="OrganizeWorkshopOwner" component={OrganizeWorkshopOwner} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="RegisteredMembers" component={RegisteredMembers} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="DiscoverEvents" component={DiscoverEvents} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="DiscoverMeetings" component={DiscoverMeetings} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="DiscoverWorkshops" component={DiscoverWorkshops} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="MarkEvent" component={MarkEvent} options={{
        ...TransitionPresets.ModalSlideFromRightIOS
      }} />
      <Stack.Screen name="MarkMeeting" component={MarkMeeting} options={{
        ...TransitionPresets.ModalSlideFromRightIOS
      }} />
      <Stack.Screen name="MarkWorkshop" component={MarkWorkshop} options={{
        ...TransitionPresets.ModalSlideFromRightIOS
      }} />


      <Stack.Screen name="LeaderBoard" component={LeaderBoard} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="Store" component={Store} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="StoreFeed" component={StoreFeed} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="BottomNavigatorStore" component={BottomNavigatorStore} options={{
        ...TransitionPresets.ModalSlideFromBottomIOS
      }} />
      <Stack.Screen name="TrackPreviousOrder" component={TrackPreviousOrder} options={{
        ...TransitionPresets.ModalSlideFromRightIOS
      }} />
    </Stack.Navigator>
  )
}



function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [loading, setLoading] = useState(true);
  const [userClubIdExists, setUserClubIdExists] = useState(false);

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

  useEffect(() => {
    if (user && user.uid) {
      const userDocRef = doc(database, 'users', user.uid);
      getDoc(userDocRef)
        .then((snapshot) => {
          const userData = snapshot.data();
          const userHasClubId = userData && userData.hasOwnProperty('clubId');
          setUserClubIdExists(userHasClubId);
          console.log("user:", user, ", userhasclubid::", userHasClubId)
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    }
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
      {userClubIdExists ? <ChatStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('./assets/fonts/poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('./assets/fonts/poppins/Poppins-Bold.ttf'),
    'Inter-Regular': require('./assets/fonts/inter/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/inter/Inter-Medium.ttf'),
    'Inter-SemiBold': require('./assets/fonts/inter/Inter-SemiBold.ttf'),
    'Inter-Bold': require('./assets/fonts/inter/Inter-Bold.ttf'),
    'DMSans-Regular': require('./assets/fonts/dmsans/DMSans-Regular.ttf'),
    'DMSans-Medium': require('./assets/fonts/dmsans/DMSans-Medium.ttf'),
    'DMSans-Bold': require('./assets/fonts/dmsans/DMSans-Bold.ttf'),



  });


  return (
    <AuthenticatedUserProvider>
      {/* <StatusBar style="light" backgroundColor='white' /> */}
      <RootNavigator />

    </AuthenticatedUserProvider>)
}


