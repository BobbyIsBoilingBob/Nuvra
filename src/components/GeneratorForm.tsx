import { useState } from 'react'
import type { AdventurePreferences, ChallengeCategory, Difficulty } from '@/types/adventure'
import { ALL_CATEGORIES } from '@/data/challenges'
import { detectSensors } from '@/lib/sensors'

export interface GeneratorFormProps {
  onGenerate: (prefs: AdventurePreferences, location: string) => void
  onUseGps: () => void
  gpsStatus: string
  isGenerating: boolean
}

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'bg-brand-600' },
  { value: 'medium', label: 'Medium', color: 'bg-sky-600' },
  { value: 'hard', label: 'Hard', color: 'bg-accent-600' },
  { value: 'extreme', label: 'Extreme', color: 'bg-red-600' },
]

const DURATIONS = [20, 30, 45, 60, 90, 120, 240]

const CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  observation: 'Observation',
  photography: 'Photography',
  fitness: 'Fitness',
  puzzle: 'Puzzle',
  memory: 'Memory',
  navigation: 'Navigation',
  compass: 'Compass',
  landmarks: 'Landmarks',
  nature: 'Nature',
  collection: 'Collection',
  trivia: 'Trivia',
  timed: 'Timed',
  team: 'Team',
  exploration: 'Exploration',
  balance: 'Balance',
  reaction: 'Reaction',
}

export function GeneratorForm({ onGenerate, onUseGps, gpsStatus, isGenerating }: GeneratorFormProps) {
  const [location, setLocation] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [duration, setDuration] = useState(45)
  const [maxDistance, setMaxDistance] = useState<number | ''>('')
  const [minDistance, setMinDistance] = useState<number | ''>('')
  const [approxDistance, setApproxDistance] = useState<number | ''>('')
  const [selectedCategories, setSelectedCategories] = useState<ChallengeCategory[]>([])

  const sensors = detectSensors()

  const toggleCategory = (cat: ChallengeCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const prefs: AdventurePreferences = {
      difficulty,
      durationMin: duration,
      maxDistanceKm: maxDistance === '' ? undefined : Number(maxDistance),
      minDistanceKm: minDistance === '' ? undefined : Number(minDistance),
      approxDistanceKm: approxDistance === '' ? undefined : Number(approxDistance),
      challengeTypes: selectedCategories,
    }
    onGenerate(prefs, location)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Location */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">
          Location <span className="text-ink-600 normal-case font-normal">(optional)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Brisbane, Noosa, Central Park..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-ink-900 border border-ink-700 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button
            type="button"
            onClick={onUseGps}
            className="px-4 py-2.5 rounded-xl bg-ink-700 hover:bg-ink-600 text-ink-100 text-sm font-medium whitespace-nowrap transition-colors"
          >
            📍 Use GPS
          </button>
        </div>
        <p className="text-xs text-ink-500 mt-1.5">
          {gpsStatus || 'Leave blank to use your GPS location. Never defaults to London.'}
        </p>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">
          Difficulty
        </label>
        <div className="grid grid-cols-4 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDifficulty(d.value)}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                difficulty === d.value
                  ? `${d.color} text-white shadow-lg scale-105`
                  : 'bg-ink-900 text-ink-400 hover:bg-ink-700'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">
          Adventure Length
        </label>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                duration === d
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-900 text-ink-400 hover:bg-ink-700'
              }`}
            >
              {d < 60 ? `${d} min` : `${d / 60} hr`}
            </button>
          ))}
        </div>
      </div>

      {/* Distance preferences */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-ink-500 mb-1">Max km</label>
          <input
            type="number"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="10"
            className="w-full px-3 py-2 rounded-lg bg-ink-900 border border-ink-700 text-ink-100 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">Min km</label>
          <input
            type="number"
            value={minDistance}
            onChange={(e) => setMinDistance(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="2"
            className="w-full px-3 py-2 rounded-lg bg-ink-900 border border-ink-700 text-ink-100 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">~km</label>
          <input
            type="number"
            value={approxDistance}
            onChange={(e) => setApproxDistance(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="5"
            className="w-full px-3 py-2 rounded-lg bg-ink-900 border border-ink-700 text-ink-100 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>
      <p className="text-xs text-ink-500 -mt-2">All distance fields are optional.</p>

      {/* Challenge types */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">
          Challenge Types <span className="text-ink-600 normal-case font-normal">(optional, select any)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat) => {
            const active = selectedCategories.includes(cat)
            const needsSensor = ['compass', 'balance', 'reaction'].includes(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-brand-600 text-white'
                    : 'bg-ink-900 text-ink-400 hover:bg-ink-700'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sensor info */}
      <div className="bg-ink-900 rounded-xl p-3 border border-ink-700">
        <p className="text-xs text-ink-500">
          <span className="text-ink-400 font-medium">Device sensors:</span>{' '}
          {[
            sensors.compass && 'Compass',
            sensors.accelerometer && 'Accelerometer',
            sensors.geolocation && 'GPS',
            sensors.camera && 'Camera',
          ].filter(Boolean).join(' · ') || 'None detected — sensor challenges will be skippable.'}
        </p>
      </div>

      {/* Generate */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-display font-bold text-lg transition-colors"
      >
        {isGenerating ? 'Generating...' : 'Generate Adventure'}
      </button>
    </form>
  )
}
