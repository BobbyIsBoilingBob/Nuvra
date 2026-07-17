import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { GlassCard, Icon, XpBar, Button, ProfileAvatar, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { getLevelInfo } from '../data';
import { formatDistance, formatNumber } from '../lib/map-utils';
import { vibrate } from '../lib/settings';

const EMOJIS = ['🧭', '🗺️', '⛰️', '🌲', '🌊', '🔥', '⚡', '⭐', '🌟', '💎', '🦊', '🐺', '🦅', '🐉'];
const COLORS = ['#00c4ff', '#ff6b00', '#22c55e', '#7a45ff', '#ec4899', '#f5b800', '#ef4444', '#3dd4ff'];

export function Profile() {
  const { profile, signOut, updateProfile } = useAuth();
  const { setScreen } = useStore();
  const [editingAvatar, setEditingAvatar] = useState(false);

  if (!profile) return null;
  const info = getLevelInfo(profile.xp);

  const stats = [
    { icon: 'Route', label: 'Distance', value: formatDistance(profile.distance_walked), color: 'text-zeviqo-400' },
    { icon: 'Footprints', label: 'Steps', value: formatNumber(profile.steps), color: 'text-ember-400' },
    { icon: 'Compass', label: 'Adventures', value: formatNumber(profile.completed_adventures), color: 'text-plasma-400' },
    { icon: 'Trophy', label: 'Challenges', value: formatNumber(profile.completed_challenges), color: 'text-gold-400' },
    { icon: 'Flame', label: 'Streak', value: `${profile.walking_streak}d`, color: 'text-rose-400' },
    { icon: 'Gem', label: 'Treasures', value: formatNumber(profile.treasure_collected), color: 'text-cyan-400' }
  ];

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <div className="relative z-10 px-4 pt-6 space-y-5">
        <div className="flex items-center justify-between animate-fade-in">
          <h1 className="text-xl font-display font-bold text-white">Profile</h1>
          <button onClick={() => setScreen('settings')} className="w-10 h-10 rounded-xl glass flex items-center justify-center active:scale-90 transition-transform">
            <Icon name="Settings" size={18} className="text-white/60" />
          </button>
        </div>

        <GlassCard className="p-5 animate-slide-up">
          <div className="flex items-center gap-4">
            <button onClick={() => setEditingAvatar(true)}>
              <ProfileAvatar emoji={profile.avatar_emoji} color={profile.avatar_color} size="lg" online={profile.is_online} />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-display font-bold text-white">{profile.username}</h2>
              <p className="text-xs text-white/40">{profile.bio || 'No bio yet'}</p>
              <div className="flex items-center gap-2 mt-2">
                <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/20">LV {info.level}</Pill>
                <Pill icon="Coins" accent="text-gold-300 border-gold-500/20">{profile.coins.toLocaleString()}</Pill>
              </div>
            </div>
          </div>
          <div className="mt-4"><XpBar xp={profile.xp} /></div>
        </GlassCard>

        <div className="grid grid-cols-3 gap-3 animate-slide-up">
          {stats.map(s => (
            <GlassCard key={s.label} className="p-3 flex flex-col items-center text-center">
              <Icon name={s.icon} size={18} className={s.color} />
              <span className="text-sm font-display font-bold text-white mt-1">{s.value}</span>
              <span className="text-[10px] text-white/40">{s.label}</span>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 animate-slide-up">
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('history')}>
            <Icon name="History" size={18} className="text-zeviqo-400" /><span className="text-xs font-bold text-white/70">History</span>
          </GlassCard>
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('achievements')}>
            <Icon name="Award" size={18} className="text-plasma-400" /><span className="text-xs font-bold text-white/70">Achievements</span>
          </GlassCard>
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('shop')}>
            <Icon name="ShoppingBag" size={18} className="text-gold-400" /><span className="text-xs font-bold text-white/70">Shop</span>
          </GlassCard>
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('settings')}>
            <Icon name="Settings" size={18} className="text-white/60" /><span className="text-xs font-bold text-white/70">Settings</span>
          </GlassCard>
        </div>

        <Button fullWidth size="md" variant="danger" icon="LogOut" onClick={signOut}>Log Out</Button>
      </div>

      {editingAvatar && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-6" onClick={() => setEditingAvatar(false)}>
          <div className="glass-strong rounded-3xl p-6 max-w-sm w-full animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-display font-bold text-white mb-4">Choose Avatar</h3>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => { updateProfile({ avatar_emoji: e }); vibrate(10); }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${profile.avatar_emoji === e ? 'glass-strong border-zeviqo-500/40' : 'glass'}`}>{e}</button>
              ))}
            </div>
            <div className="grid grid-cols-8 gap-2 mb-4">
              {COLORS.map(c => (
                <button key={c} onClick={() => { updateProfile({ avatar_color: c }); vibrate(10); }}
                  className={`w-8 h-8 rounded-full ${profile.avatar_color === c ? 'ring-2 ring-white' : ''}`} style={{ background: c }} />
              ))}
            </div>
            <Button fullWidth size="md" onClick={() => setEditingAvatar(false)}>Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}
