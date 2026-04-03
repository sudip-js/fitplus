import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatINR } from "@/utils/locale-in"

export interface RevenueExpenseDatum {
  label: string
  revenue: number
  expense: number
}

interface RevenueExpenseChartProps {
  data: RevenueExpenseDatum[]
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            className="text-xs text-muted-foreground [&_text]:fill-muted-foreground"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              v >= 100000
                ? `₹${v / 100000}L`
                : v >= 1000
                  ? `₹${v / 1000}k`
                  : `₹${v}`
            }
            className="text-xs text-muted-foreground [&_text]:fill-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
            formatter={(value, name) => [
              typeof value === "number" ? formatINR(value) : "—",
              name === "revenue" ? "Revenue" : "Expenses",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) =>
              value === "revenue" ? "Revenue" : "Expenses"
            }
          />
          <Bar
            dataKey="revenue"
            name="revenue"
            fill="oklch(0.52 0.2 260)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="expense"
            name="expense"
            fill="oklch(0.55 0.15 25)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
