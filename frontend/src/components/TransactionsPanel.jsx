import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  formatRupiah,
  formatTransactionDate,
  formatTransactionTime,
} from '../lib/format'
import { EmptyState } from './EmptyState'

const PAGE_SIZE = 10

const TYPE_OPTIONS = [
  { value: 'all', label: 'Semua tipe' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
]

function TypeBadge({ type }) {
  const isIncome = type === 'income'
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
        isIncome ? 'bg-income-bg text-income-ink' : 'bg-expense-bg text-expense-ink'
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {isIncome ? 'Masuk' : 'Keluar'}
    </span>
  )
}

function RowActions({ transaction, onEdit, onDelete, withLabels = false }) {
  const label = transaction.description?.trim() || 'tanpa keterangan'
  const base = withLabels
    ? 'h-11 gap-2 px-3 text-sm font-semibold'
    : 'h-11 w-11'

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onEdit(transaction)}
        aria-label={`Edit transaksi ${label}`}
        title="Edit transaksi"
        className={`inline-flex items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-ink ${base}`}
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        {withLabels ? 'Edit' : null}
      </button>
      <button
        type="button"
        onClick={() => onDelete(transaction)}
        aria-label={`Hapus transaksi ${label}`}
        title="Hapus transaksi"
        className={`inline-flex items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-danger-bg/40 hover:text-danger-bg ${base}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {withLabels ? 'Hapus' : null}
      </button>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-5 sm:p-6" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="flex animate-pulse items-center gap-4">
          <div className="h-4 w-24 rounded bg-line" />
          <div className="h-4 flex-1 rounded bg-line" />
          <div className="hidden h-6 w-20 rounded bg-line sm:block" />
          <div className="h-4 w-24 rounded bg-line" />
        </div>
      ))}
    </div>
  )
}

export function TransactionsPanel({
  transactions,
  periodLabel,
  loading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [periodLabel])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return transactions.filter((transaction) => {
      if (typeFilter !== 'all' && transaction.type !== typeFilter) return false
      if (!term) return true
      return (transaction.description ?? '').toLowerCase().includes(term)
    })
  }, [transactions, search, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length)
  const hasActiveFilters = search.trim() !== '' || typeFilter !== 'all'

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  function resetFilters() {
    setSearch('')
    setTypeFilter('all')
    setPage(1)
  }

  const addButton = (
    <button
      type="button"
      onClick={onAdd}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Tambah transaksi
    </button>
  )

  let content

  if (loading) {
    content = <TableSkeleton />
  } else if (filtered.length === 0) {
    content = hasActiveFilters ? (
      <EmptyState
        icon={Search}
        title="Tidak ada transaksi yang cocok"
        description="Coba kata kunci lain atau ubah filter tipe transaksi."
        action={
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-line px-4 text-sm font-semibold text-ink transition-colors hover:bg-paper"
          >
            Reset filter
          </button>
        }
      />
    ) : (
      <EmptyState
        icon={ReceiptText}
        title="Belum ada transaksi"
        description={`Tidak ada catatan pada periode ${periodLabel.toLowerCase()}. Tambahkan transaksi pertama Anda.`}
        action={addButton}
      />
    )
  } else {
    content = (
      <>
        <div className="hidden md:block">
          <table className="min-w-full">
            <thead className="border-b border-line bg-paper/60">
              <tr>
                <th
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-semibold text-muted"
                >
                  Tanggal
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-semibold text-muted"
                >
                  Keterangan
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-semibold text-muted"
                >
                  Tipe
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-right text-xs font-semibold text-muted"
                >
                  Nominal
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-right text-xs font-semibold text-muted"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((transaction) => {
                const isIncome = transaction.type === 'income'
                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-line transition-colors last:border-0 hover:bg-paper/50"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="text-sm font-medium text-ink">
                        {formatTransactionDate(transaction.created_at)}
                      </p>
                      {formatTransactionTime(transaction.created_at) ? (
                        <p className="mt-0.5 text-xs text-muted">
                          {formatTransactionTime(transaction.created_at)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <p
                        className={`max-w-[26rem] truncate text-sm ${
                          transaction.description
                            ? 'font-medium text-ink'
                            : 'italic text-muted'
                        }`}
                        title={transaction.description || undefined}
                      >
                        {transaction.description || 'Tanpa keterangan'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <TypeBadge type={transaction.type} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <p
                        className={`text-sm font-bold tabular-nums ${
                          isIncome ? 'text-income-ink' : 'text-expense-ink'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatRupiah(transaction.amount)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <RowActions
                        transaction={transaction}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <ul className="divide-y divide-line md:hidden">
          {pageItems.map((transaction) => {
            const isIncome = transaction.type === 'income'
            return (
              <li key={transaction.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={`break-words text-sm ${
                        transaction.description
                          ? 'font-semibold text-ink'
                          : 'italic text-muted'
                      }`}
                    >
                      {transaction.description || 'Tanpa keterangan'}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatTransactionDate(transaction.created_at)}
                      {formatTransactionTime(transaction.created_at)
                        ? ` · ${formatTransactionTime(transaction.created_at)}`
                        : ''}
                    </p>
                    <div className="mt-2">
                      <TypeBadge type={transaction.type} />
                    </div>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-bold tabular-nums ${
                      isIncome ? 'text-income-ink' : 'text-expense-ink'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatRupiah(transaction.amount)}
                  </p>
                </div>
                <div className="mt-3">
                  <RowActions
                    transaction={transaction}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    withLabels
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </>
    )
  }

  return (
    <section
      aria-labelledby="transactions-heading"
      className="rounded-2xl border border-line bg-surface"
    >
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 id="transactions-heading" className="text-base font-semibold text-ink">
            Riwayat transaksi
          </h2>
          <p className="mt-0.5 text-sm text-muted">Periode: {periodLabel}</p>
        </div>
        <div className="sm:shrink-0">{addButton}</div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line p-5 sm:flex-row sm:items-end sm:p-6">
        <label className="block min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Cari keterangan
          </span>
          <span className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Contoh: makan siang"
              className="h-11 w-full rounded-xl border border-line bg-surface pl-9 pr-12 text-sm text-ink placeholder:text-muted"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                aria-label="Hapus pencarian"
                title="Hapus pencarian"
                className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </span>
        </label>

        <label className="block sm:w-44">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Tipe transaksi
          </span>
          <span className="relative block">
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value)
                setPage(1)
              }}
              className="h-11 w-full appearance-none rounded-xl border border-line bg-surface pl-3 pr-10 text-sm font-medium text-ink"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
          </span>
        </label>
      </div>

      <div className="border-t border-line">{content}</div>

      {!loading && filtered.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted">
            Menampilkan {rangeStart}-{rangeEnd} dari {filtered.length} transaksi
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-semibold text-ink transition-colors hover:bg-paper disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={safePage === totalPages}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-semibold text-ink transition-colors hover:bg-paper disabled:opacity-40"
            >
              Berikutnya
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
