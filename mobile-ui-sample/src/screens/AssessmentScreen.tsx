'use client'

import React, { useState } from 'react'
import { ChevronLeft, Check } from 'lucide-react'

const questions = [
  {
    id: 1,
    question: 'あなたの学習スタイルは？',
    icon: '📚',
    options: [
      { id: 'a', text: '図やイラストで理解', emoji: '👁️' },
      { id: 'b', text: '音声で聞いて理解', emoji: '👂' },
      { id: 'c', text: '実際に手を動かす', emoji: '✋' },
    ]
  },
  {
    id: 2,
    question: '学習するときは？',
    icon: '⏰',
    options: [
      { id: 'a', text: '朝が集中できる', emoji: '🌅' },
      { id: 'b', text: '夜が集中できる', emoji: '🌙' },
      { id: 'c', text: '時間は関係ない', emoji: '⏱️' },
    ]
  },
  {
    id: 3,
    question: 'どんなペースが好き？',
    icon: '🚀',
    options: [
      { id: 'a', text: 'じっくり丁寧に', emoji: '🐢' },
      { id: 'b', text: 'テンポよく進める', emoji: '🐇' },
      { id: 'c', text: 'その日の気分次第', emoji: '🎲' },
    ]
  }
]

export default function AssessmentScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answers, setAnswers] = useState<string[]>([])

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
  }

  const handleNext = () => {
    if (selectedOption) {
      const newAnswers = [...answers, selectedOption]
      setAnswers(newAnswers)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedOption(null)
      } else {
        // Show result
        alert('診断完了！あなたは「戦略家タイプ」です 🎯')
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="p-6">
        <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Progress Bar */}
        <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 text-right text-sm text-gray-500">
          {currentQuestion + 1} / {questions.length}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="text-8xl mb-8 animate-bounce">{question.icon}</div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          {question.question}
        </h2>

        {/* Options */}
        <div className="w-full space-y-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full p-5 rounded-2xl border-2 transition-all active:scale-95 ${
                selectedOption === option.id
                  ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-lg font-medium text-gray-900">{option.text}</span>
                </div>
                {selectedOption === option.id && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="p-6 bg-white border-t border-gray-200">
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            selectedOption
              ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentQuestion < questions.length - 1 ? '次へ' : '完了'}
        </button>
      </div>
    </div>
  )
}
