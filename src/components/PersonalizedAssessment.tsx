'use client'
import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, ArrowRight, RotateCcw, Brain, BookOpen, Target, Sparkles, MessageCircle, Rocket, Share2, Download, PlayCircle, BarChart3 } from 'lucide-react'
import { PersonalityAssessment, PersonalityResult } from './PersonalityAssessment'
import { LearningStyleAssessment, LearningStyleResult } from './LearningStyleAssessment'
import { MotivationAnalysis, MotivationResult } from './MotivationAnalysis'

type AssessmentStep = 'overview' | 'personality' | 'learning-style' | 'motivation' | 'results'

export type ComprehensiveProfile = {
  personality?: PersonalityResult
  learningStyle?: LearningStyleResult
  motivation?: MotivationResult
  overallRecommendations?: string[]
  aiCoachProfile?: string
  learningPlan?: {
    approaches: string[]
    schedule: string
    resources: string[]
  }
  completedAt?: string
}

export function PersonalizedAssessment() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('overview')
  const [profile, setProfile] = useState<ComprehensiveProfile | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadExistingProfile()
  }, [])

  const loadExistingProfile = () => {
    try {
      const saved = localStorage.getItem('personalized.profile.v1')
      if (saved) {
        const parsedProfile = JSON.parse(saved)
        setProfile(parsedProfile)
        setCurrentStep('results')
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const saveProfile = (newProfile: ComprehensiveProfile) => {
    try {
      localStorage.setItem('personalized.profile.v1', JSON.stringify(newProfile))
      setProfile(newProfile)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const handlePersonalityComplete = (result: PersonalityResult) => {
    const updatedProfile = {
      ...profile,
      personality: result
    } as ComprehensiveProfile
    
    saveProfile(updatedProfile)
    setCurrentStep('learning-style')
  }

  const handleLearningStyleComplete = (result: LearningStyleResult) => {
    const updatedProfile = {
      ...profile,
      learningStyle: result
    } as ComprehensiveProfile
    
    saveProfile(updatedProfile)
    setCurrentStep('motivation')
  }

  const handleMotivationComplete = (result: MotivationResult) => {
    const finalProfile = generateComprehensiveProfile({
      ...profile,
      motivation: result
    } as ComprehensiveProfile)
    
    saveProfile(finalProfile)
    setCurrentStep('results')
  }

  const generateComprehensiveProfile = (partialProfile: ComprehensiveProfile): ComprehensiveProfile => {
    const { personality, learningStyle, motivation } = partialProfile

    const overallRecommendations = generateOverallRecommendations(personality!, learningStyle!, motivation!)
    const aiCoachProfile = generateAICoachProfile(personality!, learningStyle!, motivation!)
    const learningPlan = generateLearningPlan(personality!, learningStyle!, motivation!)

    return {
      ...partialProfile,
      overallRecommendations,
      aiCoachProfile,
      learningPlan,
      completedAt: new Date().toISOString()
    }
  }

  const generateOverallRecommendations = (
    personality: PersonalityResult, 
    learningStyle: LearningStyleResult, 
    motivation: MotivationResult
  ): string[] => {
    const recommendations = []

    // 性格とスタイルの組み合わせ
    if (personality.extraversion > 60 && learningStyle.primaryStyle === 'auditory') {
      recommendations.push('ディスカッション重視型学習：グループディスカッションと音声教材の組み合わせ')
    } else if (personality.extraversion < 40 && learningStyle.primaryStyle === 'visual') {
      recommendations.push('個別視覚学習型：図表・マインドマップを活用した静的学習環境')
    }

    // 誠実性と動機の組み合わせ
    if (personality.conscientiousness > 70 && motivation.autonomy > 60) {
      recommendations.push('自律計画学習型：自己管理能力を活かした目標設定型学習')
    } else if (personality.conscientiousness < 50 && motivation.competence > 60) {
      recommendations.push('段階的達成学習型：小さな成功体験を重視した構造化学習')
    }

    // 開放性と学習スタイル
    if (personality.openness > 70 && learningStyle.multipleIntelligences.spatial > 60) {
      recommendations.push('創造的視覚学習型：多様な表現方法と創造的アプローチ')
    }

    // 動機とスタイル
    if (motivation.relatedness > 70 && learningStyle.auditoryScore > 60) {
      recommendations.push('コミュニティ対話学習型：学習コミュニティでの音声ベース交流')
    }

    return recommendations.length > 0 ? recommendations : ['バランス型学習：複数手法を柔軟に組み合わせ']
  }

  const generateAICoachProfile = (
    personality: PersonalityResult, 
    learningStyle: LearningStyleResult, 
    motivation: MotivationResult
  ): string => {
    let coachStyle = ''

    // コーチングスタイルの決定
    if (personality.extraversion > 60 && motivation.relatedness > 60) {
      coachStyle += '親しみやすく対話重視型・'
    } else if (personality.extraversion < 40 && personality.conscientiousness > 70) {
      coachStyle += '静かで計画的サポート型・'
    } else {
      coachStyle += 'バランス型・'
    }

    // フィードバックスタイル
    if (motivation.competence > 70 && personality.neuroticism < 50) {
      coachStyle += '挑戦的で詳細フィードバック'
    } else if (motivation.competence < 50 || personality.neuroticism > 60) {
      coachStyle += '励まし重視で段階的サポート'
    } else {
      coachStyle += '適度な挑戦とポジティブ支援'
    }

    return coachStyle
  }

  const generateLearningPlan = (
    personality: PersonalityResult, 
    learningStyle: LearningStyleResult, 
    motivation: MotivationResult
  ) => {
    const approaches = []
    let schedule = ''
    const resources = []

    // アプローチの選択
    if (learningStyle.primaryStyle === 'visual') {
      approaches.push('視覚教材中心（図表・マインドマップ・インフォグラフィック）')
    }
    if (learningStyle.primaryStyle === 'auditory') {
      approaches.push('音声教材中心（講義・ディスカッション・音読）')
    }
    if (learningStyle.primaryStyle === 'kinesthetic') {
      approaches.push('体験学習中心（実習・プロジェクト・実践演習）')
    }

    // スケジュールの提案
    if (personality.conscientiousness > 70) {
      schedule = '定期的・計画的学習（週3-4回、各45分）'
    } else {
      schedule = '柔軟ペース学習（週2-3回、各30分から開始）'
    }

    // リソースの提案
    if (learningStyle.multipleIntelligences.linguistic > 70) {
      resources.push('テキスト・記事・文章作成演習')
    }
    if (learningStyle.multipleIntelligences.logical > 70) {
      resources.push('数的・論理的思考問題・分析演習')
    }
    if (learningStyle.multipleIntelligences.interpersonal > 70) {
      resources.push('グループワーク・ピアレビュー・共同プロジェクト')
    }

    return { approaches, schedule, resources }
  }

  const resetAssessment = () => {
    setProfile(null)
    setCurrentStep('overview')
    try {
      localStorage.removeItem('personalized.profile.v1')
    } catch (error) {
      console.error('Failed to reset profile:', error)
    }
  }

  const steps = [
    { id: 'personality', title: '性格特性診断', icon: Brain, completed: !!profile?.personality },
    { id: 'learning-style', title: '学習スタイル', icon: BookOpen, completed: !!profile?.learningStyle },
    { id: 'motivation', title: '動機分析', icon: Target, completed: !!profile?.motivation },
  ]

  if (!mounted) {
    return <div className="flex items-center justify-center h-64">読み込み中...</div>
  }

  if (currentStep === 'overview') {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-purple-400 via-blue-500 to-pink-500 rounded-3xl p-10 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl animate-pulse border-4 border-white/30">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2">パーソナライズ診断</h1>
                <p className="text-white/90 text-xl">あなただけの最適な学習プランを見つけましょう</p>
              </div>
            </div>
            <p className="text-white/80 text-lg max-w-2xl">
              科学的根拠に基づいた診断で、あなたの性格、学習スタイル、動機を分析。AIコーチがあなたに最適な学習方法を提案します。
            </p>
          </div>
        </div>

        {/* Steps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={`group rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer ${
                  step.completed
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                    : 'bg-gradient-to-br from-white to-gray-50/50 border-2 border-purple-100/50 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                    step.completed
                      ? 'bg-white/20 backdrop-blur-sm'
                      : 'bg-gradient-to-br from-purple-100 to-blue-100'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-8 h-8 text-white" />
                    ) : (
                      <Icon className="w-8 h-8 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${step.completed ? 'text-white' : 'text-gray-900'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${step.completed ? 'text-white/80' : 'text-gray-500'}`}>
                      ステップ {index + 1}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${step.completed ? 'text-white/90' : 'text-gray-600'}`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {step.completed ? '完了済み ✓' : '約3分'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Benefits Card */}
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl p-8 shadow-xl border-2 border-purple-100/50">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            診断で分かること
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '🧠', text: 'Big Five性格特性に基づく学習スタイル' },
              { icon: '📚', text: 'VAK学習タイプと多重知能プロフィール' },
              { icon: '🎯', text: '自己決定理論による動機づけパターン' },
              { icon: '🤖', text: 'AIコーチとの最適な対話スタイル' },
              { icon: '📈', text: '個人に合わせた学習計画と推奨アプローチ' },
              { icon: '✨', text: 'あなただけの隠れた才能と強み' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-3xl">{item.icon}</span>
                <p className="text-gray-700 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-8 border-2 border-purple-200/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                全体所要時間: <strong>約10分</strong>
              </p>
              <p className="text-sm text-gray-500">
                🔒 データは安全に保存され、いつでも結果を確認できます
              </p>
            </div>
            <button
              onClick={() => setCurrentStep('personality')}
              className="px-10 py-5 bg-gradient-to-br from-purple-400 via-blue-500 to-pink-500 text-white rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center gap-3 group"
            >
              診断を開始
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 'personality') {
    return (
      <PersonalityAssessment 
        onComplete={handlePersonalityComplete}
        existingResult={profile?.personality}
      />
    )
  }

  if (currentStep === 'learning-style') {
    return (
      <LearningStyleAssessment 
        onComplete={handleLearningStyleComplete}
        existingResult={profile?.learningStyle}
      />
    )
  }

  if (currentStep === 'motivation') {
    return (
      <MotivationAnalysis 
        onComplete={handleMotivationComplete}
        existingResult={profile?.motivation}
      />
    )
  }

  if (currentStep === 'results' && profile) {
    return <ComprehensiveResults profile={profile} onReset={resetAssessment} />
  }

  return <div>エラーが発生しました</div>
}

function ComprehensiveResults({ profile, onReset }: { profile: ComprehensiveProfile; onReset: () => void }) {
  // 性格タイプの判定
  const getPersonalityType = () => {
    if (!profile.personality) return null
    const { extraversion, openness, conscientiousness, agreeableness, neuroticism } = profile.personality

    // 学習スタイルによる追加判定
    const intrapersonal = profile.learningStyle?.multipleIntelligences?.intrapersonal || 50

    let type = ''
    let title = ''
    let description = ''
    let emoji = ''
    let strengths: string[] = []
    let tips: string[] = []

    // タイプ判定ロジック
    if (extraversion > 70 && openness > 70 && conscientiousness < 50) {
      type = '冒険家タイプ'
      title = 'The Explorer'
      emoji = '🚀'
      description = '新しいことへの挑戦を恐れず、エネルギッシュに学習を進めるタイプ。常に新鮮な刺激を求め、創造的なアプローチを好みます。'
      strengths = ['高い創造性', '優れた適応力', '豊富なアイデア', '積極的な行動力']
      tips = ['計画性を意識的に取り入れる', '基礎の反復も大切に', '一つのことを深く学ぶ時間も作る']
    } else if (conscientiousness > 80 && neuroticism < 40) {
      type = '戦略家タイプ'
      title = 'The Strategist'
      emoji = '♟️'
      description = '計画的で冷静、目標達成に向けて着実に進むタイプ。論理的思考と高い自己管理能力で効率的な学習を実現します。'
      strengths = ['優れた計画性', '高い目標達成力', '論理的思考', '安定した実行力']
      tips = ['柔軟性も時には必要', '完璧主義になりすぎない', '息抜きの時間も大切に']
    } else if (agreeableness > 80 && extraversion > 60) {
      type = 'サポータータイプ'
      title = 'The Supporter'
      emoji = '🤝'
      description = '協調性が高く、仲間と共に成長することを好むタイプ。他者との関わりの中で学びを深め、チーム学習で力を発揮します。'
      strengths = ['高い協調性', 'チームワーク力', '共感力', 'コミュニケーション能力']
      tips = ['自分の意見も大切に', '一人の時間も確保する', '自己主張のバランスを']
    } else if (openness > 80 && intrapersonal > 60) {
      type = '思想家タイプ'
      title = 'The Thinker'
      emoji = '🧠'
      description = '深い思考と内省を好み、概念的な理解を重視するタイプ。独自の視点で物事を捉え、本質的な学びを追求します。'
      strengths = ['深い洞察力', '概念理解力', '独創的思考', '分析力']
      tips = ['実践とのバランスを', '他者との対話も活用', '行動に移すことも意識']
    } else if (extraversion < 40 && conscientiousness > 70) {
      type = '職人タイプ'
      title = 'The Craftsman'
      emoji = '🔧'
      description = '集中力が高く、一つのことを極めることを好むタイプ。静かな環境で着実にスキルを磨き、専門性を高めていきます。'
      strengths = ['高い集中力', '専門性追求', '丁寧な作業', '継続力']
      tips = ['視野を広げることも大切', '他者との交流も時には', '新しい挑戦も恐れずに']
    } else {
      type = 'バランサータイプ'
      title = 'The Balancer'
      emoji = '⚖️'
      description = '各特性がバランスよく発達し、状況に応じて柔軟に対応できるタイプ。多様な学習方法を使い分け、安定した成長を実現します。'
      strengths = ['高い適応力', 'バランス感覚', '柔軟性', '安定性']
      tips = ['強みを更に伸ばす', '特化した分野を作る', '自分の軸を明確に']
    }

    return { type, title, emoji, description, strengths, tips }
  }
  
  const personalityType = getPersonalityType()
  
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-8">
      {/* Celebration Header */}
      <div className="bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 rounded-3xl p-10 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl animate-bounce border-4 border-white/30">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">🎉 診断完了！</h1>
              <p className="text-white/90 text-xl">あなた専用の学習プロファイルが完成しました</p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl font-medium transition-all flex items-center gap-2 border-2 border-white/30"
          >
            <RotateCcw className="w-5 h-5" />
            再診断
          </button>
        </div>
      </div>

      {/* Personality Type Card - Hero */}
      {personalityType && (
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl border-4 border-white/30">
                  <span className="text-6xl">{personalityType.emoji}</span>
                </div>
                <div>
                  <h2 className="text-4xl font-bold mb-1">{personalityType.type}</h2>
                  <p className="text-white/80 text-lg italic">{personalityType.title}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-white/70 mb-1">総合スコア</p>
                <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
                  <p className="text-4xl font-bold">{Math.floor(((profile.personality?.extraversion || 0) + (profile.personality?.openness || 0) + (profile.personality?.conscientiousness || 0)) / 3)}%</p>
                </div>
              </div>
            </div>

            <p className="text-white/90 text-lg mb-6 leading-relaxed">{personalityType.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border-2 border-white/20 shadow-xl">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  あなたの強み
                </h3>
                <ul className="space-y-3">
                  {personalityType.strengths.map((strength, index) => (
                    <li key={index} className="text-base flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                      <span className="text-yellow-300 text-xl">★</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border-2 border-white/20 shadow-xl">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  成長のヒント
                </h3>
                <ul className="space-y-3">
                  {personalityType.tips.map((tip, index) => (
                    <li key={index} className="text-base flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                      <span className="text-green-300 text-xl">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personality Details */}
      {profile.personality && (
        <div className="bg-gradient-to-br from-white via-gray-50/30 to-gray-100/30 rounded-3xl p-8 shadow-xl border-2 border-gray-100/50">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            性格特性の詳細
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { key: 'extraversion', label: '外向性', icon: '👥', color: 'from-blue-400 to-cyan-500' },
              { key: 'agreeableness', label: '協調性', icon: '🤝', color: 'from-green-400 to-emerald-500' },
              { key: 'conscientiousness', label: '誠実性', icon: '📋', color: 'from-purple-400 to-violet-500' },
              { key: 'neuroticism', label: '繊細さ', icon: '💭', color: 'from-yellow-400 to-orange-500' },
              { key: 'openness', label: '開放性', icon: '🎨', color: 'from-pink-400 to-rose-500' }
            ].map(trait => {
              const score = profile.personality![trait.key as keyof PersonalityResult] as number
              return (
                <div key={trait.key} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all text-center group">
                  <div className="text-4xl mb-3">{trait.icon}</div>
                  <p className="text-sm font-bold text-gray-700 mb-4">{trait.label}</p>
                  <div className="relative mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${trait.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{score}</p>
                  <p className="text-xs text-gray-500 mt-1">/ 100</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Fun Facts - エンタメ要素 */}
      {personalityType && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 rounded-3xl p-6 border-2 border-orange-200/50 shadow-xl hover:shadow-2xl transition-all">
            <h4 className="font-bold text-xl text-orange-900 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-200 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              相性の良い職業
            </h4>
            <div className="space-y-2">
              {personalityType.type === '冒険家タイプ' && ['起業家', 'クリエイター', 'イノベーター'].map(job => (
                <p key={job} className="text-base text-orange-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {job}</p>
              ))}
              {personalityType.type === '戦略家タイプ' && ['プロジェクトマネージャー', 'データサイエンティスト', 'コンサルタント'].map(job => (
                <p key={job} className="text-base text-orange-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {job}</p>
              ))}
              {personalityType.type === 'サポータータイプ' && ['教師', 'カウンセラー', 'チームリーダー'].map(job => (
                <p key={job} className="text-base text-orange-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {job}</p>
              ))}
              {personalityType.type === '思想家タイプ' && ['研究者', '作家', 'アナリスト'].map(job => (
                <p key={job} className="text-base text-orange-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {job}</p>
              ))}
              {personalityType.type === '職人タイプ' && ['エンジニア', 'デザイナー', 'スペシャリスト'].map(job => (
                <p key={job} className="text-base text-orange-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {job}</p>
              ))}
              {personalityType.type === 'バランサータイプ' && ['マネージャー', 'ディレクター', 'ゼネラリスト'].map(job => (
                <p key={job} className="text-base text-orange-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {job}</p>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-100 via-teal-50 to-emerald-100 rounded-3xl p-6 border-2 border-green-200/50 shadow-xl hover:shadow-2xl transition-all">
            <h4 className="font-bold text-xl text-green-900 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-200 flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              相性の良い学習仲間
            </h4>
            <div className="space-y-2">
              {personalityType.type === '冒険家タイプ' && ['戦略家タイプ', '思想家タイプ'].map(partner => (
                <p key={partner} className="text-base text-green-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {partner}</p>
              ))}
              {personalityType.type === '戦略家タイプ' && ['冒険家タイプ', 'サポータータイプ'].map(partner => (
                <p key={partner} className="text-base text-green-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {partner}</p>
              ))}
              {personalityType.type === 'サポータータイプ' && ['職人タイプ', '戦略家タイプ'].map(partner => (
                <p key={partner} className="text-base text-green-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {partner}</p>
              ))}
              {personalityType.type === '思想家タイプ' && ['冒険家タイプ', 'バランサータイプ'].map(partner => (
                <p key={partner} className="text-base text-green-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {partner}</p>
              ))}
              {personalityType.type === '職人タイプ' && ['サポータータイプ', '思想家タイプ'].map(partner => (
                <p key={partner} className="text-base text-green-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {partner}</p>
              ))}
              {personalityType.type === 'バランサータイプ' && ['全タイプと相性良好'].map(partner => (
                <p key={partner} className="text-base text-green-800 bg-white/60 rounded-2xl px-4 py-2 font-medium">• {partner}</p>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 rounded-3xl p-6 border-2 border-blue-200/50 shadow-xl hover:shadow-2xl transition-all">
            <h4 className="font-bold text-xl text-blue-900 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-200 flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              あなたの隠れた才能
            </h4>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-2xl p-4">
                {personalityType.type === '冒険家タイプ' && <p className="text-lg text-blue-900 font-bold">革新的アイデアの創出力</p>}
                {personalityType.type === '戦略家タイプ' && <p className="text-lg text-blue-900 font-bold">複雑な問題の解決力</p>}
                {personalityType.type === 'サポータータイプ' && <p className="text-lg text-blue-900 font-bold">人を育てる指導力</p>}
                {personalityType.type === '思想家タイプ' && <p className="text-lg text-blue-900 font-bold">本質を見抜く洞察力</p>}
                {personalityType.type === '職人タイプ' && <p className="text-lg text-blue-900 font-bold">細部への卓越した注意力</p>}
                {personalityType.type === 'バランサータイプ' && <p className="text-lg text-blue-900 font-bold">多様性を統合する調整力</p>}
              </div>
              <p className="text-sm text-blue-700 bg-blue-50 rounded-2xl px-4 py-3 font-medium">
                💡 この才能を活かすことで学習効果が大幅UP！
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Coach Profile */}
      {profile.aiCoachProfile && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-lg mb-3">AI学習コーチプロフィール</h2>
          <div className="bg-white rounded-md p-4">
            <p className="font-medium text-purple-900">{profile.aiCoachProfile}</p>
          </div>
        </div>
      )}

      {/* Comprehensive Recommendations */}
      {(profile.overallRecommendations || profile.learningPlan) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {profile.overallRecommendations && profile.overallRecommendations.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">総合推奨学習アプローチ</h3>
              <div className="space-y-3">
                {profile.overallRecommendations.map((rec, index) => (
                  <div key={index} className="bg-white rounded-md p-3 text-sm">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.learningPlan && (
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">推奨学習プラン</h3>
              <div className="space-y-4">
                {profile.learningPlan.schedule && (
                  <div className="bg-white rounded-md p-3">
                    <h4 className="font-medium mb-2">スケジュール</h4>
                    <p className="text-sm">{profile.learningPlan.schedule}</p>
                  </div>
                )}
                {profile.learningPlan.approaches && profile.learningPlan.approaches.length > 0 && (
                  <div className="bg-white rounded-md p-3">
                    <h4 className="font-medium mb-2">主要アプローチ</h4>
                    <ul className="text-sm space-y-1">
                      {profile.learningPlan.approaches.map((approach, index) => (
                        <li key={index}>• {approach}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommended Resources */}
      {profile.learningPlan?.resources && profile.learningPlan.resources.length > 0 && (
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">推奨学習リソース</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.learningPlan.resources.map((resource, index) => (
              <div key={index} className="bg-white rounded-md p-3 text-sm">
                {resource}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps - 次のアクション */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-indigo-600" />
          次のステップ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => window.location.href = '/?tab=ai-coach'}
              className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">AIコーチと始める</p>
                <p className="text-xs text-gray-600 mt-1">パーソナライズされた学習を開始</p>
              </div>
              <div className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">おすすめ</div>
            </button>

            <button
              onClick={() => window.location.href = '/plan/roadmap'}
              className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">学習プランを見る</p>
                <p className="text-xs text-gray-600 mt-1">あなた専用のロードマップ</p>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/?tab=dashboard'}
              className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlayCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">最初のレッスン</p>
                <p className="text-xs text-gray-600 mt-1">今すぐ学習を始める</p>
              </div>
            </button>
          </div>

          <div className="bg-white/80 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>💡 ヒント：</strong>まずはAIコーチとの対話から始めることをおすすめします。
              あなたの診断結果を踏まえて、最適な学習方法をご提案します。
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>診断結果は自動的にAIコーチに共有されています</span>
            </div>
          </div>

        {/* Share & Export */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">
              診断完了日: {profile.completedAt ? new Date(profile.completedAt).toLocaleDateString('ja-JP') : '---'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors">
              <Share2 className="w-4 h-4" />
              シェア
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors">
              <Download className="w-4 h-4" />
              PDF保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}