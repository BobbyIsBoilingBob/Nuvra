import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile } from '../types';

const GUEST_KEY = 'zeviqo-guest';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  exitGuest: () => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try { return localStorage.getItem(GUEST_KEY) === '1'; } catch { return false; }
  });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setProfile({
          id: data.id,
          username: data.username ?? 'Adventurer',
          level: data.level ?? 1,
          xp: data.xp ?? 0,
          coins: data.coins ?? 0,
          avatar: data.avatar ?? undefined,
          createdAt: data.created_at,
        });
      } else {
        setProfile({ id: user.id, username: 'Adventurer', level: 1, xp: 0, coins: 0 });
      }
    })();
    return () => { active = false; };
  }, [user]);

  const continueAsGuest = () => {
    try { localStorage.setItem(GUEST_KEY, '1'); } catch { /* ignore */ }
    setIsGuest(true);
  };

  const exitGuest = () => {
    try { localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
    setIsGuest(false);
  };

  const signIn = async (email: string, password: string) => {
    exitGuest();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, username: string) => {
    exitGuest();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        level: 1,
        xp: 0,
        coins: 0,
      });
    }
    return { error: null };
  };

  const signOut = async () => {
    exitGuest();
    await supabase.auth.signOut();
    setProfile(null);
  };

  // Clear guest mode when a real session appears.
  useEffect(() => {
    if (session && isGuest) exitGuest();
  }, [session, isGuest]);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, isGuest, continueAsGuest, exitGuest, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
