/**
 * Home Screen
 * Entry point with CTA to start recording
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import PrivacyBadge from '@/components/PrivacyBadge';
import { useAudioPermissions } from '@/hooks/useAudioPermissions';
import Logger from '@/utils/Logger';

type RootStackParamList = {
  Home: undefined;
  Recording: undefined;
  Privacy: undefined;
  Upgrade: undefined;
};

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { hasPermission, requestPermission } = useAudioPermissions();

  const handleStartRecording = async () => {
    // Check/request permission
    const permissionGranted = hasPermission ?? await requestPermission();

    if (permissionGranted) {
      navigation.navigate('Recording');
    } else {
      // Permission denied - navigate anyway, RecordingScreen will handle it
      navigation.navigate('Recording');
    }
  };

  const handlePrivacyPress = () => {
    Logger.log('privacy_screen_viewed');
    navigation.navigate('Privacy');
  };

  const handleUpgradePress = () => {
    Logger.log('upgrade_screen_viewed');
    navigation.navigate('Upgrade');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sonic State</Text>
          <Text style={styles.subtitle}>30s Voice Snapshot</Text>
        </View>

        {/* Main CTA Area */}
        <View style={styles.ctaContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎙️</Text>
          </View>

          <Text style={styles.description}>
            A quick sound check for your voice state.{'\n'}
            Private and on-device.
          </Text>

          <TouchableOpacity
            style={styles.recordButton}
            onPress={handleStartRecording}
            activeOpacity={0.8}
          >
            <Text style={styles.recordButtonText}>Record 30 seconds</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePrivacyPress}>
            <PrivacyBadge showArrow />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleUpgradePress}>
            <Text style={styles.upgradeLink}>Upgrade (coming soon) ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  ctaContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E1E2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#374151',
  },
  icon: {
    fontSize: 56,
  },
  description: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  recordButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  upgradeLink: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;
