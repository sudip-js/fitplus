import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { FormModal } from "@/components/common/form-modal"
import { ActionDropdown } from "@/components/common/action-dropdown"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useMemberStore } from "@/store/useMemberStore"
import { usePaymentStore } from "@/store/usePaymentStore"
import type { Payment, PaymentMethod, PaymentStatus } from "@/types"
import { downloadCsv } from "@/utils/export-csv"
import { formatDateIN, formatINR, todayISO } from "@/utils/locale-in"
import { CreditCard, Download, IndianRupee } from "lucide-react"

function paymentRowClass(p: Payment) {
  if (p.status === "overdue")
    return "bg-destructive/10 hover:bg-destructive/[0.14]"
  if (p.status === "pending") return "bg-amber-500/12 hover:bg-amber-500/16"
  return undefined
}

export function PaymentsPage() {
  const payments = usePaymentStore((s) => s.payments)
  const addPayment = usePaymentStore((s) => s.addPayment)
  const updatePayment = usePaymentStore((s) => s.updatePayment)
  const deletePayment = usePaymentStore((s) => s.deletePayment)
  const members = useMemberStore((s) => s.members)
  const [searchParams, setSearchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "due_today" | "pending_overdue">(
    "all",
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [view, setView] = useState<Payment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    memberId: members[0]?.id ?? "",
    amount: "",
    date: todayISO(),
    status: "paid" as PaymentStatus,
    method: "upi" as PaymentMethod,
  })

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 300)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (modalOpen) {
      window.setTimeout(() => amountInputRef.current?.focus(), 100)
    }
  }, [modalOpen])

  const memberName = useMemo(() => {
    const m = new Map(members.map((x) => [x.id, x.name]))
    return (id: string) => m.get(id) ?? id
  }, [members])

  const today = todayISO()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return payments.filter((p) => {
      if (filter === "due_today") {
        if (p.date !== today) return false
        if (p.status !== "pending" && p.status !== "overdue") return false
      }
      if (filter === "pending_overdue") {
        if (p.status !== "pending" && p.status !== "overdue") return false
      }
      if (!q) return true
      return (
        memberName(p.memberId).toLowerCase().includes(q) ||
        p.amount.toString().includes(q) ||
        p.status.includes(q)
      )
    })
  }, [payments, search, memberName, filter, today])

  const statusBadge = (s: PaymentStatus) => {
    if (s === "paid")
      return <Badge variant="success">Paid</Badge>
    if (s === "pending")
      return <Badge variant="warning">Pending</Badge>
    return <Badge variant="destructive">Overdue</Badge>
  }

  function openCreate() {
    setEditing(null)
    setForm({
      memberId: members[0]?.id ?? "",
      amount: "",
      date: todayISO(),
      status: "paid",
      method: "upi",
    })
    setModalOpen(true)
  }

  useEffect(() => {
    if (searchParams.get("collect") === "1") {
      setEditing(null)
      setForm({
        memberId: members[0]?.id ?? "",
        amount: "",
        date: todayISO(),
        status: "paid",
        method: "upi",
      })
      setModalOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, members])

  function openEdit(p: Payment) {
    setEditing(p)
    setForm({
      memberId: p.memberId,
      amount: String(p.amount),
      date: p.date,
      status: p.status,
      method: p.method,
    })
    setModalOpen(true)
  }

  function save() {
    const amount = Number(form.amount)
    if (!form.memberId || !Number.isFinite(amount)) {
      toast.error("Select member and amount")
      return
    }
    if (editing) {
      updatePayment(editing.id, {
        memberId: form.memberId,
        amount,
        date: form.date,
        status: form.status,
        method: form.method,
      })
      toast.success("Payment updated")
    } else {
      addPayment({
        memberId: form.memberId,
        amount,
        date: form.date,
        status: form.status,
        method: form.method,
      })
      toast.success("Payment recorded")
    }
    setModalOpen(false)
  }

  function exportCsv() {
    const rows = [
      ["Member", "Amount (INR)", "Date", "Status", "Method"],
      ...filtered.map((p) => [
        memberName(p.memberId),
        String(p.amount),
        formatDateIN(p.date),
        p.status,
        p.method,
      ]),
    ]
    downloadCsv("payments.csv", rows)
    toast.success("Exported")
  }

  const columns: DataTableColumn<Payment>[] = useMemo(
    () => [
      {
        id: "member",
        header: "Member",
        cell: (p) => (
          <span className="font-medium">{memberName(p.memberId)}</span>
        ),
      },
      {
        id: "amount",
        header: "Amount",
        className: "hidden sm:table-cell",
        cell: (p) => (
          <span className="tabular-nums font-medium">
            {formatINR(p.amount)}
          </span>
        ),
      },
      {
        id: "date",
        header: "Date",
        className: "hidden md:table-cell",
        cell: (p) => (
          <span className="text-muted-foreground">
            {formatDateIN(p.date)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (p) => statusBadge(p.status),
      },
      {
        id: "method",
        header: "Method",
        className: "hidden lg:table-cell uppercase",
        cell: (p) => (
          <span className="text-muted-foreground">{p.method}</span>
        ),
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        className: "w-[72px] text-right",
        cell: (p) => (
          <ActionDropdown
            onView={() => setView(p)}
            onEdit={() => openEdit(p)}
            onDelete={() => setDeleteTarget(p)}
          />
        ),
      },
    ],
    [memberName],
  )

  const formBody = (
    <>
      <div className="space-y-2">
        <Label>Member</Label>
        <Select
          value={form.memberId}
          onValueChange={(memberId) =>
            setForm((f) => ({ ...f, memberId }))
          }
        >
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Member" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amt">Amount (₹)</Label>
        <Input
          ref={amountInputRef}
          id="amt"
          type="number"
          value={form.amount}
          onChange={(e) =>
            setForm((f) => ({ ...f, amount: e.target.value }))
          }
          className="h-11 rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pdate">Date</Label>
        <Input
          id="pdate"
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm((f) => ({ ...f, date: e.target.value }))
          }
          className="h-11 rounded-xl"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, status: v as PaymentStatus }))
            }
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Method</Label>
          <Select
            value={form.method}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, method: v as PaymentMethod }))
            }
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="card">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )

  return (
    <div className="space-y-8 pb-24 lg:pb-10">
      <PageHeader
        title="Payments"
        description="Track UPI, cash, and card collections. Follow up on pending fees fast."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-11 rounded-xl" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              size="lg"
              className="h-12 rounded-2xl px-6 text-base shadow-md sm:h-11 sm:rounded-xl sm:px-4 sm:text-sm"
              onClick={openCreate}
            >
              <IndianRupee className="h-4 w-4" />
              Collect payment
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          placeholder="Search member, amount, status…"
          className="max-w-md rounded-xl sm:h-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={filter === "all" ? "secondary" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            type="button"
            variant={filter === "due_today" ? "secondary" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setFilter("due_today")}
          >
            Due today
          </Button>
          <Button
            type="button"
            variant={filter === "pending_overdue" ? "secondary" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setFilter("pending_overdue")}
          >
            Pending / Overdue
          </Button>
        </div>
      </div>

      <DataTable
        loading={loading}
        columns={columns}
        data={filtered}
        getRowId={(p) => p.id}
        getRowClassName={paymentRowClass}
        onRowClick={(p) => setView(p)}
        emptyState={{
          icon: CreditCard,
          title: "No payments yet",
          description: "Record your first fee — tap Collect payment 🚀",
          action: (
            <Button size="lg" className="h-12 rounded-2xl" onClick={openCreate}>
              <IndianRupee className="h-4 w-4" />
              Collect payment
            </Button>
          ),
        }}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit payment" : "Collect payment"}
        description="Amounts are stored in INR (frontend demo)."
        footer={
          <>
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="h-11 rounded-xl" onClick={save}>
              {editing ? "Save changes" : "Save"}
            </Button>
          </>
        }
      >
        {formBody}
      </FormModal>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Payment details</SheetTitle>
            <SheetDescription>Reference for desk staff</SheetDescription>
          </SheetHeader>
          {view ? (
            <div className="space-y-4 py-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Member</p>
                <p className="text-lg font-semibold">
                  {memberName(view.memberId)}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatINR(view.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p>{formatDateIN(view.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  {statusBadge(view.status)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Method</p>
                  <p className="uppercase">{view.method}</p>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete payment?"
        description="Removes this ledger row from mock data."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deletePayment(deleteTarget.id)
            toast.success("Payment deleted")
          }
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
