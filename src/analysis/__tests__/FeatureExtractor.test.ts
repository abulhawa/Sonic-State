/**
 * Unit tests for FeatureExtractor
 * Validates end-to-end acoustic feature extraction
 */

import extractFeatures from '../FeatureExtractor';
import { AudioBuffer } from '../types';

const sampleRate = 16000;

function generateSineWave(
  frequency: number,
  length: number,
  amplitude = 0.5,
  rate = sampleRate
): Float32Array {
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    samples[i] = amplitude * Math.sin((2 * Math.PI * frequency * i) / rate);
  }
  return samples;
}

describe('FeatureExtractor', () => {
  it('should return near-zero features for silence', () => {
    const samples = new Float32Array(2048);
    const buffer: AudioBuffer = {
      samples,
      sampleRate,
      channels: 1,
      durationMs: (samples.length / sampleRate) * 1000,
    };

    const features = extractFeatures(buffer);

    expect(features.rms).toBeCloseTo(0, 6);
    expect(features.pitchMean).toBe(0);
    expect(features.pitchVariance).toBe(0);
    expect(features.spectralCentroid).toBe(0);
    expect(features.zeroCrossingRate).toBe(0);
    expect(features.voicedRatio).toBe(0);
    expect(features.jitterProxy).toBe(0);
    expect(features.shimmerProxy).toBe(0);
    expect(features.durationSeconds).toBeCloseTo(buffer.durationMs / 1000, 6);
  });

  it('should extract stable features for a sine wave', () => {
    const frequency = 220;
    const samples = generateSineWave(frequency, sampleRate);
    const buffer: AudioBuffer = {
      samples,
      sampleRate,
      channels: 1,
      durationMs: (samples.length / sampleRate) * 1000,
    };

    const features = extractFeatures(buffer);

    expect(features.rms).toBeGreaterThan(0.1);
    expect(features.pitchMean).toBeGreaterThan(180);
    expect(features.pitchMean).toBeLessThan(260);
    expect(features.pitchVariance).toBeLessThan(0.2);
    expect(features.spectralCentroid).toBeGreaterThan(100);
    expect(features.spectralCentroid).toBeLessThan(1000);
    expect(features.zeroCrossingRate).toBeGreaterThan(0.01);
    expect(features.zeroCrossingRate).toBeLessThan(0.05);
    expect(features.voicedRatio).toBeGreaterThan(0.8);
    expect(features.jitterProxy).toBeLessThan(0.1);
    expect(features.shimmerProxy).toBeLessThan(0.1);
  });
});
