import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { UserSettings } from '../types'

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile, signOut } = useAuthStore()
  const [settings, setSettings] = useState<UserSettings>(profile?.settings || {})
  const [saved, setSaved] = useState(false)

  const update = async (key: keyof UserSettings, value: unknown) => {
    if (!user) return
    const ns = { ...settings, [key]: value }
    setSettings(ns)
    await supabase.from('profiles').update({ settings: ns }).eq('id', user.id)
    setSaved(true); setTimeout(() => setSaved(false), 2000); refreshProfile()
  }

  const handleSignOut = async () => { await signOut(); navigate('/auth') }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!checked)} className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-neutral-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  )

  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="px-4 py-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-1">Settings</h1>
        <p className="text-sm text-neutral-500 mb-4">Customize your experience</p>
        {saved && <div className="mb-3 rounded-xl bg-success-50 border border-success-200 px-4 py-2 text-sm text-success-700 animate-fade-in">Settings saved!</div>}
        <div className="card p-4 mb-4">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">Map</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-neutral-900">Map Type</p><p className="text-xs text-neutral-500">Choose map appearance</p></div><select value={settings.mapType || 'street'} onChange={e => update('mapType', e.target.value)} className="input py-2 px-3 text-sm w-32"><option value="street">Street</option><option value="satellite">Satellite</option></select></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-neutral-900">Units</p><p className="text-xs text-neutral-500">Distance measurement</p></div><select value={settings.units || 'metric'} onChange={e => update('units', e.target.value)} className="input py-2 px-3 text-sm w-32"><option value="metric">Metric</option><option value="imperial">Imperial</option></select></div>
          </div>
        </div>
        <div className="card p-4 mb-4">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">Privacy</h2>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-neutral-900">Share Location</p><p className="text-xs text-neutral-500">Show your position to nearby players</p></div><Toggle checked={settings.shareLocation ?? true} onChange={v => update('shareLocation', v)} /></div>
        </div>
        <div className="card p-4 mb-4">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-neutral-900">Push Notifications</p><p className="text-xs text-neutral-500">Receive in-app notifications</p></div><Toggle checked={settings.notifications ?? true} onChange={v => update('notifications', v)} /></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-neutral-900">Sound Effects</p><p className="text-xs text-neutral-500">Play sounds for rewards and alerts</p></div><Toggle checked={settings.soundEffects ?? true} onChange={v => update('soundEffects', v)} /></div>
          </div>
        </div>
        <div className="card p-4 mb-4">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-neutral-900">Email</p><p className="text-xs text-neutral-500">{user?.email}</p></div></div>
            <button onClick={handleSignOut} className="btn w-full bg-error-50 text-error-700 hover:bg-error-100 border border-error-200">Sign Out</button>
          </div>
        </div>
        <div className="card p-4"><h2 className="text-sm font-semibold text-neutral-700 mb-2">About</h2><p className="text-xs text-neutral-500">Nuvra v1.0.0</p><p className="text-xs text-neutral-400 mt-1">Explore the world. Complete adventures. Collect treasures.</p></div>
      </div>
    </div>
  )
}
