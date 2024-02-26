import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Modal, TextInput, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { auth, database } from '../config/firebase'; // Import your Firebase configuration
import { ScrollView } from 'react-native-gesture-handler';

const ClubFeed = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  // const navigation = useNavigation();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('User not logged in.');
        return;
      }
      console.log("current user id: ", currentUser.uid)

      // Fetch the user document to get the club ID
      const userDoc = await getDoc(doc(database, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        console.error('User document not found for currentUser:', currentUser.uid);
        return;
      }

      const { clubId } = userDoc.data();
      console.log("club id : ", clubId)

      // Reference to the club's posts collection
      const clubPostsCollectionRef = collection(database, 'clubs', clubId, 'posts');

      // Query to get posts in descending order of their time
      const querySnapshot = await getDocs(query(clubPostsCollectionRef, orderBy('postDate', 'desc')));

      const promises = querySnapshot.docs.map(async (postDoc) => {
        const postData = postDoc.data();
        const userId = postData.postSenderId;
        console.log("post sender fetched: ", userId)

        // Fetch user document based on userId
        const userDoc = await getDoc(doc(database, 'users', userId));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("userdoc fetched: ", userData)

          const { name, avatarId } = userData;

          console.log("name and avatar fetched: ", name, avatarId)

          // Add username and avatarId to the post data
          postData.userName = name;
          postData.avatarId = avatarId;

          console.log("postdata name and avatar fetched: ", postData.userName, postData.avatarId)

          return { id: postDoc.id, ...postData };
        } else {
          console.log("User document does not exist for userId:", userId);
        }
      });

      const resolvedPosts = await Promise.all(promises);
      // Filter out any undefined values (in case user documents were not found)
      const postsData = resolvedPosts.filter(post => post);

      // Set posts state with updated data
      setPosts(postsData);

    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };



  // console.log("postdata--->>", posts)
  // console.log("postdata--->>", posts.postTitle)


  const findAvatarSource = (avatarId) => {
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

    const avatar = avatars.find((avatar) => avatar.id === avatarId);
    console.log("../assets/avatar" + avatar.id + ".png")
    return "../assets/avatar" + avatar + ".png" ? avatar.source : null;
  };

  const handleCreatePost = async () => {
    try {
      const currentUser = auth.currentUser;
      const userDoc = await getDoc(doc(database, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const { clubId } = userDoc.data();

        const clubRef = doc(database, 'clubs', clubId);
        const clubPostsCollection = collection(clubRef, 'posts');

        await addDoc(clubPostsCollection, {
          clubId: clubId,
          postSenderId: currentUser.uid,
          postDate: new Date(),
          postTitle: postTitle,
          postDesc: postDesc,
          imageUrl: imageUrl,
          videoUrl: videoUrl
        });

        setPostTitle('');
        setPostDesc('');
        setImageUrl('');
        setVideoUrl('');

        console.log('Post created successfully');
        toggleModal();
      } else {
        console.error('User document not found for currentUser:', currentUser.uid);
      }
    } catch (error) {
      console.error('Error creating post: ', error);
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };
  const formatDate = (dateObject) => {
    if (!dateObject || !dateObject.toDate) return '';

    const date = dateObject.toDate();
    if (isNaN(date.getTime())) return '';
    const [month, day, year] = date.toLocaleDateString().split('/');

    const months = [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];

    const monthName = months[parseInt(month) - 1];

    return `${parseInt(day)} ${monthName}`;
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.navigate('Login')
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.miniLogo} onPress={fetchPosts}>
          <Image source={require('../assets/text-logo.png')} style={styles.miniLogo} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationIcon} onPress={handleSignOut}>
          <Ionicons name="notifications-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.fab} onPress={toggleModal}>
        <Ionicons name="add" size={50} color="black" />
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.postsContainer}>
          {posts.map((post) => (
            <View key={post.id} style={styles.post}>
              <View style={styles.nameAvatarContainer}>
                <Image source={findAvatarSource(post.avatarId)} style={styles.avatar} />
                <View style={styles.nameDateContainer}>
                  <Text style={styles.userName}>{post.userName}</Text>
                  <Text style={styles.postDate}>{formatDate(post.postDate)}</Text>
                </View>
              </View>
              <Text style={styles.title}>{post.postTitle}</Text>
              <Text style={styles.description}>{post.postDesc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => toggleModal()}
      >
        <View style={styles.modalContainer}>
          <StatusBar backgroundColor="black" />
          <TouchableOpacity style={styles.backButton} onPress={toggleModal}>
            <Image source={require('../assets/backIcon.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={styles.createContainer}>
            <Text style={styles.modalTitle}>Create a Post</Text>
          </View>


          <View style={[styles.modalContent, { borderTopLeftRadius: 30, borderTopRightRadius: 30 }]}>
            <Text style={styles.label}>What's on your mind?</Text>

            <TextInput
              placeholder="..."
              value={postTitle}
              onChangeText={setPostTitle}
              style={styles.textInput}
            />
            <Text style={styles.label}>Share the complete story guys!</Text>

            <TextInput
              placeholder="..."
              value={postDesc}
              onChangeText={setPostDesc}
              multiline={true}
              style={[styles.textInput, { height: 279 }]}
            />
            <View style={styles.uploadContainer}>
              <TouchableOpacity style={styles.uploadButton} onPress={() => { }}>
                <Image source={require('../assets/upload.png')} style={styles.uploadButtonIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={() => { }}>
                <Image source={require('../assets/play.png')} style={styles.uploadButtonIcon} />

              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.postButton} onPress={handleCreatePost}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderWidth: 0.17,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 20,
    zIndex: 1,
  },
  label: {
    fontSize: 13,
    color: 'black',
    fontFamily: "Inter-Medium",
    marginBottom: 5
  },
  backIcon: {
    width: 18,
    height: 18,
  },

  miniLogo: {
    width: 120,
    resizeMode: 'contain',
    height: 70,
    paddingTop: 18,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  createContainer: {
    backgroundColor: 'black',
    height: 89,
    marginTop: 30
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 26,
    marginTop: 30,
    textAlign: 'center',
    color: 'white',
    fontFamily: "Poppins-Bold",

  },
  notificationIcon: {
    padding: 10,
    marginTop: 13,
    marginRight: 8
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'yellow',
    width: 60,
    height: 60,
    zIndex: 1000,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    height: '96%',
    overflow: 'hidden',
    padding: 20,
    paddingTop: 50,

  },
  modalHeader: {
    backgroundColor: 'white',
    width: '100%'
  },

  modalBody: {
    padding: 20,
  },
  textInput: {
    borderWidth: 0.167,
    borderColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    marginBottom: 20,
  },
  uploadContainer: {
    flex: 0.3,
    flexDirection: 'row',
    width: 65,
    paddingLeft: 5,
    justifyContent: 'space-between'
  },
  uploadButton: {

  },
  uploadButtonIcon: {
    width: 25,
    height: 25,
  },
  postButton: {
    backgroundColor: 'black',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  postButtonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Inter-SemiBold'
  },





  postsContainer: {
    flex: 1,
    padding: 10,
  },
  post: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'black'
  },
  userName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    // marginBottom: 5,
  },
  postDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    backgroundColor: 'white',
    // width: 150,
    marginLeft: 130,
    marginRight: 50
    // float:'right'
    // justifyContent:'flex-end'
    // marginTop: -3,
  },
  nameAvatarContainer: {
    // flex:1,
    display: 'flex',
    flexDirection: 'row'
  },
  nameDateContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  title: {
    fontSize: 17,
    // fontWeight: 'bold',
    fontFamily: 'Poppins-Medium',
    // marginBottom: 5,
  },
  description: {
    fontSize: 14,
  },








});

export default ClubFeed;

