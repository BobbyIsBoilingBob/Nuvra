import { useState, useEffect, type ReactNode, type CSSProperties } from 'react';
import * as LucideIcons from 'lucide-react';
import { APP_NAME, getLevelInfo, type LevelInfo } from '../data';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '../store';

type IconName = keyof typeof LucideIcons;

export function Icon({ name, size = 20, className = '', style }: { name: string; size?: number; className?: string; style?: CSSProperties }) {
  const Comp = (LucideIcons as unknown as Record<string, LucideIcon>)[name] ?? LucideIcons.Circle;
  return <Comp size={size} className={className} style={style} />;
}

export function GlassCard({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`glass rounded-2xl ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function ProgressBar({ value, max, className = '', colorClass = 'from-zeviqo-400 to-zeviqo-500' }: { value: number; max: number; className?: string; colorClass?: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div className={`h-2 rounded-full bg-white/10 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Pill({ children, icon, accent = 'text-white/60 border-white/10' }: { children: ReactNode; icon?: string; accent?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${accent} bg-white/5`}>
      {icon && <Icon name={icon} size={10} />}
      {children}
    </span>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', fullWidth = false, icon, disabled = false, className = '' }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg'; fullWidth?: boolean; icon?: string; disabled?: boolean; className?: string;
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950 font-bold shadow-lg shadow-zeviqo-500/20',
    secondary: 'glass-strong text-white font-bold border-white/10',
    ghost: 'text-white/60 font-semibold hover:text-white/90',
    danger: 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs rounded-lg gap-1', md: 'px-4 py-2.5 text-sm rounded-xl gap-1.5', lg: 'px-6 py-3 text-base rounded-xl gap-2' };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}

export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-white/10 border-t-zeviqo-400 ${className}`} style={{ width: size, height: size }} />
  );
}

export function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
        <Icon name={icon} size={28} className="text-white/30" />
      </div>
      <h3 className="text-base font-bold text-white/70 mb-1">{title}</h3>
      <p className="text-xs text-white/40 max-w-xs mb-4">{desc}</p>
      {action}
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-ink-950 z-50">
      <ZeviqoLogo size="lg" />
      <div className="mt-6"><Spinner size={28} /></div>
    </div>
  );
}

export function RewardPopup({ rewards, visible, onClose }: { rewards: Array<{ icon: string; label: string; amount: number; color: string }>; visible: boolean; onClose: () => void }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong rounded-3xl p-8 mx-6 max-w-sm w-full text-center animate-pulse-glow" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-display font-extrabold text-gradient mb-4">Rewards Earned!</h3>
        <div className="flex flex-col gap-3">
          {rewards.map((r, i) => (
            <div key={i} className="flex items-center justify-center gap-2">
              <Icon name={r.icon} size={20} className={r.color} />
              <span className={`text-lg font-bold ${r.color}`}>+{r.amount} {r.label}</span>
            </div>
          ))}
        </div>
        <Button variant="primary" size="md" fullWidth className="mt-6" onClick={onClose}>Collect</Button>
      </div>
    </div>
  );
}

export function LevelBadge({ xp, size = 'md' }: { xp: number; size?: 'sm' | 'md' | 'lg' }) {
  const info = getLevelInfo(xp);
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-zeviqo-400 to-plasma-500 flex items-center justify-center font-display font-extrabold text-ink-950 shadow-lg shadow-zeviqo-500/20`}>
      {info.level}
    </div>
  );
}

export function XpBar({ xp, showText = true, className = '' }: { xp: number; showText?: boolean; className?: string }) {
  const info: LevelInfo = getLevelInfo(xp);
  return (
    <div className={className}>
      {showText && (
        <div className="flex justify-between text-[10px] font-bold text-white/40 mb-1">
          <span>LV {info.level}</span>
          <span>{info.xpIntoLevel}/{info.xpNeeded} XP</span>
        </div>
      )}
      <ProgressBar value={info.xpIntoLevel} max={info.xpNeeded} />
    </div>
  );
}

export function StatChip({ icon, label, value, color = 'text-white' }: { icon: string; label: string; value: string | number; color?: string }) {
  return (
    <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
      <Icon name={icon} size={16} className={color} />
      <div>
        <div className="text-[9px] font-bold uppercase text-white/40">{label}</div>
        <div className={`text-sm font-bold ${color}`}>{value}</div>
      </div>
    </div>
  );
}

export function Modal({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (visible) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [visible]);
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-white">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center"><Icon name="X" size={16} className="text-white/60" /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function ZeviqoLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const sizes = {
    sm: { box: 'w-8 h-8', text: 'text-lg', icon: 16 },
    md: { box: 'w-12 h-12', text: 'text-2xl', icon: 24 },
    lg: { box: 'w-20 h-20', text: 'text-4xl', icon: 40 }
  };
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-2.5 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className={`${s.box} rounded-2xl bg-gradient-to-br from-zeviqo-400 via-zeviqo-500 to-plasma-500 flex items-center justify-center shadow-lg shadow-zeviqo-500/30 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer" />
        <Icon name="Compass" size={s.icon} className="text-ink-950 relative z-10" />
      </div>
      <span className={`font-display font-extrabold ${s.text} text-gradient-zeviqo tracking-tight`}>{APP_NAME}</span>
    </div>
  );
}
