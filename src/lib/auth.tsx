import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useStore } from '../store';
import type { Profile } from '../types';

const GUEST_KEY = 'zeviqo-guest';
type AuthStatus = 'checking' | 'guest' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isGuest: boolean;
  continueAsGuest: () => void;
  exitGuest: () => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const cachedProfile = useStore((s) => s.cachedProfile);
  const setCachedProfile = useStore((s) => s.setCachedProfile);

  const initRef = useRef(false);
  const profileLoadingRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    let cancelled = false;
    (async () => {
      let isGuestFlag = false;
      try { isGuestFlag = localStorage.getItem(GUEST_KEY) === '1'; } catch { /* ignore */ }
      if (isGuestFlag) { if (!cancelled) setStatus('guest'); return; }
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error || !data.session) {
        if (!cancelled) { setSession(null); setUser(null); setStatus('unauthenticated'); }
        return;
      }
      if (!cancelled) { setSession(data.session); setUser(data.session.user); setStatus('authenticated'); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s) {
        setStatus('authenticated');
        try { localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
      } else {
        setStatus((prev) => (prev === 'guest' ? prev : 'unauthenticated'));
        setProfile(null);
        setCachedProfile(null);
      }
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [setCachedProfile]);

  const refreshProfile = useCallback(async () => {
    if (!user || profileLoadingRef.current) return;
    profileLoadingRef.current = true;
    if (cachedProfile) setProfile(cachedProfile);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        const p: Profile = {
          id: data.id, username: data.username ?? 'Adventurer',
          level: data.level ?? 1, xp: data.xp ?? 0, coins: data.coins ?? 0,
          avatar: data.avatar_emoji ?? undefined, createdAt: data.created_at,
        };
        setProfile(p);
        setCachedProfile(p);
      }
    } finally {
      profileLoadingRef.current = false;
    }
  }, [user, cachedProfile, setCachedProfile]);

  useEffect(() => {
    if (status === 'authenticated' && user) refreshProfile();
    else if (status !== 'authenticated') setProfile(null);
  }, [status, user, refreshProfile]);

  const continueAsGuest = useCallback(() => {
    try { localStorage.setItem(GUEST_KEY, '1'); } catch { /* ignore */ }
    setStatus('guest');
  }, []);

  const exitGuest = useCallback(() => {
    try { localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    exitGuest();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setSession(data.session);
    setUser(data.session?.user ?? null);
    setStatus('authenticated');
    return { error: null };
  }, [exitGuest]);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    exitGuest();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, username, level: 1, xp: 0, coins: 1000 });
    }
    if (data.session) { setSession(data.session); setUser(data.session.user); setStatus('authenticated'); }
    return { error: null };
  }, [exitGuest]);

  const signOut = useCallback(async () => {
    exitGuest();
    await supabase.auth.signOut();
    setSession(null); setUser(null); setProfile(null); setCachedProfile(null);
    setStatus('unauthenticated');
  }, [exitGuest, setCachedProfile]);

  return (
    <AuthContext.Provider value={{
      status, session, user, profile, isGuest: status === 'guest',
      continueAsGuest, exitGuest, signIn, signUp, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
