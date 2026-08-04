import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '../api/client'
import { tasksApi } from '../api/tasks'
import { cacheTask, cacheTasks, removeCachedTask } from '../api/taskCache'
import type {
  CreateTaskInput,
  Task,
  TaskListData,
  TaskListQuery,
  UpdateTaskInput,
} from '../types/tasks/task'

type UseTasksResult = {
  tasks: Task[]
  count: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<Task>
  updateTask: (id: string, input: UpdateTaskInput) => Promise<Task>
  deleteTask: (id: string) => Promise<Task>
  deleteTasks: (ids: string[]) => Promise<void>
}

export function useTasks(query: TaskListQuery): UseTasksResult {
  const [data, setData] = useState<TaskListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await tasksApi.list(query)
      cacheTasks(response.data.results)
      setData(response.data)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load tasks'
      setError(message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [
    query.page,
    query.pageSize,
    query.search,
    query.status,
    query.priority,
    query.dueDateOp,
    query.dueDate,
    query.dueDateFrom,
    query.dueDateTo,
    query.sort,
    query.order,
  ])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      const response = await tasksApi.create(input)
      cacheTask(response.data)
      await refetch()
      return response.data
    },
    [refetch],
  )

  const updateTask = useCallback(
    async (id: string, input: UpdateTaskInput) => {
      const response = await tasksApi.update(id, input)
      cacheTask(response.data)
      await refetch()
      return response.data
    },
    [refetch],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      const response = await tasksApi.remove(id)
      removeCachedTask(id)
      await refetch()
      return response.data
    },
    [refetch],
  )

  const deleteTasks = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => tasksApi.remove(id)))
      for (const id of ids) {
        removeCachedTask(id)
      }
      await refetch()
    },
    [refetch],
  )

  return {
    tasks: data?.results ?? [],
    count: data?.count ?? 0,
    loading,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    deleteTasks,
  }
}
