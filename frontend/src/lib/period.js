import {
  formatMonthYear,
  formatTransactionDate,
  parseTransactionDate,
} from './format'

export const PERIODS = [
  { id: 'this-month', label: 'Bulan Ini' },
  { id: 'last-month', label: 'Bulan Lalu' },
  { id: 'all', label: 'Semua Waktu' },
]

const dayFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric' })
const monthShortFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' })

export function getPeriodMeta(periodId, now = new Date()) {
  const year = now.getFullYear()
  const month = now.getMonth()

  if (periodId === 'last-month') {
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
    const end = new Date(year, month, 0, 23, 59, 59, 999)
    return {
      id: periodId,
      label: 'Bulan Lalu',
      range: { start, end },
      chartCaption: `Arus kas harian, ${formatMonthYear(start)}`,
    }
  }

  if (periodId === 'all') {
    return {
      id: periodId,
      label: 'Semua Waktu',
      range: null,
      chartCaption: 'Arus kas bulanan, 12 bulan terakhir',
    }
  }

  return {
    id: 'this-month',
    label: 'Bulan Ini',
    range: {
      start: new Date(year, month, 1, 0, 0, 0, 0),
      end: now,
    },
    chartCaption: `Arus kas harian, ${formatMonthYear(now)}`,
  }
}

export function filterTransactionsByPeriod(transactions, periodId, now = new Date()) {
  const { range } = getPeriodMeta(periodId, now)
  if (!range) return transactions

  return transactions.filter((transaction) => {
    const date = parseTransactionDate(transaction.created_at)
    if (!date) return false
    return date >= range.start && date <= range.end
  })
}

export function summarize(transactions) {
  return transactions.reduce(
    (totals, transaction) => {
      const amount = Number(transaction.amount) || 0
      if (transaction.type === 'income') {
        totals.total_income += amount
      } else if (transaction.type === 'expense') {
        totals.total_expense += amount
      }
      return totals
    },
    { total_income: 0, total_expense: 0 },
  )
}

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function monthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function emptyPoint(key, date, label, fullLabel) {
  return { key, date, label, fullLabel, income: 0, expense: 0 }
}

export function buildChartSeries(transactions, periodId, now = new Date()) {
  const { range } = getPeriodMeta(periodId, now)
  const points = []
  const index = new Map()

  if (!range) {
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    for (let offset = 0; offset < 12; offset += 1) {
      const date = new Date(start.getFullYear(), start.getMonth() + offset, 1)
      const key = monthKey(date)
      const label = `${monthShortFormatter.format(date)} ${String(date.getFullYear()).slice(2)}`
      const point = emptyPoint(key, date, label, formatMonthYear(date))
      points.push(point)
      index.set(key, point)
    }
  } else {
    const cursor = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate())
    const last = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate())

    while (cursor <= last) {
      const key = dayKey(cursor)
      const date = new Date(cursor)
      const point = emptyPoint(key, date, dayFormatter.format(date), formatTransactionDate(date))
      points.push(point)
      index.set(key, point)
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  transactions.forEach((transaction) => {
    const date = parseTransactionDate(transaction.created_at)
    if (!date) return
    const point = index.get(range ? dayKey(date) : monthKey(date))
    if (!point) return

    const amount = Number(transaction.amount) || 0
    if (transaction.type === 'income') point.income += amount
    if (transaction.type === 'expense') point.expense += amount
  })

  return points
}
