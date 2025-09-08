'use client'
import { useEffect, useMemo, useState } from 'react'

type OnboardingState = {
  goals?: string[]
  schedule?: { days: string[]; time: string; durationMin: number }
}

type Plan = {
  id: string
  subject: string
  progress: number
  scheduleText: string
  nextAction: string
  modules: { title: string; done: number; total: number }[]
  resources: { kind: 'video' | 'article' | 'exercise'; title: string; duration?: string }[]
}

function useOnboardingGoals(): string[] {
  const [goals, setGoals] = useState<string[]>([])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('onboarding.sample.v1')
      if (raw) {
        const s: OnboardingState = JSON.parse(raw)
        setGoals(Array.isArray(s.goals) ? s.goals : [])
      }
    } catch {}
  }, [])
  return goals
}

function buildPlan(subject: string, schedule?: OnboardingState['schedule']): Plan {
  const modules = {
    '英語': [
      { title: '語彙（頻出1000）', done: 12, total: 20 },
      { title: '文法（時制/関係詞）', done: 8, total: 18 },
      { title: 'リスニング基礎', done: 3, total: 12 },
    ],
    '数学': [
      { title: '計算・関数の復習', done: 6, total: 12 },
      { title: '図形と証明入門', done: 2, total: 10 },
    ],
  }[subject] ?? [
    { title: `${subject}の基礎`, done: 1, total: 8 },
    { title: `${subject}の応用`, done: 0, total: 6 },
  ]
  const total = modules.reduce((a, m) => a + m.total, 0)
  const done = modules.reduce((a, m) => a + m.done, 0)
  const progress = Math.round((done / Math.max(total, 1)) * 100)
  const scheduleText = schedule
    ? `毎${(schedule.days || []).join('・') || '未設定'} ${schedule.time || ''} / ${schedule.durationMin || 30}分`
    : 'スケジュール未設定'
  const nextAction = subject === '英語' ? '「語彙：ユニット13」を10分' : '次のモジュールを開始'
  const resources: Plan['resources'] = subject === '英語'
    ? [
        { kind: 'video', title: '英単語1000：Unit 13', duration: '8分' },
        { kind: 'article', title: '時制の要点まとめ' },
        { kind: 'exercise', title: 'リスニング基礎：Lesson 3', duration: '10分' },
      ]
    : [
        { kind: 'article', title: `${subject}の基礎まとめ` },
        { kind: 'exercise', title: `${subject}ドリル：#1`, duration: '10分' },
      ]
  return { id: subject, subject, progress, scheduleText, nextAction, modules, resources }
}

export default function PlansPage() {
  const goals = useOnboardingGoals()
  const schedule = useMemo(() => {
    try {
      const raw = localStorage.getItem('onboarding.sample.v1')
      return raw ? (JSON.parse(raw).schedule as OnboardingState['schedule']) : undefined
    } catch {
      return undefined
    }
  }, [])
  const subjects = goals.length ? goals : ['英語', '数学']
  const plans = subjects.map(s => buildPlan(s, schedule))
  const [selected, setSelected] = useState<string>(plans[0]?.id ?? subjects[0])
  const current = plans.find(p => p.id === selected) ?? plans[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">学習プラン</h1>
          <div className="flex items-center gap-2">
            <a href="/onboarding" className="px-3 py-2 text-sm rounded-md border">再生成</a>
            <a href="/" className="px-3 py-2 text-sm rounded-md border">ダッシュボード</a>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-4 h-fit">
          <h3 className="text-base font-semibold mb-3">My Plans</h3>
          <div className="space-y-2">
            {plans.map(p => (
              <button key={p.id} onClick={() => setSelected(p.id)} className={`w-full text-left p-3 border rounded-md hover:bg-gray-50 ${current?.id === p.id ? 'border-blue-500 bg-blue-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{p.subject}</span>
                  <span className="text-xs text-gray-500">{p.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full">
                  <div className="h-1.5 bg-blue-600 rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-gray-600">{p.scheduleText}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{current?.subject} 学習プラン</h3>
                <p className="text-sm text-gray-600">次のアクション: {current?.nextAction}</p>
                <p className="mt-1 text-xs text-gray-500">スケジュール: {current?.scheduleText}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm rounded-md border">編集</button>
                <button className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">今すぐ始める</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium mb-3">ロードマップ</h4>
              <div className="space-y-3">
                {current?.modules.map(m => (
                  <div key={m.title}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{m.title}</span>
                      <span className="text-gray-500">{m.done}/{m.total}</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-gray-200 rounded-full">
                      <div className="h-1.5 bg-green-600 rounded-full" style={{ width: `${Math.round((m.done/Math.max(m.total,1))*100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium mb-3">おすすめリソース</h4>
              <div className="space-y-3">
                {current?.resources.map((r, i) => (
                  <div key={i} className="p-3 border rounded-md flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.kind}{r.duration ? ` ・ ${r.duration}` : ''}</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700">開く →</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium mb-3">KPI・継続状況</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="総進捗" value={`${current?.progress ?? 0}%`} tone="blue" />
              <KpiCard label="今週セッション" value="2回" tone="green" />
              <KpiCard label="平均学習時間" value="28分" tone="purple" />
              <KpiCard label="連続日数" value="4日" tone="yellow" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function KpiCard({ label, value, tone }: { label: string; value: string; tone: 'blue'|'green'|'purple'|'yellow' }) {
  const toneMap: Record<typeof tone, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  } as any
  return (
    <div className={`p-3 rounded-md border ${toneMap[tone]}`}>
      <div className="text-xs">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

