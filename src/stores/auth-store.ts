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
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            // Obtener el perfil del usuario de la tabla profiles
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) throw error;

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

          // Obtener el perfil del usuario
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
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

          // Obtener el perfil creado
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error("Profile error:", profileError);
            // Aún así consideramos el registro exitoso
            return {
              success: true,
            };
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
