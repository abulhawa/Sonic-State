/**
 * Processing Screen
 * Shows "Analyzing..." while extracting features and calculating scores
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { extractFeatures } from '@/analysis/FeatureExtractor';
import { calculateScores, calculateConfidence } from '@/scoring/ScoreCalculator';
import { generateInsight } from '@/scoring/InsightEngine';
import { AnalysisResult } from '@/analysis/types';
import { consumePendingAudioBuffer } from '@/audio/AudioBufferStore';
import Logger from '@/utils/Logger';

type RootStackParamList = {
  Home: undefined;
  Recording: undefined;
  Processing: undefined;
  Results: { result: AnalysisResult };
};

type ProcessingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Processing'>;
};

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ navigation }) => {
  const processingRef = useRef(false);

  useEffect(() => {
    // Prevent double processing
    if (processingRef.current) return;
    processingRef.current = true;

    const processAudio = async () => {
      try {
        const audioBuffer = consumePendingAudioBuffer();
        if (!audioBuffer) {
          throw new Error('No pending audio buffer available');
        }

        Logger.log('analysis_started', {
          durationMs: audioBuffer.durationMs,
          sampleRate: audioBuffer.sampleRate,
        });

        // Step 1: Extract features
        const features = extractFeatures(audioBuffer);

        // Step 2: Calculate scores
        const scores = calculateScores(features);

        // Step 3: Generate insight
        const insight = generateInsight(features, scores);
        const confidence = calculateConfidence(features);

        // Step 4: Build result
        const result: AnalysisResult = {
          scores,
          insight,
          confidence,
          features,
        };

        Logger.log('analysis_completed', {
          energy: scores.energy,
          tension: scores.tension,
          clarity: scores.clarity,
          confidence,
        });

        // Clear audio buffer from memory (immediate cleanup)
        // Note: audioBuffer will be garbage collected after this function exits

        // Navigate to results
        navigation.replace('Results', { result });
      } catch (error) {
        Logger.error('Analysis failed', error);

        // Create fallback result with error indication
        const fallbackResult: AnalysisResult = {
          scores: { energy: 50, tension: 50, clarity: 50 },
          insight: 'Analysis could not be completed. Please try again.',
          confidence: 'low',
          features: {
            rms: 0,
            pitchMean: 0,
            pitchVariance: 0,
            spectralCentroid: 0,
            zeroCrossingRate: 0,
            voicedRatio: 0,
            jitterProxy: 0,
            shimmerProxy: 0,
            durationSeconds: 0,
          },
        };

        navigation.replace('Results', { result: fallbackResult });
      }
    };

    // Small delay to show the processing screen (UX)
    const timeoutId = setTimeout(processAudio, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <View style={styles.content}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.analyzingText}>Analyzing...</Text>
          <Text style={styles.subtitle}>Processing your voice snapshot</Text>
        </View>

        <View style={styles.privacyContainer}>
          <Text style={styles.privacyText}>🔒 All processing happens on your device</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  spinnerContainer: {
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  privacyContainer: {
    position: 'absolute',
    bottom: 40,
  },
  privacyText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default ProcessingScreen;
