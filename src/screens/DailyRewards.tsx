import { GlassCard, Icon, Button, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { DAILY_REWARDS } from '../data';

export function DailyRewards() {
  const { lastDailyRewardDay, lastDailyRewardDate, dailyRewardStreak, claimDailyReward } = useStore();
  const { profile, updateProfile } = useAuth();
  if (!profile) return null;

  const today = new Date().toISOString().split('T')[0];
  const canClaim = lastDailyRewardDate !== today;
  const nextDay = (lastDailyRewardDay ?? 0) + 1;
  const claimableDay = nextDay > 7 ? 1 : nextDay;

  const handleClaim = () => {
    const reward = DAILY_REWARDS.find(r => r.day === claimableDay) ?? DAILY_REWARDS[0];
    claimDailyReward(claimableDay);
    updateProfile({
      coins: profile.coins + reward.coins,
      xp: profile.xp + reward.xp
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#f5b800" />
      <div className="relative z-10">
        <TopBar title="Daily Rewards" showBack />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4 pt-4">
          <GlassCard className="p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-ember-500 flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
              <Icon name="Gift" size={32} className="text-ink-950" />
            </div>
            <h2 className="text-lg font-display font-bold text-white">7-Day Reward Calendar</h2>
            <p className="text-xs text-white/50 mt-1">Log in daily to claim bigger rewards!</p>
            <div className="mt-3"><Pill icon="Flame" accent="text-ember-300 border-ember-500/30">{dailyRewardStreak} day streak</Pill></div>
          </GlassCard>
          <div className="grid grid-cols-4 gap-2">
            {DAILY_REWARDS.map(r => {
              const claimed = lastDailyRewardDay !== null && r.day <= lastDailyRewardDay && lastDailyRewardDate === today;
              const isNext = r.day === claimableDay && canClaim;
              return (
                <GlassCard key={r.day} className={`p-3 flex flex-col items-center gap-1 ${isNext ? 'ring-2 ring-zeviqo-400 animate-pulse-glow' : ''} ${claimed ? 'opacity-40' : ''}`}>
                  <div className="text-[10px] font-bold text-white/40 uppercase">Day {r.day}</div>
                  <div className="text-2xl">{r.day === 7 ? '🎁' : '🪙'}</div>
                  <div className="text-[10px] font-bold text-gold-300">+{r.coins}</div>
                  {r.gems > 0 && <div className="text-[10px] font-bold text-plasma-300">+{r.gems}💎</div>}
                  {r.xp > 0 && <div className="text-[10px] font-bold text-zeviqo-300">+{r.xp}xp</div>}
                  {claimed && <Icon name="Check" size={12} className="text-emerald-400" />}
                </GlassCard>
              );
            })}
          </div>
          {canClaim ? (
            <Button size="lg" fullWidth icon="Gift" onClick={handleClaim}>Claim Day {claimableDay} Reward</Button>
          ) : (
            <GlassCard className="p-4 text-center">
              <Icon name="CheckCircle" size={24} className="text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Reward Claimed!</div>
              <div className="text-xs text-white/40">Come back tomorrow for more rewards.</div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
