import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface GrowthChartProps {
  data: { month: string; count: number }[]
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            className="text-xs text-muted-foreground [&_text]:fill-muted-foreground"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            className="text-xs text-muted-foreground [&_text]:fill-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
            }}
            formatter={(value) =>
              typeof value === "number" ? [value, "Members"] : ["—", "Members"]
            }
          />
          <Bar
            dataKey="count"
            fill="oklch(0.52 0.2 260 / 0.85)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
