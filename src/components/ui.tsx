import { useState, useEffect, type ReactNode, type CSSProperties } from 'react';
import {
  Activity, AlertCircle, ArrowLeft, ArrowRight, Award, Bell, BookOpen,
  CalendarClock, Check, CheckCircle, ChevronLeft, ChevronRight, Clock, Coins,
  Compass, Crown, Eye, Flame, Footprints, Gem, Gift, Grid, History, Home,
  Info, Lock, LogOut, Mail, Map, MapPin, Package, Palette, Pause, PenTool,
  Play, RefreshCw, Rocket, RotateCcw, Route, Search, Settings, Shield,
  ShoppingBag, Sparkles, Star, Swords, Target, Trash2, TrendingUp, Trophy,
  User, UserPlus, Users, Vibrate, Volume2, X, Zap, Circle, type LucideIcon,
} from 'lucide-react';
import { APP_NAME, getLevelInfo, type LevelInfo } from '../data';

const ICON_MAP: Record<string, LucideIcon> = {
  Activity, AlertCircle, ArrowLeft, ArrowRight, Award, Bell, BookOpen,
  CalendarClock, Check, CheckCircle, ChevronLeft, ChevronRight, Clock, Coins,
  Compass, Crown, Eye, Flame, Footprints, Gem, Gift, Grid, History, Home,
  Info, Lock, LogOut, Mail, Map, MapPin, Package, Palette, Pause, PenTool,
  Play, RefreshCw, Rocket, RotateCcw, Route, Search, Settings, Shield,
  ShoppingBag, Sparkles, Star, Swords, Target, Trash2, TrendingUp, Trophy,
  User, UserPlus, Users, Vibrate, Volume2, X, Zap, Circle,
};

export function Icon({ name, size = 20, className = '', style }: { name: string; size?: number; className?: string; style?: CSSProperties }) {
  const Comp = ICON_MAP[name] ?? Circle;
  return <Comp size={size} className={className} style={style} />;
}

export function GlassCard({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <div onClick={onClick} className={`glass rounded-2xl ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}>{children}</div>;
}

export function ProgressBar({ value, max, className = '', colorClass = 'from-zeviqo-400 to-zeviqo-500', accent, height }: { value: number; max: number; className?: string; colorClass?: string; accent?: string; height?: number }) {
  const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));
  const h = height ? `${height}px` : '0.5rem';
  return <div className={`rounded-full bg-white/10 overflow-hidden ${className}`} style={{ height: h }}><div className={`h-full rounded-full bg-gradient-to-r ${accent ?? colorClass} transition-all duration-500`} style={{ width: `${pct}%` }} /></div>;
}

export function Pill({ children, icon, accent = 'text-white/60 border-white/10', className = '' }: { children: ReactNode; icon?: string; accent?: string; className?: string }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${accent} bg-white/5 ${className}`}>{icon && <Icon name={icon} size={10} />}{children}</span>;
}

export function Button({ children, onClick, variant = 'primary', size = 'md', fullWidth = false, icon, disabled = false, className = '', type = 'button' }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg'; fullWidth?: boolean; icon?: string; disabled?: boolean; className?: string; type?: 'button' | 'submit';
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950 font-bold shadow-lg shadow-zeviqo-500/20',
    secondary: 'glass-strong text-white font-bold border-white/10',
    ghost: 'text-white/60 font-semibold hover:text-white/90',
    danger: 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30',
    gold: 'bg-gradient-to-r from-gold-300 to-ember-500 text-ink-950 font-bold shadow-lg shadow-gold-500/20',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs rounded-lg gap-1', md: 'px-4 py-2.5 text-sm rounded-xl gap-1.5', lg: 'px-6 py-3 text-base rounded-xl gap-2' };
  return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}>{icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}{children}</button>;
}

