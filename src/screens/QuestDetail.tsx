import { useStore } from '../store';
import { useQuests } from '../hooks/useQuests';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { CircleCheck as CheckCircle2, Circle, Clock, Trophy } from 'lucide-react';

export default function QuestDetail() {
  const goBack = useStore((s) => s.goBack);
  const questId = useStore((s) => s.activeQuestId);
  const { quests, loading, completeQuest, error } = useQuests();
  const quest = quests.find((q) => q.id === questId);
  if (loading) return (<div><Header title="Quest" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  if (!quest) return (<div><Header title="Quest" onBack={goBack} /><div className="px-4 py-8 text-center text-error-600">{error ?? 'Quest not found'}<Button className="mt-2" onClick={goBack}>Go Back</Button></div></div>);
  return (
    <div>
      <Header title={quest.title} onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        <Card><div className="flex items-start gap-3">{quest.completed ? <CheckCircle2 size={24} className="text-success-500 mt-0.5" /> : <Circle size={24} className="text-brand-500 mt-0.5" />}<div><h2 className="text-lg font-bold">{quest.title}</h2><p className="text-ink-600 mt-1">{quest.description}</p></div></div></Card>
        <Card><h3 className="font-semibold mb-2">Rewards</h3><div className="flex items-center gap-3"><div className="flex items-center gap-1 text-accent-600 font-semibold">🪙 {quest.rewardCoins ?? 50}</div><div className="flex items-center gap-1 text-brand-600 font-semibold">⭐ {quest.rewardXp ?? 100} XP</div>{quest.rewardItem && <div className="text-ink-700">🎁 {quest.rewardItem}</div>}</div></Card>
        <Card><h3 className="font-semibold mb-2">Progress</h3><div className="flex items-center gap-2 text-sm text-ink-500"><Clock size={16} />{quest.completed ? 'Completed' : quest.expiresAt ? `Expires ${new Date(quest.expiresAt).toLocaleString()}` : 'No deadline'}</div></Card>
        {!quest.completed && <Button fullWidth onClick={() => completeQuest(quest.id).catch(() => {})}><Trophy size={18} className="inline mr-2" />Complete Quest</Button>}
      </div>
    </div>
  );
}
