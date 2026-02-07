/**
 * Recording Screen
 * 30-second countdown recording with stop button
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Audio } from 'expo-av';
import { startRecording, cleanupRecording } from '@/audio/AudioRecorder';
import Logger from '@/utils/Logger';

type RootStackParamList = {
  Home: undefined;
  Recording: undefined;
  Processing: { audioBuffer: unknown };
};

type RecordingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Recording'>;
};

const TARGET_DURATION_MS = 30000; // 30 seconds
const MIN_DURATION_MS = 3000; // Minimum 3 seconds

const RecordingScreen: React.FC<RecordingScreenProps> = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const recordingRef = useRef<{
    stop: () => Promise<{
      samples: Float32Array;
      sampleRate: number;
      channels: number;
      durationMs: number;
    }>;
    getElapsedMs: () => number;
  } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format time display (MM:SS)
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start recording on mount
  useEffect(() => {
    const initRecording = async () => {
      try {
        // Check permission first
        const { status } = await Audio.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Audio.requestPermissionsAsync();
          if (newStatus !== 'granted') {
            setPermissionDenied(true);
            return;
          }
        }

        // Start recording
        const session = await startRecording();
        recordingRef.current = session;
        setIsRecording(true);

        // Start timer
        timerRef.current = setInterval(() => {
          const elapsed = session.getElapsedMs();
          setElapsedMs(elapsed);

          // Auto-stop at 30 seconds
          if (elapsed >= TARGET_DURATION_MS) {
            handleStop();
          }
        }, 100);
      } catch (error) {
        Logger.error('Failed to start recording', error);
        Alert.alert(
          'Recording Error',
          'Could not start recording. Please check microphone permissions.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };

    initRecording();

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordingRef.current) {
        // Don't await - just fire and forget cleanup
        cleanupRecording(recordingRef.current as unknown as Audio.Recording);
      }
    };
  }, [navigation]);

  const handleStop = useCallback(async () => {
    if (!recordingRef.current || !isRecording) return;

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const elapsed = recordingRef.current.getElapsedMs();

    // Check minimum duration
    if (elapsed < MIN_DURATION_MS) {
      Alert.alert(
        'Too Short',
        `Please record for at least ${MIN_DURATION_MS / 1000} seconds.`,
        [{ text: 'Continue', style: 'cancel' }]
      );
      // Restart timer
      timerRef.current = setInterval(() => {
        if (recordingRef.current) {
          setElapsedMs(recordingRef.current.getElapsedMs());
        }
      }, 100);
      return;
    }

    setIsRecording(false);

    try {
      // Stop recording and get buffer
      const audioBuffer = await recordingRef.current.stop();
      recordingRef.current = null;

      // Navigate to processing
      navigation.replace('Processing', { audioBuffer });
    } catch (error) {
      Logger.error('Failed to stop recording', error);
      Alert.alert(
        'Error',
        'Failed to process recording. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [isRecording, navigation]);

  const handleCancel = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (recordingRef.current) {
      await cleanupRecording(recordingRef.current as unknown as Audio.Recording);
      recordingRef.current = null;
    }

    Logger.log('record_stopped_early');
    navigation.goBack();
  }, [navigation]);

  // Permission denied view
  if (permissionDenied) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>🎙️</Text>
          <Text style={styles.permissionTitle}>Microphone Access Needed</Text>
          <Text style={styles.permissionText}>
            Sonic State needs microphone access to analyze your voice.{'\n'}
            Nothing is recorded or stored.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.permissionButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = Math.min(elapsedMs / TARGET_DURATION_MS, 1);
  const remainingMs = Math.max(TARGET_DURATION_MS - elapsedMs, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Recording...</Text>
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <View style={styles.progressRing}>
            <Text style={styles.timerText}>{formatTime(elapsedMs)}</Text>
            <Text style={styles.targetTime}>/ {formatTime(TARGET_DURATION_MS)}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>

          <Text style={styles.remainingText}>
            {remainingMs > 0 ? `${Math.ceil(remainingMs / 1000)}s remaining` : 'Finishing...'}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStop}
            activeOpacity={0.8}
          >
            <View style={styles.stopIcon} />
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyContainer}>
          <Text style={styles.privacyText}>🔒 Analyzing on-device. Nothing stored.</Text>
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
    paddingTop: 20,
  },
  headerText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  progressRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  targetTime: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  progressBarContainer: {
    width: '80%',
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  remainingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  stopButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stopIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    marginBottom: 12,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  privacyContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  privacyText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecordingScreen;
