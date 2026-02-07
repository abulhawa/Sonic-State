/**
 * Privacy Screen / Learn More
 * Explains what Sonic State does and doesn't do
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Logger from '@/utils/Logger';

type RootStackParamList = {
  Home: undefined;
  Results: undefined;
  Privacy: undefined;
  Upgrade: undefined;
};

type PrivacyScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Privacy'>;
};

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ navigation }) => {
  React.useEffect(() => {
    Logger.log('privacy_screen_viewed');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.shieldIcon}>🛡️</Text>
          <Text style={styles.title}>Privacy First</Text>
          <Text style={styles.subtitle}>How Sonic State handles your data</Text>
        </View>

        {/* What We DON'T Do */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We DON'T Do</Text>

          <View style={styles.dontItem}>
            <Text style={styles.dontIcon}>❌</Text>
            <View style={styles.dontContent}>
              <Text style={styles.dontTitle}>No Speech Recognition</Text>
              <Text style={styles.dontText}>
                We do NOT transcribe what you say. We only analyze acoustic properties like pitch and energy.
              </Text>
            </View>
          </View>

          <View style={styles.dontItem}>
            <Text style={styles.dontIcon}>❌</Text>
            <View style={styles.dontContent}>
              <Text style={styles.dontTitle}>No Storage</Text>
              <Text style={styles.dontText}>
                Recordings are never saved to disk. They exist only in memory during analysis and are immediately discarded.
              </Text>
            </View>
          </View>

          <View style={styles.dontItem}>
            <Text style={styles.dontIcon}>❌</Text>
            <View style={styles.dontContent}>
              <Text style={styles.dontTitle}>No Tracking</Text>
              <Text style={styles.dontText}>
                No analytics SDKs, no user IDs, no persistent identifiers. Console logs only.
              </Text>
            </View>
          </View>

          <View style={styles.dontItem}>
            <Text style={styles.dontIcon}>❌</Text>
            <View style={styles.dontContent}>
              <Text style={styles.dontTitle}>No Cloud</Text>
              <Text style={styles.dontText}>
                All analysis happens on your device. Zero network calls. Works offline.
              </Text>
            </View>
          </View>

          <View style={styles.dontItem}>
            <Text style={styles.dontIcon}>❌</Text>
            <View style={styles.dontContent}>
              <Text style={styles.dontTitle}>No History</Text>
              <Text style={styles.dontText}>
                Each session is independent. Closing the app clears everything.
              </Text>
            </View>
          </View>
        </View>

        {/* What We DO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We DO</Text>

          <View style={styles.doItem}>
            <Text style={styles.doIcon}>✓</Text>
            <View style={styles.doContent}>
              <Text style={styles.doTitle}>Acoustic Analysis</Text>
              <Text style={styles.doText}>
                We extract 5-7 acoustic features: pitch, energy, spectral characteristics, and voice activity.
              </Text>
            </View>
          </View>

          <View style={styles.doItem}>
            <Text style={styles.doIcon}>✓</Text>
            <View style={styles.doContent}>
              <Text style={styles.doTitle}>On-Device Processing</Text>
              <Text style={styles.doText}>
                All algorithms run locally using pure TypeScript. No external services.
              </Text>
            </View>
          </View>

          <View style={styles.doItem}>
            <Text style={styles.doIcon}>✓</Text>
            <View style={styles.doContent}>
              <Text style={styles.doTitle}>Immediate Cleanup</Text>
              <Text style={styles.doText}>
                Audio buffers are released immediately after analysis. Nothing persists.
              </Text>
            </View>
          </View>
        </View>

        {/* Technical Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Details</Text>
          <Text style={styles.technicalText}>
            Sonic State uses lightweight signal processing algorithms including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• YIN-inspired pitch detection</Text>
            <Text style={styles.bulletItem}>• FFT-based spectral analysis</Text>
            <Text style={styles.bulletItem}>• RMS energy calculation</Text>
            <Text style={styles.bulletItem}>• Zero-crossing rate analysis</Text>
          </View>
          <Text style={styles.technicalText}>
            All processing happens in under 1 second on modern devices.
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>Not Medical Advice</Text>
          <Text style={styles.disclaimerText}>
            Sonic State provides acoustic signal analysis only. It does not diagnose, treat, or assess medical or psychological conditions. Results are "signals" or "suggestions" based on sound properties, not facts about your health or emotions.
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  shieldIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  dontItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#1E1E2E',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  dontIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dontContent: {
    flex: 1,
  },
  dontTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FCA5A5',
    marginBottom: 4,
  },
  dontText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  doItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#1E1E2E',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  doIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#10B981',
    fontWeight: '700',
  },
  doContent: {
    flex: 1,
  },
  doTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6EE7B7',
    marginBottom: 4,
  },
  doText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  technicalText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletList: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  disclaimerBox: {
    backgroundColor: '#1E3A5F',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#93C5FD',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#BFDBFE',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrivacyScreen;
