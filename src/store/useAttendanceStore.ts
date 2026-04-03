import { create } from "zustand"
import initial from "@/data/mock-attendance.json"
import type { AttendanceRecord } from "@/types"

interface AttendanceState {
  records: AttendanceRecord[]
  addRecord: (input: Omit<AttendanceRecord, "id">) => AttendanceRecord
  updateRecord: (
    id: string,
    patch: Partial<Omit<AttendanceRecord, "id">>,
  ) => void
  deleteRecord: (id: string) => void
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `att-${Date.now()}`

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: initial as AttendanceRecord[],
  addRecord: (input) => {
    const rec: AttendanceRecord = { ...input, id: uid() }
    set((s) => ({ records: [rec, ...s.records] }))
    return rec
  },
  updateRecord: (id, patch) =>
    set((s) => ({
      records: s.records.map((r) =>
        r.id === id ? { ...r, ...patch } : r,
      ),
    })),
  deleteRecord: (id) =>
    set((s) => ({ records: s.records.filter((r) => r.id !== id) })),
}))
