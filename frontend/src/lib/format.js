const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
})

const monthFormatter = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  year: 'numeric',
})

export function formatRupiah(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 'Rp 0'
  return `Rp ${rupiahFormatter.format(Math.round(amount))}`
}

const compactFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 2,
})

export function formatCompactRupiah(value) {
  const amount = Number(value) || 0
  const absolute = Math.abs(amount)

  if (absolute >= 1_000_000_000) {
    return `${compactFormatter.format(amount / 1_000_000_000)} M`
  }
  if (absolute >= 1_000_000) {
    return `${compactFormatter.format(amount / 1_000_000)} jt`
  }
  if (absolute >= 1_000) {
    return `${compactFormatter.format(amount / 1_000)} rb`
  }
  return rupiahFormatter.format(amount)
}

export function parseTransactionDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatTransactionDate(value) {
  const date = parseTransactionDate(value)
  return date ? dateFormatter.format(date) : 'Tanggal tidak tercatat'
}

export function formatTransactionTime(value) {
  const date = parseTransactionDate(value)
  return date ? timeFormatter.format(date) : null
}

export function formatMonthYear(value) {
  return monthFormatter.format(value)
}

export function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('8')) return `62${digits}`
  return digits
}

export function formatPhone(value) {
  const digits = normalizePhone(value)
  if (!digits) return ''
  if (!digits.startsWith('62')) return `+${digits}`

  const rest = digits.slice(2)
  if (rest.length < 9) return `+62 ${rest}`
  return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`
}

export function greetingForHour(hour = new Date().getHours()) {
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 19) return 'Selamat sore'
  return 'Selamat malam'
}
