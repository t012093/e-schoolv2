'use client'

import { 
  Search, 
  FileText, 
  Globe, 
  ChevronDown,
  PanelLeft,
  CheckSquare,
  BarChart3,
  Plus,
  BookOpen,
  User,
  Settings,
  Bell,
  LayoutDashboard,
  Calendar
} from 'lucide-react'
import { useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useTasks } from '../hooks/useTasks'
import { KanbanColumn } from '../components/KanbanColumn'
import { TaskCard } from '../components/TaskCard'

export default function CapyDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  
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
                onClick={() => setActiveSection('dashboard')}
                className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors ${
                  activeSection === 'dashboard' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </button>
            </li>
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
              <button
                onClick={() => setActiveSection('plans')}
                className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors ${
                  activeSection === 'plans' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Plans</span>}
              </button>
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
                onClick={() => setActiveSection('calendar')}
                className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors ${
                  activeSection === 'calendar' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Calendar</span>}
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

          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>

          {/* User & Settings Section */}
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveSection('notifications')}
                className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors relative ${
                  activeSection === 'notifications' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Bell className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Notifications</span>}
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('profile')}
                className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors ${
                  activeSection === 'profile' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <User className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Profile</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('settings')}
                className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors ${
                  activeSection === 'settings' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Settings</span>}
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
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-semibold text-gray-900">{taskStats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <CheckSquare className="w-6 h-6 text-blue-500" />
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
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
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
                      <div className="w-6 h-6 bg-yellow-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                    <span className="text-sm text-gray-500">Last 24 hours</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Task completed</p>
                        <p className="text-xs text-gray-500">Implement user authentication</p>
                      </div>
                      <span className="text-xs text-gray-400">2h ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-md">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New task created</p>
                        <p className="text-xs text-gray-500">Setup database connection</p>
                      </div>
                      <span className="text-xs text-gray-400">4h ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">File updated</p>
                        <p className="text-xs text-gray-500">package.json modified</p>
                      </div>
                      <span className="text-xs text-gray-400">6h ago</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveSection('tasks')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <CheckSquare className="w-6 h-6 text-blue-500 mb-2" />
                      <p className="text-sm font-medium">Add Task</p>
                      <p className="text-xs text-gray-500">Create new task</p>
                    </button>
                    <button
                      onClick={() => setActiveSection('kanban')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <BarChart3 className="w-6 h-6 text-green-500 mb-2" />
                      <p className="text-sm font-medium">View Board</p>
                      <p className="text-xs text-gray-500">Open kanban view</p>
                    </button>
                    <button
                      onClick={() => setActiveSection('calendar')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Calendar className="w-6 h-6 text-purple-500 mb-2" />
                      <p className="text-sm font-medium">Schedule</p>
                      <p className="text-xs text-gray-500">View calendar</p>
                    </button>
                    <button
                      onClick={() => setActiveSection('files')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <FileText className="w-6 h-6 text-orange-500 mb-2" />
                      <p className="text-sm font-medium">Browse Files</p>
                      <p className="text-xs text-gray-500">Access project files</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'plans' && (
            <PlansInlineView />
          )}
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

          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">John Doe</h3>
                    <p className="text-gray-600">john.doe@example.com</p>
                    <p className="text-sm text-gray-500">Software Developer</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium mb-4">Personal Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Full Name</label>
                      <p className="font-medium">John Doe</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium">john.doe@example.com</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Phone</label>
                      <p className="font-medium">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Location</label>
                      <p className="font-medium">San Francisco, CA</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium mb-4">Activity Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasks Completed</span>
                      <span className="font-medium">{taskStats.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projects</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Team Members</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium">Jan 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Application Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Appearance</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Theme</label>
                        <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                          <option>Light</option>
                          <option>Dark</option>
                          <option>System</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Sidebar</label>
                        <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                          <option>Always visible</option>
                          <option>Auto-collapse</option>
                          <option>Hidden</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-3">Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Task Reminders</label>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Email Notifications</label>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Desktop Notifications</label>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-3">Privacy</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Profile Visibility</label>
                        <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                          <option>Public</option>
                          <option>Team Only</option>
                          <option>Private</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Activity Tracking</label>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Mark all as read</button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Task deadline approaching</p>
                      <p className="text-sm text-gray-600">Implement user authentication is due tomorrow</p>
                      <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Task completed</p>
                      <p className="text-sm text-gray-600">Setup database connection has been marked as done</p>
                      <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">New team member</p>
                      <p className="text-sm text-gray-600">Sarah joined the development team</p>
                      <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">File updated</p>
                      <p className="text-sm text-gray-600">Documentation has been updated with new guidelines</p>
                      <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'calendar' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Calendar</h3>
                  <div className="flex items-center gap-3">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-md">Today</button>
                    <div className="flex border border-gray-300 rounded-md">
                      <button className="px-3 py-1 text-sm hover:bg-gray-50">‹</button>
                      <button className="px-3 py-1 text-sm hover:bg-gray-50">›</button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({length: 35}, (_, i) => {
                    const day = (i % 31) + 1
                    const isToday = day === 15
                    const hasEvent = [3, 7, 15, 22, 28].includes(day)
                    
                    return (
                      <div 
                        key={i}
                        className={`min-h-[60px] p-1 border border-gray-100 ${
                          isToday ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`text-sm ${isToday ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        {hasEvent && (
                          <div className="mt-1">
                            <div className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                              Task due
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="font-medium mb-4">Upcoming Deadlines</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-md border-l-4 border-red-500">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Implement user authentication</p>
                      <p className="text-xs text-gray-500">Due tomorrow</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-md border-l-4 border-yellow-500">
                    <Calendar className="w-4 h-4 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Setup database connection</p>
                      <p className="text-xs text-gray-500">Due in 2 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Create API endpoints</p>
                      <p className="text-xs text-gray-500">Due in 3 days</p>
                    </div>
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

// ---------------- Plans inline view (no routing) ----------------
type OnboardingState = {
  goals?: string[]
  schedule?: { days: string[]; time: string; durationMin: number }
  style?: { mode?: string; pace?: string; channels?: string[] }
}

type Plan = {
  id: string
  subject: string
  progress: number
  scheduleText: string
  nextAction: string
  modules: { title: string; done: number; total: number }[]
  resources: { kind: 'video' | 'article' | 'exercise'; title: string; duration?: string }[]
}

function useHasMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return mounted
}

function useOnboardingData() {
  const mounted = useHasMounted()
  const [goals, setGoals] = useState<string[]>([])
  const [schedule, setSchedule] = useState<OnboardingState['schedule']>(undefined)
  const [style, setStyle] = useState<OnboardingState['style']>(undefined)

  useEffect(() => {
    if (!mounted) return
    try {
      const raw = localStorage.getItem('onboarding.sample.v1')
      if (raw) {
        const s: OnboardingState = JSON.parse(raw)
        if (Array.isArray(s.goals)) setGoals(s.goals)
        if (s.schedule) setSchedule(s.schedule)
        if (s.style) setStyle(s.style)
      }
    } catch {}
  }, [mounted])

  return { mounted, goals, schedule, style }
}

function buildPlan(subject: string, schedule?: OnboardingState['schedule']): Plan {
  const baseModules: Record<string, Plan['modules']> = {
    '英語': [
      { title: '語彙（頻出1000）', done: 12, total: 20 },
      { title: '文法（時制/関係詞）', done: 8, total: 18 },
      { title: 'リスニング基礎', done: 3, total: 12 },
    ],
    '数学': [
      { title: '計算・関数の復習', done: 6, total: 12 },
      { title: '図形と証明入門', done: 2, total: 10 },
    ],
  }
  const modules = baseModules[subject] ?? [
    { title: `${subject}の基礎`, done: 1, total: 8 },
    { title: `${subject}の応用`, done: 0, total: 6 },
  ]
  const total = modules.reduce((a, m) => a + m.total, 0)
  const done = modules.reduce((a, m) => a + m.done, 0)
  const progress = Math.round((done / Math.max(total, 1)) * 100)
  const scheduleText = schedule
    ? `毎${(schedule.days || []).join('・') || '未設定'} ${schedule.time || ''} / ${schedule.durationMin || 30}分`
    : 'スケジュール未設定'
  const nextAction = subject === '英語' ? '「語彙：ユニット13」を10分' : '次のモジュールを開始'
  const resources: Plan['resources'] = subject === '英語'
    ? [
        { kind: 'video', title: '英単語1000：Unit 13', duration: '8分' },
        { kind: 'article', title: '時制の要点まとめ' },
        { kind: 'exercise', title: 'リスニング基礎：Lesson 3', duration: '10分' },
      ]
    : [
        { kind: 'article', title: `${subject}の基礎まとめ` },
        { kind: 'exercise', title: `${subject}ドリル：#1`, duration: '10分' },
      ]
  return { id: subject, subject, progress, scheduleText, nextAction, modules, resources }
}

function PlansInlineView() {
  const { mounted, goals, schedule, style } = useOnboardingData()
  const subjects = goals.length ? goals : ['英語', '数学']
  const [active, setActive] = useState<string>(subjects[0])
  const [activeTab, setActiveTab] = useState<'overview'|'roadmap'|'sessions'|'resources'|'metrics'>('overview')

  useEffect(() => {
    // ensure there is always a valid selection when goals change
    if (!subjects.includes(active)) setActive(subjects[0])
  }, [subjects.join(','), active])

  const plans = useMemo(() => subjects.map(s => buildPlan(s, schedule)), [subjects.join(','), schedule?.time, schedule?.durationMin, (schedule?.days || []).join(',')])
  const current = plans.find(p => p.id === active)

  return (
    <div className="space-y-4">
      {/* Header: subject toggle + actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">学習プラン</h3>
          <a href="/onboarding" className="text-sm text-blue-600 hover:text-blue-700">再生成 →</a>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          {/* Subject toggle */}
          <div className="flex flex-wrap gap-2">
            {subjects.map(s => (
              <button key={s} onClick={() => setActive(s)} className={`px-3 py-1.5 text-sm rounded-full border ${active === s ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
          {/* Quick action */}
          <div className="hidden sm:flex items-center gap-2">
            <button className="px-3 py-2 text-sm rounded-md border">編集</button>
            <button className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">今すぐ始める</button>
            <a href="/plan/roadmap" className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50">全体ロードマップ</a>
            <a href="/plan/curriculum" className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50">カリキュラム</a>
          </div>
        </div>
        {/* Tabs */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto">
          {[
            {key:'overview',label:'概要'},
            {key:'roadmap',label:'ロードマップ'},
            {key:'sessions',label:'セッション'},
            {key:'resources',label:'リソース'},
            {key:'metrics',label:'メトリクス'}
          ].map(t => (
            <button key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-3 py-1.5 text-sm rounded-md border ${activeTab===t.key ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-50'}`}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-medium">{current?.subject ?? '—'} 概要</h4>
                <p className="text-sm text-gray-600">次のアクション: {mounted ? (current?.nextAction ?? '—') : '—'}</p>
                <p className="text-xs text-gray-500">週の約束: {mounted ? `${(schedule?.days||[]).length || 0}回 × ${(schedule?.durationMin||0)}分` : '—'} / スケジュール: {mounted ? (current?.scheduleText ?? '—') : '—'}</p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">学習サイクル:</span>
                  <span className="px-2 py-0.5 text-xs rounded-full border bg-gray-50">Plan</span>
                  <span className="px-2 py-0.5 text-xs rounded-full border bg-blue-50 text-blue-700">Do</span>
                  <span className="px-2 py-0.5 text-xs rounded-full border bg-gray-50">Reflect</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <DonutProgress percent={current?.progress ?? 0} label="総進捗" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <OverviewCard title="目標" lines={[`${current?.subject ?? '—'}の基礎定着`, '到達レベル: 目安B1/準2級']} />
              <OverviewCard title="重点" lines={current ? current.modules.slice(0,2).map(m=>m.title) : ['—']} />
              <OverviewCard title="方法" lines={[`トーン: ${style?.mode || '—'}`, `ペース: ${style?.pace || '—'}`, `チャンネル: ${(style?.channels||[]).join('・') || '—'}`]} />
              <OverviewCard title="注意点" lines={[`忙しい日は軽量モード推奨`, `小ステップの成功体験を優先`]} />
            </div>
            <details className="mt-4">
              <summary className="text-sm text-gray-600 cursor-pointer">なぜこの計画？（AIの根拠を表示）</summary>
              <p className="mt-2 text-sm text-gray-600">最近の正答率と夜間の集中度から、今週は短時間演習を増やし、{current?.subject}の「{current?.modules[0]?.title ?? '基礎'}」に重点を置いています。</p>
            </details>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-medium mb-3">おすすめリソース</h4>
            <div className="space-y-3">
              {(mounted ? (current?.resources ?? []) : []).map((r, i) => (
                <div key={i} className="p-3 border rounded-md flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-gray-500">{r.kind}{r.duration ? ` ・ ${r.duration}` : ''}</p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">開く →</button>
                </div>
              ))}
              {!mounted && <div className="text-xs text-gray-400">読み込み中…</div>}
            </div>
            <div className="mt-5">
              <h5 className="font-medium mb-2 text-sm">学習ヒートマップ（最近5週）</h5>
              <StudyHeatmap scheduleDays={(schedule?.days||[])} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roadmap' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium mb-3">ロードマップ</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(mounted ? (current?.modules ?? []) : []).map(m => (
              <div key={m.title} className="p-3 border rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <span>{m.title}</span>
                  <span className="text-gray-500">{m.done}/{m.total}</span>
                </div>
                <div className="mt-1 h-1.5 bg-gray-200 rounded-full">
                  <div className="h-1.5 bg-green-600 rounded-full" style={{ width: `${Math.round((m.done/Math.max(m.total,1))*100)}%` }} />
                </div>
              </div>
            ))}
            {!mounted && <div className="text-xs text-gray-400">読み込み中…</div>}
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium mb-3">今週のセッション</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(mounted ? (schedule?.days || []) : []).map((d, i) => (
              <div key={`${d}-${i}`} className="p-3 border rounded-md">
                <div className="text-sm font-medium">{d} {schedule?.time}</div>
                <div className="text-xs text-gray-500">{current?.subject} / {schedule?.durationMin}分</div>
                <div className="mt-2 flex items-center gap-2">
                  <button className="px-2 py-1 text-xs rounded-md border">振替</button>
                  <button className="px-2 py-1 text-xs rounded-md border">軽量化</button>
                  <button className="px-2 py-1 text-xs rounded-md border bg-blue-50 text-blue-700">完了</button>
                </div>
              </div>
            ))}
            {(!mounted || (schedule?.days||[]).length===0) && (
              <div className="text-xs text-gray-400">スケジュール未設定です。オンボーディングで設定できます。</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium mb-3">おすすめリソース</h4>
          <div className="space-y-3">
            {(mounted ? (current?.resources ?? []) : []).map((r, i) => (
              <div key={i} className="p-3 border rounded-md flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.kind}{r.duration ? ` ・ ${r.duration}` : ''}</p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700">開く →</button>
              </div>
            ))}
            {!mounted && <div className="text-xs text-gray-400">読み込み中…</div>}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium mb-3">メトリクス</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="総進捗" value={`${current?.progress ?? 0}%`} />
            <Kpi label="今週セッション" value={mounted ? '2回' : '—'} />
            <Kpi label="平均学習時間" value={mounted ? '28分' : '—'} />
            <Kpi label="連続日数" value={mounted ? '4日' : '—'} />
          </div>
          <div className="mt-3 text-xs text-gray-500">トレンドや理解度推移は学習ログと連携して表示します。</div>
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md border bg-gray-50">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

function OverviewCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="p-3 rounded-md border bg-gray-50">
      <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
      <ul className="text-sm text-gray-600 space-y-1">
        {lines.map((l, i) => (
          <li key={i}>• {l}</li>
        ))}
      </ul>
    </div>
  )
}

// Visual components
function DonutProgress({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent || 0)))
  const style = {
    background: `conic-gradient(#2563eb ${clamped * 3.6}deg, #e5e7eb 0deg)`,
  } as React.CSSProperties
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-20 h-20 rounded-full" style={style}>
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center text-sm font-semibold">
          {clamped}%
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  )
}

// (Removed RoadmapTimeline - simplified grid is used in the Roadmap tab)

function StudyHeatmap({ scheduleDays }: { scheduleDays: string[] }) {
  // Render 5 weeks x 7 days grid; highlight scheduled days
  const days = ['月','火','水','木','金','土','日']
  const weeks = 5
  const scheduled = new Set(scheduleDays || [])
  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: weeks }).map((_, w) => (
        days.map((d, i) => {
          const isScheduled = scheduled.has(d)
          const tone = isScheduled ? 'bg-blue-500/70' : 'bg-gray-200'
          return <div key={`${w}-${i}`} className={`h-3 w-3 rounded ${tone}`} title={`${d} (W${w+1})`} />
        })
      ))}
    </div>
  )
}
