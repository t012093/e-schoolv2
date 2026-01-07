'use client'

import React, { useState } from 'react'
import { Moon, Activity, Heart, TrendingUp } from 'lucide-react'

const moodOptions = [
  { emoji: '😄', label: '最高', value: 5 },
  { emoji: '🙂', label: '良い', value: 4 },
  { emoji: '😐', label: '普通', value: 3 },
  { emoji: '😔', label: '微妙', value: 2 },
  { emoji: '😣', label: '悪い', value: 1 },
]

export default function WellbeingScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [sleepHours, setSleepHours] = useState(7)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="p-6 pt-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">体調管理</h1>
        <p className="text-gray-600">今日の調子を記録しましょう</p>
      </div>

      <div className="px-6 pb-20 space-y-6">
        {/* Mood Selection */}
        <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl p-6 shadow-md hover:shadow-xl border border-gray-100/50 transition-all">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">今日の気分は？</h2>
          <div className="flex justify-between gap-2">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-3xl transition-all ${
                  selectedMood === mood.value
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 scale-110 shadow-lg border border-purple-200'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100/50 hover:shadow-md border border-gray-100/50'
                }`}
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span className="text-xs font-medium text-gray-600">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl p-6 shadow-md hover:shadow-xl border border-gray-100/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Moon className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">睡眠時間</h2>
                <p className="text-sm text-gray-500">昨夜の睡眠</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-gray-900">{sleepHours}</span>
              <span className="text-lg text-gray-500">時間</span>
            </div>
          </div>

          {/* Sleep Slider */}
          <input
            type="range"
            min="0"
            max="12"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0h</span>
            <span>12h</span>
          </div>
        </div>

        {/* Stress Level */}
        <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl p-6 shadow-md hover:shadow-xl border border-gray-100/50 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">ストレスレベル</h2>
              <p className="text-sm text-gray-500">今日のストレス度</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">低い</span>
              <span className="text-gray-600">普通</span>
              <span className="text-gray-600">高い</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  className={`flex-1 h-14 rounded-2xl transition-all shadow-sm hover:shadow-md border ${
                    level === 1 ? 'bg-green-100 hover:bg-green-200 border-green-200' :
                    level === 2 ? 'bg-yellow-100 hover:bg-yellow-200 border-yellow-200' :
                    'bg-red-100 hover:bg-red-200 border-red-200'
                  }`}
                >
                  <span className="text-2xl">
                    {level === 1 ? '😌' : level === 2 ? '😐' : '😰'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl p-6 shadow-xl hover:shadow-2xl text-white transition-all">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">AIからのアドバイス</h3>
              <p className="text-sm text-white/90 leading-relaxed">
                睡眠時間が理想的です！今日は集中力の高い学習に最適な日ですね。午前中に難しい内容に取り組むことをおすすめします。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">今週の調子: +12%</span>
          </div>
        </div>

        {/* Save Button */}
        <button className="w-full py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-lg rounded-3xl shadow-xl hover:shadow-2xl active:scale-95 transition-all">
          記録を保存
        </button>
      </div>
    </div>
  )
}
