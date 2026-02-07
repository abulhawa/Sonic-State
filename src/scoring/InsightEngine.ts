/**
 * Insight generation engine
 * Rule-based, deterministic insight generation
 * Pure functions - no randomness, no ML
 */

import { AcousticFeatures, VoiceScores, InsightRule } from '@/analysis/types';

/**
 * Priority-ordered insight rules
 * Higher priority = checked first
 */
export const INSIGHT_RULES: readonly InsightRule[] = [
  {
    id: 'too_quiet',
    priority: 100,
    condition: (features) => features.rms < 0.015,
    message: 'This sample is very quiet — results may be less reliable.',
  },
  {
    id: 'no_voice',
    priority: 95,
    condition: (features) => features.voicedRatio < 0.1,
    message: 'No clear voice signal detected. Try speaking closer to the microphone.',
  },
  {
    id: 'very_short',
    priority: 90,
    condition: (features) => features.durationSeconds < 5,
    message: 'Recording was very short — results may be less reliable.',
  },
  {
    id: 'high_tension',
    priority: 80,
    condition: (_, scores) => scores.tension > 75,
    message: 'More tension-like signal than typical speech.',
  },
  {
    id: 'very_high_energy',
    priority: 70,
    condition: (_, scores) => scores.energy > 80,
    message: 'Higher energy signal in this sample.',
  },
  {
    id: 'very_low_energy',
    priority: 70,
    condition: (_, scores) => scores.energy < 25,
    message: 'Lower energy signal — voice may sound subdued.',
  },
  {
    id: 'low_clarity',
    priority: 60,
    condition: (_, scores) => scores.clarity < 35,
    message: 'This sample has more noise than typical speech.',
  },
  {
    id: 'high_clarity',
    priority: 50,
    condition: (_, scores) => scores.clarity > 80 && scores.energy > 50,
    message: 'Clear, well-projected voice signal detected.',
  },
  {
    id: 'balanced',
    priority: 10,
    condition: () => true,
    message: 'Voice signal detected within typical range.',
  },
] as const;

/**
 * Generate insight based on features and scores
 * Deterministic: same inputs always produce same output
 */
export function generateInsight(
  features: AcousticFeatures,
  scores: VoiceScores
): string {
  // Sort rules by priority (highest first)
  const sortedRules = [...INSIGHT_RULES].sort((a, b) => b.priority - a.priority);

  // Find first matching rule
  for (const rule of sortedRules) {
    if (rule.condition(features, scores)) {
      return rule.message;
    }
  }

  // Fallback (should never reach here due to 'balanced' rule)
  return 'Voice signal analyzed.';
}

/**
 * Get all matching insights (for debugging/display)
 */
export function getAllMatchingInsights(
  features: AcousticFeatures,
  scores: VoiceScores
): string[] {
  const sortedRules = [...INSIGHT_RULES].sort((a, b) => b.priority - a.priority);

  return sortedRules
    .filter(rule => rule.condition(features, scores))
    .map(rule => rule.message);
}

/**
 * Get insight category for styling
 */
export function getInsightCategory(
  features: AcousticFeatures,
  scores: VoiceScores
): 'warning' | 'positive' | 'neutral' {
  // Warning conditions
  if (features.rms < 0.015 || features.voicedRatio < 0.1 || features.durationSeconds < 5) {
    return 'warning';
  }

  // Positive conditions
  if (scores.clarity > 75 && scores.energy > 50 && scores.tension < 50) {
    return 'positive';
  }

  return 'neutral';
}

export default generateInsight;
