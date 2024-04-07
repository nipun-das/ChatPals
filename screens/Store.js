import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, StatusBar, Dimensions, Modal, YellowBox, LogBox } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Firestore, addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, database } from '../config/firebase';

LogBox.ignoreLogs(['VirtualizedLists should never be nested inside plain ScrollViews']);

const windowWidth = Dimensions.get('window').width;
const Store = ({ navigation }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [userDetails, setUserDetails] = useState(null);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const [userRole, setUserRole] = useState(0);


    const handleConfirmOrder = () => {
        setConfirmModalVisible(true);
    };

    const handlePlaceOrder = async () => {
        try {
            console.log("order yes clicked")
            const orderPoints = selectedItem.itemPoints * quantity;

            const updatedPoints = userPoints - orderPoints;
            setUserPoints(updatedPoints);
            console.log("points updated : ", updatedPoints)

            const currentUser = auth.currentUser;

            const orderData = {
                itemId: selectedItem.itemId,
                uid: currentUser.uid,
                quantity: quantity,
                status: "pending",
                placedTime: new Date().toISOString()
            };

            try {
                const ordersCollectionRef = collection(database, 'order');
                const orderDocRef = await addDoc(ordersCollectionRef, orderData);

                const orderId = orderDocRef.id;

                await updateDoc(doc(database, 'order', orderId), {
                    orderId: orderId
                });

            } catch (error) {
                console.error('Error adding order:', error);
            }
            console.log("orders collection created")

            setModalVisible(false);
            setConfirmModalVisible(false);
        } catch (error) {
            console.error('Error placing order:', error);
        }

    };

    const handleCancelOrder = () => {
        // setModalVisible(false);
        setConfirmModalVisible(false);
    };
    const bannerImages = [
        require('../assets/banner-1.png'),
        require('../assets/banner-3.png'),
        require('../assets/banner-2.png'),
    ];
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const currentUser = auth.currentUser;
                const userQuerySnapshot = await getDocs(query(collection(database, 'users'), where('uid', '==', currentUser.uid)));
                const userData = userQuerySnapshot.docs.map(doc => doc.data())[0];
                setUserDetails(userData);
                setUserPoints(userData.points);
                setUserRole(userData.role);


                // Add listener to user document to get real-time updates
                const unsubscribe = onSnapshot(doc(collection(database, 'users'), currentUser.uid), (doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        setUserDetails(userData);
                        setUserPoints(userData.points);
                    } else {
                        console.log("No such document!");
                    }
                });

                // Return unsubscribe function to clean up listener on component unmount
                return () => unsubscribe();

            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, []);


    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const imageIndex = Math.round(contentOffsetX / windowWidth);
        setCurrentImageIndex(imageIndex);
    };

    const renderPaginationDots = () => {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, position: 'absolute', left: 0, right: 0, top: 175 }}>
                {bannerImages.map((_, index) => (
                    <View
                        key={index}
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: currentImageIndex === index ? '#2982E1' : 'white',
                            marginHorizontal: 4,
                        }}
                    />
                ))}
            </View>
        );
    };

    const [columns, setColumns] = useState(2);
    const [storeItemsList, setStoreItemsList] = useState([]);

    useEffect(() => {
        const fetchStoreItems = async () => {
            try {
                const storeCollectionRef = collection(database, 'items');
                const storeSnapshot = await getDocs(storeCollectionRef);

                const items = [];
                storeSnapshot.forEach((doc) => {
                    const itemData = doc.data();
                    console.log(items)
                    items.push({ itemId: doc.id, ...itemData });
                });

                setStoreItemsList(items);
            } catch (error) {
                console.error('Error fetching store items:', error);
            }
        };
        fetchStoreItems();
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
        <View style={{ flex: 1, backgroundColor: '#E5F1FF' }}>

            <StatusBar backgroundColor="black" />



            <View style={{ backgroundColor: '#A6D3E3', height: 70, borderBottomWidth: 2, borderBottomColor: 'black' }}>
                <Text style={{ fontSize: 24, marginTop: 19, textAlign: 'center', color: 'black', fontFamily: "DMSans-Bold", }}>Store</Text>
            </View>

            {userRole === 'member' && (
                <>
                    <Image
                        source={require('../assets/points-box.png')}
                        style={{ width: 100, height: 100, position: 'absolute', right: -20, top: 40, zIndex: 6000 }}
                        resizeMode="contain" /><Text style={{ fontSize: 16, fontFamily: 'DMSans-Bold', position: 'absolute', right: 22, top: 80, zIndex: 6000 }}>
                        {userDetails ? userPoints : ''}
                    </Text>
                </>
            )}



            {/* Slidable banner */}
            <View style={{ backgroundColor: 'white', paddingBottom: 20, paddingTop: 30 }}>
                <FlatList
                    data={bannerImages}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Image source={item} style={{ width: windowWidth - 20, height: 155, marginTop: 10, borderTopRightRadius: 12, borderTopLeftRadius: 12, marginLeft: 10, marginRight: 10 }} resizeMode="cover" />

                    )}
                />
                {renderPaginationDots()}
            </View>

            {/* Store items */}

            <ScrollView style={{ flex: 1.5 }}>
                <View style={{ width: '100%', backgroundColor: 'white', paddingBottom: 9 }}>
                    <Text style={{
                        fontFamily: 'DMSans-Bold', fontSize: 19
                        , paddingLeft: 16, paddingTop: 4
                    }}>Explore products</Text>
                </View>
                {userRole === 'member' && (
                    <FlatList
                        data={storeItemsList}
                        style={{ marginLeft: 15, marginRight: 15 }}
                        key={`${columns}`}
                        keyExtractor={(item) => item.itemId}
                        numColumns={columns}
                        renderItem={({ item }) => (

                            <TouchableOpacity style={{ flex: 1, width: '50%', margin: 10, borderWidth: 1, padding: 10, borderColor: '#87CEF6', borderRadius: 10, backgroundColor: 'white' }} onPress={() => {
                                setSelectedItem(item);
                                setModalVisible(true);
                            }}>
                                <Image
                                    source={findAvatarSource(item.itemPhotoId)}
                                    style={{ width: '95%', height: 100 }}
                                    resizeMode="contain"
                                />

                                <Text style={{ marginTop: 10, fontSize: 15, textAlign: 'center', fontFamily: 'DMSans-Bold' }}>{item.itemName}</Text>

                                <View style={{ backgroundColor: '#E5F1FF', width: '60%', alignContent: 'center', alignSelf: 'center', height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 2 }}>
                                    <Text style={{ color: 'black', fontFamily: 'DMSans-Bold', fontSize: 12, textAlign: 'center' }}>{item.itemPoints} Points</Text>
                                </View>

                            </TouchableOpacity>
                        )}
                    />
                )}
                {userRole === 'owner' && (
                    <FlatList
                        data={storeItemsList}
                        style={{ marginLeft: 15, marginRight: 15 }}
                        key={`${columns}`}
                        keyExtractor={(item) => item.itemId}
                        numColumns={columns}
                        renderItem={({ item }) => (

                            <TouchableOpacity style={{ flex: 1, width: '50%', margin: 10, borderWidth: 1, padding: 10, borderColor: '#87CEF6', borderRadius: 10, backgroundColor: 'white' }}>
                                <Image
                                    source={findAvatarSource(item.itemPhotoId)}
                                    style={{ width: '95%', height: 100 }}
                                    resizeMode="contain"
                                />

                                <Text style={{ marginTop: 10, fontSize: 15, textAlign: 'center', fontFamily: 'DMSans-Bold' }}>{item.itemName}</Text>

                                <View style={{ backgroundColor: '#E5F1FF', width: '60%', alignContent: 'center', alignSelf: 'center', height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 2 }}>
                                    <Text style={{ color: 'black', fontFamily: 'DMSans-Bold', fontSize: 12, textAlign: 'center' }}>{item.itemPoints} Points</Text>
                                </View>

                            </TouchableOpacity>
                        )}
                    />
                )}

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    {selectedItem && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <View style={{ backgroundColor: 'white', padding: 0, borderRadius: 10, width: '80%', }}>

                                <View style={{
                                    backgroundColor: '#A6D3E3', height: 70, width: '100%', flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: 'black', borderTopLeftRadius: 10, borderTopRightRadius: 10,
                                }}>
                                    <TouchableOpacity style={{ marginLeft: 20, marginTop: 17, height: 40 }} onPress={() => setModalVisible(false)}>
                                        <Ionicons name="arrow-back" size={30} color="black" />
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 23, textAlign: 'center', width: '80%', justifyContent: 'center', alignContent: 'center', marginTop: 20, color: 'black', fontFamily: "DMSans-Bold", }}></Text>
                                </View>
                                <View style={{ padding: 20 }}>
                                    <Image
                                        source={findAvatarSource(selectedItem.itemPhotoId)}
                                        style={{ width: '100%', height: 200, backgroundColor: 'white' }}
                                        resizeMode="contain"
                                    />
                                    <Text style={{ justifyContent: 'center', textAlign: 'center', alignItems: 'center', fontSize: 22, marginBottom: 10, fontFamily: 'DMSans-Bold', marginTop: 10 }}>{selectedItem.itemName}</Text>
                                    {/* <Text style={{ fontSize: 16, marginTop: 5 }}></Text> */}

                                    <View style={{ backgroundColor: '#E5F1FF', width: '60%', alignContent: 'center', alignSelf: 'center', height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 2 }}>
                                        <Text style={{ color: 'black', fontFamily: 'DMSans-Bold', fontSize: 12, textAlign: 'center' }}>{selectedItem.itemPoints} Points</Text>
                                    </View>


                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'center' }}>
                                        <TouchableOpacity onPress={() => setQuantity(quantity > 1 ? quantity - 1 : 1)} style={{ borderWidth: 1, borderColor: '#ccc', padding: 5, borderRadius: 5, width: 30, backgroundColor: '#E5F1FF' }}>
                                            <Text style={{ fontSize: 18, fontFamily: 'DMSans-Bold', textAlign: 'center' }}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={{ fontSize: 18, marginHorizontal: 10, textAlign: 'center', fontFamily: 'DMSans-Bold', }}>{quantity}</Text>
                                        <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={{ borderWidth: 1, borderColor: '#ccc', padding: 5, borderRadius: 5, width: 30, backgroundColor: '#E5F1FF' }}>
                                            <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: 'DMSans-Bold' }}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        style={{ backgroundColor: userDetails.points < selectedItem.itemPoints * quantity ? '#ccc' : 'green', marginTop: 20, padding: 10, borderRadius: 5 }}
                                        disabled={userDetails.points < selectedItem.itemPoints * quantity}
                                    >
                                        <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'DMSans-Medium', fontSize: 18 }} onPress={() => handleConfirmOrder(true)}>Redeem</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={confirmModalVisible}
                    onRequestClose={() => setConfirmModalVisible(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View style={{ backgroundColor: 'white', padding: 0, borderRadius: 10, width: '80%', }}>

                            <View style={{
                                backgroundColor: '#A6D3E3', height: 70, width: '100%', flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: 'black', borderTopLeftRadius: 10, borderTopRightRadius: 10,
                            }}>
                                <TouchableOpacity style={{ marginLeft: 20, marginTop: 17, height: 40 }} onPress={() => setConfirmModalVisible(false)}>
                                    <Ionicons name="arrow-back" size={30} color="black" />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 23, textAlign: 'center', width: '80%', justifyContent: 'center', alignContent: 'center', marginTop: 20, color: 'black', fontFamily: "DMSans-Bold", }}>Place Order?</Text>
                            </View>



                            <Text style={{ fontSize: 25, marginBottom: 10, fontFamily: 'DMSans-Bold', textAlign: 'center', alignContent: 'center', alignItems: 'center', color: '#0E3291', alignSelf: 'center', marginTop: 30, backgroundColor: 'white', justifyContent: 'center' }}>{selectedItem?.itemName}</Text>

                            <Text style={{ fontSize: 20, marginBottom: 10, fontFamily: 'DMSans-Bold', textAlign: 'center', alignContent: 'center', alignItems: 'center', color: 'green', alignSelf: 'center', backgroundColor: 'white', justifyContent: 'center' }}>Quantity: {quantity} units</Text>

                            <View style={{ backgroundColor: '#E5F1FF', width: '40%', alignContent: 'center', alignSelf: 'center', height: 28, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 2 }}>
                                <Text style={{ color: 'black', fontFamily: 'DMSans-Bold', fontSize: 14, textAlign: 'center' }}>{selectedItem?.itemPoints * quantity} Points</Text>

                            </View>

                            <Text style={{ fontSize: 15, fontFamily: 'DMSans-Medium', padding: 20, paddingTop: 10, paddingBottom: 10, color: 'gray', textAlign: 'center' }}>Ensure that you are placing the order in the vicinity of the store</Text>

                            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', padding: 30, paddingTop: 10 }}>
                                <TouchableOpacity style={{ padding: 10, backgroundColor: '#0A750E', borderRadius: 10, width: 100, justifyContent: 'center' }} onPress={handlePlaceOrder}>

                                    <Text style={{ fontSize: 18, fontFamily: 'DMSans-Bold', color: 'white', textAlign: 'center' }}>Yes</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ padding: 10, backgroundColor: 'black', borderRadius: 10, width: 100, justifyContent: 'center' }} onPress={handleCancelOrder}>
                                    <Text style={{ fontSize: 18, fontFamily: 'DMSans-Bold', color: 'white', textAlign: 'center' }}>No</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>



            </ScrollView>

        </View>
    );
};

export default Store;
