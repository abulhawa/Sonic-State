/**
 * Feature extraction module
 * Extracts 5-7 acoustic features from audio buffer
 * All processing is on-device, no network calls
 */

import { AudioBuffer, AcousticFeatures } from './types';
import { detectPitchFrames } from './PitchDetector';

/**
 * Simple in-place FFT for spectral analysis
 * Cooley-Tukey radix-2 algorithm
 */
function fft(real: Float32Array, imag: Float32Array): void {
  const n = real.length;
  if (n <= 1) return;

  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
    let k = n >> 1;
    while (k & j) {
      j &= ~k;
      k >>= 1;
    }
    j |= k;
  }

  // Butterfly operations
  for (let length = 2; length <= n; length <<= 1) {
    const angle = -2 * Math.PI / length;
    const wlenReal = Math.cos(angle);
    const wlenImag = Math.sin(angle);

    for (let i = 0; i < n; i += length) {
      let wReal = 1;
      let wImag = 0;

      for (let j = 0; j < length / 2; j++) {
        const uReal = real[i + j];
        const uImag = imag[i + j];
        const vReal = real[i + j + length / 2] * wReal - imag[i + j + length / 2] * wImag;
        const vImag = real[i + j + length / 2] * wImag + imag[i + j + length / 2] * wReal;

        real[i + j] = uReal + vReal;
        imag[i + j] = uImag + vImag;
        real[i + j + length / 2] = uReal - vReal;
        imag[i + j + length / 2] = uImag - vImag;

        const nextWReal = wReal * wlenReal - wImag * wlenImag;
        wImag = wReal * wlenImag + wImag * wlenReal;
        wReal = nextWReal;
      }
    }
  }
}

/**
 * Calculate magnitude spectrum from FFT result
 */
function magnitudeSpectrum(real: Float32Array, imag: Float32Array): Float32Array {
  const mag = new Float32Array(real.length / 2);
  for (let i = 0; i < mag.length; i++) {
    mag[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
  }
  return mag;
}

/**
 * Calculate spectral centroid from magnitude spectrum
 */
function spectralCentroid(magSpectrum: Float32Array, sampleRate: number, frameSize: number): number {
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < magSpectrum.length; i++) {
    const freq = (i * sampleRate) / frameSize;
    numerator += freq * magSpectrum[i];
    denominator += magSpectrum[i];
  }

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate zero-crossing rate
 */
function zeroCrossingRate(samples: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < samples.length; i++) {
    if ((samples[i] >= 0) !== (samples[i - 1] >= 0)) {
      crossings++;
    }
  }
  return crossings / (samples.length - 1);
}

/**
 * Calculate RMS energy
 */
function rmsEnergy(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  const sumSquares = samples.reduce((sum, s) => sum + s * s, 0);
  return Math.sqrt(sumSquares / samples.length);
}

/**
 * Apply Hann window to samples
 */
function applyHannWindow(samples: Float32Array): Float32Array {
  const windowed = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const windowVal = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (samples.length - 1)));
    windowed[i] = samples[i] * windowVal;
  }
  return windowed;
}

/**
 * Calculate spectral features for a frame
 */
function analyzeFrame(
  samples: Float32Array,
  sampleRate: number
): { centroid: number; zcr: number; rms: number } {
  // Apply window
  const windowed = applyHannWindow(samples);

  // Prepare for FFT (pad to power of 2)
  const fftSize = Math.pow(2, Math.ceil(Math.log2(samples.length)));
  const real = new Float32Array(fftSize);
  const imag = new Float32Array(fftSize);
  real.set(windowed);

  // Compute FFT
  fft(real, imag);

  // Get magnitude spectrum
  const magSpectrum = magnitudeSpectrum(real, imag);

  // Calculate features
  return {
    centroid: spectralCentroid(magSpectrum, sampleRate, fftSize),
    zcr: zeroCrossingRate(samples),
    rms: rmsEnergy(samples),
  };
}

/**
 * Calculate variance of an array
 */
function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate coefficient of variation (normalized variance)
 */
function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const var_ = variance(values);
  return Math.sqrt(var_) / mean;
}

/**
 * Extract all acoustic features from audio buffer
 */
export function extractFeatures(audioBuffer: AudioBuffer): AcousticFeatures {
  const { samples, sampleRate } = audioBuffer;

  // Frame parameters
  const frameSize = 1024;
  const hopSize = 512;

  // Process frames
  const frameCentroids: number[] = [];
  const frameZCRs: number[] = [];
  const frameRMSs: number[] = [];

  const numFrames = Math.floor((samples.length - frameSize) / hopSize) + 1;

  for (let i = 0; i < numFrames; i++) {
    const start = i * hopSize;
    const frame = samples.subarray(start, start + frameSize);

    const features = analyzeFrame(frame, sampleRate);
    frameCentroids.push(features.centroid);
    frameZCRs.push(features.zcr);
    frameRMSs.push(features.rms);
  }

  // Calculate pitch features
  const { pitches, voicedFrames, totalFrames } = detectPitchFrames(
    samples,
    sampleRate,
    frameSize,
    hopSize
  );

  // Filter out unvoiced frames (pitch = 0) for statistics
  const validPitches = pitches.filter(p => p > 0);

  // Calculate statistics
  const pitchMean = validPitches.length > 0
    ? validPitches.reduce((a, b) => a + b, 0) / validPitches.length
    : 0;

  const pitchVariance = coefficientOfVariation(validPitches);

  const centroidMean = frameCentroids.reduce((a, b) => a + b, 0) / frameCentroids.length;

  const zcrMean = frameZCRs.reduce((a, b) => a + b, 0) / frameZCRs.length;

  const rmsMean = frameRMSs.reduce((a, b) => a + b, 0) / frameRMSs.length;

  const voicedRatio = totalFrames > 0 ? voicedFrames / totalFrames : 0;

  // Calculate jitter proxy (frame-to-frame pitch variation)
  let jitterSum = 0;
  let jitterCount = 0;
  for (let i = 1; i < validPitches.length; i++) {
    const diff = Math.abs(validPitches[i] - validPitches[i - 1]);
    const avg = (validPitches[i] + validPitches[i - 1]) / 2;
    if (avg > 0) {
      jitterSum += diff / avg;
      jitterCount++;
    }
  }
  const jitterProxy = jitterCount > 0 ? jitterSum / jitterCount : 0;

  // Calculate shimmer proxy (frame-to-frame amplitude variation)
  let shimmerSum = 0;
  for (let i = 1; i < frameRMSs.length; i++) {
    const diff = Math.abs(frameRMSs[i] - frameRMSs[i - 1]);
    const avg = (frameRMSs[i] + frameRMSs[i - 1]) / 2;
    if (avg > 0) {
      shimmerSum += diff / avg;
    }
  }
  const shimmerProxy = frameRMSs.length > 1 ? shimmerSum / (frameRMSs.length - 1) : 0;

  return {
    rms: rmsMean,
    pitchMean,
    pitchVariance,
    spectralCentroid: centroidMean,
    zeroCrossingRate: zcrMean,
    voicedRatio,
    jitterProxy: Math.min(jitterProxy, 1),
    shimmerProxy: Math.min(shimmerProxy, 1),
    durationSeconds: audioBuffer.durationMs / 1000,
  };
}

export default extractFeatures;
