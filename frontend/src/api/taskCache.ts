import type { Task } from '../types/tasks/task'

const cache = new Map<string, Task>()

export function cacheTask(task: Task): void {
  cache.set(task.id, task)
}

export function cacheTasks(tasks: Task[]): void {
  for (const task of tasks) {
    cache.set(task.id, task)
  }
}

export function getCachedTask(id: string): Task | undefined {
  return cache.get(id)
}

export function removeCachedTask(id: string): void {
  cache.delete(id)
}
