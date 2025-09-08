'use client'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '../hooks/useTasks'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  taskCount: number
}

export function KanbanColumn({ title, status, tasks, taskCount }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  })

  const getColumnColor = () => {
    switch (status) {
      case 'todo':
        return 'bg-blue-50 border-blue-200'
      case 'inProgress':
        return 'bg-yellow-50 border-yellow-200'
      case 'done':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getHeaderColor = () => {
    switch (status) {
      case 'todo':
        return 'text-blue-700 bg-blue-100'
      case 'inProgress':
        return 'text-yellow-700 bg-yellow-100'
      case 'done':
        return 'text-green-700 bg-green-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  return (
    <div className={`flex flex-col h-full rounded-lg border-2 transition-all duration-200 ${getColumnColor()} ${
      isOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
    }`}>
      <div className={`px-4 py-3 rounded-t-lg ${getHeaderColor()}`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wide">
            {title}
          </h2>
          <div className="bg-white bg-opacity-80 text-xs font-medium px-2 py-1 rounded-full">
            {taskCount}
          </div>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-4 min-h-[200px] transition-colors duration-200"
      >
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}