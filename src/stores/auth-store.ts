import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatarUrl?: string;
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true,

      checkSession: async () => {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Session error:", sessionError);
            set({
              user: null,
              isAuthenticated: false,
              isAdmin: false,
              isLoading: false,
            });
            return;
          }

          if (session?.user) {
            try {
              // Usar la función SECURITY DEFINER para evitar problemas de RLS
              const { data: profileData, error: profileError } = await supabase
                .rpc('get_user_profile', { user_uuid: session.user.id });

              // Si la función RPC no existe o falla, usar consulta directa como fallback
              let profile = null;
              
              if (profileError || !profileData || profileData.length === 0) {
                // Fallback: consulta directa (puede fallar si RLS está mal configurado)
                const { data: directProfile, error: directError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                if (directError) {
                  console.error("Error getting profile (direct):", directError);
                  // No lanzar error, solo registrar
                } else {
                  profile = directProfile;
                }
              } else {
                // La función RPC devuelve un array, tomar el primer elemento
                profile = Array.isArray(profileData) ? profileData[0] : profileData;
              }

              if (profile) {
                const user: User = {
                  id: profile.id,
                  email: profile.email,
                  name: profile.full_name,
                  role: profile.role,
                  avatarUrl: profile.avatar_url,
                  createdAt: profile.created_at,
                };

                set({
                  user,
                  isAuthenticated: true,
                  isAdmin: profile.role === "admin",
                  isLoading: false,
                });
                return;
              }
            } catch (profileError) {
              console.error("Error getting profile:", profileError);
              // Continuar y establecer como no autenticado
            }
          }

          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error checking session:", error);
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
          });
        }
      },

      login: async (email: string, password: string) => {
        try {
          // Intentar iniciar sesión con Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return {
              success: false,
              error: error.message === "Invalid login credentials"
                ? "Credenciales incorrectas"
                : error.message,
            };
          }

          if (!data.user) {
            return { success: false, error: "Error al iniciar sesión" };
          }

          // Obtener el perfil del usuario usando la función RPC si está disponible
          let profile = null;
          const { data: profileData, error: profileError } = await supabase
            .rpc('get_user_profile', { user_uuid: data.user.id });

          if (profileError || !profileData || profileData.length === 0) {
            // Fallback: consulta directa
            const { data: directProfile, error: directError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (directError) {
              return { success: false, error: "Error al obtener perfil" };
            }
            profile = directProfile;
          } else {
            profile = Array.isArray(profileData) ? profileData[0] : profileData;
          }

          if (!profile) {
            return { success: false, error: "Error al obtener perfil" };
          }

          const user: User = {
            id: profile.id,
            email: profile.email,
            name: profile.full_name,
            role: profile.role,
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at,
          };

          set({
            user,
            isAuthenticated: true,
            isAdmin: profile.role === "admin",
            isLoading: false,
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

      register: async (name: string, email: string, password: string) => {
        try {
          // Registrar usuario en Supabase Auth
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                role: "user",
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

          // Esperar un momento para que el trigger cree el perfil
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Obtener el perfil creado usando la función RPC si está disponible
          let profile = null;
          const { data: profileData, error: profileError } = await supabase
            .rpc('get_user_profile', { user_uuid: data.user.id });

          if (profileError || !profileData || profileData.length === 0) {
            // Fallback: consulta directa
            const { data: directProfile, error: directError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (directError) {
              console.error("Profile error:", directError);
            } else {
              profile = directProfile;
            }
          } else {
            profile = Array.isArray(profileData) ? profileData[0] : profileData;
          }

          if (profile) {
            const user: User = {
              id: profile.id,
              email: profile.email,
              name: profile.full_name,
              role: profile.role,
              avatarUrl: profile.avatar_url,
              createdAt: profile.created_at,
            };

            set({
              user,
              isAuthenticated: true,
              isAdmin: false,
              isLoading: false,
            });
          }

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
          await supabase.auth.signOut();
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
          });
        } catch (error) {
          console.error("Logout error:", error);
        }
      },
    }),
    {
      name: "oro-nacional-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);

// Inicializar sesión al cargar
if (typeof window !== "undefined") {
  useAuthStore.getState().checkSession();
}
