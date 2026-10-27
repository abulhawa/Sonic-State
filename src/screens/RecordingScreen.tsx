/**
 * Recording screen: capture up to 30 seconds of actual PCM audio in memory.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAudioStream, type AudioStreamBuffer, type AudioStreamOptions } from 'expo-audio';
import {
  startRecording,
  cleanupRecording,
  concatenatePcmChunks,
  checkMicrophonePermission,
  requestMicrophonePermission,
  type RecordingSession,
} from '@/audio/AudioRecorder';
import { setPendingAudioBuffer } from '@/audio/AudioBufferStore';
import Logger from '@/utils/Logger';

type RootStackParamList = {
  Home: undefined;
  Recording: undefined;
  Processing: undefined;
};

type RecordingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Recording'>;
};

const TARGET_DURATION_MS = 30000;
const MIN_DURATION_MS = 3000;

const RecordingScreen: React.FC<RecordingScreenProps> = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const recordingRef = useRef<RecordingSession | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const actualSampleRateRef = useRef<number>(0);
  const stoppingRef = useRef(false);
  const mountedRef = useRef(true);

  const capturePcm = useCallback((buffer: AudioStreamBuffer) => {
    if (buffer.channels !== 1 || buffer.sampleRate <= 0) return;
    if (actualSampleRateRef.current && actualSampleRateRef.current !== buffer.sampleRate) {
      Logger.warn('Microphone sample rate changed mid-capture');
      return;
    }
    actualSampleRateRef.current = buffer.sampleRate;
    // Copy the buffer because the native audio stream may reuse its backing memory.
    chunksRef.current.push(new Float32Array(buffer.data.slice(0)));
  }, []);
  const streamOptions = useMemo<AudioStreamOptions>(() => ({
    sampleRate: 16000,
    channels: 1,
    encoding: 'float32',
    onBuffer: capturePcm,
  }), [capturePcm]);
  const { stream } = useAudioStream(streamOptions);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    return `${Math.floor(totalSeconds / 60).toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
  };

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const handleStop = useCallback(async () => {
    const session = recordingRef.current;
    if (!session || stoppingRef.current) return;
    if (session.getElapsedMs() < MIN_DURATION_MS) {
      Alert.alert('Too Short', 'Please record for at least 3 seconds.');
      return;
    }
    stoppingRef.current = true;
    stopTimer();
    recordingRef.current = null;
    setIsRecording(false);
    try {
      const buffer = await session.stop();
      if (!mountedRef.current) return;
      setPendingAudioBuffer(buffer);
      navigation.replace('Processing');
    } catch (error) {
      Logger.error('Failed to stop recording', error);
      if (mountedRef.current) {
        Alert.alert('Error', 'Failed to process recording. Please try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } finally {
      chunksRef.current = [];
    }
  }, [navigation, stopTimer]);

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;
    const initRecording = async () => {
      try {
        const granted = await checkMicrophonePermission() || await requestMicrophonePermission();
        if (cancelled) return;
        if (!granted) {
          setPermissionDenied(true);
          return;
        }
        chunksRef.current = [];
        actualSampleRateRef.current = 0;
        const session = await startRecording(stream, () =>
          concatenatePcmChunks(chunksRef.current, actualSampleRateRef.current)
        );
        if (cancelled) {
          await cleanupRecording(session);
          return;
        }
        recordingRef.current = session;
        setIsRecording(true);
        timerRef.current = setInterval(() => {
          const elapsed = session.getElapsedMs();
          setElapsedMs(elapsed);
          if (elapsed >= TARGET_DURATION_MS) void handleStop();
        }, 100);
      } catch (error) {
        if (cancelled) return;
        Logger.error('Failed to start recording', error);
        Alert.alert('Recording Error', 'Could not start recording. Please check microphone permissions.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    };
    void initRecording();
    return () => {
      cancelled = true;
      mountedRef.current = false;
      stopTimer();
      const session = recordingRef.current;
      recordingRef.current = null;
      void cleanupRecording(session);
      chunksRef.current = [];
    };
  }, [navigation, stream, stopTimer, handleStop]);

  const handleCancel = useCallback(async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    stopTimer();
    const session = recordingRef.current;
    recordingRef.current = null;
    await cleanupRecording(session);
    chunksRef.current = [];
    navigation.goBack();
  }, [navigation, stopTimer]);

  // Permission denied view
  if (permissionDenied) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
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
      <StatusBar style="light" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>{isRecording ? 'Recording...' : 'Starting microphone...'}</Text>
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
            disabled={!isRecording}
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
