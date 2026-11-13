import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Copy, ExternalLink, Loader2, QrCode, Wallet } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { normalizePhone } from '../lib/format'
import { authService, getErrorMessage } from '../services/api'

const BOT_PHONE = '6281511839801'
const BOT_WA_LINK = `https://wa.me/${BOT_PHONE}?text=${encodeURIComponent('DAFTAR#Nama')}`
const BOT_QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(BOT_WA_LINK)}`

export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [phone, setPhone] = useState('')
  const [error, setError] = useState(null)
  const [notRegistered, setNotRegistered] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const copyTimer = useRef(null)

  const from =
    typeof location.state?.from === 'string' && location.state.from.startsWith('/')
      ? location.state.from
      : '/'

  useEffect(() => {
    return () => window.clearTimeout(copyTimer.current)
  }, [])

  if (isAuthenticated) return <Navigate to={from} replace />

  async function handleSubmit(event) {
    event.preventDefault()

    const normalized = normalizePhone(phone)
    setError(null)
    setNotRegistered(false)

    if (normalized.length < 10 || normalized.length > 15) {
      setError('Masukkan nomor WhatsApp yang valid.')
      return
    }

    setSubmitting(true)

    try {
      const user = await authService.login(normalized)
      signIn(user)
      navigate(from, { replace: true })
    } catch (requestError) {
      if (requestError?.response?.status === 404) {
        setNotRegistered(true)
      } else {
        setError(getErrorMessage(requestError))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function copyRegistrationFormat() {
    try {
      await navigator.clipboard.writeText('DAFTAR#Nama')
      setCopied(true)
      window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 2500)
    } catch (copyError) {
      setError('Format tidak bisa disalin otomatis. Tulis DAFTAR#Nama secara manual.')
    }
  }

  return (
    <div className="min-h-dvh bg-paper">
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent text-accent-ink">
              <Wallet className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-bold tracking-tight text-ink">Catat Uang</span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-surface shadow-sm lg:grid-cols-2">
            <section className="hidden flex-col justify-between gap-10 border-r border-line bg-paper p-10 lg:flex">
              <div>
                <p className="max-w-sm text-3xl font-bold leading-tight tracking-tight text-ink">
                  Catatan uang dari WhatsApp, rapi di satu dashboard.
                </p>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                  Masuk dengan nomor WhatsApp yang sudah terdaftar di bot Catat Uang.
                  Pemasukan, pengeluaran, dan saldo Anda langsung terbaca di sini.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="text-xs font-semibold text-muted">Bot WhatsApp Catat Uang</p>
                <p className="mt-2 font-mono text-sm font-semibold text-ink">{BOT_PHONE}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Daftar dengan format <code className="font-mono font-semibold text-ink">DAFTAR#Nama</code>.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={BOT_WA_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Buka WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowQr((v) => !v)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-paper px-3 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
                  >
                    <QrCode className="h-4 w-4" aria-hidden="true" />
                    {showQr ? 'Sembunyikan QR' : 'Scan QR'}
                  </button>
                </div>
                {showQr ? (
                  <div className="mt-3">
                    <img
                      src={BOT_QR_SRC}
                      alt="QR code untuk membuka chat WhatsApp bot Catat Uang"
                      width="180"
                      height="180"
                      className="rounded-lg border border-line bg-white p-2"
                    />
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      Scan untuk membuka chat bot, lalu kirim <code className="font-mono font-semibold text-ink">DAFTAR#Nama</code>.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="p-6 sm:p-10" aria-labelledby="login-heading">
              <h1 id="login-heading" className="text-2xl font-bold tracking-tight text-ink">
                Masuk ke Catat Uang
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Gunakan nomor WhatsApp yang terdaftar di bot.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-7">
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-ink">
                  Nomor WhatsApp
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value)
                    setError(null)
                    setNotRegistered(false)
                  }}
                  placeholder="08xxxxxxxxxx"
                  aria-invalid={Boolean(error)}
                  aria-describedby="phone-hint"
                  className={`h-12 w-full rounded-xl border bg-surface px-3 text-sm tabular-nums text-ink placeholder:text-muted ${
                    error ? 'border-expense-ink' : 'border-line'
                  }`}
                />
                <p id="phone-hint" className="mt-1.5 text-xs leading-relaxed text-muted">
                  Boleh diawali 08 atau 62. Format akan disesuaikan otomatis.
                </p>

                {error ? (
                  <div
                    role="alert"
                    className="mt-4 flex items-start gap-2.5 rounded-xl border border-expense-ink/30 bg-expense-bg p-3.5 text-sm text-expense-ink"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p className="leading-relaxed">{error}</p>
                  </div>
                ) : null}

                {notRegistered ? (
                  <div className="mt-4 rounded-xl border border-line bg-paper p-4">
                    <p className="text-sm font-semibold text-ink">Nomor belum terdaftar</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      Daftar dulu lewat bot WhatsApp, lalu coba masuk lagi dengan nomor
                      yang sama.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <code className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2 font-mono text-sm font-semibold text-ink">
                        DAFTAR#Nama
                      </code>
                      <button
                        type="button"
                        onClick={copyRegistrationFormat}
                        aria-label="Salin format pendaftaran"
                        title="Salin format"
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-colors hover:border-line-strong hover:text-ink"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="mt-2 min-h-4 text-xs text-muted" aria-live="polite">
                      {copied ? 'Format disalin. Kirim ke chat bot WhatsApp.' : ''}
                    </p>

                    <div className="mt-4 border-t border-line pt-4">
                      <p className="text-xs font-semibold text-muted">Nomor bot</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-ink">{BOT_PHONE}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={BOT_WA_LINK}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          Buka WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={() => setShowQr((v) => !v)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
                        >
                          <QrCode className="h-4 w-4" aria-hidden="true" />
                          {showQr ? 'Sembunyikan QR' : 'Scan QR'}
                        </button>
                      </div>
                      {showQr ? (
                        <div className="mt-3">
                          <img
                            src={BOT_QR_SRC}
                            alt="QR code untuk membuka chat WhatsApp bot Catat Uang"
                            width="180"
                            height="180"
                            className="rounded-lg border border-line bg-white p-2"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {submitting ? 'Memeriksa nomor...' : 'Masuk ke dashboard'}
                </button>
              </form>

              <div className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-muted lg:hidden">
                <p>
                  Belum punya catatan? Daftar lewat bot WhatsApp{' '}
                  <span className="font-mono font-semibold text-ink">{BOT_PHONE}</span> dengan
                  format <code className="font-mono font-semibold text-ink">DAFTAR#Nama</code>.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={BOT_WA_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Buka WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowQr((v) => !v)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
                  >
                    <QrCode className="h-4 w-4" aria-hidden="true" />
                    {showQr ? 'Sembunyikan QR' : 'Scan QR'}
                  </button>
                </div>
                {showQr ? (
                  <img
                    src={BOT_QR_SRC}
                    alt="QR code untuk membuka chat WhatsApp bot Catat Uang"
                    width="180"
                    height="180"
                    className="mt-3 rounded-lg border border-line bg-white p-2"
                  />
                ) : null}
              </div>
            </section>
          </div>
        </main>

        <footer>
          <p className="text-center text-xs text-muted">
            Catat Uang. Data dibaca dari API Catat Uang.
          </p>
        </footer>
      </div>
    </div>
  )
}
