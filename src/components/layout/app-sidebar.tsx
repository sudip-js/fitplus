import { NavLink } from "react-router-dom"
import {
  Activity,
  BarChart3,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Settings,
  Users,
  UserSquare2,
  Wallet,
  Receipt,
} from "lucide-react"
import { cn } from "@/utils/cn"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"

const nav: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/members", label: "Members", icon: Users },
  { to: "/plans", label: "Membership plans", icon: Wallet },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/attendance", label: "Attendance", icon: Activity },
  { to: "/trainers", label: "Trainers", icon: Dumbbell },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
]

const trainerPaths = new Set([
  "/",
  "/members",
  "/payments",
  "/attendance",
  "/settings",
])

interface AppSidebarProps {
  className?: string
  collapsed?: boolean
  onNavigate?: () => void
}

export function AppSidebar({
  className,
  collapsed = false,
  onNavigate,
}: AppSidebarProps) {
  const user = useAuthStore((s) => s.user)
  const items =
    user?.role === "admin"
      ? nav
      : nav.filter((item) => trainerPaths.has(item.to))

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card/80 backdrop-blur-md",
        collapsed && "w-[72px]",
        className,
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
          FP
        </div>
        {!collapsed ? (
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">FitPulse</p>
            <p className="text-xs text-muted-foreground">Gym CRM</p>
          </div>
        ) : null}
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>{item.label}</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 rounded-xl transition-colors duration-200",
            collapsed && "justify-center px-0",
          )}
          asChild
        >
          <NavLink to="/settings" onClick={onNavigate}>
            <UserSquare2 className="h-4 w-4" />
            {!collapsed ? (
              <span className="truncate text-left text-xs font-medium">
                {user?.name ?? "Signed out"}
              </span>
            ) : null}
          </NavLink>
        </Button>
      </div>
    </aside>
  )
}
