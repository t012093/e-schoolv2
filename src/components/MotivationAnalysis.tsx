'use client'
import React, { useState } from 'react'
import { Target, Users, Award, TrendingUp, Rocket, ChevronRight, Zap } from 'lucide-react'

export type MotivationResult = {
  autonomy: number
  competence: number
  relatedness: number
  motivationType: 'autonomous' | 'controlled' | 'balanced'
  learningMotivators: string[]
  recommendedApproaches: string[]
  completed: boolean
}

interface MotivationAnalysisProps {
  onComplete: (result: MotivationResult) => void
  existingResult?: MotivationResult
}

const motivationQuestions = [
  // Autonomy (自律性)
  { id: 'au1', factor: 'autonomy', text: '学習する内容を自分で選択できることが重要', reverse: false },
  { id: 'au2', factor: 'autonomy', text: '自分のペースで学習できることを好む', reverse: false },
  { id: 'au3', factor: 'autonomy', text: '決められたカリキュラム通りに進めることが安心', reverse: true },
  { id: 'au4', factor: 'autonomy', text: '学習方法を自分で工夫することが楽しい', reverse: false },
  { id: 'au5', factor: 'autonomy', text: '目標設定は他人に決めてもらいたい', reverse: true },
  
  // Competence (有能感)
  { id: 'co1', factor: 'competence', text: '適度な挑戦がある課題に取り組みたい', reverse: false },
  { id: 'co2', factor: 'competence', text: '成果や進歩を実感できることが大切', reverse: false },
  { id: 'co3', factor: 'competence', text: '完璧にできないと不安になる', reverse: true },
  { id: 'co4', factor: 'competence', text: 'フィードバックをもらって改善したい', reverse: false },
  { id: 'co5', factor: 'competence', text: '失敗を恐れて新しいことに挑戦しにくい', reverse: true },
  
  // Relatedness (関係性)
  { id: 're1', factor: 'relatedness', text: '仲間と一緒に学習することが効果的', reverse: false },
  { id: 're2', factor: 'relatedness', text: '学習コミュニティに所属している感覚が欲しい', reverse: false },
  { id: 're3', factor: 'relatedness', text: '一人で黙々と学習する方が集中できる', reverse: true },
  { id: 're4', factor: 'relatedness', text: '指導者やメンターとの関係性を重視する', reverse: false },
  { id: 're5', factor: 'relatedness', text: '他人の評価は気にしないタイプ', reverse: true },

  // Additional motivational patterns
  { id: 'mo1', factor: 'achievement', text: '明確な目標達成が学習の動機になる', reverse: false },
  { id: 'mo2', factor: 'curiosity', text: '知的好奇心が学習の主な動機', reverse: false },
  { id: 'mo3', factor: 'recognition', text: '他人からの承認が学習意欲を高める', reverse: false },
  { id: 'mo4', factor: 'application', text: '実用性や将来への応用を重視する', reverse: false },
]

