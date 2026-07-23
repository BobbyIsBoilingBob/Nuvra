import { useState, useCallback, memo } from 'react'
import { Bot, Sparkles } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { GeneratorForm } from '@/components/GeneratorForm'
import { generateAdventure } from '@/data/challenges'
import { detectSensors } from '@/lib/sensors'
import { useAuth } from '@/lib/auth'
import type { ScreenName, Adventure, AdventurePreferences, GpsStatus } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void; onPreview: (adv: Adventure) => void }

function AIGeneratorScreenInner({ onNavigate, onPreview }: Props) {
  const { profile } = useAuth()
  const { toasts, push, dismiss } = useToasts()
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = useCallback((prefs: AdventurePreferences, center: { lat: number; lng: number } | null, locationName: string) => {
    if (!center) { push('error', 'Location needed', 'Please select your location to generate an adventure'); return }
    setGenerating(true)
    const sensorAvail = detectSensors()
    const adv = generateAdventure({ center, locationName, locationSource: 'gps', preferences: prefs, sensorAvail })
    setGenerating(false)
    push('success', 'Adventure generated!', adv.checkpoints.length + ' checkpoints ready')
    onPreview(adv)
  }, [push, onPreview])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  return (
    <>
      <ScreenShell title="AI Generator" subtitle="Create your adventure" icon={<Bot size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-brand-50 to-accent-50/40 border border-brand-200 rounded-2xl p-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink-900">Adventure Builder</p>
                <p className="text-xs text-ink-400">Customize your perfect adventure</p>
              </div>
            </div>
            <p className="text-xs text-ink-500">Pick your difficulty, duration, and challenge types. We'll generate a unique adventure with GPS-located checkpoints near you.</p>
          </div>

          {generating ? (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-3 animate-pulse">
                <Sparkles size={32} className="text-white animate-pulse" />
              </div>
              <p className="text-sm font-bold text-ink-700">Generating adventure...</p>
              <p className="text-xs text-ink-400 mt-1">Creating checkpoints near you</p>
            </div>
          ) : (
            <GeneratorForm onGenerate={handleGenerate} gpsStatus={gpsStatus} setGpsStatus={setGpsStatus} />
          )}

          {profile && (
            <div className="card-premium p-4">
              <p className="text-xs text-ink-400 mb-2">Your balance</p>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-ink-900">{profile.coins} coins</span>
                <span className="text-sm font-bold text-ink-900">{profile.gems} gems</span>
              </div>
            </div>
          )}
        </div>
      </ScreenShell>
      <BottomNav active="generator" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const AIGeneratorScreen = memo(AIGeneratorScreenInner)
