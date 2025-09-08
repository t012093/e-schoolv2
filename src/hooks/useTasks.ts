'use client'

import { useState } from 'react'

export type TaskStatus = 'todo' | 'inProgress' | 'done'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  order: number
  dueDate?: string
}

export interface TasksByStatus {
  todo: Task[]
  inProgress: Task[]
  done: Task[]
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Implement user authentication',
    status: 'todo',
    order: 0,
    dueDate: 'Due today'
  },
  {
    id: '2', 
    title: 'Setup database connection',
    status: 'todo',
    order: 1,
    dueDate: 'Due tomorrow'
  },
  {
    id: '3',
    title: 'Create API endpoints',
    status: 'todo', 
    order: 2,
    dueDate: 'Due in 3 days'
  }
]

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const getTasksByStatus = (): TasksByStatus => {
    const tasksByStatus: TasksByStatus = {
      todo: [],
      inProgress: [],
      done: []
    }

    tasks.forEach(task => {
      tasksByStatus[task.status].push(task)
    })

    // Sort by order within each status
    Object.keys(tasksByStatus).forEach(status => {
      tasksByStatus[status as TaskStatus].sort((a, b) => a.order - b.order)
    })

    return tasksByStatus
  }

  const moveTask = (taskId: string, newStatus: TaskStatus, newOrder?: number) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status: newStatus,
            order: newOrder !== undefined ? newOrder : task.order
          }
        }
        return task
      })

      // Reorder tasks within the new status if needed
      if (newOrder !== undefined) {
        const tasksInNewStatus = updatedTasks.filter(t => t.status === newStatus)
        tasksInNewStatus.forEach((task, index) => {
          if (task.id !== taskId) {
            const adjustedIndex = index >= newOrder ? index + 1 : index
            task.order = adjustedIndex
          }
        })
      }

      return updatedTasks
    })
  }

  const reorderTasks = (status: TaskStatus, startIndex: number, endIndex: number) => {
    setTasks(prevTasks => {
      const statusTasks = prevTasks.filter(t => t.status === status)
      const [reorderedTask] = statusTasks.splice(startIndex, 1)
      statusTasks.splice(endIndex, 0, reorderedTask)

      // Update order values
      statusTasks.forEach((task, index) => {
        task.order = index
      })

      // Merge back with other tasks
      const otherTasks = prevTasks.filter(t => t.status !== status)
      return [...otherTasks, ...statusTasks]
    })
  }

  const moveTaskWithinColumn = (status: TaskStatus, reorderedTasks: Task[]) => {
    setTasks(prevTasks => {
      // Update order values for reordered tasks
      const tasksWithUpdatedOrder = reorderedTasks.map((task, index) => ({
        ...task,
        order: index
      }))

      // Merge back with other tasks from different statuses
      const otherTasks = prevTasks.filter(t => t.status !== status)
      return [...otherTasks, ...tasksWithUpdatedOrder]
    })
  }

  return {
    tasks,
    tasksByStatus: getTasksByStatus(),
    moveTask,
    moveTaskWithinColumn,
    reorderTasks
  }
}