export function MotivationAnalysis({ onComplete, existingResult }: MotivationAnalysisProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResult, setShowResult] = useState(!!existingResult)

  const handleAnswer = (score: number) => {
    const question = motivationQuestions[currentQuestion]
    const newAnswers = {
      ...answers,
      [question.id]: question.reverse ? 6 - score : score
    }
    setAnswers(newAnswers)
    
    if (currentQuestion < motivationQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      const result = calculateMotivation(newAnswers)
      setShowResult(true)
      onComplete(result)
    }
  }

  const calculateMotivation = (answers: Record<string, number>): MotivationResult => {
    const factors = {
      autonomy: 0,
      competence: 0,
      relatedness: 0,
      achievement: 0,
      curiosity: 0,
      recognition: 0,
      application: 0
    }

    const factorCounts: Record<string, number> = {}

    motivationQuestions.forEach(question => {
      const score = answers[question.id] || 0
      factors[question.factor as keyof typeof factors] += score
      factorCounts[question.factor] = (factorCounts[question.factor] || 0) + 1
    })

    const autonomy = Math.round((factors.autonomy / factorCounts.autonomy) * 20)
    const competence = Math.round((factors.competence / factorCounts.competence) * 20)
    const relatedness = Math.round((factors.relatedness / factorCounts.relatedness) * 20)

    const motivationType = determineMotivationType(autonomy, competence, relatedness)
    const learningMotivators = determineLearningMotivators(factors, factorCounts)
    const recommendedApproaches = generateRecommendations(autonomy, competence, relatedness, factors)

    return {
      autonomy,
      competence,
      relatedness,
      motivationType,
      learningMotivators,
      recommendedApproaches,
      completed: true
    }
  }

  const determineMotivationType = (autonomy: number, competence: number, relatedness: number): 'autonomous' | 'controlled' | 'balanced' => {
    if (autonomy > 70 && competence > 60) {
      return 'autonomous'
    } else if (autonomy < 50 && relatedness > 60) {
      return 'controlled'
    } else {
      return 'balanced'
    }
  }

  const determineLearningMotivators = (factors: any, counts: Record<string, number>): string[] => {
    const motivators = []
    const scores = {
      achievement: Math.round((factors.achievement / counts.achievement) * 20),
      curiosity: Math.round((factors.curiosity / counts.curiosity) * 20),
      recognition: Math.round((factors.recognition / counts.recognition) * 20),
      application: Math.round((factors.application / counts.application) * 20)
    }

    const sortedMotivators = Object.entries(scores).sort(([,a], [,b]) => b - a)

    sortedMotivators.slice(0, 3).forEach(([motivator, score]) => {
      if (score > 60) {
        switch (motivator) {
          case 'achievement':
            motivators.push('目標達成・競争')
            break
          case 'curiosity':
            motivators.push('知的好奇心・探求')
            break
          case 'recognition':
            motivators.push('承認・評価')
            break
          case 'application':
            motivators.push('実用性・応用')
            break
        }
      }
    })

    return motivators.length > 0 ? motivators : ['バランス型']
  }

  const generateRecommendations = (autonomy: number, competence: number, relatedness: number, factors: any): string[] => {
    const recommendations = []

    // 自律性に基づく推奨
    if (autonomy > 70) {
      recommendations.push('学習計画やカリキュラムの選択権を重視')
      recommendations.push('自己主導型学習アプローチの採用')
    } else if (autonomy < 50) {
      recommendations.push('明確な指導とガイダンスの提供')
      recommendations.push('構造化されたカリキュラムでサポート')
    }

    // 有能感に基づく推奨
    if (competence > 70) {
      recommendations.push('挑戦的な課題と段階的な難易度上昇')
      recommendations.push('詳細なフィードバックと成長の可視化')
    } else if (competence < 50) {
      recommendations.push('小さな成功体験の積み重ね')
      recommendations.push('安心できる学習環境とサポート')
    }

    // 関係性に基づく推奨
    if (relatedness > 70) {
      recommendations.push('学習コミュニティとの積極的な交流')
      recommendations.push('グループ学習やピア・ラーニングの活用')
    } else if (relatedness < 50) {
      recommendations.push('個人学習を中心とした学習設計')
      recommendations.push('必要最小限のコミュニケーション')
    }

    return recommendations
  }

  if (showResult && existingResult) {
    return <MotivationResult result={existingResult} />
  }

  if (showResult) {
    const result = calculateMotivation(answers)
    return <MotivationResult result={result} />
  }

  const progress = ((currentQuestion + 1) / motivationQuestions.length) * 100
  const question = motivationQuestions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-1">学習動機分析</h2>
            <p className="text-white/90 text-lg">自己決定理論に基づく動機づけタイプ診断</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/70 mb-1">進捗</p>
            <p className="text-3xl font-bold">{currentQuestion + 1}<span className="text-lg">/{motivationQuestions.length}</span></p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-6 shadow-xl border-2 border-orange-100/50">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-600">診断の進捗状況</span>
          <span className="text-sm font-bold text-orange-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 h-4 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-3xl p-10 shadow-2xl border-2 border-orange-100/50">
        <div className="mb-8">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-4">
            <span className="text-sm font-bold text-orange-700">質問 {currentQuestion + 1}</span>
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
                className="group relative bg-white rounded-3xl p-6 border-2 border-gray-200 hover:border-orange-300 shadow-lg hover:shadow-2xl transition-all hover:scale-105"
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
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
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

