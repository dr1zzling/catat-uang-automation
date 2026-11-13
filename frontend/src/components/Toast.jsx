import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(onClose, 4500)
    return () => window.clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const isError = toast.tone === 'error'
  const Icon = isError ? AlertCircle : CheckCircle2

  return (
    <div
      className="fixed inset-x-4 bottom-4 z-[60] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96"
      role="status"
      aria-live="polite"
    >
      <div className="toast-enter flex items-start gap-3 rounded-xl border border-line bg-surface-strong p-4 shadow-lg">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            isError ? 'text-expense-ink' : 'text-income-ink'
          }`}
          aria-hidden="true"
        />
        <p className="flex-1 text-sm leading-relaxed text-ink">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="-m-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
