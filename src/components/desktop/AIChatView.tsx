'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Sparkles, Loader2 } from 'lucide-react'
import { ComprehensiveProfile } from '@/components/PersonalizedAssessment'

interface Message {
  id: number
  type: 'user' | 'ai'
  text: string
  time: string
}

const quickReplies = [
  '今日のおすすめは？',
  'モチベーションが上がらない',
  '学習計画を立てたい',
  '進捗を確認したい'
]

export default function AIChatView() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<ComprehensiveProfile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // プロフィール情報を読み込み
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

  // チャット履歴を読み込み
  useEffect(() => {
    const saved = localStorage.getItem('ai_chat_history')
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load chat history', e)
      }
    } else {
      // 初回の挨拶メッセージ（プロフィールに基づく）
      const welcomeText = profile
        ? `こんにちは！AI学習コーチです。${profile.aiCoachProfile}のあなたをサポートします。今日はどのような学習をしますか？`
        : 'こんにちは！AI学習コーチです。今日の学習をサポートします。何か質問はありますか？'

      const welcomeMessage: Message = {
        id: 1,
        type: 'ai',
        text: welcomeText,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages([welcomeMessage])
    }
  }, [profile])

  // メッセージが更新されたらスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // チャット履歴を保存
  const saveChatHistory = (newMessages: Message[]) => {
    try {
      localStorage.setItem('ai_chat_history', JSON.stringify(newMessages))
    } catch (e) {
      console.error('Failed to save chat history', e)
    }
  }

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputText('')
    setIsLoading(true)

    try {
      // APIにメッセージを送信（プロフィール情報も含む）
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            type: msg.type,
            content: msg.text
          })),
          profile: profile
        })
      })

      if (!response.ok) throw new Error('API request failed')

      const data = await response.json()

      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        text: data.message,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      }

      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)
      saveChatHistory(finalMessages)
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        text: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      }
      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)
      saveChatHistory(finalMessages)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50/30 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/50 p-6 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AIコーチ</h1>
            <p className="text-sm text-gray-500">
              {profile ? `${profile.aiCoachProfile}のあなたをサポート` : 'いつでも相談してください'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-3xl px-6 py-4 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-md'
                    : 'bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/50 text-gray-900 shadow-sm'
                }`}
              >
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <p className={`text-sm mt-2 ${
                  message.type === 'user' ? 'text-white/70' : 'text-gray-400'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/50 rounded-3xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-gray-600">入力中...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      <div className="px-8 py-4 border-t border-gray-200/50">
        <div className="max-w-[1200px] mx-auto flex gap-3 overflow-x-auto pb-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => setInputText(reply)}
              className="flex-shrink-0 px-5 py-3 bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/50 rounded-full text-sm text-gray-700 hover:shadow-md shadow-sm transition-all"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200/50 p-6 shadow-lg">
        <div className="max-w-[1200px] mx-auto flex gap-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-1 px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:shadow-md shadow-sm text-gray-900 transition-all border border-gray-100/50 text-lg"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
