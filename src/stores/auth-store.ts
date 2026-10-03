import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatarUrl?: string;
  createdAt: string;
}

type AuthLocale = "es" | "en";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  /** Derivado siempre del perfil recién cargado; NO se persiste. */
  isAdmin: boolean;
  isLoading: boolean;
  /** false hasta que termina la primera verificación de sesión (checkSession). */
  hasCheckedSession: boolean;
  /**
   * true cuando hay sesión de Supabase pero el perfil no se pudo cargar
   * (error de red, etc.). Se reintenta en segundo plano.
   */
  profileLoadFailed: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; emailNotConfirmed?: boolean }>;
  register: (name: string, email: string, password: string, locale?: AuthLocale) => Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  avatar_url?: string;
  created_at: string;
}

const SIGNED_OUT_STATE = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  hasCheckedSession: true,
  profileLoadFailed: false,
} as const;

const profileToUser = (profile: ProfileRow): User => ({
  id: profile.id,
  email: profile.email,
  name: profile.full_name,
  role: profile.role,
  avatarUrl: profile.avatar_url,
  createdAt: profile.created_at,
});

const isSameUser = (a: User | null, b: User) =>
  !!a &&
  a.id === b.id &&
  a.email === b.email &&
  a.name === b.name &&
  a.role === b.role &&
  a.avatarUrl === b.avatarUrl &&
  a.createdAt === b.createdAt;

/**
 * Carga el perfil del usuario. Devuelve null si no se pudo obtener
 * (error transitorio o perfil aún no creado).
 */
async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  // Usar la función SECURITY DEFINER para evitar problemas de RLS
  const { data: profileData, error: profileError } = await supabase
    .rpc('get_user_profile', { user_uuid: userId });

  if (!profileError && profileData && (!Array.isArray(profileData) || profileData.length > 0)) {
    // La función RPC devuelve un array, tomar el primer elemento
    return (Array.isArray(profileData) ? profileData[0] : profileData) as ProfileRow;
  }

  // Fallback: consulta directa (puede fallar si RLS está mal configurado)
  const { data: directProfile, error: directError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (directError) {
    console.error("Error getting profile (direct):", directError);
    return null;
  }

  return (directProfile as ProfileRow) ?? null;
}

// Reintentos en segundo plano cuando hay sesión pero no se pudo cargar el perfil
const MAX_PROFILE_RETRIES = 5;
let profileRetryCount = 0;
let profileRetryTimer: ReturnType<typeof setTimeout> | null = null;
let checkSessionInFlight: Promise<void> | null = null;

const clearProfileRetry = () => {
  if (profileRetryTimer) {
    clearTimeout(profileRetryTimer);
    profileRetryTimer = null;
  }
  profileRetryCount = 0;
};

