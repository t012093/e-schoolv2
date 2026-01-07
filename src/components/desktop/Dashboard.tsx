'use client'

import { useEffect, useState } from 'react'
import { Flame, Target, TrendingUp, Play, ArrowRight, CheckCircle2, Brain, Sparkles } from 'lucide-react'
import { ComprehensiveProfile } from '@/components/PersonalizedAssessment'

const stats = [
  { icon: Flame, value: 7, label: '日連続', color: 'orange', bgColor: 'from-orange-400 to-red-400' },
  { icon: Target, value: 12, label: '完了タスク', color: 'blue', bgColor: 'from-blue-400 to-cyan-400' },
  { icon: TrendingUp, value: '85%', label: '達成率', color: 'green', bgColor: 'from-green-400 to-emerald-400' },
]

const todayTasks = [
  { id: 1, title: '英単語100語を覚える', tag: '英語', completed: false },
  { id: 2, title: 'リスニング練習30分', tag: '英語', completed: true },
  { id: 3, title: 'プログラミング課題', tag: 'IT', completed: false },
]

const learningContent = [
  { id: 1, title: '英単語1000：基礎編', progress: 60, duration: '15分', emoji: '🎥' },
  { id: 2, title: '英文法の基礎完全ガイド', progress: 0, duration: '20分', emoji: '📖' },
  { id: 3, title: 'リスニング練習 Lesson 3', progress: 100, duration: '25分', emoji: '🎧' },
]

interface DashboardProps {
  onNavigate?: (view: string) => void
}

export default function Dashboard({ onNavigate }: DashboardProps = {}) {
  const [profile, setProfile] = useState<ComprehensiveProfile | null>(null)

  useEffect(() => {
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

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">こんにちは！</h1>
          <p className="text-gray-600 text-lg">今日も学習を続けましょう</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">今日の日付</p>
          <p className="text-xl font-semibold text-gray-900">{new Date().toLocaleDateString('ja-JP')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-6 shadow-md hover:shadow-xl border border-gray-100/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Personalized Section or Today's Learning */}
        {profile && profile.learningPlan ? (
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl p-8 shadow-xl text-white">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold mb-1">あなた専用プラン</h2>
                <p className="text-white/90 text-sm">{profile.aiCoachProfile || 'あなた専用の学習プランを作成しました'}</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              {profile.learningPlan.approaches.slice(0, 3).map((approach, index) => (
                <div key={index} className="flex items-start gap-2 text-white/90 text-sm">
                  <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{approach}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate?.('ai')}
              className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              AIコーチに相談
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl p-8 shadow-xl text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">今日の学習</h2>
                <p className="text-white/90">おすすめのコンテンツ</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold">65%</div>
                <p className="text-sm text-white/80 mt-1">進捗</p>
              </div>
            </div>
            <button className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all">
              <Play className="w-5 h-5 fill-current" />
              学習を始める
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <div
            onClick={() => onNavigate?.('wellbeing')}
            className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl p-6 shadow-md hover:shadow-xl border border-gray-100/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">体調チェック</h3>
                  <p className="text-sm text-gray-500">今日の調子はどう？</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {!profile || !profile.learningPlan ? (
            <div
              onClick={() => onNavigate?.('profile')}
              className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl p-6 shadow-md hover:shadow-xl border border-purple-100/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {profile ? '診断を完了' : 'パーソナライゼーション診断'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {profile ? '残りの診断を完了してプランを作成' : 'あなた専用の学習プランを作成'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ) : (
            <div
              onClick={() => onNavigate?.('ai')}
              className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-6 shadow-md hover:shadow-xl border border-gray-100/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">AIコーチに相談</h3>
                    <p className="text-sm text-gray-500">学習のアドバイスを受ける</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks & Learning Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl p-6 shadow-md border border-gray-100/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">今日のタスク</h2>
            <span className="text-sm text-gray-500">{todayTasks.length}件</span>
          </div>
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {task.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Content */}
        <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl p-6 shadow-md border border-gray-100/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">おすすめコンテンツ</h2>
          </div>
          <div className="space-y-3">
            {learningContent.map((content) => (
              <div
                key={content.id}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-3xl flex-shrink-0">
                  {content.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{content.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{content.duration}</span>
                    {content.progress > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 font-medium">{content.progress}%</span>
                      </>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
