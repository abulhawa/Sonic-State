/**
 * Unit tests for ScoreCalculator
 * Pure function tests - no dependencies
 */

import {
  clamp,
  lerp,
  calculateEnergy,
  calculateTension,
  calculateClarity,
  calculateScores,
  calculateConfidence,
} from '../ScoreCalculator';
import { AcousticFeatures } from '@/analysis/types';

describe('ScoreCalculator', () => {
  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(50, 0, 100)).toBe(50);
      expect(clamp(-10, 0, 100)).toBe(0);
      expect(clamp(150, 0, 100)).toBe(100);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 100)).toBe(0);
      expect(clamp(100, 0, 100)).toBe(100);
    });
  });

  describe('lerp', () => {
    it('should interpolate correctly', () => {
      expect(lerp(0.5, 0, 1, 0, 100)).toBe(50);
      expect(lerp(0, 0, 1, 0, 100)).toBe(0);
      expect(lerp(1, 0, 1, 0, 100)).toBe(100);
    });

    it('should extrapolate outside range', () => {
      expect(lerp(-0.5, 0, 1, 0, 100)).toBe(-50);
      expect(lerp(1.5, 0, 1, 0, 100)).toBe(150);
    });
  });

  describe('calculateEnergy', () => {
    const baseFeatures: AcousticFeatures = {
      rms: 0.1,
      pitchMean: 150,
      pitchVariance: 0.1,
      spectralCentroid: 2000,
      zeroCrossingRate: 0.1,
      voicedRatio: 0.7,
      jitterProxy: 0.03,
      shimmerProxy: 0.05,
      durationSeconds: 30,
    };

    it('should return high energy for loud, bright sound', () => {
      const features = { ...baseFeatures, rms: 0.3, spectralCentroid: 4000 };
      const energy = calculateEnergy(features);
      expect(energy).toBeGreaterThan(70);
    });

    it('should return low energy for quiet, dull sound', () => {
      const features = { ...baseFeatures, rms: 0.01, spectralCentroid: 500 };
      const energy = calculateEnergy(features);
      expect(energy).toBeLessThan(30);
    });

    it('should return score between 0 and 100', () => {
      const energy = calculateEnergy(baseFeatures);
      expect(energy).toBeGreaterThanOrEqual(0);
      expect(energy).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateTension', () => {
    const baseFeatures: AcousticFeatures = {
      rms: 0.1,
      pitchMean: 150,
      pitchVariance: 0.1,
      spectralCentroid: 2000,
      zeroCrossingRate: 0.1,
      voicedRatio: 0.7,
      jitterProxy: 0.03,
      shimmerProxy: 0.05,
      durationSeconds: 30,
    };

    it('should return high tension for variable pitch', () => {
      const features = { ...baseFeatures, pitchVariance: 0.3 };
      const tension = calculateTension(features);
      expect(tension).toBeGreaterThan(70);
    });

    it('should return low tension for stable pitch', () => {
      const features = { ...baseFeatures, pitchVariance: 0.02, jitterProxy: 0.01 };
      const tension = calculateTension(features);
      expect(tension).toBeLessThan(40);
    });

    it('should return score between 0 and 100', () => {
      const tension = calculateTension(baseFeatures);
      expect(tension).toBeGreaterThanOrEqual(0);
      expect(tension).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateClarity', () => {
    const baseFeatures: AcousticFeatures = {
      rms: 0.1,
      pitchMean: 150,
      pitchVariance: 0.1,
      spectralCentroid: 2000,
      zeroCrossingRate: 0.1,
      voicedRatio: 0.7,
      jitterProxy: 0.03,
      shimmerProxy: 0.05,
      durationSeconds: 30,
    };

    it('should return high clarity for clean voice', () => {
      const features = {
        ...baseFeatures,
        zeroCrossingRate: 0.05,
        voicedRatio: 0.9,
      };
      const clarity = calculateClarity(features);
      expect(clarity).toBeGreaterThan(70);
    });

    it('should return low clarity for noisy signal', () => {
      const features = {
        ...baseFeatures,
        zeroCrossingRate: 0.2,
        voicedRatio: 0.2,
      };
      const clarity = calculateClarity(features);
      expect(clarity).toBeLessThan(50);
    });

    it('should return score between 0 and 100', () => {
      const clarity = calculateClarity(baseFeatures);
      expect(clarity).toBeGreaterThanOrEqual(0);
      expect(clarity).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateScores', () => {
    const baseFeatures: AcousticFeatures = {
      rms: 0.1,
      pitchMean: 150,
      pitchVariance: 0.1,
      spectralCentroid: 2000,
      zeroCrossingRate: 0.1,
      voicedRatio: 0.7,
      jitterProxy: 0.03,
      shimmerProxy: 0.05,
      durationSeconds: 30,
    };

    it('should return all scores in valid range', () => {
      const scores = calculateScores(baseFeatures);

      expect(scores.energy).toBeGreaterThanOrEqual(0);
      expect(scores.energy).toBeLessThanOrEqual(100);

      expect(scores.tension).toBeGreaterThanOrEqual(0);
      expect(scores.tension).toBeLessThanOrEqual(100);

      expect(scores.clarity).toBeGreaterThanOrEqual(0);
      expect(scores.clarity).toBeLessThanOrEqual(100);
    });

    it('should be deterministic', () => {
      const scores1 = calculateScores(baseFeatures);
      const scores2 = calculateScores(baseFeatures);

      expect(scores1.energy).toBe(scores2.energy);
      expect(scores1.tension).toBe(scores2.tension);
      expect(scores1.clarity).toBe(scores2.clarity);
    });

    it('should suppress extreme scores for silence-like low-quality signal', () => {
      const silenceLike: AcousticFeatures = {
        ...baseFeatures,
        rms: 0.006,
        voicedRatio: 0,
        spectralCentroid: 3500,
        zeroCrossingRate: 0.18,
      };

      const scores = calculateScores(silenceLike);

      expect(scores.energy).toBeLessThanOrEqual(35);
      expect(scores.tension).toBeLessThanOrEqual(35);
      expect(scores.clarity).toBeLessThanOrEqual(35);
    });
  });

  describe('calculateConfidence', () => {
    const baseFeatures: AcousticFeatures = {
      rms: 0.1,
      pitchMean: 150,
      pitchVariance: 0.1,
      spectralCentroid: 2000,
      zeroCrossingRate: 0.1,
      voicedRatio: 0.7,
      jitterProxy: 0.03,
      shimmerProxy: 0.05,
      durationSeconds: 30,
    };

    it('should return low confidence for quiet signal', () => {
      const features = { ...baseFeatures, rms: 0.01 };
      expect(calculateConfidence(features)).toBe('low');
    });

    it('should return low confidence for no voice', () => {
      const features = { ...baseFeatures, voicedRatio: 0.05 };
      expect(calculateConfidence(features)).toBe('low');
    });

    it('should return low confidence for short recording', () => {
      const features = { ...baseFeatures, durationSeconds: 2 };
      expect(calculateConfidence(features)).toBe('low');
    });

    it('should return medium confidence for moderate issues', () => {
      const features = { ...baseFeatures, rms: 0.02, voicedRatio: 0.2 };
      expect(calculateConfidence(features)).toBe('medium');
    });

    it('should return high confidence for good signal', () => {
      expect(calculateConfidence(baseFeatures)).toBe('high');
    });
  });
});