export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <div className={`inline-block animate-spin rounded-full border-2 border-white/10 border-t-zeviqo-400 ${className}`} style={{ width: size, height: size }} />;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded-xl shimmer-bg ${className}`} style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 75%)', backgroundSize: '200% 100%' }} />;
}

export function SkeletonList({ count = 3, className = '' }: { count?: number; className?: string }) {
  return <>{Array.from({ length: count }).map((_, i) => <Skeleton key={i} className={`h-16 ${className}`} />)}</>;
}

export function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in"><div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4"><Icon name={icon} size={28} className="text-white/30" /></div><h3 className="text-base font-bold text-white/70 mb-1">{title}</h3><p className="text-xs text-white/40 max-w-xs mb-4">{desc}</p>{action}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in"><div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-3"><Icon name="AlertCircle" size={24} className="text-rose-400" /></div><p className="text-sm text-white/60 mb-3">{message}</p>{onRetry && <Button size="sm" variant="secondary" icon="RotateCcw" onClick={onRetry}>Retry</Button>}</div>;
}

export function LoadingScreen() {
  return <div className="fixed inset-0 flex flex-col items-center justify-center bg-ink-950 z-50"><ZeviqoLogo size="lg" /><div className="mt-6"><Spinner size={28} /></div></div>;
}

export function RewardPopup({ rewards, visible, onClose }: { rewards: Array<{ icon: string; label: string; amount: number; color: string }>; visible: boolean; onClose: () => void }) {
  if (!visible) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}><div className="glass-strong rounded-3xl p-8 mx-6 max-w-sm w-full text-center animate-pulse-glow" onClick={e => e.stopPropagation()}><h3 className="text-2xl font-display font-extrabold text-gradient mb-4">Rewards Earned!</h3><div className="flex flex-col gap-3">{rewards.map((r, i) => <div key={i} className="flex items-center justify-center gap-2"><Icon name={r.icon} size={20} className={r.color} /><span className={`text-lg font-bold ${r.color}`}>+{r.amount} {r.label}</span></div>)}</div><Button variant="primary" size="md" fullWidth className="mt-6" onClick={onClose}>Collect</Button></div></div>;
}

export function LevelBadge({ level, size = 'md' }: { level: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  return <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-zeviqo-400 to-plasma-500 flex items-center justify-center font-display font-extrabold text-ink-950 shadow-lg shadow-zeviqo-500/20`}>{level}</div>;
}

export function XpBar({ xp, showText = true, className = '' }: { xp: number; showText?: boolean; className?: string }) {
  const info: LevelInfo = getLevelInfo(xp);
  return <div className={className}>{showText && <div className="flex justify-between text-[10px] font-bold text-white/40 mb-1"><span>LV {info.level}</span><span>{info.xpIntoLevel}/{info.xpNeeded} XP</span></div>}<ProgressBar value={info.xpIntoLevel} max={info.xpNeeded} /></div>;
}

export function ConfirmDialog({ visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }: {
  visible: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  if (!visible) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6" onClick={onCancel}><div className="glass-strong rounded-3xl p-6 max-w-sm w-full animate-slide-up" onClick={e => e.stopPropagation()}><div className="flex items-start gap-3 mb-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-rose-500/20' : 'bg-zeviqo-500/20'}`}><Icon name={danger ? 'AlertTriangle' : 'HelpCircle'} size={20} className={danger ? 'text-rose-400' : 'text-zeviqo-400'} /></div><div><h3 className="text-base font-display font-bold text-white">{title}</h3><p className="text-sm text-white/50 mt-1">{message}</p></div></div><div className="flex gap-2"><Button variant="ghost" size="md" fullWidth onClick={onCancel}>{cancelLabel}</Button><Button variant={danger ? 'danger' : 'primary'} size="md" fullWidth onClick={onConfirm}>{confirmLabel}</Button></div></div></div>;
}

export function Modal({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => { if (visible) document.body.style.overflow = 'hidden'; else document.body.style.overflow = ''; return () => { document.body.style.overflow = ''; }; }, [visible]);
  if (!visible) return null;
  return <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}><div className="glass-strong rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto no-scrollbar animate-slide-up" onClick={e => e.stopPropagation()}>{title && <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-display font-bold text-white">{title}</h3><button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center"><Icon name="X" size={16} className="text-white/60" /></button></div>}{children}</div></div>;
}