function MotivationResult({ result }: { result: MotivationResult }) {
  const factors = [
    {
      key: 'autonomy',
      label: '自律性',
      score: result.autonomy,
      icon: Target,
      color: 'bg-blue-500',
      gradientColor: 'from-blue-400 to-cyan-400',
      emoji: '🎯',
      description: '自己決定・選択権'
    },
    {
      key: 'competence',
      label: '有能感',
      score: result.competence,
      icon: Award,
      color: 'bg-green-500',
      gradientColor: 'from-green-400 to-emerald-400',
      emoji: '🏆',
      description: '達成感・成長実感'
    },
    {
      key: 'relatedness',
      label: '関係性',
      score: result.relatedness,
      icon: Users,
      color: 'bg-purple-500',
      gradientColor: 'from-purple-400 to-pink-400',
      emoji: '🤝',
      description: '所属感・つながり'
    }
  ]

  const getMotivationTypeInfo = (type: string) => {
    switch (type) {
      case 'autonomous':
        return {
          label: '自律的動機',
          emoji: '🚀',
          description: '内発的動機が高く、自主的な学習を好むタイプ。自分で目標を設定し、主体的に学習を進めることで最大の成果を発揮します。',
          color: 'bg-blue-50 text-blue-900 border-blue-200',
          gradientColor: 'from-blue-400 to-cyan-400'
        }
      case 'controlled':
        return {
          label: '統制的動機',
          emoji: '🎓',
          description: '外的な指導やサポートを重視するタイプ。明確な指示と構造化された環境で安定した学習成果を上げます。',
          color: 'bg-amber-50 text-amber-900 border-amber-200',
          gradientColor: 'from-amber-400 to-orange-400'
        }
      default:
        return {
          label: 'バランス型動機',
          emoji: '⚖️',
          description: '内発と外発のバランスが取れているタイプ。状況に応じて柔軟に学習スタイルを調整できる適応力が強みです。',
          color: 'bg-green-50 text-green-900 border-green-200',
          gradientColor: 'from-green-400 to-teal-400'
        }
    }
  }

  const motivationEmojis: Record<string, string> = {
    '目標達成・競争': '🎯',
    '知的好奇心・探求': '🔍',
    '承認・評価': '👏',
    '実用性・応用': '💼',
    'バランス型': '⚖️'
  }

  const motivationInfo = getMotivationTypeInfo(result.motivationType)

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">学習動機分析結果</h2>
            <p className="text-white/90 text-lg">あなたの動機づけパターンと推奨アプローチ</p>
          </div>
        </div>
      </div>

      {/* Motivation Type - Hero Section */}
      <div className={`bg-gradient-to-br ${motivationInfo.gradientColor} rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden`}>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{motivationInfo.emoji}</div>
            <div>
              <h3 className="text-2xl font-bold mb-1">あなたの動機づけタイプ</h3>
              <p className="text-white/90 text-xl font-semibold">{motivationInfo.label}</p>
            </div>
          </div>
          <p className="text-white/90 text-lg mb-4 leading-relaxed">{motivationInfo.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SDT Factors */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-8 shadow-xl border-2 border-blue-100/50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            自己決定理論（SDT）プロフィール
          </h3>
          <div className="space-y-5">
            {factors.map(factor => (
              <div key={factor.key} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{factor.emoji}</div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">{factor.label}</span>
                    <p className="text-xs text-gray-600">{factor.description}</p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{factor.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${factor.color} h-2.5 rounded-full transition-all duration-500 shadow-sm`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Motivators */}
        <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl p-8 shadow-xl border-2 border-purple-100/50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            主要な学習動機
          </h3>
          <div className="space-y-3">
            {result.learningMotivators.map((motivator, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{motivationEmojis[motivator] || '✨'}</span>
                  <span className="text-base font-semibold text-gray-900">{motivator}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 shadow-xl border-2 border-orange-100/50">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          推奨学習アプローチ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {result.recommendedApproaches.map((approach, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-md border border-orange-100 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">{approach}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 border-l-4 border-orange-500 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🎯</span>
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>重要：</strong>これらの結果は学習環境の最適化に活用され、
              AIコーチがあなたに合わせた学習計画とフィードバックを提供します。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}