'use client'

import { 
  Search, 
  FileText, 
  Globe, 
  ChevronDown,
  PanelLeft,
  CheckSquare,
  BarChart3,
  Plus
} from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useTasks } from '../hooks/useTasks'
import { KanbanColumn } from '../components/KanbanColumn'
import { TaskCard } from '../components/TaskCard'

export default function CapyDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('tasks')
  
  // Kanban functionality
  const { tasks, moveTask, moveTaskWithinColumn } = useTasks()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )

  const tasksByStatus = useMemo(() => ({
    todo: tasks.filter(task => task.status === 'todo'),
    inProgress: tasks.filter(task => task.status === 'inProgress'),
    done: tasks.filter(task => task.status === 'done')
  }), [tasks])

  const { todo: todoTasks, inProgress: inProgressTasks, done: doneTasks } = tasksByStatus

  const activeTask = useMemo(() => {
    return activeId ? tasks.find(task => task.id === activeId) : null
  }, [activeId, tasks])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Only handle visual feedback during drag - no actual task moving
    // This prevents the immediate "snapping" behavior
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) {
      setActiveId(null)
      return
    }

    const activeTask = tasks.find(task => task.id === activeId)
    const overTask = tasks.find(task => task.id === overId)

    if (!activeTask) {
      setActiveId(null)
      return
    }

    // Check if dropping over a column (status change)
    const isOverAColumn = ['todo', 'inProgress', 'done'].includes(overId)
    
    if (isOverAColumn && activeTask.status !== overId) {
      // Move task to different column
      moveTask(activeId, overId as any)
    } else if (overTask && activeTask.status === overTask.status) {
      // Reorder within the same column
      const tasksInColumn = tasks.filter(task => task.status === activeTask.status)
      const activeIndex = tasksInColumn.findIndex(task => task.id === activeId)
      const overIndex = tasksInColumn.findIndex(task => task.id === overId)
      
      const newOrder = arrayMove(tasksInColumn, activeIndex, overIndex)
      moveTaskWithinColumn(activeTask.status, newOrder)
    }

    setActiveId(null)
  }, [tasks, moveTask, moveTaskWithinColumn])

  const taskStats = useMemo(() => ({
    total: tasks.length,
    completed: doneTasks.length,
    inProgress: inProgressTasks.length
  }), [tasks.length, doneTasks.length, inProgressTasks.length])

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-200 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-12 px-2.5 pt-2">
          <div className={`${sidebarCollapsed ? 'hidden' : 'flex-1'}`}>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-transparent hover:bg-gray-50 rounded w-full justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-sm"></div>
                {!sidebarCollapsed && <span className="text-gray-600">Select project...</span>}
              </div>
              {!sidebarCollapsed && <ChevronDown className="w-4 h-4 opacity-50" />}
            </button>
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Search Button */}
        <div className="px-2.5 mb-2">
          <button className="flex items-center gap-2.5 w-full p-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md shadow-sm">
            <Search className="w-4.5 h-4.5" />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left text-sm">Search</span>
                <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-gray-50 px-1.5 text-xs font-mono text-gray-500">
                  <span>⌘</span>K
                </kbd>
              </>
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2.5">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveSection('tasks')}
                className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors ${
                  activeSection === 'tasks' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <CheckSquare className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Tasks</span>}
              </button>
            </li>
            <li>
              <a
                href="/plans"
                className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors ${
                  'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="w-4.5 h-4.5 inline-flex items-center justify-center">📚</span>
                {!sidebarCollapsed && <span>Plans</span>}
              </a>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('kanban')}
                className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors ${
                  activeSection === 'kanban' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Kanban Board</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('files')}
                className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors ${
                  activeSection === 'files' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Files</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('apps')}
                className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors ${
                  activeSection === 'apps' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Globe className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Apps</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {activeSection}
            </h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                {activeSection === 'kanban' ? 'Add Task' : `New ${activeSection.slice(0, -1)}`}
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeSection === 'tasks' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Project Tasks</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">3 active tasks</span>
                    <button
                      onClick={() => setActiveSection('kanban')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors"
                    >
                      View Kanban
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                    <span className="flex-1">Implement user authentication</span>
                    <span className="text-xs text-gray-500">Due today</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                    <span className="flex-1">Setup database connection</span>
                    <span className="text-xs text-gray-500">Due tomorrow</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                    <span className="flex-1">Create API endpoints</span>
                    <span className="text-xs text-gray-500">Due in 3 days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'files' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Project Files</h3>
                  <span className="text-sm text-gray-500">12 files</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="flex-1">package.json</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="flex-1">src/app/page.tsx</span>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span className="flex-1">tailwind.config.js</span>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'apps' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Deployed Apps</h3>
                  <span className="text-sm text-gray-500">2 apps running</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-md border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Production App</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Main application deployment</p>
                    <button className="text-sm text-blue-600 hover:text-blue-700">View →</button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">Staging App</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Development preview</p>
                    <button className="text-sm text-blue-600 hover:text-blue-700">View →</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'kanban' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-semibold text-gray-900">{taskStats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <span className="text-blue-500 font-semibold">{taskStats.total}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-semibold text-gray-900">{taskStats.completed}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <span className="text-green-500 font-semibold">{taskStats.completed}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-2xl font-semibold text-gray-900">{taskStats.inProgress}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-500 font-semibold">{taskStats.inProgress}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kanban Board */}
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
                  <KanbanColumn
                    title="To Do"
                    status="todo"
                    tasks={todoTasks}
                    taskCount={todoTasks.length}
                  />
                  <KanbanColumn
                    title="In Progress"
                    status="inProgress"
                    tasks={inProgressTasks}
                    taskCount={inProgressTasks.length}
                  />
                  <KanbanColumn
                    title="Done"
                    status="done"
                    tasks={doneTasks}
                    taskCount={doneTasks.length}
                  />
                </div>
                <DragOverlay>
                  {activeTask && (
                    <div className="transform rotate-2 scale-105 shadow-2xl">
                      <TaskCard task={activeTask} />
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
