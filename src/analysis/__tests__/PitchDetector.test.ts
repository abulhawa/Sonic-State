/**
 * Unit tests for PitchDetector
 * Validates pitch detection and framing behavior
 */

import {
  detectPitchYIN,
  detectPitchAutocorrelation,
  detectPitchFrames,
} from '../PitchDetector';

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

describe('PitchDetector', () => {
  describe('detectPitchYIN', () => {
    it('should return unvoiced for silence', () => {
      const samples = new Float32Array(1024);
      const result = detectPitchYIN(samples, { sampleRate, frameSize: samples.length });

      expect(result.pitch).toBe(0);
      expect(result.confidence).toBe(0);
      expect(result.isVoiced).toBe(false);
    });

    it('should detect a sine wave pitch', () => {
      const frequency = 220;
      const samples = generateSineWave(frequency, 1024);
      const result = detectPitchYIN(samples, { sampleRate, frameSize: samples.length });

      expect(result.pitch).toBeGreaterThan(200);
      expect(result.pitch).toBeLessThan(240);
      expect(result.isVoiced).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('detectPitchAutocorrelation', () => {
    it('should return unvoiced for silence', () => {
      const samples = new Float32Array(1024);
      const result = detectPitchAutocorrelation(samples, sampleRate);

      expect(result.pitch).toBe(0);
      expect(result.confidence).toBe(0);
      expect(result.isVoiced).toBe(false);
    });

    it('should detect a sine wave pitch', () => {
      const frequency = 200;
      const samples = generateSineWave(frequency, 1024);
      const result = detectPitchAutocorrelation(samples, sampleRate);

      expect(result.pitch).toBeGreaterThan(180);
      expect(result.pitch).toBeLessThan(220);
      expect(result.confidence).toBeGreaterThan(0.1);
    });
  });

  describe('detectPitchFrames', () => {
    it('should report voiced frames across a signal', () => {
      const frameSize = 1024;
      const hopSize = 512;
      const samples = generateSineWave(220, frameSize + hopSize * 2);

      const result = detectPitchFrames(samples, sampleRate, frameSize, hopSize);

      expect(result.totalFrames).toBe(3);
      expect(result.voicedFrames).toBe(3);
      expect(result.pitches).toHaveLength(3);
      expect(result.confidences).toHaveLength(3);
      result.pitches.forEach(pitch => {
        expect(pitch).toBeGreaterThan(0);
      });
    });
  });
});
