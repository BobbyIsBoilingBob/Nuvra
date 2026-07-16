import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon } from '../components/ui';

export function LandingScreen() {
  const { go } = useStore();
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      <AdventureBg variant="aurora" />
      <div className="relative z-10 flex items-center gap-2 animate-rise">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-nova-300 to-nova-500 shadow-glow flex items-center justify-center"><Icon name="Compass" size={22} className="text-ink-950" /></div>
        <span className="font-display text-2xl font-extrabold tracking-tight text-white">Nuvra</span>
      </div>
      <div className="relative z-10 text-center mt-10 max-w-lg">
        <p className="chip mx-auto mb-4 bg-nova-400/10 border border-nova-400/30 text-nova-200"><Icon name="Sparkles" size={13} /> AI-powered adventure platform</p>
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight"><span className="text-white">Every journey</span><br /><span className="text-gradient">becomes an adventure.</span></h1>
        <p className="mt-5 text-base sm:text-lg text-slate-300/90 max-w-md mx-auto">Turn your walks into quests, challenges, and rewards. Explore the world, level up, and chase adventures — powered by your footsteps.</p>
      </div>
      <div className="relative z-10 mt-10 animate-float-slow"><PhonePreview /></div>
      <div className="relative z-10 mt-10 w-full max-w-xs flex flex-col gap-3">
        <button onClick={() => go('onboarding')} className="btn-glow w-full py-4 text-base">Start Exploring <Icon name="ArrowRight" size={18} /></button>
        <p className="text-center text-xs text-slate-400">Free to play. No headset required — just your feet.</p>
      </div>
      <div className="relative z-10 mt-12 grid grid-cols-3 gap-3 max-w-md w-full text-center">
        {[{ icon: 'Footprints', label: 'Walk' }, { icon: 'Sparkles', label: 'AI Adventures' }, { icon: 'Users', label: 'Explore together' }].map((f) => (
          <div key={f.label} className="glass rounded-2xl py-4 px-2"><Icon name={f.icon} size={22} className="mx-auto text-nova-300" /><p className="mt-2 text-xs font-semibold text-slate-200">{f.label}</p></div>
        ))}
      </div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="relative w-[230px] h-[470px] rounded-[2.5rem] border border-white/15 bg-ink-900/80 backdrop-blur-xl shadow-glass p-3 overflow-hidden">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-ink-950 z-20" />
      <div className="relative h-full rounded-[2rem] bg-gradient-to-b from-ink-800 to-ink-950 overflow-hidden">
        <AdventureBg variant="map" />
        <div className="relative z-10 p-4 pt-8 flex flex-col h-full">
          <div className="flex items-center justify-between text-[10px]">
            <span className="hud-pill !py-1 !px-2 !text-[10px]"><Icon name="Footprints" size={11} className="text-nova-300" /> Lv.7</span>
            <span className="hud-pill !py-1 !px-2 !text-[10px]"><Icon name="Coins" size={11} className="text-gold-300" /> 1,240</span>
          </div>
          <div className="mt-auto glass rounded-2xl p-3">
            <p className="text-[10px] text-nova-300 font-semibold">CURRENT QUEST</p>
            <p className="text-sm font-bold text-white">Harbor Lights Loop</p>
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-nova-300 to-nova-500" /></div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-300"><span>2.4 km</span><span className="text-nova-300 font-semibold">+120 XP</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
