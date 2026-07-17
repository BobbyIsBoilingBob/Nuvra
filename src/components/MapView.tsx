import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng } from '../lib/map-utils';

// ============================================================
// MapView — real interactive Leaflet map
// Uses OpenStreetMap tiles (free, no API key needed).
// Supports standard, satellite, and terrain tile layers.
// ============================================================

export type MapStyle = 'standard' | 'satellite' | 'terrain';

export interface MapMarkerData {
  id: string;
  position: LatLng;
  type: 'player' | 'start' | 'finish' | 'checkpoint' | 'challenge' | 'treasure' | 'coin' | 'event' | 'rest' | 'landmark' | 'multiplayer';
  label?: string;
  emoji?: string;
  color?: string;
  completed?: boolean;
  pulsing?: boolean;
  onClick?: () => void;
}

export interface MapRouteData {
  id: string;
  positions: LatLng[];
  color: string;
  weight?: number;
  dashed?: boolean;
  animated?: boolean;
}

interface MapViewProps {
  center: LatLng;
  zoom?: number;
  style?: MapStyle;
  markers?: MapMarkerData[];
  routes?: MapRouteData[];
  followPlayer?: boolean;
  playerHeading?: number | null;
  /** GPS accuracy in meters — renders an accuracy circle around the player */
  accuracy?: number | null;
  onMapClick?: (pos: LatLng) => void;
  onStyleChange?: (style: MapStyle) => void;
  className?: string;
}

const TILE_LAYERS: Record<MapStyle, { url: string; attribution: string; maxZoom: number }> = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
  },
};

// --- Custom marker icons ---
function createDivIcon(html: string, className: string, iconSize: [number, number]): L.DivIcon {
  return L.divIcon({
    html,
    className: `nuvra-marker ${className}`,
    iconSize,
    iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
  });
}

// Player icon: rotation is applied via CSS variable so we can update heading
// without recreating the entire icon (avoids DOM thrash).
function playerIcon(heading: number | null): L.DivIcon {
  const rotation = heading != null ? `--player-rot: ${heading}deg;` : '--player-rot: 0deg;';
  return createDivIcon(
    `<div class="nuvra-player-marker" style="${rotation}">
      <div class="nuvra-player-pulse"></div>
      <div class="nuvra-player-pulse nuvra-player-pulse-2"></div>
      <div class="nuvra-player-dot"></div>
    </div>`,
    'nuvra-player',
    [40, 40],
  );
}

function checkpointIcon(emoji: string, color: string, completed: boolean, pulsing: boolean): L.DivIcon {
  const pulseClass = pulsing && !completed ? 'nuvra-cp-pulse' : '';
  const opacity = completed ? 'opacity: 0.5;' : '';
  const checkOverlay = completed ? '<div class="nuvra-cp-check">✓</div>' : '';
  return createDivIcon(
    `<div class="nuvra-cp-marker ${pulseClass}" style="background: ${color}; ${opacity}">
      <span class="nuvra-cp-emoji">${emoji}</span>
      ${checkOverlay}
    </div>`,
    'nuvra-checkpoint',
    [32, 32],
  );
}

function treasureIcon(emoji: string, collected: boolean): L.DivIcon {
  if (collected) {
    return createDivIcon(
      `<div class="nuvra-treasure-marker nuvra-treasure-collected"><span>✓</span></div>`,
      'nuvra-treasure',
      [28, 28],
    );
  }
  return createDivIcon(
    `<div class="nuvra-treasure-marker nuvra-treasure-glow"><span>${emoji}</span></div>`,
    'nuvra-treasure',
    [28, 28],
  );
}

function coinIcon(collected: boolean): L.DivIcon {
  if (collected) return createDivIcon('', 'nuvra-coin-collected', [16, 16]);
  return createDivIcon(
    `<div class="nuvra-coin-marker"><span>●</span></div>`,
    'nuvra-coin',
    [16, 16],
  );
}

function eventIcon(emoji: string, color: string): L.DivIcon {
  return createDivIcon(
    `<div class="nuvra-event-marker" style="border-color: ${color};">
      <span>${emoji}</span>
    </div>`,
    'nuvra-event',
    [36, 36],
  );
}

