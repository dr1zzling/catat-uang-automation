import { useCallback, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FinanceChart } from '../components/FinanceChart'
import { SummaryCards } from '../components/SummaryCards'
import { Toast } from '../components/Toast'
import { TransactionModal } from '../components/TransactionModal'
import { TransactionsPanel } from '../components/TransactionsPanel'
import { useAuth } from '../context/AuthContext'
import { useDashboardData } from '../hooks/useDashboardData'
import { formatRupiah } from '../lib/format'
import {
  buildChartSeries,
  filterTransactionsByPeriod,
  getPeriodMeta,
  summarize,
} from '../lib/period'
import { getErrorMessage, transactionService } from '../services/api'

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { transactions, summary: allTimeSummary, loading, error, reload } =
    useDashboardData(user.id)

  const [period, setPeriod] = useState('this-month')
  const [editor, setEditor] = useState({ open: false, transaction: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const closeToast = useCallback(() => setToast(null), [])

  const periodMeta = getPeriodMeta(period)
  const periodTransactions = useMemo(
    () => filterTransactionsByPeriod(transactions, period),
    [transactions, period],
  )
  const chartSeries = useMemo(
    () => buildChartSeries(transactions, period),
    [transactions, period],
  )

  const summary = useMemo(() => {
    if (period === 'all' && allTimeSummary) {
      return {
        total_income: Number(allTimeSummary.total_income),
        total_expense: Number(allTimeSummary.total_expense),
        balance: Number(allTimeSummary.balance),
      }
    }

    const totals = summarize(periodTransactions)
    return {
      ...totals,
      balance: totals.total_income - totals.total_expense,
    }
  }, [period, allTimeSummary, periodTransactions])

  function handleLogout() {
    signOut()
    navigate('/login', { replace: true })
  }

  async function handleSubmit(values) {
    const editing = editor.transaction
    setSaving(true)

    try {
      if (editing) {
        await transactionService.update(editing.id, values)
      } else {
        await transactionService.create({ user_id: user.id, ...values })
      }

      await reload({ silent: true })
      setEditor({ open: false, transaction: null })
      setToast({
        tone: 'success',
        message: editing
          ? 'Transaksi berhasil diperbarui.'
          : 'Transaksi baru berhasil ditambahkan.',
      })
    } catch (requestError) {
      setToast({ tone: 'error', message: getErrorMessage(requestError) })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)

    try {
      await transactionService.remove(deleteTarget.id)
      await reload({ silent: true })
      setDeleteTarget(null)
      setToast({ tone: 'success', message: 'Transaksi berhasil dihapus.' })
    } catch (requestError) {
      setToast({ tone: 'error', message: getErrorMessage(requestError) })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-paper">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface-strong focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Lewati ke konten utama
      </a>

      <AppHeader
        user={user}
        period={period}
        onPeriodChange={setPeriod}
        onLogout={handleLogout}
      />

      <main
        id="konten"
        className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        {error ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-paper text-expense-ink">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-ink">
              Dashboard gagal memuat data
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted">
              {getErrorMessage(error)}
            </p>
            <button
              type="button"
              onClick={() => reload()}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            <SummaryCards
              summary={summary}
              periodLabel={periodMeta.label}
              loading={loading}
            />
            <FinanceChart
              series={chartSeries}
              caption={periodMeta.chartCaption}
              loading={loading}
            />
            <TransactionsPanel
              transactions={periodTransactions}
              periodLabel={periodMeta.label}
              loading={loading}
              onAdd={() => setEditor({ open: true, transaction: null })}
              onEdit={(transaction) => setEditor({ open: true, transaction })}
              onDelete={setDeleteTarget}
            />
          </>
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs text-muted">
            Catat Uang. Data dibaca dari catatan bot WhatsApp Anda melalui API Catat Uang.
          </p>
        </div>
      </footer>

      <TransactionModal
        open={editor.open}
        transaction={editor.transaction}
        submitting={saving}
        onClose={() => setEditor({ open: false, transaction: null })}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus transaksi?"
        description={
          deleteTarget
            ? `Transaksi "${
                deleteTarget.description || 'tanpa keterangan'
              }" sebesar ${formatRupiah(deleteTarget.amount)} akan dihapus permanen.`
            : ''
        }
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  )
}
