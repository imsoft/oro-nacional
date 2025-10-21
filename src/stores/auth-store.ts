import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Simular base de datos de usuarios en localStorage
const USERS_KEY = "oro-nacional-users";

const getUsers = (): Array<User & { password: string }> => {
  if (typeof window === "undefined") return [];
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: Array<User & { password: string }>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Inicializar usuario admin si no existe
const initializeAdmin = () => {
  if (typeof window === "undefined") return;

  const users = getUsers();
  const adminExists = users.some((u) => u.role === "admin");

  if (!adminExists) {
    const admin: User & { password: string } = {
      id: crypto.randomUUID(),
      email: "admin@oronacional.com",
      name: "Administrador",
      role: "admin",
      password: "admin123",
      createdAt: new Date().toISOString(),
    };
    users.push(admin);
    saveUsers(users);
  }
};

// Inicializar admin al cargar
if (typeof window !== "undefined") {
  initializeAdmin();
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      login: async (email: string, password: string) => {
        // Simular delay de red
        await new Promise((resolve) => setTimeout(resolve, 500));

        const users = getUsers();
        const user = users.find((u) => u.email === email);

        if (!user) {
          return { success: false, error: "Usuario no encontrado" };
        }

        if (user.password !== password) {
          return { success: false, error: "Contraseña incorrecta" };
        }

        // Remover password antes de guardar en el estado
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;

        set({
          user: userWithoutPassword,
          isAuthenticated: true,
          isAdmin: userWithoutPassword.role === "admin",
        });

        return { success: true };
      },

      register: async (name: string, email: string, password: string) => {
        // Simular delay de red
        await new Promise((resolve) => setTimeout(resolve, 500));

        const users = getUsers();

        // Verificar si el usuario ya existe
        if (users.find((u) => u.email === email)) {
          return { success: false, error: "Este correo ya está registrado" };
        }

        // Crear nuevo usuario
        const newUser: User & { password: string } = {
          id: crypto.randomUUID(),
          email,
          name,
          role: "user",
          password,
          createdAt: new Date().toISOString(),
        };

        // Guardar en "base de datos"
        users.push(newUser);
        saveUsers(users);

        // Remover password antes de guardar en el estado
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = newUser;

        set({
          user: userWithoutPassword,
          isAuthenticated: true,
          isAdmin: false,
        });

        return { success: true };
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },
    }),
    {
      name: "oro-nacional-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
