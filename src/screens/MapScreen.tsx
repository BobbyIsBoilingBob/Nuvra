import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, Trophy, CircleCheck as CheckCircle2, Star, Coins, Navigation } from 'lucide-react'
import type { Adventure, GpsPosition, GpsStatus, SensorAvailability } from '@/types/adventure'
import { useAuth } from '@/lib/auth'
import { detectSensors, startCompass, watchPosition } from '@/lib/sensors'
import { distanceMeters, formatDistance } from '@/lib/geo'
import { recordAdventureCompletion } from '@/lib/db'
import AdventureMap from '@/components/AdventureMap'
import ChallengeRunner from '@/components/ChallengeRunner'
import { useToasts, ToastContainer } from '@/components/Toast'
import { categoryIcons } from '@/data/navigation'

interface Props { adventure: Adventure; onExit: () => void }
export default function MapScreen({ adventure, onExit }: Props) {
  const { refreshProfile } = useAuth()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [playerPos, setPlayerPos] = useState<GpsPosition | null>(null)
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [totalXp, setTotalXp] = useState(0), [totalCoins, setTotalCoins] = useState(0)
  const [finished, setFinished] = useState(false)
  const [heading, setHeading] = useState(0)
  const { toasts, push, dismiss } = useToasts()
  const sensorAvail = useRef<SensorAvailability>(detectSensors())
  const cleanupGps = useRef<(() => void) | null>(null)
  const cleanupCompass = useRef<(() => void) | null>(null)

  useEffect(() => {
    setGpsStatus('locating')
    cleanupGps.current = watchPosition(pos => { setPlayerPos(pos); setGpsStatus('located') })
    if (sensorAvail.current.compass) cleanupCompass.current = startCompass(h => setHeading(h))
    return () => { if (cleanupGps.current) cleanupGps.current(); if (cleanupCompass.current) cleanupCompass.current() }
  }, [])

  const handleComplete = useCallback((xp: number, coins: number) => {
    setCompleted(prev => { const n = new Set(prev); n.add(currentIdx); return n })
    setTotalXp(x => x + xp); setTotalCoins(c => c + coins)
    push('reward', '+' + xp + ' XP, +' + coins + ' coins!')
    if (currentIdx + 1 >= adventure.checkpoints.length) {
      setFinished(true)
      recordAdventureCompletion({ adventure, xpEarned: xp + totalXp, coinsEarned: coins + totalCoins, challengesCompleted: completed.size + 1 }).then(() => refreshProfile())
    } else setTimeout(() => setCurrentIdx(i => i + 1), 800)
  }, [currentIdx, adventure, totalXp, totalCoins, completed, push, refreshProfile])

  const currentCp = adventure.checkpoints[currentIdx]
  const distToCurrent = playerPos && currentCp ? distanceMeters({ lat: playerPos.lat, lng: playerPos.lng }, currentCp.position) : null

  if (finished) return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center px-6 text-center">
      <div className="animate-bounce-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-accent-100 to-brand-100 border-2 border-accent-400 mb-4"><Trophy size={48} className="text-accent-600" /></div>
        <h1 className="text-2xl font-extrabold gradient-text mb-2">Adventure Complete!</h1>
        <p className="text-sm text-ink-500 mb-6">You conquered {adventure.locationName}</p>
        <div className="flex gap-4 justify-center mb-8">
          <div className="bg-white border border-surface-200 rounded-xl px-6 py-4 shadow-card"><Star size={20} className="text-brand-500 mx-auto mb-1" /><p className="text-xl font-bold text-ink-900">{totalXp}</p><p className="text-xs text-ink-400">XP Earned</p></div>
          <div className="bg-white border border-surface-200 rounded-xl px-6 py-4 shadow-card"><Coins size={20} className="text-accent-500 mx-auto mb-1" /><p className="text-xl font-bold text-ink-900">{totalCoins}</p><p className="text-xs text-ink-400">Coins</p></div>
        </div>
        <button onClick={onExit} className="btn-primary max-w-xs">Back to Home</button>
      </div>
    </div>
  )

  return (
    <>
      <div className="min-h-screen bg-surface-0">
        <header className="sticky top-0 z-20 glass safe-top"><div className="px-4 py-3 flex items-center gap-3 max-w-md mx-auto"><button onClick={onExit} className="w-9 h-9 rounded-xl bg-white border border-surface-300 flex items-center justify-center text-ink-700 hover:bg-surface-50 btn-press"><ArrowLeft size={18} /></button><div className="flex-1"><h1 className="text-base font-bold text-ink-900">Active Adventure</h1><p className="text-xs text-ink-400">{completed.size} / {adventure.checkpoints.length} checkpoints</p></div><div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-surface-200 shadow-card"><Navigation size={12} className={gpsStatus === 'located' ? 'text-brand-500' : 'text-ink-400'} /><span className="text-xs text-ink-600">{gpsStatus === 'located' ? 'GPS' : '...'}</span></div></div></header>
        <div className="px-4 pt-4 pb-28 space-y-4 max-w-md mx-auto">
          <div className="rounded-2xl overflow-hidden border border-surface-200 shadow-card"><AdventureMap adventure={adventure} playerPos={playerPos} completedIndices={completed} heading={heading} /></div>
          <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-3"><p className="section-label mb-0">Progress</p><p className="text-xs text-ink-400">{completed.size} / {adventure.checkpoints.length}</p></div>
            <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500" style={{ width: (completed.size / adventure.checkpoints.length) * 100 + '%' }} /></div>
            <div className="flex justify-between mt-3">{adventure.checkpoints.map((_, i) => <div key={i} className={'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ' + (completed.has(i) ? 'bg-gradient-to-br from-success-500 to-success-600 text-white' : i === currentIdx ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white' : 'bg-surface-100 border border-surface-200 text-ink-500')}>{completed.has(i) ? <CheckCircle2 size={14} /> : i + 1}</div>)}</div>
          </div>
          {distToCurrent != null && distToCurrent > 20 && <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 flex items-center gap-2.5 animate-fade-in"><Navigation size={16} className="text-brand-600" style={{ transform: 'rotate(' + heading + 'deg)' }} /><p className="text-sm text-ink-700">Head to checkpoint {currentIdx + 1} — <span className="font-bold text-brand-600">{formatDistance(distToCurrent / 1000)}</span> away</p></div>}
          {currentCp?.challenge && <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-card animate-slide-up"><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold">{currentIdx + 1}</div><p className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1">{(() => { const Icon = categoryIcons[currentCp.challenge.category]; return <Icon size={12} /> })()} Checkpoint {currentIdx + 1}</p></div><ChallengeRunner challenge={currentCp.challenge} sensorAvail={sensorAvail.current} onComplete={handleComplete} /></div>}
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
