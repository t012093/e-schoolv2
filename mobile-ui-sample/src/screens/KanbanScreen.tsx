'use client'

import React, { useState } from 'react'
import { Plus, Circle, CheckCircle2 } from 'lucide-react'

const tasks = {
  todo: [
    { id: 1, title: '英単語100語を覚える', tag: '英語', color: 'blue' },
    { id: 2, title: '数学の問題集を解く', tag: '数学', color: 'purple' },
  ],
  doing: [
    { id: 3, title: 'リスニング練習30分', tag: '英語', color: 'blue' },
    { id: 4, title: 'プログラミング課題', tag: 'IT', color: 'green' },
  ],
  done: [
    { id: 5, title: '文法の復習', tag: '英語', color: 'blue' },
    { id: 6, title: 'レポート提出', tag: '一般', color: 'gray' },
  ]
}

const columns = [
  { id: 'todo', label: 'やること', icon: Circle, color: 'gray', count: tasks.todo.length },
  { id: 'doing', label: '進行中', icon: Circle, color: 'blue', count: tasks.doing.length },
  { id: 'done', label: '完了', icon: CheckCircle2, color: 'green', count: tasks.done.length },
]

export default function KanbanScreen() {
  const [activeColumn, setActiveColumn] = useState(0)
  const columnData = columns[activeColumn]
  const columnTasks = tasks[columnData.id as keyof typeof tasks]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="p-6 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">タスク</h1>
          <button className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center shadow-lg active:scale-95 transition-all">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Column Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {columns.map((column, index) => {
            const Icon = column.icon
            const isActive = activeColumn === index
            return (
              <button
                key={column.id}
                onClick={() => setActiveColumn(index)}
                className={`flex-shrink-0 px-6 py-3 rounded-3xl flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gradient-to-br from-white to-gray-50/50 text-gray-600 border border-gray-100/50 shadow-sm hover:shadow-md'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{column.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/30' : 'bg-gray-100'
                }`}>
                  {column.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tasks */}
      <div className="px-6 space-y-3 pb-20">
        {columnTasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-gray-500">タスクがありません</p>
          </div>
        ) : (
          columnTasks.map((task) => (
            <div
              key={task.id}
              className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl p-6 shadow-md hover:shadow-xl border border-gray-100/50 active:scale-95 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900 flex-1">
                  {task.title}
                </h3>
                <div className={`w-2 h-2 rounded-full ${
                  task.color === 'blue' ? 'bg-blue-500' :
                  task.color === 'purple' ? 'bg-purple-500' :
                  task.color === 'green' ? 'bg-green-500' :
                  'bg-gray-400'
                }`} />
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  task.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                  task.color === 'green' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.tag}
                </span>

                {columnData.id === 'done' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">完了</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Swipe Indicator */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center gap-2 pointer-events-none">
        {columns.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              activeColumn === index ? 'bg-green-500 w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
