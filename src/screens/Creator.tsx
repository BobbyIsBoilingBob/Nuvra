import { useState } from 'react';
import { Icon, GlassCard, Button, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { ADVENTURE_TYPE_META, type AdventureType } from '../data';

const DIFFICULTIES: { id: 'Easy' | 'Medium' | 'Hard' | 'Epic'; label: string; accent: string }[] = [
  { id: 'Easy', label: 'Easy', accent: 'from-nova-400 to-cyan-400' },
  { id: 'Medium', label: 'Medium', accent: 'from-gold-300 to-ember-400' },
  { id: 'Hard', label: 'Hard', accent: 'from-ember-400 to-rose-500' },
  { id: 'Epic', label: 'Epic', accent: 'from-rose-400 to-plasma-500' },
];

export function Creator(): React.ReactElement {
  const { setScreen } = useStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<AdventureType>('explorer');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Epic'>('Easy');
  const [distance, setDistance] = useState(2);
  const [duration, setDuration] = useState(30);
  const [description, setDescription] = useState('');

  const typeMeta = ADVENTURE_TYPE_META[type];

  const xpReward = Math.round(50 + distance * 30 + duration * 1.5 + (difficulty === 'Epic' ? 200 : difficulty === 'Hard' ? 120 : difficulty === 'Medium' ? 60 : 0));
  const coinReward = Math.round(40 + distance * 20 + duration + (difficulty === 'Epic' ? 150 : difficulty === 'Hard' ? 90 : difficulty === 'Medium' ? 40 : 0));

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="cyber" accent="#40f5cb" />

      <div className="relative z-10">
        <TopBar showBack title="Create Adventure" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Adventure name */}
          <GlassCard className="p-5">
            <SectionTitle icon="PenTool" accent="text-nova-300">
              Adventure Name
            </SectionTitle>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mystic Forest Trail"
              maxLength={40}
              className="mt-3 w-full px-4 py-3 rounded-xl glass text-white text-sm font-semibold placeholder:text-white/30 outline-none focus:ring-1 focus:ring-nova-400/40 transition-all"
            />
          </GlassCard>

          {/* Type selection */}
          <div>
            <SectionTitle icon="Compass" accent="text-nova-300">
              Adventure Type
            </SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(Object.keys(ADVENTURE_TYPE_META) as AdventureType[]).map((t) => {
                const meta = ADVENTURE_TYPE_META[t];
                const active = type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-200 ${
                      active
                        ? `bg-gradient-to-br ${meta.accent} shadow-glow`
                        : 'glass hover:bg-white/[0.1]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-ink-950/20' : `bg-gradient-to-br ${meta.accent}`
                    }`}>
                      <Icon name={meta.icon} size={20} className={active ? 'text-white' : 'text-ink-950'} />
                    </div>
                    <div className={`text-sm font-bold ${active ? 'text-ink-950' : 'text-white'}`}>
                      {meta.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty selector */}
          <div>
            <SectionTitle icon="Flame" accent="text-ember-300">
              Difficulty
            </SectionTitle>
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              {DIFFICULTIES.map((d) => {
                const active = difficulty === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      active
                        ? `bg-gradient-to-r ${d.accent} text-ink-950 shadow-glow`
                        : 'glass text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon
                      name={d.id === 'Easy' ? 'Circle' : d.id === 'Medium' ? 'Gauge' : d.id === 'Hard' ? 'Flame' : 'Zap'}
                      size={14}
                    />
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance slider */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={20} className="text-nova-300" />
                <h3 className="text-sm font-bold text-white">Distance</h3>
              </div>
              <Pill accent="text-nova-300 border-nova-500/30">
                {distance.toFixed(1)} km
              </Pill>
            </div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={distance}
              onChange={(e) => setDistance(parseFloat(e.target.value))}
              className="mt-4 w-full accent-nova-400"
            />
            <div className="mt-1.5 flex justify-between text-[10px] text-white/40 font-semibold">
              <span>0.5 km</span>
              <span>10 km</span>
            </div>
          </GlassCard>

          {/* Duration slider */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={20} className="text-nova-300" />
                <h3 className="text-sm font-bold text-white">Duration</h3>
              </div>
              <Pill accent="text-nova-300 border-nova-500/30">
                {duration} min
              </Pill>
            </div>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              className="mt-4 w-full accent-nova-400"
            />
            <div className="mt-1.5 flex justify-between text-[10px] text-white/40 font-semibold">
              <span>10 min</span>
              <span>90 min</span>
            </div>
          </GlassCard>

          {/* Description */}
          <GlassCard className="p-5">
            <SectionTitle icon="BookOpen" accent="text-plasma-300">
              Description
            </SectionTitle>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the adventure, what explorers will discover, and any special highlights..."
              maxLength={200}
              rows={3}
              className="mt-3 w-full px-4 py-3 rounded-xl glass text-white text-sm font-semibold placeholder:text-white/30 outline-none focus:ring-1 focus:ring-nova-400/40 transition-all resize-none"
            />
            <div className="mt-1.5 text-right text-[10px] text-white/30 font-semibold">
              {description.length}/200
            </div>
          </GlassCard>

          {/* Preview card */}
          <div>
            <SectionTitle icon="Eye" accent="text-nova-300">
              Preview
            </SectionTitle>
            <GlassCard className="mt-3 p-5">
              <div className={`w-full h-32 rounded-2xl bg-gradient-to-br ${typeMeta.accent} flex items-center justify-center mb-4`}>
                <Icon name={typeMeta.icon} size={48} className="text-ink-950/60" />
              </div>
              <h3 className="text-lg font-black text-white">
                {name || 'Untitled Adventure'}
              </h3>
              <p className="text-sm text-white/50 mt-1 line-clamp-2">
                {description || 'No description yet.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill icon={typeMeta.icon} accent="text-nova-300 border-nova-500/30">
                  {typeMeta.label}
                </Pill>
                <Pill
                  icon={difficulty === 'Easy' ? 'Circle' : difficulty === 'Medium' ? 'Gauge' : difficulty === 'Hard' ? 'Flame' : 'Zap'}
                  accent="text-ember-300 border-ember-500/30"
                >
                  {difficulty}
                </Pill>
                <Pill icon="MapPin" accent="text-white/60 border-white/10">
                  {distance.toFixed(1)} km
                </Pill>
                <Pill icon="Clock" accent="text-white/60 border-white/10">
                  {duration} min
                </Pill>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Icon name="Zap" size={16} className="text-nova-300" />
                  <span className="text-sm font-bold text-white">+{xpReward} XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="Coins" size={16} className="text-gold-300" />
                  <span className="text-sm font-bold text-white">+{coinReward} coins</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Publish button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon="Rocket"
            disabled={!name.trim()}
            onClick={() => setScreen('adventures')}
          >
            Publish Adventure
          </Button>
        </div>
      </div>
    </div>
  );
}

function Pill({ icon, accent, children }: { icon?: string; accent: string; children: React.ReactNode }): React.ReactElement {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-white/[0.04] ${accent}`}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}
