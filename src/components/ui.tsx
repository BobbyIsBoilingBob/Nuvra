import { type ReactNode, type ButtonHTMLAttributes, type HTMLAttributes } from 'react';
import { Chrome as Home, Compass, Map, User, Users, Trophy, Gift, ShoppingBag, Settings as SettingsIcon, Settings, Footprints, Gem, Flame, Route, Activity, Crown, Star, Coins, Zap, Leaf, Bell, BellRing, Search, UserPlus, UserCheck, UserX, Heart, MessageCircle, Check, X, ChevronRight, ChevronLeft, ChevronDown, Plus, Minus, Trash2, CreditCard as Edit3, Share2, LogOut, Shield, Eye, EyeOff, Lock, Mail, CircleAlert as AlertCircle, Loader as Loader2, Play, Pause, RefreshCw, Award, Target, TrendingUp, Clock, MapPin, Backpack, Palette, Sparkles, Calendar, PartyPopper, Swords, Bookmark, Filter, ArrowUp, ArrowDown, Circle, CircleCheck as CheckCircle2, Lock as LockIcon } from 'lucide-react';

export { Home, Compass, Map, User, Users, Trophy, Gift, ShoppingBag, Settings as SettingsIcon, Settings,
  Footprints, Gem, Flame, Route, Activity, Crown, Star, Coins, Zap, Leaf,
  Bell, BellRing, Search, UserPlus, UserCheck, UserX, Heart, MessageCircle,
  Check, X, ChevronRight, ChevronLeft, ChevronDown, Plus, Minus, Trash2,
  Edit3, Share2, LogOut, Shield, Eye, EyeOff, Lock, Mail, AlertCircle,
  Loader2, Play, Pause, RefreshCw, Award, Target, TrendingUp, Clock, MapPin,
  Backpack, Palette, Sparkles, Calendar, PartyPopper, Swords, Bookmark,
  Filter, ArrowUp, ArrowDown, Circle, CheckCircle2, Lock as LockIcon,
};

export const ICON_MAP: Record<string, typeof Home> = {
  Home, Compass, Map, User, Users, Trophy, Gift, ShoppingBag, Settings: SettingsIcon,
  Footprints, Gem, Flame, Route, Activity, Crown, Star, Coins, Zap, Leaf,
  Bell, BellRing, Search, UserPlus, UserCheck, UserX, Heart, MessageCircle,
  Check, X, ChevronRight, ChevronLeft, ChevronDown, Plus, Minus, Trash2,
  Edit3, Share2, LogOut, Shield, Eye, EyeOff, Lock, Mail, AlertCircle,
  Loader2, Play, Pause, RefreshCw, Award, Target, TrendingUp, Clock, MapPin,
  Backpack, Palette, Sparkles, Calendar, PartyPopper, Swords, Bookmark,
  Filter, ArrowUp, ArrowDown, Circle, CheckCircle2,
};

export function getIcon(name: string): typeof Home {
  return ICON_MAP[name] ?? Circle;
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: {
  children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'; size?: 'sm' | 'md' | 'lg';
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    primary: 'bg-zeviqo-500 hover:bg-zeviqo-400 text-ink-950 font-semibold',
    secondary: 'bg-ink-700 hover:bg-ink-600 text-white',
    ghost: 'bg-transparent hover:bg-ink-700/50 text-ink-400 hover:text-white',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
    gold: 'bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold',
  };
  const sizes: Record<string, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5', lg: 'px-6 py-3 text-lg' };
  return (
    <button className={`rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = '', ...props }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return <div className={`bg-ink-800/60 backdrop-blur-sm rounded-2xl border border-ink-600/30 ${className}`} {...props}>{children}</div>;
}

export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 pt-3 pb-24 max-w-lg mx-auto animate-fade-in ${className}`}>{children}</div>;
}

export function Stat({ icon: Icon, label, value, color = '#00c4ff' }: { icon: typeof Home; label: string; value: ReactNode; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon size={20} color={color} />
      <span className="text-lg font-bold text-white">{value}</span>
      <span className="text-xs text-ink-400">{label}</span>
    </div>
  );
}

export function ProgressBar({ value, max, color = '#00c4ff', className = '' }: { value: number; max: number; color?: string; className?: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div className={`h-2 rounded-full bg-ink-700 overflow-hidden ${className}`}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Badge({ children, color = '#00c4ff' }: { children: ReactNode; color?: string }) {
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${color}22`, color }}>{children}</span>;
}

export function EmptyState({ icon: Icon, title, subtitle }: { icon: typeof Home; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={48} className="text-ink-500 mb-4" />
      <h3 className="text-lg font-semibold text-ink-400">{title}</h3>
      {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function Spinner() {
  return <Loader2 size={24} className="animate-spin text-zeviqo-400" />;
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-ink-950">
      <Loader2 size={40} className="animate-spin text-zeviqo-400" />
    </div>
  );
}
