import React, { useState } from "react";

import { StyleSheet, Text, View, Button, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";

import { signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';
import { auth } from "../config/firebase";
// import { useFonts } from '@expo-google-fonts/poppins';



const bgImage = require("../assets/blue-pattern3.jpg");

export default function Login({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onHandleLogin = () => {
        if (email !== "" && password !== "") {
            signInWithEmailAndPassword(auth, email, password)
                .then(() => console.log("Login success"))
                .catch((err) => Alert.alert("Login error", err.message));
        }
    }

    const [showPassword, setShowPassword] = useState(false);

    // const [fontsLoaded] = useFonts({
    //     Poppins: require('@expo-google-fonts/poppins'),
    //   });

    //   if (!fontsLoaded) {
    //     return null;
    //   }


    return (
        <View style={styles.container}>
            {/* <Image source={bgImage} style={styles.bgImage} /> */}
            <View style={styles.curvedBg} />
            <SafeAreaView style={styles.form}>
                <View style={styles.header}>
                    <Image source={require('../assets/star.png')} style={styles.image} resizeMode="contain" />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Log in</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>Email Address</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>Password</Text>
                    </View>
                    <View style={styles.passwordInputContainer}>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry={!showPassword}
                            textContentType="password"
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? 'eye' : 'eye-off'}
                                size={24}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={onHandleLogin}>
                    <Text style={{ color: '#fff', fontSize: 17, fontFamily: 'Inter-SemiBold' }}> Log in</Text>
                </TouchableOpacity>
                <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'black', fontSize: 14, marginTop: 205, fontFamily: 'Inter-Regular', opacity: 0.7 }}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                        <Text style={{ color: 'black', fontSize: 14, marginTop: 205, fontFamily: 'Inter-SemiBold' }}> Sign up</Text>
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
        marginTop: 100,
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