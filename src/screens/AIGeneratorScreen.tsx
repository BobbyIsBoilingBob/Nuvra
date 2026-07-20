import { useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import GeneratorForm from '@/components/GeneratorForm'
import type { AdventurePreferences, Adventure, GpsStatus, SensorAvailability } from '@/types/adventure'
import { generateAdventure, generateSuggestedAdventures } from '@/lib/generator'
import { detectSensors } from '@/lib/sensors'
import { formatDistance, formatDuration } from '@/lib/geo'

interface Props {
  onBack: () => void
  onPreview: (adventure: Adventure) => void
}

export default function AIGeneratorScreen({ onBack, onPreview }: Props) {
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')
  const [suggested, setSuggested] = useState(() => {
    const sensorAvail = detectSensors()
    // Use a default center for suggested adventures display
    return generateSuggestedAdventures({ lat: -27.4698, lng: 153.0251 }, sensorAvail)
  })

  const handleGenerate = (prefs: AdventurePreferences, center: { lat: number; lng: number } | null, locationName: string) => {
    const sensorAvail = detectSensors()
    if (!center || (center.lat === 0 && center.lng === 0)) {
      alert('Could not determine your location. Please enter a location or enable GPS.')
      return
    }
    const adventure = generateAdventure({
      center,
      locationName,
      locationSource: center ? 'manual' : 'gps',
      preferences: prefs,
      sensorAvail,
    })
    onPreview(adventure)
  }

  return (
    <ScreenShell title="AI Adventure Generator" icon="🤖" onBack={onBack}>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-ink-100 mb-1">Generate Your Adventure</h2>
        <p className="text-sm text-ink-400">AI-crafted routes with challenges tailored to your location and preferences.</p>
      </div>

      <GeneratorForm onGenerate={handleGenerate} gpsStatus={gpsStatus} setGpsStatus={setGpsStatus} />

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-ink-300 mb-3">Suggested Adventures</h3>
        <div className="space-y-2">
          {suggested.map((s, i) => (
            <button
              key={i}
              onClick={() => onPreview(s.adventure)}
              className="w-full text-left bg-ink-900 rounded-xl p-3 border border-ink-800 hover:border-brand-500/50 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-ink-200">{s.adventure.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {formatDistance(s.adventure.distanceKm)} · {formatDuration(s.adventure.durationMin)} · {s.adventure.difficulty}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-400">{s.travelTimeMin} min away</p>
                  {s.isNearby && <span className="text-xs text-brand-400">Nearby</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </ScreenShell>
  )
}
