'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, MessageCircle, Lightbulb, BookOpen, Target, TrendingUp } from 'lucide-react'
import { ComprehensiveProfile } from './PersonalizedAssessment'

interface ChatMessage {
  id: string
  type: 'user' | 'coach'
  content: string
  timestamp: Date
  suggestions?: string[]
  learningTip?: boolean
}

interface AICoachChatProps {
  profile?: ComprehensiveProfile
}

export function AICoachChat({ profile }: AICoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    loadChatHistory()
    if (!messages.length) {
      initializeChat()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem('ai.coach.chat.v1')
      if (saved) {
        const parsedMessages = JSON.parse(saved).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(parsedMessages)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const saveChatHistory = (newMessages: ChatMessage[]) => {
    try {
      localStorage.setItem('ai.coach.chat.v1', JSON.stringify(newMessages))
    } catch (error) {
      console.error('Failed to save chat history:', error)
    }
  }

  const initializeChat = () => {
    const welcomeMessage = generateWelcomeMessage()
    const initialMessages = [welcomeMessage]
    setMessages(initialMessages)
    saveChatHistory(initialMessages)
  }

  const generateWelcomeMessage = (): ChatMessage => {
    let welcomeContent = 'こんにちは！私はあなた専用のAI学習コーチです。'
    
    if (profile) {
      welcomeContent += `\n\n診断結果を確認しました：\n• ${profile.personality?.learningStyle || 'バランス型学習'}\n• ${profile.learningStyle?.primaryStyle === 'visual' ? '視覚的学習' : profile.learningStyle?.primaryStyle === 'auditory' ? '聴覚的学習' : '体感的学習'}が得意\n• ${profile.motivation?.motivationType === 'autonomous' ? '自律的動機' : profile.motivation?.motivationType === 'controlled' ? '統制的動機' : 'バランス型動機'}\n\nこれらの特性を活かした学習サポートを提供します！`
    } else {
      welcomeContent += '\n\n効果的な学習サポートのため、まずはパーソナライズ診断を受けることをお勧めします。'
    }

    return {
      id: Date.now().toString(),
      type: 'coach',
      content: welcomeContent,
      timestamp: new Date(),
      suggestions: profile 
        ? ['今日の学習計画を相談したい', '苦手分野の克服方法を知りたい', '学習モチベーションを上げたい']
        : ['パーソナライズ診断を受ける', '学習方法について相談する', 'AI学習コーチの機能を知りたい']
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setCurrentMessage('')
    setIsTyping(true)

    // Simulate AI response with delay
    setTimeout(() => {
      const coachResponse = generateCoachResponse(currentMessage, profile)
      const finalMessages = [...updatedMessages, coachResponse]
      setMessages(finalMessages)
      saveChatHistory(finalMessages)
      setIsTyping(false)
    }, 1500 + Math.random() * 1000)
  }

  const generateCoachResponse = (userInput: string, profile?: ComprehensiveProfile): ChatMessage => {
    const input = userInput.toLowerCase()
    let response = ''
    let suggestions: string[] = []
    let learningTip = false

    // Profile-based personalized responses
    if (profile) {
      // Motivation-based responses
      if (input.includes('モチベーション') || input.includes('やる気')) {
        if (profile.motivation?.motivationType === 'autonomous') {
          response = '自律的な学習スタイルのあなたには、自分で目標設定することが効果的です。小さな目標から始めて、達成感を積み重ねることをお勧めします。'
        } else if (profile.motivation?.motivationType === 'controlled') {
          response = '外的なサポートが効果的なあなたには、学習仲間との約束や定期的なチェックインが有効です。コミュニティ機能を活用してみませんか？'
        } else {
          response = 'バランス型のあなたには、内発的動機と外発的サポートの組み合わせが最適です。自分の興味と他者との連携を両立させましょう。'
        }
        suggestions = ['具体的な目標設定方法', '学習習慣の作り方', 'コミュニティ活用法']
      }
      // Learning style-based responses
      else if (input.includes('学習方法') || input.includes('勉強')) {
        if (profile.learningStyle?.primaryStyle === 'visual') {
          response = '視覚的学習が得意なあなたには、マインドマップ、図表、色分けメモが効果的です。情報を視覚化して整理することを意識してみてください。'
        } else if (profile.learningStyle?.primaryStyle === 'auditory') {
          response = '聴覚的学習が得意なあなたには、音読、討論、音声教材が有効です。学習内容を声に出して確認する習慣をつけましょう。'
        } else {
          response = '体感的学習が得意なあなたには、実践的な演習、手を動かす作業、短時間集中が適しています。理論と実践を組み合わせて学習しましょう。'
        }
        suggestions = ['おすすめ学習ツール', '効果的な復習方法', '集中力向上のコツ']
      }
      // Personality-based responses
      else if (input.includes('計画') || input.includes('スケジュール')) {
        if (profile.personality?.conscientiousness && profile.personality.conscientiousness > 70) {
          response = '計画性の高いあなたには、詳細な学習スケジュールと進捗管理が向いています。週単位・日単位での目標設定をお勧めします。'
        } else {
          response = 'フレキシブルなアプローチが向いているあなたには、大まかな目標設定と柔軟な調整を重視した計画がお勧めです。'
        }
        suggestions = ['週間学習計画の立て方', '進捗管理のコツ', 'バランスの取り方']
        learningTip = true
      }
    }

    // General responses
    if (!response) {
      if (input.includes('こんにちは') || input.includes('はじめまして')) {
        response = 'こんにちは！今日はどのような学習サポートが必要ですか？'
        suggestions = ['学習計画を立てたい', '学習方法を相談したい', 'モチベーション管理について']
      } else if (input.includes('ありがとう')) {
        response = 'どういたしまして！学習の成功を全力でサポートします。他にも何かありましたらお気軽にお聞かせください。'
        suggestions = ['別の質問をする', '学習のコツを聞く', '今日の振り返りをする']
      } else {
        response = 'とても良い質問ですね！あなたの学習スタイルに合わせて、より具体的なアドバイスができるよう詳しく教えてください。'
        suggestions = ['具体的な状況を説明する', 'おすすめの方法を聞く', '他の質問をする']
      }
    }

    return {
      id: Date.now().toString(),
      type: 'coach',
      content: response,
      timestamp: new Date(),
      suggestions,
      learningTip
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!mounted) {
    return <div className="flex items-center justify-center h-64">読み込み中...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">AI学習コーチ</h2>
            <p className="text-sm text-gray-600">
              {profile ? 'パーソナライズ済み' : '汎用モード'} | 学習サポート
            </p>
          </div>
          <MessageCircle className="w-5 h-5 text-gray-400" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] space-y-2 ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-center gap-2 text-sm ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'coach' && <Bot className="w-4 h-4 text-blue-500" />}
                  <span className="text-gray-500">
                    {message.type === 'coach' ? 'AIコーチ' : 'あなた'}
                  </span>
                  {message.type === 'user' && <User className="w-4 h-4 text-gray-500" />}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : message.learningTip 
                      ? 'bg-yellow-50 border border-yellow-200 text-gray-800'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.learningTip && (
                    <div className="flex items-center gap-1 mt-2 text-yellow-700">
                      <Lightbulb className="w-4 h-4" />
                      <span className="text-xs font-medium">学習のコツ</span>
                    </div>
                  )}
                </div>
                {message.suggestions && (
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-500" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-3">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="学習について相談してください..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {!profile && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              💡 パーソナライズ診断を完了すると、より個人に合わせたアドバイスを受けられます
            </div>
          )}
        </div>
      </div>

      {/* Profile Status */}
      {profile && (
        <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">パーソナライズ完了</p>
                <p className="text-sm text-green-700">あなた専用のコーチング体験</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span>{profile.motivation?.motivationType}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>{profile.learningStyle?.primaryStyle}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}