import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { TRAINER_SPECIALTIES } from "@/data/constants"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { FormModal } from "@/components/common/form-modal"
import { ActionDropdown } from "@/components/common/action-dropdown"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMemberStore } from "@/store/useMemberStore"
import { useTrainerStore } from "@/store/useTrainerStore"
import type { Trainer, TrainerStatus } from "@/types"
import { Dumbbell, Plus, Users } from "lucide-react"

export function TrainersPage() {
  const trainers = useTrainerStore((s) => s.trainers)
  const addTrainer = useTrainerStore((s) => s.addTrainer)
  const updateTrainer = useTrainerStore((s) => s.updateTrainer)
  const deleteTrainer = useTrainerStore((s) => s.deleteTrainer)
  const members = useMemberStore((s) => s.members)
  const setTrainerAssignments = useMemberStore((s) => s.setTrainerAssignments)

  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Trainer | null>(null)
  const [view, setView] = useState<Trainer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Trainer | null>(null)
  const [assignTrainer, setAssignTrainer] = useState<Trainer | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<Record<string, boolean>>(
    {},
  )

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialty: TRAINER_SPECIALTIES[0],
    status: "active" as TrainerStatus,
  })

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 300)
    return () => window.clearTimeout(t)
  }, [])

  const assignedCount = useMemo(() => {
    const map = new Map<string, number>()
    trainers.forEach((tr) => map.set(tr.id, 0))
    members.forEach((m) => {
      if (m.trainerId) {
        map.set(m.trainerId, (map.get(m.trainerId) ?? 0) + 1)
      }
    })
    return map
  }, [members, trainers])

  const assignedMembers = useMemo(() => {
    if (!view) return []
    return members.filter((m) => m.trainerId === view.id)
  }, [members, view])

  function openCreate() {
    setEditing(null)
    setForm({
      name: "",
      phone: "",
      specialty: TRAINER_SPECIALTIES[0],
      status: "active",
    })
    setModalOpen(true)
  }

  function openEdit(t: Trainer) {
    setEditing(t)
    setForm({
      name: t.name,
      phone: t.phone,
      specialty: t.specialty,
      status: t.status,
    })
    setModalOpen(true)
  }

  function saveTrainer() {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required")
      return
    }
    if (editing) {
      updateTrainer(editing.id, {
        name: form.name,
        phone: form.phone,
        specialty: form.specialty,
        status: form.status,
      })
      toast.success("Trainer updated")
    } else {
      addTrainer({
        name: form.name,
        phone: form.phone,
        specialty: form.specialty,
        status: form.status,
      })
      toast.success("Trainer added")
    }
    setModalOpen(false)
  }

  function openAssign(t: Trainer) {
    setAssignTrainer(t)
    const next: Record<string, boolean> = {}
    members.forEach((m) => {
      if (m.trainerId === t.id) next[m.id] = true
    })
    setSelectedMembers(next)
  }

  function saveAssignments() {
    if (!assignTrainer) return
    const ids = Object.keys(selectedMembers).filter((id) => selectedMembers[id])
    setTrainerAssignments(assignTrainer.id, ids)
    toast.success("Assignments updated")
    setAssignTrainer(null)
  }

  const specialtyBadge = (s: string) => (
    <Badge variant="secondary" className="font-normal">
      {s}
    </Badge>
  )

  const statusBadge = (s: TrainerStatus) =>
    s === "active" ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="outline">Inactive</Badge>
    )

  const columns: DataTableColumn<Trainer>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        cell: (t) => <span className="font-medium">{t.name}</span>,
      },
      {
        id: "phone",
        header: "Phone",
        className: "hidden sm:table-cell",
        cell: (t) => (
          <span className="text-muted-foreground">{t.phone}</span>
        ),
      },
      {
        id: "specialty",
        header: "Specialty",
        cell: (t) => specialtyBadge(t.specialty),
      },
      {
        id: "members",
        header: "Members",
        className: "hidden md:table-cell",
        cell: (t) => (
          <span className="tabular-nums text-muted-foreground">
            {assignedCount.get(t.id) ?? 0}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (t) => statusBadge(t.status),
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        className: "min-w-[148px] text-right",
        cell: (t) => (
          <ActionDropdown
            onView={() => setView(t)}
            onEdit={() => openEdit(t)}
            onDelete={() => setDeleteTarget(t)}
            extra={
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-9 rounded-xl px-3"
                onClick={(e) => {
                  e.stopPropagation()
                  openAssign(t)
                }}
              >
                Assign
              </Button>
            }
          />
        ),
      },
    ],
    [assignedCount],
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trainers"
        description="Staff roster with assignments, specialties, and lifecycle tools."
        actions={
          <Button className="rounded-xl" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add trainer
          </Button>
        }
      />

      <DataTable
        loading={loading}
        columns={columns}
        data={trainers}
        getRowId={(t) => t.id}
        onRowClick={(t) => setView(t)}
        emptyState={{
          icon: Users,
          title: "No trainers",
          description: "Add coaches to start assigning members.",
          action: (
            <Button className="rounded-xl" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add trainer
            </Button>
          ),
        }}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit trainer" : "Add trainer"}
        description="Local mock data — sync fields to your HR system later."
        footer={
          <>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={saveTrainer}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="tname">Name</Label>
          <Input
            id="tname"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tphone">Phone</Label>
          <Input
            id="tphone"
            value={form.phone}
            onChange={(e) =>
              setForm((f) => ({ ...f, phone: e.target.value }))
            }
            className="rounded-xl"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Specialty</Label>
            <Select
              value={form.specialty}
              onValueChange={(specialty) =>
                setForm((f) => ({ ...f, specialty }))
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-64">
                {TRAINER_SPECIALTIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, status: v as TrainerStatus }))
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormModal>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              {view?.name}
            </SheetTitle>
            <SheetDescription>Trainer profile</SheetDescription>
          </SheetHeader>
          {view ? (
            <div className="flex flex-1 flex-col gap-4 overflow-hidden py-2">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{view.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  {statusBadge(view.status)}
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Specialty</p>
                  {specialtyBadge(view.specialty)}
                </div>
              </div>
              <Separator />
              <div className="min-h-0 flex flex-1 flex-col gap-2">
                <p className="text-sm font-medium">
                  Assigned members ({assignedMembers.length})
                </p>
                <ScrollArea className="h-56 rounded-xl border border-border">
                  <ul className="space-y-1 p-3 text-sm">
                    {assignedMembers.length === 0 ? (
                      <li className="text-muted-foreground">
                        No members yet — use Assign from the table.
                      </li>
                    ) : (
                      assignedMembers.map((m) => (
                        <li
                          key={m.id}
                          className="rounded-lg bg-muted/40 px-3 py-2"
                        >
                          {m.name}
                        </li>
                      ))
                    )}
                  </ul>
                </ScrollArea>
              </div>
              <Button
                className="rounded-xl"
                variant="secondary"
                onClick={() => {
                  const t = view
                  setView(null)
                  if (t) openAssign(t)
                }}
              >
                Manage assignments
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!assignTrainer}
        onOpenChange={(o) => !o && setAssignTrainer(null)}
      >
        <DialogContent className="max-h-[90dvh] overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign members</DialogTitle>
            <DialogDescription>
              {assignTrainer
                ? `Select members for ${assignTrainer.name}. Existing assignments to this trainer are pre-selected.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-72 rounded-xl border border-border">
            <div className="space-y-2 p-3">
              {members.map((m) => (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={!!selectedMembers[m.id]}
                    onCheckedChange={(v) =>
                      setSelectedMembers((s) => ({
                        ...s,
                        [m.id]: v === true,
                      }))
                    }
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setAssignTrainer(null)}
            >
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={saveAssignments}>
              Save assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove trainer?"
        description="Members will be reassigned to the next available active coach or left unassigned in this demo."
        confirmLabel="Delete trainer"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteTrainer(deleteTarget.id)
            toast.success("Trainer removed")
          }
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
