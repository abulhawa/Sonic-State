/**
 * Hook for managing audio recording permissions
 */

import { useState, useEffect, useCallback } from 'react';
import {
  requestMicrophonePermission,
  checkMicrophonePermission,
} from '@/audio/AudioRecorder';
import Logger from '@/utils/Logger';

interface UseAudioPermissionsReturn {
  hasPermission: boolean | null;
  isRequesting: boolean;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<boolean>;
}

/**
 * Hook to manage microphone permissions
 */
export function useAudioPermissions(): UseAudioPermissionsReturn {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  // Check permission on mount
  useEffect(() => {
    checkMicrophonePermission().then((granted) => {
      setHasPermission(granted);
      Logger.log('app_started', { hasMicPermission: granted });
    });
  }, []);

  /**
   * Request microphone permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    try {
      const granted = await requestMicrophonePermission();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      Logger.error('Error requesting permission', error);
      setHasPermission(false);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  /**
   * Check current permission status
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await checkMicrophonePermission();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      Logger.error('Error checking permission', error);
      return false;
    }
  }, []);

  return {
    hasPermission,
    isRequesting,
    requestPermission,
    checkPermission,
  };
}

export default useAudioPermissions;
