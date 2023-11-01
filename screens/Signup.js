import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

import { database } from '../config/firebase';

const bgImage = require("../assets/blue-pattern3.jpg");

export default function Signup({ navigation }) {


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [branch, setBranch] = useState('');
    const [regNo, setRegNo] = useState('');
    const [semester, setSemester] = useState('');
    const [interests, setInterests] = useState('');

    // const onHandleSignup = () => {
    //     if (email !== '' && password !== '') {
    //         createUserWithEmailAndPassword(auth, email, password)
    //             .then(() => console.log('Signup success'))
    //             .catch((err) => Alert.alert("Login error", err.message));
    //     }
    // };


    const onHandleSignup = async () => {
        if (email !== '' && password !== '') {
            try {
                // Create the user account
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Access the newly created user
                const user = userCredential.user;

                // Create a new user document in Firestore with additional data
                const userDocRef = await addDoc(collection(database, 'users'), {
                    name,
                    branch,
                    regNo,
                    semester,
                    interests,
                    uid: user.uid, // Store the user's UID as well
                });

                console.log('Signup success');
                console.log("Signup page : ", name, branch, regNo, semester, interests, user.uid)
                console.log("Sign up pass to ClubSel: ", name, branch, regNo, semester, interests)
                navigation.navigate("ClubSel", {
                    name,
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



    return (
        <View style={styles.container}>
            <Image source={bgImage} style={styles.bgImage} />
            <View style={styles.curvedBg} />
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Sign Up</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    // autoFocus={true}
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

                <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}> Sign Up</Text>
                </TouchableOpacity>
                <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={{ color: '#005A89', fontWeight: '600', fontSize: 14 }}> Log In</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <StatusBar barStyle="light-content" />
        </View>
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
        fontFamily:'Poppins-Regular',
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
});