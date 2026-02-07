/**
 * Type definitions for audio analysis
 * Pure data structures - no implementation
 */

/**
 * Raw acoustic features extracted from audio buffer
 * All values are normalized or in standard units
 */
export interface AcousticFeatures {
  /** Root Mean Square energy (0-1 normalized) */
  readonly rms: number;

  /** Mean pitch in Hz (0 if no voiced frames) */
  readonly pitchMean: number;

  /** Pitch variance (coefficient of variation, 0-1) */
  readonly pitchVariance: number;

  /** Spectral centroid mean (brightness indicator, Hz) */
  readonly spectralCentroid: number;

  /** Zero-crossing rate (0-1, proxy for noisiness) */
  readonly zeroCrossingRate: number;

  /** Ratio of voiced frames to total frames (0-1) */
  readonly voicedRatio: number;

  /** Jitter proxy: frame-to-frame pitch variation (0-1) */
  readonly jitterProxy: number;

  /** Shimmer proxy: frame-to-frame amplitude variation (0-1) */
  readonly shimmerProxy: number;

  /** Duration of analyzed audio in seconds */
  readonly durationSeconds: number;
}

/**
 * User-facing scores derived from acoustic features
 * All scores are 0-100 integers
 */
export interface VoiceScores {
  /** Energy level: high RMS + high centroid = high energy */
  readonly energy: number;

  /** Tension indicator: high pitch variance + jitter = tension signal */
  readonly tension: number;

  /** Clarity indicator: low noise + stable spectrum = high clarity */
  readonly clarity: number;
}

/**
 * Analysis result combining scores, insight, and metadata
 */
export interface AnalysisResult {
  readonly scores: VoiceScores;
  readonly insight: string;
  readonly confidence: 'high' | 'medium' | 'low';
  readonly features: AcousticFeatures;
}

/**
 * Recording metadata
 */
export interface RecordingInfo {
  readonly durationMs: number;
  readonly sampleRate: number;
  readonly channels: number;
}

/**
 * Audio buffer with metadata for processing
 */
export interface AudioBuffer {
  /** PCM float32 samples (-1 to 1) */
  readonly samples: Float32Array;
  readonly sampleRate: number;
  readonly channels: number;
  readonly durationMs: number;
}

/**
 * Insight rule definition
 */
export interface InsightRule {
  readonly id: string;
  readonly priority: number;
  readonly condition: (features: AcousticFeatures, scores: VoiceScores) => boolean;
  readonly message: string;
}
