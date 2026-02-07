/**
 * Lightweight pitch detection using YIN-inspired autocorrelation
 * Pure TypeScript implementation - no native dependencies
 */

/**
 * Pitch detection result
 */
export interface PitchResult {
  /** Detected pitch in Hz, 0 if unvoiced */
  readonly pitch: number;
  /** Confidence 0-1 based on clarity of autocorrelation peak */
  readonly confidence: number;
  /** Whether this frame is considered voiced */
  readonly isVoiced: boolean;
}

/**
 * YIN-style pitch detector configuration
 */
interface YINConfig {
  /** Sample rate in Hz */
  sampleRate: number;
  /** Frame size for analysis */
  frameSize: number;
  /** Minimum detectable frequency (Hz) */
  minFreq: number;
  /** Maximum detectable frequency (Hz) */
  maxFreq: number;
  /** Threshold for voiced/unvoiced decision (0-1) */
  threshold: number;
}

const DEFAULT_CONFIG: YINConfig = {
  sampleRate: 16000,
  frameSize: 1024,
  minFreq: 50,   // ~F2
  maxFreq: 600,  // ~D5
  threshold: 0.15,
};

/**
 * Calculate difference function (step 1 of YIN)
 */
function differenceFunction(samples: Float32Array, frameSize: number): Float32Array {
  const diff = new Float32Array(frameSize);

  for (let tau = 0; tau < frameSize; tau++) {
    let sum = 0;
    for (let i = 0; i < frameSize - tau; i++) {
      const delta = samples[i] - samples[i + tau];
      sum += delta * delta;
    }
    diff[tau] = sum;
  }

  return diff;
}

/**
 * Cumulative mean normalized difference (step 2 of YIN)
 */
function cumulativeMeanNormalized(diff: Float32Array): Float32Array {
  const cmnd = new Float32Array(diff.length);
  cmnd[0] = 1;

  let runningSum = 0;
  for (let tau = 1; tau < diff.length; tau++) {
    runningSum += diff[tau];
    cmnd[tau] = diff[tau] / (runningSum / tau);
  }

  return cmnd;
}

/**
 * Find first minimum below threshold (step 3 of YIN)
 */
function findFirstMinimum(
  cmnd: Float32Array,
  threshold: number,
  minLag: number,
  maxLag: number
): { tau: number; confidence: number } | null {
  for (let tau = minLag; tau < maxLag && tau < cmnd.length; tau++) {
    if (cmnd[tau] < threshold) {
      // Found a candidate, do parabolic interpolation for better accuracy
      const prev = cmnd[tau - 1];
      const curr = cmnd[tau];
      const next = cmnd[tau + 1];

      if (prev > curr && next > curr) {
        // Parabolic interpolation
        const delta = (prev - next) / (2 * (prev - 2 * curr + next));
        const interpolatedTau = tau + delta;
        const confidence = 1 - curr;

        return { tau: interpolatedTau, confidence };
      }
    }
  }

  return null;
}

/**
 * Detect pitch in a single frame using YIN algorithm
 */
export function detectPitchYIN(
  samples: Float32Array,
  config: Partial<YINConfig> = {}
): PitchResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Calculate lag bounds from frequency bounds
  const minLag = Math.floor(cfg.sampleRate / cfg.maxFreq);
  const maxLag = Math.min(
    Math.ceil(cfg.sampleRate / cfg.minFreq),
    cfg.frameSize - 1
  );

  // Step 1: Difference function
  const diff = differenceFunction(samples, cfg.frameSize);

  // Step 2: Cumulative mean normalized difference
  const cmnd = cumulativeMeanNormalized(diff);

  // Step 3: Find first minimum below threshold
  const minimum = findFirstMinimum(cmnd, cfg.threshold, minLag, maxLag);

  if (!minimum) {
    return { pitch: 0, confidence: 0, isVoiced: false };
  }

  // Calculate pitch from lag
  const pitch = cfg.sampleRate / minimum.tau;

  return {
    pitch,
    confidence: minimum.confidence,
    isVoiced: minimum.confidence > 0.5,
  };
}

/**
 * Detect pitch across multiple frames and return statistics
 */
export function detectPitchFrames(
  samples: Float32Array,
  sampleRate: number,
  frameSize = 1024,
  hopSize = 512
): {
  pitches: number[];
  confidences: number[];
  voicedFrames: number;
  totalFrames: number;
} {
  const pitches: number[] = [];
  const confidences: number[] = [];
  let voicedFrames = 0;

  const totalFrames = Math.floor((samples.length - frameSize) / hopSize) + 1;

  for (let i = 0; i < totalFrames; i++) {
    const start = i * hopSize;
    const frame = samples.subarray(start, start + frameSize);

    const result = detectPitchYIN(frame, {
      sampleRate,
      frameSize,
    });

    pitches.push(result.pitch);
    confidences.push(result.confidence);

    if (result.isVoiced) {
      voicedFrames++;
    }
  }

  return { pitches, confidences, voicedFrames, totalFrames };
}

/**
 * Simple autocorrelation pitch detection (fallback)
 * Faster but less accurate than YIN
 */
export function detectPitchAutocorrelation(
  samples: Float32Array,
  sampleRate: number,
  minFreq = 50,
  maxFreq = 600
): PitchResult {
  const minLag = Math.floor(sampleRate / maxFreq);
  const maxLag = Math.ceil(sampleRate / minFreq);

  let bestLag = 0;
  let bestCorrelation = -Infinity;

  for (let lag = minLag; lag <= maxLag && lag < samples.length; lag++) {
    let correlation = 0;
    for (let i = 0; i < samples.length - lag; i++) {
      correlation += samples[i] * samples[i + lag];
    }

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  if (bestLag === 0 || bestCorrelation <= 0) {
    return { pitch: 0, confidence: 0, isVoiced: false };
  }

  const pitch = sampleRate / bestLag;
  const confidence = Math.min(1, bestCorrelation / samples.length);

  return {
    pitch,
    confidence,
    isVoiced: confidence > 0.3 && pitch >= minFreq && pitch <= maxFreq,
  };
}
