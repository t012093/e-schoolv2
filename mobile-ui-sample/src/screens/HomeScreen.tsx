'use client'

import React, { useEffect, useState } from 'react'
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import { Play, Flame, Target, TrendingUp } from 'lucide-react'
import RippleButton from '../components/RippleButton'
import { staggerContainer, staggerItem, slideUp, springConfig } from '../utils/animations'

export default function HomeScreen() {
  const progress = 65
  const [displayProgress, setDisplayProgress] = useState(0)
  const controls = useAnimation()

  // Animate progress on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress)
    }, 300)
    return () => clearTimeout(timer)
  }, [progress])

  // Circular progress animation
  const circumference = 2 * Math.PI * 36
  const offset = circumference * (1 - displayProgress / 100)

  const stats = [
    { icon: Flame, value: 7, label: '日連続', color: 'orange', delay: 0 },
    { icon: Target, value: 12, label: '完了', color: 'blue', delay: 0.1 },
    { icon: TrendingUp, value: '85%', label: '達成率', color: 'green', delay: 0.2 }
  ]

  const quickActions = [
    {
      emoji: '🎯',
      title: '体調チェック',
      subtitle: '今日の調子はどう？',
      bg: 'bg-purple-100',
      hasIndicator: true,
      delay: 0
    },
    {
      emoji: '🤖',
      title: 'AIコーチに相談',
      subtitle: '学習のアドバイスを受ける',
      bg: 'bg-blue-100',
      hasIndicator: false,
      delay: 0.1
    }
  ]

  return (
    <motion.div
      className="p-6 space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div variants={slideUp} className="pt-4">
        <h1 className="text-3xl font-bold text-gray-900">こんにちは！</h1>
        <p className="text-gray-600 mt-1">今日も学習を続けましょう</p>
      </motion.div>

      {/* Today's Learning Card */}
      <motion.div
        variants={slideUp}
        whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
        transition={springConfig}
        className="bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl p-8 shadow-lg text-white"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden"
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">今日の学習</h2>
            <p className="text-white/90 text-sm">おすすめのコンテンツ</p>
          </div>
          <div className="relative w-20 h-20">
            {/* Circular Progress */}
            <svg className="transform -rotate-90 w-20 h-20">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                className="text-lg font-bold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, ...springConfig }}
              >
                {displayProgress}%
              </motion.span>
            </div>
          </div>
        </div>

        <RippleButton className="py-4 px-8 w-full flex items-center justify-center gap-2">
          <Play className="w-5 h-5 fill-current" />
          学習を始める
        </RippleButton>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        variants={staggerContainer}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              variants={staggerItem}
              whileHover={{ y: -6, scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              whileTap={{ scale: 0.95 }}
              transition={springConfig}
              className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-5 shadow-md hover:shadow-xl cursor-pointer border border-gray-100/50"
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className={`w-10 h-10 rounded-full bg-${stat.color}-100 flex items-center justify-center`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className={`w-5 h-5 text-${stat.color}-500`} />
                </motion.div>
                <motion.span
                  className="text-2xl font-bold text-gray-900"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {stat.value}
                </motion.span>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="space-y-3"
        variants={staggerContainer}
      >
        <motion.h3
          variants={slideUp}
          className="text-lg font-semibold text-gray-900"
        >
          クイックアクション
        </motion.h3>

        {quickActions.map((action, index) => (
          <motion.div
            key={index}
            variants={staggerItem}
            whileHover={{ scale: 1.02, x: 6, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            whileTap={{ scale: 0.98 }}
            transition={springConfig}
            className="bg-gradient-to-br from-white to-gray-50/30 rounded-3xl p-5 shadow-md hover:shadow-xl flex items-center justify-between cursor-pointer border border-gray-100/50"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden"
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={springConfig}
              >
                <span className="text-2xl">{action.emoji}</span>
              </motion.div>
              <div>
                <p className="font-semibold text-gray-900">{action.title}</p>
                <p className="text-xs text-gray-500">{action.subtitle}</p>
              </div>
            </div>
            {action.hasIndicator && (
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
