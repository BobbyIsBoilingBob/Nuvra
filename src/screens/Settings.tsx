import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { useSettings } from '../lib/settings';
import { Card, Screen, Button } from '../components/ui';
import { Settings as SettingsIcon, Volume2, Vibrate, Mic, Wand as Wand2, Bell, LogOut, Trash2, ChevronRight } from 'lucide-react';

export default function Settings() {
  const { profile, signOut, deleteAccount, updateProfile } = useAuth();
  const { resetProgress } = useStore();
  const { settings, update } = useSettings();
  const [showDelete, setShowDelete] = useState(false);
  const Toggle = ({ icon: Icon, label, value, onChange }: { icon: any; label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className="w-full flex items-center gap-3 p-3">
      <Icon size={20} color="#94a3b8" /><span className="flex-1 text-left text-white">{label}</span>
      <div className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-zeviqo-500' : 'bg-ink-600'}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform mt-0.5 ${value ? 'translate-x-5' : 'translate-x-0.5'}`} /></div>
    </button>
  );
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Settings</h1>
      <Card className="mb-4 overflow-hidden"><Toggle icon={Volume2} label="Sound Effects" value={settings.sound} onChange={v => update({ sound: v })} /><div className="border-t border-ink-700/50" /><Toggle icon={Mic} label="Voice Guidance" value={settings.voiceGuidance} onChange={v => update({ voiceGuidance: v })} /><div className="border-t border-ink-700/50" /><Toggle icon={Vibrate} label="Haptic Feedback" value={settings.haptics} onChange={v => update({ haptics: v })} /><div className="border-t border-ink-700/50" /><Toggle icon={Bell} label="Notifications" value={settings.notifications} onChange={v => update({ notifications: v })} /><div className="border-t border-ink-700/50" /><Toggle icon={Wand2} label="AR Mode" value={settings.arMode} onChange={v => update({ arMode: v })} /></Card>
      <Card className="mb-4 overflow-hidden"><button onClick={() => {}} className="w-full flex items-center gap-3 p-3"><SettingsIcon size={20} color="#94a3b8" /><span className="flex-1 text-left text-white">Account</span><ChevronRight size={18} color="#64748b" /></button></Card>
      <Card className="mb-4 overflow-hidden"><button onClick={resetProgress} className="w-full flex items-center gap-3 p-3"><Trash2 size={20} color="#ef4444" /><span className="flex-1 text-left text-red-400">Reset Local Progress</span></button></Card>
      <Button variant="secondary" className="w-full mb-3" onClick={signOut}><LogOut size={18} /> Sign Out</Button>
      {showDelete ? (<Card className="p-4 border-red-500/30"><p className="text-white text-sm mb-3">This permanently deletes your account and all data. Type DELETE to confirm.</p><input id="deleteConfirm" className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl px-4 py-2.5 text-white mb-3" placeholder="DELETE" /><Button variant="danger" className="w-full" onClick={() => { const v = (document.getElementById('deleteConfirm') as HTMLInputElement)?.value; if (v === 'DELETE') deleteAccount(); }}>Permanently Delete</Button></Card>) : <Button variant="ghost" className="w-full text-red-400" onClick={() => setShowDelete(true)}><Trash2 size={16} /> Delete Account</Button>}
    </Screen>
  );
}
