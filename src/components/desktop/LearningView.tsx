'use client'

import { Search, Play, Clock } from 'lucide-react'

const contents = [
  { id: 1, title: '英単語1000：基礎編', duration: '15分', progress: 60, emoji: '🎥', difficulty: '初級' },
  { id: 2, title: '英文法の基礎完全ガイド', duration: '20分', progress: 0, emoji: '📖', difficulty: '中級' },
  { id: 3, title: 'リスニング練習 Lesson 3', duration: '25分', progress: 100, emoji: '🎧', difficulty: '中級' },
  { id: 4, title: '発音トレーニング基礎', duration: '18分', progress: 30, emoji: '🗣️', difficulty: '初級' },
]

export default function LearningView() {
  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900">学習コンテンツ</h1>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="コンテンツを検索..."
          className="w-full pl-14 pr-6 py-4 bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-100/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:shadow-md text-gray-900 transition-all"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {contents.map((content) => (
          <div
            key={content.id}
            className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100/50 transition-all cursor-pointer group"
          >
            <div className="p-6">
              <div className="flex gap-5">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-5xl flex-shrink-0 shadow-sm">
                  {content.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{content.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{content.duration}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full ${
                      content.difficulty === '初級' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {content.difficulty}
                    </span>
                  </div>
                  {content.progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">進捗</span>
                        <span className="font-semibold text-green-600">{content.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                          style={{ width: `${content.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button className="mt-5 w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-medium rounded-2xl flex items-center justify-center gap-2 group-hover:shadow-lg transition-all">
                <Play className="w-5 h-5" />
                {content.progress === 100 ? '復習する' : content.progress > 0 ? '続きから' : '学習を始める'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
