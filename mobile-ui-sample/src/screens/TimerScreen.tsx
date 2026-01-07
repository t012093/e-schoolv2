'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

const presets = [
  { label: '25分', minutes: 25, color: 'from-green-400 to-blue-500' },
  { label: '15分', minutes: 15, color: 'from-purple-400 to-pink-500' },
  { label: '45分', minutes: 45, color: 'from-orange-400 to-red-500' },
]

export default function TimerScreen() {
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [timeLeft, setTimeLeft] = useState(presets[0].minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [totalTime, setTotalTime] = useState(presets[0].minutes * 60)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      // Show completion notification
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index)
    const newTime = presets[index].minutes * 60
    setTimeLeft(newTime)
    setTotalTime(newTime)
    setIsRunning(false)
  }

  const handleReset = () => {
    setTimeLeft(totalTime)
    setIsRunning(false)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-white flex flex-col">
      {/* Header */}
      <div className="p-6 pt-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">学習タイマー</h1>
        <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="px-6 mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetChange(index)}
              disabled={isRunning}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl font-semibold transition-all ${
                selectedPreset === index
                  ? `bg-gradient-to-r ${preset.color} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-600 border border-gray-200'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timer Circle */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="relative">
          {/* Background Circles */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 animate-pulse" />
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-green-200 to-blue-200 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Progress Circle */}
          <svg className="transform -rotate-90 w-80 h-80">
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="rgba(229, 231, 235, 0.5)"
              strokeWidth="16"
              fill="none"
            />
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="url(#gradient)"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 140}`}
              strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl font-bold text-gray-900 mb-2">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <p className="text-gray-500 text-lg">
                {isRunning ? '集中しています...' : '準備完了'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="p-6 pb-24">
        <div className="flex gap-4 justify-center items-center">
          <button
            onClick={handleReset}
            className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm active:scale-95 transition-all"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center shadow-2xl active:scale-95 transition-all"
          >
            {isRunning ? (
              <Pause className="w-8 h-8 text-white fill-current" />
            ) : (
              <Play className="w-8 h-8 text-white fill-current ml-1" />
            )}
          </button>

          <div className="w-14 h-14" /> {/* Spacer for symmetry */}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">5</p>
            <p className="text-xs text-gray-500">今日</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">42</p>
            <p className="text-xs text-gray-500">今週</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">7</p>
            <p className="text-xs text-gray-500">連続</p>
          </div>
        </div>
      </div>
    </div>
  )
}
