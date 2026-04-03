import { useEffect, useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { AdminRoute } from "@/components/auth/admin-route"
import { AppLoading } from "@/components/layout/app-loading"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { useAuthStore } from "@/store/useAuthStore"
import { AttendancePage } from "@/pages/attendance"
import { DashboardPage } from "@/pages/dashboard"
import { MembersPage } from "@/pages/members"
import { PaymentsPage } from "@/pages/payments"
import { PlansPage } from "@/pages/plans"
import { ReportsPage } from "@/pages/reports"
import { SettingsPage } from "@/pages/settings"
import { TrainersPage } from "@/pages/trainers"
import { ExpensesPage } from "@/pages/expenses"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function ThemeSync() {
  const theme = useAuthStore((s) => s.theme)
  const applyTheme = useAuthStore((s) => s.applyTheme)
  useEffect(() => {
    applyTheme()
  }, [theme, applyTheme])
  return null
}

function SignInScreen() {
  const signInAsAdmin = useAuthStore((s) => s.signInAsAdmin)
  const signInAsTrainer = useAuthStore((s) => s.signInAsTrainer)
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-[var(--shadow-soft-lg)]">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground sm:mx-0">
            FP
          </div>
          <CardTitle className="text-2xl">FitPulse</CardTitle>
          <CardDescription>
            India-ready gym CRM — frontend demo. Pick a role to explore the UI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="h-12 w-full rounded-xl text-base"
            onClick={() => signInAsAdmin()}
          >
            Continue as owner (admin)
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button
            variant="secondary"
            className="h-12 w-full rounded-xl text-base"
            onClick={() => signInAsTrainer()}
          >
            Continue as trainer
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Trainers see members, payments &amp; attendance only.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function App() {
  const user = useAuthStore((s) => s.user)
  const [boot, setBoot] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setBoot(false), 420)
    return () => window.clearTimeout(t)
  }, [])

  if (boot) {
    return <AppLoading />
  }

  return (
    <>
      <ThemeSync />
      {user ? (
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route
              path="plans"
              element={
                <AdminRoute>
                  <PlansPage />
                </AdminRoute>
              }
            />
            <Route path="payments" element={<PaymentsPage />} />
            <Route
              path="expenses"
              element={
                <AdminRoute>
                  <ExpensesPage />
                </AdminRoute>
              }
            />
            <Route path="attendance" element={<AttendancePage />} />
            <Route
              path="trainers"
              element={
                <AdminRoute>
                  <TrainersPage />
                </AdminRoute>
              }
            />
            <Route
              path="reports"
              element={
                <AdminRoute>
                  <ReportsPage />
                </AdminRoute>
              }
            />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="*" element={<SignInScreen />} />
        </Routes>
      )}
    </>
  )
}
