'use client'

import { useState } from 'react'
import Sidebar from '@/components/desktop/Sidebar'
import Dashboard from '@/components/desktop/Dashboard'
import TasksView from '@/components/desktop/TasksView'
import LearningView from '@/components/desktop/LearningView'
import WellbeingView from '@/components/desktop/WellbeingView'
import AIChatView from '@/components/desktop/AIChatView'
import ProfileView from '@/components/desktop/ProfileView'

export default function DesktopPage() {
  const [activeView, setActiveView] = useState('dashboard')

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'tasks':
        return <TasksView />
      case 'learning':
        return <LearningView />
      case 'wellbeing':
        return <WellbeingView />
      case 'ai':
        return <AIChatView />
      case 'profile':
        return <ProfileView />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  )
}
