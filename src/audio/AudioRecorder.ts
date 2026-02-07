/**
 * Audio recording module using Expo AV
 * Handles recording lifecycle, permissions, and cleanup
 */

import { Audio } from 'expo-av';
import { AudioBuffer } from '@/analysis/types';
import { extractAudioBuffer } from './AudioUtils';
import Logger from '@/utils/Logger';

// Recording configuration for voice analysis
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: '.wav',
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
  },
  ios: {
    extension: '.wav',
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: 256000,
  },
};

export interface RecordingSession {
  readonly recording: Audio.Recording;
  readonly startTime: number;
  stop: () => Promise<AudioBuffer>;
  getElapsedMs: () => number;
}

/**
 * Request microphone permission
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    const granted = status === 'granted';

    if (granted) {
      Logger.log('permission_granted');
    } else {
      Logger.log('permission_denied');
    }

    return granted;
  } catch (error) {
    Logger.error('Failed to request microphone permission', error);
    return false;
  }
}

/**
 * Check if microphone permission is granted
 */
export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    const { status } = await Audio.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    Logger.error('Failed to check microphone permission', error);
    return false;
  }
}

/**
 * Start a new recording session
 */
export async function startRecording(): Promise<RecordingSession> {
  // Ensure audio mode is set correctly
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });

  // Create and start recording
  const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
  const startTime = Date.now();

  Logger.log('record_started', {
    sampleRate: 16000,
    channels: 1,
  });

  return {
    recording,
    startTime,

    stop: async (): Promise<AudioBuffer> => {
      const elapsedMs = Date.now() - startTime;

      try {
        await recording.stopAndUnloadAsync();
        Logger.log('record_completed', { durationMs: elapsedMs });

        // Extract audio buffer from recording
        const buffer = await extractAudioBuffer(recording, 16000);

        // Reset audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        return buffer;
      } catch (error) {
        Logger.error('Failed to stop recording', error);
        throw error;
      }
    },

    getElapsedMs: (): number => {
      return Date.now() - startTime;
    },
  };
}

/**
 * Stop recording early (user cancelled)
 */
export async function stopRecordingEarly(
  recording: Audio.Recording
): Promise<void> {
  try {
    await recording.stopAndUnloadAsync();
    Logger.log('record_stopped_early');

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  } catch (error) {
    Logger.error('Failed to stop recording early', error);
  }
}

/**
 * Cleanup recording resources
 * Call this when component unmounts
 */
export async function cleanupRecording(
  recording: Audio.Recording | null
): Promise<void> {
  if (!recording) return;

  try {
    const status = await recording.getStatusAsync();
    if (status.isRecording) {
      await recording.stopAndUnloadAsync();
    }
  } catch (error) {
    // Ignore cleanup errors
    Logger.warn('Cleanup recording error (ignored)', error);
  }
}
