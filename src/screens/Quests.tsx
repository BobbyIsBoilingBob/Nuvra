import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, ProgressBar } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { BottomNav } from '../components/BottomNav';
import { QUESTS, DAILY_REWARDS } from '../data';

export function Quests() {
  const { completedQuests, claimQuest, questProgress } = useStore();
  const { profile, updateProfile } = useAuth();

  const dailyQuests = QUESTS.filter(q => q.category === 'daily');
  const weeklyQuests = QUESTS.filter(q => q.category === 'weekly');

  function handleClaim(questId: string) {
    const quest = QUESTS.find(q => q.id === questId);
    if (!quest || completedQuests.includes(questId)) return;
    const progress = questProgress[quest.metric] ?? 0;
    if (progress < quest.target) return;
    claimQuest(questId);
    if (profile) updateProfile({ xp: profile.xp + quest.reward.xp, coins: profile.coins + quest.reward.coins });
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Quests" showCurrencies />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <QuestSection title="Daily Quests" icon="CalendarClock" quests={dailyQuests} progress={questProgress} completed={completedQuests} onClaim={handleClaim} />
        <QuestSection title="Weekly Quests" icon="Route" quests={weeklyQuests} progress={questProgress} completed={completedQuests} onClaim={handleClaim} />
      </div>
      <BottomNav />
    </div>
  );
}

function QuestSection({ title, icon, quests, progress, completed, onClaim }: {
  title: string; icon: string; quests: typeof QUESTS; progress: Record<string, number>;
  completed: string[]; onClaim: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2"><Icon name={icon} size={16} className="text-zeviqo-400" /><h2 className="text-sm font-bold text-white">{title}</h2></div>
      <div className="space-y-2">
        {quests.map(q => {
          const current = progress[q.metric] ?? 0;
          const isComplete = current >= q.target;
          const claimed = completed.includes(q.id);
          return (
            <GlassCard key={q.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Icon name={q.icon} size={18} className="text-zeviqo-400" /></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{q.title}</p>
                  <p className="text-[10px] text-white/40">{q.description}</p>
                  <div className="mt-1.5"><ProgressBar value={Math.min(current, q.target)} max={q.target} height={4} /></div>
                  <p className="text-[9px] text-white/40 mt-1">{Math.min(current, q.target)} / {q.target}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Pill icon="Zap" accent="text-gold-300 border-gold-500/30">+{q.reward.xp}</Pill>
                  {claimed ? <Pill accent="text-emerald-300 border-emerald-500/30">Claimed</Pill> : isComplete ? <Button size="sm" onClick={() => onClaim(q.id)}>Claim</Button> : <span className="text-[9px] text-white/30">In progress</span>}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
