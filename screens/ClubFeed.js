import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, database } from '../config/firebase'; // Import your Firebase configuration

const ClubFeed = () => {
  const [posts, setPosts] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const postsSnapshot = await getDocs(collection(database, 'posts'));
      const postsData = postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts: ', error);
    }
  };

  const handleCreatePost = async () => {
    try {
      const currentUser = auth.currentUser; // Assuming auth is imported

      const userDoc = await getDoc(doc(database, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const { clubId } = userDoc.data();

        await addDoc(collection(database, 'posts'), {
          clubId: clubId,
          postSender: currentUser.uid,
          postDate: new Date(),
          postTitle: postTitle,
          postDesc: postDesc,
          imageUrl: imageUrl,
          videoUrl: videoUrl
        });

        // Clear input fields after creating the post
        setPostTitle('');
        setPostDesc('');
        setImageUrl('');
        setVideoUrl('');

        console.log('Post created successfully');
        toggleModal();
      }
    } catch (error) {
      console.error('Error creating post: ', error);
    }
  };


  const toggleModal = () => {
    setShowModal(!showModal);
  };


  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>ClubWave Feed</Text>
        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Floating Action Button for Creating Posts */}
      <TouchableOpacity style={styles.fab} onPress={toggleModal}>
        <Ionicons name="add" size={50} color="black" />
      </TouchableOpacity>

      {/* Modal for creating posts */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => toggleModal()}
      >
        <View style={styles.modalContainer}>
          <TextInput
            placeholder="Enter post title"
            value={postTitle}
            onChangeText={setPostTitle}

            style={styles.textInput}
          />
          <TextInput
            placeholder="Enter post description"
            value={postDesc}
            onChangeText={setPostDesc}
            multiline={true}
            style={[styles.textInput, { height: 100 }]}
          />
          <TouchableOpacity style={styles.uploadButton} onPress={() => { }}>
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={() => { }}>
            <Text style={styles.uploadButtonText}>Upload Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postButton} onPress={handleCreatePost}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  notificationIcon: {
    padding: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'red',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    elevation: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ClubFeed;

