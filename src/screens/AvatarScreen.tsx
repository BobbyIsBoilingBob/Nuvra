import { useState } from 'react'
import ScreenShell from '@/components/ScreenShell'

export default function AvatarScreen({ onBack }: { onBack: () => void }) {
  const [avatar, setAvatar] = useState('🧭')
  const [color, setColor] = useState('brand')
  const avatars = ['🧭', '🏃', '🚶', '🧗', '📸', '🌿', '🗺', '🎒']
  const colors = [
    { id: 'brand', class: 'bg-brand-500' },
    { id: 'accent', class: 'bg-accent-500' },
    { id: 'blue', class: 'bg-blue-500' },
    { id: 'purple', class: 'bg-purple-500' },
    { id: 'teal', class: 'bg-teal-500' },
    { id: 'rose', class: 'bg-rose-500' },
  ]
  return (
    <ScreenShell title="Avatar / Customise" icon="🎨" onBack={onBack}>
      <div className="text-center mb-6">
        <div className={`w-28 h-28 rounded-full ${colors.find(c => c.id === color)?.class} mx-auto mb-3 flex items-center justify-center text-5xl`}>{avatar}</div>
        <p className="text-sm text-ink-400">Customise your adventurer avatar</p>
      </div>
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-ink-300 mb-2">Avatar</h3>
        <div className="flex flex-wrap gap-2">
          {avatars.map(a => (
            <button key={a} onClick={() => setAvatar(a)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition ${avatar === a ? 'bg-brand-500/20 border-2 border-brand-500' : 'bg-ink-900 border border-ink-800'}`}>{a}</button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-ink-300 mb-2">Background Colour</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map(c => (
            <button key={c.id} onClick={() => setColor(c.id)} className={`w-10 h-10 rounded-full ${c.class} transition ${color === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-ink-950' : ''}`} />
          ))}
        </div>
      </div>
      <button className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition">Save Avatar</button>
    </ScreenShell>
  )
}
