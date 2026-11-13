import { useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from './Modal'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Hapus',
  busy = false,
  onCancel,
  onConfirm,
}) {
  const cancelRef = useRef(null)

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      initialFocusRef={cancelRef}
    >
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-muted">{description}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-line px-4 text-sm font-semibold text-ink transition-colors hover:bg-paper disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-danger-bg px-4 text-sm font-semibold text-danger-ink transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {busy ? 'Menghapus...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
