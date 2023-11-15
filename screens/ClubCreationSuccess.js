import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'






function ClubCreationSuccess() {

    useEffect(() => {
        // Check if there is a currently authenticated user
        console.log("hi")
    }, []);
    return (

        <View>
            <Text style={styles.label}>Sucessfully created club</Text>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 50,
        flex: 1,
        backgroundColor:'yellow',
        padding: 16,
    },
    label: {
        fontSize: 50,
        color:'blue',
        fontWeight: 'bold',
        marginBottom: 8,
    },

});
export default ClubCreationSuccess