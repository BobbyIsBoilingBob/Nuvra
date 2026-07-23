import { useState } from 'react'
import { Users, Zap, Crown, Check, X, Play, Copy } from 'lucide-react'
import type { PartyMember } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import { useToasts, ToastContainer } from '@/components/Toast'

interface Props { onNavigate: (s: string) => void }
const mockParty: PartyMember[] = [
  { id: 'p1', username: 'TrailBlazer', avatar_color: '#10b981', level: 8, status: 'ready', role: 'member' },
  { id: 'p2', username: 'PathFinder', avatar_color: '#f59e0b', level: 6, status: 'ready', role: 'member' },
  { id: 'p3', username: 'MoonWalker', avatar_color: '#059669', level: 4, status: 'in_adventure', role: 'member' },
]
export default function PartyScreen({ onNavigate }: Props) {
  const [members, setMembers] = useState(mockParty), [partyCode] = useState('ZVQ-7K3X')
  const { toasts, push, dismiss } = useToasts()
  const allReady = members.every(m => m.status === 'ready')
  const removeMember = (id: string) => setMembers(prev => prev.filter(m => m.id !== id))
  const copyCode = () => { navigator.clipboard?.writeText(partyCode); push('success', 'Party code copied!') }
  return (
    <>
      <ScreenShell title="Party" subtitle="Adventure together" onBack={() => onNavigate('friends')}>
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-brand-50 to-accent-50/40 border border-brand-200 rounded-2xl p-4 animate-slide-up"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Users size={18} className="text-brand-600" /><span className="text-sm font-bold text-ink-900">Your Party</span></div><span className="text-xs text-ink-400">{members.length} members</span></div><button onClick={copyCode} className="w-full bg-white border border-surface-200 rounded-xl p-3 flex items-center justify-between btn-press hover:bg-surface-50 transition"><div><p className="text-xs text-ink-400">Party Code</p><p className="text-sm font-bold text-ink-900 font-mono">{partyCode}</p></div><Copy size={16} className="text-ink-400" /></button></div>
          <div><h3 className="section-label">Members</h3><div className="space-y-2.5">
            <div className="bg-gradient-to-r from-accent-50 to-brand-50 border border-accent-300 rounded-xl p-3.5 flex items-center gap-3"><div className="relative"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-bold text-sm">Y</div><Crown size={14} className="absolute -top-1 -right-1 text-accent-500 bg-white rounded-full p-0.5" /></div><div className="flex-1"><p className="text-sm font-bold text-ink-900">You (Leader)</p><p className="text-xs text-success-600 flex items-center gap-1"><Check size={10} /> Ready</p></div></div>
            {members.map((m, i) => <div key={m.id} className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center gap-3 shadow-card stagger" style={{ animationDelay: i * 40 + 'ms' }}><div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: m.avatar_color }}>{m.username.charAt(0)}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink-900 truncate">{m.username}</p><p className="text-xs flex items-center gap-1">{m.status === 'ready' ? <span className="text-success-600 flex items-center gap-1"><Check size={10} /> Ready</span> : <span className="text-accent-600 flex items-center gap-1"><Zap size={10} /> In Adventure</span>} · Level {m.level}</p></div><button onClick={() => removeMember(m.id)} className="w-8 h-8 rounded-lg bg-surface-100 text-ink-400 hover:bg-error-50 hover:text-error-500 flex items-center justify-center btn-press transition"><X size={14} /></button></div>)}
          </div></div>
          <button onClick={() => onNavigate('generator')} disabled={!allReady} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"><Play size={18} /> {allReady ? 'Start Party Adventure' : 'Waiting for members...'}</button>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
