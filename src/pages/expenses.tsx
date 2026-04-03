import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { EXPENSE_CATEGORY_LABEL } from "@/data/constants"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { FormModal } from "@/components/common/form-modal"
import { ActionDropdown } from "@/components/common/action-dropdown"
import { KpiCard } from "@/components/layout/kpi-card"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  filterExpenses,
  useExpenseStore,
} from "@/store/useExpenseStore"
import type { Expense, ExpenseCategory } from "@/types"
import { downloadCsv } from "@/utils/export-csv"
import { formatDateIN, formatINR, monthKey } from "@/utils/locale-in"
import {
  Landmark,
  Download,
  Plus,
  Receipt,
  TrendingDown,
} from "lucide-react"

export function ExpensesPage() {
  const expenses = useExpenseStore((s) => s.expenses)
  const addExpense = useExpenseStore((s) => s.addExpense)
  const updateExpense = useExpenseStore((s) => s.updateExpense)
  const deleteExpense = useExpenseStore((s) => s.deleteExpense)

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<ExpenseCategory | "all">("all")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [view, setView] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "rent" as ExpenseCategory,
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  })

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 300)
    return () => window.clearTimeout(t)
  }, [])

  const filtered = useMemo(
    () =>
      filterExpenses(expenses, {
        search,
        category,
        from: from || undefined,
        to: to || undefined,
      }),
    [expenses, search, category, from, to],
  )

  const mk = monthKey()

  const totalAll = useMemo(
    () => expenses.reduce((a, e) => a + e.amount, 0),
    [expenses],
  )

  const monthTotal = useMemo(
    () =>
      expenses
        .filter((e) => e.date.startsWith(mk))
        .reduce((a, e) => a + e.amount, 0),
    [expenses, mk],
  )

  const monthCategoryBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses.filter((e) => e.date.startsWith(mk))) {
      const label = EXPENSE_CATEGORY_LABEL[e.category]
      map.set(label, (map.get(label) ?? 0) + e.amount)
    }
    const palette = [
      "oklch(0.52 0.2 260)",
      "oklch(0.55 0.15 25)",
      "oklch(0.55 0.12 145)",
      "oklch(0.5 0.08 280)",
      "oklch(0.55 0.14 85)",
      "oklch(0.5 0.05 220)",
    ]
    return [...map.entries()].map(([name, value], i) => ({
      name,
      value,
      fill: palette[i % palette.length],
    }))
  }, [expenses, mk])

  function openCreate() {
    setEditing(null)
    setForm({
      title: "",
      amount: "",
      category: "rent",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
    })
    setModalOpen(true)
  }

  function openEdit(e: Expense) {
    setEditing(e)
    setForm({
      title: e.title,
      amount: String(e.amount),
      category: e.category,
      date: e.date,
      notes: e.notes ?? "",
    })
    setModalOpen(true)
  }

  function save() {
    const amount = Number(form.amount)
    if (!form.title.trim() || !Number.isFinite(amount)) {
      toast.error("Title and amount are required")
      return
    }
    if (editing) {
      updateExpense(editing.id, {
        title: form.title,
        amount,
        category: form.category,
        date: form.date,
        notes: form.notes || undefined,
      })
      toast.success("Expense updated")
    } else {
      addExpense({
        title: form.title,
        amount,
        category: form.category,
        date: form.date,
        notes: form.notes || undefined,
      })
      toast.success("Expense added")
    }
    setModalOpen(false)
  }

  function exportCsv() {
    const rows: string[][] = [
      ["Title", "Amount", "Category", "Date", "Notes"],
      ...filtered.map((e) => [
        e.title,
        String(e.amount),
        EXPENSE_CATEGORY_LABEL[e.category],
        e.date,
        e.notes ?? "",
      ]),
    ]
    downloadCsv("expenses.csv", rows)
    toast.success("Exported")
  }

  const columns: DataTableColumn<Expense>[] = useMemo(
    () => [
      {
        id: "title",
        header: "Title",
        cell: (e) => <span className="font-medium">{e.title}</span>,
      },
      {
        id: "category",
        header: "Category",
        cell: (e) => (
          <Badge variant="outline">
            {EXPENSE_CATEGORY_LABEL[e.category]}
          </Badge>
        ),
      },
      {
        id: "amount",
        header: "Amount",
        className: "hidden sm:table-cell",
        cell: (e) => (
          <span className="tabular-nums">{formatINR(e.amount)}</span>
        ),
      },
      {
        id: "date",
        header: "Date",
        className: "hidden md:table-cell",
        cell: (e) => (
          <span className="text-muted-foreground">
            {formatDateIN(e.date)}
          </span>
        ),
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        className: "w-[72px] text-right",
        cell: (e) => (
          <ActionDropdown
            onView={() => setView(e)}
            onEdit={() => openEdit(e)}
            onDelete={() => setDeleteTarget(e)}
          />
        ),
      },
    ],
    [],
  )

  const formFields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="etitle">Title</Label>
        <Input
          id="etitle"
          value={form.title}
          onChange={(e) =>
            setForm((f) => ({ ...f, title: e.target.value }))
          }
          className="rounded-xl"
          placeholder="Electricity, Rent…"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="eamount">Amount (INR)</Label>
          <Input
            id="eamount"
            type="number"
            className="rounded-xl"
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, category: v as ExpenseCategory }))
            }
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {(Object.keys(EXPENSE_CATEGORY_LABEL) as ExpenseCategory[]).map(
                (c) => (
                  <SelectItem key={c} value={c}>
                    {EXPENSE_CATEGORY_LABEL[c]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edate">Date</Label>
        <Input
          id="edate"
          type="date"
          className="rounded-xl"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="enotes">Notes (optional)</Label>
        <Textarea
          id="enotes"
          value={form.notes}
          onChange={(e) =>
            setForm((f) => ({ ...f, notes: e.target.value }))
          }
          placeholder="Internal context"
        />
      </div>
    </>
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Expenses"
        description="Operational spend with filters, exports, and bookkeeping-ready rows."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-xl" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button className="rounded-xl" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add expense
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard
          title="Total expenses"
          value={formatINR(totalAll)}
          hint="All recorded mock spend"
          icon={Receipt}
        />
        <KpiCard
          title="This month"
          value={formatINR(monthTotal)}
          hint={mk}
          icon={TrendingDown}
          trend={{ label: "Review big line items", positive: false }}
        />
      </div>

      {monthCategoryBreakdown.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card/50 p-4 shadow-[var(--shadow-soft)]">
          <p className="mb-3 text-sm font-medium">This month by category</p>
          <div className="h-[220px] w-full max-w-md mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={monthCategoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {monthCategoryBreakdown.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) =>
                    typeof v === "number" ? formatINR(v) : String(v)
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-4">
        <Input
          className="rounded-xl lg:col-span-1"
          placeholder="Search title or notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={category}
          onValueChange={(v) =>
            setCategory(v as ExpenseCategory | "all")
          }
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All categories</SelectItem>
            {(Object.keys(EXPENSE_CATEGORY_LABEL) as ExpenseCategory[]).map(
              (c) => (
                <SelectItem key={c} value={c}>
                  {EXPENSE_CATEGORY_LABEL[c]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="rounded-xl"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          type="date"
          className="rounded-xl"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <DataTable
        loading={loading}
        columns={columns}
        data={filtered}
        getRowId={(e) => e.id}
        onRowClick={(e) => setView(e)}
        emptyState={{
          icon: Landmark,
          title: "No expenses match",
          description: "Relax filters or add your first line item.",
          action: (
            <Button className="rounded-xl" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add expense
            </Button>
          ),
        }}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit expense" : "Add expense"}
        footer={
          <>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={save}>
              Save
            </Button>
          </>
        }
      >
        {formFields}
      </FormModal>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{view?.title}</SheetTitle>
            <SheetDescription>Expense detail</SheetDescription>
          </SheetHeader>
          {view ? (
            <div className="space-y-4 py-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-3xl font-semibold">
                  {formatINR(view.amount)}
                </p>
                <Badge variant="outline">
                  {EXPENSE_CATEGORY_LABEL[view.category]}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p>{formatDateIN(view.date)}</p>
              </div>
              {view.notes ? (
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p>{view.notes}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete expense?"
        description="Removes this cost from the dashboard totals."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteExpense(deleteTarget.id)
            toast.success("Expense deleted")
          }
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
