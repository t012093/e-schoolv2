"use client"
import { useEffect, useMemo, useState } from "react"

type OnboardingState = {
  goals?: string[]
}

function useHasMounted(){ const [m,setM]=useState(false); useEffect(()=>setM(true),[]); return m }

function useSubject(){
  const mounted = useHasMounted()
  const [subject,setSubject] = useState('英語')
  useEffect(()=>{
    if(!mounted) return
    try{ const raw = localStorage.getItem('onboarding.sample.v1'); if(raw){ const s:OnboardingState=JSON.parse(raw); setSubject((s.goals&&s.goals[0])||'英語') } }catch{}
  },[mounted])
  return subject
}

type Section = { id: string; title: string; minutes: number; tags: string[]; progress: number }

function buildSections(subject:string): Section[]{
  if(subject==='英語') return [
    { id:'vocab1', title:'語彙 Unit 1-5', minutes:45, tags:['語彙','基礎'], progress:30 },
    { id:'tense', title:'時制の総復習', minutes:40, tags:['文法'], progress:20 },
    { id:'listen1', title:'リスニング基礎 1', minutes:30, tags:['リスニング'], progress:10 },
    { id:'rel', title:'関係詞の使い分け', minutes:50, tags:['文法','中級'], progress:0 },
    { id:'longread', title:'長文読解の型', minutes:60, tags:['読解'], progress:0 },
    { id:'mock1', title:'模試 演習1', minutes:70, tags:['試験対策'], progress:0 },
  ]
  return [
    { id:'base', title:`${subject}の基礎`, minutes:40, tags:['基礎'], progress:0 },
    { id:'apply', title:`${subject}の応用`, minutes:50, tags:['応用'], progress:0 },
  ]
}

export default function CurriculumPage(){
  const subject = useSubject()
  const sections = useMemo(()=>buildSections(subject),[subject])
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{subject} カリキュラム</h1>
            <p className="text-sm text-gray-600">セクション単位で学習を進められます</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/plan/roadmap" className="px-3 py-2 text-sm rounded-md border">全体ロードマップ</a>
            <a href="/" className="px-3 py-2 text-sm rounded-md border">ダッシュボード</a>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map(s => (
            <div key={s.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-gray-500">{s.minutes}分目安</div>
                </div>
                <div className="flex gap-1">
                  {s.tags.map(t => <span key={t} className="px-2 py-0.5 text-[10px] rounded-full border bg-gray-50">{t}</span>)}
                </div>
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-gray-200 rounded-full">
                  <div className="h-1.5 bg-blue-600 rounded-full" style={{ width: `${s.progress}%` }} />
                </div>
                <div className="mt-1 text-xs text-gray-500">進捗: {s.progress}%</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <a href={`/plan/sections/${s.id}`} className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50">開始する</a>
                <button className="text-sm text-blue-600 hover:text-blue-700">詳細 →</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

