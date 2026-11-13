import { SummaryCard } from './SummaryCard'

function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-line bg-surface p-5 sm:p-6 ${className}`}
    >
      <div className="h-4 w-24 rounded bg-line" />
      <div className="mt-4 h-8 w-40 rounded bg-line" />
      <div className="mt-6 h-3 w-full rounded bg-line" />
    </div>
  )
}

export function SummaryCards({ summary, periodLabel, loading }) {
  if (loading) {
    return (
      <section aria-labelledby="summary-heading" aria-busy="true">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="summary-heading" className="text-sm font-semibold text-ink">
            Ringkasan
          </h2>
          <p className="text-xs text-muted">Periode: {periodLabel}</p>
        </div>
        <p className="sr-only">Memuat ringkasan keuangan.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          <SkeletonCard className="sm:col-span-2 lg:col-span-6" />
          <SkeletonCard className="lg:col-span-3" />
          <SkeletonCard className="lg:col-span-3" />
        </div>
      </section>
    )
  }

  const income = summary?.total_income ?? 0
  const expense = summary?.total_expense ?? 0
  const balance = summary?.balance ?? 0

  return (
    <section aria-labelledby="summary-heading">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="summary-heading" className="text-sm font-semibold text-ink">
          Ringkasan
        </h2>
        <p className="text-xs text-muted">Periode: {periodLabel}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
        <SummaryCard
          tone="balance"
          label="Sisa saldo"
          amount={balance}
          hint="Pemasukan dikurangi pengeluaran periode ini."
          featured
          className="sm:col-span-2 lg:col-span-6"
        />
        <SummaryCard
          tone="income"
          label="Total pemasukan"
          amount={income}
          hint="Uang masuk pada periode ini."
          className="lg:col-span-3"
        />
        <SummaryCard
          tone="expense"
          label="Total pengeluaran"
          amount={expense}
          hint="Uang keluar pada periode ini."
          className="lg:col-span-3"
        />
      </div>
    </section>
  )
}
