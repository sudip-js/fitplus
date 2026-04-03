import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { ActionDropdown } from "@/components/common/action-dropdown"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useFilteredMembers,
  useMemberStore,
  type MemberInsightFilter,
} from "@/store/useMemberStore"
import { usePaymentStore } from "@/store/usePaymentStore"
import { usePlanStore } from "@/store/usePlanStore"
import { useTrainerStore } from "@/store/useTrainerStore"
import type { Member, MemberStatus } from "@/types"
import type { MemberLifecycle } from "@/utils/member-insights"
import { downloadCsv } from "@/utils/export-csv"
import { cn } from "@/utils/cn"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatDateIN, formatINR } from "@/utils/locale-in"
import {
  daysUntilExpiry,
  getMemberLifecycle,
  memberRowToneClass,
} from "@/utils/member-insights"
import { Download, Plus, RefreshCw, Trash2, Users } from "lucide-react"

const statusVariant: Record<
  MemberStatus,
  "success" | "secondary" | "warning" | "destructive"
> = {
  active: "success",
  paused: "secondary",
  expiring: "warning",
  churned: "destructive",
}

const lifecycleVariant: Record<
  MemberLifecycle,
  "success" | "secondary" | "warning" | "destructive"
> = {
  active: "success",
  expired: "destructive",
  due: "warning",
  inactive: "secondary",
}

const lifecycleLabel: Record<MemberLifecycle, string> = {
  active: "Active",
  expired: "Expired",
  due: "Due",
  inactive: "Inactive",
}

