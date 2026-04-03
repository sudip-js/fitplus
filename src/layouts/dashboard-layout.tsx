import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { MobileQuickActions } from "@/components/layout/mobile-quick-actions"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/utils/cn"

export function DashboardLayout() {
  const mobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!mobile) setOpen(false)
  }, [mobile])

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {!mobile ? (
          <AppSidebar className="hidden lg:flex" collapsed={collapsed} />
        ) : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <AppHeader
            leftSlot={
              mobile ? (
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <Menu className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <AppSidebar
                      className={cn("flex w-full border-0 shadow-none")}
                      onNavigate={() => setOpen(false)}
                    />
                  </SheetContent>
                </Sheet>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden rounded-xl lg:inline-flex"
                  onClick={() => setCollapsed((c) => !c)}
                  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              )
            }
          />
          <main
            className={cn(
              "flex-1 px-4 pb-10 pt-2 sm:px-6 lg:px-8",
              mobile && "pb-28",
            )}
          >
            <div className="mx-auto w-full max-w-[1280px] space-y-8 py-6">
              <Outlet />
            </div>
          </main>
          <MobileQuickActions />
        </div>
      </div>
    </div>
  )
}