function multiplayerIcon(emoji: string, username: string, level: number, heading: number | null): L.DivIcon {
  const rotation = heading != null ? `transform: rotate(${heading}deg);` : '';
  return createDivIcon(
    `<div class="nuvra-mp-marker" style="${rotation}">
      <div class="nuvra-mp-avatar">${emoji}</div>
      <div class="nuvra-mp-badge">Lv${level}</div>
      <div class="nuvra-mp-name">${username}</div>
    </div>`,
    'nuvra-multiplayer',
    [44, 56],
  );
}

export function MapView({
  center,
  zoom = 15,
  style = 'standard',
  markers = [],
  routes = [],
  followPlayer = false,
  playerHeading = null,
  accuracy = null,
  onMapClick,
  onStyleChange,
  className = '',
}: MapViewProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const routesRef = useRef<Map<string, L.Polyline>>(new Map());
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const animationTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastCenterRef = useRef<LatLng | null>(null);
  const playerMarkerRef = useRef<L.Marker | null>(null);

  // --- Initialize map ---
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelDebounceTime: 40,
      inertia: true,
      inertiaDeceleration: 3000,
      maxBoundsViscosity: 0.8,
    });
    mapRef.current = map;
    lastCenterRef.current = center;

    const tileConfig = TILE_LAYERS[style];
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      keepBuffer: 2,
      updateWhenZooming: false,
    }).addTo(map);

    map.zoomControl.setPosition('bottomright');

    return () => {
      // Clean up all animation timeouts
      for (const t of animationTimeoutsRef.current) clearTimeout(t);
      animationTimeoutsRef.current = [];
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      routesRef.current.clear();
      accuracyCircleRef.current = null;
      playerMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Update tile layer when style changes ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);
    const tileConfig = TILE_LAYERS[style];
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      keepBuffer: 2,
      updateWhenZooming: false,
    }).addTo(map);
  }, [style]);

  // --- Smooth camera movement (follow mode) ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !followPlayer) return;

    // Avoid re-panning if the center hasn't meaningfully changed
    if (lastCenterRef.current) {
      const dLat = center.lat - lastCenterRef.current.lat;
      const dLng = center.lng - lastCenterRef.current.lng;
      if (Math.abs(dLat) < 1e-7 && Math.abs(dLng) < 1e-7) return;
    }
    lastCenterRef.current = center;

    map.panTo([center.lat, center.lng], { animate: true, duration: 0.6, easeLinearity: 0.25 });
  }, [center, followPlayer]);

  // --- Handle map click ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onMapClick) return;
    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [onMapClick]);

  // --- Update accuracy circle ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing circle if accuracy is null or map not ready
    if (accuracy == null || accuracy <= 0) {
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.remove();
        accuracyCircleRef.current = null;
      }
      return;
    }

    const playerMarker = markersRef.current.get('player');
    const pos = playerMarker?.getLatLng();

    if (accuracyCircleRef.current && pos) {
      accuracyCircleRef.current.setLatLng(pos);
      accuracyCircleRef.current.setRadius(accuracy);
    } else if (pos) {
      accuracyCircleRef.current = L.circle(pos, {
        radius: accuracy,
        color: '#40f5cb',
        weight: 1,
        opacity: 0.4,
        fillColor: '#40f5cb',
        fillOpacity: 0.08,
        interactive: false,
      }).addTo(map);
    }
  }, [accuracy, markers]);

  // --- Update player heading via CSS transform (no icon recreation) ---
  useEffect(() => {
    if (playerMarkerRef.current == null || playerHeading == null) return;
    const el = playerMarkerRef.current.getElement();
    if (!el) return;
    const inner = el.querySelector('.nuvra-player-marker') as HTMLElement | null;
    if (inner) {
      inner.style.setProperty('--player-rot', `${playerHeading}deg`);
    }
  }, [playerHeading]);

  // --- Update markers ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set<string>();

    for (const m of markers) {
      currentIds.add(m.id);
      const existing = markersRef.current.get(m.id);

      // For player marker, only update position — heading is handled via CSS transform
      if (m.type === 'player') {
        if (existing) {
          existing.setLatLng([m.position.lat, m.position.lng]);
          playerMarkerRef.current = existing;
        } else {
          const icon = playerIcon(playerHeading);
          const marker = L.marker([m.position.lat, m.position.lng], { icon, zIndexOffset: 1000 }).addTo(map);
          if (m.onClick) marker.on('click', m.onClick);
          markersRef.current.set(m.id, marker);
          playerMarkerRef.current = marker;
        }
        continue;
      }

      let icon: L.DivIcon;
      switch (m.type) {
        case 'start':
          icon = checkpointIcon('▶', '#22c55e', m.completed ?? false, false);
          break;
        case 'finish':
          icon = checkpointIcon('🏁', '#fbbf24', m.completed ?? false, false);
          break;
        case 'checkpoint':
          icon = checkpointIcon(m.emoji ?? '📍', m.color ?? '#40f5cb', m.completed ?? false, m.pulsing ?? true);
          break;
        case 'challenge':
          icon = checkpointIcon(m.emoji ?? '⚔️', m.color ?? '#fb923c', m.completed ?? false, m.pulsing ?? true);
          break;
        case 'treasure':
          icon = treasureIcon(m.emoji ?? '💎', m.completed ?? false);
          break;
        case 'coin':
          icon = coinIcon(m.completed ?? false);
          break;
        case 'event':
          icon = eventIcon(m.emoji ?? '🎉', m.color ?? '#a78bfa');
          break;
        case 'rest':
          icon = checkpointIcon('☕', '#94a3b8', m.completed ?? false, false);
          break;
        case 'landmark':
          icon = checkpointIcon(m.emoji ?? '🏛️', m.color ?? '#60a5fa', false, false);
          break;
        case 'multiplayer':
          icon = multiplayerIcon(m.emoji ?? '🧭', m.label ?? 'Player', 1, null);
          break;
        default:
          icon = checkpointIcon(m.emoji ?? '📍', m.color ?? '#40f5cb', false, false);
      }

      if (existing) {
        existing.setLatLng([m.position.lat, m.position.lng]);
        existing.setIcon(icon);
      } else {
        const marker = L.marker([m.position.lat, m.position.lng], { icon }).addTo(map);
        if (m.onClick) marker.on('click', m.onClick);
        if (m.label) marker.bindTooltip(m.label, { direction: 'top', offset: [0, -16] });
        markersRef.current.set(m.id, marker);
      }
    }

    // Remove stale markers
    for (const [id, marker] of markersRef.current) {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
        if (id === 'player') playerMarkerRef.current = null;
      }
    }
  }, [markers, playerHeading]);

  // --- Update routes ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set<string>();

    for (const r of routes) {
      currentIds.add(r.id);
      const latlngs = r.positions.map((p) => [p.lat, p.lng] as [number, number]);
      const existing = routesRef.current.get(r.id);

      if (existing) {
        existing.setLatLngs(latlngs);
      } else {
        const polyline = L.polyline(latlngs, {
          color: r.color,
          weight: r.weight ?? 4,
          opacity: 0.8,
          dashArray: r.dashed ? '8 6' : undefined,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        if (r.animated) {
          const totalPoints = latlngs.length;
          let drawn = 1;
          const animate = () => {
            if (drawn >= totalPoints) return;
            polyline.setLatLngs(latlngs.slice(0, drawn + 1));
            drawn++;
            const t = setTimeout(animate, 80);
            animationTimeoutsRef.current.push(t);
          };
          polyline.setLatLngs(latlngs.slice(0, 1));
          const t = setTimeout(animate, 100);
          animationTimeoutsRef.current.push(t);
        }

        routesRef.current.set(r.id, polyline);
      }
    }

    // Remove stale routes
    for (const [id, route] of routesRef.current) {
      if (!currentIds.has(id)) {
        route.remove();
        routesRef.current.delete(id);
      }
    }
  }, [routes]);

  // --- Invalidate size on mount (fixes initial render) ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, []);

  // --- Style switcher control ---
  const switchStyle = useCallback((s: MapStyle) => {
    onStyleChange?.(s);
  }, [onStyleChange]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="absolute inset-0 z-0" style={{ background: '#0a0e1a' }} />

      {/* Map style switcher overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex gap-1 glass-strong rounded-xl p-1">
        {(['standard', 'satellite', 'terrain'] as MapStyle[]).map((s) => (
          <button
            key={s}
            onClick={() => switchStyle(s)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              style === s
                ? 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950'
                : 'text-white/60 hover:text-white'
            }`}
            aria-label={`Switch to ${s} map`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
