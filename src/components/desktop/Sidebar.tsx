'use client'

import { Home, CheckSquare, BookOpen, Heart, MessageSquare, User, Sparkles } from 'lucide-react'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

const menuItems = [
  { id: 'dashboard', icon: Home, label: 'ホーム', color: 'text-blue-500' },
  { id: 'tasks', icon: CheckSquare, label: 'タスク', color: 'text-green-500' },
  { id: 'learning', icon: BookOpen, label: '学習', color: 'text-purple-500' },
  { id: 'wellbeing', icon: Heart, label: '体調', color: 'text-pink-500' },
  { id: 'ai', icon: MessageSquare, label: 'AIコーチ', color: 'text-indigo-500' },
  { id: 'profile', icon: User, label: 'プロフィール', color: 'text-gray-500' },
]

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <div className="w-72 bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/50 shadow-xl flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">学習プラットフォーム</h1>
            <p className="text-xs text-gray-500">あなたの成長をサポート</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-100/80 hover:shadow-md'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-bold">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">山田太郎</p>
            <p className="text-xs text-gray-500">レベル 12</p>
          </div>
        </div>
      </div>
    </div>
  )
}