export function MembersPage() {
  const rows = useFilteredMembers()
  const plans = usePlanStore((s) => s.plans)
  const trainers = useTrainerStore((s) => s.trainers)
  const payments = usePaymentStore((s) => s.payments)
  const setSearch = useMemberStore((s) => s.setSearch)
  const setStatusFilter = useMemberStore((s) => s.setStatusFilter)
  const setInsightFilter = useMemberStore((s) => s.setInsightFilter)
  const statusFilter = useMemberStore((s) => s.statusFilter)
  const insightFilter = useMemberStore((s) => s.insightFilter)
  const addMember = useMemberStore((s) => s.addMember)
  const updateMember = useMemberStore((s) => s.updateMember)
  const deleteMember = useMemberStore((s) => s.deleteMember)
  const deleteMembers = useMemberStore((s) => s.deleteMembers)
  const renewMembership = useMemberStore((s) => s.renewMembership)

  const mobile = useIsMobile()
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [viewMember, setViewMember] = useState<Member | null>(null)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    planId: plans[0]?.id ?? "",
    trainerId: trainers[0]?.id ?? "",
    joinDate: new Date().toISOString().slice(0, 10),
    status: "active" as MemberStatus,
  })

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 350)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setAddOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete("add")
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (addOpen) {
      window.setTimeout(() => nameInputRef.current?.focus(), 50)
    }
  }, [addOpen])

  const planName = useMemo(() => {
    const map = new Map(plans.map((p) => [p.id, p.name]))
    return (id: string) => map.get(id) ?? id
  }, [plans])

  const trainerName = useMemo(() => {
    const map = new Map(trainers.map((t) => [t.id, t.name]))
    return (id: string) => (id ? map.get(id) ?? "—" : "Unassigned")
  }, [trainers])

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected],
  )

  function resetForm() {
    setForm({
      name: "",
      phone: "",
      email: "",
      planId: plans[0]?.id ?? "",
      trainerId: trainers.find((t) => t.status === "active")?.id ?? "",
      joinDate: new Date().toISOString().slice(0, 10),
      status: "active",
    })
  }

  function openEdit(m: Member) {
    setEditMember(m)
    setForm({
      name: m.name,
      phone: m.phone,
      email: m.email,
      planId: m.planId,
      trainerId: m.trainerId || trainers[0]?.id || "",
      joinDate: m.joinDate,
      status: m.status,
    })
  }

  function submitAdd() {
    if (!form.name || !form.phone || !form.email || !form.planId) {
      toast.error("Please fill required fields")
      return
    }
    addMember({
      name: form.name,
      phone: form.phone,
      email: form.email,
      planId: form.planId,
      joinDate: form.joinDate,
      trainerId: form.trainerId,
      status: form.status,
    })
    toast.success("Member added")
    setAddOpen(false)
    resetForm()
  }

  function submitEdit() {
    if (!editMember) return
    if (!form.name || !form.phone || !form.email) {
      toast.error("Please fill required fields")
      return
    }
    updateMember(editMember.id, {
      name: form.name,
      phone: form.phone,
      email: form.email,
      planId: form.planId,
      joinDate: form.joinDate,
      status: form.status,
      trainerId: form.trainerId,
    })
    toast.success("Member updated")
    setEditMember(null)
    resetForm()
  }

  function exportCsv() {
    const header = [
      "Name",
      "Phone",
      "Email",
      "Plan",
      "Status",
      "Join date",
      "Trainer",
    ]
    const body = rows.map((m) => [
      m.name,
      m.phone,
      m.email,
      planName(m.planId),
      m.status,
      m.joinDate,
      trainerName(m.trainerId),
    ])
    downloadCsv("members.csv", [header, ...body])
    toast.success("CSV exported")
  }

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {}
    if (checked) rows.forEach((r) => (next[r.id] = true))
    setSelected(next)
  }

  function lifecycleFor(m: Member) {
    return getMemberLifecycle(m, payments)
  }

  function renew(m: Member) {
    renewMembership(m.id)
    toast.success("Membership renewed")
  }

  const columns: DataTableColumn<Member>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        cell: (m) => <span className="font-medium">{m.name}</span>,
      },
      {
        id: "phone",
        header: "Phone",
        className: "hidden sm:table-cell",
        cell: (m) => (
          <span className="text-muted-foreground">{m.phone}</span>
        ),
      },
      {
        id: "plan",
        header: "Plan",
        cell: (m) => planName(m.planId),
      },
      {
        id: "lifecycle",
        header: "Status",
        cell: (m) => {
          const lc = lifecycleFor(m)
          return (
            <Badge variant={lifecycleVariant[lc]}>{lifecycleLabel[lc]}</Badge>
          )
        },
      },
      {
        id: "expiry",
        header: "Expires",
        className: "hidden lg:table-cell",
        cell: (m) => (
          <span className="text-muted-foreground">
            {formatDateIN(m.expiresAt)}
          </span>
        ),
      },
      {
        id: "days",
        header: "Days left",
        className: "hidden xl:table-cell w-[100px]",
        cell: (m) => {
          const d = daysUntilExpiry(m.expiresAt)
          if (d < 0) return <span className="text-destructive">Overdue</span>
          return <span className="tabular-nums">{d}</span>
        },
      },
      {
        id: "join",
        header: "Join date",
        className: "hidden md:table-cell",
        cell: (m) => (
          <span className="text-muted-foreground">
            {formatDateIN(m.joinDate)}
          </span>
        ),
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        className: "w-[72px] text-right",
        cell: (m) => (
          <ActionDropdown
            onView={() => setViewMember(m)}
            onEdit={() => openEdit(m)}
            onRenew={() => renew(m)}
            onDelete={() => setDeleteTarget(m)}
          />
        ),
      },
    ],
    [planName, payments],
  )

  const leadingColumns: DataTableColumn<Member>[] = useMemo(
    () => [
      {
        id: "select",
        header: (
          <Checkbox
            checked={rows.length > 0 && selectedIds.length === rows.length}
            onCheckedChange={(v) => toggleAll(v === true)}
            aria-label="Select all"
          />
        ),
        className: "w-10",
        cell: (m) => (
          <Checkbox
            checked={!!selected[m.id]}
            onCheckedChange={(v) =>
              setSelected((s) => ({ ...s, [m.id]: v === true }))
            }
            aria-label={`Select ${m.name}`}
          />
        ),
      },
    ],
    [rows.length, selected, selectedIds.length],
  )

  const memberFormFields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          ref={nameInputRef}
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="rounded-xl"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Plan</Label>
          <Select
            value={form.planId}
            onValueChange={(planId) => setForm((f) => ({ ...f, planId }))}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Choose plan" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {plans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {`${p.name} — ${formatINR(p.price)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Trainer</Label>
          <Select
            value={form.trainerId || "__none__"}
            onValueChange={(v) =>
              setForm((f) => ({
                ...f,
                trainerId: v === "__none__" ? "" : v,
              }))
            }
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Assign trainer" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="__none__">Unassigned</SelectItem>
              {trainers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start">Start date</Label>
          <Input
            id="start"
            type="date"
            value={form.joinDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, joinDate: e.target.value }))
            }
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, status: v as MemberStatus }))
            }
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="expiring">Expiring</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Members"
        description="Search, filter, and manage your roster with full CRUD."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 ? (
              <Button
                variant="destructive"
                className="rounded-xl"
                onClick={() => setBulkOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedIds.length})
              </Button>
            ) : null}
            <Button variant="outline" className="rounded-xl" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button className="rounded-xl" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add member
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          placeholder="Search name, phone, email…"
          className="max-w-md rounded-xl"
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as MemberStatus | "all")
          }
        >
          <SelectTrigger className="w-full rounded-xl sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="expiring">Expiring</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={insightFilter}
          onValueChange={(v) =>
            setInsightFilter(v as MemberInsightFilter)
          }
        >
          <SelectTrigger className="w-full rounded-xl sm:w-[200px]">
            <SelectValue placeholder="Quick filter" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All members</SelectItem>
            <SelectItem value="expiring_soon">Expiring soon (30d)</SelectItem>
            <SelectItem value="due_payment">Has due payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!mobile ? (
        <DataTable
          loading={loading}
          leadingColumns={leadingColumns}
          columns={columns}
          data={rows}
          getRowId={(m) => m.id}
          getRowClassName={(m) => memberRowToneClass(m, payments)}
          onRowClick={(m) => setViewMember(m)}
          emptyState={{
            icon: Users,
            title: "No members yet",
            description:
              "Add your first member to start tracking renewals and attendance.",
            action: (
              <Button className="rounded-xl" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" />
                Add member
              </Button>
            ),
          }}
        />
      ) : loading ? (
        <div className="space-y-2 rounded-xl border border-border p-4">
          <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-60" />
          <p className="font-medium">No members yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first member to get started.
          </p>
          <Button
            className="mt-4 rounded-xl"
            size="lg"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add member
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((m) => {
            const lc = lifecycleFor(m)
            const d = daysUntilExpiry(m.expiresAt)
            return (
              <Card
                key={m.id}
                className={cn(
                  "overflow-hidden border shadow-[var(--shadow-soft)] transition-colors",
                  memberRowToneClass(m, payments),
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="min-w-0 text-left"
                      onClick={() => setViewMember(m)}
                    >
                      <p className="font-semibold leading-tight">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.phone}</p>
                    </button>
                    <Badge variant={lifecycleVariant[lc]}>{lifecycleLabel[lc]}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p>{planName(m.planId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expires</p>
                      <p>{formatDateIN(m.expiresAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Days left</p>
                      <p className="tabular-nums">
                        {d < 0 ? "Overdue" : `${d}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-xl"
                      onClick={() => renew(m)}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Renew
                    </Button>
                    <ActionDropdown
                      onView={() => setViewMember(m)}
                      onEdit={() => openEdit(m)}
                      onRenew={() => renew(m)}
                      onDelete={() => setDeleteTarget(m)}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Sheet
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o)
          if (!o) resetForm()
        }}
      >
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add member</SheetTitle>
            <SheetDescription>Creates a new roster entry in mock state.</SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 gap-4 overflow-y-auto py-2">
            {memberFormFields}
          </div>
          <SheetFooter className="gap-2 sm:justify-between">
            <Button variant="outline" className="rounded-xl" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={submitAdd}>
              Save member
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet
        open={!!editMember}
        onOpenChange={(o) => {
          if (!o) {
            setEditMember(null)
            resetForm()
          }
        }}
      >
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit member</SheetTitle>
            <SheetDescription>Changes sync to Zustand immediately.</SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 gap-4 overflow-y-auto py-2">
            {memberFormFields}
          </div>
          <SheetFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setEditMember(null)}
            >
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={submitEdit}>
              Update member
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet
        open={!!viewMember}
        onOpenChange={(o) => !o && setViewMember(null)}
      >
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Member profile</SheetTitle>
            <SheetDescription>Read-only snapshot</SheetDescription>
          </SheetHeader>
          {viewMember ? (
            <div className="space-y-4 overflow-y-auto py-2 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Name</p>
                <p className="text-base font-semibold">{viewMember.name}</p>
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p>{viewMember.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p>{viewMember.email}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p>{planName(viewMember.planId)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trainer</p>
                  <p>{trainerName(viewMember.trainerId)}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Account</p>
                  <Badge variant={statusVariant[viewMember.status]} className="capitalize">
                    {viewMember.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Membership</p>
                  <Badge variant={lifecycleVariant[lifecycleFor(viewMember)]}>
                    {lifecycleLabel[lifecycleFor(viewMember)]}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p>{formatDateIN(viewMember.expiresAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Days left</p>
                  <p className="tabular-nums">
                    {daysUntilExpiry(viewMember.expiresAt) < 0
                      ? "Overdue"
                      : `${daysUntilExpiry(viewMember.expiresAt)}`}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          <SheetFooter className="flex-col gap-2 sm:flex-row">
            <Button
              className="w-full rounded-xl"
              onClick={() => {
                if (viewMember) renew(viewMember)
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Renew membership
            </Button>
            <Button
              className="w-full rounded-xl"
              variant="secondary"
              onClick={() => {
                if (viewMember) openEdit(viewMember)
                setViewMember(null)
              }}
            >
              Edit member
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete member?"
        description="This removes the member from the mock dataset. This action cannot be undone in this demo."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteMember(deleteTarget.id)
            toast.success("Member deleted")
          }
          setDeleteTarget(null)
        }}
      />

      <ConfirmDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title={`Delete ${selectedIds.length} members?`}
        description="Selected members will be removed from the workspace."
        confirmLabel="Delete all"
        variant="destructive"
        onConfirm={() => {
          deleteMembers(selectedIds)
          setSelected({})
          toast.success("Members deleted")
        }}
      />
    </div>
  )
}
