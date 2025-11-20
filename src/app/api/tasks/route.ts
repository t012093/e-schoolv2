import { NextRequest, NextResponse } from 'next/server'
import { taskStore } from '@/lib/taskStore'

// GET: Fetch all tasks
export async function GET() {
  try {
    const tasks = taskStore.getAllTasks()
    return NextResponse.json({ tasks, success: true })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks', success: false },
      { status: 500 }
    )
  }
}

// POST: Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, tag } = body

    if (!title || !tag) {
      return NextResponse.json(
        { error: 'Title and tag are required', success: false },
        { status: 400 }
      )
    }

    const newTask = taskStore.createTask(title, tag)

    return NextResponse.json({ task: newTask, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task', success: false },
      { status: 500 }
    )
  }
}
