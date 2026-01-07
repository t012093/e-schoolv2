"use client"
import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Circle, Clock, Target, TrendingUp, Calendar, ArrowRight, Sparkles, Lock, PlayCircle, BookOpen, Trophy, Zap } from 'lucide-react'

type OnboardingState = {
  goals?: string[]
  schedule?: { days: string[]; time: string; durationMin: number }
}

function useHasMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return mounted
}

function usePlanData() {
  const mounted = useHasMounted()
  const [subject, setSubject] = useState<string>('英語')
  const [subjects, setSubjects] = useState<string[]>([])
  const [schedule, setSchedule] = useState<OnboardingState['schedule']>()

  useEffect(() => {
    if (!mounted) return
    try {
      const raw = localStorage.getItem('onboarding.sample.v1')
      if (raw) {
        const s: OnboardingState = JSON.parse(raw)
        const list = s.goals && s.goals.length ? s.goals : ['英語']
        setSubjects(list)
        setSubject(list[0])
        if (s.schedule) setSchedule(s.schedule)
      } else {
        setSubjects(['英語'])
      }
    } catch {
      setSubjects(['英語'])
    }
  }, [mounted])

  return { mounted, subject, setSubject, subjects, schedule }
}

type Phase = { 
  key: string
  title: string
  weeks: number
  modules: string[]
  icon: string
  color: string
  description: string
  difficulty: number
  status?: 'completed' | 'current' | 'locked'
}

function buildPhases(subject: string): Phase[] {
  if (subject === '英語') return [
    { 
      key: 'phase1', 
      title: '基礎固め', 
      weeks: 4, 
      modules: ['語彙1000（Unit 1-20）', '時制の復習', '発音・音声変化'],
      icon: '📚',
      color: 'from-blue-400 to-blue-600',
      description: '英語学習の土台となる基礎力を身につけます',
      difficulty: 1,
      status: 'current'
    },
    { 
      key: 'phase2', 
      title: '中級力増強', 
      weeks: 6, 
      modules: ['関係詞/仮定法', '長文読解の型', 'リスニング基礎演習'],
      icon: '🚀',
      color: 'from-purple-400 to-purple-600',
      description: '実践的な英語力を段階的に高めていきます',
      difficulty: 2,
      status: 'locked'
    },
    { 
      key: 'phase3', 
      title: '試験対策', 
      weeks: 2, 
      modules: ['模試×2回', '弱点補強', '時間配分の最適化'],
      icon: '🏆',
      color: 'from-green-400 to-green-600',
      description: '目標達成に向けた最終調整を行います',
      difficulty: 3,
      status: 'locked'
    },
  ]
  return [
    { 
      key: 'phase1', 
      title: `${subject} 基礎`, 
      weeks: 4, 
      modules: ['基礎概念', '頻出問題', '用語'],
      icon: '📚',
      color: 'from-blue-400 to-blue-600',
      description: '基礎的な概念と用語を習得します',
      difficulty: 1,
      status: 'current'
    },
    { 
      key: 'phase2', 
      title: `${subject} 応用`, 
      weeks: 6, 
      modules: ['応用問題', 'ケーススタディ'],
      icon: '🚀',
      color: 'from-purple-400 to-purple-600',
      description: '実践的な応用力を身につけます',
      difficulty: 2,
      status: 'locked'
    },
    { 
      key: 'phase3', 
      title: '仕上げ', 
      weeks: 2, 
      modules: ['まとめ', '模試/演習'],
      icon: '🏆',
      color: 'from-green-400 to-green-600',
      description: '総仕上げと実力確認を行います',
      difficulty: 3,
      status: 'locked'
    },
  ]
}

