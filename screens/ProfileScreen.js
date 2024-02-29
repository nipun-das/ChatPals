import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { database } from '../config/firebase';
import BottomNavigation from './BottomNavigator';


const ProfileScreen = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async (uid) => {
      const userDoc = await getDoc(doc(database, 'users', uid));
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
        <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%', backgroundColor: '#3E96FF', height: 150 }}>
          <Image source={selectedAvatar ? selectedAvatar.source : null} style={styles.avatar} />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        {/* <Text style={styles.role}>{user.role == 'owner' ? 'Club Leader' : 'Member'}</Text> */}


        <View style={[styles.roleContainer, { backgroundColor: '#E0EEFF', width: 85, height: 25,marginTop:5, justifyContent: 'center', alignItems: 'center', borderRadius: 5, }]}>
          <Text style={[styles.roleText, { color: '#206CC6', fontFamily: 'DMSans-Bold', fontSize: 12 }]}>{user.role == 'owner' ? 'Club Leader' : 'Member'}</Text>
        </View>

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
      {/* <BottomNavigation style={{ bottom: -5 }} /> */}
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
    // marginTop: 70,

  },
  avatar: {
    width: 150,
    height: 150,
    position: 'absolute',
    top: 35,
    // padding:10,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 10,
    borderColor: '#206CC6',
    backgroundColor: 'white',

  },
  name: {
    marginTop: 45,
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
  },
  role: {
    fontFamily: 'DMSans-Medium',
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
    borderWidth: 1,
    borderColor: '#3E96FF',
    marginLeft: 20,
    marginRight: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',

    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'DMSans-Medium',

  },
});

export default ProfileScreen;
