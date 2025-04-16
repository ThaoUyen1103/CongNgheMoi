import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Support for defaultProps will be removed',
]);


export default function App() {
  return <AppNavigator />;
}