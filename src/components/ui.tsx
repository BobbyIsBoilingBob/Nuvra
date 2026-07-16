// ============================================================
// Nuvra — Premium UI Component Library
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { COSMETIC_RARITY_MAP, type CosmeticRarity } from '../cosmetics';
import { useStore } from '../store';
import { getComboTier, LOADING_TIPS } from '../data';

// ------------------------------------------------------------
// 1. Icon — dynamic lucide icon renderer
// ------------------------------------------------------------
export interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, className, style, strokeWidth = 2 }: IconProps): React.ReactElement {
  const lib = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; strokeWidth?: number }>>;
  const Cmp = lib[name] ?? lib.Circle;
  return <Cmp size={size} className={className} style={style} strokeWidth={strokeWidth} />;
}

// ------------------------------------------------------------
// 2. GlassCard
// ------------------------------------------------------------
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function GlassCard({ children, className = '', onClick, style }: GlassCardProps): React.ReactElement {
  const interactive = onClick != null;
  return (
    <div
      onClick={onClick}
      style={style}
      className={`glass rounded-2xl ${interactive ? 'cursor-pointer hover:bg-white/[0.1] active:scale-[0.98] transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ------------------------------------------------------------
// 3. ProgressBar
// ------------------------------------------------------------
export interface ProgressBarProps {
  value: number;
  max?: number;
  accent?: string;
  height?: number;
  showShimmer?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  accent = 'from-nova-400 to-cyan-300',
  height = 8,
  showShimmer = true,
}: ProgressBarProps): React.ReactElement {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className="w-full rounded-full bg-white/[0.08] overflow-hidden"
      style={{ height }}
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r ${accent} transition-all duration-500 ease-out relative overflow-hidden`}
        style={{ width: `${pct}%` }}
      >
        {showShimmer && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[progress-shimmer_2s_linear_infinite]" />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 4. Pill
// ------------------------------------------------------------
export interface PillProps {
  children: React.ReactNode;
  icon?: string;
  accent?: string;
  className?: string;
}

export function Pill({
  children,
  icon,
  accent = 'text-nova-300 border-nova-500/30',
  className = '',
}: PillProps): React.ReactElement {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-white/[0.04] ${accent} ${className}`}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

// ------------------------------------------------------------
// 5. SectionTitle
// ------------------------------------------------------------
export interface SectionTitleProps {
  children: React.ReactNode;
  icon?: string;
  accent?: string;
  action?: React.ReactNode;
}

export function SectionTitle({
  children,
  icon,
  accent = 'text-nova-300',
  action,
}: SectionTitleProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon && <Icon name={icon} size={20} className={accent} />}
        <h2 className="text-lg font-bold text-white tracking-tight">{children}</h2>
      </div>
      {action}
    </div>
  );
}

// ------------------------------------------------------------
// 6. Button
// ------------------------------------------------------------
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

const BUTTON_VARIANTS: Record<string, string> = {
  primary: 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950 shadow-glow',
  secondary: 'glass text-white hover:bg-white/[0.1]',
  ghost: 'text-white/70 hover:text-white hover:bg-white/[0.06]',
  gold: 'bg-gradient-to-r from-gold-300 to-ember-500 text-ink-950 shadow-glow-gold',
  danger: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-glow-rose',
};

const BUTTON_SIZES: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5',
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon,
  fullWidth = false,
}: ButtonProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-95 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-40 cursor-not-allowed active:scale-100' : ''} ${className}`}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}

// ------------------------------------------------------------
// 7. RarityBadge
// ------------------------------------------------------------
export interface RarityBadgeProps {
  rarity: CosmeticRarity;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RARITY_BADGE_SIZES: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3.5 py-1.5 text-sm gap-2',
};

export function RarityBadge({ rarity, size = 'md', showLabel = true }: RarityBadgeProps): React.ReactElement {
  const meta = COSMETIC_RARITY_MAP[rarity];
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border ${meta.borderColor} bg-gradient-to-r ${meta.accent} text-ink-950 ${RARITY_BADGE_SIZES[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-ink-950/40" />
      {showLabel && meta.label}
    </span>
  );
}

// ------------------------------------------------------------
// 8. RarityBorder
// ------------------------------------------------------------
export interface RarityBorderProps {
  rarity: CosmeticRarity;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export function RarityBorder({ rarity, children, className = '', active = false }: RarityBorderProps): React.ReactElement {
  const meta = COSMETIC_RARITY_MAP[rarity];
  return (
    <div className={`relative rounded-2xl border-2 ${meta.borderColor} ${meta.animation} ${active ? meta.glowClass : ''} transition-all duration-300 ${className}`}>
      {meta.shimmer && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine-sweep_2.5s_ease-in-out_infinite]" />
        </div>
      )}
      {children}
    </div>
  );
}

// ------------------------------------------------------------
// 9. ComboMeter
// ------------------------------------------------------------
export interface ComboMeterProps {
  combo: number;
}

export function ComboMeter({ combo }: ComboMeterProps): React.ReactElement | null {
  const tier = useMemo(() => getComboTier(combo), [combo]);
  if (combo < 2) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-combo-pop pointer-events-none">
      <div className={`glass-strong rounded-2xl px-5 py-3 flex items-center gap-3 bg-gradient-to-r ${tier.accent}`}>
        <Icon name="Flame" size={24} className="text-ink-950" />
        <div className="text-center">
          <div className="text-2xl font-black text-ink-950 leading-none">{combo}x</div>
          <div className="text-[10px] font-bold text-ink-950/70 uppercase tracking-wider">{tier.label}</div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 10. EncouragementToast
// ------------------------------------------------------------
export function EncouragementToast(): React.ReactElement | null {
  const { encouragement } = useStore();
  if (!encouragement.visible) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-toast-in pointer-events-none">
      <div className="glass-strong rounded-2xl px-5 py-3 flex items-center gap-3">
        {encouragement.icon && <Icon name={encouragement.icon} size={20} style={{ color: encouragement.color }} />}
        <span className="text-sm font-bold text-white">{encouragement.message}</span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 11. MysteryBanner
// ------------------------------------------------------------
export function MysteryBanner(): React.ReactElement | null {
  const { activeMystery } = useStore();
  if (!activeMystery) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 animate-slide-down pointer-events-none w-[92%] max-w-md">
      <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3" style={{ boxShadow: `0 0 20px ${activeMystery.color}40` }}>
        <div className="animate-mystery-spin">
          <Icon name={activeMystery.icon} size={22} style={{ color: activeMystery.color }} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: activeMystery.color }}>
            Mystery Event
          </div>
          <div className="text-sm font-semibold text-white">{activeMystery.label}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-white/60">{activeMystery.timeRemaining}s</div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 12. CelebrationOverlay
// ------------------------------------------------------------
const CONFETTI_COLORS = ['#40f5cb', '#fbbf24', '#a78bfa', '#f43f5e', '#fb923c', '#67ffe1'];

export function CelebrationOverlay(): React.ReactElement | null {
  const { celebration, hideCelebration } = useStore();
  if (!celebration.visible) return null;
  const meta = COSMETIC_RARITY_MAP[celebration.rarity];
  const particles = Array.from({ length: 40 });
  return (
    <div
      onClick={hideCelebration}
      className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
      style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7), rgba(0,0,0,0.9))' }}
    >
      {/* Confetti */}
      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 1.5 + Math.random() * 1;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const size = 6 + Math.random() * 8;
        return (
          <div
            key={i}
            className="absolute top-0 animate-confetti-burst"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.4,
              background: color,
              borderRadius: '2px',
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}

      {/* Central display */}
      <div className="relative animate-celebration-zoom flex flex-col items-center gap-4">
        <div className={`relative rounded-3xl p-8 border-2 ${meta.borderColor} ${meta.animation} ${meta.glowClass} bg-ink-900/80 backdrop-blur-xl`}>
          {meta.shimmer && (
            <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shine-sweep_2s_ease-in-out_infinite]" />
            </div>
          )}
          <div className="text-7xl text-center animate-float">{celebration.itemEmoji}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-nova-300 mb-1">New Cosmetic Unlocked!</div>
          <div className="text-2xl font-black text-white mb-2">{celebration.itemName}</div>
          <div className="flex justify-center mb-1">
            <RarityBadge rarity={celebration.rarity} size="md" />
          </div>
          {celebration.subtitle && <div className="text-sm text-white/60">{celebration.subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 13. Stat
// ------------------------------------------------------------
export interface StatProps {
  icon: string;
  label: string;
  value: React.ReactNode;
  accent?: string;
}

export function Stat({ icon, label, value, accent = 'text-nova-300' }: StatProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-9 h-9 rounded-xl glass flex items-center justify-center ${accent}`}>
        <Icon name={icon} size={18} />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</div>
        <div className="text-sm font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 14. AvatarDisplay
// ------------------------------------------------------------
export interface AvatarDisplayProps {
  emoji: string;
  color: string;
  size?: number;
  ring?: boolean;
}

export function AvatarDisplay({ emoji, color, size = 48, ring = false }: AvatarDisplayProps): React.ReactElement {
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${color} flex items-center justify-center ${ring ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-ink-950' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      <span>{emoji}</span>
    </div>
  );
}

// ------------------------------------------------------------
// 15. Spinner
// ------------------------------------------------------------
export interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className = '' }: SpinnerProps): React.ReactElement {
  return (
    <div
      className={`rounded-full border-2 border-white/15 border-t-nova-400 animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// ------------------------------------------------------------
// 16. EmptyState
// ------------------------------------------------------------
export interface EmptyStateProps {
  icon: string;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, desc, action }: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4 text-white/40">
        <Icon name={icon} size={32} />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      {desc && <p className="text-sm text-white/50 max-w-xs mb-4">{desc}</p>}
      {action}
    </div>
  );
}

// ------------------------------------------------------------
// 17. Modal
// ------------------------------------------------------------
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ open, onClose, children, title }: ModalProps): React.ReactElement | null {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative w-full sm:max-w-md glass-strong rounded-t-3xl sm:rounded-3xl p-5 animate-slide-up max-h-[85vh] overflow-y-auto scrollbar-hide safe-bottom">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <Icon name="X" size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 18. TrailPreview
// ------------------------------------------------------------
export interface TrailPreviewProps {
  preview: string;
  color: string;
  size?: number;
}

export function TrailPreview({ preview, color, size = 60 }: TrailPreviewProps): React.ReactElement {
  const dots = Array.from({ length: 5 });
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {dots.map((_, i) => {
        const offset = (i - 2) * (size * 0.12);
        const scale = 1 - Math.abs(i - 2) * 0.18;
        const opacity = 1 - Math.abs(i - 2) * 0.22;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size * 0.22 * scale,
              height: size * 0.22 * scale,
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${offset}px), -50%)`,
              background: color,
              opacity,
              boxShadow: `0 0 ${size * 0.15}px ${color}`,
            }}
          />
        );
      })}
      <div
        className="relative z-10 rounded-full bg-white/90"
        style={{ width: size * 0.16, height: size * 0.16 }}
      />
      {preview === 'rainbow' && (
        <div className="absolute inset-0 rounded-full animate-trail-rainbow" style={{ filter: 'hue-rotate(0deg)' }} />
      )}
    </div>
  );
}

// ------------------------------------------------------------
// 19. PetDisplay
// ------------------------------------------------------------
export interface PetDisplayProps {
  emoji: string;
  size?: number;
  walking?: boolean;
}

export function PetDisplay({ emoji, size = 40, walking = false }: PetDisplayProps): React.ReactElement {
  return (
    <div
      className={`inline-block ${walking ? 'animate-pet-walk' : 'animate-pet-bounce'}`}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      <span>{emoji}</span>
    </div>
  );
}

// ------------------------------------------------------------
// 20. LoadingScreen
// ------------------------------------------------------------
export interface LoadingScreenProps {
  tip?: string;
}

export function LoadingScreen({ tip }: LoadingScreenProps): React.ReactElement {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const currentTip = tip ?? LOADING_TIPS[tipIndex];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink-950 bg-grid">
      <div className="absolute inset-0 bg-radial-fade" />

      <div className="relative flex flex-col items-center gap-6 px-8">
        {/* Compass */}
        <div className="relative animate-float">
          <div className="absolute inset-0 rounded-full blur-2xl bg-nova-400/20" />
          <div className="relative w-20 h-20 rounded-full glass-strong flex items-center justify-center">
            <Icon name="Compass" size={40} className="text-nova-300 animate-[mystery-spin_4s_linear_infinite]" />
          </div>
        </div>

        {/* Spinner */}
        <Spinner size={28} className="text-nova-400" />

        {/* Motivational text */}
        <div className="text-center">
          <div className="text-lg font-bold text-white mb-1 shimmer-text">Preparing your adventure</div>
          <div className="text-sm text-white/50 max-w-xs animate-fade-in" key={tipIndex}>
            {currentTip}
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 21. ErrorState
// ------------------------------------------------------------
export interface ErrorStateProps {
  icon: string;
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ icon, title, message, onRetry }: ErrorStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4 text-rose-400">
        <Icon name={icon} size={32} />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-white/50 max-w-xs mb-5">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon="RotateCcw" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// 22. Skeleton
// ------------------------------------------------------------
export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps): React.ReactElement {
  return <div className={`skeleton ${className}`} />;
}
