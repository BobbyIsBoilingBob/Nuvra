import { useState, useEffect, useCallback } from 'react'
import { MapPin, Plus, Trash2, Save, Navigation } from 'lucide-react'
import { getCurrentPosition } from '@/lib/sensors'
import { useToasts, ToastContainer } from '@/components/Toast'
import { MapContainer, TileLayer, Marker, useMapEvents, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'

interface Props { onNavigate: (s: string) => void }
const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
function makeIcon() { return L.divIcon({ html: '<div style="width:20px;height:20px;background:#10b981;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', className: '', iconSize: [20, 20], iconAnchor: [10, 10] }) }
function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) { useMapEvents({ click(e) { onClick(e.latlng.lat, e.latlng.lng) } }); return null }

export default function CreatorScreen({ onNavigate }: Props) {
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 51.5074, lng: -0.1278 })
  const [checkpoints, setCheckpoints] = useState<{ lat: number; lng: number; title: string }[]>([])
  const [title, setTitle] = useState('')
  const { toasts, push, dismiss } = useToasts()
  useEffect(() => { (async () => { const p = await getCurrentPosition(); if (p) setCenter({ lat: p.lat, lng: p.lng }) })() }, [])
  const handleMapClick = useCallback((lat: number, lng: number) => { setCheckpoints(prev => [...prev, { lat, lng, title: 'Checkpoint ' + (prev.length + 1) }]) }, [])
  const removeCheckpoint = (i: number) => setCheckpoints(prev => prev.filter((_, idx) => idx !== i))
  const handleSave = () => { if (!title.trim()) { push('error', 'Enter a title'); return } if (checkpoints.length < 2) { push('error', 'Add at least 2 checkpoints'); return } push('success', 'Adventure saved!', checkpoints.length + ' checkpoints'); setTimeout(() => onNavigate('community'), 1000) }
  return (
    <>
      <ScreenShell title="Creator" subtitle="Design custom adventures" onBack={() => onNavigate('home')} actions={[{ icon: <Save size={18} />, onClick: handleSave, label: 'Save' }]}>
        <div className="space-y-4">
          <div><label className="text-xs font-semibold text-ink-500 mb-1.5 block">Adventure Name</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My custom adventure..." className="input-field" /></div>
          <div><p className="section-label flex items-center gap-1.5"><Navigation size={12} /> Tap map to add checkpoints</p><div className="rounded-2xl overflow-hidden border border-surface-200 shadow-card"><MapContainer center={[center.lat, center.lng]} zoom={14} className="w-full h-64" scrollWheelZoom={false}><TileLayer url={tileUrl} subdomains='abcd' maxZoom={20} /><ClickHandler onClick={handleMapClick} />{checkpoints.map((cp, i) => <Marker key={i} position={[cp.lat, cp.lng]} icon={makeIcon()} />)}<CircleMarker center={[center.lat, center.lng]} radius={8} pathOptions={{ color: '#312f81', fillColor: '#312f81', fillOpacity: 0.3 }} /></MapContainer></div></div>
          <div><h3 className="section-label flex items-center gap-1.5"><MapPin size={12} /> Checkpoints ({checkpoints.length})</h3>{checkpoints.length === 0 ? <div className="bg-surface-50 border border-dashed border-surface-300 rounded-xl p-6 text-center"><MapPin size={24} className="text-ink-300 mx-auto mb-2" /><p className="text-sm text-ink-400">Tap the map to add checkpoints</p></div> : <div className="space-y-2">{checkpoints.map((cp, i) => <div key={i} className="bg-white border border-surface-200 rounded-xl p-3 flex items-center gap-3 shadow-card"><div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">{i + 1}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-ink-900">{cp.title}</p><p className="text-xs text-ink-400">{cp.lat.toFixed(4)}, {cp.lng.toFixed(4)}</p></div><button onClick={() => removeCheckpoint(i)} className="w-8 h-8 rounded-lg bg-surface-100 text-ink-400 hover:bg-error-50 hover:text-error-500 flex items-center justify-center btn-press transition"><Trash2 size={14} /></button></div>)}</div>}</div>
          <button onClick={handleSave} className="btn-primary flex items-center justify-center gap-2"><Save size={18} /> Save Adventure</button>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
