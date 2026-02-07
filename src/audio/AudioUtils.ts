/**
 * Audio utility functions for buffer processing
 * Pure functions - no side effects
 */

import { AudioBuffer } from '@/analysis/types';

/**
 * Convert Int16 PCM array to Float32 normalized array (-1 to 1)
 */
export function int16ToFloat32(int16Array: Int16Array): Float32Array {
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768;
  }
  return float32Array;
}

/**
 * Convert base64 audio string to Float32Array
 * Handles WAV and raw PCM formats
 */
export function base64ToFloat32(base64String: string): Float32Array {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:audio\/\w+;base64,/, '');

  // Decode base64 to binary string
  const binaryString = atob(base64Data);

  // Create buffer and read as Int16 (standard PCM)
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Check for WAV header (RIFF....WAVE)
  let offset = 0;
  if (bytes.length > 44 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) {
    // WAV file - skip 44-byte header
    offset = 44;
  }

  // Convert remaining bytes to Int16 samples
  const sampleCount = Math.floor((bytes.length - offset) / 2);
  const int16Array = new Int16Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const byteIndex = offset + i * 2;
    int16Array[i] = bytes[byteIndex] | (bytes[byteIndex + 1] << 8);
  }

  return int16ToFloat32(int16Array);
}

/**
 * Extract audio buffer from Expo recording URI
 * Note: In production, this would read the file and convert
 * For this MVP, we work with the recording object directly
 */
export async function extractAudioBuffer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recording: any,
  sampleRate: number
): Promise<AudioBuffer> {
  // Get the recorded URI
  const uri = recording.getURI();

  if (!uri) {
    throw new Error('No recording URI available');
  }

  // For Expo, we need to fetch the audio file
  const response = await fetch(uri);
  const blob = await response.blob();

  // Read blob as array buffer
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

  // Convert to Float32
  const uint8Array = new Uint8Array(arrayBuffer);

  // Simple WAV parser
  let dataOffset = 0;
  if (uint8Array.length > 44 &&
      uint8Array[0] === 0x52 && uint8Array[1] === 0x49) {
    // Find 'data' chunk
    for (let i = 36; i < uint8Array.length - 4; i++) {
      if (uint8Array[i] === 0x64 && uint8Array[i + 1] === 0x61 &&
          uint8Array[i + 2] === 0x74 && uint8Array[i + 3] === 0x61) {
        dataOffset = i + 8;
        break;
      }
    }
    if (dataOffset === 0) {
      dataOffset = 44; // Default WAV header size
    }
  }

  const sampleCount = Math.floor((uint8Array.length - dataOffset) / 2);
  const int16Array = new Int16Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const idx = dataOffset + i * 2;
    int16Array[i] = (uint8Array[idx] | (uint8Array[idx + 1] << 8));
  }

  const samples = int16ToFloat32(int16Array);

  return {
    samples,
    sampleRate,
    channels: 1,
    durationMs: (samples.length / sampleRate) * 1000,
  };
}

/**
 * Normalize audio samples to target amplitude range
 */
export function normalizeAudio(samples: Float32Array, targetPeak = 0.95): Float32Array {
  const maxAmp = Math.max(...Array.from(samples).map(Math.abs));
  if (maxAmp === 0) return samples;

  const scale = targetPeak / maxAmp;
  const normalized = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    normalized[i] = samples[i] * scale;
  }
  return normalized;
}

/**
 * Check if audio is too quiet (likely silence or noise only)
 */
export function isTooQuiet(samples: Float32Array, threshold = 0.01): boolean {
  const rms = Math.sqrt(
    samples.reduce((sum, s) => sum + s * s, 0) / samples.length
  );
  return rms < threshold;
}

/**
 * Calculate RMS energy of sample buffer
 */
export function calculateRMS(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  const sumSquares = samples.reduce((sum, s) => sum + s * s, 0);
  return Math.sqrt(sumSquares / samples.length);
}
