import { create } from "zustand"
import initialPlans from "@/data/mock-plans.json"
import type { Plan } from "@/types"

interface PlanState {
  plans: Plan[]
  upsertPlan: (plan: Omit<Plan, "id"> & { id?: string }) => void
  deletePlan: (id: string) => void
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `p-${Date.now()}`

export const usePlanStore = create<PlanState>((set) => ({
  plans: initialPlans as Plan[],
  upsertPlan: (input) =>
    set((s) => {
      const id = input.id ?? uid()
      const next: Plan = {
        id,
        name: input.name,
        price: input.price,
        currency: input.currency,
        durationMonths: input.durationMonths,
        features: input.features,
        popular: input.popular,
      }
      const idx = s.plans.findIndex((p) => p.id === id)
      if (idx === -1) return { plans: [...s.plans, next] }
      const copy = [...s.plans]
      copy[idx] = next
      return { plans: copy }
    }),
  deletePlan: (id) =>
    set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
}))
