import { create } from "zustand"
import initial from "@/data/mock-trainers.json"
import type { Trainer } from "@/types"
import { useMemberStore } from "@/store/useMemberStore"

interface TrainerState {
  trainers: Trainer[]
  addTrainer: (input: Omit<Trainer, "id">) => void
  updateTrainer: (id: string, patch: Partial<Omit<Trainer, "id">>) => void
  deleteTrainer: (id: string) => void
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `t-${Date.now()}`

export const useTrainerStore = create<TrainerState>((set, get) => ({
  trainers: initial as Trainer[],
  addTrainer: (input) => {
    const trainer: Trainer = { ...input, id: uid() }
    set((s) => ({ trainers: [...s.trainers, trainer] }))
  },
  updateTrainer: (id, patch) =>
    set((s) => ({
      trainers: s.trainers.map((t) =>
        t.id === id ? { ...t, ...patch } : t,
      ),
    })),
  deleteTrainer: (id) => {
    const remaining = get().trainers.filter((t) => t.id !== id)
    const fallback =
      remaining.find((t) => t.status === "active")?.id ?? ""
    useMemberStore.getState().reassignMembersFromTrainer(id, fallback)
    set({ trainers: remaining })
  },
}))
