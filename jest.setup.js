// Expo SDK 58 audio stream permission and mode mocks.
jest.mock('expo-audio', () => ({
  AudioModule: {
    requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
    getRecordingPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  },
  setAudioModeAsync: jest.fn(async () => undefined),
  useAudioStream: jest.fn(() => ({ stream: { start: jest.fn(), stop: jest.fn() } })),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Silence console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
// };
