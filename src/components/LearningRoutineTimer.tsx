"use client"
import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, CheckCircle2, Clock, Coffee, Target, Zap, Volume2, VolumeX } from 'lucide-react'

type RoutineSession = {
  id: string
  title: string
  activities: string[]
  duration: number
  color: string
  icon: React.ReactNode
  timeOfDay: 'morning' | 'afternoon' | 'evening'
}

type TimerState = {
  isRunning: boolean
  timeRemaining: number
  currentActivity: number
  isCompleted: boolean
  isPaused: boolean
}

function useTimer(duration: number) {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    timeRemaining: duration * 60,
    currentActivity: 0,
    isCompleted: false,
    isPaused: false
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            return {
              ...prev,
              isRunning: false,
              timeRemaining: 0,
              isCompleted: true
            }
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          }
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state.isRunning, state.isPaused])

  const start = () => setState(prev => ({ ...prev, isRunning: true, isPaused: false }))
  const pause = () => setState(prev => ({ ...prev, isPaused: true }))
  const resume = () => setState(prev => ({ ...prev, isPaused: false }))
  const reset = () => setState(prev => ({ 
    ...prev, 
    isRunning: false, 
    timeRemaining: duration * 60, 
    currentActivity: 0, 
    isCompleted: false, 
    isPaused: false 
  }))

  const nextActivity = () => setState(prev => ({
    ...prev,
    currentActivity: Math.min(prev.currentActivity + 1, 2)
  }))

  return { state, start, pause, resume, reset, nextActivity }
}

function getDefaultSessions(): RoutineSession[] {
  return [
    {
      id: 'morning',
      title: '朝のルーティン',
      activities: [
        'TED-Ed動画でシャドーイング（発音重視）',
        'BBC Learning English 3回リピート',
        'フレーズカード復習'
      ],
      duration: 20,
      color: 'from-yellow-400 to-orange-500',
      icon: <Coffee className="w-5 h-5" />,
      timeOfDay: 'morning'
    },
    {
      id: 'afternoon',
      title: '午後のルーティン',
      activities: [
        'AIとの英会話練習（NPO活動説明）',
        'Tandemで海外学習者と交流',
        '実用的な場面での会話練習'
      ],
      duration: 30,
      color: 'from-blue-400 to-cyan-500',
      icon: <Target className="w-5 h-5" />,
      timeOfDay: 'afternoon'
    },
    {
      id: 'evening',
      title: '夜のルーティン',
      activities: [
        '英語日記（3行→AI添削）',
        'YouTubeスクリプト下書き',
        '録音して発音チェック'
      ],
      duration: 40,
      color: 'from-purple-400 to-pink-500',
      icon: <Zap className="w-5 h-5" />,
      timeOfDay: 'evening'
    }
  ]
}

