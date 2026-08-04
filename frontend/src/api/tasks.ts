import type {
  CreateTaskInput,
  Task,
  TaskListData,
  TaskListQuery,
  UpdateTaskInput,
} from '../types/tasks/task'
import { api } from './client'

export const tasksApi = {
  list(query: TaskListQuery = {}) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') params.set(key, String(value))
    }
    const qs = params.toString()
    return api<TaskListData>(`/tasks/${qs ? `?${qs}` : ''}`)
  },

  get: (id: string) => api<Task>(`/tasks/${id}/`),

  create: (input: CreateTaskInput) =>
    api<Task>('/tasks/', { method: 'POST', body: JSON.stringify(input) }),

  update: (id: string, input: UpdateTaskInput) =>
    api<Task>(`/tasks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    api<Task>(`/tasks/${id}/`, { method: 'DELETE' }),
}
