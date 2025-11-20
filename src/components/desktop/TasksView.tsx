'use client'

import { useState, useEffect } from 'react'
import { Circle, CheckCircle2, Plus, X, GripVertical, Loader2 } from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Task {
  id: string
  title: string
  tag: string
  column: 'todo' | 'doing' | 'done'
  order: number
}

interface TaskState {
  todo: Task[]
  doing: Task[]
  done: Task[]
}

function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl p-5 shadow-md hover:shadow-xl border border-gray-100/50 transition-all cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-3">{task.title}</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {task.tag}
          </span>
        </div>
      </div>
    </div>
  )
}

function DroppableColumn({
  id,
  title,
  icon: Icon,
  tasks,
  count,
  color,
}: {
  id: string
  title: string
  icon: any
  tasks: Task[]
  count: number
  color: string
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${color}`} />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
          id === 'todo' ? 'bg-gray-100 text-gray-600' :
          id === 'doing' ? 'bg-blue-100 text-blue-600' :
          'bg-green-100 text-green-600'
        }`}>
          {count}
        </span>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className={`min-h-[200px] space-y-3 p-4 rounded-3xl border-2 border-dashed transition-colors ${
          id === 'todo' ? 'border-gray-200' :
          id === 'doing' ? 'border-blue-200' :
          'border-green-200'
        }`}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export default function TasksView() {
  const [tasks, setTasks] = useState<TaskState>({ todo: [], doing: [], done: [] })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskTag, setNewTaskTag] = useState('英語')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/tasks')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tasks')
      }

      // Group tasks by column
      const tasksByColumn: TaskState = {
        todo: data.tasks.filter((t: Task) => t.column === 'todo').sort((a: Task, b: Task) => a.order - b.order),
        doing: data.tasks.filter((t: Task) => t.column === 'doing').sort((a: Task, b: Task) => a.order - b.order),
        done: data.tasks.filter((t: Task) => t.column === 'done').sort((a: Task, b: Task) => a.order - b.order),
      }

      setTasks(tasksByColumn)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find which column the task is in
    const findTaskColumn = (taskId: string): keyof TaskState | null => {
      if (tasks.todo.find(t => t.id === taskId)) return 'todo'
      if (tasks.doing.find(t => t.id === taskId)) return 'doing'
      if (tasks.done.find(t => t.id === taskId)) return 'done'
      return null
    }

    const activeColumn = findTaskColumn(activeId)
    const overColumn = findTaskColumn(overId)

    if (!activeColumn) return

    // Same column reordering
    if (activeColumn === overColumn && activeColumn) {
      const columnTasks = [...tasks[activeColumn]]
      const activeIndex = columnTasks.findIndex(t => t.id === activeId)
      const overIndex = columnTasks.findIndex(t => t.id === overId)

      if (activeIndex !== overIndex) {
        // Optimistically update UI
        const [movedTask] = columnTasks.splice(activeIndex, 1)
        columnTasks.splice(overIndex, 0, movedTask)

        setTasks({
          ...tasks,
          [activeColumn]: columnTasks,
        })

        // Call API
        try {
          const response = await fetch('/api/tasks/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taskId: activeId,
              sourceColumn: activeColumn,
              destinationColumn: activeColumn,
              destinationIndex: overIndex,
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to reorder tasks')
          }

          // Refresh tasks from server to ensure sync
          await fetchTasks()
        } catch (error) {
          console.error('Failed to reorder tasks:', error)
          setError('Failed to save changes')
          // Revert on error
          await fetchTasks()
        }
      }
    }
    // Move to different column
    else if (overColumn && activeColumn !== overColumn) {
      const sourceColumn = [...tasks[activeColumn]]
      const destColumn = [...tasks[overColumn]]
      const taskIndex = sourceColumn.findIndex(t => t.id === activeId)
      const [movedTask] = sourceColumn.splice(taskIndex, 1)
      destColumn.push(movedTask)

      // Optimistically update UI
      setTasks({
        ...tasks,
        [activeColumn]: sourceColumn,
        [overColumn]: destColumn,
      })

      // Call API
      try {
        const response = await fetch('/api/tasks/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: activeId,
            sourceColumn: activeColumn,
            destinationColumn: overColumn,
            destinationIndex: destColumn.length - 1,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to move task')
        }

        // Refresh tasks from server
        await fetchTasks()
      } catch (error) {
        console.error('Failed to move task:', error)
        setError('Failed to save changes')
        // Revert on error
        await fetchTasks()
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const addNewTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          tag: newTaskTag,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create task')
      }

      setNewTaskTitle('')
      setNewTaskTag('英語')
      setShowNewTaskModal(false)

      // Refresh tasks
      await fetchTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
      setError(error instanceof Error ? error.message : 'Failed to create task')
    }
  }

  const activeTask = activeId
    ? tasks.todo.find(t => t.id === activeId) ||
      tasks.doing.find(t => t.id === activeId) ||
      tasks.done.find(t => t.id === activeId)
    : null

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">タスクを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900">タスク管理</h1>
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新しいタスク
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-3 gap-6">
          <DroppableColumn
            id="todo"
            title="やること"
            icon={Circle}
            tasks={tasks.todo}
            count={tasks.todo.length}
            color="text-gray-500"
          />
          <DroppableColumn
            id="doing"
            title="進行中"
            icon={Circle}
            tasks={tasks.doing}
            count={tasks.doing.length}
            color="text-blue-500"
          />
          <DroppableColumn
            id="done"
            title="完了"
            icon={CheckCircle2}
            tasks={tasks.done}
            count={tasks.done.length}
            color="text-green-500"
          />
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl p-5 shadow-2xl border border-gray-100/50 rotate-3">
              <div className="flex items-start gap-3">
                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-3">{activeTask.title}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {activeTask.tag}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">新しいタスク</h2>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タスク名
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
                  placeholder="例: 英単語100語を覚える"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ
                </label>
                <select
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="英語">英語</option>
                  <option value="数学">数学</option>
                  <option value="IT">IT</option>
                  <option value="一般">一般</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={addNewTask}
                  disabled={!newTaskTitle.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
