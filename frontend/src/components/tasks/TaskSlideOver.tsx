import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

import { useTask } from '../../hooks/useTask'
import { Skeleton } from '../shared/Skeleton'
import { TaskDetailActions } from './TaskDetailActions'
import { TaskDetailContent } from './TaskDetailContent'

type TaskSlideOverProps = {
  taskId: string | null
  onClose: () => void
  onChanged?: () => void
}

export function TaskSlideOver({
  taskId,
  onClose,
  onChanged,
}: TaskSlideOverProps) {
  const open = taskId != null
  const [renderedId, setRenderedId] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const { task, loading, error, setTask } = useTask(renderedId)

  useEffect(() => {
    if (open && taskId != null) {
      setRenderedId(taskId)
      setVisible(false)
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true))
      })
      return () => window.cancelAnimationFrame(frame)
    }

    setVisible(false)
    const timeout = window.setTimeout(() => setRenderedId(null), 300)
    return () => window.clearTimeout(timeout)
  }, [open, taskId])

  useEffect(() => {
    if (renderedId == null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [renderedId, onClose])

  if (renderedId == null) return null

  return createPortal(
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        className={`absolute inset-0 cursor-pointer bg-black/50 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside
        className={`relative z-10 flex h-full w-full max-w-full flex-col border-l border-border bg-card shadow-xl transition-transform duration-300 ease-out sm:max-w-md ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-sm font-medium text-primary hover:underline"
          >
            ← Back
          </button>
          <Link
            to={`/tasks/${renderedId}`}
            className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Detailed view
          </Link>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading && !task && (
            <div className="space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {error && !task && (
            <p className="text-sm text-danger">{error}</p>
          )}
          {task && (
            <div className="space-y-6">
              <TaskDetailContent task={task} />
              <TaskDetailActions
                task={task}
                onUpdated={(updated) => {
                  setTask(updated)
                  onChanged?.()
                }}
                onDeleted={() => {
                  onChanged?.()
                  onClose()
                }}
              />
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  )
}
