import { format, parseISO } from "date-fns"

/** Indian numbering: ₹1,00,000 */
export function formatINR(amount: number, opts?: { paise?: boolean }) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: opts?.paise ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatINRCompact(amount: number) {
  if (amount >= 10000000)
    return `₹${(amount / 10000000).toFixed(1).replace(/\.0$/, "")} Cr`
  if (amount >= 100000)
    return `₹${(amount / 100000).toFixed(1).replace(/\.0$/, "")} L`
  if (amount >= 1000)
    return `₹${(amount / 1000).toFixed(1).replace(/\.0$/, "")} K`
  return formatINR(amount)
}

/** Display as DD/MM/YYYY */
export function formatDateIN(isoDate: string) {
  try {
    return format(parseISO(isoDate), "dd/MM/yyyy")
  } catch {
    return isoDate
  }
}

export function formatDateTimeIN(iso: string) {
  try {
    return format(parseISO(iso), "dd/MM/yyyy, hh:mm a")
  } catch {
    return iso
  }
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}
