import React, { useEffect, useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useStore } from '../store';
import { getLevelInfo, LOADING_TIPS, type LevelInfo } from '../data';

export interface IconProps { name: string; size?: number; className?: string; style?: React.CSSProperties; strokeWidth?: number }
export function Icon({ name, size = 20, className, style, strokeWidth = 2 }: IconProps): React.ReactElement {
  const lib = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; strokeWidth?: number }>>;
  const Cmp = lib[name] ?? lib.Circle;
  return <Cmp size={size} className={className} style={style} strokeWidth={strokeWidth} />;
}

export interface GlassCardProps { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }
export function GlassCard({ children, className = '', onClick, style }: GlassCardProps): React.ReactElement {
  const interactive = onClick != null;
  return (
    <div onClick={onClick} style={style}
      className={`glass rounded-2xl ${interactive ? 'cursor-pointer hover:bg-white/[0.1] active:scale-[0.98] transition-all duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
}

export interface ProgressBarProps { value: number; max?: number; accent?: string; height?: number; showShimmer?: boolean }
export function ProgressBar({ value, max = 100, accent = 'from-nova-400 to-cyan-300', height = 8, showShimmer = true }: ProgressBarProps): React.ReactElement {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full rounded-full bg-white/[0.08] overflow-hidden" style={{ height }}>
      <div className={`h-full rounded-full bg-gradient-to-r ${accent} transition-all duration-500 ease-out relative overflow-hidden`} style={{ width: `${pct}%` }}>
        {showShimmer && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[progress-shimmer_2s_linear_infinite]" />}
      </div>
    </div>
  );
}

export interface PillProps { children: React.ReactNode; icon?: string; accent?: string; className?: string }
export function Pill({ children, icon, accent = 'text-white/60 border-white/10', className = '' }: PillProps): React.ReactElement {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${accent} ${className}`}>
      {icon && <Icon name={icon} size={10} />}{children}
    </span>
  );
}

export interface ButtonProps {
  children: React.ReactNode; variant?: 'primary'|'secondary'|'ghost'|'danger'; size?: 'sm'|'md'|'lg';
  fullWidth?: boolean; icon?: string; onClick?: () => void; disabled?: boolean; className?: string; type?: 'button'|'submit';
}
export function Button({ children, variant='primary', size='md', fullWidth=false, icon, onClick, disabled=false, className='', type='button' }: ButtonProps): React.ReactElement {
  const variants = {
    primary: 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950 hover:shadow-glow',
    secondary: 'glass text-white hover:bg-white/10',
    ghost: 'text-white/60 hover:text-white hover:bg-white/5',
    danger: 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30',
  };
  const sizes = { sm: 'px-3 py-2 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${fullWidth?'w-full':''} ${className}`}>
      {icon && <Icon name={icon} size={size==='sm'?14:16} />}{children}
    </button>
  );
}

export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }): React.ReactElement {
  return <div className={`animate-spin rounded-full border-2 border-white/10 border-t-nova-400 ${className}`} style={{ width: size, height: size }} />;
}

export interface EmptyStateProps { icon: string; title: string; desc: string; action?: React.ReactNode }
export function EmptyState({ icon, title, desc, action }: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
        <Icon name={icon} size={28} className="text-white/30" />
      </div>
      <h3 className="text-sm font-bold text-white/70 mb-1">{title}</h3>
      <p className="text-xs text-white/40 max-w-xs mb-4">{desc}</p>
      {action}
    </div>
  );
}

export function LoadingScreen(): React.ReactElement {
  const [tip, setTip] = useState(0);
  useEffect(() => { const id = setInterval(() => setTip(t => (t+1)%LOADING_TIPS.length), 3000); return () => clearInterval(id); }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nova-400 to-plasma-500 flex items-center justify-center text-3xl animate-pulse">🧭</div>
      <Spinner size={32} />
      <p className="text-xs text-white/40 max-w-xs text-center animate-[fade-in_0.3s_ease-out]">{LOADING_TIPS[tip]}</p>
    </div>
  );
}

export interface RewardPopupProps { rewards: Array<{ icon: string; label: string; amount: number; color: string }>; visible: boolean; onClose: () => void }
export function RewardPopup({ rewards, visible, onClose }: RewardPopupProps): React.ReactElement | null {
  useEffect(() => { if (visible) { const id = setTimeout(onClose, 3000); return () => clearTimeout(id); } }, [visible, onClose]);
  if (!visible) return null;
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[3000] animate-[bounce-in_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
      <div className="glass-strong rounded-2xl px-5 py-3 flex items-center gap-3 shadow-glow-lg">
        {rewards.map((r, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Icon name={r.icon} size={18} className={r.color} />
            <span className="text-sm font-black text-white">+{r.amount}</span>
            <span className="text-xs text-white/50">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LevelBadge({ level, size = 'md' }: { level: number; size?: 'sm'|'md'|'lg' }): React.ReactElement {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  return <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-nova-400 to-plasma-500 flex items-center justify-center font-black text-ink-950 no-select`}>{level}</div>;
}

export function XpBar({ compact = false }: { compact?: boolean }): React.ReactElement {
  const { profile } = useStore();
  const levelInfo: LevelInfo = useMemo(() => getLevelInfo(profile.xp), [profile.xp]);
  return (
    <div className={compact ? 'flex items-center gap-2' : 'flex flex-col gap-1.5'}>
      {!compact && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white/60">Level {levelInfo.level}</span>
          <span className="text-xs text-white/40">{levelInfo.xpIntoLevel} / {levelInfo.xpForNext - (levelInfo.level-1)**2*100} XP</span>
        </div>
      )}
      <ProgressBar value={levelInfo.progress} accent="from-nova-400 to-cyan-300" height={compact?6:8} />
    </div>
  );
}

export interface StatChipProps { icon: string; label: string; value: string|number; color?: string }
export function StatChip({ icon, label, value, color = 'text-white' }: StatChipProps): React.ReactElement {
  return (
    <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
      <Icon name={icon} size={16} className={color} />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</span>
        <span className="text-sm font-black text-white">{value}</span>
      </div>
    </div>
  );
}

export interface ModalProps { visible: boolean; onClose: () => void; title?: string; children: React.ReactNode }
export function Modal({ visible, onClose, title, children }: ModalProps): React.ReactElement | null {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" />
      <div className="relative glass-strong rounded-2xl p-5 max-w-sm mx-4 w-full animate-[scale-in_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-white">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/60"><Icon name="X" size={16} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
