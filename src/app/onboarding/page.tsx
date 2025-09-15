'use client'
import { useEffect, useMemo, useState } from 'react'

type StepKey = 'goals' | 'schedule' | 'style' | 'diagnostic' | 'plan' | 'summary'

type OnboardingState = {
  goals: string[]
  schedule: {
    days: string[]
    time: string
    durationMin: number
  }
  style: {
    mode: '問いかけ型' | '励まし型' | '解説重視' | ''
    pace: 'ゆっくり' | '標準' | '速め' | ''
    channels: string[]
  }
  diagnostic: {
    q1?: string
    q2?: string
    q3?: string
  }
  plan: 'free' | 'basic' | 'hybrid' | ''
}

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'goals', label: '目標' },
  { key: 'schedule', label: '学習時間' },
  { key: 'style', label: 'スタイル' },
  { key: 'diagnostic', label: '診断' },
  { key: 'plan', label: 'プラン' },
  { key: 'summary', label: '確認' },
]

const STORAGE_KEY = 'onboarding.sample.v1'

export default function OnboardingPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [state, setState] = useState<OnboardingState>(() => ({
    goals: [],
    schedule: { days: [], time: '19:00', durationMin: 30 },
    style: { mode: '', pace: '', channels: [] },
    diagnostic: {},
    plan: '',
  }))
  const step = STEPS[stepIndex]

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState(JSON.parse(raw))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  const canNext = useMemo(() => {
    switch (step.key) {
      case 'goals':
        return state.goals.length > 0
      case 'schedule':
        return state.schedule.days.length > 0 && !!state.schedule.time && state.schedule.durationMin > 0
      case 'style':
        return !!state.style.mode && !!state.style.pace && state.style.channels.length > 0
      case 'diagnostic':
        return true
      case 'plan':
        return !!state.plan
      case 'summary':
        return true
    }
  }, [step.key, state])

  const progress = (stepIndex / (STEPS.length - 1)) * 100
  const goNext = () => setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
  const goPrev = () => setStepIndex(i => Math.max(i - 1, 0))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">オンボーディング</h1>
            <p className="text-sm text-gray-500">AIチャット学習の初期設定を数分で完了</p>
          </div>
          <a href="/" className="text-sm text-blue-600 hover:text-blue-700">ダッシュボードへ戻る →</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex-1 flex items-center">
                <button
                  className={`flex items-center gap-2 text-sm ${i === stepIndex ? 'text-blue-700' : i < stepIndex ? 'text-gray-700' : 'text-gray-400'}`}
                  onClick={() => setStepIndex(i)}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                    i < stepIndex ? 'bg-blue-600' : i === stepIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <section className="bg-white border rounded-xl shadow-sm p-6">
          {step.key === 'goals' && (
            <GoalsStep value={state.goals} onChange={(v) => setState(s => ({ ...s, goals: v }))} />
          )}
          {step.key === 'schedule' && (
            <ScheduleStep value={state.schedule} onChange={(v) => setState(s => ({ ...s, schedule: v }))} />
          )}
          {step.key === 'style' && (
            <StyleStep value={state.style} onChange={(v) => setState(s => ({ ...s, style: v }))} />
          )}
          {step.key === 'diagnostic' && (
            <DiagnosticStep value={state.diagnostic} onChange={(v) => setState(s => ({ ...s, diagnostic: v }))} />
          )}
          {step.key === 'plan' && (
            <PlanStep value={state.plan} onChange={(v) => setState(s => ({ ...s, plan: v }))} />
          )}
          {step.key === 'summary' && (
            <SummaryStep state={state} />
          )}

          <div className="mt-8 flex items-center justify-between">
            <button onClick={goPrev} disabled={stepIndex === 0} className="px-4 py-2 text-sm border rounded-md disabled:opacity-50">
              戻る
            </button>
            <div className="flex items-center gap-2">
              {step.key === 'diagnostic' && (
                <button onClick={goNext} className="px-4 py-2 text-sm rounded-md border">スキップ</button>
              )}
              {step.key !== 'summary' ? (
                <button onClick={goNext} disabled={!canNext} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md disabled:opacity-50 hover:bg-blue-700">次へ</button>
              ) : (
                <a href="/" className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">完了してはじめる</a>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {desc && <p className="text-sm text-gray-500 mt-1">{desc}</p>}
    </div>
  )
}

