import { useStore } from '../store';
import { Card, Screen, Button, EmptyState, ProgressBar, Badge } from '../components/ui';
import { MapPin, Clock, Zap, Star, ArrowLeft, CircleCheck as CheckCircle2 } from 'lucide-react';

export default function AdventurePreview() {
  const { activeAdventureId, setScreen } = useStore();
  if (!activeAdventureId) return <Screen><EmptyState icon={MapPin} title="No adventure selected" /><Button onClick={() => setScreen('adventures')} className="mt-4">Browse Adventures</Button></Screen>;
  return (
    <Screen>
      <button onClick={() => setScreen('adventureDetail')} className="flex items-center gap-1 text-ink-400 text-sm mb-4"><ArrowLeft size={16} /> Back</button>
      <Card className="p-4 mb-4"><h2 className="font-display text-xl font-bold text-white mb-1">Preview</h2><p className="text-ink-400 text-sm mb-3">Review the adventure before starting</p></Card>
      <Button onClick={() => setScreen('adventureMap')} className="w-full mb-4">Begin Adventure</Button>
    </Screen>
  );
}
