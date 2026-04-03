import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser } from "@/types"

type ThemeMode = "light" | "dark" | "system"

interface AuthState {
  user: AuthUser | null
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  applyTheme: () => void
  signInAsAdmin: () => void
  signInAsTrainer: () => void
  /** @deprecated use signInAsAdmin */
  signInDemo: () => void
  signOut: () => void
}

const demoAdmin: AuthUser = {
  id: "u1",
  name: "Rajesh Khanna",
  email: "rajesh@fitpulse.in",
  role: "admin",
}

const demoTrainer: AuthUser = {
  id: "u2",
  name: "Ananya Iyer",
  email: "ananya@fitpulse.in",
  role: "trainer",
}

function resolveDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true
  if (mode === "light") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: demoAdmin,
      theme: "system",
      setTheme: (theme) => {
        set({ theme })
        get().applyTheme()
      },
      applyTheme: () => {
        const { theme } = get()
        const dark = resolveDark(theme)
        document.documentElement.classList.toggle("dark", dark)
      },
      signInAsAdmin: () => set({ user: demoAdmin }),
      signInAsTrainer: () => set({ user: demoTrainer }),
      signInDemo: () => set({ user: demoAdmin }),
      signOut: () => set({ user: null }),
    }),
    {
      name: "gym-crm-auth",
      partialize: (s) => ({ user: s.user, theme: s.theme }),
    },
  ),
)

export function isAdmin(user: AuthUser | null | undefined) {
  return user?.role === "admin"
}
