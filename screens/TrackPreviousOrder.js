import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { database } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';


const TrackPreviousOrder = ({ navigation }) => {
    const [orderDetails, setOrderDetails] = useState([]);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                // Query the 'order' collection for orders with statuses 'done' and 'cancelled'
                const ordersQuery = query(collection(database, 'order'), where('status', 'in', ['done', 'cancelled']));
                const ordersSnapshot = await getDocs(ordersQuery);

                const orderDetailsArray = [];

                for (const orderDoc of ordersSnapshot.docs) {
                    const orderData = orderDoc.data();

                    const itemDoc = await getDoc(doc(database, 'items', orderData.itemId));
                    const itemData = itemDoc.data();

                    const userDoc = await getDoc(doc(database, 'users', orderData.uid));
                    const userData = userDoc.data();

                    const combinedData = {
                        ...orderData,
                        itemName: itemData.itemName,
                        itemPhotoId: itemData.itemPhotoId,
                        userName: userData.name,
                        itemPoints: itemData.itemPoints,

                    };

                    orderDetailsArray.push(combinedData);
                }

                setOrderDetails(orderDetailsArray);
            } catch (error) {
                console.error('Error fetching order details:', error);
            }
        };

        fetchOrderDetails();
    }, []);


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

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="black" />

            <TouchableOpacity style={{ position: 'absolute', top: 16, left: 20, zIndex: 1, }} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>

            <View style={{ backgroundColor: '#A6D3E3', height: 70, borderBottomWidth: 2, borderBottomColor: 'black' }}>
                <Text style={{ fontSize: 24, marginTop: 19, textAlign: 'center', color: 'black', fontFamily: "DMSans-Bold", }}>Order History </Text>
            </View>
            <ScrollView>
                {orderDetails.map((order, index) => (
                    <View key={index} style={{ margin: 10, marginBottom: 7, marginTop: 5, borderRadius: 10, backgroundColor: 'white', elevation: 4, shadowColor: 'rgba(0,0,0,0.2)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, borderColor: '#87CEF6', borderWidth: 1 }}>
                        <View style={{ flexDirection: 'row', padding: 15, backgroundColor: 'white', borderRadius: 10 }}>
                            <Image
                                source={findAvatarSource(order.itemPhotoId)}
                                style={{ width: 100, height: 100, borderRadius: 5, borderWidth: 1, borderColor: 'black', backgroundColor: 'white', resizeMode: 'contain' }}
                            />
                            <View style={{ padding: 10, flex: 1, backgroundColor: 'white', paddingRight: 0 }}>
                                <Text style={{ width: '100%', paddingLeft: 20, marginBottom: 7, paddingRight: 20, backgroundColor: 'white', fontSize: 22, zIndex: 6000, padding: 0, color: 'black', borderRadius: 5, fontFamily: 'DMSans-Medium', textAlign: 'center' }}>
                                    {order.itemName}
                                </Text>
                                <Text style={{ width: '100%', fontSize: 16, marginBottom: 5, fontFamily: 'DMSans-Medium', color: '#005979', textAlign: 'center' }}>
                                    Quantity: {order.quantity}
                                </Text>

                                <View style={{ backgroundColor: '#E5F1FF', width: 100, alignContent: 'center', alignSelf: 'center', height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 500, marginTop: 2 }}>
                                    <Text style={{ color: 'black', fontFamily: 'DMSans-Bold', fontSize: 12, textAlign: 'center' }}> Points: {order.itemPoints}</Text>
                                </View>

                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30, marginTop: -10, paddingBottom: 10, backgroundColor: 'white', borderRadius: 10, width: '93%' }}>
                            <View>
                                <Text style={{ fontSize: 14, fontFamily: 'DMSans-Medium' }}>Ordered by :</Text>
                                <Text style={{ fontSize: 16, fontFamily: 'DMSans-Medium', color: '#A2003F' }}>{order.userName}</Text>
                            </View>

                            {order.status === 'cancelled' && (
                                <View style={{ backgroundColor: '#B51515', width: 120, alignContent: 'center', alignSelf: 'center', height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 4, marginTop: 2 }}>
                                    <Text style={{ color: 'white', fontFamily: 'DMSans-Bold', fontSize: 12, textAlign: 'center' }}>Order Cancelled</Text>
                                </View>
                            )}
                            {order.status === 'done' && (
                                <View style={{ backgroundColor: 'green', width: 120, alignContent: 'center', alignSelf: 'center', height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 4, marginTop: 2 }}>
                                    <Text style={{ color: 'white', fontFamily: 'DMSans-Bold', fontSize: 12, textAlign: 'center' }}>Order Completed</Text>
                                </View>
                            )}
                        </View>


                    </View>

                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // padding: 20,
    },
    orderItem: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
});

export default TrackPreviousOrder;
