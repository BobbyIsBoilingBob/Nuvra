import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
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

  const loadProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (error) return;
    if (data) {
      setProfile(data as Profile);
    } else {
      // Profile not found — the trigger should have created it. Retry once.
      await new Promise(r => setTimeout(r, 500));
      const { data: retry } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      if (retry) setProfile(retry as Profile);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user.id).finally(() => { if (mounted) setLoading(false); });
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        (async () => { await loadProfile(s.user.id); })();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

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

    // Check username uniqueness before signup
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();
    if (existing) return { error: 'That username is already taken. Please choose another.' };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return { error: 'An account with this email already exists. Try logging in instead.' };
      }
      return { error: error.message };
    }

    if (data.user) {
      await loadProfile(data.user.id);
    }

    return { error: null };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { error: 'Please enter a valid email address.' };
    if (!password) return { error: 'Please enter your password.' };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Invalid login') || error.message.includes('invalid')) {
        return { error: 'Incorrect email or password. Please check your credentials and try again.' };
      }
      if (error.message.includes('not confirmed') || error.message.includes('Email not confirmed')) {
        return { error: 'Your email has not been verified. Please check your inbox for a confirmation link.' };
      }
      if (error.message.includes('disabled') || error.message.includes('banned')) {
        return { error: 'This account has been disabled. Please contact support.' };
      }
      return { error: error.message };
    }

    if (data.user) {
      await loadProfile(data.user.id);
    }

    return { error: null };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setUser(null);
  }, []);

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
    // Delete profile row (cascades to friends, notifications, blocks via FK)
    const { error: profileErr } = await supabase.from('profiles').delete().eq('id', user.id);
    if (profileErr) return { error: profileErr.message };
    // Delete auth user
    const { error: authErr } = await supabase.auth.admin?.deleteUser(user.id) ?? { error: null };
    if (authErr) return { error: authErr.message };
    await signOut();
    return { error: null };
  }, [user, signOut]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const updateProfile = useCallback(async (partial: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in.' };
    const { error } = await supabase.from('profiles').update(partial).eq('id', user.id);
    if (error) return { error: error.message };
    setProfile(prev => prev ? { ...prev, ...partial } : prev);
    return { error: null };
  }, [user]);

  return (
    <AuthContext.Provider value={{
      session, user, profile, loading,
      signUp, signIn, signOut,
      resetPassword, updatePassword, updateEmail, deleteAccount,
      refreshProfile, updateProfile
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
