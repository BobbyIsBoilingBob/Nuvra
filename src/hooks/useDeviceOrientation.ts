import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// useDeviceOrientation — compass heading + tilt/orientation
// Provides: compass heading (smoothed), portrait/landscape,
// phone tilt (beta/gamma), phone rotation (alpha).
// Gracefully falls back if sensors are unavailable.
// ============================================================

export type ScreenOrientation = 'portrait' | 'landscape';

export interface DeviceOrientationState {
  /** Compass heading in degrees (0 = north, clockwise). Null if unavailable. */
  heading: number | null;
  /** Device alpha rotation (0-360). Null if unavailable. */
  alpha: number | null;
  /** Front-back tilt in degrees (-180 to 180). Null if unavailable. */
  beta: number | null;
  /** Left-right tilt in degrees (-90 to 90). Null if unavailable. */
  gamma: number | null;
  /** Screen orientation. */
  orientation: ScreenOrientation;
  /** Whether device orientation sensors are available. */
  supported: boolean;
  /** Whether we have permission (iOS requires explicit request). */
  hasPermission: boolean;
}

function getScreenOrientation(): ScreenOrientation {
  if (typeof screen === 'undefined') return 'portrait';
  if (screen.orientation?.type?.startsWith('landscape')) return 'landscape';
  if (typeof window !== 'undefined' && window.matchMedia?.('(orientation: landscape)').matches) {
    return 'landscape';
  }
  return 'portrait';
}

export function useDeviceOrientation(enabled: boolean): DeviceOrientationState & {
  requestPermission: () => Promise<void>;
} {
  const [state, setState] = useState<DeviceOrientationState>({
    heading: null,
    alpha: null,
    beta: null,
    gamma: null,
    orientation: getScreenOrientation(),
    supported: typeof window !== 'undefined' && 'DeviceOrientationEvent' in window,
    hasPermission: false,
  });

  const lastHeadingRef = useRef<number | null>(null);
  const handlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const smoothHeadingValue = useCallback((raw: number | null): number | null => {
    if (raw == null || isNaN(raw)) return lastHeadingRef.current;
    if (lastHeadingRef.current == null) {
      lastHeadingRef.current = raw;
      return raw;
    }
    let diff = raw - lastHeadingRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const smoothed = lastHeadingRef.current + diff * 0.2;
    const normalized = (smoothed + 360) % 360;
    lastHeadingRef.current = normalized;
    return normalized;
  }, []);

  const attachListener = useCallback(() => {
    if (handlerRef.current) return;

    const handler = (e: DeviceOrientationEvent) => {
      const compassHeading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      let heading: number | null = null;

      if (typeof compassHeading === 'number' && !isNaN(compassHeading)) {
        heading = compassHeading;
      } else if (e.alpha != null && !isNaN(e.alpha)) {
        heading = 360 - e.alpha;
      }

      setState((s) => ({
        ...s,
        heading: smoothHeadingValue(heading),
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma,
        hasPermission: true,
      }));
    };

    handlerRef.current = handler;

    if (typeof window !== 'undefined') {
      const win = window as unknown as Record<string, unknown>;
      const opts: AddEventListenerOptions = { passive: true };
      if ('ondeviceorientationabsolute' in win) {
        window.addEventListener('deviceorientationabsolute', handler as EventListener, opts);
      } else {
        window.addEventListener('deviceorientation', handler as EventListener, opts);
      }
    }
  }, [smoothHeadingValue]);

  const detachListener = useCallback(() => {
    if (handlerRef.current && typeof window !== 'undefined') {
      window.removeEventListener('deviceorientationabsolute', handlerRef.current as EventListener);
      window.removeEventListener('deviceorientation', handlerRef.current as EventListener);
      handlerRef.current = null;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.supported) return;

    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof DOE?.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        if (result === 'granted') {
          attachListener();
        }
      } catch {
        // Permission denied
      }
    } else {
      attachListener();
    }
  }, [state.supported, attachListener]);

  // Screen orientation tracking
  useEffect(() => {
    const updateOrientation = () => setState((s) => ({ ...s, orientation: getScreenOrientation() }));
    updateOrientation();

    if (typeof screen !== 'undefined' && screen.orientation) {
      screen.orientation.addEventListener('change', updateOrientation);
      return () => screen.orientation?.removeEventListener('change', updateOrientation);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateOrientation);
      return () => window.removeEventListener('resize', updateOrientation);
    }
  }, []);

  // Auto-attach on non-iOS devices
  useEffect(() => {
    if (!enabled || !state.supported) return;

    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: unknown };
    if (typeof DOE?.requestPermission !== 'function') {
      attachListener();
    }

    return () => detachListener();
  }, [enabled, state.supported, attachListener, detachListener]);

  return {
    ...state,
    requestPermission,
  };
}
