import { toast } from 'sonner'

import type { Task } from '../../types/tasks/task'
import { Modal } from '../shared/Modal'

type DeleteTaskModalProps = {
  open: boolean
  tasks: Task[]
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteTaskModal({
  open,
  tasks,
  onClose,
  onConfirm,
}: DeleteTaskModalProps) {
  const single = tasks.length === 1

  async function handleConfirm() {
    try {
      await onConfirm()
      toast.success(
        single
          ? `Task with ID ${tasks[0].id} successfully deleted`
          : `${tasks.length} tasks successfully deleted`,
      )
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <Modal
      open={open}
      title={single ? 'Delete task' : 'Delete tasks'}
      onClose={onClose}
    >
      <div className="space-y-4">
        {single ? (
          <p className="text-sm text-muted-foreground">
            Delete <span className="font-medium text-foreground">{tasks[0].title}</span>{' '}
            (<span className="break-all font-mono text-xs">{tasks[0].id}</span>)? This
            cannot be undone.
          </p>
        ) : (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Delete {tasks.length} tasks? This cannot be undone.</p>
            <ul className="max-h-40 list-inside list-disc overflow-y-auto">
              {tasks.map((task) => (
                <li key={task.id}>
                  {task.title}{' '}
                  <span className="break-all font-mono text-xs">({task.id})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            className="cursor-pointer rounded-md bg-danger px-3 py-1.5 text-sm text-danger-foreground"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}
