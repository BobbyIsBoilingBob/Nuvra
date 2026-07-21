import { useState } from 'react'
import { Bot, Sparkles, Info } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import GeneratorForm from '@/components/GeneratorForm'
import type { AdventurePreferences, Adventure, GpsStatus, ScreenName } from '@/types/adventure'
import { generateAdventure, generateSuggestedAdventures } from '@/lib/generator'
import { detectSensors } from '@/lib/sensors'

interface Props {
  onBack: () => void
  onPreview: (adventure: Adventure) => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

export default function AIGeneratorScreen({ onBack, onPreview, onToast }: Props) {
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async (prefs: AdventurePreferences, center: { lat: number; lng: number } | null, locationName: string) => {
    setGenerating(true)
    try {
      const fallbackCenter = center ?? { lat: 51.5074, lng: -0.1278 }
      const adventure = generateAdventure({
        center: fallbackCenter,
        locationName,
        locationSource: center ? 'gps' : 'manual',
        preferences: prefs,
        sensorAvail: detectSensors(),
      })
      onToast('success', 'Adventure generated!', `${adventure.checkpoints.length} checkpoints · ${adventure.distanceKm.toFixed(1)} km`)
      onPreview(adventure)
    } catch (e) {
      onToast('error', 'Generation failed', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <ScreenShell title="AI Adventure Generator" icon={<Bot size={18} className="text-brand-400" />} onBack={onBack}>
      <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-3 mb-5 flex items-start gap-2.5">
        <Info size={16} className="text-brand-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-ink-300">Describe your ideal adventure and the AI will generate a custom route with checkpoints, challenges, and sensors.</p>
      </div>

      {generating ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-3">
            <Sparkles size={28} className="text-brand-400 animate-pulse" />
          </div>
          <p className="text-sm text-ink-300">Generating your adventure...</p>
        </div>
      ) : (
        <GeneratorForm onGenerate={handleGenerate} gpsStatus={gpsStatus} setGpsStatus={setGpsStatus} />
      )}

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-ink-200 mb-3">Suggested Adventures</h3>
        <SuggestedList onPreview={onPreview} />
      </div>
    </ScreenShell>
  )
}

function SuggestedList({ onPreview }: { onPreview: (a: Adventure) => void }) {
  const [suggestions] = useState(() => generateSuggestedAdventures({ lat: 51.5074, lng: -0.1278 }, { compass: true, accelerometer: true, gyroscope: false, camera: true, gps: true }))
  return (
    <div className="space-y-2">
      {suggestions.map(s => (
        <button key={s.adventure.id} onClick={() => onPreview(s.adventure)}
          className="w-full text-left bg-ink-900 border border-ink-800 rounded-xl p-3 hover:border-ink-700 transition active:scale-95">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-100">{s.adventure.title}</p>
              <p className="text-xs text-ink-500 mt-0.5">{s.adventure.locationName} · {s.adventure.distanceKm.toFixed(1)} km · {s.adventure.durationMin} min</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${s.isNearby ? 'bg-success-500/20 text-success-400' : 'bg-ink-800 text-ink-400'}`}>
              {s.isNearby ? 'Nearby' : `${s.travelTimeMin} min away`}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
