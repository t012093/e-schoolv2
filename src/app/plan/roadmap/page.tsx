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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header (aligned with other pages) */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">学習ロードマップ（全体像）</h1>
            <p className="text-sm text-gray-600">全体像の合意→セクション実行→進捗確認</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/plan/curriculum" className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50">カリキュラム</a>
            <a href="/" className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50">ダッシュボード</a>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Subject toggle + approval (consistent white card) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {(subjects.length ? subjects : ['英語']).map(s => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`px-3 py-1.5 text-sm rounded-full border ${subject === s ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {approvedAt ? (
                <span className="text-sm px-3 py-2 rounded-md border bg-green-50 text-green-700">承認済: {new Date(approvedAt).toLocaleDateString()}</span>
              ) : (
                <button onClick={approve} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  この計画で進める
                </button>
              )}
              <a href="/onboarding" className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50">再生成</a>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCardSmall label="週の約束" value={`${sessionsPerWeek}回 × ${(schedule?.durationMin || 30)}分`} />
            <SummaryCardSmall label="総期間(目安)" value={`${totalWeeks}週`} />
            <SummaryCardSmall label="開始時刻" value={mounted ? (schedule?.time || '—') : '—'} />
            <SummaryCardSmall label="ETA(目安)" value={mounted ? etaDate.toLocaleDateString() : '—'} />
          </div>
        </div>
        {/* Quick Stats removed to simplify and match other pages */}

        {/* Roadmap Timeline (simplified to fit design) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-5">
              {phases.map((phase, index) => (
                <div key={phase.key} className="relative">
                  <div className="flex gap-6 items-start">
                    <div className="relative z-10">
                      <div className="w-7 h-7 rounded-full bg-blue-600 ring-4 ring-blue-600/20" />
                    </div>
                    <div className="flex-1">
                      <div className="rounded-lg p-5 border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-base font-semibold">Phase {index + 1}: {phase.title}</h3>
                            <p className="text-xs text-gray-500">{phase.weeks}週の目安</p>
                          </div>
                          <a href="/plan/curriculum" className="text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap flex items-center gap-1">
                            詳細
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {phase.modules.map(m => (
                            <span key={m} className="px-2.5 py-1 text-xs rounded-md border bg-gray-50">{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            学習のコツ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm">
                <span className="font-medium text-blue-600">継続性：</span>
                週{sessionsPerWeek}回のペースを守ることが成功への鍵です
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm">
                <span className="font-medium text-purple-600">柔軟性：</span>
                進捗に応じてペースは調整可能です
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm">
                <span className="font-medium text-green-600">振り返り：</span>
                各フェーズ終了時に復習時間を確保しましょう
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SummaryCardSmall({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md border bg-gray-50">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
