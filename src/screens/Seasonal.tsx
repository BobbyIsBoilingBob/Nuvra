import { useState } from 'react';
import { Icon, GlassCard, Button, Pill, SectionTitle, ProgressBar } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { SEASONAL_EVENTS } from '../cosmetics';

export function Seasonal(): React.ReactElement {
  const { setScreen } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeEvent = SEASONAL_EVENTS.find((e) => e.status === 'active') ?? null;
  const upcomingEvents = SEASONAL_EVENTS.filter((e) => e.status === 'upcoming');
  const pastEvents = SEASONAL_EVENTS.filter((e) => e.status === 'ended');

  const toggleExpand = (id: string): void => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderCountdown = (daysLeft: number): React.ReactElement => {
    if (daysLeft <= 0) {
      return (
        <Pill icon="Clock" accent="text-rose-300 border-rose-500/30">
          Ended
        </Pill>
      );
    }
    if (daysLeft === 1) {
      return (
        <Pill icon="Clock" accent="text-gold-300 border-gold-500/30">
          1 day left
        </Pill>
      );
    }
    return (
      <Pill icon="Clock" accent="text-nova-300 border-nova-500/30">
        {daysLeft} days left
      </Pill>
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="cyber" accent="#fb923c" />

      <div className="relative z-10">
        <TopBar showBack title="Seasonal Events" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Active event highlight card */}
          {activeEvent && (
            <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${activeEvent.bgGradient} border border-white/10`}>
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="relative p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeEvent.accent} flex items-center justify-center text-3xl shadow-glow`}>
                      <span>{activeEvent.emoji}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-nova-300">Active Now</span>
                      </div>
                      <h2 className="text-xl font-black text-white">{activeEvent.name}</h2>
                    </div>
                  </div>
                  {renderCountdown(activeEvent.daysLeft)}
                </div>

                <p className="text-sm text-white/70">{activeEvent.desc}</p>

                {/* Countdown progress */}
                <div>
                  <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
                    <span className="font-semibold">Event Duration</span>
                    <span className="font-bold text-white">{activeEvent.daysLeft} days remaining</span>
                  </div>
                  <ProgressBar
                    value={Math.max(activeEvent.daysLeft, 0)}
                    max={180}
                    accent={activeEvent.accent}
                    height={6}
                  />
                </div>

                {/* Exclusive cosmetics */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Exclusive Cosmetics</div>
                  <div className="flex flex-wrap gap-2">
                    {activeEvent.exclusiveCosmetics.map((cosmetic) => (
                      <Pill key={cosmetic} accent="text-white/80 border-white/15">
                        {cosmetic}
                      </Pill>
                    ))}
                  </div>
                </div>

                {/* Special rewards */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Special Rewards</div>
                  <div className="flex flex-col gap-1.5">
                    {activeEvent.specialRewards.map((reward) => (
                      <div key={reward} className="flex items-center gap-2 text-xs text-white/70">
                        <Icon name="Gift" size={14} className="text-gold-300" />
                        {reward}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="gold"
                  fullWidth
                  icon="Compass"
                  onClick={() => setScreen('adventures')}
                >
                  Play Seasonal Adventure
                </Button>
              </div>
            </div>
          )}

          {/* Upcoming events */}
          <div>
            <SectionTitle icon="CalendarClock" accent="text-nova-300">
              Upcoming Events
            </SectionTitle>
            <div className="mt-3 flex flex-col gap-3">
              {upcomingEvents.map((event) => {
                const isExpanded = expandedId === event.id;
                return (
                  <GlassCard key={event.id} className="overflow-hidden">
                    <button
                      onClick={() => toggleExpand(event.id)}
                      className="w-full p-4 flex items-center gap-3 text-left"
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${event.accent} flex items-center justify-center text-2xl flex-shrink-0`}>
                        <span>{event.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white">{event.name}</h3>
                        <p className="text-xs text-white/50 truncate">{event.desc}</p>
                        <div className="mt-1.5">
                          {renderCountdown(event.daysLeft)}
                        </div>
                      </div>
                      <Icon
                        name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                        size={18}
                        className="text-white/40 flex-shrink-0"
                      />
                    </button>

                    {/* Expandable detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 flex flex-col gap-3 animate-fade-in">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
                            Exclusive Cosmetics
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {event.exclusiveCosmetics.map((cosmetic) => (
                              <Pill key={cosmetic} accent="text-white/80 border-white/15">
                                {cosmetic}
                              </Pill>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
                            Special Rewards
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {event.specialRewards.map((reward) => (
                              <div key={reward} className="flex items-center gap-2 text-xs text-white/70">
                                <Icon name="Gift" size={14} className="text-gold-300" />
                                {reward}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* Past events teaser */}
          {pastEvents.length > 0 && (
            <div>
              <SectionTitle icon="History" accent="text-white/40">
                Past Events
              </SectionTitle>
              <div className="mt-3 flex flex-col gap-2">
                {pastEvents.map((event) => (
                  <GlassCard key={event.id} className="p-3 flex items-center gap-3 opacity-50">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${event.accent} flex items-center justify-center text-xl flex-shrink-0 grayscale`}>
                      <span>{event.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white">{event.name}</h3>
                      <p className="text-xs text-white/40">{event.season} · Ended</p>
                    </div>
                    <Pill icon="Lock" accent="text-white/30 border-white/10">
                      Archive
                    </Pill>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* If no past events, show teaser */}
          {pastEvents.length === 0 && (
            <GlassCard className="p-4 flex items-center gap-3 opacity-60">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                <Icon name="History" size={18} className="text-white/40" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">Past Events Archive</h3>
                <p className="text-xs text-white/40">Completed seasonal events will appear here.</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
