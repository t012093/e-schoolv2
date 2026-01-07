'use client'
import React, { useState } from 'react'
import { Eye, Headphones, Users, Calculator, Palette, Music, TreePine, BookOpen, ChevronRight, Lightbulb } from 'lucide-react'

export type LearningStyleResult = {
  visualScore: number
  auditoryScore: number
  kinestheticScore: number
  primaryStyle: 'visual' | 'auditory' | 'kinesthetic'
  multipleIntelligences: {
    linguistic: number
    logical: number
    spatial: number
    musical: number
    interpersonal: number
    intrapersonal: number
    naturalist: number
    bodily: number
  }
  completed: boolean
  recommendations: string[]
}

interface LearningStyleAssessmentProps {
  onComplete: (result: LearningStyleResult) => void
  existingResult?: LearningStyleResult
}

const learningStyleQuestions = [
  // Visual Learning
  { id: 'v1', style: 'visual', text: '図表やグラフを使った説明の方が理解しやすい', mi: 'spatial' },
  { id: 'v2', style: 'visual', text: '色分けやハイライトを使って情報を整理する', mi: 'spatial' },
  { id: 'v3', style: 'visual', text: '映像や画像で学習する方が記憶に残る', mi: 'spatial' },
  { id: 'v4', style: 'visual', text: 'マインドマップを作成して情報を整理するのが好き', mi: 'spatial' },

  // Auditory Learning  
  { id: 'a1', style: 'auditory', text: '音声で説明されると理解が早い', mi: 'musical' },
  { id: 'a2', style: 'auditory', text: '自分で声に出して読むと覚えやすい', mi: 'linguistic' },
  { id: 'a3', style: 'auditory', text: 'ディスカッションや質疑応答が学習に効果的', mi: 'interpersonal' },
  { id: 'a4', style: 'auditory', text: '音楽を聴きながら学習することがある', mi: 'musical' },

  // Kinesthetic Learning
  { id: 'k1', style: 'kinesthetic', text: '実際に手を動かして作業しながら学ぶのが好き', mi: 'bodily' },
  { id: 'k2', style: 'kinesthetic', text: '体験や実験を通して理解が深まる', mi: 'bodily' },
  { id: 'k3', style: 'kinesthetic', text: '歩きながらや動きながら考えることがある', mi: 'bodily' },
  { id: 'k4', style: 'kinesthetic', text: '実例や具体的な事例で学習するのが効果的', mi: 'logical' },

  // Multiple Intelligences
  { id: 'mi1', style: 'linguistic', text: '言葉や文章で表現するのが得意', mi: 'linguistic' },
  { id: 'mi2', style: 'logical', text: '数字やデータの分析が好き', mi: 'logical' },
  { id: 'mi3', style: 'interpersonal', text: '他人との協力作業が効率的', mi: 'interpersonal' },
  { id: 'mi4', style: 'intrapersonal', text: '一人で集中して考える時間が必要', mi: 'intrapersonal' },
  { id: 'mi5', style: 'naturalist', text: '自然や環境との関連で物事を理解する', mi: 'naturalist' },
  { id: 'mi6', style: 'musical', text: 'リズムやメロディーがあると覚えやすい', mi: 'musical' }
]

