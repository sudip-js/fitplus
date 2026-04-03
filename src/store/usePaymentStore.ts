import { create } from "zustand"
import initialPayments from "@/data/mock-payments.json"
import type { Payment, PaymentMethod, PaymentStatus } from "@/types"

interface PaymentState {
  payments: Payment[]
  addPayment: (input: {
    memberId: string
    amount: number
    date: string
    status: PaymentStatus
    method: PaymentMethod
  }) => void
  updatePayment: (
    id: string,
    patch: Partial<
      Pick<Payment, "memberId" | "amount" | "date" | "status" | "method">
    >,
  ) => void
  deletePayment: (id: string) => void
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `pay-${Date.now()}`

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: initialPayments as Payment[],
  addPayment: (input) =>
    set((s) => ({
      payments: [
        {
          id: uid(),
          memberId: input.memberId,
          amount: input.amount,
          currency: "INR",
          date: input.date,
          status: input.status,
          method: input.method,
        },
        ...s.payments,
      ],
    })),
  updatePayment: (id, patch) =>
    set((s) => ({
      payments: s.payments.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    })),
  deletePayment: (id) =>
    set((s) => ({ payments: s.payments.filter((p) => p.id !== id) })),
}))
