'use client'
import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, ArrowRight, RotateCcw, Brain, BookOpen, Target, Sparkles } from 'lucide-react'
import { PersonalityAssessment, PersonalityResult } from './PersonalityAssessment'
import { LearningStyleAssessment, LearningStyleResult } from './LearningStyleAssessment'
import { MotivationAnalysis, MotivationResult } from './MotivationAnalysis'

type AssessmentStep = 'overview' | 'personality' | 'learning-style' | 'motivation' | 'results'

export type ComprehensiveProfile = {
  personality?: PersonalityResult
  learningStyle?: LearningStyleResult
  motivation?: MotivationResult
  overallRecommendations: string[]
  aiCoachProfile: string
  learningPlan: {
    approaches: string[]
    schedule: string
    resources: string[]
  }
  completedAt: string
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">パーソナライズ診断</h1>
              <p className="text-gray-600">あなた専用の学習プランを作成します</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className={`p-6 rounded-lg border-2 ${step.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${step.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <step.icon className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  ステップ {index + 1}: {step.completed ? '完了済み' : '約3分'}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-3">診断で分かること</h3>
            <ul className="space-y-2 text-sm">
              <li>• Big Five性格特性に基づく学習スタイル</li>
              <li>• VAK学習タイプと多重知能プロフィール</li>
              <li>• 自己決定理論による動機づけパターン</li>
              <li>• AIコーチとの最適な対話スタイル</li>
              <li>• 個人に合わせた学習計画と推奨アプローチ</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              全体所要時間: 約10分 | データは安全に保存されます
            </div>
            <button
              onClick={() => setCurrentStep('personality')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              診断を開始
              <ArrowRight className="w-4 h-4" />
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
    
    // 学習スタイルによる追加判定
    const intrapersonal = profile.learningStyle?.multipleIntelligences?.intrapersonal || 50
    
    return { type, title, emoji, description, strengths, tips }
  }
  
  const personalityType = getPersonalityType()
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">パーソナライズ診断完了</h1>
              <p className="text-gray-600">あなた専用の学習プロファイル</p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            再診断
          </button>
        </div>

        {/* Personality Type Card - エンタメ要素 */}
        {personalityType && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{personalityType.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{personalityType.type}</h2>
                    <p className="text-indigo-100 text-sm italic">{personalityType.title}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-100">総合スコア</p>
                <p className="text-3xl font-bold">{Math.floor(((profile.personality?.extraversion || 0) + (profile.personality?.openness || 0) + (profile.personality?.conscientiousness || 0)) / 3)}%</p>
              </div>
            </div>
            
            <p className="text-white/90 mb-4">{personalityType.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-indigo-100">あなたの強み</h3>
                <ul className="space-y-1">
                  {personalityType.strengths.map((strength, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span className="text-yellow-300">✨</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-indigo-100">成長のヒント</h3>
                <ul className="space-y-1">
                  {personalityType.tips.map((tip, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span className="text-green-300">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Personality Details */}
        {profile.personality && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">性格特性の詳細</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'extraversion', label: '外向性', icon: '👥', color: 'bg-blue-500' },
                { key: 'agreeableness', label: '協調性', icon: '🤝', color: 'bg-green-500' },
                { key: 'conscientiousness', label: '誠実性', icon: '📋', color: 'bg-purple-500' },
                { key: 'neuroticism', label: '繊細さ', icon: '💭', color: 'bg-yellow-500' },
                { key: 'openness', label: '開放性', icon: '🎨', color: 'bg-pink-500' }
              ].map(trait => {
                const score = profile.personality![trait.key as keyof PersonalityResult] as number
                return (
                  <div key={trait.key} className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">{trait.icon}</div>
                    <p className="text-xs font-medium text-gray-600">{trait.label}</p>
                    <div className="mt-2 relative">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${trait.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <p className="text-lg font-bold mt-1">{score}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Fun Facts - エンタメ要素 */}
        {personalityType && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <span>🎯</span> 相性の良い職業
              </h4>
              <div className="space-y-1">
                {personalityType.type === '冒険家タイプ' && ['起業家', 'クリエイター', 'イノベーター'].map(job => (
                  <p key={job} className="text-sm text-orange-700">• {job}</p>
                ))}
                {personalityType.type === '戦略家タイプ' && ['プロジェクトマネージャー', 'データサイエンティスト', 'コンサルタント'].map(job => (
                  <p key={job} className="text-sm text-orange-700">• {job}</p>
                ))}
                {personalityType.type === 'サポータータイプ' && ['教師', 'カウンセラー', 'チームリーダー'].map(job => (
                  <p key={job} className="text-sm text-orange-700">• {job}</p>
                ))}
                {personalityType.type === '思想家タイプ' && ['研究者', '作家', 'アナリスト'].map(job => (
                  <p key={job} className="text-sm text-orange-700">• {job}</p>
                ))}
                {personalityType.type === '職人タイプ' && ['エンジニア', 'デザイナー', 'スペシャリスト'].map(job => (
                  <p key={job} className="text-sm text-orange-700">• {job}</p>
                ))}
                {personalityType.type === 'バランサータイプ' && ['マネージャー', 'ディレクター', 'ゼネラリスト'].map(job => (
                  <p key={job} className="text-sm text-orange-700">• {job}</p>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <span>🤝</span> 相性の良い学習仲間
              </h4>
              <div className="space-y-1">
                {personalityType.type === '冒険家タイプ' && ['戦略家タイプ', '思想家タイプ'].map(partner => (
                  <p key={partner} className="text-sm text-green-700">• {partner}</p>
                ))}
                {personalityType.type === '戦略家タイプ' && ['冒険家タイプ', 'サポータータイプ'].map(partner => (
                  <p key={partner} className="text-sm text-green-700">• {partner}</p>
                ))}
                {personalityType.type === 'サポータータイプ' && ['職人タイプ', '戦略家タイプ'].map(partner => (
                  <p key={partner} className="text-sm text-green-700">• {partner}</p>
                ))}
                {personalityType.type === '思想家タイプ' && ['冒険家タイプ', 'バランサータイプ'].map(partner => (
                  <p key={partner} className="text-sm text-green-700">• {partner}</p>
                ))}
                {personalityType.type === '職人タイプ' && ['サポータータイプ', '思想家タイプ'].map(partner => (
                  <p key={partner} className="text-sm text-green-700">• {partner}</p>
                ))}
                {personalityType.type === 'バランサータイプ' && ['全タイプと相性良好'].map(partner => (
                  <p key={partner} className="text-sm text-green-700">• {partner}</p>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span>⭐</span> あなたの隠れた才能
              </h4>
              <div className="space-y-1">
                {personalityType.type === '冒険家タイプ' && <p className="text-sm text-blue-700">革新的アイデアの創出力</p>}
                {personalityType.type === '戦略家タイプ' && <p className="text-sm text-blue-700">複雑な問題の解決力</p>}
                {personalityType.type === 'サポータータイプ' && <p className="text-sm text-blue-700">人を育てる指導力</p>}
                {personalityType.type === '思想家タイプ' && <p className="text-sm text-blue-700">本質を見抜く洞察力</p>}
                {personalityType.type === '職人タイプ' && <p className="text-sm text-blue-700">細部への卓越した注意力</p>}
                {personalityType.type === 'バランサータイプ' && <p className="text-sm text-blue-700">多様性を統合する調整力</p>}
                <p className="text-xs text-blue-600 mt-2">この才能を活かすことで学習効果が大幅UP！</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Coach Profile */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-lg mb-3">AI学習コーチプロフィール</h2>
          <div className="bg-white rounded-md p-4">
            <p className="font-medium text-purple-900">{profile.aiCoachProfile}</p>
          </div>
        </div>

        {/* Comprehensive Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">推奨学習プラン</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-md p-3">
                <h4 className="font-medium mb-2">スケジュール</h4>
                <p className="text-sm">{profile.learningPlan.schedule}</p>
              </div>
              <div className="bg-white rounded-md p-3">
                <h4 className="font-medium mb-2">主要アプローチ</h4>
                <ul className="text-sm space-y-1">
                  {profile.learningPlan.approaches.map((approach, index) => (
                    <li key={index}>• {approach}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Resources */}
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

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">
            診断完了日: {new Date(profile.completedAt).toLocaleDateString('ja-JP')}
          </p>
          <p className="text-sm text-gray-700">
            この結果はAIコーチが学習サポートをパーソナライズするために活用されます
          </p>
        </div>
      </div>
    </div>
  )
}