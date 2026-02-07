/**
 * Unit tests for InsightEngine
 * Pure function tests - deterministic rule matching
 */

import {
  generateInsight,
  getAllMatchingInsights,
  getInsightCategory,
  INSIGHT_RULES,
} from '../InsightEngine';
import { AcousticFeatures, VoiceScores } from '@/analysis/types';

describe('InsightEngine', () => {
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

  const baseScores: VoiceScores = {
    energy: 50,
    tension: 50,
    clarity: 50,
  };

  describe('INSIGHT_RULES', () => {
    it('should be ordered by descending priority', () => {
      const priorities = INSIGHT_RULES.map(r => r.priority);
      const sortedPriorities = [...priorities].sort((a, b) => b - a);
      expect(priorities).toEqual(sortedPriorities);
    });

    it('should have a catch-all rule (balanced)', () => {
      const balancedRule = INSIGHT_RULES.find(r => r.id === 'balanced');
      expect(balancedRule).toBeDefined();
      expect(balancedRule?.condition(baseFeatures, baseScores)).toBe(true);
    });
  });

  describe('generateInsight', () => {
    it('should detect too quiet signal', () => {
      const features = { ...baseFeatures, rms: 0.01 };
      const insight = generateInsight(features, baseScores);
      expect(insight).toBe('This sample is very quiet — results may be less reliable.');
    });

    it('should detect no voice signal', () => {
      const features = { ...baseFeatures, voicedRatio: 0.05 };
      const insight = generateInsight(features, baseScores);
      expect(insight).toBe('No clear voice signal detected. Try speaking closer to the microphone.');
    });

    it('should detect very short recording', () => {
      const features = { ...baseFeatures, durationSeconds: 3 };
      const insight = generateInsight(features, baseScores);
      expect(insight).toBe('Recording was very short — results may be less reliable.');
    });

    it('should detect high tension', () => {
      const scores = { ...baseScores, tension: 80 };
      const insight = generateInsight(baseFeatures, scores);
      expect(insight).toBe('More tension-like signal than typical speech.');
    });

    it('should detect very high energy', () => {
      const scores = { ...baseScores, energy: 85 };
      const insight = generateInsight(baseFeatures, scores);
      expect(insight).toBe('Higher energy signal in this sample.');
    });

    it('should detect very low energy', () => {
      const scores = { ...baseScores, energy: 20 };
      const insight = generateInsight(baseFeatures, scores);
      expect(insight).toBe('Lower energy signal — voice may sound subdued.');
    });

    it('should detect low clarity', () => {
      const scores = { ...baseScores, clarity: 30 };
      const insight = generateInsight(baseFeatures, scores);
      expect(insight).toBe('This sample has more noise than typical speech.');
    });

    it('should detect high clarity', () => {
      const scores = { ...baseScores, clarity: 85, energy: 60 };
      const insight = generateInsight(baseFeatures, scores);
      expect(insight).toBe('Clear, well-projected voice signal detected.');
    });

    it('should return default for typical signal', () => {
      const insight = generateInsight(baseFeatures, baseScores);
      expect(insight).toBe('Voice signal detected within typical range.');
    });

    it('should be deterministic', () => {
      const insight1 = generateInsight(baseFeatures, baseScores);
      const insight2 = generateInsight(baseFeatures, baseScores);
      expect(insight1).toBe(insight2);
    });

    it('should prioritize quiet over tension', () => {
      // Both quiet and high tension conditions met
      const features = { ...baseFeatures, rms: 0.01 };
      const scores = { ...baseScores, tension: 80 };
      const insight = generateInsight(features, scores);
      // Quiet has higher priority (100 vs 80)
      expect(insight).toBe('This sample is very quiet — results may be less reliable.');
    });
  });

  describe('getAllMatchingInsights', () => {
    it('should return all matching insights', () => {
      const scores = { ...baseScores, tension: 80, energy: 85 };
      const insights = getAllMatchingInsights(baseFeatures, scores);

      expect(insights.length).toBeGreaterThan(1);
      expect(insights).toContain('More tension-like signal than typical speech.');
      expect(insights).toContain('Higher energy signal in this sample.');
    });

    it('should include default rule', () => {
      const insights = getAllMatchingInsights(baseFeatures, baseScores);
      expect(insights).toContain('Voice signal detected within typical range.');
    });
  });

  describe('getInsightCategory', () => {
    it('should return warning for quiet signal', () => {
      const features = { ...baseFeatures, rms: 0.01 };
      expect(getInsightCategory(features, baseScores)).toBe('warning');
    });

    it('should return warning for no voice', () => {
      const features = { ...baseFeatures, voicedRatio: 0.05 };
      expect(getInsightCategory(features, baseScores)).toBe('warning');
    });

    it('should return warning for short recording', () => {
      const features = { ...baseFeatures, durationSeconds: 2 };
      expect(getInsightCategory(features, baseScores)).toBe('warning');
    });

    it('should return positive for clear, well-projected voice', () => {
      const scores = { energy: 60, tension: 40, clarity: 80 };
      expect(getInsightCategory(baseFeatures, scores)).toBe('positive');
    });

    it('should return neutral for typical signal', () => {
      expect(getInsightCategory(baseFeatures, baseScores)).toBe('neutral');
    });
  });
});
