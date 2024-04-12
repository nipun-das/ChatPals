import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Modal, TextInput, StatusBar, BackHandler, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { auth, database, storage } from '../config/firebase';
import { ScrollView } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';
import { ref } from 'firebase/storage';
import { getDownloadURL, uploadBytes } from 'firebase/storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid'
import Swiper from 'react-native-swiper';
import Notification from './Notification';

const ClubFeed = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [postId, setPostId] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [clubId, setClubId] = useState('');
  const [role, setRole] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const notifications = [
    { id: 1, message: 'Info notification', notificationType: 'info' },
    { id: 2, message: 'Warning notification', notificationType: 'warning' },
    { id: 3, message: 'Error notification', notificationType: 'error' }
  ];
  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      fetchPosts();
      setRefreshing(false);
    }, 1000);

  };

  useEffect(() => {
    const backAction = () => {
      if (isFocused) {
        console.log("back btn pressed")
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [isFocused]);

  // useEffect(() => {
  //   fetchPosts();

  // }, []);

  const fetchPosts = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('User not logged in.');
        return;
      }
      console.log("current user id: ", currentUser.uid)

      const userDoc = await getDoc(doc(database, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        console.error('User document not found for currentUser:', currentUser.uid);
        return;
      }

      const { clubId, role } = userDoc.data();
      setRole(role)
      console.log("club id : ", clubId)
      setClubId(clubId)

      const clubPostsCollectionRef = collection(database, 'clubs', clubId, 'posts');

      const querySnapshot = await getDocs(query(clubPostsCollectionRef, orderBy('postDate', 'desc')));

      const promises = querySnapshot.docs.map(async (postDoc) => {
        const postData = postDoc.data();
        console.log("postId : ", postData.postId, " postImg : ", postData.imageUrls)
        const userId = postData.postSenderId;

        // console.log("Post sender fetched-> ", )

        const userDoc = await getDoc(doc(database, 'users', userId));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          const { name, avatarId, role } = userData;
          // console.log("Post sender id,name ,avatar,role fetched->", userId, name, avatarId, role)

          postData.userName = name;
          postData.avatarId = avatarId;
          postData.role = role;

          return { id: postDoc.id, ...postData };
        } else {
          console.log("User document does not exist for userId:", userId);
        }
      });

      const resolvedPosts = await Promise.all(promises);
      const postsData = resolvedPosts.filter(post => post);
      // console.log(postsData)
      setPosts(postsData);
      // console.log(posts.imageUrls)


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
    return "../assets/avatar" + avatar + ".png" ? avatar.source : null;
  };


  const openImagePicker = async () => {
    console.log("picker clicked");
    const options = {
      title: 'Select Image',
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.5, // Adjust quality as needed
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      // The selected image is stored in the result.uri property
      const selectedImage = result.assets[0];
      // Add the selected image to your imageFiles array
      setImageFiles(prevImageFiles => [...prevImageFiles, selectedImage]);
      console.log(imageFiles);
      console.log('Image selected------>>:', selectedImage);
    } else {
      if (result.error) {
        console.log('ImagePicker Error: ', result.error);
      } else if (result.customButton) {
        console.log('User tapped custom button: ', result.customButton);
      } else {
        console.log('User cancelled image picker');
      }
    }
  };


  const generatePostId = () => {
    return uuidv4();
  };
  const handleCreatePost = async () => {
    try {
      const currentUser = auth.currentUser;
      const userDoc = await getDoc(doc(database, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const { clubId } = userDoc.data();
        const clubRef = doc(database, 'clubs', clubId);
        const clubPostsCollection = collection(clubRef, 'posts');

        const downloadUrls = [];

        for (const imageFile of imageFiles) {

          const pid = generatePostId();
          setPostId(pid);

          const randomInt = Math.floor(Math.random() * 10000);

          const fileName = `${randomInt}-post`;
          console.log("------------------------------------------")
          console.log("postid : ", pid, "filename : ", fileName)

          console.log("------------------------------------------")
          console.log("------------------------------------------")
          console.log("------------------------------------------")



          const storageRef = ref(storage, `images/${clubId}/${pid}/${fileName}`);

          const response = await fetch(imageFile.uri);
          const blob = await response.blob();

          const snapshot = await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });

          const downloadUrl = await getDownloadURL(storageRef);
          console.log(downloadUrl)
          downloadUrls.push(downloadUrl);
        }
        // for (const imageFile of imageFiles) {
        //   const pid = generatePostId();
        //   setPostId(pid);
        //   const randomInt = Math.floor(Math.random() * 10000);
        //   const fileName = `${randomInt}_post`;
        //   console.log("------------------------------------------")
        //   console.log("postid : ",pid,"filename : ", fileName)
        //   console.log("------------------------------------------")
        //   console.log("------------------------------------------")
        //   console.log("------------------------------------------")


        //   // Convert image file to Blob object
        //   const blob = new Blob([imageFile], { type: imageFile.type });

        //   const storageRef = ref(storage, `images/${clubId}/${pid}/${fileName}`);
        //   const metadata = {
        //     contentType: blob.type,
        //   };

        //   const snapshot = await uploadBytes(storageRef, blob, metadata);
        //   const downloadUrl = await getDownloadURL(snapshot.ref);
        //   downloadUrls.push(downloadUrl);
        // }

        const postObject = {
          postId: postId,
          clubId: clubId,
          postSenderId: currentUser.uid,
          postDate: new Date(),
          postTitle: postTitle,
          postDesc: postDesc,
          imageUrls: downloadUrls,
          // videoUrl: videoUrl
        };

        await addDoc(clubPostsCollection, postObject);

        setPostTitle('');
        setPostDesc('');
        setImageFiles([]);
        // setVideoUrl('');

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

  // const handleSignOut = async () => {
  //   try {
  //     await auth.signOut();
  //     console.log("Logged out")
  //     navigation.navigate('Login')
  //   } catch (error) {
  //     console.error('Error signing out:', error);
  //   }
  // };
  const handleLeaderNav = () => {
    navigation.navigate("LeaderBoard", { clubId: clubId, role: role })
  }

  const NotificationNav = () => {
    const currentUser = auth.currentUser;
    navigation.navigate("Notification", { currentUserUid: currentUser.uid })
  }

  const handleChatNav = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('User not logged in.');
        return;
      }

      const userDoc = await getDoc(doc(database, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        console.error('User document not found for currentUser:', currentUser.uid);
        return;
      }

      const { clubId } = userDoc.data();
      console.log("clubId fetched:", clubId);
      console.log("sent to chat :", clubId)
      navigation.navigate('ChatScreenOwner', { clubId });

    } catch (error) {
      console.error('Error fetching clubId and navigating:', error);
    }

  }
  const goToDiscoverEvents = () => {
    console.log("role fetched sent", role)
    navigation.navigate("DiscoverEvents", { clubId: clubId, role: role })
  }

  const goToDiscoverWorkshops = () => {
    console.log("role fetched sent", role)
    navigation.navigate("DiscoverWorkshops", { clubId: clubId, role: role })
  }
  const goToDiscoverMeetings = () => {
    console.log("role fetched sent", role)
    navigation.navigate("DiscoverMeetings", { clubId: clubId, role: role })
  }
  const openFullSizeImage = (index) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" />
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.miniLogo} onPress={fetchPosts}>
          <Image source={require('../assets/text-logo.png')} style={styles.miniLogo} />
        </TouchableOpacity>
        <TouchableOpacity style={{ position: 'absolute', top: 27, right: 100 }} onPress={handleLeaderNav}>
          <Ionicons name="trophy-outline" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatIcon} onPress={handleChatNav}>
          <Ionicons name="chatbox-outline" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={{ position: 'absolute', top: 27, right: 20, }} onPress={NotificationNav}>
          <Ionicons name="notifications-outline" size={30} color="black" />
        </TouchableOpacity>
        <View
          style={{
            position: 'absolute',
            top: 30,
            width: 10,
            height: 10,
            zIndex: 6000,
            right: 23,
            backgroundColor: 'red',
            borderRadius: 1000,
          }}
        >
          <Text></Text>
        </View>


        {/* <TouchableOpacity style={styles.notificationIcon} onPress={handleSignOut}>
          <Ionicons name="exit-outline" size={30} color="black" />
        </TouchableOpacity> */}
      </View>

      <TouchableOpacity style={styles.fab} onPress={toggleModal}>
        <Ionicons name="add" size={50} color="white" />
      </TouchableOpacity>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9Bd35A', '#689F38']} />
        }
      >
        <View style={{ width: '100%' }}>
          <Text style={{
            fontFamily: 'DMSans-Bold', fontSize: 21
            , paddingLeft: 16, paddingTop: 7
          }}>Discover</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', padding: 16, paddingTop: 7 }}>
          <TouchableOpacity onPress={goToDiscoverEvents}>
            <View style={{ width: 119, height: 144, marginRight: 14, backgroundColor: 'lightblue', borderColor: '#3E96FF', borderWidth: 1, borderRadius: 10, justifyContent: 'flex-end', alignItems: 'center', padding: 0 }}>
              <Image source={require('../assets/e-cover.png')} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
              <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', width: 119, bottom: 0, position: 'absolute', height: 40, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, }}></View>
              <Text style={{ color: 'white', fontFamily: 'DMSans-Bold', fontSize: 16, position: 'absolute', bottom: 10, left: 10, zIndex: 1 }}>Events</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToDiscoverWorkshops}>

            <View style={{ width: 119, height: 144, marginRight: 14, backgroundColor: 'lightblue', borderRadius: 10, justifyContent: 'flex-end', alignItems: 'center', padding: 0 }}>
              <Image source={require('../assets/w-cover.png')} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
              <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', width: 119, bottom: 0, position: 'absolute', height: 40, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, }}></View>
              <Text style={{ color: 'white', fontFamily: 'DMSans-Bold', fontSize: 16, position: 'absolute', bottom: 10, left: 10, zIndex: 1 }}>Workshops</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={goToDiscoverMeetings}>

            <View style={{ width: 119, height: 144, marginRight: 14, backgroundColor: 'lightblue', borderRadius: 10, justifyContent: 'flex-end', alignItems: 'center', padding: 0 }}>
              <Image source={require('../assets/m-cover.png')} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
              <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', width: 119, bottom: 0, position: 'absolute', height: 40, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, }}></View>

              <Text style={{ color: 'white', fontFamily: 'DMSans-Bold', fontSize: 16, position: 'absolute', bottom: 10, left: 10, zIndex: 1 }}>Meetings</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>



        {posts.length === 0 ? (
          <View style={[styles.noPostsContainer, {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 13,
            // width: 250,
            height: 200,
            marginTop: 150,
            // paddingHorizontal:20,
            backgroundColor: '#E5F1FF'
          }]}>
            <View style={styles.post}>
              <Text style={[styles.noPostsText, {
                fontSize: 18,
                fontFamily: 'DMSans-Bold',
                color: '#333',
                textAlign: 'center'
              }]}>Be the first to post something!</Text>
            </View>
          </View>
        ) : (
          <View style={styles.postsContainer}>
            {posts.map((post) => (
              <View key={post.id} style={styles.post}>
                <View style={styles.nameAvatarContainer}>
                  <Image source={findAvatarSource(post.avatarId)} style={styles.avatar} />

                  <View style={[styles.detailsContainer, { display: 'flex' }]}>
                    <View style={[styles.nameRoleContainer, { flexDirection: 'row' }]}>
                      <Text style={styles.userName}>{post.userName}</Text>
                      <View style={[styles.roleContainer, { backgroundColor: '#EDE6FF', width: 60, height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginLeft: 10, marginTop: 2 }]}>
                        <Text style={[styles.roleText, { color: '#6E3DF1', fontFamily: 'DMSans-Bold', fontSize: 12 }]}>{post.role === 'owner' ? 'Leader' : 'Member'}</Text>
                      </View>

                    </View>
                    <TouchableOpacity style={{}}>
                      <Image source={require('../assets/dots-vertical.png')} style={[styles.dotOption, { zIndex: 5000, backgroundColor: 'white', position: 'absolute', top: -18, right: -100, width: 22, height: 17, resizeMode: 'contain' }]} />
                    </TouchableOpacity>
                    <Text style={styles.postDate}>{formatDate(post.postDate)}</Text>
                  </View>
                </View>
                <Text style={styles.title}>{post.postTitle}</Text>
                <Text style={styles.description}>{post.postDesc}</Text>
                {post.imageUrls.length > 0 && (
                  <Swiper
                    style={{ height: 470 }}
                    dotStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', width: 10, height: 10, borderRadius: 5 }}
                    activeDotStyle={{ backgroundColor: '#000', width: 10, height: 10, borderRadius: 5 }}
                    paginationStyle={{ bottom: 10 }}
                  >
                    {post.imageUrls.map((imageUrl, index) => (
                      <View key={index}>
                        <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%', resizeMode: 'contain', backgroundColor: '#E5F1FF' }} />
                      </View>
                    ))}
                  </Swiper>
                )}
              </View>
            ))}
          </View>
        )}
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
            <Ionicons name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <View style={styles.createContainer}>
            <Text style={styles.modalTitle}>Create a Post</Text>
          </View>
          <View style={[styles.modalContent, {
            borderTopWidth: 1, borderColor: "#CDCDCD",
            marginTop: -7
          }]}>
            <Text style={styles.label}>What's on your mind?</Text>
            <TextInput
              placeholder=""
              value={postTitle}
              onChangeText={setPostTitle}
              style={styles.textInput}
            />
            <Text style={styles.label}>Share the complete story guys!</Text>

            <TextInput
              placeholder=""
              value={postDesc}
              onChangeText={setPostDesc}
              multiline={true}
              style={[styles.textInput, { height: 279 }]}
            />
            <View style={styles.uploadContainer}>
              <TouchableOpacity style={styles.uploadButton} onPress={openImagePicker}>
                <Image source={require('../assets/upload.png')} style={styles.uploadButtonIcon} />
              </TouchableOpacity>
              {/* <TouchableOpacity style={styles.uploadButton} onPress={() => { }}>
                <Image source={require('../assets/play.png')} style={styles.uploadButtonIcon} />

              </TouchableOpacity> */}
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
    backgroundColor: 'white',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: 'white',
    borderWidth: 2,
    borderBottomColor: '#3E96FF'
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    zIndex: 1,
  },
  label: {
    fontSize: 17,
    color: 'black',
    fontFamily: "DMSans-Medium",
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#98C7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createContainer: {
    backgroundColor: '#98C7FF',
    height: 89,
    marginTop: 30,
  },
  modalTitle: {
    fontSize: 24,
    marginTop: 30,
    textAlign: 'center',
    color: 'black',
    fontFamily: "DMSans-Bold",

  },
  notificationIcon: {
    position: 'absolute',
    top: 26,
    right: 19
  },
  chatIcon: {
    position: 'absolute',
    top: 27,
    right: 60
  },
  fab: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    backgroundColor: 'black',
    width: 60,
    height: 60,
    zIndex: 1000,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#3E96FF'
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
    backgroundColor: '#98C7FF',
    width: '100%'
  },

  modalBody: {
    padding: 20,
  },
  textInput: {
    borderWidth: 0.167,
    borderRadius: 9,
    borderColor: 'rgba(0,0,0,0.2)',
    backgroundColor: '#D2D2D2',
    padding: 10,
    marginTop: 5,
    marginBottom: 20,
  },
  uploadContainer: {
    flex: 0.3,
    flexDirection: 'row',
    width: 70,
    paddingLeft: 5,
    justifyContent: 'space-between'
  },
  uploadButton: {
    // marginLeft
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
    padding: 13,
    backgroundColor: '#E5F1FF'

  },
  post: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#98C7FF',
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'white'
  },
  avatar: {
    width: 37,
    height: 37,
    borderRadius: 40,
    marginRight: 10,
    backgroundColor: '#E4DDDD'
    // borderWidth: 1,
    // borderColor: 'black'
  },
  userName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    // marginBottom: 5,
  },
  postDate: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    backgroundColor: 'white',
  },
  nameAvatarContainer: {
    display: 'flex',
    flexDirection: 'row'
  },

  title: {
    marginTop: 14,
    fontSize: 21,
    paddingLeft: 2,
    paddingRight: 1,
    fontFamily: 'DMSans-Bold',
    // backgroundColor:'yellow',

  },
  description: {
    fontSize: 14,
    // backgroundColor:'red',
    paddingLeft: 2,
    paddingRight: 1,
    paddingTop: 0,
    marginTop: 8,
    marginBottom: 12,
    fontFamily: 'DMSans-Medium',
  },


});

export default ClubFeed;

