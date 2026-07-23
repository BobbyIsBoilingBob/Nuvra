import { Chrome as Home, Bot, Trophy, UserPlus, User } from 'lucide-react'
import type { ScreenName } from '@/types/adventure'
import type { LucideIcon } from 'lucide-react'

interface Props { active: ScreenName; onNavigate: (s: ScreenName) => void }
const items: { id: ScreenName; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: Home }, { id: 'generator', label: 'Create', icon: Bot },
  { id: 'leaderboard', label: 'Ranks', icon: Trophy }, { id: 'friends', label: 'Friends', icon: UserPlus },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function BottomNav({ active, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 glass safe-bottom border-t border-surface-300/60">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {items.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition btn-press relative" style={{ color: isActive ? '#059669' : '#94a3b8' }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={'text-[10px] font-semibold ' + (isActive ? 'text-brand-600' : 'text-ink-400')}>{item.label}</span>
              {isActive && <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-brand-500" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
