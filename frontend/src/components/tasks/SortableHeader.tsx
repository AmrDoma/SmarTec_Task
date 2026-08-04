import { ListFilter } from 'lucide-react'

import type { SortOrder, TaskSortField } from '../../types/tasks/task'

type SortableHeaderProps = {
  label: string
  field: TaskSortField
  activeField: TaskSortField
  order: SortOrder
  onSort: (field: TaskSortField) => void
  className?: string
}

export function SortableHeader({
  label,
  field,
  activeField,
  order,
  onSort,
  className = '',
}: SortableHeaderProps) {
  const active = activeField === field

  return (
    <th className={`px-3 py-3 ${className}`.trim()}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex cursor-pointer items-center gap-1.5 font-medium transition-colors hover:text-foreground ${
          active ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <span>{label}</span>
        <ListFilter
          className={`h-3.5 w-3.5 transition-transform ${
            active && order === 'asc' ? 'rotate-180' : ''
          } ${active ? 'opacity-100' : 'opacity-50'}`}
        />
      </button>
    </th>
  )
}
