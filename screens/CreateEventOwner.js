import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TouchableHighlight,
    Image,
    StatusBar
} from 'react-native';
import { Gif } from 'react-native-gif';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth, database } from '../config/firebase';
import { addDoc, collection } from 'firebase/firestore';

const CreateEventOwner = ({ route,navigation  }) => {
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
        console.log("adasdasd");

        try {
            const { clubId } = route.params;
            const currentUser = auth.currentUser;

            const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
            const formattedTime = `${selectedHour}:${selectedMinute} ${selectedAmPm}`;

            const eventRef = await addDoc(collection(database, `clubs/${clubId}/events`), {
                event_name: eventName,
                club_id: clubId,
                event_status: 'active',
                event_description: eventDescription,
                event_date: formattedDate,
                event_time: formattedTime,
                event_location: eventLocation,
                registered_members: [],
                created_by: currentUser.uid,
                created_at: new Date(),
            });

            // Add a message to the chatroom with a reference to the event
            const eventMessage = `Event Created: ${eventName}`;
            await addDoc(collection(database, `chatrooms/${clubId}/messages`), {
                senderId: currentUser.uid,
                text: eventMessage,
                timestamp: new Date(),
                messageType: 'eventMessage',
                eventId: eventRef.id,
                eventName: eventName,
                eventDate: formattedDate,
                eventTime: formattedTime,
                eventLocation: eventLocation,
            });



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
                <Image source={require('../assets/backIcon.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <View style={styles.createContainer}>
                <Text style={styles.title}>Create Event</Text>
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Event Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter name of the event"
                    value={eventName}
                    onChangeText={(text) => setEventName(text)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Event Description</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Write about the event"
                    value={eventDescription}
                    onChangeText={(text) => setEventDescription(text)}
                    multiline
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Date</Text>
                <View style={styles.datePickerContainer}>
                    <TouchableOpacity style={styles.datePicker} onPress={openDayModal}>
                        <Text>{selectedDay || 'Day'}</Text>
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
                        <Text>{selectedMonth || 'Month'}</Text>
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
                        <Text>{selectedYear || 'Year'}</Text>
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
                </View>
            </View>


            <View style={styles.inputContainer}>
                <Text style={styles.label}>Time</Text>
                <View style={styles.timePickerContainer}>
                    <TouchableOpacity style={styles.timePicker} onPress={openHourModal}>
                        <Text>{selectedHour || 'Hour'}</Text>
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
                        <Text>{selectedMinute || 'Minute'}</Text>
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
                        <Text>{selectedAmPm || 'AM / PM'}</Text>
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
                    placeholder="Enter event location"
                    value={eventLocation}
                    onChangeText={(text) => setEventLocation(text)}
                />
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
                <Text style={styles.createButtonText}>Create Event</Text>
            </TouchableOpacity>

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
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        position: 'absolute',
        top: 64,
        left: 20,
        zIndex: 1,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    createContainer: {
        backgroundColor: 'black',
        // padding:50,
        // flex:1,
        marginLeft: -20,
        marginRight:-20,
        height:89,
        marginBottom: 30,
        borderBottomRightRadius:30,
        borderBottomLeftRadius:30,
    },
    title: {
        fontSize: 26,
        // fontWeight: 'bold',
        // marginBottom: -50,
        marginTop:20,
        textAlign: 'center',
        color: 'white',
        fontFamily: "Poppins-Bold",

    },
    inputContainer: {
        marginBottom: 10,

    },
    label: {
        fontSize: 15,
        // marginBottom: 5,
        color: 'black',
        fontFamily: "Poppins-Medium",

    },
    input: {
        backgroundColor: "white",
        height: 50,
        marginBottom: 8,
        fontSize: 16,
        borderRadius: 6,
        padding: 12,
        borderWidth: 0.2,
        // marginTop: 2,
        borderColor: 'blue',
        fontFamily: 'Poppins-Regular'
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
        borderColor: 'blue',
        borderWidth: 1,
        marginBottom: 15,
        padding: 10,
        marginRight: 10,

        backgroundColor: "white",
        height: 50,
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 6,
        padding: 12,
        borderWidth: 0.2,
        marginTop: 2,
        borderColor: 'blue',
        fontFamily: 'Poppins-Regular'


    },
    timePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timePicker: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        padding: 10,
        marginRight: 10,

        backgroundColor: "white",
        height: 50,
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 6,
        padding: 12,
        borderWidth: 0.2,
        marginTop: 2,
        borderColor: 'blue',
        fontFamily: 'Poppins-Regular'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        fontSize: 25,
        // color:'white',
        alignItems: 'center',
        backgroundColor: 'rgba(50, 50, 70, 0.8)',
    },
    modalOption: {
        // padding: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#ffffff',
        width: '100%',
        fontSize: 25,
        alignItems: 'center',
        height: 24,
        justifyContent: 'center'
        // color:'white',

    },
    days: {
        color: 'white',
        fontFamily: 'Poppins-Regular',
        fontSize: 20,
    },
    months: {
        color: 'white',
        fontSize: 23,
        marginBottom: 5,
        height: 30,
        fontFamily: 'Poppins-Regular'
    },
    years: {
        color: 'white',
        fontSize: 23,
        marginBottom: 5,
        height: 30,
        fontFamily: 'Poppins-Regular'
    },
    hours: {
        color: 'white',
        fontSize: 23,
        marginBottom: 3,
        height: 30,
        fontFamily: 'Poppins-Regular'
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
        // color:'white',

    },
    minutes: {
        color: 'white',
        fontSize: 15,
        // marginBottom: 5,
        height: 20,
        fontFamily: 'Poppins-Regular',

    },
    ampm: {
        color: 'white',
        fontSize: 23,
        marginBottom: 5,
        height: 30,
        fontFamily: 'Poppins-Regular'
    }
    ,
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
        // flex: 1,
        height: 250,
        backgroundColor: 'gray',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 2,
        padding: 10
        // backgroundColor:'white',

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
        // marginTop:20,
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