import { useState, useEffect, type ReactNode, type CSSProperties } from 'react';
import {
  Activity, AlertCircle, ArrowLeft, ArrowRight, Award, Bell, BookOpen,
  CalendarClock, Check, CheckCircle, ChevronLeft, ChevronRight, Clock, Coins,
  Compass, Crown, Eye, Flame, Footprints, Gem, Gift, Grid, History, Home,
  Info, Lock, LogOut, Mail, Map, MapPin, Package, Palette, Pause, PenTool,
  Play, RefreshCw, Rocket, RotateCcw, Route, Search, Settings, Shield,
  ShoppingBag, Sparkles, Star, Swords, Target, Trash2, TrendingUp, Trophy,
  User, UserPlus, Users, Vibrate, Volume2, X, Zap, Circle, Leaf, Scale,
  Crosshair, Medal, Footprints as FootprintsIcon, type LucideIcon,
} from 'lucide-react';
import { APP_NAME, getLevelInfo, type LevelInfo } from '../data';

const ICON_MAP: Record<string, LucideIcon> = {
  Activity, AlertCircle, ArrowLeft, ArrowRight, Award, Bell, BookOpen,
  CalendarClock, Check, CheckCircle, ChevronLeft, ChevronRight, Clock, Coins,
  Compass, Crown, Eye, Flame, Footprints, Gem, Gift, Grid, History, Home,
  Info, Lock, LogOut, Mail, Map, MapPin, Package, Palette, Pause, PenTool,
  Play, RefreshCw, Rocket, RotateCcw, Route, Search, Settings, Shield,
  ShoppingBag, Sparkles, Star, Swords, Target, Trash2, TrendingUp, Trophy,
  User, UserPlus, Users, Vibrate, Volume2, X, Zap, Circle, Leaf, Scale,
  Crosshair, Medal, FootprintsIcon,
};

export function Icon({ name, size = 20, className = '', style }: { name: string; size?: number; className?: string; style?: CSSProperties }) {
  const Comp = ICON_MAP[name] ?? Circle;
  return <Comp size={size} className={className} style={style} />;
}

export function GlassCard({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <div className={`glass rounded-2xl ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`} onClick={onClick}>{children}</div>;
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
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3.5 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${fullWidth ? 'w-full ' : ''}inline-flex items-center justify-center gap-2 rounded-xl ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all ${className}`}>
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 16} />}{children}
    </button>
  );
}

export function ProgressBar({ value, max, className = '', colorClass = 'from-zeviqo-400 to-zeviqo-500', accent, height }: { value: number; max: number; className?: string; colorClass?: string; accent?: string; height?: number }) {
  const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));
  const h = height ? `${height}px` : '0.5rem';
  return <div className={`rounded-full bg-white/10 overflow-hidden ${className}`} style={{ height: h }}><div className={`h-full rounded-full bg-gradient-to-r ${accent ?? colorClass} transition-all duration-500`} style={{ width: `${pct}%` }} /></div>;
}

export function Pill({ children, icon, accent = 'text-white/60 border-white/10', className = '' }: { children: ReactNode; icon?: string; accent?: string; className?: string }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${accent} bg-white/5 ${className}`}>{icon && <Icon name={icon} size={10} />}{children}</span>;
}

export function SectionTitle({ children, icon, accent = 'text-white/60', action }: { children: ReactNode; icon?: string; accent?: string; action?: ReactNode }) {
  return <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2">{icon && <Icon name={icon} size={16} className={accent} />}<h3 className="text-sm font-bold text-white">{children}</h3></div>{action}</div>;
}

