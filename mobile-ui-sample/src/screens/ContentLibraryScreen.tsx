'use client'

import React, { useState } from 'react'
import { Search, Video, FileText, PenTool, Play, Clock } from 'lucide-react'

const contentTypes = [
  { id: 'all', label: '全て', icon: '📚' },
  { id: 'video', label: '動画', icon: '📹' },
  { id: 'article', label: '記事', icon: '📄' },
  { id: 'exercise', label: '演習', icon: '✍️' },
]

const contents = [
  {
    id: 1,
    type: 'video',
    title: '英単語1000：基礎編',
    duration: '15分',
    progress: 60,
    thumbnail: '🎥',
    difficulty: '初級'
  },
  {
    id: 2,
    type: 'article',
    title: '英文法の基礎完全ガイド',
    duration: '20分',
    progress: 0,
    thumbnail: '📖',
    difficulty: '中級'
  },
  {
    id: 3,
    type: 'exercise',
    title: 'リスニング練習 Lesson 3',
    duration: '25分',
    progress: 100,
    thumbnail: '🎧',
    difficulty: '中級'
  },
  {
    id: 4,
    type: 'video',
    title: '発音トレーニング基礎',
    duration: '18分',
    progress: 30,
    thumbnail: '🗣️',
    difficulty: '初級'
  },
]

export default function ContentLibraryScreen() {
  const [activeType, setActiveType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredContents = contents.filter(content =>
    (activeType === 'all' || content.type === activeType) &&
    content.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="p-6 pt-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">学習コンテンツ</h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="コンテンツを検索..."
            className="w-full pl-12 pr-4 py-4 bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-100/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:shadow-md text-gray-900 transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full flex items-center gap-2 transition-all ${
                activeType === type.id
                  ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg scale-105'
                  : 'bg-gradient-to-br from-white to-gray-50/50 text-gray-600 border border-gray-100/50 shadow-sm hover:shadow-md'
              }`}
            >
              <span>{type.icon}</span>
              <span className="font-medium text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="px-6 pb-20 space-y-4">
        {filteredContents.map((content) => (
          <div
            key={content.id}
            className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100/50 active:scale-95 transition-all cursor-pointer"
          >
            <div className="p-6">
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl flex-shrink-0 shadow-sm">
                  {content.thumbnail}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                    {content.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{content.duration}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className={`px-2 py-0.5 rounded-full ${
                      content.difficulty === '初級'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {content.difficulty}
                    </span>
                  </div>

                  {/* Progress */}
                  {content.progress > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">進捗</span>
                        <span className="font-semibold text-green-600">{content.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all"
                          style={{ width: `${content.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button className="mt-4 w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-medium rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md hover:shadow-lg">
                <Play className="w-4 h-4" />
                {content.progress === 100 ? '復習する' : content.progress > 0 ? '続きから' : '学習を始める'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
