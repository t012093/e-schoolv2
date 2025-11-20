export interface Task {
  id: string
  title: string
  tag: string
  column: 'todo' | 'doing' | 'done'
  order: number
  createdAt: string
  updatedAt: string
}

// Global in-memory store (persists during server runtime)
// In production, replace with a database
class TaskStore {
  private tasks: Task[] = [
    {
      id: '1',
      title: '英単語100語を覚える',
      tag: '英語',
      column: 'todo',
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: '数学の問題集を解く',
      tag: '数学',
      column: 'todo',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'リスニング練習30分',
      tag: '英語',
      column: 'doing',
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'プログラミング課題',
      tag: 'IT',
      column: 'doing',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      title: '文法の復習',
      tag: '英語',
      column: 'done',
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'レポート提出',
      tag: '一般',
      column: 'done',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  getAllTasks(): Task[] {
    return [...this.tasks]
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find(t => t.id === id)
  }

  createTask(title: string, tag: string): Task {
    const todoTasks = this.tasks.filter(t => t.column === 'todo')
    const maxOrder = todoTasks.length > 0
      ? Math.max(...todoTasks.map(t => t.order))
      : -1

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      tag,
      column: 'todo',
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.tasks.push(newTask)
    return newTask
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const taskIndex = this.tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) return null

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      id: this.tasks[taskIndex].id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    }

    return this.tasks[taskIndex]
  }

  deleteTask(id: string): Task | null {
    const taskIndex = this.tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) return null

    const deletedTask = this.tasks[taskIndex]
    this.tasks.splice(taskIndex, 1)
    return deletedTask
  }

  reorderTasks(
    taskId: string,
    sourceColumn: 'todo' | 'doing' | 'done',
    destinationColumn: 'todo' | 'doing' | 'done',
    destinationIndex: number
  ): Task[] | null {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return null

    const task = this.tasks[taskIndex]

    // Get tasks from source and destination columns
    let sourceColumnTasks = this.tasks.filter(t => t.column === sourceColumn)
    let destColumnTasks = this.tasks.filter(t => t.column === destinationColumn)

    // If moving to a different column
    if (sourceColumn !== destinationColumn) {
      // Remove from source
      sourceColumnTasks = sourceColumnTasks.filter(t => t.id !== taskId)
      // Update task's column
      task.column = destinationColumn
      // Add to destination
      destColumnTasks = destColumnTasks.filter(t => t.id !== taskId)
      destColumnTasks.splice(destinationIndex, 0, task)
    } else {
      // Same column reordering
      const currentIndex = sourceColumnTasks.findIndex(t => t.id === taskId)
      sourceColumnTasks.splice(currentIndex, 1)
      sourceColumnTasks.splice(destinationIndex, 0, task)
      destColumnTasks = sourceColumnTasks
    }

    // Update orders for affected columns
    sourceColumnTasks.forEach((t, index) => {
      const taskIdx = this.tasks.findIndex(task => task.id === t.id)
      if (taskIdx !== -1) {
        this.tasks[taskIdx].order = index
        this.tasks[taskIdx].updatedAt = new Date().toISOString()
      }
    })

    if (sourceColumn !== destinationColumn) {
      destColumnTasks.forEach((t, index) => {
        const taskIdx = this.tasks.findIndex(task => task.id === t.id)
        if (taskIdx !== -1) {
          this.tasks[taskIdx].order = index
          this.tasks[taskIdx].updatedAt = new Date().toISOString()
          if (t.id === taskId) {
            this.tasks[taskIdx].column = destinationColumn
          }
        }
      })
    }

    return this.getAllTasks()
  }
}

// Export a singleton instance
export const taskStore = new TaskStore()