export function LearningStyleAssessment({ onComplete, existingResult }: LearningStyleAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResult, setShowResult] = useState(!!existingResult)

  const handleAnswer = (score: number) => {
    const question = learningStyleQuestions[currentQuestion]
    const newAnswers = {
      ...answers,
      [question.id]: score
    }
    setAnswers(newAnswers)
    
    if (currentQuestion < learningStyleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      const result = calculateLearningStyle(newAnswers)
      setShowResult(true)
      onComplete(result)
    }
  }

  const calculateLearningStyle = (answers: Record<string, number>): LearningStyleResult => {
    const styleScores = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0
    }

    const miScores = {
      linguistic: 0,
      logical: 0,
      spatial: 0,
      musical: 0,
      interpersonal: 0,
      intrapersonal: 0,
      naturalist: 0,
      bodily: 0
    }

    learningStyleQuestions.forEach(question => {
      const score = answers[question.id] || 0
      
      if (['visual', 'auditory', 'kinesthetic'].includes(question.style)) {
        styleScores[question.style as keyof typeof styleScores] += score
      }
      
      miScores[question.mi as keyof typeof miScores] += score
    })

    const maxStyle = Object.entries(styleScores).reduce((a, b) => 
      styleScores[a[0] as keyof typeof styleScores] > styleScores[b[0] as keyof typeof styleScores] ? a : b
    )[0] as 'visual' | 'auditory' | 'kinesthetic'

    const recommendations = generateRecommendations(maxStyle, miScores)

    return {
      visualScore: Math.round((styleScores.visual / 16) * 100),
      auditoryScore: Math.round((styleScores.auditory / 16) * 100),
      kinestheticScore: Math.round((styleScores.kinesthetic / 16) * 100),
      primaryStyle: maxStyle,
      multipleIntelligences: {
        linguistic: Math.round((miScores.linguistic / 8) * 100),
        logical: Math.round((miScores.logical / 8) * 100),
        spatial: Math.round((miScores.spatial / 16) * 100),
        musical: Math.round((miScores.musical / 8) * 100),
        interpersonal: Math.round((miScores.interpersonal / 8) * 100),
        intrapersonal: Math.round((miScores.intrapersonal / 4) * 100),
        naturalist: Math.round((miScores.naturalist / 4) * 100),
        bodily: Math.round((miScores.bodily / 12) * 100),
      },
      completed: true,
      recommendations
    }
  }

  const generateRecommendations = (primaryStyle: string, miScores: any): string[] => {
    const recommendations = []
    
    switch (primaryStyle) {
      case 'visual':
        recommendations.push('図表・グラフ・マインドマップを活用した学習')
        recommendations.push('色分けやハイライトでの情報整理')
        recommendations.push('動画やインフォグラフィックでの学習')
        break
      case 'auditory':
        recommendations.push('音声講義や録音教材での学習')
        recommendations.push('音読や復唱を取り入れた学習')
        recommendations.push('ディスカッションや質疑応答の活用')
        break
      case 'kinesthetic':
        recommendations.push('実習・実験・プロジェクト型学習')
        recommendations.push('体験を通した理解の促進')
        recommendations.push('短時間に区切った集中学習')
        break
    }

    const topMI = Object.entries(miScores).sort(([,a], [,b]) => b - a).slice(0, 2)
    topMI.forEach(([intelligence]) => {
      switch (intelligence) {
        case 'linguistic':
          recommendations.push('読書・作文・言語的表現を重視')
          break
        case 'logical':
          recommendations.push('論理的思考・数的処理・分析的アプローチ')
          break
        case 'interpersonal':
          recommendations.push('グループ学習・チームプロジェクト')
          break
        case 'musical':
          recommendations.push('リズム・音楽を活用した記憶技法')
          break
      }
    })

    return recommendations
  }

  if (showResult && existingResult) {
    return <LearningStyleResult result={existingResult} />
  }

  if (showResult) {
    const result = calculateLearningStyle(answers)
    return <LearningStyleResult result={result} />
  }

  const progress = ((currentQuestion + 1) / learningStyleQuestions.length) * 100
  const question = learningStyleQuestions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-1">学習スタイル診断</h2>
            <p className="text-white/90 text-lg">VAK学習タイプ & 多重知能理論分析</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/70 mb-1">進捗</p>
            <p className="text-3xl font-bold">{currentQuestion + 1}<span className="text-lg">/{learningStyleQuestions.length}</span></p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-6 shadow-xl border-2 border-blue-100/50">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-600">診断の進捗状況</span>
          <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-white via-purple-50/20 to-blue-50/20 rounded-3xl p-10 shadow-2xl border-2 border-blue-100/50">
        <div className="mb-8">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
            <span className="text-sm font-bold text-blue-700">質問 {currentQuestion + 1}</span>
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
                className="group relative bg-white rounded-3xl p-6 border-2 border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all hover:scale-105"
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
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
          <span className="text-sm font-medium">所要時間: 約2分</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="text-sm">次の質問へ</span>
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function LearningStyleResult({ result }: { result: LearningStyleResult }) {
  const styles = [
    {
      key: 'visual',
      label: '視覚的学習',
      score: result.visualScore,
      icon: Eye,
      color: 'bg-blue-500',
      gradientColor: 'from-blue-400 to-cyan-400',
      emoji: '👁️',
      description: '図表・画像・色彩を活用'
    },
    {
      key: 'auditory',
      label: '聴覚的学習',
      score: result.auditoryScore,
      icon: Headphones,
      color: 'bg-green-500',
      gradientColor: 'from-green-400 to-emerald-400',
      emoji: '👂',
      description: '音声・対話・リズムを活用'
    },
    {
      key: 'kinesthetic',
      label: '体感的学習',
      score: result.kinestheticScore,
      icon: Users,
      color: 'bg-orange-500',
      gradientColor: 'from-orange-400 to-amber-400',
      emoji: '🤲',
      description: '体験・実践・動作を活用'
    }
  ]

  const intelligences = [
    { key: 'linguistic', label: '言語的', icon: BookOpen, emoji: '📚', score: result.multipleIntelligences.linguistic },
    { key: 'logical', label: '論理数学的', icon: Calculator, emoji: '🔢', score: result.multipleIntelligences.logical },
    { key: 'spatial', label: '空間的', icon: Palette, emoji: '🎨', score: result.multipleIntelligences.spatial },
    { key: 'musical', label: '音楽的', icon: Music, emoji: '🎵', score: result.multipleIntelligences.musical },
    { key: 'interpersonal', label: '対人的', icon: Users, emoji: '👥', score: result.multipleIntelligences.interpersonal },
    { key: 'intrapersonal', label: '内省的', icon: Eye, emoji: '🧘', score: result.multipleIntelligences.intrapersonal },
    { key: 'naturalist', label: '自然探求的', icon: TreePine, emoji: '🌳', score: result.multipleIntelligences.naturalist },
    { key: 'bodily', label: '身体運動的', icon: Users, emoji: '🏃', score: result.multipleIntelligences.bodily },
  ]

  const primaryStyleData = styles.find(s => s.key === result.primaryStyle)

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">学習スタイル診断結果</h2>
            <p className="text-white/90 text-lg">あなたに最適な学習アプローチ</p>
          </div>
        </div>
      </div>

      {/* Primary Learning Style - Hero Section */}
      {primaryStyleData && (
        <div className={`bg-gradient-to-br ${primaryStyleData.gradientColor} rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden`}>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{primaryStyleData.emoji}</div>
              <div>
                <h3 className="text-2xl font-bold mb-1">あなたのメイン学習スタイル</h3>
                <p className="text-white/90 text-xl font-semibold">{primaryStyleData.label}</p>
              </div>
            </div>
            <p className="text-white/90 text-lg mb-4">{primaryStyleData.description}</p>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">適合度</span>
                <span className="text-2xl font-bold">{primaryStyleData.score}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full shadow-lg transition-all duration-500"
                  style={{ width: `${primaryStyleData.score}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VAK Learning Styles Comparison */}
        <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl p-8 shadow-xl border-2 border-purple-100/50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            学習スタイル比較
          </h3>
          <div className="space-y-5">
            {styles.map(style => (
              <div key={style.key} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{style.emoji}</div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">{style.label}</span>
                    <p className="text-xs text-gray-600">{style.description}</p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{style.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${style.color} h-2.5 rounded-full transition-all duration-500 shadow-sm`}
                    style={{ width: `${style.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multiple Intelligences */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-8 shadow-xl border-2 border-blue-100/50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            多重知能プロフィール
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {intelligences.map(intelligence => (
              <div key={intelligence.key} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{intelligence.emoji}</span>
                  <span className="text-sm font-semibold text-gray-900">{intelligence.label}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${intelligence.score}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700">{intelligence.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-xl border-2 border-orange-100/50">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          推奨学習方法
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.recommendations.map((rec, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-md border border-orange-100 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">{rec}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}