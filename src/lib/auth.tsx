import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { supabase, type Profile, type Session, type User } from './supabase';

type AuthState = {
  session: Session | null; user: User | null; profile: Profile | null; loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (partial: Partial<Profile>) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  const loadProfile = useCallback(async (uid: string): Promise<Profile | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error || !data) {
      await new Promise(r => setTimeout(r, 600));
      const { data: retry } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
      if (retry) { setProfile(retry as Profile); return retry as Profile; }
      return null;
    }
    setProfile(data as Profile);
    return data as Profile;
  }, []);

  const updateOnlineStatus = useCallback(async (uid: string, online: boolean) => {
    await supabase.from('profiles').update({ is_online: online, last_seen: new Date().toISOString() }).eq('id', uid);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s); setUser(s?.user ?? null);
      if (s?.user) {
        userIdRef.current = s.user.id;
        loadProfile(s.user.id).finally(() => { if (mounted) setLoading(false); });
        updateOnlineStatus(s.user.id, true);
      } else { setLoading(false); }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      setSession(s); setUser(s?.user ?? null);
      (async () => {
        if (s?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          userIdRef.current = s.user.id;
          await loadProfile(s.user.id);
          if (event === 'SIGNED_IN') updateOnlineStatus(s.user.id, true);
        } else if (event === 'SIGNED_OUT') {
          if (userIdRef.current) updateOnlineStatus(userIdRef.current, false);
          userIdRef.current = null; setProfile(null);
        }
      })();
    });

    const handleBeforeUnload = () => { if (userIdRef.current) updateOnlineStatus(userIdRef.current, false); };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      mounted = false; sub.subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (userIdRef.current) updateOnlineStatus(userIdRef.current, false);
    };
  }, [loadProfile, updateOnlineStatus]);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters long.' };
    if (username.length < 3 || username.length > 20) return { error: 'Username must be 3-20 characters long.' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { error: 'Username can only contain letters, numbers, and underscores.' };
    const { data: existing } = await supabase.from('profiles').select('username').eq('username', username).maybeSingle();
    if (existing) return { error: 'That username is already taken.' };
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    if (error) return { error: error.message.includes('already registered') ? 'An account with this email already exists.' : error.message };
    if (data.user) { await loadProfile(data.user.id); updateOnlineStatus(data.user.id, true); }
    return { error: null };
  }, [loadProfile, updateOnlineStatus]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
    if (!password) return { error: 'Please enter your password.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message.includes('Invalid login') ? 'Incorrect email or password.' : error.message };
    if (data.user) { await loadProfile(data.user.id); updateOnlineStatus(data.user.id, true); }
    return { error: null };
  }, [loadProfile, updateOnlineStatus]);

  const signOut = useCallback(async () => {
    if (userIdRef.current) updateOnlineStatus(userIdRef.current, false);
    await supabase.auth.signOut();
    userIdRef.current = null; setProfile(null); setSession(null); setUser(null);
  }, [updateOnlineStatus]);

  const resetPassword = useCallback(async (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (newPassword.length < 6) return { error: 'Password must be at least 6 characters long.' };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!userIdRef.current) return { error: 'Not signed in.' };
    const { error } = await supabase.from('profiles').delete().eq('id', userIdRef.current);
    if (error) return { error: error.message };
    await signOut();
    return { error: null };
  }, [signOut]);

  const refreshProfile = useCallback(async () => {
    if (userIdRef.current) await loadProfile(userIdRef.current);
  }, [loadProfile]);

  const updateProfile = useCallback(async (partial: Partial<Profile>) => {
    if (!userIdRef.current) return { error: 'Not signed in.' };
    const { error } = await supabase.from('profiles').update(partial).eq('id', userIdRef.current);
    if (error) return { error: error.message };
    setProfile(prev => prev ? { ...prev, ...partial } : prev);
    return { error: null };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signUp, signIn, signOut, resetPassword, updatePassword, deleteAccount, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
