import { NextRequest, NextResponse } from 'next/server'
import { taskStore } from '@/lib/taskStore'

interface ReorderRequest {
  taskId: string
  sourceColumn: 'todo' | 'doing' | 'done'
  destinationColumn: 'todo' | 'doing' | 'done'
  destinationIndex: number
}

// PUT: Reorder tasks (drag and drop)
export async function PUT(request: NextRequest) {
  try {
    const body: ReorderRequest = await request.json()
    const { taskId, sourceColumn, destinationColumn, destinationIndex } = body

    const updatedTasks = taskStore.reorderTasks(
      taskId,
      sourceColumn,
      destinationColumn,
      destinationIndex
    )

    if (!updatedTasks) {
      return NextResponse.json(
        { error: 'Task not found', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      tasks: updatedTasks,
      success: true
    })
  } catch (error) {
    console.error('Error reordering tasks:', error)
    return NextResponse.json(
      { error: 'Failed to reorder tasks', success: false },
      { status: 500 }
    )
  }
}
