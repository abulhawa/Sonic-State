/**
 * Sonic State - Main App Entry
 * 30s Voice Snapshot Analyzer (Private, On-Device)
 */

import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import AppNavigator from '@/navigation/AppNavigator';
import Logger from '@/utils/Logger';

// Ignore specific warnings that are expected in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App: React.FC = () => {
  useEffect(() => {
    Logger.log('app_started');
  }, []);

  return <AppNavigator />;
};

export default App;
