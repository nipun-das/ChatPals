import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { S3 } from 'aws-sdk';
import { database } from '../config/firebase';
import { useEffect } from 'react';
const bgImage = require("../assets/blue-pattern3.jpg");

export default function Signup({ navigation }) {


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [branch, setBranch] = useState('');
    const [regNo, setRegNo] = useState('');
    const [semester, setSemester] = useState('');
    const [interests, setInterests] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [userId, setUserId] = useState(null);

    const onHandleSignup = async () => {
        if (email !== '' && password !== '') {
            try {
                console.log('Signup success');
                console.log("Signup page : ", name, email, password, branch, regNo, semester, interests)
                console.log("Sign up pass to useravatar: ", name, branch, email, password, regNo, semester, interests)
                navigation.navigate("UserAvatar", {
                    name,
                    email,
                    password,
                    branch,
                    regNo,
                    semester,
                    interests,
                });
            } catch (error) {
                Alert.alert('Signup error', error.message);
            }
        }
    };
    const fetchUserId = async () => {
        try {
            const authUser = await auth.currentUser;
            if (authUser) {
                setUserId(authUser.uid);
            }
        } catch (error) {
            console.error('Error fetching user ID:', error);
        }
    };
    useEffect(() => {
        fetchUserId();
    }, []); 

    const options = {
        title: 'Select ID Card Photo',
        storageOptions: {
            skipBackup: true,
            path: 'images',
        },
    };


    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            console.log('ImagePicker result:', result);
            if (!result.canceled) {
                const selectedAsset = result.assets[0];
                setSelectedImage(selectedAsset.uri);
                console.log('Calling uplaod to s3');
                uploadToS3(selectedAsset.uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };




    const uploadToS3 = async (uri) => {
        console.log('Uploading to S3...');
        try {
            const s3 = new S3({
                accessKeyId: 'AKIA3QFOOXI6SQE7FYU4',
                secretAccessKey: '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',
                region: 'eu-north-1',
            });
            console.log('File uploaded successfully to S3.');
        } catch (error) {
            console.error('Error uploading image to S3:', error);
        }
        const bucketName = 'idcard-clubwave';
        const key = `user_${userId}_id_card.jpg`;

        try {
            console.log('Reading file...');
            const fileData = await RNFS.readFile(uri, 'base64');
            console.log('File read successfully.');

            const params = {
                Bucket: bucketName,
                Key: key,
                Body: Buffer.from(fileData, 'base64'),
                ACL: 'public-read',
                ContentType: 'image/jpeg',
            };

            await s3.upload(params).promise();

            onHandleSignup();
        } catch (error) {
            console.error('Error uploading image to S3:', error);
        }
    };

    return (
        <ScrollView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.curvedBg} />
                    <SafeAreaView style={styles.form}>
                        <View style={styles.header}>
                            <Image source={require('../assets/star.png')} style={styles.image} resizeMode="contain" />
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>Register</Text>
                            </View>

                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                textContentType="emailAddress"
                                value={email}
                                onChangeText={(text) => setEmail(text)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter password"
                                autoCapitalize="none"
                                autoCorrect={false}
                                secureTextEntry={true}
                                textContentType="password"
                                value={password}
                                onChangeText={(text) => setPassword(text)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                value={name}
                                onChangeText={(text) => setName(text)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Branch"
                                value={branch}
                                onChangeText={(text) => setBranch(text)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Registration Number"
                                value={regNo}
                                onChangeText={(text) => setRegNo(text)}
                            />
                            {/* <View>
                                <TouchableOpacity onPress={pickImage}>
                                    <Text>Select Image</Text>
                                </TouchableOpacity>

                                {selectedImage && (
                                    <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200 }} />
                                )}
                            </View> */}

                            <TextInput
                                style={styles.input}
                                placeholder="Semester"
                                value={semester}
                                onChangeText={(text) => setSemester(text)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Interests"
                                value={interests}
                                onChangeText={(text) => setInterests(text)}
                            />



                        </View>

                        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
                            <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 17, fontFamily: 'Inter-SemiBold' }}>Sign Up</Text>
                        </TouchableOpacity>
                        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                            <Text style={{ color: 'black', fontWeight: '600', fontSize: 14, fontFamily: 'Inter-Regular', opacity: 0.7 }}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={{ color: 'black', fontWeight: '600', fontSize: 14, fontFamily: 'Inter-SemiBold', textDecorationLine: 'underline' }}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                    <StatusBar barStyle="light-content" />
                </View>
            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Regular',
        color: "#005A89",
        alignSelf: "center",
        paddingBottom: 28,
        paddingTop: 70
    },
    input: {
        backgroundColor: "#F6F7FB",
        height: 58,
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
    bgImage: {
        width: "100%",
        height: 340,
        position: "absolute",
        top: 0,
        opacity: 0.85,
        resizeMode: 'cover',
    },
    curvedBg: {
        width: '100%',
        height: '75%',
        position: "absolute",
        bottom: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 60,
    },
    form: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 30,
    },
    button: {
        backgroundColor: '#005A89',
        height: 58,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    form: {
        flex: 1,
        justifyContent: 'flex-start',
        marginHorizontal: 30,
        fontFamily: 'Poppins-Regular'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 50
    },
    image: {
        width: 40, // Set your desired width
        height: 40, // Set your desired height
        position: 'absolute',
        top: 10,
        right: 0,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        // fontWeight: 'bold',
        color: 'black',
        // marginTop: 10,
        fontFamily: 'Poppins-Bold',
    },
    input: {
        backgroundColor: "white",
        height: 50,
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 6,
        padding: 12,
        borderWidth: 0.2,
        marginTop: 2,
        borderColor: '#5B5B5B',
        fontFamily: 'Poppins-Regular'
    },
    bgImage: {
        width: "100%",
        height: 340,
        position: "absolute",
        opacity: 0.85,
        top: 0,
        resizeMode: 'cover',
    },
    curvedBg: {
        width: '100%',
        height: '75%',
        position: "absolute",
        bottom: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 60,
    },
    eyeButton: {
        position: 'absolute', // Position the button absolutely
        top: 16, // Adjust the top position as needed
        right: 15, // Adjust the right position as needed
    },
    button: {
        backgroundColor: 'black',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
});