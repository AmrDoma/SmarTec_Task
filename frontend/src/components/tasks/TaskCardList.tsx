import { Pencil, Trash2 } from 'lucide-react'

import type { Task } from '../../types/tasks/task'
import { Skeleton } from '../shared/Skeleton'
import { PriorityChip, StatusChip } from './TaskChips'

type TaskCardListProps = {
  tasks: Task[]
  loading: boolean
  pageSize: number
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onOpen: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskCardList({
  tasks,
  loading,
  pageSize,
  selectedIds,
  onToggle,
  onOpen,
  onEdit,
  onDelete,
}: TaskCardListProps) {
  if (loading) {
    return (
      <ul className="space-y-3 md:hidden">
        {Array.from({ length: pageSize }).map((_, index) => (
          <li
            key={`card-sk-${index}`}
            className="rounded-lg border border-border bg-card p-4"
          >
            <Skeleton className="mb-3 h-5 w-3/4" />
            <Skeleton className="mb-2 h-4 w-1/2" />
            <Skeleton className="h-4 w-2/5" />
          </li>
        ))}
      </ul>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground md:hidden">
        No tasks found.
      </div>
    )
  }

  return (
    <ul className="space-y-3 md:hidden">
      {tasks.map((task) => (
        <li key={task.id}>
          <article
            className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/40"
            onClick={() => onOpen(task.id)}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedIds.has(task.id)}
                onChange={() => onToggle(task.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 cursor-pointer"
                aria-label={`Select ${task.title}`}
              />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-base font-medium text-foreground">
                    {task.title}
                  </h3>
                  <div
                    className="flex shrink-0 gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      title="Edit"
                      aria-label="Edit task"
                      onClick={() => onEdit(task)}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      aria-label="Delete task"
                      onClick={() => onDelete(task)}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-danger/10 text-danger transition-colors hover:bg-danger/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={task.status} />
                  <PriorityChip priority={task.priority} />
                </div>

                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <div>
                    <dt className="inline">Due: </dt>
                    <dd className="inline text-foreground">
                      {task.due_date ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">Updated: </dt>
                    <dd className="inline text-foreground">
                      {new Date(task.updated_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}
