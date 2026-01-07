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
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-pink-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-8 shadow-lg">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-400 via-blue-500 to-pink-500 flex items-center justify-center shadow-xl animate-pulse">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              {profile && (
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">AIコーチ</h1>
              <p className="text-gray-600">
                {profile ? `🎯 ${profile.aiCoachProfile}のあなたをサポート` : '💬 いつでも相談してください'}
              </p>
            </div>
            {profile && (
              <div className="flex gap-3">
                <div className="px-4 py-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full text-sm font-medium text-purple-700 shadow-sm">
                  {profile.learningStyle?.primaryStyle === 'visual' ? '👁️ 視覚的' :
                   profile.learningStyle?.primaryStyle === 'auditory' ? '👂 聴覚的' : '✋ 体感的'}
                </div>
                <div className="px-4 py-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-full text-sm font-medium text-green-700 shadow-sm">
                  {profile.motivation?.motivationType === 'autonomous' ? '🎯 自律型' :
                   profile.motivation?.motivationType === 'controlled' ? '🤝 サポート型' : '⚖️ バランス型'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1200px] mx-auto space-y-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              )}
              <div
                className={`max-w-[65%] ${
                  message.type === 'user'
                    ? 'order-2'
                    : 'order-1'
                }`}
              >
                <div
                  className={`rounded-3xl px-7 py-5 shadow-xl hover:shadow-2xl transition-all ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 text-white'
                      : 'bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-2 border-purple-100/50 text-gray-900'
                  }`}
                >
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-3 ${
                    message.type === 'user' ? 'text-white/60' : 'text-gray-400'
                  }`}>
                    {message.time}
                  </p>
                </div>
              </div>
              {message.type === 'user' && (
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">👤</span>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-2 border-purple-100/50 rounded-3xl px-7 py-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                  <span className="text-gray-600 font-medium">考え中...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {!isLoading && messages.length > 0 && (
        <div className="px-8 py-5 bg-gradient-to-r from-purple-50/30 via-blue-50/30 to-pink-50/30 border-t border-gray-200/30">
          <div className="max-w-[1200px] mx-auto">
            <p className="text-xs font-semibold text-gray-500 mb-3 tracking-wide uppercase">クイック返信</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(reply)}
                  className="flex-shrink-0 px-6 py-3 bg-white rounded-full text-sm font-medium text-gray-700 hover:text-purple-700 border-2 border-purple-100/50 hover:border-purple-300 shadow-md hover:shadow-xl transition-all hover:scale-105 group"
                >
                  <span className="flex items-center gap-2">
                    <span>💬</span>
                    {reply}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t-2 border-purple-100/50 p-8 shadow-2xl">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="メッセージを入力してください..."
                className="w-full px-8 py-5 bg-gradient-to-br from-gray-50 to-white rounded-3xl focus:outline-none focus:ring-4 focus:ring-purple-200/50 shadow-lg border-2 border-gray-100 focus:border-purple-300 text-gray-900 transition-all text-lg placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-400 via-blue-500 to-pink-500 flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
            >
              {isLoading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <Send className="w-7 h-7 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>
          {profile && (
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span>パーソナライズド AIコーチが対応中</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
