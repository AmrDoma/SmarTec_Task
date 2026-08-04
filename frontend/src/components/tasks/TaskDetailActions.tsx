import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import { cacheTask, removeCachedTask } from '../../api/taskCache'
import { tasksApi } from '../../api/tasks'
import type { CreateTaskInput, Task } from '../../types/tasks/task'
import { DeleteTaskModal } from './DeleteTaskModal'
import { TaskFormModal } from './TaskFormModal'

type TaskDetailActionsProps = {
  task: Task
  onUpdated: (task: Task) => void
  onDeleted: () => void
}

export function TaskDetailActions({
  task,
  onUpdated,
  onDeleted,
}: TaskDetailActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleSubmit(input: CreateTaskInput) {
    const response = await tasksApi.update(task.id, input)
    cacheTask(response.data)
    onUpdated(response.data)
    return response.data
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 sm:w-auto sm:py-2"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-danger/10 px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/20 sm:w-auto sm:py-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <TaskFormModal
        open={editOpen}
        task={task}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSubmit}
      />

      <DeleteTaskModal
        open={deleteOpen}
        tasks={[task]}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await tasksApi.remove(task.id)
          removeCachedTask(task.id)
          onDeleted()
        }}
      />
    </>
  )
}
