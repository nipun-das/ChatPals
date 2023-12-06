// // ProfileScreen.js

// import React from 'react';
// import { View, Text, StyleSheet, Image } from 'react-native';
// import BottomNavigation from './BottomNavigation';

// const ProfileScreen = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={{ top: 180, display: 'flex', justifyContent: 'center', fontFamily: 'Poppins-Bold', fontSize: 30, textAlign: 'center' }}>Under{'\n'}Development</Text>
//       <Image source={require("../assets/error.png")} style={styles.image} resizeMode="contain" />
//       <Text style={{ top: 320, display: 'flex', justifyContent: 'center', fontFamily: 'Poppins-Medium', fontSize: 18, textAlign: 'center' }}>This feature will arrive soon.</Text>




//       <BottomNavigation />
//     </View>
//   );
// };

// export default ProfileScreen;


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   image: {
//     width: 260,
//     height: 260,
//     position: 'absolute',
//     top: 210,
//     left: 45
//   },
// })

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { database } from '../config/firebase';
import BottomNavigation from './BottomNavigation';


const ProfileScreen = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async (uid) => {
      const userDoc = await getDoc(doc(database, 'owners', uid));
      const userData = userDoc.data();


      const currentUser = auth.currentUser;
      const userEmail = currentUser?.email;

      setUser({
        ...userData,
        email: userEmail,
      });

    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const avatars = [
    { id: 1, source: require('../assets/avatar1.png') },
    { id: 2, source: require('../assets/avatar2.png') },
    { id: 3, source: require('../assets/avatar3.png') },
    { id: 4, source: require('../assets/avatar4.png') },
    { id: 5, source: require('../assets/avatar5.png') },
    { id: 6, source: require('../assets/avatar6.png') },
    { id: 7, source: require('../assets/avatar7.png') },
    { id: 8, source: require('../assets/avatar8.png') },
    { id: 9, source: require('../assets/avatar9.png') },

  ];

  const selectedAvatarId = user.avatarId;

  const selectedAvatar = avatars.find(avatar => avatar.id === selectedAvatarId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={selectedAvatar ? selectedAvatar.source : null} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>Club Owner</Text>

      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{user.email}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Register Number</Text>
          <Text style={styles.detailValue}>{user.regNo}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Semester</Text>
          <Text style={styles.detailValue}>{user.semester}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Interests</Text>
          <Text style={styles.detailValue}>{user.interests}</Text>
        </View>
      </View>
      <BottomNavigation style={{ bottom: -5 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginTop: 70,

  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 2, 
    borderColor:'grey'
  },
  name: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  role: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: 'grey'
  },
  detailsContainer: {
    marginTop: 20,
  },
  detailBox: {
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',

    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',

  },
});

export default ProfileScreen;
