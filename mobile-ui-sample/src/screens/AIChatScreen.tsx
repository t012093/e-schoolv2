'use client'

import React, { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'

const initialMessages = [
  {
    id: 1,
    type: 'ai',
    text: 'こんにちは！今日の学習をサポートします。何か質問はありますか？',
    time: '10:30'
  },
  {
    id: 2,
    type: 'user',
    text: '英語の学習方法を教えて',
    time: '10:31'
  },
  {
    id: 3,
    type: 'ai',
    text: 'あなたの学習スタイルは「視覚型」ですね！イラストや図解を活用した教材がおすすめです。',
    time: '10:31'
  }
]

const quickReplies = [
  '今日のおすすめは？',
  'モチベーションが上がらない',
  '学習計画を立てたい',
  '進捗を確認したい'
]

export default function AIChatScreen() {
  const [messages, setMessages] = useState(initialMessages)
  const [inputText, setInputText] = useState('')

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        text: inputText,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages([...messages, newMessage])
      setInputText('')

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          text: 'ありがとうございます。その質問についてお答えしますね！',
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, aiResponse])
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AIコーチ</h1>
            <p className="text-sm text-gray-500">いつでも相談してください</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-3xl px-5 py-3 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-md'
                  : 'bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/50 text-gray-900 shadow-sm'
              }`}
            >
              <p className="text-base leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-white/70' : 'text-gray-400'
              }`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Replies */}
      <div className="px-6 py-3 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => setInputText(reply)}
              className="flex-shrink-0 px-5 py-2.5 bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/50 rounded-full text-sm text-gray-700 hover:shadow-md shadow-sm active:scale-95 transition-all"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-1 px-5 py-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:shadow-md shadow-sm text-gray-900 transition-all border border-gray-100/50"
          />
          <button
            onClick={handleSend}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
