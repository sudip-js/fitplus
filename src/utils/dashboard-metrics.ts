import { format } from "date-fns"
import { monthKey } from "@/utils/locale-in"
import type { Expense, Payment } from "@/types"

function lastNMonthKeys(n: number, from = new Date()): string[] {
  const keys: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1)
    keys.push(monthKey(d))
  }
  return keys
}

export function buildRevenueExpenseSeries(
  payments: Payment[],
  expenses: Expense[],
  months = 6,
) {
  const keys = lastNMonthKeys(months)
  return keys.map((k) => {
    const revenue = payments
      .filter((p) => p.status === "paid" && p.date.startsWith(k))
      .reduce((a, p) => a + p.amount, 0)
    const expense = expenses
      .filter((e) => e.date.startsWith(k))
      .reduce((a, e) => a + e.amount, 0)
    const [y, m] = k.split("-").map(Number)
    return {
      label: format(new Date(y, m - 1, 1), "MMM yy"),
      monthKey: k,
      revenue,
      expense,
    }
  })
}