export default function LearningRoutineTimer() {
  const [sessions] = useState<RoutineSession[]>(getDefaultSessions())
  const [selectedSession, setSelectedSession] = useState<RoutineSession>(sessions[0])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completedSessions, setCompletedSessions] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  
  const timer = useTimer(selectedSession.duration)

  useEffect(() => {
    setMounted(true)
    // Load completed sessions from localStorage
    try {
      const saved = localStorage.getItem('learningRoutine.completed')
      if (saved) {
        setCompletedSessions(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load completed sessions:', error)
    }
  }, [])

  useEffect(() => {
    // Reset timer when session changes
    timer.reset()
  }, [selectedSession])

  useEffect(() => {
    // Play sound and save completion when session completes
    if (timer.state.isCompleted) {
      if (soundEnabled) {
        // Play completion sound (browser notification sound)
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAIAAQ...')
        audio.play().catch(() => {}) // Ignore errors if audio fails
      }
      
      // Mark session as completed
      const today = new Date().toDateString()
      const sessionKey = `${selectedSession.id}-${today}`
      const newCompleted = [...completedSessions, sessionKey]
      setCompletedSessions(newCompleted)
      
      try {
        localStorage.setItem('learningRoutine.completed', JSON.stringify(newCompleted))
      } catch (error) {
        console.error('Failed to save completion:', error)
      }
    }
  }, [timer.state.isCompleted, soundEnabled, selectedSession.id, completedSessions])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isSessionCompleted = (sessionId: string) => {
    const today = new Date().toDateString()
    return completedSessions.includes(`${sessionId}-${today}`)
  }

  const getTotalCompletedToday = () => {
    const today = new Date().toDateString()
    return sessions.filter(s => isSessionCompleted(s.id)).length
  }

  const progressPercentage = timer.state.timeRemaining > 0 
    ? ((selectedSession.duration * 60 - timer.state.timeRemaining) / (selectedSession.duration * 60)) * 100
    : 100

  if (!mounted) return <div>読み込み中...</div>

  return (
    <div className="space-y-6">
      {/* 今日の進捗サマリー */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">今日の学習進捗</h2>
            <p className="text-gray-600">継続は力なり - 毎日少しずつでも成長しています</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{getTotalCompletedToday()}/3</div>
            <div className="text-sm text-gray-500">セッション完了</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className={`p-3 rounded-lg border-2 ${
                isSessionCompleted(session.id) 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {session.icon}
                <span className="text-sm font-medium">{session.title}</span>
                {isSessionCompleted(session.id) && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
              <div className="text-xs text-gray-600">{session.duration}分</div>
            </div>
          ))}
        </div>
      </div>

      {/* セッション選択 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">学習セッションを選択</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedSession.id === session.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`rounded-lg p-3 bg-gradient-to-r ${session.color} text-white mb-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {session.icon}
                    <span className="font-medium">{session.title}</span>
                  </div>
                  <span className="text-sm">{session.duration}分</span>
                </div>
              </div>
              <div className="text-left">
                {session.activities.map((activity, index) => (
                  <div key={index} className="text-xs text-gray-600 mb-1 flex items-start gap-1">
                    <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                    {activity}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* タイマー */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">{selectedSession.title}</h3>
          <p className="text-gray-600 mb-6">集中して学習に取り組みましょう</p>
          
          {/* 円形プログレスバー */}
          <div className="relative w-48 h-48 mx-auto mb-8">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray={`${progressPercentage * 3.39} 339`}
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-gray-900">
                  {formatTime(timer.state.timeRemaining)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {timer.state.isCompleted ? '完了！' : `${selectedSession.duration}分`}
                </div>
              </div>
            </div>
          </div>

          {/* タイマーコントロール */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {!timer.state.isRunning && !timer.state.isPaused ? (
              <button
                onClick={timer.start}
                disabled={timer.state.isCompleted}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5" />
                開始
              </button>
            ) : timer.state.isPaused ? (
              <button
                onClick={timer.resume}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                再開
              </button>
            ) : (
              <button
                onClick={timer.pause}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
              >
                <Pause className="w-5 h-5" />
                一時停止
              </button>
            )}

            <button
              onClick={timer.reset}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              リセット
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg font-medium transition-colors ${
                soundEnabled 
                  ? 'border-blue-300 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* 活動リスト */}
          <div className="max-w-md mx-auto">
            <h4 className="font-medium mb-3 text-left">このセッションの活動:</h4>
            <div className="space-y-2">
              {selectedSession.activities.map((activity, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left ${
                    index === timer.state.currentActivity && timer.state.isRunning
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === timer.state.currentActivity && timer.state.isRunning
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="flex-1 text-sm">{activity}</span>
                  {index < timer.state.currentActivity && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>
            {timer.state.isRunning && !timer.state.isPaused && (
              <button
                onClick={timer.nextActivity}
                className="mt-3 px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                次の活動へ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 完了メッセージ */}
      {timer.state.isCompleted && (
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-white text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">セッション完了！</h3>
          <p className="text-green-100 mb-4">
            {selectedSession.title}（{selectedSession.duration}分）を完了しました。
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                timer.reset()
                setSelectedSession(sessions[(sessions.findIndex(s => s.id === selectedSession.id) + 1) % sessions.length])
              }}
              className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              次のセッション
            </button>
            <button
              onClick={timer.reset}
              className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              もう一度
            </button>
          </div>
        </div>
      )}
    </div>
  )
}