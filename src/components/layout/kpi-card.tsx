import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/utils/cn"

interface KpiCardProps {
  title: string
  value: string
  hint?: string
  icon: LucideIcon
  trend?: { label: string; positive?: boolean }
  className?: string
}

export function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
        {trend ? (
          <p
            className={cn(
              "mt-3 text-xs font-medium",
              trend.positive === false
                ? "text-destructive"
                : "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {trend.label}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
