import { useState, useCallback, memo } from 'react'
import { Feather, MapPin, Clock, Mountain, Zap, Star, Save, Eye } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { generateAdventure } from '@/data/challenges'
import { detectSensors } from '@/lib/sensors'
import { difficultyIcons, categoryIcons } from '@/data/navigation'
import type { ScreenName, Adventure, Difficulty, ChallengeCategory } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void; onPreview: (adv: Adventure) => void }

const difficulties: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' }, { id: 'medium', label: 'Medium' }, { id: 'hard', label: 'Hard' }, { id: 'extreme', label: 'Extreme' },
]
const allCategories: ChallengeCategory[] = ['trivia', 'photo', 'fitness', 'compass', 'riddle', 'speed', 'exploration', 'puzzle']

function CreatorScreenInner({ onNavigate, onPreview }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [duration, setDuration] = useState(30)
  const [cpCount, setCpCount] = useState(4)
  const [categories, setCategories] = useState<ChallengeCategory[]>([])
  const [lat, setLat] = useState(51.5074)
  const [lng, setLng] = useState(-0.1278)
  const [saving, setSaving] = useState(false)

  const toggleCategory = useCallback((cat: ChallengeCategory) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }, [])

  const handleSave = useCallback(() => {
    if (!name.trim()) { push('error', 'Name required', 'Give your adventure a name'); return }
    setSaving(true)
    const sensorAvail = detectSensors()
    const adv = generateAdventure({
      center: { lat, lng },
      locationName: name.trim(),
      locationSource: 'manual',
      preferences: { difficulty, durationMin: duration, checkpointCount: cpCount, categories },
      sensorAvail,
    })
    adv.description = description.trim() || adv.description
    setSaving(false)
    push('success', 'Adventure created!', name.trim() + ' is ready to play')
    onPreview(adv)
  }, [name, description, difficulty, duration, cpCount, categories, lat, lng, push, onPreview])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  return (
    <>
      <ScreenShell title="Creator" subtitle="Build custom adventures" icon={<Feather size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="section-label">Adventure Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="My Custom Adventure" className="input-field" maxLength={40} />
          </div>

          {/* Description */}
          <div>
            <label className="section-label">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your adventure..." className="input-field min-h-[80px] resize-none" maxLength={200} />
          </div>

          {/* Location */}
          <div>
            <p className="section-label flex items-center gap-1.5"><MapPin size={12} /> Location (lat, lng)</p>
            <div className="flex gap-2">
              <input type="number" step="0.0001" value={lat} onChange={e => setLat(parseFloat(e.target.value) || 0)} className="input-field flex-1" />
              <input type="number" step="0.0001" value={lng} onChange={e => setLng(parseFloat(e.target.value) || 0)} className="input-field flex-1" />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="section-label flex items-center gap-1.5"><Zap size={12} /> Difficulty</p>
            <div className="grid grid-cols-2 gap-2">
              {difficulties.map(d => {
                const Icon = difficultyIcons[d.id]
                return (
                  <button key={d.id} onClick={() => setDifficulty(d.id)} className={'flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition btn-press ' + (difficulty === d.id ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-surface-300 text-ink-600 hover:border-brand-400')}>
                    <Icon size={16} /> {d.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <p className="section-label flex items-center gap-1.5"><Clock size={12} /> Duration</p>
            <div className="flex gap-2 flex-wrap">
              {[15, 30, 45, 60, 90].map(d => (
                <button key={d} onClick={() => setDuration(d)} className={'chip ' + (duration === d ? 'chip-active' : 'chip-inactive')}>{d} min</button>
              ))}
            </div>
          </div>

          {/* Checkpoints */}
          <div>
            <p className="section-label flex items-center gap-1.5"><Mountain size={12} /> Checkpoints</p>
            <div className="flex gap-2 flex-wrap">
              {[3, 4, 5, 6].map(c => (
                <button key={c} onClick={() => setCpCount(c)} className={'chip ' + (cpCount === c ? 'chip-active' : 'chip-inactive')}>{c} stops</button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="section-label flex items-center gap-1.5"><Star size={12} /> Challenge Types</p>
            <div className="flex gap-2 flex-wrap">
              {allCategories.map(c => {
                const Icon = categoryIcons[c]
                return (
                  <button key={c} onClick={() => toggleCategory(c)} className={'chip flex items-center gap-1 ' + (categories.includes(c) ? 'chip-active' : 'chip-inactive')}>
                    <Icon size={12} /> {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => onNavigate('home')} className="flex-1 btn-secondary flex items-center justify-center gap-2">
              <Eye size={16} /> Preview
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={16} /> {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </ScreenShell>
      <BottomNav active="creator" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const CreatorScreen = memo(CreatorScreenInner)
