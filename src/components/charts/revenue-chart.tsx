import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatINRCompact } from "@/utils/locale-in"

interface RevenueChartProps {
  data: { month: string; revenue: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="oklch(0.52 0.2 260)"
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor="oklch(0.52 0.2 260)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            className="text-xs text-muted-foreground [&_text]:fill-muted-foreground"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatINRCompact(v)}
            className="text-xs text-muted-foreground [&_text]:fill-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
            formatter={(value) =>
              typeof value === "number"
                ? [formatINRCompact(value), "Revenue"]
                : ["—", "Revenue"]
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="oklch(0.52 0.2 260)"
            strokeWidth={2}
            fill="url(#fillRev)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
