'use client'
import React, { useState } from 'react'
import { Eye, Headphones, Users, Calculator, Palette, Music, TreePine, BookOpen } from 'lucide-react'

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">学習スタイル診断</h2>
            <p className="text-sm text-gray-600">VAK学習タイプ & 多重知能理論分析</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">進捗</span>
            <span className="text-sm font-medium">{currentQuestion + 1}/{learningStyleQuestions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
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
                  className="p-3 border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-sm text-center whitespace-pre-line"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>所要時間: 約2分</span>
          <span>学習効果を最大化するため</span>
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
      description: '図表・画像・色彩を活用'
    },
    { 
      key: 'auditory', 
      label: '聴覚的学習', 
      score: result.auditoryScore, 
      icon: Headphones, 
      color: 'bg-green-500',
      description: '音声・対話・リズムを活用'
    },
    { 
      key: 'kinesthetic', 
      label: '体感的学習', 
      score: result.kinestheticScore, 
      icon: Users, 
      color: 'bg-orange-500',
      description: '体験・実践・動作を活用'
    }
  ]

  const intelligences = [
    { key: 'linguistic', label: '言語的', icon: BookOpen, score: result.multipleIntelligences.linguistic },
    { key: 'logical', label: '論理数学的', icon: Calculator, score: result.multipleIntelligences.logical },
    { key: 'spatial', label: '空間的', icon: Palette, score: result.multipleIntelligences.spatial },
    { key: 'musical', label: '音楽的', icon: Music, score: result.multipleIntelligences.musical },
    { key: 'interpersonal', label: '対人的', icon: Users, score: result.multipleIntelligences.interpersonal },
    { key: 'intrapersonal', label: '内省的', icon: Eye, score: result.multipleIntelligences.intrapersonal },
    { key: 'naturalist', label: '自然探求的', icon: TreePine, score: result.multipleIntelligences.naturalist },
    { key: 'bodily', label: '身体運動的', icon: Users, score: result.multipleIntelligences.bodily },
  ]

  const primaryStyleData = styles.find(s => s.key === result.primaryStyle)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">学習スタイル診断結果</h2>
            <p className="text-sm text-gray-600">あなたに最適な学習アプローチ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Primary Learning Style */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">メイン学習スタイル</h3>
            {primaryStyleData && (
              <div className="bg-white rounded-md p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <primaryStyleData.icon className="w-6 h-6 text-purple-600" />
                  <span className="font-medium text-lg">{primaryStyleData.label}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{primaryStyleData.description}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${primaryStyleData.color} h-2 rounded-full`}
                    style={{ width: `${primaryStyleData.score}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{primaryStyleData.score}%</span>
              </div>
            )}
            
            <h4 className="font-medium mb-2">学習スタイル比較</h4>
            <div className="space-y-2">
              {styles.map(style => (
                <div key={style.key} className="flex justify-between items-center">
                  <span className="text-sm">{style.label}</span>
                  <span className="text-sm font-medium">{style.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multiple Intelligences */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">多重知能プロフィール</h3>
            <div className="grid grid-cols-2 gap-3">
              {intelligences.map(intelligence => (
                <div key={intelligence.key} className="bg-white rounded-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <intelligence.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{intelligence.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full"
                      style={{ width: `${intelligence.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{intelligence.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">推奨学習方法</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendations.map((rec, index) => (
              <div key={index} className="bg-white rounded-md p-4">
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}