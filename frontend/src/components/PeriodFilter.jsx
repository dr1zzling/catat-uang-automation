import { PERIODS } from '../lib/period'

export function PeriodFilter({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Filter periode"
      className="inline-flex w-full gap-1 rounded-xl border border-line bg-surface p-1 sm:w-auto"
    >
      {PERIODS.map((period) => {
        const active = period.id === value
        return (
          <button
            key={period.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(period.id)}
            className={`h-11 flex-1 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors sm:flex-none ${
              active
                ? 'bg-ink text-paper'
                : 'text-muted hover:bg-paper hover:text-ink'
            }`}
          >
            {period.label}
          </button>
        )
      })}
    </div>
  )
}
