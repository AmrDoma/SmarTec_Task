import { useCallback, useEffect, useState } from 'react'

import { getCachedTask, cacheTask } from '../api/taskCache'
import { ApiError } from '../api/client'
import { tasksApi } from '../api/tasks'
import type { Task } from '../types/tasks/task'

type UseTaskResult = {
  task: Task | null
  loading: boolean
  error: string | null
  setTask: (task: Task | null) => void
}

/** Instant from cache when possible; refreshes in the background. */
export function useTask(id: string | null): UseTaskResult {
  const cached = id != null ? (getCachedTask(id) ?? null) : null
  const [task, setTask] = useState<Task | null>(cached)
  const [loading, setLoading] = useState(id != null && cached == null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (taskId: string) => {
    const existing = getCachedTask(taskId)
    if (existing) {
      setTask(existing)
      setLoading(false)
    } else {
      setLoading(true)
    }
    setError(null)
    try {
      const response = await tasksApi.get(taskId)
      cacheTask(response.data)
      setTask(response.data)
    } catch (err) {
      if (!existing) {
        setTask(null)
        setError(err instanceof ApiError ? err.message : 'Failed to load task')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id == null) {
      setTask(null)
      setLoading(false)
      setError(null)
      return
    }
    void load(id)
  }, [id, load])

  return { task, loading, error, setTask }
}
