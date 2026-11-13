import { LogOut, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPhone, greetingForHour } from '../lib/format'
import { PeriodFilter } from './PeriodFilter'
import { ThemeToggle } from './ThemeToggle'

export function AppHeader({ user, period, onPeriodChange, onLogout }) {
  const name = user?.name?.trim() || 'Pengguna'
  const phone = formatPhone(user?.phone_number)
  const greeting = greetingForHour()

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            to="/"
            aria-label="Catat Uang, kembali ke dashboard"
            className="flex min-h-11 items-center gap-2.5 rounded-lg"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-accent-ink">
              <Wallet className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-bold tracking-tight text-ink">Catat Uang</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={onLogout}
              aria-label="Keluar dari akun"
              title="Keluar"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-muted transition-colors hover:border-line-strong hover:text-ink sm:px-4"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted">{greeting}</p>
            <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {name}
            </h1>
            <p className="mt-1 text-sm text-muted">
              WhatsApp: <span className="tabular-nums text-ink/80">{phone}</span>
            </p>
          </div>

          <div className="lg:text-right">
            <p className="mb-2 text-xs font-medium text-muted">Periode</p>
            <PeriodFilter value={period} onChange={onPeriodChange} />
          </div>
        </div>
      </div>
    </header>
  )
}
