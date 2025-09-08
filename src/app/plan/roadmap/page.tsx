"use client"
import { useEffect, useMemo, useState } from "react"

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
  const [schedule, setSchedule] = useState<OnboardingState['schedule']>()

  useEffect(() => {
    if (!mounted) return
    try {
      const raw = localStorage.getItem('onboarding.sample.v1')
      if (raw) {
        const s: OnboardingState = JSON.parse(raw)
        const first = (s.goals && s.goals[0]) || '英語'
        setSubject(first)
        if (s.schedule) setSchedule(s.schedule)
      }
    } catch {}
  }, [mounted])

  return { mounted, subject, schedule }
}

type Phase = { key: string; title: string; weeks: number; modules: string[] }

function buildPhases(subject: string): Phase[] {
  if (subject === '英語') return [
    { key: 'phase1', title: '基礎固め', weeks: 4, modules: ['語彙1000（Unit 1-20）', '時制の復習', '発音・音声変化'] },
    { key: 'phase2', title: '中級力増強', weeks: 6, modules: ['関係詞/仮定法', '長文読解の型', 'リスニング基礎 演習'] },
    { key: 'phase3', title: '試験対策', weeks: 2, modules: ['模試×2回', '弱点補強', '時間配分の最適化'] },
  ]
  return [
    { key: 'phase1', title: `${subject} 基礎`, weeks: 4, modules: ['基礎概念', '頻出問題', '用語'] },
    { key: 'phase2', title: `${subject} 応用`, weeks: 6, modules: ['応用問題', 'ケーススタディ'] },
    { key: 'phase3', title: '仕上げ', weeks: 2, modules: ['まとめ', '模試/演習'] },
  ]
}

export default function RoadmapPage() {
  const { mounted, subject, schedule } = usePlanData()
  const [approvedAt, setApprovedAt] = useState<string | null>(null)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{subject} 学習プラン（全体像）</h1>
            <p className="text-sm text-gray-600">全フェーズの見取り図と期間感を確認できます</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="px-3 py-2 text-sm rounded-md border">ダッシュボード</a>
            <a href="/plan/curriculum" className="px-3 py-2 text-sm rounded-md border">カリキュラム</a>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="bg-white rounded-lg border p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-gray-600">週の約束</div>
              <div className="text-lg font-semibold">{mounted ? `${sessionsPerWeek}回 × ${(schedule?.durationMin||30)}分` : '—'}</div>
              <div className="text-xs text-gray-500">合計 {totalWeeks}週（目安）</div>
            </div>
            <div className="flex items-center gap-2">
              {approvedAt ? (
                <span className="text-sm px-3 py-2 rounded-md border bg-green-50 text-green-700">承認済: {new Date(approvedAt).toLocaleDateString()}</span>
              ) : (
                <button onClick={approve} className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">この計画で進める</button>
              )}
              <a href="/onboarding" className="px-3 py-2 text-sm rounded-md border">再生成</a>
            </div>
          </div>
        </div>

        {/* Phases overview */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="font-medium mb-3">フェーズ構成</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {phases.map((p, i) => (
              <div key={p.key} className="p-4 border rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">Phase {i+1}</div>
                <div className="text-base font-semibold">{p.title}</div>
                <div className="text-xs text-gray-500">{p.weeks}週</div>
                <ul className="mt-2 text-sm text-gray-700 space-y-1">
                  {p.modules.map(m => (<li key={m}>• {m}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical roadmap */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="font-medium mb-3">ロードマップ（全体像）</h2>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {phases.map((p, i) => (
                <div key={p.key} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">{i+1}</div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-gray-500">目安 {p.weeks}週</div>
                      </div>
                      <a href="/plan/curriculum" className="text-sm text-blue-600 hover:text-blue-700">対応セクション →</a>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                      {p.modules.map(m => (
                        <div key={m} className="px-3 py-2 text-sm rounded-md border bg-gray-50">{m}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

