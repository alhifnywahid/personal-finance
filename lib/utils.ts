import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string | { toDate: () => Date } | null | undefined): string {
  if (!date) return "Tidak ada"

  let dateObj: Date

  // Handle Firestore Timestamp objects which have a toDate() method
  if (typeof date === "object" && "toDate" in date && typeof date.toDate === "function") {
    dateObj = date.toDate()
  } else if (typeof date === "string") {
    dateObj = new Date(date)
  } else {
    dateObj = date as Date
  }

  return format(dateObj, "d MMMM yyyy", { locale: id })
}
