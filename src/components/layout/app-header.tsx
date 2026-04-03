import { useState } from "react"
import { Link } from "react-router-dom"
import { Bell, LogOut, Moon, Search, Sun } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { isAdmin, useAuthStore } from "@/store/useAuthStore"
import type { ReactNode } from "react"

interface AppHeaderProps {
  leftSlot?: ReactNode
}

export function AppHeader({ leftSlot }: AppHeaderProps) {
  const { user, theme, setTheme, signOut, signInAsAdmin } = useAuthStore()
  const [q, setQ] = useState("")

  const cycleTheme = () => {
    const order = ["light", "dark", "system"] as const
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
    toast.success(
      next === "system"
        ? "Theme follows system"
        : `Theme: ${next}`,
    )
  }

  const icon =
    theme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : theme === "light" ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4 opacity-70" />
    )

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:gap-4 lg:px-8">
        <div className="flex items-center gap-2 lg:gap-3">
          {leftSlot}
          <div className="relative hidden min-w-[200px] flex-1 md:block lg:min-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search members, invoices, plans…"
              className="h-10 rounded-xl pl-9"
              onKeyDown={(e) => {
                if (e.key === "Enter" && q.trim())
                  toast.message("Search is UI-only for now", {
                    description: `You typed: ${q}`,
                  })
              }}
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl md:hidden"
            onClick={() =>
              toast.message("Search", { description: "Use desktop for full search bar." })
            }
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={cycleTheme}
            title="Toggle theme"
          >
            {icon}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => toast.info("No new notifications")}
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 rounded-xl px-2 sm:px-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline max-w-[120px] truncate">
                  {user?.name ?? "Account"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span>{user?.name ?? "Guest"}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-lg">
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="rounded-lg text-destructive focus:text-destructive"
                onClick={() => {
                  signOut()
                  toast.success("Signed out (demo)")
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
              {!isAdmin(user) ? (
                <DropdownMenuItem
                  className="rounded-lg"
                  onClick={() => {
                    signInAsAdmin()
                    toast.success("Switched to admin workspace")
                  }}
                >
                  Open as admin
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
