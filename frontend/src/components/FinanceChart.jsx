import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartNoAxesColumn } from 'lucide-react'
import { formatCompactRupiah, formatRupiah } from '../lib/format'
import { EmptyState } from './EmptyState'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload

  return (
    <div className="rounded-xl border border-line bg-surface-strong px-3 py-2.5 shadow-sm">
      <p className="text-xs font-semibold text-muted">{point.fullLabel}</p>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-muted">Pemasukan</span>
          <span className="font-semibold tabular-nums text-income-ink">
            {formatRupiah(point.income)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-muted">Pengeluaran</span>
          <span className="font-semibold tabular-nums text-expense-ink">
            {formatRupiah(point.expense)}
          </span>
        </div>
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="px-5 pb-6 sm:px-6" aria-hidden="true">
      <div className="h-[300px] animate-pulse rounded-xl bg-paper" />
    </div>
  )
}

export function FinanceChart({ series, caption, loading }) {
  const hasValues = series.some((point) => point.income > 0 || point.expense > 0)
  const totalIncome = series.reduce((total, point) => total + point.income, 0)
  const totalExpense = series.reduce((total, point) => total + point.expense, 0)

  return (
    <section
      aria-labelledby="chart-heading"
      className="rounded-2xl border border-line bg-surface"
    >
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <h2 id="chart-heading" className="text-base font-semibold text-ink">
            Arus kas
          </h2>
          <p className="mt-0.5 text-sm text-muted">{caption}</p>
        </div>
        {!loading ? (
          <div className="flex items-center gap-4 text-xs font-medium text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-income-ink" aria-hidden="true" />
              Pemasukan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-expense-ink" aria-hidden="true" />
              Pengeluaran
            </span>
          </div>
        ) : null}
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : !hasValues ? (
        <EmptyState
          icon={ChartNoAxesColumn}
          title="Belum ada data untuk grafik"
          description="Grafik akan muncul setelah ada transaksi pada periode ini."
        />
      ) : (
        <>
          <p className="sr-only">
            Grafik arus kas. Total pemasukan {formatRupiah(totalIncome)} dan total
            pengeluaran {formatRupiah(totalExpense)}.
          </p>
          <div className="px-2 pb-5 sm:px-4" aria-hidden="true">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={series}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--chart-grid)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                  interval="preserveStartEnd"
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                />
                <YAxis
                  width={64}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompactRupiah}
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'var(--line-strong)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Pemasukan"
                  stroke="var(--income-ink)"
                  fill="var(--income-ink)"
                  fillOpacity={0.16}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Pengeluaran"
                  stroke="var(--expense-ink)"
                  fill="var(--expense-ink)"
                  fillOpacity={0.16}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  )
}
