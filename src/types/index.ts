export type MemberStatus = "active" | "paused" | "expiring" | "churned"

export interface Member {
  id: string
  name: string
  phone: string
  email: string
  planId: string
  status: MemberStatus
  joinDate: string
  /** Empty string when unassigned */
  trainerId: string
  expiresAt: string
}

export interface Plan {
  id: string
  name: string
  price: number
  currency: string
  durationMonths: number
  features: string[]
  popular: boolean
}

export type PaymentStatus = "paid" | "pending" | "overdue"
export type PaymentMethod = "cash" | "upi" | "card"

export interface Payment {
  id: string
  memberId: string
  amount: number
  currency: string
  date: string
  status: PaymentStatus
  method: PaymentMethod
}

export interface ActivityItem {
  id: string
  type: string
  message: string
  at: string
}

export type TrainerStatus = "active" | "inactive"

export interface Trainer {
  id: string
  name: string
  phone: string
  specialty: string
  status: TrainerStatus
}

export interface AttendanceRecord {
  id: string
  memberId: string
  date: string
  checkedInAt: string
}

export type ExpenseCategory =
  | "rent"
  | "electricity"
  | "staff_salary"
  | "equipment"
  | "maintenance"
  | "miscellaneous"

export interface Expense {
  id: string
  title: string
  amount: number
  category: ExpenseCategory
  date: string
  notes?: string
}

/** Admin: full CRM. Trainer: floor operations only (frontend gate). */
export type AppRole = "admin" | "trainer"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: AppRole
  avatarUrl?: string
}
