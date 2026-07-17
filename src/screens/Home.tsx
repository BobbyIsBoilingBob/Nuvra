import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { GlassCard, Icon, XpBar, LevelBadge, Button, Spinner, ErrorState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { RoutePreview } from '../components/RoutePreview';
import { CURATED_ADVENTURES, DAILY_QUESTS, getLevelInfo, type Adventure } from '../data';
import { formatNumber, formatDistance } from '../lib/map-utils';

export function Home() {
  const { profile, refreshProfile, loading } = useAuth();
  const { setScreen, setSelectedAdventureObj, setScreen: nav } = useStore();
  const [err, setErr] = useState(false);

  useEffect(() => { refreshProfile().then(() => setErr(false)).catch(() => setErr(true)); }, [refreshProfile]);

  if (loading && !profile) return <div className="flex items-center justify-center py-20"><Spinner size={28} /></div>;
  if (err && !profile) return <ErrorState message="Couldn't load your profile." onRetry={() => refreshProfile()} />;

  const featured = CURATED_ADVENTURES[0];
  const info = profile ? getLevelInfo(profile.xp) : null;

  const startFeatured = (a: Adventure) => { setSelectedAdventureObj(a); nav('adventure-detail'); };

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <div className="relative z-10 px-4 pt-6 space-y-5">
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <LevelBadge level={profile?.level ?? 1} size="md" />
            <div>
              <p className="text-xs text-white/40">Welcome back</p>
              <h2 className="text-lg font-display font-bold text-white">{profile?.username ?? 'Explorer'}</h2>
            </div>
          </div>
          <button onClick={() => setScreen('settings')} className="w-10 h-10 rounded-xl glass flex items-center justify-center active:scale-90 transition-transform">
            <Icon name="Settings" size={18} className="text-white/60" />
          </button>
        </div>

        {profile && info && (
          <GlassCard className="p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/50">Level {info.level}</span>
              <span className="text-[10px] text-white/40">{info.xpIntoLevel}/{info.xpNeeded} XP</span>
            </div>
            <XpBar xp={profile.xp} showText={false} />
          </GlassCard>
        )}

        <div className="grid grid-cols-3 gap-3 animate-slide-up">
          {[
            { icon: 'Route', label: 'Distance', value: profile ? formatDistance(profile.distance_walked) : '0 m', color: 'text-zeviqo-400' },
            { icon: 'Compass', label: 'Adventures', value: formatNumber(profile?.completed_adventures ?? 0), color: 'text-ember-400' },
            { icon: 'Flame', label: 'Streak', value: `${profile?.walking_streak ?? 0}d`, color: 'text-rose-400' }
          ].map(s => (
            <GlassCard key={s.label} className="p-3 flex flex-col items-center text-center">
              <Icon name={s.icon} size={20} className={s.color} />
              <span className="text-base font-display font-bold text-white mt-1">{s.value}</span>
              <span className="text-[10px] text-white/40">{s.label}</span>
            </GlassCard>
          ))}
        </div>

        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-display font-bold text-white">Featured Adventure</h3>
            <button onClick={() => setScreen('adventures')} className="text-xs text-zeviqo-400 font-bold">See all</button>
          </div>
          <GlassCard className="p-4" onClick={() => startFeatured(featured)}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-2xl">{featured.emoji}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-display font-bold text-white truncate">{featured.title}</h4>
                <p className="text-[11px] text-white/40 truncate">{featured.theme}</p>
              </div>
            </div>
            <RoutePreview route={featured.route} color="#00c4ff" animated={false} />
            <div className="flex items-center gap-3 mt-3 text-[11px] text-white/50">
              <span className="flex items-center gap-1"><Icon name="Route" size={12} />{formatDistance(featured.distance)}</span>
              <span className="flex items-center gap-1"><Icon name="Zap" size={12} className="text-zeviqo-400" />{featured.xp} XP</span>
              <span className="flex items-center gap-1"><Icon name="Coins" size={12} className="text-gold-400" />{featured.coins}</span>
            </div>
            <Button fullWidth size="md" icon="Play" className="mt-3" onClick={() => startFeatured(featured)}>Start Adventure</Button>
          </GlassCard>
        </div>

        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-display font-bold text-white">Quick Links</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('daily-rewards')}>
              <Icon name="Gift" size={18} className="text-gold-400" /><span className="text-xs font-bold text-white/70">Daily Rewards</span>
            </GlassCard>
            <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('challenges')}>
              <Icon name="Trophy" size={18} className="text-ember-400" /><span className="text-xs font-bold text-white/70">Challenges</span>
            </GlassCard>
            <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('achievements')}>
              <Icon name="Award" size={18} className="text-plasma-400" /><span className="text-xs font-bold text-white/70">Achievements</span>
            </GlassCard>
            <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('history')}>
              <Icon name="History" size={18} className="text-zeviqo-400" /><span className="text-xs font-bold text-white/70">History</span>
            </GlassCard>
          </div>
        </div>

        <div className="animate-slide-up">
          <h3 className="text-sm font-display font-bold text-white mb-2">Daily Quests</h3>
          <div className="space-y-2">
            {DAILY_QUESTS.slice(0, 2).map(q => (
              <GlassCard key={q.id} className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg glass flex items-center justify-center"><Icon name={q.icon} size={16} className="text-zeviqo-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{q.title}</p>
                  <p className="text-[10px] text-white/40">{q.description}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gold-300"><Icon name="Coins" size={10} />{q.coinReward}</div>
              </GlassCard>
            ))}
          </div>
          <button onClick={() => setScreen('quests')} className="w-full text-center text-xs text-zeviqo-400 font-bold mt-2">View all quests</button>
        </div>
      </div>
    </div>
  );
}
