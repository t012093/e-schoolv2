'use client'
import React, { useState, useEffect } from 'react'
import { X, Heart, Moon, Brain, Activity, Droplets, Coffee, Edit2, ChevronRight } from 'lucide-react'

interface HealthCheckModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: HealthCheckData) => void
}

export interface HealthCheckData {
  condition: 'excellent' | 'good' | 'normal' | 'poor' | 'bad'
  sleepHours: number
  sleepQuality: number
  stressLevel: 'low' | 'medium' | 'high'
  exercise: {
    done: boolean
    type?: string
    duration?: number
  }
  mood?: string[]
  meals?: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
  waterIntake?: number
  note?: string
  timestamp: string
}

export function HealthCheckModal({ isOpen, onClose, onComplete }: HealthCheckModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<HealthCheckData>>({
    condition: 'normal',
    sleepHours: 7,
    sleepQuality: 3,
    stressLevel: 'medium',
    exercise: { done: false },
    mood: [],
    meals: { breakfast: false, lunch: false, dinner: false },
    waterIntake: 0,
    note: ''
  })

  const conditions = [
    { value: 'excellent', emoji: '😊', label: 'とても良い', color: 'bg-green-100 border-green-400' },
    { value: 'good', emoji: '🙂', label: '良い', color: 'bg-blue-100 border-blue-400' },
    { value: 'normal', emoji: '😐', label: '普通', color: 'bg-yellow-100 border-yellow-400' },
    { value: 'poor', emoji: '😔', label: '少し悪い', color: 'bg-orange-100 border-orange-400' },
    { value: 'bad', emoji: '😷', label: '悪い', color: 'bg-red-100 border-red-400' }
  ]

  const stressLevels = [
    { value: 'low', emoji: '🟢', label: '低い', color: 'bg-green-100 border-green-400' },
    { value: 'medium', emoji: '🟡', label: '普通', color: 'bg-yellow-100 border-yellow-400' },
    { value: 'high', emoji: '🔴', label: '高い', color: 'bg-red-100 border-red-400' }
  ]

  const moodOptions = [
    { value: 'energetic', label: '元気', emoji: '⚡' },
    { value: 'tired', label: '疲れた', emoji: '😴' },
    { value: 'focused', label: '集中できる', emoji: '🎯' },
    { value: 'distracted', label: '集中できない', emoji: '😵' },
    { value: 'happy', label: '幸せ', emoji: '😊' },
    { value: 'anxious', label: '不安', emoji: '😰' },
    { value: 'calm', label: '落ち着いている', emoji: '😌' },
    { value: 'irritated', label: 'イライラ', emoji: '😤' }
  ]

  const exerciseTypes = [
    'ウォーキング', 'ランニング', 'ヨガ', 'ストレッチ', 
    '筋トレ', '水泳', 'サイクリング', 'その他'
  ]

  const handleSubmit = () => {
    const completeData: HealthCheckData = {
      ...formData as HealthCheckData,
      timestamp: new Date().toISOString()
    }
    onComplete(completeData)
    onClose()
  }

  const handleSkip = () => {
    localStorage.setItem('health.lastSkipped', new Date().toISOString())
    onClose()
  }

  const toggleMood = (mood: string) => {
    setFormData(prev => ({
      ...prev,
      mood: prev.mood?.includes(mood) 
        ? prev.mood.filter(m => m !== mood)
        : [...(prev.mood || []), mood]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">今日の体調チェック</h2>
                <p className="text-pink-100 text-sm">簡単な質問に答えてください</p>
              </div>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-pink-100 mb-1">
              <span>ステップ {step}/3</span>
              <span>{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {step === 1 && (
            <div className="space-y-6">
              {/* 体調 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  今日の体調はいかがですか？
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {conditions.map(condition => (
                    <button
                      key={condition.value}
                      onClick={() => setFormData(prev => ({ ...prev, condition: condition.value as any }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.condition === condition.value 
                          ? condition.color + ' border-2' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">{condition.emoji}</div>
                      <div className="text-xs">{condition.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 睡眠 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  睡眠について
                </label>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>睡眠時間</span>
                      <span className="font-medium">{formData.sleepHours}時間</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="12"
                      value={formData.sleepHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, sleepHours: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>3h</span>
                      <span>12h</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm mb-2">睡眠の質</div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setFormData(prev => ({ ...prev, sleepQuality: star }))}
                          className={`text-2xl transition-colors ${
                            star <= (formData.sleepQuality || 0) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ストレス */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  ストレスレベル
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {stressLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setFormData(prev => ({ ...prev, stressLevel: level.value as any }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.stressLevel === level.value 
                          ? level.color + ' border-2' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-xl mb-1">{level.emoji}</div>
                      <div className="text-sm">{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 運動 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  今日は運動しましたか？
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, exercise: { ...prev.exercise!, done: true } }))}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      formData.exercise?.done 
                        ? 'bg-green-100 border-green-400' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">✅</span>
                    <span className="ml-2">した</span>
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, exercise: { done: false } }))}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      !formData.exercise?.done 
                        ? 'bg-gray-100 border-gray-400' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">❌</span>
                    <span className="ml-2">しなかった</span>
                  </button>
                </div>
                {formData.exercise?.done && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg space-y-2">
                    <select
                      value={formData.exercise?.type || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        exercise: { ...prev.exercise!, type: e.target.value } 
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">運動の種類を選択</option>
                      {exerciseTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="運動時間（分）"
                      value={formData.exercise?.duration || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        exercise: { ...prev.exercise!, duration: Number(e.target.value) } 
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* 気分 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  今の気分（複数選択可）
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {moodOptions.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => toggleMood(mood.value)}
                      className={`p-2 rounded-lg border-2 text-sm transition-all ${
                        formData.mood?.includes(mood.value)
                          ? 'bg-blue-100 border-blue-400' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-1">{mood.emoji}</span>
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 食事 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-orange-500" />
                  今日の食事
                </label>
                <div className="flex gap-3">
                  {(['breakfast', 'lunch', 'dinner'] as const).map(meal => (
                    <button
                      key={meal}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        meals: { ...prev.meals!, [meal]: !prev.meals![meal] } 
                      }))}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        formData.meals?.[meal]
                          ? 'bg-orange-100 border-orange-400' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-xl mb-1">
                        {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'}
                      </div>
                      <div className="text-sm">
                        {meal === 'breakfast' ? '朝食' : meal === 'lunch' ? '昼食' : '夕食'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 水分摂取 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  水分摂取（グラス数）
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      waterIntake: Math.max(0, (prev.waterIntake || 0) - 1) 
                    }))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    -
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-12 rounded ${
                          i < (formData.waterIntake || 0) 
                            ? 'bg-blue-400' 
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      waterIntake: Math.min(8, (prev.waterIntake || 0) + 1) 
                    }))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    +
                  </button>
                  <span className="text-sm font-medium">{formData.waterIntake || 0} グラス</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {/* メモ */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                  今日のメモ（任意）
                </label>
                <textarea
                  value={formData.note || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="体調について気になることがあれば記入してください..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={4}
                />
              </div>

              {/* サマリー */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">記録内容の確認</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">体調:</span>
                    <span className="font-medium">
                      {conditions.find(c => c.value === formData.condition)?.emoji} 
                      {conditions.find(c => c.value === formData.condition)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">睡眠:</span>
                    <span className="font-medium">{formData.sleepHours}時間 / 質: {'⭐'.repeat(formData.sleepQuality || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ストレス:</span>
                    <span className="font-medium">
                      {stressLevels.find(s => s.value === formData.stressLevel)?.emoji}
                      {stressLevels.find(s => s.value === formData.stressLevel)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">運動:</span>
                    <span className="font-medium">
                      {formData.exercise?.done ? `✅ ${formData.exercise.type || '運動'} ${formData.exercise.duration || ''}分` : '❌ なし'}
                    </span>
                  </div>
                  {formData.mood && formData.mood.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">気分:</span>
                      <span className="font-medium">
                        {formData.mood.map(m => moodOptions.find(mo => mo.value === m)?.emoji).join(' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              後で
            </button>
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  戻る
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  次へ
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  記録する
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}