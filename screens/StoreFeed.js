import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Modal, TextInput, StatusBar, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { auth, database } from '../config/firebase'; // Import your Firebase configuration
import { ScrollView } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';

const StoreFeed = ({ navigation }) => {

    const isFocused = useIsFocused();
    const [pendingOrders, setPendingOrders] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState('');
    const [modalVisibleCancel, setModalVisibleCancel] = useState('')


    const fetchPendingOrders = async () => {
        try {
            const ordersCollectionRef = collection(database, 'order');
            const ordersQuery = query(ordersCollectionRef, where('status', '==', 'pending'));
            const ordersSnapshot = await getDocs(ordersQuery);

            const pendingOrdersArray = [];
            for (const orderDoc of ordersSnapshot.docs) {
                const orderData = orderDoc.data();
                console.log("Order Doc Snapshot:", orderDoc.data());

                const itemDoc = await getDoc(doc(database, 'items', orderData.itemId));
                const itemData = itemDoc.data();

                const userDoc = await getDoc(doc(database, 'users', orderData.uid));
                const userData = userDoc.data();

                const combinedData = {
                    ...orderData,
                    itemName: itemData.itemName,
                    itemPhotoId: itemData.itemPhotoId,
                    userName: userData.name,
                    itemPoints: itemData.itemPoints * orderData.quantity,
                };
                console.log(combinedData)
                pendingOrdersArray.push(combinedData);
            }

            setPendingOrders(pendingOrdersArray);
            console.log("Pending Orders:", pendingOrdersArray);
        } catch (error) {
            console.error('Error fetching pending orders:', error);
        }
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



    const handleSignOut = async () => {
        try {
            await auth.signOut();
            console.log("Logged out")
            navigation.navigate('Login')
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const acceptOrder = async () => {
        try {
            // Retrieve user's current points from the database
            const userDoc = await doc(database, 'users', selectedOrder.uid);
            const userData = (await getDoc(userDoc)).data();
            let updatedPoints = userData.points;
            console.log(updatedPoints)

            // Calculate the points to be deducted based on the item's points and the order quantity
            console.log("selected order points-", selectedOrder.itemPoints)
            console.log("selected order qty-", selectedOrder.quantity)

            const pointsToDeduct = selectedOrder.itemPoints;
            console.log("id of person : ", selectedOrder.uid)
            // Update the user's points by deducting the calculated points
            updatedPoints -= pointsToDeduct;
            console.log("points to update : ", updatedPoints)

            await updateDoc(userDoc, { points: updatedPoints });

            // Update the order status to 'done'
            const orderDoc = await doc(database, 'order', selectedOrder.orderId);
            await updateDoc(orderDoc, { status: 'done' });

            // Close the modal
            setModalVisible(false);
        } catch (error) {
            console.error('Error accepting order:', error);
        }
    }
    const cancelOrder = async () => {
        const orderDoc = await doc(database, 'order', selectedOrder.orderId);
        await updateDoc(orderDoc, { status: 'cancelled' });
        setModalVisibleCancel(false);

    }
    const findAvatarSource = (avatarId) => {
        const avatars = [
            { id: 1, source: require('../assets/pinpoint.jpg') },
            { id: 2, source: require('../assets/record.jpg') },
            { id: 4, source: require('../assets/a4sheet.png') },
            { id: 3, source: require('../assets/classmate.jpg') },
        ];

        const avatar = avatars.find((avatar) => avatar.id === avatarId);
        return "../assets/avatar" + avatar + ".png" ? avatar.source : null;
    };

    const handleNavTrack = () => {
        navigation.navigate("TrackPreviousOrder")
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="white" />
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.miniLogo} onPress={fetchPendingOrders} >
                    <Image source={require('../assets/store-logo.png')} style={styles.miniLogo} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.chatIcon} onPress={handleNavTrack} >
                    <Ionicons name="md-time-outline" size={30} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.notificationIcon} onPress={handleSignOut}>
                    <Ionicons name="exit-outline" size={30} color="black" />
                </TouchableOpacity>
            </View>
            <ScrollView style={{ backgroundColor: '#E5F1FF' }}>
                {pendingOrders.map((order, index) => (
                    <View key={index} style={{ margin: 10, borderRadius: 10, backgroundColor: 'white', elevation: 4, shadowColor: 'rgba(0,0,0,0.2)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, borderColor: '#87CEF6', borderWidth: 1 }}>
                        <View style={{ flexDirection: 'row', padding: 15 }}>
                            <Image
                                source={findAvatarSource(order.itemPhotoId)}
                                style={{ width: 100, height: 100, borderRadius: 5, borderWidth: 1, borderColor: 'black', backgroundColor: 'red', resizeMode: 'contain' }}
                            />
                            <View style={{ padding: 10, flex: 1, backgroundColor: 'white', paddingRight: 0 }}>
                                <Text style={{ width: '100%', paddingLeft: 20, marginBottom: 7, paddingRight: 20, backgroundColor: 'white', fontSize: 22, zIndex: 6000, padding: 0, color: 'black', borderRadius: 5, fontFamily: 'DMSans-Medium', textAlign: 'center' }}>
                                    {order.itemName}
                                </Text>
                                <Text style={{ width: '100%', fontSize: 16, marginBottom: 5, fontFamily: 'DMSans-Medium', color: '#005979', textAlign: 'center' }}>
                                    Quantity: {order.quantity}
                                </Text>

                                <View style={{ backgroundColor: '#E5F1FF', width: 100, alignContent: 'center', alignSelf: 'center', height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 2 }}>
                                    <Text style={{ color: 'black', fontFamily: 'DMSans-Bold', fontSize: 12, textAlign: 'center' }}> Points: {order.itemPoints}</Text>
                                </View>

                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 }}>
                            <View>
                                <Text style={{ fontSize: 14, fontFamily: 'DMSans-Medium' }}>Ordered by :</Text>
                                <Text style={{ fontSize: 16, fontFamily: 'DMSans-Medium', color: '#A2003F' }}>{order.userName}</Text>
                            </View>

                            <TouchableOpacity onPress={() => { setSelectedOrder(order); setModalVisible(true); }} style={{ marginLeft: 20 }}>
                                <Image
                                    source={require('../assets/accept.png')} image
                                    style={{ width: 40, height: 40 }}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { setSelectedOrder(order); setModalVisibleCancel(true); }} style={{ marginRight: 30 }}>
                                <Image
                                    source={require('../assets/cancel.png')} // Replace './cancel.png' with the actual path to your cancel.png image
                                    style={{ width: 40, height: 40 }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 0, borderRadius: 10, margin: 50 }}>
                        <View style={{
                            backgroundColor: '#A6D3E3', height: 70, width: '100%', flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: 'black', borderTopLeftRadius: 10, borderTopRightRadius: 10,
                        }}>
                            <TouchableOpacity style={{ marginLeft: 20, marginTop: 17, height: 40 }} onPress={() => setModalVisible(false)}>
                                <Ionicons name="arrow-back" size={30} color="black" />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 23, textAlign: 'center', width: '80%', justifyContent: 'center', alignContent: 'center', marginTop: 20, color: 'black', fontFamily: "DMSans-Bold", }}></Text>
                        </View>
                        <Text style={{ fontSize: 19, fontFamily: 'DMSans-Medium', padding: 20, paddingTop: 10, paddingBottom: 10, color: 'black', textAlign: 'center' }}>Accept the order?</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 30, paddingRight: 30, paddingBottom: 30 }}>

                            <TouchableOpacity onPress={acceptOrder} style={{ backgroundColor: 'green', padding: 10, borderRadius: 5 }}>
                                <Text style={{ color: 'white', fontFamily: 'DMSans-Medium', fontSize: 16 }}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ backgroundColor: 'red', padding: 10, borderRadius: 5 }}>
                                <Text style={{ color: 'white', fontFamily: 'DMSans-Medium', fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Cancell orderr */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisibleCancel}
                onRequestClose={() => {
                    setModalVisibleCancel(!modalVisibleCancel);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 0, borderRadius: 10, margin: 50 }}>
                        <View style={{
                            backgroundColor: '#A6D3E3', height: 70, width: '100%', flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: 'black', borderTopLeftRadius: 10, borderTopRightRadius: 10,
                        }}>
                            <TouchableOpacity style={{ marginLeft: 20, marginTop: 17, height: 40 }} onPress={() => setModalVisibleCancel(false)}>
                                <Ionicons name="arrow-back" size={30} color="black" />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 23, textAlign: 'center', width: '80%', justifyContent: 'center', alignContent: 'center', marginTop: 20, color: 'black', fontFamily: "DMSans-Bold", }}></Text>
                        </View>
                        <Text style={{ fontSize: 19, fontFamily: 'DMSans-Medium', padding: 20, paddingTop: 10, paddingBottom: 10, color: 'black', textAlign: 'center' }}>Cancel the order?</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, paddingLeft: 50, paddingRight: 50, paddingBottom: 30 }}>
                            <TouchableOpacity onPress={cancelOrder} style={{ backgroundColor: 'green', padding: 10, borderRadius: 5 }}>
                                <Text style={{ color: 'white', fontFamily: 'DMSans-Medium', fontSize: 16 }}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisibleCancel(false)} style={{ backgroundColor: 'red', padding: 10, borderRadius: 5 }}>
                                <Text style={{ color: 'white', fontFamily: 'DMSans-Medium', fontSize: 16 }}>No</Text>
                            </TouchableOpacity>
                        </View>
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
        paddingTop: 10,
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
        fontFamily: 'DMSans-Medium',
    },


});

export default StoreFeed;

