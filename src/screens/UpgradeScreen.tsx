/**
 * Upgrade Screen
 * Premium features outline (coming soon) - no actual payments
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Logger from '@/utils/Logger';

type RootStackParamList = {
  Home: undefined;
  Results: undefined;
  Privacy: undefined;
  Upgrade: undefined;
};

type UpgradeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Upgrade'>;
};

const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ navigation }) => {
  React.useEffect(() => {
    Logger.log('upgrade_screen_viewed');
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
          <Text style={styles.sparkleIcon}>🌟</Text>
          <Text style={styles.title}>Sonic State Pro</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
        </View>

        {/* Current (Free) */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Free</Text>
            <Text style={styles.planPrice}>€0</Text>
          </View>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.featureText}>Single-session snapshots</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.featureText}>Basic scores (Energy, Tension, Clarity)</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.featureText}>On-device privacy</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.featureText}>No account required</Text>
            </View>
          </View>
        </View>

        {/* Pro (Coming Soon) */}
        <View style={[styles.planCard, styles.proCard]}>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>COMING SOON</Text>
          </View>

          <View style={styles.planHeader}>
            <Text style={[styles.planName, styles.proPlanName]}>Pro</Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.planPrice, styles.proPlanPrice]}>€4.99</Text>
              <Text style={styles.period}>/month</Text>
            </View>
          </View>

          <Text style={styles.annualPrice}>or €29.99/year (save 50%)</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={[styles.checkIcon, styles.proCheck]}>✓</Text>
              <Text style={[styles.featureText, styles.proFeature]}>
                <Text style={styles.bold}>History & Trends</Text> — See how your voice changes over time
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={[styles.checkIcon, styles.proCheck]}>✓</Text>
              <Text style={[styles.featureText, styles.proFeature]}>
                <Text style={styles.bold}>Weekly Insights</Text> — Pattern detection across your snapshots
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={[styles.checkIcon, styles.proCheck]}>✓</Text>
              <Text style={[styles.featureText, styles.proFeature]}>
                <Text style={styles.bold}>Export Data</Text> — Download your history as CSV/JSON
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={[styles.checkIcon, styles.proCheck]}>✓</Text>
              <Text style={[styles.featureText, styles.proFeature]}>
                <Text style={styles.bold}>Optional Cloud Sync</Text> — Encrypted backup (opt-in only)
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={[styles.checkIcon, styles.proCheck]}>✓</Text>
              <Text style={[styles.featureText, styles.proFeature]}>
                <Text style={styles.bold}>Advanced Metrics</Text> — Additional acoustic features
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={[styles.checkIcon, styles.proCheck]}>✓</Text>
              <Text style={[styles.featureText, styles.proFeature]}>
                <Text style={styles.bold}>No Ads</Text> — Clean experience forever
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyTitle}>🔒 Privacy-First, Even in Pro</Text>
          <Text style={styles.privacyText}>
            All analysis still happens on-device. Optional cloud sync uses end-to-end encryption. You own your data and can delete it anytime.
          </Text>
        </View>

        {/* Notify Me Button */}
        <TouchableOpacity
          style={styles.notifyButton}
          onPress={() => {
            Logger.log('notify_me_clicked');
            // In a real app, this would register for notifications
            // For MVP, just log and show feedback
          }}
        >
          <Text style={styles.notifyButtonText}>Notify Me When Available</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Prices are indicative and may change. No payment processing is implemented in this MVP.
        </Text>
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
  sparkleIcon: {
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
    color: '#FBBF24',
    marginTop: 4,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  proCard: {
    borderColor: '#FBBF24',
    borderWidth: 2,
    position: 'relative',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: '#FBBF24',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  proPlanName: {
    color: '#FBBF24',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  proPlanPrice: {
    color: '#FBBF24',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  period: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  annualPrice: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkIcon: {
    fontSize: 16,
    color: '#10B981',
    marginRight: 10,
    fontWeight: '700',
    width: 20,
  },
  proCheck: {
    color: '#FBBF24',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  proFeature: {
    color: '#E5E7EB',
  },
  bold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  privacyNote: {
    backgroundColor: '#064E3B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6EE7B7',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 13,
    color: '#A7F3D0',
    lineHeight: 20,
  },
  notifyButton: {
    backgroundColor: '#FBBF24',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  notifyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default UpgradeScreen;
