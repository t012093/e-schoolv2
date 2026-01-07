'use client'
import React, { useState } from 'react'
import { ChevronRight, Brain, BarChart3 } from 'lucide-react'

export type PersonalityTraits = {
  extraversion: number
  agreeableness: number
  conscientiousness: number
  neuroticism: number
  openness: number
}

export type PersonalityResult = PersonalityTraits & {
  completed: boolean
  learningStyle: string
}

interface PersonalityAssessmentProps {
  onComplete: (result: PersonalityResult) => void
  existingResult?: PersonalityResult
}

const bigFiveQuestions = [
  // 外向性 (Extraversion)
  { id: 'e1', trait: 'extraversion', text: '新しい人に会うことが楽しいと感じる', reverse: false },
  { id: 'e2', trait: 'extraversion', text: '一人でいる時間を好む', reverse: true },
  { id: 'e3', trait: 'extraversion', text: 'グループの中で積極的に発言する', reverse: false },
  { id: 'e4', trait: 'extraversion', text: '大きなパーティーよりも小さな集まりを好む', reverse: true },
  
  // 協調性 (Agreeableness)
  { id: 'a1', trait: 'agreeableness', text: '他人の気持ちを理解しようとする', reverse: false },
  { id: 'a2', trait: 'agreeableness', text: '人とのもめごとは避けたいと思う', reverse: false },
  { id: 'a3', trait: 'agreeableness', text: '批判的な意見をはっきりと言う', reverse: true },
  { id: 'a4', trait: 'agreeableness', text: '困っている人を見ると助けたくなる', reverse: false },
  
  // 誠実性 (Conscientiousness)
  { id: 'c1', trait: 'conscientiousness', text: '計画を立てて物事を進めることが得意', reverse: false },
  { id: 'c2', trait: 'conscientiousness', text: 'やるべきことを後回しにしがち', reverse: true },
  { id: 'c3', trait: 'conscientiousness', text: '時間通りに約束を守ることを重視する', reverse: false },
  { id: 'c4', trait: 'conscientiousness', text: '整理整頓は苦手な方だ', reverse: true },
  
  // 神経症的傾向 (Neuroticism)
  { id: 'n1', trait: 'neuroticism', text: 'ストレスを感じやすい', reverse: false },
  { id: 'n2', trait: 'neuroticism', text: '困難に直面してもあまり動揺しない', reverse: true },
  { id: 'n3', trait: 'neuroticism', text: '心配事が頭から離れないことがある', reverse: false },
  { id: 'n4', trait: 'neuroticism', text: '気分の浮き沈みが激しい', reverse: false },
  
  // 開放性 (Openness)
  { id: 'o1', trait: 'openness', text: '新しいアイデアや経験に興味がある', reverse: false },
  { id: 'o2', trait: 'openness', text: '伝統的な方法を好む', reverse: true },
  { id: 'o3', trait: 'openness', text: '創造的な活動が好き', reverse: false },
  { id: 'o4', trait: 'openness', text: '抽象的な概念について考えるのが好き', reverse: false },
]

