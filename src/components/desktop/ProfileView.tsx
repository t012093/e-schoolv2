'use client'

import { useState, useEffect } from 'react'
import { Award, TrendingUp, Target, Settings, Calendar, ChevronRight, Brain, Play } from 'lucide-react'
import { PersonalizedAssessment, ComprehensiveProfile } from '@/components/PersonalizedAssessment'

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
]

export default function ProfileView() {
  const [showAssessment, setShowAssessment] = useState(false)
  const [profile, setProfile] = useState<ComprehensiveProfile | null>(null)

  useEffect(() => {
    // プロフィール情報を読み込み
    const loadProfile = () => {
      try {
        const saved = localStorage.getItem('personalized.profile.v1')
        if (saved) {
          setProfile(JSON.parse(saved))
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }
    loadProfile()
  }, [])

  if (showAssessment) {
    return <PersonalizedAssessment />
  }

  return (
    <div className="p-8 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl p-10 shadow-xl text-white">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-6xl">
            👤
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">山田太郎</h1>
            <p className="text-white/90 text-xl">戦略家タイプ 🎯</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-medium">レベル 12</span>
            <span className="text-lg">850 / 1000 XP</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: '85%' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Stats */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">統計</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-3xl p-6 shadow-md hover:shadow-xl border border-gray-100/50 transition-all text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-7 h-7 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">147</p>
              <p className="text-sm text-gray-500 mt-1">学習時間</p>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50/30 rounded-3xl p-6 shadow-md hover:shadow-xl border border-gray-100/50 transition-all text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Target className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">42</p>
              <p className="text-sm text-gray-500 mt-1">完了数</p>
            </div>

            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl p-6 shadow-md hover:shadow-xl border border-gray-100/50 transition-all text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <Award className="w-7 h-7 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500 mt-1">バッジ</p>
            </div>
          </div>

          {/* Menu */}
          <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100/50 transition-all">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  className={`w-full flex items-center justify-between p-6 ${
                    index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                  } hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <Icon className={`w-6 h-6 ${item.color}`} />
                    <span className="font-medium text-gray-900 text-lg">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            獲得バッジ
          </h2>
          <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl p-8 shadow-md hover:shadow-xl border border-gray-100/50 mb-6 transition-all">
            <div className="grid grid-cols-3 gap-5">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center gap-3 p-5 rounded-3xl transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-sm hover:shadow-md'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100/50 opacity-50 grayscale border border-gray-100/50'
                  }`}
                >
                  <span className="text-5xl">{badge.emoji}</span>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Personality Card / Assessment */}
          {profile ? (
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 border-2 border-purple-200 shadow-md hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-5xl">🎯</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-xl mb-2">{profile.aiCoachProfile}</h3>
                  <div className="space-y-2 text-gray-700">
                    {profile.learningStyle?.primaryStyle && (
                      <p className="text-sm">
                        <strong>学習スタイル:</strong> {
                          profile.learningStyle.primaryStyle === 'visual' ? '📊 視覚型' :
                          profile.learningStyle.primaryStyle === 'auditory' ? '🎧 聴覚型' : '✋ 体感型'
                        }
                      </p>
                    )}
                    {profile.motivation?.motivationType && (
                      <p className="text-sm">
                        <strong>動機タイプ:</strong> {
                          profile.motivation.motivationType === 'autonomous' ? '🎯 自律型' :
                          profile.motivation.motivationType === 'controlled' ? '🤝 サポート重視型' : '⚖️ バランス型'
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAssessment(true)}
                className="w-full py-3 bg-white/50 hover:bg-white/70 rounded-2xl font-medium text-purple-900 transition-all"
              >
                診断を再実行
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 border-2 border-purple-200 shadow-md hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-xl mb-2">パーソナライゼーション診断</h3>
                  <p className="text-gray-700 leading-relaxed">
                    あなたに最適な学習方法を見つけましょう。性格、学習スタイル、動機を分析してカスタマイズされたアドバイスを提供します。
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssessment(true)}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all"
              >
                <Play className="w-5 h-5" />
                診断を開始
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
