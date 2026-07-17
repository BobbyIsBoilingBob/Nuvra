import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { supabase, type Profile, type Session, type User } from './supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateEmail: (newEmail: string) => Promise<{ error: string | null }>;
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
  const profileCache = useRef<Profile | null>(null);

  const loadProfile = useCallback(async (uid: string): Promise<Profile | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error || !data) {
      await new Promise(r => setTimeout(r, 600));
      const { data: retry } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
      if (retry) { profileCache.current = retry as Profile; setProfile(retry as Profile); return retry as Profile; }
      return null;
    }
    profileCache.current = data as Profile; setProfile(data as Profile); return data as Profile;
  }, []);

  const updateOnlineStatus = useCallback(async (uid: string, online: boolean) => {
    await supabase.from('profiles').update({ is_online: online, last_seen: new Date().toISOString() }).eq('id', uid);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s); setUser(s?.user ?? null);
      if (s?.user) { loadProfile(s.user.id).finally(() => { if (mounted) setLoading(false); }); updateOnlineStatus(s.user.id, true); }
      else setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      setSession(s); setUser(s?.user ?? null);
      (async () => {
        if (s?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          await loadProfile(s.user.id);
          if (event === 'SIGNED_IN') updateOnlineStatus(s.user.id, true);
        } else if (event === 'SIGNED_OUT') {
          if (user) updateOnlineStatus(user.id, false);
          profileCache.current = null; setProfile(null);
        }
      })();
    });
    const handleBeforeUnload = () => { if (user) updateOnlineStatus(user.id, false); };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => { mounted = false; sub.subscription.unsubscribe(); window.removeEventListener('beforeunload', handleBeforeUnload); if (user) updateOnlineStatus(user.id, false); };
  }, [loadProfile, updateOnlineStatus, user]);

  const validateSignup = (email: string, password: string, username: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters long.';
    if (username.length < 3) return 'Username must be at least 3 characters long.';
    if (username.length > 20) return 'Username must be at most 20 characters long.';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores.';
    return null;
  };

  const signUp = useCallback(async (email: string, password: string, username: string): Promise<{ error: string | null }> => {
    const validation = validateSignup(email, password, username);
    if (validation) return { error: validation };
    const { data: existing } = await supabase.from('profiles').select('username').eq('username', username).maybeSingle();
    if (existing) return { error: 'That username is already taken. Please choose another.' };
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) return { error: 'An account with this email already exists. Try logging in instead.' };
      return { error: error.message };
    }
    if (data.user) { await loadProfile(data.user.id); updateOnlineStatus(data.user.id, true); }
    return { error: null };
  }, [loadProfile, updateOnlineStatus]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { error: 'Please enter a valid email address.' };
    if (!password) return { error: 'Please enter your password.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login') || error.message.includes('invalid')) return { error: 'Incorrect email or password. Please check your credentials and try again.' };
      if (error.message.includes('not confirmed') || error.message.includes('Email not confirmed')) return { error: 'Your email has not been verified. Please check your inbox for a confirmation link.' };
      return { error: error.message };
    }
    if (data.user) { await loadProfile(data.user.id); updateOnlineStatus(data.user.id, true); }
    return { error: null };
  }, [loadProfile, updateOnlineStatus]);

  const signOut = useCallback(async () => {
    if (user) updateOnlineStatus(user.id, false);
    await supabase.auth.signOut();
    profileCache.current = null; setProfile(null); setSession(null); setUser(null);
  }, [user, updateOnlineStatus]);

  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null }> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { error: 'Please enter a valid email address.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<{ error: string | null }> => {
    if (newPassword.length < 6) return { error: 'Password must be at least 6 characters long.' };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const updateEmail = useCallback(async (newEmail: string): Promise<{ error: string | null }> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) return { error: 'Please enter a valid email address.' };
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const deleteAccount = useCallback(async (): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in.' };
    const { error: profileErr } = await supabase.from('profiles').delete().eq('id', user.id);
    if (profileErr) return { error: profileErr.message };
    await signOut();
    return { error: null };
  }, [user, signOut]);

  const refreshProfile = useCallback(async () => { if (user) await loadProfile(user.id); }, [user, loadProfile]);

  const updateProfile = useCallback(async (partial: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in.' };
    const { error } = await supabase.from('profiles').update(partial).eq('id', user.id);
    if (error) return { error: error.message };
    setProfile(prev => { const updated = prev ? { ...prev, ...partial } : prev; profileCache.current = updated; return updated; });
    return { error: null };
  }, [user]);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signUp, signIn, signOut, resetPassword, updatePassword, updateEmail, deleteAccount, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
