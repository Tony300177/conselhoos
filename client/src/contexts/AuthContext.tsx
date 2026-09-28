import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, type UserProfile } from "@/lib/supabase";

const LOCAL_SESSION_KEY = "delibera.admin.session";

// Login local de demonstração, ativo apenas quando VITE_DEMO_ADMIN_PASSWORD
// está definida. É um portão de UX para a demo, não autorização: os registros
// vivem no localStorage e o controle real de acesso será o RLS do Supabase.
const DEMO_ADMIN_EMAIL = "admin@delibera.local";
const LOCAL_ADMIN_ID = "admin-local";
const DEMO_ADMIN_PASSWORD: string | undefined = import.meta.env
  .VITE_DEMO_ADMIN_PASSWORD;
const demoAdminAtivo = Boolean(DEMO_ADMIN_PASSWORD);

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  sessionExpired: boolean;
  setSessionExpired: (value: boolean) => void;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const LOCAL_ADMIN_PROFILE: UserProfile = {
  id: LOCAL_ADMIN_ID,
  full_name: "Administrador",
  email: DEMO_ADMIN_EMAIL,
  avatar_url: null,
  role: "administrador",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function makeLocalAdminUser(): User {
  return {
    id: LOCAL_ADMIN_ID,
    app_metadata: {},
    user_metadata: { full_name: "Administrador" },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email: DEMO_ADMIN_EMAIL,
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
  const [localSession] = useState(loadLocalSession);
  const [user, setUser] = useState<User | null>(localSession?.user ?? null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(
    localSession?.profile ?? null
  );
  // Sem Supabase e sem sessao local nao existe consulta pendente, entao a
  // interface ja nasce resolvida em vez de_travar esperando um carregamento
  // que nunca acontece.
  const [loading, setLoading] = useState(Boolean(supabase) && !localSession);
  const [sessionExpired, setSessionExpired] = useState(false);
  const wasAuthenticatedRef = useRef(Boolean(localSession?.user));

  async function fetchProfile(userId: string) {
    // O usuario do bypass local ja tem o perfil montado; sem Supabase nao ha
    // profiles para consultar.
    if (!supabase || userId === LOCAL_ADMIN_ID) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data);
  }

  useEffect(() => {
    if (localSession || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      const signedIn = Boolean(newSession?.user);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (_event === "SIGNED_OUT" && !signedIn && wasAuthenticatedRef.current) {
        setSessionExpired(true);
      }
      wasAuthenticatedRef.current = signedIn;
      if (newSession?.user) {
        setSessionExpired(false);
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [localSession]);

  const signIn = async (email: string, password: string) => {
    if (
      demoAdminAtivo &&
      email === DEMO_ADMIN_EMAIL &&
      password === DEMO_ADMIN_PASSWORD
    ) {
      const user = makeLocalAdminUser();
      saveLocalSession(user, LOCAL_ADMIN_PROFILE);
      setUser(user);
      setProfile(LOCAL_ADMIN_PROFILE);
      setSessionExpired(false);
      return { error: null };
    }
    if (!supabase) {
      return {
        error: new Error(
          "Supabase não configurado. Só é possível entrar pelo modo de demonstração."
        ),
      };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      clearLocalSession();
    }
    return { error: error ?? null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return {
        error: new Error(
          "Supabase não configurado: o cadastro exige o backend."
        ),
      };
    }
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
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch {
      // Sessão local não depende do Supabase; ignora falha no signOut remoto.
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const isAdmin =
    profile?.role === "administrador" || user?.id === LOCAL_ADMIN_ID;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        sessionExpired,
        setSessionExpired,
        isAdmin,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
