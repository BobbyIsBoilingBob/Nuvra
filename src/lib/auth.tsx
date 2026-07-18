import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase, type Profile } from './supabase';
import type { Session } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string, retries = 0): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
      if (error) throw error;
      return data as Profile;
    } catch (e) {
      if (retries < 3) {
        await new Promise((r) => setTimeout(r, 500 * (retries + 1)));
        return loadProfile(uid, retries + 1);
      }
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    const p = await loadProfile(session.user.id);
    if (p) setProfile(p);
  }, [session, loadProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user?.id) {
        const p = await loadProfile(data.session.user.id);
        setProfile(p);
        supabase.from('profiles').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', data.session.user.id).then(() => {});
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      if (sess?.user?.id) {
        const p = await loadProfile(sess.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, username, is_online: true, last_seen: new Date().toISOString() });
    }
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (session?.user?.id) {
      await supabase.from('profiles').update({ is_online: false, last_seen: new Date().toISOString() }).eq('id', session.user.id);
    }
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, [session]);

  const updateProfile = useCallback(async (patch: Partial<Profile>) => {
    if (!session?.user?.id) return;
    const { error } = await supabase.from('profiles').update(patch).eq('id', session.user.id);
    if (!error) setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }, [session]);

  const deleteAccount = useCallback(async () => {
    if (!session?.user?.id) return;
    await supabase.from('profiles').delete().eq('id', session.user.id);
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut, updateProfile, deleteAccount, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
