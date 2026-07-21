import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Bot, MapPin, Route, Clock, Mountain, ChevronRight, Navigation } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { generateAdventure, generateSuggestedAdventures } from '@/lib/generator'
import { saveAdventure } from '@/lib/db'
import { detectSensors } from '@/lib/sensors'
import { getCurrentPosition } from '@/lib/gps'
import type { Adventure, AdventurePreferences, SuggestedAdventure, GpsStatus } from '@/types/adventure'
import { difficultyIcons } from '@/data/icons'
import ScreenShell from '@/components/ScreenShell'
import GeneratorForm from '@/components/GeneratorForm'
import { useToasts, ToastContainer } from '@/components/Toast'

interface Props { onPreview: (a: Adventure) => void }

export default function AIGeneratorScreen({ onPreview }: Props) {
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')
  const [generating, setGenerating] = useState(false)
  const [suggested, setSuggested] = useState<SuggestedAdventure[]>([])
  const { toasts, push, dismiss } = useToasts()

  useEffect(() => {
    (async () => {
      const pos = await getCurrentPosition()
      const center = pos ? { lat: pos.lat, lng: pos.lng } : { lat: 0, lng: 0 }
      setSuggested(generateSuggestedAdventures(center, detectSensors()))
    })()
  }, [])

  const handleGenerate = useCallback(async (prefs: AdventurePreferences, center: { lat: number; lng: number } | null, locationName: string) => {
    setGenerating(true)
    try {
      let c = center
      if (!c) { const pos = await getCurrentPosition(); if (pos) c = { lat: pos.lat, lng: pos.lng } }
      if (!c) { push('error', 'Location needed', 'Could not determine your location'); setGenerating(false); return }
      const adv = generateAdventure({ center: c, locationName, locationSource: 'gps', preferences: prefs, sensorAvail: detectSensors() })
      const { error } = await saveAdventure(adv)
      if (error) { push('error', 'Save failed', error); setGenerating(false); return }
      push('success', 'Adventure generated!'); setTimeout(() => onPreview(adv), 600)
    } catch { push('error', 'Generation failed'); setGenerating(false) }
  }, [onPreview, push])

  const handleSuggested = useCallback(async (s: SuggestedAdventure) => {
    setGenerating(true)
    try {
      const { error } = await saveAdventure(s.adventure)
      if (error) { push('error', 'Save failed', error); setGenerating(false); return }
      push('success', `${s.adventure.locationName} ready!`); setTimeout(() => onPreview(s.adventure), 600)
    } catch { push('error', 'Generation failed'); setGenerating(false) }
  }, [onPreview, push])

  return (
    <>
      <ScreenShell title="AI Generator" subtitle="Create your adventure">
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-brand-500/10 to-accent-500/5 border border-brand-500/15 rounded-2xl p-4 flex items-start gap-3 animate-slide-up">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-white" /></div>
            <div><p className="text-sm font-bold text-ink-100">AI Adventure Generator</p><p className="text-xs text-ink-400 mt-1 leading-relaxed">Describe your ideal adventure and our AI creates a custom route with checkpoints, challenges, and surprises.</p></div>
          </div>

          {generating ? (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <div className="relative"><div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" /><Sparkles size={24} className="text-brand-400 absolute inset-0 m-auto" /></div>
              <p className="text-sm text-ink-300 mt-4 font-medium">Generating your adventure...</p>
              <p className="text-xs text-ink-500 mt-1">Creating checkpoints and challenges</p>
            </div>
          ) : (
            <GeneratorForm onGenerate={handleGenerate} gpsStatus={gpsStatus} setGpsStatus={setGpsStatus} />
          )}

          <div>
            <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Sparkles size={12} /> Suggested Adventures</h3>
            <div className="space-y-2.5">
              {suggested.map((s, i) => {
                const DiffIcon = difficultyIcons[s.adventure.difficulty]
                return (
                  <button key={i} onClick={() => handleSuggested(s)} disabled={generating} className="w-full card-premium p-4 text-left stagger" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2"><MapPin size={14} className="text-brand-400" /><span className="text-sm font-bold text-ink-100">{s.adventure.locationName}</span></div>
                      <ChevronRight size={16} className="text-ink-500" />
                    </div>
                    <p className="text-xs text-ink-400 mb-3 leading-relaxed">{s.adventure.description}</p>
                    <div className="flex items-center gap-3 text-xs text-ink-500">
                      <span className="flex items-center gap-1"><DiffIcon size={12} /> {s.adventure.difficulty}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {s.adventure.durationMin} min</span>
                      <span className="flex items-center gap-1"><Route size={12} /> {s.adventure.distanceKm} km</span>
                      <span className="flex items-center gap-1"><Mountain size={12} /> {s.adventure.checkpoints.length} stops</span>
                      {s.travelTimeMin > 0 && <span className="flex items-center gap-1"><Navigation size={12} /> {s.travelTimeMin} min away</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
