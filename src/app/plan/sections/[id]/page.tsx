"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SectionPage(){
  const params = useParams<{ id: string }>()
  const id = params?.id || 'section'
  const [mounted,setMounted] = useState(false)
  useEffect(()=>setMounted(true),[])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">セクション: {id}</h1>
            <p className="text-sm text-gray-600">先生AIがインタラクティブにレクチャーします</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/plan/curriculum" className="px-3 py-2 text-sm rounded-md border">カリキュラム</a>
            <a href="/" className="px-3 py-2 text-sm rounded-md border">ダッシュボード</a>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat area */}
        <div className="lg:col-span-2 bg-white border rounded-lg p-4 flex flex-col h-[70vh]">
          <div className="flex-1 overflow-auto space-y-3">
            <ChatBubble role="assistant" text="こんにちは！今日は語彙 Unit13 を一緒に進めましょう。まずは5つだけやってみます。" />
            <ChatBubble role="user" text="お願いします。" />
            <ChatBubble role="assistant" text="問題1: prosperity の意味は？ A) 繁栄 B) 貧困 C) 疑念" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input placeholder="メッセージを入力" className="flex-1 px-3 py-2 border rounded-md" />
            <button className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">送信</button>
          </div>
        </div>

        {/* Sidebar: objectives & resources */}
        <div className="bg-white border rounded-lg p-4 space-y-4 h-fit">
          <div>
            <h3 className="font-medium mb-1">学習目標</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Unit13 語彙20語の意味を説明できる</li>
              <li>• 例文での使い方を2つ言える</li>
              <li>• 10分のリスニング演習を完了</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">リソース</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 単語帳: Unit13</li>
              <li>• 解説記事: 時制の要点</li>
              <li>• 演習: リスニング基礎 Lesson3</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">所要時間</h3>
            <div className="text-sm text-gray-600">30分目安</div>
          </div>
          <div>
            <a href={`/chat?section=${id}`} className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50 inline-block">チャットで続ける →</a>
          </div>
        </div>
      </main>
    </div>
  )
}

function ChatBubble({ role, text }: { role: 'assistant'|'user'; text: string }){
  const isUser = role==='user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] px-3 py-2 rounded-lg border ${isUser ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50'}`}>{text}</div>
    </div>
  )
}

