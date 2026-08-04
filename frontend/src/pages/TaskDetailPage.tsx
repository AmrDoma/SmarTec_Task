import { Link, useNavigate, useParams } from 'react-router-dom'

import { useTask } from '../hooks/useTask'
import { Skeleton } from '../components/shared/Skeleton'
import { TaskDetailActions } from '../components/tasks/TaskDetailActions'
import { TaskDetailContent } from '../components/tasks/TaskDetailContent'
import { isTaskId } from '../types/tasks/id'

export function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const valid = isTaskId(id)
  const { task, loading, error, setTask } = useTask(valid ? id : null)

  return (
    <div className="mx-auto max-w-3xl px-3 py-5 sm:px-4 sm:py-8 md:px-6">
      <Link
        to="/tasks"
        className="cursor-pointer text-sm font-medium text-primary hover:underline"
      >
        ← Back to list
      </Link>

      <div className="mt-4 space-y-6 rounded-lg border border-border bg-card p-4 sm:mt-6 sm:p-6">
        {!valid && (
          <p className="text-sm text-danger">Invalid task ID.</p>
        )}
        {valid && loading && !task && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        {valid && error && !task && (
          <p className="text-sm text-danger">{error}</p>
        )}
        {task && (
          <>
            <TaskDetailContent task={task} />
            <TaskDetailActions
              task={task}
              onUpdated={setTask}
              onDeleted={() => navigate('/tasks')}
            />
          </>
        )}
      </div>
    </div>
  )
}
