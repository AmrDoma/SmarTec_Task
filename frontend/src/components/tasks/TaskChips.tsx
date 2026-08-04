import type { TaskPriority, TaskStatus } from '../../types/tasks/task'

const statusClass: Record<TaskStatus, string> = {
  Todo: 'bg-muted text-muted-foreground',
  'In Progress': 'bg-primary/15 text-primary',
  Done: 'bg-success/15 text-success',
}

const priorityClass: Record<TaskPriority, string> = {
  Low: 'bg-muted text-muted-foreground',
  Medium: 'bg-warning/15 text-warning',
  High: 'bg-danger/15 text-danger',
}

type ChipProps = {
  children: string
  className: string
}

function Chip({ children, className }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  )
}

export function StatusChip({ status }: { status: TaskStatus }) {
  return <Chip className={statusClass[status]}>{status}</Chip>
}

export function PriorityChip({ priority }: { priority: TaskPriority }) {
  return <Chip className={priorityClass[priority]}>{priority}</Chip>
}
