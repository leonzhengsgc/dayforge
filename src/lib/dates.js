export function getToday() {
  const now = new Date()
  return formatDateISO(now)
}

export function getTomorrow() {
  const now = new Date()
  now.setDate(now.getDate() + 1)
  return formatDateISO(now)
}

export function formatDateISO(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function getMonthRange(year, month) {
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end, lastDay }
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay()
}

export function isDateBefore(a, b) {
  return a < b
}

export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + n)
  return formatDateISO(date)
}

export function addMonths(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setMonth(date.getMonth() + n)
  return formatDateISO(date)
}

// Next scheduled date for a recurring task, anchored from today so we
// never create instances in the past even if the previous one was rolled
// over for many days.
export function nextRecurrenceDate(recurrence, from = getToday()) {
  if (recurrence === 'daily') return addDays(from, 1)
  if (recurrence === 'weekly') return addDays(from, 7)
  if (recurrence === 'monthly') return addMonths(from, 1)
  return null
}
