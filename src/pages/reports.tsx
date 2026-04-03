import { useMemo, useState } from "react"
import chartData from "@/data/mock-charts.json"
import { ChartCard } from "@/components/charts/chart-card"
import { GrowthChart } from "@/components/charts/growth-chart"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ReportsPage() {
  const [range, setRange] = useState("6m")

  const filtered = useMemo(() => {
    const months = range === "3m" ? 3 : range === "6m" ? 6 : 12
    return {
      revenue: chartData.revenueByMonth.slice(-months),
      members: chartData.membersByMonth.slice(-months),
    }
  }, [range])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Executive charts with simple range controls."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Range</Label>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-full rounded-xl sm:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="rounded-xl" disabled>
              Export PDF
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue" description="Mock billing trend">
          <RevenueChart data={filtered.revenue} />
        </ChartCard>
        <ChartCard title="Member growth" description="Net new members">
          <GrowthChart data={filtered.members} />
        </ChartCard>
      </div>
    </div>
  )
}
