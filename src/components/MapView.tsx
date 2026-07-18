import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { routeToLatLngs } from '../lib/map-utils';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    const ro = new ResizeObserver(() => map.invalidateSize());
    const container = map.getContainer();
    ro.observe(container);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [map]);
  return null;
}

type MapViewProps = {
  center: [number, number];
  markers?: { position: [number, number]; popup?: string }[];
  route?: { lat: number; lng: number }[];
  zoom?: number;
};

export function MapView({ center, markers = [], route = [], zoom = 15 }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%', minHeight: '200px' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', minHeight: '200px' }} className="rounded-2xl">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        <MapResizer />
        {markers.map((m, i) => (
          <Marker key={i} position={m.position}>
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
        {route.length > 1 && <Polyline positions={routeToLatLngs(route)} color="#fbbf24" weight={4} opacity={0.7} />}
      </MapContainer>
    </div>
  );
}
