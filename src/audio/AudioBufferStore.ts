import { AudioBuffer } from '@/analysis/types';

let pendingAudioBuffer: AudioBuffer | null = null;

export function setPendingAudioBuffer(buffer: AudioBuffer): void {
  pendingAudioBuffer = buffer;
}

export function consumePendingAudioBuffer(): AudioBuffer | null {
  const buffer = pendingAudioBuffer;
  pendingAudioBuffer = null;
  return buffer;
}

