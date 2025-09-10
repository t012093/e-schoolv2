"use client"
import { useEffect, useState } from "react"
import { Clock, Target, Calendar, Play, CheckCircle2, ArrowRight, Book, MessageCircle, Mic, PenTool, Globe, Zap } from 'lucide-react'

type UserProfile = {
  personality?: {
    extraversion: number
    openness: number
    conscientiousness: number
    agreeableness: number
    neuroticism: number
  }
  learningStyle?: {
    visual: number
    auditory: number
    kinesthetic: number
  }
  motivation?: {
    autonomy: number
    competence: number
    relatedness: number
  }
  goals?: string[]
}

type LearningPlan = {
  objective: string
  yearlyGoals: string[]
  dailyRoutine: {
    morning: { duration: number; activities: string[] }
    afternoon: { duration: number; activities: string[] }
    evening: { duration: number; activities: string[] }
  }
  weeklyFocus: { day: string; focus: string; icon: string }[]
  resources: {
    apps: string[]
    materials: string[]
  }
  motivation: string[]
}

function generatePersonalizedPlan(profile: UserProfile, subject: string): LearningPlan {
  const isEnglish = subject === '英語'
  
  if (isEnglish) {
    // 英語学習の場合
    const conscientiousness = profile.personality?.conscientiousness || 50
    const isHighlyConscientiousness = conscientiousness > 70
    const learningStylePrimary = getLearningStylePrimary(profile.learningStyle)
    
    return {
      objective: "日常英会話をスムーズに行い、国際的な場面で自信を持ってコミュニケーションできるようになる",
      yearlyGoals: [
        "日常会話は辞書なしで自然に対応",
        "簡単なプレゼンや自己紹介を暗記なしで実施", 
        "YouTube動画を月2本、英語で発信",
        "NPO活動で海外パートナーと協働"
      ],
      dailyRoutine: {
        morning: {
          duration: isHighlyConscientiousness ? 25 : 15,
          activities: learningStylePrimary === 'auditory' 
            ? ["TED-Ed動画でシャドーイング（発音重視）", "BBC Learning English 3回リピート"]
            : learningStylePrimary === 'visual'
            ? ["字幕付き英語動画視聴", "フレーズカード復習"]
            : ["発音練習（体の動きと連動）", "ジェスチャー付きスピーキング"]
        },
        afternoon: {
          duration: 30,
          activities: [
            "AIとの英会話練習（NPO活動説明）",
            "Tandemで海外学習者と交流",
            "実用的な場面での会話練習"
          ]
        },
        evening: {
          duration: isHighlyConscientiousness ? 45 : 35,
          activities: [
            "英語日記（3行→AI添削）",
            "YouTubeスクリプト下書き",
            "録音して発音チェック（週2回）"
          ]
        }
      },
      weeklyFocus: [
        { day: "月曜", focus: "新フレーズ10個暗記", icon: "📚" },
        { day: "火曜", focus: "NPO・教育系記事音読", icon: "🗞️" },
        { day: "水曜", focus: "3分スピーチ録音", icon: "🎤" },
        { day: "木曜", focus: "Tandem交流＋投稿", icon: "🌐" },
        { day: "金曜", focus: "YouTubeスクリプト作成", icon: "✍️" },
        { day: "土曜", focus: "模擬プレゼン練習", icon: "🎯" },
        { day: "日曜", focus: "週間振り返り", icon: "📊" }
      ],
      resources: {
        apps: ["DeepL Speak", "Elsa Speak", "Tandem", "HelloTalk"],
        materials: ["TED Talks (AI・教育・NPO)", "Medium海外記事", "BBC Learning English"]
      },
      motivation: [
        "YouTube英語発信で世界とつながる",
        "国際イベントでの自信ある交流",
        "NPO活動の海外展開"
      ]
    }
  }
  
  // その他の科目の場合
  return {
    objective: `${subject}の基礎から応用まで体系的に習得し、実践的なスキルを身につける`,
    yearlyGoals: [
      `${subject}の基礎概念を完全に理解`,
      "応用問題を独力で解決",
      "実践的なプロジェクトで成果を創出"
    ],
    dailyRoutine: {
      morning: {
        duration: 20,
        activities: ["基礎概念の復習", "重要用語の確認"]
      },
      afternoon: {
        duration: 30,
        activities: ["実践問題に取り組み", "理解度チェック"]
      },
      evening: {
        duration: 40,
        activities: ["学習ログ記録", "翌日の予習"]
      }
    },
    weeklyFocus: [
      { day: "月曜", focus: "新概念学習", icon: "📚" },
      { day: "火曜", focus: "問題演習", icon: "✏️" },
      { day: "水曜", focus: "応用実践", icon: "🔧" },
      { day: "木曜", focus: "復習・補強", icon: "🔄" },
      { day: "金曜", focus: "まとめ・整理", icon: "📋" },
      { day: "土曜", focus: "プロジェクト実践", icon: "🎯" },
      { day: "日曜", focus: "振り返り・計画", icon: "📊" }
    ],
    resources: {
      apps: ["学習管理アプリ", "問題集アプリ"],
      materials: [`${subject}専門書`, "オンライン講座", "実践問題集"]
    },
    motivation: [
      "段階的なスキル向上",
      "実践的な成果創出",
      "専門性の確立"
    ]
  }
}