export function RarityBadge({ rarity, size = 'md', showLabel = true }: { rarity: string; size?: 'sm' | 'md'; showLabel?: boolean }) {
  const colors: Record<string, string> = { common: 'text-slate-400 border-slate-500/30', uncommon: 'text-green-400 border-green-500/30', rare: 'text-zeviqo-300 border-zeviqo-500/30', epic: 'text-nova-300 border-nova-500/30', legendary: 'text-gold-300 border-gold-500/30', mythic: 'text-rose-300 border-rose-500/30' };
  const labels: Record<string, string> = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', mythic: 'Mythic' };
  const cls = colors[rarity] ?? colors.common;
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${cls} bg-white/5 ${size === 'sm' ? 'text-[8px]' : ''}`}>{showLabel && (labels[rarity] ?? rarity)}</span>;
}

export function RarityBorder({ children, rarity, active = false, className = '' }: { children: ReactNode; rarity: string; active?: boolean; className?: string }) {
  const borders: Record<string, string> = { common: 'border-slate-500/30', uncommon: 'border-green-500/40', rare: 'border-zeviqo-500/50', epic: 'border-nova-500/50', legendary: 'border-gold-500/50', mythic: 'border-rose-500/50' };
  return <div className={`rounded-2xl border ${borders[rarity] ?? borders.common} ${active ? 'ring-2 ring-zeviqo-400/40' : ''} ${className}`}>{children}</div>;
}

export function AvatarDisplay({ emoji, color, size = 64, ring = false }: { emoji: string; color: string; size?: number; ring?: boolean }) {
  return <div className={`rounded-2xl flex items-center justify-center ${ring ? 'ring-2 ring-zeviqo-400/40' : ''}`} style={{ width: size, height: size, background: `${color}22`, border: `1px solid ${color}44`, fontSize: size * 0.5 }}>{emoji}</div>;
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-ink-950">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-zeviqo-400 to-nova-500 flex items-center justify-center animate-pulse">
          <Icon name="Compass" size={32} className="text-ink-950" />
        </div>
        <p className="font-display font-bold text-lg text-gradient-zeviqo">Zeviqo</p>
        <p className="text-xs text-white/40 mt-1">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return <div className="glass rounded-2xl p-4 animate-pulse"><div className="h-4 w-2/3 bg-white/10 rounded mb-2" /><div className="h-3 w-1/2 bg-white/5 rounded" /></div>;
}

export function RewardPopup({ visible, onClose, rewards }: { visible: boolean; onClose: () => void; rewards: { icon: string; label: string; amount: number; color: string }[] }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-strong rounded-3xl p-6 max-w-xs w-full mx-4 text-center animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="font-display font-bold text-xl text-white mb-4">Adventure Complete!</h2>
        <div className="space-y-2 mb-4">
          {rewards.map((r, i) => (
            <div key={i} className="flex items-center justify-between glass rounded-xl px-3 py-2">
              <span className="flex items-center gap-2 text-sm text-white/80"><Icon name={r.icon} size={16} className={r.color} />{r.label}</span>
              <span className="font-bold text-white">+{r.amount}</span>
            </div>
          ))}
        </div>
        <Button fullWidth onClick={onClose}>Collect Rewards</Button>
      </div>
    </div>
  );
}

export function ConfirmDialog({ visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onConfirm, onCancel }: {
  visible: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <div className="glass-strong rounded-3xl p-6 max-w-xs w-full mx-4 animate-slide-up" onClick={e => e.stopPropagation()}>
        <h2 className="font-display font-bold text-lg text-white mb-2">{title}</h2>
        <p className="text-sm text-white/60 mb-4">{message}</p>
        <div className="space-y-2">
          <Button fullWidth variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
          <Button fullWidth variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export function ZeviqoLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const sizes = { sm: { box: 'w-8 h-8', text: 'text-lg', icon: 16 }, md: { box: 'w-12 h-12', text: 'text-2xl', icon: 24 }, lg: { box: 'w-20 h-20', text: 'text-4xl', icon: 40 } };
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-2.5 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className={`${s.box} rounded-2xl bg-gradient-to-br from-zeviqo-400 via-zeviqo-500 to-nova-500 flex items-center justify-center shadow-lg shadow-zeviqo-500/30 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer" />
        <Icon name="Compass" size={s.icon} className="text-ink-950 relative z-10" />
      </div>
      <span className={`font-display font-extrabold ${s.text} text-gradient-zeviqo tracking-tight`}>{APP_NAME}</span>
    </div>
  );
}

export { getLevelInfo, type LevelInfo };
