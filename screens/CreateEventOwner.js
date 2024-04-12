import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TouchableHighlight,
    Image,
    StatusBar,
    Alert
} from 'react-native';
import { Gif } from 'react-native-gif';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth, database } from '../config/firebase';
import { addDoc, collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

const CreateEventOwner = ({ route, navigation }) => {
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedHour, setSelectedHour] = useState('');
    const [selectedMinute, setSelectedMinute] = useState('');
    const [selectedAmPm, setSelectedAmPm] = useState('');
    const [isDayModalVisible, setDayModalVisible] = useState(false);
    const [isMonthModalVisible, setMonthModalVisible] = useState(false);
    const [isYearModalVisible, setYearModalVisible] = useState(false);
    const [isHourModalVisible, setHourModalVisible] = useState(false);
    const [isMinuteModalVisible, setMinuteModalVisible] = useState(false);
    const [isAmPmModalVisible, setAmPmModalVisible] = useState(false);
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [isDateModalVisible, setDateModalVisible] = useState(false);


    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const amPmOptions = ['AM', 'PM'];

    const openDayModal = () => setDayModalVisible(true);
    const closeDayModal = () => setDayModalVisible(false);
    const openMonthModal = () => setMonthModalVisible(true);
    const closeMonthModal = () => setMonthModalVisible(false);
    const openYearModal = () => setYearModalVisible(true);
    const closeYearModal = () => setYearModalVisible(false);
    const openHourModal = () => setHourModalVisible(true);
    const closeHourModal = () => setHourModalVisible(false);
    const openMinuteModal = () => setMinuteModalVisible(true);
    const closeMinuteModal = () => setMinuteModalVisible(false);
    const openAmPmModal = () => setAmPmModalVisible(true);
    const closeAmPmModal = () => setAmPmModalVisible(false);

    useEffect(() => {
        const handleDateSelection = () => {
            if (!selectedDay || !selectedMonth || !selectedYear) {
                Alert.alert('Error', 'Please select a complete date');
                return;
            }

            const currentDate = new Date();
            const selectedDate = new Date(selectedYear, months.indexOf(selectedMonth), selectedDay);

            if (selectedDate < currentDate) {
                Alert.alert('Error', 'Please select a date after the current date');
                return;
            }
        };

        if (selectedDay && selectedMonth && selectedYear) {
            handleDateSelection();
        }
    }, [selectedDay, selectedMonth, selectedYear]);


    const handleDaySelection = (day) => {
        setSelectedDay(day);
        closeDayModal();
    };

    const handleMonthSelection = (month) => {
        setSelectedMonth(month);
        closeMonthModal();
    };

    const handleYearSelection = (year) => {
        setSelectedYear(year);
        closeYearModal();
    };

    const handleHourSelection = (hour) => {
        setSelectedHour(hour);
        closeHourModal();
    };

    const handleMinuteSelection = (minute) => {
        setSelectedMinute(minute);
        closeMinuteModal();
    };

    const handleAmPmSelection = (ampm) => {
        setSelectedAmPm(ampm);
        closeAmPmModal();
    };

    const handleCreateEvent = async () => {
        console.log("event create");

        try {
            const { clubId } = route.params;
            const currentUser = auth.currentUser;

            const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
            const formattedTime = `${selectedHour}:${selectedMinute} ${selectedAmPm}`;

            const eventRef = await addDoc(collection(database, `clubs/${clubId}/events`), {
                event_name: eventName,
                club_id: clubId,
                event_status: 'open',
                event_reg_status: 'open',
                event_description: eventDescription,
                event_date: formattedDate,
                event_time: formattedTime,
                event_location: eventLocation,
                event_registered_members: [],
                event_price: 'free',
                event_reg_count: 0,
                created_by: currentUser.uid,
                created_at: new Date(),
            });

            const eventId = eventRef.id;

            await updateDoc(doc(database, `clubs/${clubId}/events`, eventId), {
                event_id: eventId
            });

            const eventNotificationMessage = `New Event: ${eventName} is created!`;
            const clubDoc = await getDoc(doc(database, `clubs/${clubId}`));
            const clubData = clubDoc.data();
            const members = clubData.members || []; 
            console.log("------------------", members)
            const notificationPromises = [];
            for (const memberId of members) {
                console.log("member ->", memberId)
                const notificationRef = collection(database, `users/${memberId}/notifications`);
                const notificationPromise = addDoc(notificationRef, {
                    message: eventNotificationMessage,
                    eventId: eventId,
                    type:'eventCreate',
                    timestamp: new Date()
                });
                notificationPromises.push(notificationPromise);
            }

            const eventMessage = `Event Created: ${eventName}`;
            await addDoc(collection(database, `chatrooms/${clubId}/messages`), {
                senderId: currentUser.uid,
                text: eventMessage,
                timestamp: new Date(),
                messageType: 'eventMessage',
                eventId: eventRef.id,
                eventName: eventName,
                clubId: clubId,
                eventDate: formattedDate,
                eventTime: formattedTime,
                eventLocation: eventLocation,
            });

            console.log("Event id added : ", eventId)
            setSuccessModalVisible(true);
            console.log('Event created with ID: ', eventRef.id);

        } catch (error) {
            console.error('Error creating event: ', error);
        }

    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="black" />

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>

            <View style={styles.createContainer}>
                <Text style={styles.title}>Create Event</Text>
            </View>

            <View style={{ backgroundColor: 'white', paddingHorizontal: 25, paddingTop: 15, borderTopColor: 'black', borderTopWidth: 2 }}>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Event Name</Text>
                    <TextInput
                        style={styles.input}
                        // placeholder="Enter name of the event"
                        value={eventName}
                        onChangeText={(text) => setEventName(text)}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        // placeholder="Write about the event"
                        value={eventDescription}
                        onChangeText={(text) => setEventDescription(text)}
                        multiline
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Date</Text>
                    <View style={styles.datePickerContainer}>
                        <TouchableOpacity style={styles.datePicker} onPress={openDayModal}>

                            <Text style={{
                                fontFamily: 'DMSans-Medium'
                            }}>{selectedDay || 'Day'}</Text>
                        </TouchableOpacity>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={isDayModalVisible}
                            onRequestClose={closeDayModal}
                        >
                            <View style={styles.modalContainer}>
                                {days.map((day) => {
                                    return (
                                        <TouchableHighlight
                                            key={day}
                                            style={styles.modalOption}
                                            onPress={() => handleDaySelection(day)}
                                        >
                                            <Text style={styles.days}>{day}</Text>
                                        </TouchableHighlight>
                                    );
                                })}
                            </View>
                        </Modal>

                        <TouchableOpacity style={styles.datePicker} onPress={openMonthModal}>
                            <Text style={{
                                fontFamily: 'DMSans-Medium'
                            }}>{selectedMonth || 'Month'}</Text>
                        </TouchableOpacity>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={isMonthModalVisible}
                            onRequestClose={closeMonthModal}
                        >
                            <View style={styles.modalContainer}>
                                {months.map((month) => (
                                    <TouchableHighlight
                                        key={month}
                                        style={styles.modalOption}
                                        onPress={() => handleMonthSelection(month)}
                                    >
                                        <Text style={styles.months}>{month}</Text>
                                    </TouchableHighlight>
                                ))}
                            </View>
                        </Modal>

                        <TouchableOpacity style={styles.datePicker} onPress={openYearModal}>
                            <Text style={{
                                fontFamily: 'DMSans-Medium'
                            }}>{selectedYear || 'Year'}</Text>
                        </TouchableOpacity>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={isYearModalVisible}
                            onRequestClose={closeYearModal}
                        >
                            <View style={styles.modalContainer}>
                                {years.map((year) => (
                                    <TouchableHighlight
                                        key={year}
                                        style={styles.modalOption}
                                        onPress={() => handleYearSelection(year)}
                                    >
                                        <Text style={styles.years}>{year}</Text>
                                    </TouchableHighlight>
                                ))}
                            </View>
                        </Modal>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={isDateModalVisible}
                            onRequestClose={() => setDateModalVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <Text style={styles.errorMessage}>Please select a date after the current date.</Text>
                                <TouchableHighlight
                                    style={styles.okButton}
                                    onPress={() => setDateModalVisible(false)}
                                >
                                    <Text style={styles.okButtonText}>OK</Text>
                                </TouchableHighlight>
                            </View>
                        </Modal>
                    </View>
                </View>


                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Time</Text>
                    <View style={styles.timePickerContainer}>
                        <TouchableOpacity style={styles.timePicker} onPress={openHourModal}>
                            <Text style={{
                                fontFamily: 'DMSans-Medium'
                            }}>{selectedHour || 'Hour'}</Text>
                        </TouchableOpacity>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={isHourModalVisible}
                            onRequestClose={closeHourModal}
                        >
                            <View style={styles.modalContainer}>
                                {hours.map((hour) => (
                                    <TouchableHighlight
                                        key={hour}
                                        style={styles.modalOption}
                                        onPress={() => handleHourSelection(hour)}
                                    >
                                        <Text style={styles.hours}>{hour}</Text>
                                    </TouchableHighlight>
                                ))}
                            </View>
                        </Modal>



                        <TouchableOpacity style={styles.timePicker} onPress={openMinuteModal}>
                            <Text style={{
                                fontFamily: 'DMSans-Medium'
                            }}>{selectedMinute || 'Minute'}</Text>
                        </TouchableOpacity>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={isMinuteModalVisible}
                            onRequestClose={closeMinuteModal}
                        >
                            <View style={styles.modalContainer}>
                                {minutes.map((minute) => (
                                    <TouchableHighlight
                                        key={minute}
                                        style={styles.modalOptionMinutes}
                                        onPress={() => handleMinuteSelection(minute)}
                                    >
                                        <Text style={styles.minutes}>{minute}</Text>
                                    </TouchableHighlight>
                                ))}
                            </View>
                        </Modal>

                        <TouchableOpacity style={styles.timePicker} onPress={openAmPmModal}>
                            <Text style={{
                                fontFamily: 'DMSans-Medium'
                            }}>{selectedAmPm || 'AM / PM'}</Text>
                        </TouchableOpacity>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={isAmPmModalVisible}
                            onRequestClose={closeAmPmModal}
                        >
                            <View style={styles.modalContainer}>
                                {amPmOptions.map((ampm) => (
                                    <TouchableHighlight
                                        key={ampm}
                                        style={styles.modalOption}
                                        onPress={() => handleAmPmSelection(ampm)}
                                    >
                                        <Text style={styles.ampm}>{ampm}</Text>
                                    </TouchableHighlight>
                                ))}
                            </View>
                        </Modal>
                    </View>
                </View>


                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        // placeholder="Enter event location"
                        value={eventLocation}
                        onChangeText={(text) => setEventLocation(text)}
                    />
                </View>

                <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
                    <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
            </View>
            <Modal
                visible={isSuccessModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSuccessModalVisible(false)}
            >
                <View style={styles.successInner}>
                    <View style={styles.successModalContainer}>
                        <Image style={styles.gifImage} source={require('../assets/confetti.gif')} />
                        <Text style={styles.successModalText}>Event Creation{'\n'}       Success</Text>
                        <TouchableOpacity
                            style={styles.okButton}
                            onPress={() => setSuccessModalVisible(false)}
                        >
                            <Text style={styles.okButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // backgroundColor: '#FFB6C1',
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 20,
        zIndex: 1,
    },

    createContainer: {
        backgroundColor: '#FFB6C1',
        height: 70,
        // marginTop: 30,
    },
    title: {
        fontSize: 24,
        marginTop: 19,
        textAlign: 'center',
        color: 'black',
        fontFamily: "DMSans-Bold",
        // backgroundColor:'red'

    },
    inputContainer: {
        marginBottom: 10,

    },
    label: {
        fontSize: 17,
        color: 'black',
        fontFamily: "DMSans-Medium",
        marginBottom: 5

    },
    input: {
        borderWidth: 0.167,
        borderRadius: 9,
        borderColor: 'rgba(0,0,0,0.2)',
        backgroundColor: '#D2D2D2',
        padding: 10,
        // marginTop: 5,
        fontSize: 14,
        marginBottom: 20,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',

    },
    datePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',


    },
    datePicker: {
        flex: 1,
        height: 40,
        // borderColor: 'black',
        // borderWidth: 1,
        marginBottom: 15,
        padding: 10,
        marginRight: 10,
        backgroundColor: "#D2D2D2",
        height: 50,
        marginBottom: 20,
        fontSize: 18,
        borderRadius: 9,
        padding: 12,
        // borderWidth: 0.2,
        marginTop: 2,
        fontFamily: 'DMSans-Regular'
    },
    timePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timePicker: {
        flex: 1,
        height: 40,
        // borderColor: 'black',
        // borderColor: 'white',

        // borderWidth: 1,
        marginBottom: 15,
        padding: 10,
        marginRight: 10,
        backgroundColor: "#D2D2D2",
        height: 50,
        marginBottom: 20,
        fontSize: 18,
        borderRadius: 9,
        padding: 12,
        // borderWidth: 0.2,
        marginTop: 2,
        fontFamily: 'DMSans-Regular'

    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        fontSize: 25,
        alignItems: 'center',
        backgroundColor: 'rgba(50, 50, 70, 0.8)',
    },
    modalOption: {
        borderBottomWidth: 2,
        borderColor: 'white',
        width: '100%',
        fontSize: 25,
        alignItems: 'center',
        height: 24,
        justifyContent: 'center'

    },
    days: {
        color: 'white',
        fontFamily: 'DMSans-Regular',
        fontSize: 23,
        marginTop: -4
    },
    months: {
        color: 'white',
        fontSize: 23,
        marginBottom: 0,
        height: 30,
        fontFamily: 'DMSans-Regular'

    },
    years: {
        color: 'white',
        fontSize: 23,
        marginBottom: 0,
        height: 30,
        fontFamily: 'DMSans-Regular'
    },
    hours: {
        color: 'white',
        fontSize: 23,
        marginBottom: 3,
        height: 30,
        fontFamily: 'DMSans-Regular'

    },
    modalOptionMinutes: {
        // padding: 20,
        borderBottomWidth: 0.3,
        borderBottomColor: '#ffffff',
        width: '100%',
        fontSize: 25,
        alignItems: 'center',
        height: 12.4,
        justifyContent: 'center'

    },
    minutes: {
        color: 'white',
        fontSize: 15,
        height: 20,
        fontFamily: 'DMSans-Medium'



    },
    ampm: {
        color: 'white',
        fontSize: 23,
        marginBottom: 5,
        height: 30,
        fontFamily: 'DMSans-Medium'

    },
    createButton: {
        backgroundColor: 'black',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    createButtonText: {
        color: 'white',
        fontSize: 17,
        fontFamily: 'Inter-SemiBold'
    },
    successModalContainer: {
        height: 250,
        backgroundColor: 'gray',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 2,
        padding: 10
    },
    successInner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)'
    },
    gifImage: {
        width: 100,
        height: 100,
    },
    successModalText: {
        marginTop: 10,
        fontSize: 18,
        fontFamily: 'Poppins-Medium',
        marginBottom: 10,
        marginLeft: 50,
        marginRight: 50
    },
    okButton: {
        backgroundColor: '#005D6C',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignSelf: 'center',
        marginBottom: 1
    },
    okButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: "Poppins-Medium",
    }
});

export default CreateEventOwner;