function getLearningStylePrimary(learningStyle?: { visual: number; auditory: number; kinesthetic: number }): string {
  if (!learningStyle) return 'visual'
  
  const { visual, auditory, kinesthetic } = learningStyle
  if (auditory >= visual && auditory >= kinesthetic) return 'auditory'
  if (kinesthetic >= visual && kinesthetic >= auditory) return 'kinesthetic'
  return 'visual'
}

export default function PersonalizedLearningPlan() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subject, setSubject] = useState('英語')
  const [plan, setPlan] = useState<LearningPlan | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const savedProfile = localStorage.getItem('userProfile')
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile(parsedProfile)
        
        // 保存された科目を取得
        const onboardingData = localStorage.getItem('onboarding.sample.v1')
        if (onboardingData) {
          const data = JSON.parse(onboardingData)
          if (data.goals && data.goals.length > 0) {
            setSubject(data.goals[0])
          }
        }
      }
    } catch (error) {
      console.error('プロフィール読み込みエラー:', error)
    }
  }, [])

  useEffect(() => {
    if (profile && mounted) {
      const generatedPlan = generatePersonalizedPlan(profile, subject)
      setPlan(generatedPlan)
    }
  }, [profile, subject, mounted])

  if (!mounted) return <div>読み込み中...</div>
  if (!profile) return <div>先に診断を完了してください</div>
  if (!plan) return <div>プラン生成中...</div>

  const totalDailyTime = plan.dailyRoutine.morning.duration + plan.dailyRoutine.afternoon.duration + plan.dailyRoutine.evening.duration

  return (
    <div className="space-y-6">
      {/* 学習目標 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Target className="w-6 h-6" />
          {subject} 学習全体像
        </h2>
        <p className="text-blue-100 mb-4">{plan.objective}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plan.yearlyGoals.map((goal, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-300" />
              {goal}
            </div>
          ))}
        </div>
      </div>

      {/* 毎日の学習ルーティン */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          毎日の学習ルーティン（{totalDailyTime}分）
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RoutineCard 
            title="朝" 
            duration={plan.dailyRoutine.morning.duration}
            activities={plan.dailyRoutine.morning.activities}
            color="from-yellow-400 to-orange-500"
            icon={<Globe className="w-5 h-5" />}
          />
          <RoutineCard 
            title="午後" 
            duration={plan.dailyRoutine.afternoon.duration}
            activities={plan.dailyRoutine.afternoon.activities}
            color="from-blue-400 to-cyan-500"
            icon={<MessageCircle className="w-5 h-5" />}
          />
          <RoutineCard 
            title="夜" 
            duration={plan.dailyRoutine.evening.duration}
            activities={plan.dailyRoutine.evening.activities}
            color="from-purple-400 to-pink-500"
            icon={<PenTool className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* 週ごとの重点課題 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          週ごとの重点課題
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {plan.weeklyFocus.map((item, index) => (
            <div key={index} className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-sm font-medium text-gray-700">{item.day}</div>
              <div className="text-xs text-gray-600">{item.focus}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 学習リソース */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            推奨アプリ
          </h3>
          <div className="space-y-2">
            {plan.resources.apps.map((app, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-gray-50">
                <Play className="w-4 h-4 text-green-600" />
                <span className="text-sm">{app}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Book className="w-5 h-5 text-blue-600" />
            学習教材
          </h3>
          <div className="space-y-2">
            {plan.resources.materials.map((material, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-gray-50">
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{material}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* モチベーション */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          モチベーション維持のポイント
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plan.motivation.map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-gray-700">{item}</div>
            </div>
          ))}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button 
          onClick={() => window.location.href = '/?tab=ai-coach'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          AIコーチと相談
        </button>
        <button 
          onClick={() => window.location.href = '/plan/roadmap'}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          ロードマップ確認
        </button>
        <button 
          onClick={() => window.location.href = '/?tab=tasks'}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          学習開始
        </button>
      </div>
    </div>
  )
}

function RoutineCard({ title, duration, activities, color, icon }: {
  title: string
  duration: number
  activities: string[]
  color: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${color} p-3 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{title}</span>
          </div>
          <span className="text-sm">{duration}分</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {activities.map((activity, index) => (
          <div key={index} className="text-xs text-gray-600 flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
            {activity}
          </div>
        ))}
      </div>
    </div>
  )
}