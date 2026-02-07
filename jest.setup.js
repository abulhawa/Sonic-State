// Jest setup file
// Add any global test configurations here

// Mock Expo modules
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Recording: {
      createAsync: jest.fn(() => Promise.resolve({
        recording: {
          stopAndUnloadAsync: jest.fn(() => Promise.resolve()),
          getURI: jest.fn(() => 'file://test.wav'),
          getStatusAsync: jest.fn(() => Promise.resolve({ isRecording: false })),
        },
      })),
    },
    AndroidOutputFormat: { DEFAULT: 0 },
    AndroidAudioEncoder: { DEFAULT: 0 },
    IOSAudioQuality: { HIGH: 96 },
  },
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
