import { useEffect, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarDays, X } from 'lucide-react'
import { DayPicker, type DateRange } from 'react-day-picker'

import type { DueDateOp } from '../../types/tasks/task'

import 'react-day-picker/style.css'

export type DueDateFilterValue = {
  op: DueDateOp | ''
  date: string
  from: string
  to: string
}

type DueDateFilterProps = {
  value: DueDateFilterValue
  onChange: (value: DueDateFilterValue) => void
}

const EMPTY: DueDateFilterValue = { op: '', date: '', from: '', to: '' }

function toIso(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function fromValue(value: DueDateFilterValue): DateRange | undefined {
  if (value.op === 'between' && value.from && value.to) {
    return { from: parseISO(value.from), to: parseISO(value.to) }
  }
  if (value.op && value.date) {
    const day = parseISO(value.date)
    return { from: day, to: day }
  }
  return undefined
}

function labelFor(value: DueDateFilterValue): string {
  if (value.op === 'on') return `On ${value.date}`
  if (value.op === 'before') return `Before ${value.date}`
  if (value.op === 'after') return `After ${value.date}`
  if (value.op === 'between') return `${value.from} → ${value.to}`
  return 'Due date'
}

export function DueDateFilter({ value, onChange }: DueDateFilterProps) {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>(() =>
    fromValue(value),
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedDay = range?.from

  useEffect(() => {
    setRange(fromValue(value))
  }, [value])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  function handleSelect(next: DateRange | undefined) {
    setRange(next)
    if (!next?.from || !next.to) return
    const from = toIso(next.from)
    const to = toIso(next.to)
    if (from === to) return
    onChange({ op: 'between', date: '', from, to })
    setOpen(false)
  }

  function applySingle(op: 'on' | 'before' | 'after') {
    if (!selectedDay) return
    onChange({ op, date: toIso(selectedDay), from: '', to: '' })
    setOpen(false)
  }

  return (
    <div className="relative w-full" ref={rootRef}>
      <div className="inline-flex w-full items-center gap-1 sm:w-auto">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`inline-flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors sm:flex-none sm:py-1.5 ${
            value.op
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-background hover:bg-muted'
          }`}
        >
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span className="truncate">{labelFor(value)}</span>
        </button>
        {value.op && (
          <button
            type="button"
            aria-label="Clear due date filter"
            onClick={() => onChange(EMPTY)}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:h-8 sm:w-8"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 z-20 mt-2 max-h-[min(28rem,70vh)] w-[min(100%,20.5rem)] overflow-y-auto rounded-lg border border-border bg-card p-3 shadow-lg sm:right-0 sm:left-auto">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={1}
            className="rdp-root"
          />
          <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
            <button
              type="button"
              disabled={!selectedDay}
              onClick={() => applySingle('on')}
              className="cursor-pointer rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              On this day
            </button>
            <button
              type="button"
              disabled={!selectedDay}
              onClick={() => applySingle('before')}
              className="cursor-pointer rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Before
            </button>
            <button
              type="button"
              disabled={!selectedDay}
              onClick={() => applySingle('after')}
              className="cursor-pointer rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              After
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
