'use client'

import React from 'react'
import { Award, TrendingUp, Target, Calendar, Settings, LogOut, ChevronRight } from 'lucide-react'

const badges = [
  { emoji: '🔥', label: '7日連続', unlocked: true },
  { emoji: '⭐', label: '100時間', unlocked: true },
  { emoji: '🎯', label: '目標達成', unlocked: true },
  { emoji: '🏆', label: 'チャンピオン', unlocked: false },
  { emoji: '💎', label: 'マスター', unlocked: false },
  { emoji: '👑', label: 'レジェンド', unlocked: false },
]

const menuItems = [
  { icon: Settings, label: '設定', color: 'text-gray-600' },
  { icon: Calendar, label: '学習履歴', color: 'text-blue-600' },
  { icon: Target, label: '目標設定', color: 'text-green-600' },
  { icon: LogOut, label: 'ログアウト', color: 'text-red-600' },
]

export default function ProfileScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-b-3xl p-6 pt-12 pb-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-4xl">
            👤
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">山田太郎</h1>
            <p className="text-white/90 text-sm">戦略家タイプ 🎯</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">レベル 12</span>
            <span className="text-sm">850 / 1000 XP</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: '85%' }}
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-20">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 -mt-6 mb-6">
          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-5 shadow-xl hover:shadow-2xl border border-gray-100/50 transition-all">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 text-center">147</p>
            <p className="text-xs text-gray-500 text-center">学習時間</p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-5 shadow-xl hover:shadow-2xl border border-gray-100/50 transition-all">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 text-center">42</p>
            <p className="text-xs text-gray-500 text-center">完了数</p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-5 shadow-xl hover:shadow-2xl border border-gray-100/50 transition-all">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 text-center">3</p>
            <p className="text-xs text-gray-500 text-center">バッジ</p>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl p-6 shadow-md hover:shadow-xl border border-gray-100/50 mb-6 transition-all">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            獲得バッジ
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-sm hover:shadow-md'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100/50 opacity-50 grayscale border border-gray-100/50'
                }`}
              >
                <span className="text-4xl">{badge.emoji}</span>
                <span className="text-xs font-medium text-gray-700 text-center">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100/50 transition-all">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                className={`w-full flex items-center justify-between p-5 ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                } hover:bg-gray-50 active:bg-gray-100 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            )
          })}
        </div>

        {/* Personality Card */}
        <div className="mt-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-purple-200 shadow-md hover:shadow-xl transition-all">
          <div className="flex items-start gap-3">
            <span className="text-4xl">🎯</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">あなたは「戦略家タイプ」</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                計画的で目標達成力が高いあなた。構造化された学習と明確なマイルストーンが最適です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
