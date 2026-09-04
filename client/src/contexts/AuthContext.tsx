import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, type UserProfile } from "@/lib/supabase";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin123";
const LOCAL_SESSION_KEY = "delibera.admin.session";
const ADMIN_EMAIL = `${ADMIN_USERNAME}@delibera.local`;

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  sessionExpired: boolean;
  setSessionExpired: (value: boolean) => void;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const LOCAL_ADMIN_PROFILE: UserProfile = {
  id: "admin-local",
  full_name: "Administrador",
  email: ADMIN_EMAIL,
  avatar_url: null,
  role: "administrador",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function makeLocalAdminUser(): User {
  return {
    id: "admin-local",
    app_metadata: {},
    user_metadata: { full_name: "Administrador" },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email: ADMIN_EMAIL,
    email_confirmed_at: new Date().toISOString(),
    phone: "",
    role: "authenticated",
    identities: [],
    last_sign_in_at: new Date().toISOString(),
  } as unknown as User;
}

function saveLocalSession(user: User, profile: UserProfile) {
  try {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user, profile }));
  } catch {
    /* ignore */
  }
}

function loadLocalSession(): { user: User; profile: UserProfile } | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.user && parsed?.profile) return parsed;
    return null;
  } catch {
    return null;
  }
}

function clearLocalSession() {
  try {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data);
  }

  useEffect(() => {
    const localSession = loadLocalSession();
    if (localSession) {
      setUser(localSession.user);
      setProfile(localSession.profile);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (_event === "SIGNED_OUT" && !newSession?.user && !loading) {
          setSessionExpired(true);
        }
        if (newSession?.user) {
          setSessionExpired(false);
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const user = makeLocalAdminUser();
      saveLocalSession(user, LOCAL_ADMIN_PROFILE);
      setUser(user);
      setProfile(LOCAL_ADMIN_PROFILE);
      setSessionExpired(false);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      clearLocalSession();
    }
    return { error: error ?? null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error ?? null };
  };

  const signOut = async () => {
    clearLocalSession();
    setUser(null);
    setSession(null);
    setProfile(null);
    setSessionExpired(false);
    try {
      await supabase.auth.signOut();
    } catch {
      // Sessão local não depende do Supabase; ignora falha no signOut remoto.
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const isAdmin = profile?.role === "administrador" || user?.id === "admin-local";

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, sessionExpired, setSessionExpired, isAdmin, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}