const scheduleRetry = () => {
  if (typeof window === "undefined" || profileRetryTimer) return;
  if (profileRetryCount >= MAX_PROFILE_RETRIES) return;
  profileRetryCount += 1;
  profileRetryTimer = setTimeout(() => {
    profileRetryTimer = null;
    void useAuthStore.getState().checkSession();
  }, Math.min(2000 * profileRetryCount, 10000));
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      /**
       * Aplica una sesión de Supabase al store cargando el perfil.
       * Si el perfil falla NO se cierra la sesión en la UI: se conserva el
       * perfil anterior (o uno mínimo sin privilegios) y se reintenta.
       */
      const applySession = async (session: Session) => {
        let profile: ProfileRow | null = null;
        try {
          profile = await fetchProfile(session.user.id);
        } catch (profileError) {
          console.error("Error getting profile:", profileError);
        }

        if (profile) {
          clearProfileRetry();
          const user = profileToUser(profile);
          const current = get().user;
          set({
            // Conservar la referencia si no cambió nada para no re-disparar efectos
            user: isSameUser(current, user) ? current : user,
            isAuthenticated: true,
            isAdmin: profile.role === "admin",
            isLoading: false,
            hasCheckedSession: true,
            profileLoadFailed: false,
          });
          return;
        }

        // La sesión es válida pero el perfil no se pudo cargar
        const previous = get();
        const sameUser = previous.user?.id === session.user.id;
        const metadata = session.user.user_metadata as { full_name?: string } | undefined;

        set({
          user: sameUser
            ? previous.user
            : {
                id: session.user.id,
                email: session.user.email ?? "",
                name: metadata?.full_name ?? "",
                role: "user",
                createdAt: session.user.created_at,
              },
          isAuthenticated: true,
          // Solo se conserva si ya se había derivado de un perfil cargado en
          // esta misma carga de página (nunca viene de localStorage).
          isAdmin: sameUser ? previous.isAdmin : false,
          isLoading: false,
          hasCheckedSession: true,
          profileLoadFailed: true,
        });
        scheduleRetry();
      };

      const runCheckSession = async () => {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Session error:", sessionError);

            // Error de red al refrescar el token: la sesión puede seguir siendo
            // válida, así que no se limpia el estado; se reintenta más tarde.
            if (sessionError.name === "AuthRetryableFetchError") {
              set({ isLoading: false, hasCheckedSession: true });
              scheduleRetry();
              return;
            }

            clearProfileRetry();
            set(SIGNED_OUT_STATE);
            return;
          }

          if (!session?.user) {
            clearProfileRetry();
            set(SIGNED_OUT_STATE);
            return;
          }

          await applySession(session);
        } catch (error) {
          console.error("Error checking session:", error);
          // Error inesperado (p. ej. red): no cerrar la sesión en la UI
          set({ isLoading: false, hasCheckedSession: true });
          scheduleRetry();
        }
      };

      return {
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: true,
        hasCheckedSession: false,
        profileLoadFailed: false,

        checkSession: () => {
          // Evitar verificaciones simultáneas
          if (!checkSessionInFlight) {
            checkSessionInFlight = runCheckSession().finally(() => {
              checkSessionInFlight = null;
            });
          }
          return checkSessionInFlight;
        },

        login: async (email: string, password: string) => {
          try {
            // Intentar iniciar sesión con Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              if (error.message === "Email not confirmed") {
                return { success: false, emailNotConfirmed: true, error: "Debes confirmar tu correo electrónico antes de iniciar sesión." };
              }
              return {
                success: false,
                error: error.message === "Invalid login credentials"
                  ? "Correo o contraseña incorrectos"
                  : error.message,
              };
            }

            if (!data.user) {
              return { success: false, error: "Error al iniciar sesión" };
            }

            const profile = await fetchProfile(data.user.id);

            if (!profile) {
              // No dejar una sesión de Supabase activa si el login se reporta
              // como fallido (evita que UI y sesión queden desincronizadas).
              await supabase.auth.signOut({ scope: "local" }).catch(() => {});
              return { success: false, error: "Error al obtener perfil" };
            }

            clearProfileRetry();
            set({
              user: profileToUser(profile),
              isAuthenticated: true,
              isAdmin: profile.role === "admin",
              isLoading: false,
              hasCheckedSession: true,
              profileLoadFailed: false,
            });

            return { success: true };
          } catch (error) {
            console.error("Login error:", error);
            return {
              success: false,
              error: "Error al iniciar sesión. Intenta de nuevo.",
            };
          }
        },

        register: async (name: string, email: string, password: string, locale: AuthLocale = "es") => {
          try {
            // Registrar usuario en Supabase Auth
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: name,
                  role: "user",
                  // Idioma preferido (disponible en las plantillas de Supabase como .Data.locale)
                  locale,
                },
              },
            });

            if (error) {
              return {
                success: false,
                error: error.message === "User already registered"
                  ? "Este correo ya está registrado"
                  : error.message,
              };
            }

            if (!data.user) {
              return { success: false, error: "Error al registrar usuario" };
            }

            // Supabase devuelve session=null cuando se requiere confirmación de email
            if (!data.session) {
              // Supabase ya envía el correo de confirmación (plantilla "Confirm signup"
              // con la marca, ver supabase/email-templates). /api/email/resend-verification
              // queda solo para el botón de reenviar, así no llegan dos correos.
              return { success: true, requiresEmailConfirmation: true };
            }

            // Esperar un momento para que el trigger cree el perfil
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Si el perfil aún no está disponible, applySession mantiene la
            // sesión con un perfil mínimo y reintenta en segundo plano.
            await applySession(data.session);

            return { success: true };
          } catch (error) {
            console.error("Register error:", error);
            return {
              success: false,
              error: "Error al registrar. Intenta de nuevo.",
            };
          }
        },

        logout: async () => {
          try {
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.error("Logout error:", error);
              // Si el servidor no respondió, cerrar al menos la sesión local
              await supabase.auth.signOut({ scope: "local" });
            }
          } catch (error) {
            console.error("Logout error:", error);
          } finally {
            // Limpiar siempre el estado local, aunque signOut falle
            clearProfileRetry();
            set(SIGNED_OUT_STATE);
          }
        },
      };
    },
    {
      name: "oro-nacional-auth",
      storage: createJSONStorage(() => localStorage),
      // isAdmin NO se persiste: se deriva del perfil cargado en checkSession
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Ignorar cualquier otro campo guardado por versiones anteriores (p. ej. isAdmin)
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Pick<AuthStore, "user" | "isAuthenticated">>;
        const user = saved.user ?? null;
        return {
          ...current,
          user,
          isAuthenticated: Boolean(saved.isAuthenticated && user),
        };
      },
    }
  )
);

// Inicializar sesión al cargar y mantenerla sincronizada con Supabase
if (typeof window !== "undefined") {
  void useAuthStore.getState().checkSession();

  // Suscripción única (a nivel de módulo) a los cambios de autenticación:
  // cierre de sesión en otra pestaña, refresco de token fallido, etc.
  supabase.auth.onAuthStateChange((event, session) => {
    // No llamar a Supabase de forma síncrona dentro del callback (puede
    // bloquear el lock interno de auth-js); se difiere con setTimeout.
    const refresh = () => {
      setTimeout(() => {
        void useAuthStore.getState().checkSession();
      }, 0);
    };

    switch (event) {
      case "SIGNED_OUT":
        clearProfileRetry();
        useAuthStore.setState(SIGNED_OUT_STATE);
        break;

      case "USER_UPDATED":
        if (session?.user) refresh();
        break;

      case "SIGNED_IN":
      case "TOKEN_REFRESHED":
      case "PASSWORD_RECOVERY": {
        if (!session?.user) break;
        const state = useAuthStore.getState();
        // SIGNED_IN también se emite al volver a enfocar la pestaña: solo se
        // recarga el perfil si cambió el usuario o si aún no se había cargado.
        const upToDate =
          state.hasCheckedSession &&
          state.isAuthenticated &&
          !state.profileLoadFailed &&
          state.user?.id === session.user.id;
        if (!upToDate) refresh();
        break;
      }

      default:
        break;
    }
  });
}