export function ProfileAvatar({ emoji, color, size = 'md', online }: { emoji: string; color: string; size?: 'sm' | 'md' | 'lg'; online?: boolean }) {
  const sizes: Record<'sm' | 'md' | 'lg', string> = { sm: 'w-8 h-8 text-lg', md: 'w-12 h-12 text-2xl', lg: 'w-16 h-16 text-3xl' };
  return <div className="relative flex-shrink-0"><div className={`${sizes[size]} rounded-2xl flex items-center justify-center`} style={{ background: `${color}22`, border: `1px solid ${color}44` }}>{emoji}</div>{online !== undefined && <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ink-950 ${online ? 'bg-emerald-400' : 'bg-white/20'}`} />}</div>;
}

export function ZeviqoLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const sizes = { sm: { box: 'w-8 h-8', text: 'text-lg', icon: 16 }, md: { box: 'w-12 h-12', text: 'text-2xl', icon: 24 }, lg: { box: 'w-20 h-20', text: 'text-4xl', icon: 40 } };
  const s = sizes[size];
  return <div className={`flex items-center gap-2.5 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}><div className={`${s.box} rounded-2xl bg-gradient-to-br from-zeviqo-400 via-zeviqo-500 to-plasma-500 flex items-center justify-center shadow-lg shadow-zeviqo-500/30 relative overflow-hidden`}><div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer" /><Icon name="Compass" size={s.icon} className="text-ink-950 relative z-10" /></div><span className={`font-display font-extrabold ${s.text} text-gradient-zeviqo tracking-tight`}>{APP_NAME}</span></div>;
}

export function SectionTitle({ children, icon, accent = 'text-white/60', action }: { children: ReactNode; icon?: string; accent?: string; action?: ReactNode }) {
  return <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2">{icon && <Icon name={icon} size={16} className={accent} />}<h3 className="text-sm font-bold text-white">{children}</h3></div>{action}</div>;
}

export function RarityBadge({ rarity, size = 'md', showLabel = true }: { rarity: string; size?: 'sm' | 'md'; showLabel?: boolean }) {
  const colors: Record<string, string> = {
    common: 'text-slate-400 border-slate-500/30',
    uncommon: 'text-green-400 border-green-500/30',
    rare: 'text-nova-300 border-nova-500/30',
    epic: 'text-plasma-300 border-plasma-500/30',
    legendary: 'text-gold-300 border-gold-500/30',
    mythic: 'text-rose-300 border-rose-500/30',
  };
  const labels: Record<string, string> = {
    common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', mythic: 'Mythic',
  };
  const cls = colors[rarity] ?? colors.common;
  const label = labels[rarity] ?? rarity;
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${cls} bg-white/5 ${size === 'sm' ? 'text-[8px]' : ''}`}>{showLabel && label}</span>;
}

export function RarityBorder({ children, rarity, active = false, className = '' }: { children: ReactNode; rarity: string; active?: boolean; className?: string }) {
  const borders: Record<string, string> = {
    common: 'border-slate-500/30',
    uncommon: 'border-green-500/40',
    rare: 'border-nova-500/50',
    epic: 'border-plasma-500/50',
    legendary: 'border-gold-500/50',
    mythic: 'border-rose-500/50',
  };
  const cls = borders[rarity] ?? borders.common;
  return <div className={`rounded-2xl border ${cls} ${active ? 'ring-2 ring-zeviqo-400/40' : ''} ${className}`}>{children}</div>;
}

export function AvatarDisplay({ emoji, color, size = 64, ring = false }: { emoji: string; color: string; size?: number; ring?: boolean }) {
  return <div className={`rounded-2xl flex items-center justify-center ${ring ? 'ring-2 ring-zeviqo-400/40' : ''}`} style={{ width: size, height: size, background: `${color}22`, border: `1px solid ${color}44`, fontSize: size * 0.5 }}>{emoji}</div>;
}
