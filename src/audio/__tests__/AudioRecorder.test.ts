import { concatenatePcmChunks } from '../AudioRecorder';

describe('in-memory PCM recording', () => {
  it('concatenates chunks without dropping or changing samples', () => {
    const audio = concatenatePcmChunks(
      [new Float32Array([0.25, -0.5]), new Float32Array([0, 0.75])],
      16000
    );
    expect(Array.from(audio.samples)).toEqual([0.25, -0.5, 0, 0.75]);
    expect(audio.sampleRate).toBe(16000);
    expect(audio.channels).toBe(1);
    expect(audio.durationMs).toBeCloseTo(0.25);
  });

  it('handles silence and rejects unknown sample rates', () => {
    expect(concatenatePcmChunks([], 16000).samples).toHaveLength(0);
    expect(() => concatenatePcmChunks([], 0)).toThrow('Invalid microphone sample rate');
  });
});
