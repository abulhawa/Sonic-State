# Sonic State - Architecture & File Map

## Overview
Privacy-first, on-device voice snapshot analyzer. Single-session only, no storage, no tracking.

## Architecture Principles
1. **Zero Persistence**: No storage of any kind (no AsyncStorage, no files, no DB)
2. **Pure Functions**: All scoring and insight logic is deterministic and testable
3. **Immediate Cleanup**: Audio buffers released immediately after analysis
4. **No Network**: Zero API calls, analytics SDKs, or cloud services

## Folder Structure

```
sonic-state/
├── App.tsx                    # Root component, navigation container
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── tsconfig.json             # TypeScript config
├── jest.config.js            # Test configuration
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx   # React Navigation setup
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Entry: CTA to record
│   │   ├── RecordingScreen.tsx    # 30s countdown recording
│   │   ├── ProcessingScreen.tsx   # "Analyzing..." spinner
│   │   ├── ResultsScreen.tsx      # 3 scores + insight
│   │   ├── PrivacyScreen.tsx      # Learn more / Privacy explanation
│   │   └── UpgradeScreen.tsx      # Premium features (coming soon)
│   ├── audio/
│   │   ├── AudioRecorder.ts       # Expo AV recording wrapper
│   │   └── AudioUtils.ts          # PCM conversion, buffer handling
│   ├── analysis/
│   │   ├── FeatureExtractor.ts    # Extract 5-7 acoustic features
│   │   ├── PitchDetector.ts       # Lightweight YIN/autocorrelation
│   │   └── types.ts               # Feature interfaces
│   ├── scoring/
│   │   ├── ScoreCalculator.ts     # Map features to 0-100 scores
│   │   ├── InsightEngine.ts       # Rule-based insight generation
│   │   └── __tests__/             # Unit tests
│   ├── components/
│   │   ├── ScoreBar.tsx           # Visual score display
│   │   ├── InsightCard.tsx        # Insight display component
│   │   └── PrivacyBadge.tsx       # "Nothing stored" badge
│   ├── hooks/
│   │   └── useAudioPermissions.ts # Mic permission handling
│   └── utils/
│       └── Logger.ts              # Console-only logging
└── README.md
```

## Data Flow

```
HomeScreen
    ↓ (user taps "Record")
RecordingScreen
    ↓ (30s complete or stop tapped)
AudioRecorder.stop() → PCM buffer
    ↓
FeatureExtractor.process(buffer)
    → Features: { rms, pitchMean, pitchVar, centroid, zcr, voicedRatio }
    ↓
ScoreCalculator.compute(features)
    → Scores: { energy, tension, clarity }
    ↓
InsightEngine.generate(features, scores)
    → Insight: string
    ↓
ResultsScreen (display scores + insight)
    ↓ (immediate cleanup)
Buffer = null, Features = null
```

## Key Technical Decisions

### Audio Recording
- **Expo AV**: `Audio.Recording` with custom options
- **Format**: WAV-like PCM (iOS: LINEAR16, Android: default to best quality)
- **Sample Rate**: 16000 Hz (mono) - optimal for voice analysis
- **Duration**: Exactly 30 seconds or user-stopped early

### Feature Extraction (On-Device)
All algorithms implemented in pure TypeScript (no native DSP libs):

1. **RMS Energy**: Root mean square of amplitude values
2. **Pitch (F0)**: YIN-inspired autocorrelation algorithm
3. **Spectral Centroid**: Brightness via FFT energy distribution
4. **Zero-Crossing Rate**: Simple time-domain noisiness measure
5. **Voiced Ratio**: Percentage of frames with detected pitch
6. **Jitter Proxy**: Frame-to-frame pitch variation
7. **Shimmer Proxy**: Frame-to-frame amplitude variation

### Scoring Algorithm (Deterministic)
```typescript
Energy = clamp(0, 100, normalize(rms) * 0.7 + normalize(centroid) * 0.3)
Tension = clamp(0, 100, normalize(pitchVar) * 0.6 + normalize(jitter) * 0.2 + normalize(zcr) * 0.2)
Clarity = clamp(0, 100, 100 - normalize(zcr) * 0.5 - normalize(centroidVar) * 0.5)
```

### Insight Rules (Rule-Based)
Priority-ordered deterministic rules:
1. If rms < threshold → "This sample is very quiet — results may be less reliable."
2. If tension > 70 → "More tension-like signal than typical speech."
3. If energy > 75 → "Higher energy signal in this sample."
4. If clarity < 40 → "This sample has more noise than typical speech."
5. Default → "Voice signal detected within typical range."

## Navigation Stack
```
StackNavigator
├── Home (initial)
├── Recording
├── Processing
├── Results
├── Privacy
└── Upgrade
```

## State Management
- **No Redux/Context**: Local state only via useState
- **Navigation params**: Pass minimal data between screens
- **No persistence**: All state resets on app restart

## Security & Privacy Checklist
- [x] No AsyncStorage usage
- [x] No file system writes
- [x] No network requests
- [x] No analytics SDKs
- [x] No unique identifiers
- [x] Mic permission requested only when needed
- [x] Recording stops immediately on screen exit
- [x] Audio buffer garbage collected after analysis

## Testing Strategy
- Unit tests: `scoring/` and `analysis/` modules
- No integration tests (no persistent state to verify)
- Manual testing: Permission flows, edge cases (silence, short recordings)
