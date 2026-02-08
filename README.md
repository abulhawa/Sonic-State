# Sonic State

30s Voice Snapshot Analyzer - Private, On-Device

A fast sound check for your voice state in 30 seconds. Processing is local on your device.

## What It Does

Sonic State analyzes a 30-second voice recording and returns:

- Energy (0-100): voice intensity and brightness
- Tension (0-100): pitch variation and instability signals
- Clarity (0-100): voice clarity vs. noise ratio
- One short rule-based insight
- A confidence level (high, medium, low)

## What It Does Not Do

- No speech recognition or transcription
- No recording storage
- No account system
- No analytics SDKs
- No cloud processing

## Privacy

Sonic State is designed for zero data collection.

- No recordings are persisted
- No user IDs or tracking identifiers
- No external analysis APIs
- Audio buffers are released after analysis

## Tech Stack

- React Native + Expo (TypeScript)
- Expo AV for recording
- React Navigation (stack)
- Pure TypeScript audio analysis pipeline
- On-device feature extraction and deterministic scoring

## Requirements

- Node.js 18+
- npm
- Expo Go app on phone (optional, for device testing)
- Android Studio or Xcode (optional, for emulator/simulator)

## Setup

```bash
npm install
npm start
```

## Run Targets

```bash
# Android emulator/device
npm run android

# iOS simulator/device (macOS)
npm run ios

# Web
npm run web
```

You can also run with local Expo CLI commands:

```bash
npx expo start
npx expo start -c
```

## Testing and Quality

```bash
npm test
npm run test:watch
npm run typecheck
npm run lint
```

Current unit test suites:

- src/scoring/__tests__/ScoreCalculator.test.ts
- src/scoring/__tests__/InsightEngine.test.ts
- src/analysis/__tests__/FeatureExtractor.test.ts
- src/analysis/__tests__/PitchDetector.test.ts

## Project Structure

```text
sonic-state/
|- App.tsx
|- app.json
|- package.json
|- src/
|  |- analysis/
|  |- audio/
|  |- components/
|  |- hooks/
|  |- navigation/
|  |- scoring/
|  |- screens/
|  |- utils/
```

## Feature Extraction

Extracted acoustic features include:

1. RMS energy mean
2. Pitch mean
3. Pitch variance
4. Spectral centroid
5. Zero-crossing rate
6. Voiced ratio
7. Jitter proxy
8. Shimmer proxy

## Scoring Logic

Base score mapping:

- Energy = normalize(RMS) * 0.7 + normalize(SpectralCentroid) * 0.3
- Tension = normalize(PitchVariance) * 0.6 + normalize(Jitter) * 0.2 + normalize(ZCR) * 0.2
- Clarity = inverse(normalized ZCR) * 0.5 + voicedRatio * 0.3 + centroid proximity score * 0.2

All scores are clamped to 0-100 and rounded.

Low-quality guardrail (silence-like input):

- Signal quality is estimated from RMS and voiced ratio.
- If quality is very low, Energy/Tension/Clarity are attenuated and capped to conservative values.
- Confidence is also lowered based on quiet/no-voice/very short input.

## Insight Rules

Priority-ordered rules include:

1. Too quiet
2. No voice
3. Very short recording
4. High tension
5. Very high energy
6. Very low energy
7. Low clarity
8. High clarity
9. Balanced default

## Release and Deployment

Recommended flow:

- Build with EAS
- Submit to Play Store / App Store
- Use EAS Update for OTA JS updates

## Disclaimer

Sonic State provides acoustic signal analysis only. It does not diagnose, treat, or assess medical or psychological conditions.
