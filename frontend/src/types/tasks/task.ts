export type TaskStatus = 'Todo' | 'In Progress' | 'Done'

export type TaskPriority = 'Low' | 'Medium' | 'High'

export type TaskSortField =
  | 'due_date'
  | 'title'
  | 'priority'
  | 'status'
  | 'created_at'
  | 'updated_at'

export type SortOrder = 'asc' | 'desc'

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  created_at: string
  updated_at: string
}

export type CreateTaskInput = {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | null
}

export type UpdateTaskInput = Partial<CreateTaskInput>

export type DueDateOp = 'before' | 'after' | 'on' | 'between'

export type TaskListQuery = {
  page?: number
  pageSize?: number
  search?: string
  status?: TaskStatus | ''
  priority?: TaskPriority | ''
  dueDateOp?: DueDateOp | ''
  dueDate?: string
  dueDateFrom?: string
  dueDateTo?: string
  sort?: TaskSortField
  order?: SortOrder
}

export type TaskListData = {
  count: number
  next: string | null
  previous: string | null
  results: Task[]
}