export function PersonalityAssessment({ onComplete, existingResult }: PersonalityAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResult, setShowResult] = useState(!!existingResult)

  const handleAnswer = (score: number) => {
    const question = bigFiveQuestions[currentQuestion]
    const newAnswers = {
      ...answers,
      [question.id]: question.reverse ? 6 - score : score
    }
    setAnswers(newAnswers)
    
    if (currentQuestion < bigFiveQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      const result = calculatePersonalityTraits(newAnswers)
      setShowResult(true)
      onComplete(result)
    }
  }

  const calculatePersonalityTraits = (answers: Record<string, number>): PersonalityResult => {
    const traitScores: PersonalityTraits = {
      extraversion: 0,
      agreeableness: 0,
      conscientiousness: 0,
      neuroticism: 0,
      openness: 0
    }

    const traitCounts: Record<string, number> = {}

    Object.keys(traitScores).forEach(trait => {
      const questions = bigFiveQuestions.filter(q => q.trait === trait)
      const total = questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0)
      traitScores[trait as keyof PersonalityTraits] = Math.round((total / questions.length) * 20)
      traitCounts[trait] = questions.length
    })

    const learningStyle = determineLearningStyle(traitScores)

    return {
      ...traitScores,
      completed: true,
      learningStyle
    }
  }

  const determineLearningStyle = (traits: PersonalityTraits): string => {
    if (traits.extraversion > 70 && traits.openness > 70) {
      return '対話型学習・ディスカッション重視'
    } else if (traits.conscientiousness > 80 && traits.neuroticism < 50) {
      return '計画的・体系的学習'
    } else if (traits.openness > 80) {
      return '探究型・創造的学習'
    } else if (traits.extraversion < 40 && traits.conscientiousness > 60) {
      return '個別学習・深い集中型'
    } else {
      return 'バランス型・適応的学習'
    }
  }

  if (showResult && existingResult) {
    return <PersonalityResult result={existingResult} />
  }

  if (showResult) {
    const result = calculatePersonalityTraits(answers)
    return <PersonalityResult result={result} />
  }

  const progress = ((currentQuestion + 1) / bigFiveQuestions.length) * 100
  const question = bigFiveQuestions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-purple-400 via-blue-500 to-pink-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-1">性格特性診断</h2>
            <p className="text-white/90 text-lg">Big Five理論に基づく学習スタイル分析</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/70 mb-1">進捗</p>
            <p className="text-3xl font-bold">{currentQuestion + 1}<span className="text-lg">/{bigFiveQuestions.length}</span></p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-6 shadow-xl border-2 border-purple-100/50">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-600">診断の進捗状況</span>
          <span className="text-sm font-bold text-purple-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-purple-400 via-blue-500 to-pink-500 h-4 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 rounded-3xl p-10 shadow-2xl border-2 border-purple-100/50">
        <div className="mb-8">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-4">
            <span className="text-sm font-bold text-purple-700">質問 {currentQuestion + 1}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 leading-relaxed">{question.text}</h3>
        </div>

        <div className="space-y-6">
          <p className="text-center text-gray-600 font-medium text-lg mb-6">
            あなたにどの程度当てはまりますか？
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { value: 1, label: '全く当てはまらない', emoji: '❌', color: 'from-red-400 to-pink-400' },
              { value: 2, label: 'あまり当てはまらない', emoji: '😐', color: 'from-orange-400 to-yellow-400' },
              { value: 3, label: 'どちらともいえない', emoji: '🤔', color: 'from-yellow-400 to-amber-400' },
              { value: 4, label: 'やや当てはまる', emoji: '😊', color: 'from-lime-400 to-green-400' },
              { value: 5, label: 'とても当てはまる', emoji: '✅', color: 'from-green-400 to-emerald-400' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="group relative bg-white rounded-3xl p-6 border-2 border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{option.emoji}</div>
                  <p className="text-sm font-bold text-gray-700 leading-tight">{option.label}</p>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`}></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-gray-500 px-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-medium">所要時間: 約3分</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="text-sm">次の質問へ</span>
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function PersonalityResult({ result }: { result: PersonalityResult }) {
  const traits = [
    { key: 'extraversion', label: '外向性', description: '社交性・活動性' },
    { key: 'agreeableness', label: '協調性', description: '協力性・信頼性' },
    { key: 'conscientiousness', label: '誠実性', description: '責任感・計画性' },
    { key: 'neuroticism', label: '神経症的傾向', description: 'ストレス耐性' },
    { key: 'openness', label: '開放性', description: '新奇性・創造性' },
  ]

  const getTraitLevel = (score: number) => {
    if (score >= 80) return { level: '非常に高い', color: 'bg-green-500' }
    if (score >= 60) return { level: '高い', color: 'bg-blue-500' }
    if (score >= 40) return { level: '平均的', color: 'bg-yellow-500' }
    if (score >= 20) return { level: '低い', color: 'bg-orange-500' }
    return { level: '非常に低い', color: 'bg-red-500' }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">診断結果</h2>
            <p className="text-sm text-gray-600">あなたの性格特性と推奨学習スタイル</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">性格特性プロフィール</h3>
            {traits.map(trait => {
              const score = result[trait.key as keyof PersonalityTraits]
              const { level, color } = getTraitLevel(score)
              
              return (
                <div key={trait.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{trait.label}</span>
                      <span className="text-sm text-gray-500 ml-2">({trait.description})</span>
                    </div>
                    <span className="text-sm font-medium">{score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{level}</span>
                </div>
              )
            })}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">推奨学習スタイル</h3>
            <div className="bg-white rounded-md p-4 mb-4">
              <p className="font-medium text-blue-900">{result.learningStyle}</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <h4 className="font-medium">学習のポイント:</h4>
              <ul className="space-y-1 text-gray-700">
                {result.extraversion > 60 ? (
                  <li>• ディスカッションやグループ学習を活用</li>
                ) : (
                  <li>• 静かな環境での集中学習が効果的</li>
                )}
                {result.conscientiousness > 70 ? (
                  <li>• スケジュール管理と計画的な学習</li>
                ) : (
                  <li>• 柔軟な学習ペースで無理をしない</li>
                )}
                {result.openness > 70 ? (
                  <li>• 多様な学習手法と新しいアプローチ</li>
                ) : (
                  <li>• 確立された方法での着実な学習</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}