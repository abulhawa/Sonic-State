/**
 * Microphone capture using SDK 58's uncompressed PCM audio stream.
 * Samples stay in memory and are never encoded or uploaded.
 */
import {
  AudioModule,
  setAudioModeAsync,
  type AudioStream,
} from 'expo-audio';
import type { AudioBuffer } from '@/analysis/types';
import Logger from '@/utils/Logger';

export interface RecordingSession {
  readonly startTime: number;
  stop: () => Promise<AudioBuffer>;
  cancel: () => Promise<void>;
  getElapsedMs: () => number;
}

export function concatenatePcmChunks(chunks: readonly Float32Array[], sampleRate: number): AudioBuffer {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
    throw new Error('Invalid microphone sample rate');
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const samples = new Float32Array(total);
  let position = 0;
  for (const chunk of chunks) {
    samples.set(chunk, position);
    position += chunk.length;
  }
  return { samples, sampleRate, channels: 1, durationMs: total / sampleRate * 1000 };
}

export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    Logger.log(granted ? 'permission_granted' : 'permission_denied');
    return granted;
  } catch (error) {
    Logger.error('Failed to request microphone permission', error);
    return false;
  }
}

export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    return (await AudioModule.getRecordingPermissionsAsync()).granted;
  } catch (error) {
    Logger.error('Failed to check microphone permission', error);
    return false;
  }
}

export async function startRecording(
  stream: AudioStream,
  collectAudio: () => AudioBuffer
): Promise<RecordingSession> {
  await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
  try {
    await stream.start();
  } catch (error) {
    await setAudioModeAsync({ allowsRecording: false });
    throw error;
  }
  const startTime = Date.now();
  let finishPromise: Promise<void> | null = null;

  const finish = (): Promise<void> => {
    if (!finishPromise) {
      finishPromise = (async () => {
        try {
          await stream.stop();
        } finally {
          await setAudioModeAsync({ allowsRecording: false });
        }
      })();
    }
    return finishPromise;
  };

  Logger.log('record_started');
  return {
    startTime,
    getElapsedMs: () => Date.now() - startTime,
    cancel: async () => {
      await finish();
      Logger.log('record_stopped_early');
    },
    stop: async () => {
      await finish();
      const buffer = collectAudio();
      if (!buffer.samples.length) throw new Error('Recording contains no PCM samples');
      Logger.log('record_completed', { durationMs: buffer.durationMs });
      return buffer;
    },
  };
}

export async function cleanupRecording(session: RecordingSession | null): Promise<void> {
  if (!session) return;
  try {
    await session.cancel();
  } catch (error) {
    Logger.warn('Cleanup recording error (ignored)', error);
  }
}
