import { NextRequest, NextResponse } from 'next/server'
import { taskStore } from '@/lib/taskStore'

// PUT: Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, tag, column } = body
    const taskId = params.id

    const updatedTask = taskStore.updateTask(taskId, {
      ...(title && { title }),
      ...(tag && { tag }),
      ...(column && { column }),
    })

    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Task not found', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({ task: updatedTask, success: true })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task', success: false },
      { status: 500 }
    )
  }
}

// DELETE: Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    const deletedTask = taskStore.deleteTask(taskId)

    if (!deletedTask) {
      return NextResponse.json(
        { error: 'Task not found', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({ task: deletedTask, success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task', success: false },
      { status: 500 }
    )
  }
}
