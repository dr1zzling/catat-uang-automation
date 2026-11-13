import { useEffect, useId, useRef, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react'
import { formatRupiah } from '../lib/format'
import { Modal } from './Modal'

const MAX_AMOUNT = 999_999_999

export function TransactionModal({
  open,
  transaction,
  submitting,
  onClose,
  onSubmit,
}) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const amountRef = useRef(null)
  const amountErrorId = useId()

  const isEdit = Boolean(transaction)

  useEffect(() => {
    if (!open) return
    setType(transaction?.type ?? 'expense')
    setAmount(
      transaction?.amount ? String(Math.round(Number(transaction.amount))) : '',
    )
    setDescription(transaction?.description ?? '')
    setErrors({})
  }, [open, transaction])

  function handleAmountChange(event) {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 9)
    setAmount(digits)
    if (errors.amount) setErrors((current) => ({ ...current, amount: undefined }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    const numericAmount = Number(amount)

    if (!amount) {
      nextErrors.amount = 'Nominal wajib diisi.'
    } else if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = 'Nominal harus lebih dari 0.'
    } else if (numericAmount > MAX_AMOUNT) {
      nextErrors.amount = 'Nominal maksimal Rp 999.999.999.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      type,
      amount: numericAmount,
      description: description.trim() || null,
    })
  }

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title={isEdit ? 'Edit transaksi' : 'Tambah transaksi'}
      description={
        isEdit
          ? 'Perubahan akan langsung memperbarui catatan Anda.'
          : 'Catat pemasukan atau pengeluaran baru ke dashboard.'
      }
      initialFocusRef={amountRef}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Tipe transaksi</legend>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-2 focus-within:ring-offset-surface-strong ${
                type === 'income'
                  ? 'border-income-ink bg-income-bg text-income-ink'
                  : 'border-line text-muted hover:bg-paper'
              }`}
            >
              <input
                type="radio"
                name="transaction-type"
                value="income"
                checked={type === 'income'}
                onChange={() => setType('income')}
                className="sr-only"
              />
              <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
              Pemasukan
            </label>

            <label
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-2 focus-within:ring-offset-surface-strong ${
                type === 'expense'
                  ? 'border-expense-ink bg-expense-bg text-expense-ink'
                  : 'border-line text-muted hover:bg-paper'
              }`}
            >
              <input
                type="radio"
                name="transaction-type"
                value="expense"
                checked={type === 'expense'}
                onChange={() => setType('expense')}
                className="sr-only"
              />
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              Pengeluaran
            </label>
          </div>
        </fieldset>

        <div>
          <label htmlFor="transaction-amount" className="mb-2 block text-sm font-medium text-ink">
            Nominal
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
              Rp
            </span>
            <input
              ref={amountRef}
              id="transaction-amount"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={amount}
              onChange={handleAmountChange}
              placeholder="50000"
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? amountErrorId : 'amount-hint'}
              className={`h-11 w-full rounded-xl border bg-surface pl-10 pr-3 text-sm font-semibold tabular-nums text-ink placeholder:font-normal placeholder:text-muted ${
                errors.amount ? 'border-expense-ink' : 'border-line'
              }`}
            />
          </div>
          {errors.amount ? (
            <p id={amountErrorId} className="mt-1.5 text-xs font-medium text-expense-ink">
              {errors.amount}
            </p>
          ) : (
            <p id="amount-hint" className="mt-1.5 text-xs text-muted">
              {amount ? `Nilai: ${formatRupiah(amount)}` : 'Tanpa titik atau koma. Maksimal Rp 999.999.999.'}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="transaction-description"
            className="mb-2 block text-sm font-medium text-ink"
          >
            Keterangan <span className="font-normal text-muted">(opsional)</span>
          </label>
          <input
            id="transaction-description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={255}
            placeholder="Contoh: makan siang"
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted"
          />
          <p className="mt-1.5 text-xs text-muted">
            Membantu Anda mengenali transaksi di riwayat.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-line px-4 text-sm font-semibold text-ink transition-colors hover:bg-paper disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {submitting
              ? 'Menyimpan...'
              : isEdit
                ? 'Simpan perubahan'
                : 'Tambah transaksi'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
