'use client'
import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '../hooks/useTasks'

interface TaskCardProps {
  task: Task
}

export const TaskCard = React.memo(function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease, opacity 150ms ease',
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 1,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'border-blue-200 bg-blue-50'
      case 'inProgress':
        return 'border-yellow-200 bg-yellow-50'
      case 'done':
        return 'border-green-200 bg-green-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-150 hover:shadow-md ${getStatusColor(
        task.status
      )}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-800 flex-1">{task.title}</h3>
        <div className="flex items-center gap-2">
          {task.priority && (
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(
                task.priority
              )} bg-opacity-10`}
            >
              {task.priority.toUpperCase()}
            </span>
          )}
          <div className="w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors" />
        </div>
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
      )}
      {task.dueDate && (
        <div className="text-xs text-gray-500">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  )
})