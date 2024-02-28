// HomeScreen.js

import React from 'react';
import { View, Text } from 'react-native';
import BottomNavigation from './BottomNavigator';

const HomeScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Club Feed Coming soon!</Text>

      <BottomNavigation style={{bottom:-685}}/>
    </View>
  );
};

export default HomeScreen;
