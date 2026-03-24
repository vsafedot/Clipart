import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import StyleSelectScreen from './src/screens/StyleSelectScreen';
import ProcessingScreen from './src/screens/ProcessingScreen';
import ResultScreen from './src/screens/ResultScreen';

export type RootStackParamList = {
  Home: undefined;
  StyleSelect: { imageBase64: string; imageUri: string };
  Processing: { imageBase64: string; style: string };
  Result: { imageUrl: string; style: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366F1',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
    notification: '#EF4444',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}
      >
        <Stack.Screen name="Home"        component={HomeScreen} />
        <Stack.Screen name="StyleSelect" component={StyleSelectScreen} />
        <Stack.Screen name="Processing"  component={ProcessingScreen} />
        <Stack.Screen name="Result"      component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
