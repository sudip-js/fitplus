import { Link } from "react-router-dom"
import { IndianRupee, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/utils/cn"

export function MobileQuickActions({ className }: { className?: string }) {
  const mobile = useIsMobile()
  if (!mobile) return null
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden",
        className,
      )}
    >
      <div className="pointer-events-auto flex w-full max-w-md gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-[var(--shadow-soft-lg)] backdrop-blur-md">
        <Button
          size="lg"
          className="h-12 flex-1 rounded-xl text-base"
          variant="secondary"
          asChild
        >
          <Link to="/members?add=1" replace={false}>
            <UserPlus className="h-5 w-5" />
            Add member
          </Link>
        </Button>
        <Button size="lg" className="h-12 flex-1 rounded-xl text-base" asChild>
          <Link to="/payments?collect=1" replace={false}>
            <IndianRupee className="h-5 w-5" />
            Collect
          </Link>
        </Button>
      </div>
    </div>
  )
}
