import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"

export function AdminRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