function GoalsStep({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const options = ['英語', '数学', 'プログラミング', 'レポート作成', '資格試験', 'その他']
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter(x => x !== v))
    else onChange([...value, v])
  }
  return (
    <div>
      <SectionTitle title="学習の目標を選びましょう" desc="複数選択可。AIが初回プランを生成します" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`p-3 border rounded-lg text-sm text-left hover:bg-gray-50 ${value.includes(opt) ? 'border-blue-500 bg-blue-50' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ScheduleStep({ value, onChange }: { value: OnboardingState['schedule']; onChange: (v: OnboardingState['schedule']) => void }) {
  const days = ['月', '火', '水', '木', '金', '土', '日']
  const toggleDay = (d: string) => {
    const set = new Set(value.days)
    set.has(d) ? set.delete(d) : set.add(d)
    onChange({ ...value, days: Array.from(set) })
  }
  return (
    <div>
      <SectionTitle title="学習の曜日と時間を設定" desc="無理のない頻度から始めましょう" />
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {days.map(d => (
            <button key={d} onClick={() => toggleDay(d)} className={`px-3 py-2 text-sm rounded-md border ${value.days.includes(d) ? 'bg-blue-600 text-white border-blue-600' : ''}`}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">開始時間</label>
          <input type="time" value={value.time} onChange={(e) => onChange({ ...value, time: e.target.value })} className="w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">1回の目安（分）</label>
          <input type="number" min={10} step={5} value={value.durationMin}
            onChange={(e) => onChange({ ...value, durationMin: Number(e.target.value) })}
            className="w-full border rounded-md px-3 py-2" />
        </div>
      </div>
    </div>
  )
}

function StyleStep({ value, onChange }: { value: OnboardingState['style']; onChange: (v: OnboardingState['style']) => void }) {
  const modes: OnboardingState['style']['mode'][] = ['問いかけ型', '励まし型', '解説重視']
  const paces: OnboardingState['style']['pace'][] = ['ゆっくり', '標準', '速め']
  const channels = ['言語的', '論理数学', '視覚的', '聴覚的', '身体運動', '社交的']
  const toggleChannel = (c: string) => {
    const set = new Set(value.channels)
    set.has(c) ? set.delete(c) : set.add(c)
    onChange({ ...value, channels: Array.from(set) })
  }
  return (
    <div>
      <SectionTitle title="AIの対話スタイルを選択" desc="Big Five/MIの好みを簡易反映" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-600 mb-2">トーン</label>
          <div className="flex gap-2">
            {modes.map(m => (
              <button key={m} onClick={() => onChange({ ...value, mode: m })} className={`px-3 py-2 text-sm rounded-md border ${value.mode === m ? 'bg-blue-600 text-white border-blue-600' : ''}`}>{m}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-2">ペース</label>
          <div className="flex gap-2">
            {paces.map(p => (
              <button key={p} onClick={() => onChange({ ...value, pace: p })} className={`px-3 py-2 text-sm rounded-md border ${value.pace === p ? 'bg-blue-600 text-white border-blue-600' : ''}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-sm text-gray-600 mb-2">学習チャンネル（複数選択可）</label>
        <div className="flex flex-wrap gap-2">
          {channels.map(c => (
            <button key={c} onClick={() => toggleChannel(c)} className={`px-3 py-2 text-sm rounded-md border ${value.channels.includes(c) ? 'bg-blue-50 border-blue-500' : ''}`}>{c}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function DiagnosticStep({ value, onChange }: { value: OnboardingState['diagnostic']; onChange: (v: OnboardingState['diagnostic']) => void }) {
  return (
    <div>
      <SectionTitle title="かんたん診断（任意）" desc="理解度と学習スタイルの傾向を把握" />
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium mb-2">Q1. 一番集中できるのは？</p>
          <RadioRow name="q1" value={value.q1} options={[
            { label: '短い問題をテンポよく解く', val: 'short-rapid' },
            { label: 'じっくり考える長めの課題', val: 'long-deep' },
            { label: '人と話しながら学ぶ', val: 'social' },
          ]} onChange={(v) => onChange({ ...value, q1: v })} />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Q2. 苦手分野に直面したら？</p>
          <RadioRow name="q2" value={value.q2} options={[
            { label: '具体例の解説が欲しい', val: 'examples' },
            { label: 'ヒントを少しずつ', val: 'hints' },
            { label: 'まず自分で試す', val: 'try-first' },
          ]} onChange={(v) => onChange({ ...value, q2: v })} />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Q3. 理解した気になれる瞬間は？</p>
          <RadioRow name="q3" value={value.q3} options={[
            { label: '図や表で整理できたとき', val: 'visual' },
            { label: '声に出して説明できたとき', val: 'verbalize' },
            { label: '実際に手を動かしたとき', val: 'hands-on' },
          ]} onChange={(v) => onChange({ ...value, q3: v })} />
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-500">未回答でも次へ進めます</p>
    </div>
  )
}

function RadioRow({ name, value, options, onChange }: { name: string; value?: string; options: { label: string; val: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {options.map(opt => (
        <label key={opt.val} className={`flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer ${value === opt.val ? 'border-blue-500 bg-blue-50' : ''}`}>
          <input type="radio" name={name} value={opt.val} checked={value === opt.val} onChange={(e) => onChange(e.target.value)} />
          <span className="text-sm">{opt.label}</span>
        </label>
      ))}
    </div>
  )
}

function PlanStep({ value, onChange }: { value: OnboardingState['plan']; onChange: (v: OnboardingState['plan']) => void }) {
  const plans: { key: OnboardingState['plan']; title: string; price: string; features: string[] }[] = [
    { key: 'free', title: 'フリー', price: '¥0', features: ['一部機能', 'イベント参加(一部)'] },
    { key: 'basic', title: 'ベーシック', price: '¥3,000/月', features: ['AIチャット学習', '学習ログ可視化'] },
    { key: 'hybrid', title: 'ハイブリッド', price: '¥10,000/月', features: ['AI＋週1サードプレイス', 'メンターフィードバック'] },
  ]
  return (
    <div>
      <SectionTitle title="プランを選択" desc="後から変更できます" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map(p => (
          <button key={p.key} onClick={() => onChange(p.key)} className={`p-4 border rounded-xl text-left hover:shadow-sm ${value === p.key ? 'border-blue-600 ring-2 ring-blue-100' : ''}`}>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{p.title}</h3>
              <span className="text-sm text-gray-700">{p.price}</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {p.features.map(f => (<li key={f}>• {f}</li>))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  )
}

function SummaryStep({ state }: { state: OnboardingState }) {
  return (
    <div>
      <SectionTitle title="設定の確認" desc="いつでもプロフィールから変更できます" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard title="目標" lines={[state.goals.join('、') || '未設定']} />
        <SummaryCard title="学習時間" lines={[`曜日: ${state.schedule.days.join('・') || '未設定'}`, `開始: ${state.schedule.time}`, `1回: ${state.schedule.durationMin}分`]} />
        <SummaryCard title="スタイル" lines={[`トーン: ${state.style.mode || '未設定'}`, `ペース: ${state.style.pace || '未設定'}`, `チャンネル: ${state.style.channels.join('・') || '未設定'}`]} />
        <SummaryCard title="プラン" lines={[state.plan ? ({ free: 'フリー', basic: 'ベーシック', hybrid: 'ハイブリッド' } as const)[state.plan] : '未選択']} />
      </div>
    </div>
  )
}

function SummaryCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="p-4 border rounded-xl bg-gray-50">
      <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
      <ul className="text-sm text-gray-600">
        {lines.map((l, i) => (<li key={i}>{l || '-'}</li>))}
      </ul>
    </div>
  )
}

