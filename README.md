# Sonic State

**30s Voice Snapshot Analyzer** — Private, On-Device

A fast "sound check for your voice state" in 30 seconds. Completely private with no storage, no tracking, and no cloud.

---

## What It Does

Sonic State analyzes a 30-second voice recording and returns simple "state signals" based on acoustic features:

- **Energy** (0-100): Voice intensity and brightness
- **Tension** (0-100): Pitch variation and instability signals
- **Clarity** (0-100): Voice clarity vs. noise ratio

Plus one short insight based on rule-based analysis.

---

## What It Does NOT Do

| Feature | Status |
|---------|--------|
| Speech recognition / transcription | ❌ Not implemented |
| Store recordings | ❌ Nothing saved |
| Store history | ❌ Single-session only |
| Track users | ❌ No identifiers |
| Cloud processing | ❌ 100% on-device |
| Analytics SDKs | ❌ Console logs only |

---

## Privacy Statement

**Sonic State is designed for zero data collection.**

- No recordings are stored (memory-only processing)
- No user accounts or identifiers
- No network calls to external servers
- No analytics or tracking SDKs
- No persistent storage of any kind
- Microphone access is requested only when needed
- All audio buffers are released immediately after analysis

Each session is completely independent. Closing the app clears all data.

---

## Tech Stack

- **Framework**: React Native with Expo (TypeScript)
- **Audio**: Expo AV (16kHz mono recording)
- **Analysis**: Pure TypeScript signal processing
  - YIN-inspired pitch detection
  - FFT-based spectral analysis
  - RMS energy calculation
  - Zero-crossing rate analysis
- **Navigation**: React Navigation (Stack)
- **State**: Local component state only (no Redux/Context)

---

## Setup Instructions

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (Mac only) or Android: Android Studio

### Installation

```bash
# Clone or extract the project
cd sonic-state

# Install dependencies
npm install

# Start the development server
npm start
# or
expo start
```

### Running on Device/Simulator

```bash
# iOS Simulator (Mac only)
i# Press 'i' in the Expo CLI or:
npm run ios

# Android Emulator
# Press 'a' in the Expo CLI or:
npm run android

# Expo Go on physical device
# Scan the QR code from `npm start` with Expo Go app
```

---

## Project Structure

```
sonic-state/
├── App.tsx                      # Root component
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── babel.config.js             # Babel + path aliases
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx     # React Navigation setup
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Entry: CTA to record
│   │   ├── RecordingScreen.tsx  # 30s countdown recording
│   │   ├── ProcessingScreen.tsx # "Analyzing..." spinner
│   │   ├── ResultsScreen.tsx    # 3 scores + insight
│   │   ├── PrivacyScreen.tsx    # Privacy explanation
│   │   └── UpgradeScreen.tsx    # Premium features outline
│   ├── audio/
│   │   ├── AudioRecorder.ts     # Expo AV recording wrapper
│   │   └── AudioUtils.ts        # PCM conversion utilities
│   ├── analysis/
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── FeatureExtractor.ts  # Extract 5-7 acoustic features
│   │   └── PitchDetector.ts     # YIN-style pitch detection
│   ├── scoring/
│   │   ├── ScoreCalculator.ts   # Map features to 0-100 scores
│   │   ├── InsightEngine.ts     # Rule-based insight generation
│   │   └── __tests__/           # Unit tests
│   ├── components/
│   │   ├── ScoreBar.tsx         # Visual score display
│   │   ├── InsightCard.tsx      # Insight display component
│   │   └── PrivacyBadge.tsx     # "Nothing stored" badge
│   ├── hooks/
│   │   └── useAudioPermissions.ts # Mic permission handling
│   └── utils/
│       └── Logger.ts            # Console-only logging
```

---

## Feature Extraction

Extracted features (all on-device):

1. **RMS Energy Mean** - Overall loudness
2. **Pitch (F0) Mean + Variance** - Fundamental frequency and stability
3. **Spectral Centroid Mean** - Brightness/timbre
4. **Zero-Crossing Rate** - Noisiness/texture proxy
5. **Voiced Ratio** - Percentage of frames with detected voice
6. **Jitter Proxy** - Frame-to-frame pitch variation
7. **Shimmer Proxy** - Frame-to-frame amplitude variation

---

## Scoring Algorithm

Scores are deterministic mappings from features to 0-100:

```
Energy = normalize(RMS) * 0.7 + normalize(Centroid) * 0.3
Tension = normalize(PitchVar) * 0.6 + normalize(Jitter) * 0.2 + normalize(ZCR) * 0.2
Clarity = 100 - normalize(ZCR) * 0.5 - normalize(CentroidVar) * 0.5
```

All scores are clamped to 0-100 and rounded to integers.

---

## Insight Rules (Priority-Ordered)

1. **Too Quiet** (RMS < 0.015) → "This sample is very quiet — results may be less reliable."
2. **No Voice** (VoicedRatio < 0.1) → "No clear voice signal detected. Try speaking closer to the microphone."
3. **Very Short** (< 5s) → "Recording was very short — results may be less reliable."
4. **High Tension** (> 75) → "More tension-like signal than typical speech."
5. **Very High Energy** (> 80) → "Higher energy signal in this sample."
6. **Very Low Energy** (< 25) → "Lower energy signal — voice may sound subdued."
7. **Low Clarity** (< 35) → "This sample has more noise than typical speech."
8. **High Clarity** (> 80 + Energy > 50) → "Clear, well-projected voice signal detected."
9. **Default** → "Voice signal detected within typical range."

---

## Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Test Coverage

- `ScoreCalculator.test.ts` - Score calculation logic
- `InsightEngine.test.ts` - Insight rule matching

---

## Future Premium Plan (Coming Soon)

### Free
- Single-session snapshots
- Basic scores (Energy, Tension, Clarity)
- On-device privacy
- No account required

### Pro - €4.99/month or €29.99/year
- **History & Trends** — See how your voice changes over time
- **Weekly Insights** — Pattern detection across snapshots
- **Export Data** — Download history as CSV/JSON
- **Optional Cloud Sync** — Encrypted backup (opt-in only)
- **Advanced Metrics** — Additional acoustic features
- **No Ads** — Clean experience forever

**Privacy-first even in Pro:** All analysis still happens on-device. Optional cloud sync uses end-to-end encryption. You own your data.

---

## Hard Constraints (Enforced)

- ✅ No database (no SQLite, no Postgres)
- ✅ No accounts / auth
- ✅ No persistent identifiers
- ✅ No background analytics SDKs
- ✅ No saving recordings
- ✅ No saving features/scores across app restarts
- ✅ Immediate cleanup of audio buffers

---

## License

MIT License - See LICENSE file for details.

---

## Disclaimer

Sonic State provides acoustic signal analysis only. It does not diagnose, treat, or assess medical or psychological conditions. Results are "signals" or "suggestions" based on sound properties, not facts about your health or emotions.
