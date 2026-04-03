import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ActionDropdown } from "@/components/common/action-dropdown"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FormModal } from "@/components/common/form-modal"
import { EmptyState } from "@/components/layout/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlanStore } from "@/store/usePlanStore"
import type { Plan } from "@/types"
import { formatINR } from "@/utils/locale-in"
import { Check, Plus, Sparkles } from "lucide-react"

function durationLabel(months: number) {
  if (months === 1) return "Monthly"
  if (months === 3) return "Quarterly"
  if (months === 12) return "Yearly"
  if (months === 6) return "Semi-annual"
  return `Every ${months} months`
}

export function PlansPage() {
  const { plans, upsertPlan, deletePlan } = usePlanStore()
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Plan | null>(null)
  const [view, setView] = useState<Plan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null)
  const [form, setForm] = useState({
    name: "",
    price: "",
    durationMonths: "1",
    features: "",
    popular: false,
  })

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 300)
    return () => window.clearTimeout(t)
  }, [])

  function openNew() {
    setEditing(null)
    setForm({
      name: "",
      price: "",
      durationMonths: "1",
      features: "",
      popular: false,
    })
    setOpen(true)
  }

  function openEdit(p: Plan) {
    setEditing(p)
    setForm({
      name: p.name,
      price: String(p.price),
      durationMonths: String(p.durationMonths),
      features: p.features.join(", "),
      popular: p.popular,
    })
    setOpen(true)
  }

  function save() {
    const price = Number(form.price)
    const duration = Number(form.durationMonths)
    if (!form.name || !Number.isFinite(price) || !Number.isFinite(duration)) {
      toast.error("Check plan details")
      return
    }
    upsertPlan({
      id: editing?.id,
      name: form.name,
      price,
      currency: "INR",
      durationMonths: duration,
      features: form.features
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      popular: form.popular,
    })
    toast.success(editing ? "Plan updated" : "Plan created")
    setOpen(false)
  }

  const formFields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="pname">Name</Label>
        <Input
          id="pname"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-xl"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pprice">Price (INR)</Label>
          <Input
            id="pprice"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm((f) => ({ ...f, price: e.target.value }))
            }
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pdur">Duration (months)</Label>
          <Input
            id="pdur"
            type="number"
            value={form.durationMonths}
            onChange={(e) =>
              setForm((f) => ({ ...f, durationMonths: e.target.value }))
            }
            className="rounded-xl"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pfeat">Features (comma-separated)</Label>
        <Input
          id="pfeat"
          value={form.features}
          onChange={(e) =>
            setForm((f) => ({ ...f, features: e.target.value }))
          }
          className="rounded-xl"
          placeholder="Locker, Classes, …"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.popular}
          onChange={(e) =>
            setForm((f) => ({ ...f, popular: e.target.checked }))
          }
          className="h-4 w-4 rounded border-input"
        />
        Mark as popular
      </label>
    </>
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Membership plans"
        description="Card-based pricing with quick actions and highlighted popular tiers."
        actions={
          <Button className="rounded-xl" onClick={openNew}>
            <Plus className="h-4 w-4" />
            New plan
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[340px] w-full rounded-2xl" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No plans yet"
          description="Create your first membership tier."
          action={
            <Button className="rounded-xl" onClick={openNew}>
              <Plus className="h-4 w-4" />
              Create plan
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => setView(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setView(p)
                }
              }}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-all duration-200 hover:z-10 hover:scale-[1.02] hover:shadow-[var(--shadow-soft-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                p.popular
                  ? "ring-1 ring-primary/30"
                  : ""
              }`}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-4">
                <div className="min-w-0 space-y-2 pr-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl font-semibold leading-tight">
                      {p.name}
                    </CardTitle>
                    {p.popular ? (
                      <Badge className="shrink-0">Popular</Badge>
                    ) : (
                      <Badge variant="secondary" className="shrink-0 font-normal">
                        Standard
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {durationLabel(p.durationMonths)}
                  </p>
                </div>
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <ActionDropdown
                    align="end"
                    onView={() => setView(p)}
                    onEdit={() => openEdit(p)}
                    onDelete={() => setDeleteTarget(p)}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 pb-4 pt-0">
                <div>
                  <p className="text-4xl font-bold tracking-tight tabular-nums">
                    {formatINR(p.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    per billing period · {p.durationMonths} month
                    {p.durationMonths === 1 ? "" : "s"}
                  </p>
                </div>
                {p.features.length > 0 ? (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {p.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex gap-2 leading-snug">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {p.features.length > 5 ? (
                      <li className="pl-6 text-xs">
                        +{p.features.length - 5} more
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No features listed
                  </p>
                )}
              </CardContent>
              <CardFooter className="border-t border-border/80 bg-muted/20 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  {p.currency} · Tap card to view details
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <FormModal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit plan" : "Create plan"}
        description="Mock-only persistence — swap for API later."
        footer={
          <>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={save}>
              Save plan
            </Button>
          </>
        }
      >
        {formFields}
      </FormModal>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{view?.name}</SheetTitle>
            <SheetDescription>Plan overview</SheetDescription>
          </SheetHeader>
          {view ? (
            <div className="space-y-4 overflow-y-auto py-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-3xl font-semibold">{formatINR(view.price)}</p>
                <Badge variant="outline">{view.currency}</Badge>
                {view.popular ? <Badge>Popular</Badge> : (
                  <Badge variant="secondary">Standard</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{durationLabel(view.durationMonths)}</p>
              <Separator />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Included perks
              </p>
              <ul className="space-y-2">
                {view.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete membership plan?"
        description="Members on this plan are not auto-migrated in this demo—double-check before deleting."
        confirmLabel="Delete plan"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deletePlan(deleteTarget.id)
            toast.success("Plan deleted")
          }
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
