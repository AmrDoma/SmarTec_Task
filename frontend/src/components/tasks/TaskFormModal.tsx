import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'

import type {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskStatus,
} from '../../types/tasks/task'
import { Modal } from '../shared/Modal'

type TaskFormModalProps = {
  open: boolean
  task?: Task | null
  onClose: () => void
  onSubmit: (input: CreateTaskInput) => Promise<Task>
}

const TITLE_MAX_LENGTH = 100

const statuses: TaskStatus[] = ['Todo', 'In Progress', 'Done']
const priorities: TaskPriority[] = ['Low', 'Medium', 'High']

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode
  required?: boolean
}) {
  return (
    <span className="flex items-center gap-1.5 font-medium">
      <span>{children}</span>
      {required ? (
        <>
          <span className="text-danger" aria-hidden>
            *
          </span>
          <span className="sr-only">required</span>
        </>
      ) : (
        <span className="text-xs font-normal text-muted-foreground">
          (optional)
        </span>
      )}
    </span>
  )
}

export function TaskFormModal({
  open,
  task,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const editing = task != null
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('Todo')
  const [priority, setPriority] = useState<TaskPriority>('Medium')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setStatus(task?.status ?? 'Todo')
    setPriority(task?.priority ?? 'Medium')
    setDueDate(task?.due_date ?? '')
    setTitleError(null)
  }, [open, task])

  function validateTitle(value: string): string | null {
    const cleaned = value.trim()
    if (!cleaned) return 'Title is required.'
    if (cleaned.length > TITLE_MAX_LENGTH) {
      return `Title must be at most ${TITLE_MAX_LENGTH} characters.`
    }
    return null
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    setTitleError(validateTitle(value))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const error = validateTitle(title)
    setTitleError(error)
    if (error) {
      toast.error(error)
      return
    }

    setSaving(true)
    try {
      const saved = await onSubmit({
        title: title.trim(),
        description,
        status,
        priority,
        due_date: dueDate || null,
      })
      toast.success(
        editing
          ? `Task with ID ${saved.id} successfully edited`
          : `Task with ID ${saved.id} successfully created`,
      )
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={editing ? 'Edit task' : 'Create task'}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        <p className="text-xs text-muted-foreground">
          Fields marked with <span className="text-danger">*</span> are
          required.
        </p>

        <label className="block space-y-1 text-sm">
          <FieldLabel required>Title</FieldLabel>
          <input
            required
            maxLength={TITLE_MAX_LENGTH}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={() => setTitleError(validateTitle(title))}
            className={`w-full rounded-md border bg-background px-3 py-2 ${
              titleError ? 'border-danger' : 'border-border'
            }`}
            aria-required
            aria-invalid={titleError != null}
            aria-describedby="title-help"
          />
          <div
            id="title-help"
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className={titleError ? 'text-danger' : 'text-muted-foreground'}>
              {titleError ?? `Maximum ${TITLE_MAX_LENGTH} characters.`}
            </span>
            <span
              className={
                title.trim().length > TITLE_MAX_LENGTH
                  ? 'text-danger'
                  : 'text-muted-foreground'
              }
            >
              {title.trim().length}/{TITLE_MAX_LENGTH}
            </span>
          </div>
        </label>
        <label className="block space-y-1 text-sm">
          <FieldLabel>Description</FieldLabel>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <FieldLabel>Status</FieldLabel>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full cursor-pointer rounded-md border border-border bg-background px-3 py-2"
            >
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <FieldLabel>Priority</FieldLabel>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full cursor-pointer rounded-md border border-border bg-background px-3 py-2"
            >
              {priorities.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <FieldLabel>Due date</FieldLabel>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full cursor-pointer rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-60"
          >
            {saving ? 'Saving…' : editing ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
