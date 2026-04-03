import type { Member, Payment } from "@/types"

export type MemberLifecycle = "active" | "expired" | "due" | "inactive"

export function daysUntilExpiry(expiresAtIso: string): number {
  const end = new Date(expiresAtIso)
  end.setHours(23, 59, 59, 999)
  const now = new Date()
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function memberHasDuePayment(
  memberId: string,
  payments: Payment[],
): boolean {
  return payments.some(
    (p) =>
      p.memberId === memberId &&
      (p.status === "pending" || p.status === "overdue"),
  )
}

export function getMemberLifecycle(
  m: Member,
  payments: Payment[],
): MemberLifecycle {
  if (m.status === "paused" || m.status === "churned") return "inactive"
  if (memberHasDuePayment(m.id, payments)) return "due"
  if (daysUntilExpiry(m.expiresAt) < 0) return "expired"
  return "active"
}

export function memberRowToneClass(
  m: Member,
  payments: Payment[],
): string | undefined {
  if (m.status === "paused" || m.status === "churned") {
    return "bg-muted/50 hover:bg-muted/60"
  }
  if (memberHasDuePayment(m.id, payments)) {
    return "bg-destructive/10 hover:bg-destructive/[0.14] dark:bg-destructive/15"
  }
  const d = daysUntilExpiry(m.expiresAt)
  if (d < 0) return "bg-red-500/8 hover:bg-red-500/12"
  if (d >= 0 && d <= 14) return "bg-amber-500/12 hover:bg-amber-500/16"
  return undefined
}
