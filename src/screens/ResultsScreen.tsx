/**
 * Results Screen
 * Displays 3 scores, insight, and action buttons
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
import { RouteProp } from '@react-navigation/native';
import ScoreBar from '@/components/ScoreBar';
import InsightCard from '@/components/InsightCard';
import { AnalysisResult } from '@/analysis/types';
import { getInsightCategory } from '@/scoring/InsightEngine';
import Logger from '@/utils/Logger';

type RootStackParamList = {
  Home: undefined;
  Recording: undefined;
  Results: { result: AnalysisResult };
  Privacy: undefined;
  Upgrade: undefined;
};

type ResultsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
  const { result } = route.params;
  const { scores, insight, confidence } = result;

  const category = getInsightCategory(result.features, scores);

  const handleTryAgain = () => {
    Logger.log('retry_clicked');
    // Navigate back to home (which will allow starting new recording)
    navigation.navigate('Home');
  };

  const handleLearnMore = () => {
    navigation.navigate('Privacy');
  };

  const handleUpgrade = () => {
    Logger.log('upgrade_screen_viewed');
    navigation.navigate('Upgrade');
  };

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
          <Text style={styles.title}>Your Voice Snapshot</Text>
          <Text style={styles.subtitle}>Based on acoustic features only</Text>
        </View>

        {/* Confidence Warning */}
        {confidence !== 'high' && (
          <View style={styles.confidenceBanner}>
            <Text style={styles.confidenceIcon}>⚠️</Text>
            <Text style={styles.confidenceText}>
              {confidence === 'low'
                ? 'Low confidence: recording may be too quiet or short'
                : 'Medium confidence: some signal issues detected'}
            </Text>
          </View>
        )}

        {/* Scores */}
        <View style={styles.scoresContainer}>
          <ScoreBar label="Energy" score={scores.energy} />
          <ScoreBar label="Tension" score={scores.tension} />
          <ScoreBar label="Clarity" score={scores.clarity} />
        </View>

        {/* Insight */}
        <View style={styles.insightContainer}>
          <Text style={styles.insightLabel}>Insight</Text>
          <InsightCard insight={insight} category={category} />
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            These are acoustic signal patterns, not medical or emotional facts.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTryAgain}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLearnMore}
          >
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>

        {/* Upgrade Teaser */}
        <TouchableOpacity style={styles.upgradeTeaser} onPress={handleUpgrade}>
          <Text style={styles.upgradeTeaserText}>
            🌟 Want history & trends? Upgrade (coming soon) ›
          </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  confidenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451A03',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#B45309',
  },
  confidenceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  confidenceText: {
    flex: 1,
    fontSize: 14,
    color: '#FBBF24',
    lineHeight: 20,
  },
  scoresContainer: {
    marginBottom: 24,
  },
  insightContainer: {
    marginBottom: 24,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  disclaimerContainer: {
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1E1E2E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeTeaser: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  upgradeTeaserText: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ResultsScreen;
