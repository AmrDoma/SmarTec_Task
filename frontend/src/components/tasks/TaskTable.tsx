import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useTasks } from '../../hooks/useTasks'
import type {
  CreateTaskInput,
  Task,
  TaskListQuery,
  TaskPriority,
  TaskSortField,
  TaskStatus,
} from '../../types/tasks/task'
import { Pagination } from '../shared/Pagination'
import { Skeleton } from '../shared/Skeleton'
import { DeleteTaskModal } from './DeleteTaskModal'
import { DueDateFilter, type DueDateFilterValue } from './DueDateFilter'
import { PriorityChip, StatusChip } from './TaskChips'

import { SortableHeader } from './SortableHeader'
import { TaskCardList } from './TaskCardList'
import { TaskFormModal } from './TaskFormModal'
import { TaskSlideOver } from './TaskSlideOver'

export function TaskTable() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilterValue>({
    op: '',
    date: '',
    from: '',
    to: '',
  })
  const [sort, setSort] = useState<TaskSortField>('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [slideOverId, setSlideOverId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTargets, setDeleteTargets] = useState<Task[]>([])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const query: TaskListQuery = useMemo(() => {
    const base: TaskListQuery = {
      page,
      pageSize,
      search,
      status,
      priority,
      sort,
      order,
    }
    if (!dueDateFilter.op) return base
    if (dueDateFilter.op === 'between') {
      return {
        ...base,
        dueDateOp: 'between',
        dueDateFrom: dueDateFilter.from,
        dueDateTo: dueDateFilter.to,
      }
    }
    return {
      ...base,
      dueDateOp: dueDateFilter.op,
      dueDate: dueDateFilter.date,
    }
  }, [page, pageSize, search, status, priority, dueDateFilter, sort, order])

  const {
    tasks,
    count,
    loading,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    deleteTasks,
  } = useTasks(query)

  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const allSelected =
    tasks.length > 0 && tasks.every((task) => selectedIds.has(task.id))

  useEffect(() => {
    setSelectedIds(new Set())
  }, [page, pageSize, search, status, priority, dueDateFilter, sort, order])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  function handleSort(field: TaskSortField) {
    if (sort === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSort(field)
      setOrder('asc')
    }
    setPage(1)
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(tasks.map((task) => task.id)))
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleFormSubmit(input: CreateTaskInput) {
    if (editingTask) {
      return updateTask(editingTask.id, input)
    }
    return createTask(input)
  }

  const selectedTasks = tasks.filter((task) => selectedIds.has(task.id))

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-3 py-4 sm:px-4 sm:py-6 md:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => {
            setEditingTask(null)
            setFormOpen(true)
          }}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:py-2"
        >
          <Plus className="h-4 w-4" />
          Create task
        </button>

        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={() => setDeleteTargets(selectedTasks)}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-danger px-3 py-2.5 text-sm text-danger-foreground transition-colors hover:bg-danger/90 sm:w-auto sm:py-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete selected ({selectedIds.size})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search…"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2 lg:min-w-[12rem] lg:flex-1 lg:py-1.5"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as TaskStatus | '')
            setPage(1)
          }}
          className="w-full cursor-pointer rounded-md border border-border bg-background px-3 py-2 text-sm lg:w-auto lg:py-1.5"
        >
          <option value="">All statuses</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value as TaskPriority | '')
            setPage(1)
          }}
          className="w-full cursor-pointer rounded-md border border-border bg-background px-3 py-2 text-sm lg:w-auto lg:py-1.5"
        >
          <option value="">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <div className="sm:col-span-2 lg:col-span-1">
          <DueDateFilter
            value={dueDateFilter}
            onChange={(next) => {
              setDueDateFilter(next)
              setPage(1)
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <label className="sr-only" htmlFor="mobile-sort">
          Sort by
        </label>
        <select
          id="mobile-sort"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as TaskSortField)
            setPage(1)
          }}
          className="min-w-0 flex-1 cursor-pointer rounded-md border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="created_at">Sort: Created</option>
          <option value="updated_at">Sort: Updated</option>
          <option value="due_date">Sort: Due date</option>
          <option value="title">Sort: Title</option>
          <option value="status">Sort: Status</option>
          <option value="priority">Sort: Priority</option>
        </select>
        <button
          type="button"
          onClick={() => setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          className="shrink-0 cursor-pointer rounded-md border border-border bg-card px-3 py-2 text-sm"
        >
          {order === 'asc' ? 'Asc' : 'Desc'}
        </button>
      </div>

      <TaskCardList
        tasks={tasks}
        loading={loading}
        pageSize={pageSize}
        selectedIds={selectedIds}
        onToggle={toggleOne}
        onOpen={setSlideOverId}
        onEdit={(task) => {
          setEditingTask(task)
          setFormOpen(true)
        }}
        onDelete={(task) => setDeleteTargets([task])}
      />

      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="cursor-pointer"
                  aria-label="Select all"
                />
              </th>
              <SortableHeader
                label="Title"
                field="title"
                activeField={sort}
                order={order}
                onSort={handleSort}
              />
              <SortableHeader
                label="Status"
                field="status"
                activeField={sort}
                order={order}
                onSort={handleSort}
              />
              <SortableHeader
                label="Priority"
                field="priority"
                activeField={sort}
                order={order}
                onSort={handleSort}
              />
              <SortableHeader
                label="Due"
                field="due_date"
                activeField={sort}
                order={order}
                onSort={handleSort}
              />
              <SortableHeader
                label="Created"
                field="created_at"
                activeField={sort}
                order={order}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              <SortableHeader
                label="Updated"
                field="updated_at"
                activeField={sort}
                order={order}
                onSort={handleSort}
                className="hidden xl:table-cell"
              />
              <th className="px-3 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={`sk-${index}`} className="border-b border-border">
                  <td className="px-3 py-3" colSpan={8}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}
            {!loading && tasks.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-10 text-center text-muted-foreground"
                >
                  No tasks found.
                </td>
              </tr>
            )}
            {!loading &&
              tasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setSlideOverId(task.id)}
                  className="cursor-pointer border-b border-border hover:bg-muted/40"
                >
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(task.id)}
                      onChange={() => toggleOne(task.id)}
                      className="cursor-pointer"
                      aria-label={`Select ${task.title}`}
                    />
                  </td>
                  <td className="max-w-[14rem] truncate px-3 py-3 font-medium lg:max-w-xs">
                    {task.title}
                  </td>
                  <td className="px-3 py-3">
                    <StatusChip status={task.status} />
                  </td>
                  <td className="px-3 py-3">
                    <PriorityChip priority={task.priority} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {task.due_date ?? '—'}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-3 text-muted-foreground lg:table-cell">
                    {new Date(task.created_at).toLocaleDateString()}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-3 text-muted-foreground xl:table-cell">
                    {new Date(task.updated_at).toLocaleDateString()}
                  </td>
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        title="Edit"
                        aria-label="Edit task"
                        onClick={() => {
                          setEditingTask(task)
                          setFormOpen(true)
                        }}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        aria-label="Delete task"
                        onClick={() => setDeleteTargets([task])}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-danger/10 text-danger transition-colors hover:bg-danger/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        count={count}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />

      <TaskSlideOver
        taskId={slideOverId}
        onClose={() => setSlideOverId(null)}
        onChanged={() => {
          void refetch()
        }}
      />

      <TaskFormModal
        open={formOpen}
        task={editingTask}
        onClose={() => {
          setFormOpen(false)
          setEditingTask(null)
        }}
        onSubmit={handleFormSubmit}
      />

      <DeleteTaskModal
        open={deleteTargets.length > 0}
        tasks={deleteTargets}
        onClose={() => setDeleteTargets([])}
        onConfirm={async () => {
          if (deleteTargets.length === 1) {
            await deleteTask(deleteTargets[0].id)
          } else {
            await deleteTasks(deleteTargets.map((task) => task.id))
          }
          setSelectedIds(new Set())
        }}
      />
    </div>
  )
}
