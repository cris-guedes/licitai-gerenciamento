import { differenceInDays, differenceInMonths, differenceInYears, parseISO, isValid, addYears } from "date-fns"

const MAX_YEARS = 50 // dates beyond 50 years are considered invalid PNCP data

function toDate(value?: string | Date | null): Date | null {
  if (!value) return null
  try {
    const date = value instanceof Date ? value : typeof value === "string" ? parseISO(value) : new Date(value as any)
    return isValid(date) ? date : null
  } catch {
    return null
  }
}

function isWithinRange(date: Date): boolean {
  return date < addYears(new Date(), MAX_YEARS)
}

/**
 * Returns the number of days until the given date, or null if past or too far.
 */
export function daysUntil(str?: string | Date | null): number | null {
  const date = toDate(str)
  if (!date || !isWithinRange(date)) return null
  const days = differenceInDays(date, new Date())
  return days > 0 ? days : null
}

/**
 * Formats a future date as a human-readable deadline string.
 * Returns null for dates in the past or unrealistically far in the future (> 50 years).
 */
export function formatDeadline(str?: string | Date | null): string | null {
  const date = toDate(str)
  if (!date || !isWithinRange(date)) return null

  const now  = new Date()
  const days = differenceInDays(date, now)

  if (days <= 0)  return null
  if (days === 1) return "1 dia"
  if (days < 60)  return `${days}d`

  const years  = differenceInYears(date, now)
  const months = differenceInMonths(date, now) % 12

  if (years > 0 && months > 0) return `${years}a ${months}m`
  if (years > 0)               return `${years} ano${years > 1 ? "s" : ""}`
  return `${months} ${months === 1 ? "mês" : "meses"}`
}
