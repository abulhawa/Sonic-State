/**
 * Score calculation module
 * Maps acoustic features to user-facing scores (0-100)
 * Pure functions - deterministic and testable
 */

import { AcousticFeatures, VoiceScores } from '@/analysis/types';

/**
 * Clamp value to range [min, max]
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation from input range to output range
 */
export function lerp(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const normalized = (value - inMin) / (inMax - inMin);
  return outMin + normalized * (outMax - outMin);
}

/**
 * Normalize a value to 0-100 range given typical min/max
 */
function normalizeToScore(
  value: number,
  typicalMin: number,
  typicalMax: number
): number {
  const normalized = lerp(value, typicalMin, typicalMax, 0, 100);
  return clamp(normalized, 0, 100);
}

/**
 * Estimate how trustworthy score magnitudes are (0-1).
 * Quiet or mostly-unvoiced clips should produce conservative scores.
 */
function signalQuality(features: AcousticFeatures): number {
  const rmsQuality = clamp(lerp(features.rms, 0.015, 0.05, 0, 1), 0, 1);
  const voicedQuality = clamp(lerp(features.voicedRatio, 0.1, 0.4, 0, 1), 0, 1);
  return rmsQuality * voicedQuality;
}

/**
 * Calculate Energy score from features
 * Based on: RMS energy (70%) + Spectral centroid (30%)
 * Higher RMS and brighter sound = higher energy
 */
export function calculateEnergy(features: AcousticFeatures): number {
  // RMS: typical range 0.01 (quiet) to 0.3 (loud)
  const rmsScore = normalizeToScore(features.rms, 0.01, 0.25);

  // Spectral centroid: typical range 500Hz (dull) to 4000Hz (bright)
  const centroidScore = normalizeToScore(features.spectralCentroid, 500, 3500);

  // Weighted combination
  const energy = rmsScore * 0.7 + centroidScore * 0.3;

  return Math.round(clamp(energy, 0, 100));
}

/**
 * Calculate Tension score from features
 * Based on: Pitch variance (60%) + Jitter proxy (20%) + ZCR (20%)
 * Higher pitch variation and instability = tension signal
 */
export function calculateTension(features: AcousticFeatures): number {
  // Pitch variance (CV): typical range 0.05 (stable) to 0.3 (very variable)
  const pitchVarScore = normalizeToScore(features.pitchVariance, 0.05, 0.25);

  // Jitter proxy: typical range 0.01 (stable) to 0.1 (unstable)
  const jitterScore = normalizeToScore(features.jitterProxy, 0.01, 0.08);

  // ZCR: higher ZCR can indicate tension/noisiness
  // Typical range 0.05 (smooth) to 0.2 (noisy)
  const zcrScore = normalizeToScore(features.zeroCrossingRate, 0.05, 0.18);

  // Weighted combination
  const tension = pitchVarScore * 0.6 + jitterScore * 0.2 + zcrScore * 0.2;

  return Math.round(clamp(tension, 0, 100));
}

/**
 * Calculate Clarity score from features
 * Based on: Inverse ZCR (50%) + Centroid stability proxy (50%)
 * Lower noise and stable spectrum = higher clarity
 */
export function calculateClarity(features: AcousticFeatures): number {
  // Inverse ZCR: lower ZCR = higher clarity
  // Typical ZCR 0.05 (clear) to 0.2 (noisy)
  const zcrClarity = 100 - normalizeToScore(features.zeroCrossingRate, 0.05, 0.2);

  // Voiced ratio: more voiced frames = clearer speech
  const voicedScore = features.voicedRatio * 100;

  // Spectral centroid in reasonable voice range (800-3000Hz) = clearer
  // Penalize very low or very high centroids
  const centroidDeviation = Math.abs(features.spectralCentroid - 1800) / 1800;
  const centroidScore = clamp(100 - centroidDeviation * 50, 0, 100);

  // Weighted combination
  const clarity = zcrClarity * 0.5 + voicedScore * 0.3 + centroidScore * 0.2;

  return Math.round(clamp(clarity, 0, 100));
}

/**
 * Calculate all scores from features
 * Pure function - same input always produces same output
 */
export function calculateScores(features: AcousticFeatures): VoiceScores {
  const quality = signalQuality(features);

  // Low-quality signal: suppress extreme bars so silence/noise does not look "high energy".
  if (quality < 0.25) {
    return {
      energy: Math.round(clamp(calculateEnergy(features) * quality, 0, 35)),
      tension: Math.round(clamp(calculateTension(features) * quality, 0, 35)),
      clarity: Math.round(clamp(calculateClarity(features) * quality, 0, 35)),
    };
  }

  return {
    energy: calculateEnergy(features),
    tension: calculateTension(features),
    clarity: calculateClarity(features),
  };
}

/**
 * Determine confidence level based on signal quality
 */
export function calculateConfidence(features: AcousticFeatures): 'high' | 'medium' | 'low' {
  // Too quiet = low confidence
  if (features.rms < 0.015) {
    return 'low';
  }

  // Very short = low confidence
  if (features.durationSeconds < 3) {
    return 'low';
  }

  // No detected voice = low confidence
  if (features.voicedRatio < 0.1) {
    return 'low';
  }

  // Moderate issues = medium confidence
  if (features.rms < 0.03 || features.voicedRatio < 0.3) {
    return 'medium';
  }

  return 'high';
}

export default calculateScores;
