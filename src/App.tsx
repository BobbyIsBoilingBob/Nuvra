import { useEffect, useRef, useState } from 'react'
import { AdventureMap } from '@/components/AdventureMap'
import { GeneratorForm } from '@/components/GeneratorForm'
import { ChallengeRunner } from '@/components/ChallengeRunner'
import { generateAdventure, generateSuggestedAdventures } from '@/lib/generator'
import { geocodeLocation, reverseGeocode, searchNearbyPois } from '@/lib/geocode'
import { getCurrentPosition, watchPosition, isGpsAvailable } from '@/lib/gps'
import { detectSensors } from '@/lib/sensors'
import { distanceMeters, formatDistance, formatDuration, boundingBox } from '@/lib/geo'
import type {
  Adventure,
  AdventurePreferences,
  GeoPoint,
  GpsPosition,
  GpsStatus,
  SuggestedAdventure,
} from '@/types/adventure'

type View = 'home' | 'adventure'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [adventure, setAdventure] = useState<Adventure | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [gpsPos, setGpsPos] = useState<GpsPosition | null>(null)
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')
  const [suggestions, setSuggestions] = useState<SuggestedAdventure[]>([])
  const [activeCheckpoint, setActiveCheckpoint] = useState(0)
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set())
  const [totalXp, setTotalXp] = useState(0)
  const [totalCoins, setTotalCoins] = useState(0)

  const sensors = detectSensors()
  const stopGpsRef = useRef<(() => void) | null>(null)

  // Start GPS watching on mount
  useEffect(() => {
    if (!isGpsAvailable()) {
      setGpsStatus('unavailable')
      return
    }
    stopGpsRef.current = watchPosition((pos, status) => {
      setGpsPos(pos)
      setGpsStatus(status)
    })
    return () => stopGpsRef.current?.()
  }, [])

  // Generate suggested adventures when GPS is available
  useEffect(() => {
    if (gpsPos && suggestions.length === 0) {
      const center: GeoPoint = { lat: gpsPos.lat, lng: gpsPos.lng }
      const sugg = generateSuggestedAdventures({ center, sensorAvailability: sensors })
      setSuggestions(sugg)
    }
  }, [gpsPos, sensors])

  // ── Location resolution ──────────────────────────────────────────────
  // ROOT CAUSE FIX: This is the single place where the generation centre is
  // resolved. It NEVER falls back to London or any hard-coded city. If the
  // user typed a location, we geocode it. If not, we use GPS. If GPS is
  // unavailable, we show an error asking for a location.

  const resolveLocation = async (locationInput: string): Promise<{
    center: GeoPoint
    name: string
    source: 'gps' | 'manual'
  }> => {
    // 1. User typed a location → geocode it
    if (locationInput.trim()) {
      const result = await geocodeLocation(locationInput)
      if (!result) {
        throw new Error(`Could not find "${locationInput}". Try a more specific place name.`)
      }
      return { center: { lat: result.lat, lng: result.lng }, name: result.label, source: 'manual' }
    }

    // 2. No location typed → use GPS
    if (gpsPos) {
      const label = await reverseGeocode({ lat: gpsPos.lat, lng: gpsPos.lng })
      return {
        center: { lat: gpsPos.lat, lng: gpsPos.lng },
        name: label ?? 'Your Location',
        source: 'gps',
      }
    }

    // 3. No GPS → try requesting once more
    const fresh = await getCurrentPosition()
    if (fresh) {
      const label = await reverseGeocode({ lat: fresh.lat, lng: fresh.lng })
      return {
        center: { lat: fresh.lat, lng: fresh.lng },
        name: label ?? 'Your Location',
        source: 'gps',
      }
    }

    // 4. Nothing available → ask user for location (NEVER default to London)
    throw new Error('No GPS available. Please enter a location above.')
  }

  // ── Generate adventure ──────────────────────────────────────────────

  const handleGenerate = async (prefs: AdventurePreferences, locationInput: string) => {
    setError('')
    setIsGenerating(true)
    try {
      const { center, name, source } = await resolveLocation(locationInput)
      const adv = generateAdventure({
        center,
        locationName: name,
        locationSource: source,
        preferences: prefs,
        sensorAvailability: sensors,
      })
      setAdventure(adv)
      setActiveCheckpoint(0)
      setCompletedChallenges(new Set())
      setView('adventure')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate adventure.')
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Use GPS button ───────────────────────────────────────────────────

  const handleUseGps = async () => {
    setGpsStatus('requesting')
    const pos = await getCurrentPosition()
    if (pos) {
      setGpsPos(pos)
      setGpsStatus('granted')
      const label = await reverseGeocode({ lat: pos.lat, lng: pos.lng })
      setError('')
    } else {
      setGpsStatus('denied')
      setError('GPS unavailable. Please enter a location manually.')
    }
  }

  // ── Challenge completion ─────────────────────────────────────────────

  const handleChallengeComplete = (index: number, rewards: { xp: number; coins: number }) => {
    setCompletedChallenges((prev) => new Set(prev).add(index))
    setTotalXp((x) => x + rewards.xp)
    setTotalCoins((c) => c + rewards.coins)
    // Auto-advance to next checkpoint
    if (adventure && index < adventure.route.checkpoints.length - 1) {
      setTimeout(() => setActiveCheckpoint(index + 1), 1200)
    }
  }

  const handleSkip = () => {
    if (adventure && activeCheckpoint < adventure.route.checkpoints.length - 1) {
      setActiveCheckpoint(activeCheckpoint + 1)
    }
  }

  // ── Suggested adventure ──────────────────────────────────────────────

  const handleSuggestionClick = async (sugg: SuggestedAdventure) => {
    setError('')
    setIsGenerating(true)
    try {
      const prefs: AdventurePreferences = {
        difficulty: sugg.difficulty,
        durationMin: sugg.durationMin,
        challengeTypes: [],
      }
      const adv = generateAdventure({
        center: sugg.center,
        locationName: sugg.locationName,
        locationSource: 'suggested',
        preferences: prefs,
        sensorAvailability: sensors,
      })
      adv.isSuggested = true
      setAdventure(adv)
      setActiveCheckpoint(0)
      setCompletedChallenges(new Set())
      setView('adventure')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate adventure.')
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────

  if (view === 'adventure' && adventure) {
    return (
      <AdventureView
        adventure={adventure}
        gpsPos={gpsPos}
        activeCheckpoint={activeCheckpoint}
        completedChallenges={completedChallenges}
        totalXp={totalXp}
        totalCoins={totalCoins}
        onChallengeComplete={handleChallengeComplete}
        onSkip={handleSkip}
        onBack={() => setView('home')}
        onCheckpointClick={setActiveCheckpoint}
      />
    )
  }

  return (
    <HomeView
      onGenerate={handleGenerate}
      onUseGps={handleUseGps}
      gpsStatus={gpsStatus}
      gpsPos={gpsPos}
      isGenerating={isGenerating}
      error={error}
      suggestions={suggestions}
      onSuggestionClick={handleSuggestionClick}
    />
  )
}

// ── Home View ──────────────────────────────────────────────────────────

interface HomeViewProps {
  onGenerate: (prefs: AdventurePreferences, location: string) => void
  onUseGps: () => void
  gpsStatus: GpsStatus
  gpsPos: GpsPosition | null
  isGenerating: boolean
  error: string
  suggestions: SuggestedAdventure[]
  onSuggestionClick: (s: SuggestedAdventure) => void
}

function HomeView({
  onGenerate, onUseGps, gpsStatus, gpsPos, isGenerating, error, suggestions, onSuggestionClick,
}: HomeViewProps) {
  const gpsMsg = gpsStatus === 'granted' && gpsPos
    ? `GPS active · accuracy ${Math.round(gpsPos.accuracy)}m`
    : gpsStatus === 'requesting'
    ? 'Requesting GPS...'
    : gpsStatus === 'denied'
    ? 'GPS denied — enter a location above'
    : gpsStatus === 'unavailable'
    ? 'GPS not available on this device'
    : ''

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-ink-950/80 backdrop-blur-lg border-b border-ink-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            <h1 className="font-display font-bold text-xl text-ink-50">Zeviqo</h1>
          </div>
          <span className="text-xs text-ink-500">Adventure System</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Hero */}
        <div className="text-center py-4 animate-fade-in">
          <h2 className="font-display text-3xl font-bold text-ink-50 mb-2">
            Generate Your Adventure
          </h2>
          <p className="text-ink-400 text-sm">
            AI-crafted routes with challenges tailored to your location and preferences.
          </p>
        </div>

        {/* Generator form */}
        <div className="bg-ink-900 rounded-2xl p-5 border border-ink-800 animate-slide-up">
          <GeneratorForm
            onGenerate={onGenerate}
            onUseGps={onUseGps}
            gpsStatus={gpsMsg}
            isGenerating={isGenerating}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-sm text-red-300 animate-fade-in">
            {error}
          </div>
        )}

        {/* Suggested adventures */}
        {suggestions.length > 0 && (
          <div className="animate-slide-up">
            <h3 className="font-display font-bold text-lg text-ink-50 mb-3">
              Suggested Adventures
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              Mostly nearby · 70% within 30 min · 20% within 90 min · 10% up to 2 hr
            </p>
            <div className="grid gap-3">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSuggestionClick(s)}
                  className="text-left bg-ink-900 hover:bg-ink-800 rounded-2xl p-4 border border-ink-800 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{s.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-ink-100 truncate">{s.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          s.difficulty === 'easy' ? 'bg-brand-900 text-brand-300' :
                          s.difficulty === 'medium' ? 'bg-sky-900 text-sky-300' :
                          s.difficulty === 'hard' ? 'bg-accent-900 text-accent-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {s.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-ink-400 mb-2 line-clamp-2">{s.description}</p>
                      <div className="flex gap-3 text-xs text-ink-500">
                        <span>🚗 {formatDuration(s.travelTimeMin)} away</span>
                        <span>🚶 {formatDuration(s.durationMin)}</span>
                        <span>📏 {s.distanceKm.toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No GPS hint */}
        {gpsStatus === 'unavailable' && (
          <div className="bg-ink-900 rounded-xl p-4 border border-ink-800 text-center">
            <p className="text-sm text-ink-400">
              GPS is not available on this device. Enter a location above to generate adventures.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Adventure View ─────────────────────────────────────────────────────

interface AdventureViewProps {
  adventure: Adventure
  gpsPos: GpsPosition | null
  activeCheckpoint: number
  completedChallenges: Set<number>
  totalXp: number
  totalCoins: number
  onChallengeComplete: (index: number, rewards: { xp: number; coins: number }) => void
  onSkip: () => void
  onBack: () => void
  onCheckpointClick: (index: number) => void
}

function AdventureView({
  adventure, gpsPos, activeCheckpoint, completedChallenges, totalXp, totalCoins,
  onChallengeComplete, onSkip, onBack, onCheckpointClick,
}: AdventureViewProps) {
  const playerLoc: GeoPoint | null = gpsPos ? { lat: gpsPos.lat, lng: gpsPos.lng } : null
  const checkpoint = adventure.route.checkpoints[activeCheckpoint]
  const allDone = completedChallenges.size >= adventure.route.checkpoints.length

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-ink-950/90 backdrop-blur-lg border-b border-ink-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-ink-400 hover:text-ink-100 text-sm font-medium">
            ← Back
          </button>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-brand-400 font-semibold">⭐ {totalXp} XP</span>
            <span className="text-accent-400 font-semibold">🪙 {totalCoins}</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto w-full px-4 py-4 space-y-4 flex-1">
        {/* Title */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{adventure.imageEmoji}</span>
            <h2 className="font-display font-bold text-xl text-ink-50">{adventure.title}</h2>
          </div>
          <p className="text-sm text-ink-400">{adventure.description}</p>
          <div className="flex gap-3 mt-2 text-xs text-ink-500">
            <span>📍 {adventure.locationName.split(',').slice(0, 2).join(',')}</span>
            <span>📏 {adventure.route.distanceKm.toFixed(1)} km</span>
            <span>⏱️ {formatDuration(adventure.route.durationMin)}</span>
            <span className={`px-2 rounded-full font-medium ${
              adventure.difficulty === 'easy' ? 'bg-brand-900 text-brand-300' :
              adventure.difficulty === 'medium' ? 'bg-sky-900 text-sky-300' :
              adventure.difficulty === 'hard' ? 'bg-accent-900 text-accent-300' :
              'bg-red-900 text-red-300'
            }`}>{adventure.difficulty}</span>
          </div>
        </div>

        {/* Map — immediately fits route, shows start/finish/checkpoints/player */}
        <div className="h-72 rounded-2xl overflow-hidden border border-ink-800 animate-slide-up">
          <AdventureMap
            route={adventure.route}
            playerLocation={playerLoc}
            className="h-full"
            onCheckpointClick={onCheckpointClick}
            activeCheckpoint={activeCheckpoint}
          />
        </div>

        {/* Checkpoint progress */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {adventure.route.checkpoints.map((cp, i) => (
            <button
              key={i}
              onClick={() => onCheckpointClick(i)}
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                completedChallenges.has(i)
                  ? 'bg-brand-600 text-white'
                  : i === activeCheckpoint
                  ? 'bg-accent-600 text-white ring-2 ring-accent-400'
                  : 'bg-ink-800 text-ink-500'
              }`}
            >
              {completedChallenges.has(i) ? '✓' : i + 1}
            </button>
          ))}
        </div>

        {/* Active challenge */}
        {checkpoint && !allDone && (
          <ChallengeRunner
            key={activeCheckpoint}
            challenge={checkpoint.challenge}
            playerPos={gpsPos}
            onComplete={(rewards) => onChallengeComplete(activeCheckpoint, rewards)}
            onSkip={onSkip}
          />
        )}

        {/* All done */}
        {allDone && (
          <div className="bg-gradient-to-br from-brand-900 to-ink-900 rounded-2xl p-6 text-center border border-brand-700 animate-fade-in">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="font-display font-bold text-xl text-ink-50 mb-2">Adventure Complete!</h3>
            <p className="text-ink-300 text-sm mb-4">
              You earned {totalXp} XP and {totalCoins} coins.
            </p>
            {adventure.rewardItem && (
              <div className="inline-block bg-ink-800 rounded-full px-4 py-2 text-sm text-brand-300">
                🎁 Reward: {adventure.rewardItem}
              </div>
            )}
            <button
              onClick={onBack}
              className="block w-full mt-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Checkpoint list */}
        <div className="bg-ink-900 rounded-2xl p-4 border border-ink-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-3">
            Route Checkpoints
          </h3>
          <div className="space-y-2">
            {adventure.route.checkpoints.map((cp, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  completedChallenges.has(i) ? 'bg-brand-600 text-white' : 'bg-ink-800 text-ink-500'
                }`}>
                  {completedChallenges.has(i) ? '✓' : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-ink-100 font-medium">{cp.label}</div>
                  <div className="text-xs text-ink-500 truncate">{cp.challenge.title}</div>
                </div>
                <span className="text-xs text-ink-600">{cp.challenge.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
