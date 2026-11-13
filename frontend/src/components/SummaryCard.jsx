import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'
import { formatRupiah } from '../lib/format'

const TONES = {
  balance: {
    card: 'border-balance-ink/15 bg-balance-bg text-balance-ink',
    badge: 'bg-white/55 dark:bg-black/25',
    hint: 'text-balance-ink',
  },
  income: {
    card: 'border-income-ink/15 bg-income-bg text-income-ink',
    badge: 'bg-white/55 dark:bg-black/25',
    hint: 'text-income-ink',
  },
  expense: {
    card: 'border-expense-ink/15 bg-expense-bg text-expense-ink',
    badge: 'bg-white/55 dark:bg-black/25',
    hint: 'text-expense-ink',
  },
}

const ICONS = {
  balance: Wallet,
  income: ArrowDownLeft,
  expense: ArrowUpRight,
}

export function SummaryCard({
  tone,
  label,
  amount,
  hint,
  featured = false,
  className = '',
}) {
  const styles = TONES[tone]
  const Icon = ICONS[tone]

  return (
    <article
      className={`flex flex-col rounded-2xl border p-5 sm:p-6 ${styles.card} ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold">{label}</p>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.badge}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p
        className={`mt-3 mb-5 whitespace-nowrap font-bold tracking-tight tabular-nums ${
          featured ? 'text-3xl sm:text-4xl lg:text-[2.75rem]' : 'text-2xl sm:text-3xl'
        }`}
      >
        {formatRupiah(amount)}
      </p>
      <p className={`mt-auto text-xs leading-relaxed ${styles.hint}`}>{hint}</p>
    </article>
  )
}
