'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, MessageCircle, CheckSquare, BookOpen, User } from 'lucide-react'
import { springConfig, pageTransition } from '../utils/animations'

interface MobileLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function MobileLayout({ children, activeTab, onTabChange }: MobileLayoutProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'ホーム' },
    { id: 'ai', icon: MessageCircle, label: 'AI' },
    { id: 'tasks', icon: CheckSquare, label: 'タスク' },
    { id: 'learn', icon: BookOpen, label: '学習' },
    { id: 'profile', icon: User, label: 'マイページ' },
  ]

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col max-w-full mx-auto relative"
      style={{
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitOverflowScrolling: "touch"
      }}
    >
      {/* Main Content with page transition */}
      <main
        className="flex-1 overflow-y-auto pb-20"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch"
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 safe-area-bottom z-50"
        style={{
          transform: "translateZ(0)",
          willChange: "transform"
        }}
      >
        <div className="flex items-center justify-between w-full px-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center gap-1 px-2 py-2 rounded-2xl"
                whileTap={{ scale: 0.9 }}
                transition={springConfig}
              >
                {/* Background indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-green-100 rounded-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? 'rgb(22, 163, 74)' : 'rgb(107, 114, 128)'
                  }}
                  transition={springConfig}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>

                {/* Label */}
                <motion.span
                  className="text-xs font-medium relative z-10"
                  animate={{
                    color: isActive ? 'rgb(22, 163, 74)' : 'rgb(107, 114, 128)',
                    fontWeight: isActive ? 600 : 500
                  }}
                  transition={springConfig}
                >
                  {tab.label}
                </motion.span>
              </motion.button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
