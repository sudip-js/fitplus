import { create } from "zustand"
import initial from "@/data/mock-expenses.json"
import type { Expense, ExpenseCategory } from "@/types"

interface ExpenseState {
  expenses: Expense[]
  addExpense: (input: Omit<Expense, "id">) => void
  updateExpense: (id: string, patch: Partial<Omit<Expense, "id">>) => void
  deleteExpense: (id: string) => void
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `e-${Date.now()}`

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: initial as Expense[],
  addExpense: (input) => {
    const row: Expense = { ...input, id: uid() }
    set((s) => ({ expenses: [row, ...s.expenses] }))
  },
  updateExpense: (id, patch) =>
    set((s) => ({
      expenses: s.expenses.map((e) =>
        e.id === id ? { ...e, ...patch } : e,
      ),
    })),
  deleteExpense: (id) =>
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
}))

export function filterExpenses(
  rows: Expense[],
  opts: {
    search: string
    category: ExpenseCategory | "all"
    from?: string
    to?: string
  },
) {
  const q = opts.search.trim().toLowerCase()
  return rows.filter((e) => {
    if (opts.category !== "all" && e.category !== opts.category) return false
    if (opts.from && e.date < opts.from) return false
    if (opts.to && e.date > opts.to) return false
    if (
      q &&
      !e.title.toLowerCase().includes(q) &&
      !(e.notes?.toLowerCase().includes(q) ?? false)
    ) {
      return false
    }
    return true
  })
}
