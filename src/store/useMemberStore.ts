import { create } from "zustand"
import initialMembers from "@/data/mock-members.json"
import { daysUntilExpiry, memberHasDuePayment } from "@/utils/member-insights"
import type { Member, MemberStatus } from "@/types"
import { usePaymentStore } from "@/store/usePaymentStore"

export type MemberInsightFilter = "all" | "expiring_soon" | "due_payment"

interface MemberState {
  members: Member[]
  search: string
  statusFilter: MemberStatus | "all"
  insightFilter: MemberInsightFilter
  setSearch: (q: string) => void
  setStatusFilter: (s: MemberStatus | "all") => void
  setInsightFilter: (f: MemberInsightFilter) => void
  addMember: (
    input: Omit<Member, "id" | "status" | "trainerId" | "expiresAt"> & {
      trainerId?: string
      status?: MemberStatus
    },
  ) => void
  updateMember: (id: string, patch: Partial<Member>) => void
  deleteMember: (id: string) => void
  deleteMembers: (ids: string[]) => void
  assignTrainer: (memberId: string, trainerId: string) => void
  /** Sets trainer for all selected members; clears this trainer from members not in the set */
  setTrainerAssignments: (trainerId: string, selectedMemberIds: string[]) => void
  reassignMembersFromTrainer: (fromTrainerId: string, toTrainerId: string) => void
  /** Extend membership from current (or today) expiry by plan duration */
  renewMembership: (memberId: string) => void
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `m-${Date.now()}`

export const useMemberStore = create<MemberState>((set, get) => ({
  members: initialMembers as Member[],
  search: "",
  statusFilter: "all",
  insightFilter: "all",
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setInsightFilter: (insightFilter) => set({ insightFilter }),
  addMember: (input) => {
    const planMonths =
      input.planId === "p1" ? 1 : input.planId === "p2" ? 3 : 12
    const start = new Date(input.joinDate)
    const expires = new Date(start)
    expires.setMonth(expires.getMonth() + planMonths)
    const member: Member = {
      id: uid(),
      name: input.name,
      phone: input.phone,
      email: input.email,
      planId: input.planId,
      status: input.status ?? "active",
      joinDate: input.joinDate,
      trainerId:
        input.trainerId !== undefined ? input.trainerId : "t1",
      expiresAt: expires.toISOString().slice(0, 10),
    }
    set((s) => ({ members: [member, ...s.members] }))
  },
  updateMember: (id, patch) =>
    set((s) => ({
      members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  deleteMember: (id) =>
    set((s) => ({ members: s.members.filter((m) => m.id !== id) })),
  deleteMembers: (ids) =>
    set((s) => ({
      members: s.members.filter((m) => !ids.includes(m.id)),
    })),
  assignTrainer: (memberId, trainerId) => {
    get().updateMember(memberId, { trainerId })
  },
  setTrainerAssignments: (trainerId, selectedMemberIds) =>
    set((s) => ({
      members: s.members.map((m) => {
        if (selectedMemberIds.includes(m.id)) {
          return { ...m, trainerId }
        }
        if (m.trainerId === trainerId) {
          return { ...m, trainerId: "" }
        }
        return m
      }),
    })),
  reassignMembersFromTrainer: (fromTrainerId, toTrainerId) =>
    set((s) => ({
      members: s.members.map((m) =>
        m.trainerId === fromTrainerId
          ? { ...m, trainerId: toTrainerId }
          : m,
      ),
    })),
  renewMembership: (memberId) => {
    const m = get().members.find((x) => x.id === memberId)
    if (!m) return
    const planMonths =
      m.planId === "p1" ? 1 : m.planId === "p2" ? 3 : 12
    const expiry = new Date(m.expiresAt)
    const now = new Date()
    const start = expiry > now ? expiry : now
    start.setHours(12, 0, 0, 0)
    start.setMonth(start.getMonth() + planMonths)
    get().updateMember(memberId, {
      expiresAt: start.toISOString().slice(0, 10),
      status: "active",
    })
  },
}))

export function useFilteredMembers() {
  const { members, search, statusFilter, insightFilter } = useMemberStore()
  const payments = usePaymentStore((s) => s.payments)
  const q = search.trim().toLowerCase()
  return members.filter((m) => {
    const okStatus = statusFilter === "all" || m.status === statusFilter
    const okSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.email.toLowerCase().includes(q)
    if (!okStatus || !okSearch) return false
    if (insightFilter === "all") return true
    if (insightFilter === "expiring_soon") {
      const d = daysUntilExpiry(m.expiresAt)
      return d >= 0 && d <= 30
    }
    if (insightFilter === "due_payment") {
      return memberHasDuePayment(m.id, payments)
    }
    return true
  })
}
