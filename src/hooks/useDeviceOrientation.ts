import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// useDeviceOrientation — compass heading + tilt/orientation
// Provides: compass heading (smoothed), portrait/landscape,
// phone tilt (beta/gamma), device rotation (alpha).
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

// --- Tuning constants ---
// Heading smoothing factor (lower = smoother but more laggy)
const HEADING_SMOOTHING = 0.2;
// Tilt smoothing factor for beta/gamma (lower = smoother)
const TILT_SMOOTHING = 0.3;
// Reject heading changes larger than this (degrees) in a single update — likely sensor glitch
const HEADING_OUTLIER_THRESHOLD = 90;
// Reject tilt changes larger than this (degrees) in a single update
const TILT_OUTLIER_THRESHOLD = 60;

function getScreenOrientation(): ScreenOrientation {
  if (typeof screen === 'undefined') return 'portrait';
  if (screen.orientation?.type?.startsWith('landscape')) return 'landscape';
  if (typeof window !== 'undefined' && window.matchMedia?.('(orientation: landscape)').matches) {
    return 'landscape';
  }
  return 'portrait';
}

/** Shortest-path angular interpolation between two compass headings. */
function lerpAngle(from: number, to: number, t: number): number {
  let diff = to - from;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  const result = from + diff * t;
  return (result + 360) % 360;
}

/** Smooth a value with EMA, rejecting outliers beyond a threshold. */
function smoothValue(
  raw: number | null,
  prev: number | null,
  smoothing: number,
  outlierThreshold: number,
): number | null {
  if (raw == null || isNaN(raw)) return prev;
  if (prev == null) return raw;
  if (Math.abs(raw - prev) > outlierThreshold) return prev;
  return prev + smoothing * (raw - prev);
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
  const lastBetaRef = useRef<number | null>(null);
  const lastGammaRef = useRef<number | null>(null);
  const handlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

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

      // Smooth heading with outlier rejection
      if (heading != null && !isNaN(heading)) {
        if (lastHeadingRef.current == null) {
          lastHeadingRef.current = heading;
        } else {
          const diff = Math.abs(lerpAngle(lastHeadingRef.current, heading, 1) - lastHeadingRef.current);
          const wrappedDiff = Math.min(diff, 360 - diff);
          if (wrappedDiff <= HEADING_OUTLIER_THRESHOLD) {
            lastHeadingRef.current = lerpAngle(lastHeadingRef.current, heading, HEADING_SMOOTHING);
          }
        }
      }

      // Smooth tilt values with outlier rejection
      lastBetaRef.current = smoothValue(e.beta, lastBetaRef.current, TILT_SMOOTHING, TILT_OUTLIER_THRESHOLD);
      lastGammaRef.current = smoothValue(e.gamma, lastGammaRef.current, TILT_SMOOTHING, TILT_OUTLIER_THRESHOLD);

      setState((s) => ({
        ...s,
        heading: lastHeadingRef.current,
        alpha: e.alpha,
        beta: lastBetaRef.current,
        gamma: lastGammaRef.current,
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
  }, []);

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