export default function RoadmapPage() {
  const { mounted, subject, setSubject, subjects, schedule } = usePlanData()
  const [approvedAt, setApprovedAt] = useState<string | null>(null)
  const [currentPhase, setCurrentPhase] = useState(0)
  const phases = useMemo(() => buildPhases(subject), [subject])

  useEffect(() => {
    if (!mounted) return
    try {
      const raw = localStorage.getItem('plan.meta')
      if (raw) setApprovedAt(JSON.parse(raw).approvedAt || null)
    } catch {}
  }, [mounted])

  const approve = () => {
    const ts = new Date().toISOString()
    setApprovedAt(ts)
    try {
      localStorage.setItem('plan.meta', JSON.stringify({ approvedAt: ts }))
    } catch {}
  }

  const sessionsPerWeek = (schedule?.days || []).length || 2
  const totalWeeks = phases.reduce((a, p) => a + p.weeks, 0)
  const completedWeeks = currentPhase * 4 // 仮の進捗
  const progressPercent = Math.round((completedWeeks / totalWeeks) * 100)
  const etaDate = useMemo(() => {
    const start = approvedAt ? new Date(approvedAt) : new Date()
    const eta = new Date(start)
    eta.setDate(eta.getDate() + totalWeeks * 7)
    return eta
  }, [approvedAt, totalWeeks])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
                  <span className="text-4xl">🗺️</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">学習ロードマップ</h1>
                  <p className="text-white/90 text-lg">あなた専用の学習計画 - {subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href="/plan/curriculum" className="px-4 py-2 text-sm rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all">カリキュラム</a>
                <a href="/" className="px-4 py-2 text-sm rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all">ダッシュボード</a>
              </div>
            </div>

            {/* Quick Stats in Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-white/70 text-xs mb-1">総期間</div>
                <div className="text-2xl font-bold">{totalWeeks}週</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-white/70 text-xs mb-1">週の学習</div>
                <div className="text-2xl font-bold">{sessionsPerWeek}回</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-white/70 text-xs mb-1">開始時刻</div>
                <div className="text-2xl font-bold">{mounted ? (schedule?.time || '—') : '—'}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-white/70 text-xs mb-1">完了予定</div>
                <div className="text-lg font-bold">{mounted ? etaDate.toLocaleDateString() : '—'}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Subject Selection + Approval */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl shadow-xl border-2 border-blue-100/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">学習科目</h3>
              <div className="flex flex-wrap items-center gap-2">
                {(subjects.length ? subjects : ['英語']).map(s => (
                  <button
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`px-4 py-2 text-sm font-semibold rounded-2xl transition-all ${
                      subject === s
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                        : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {approvedAt ? (
                <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">承認済: {new Date(approvedAt).toLocaleDateString()}</span>
                </div>
              ) : (
                <button onClick={approve} className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  この計画で進める
                </button>
              )}
              <a href="/onboarding" className="px-4 py-2 text-sm rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                再生成
              </a>
            </div>
          </div>

          {/* Progress Bar */}
          {approvedAt && (
            <div className="bg-white rounded-2xl p-5 shadow-md border border-blue-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-600">全体の進捗</span>
                <span className="text-2xl font-bold text-blue-600">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner mb-2">
                <div
                  className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>{completedWeeks}週 完了</span>
                <span>残り {totalWeeks - completedWeeks}週</span>
              </div>
            </div>
          )}
        </div>

        {/* Roadmap Timeline */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-7 h-7 text-blue-600" />
              学習フェーズ
            </h2>
            <span className="text-sm text-gray-600">{phases.length}つのフェーズ</span>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-green-400 rounded-full opacity-30" />

            <div className="space-y-6">
              {phases.map((phase, index) => {
                const isActive = phase.status === 'current'
                const isCompleted = phase.status === 'completed'
                const isLocked = phase.status === 'locked'

                return (
                  <div key={phase.key} className="relative">
                    <div className="flex gap-6 items-start">
                      {/* Timeline Icon */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border-4 transition-all ${
                          isActive
                            ? 'bg-gradient-to-br from-blue-500 to-purple-500 border-white ring-4 ring-blue-400/30 animate-pulse'
                            : isCompleted
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-white'
                            : 'bg-gray-200 border-gray-100'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-8 h-8 text-white" />
                          ) : isActive ? (
                            <PlayCircle className="w-8 h-8 text-white" />
                          ) : (
                            <Lock className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Phase Card */}
                      <div className={`flex-1 bg-gradient-to-br ${phase.color} rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden group hover:scale-105 transition-all ${
                        isLocked ? 'opacity-60' : ''
                      }`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-4xl">{phase.icon}</span>
                              <div>
                                <h3 className="text-2xl font-bold mb-1">
                                  Phase {index + 1}: {phase.title}
                                </h3>
                                <div className="flex items-center gap-3 text-white/90 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {phase.weeks}週間
                                  </span>
                                  <span className="flex items-center gap-1">
                                    {'⭐'.repeat(phase.difficulty)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <a
                              href="/plan/curriculum"
                              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all flex items-center gap-2 text-sm font-semibold"
                            >
                              詳細
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          </div>

                          <p className="text-white/90 mb-4 leading-relaxed">{phase.description}</p>

                          {/* Modules */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-white/80">学習モジュール:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              {phase.modules.map((module, idx) => (
                                <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-sm border border-white/20 flex items-center gap-2">
                                  <BookOpen className="w-4 h-4" />
                                  {module}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Status Badge */}
                          {isActive && (
                            <div className="absolute top-4 right-4">
                              <div className="px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-xs font-bold border border-white/40">
                                進行中
                              </div>
                            </div>
                          )}
                          {isCompleted && (
                            <div className="absolute top-4 right-4">
                              <div className="px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-xs font-bold border border-white/40 flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                完了
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-xl border-2 border-orange-100/50">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            学習のコツ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-md border border-blue-100 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-600 mb-1">継続性</h4>
                  <p className="text-sm text-gray-700">
                    週{sessionsPerWeek}回のペースを守ることが成功への鍵です
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-purple-100 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-purple-600 mb-1">柔軟性</h4>
                  <p className="text-sm text-gray-700">
                    進捗に応じてペースは調整可能です
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-green-100 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-green-600 mb-1">振り返り</h4>
                  <p className="text-sm text-gray-700">
                    各フェーズ終了時に復習時間を確保しましょう
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
