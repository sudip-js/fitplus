import { useEffect, useMemo, useState } from "react"
import { format, formatISO, parseISO } from "date-fns"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { FormModal } from "@/components/common/form-modal"
import { ActionDropdown } from "@/components/common/action-dropdown"
import { EmptyState } from "@/components/layout/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useAttendanceStore } from "@/store/useAttendanceStore"
import { useMemberStore } from "@/store/useMemberStore"
import type { AttendanceRecord } from "@/types"
import { CalendarClock, LogIn, Users } from "lucide-react"

export function AttendancePage() {
  const records = useAttendanceStore((s) => s.records)
  const addRecord = useAttendanceStore((s) => s.addRecord)
  const updateRecord = useAttendanceStore((s) => s.updateRecord)
  const deleteRecord = useAttendanceStore((s) => s.deleteRecord)
  const members = useMemberStore((s) => s.members)

  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState<string | "all">("all")
  const [memberId, setMemberId] = useState(members[0]?.id ?? "")
  const [checkDate, setCheckDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )

  const [view, setView] = useState<AttendanceRecord | null>(null)
  const [editing, setEditing] = useState<AttendanceRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(
    null,
  )
  const [editOpen, setEditOpen] = useState(false)

  const [form, setForm] = useState({
    memberId: members[0]?.id ?? "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
  })

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 300)
    return () => window.clearTimeout(t)
  }, [])

  const memberName = useMemo(() => {
    const m = new Map(members.map((x) => [x.id, x.name]))
    return (id: string) => m.get(id) ?? id
  }, [members])

  const filtered = useMemo(() => {
    if (filterDate === "all") return [...records].sort((a, b) => b.date.localeCompare(a.date))
    return records
      .filter((r) => r.date === filterDate)
      .sort((a, b) => b.checkedInAt.localeCompare(a.checkedInAt))
  }, [records, filterDate])

  function checkIn() {
    if (!memberId) {
      toast.error("Select a member")
      return
    }
    const exists = records.some(
      (r) => r.memberId === memberId && r.date === checkDate,
    )
    if (exists) {
      toast.message("Already checked in for this date")
      return
    }
    addRecord({
      memberId,
      date: checkDate,
      checkedInAt: formatISO(new Date()),
    })
    toast.success("Check-in recorded")
  }

  function openEdit(r: AttendanceRecord) {
    setEditing(r)
    const d = new Date(r.checkedInAt)
    setForm({
      memberId: r.memberId,
      date: r.date,
      time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    })
    setEditOpen(true)
  }

  function saveEdit() {
    if (!editing) return
    const [hh, mm] = form.time.split(":").map(Number)
    const base = parseISO(`${form.date}T12:00:00`)
    base.setHours(hh || 0, mm || 0, 0, 0)
    updateRecord(editing.id, {
      memberId: form.memberId,
      date: form.date,
      checkedInAt: base.toISOString(),
    })
    toast.success("Attendance updated")
    setEditOpen(false)
    setEditing(null)
  }

  const columns: DataTableColumn<AttendanceRecord>[] = useMemo(
    () => [
      {
        id: "member",
        header: "Member",
        cell: (r) => (
          <span className="font-medium">{memberName(r.memberId)}</span>
        ),
      },
      {
        id: "date",
        header: "Date",
        cell: (r) => (
          <span className="text-muted-foreground">
            {format(parseISO(r.date), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        id: "time",
        header: "Checked in",
        className: "hidden sm:table-cell",
        cell: (r) => (
          <span className="text-muted-foreground">
            {format(parseISO(r.checkedInAt), "p")}
          </span>
        ),
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        className: "w-[72px] text-right",
        cell: (r) => (
          <ActionDropdown
            onView={() => setView(r)}
            onEdit={() => openEdit(r)}
            onDelete={() => setDeleteTarget(r)}
          />
        ),
      },
    ],
    [memberName],
  )

  const editFields = (
    <>
      <div className="space-y-2">
        <Label>Member</Label>
        <Select
          value={form.memberId}
          onValueChange={(id) => setForm((f) => ({ ...f, memberId: id }))}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue />
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
        <Label htmlFor="etime">Time</Label>
        <Input
          id="etime"
          type="time"
          className="rounded-xl"
          value={form.time}
          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
        />
      </div>
    </>
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Attendance"
        description="Check members in, audit visits, and correct mistakes."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-[var(--shadow-soft)] lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-primary" />
              Quick check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adate">Date</Label>
              <Input
                id="adate"
                type="date"
                value={checkDate}
                onChange={(e) => setCheckDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Member</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose member" />
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
            <Button className="w-full rounded-xl" onClick={checkIn}>
              <LogIn className="h-4 w-4" />
              Check in
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Label className="text-sm text-muted-foreground">Filter by date</Label>
            <Input
              type="date"
              className="max-w-[200px] rounded-xl"
              value={filterDate === "all" ? "" : filterDate}
              onChange={(e) => {
                const v = e.target.value
                setFilterDate(v || "all")
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setFilterDate("all")}
            >
              Show all
            </Button>
          </div>

          {filtered.length === 0 && !loading ? (
            <EmptyState
              icon={Users}
              title="No attendance rows"
              description="Try another date or record a check-in."
            />
          ) : (
            <DataTable
              loading={loading}
              columns={columns}
              data={filtered}
              getRowId={(r) => r.id}
              onRowClick={(r) => setView(r)}
            />
          )}
        </div>
      </div>

      <FormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit attendance"
        description="Adjust the member, date, or local check-in time."
        footer={
          <>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={saveEdit}>
              Save changes
            </Button>
          </>
        }
      >
        {editFields}
      </FormModal>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Visit details</SheetTitle>
            <SheetDescription>Read-only log</SheetDescription>
          </SheetHeader>
          {view ? (
            <div className="space-y-3 py-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Member</p>
                <p className="text-lg font-semibold">
                  {memberName(view.memberId)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p>{format(parseISO(view.date), "PPP")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p>{format(parseISO(view.checkedInAt), "p")}</p>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete attendance record?"
        description="Removes this visit from the mock log."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteRecord(deleteTarget.id)
            toast.success("Record deleted")
          }
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
