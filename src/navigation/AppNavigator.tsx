/**
 * App Navigator
 * React Navigation stack configuration
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '@/screens/HomeScreen';
import RecordingScreen from '@/screens/RecordingScreen';
import ProcessingScreen from '@/screens/ProcessingScreen';
import ResultsScreen from '@/screens/ResultsScreen';
import PrivacyScreen from '@/screens/PrivacyScreen';
import UpgradeScreen from '@/screens/UpgradeScreen';

import { AnalysisResult } from '@/analysis/types';

export type RootStackParamList = {
  Home: undefined;
  Recording: undefined;
  Processing: undefined;
  Results: { result: AnalysisResult };
  Privacy: undefined;
  Upgrade: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0A0A0F' },
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Recording" component={RecordingScreen} />
        <Stack.Screen name="Processing" component={ProcessingScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Upgrade" component={UpgradeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
