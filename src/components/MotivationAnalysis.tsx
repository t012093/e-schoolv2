'use client'
import React, { useState } from 'react'
import { Target, Users, Award, TrendingUp } from 'lucide-react'

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">学習動機分析</h2>
            <p className="text-sm text-gray-600">自己決定理論に基づく動機づけタイプ診断</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">進捗</span>
            <span className="text-sm font-medium">{currentQuestion + 1}/{motivationQuestions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            質問 {currentQuestion + 1}
          </h3>
          <p className="text-base mb-6">{question.text}</p>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600 text-center mb-3">
              あなたにどの程度当てはまりますか？
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: 1, label: '全く\n当てはまらない' },
                { value: 2, label: 'あまり\n当てはまらない' },
                { value: 3, label: 'どちらとも\nいえない' },
                { value: 4, label: 'やや\n当てはまる' },
                { value: 5, label: 'とても\n当てはまる' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors text-sm text-center whitespace-pre-line"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>所要時間: 約3分</span>
          <span>効果的な学習環境の設計</span>
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
      description: '自己決定・選択権'
    },
    { 
      key: 'competence', 
      label: '有能感', 
      score: result.competence,
      icon: Award, 
      color: 'bg-green-500',
      description: '達成感・成長実感'
    },
    { 
      key: 'relatedness', 
      label: '関係性', 
      score: result.relatedness,
      icon: Users, 
      color: 'bg-purple-500',
      description: '所属感・つながり'
    }
  ]

  const getMotivationTypeInfo = (type: string) => {
    switch (type) {
      case 'autonomous':
        return {
          label: '自律的動機',
          description: '内発的動機が高く、自主的な学習を好む',
          color: 'bg-blue-50 text-blue-900 border-blue-200'
        }
      case 'controlled':
        return {
          label: '統制的動機',
          description: '外的な指導やサポートを重視する',
          color: 'bg-yellow-50 text-yellow-900 border-yellow-200'
        }
      default:
        return {
          label: 'バランス型動機',
          description: '内発と外発のバランスが取れている',
          color: 'bg-green-50 text-green-900 border-green-200'
        }
    }
  }

  const motivationInfo = getMotivationTypeInfo(result.motivationType)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">学習動機分析結果</h2>
            <p className="text-sm text-gray-600">あなたの動機づけパターンと推奨アプローチ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* SDT Factors */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">自己決定理論（SDT）プロフィール</h3>
            {factors.map(factor => (
              <div key={factor.key} className="space-y-2">
                <div className="flex items-center gap-3">
                  <factor.icon className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{factor.label}</span>
                      <span className="text-sm font-medium">{factor.score}/100</span>
                    </div>
                    <p className="text-sm text-gray-500">{factor.description}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 ml-8">
                  <div 
                    className={`${factor.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Motivation Type */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">動機づけタイプ</h3>
            <div className={`border rounded-lg p-4 mb-4 ${motivationInfo.color}`}>
              <h4 className="font-medium text-lg mb-2">{motivationInfo.label}</h4>
              <p className="text-sm">{motivationInfo.description}</p>
            </div>

            <h4 className="font-medium mb-3">主要な学習動機</h4>
            <div className="space-y-2">
              {result.learningMotivators.map((motivator, index) => (
                <div key={index} className="bg-white rounded-md p-3 text-sm font-medium">
                  {motivator}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">推奨学習アプローチ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendedApproaches.map((approach, index) => (
              <div key={index} className="bg-white rounded-md p-4">
                <p className="text-sm">{approach}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-md border-l-4 border-orange-500">
            <p className="text-sm text-gray-700">
              <strong>重要：</strong>これらの結果は学習環境の最適化に活用され、
              AIコーチがあなたに合わせた学習計画とフィードバックを提供します。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}