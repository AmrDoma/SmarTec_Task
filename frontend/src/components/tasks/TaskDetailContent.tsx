import type { Task } from '../../types/tasks/task'
import { PriorityChip, StatusChip } from './TaskChips'

type TaskDetailContentProps = {
  task: Task
}

export function TaskDetailContent({ task }: TaskDetailContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="break-all font-mono text-xs text-muted-foreground">
          ID {task.id}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          {task.title}
        </h1>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Status</dt>
          <dd className="mt-1">
            <StatusChip status={task.status} />
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Priority</dt>
          <dd className="mt-1">
            <PriorityChip priority={task.priority} />
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Due date</dt>
          <dd className="mt-1 font-medium">{task.due_date ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Updated</dt>
          <dd className="mt-1 font-medium">
            {new Date(task.updated_at).toLocaleString()}
          </dd>
        </div>
      </dl>

      <div>
        <h2 className="text-sm text-muted-foreground">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-foreground">
          {task.description || 'No description.'}
        </p>
      </div>
    </div>
  )
}
