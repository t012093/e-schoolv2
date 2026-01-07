'use client'

import React, { useState } from 'react'
import './styles/global.css'
import MobileLayout from './components/MobileLayout'
import HomeScreen from './screens/HomeScreen'
import AssessmentScreen from './screens/AssessmentScreen'
import AIChatScreen from './screens/AIChatScreen'
import KanbanScreen from './screens/KanbanScreen'
import ContentLibraryScreen from './screens/ContentLibraryScreen'
import WellbeingScreen from './screens/WellbeingScreen'
import TimerScreen from './screens/TimerScreen'
import ProfileScreen from './screens/ProfileScreen'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [showAssessment, setShowAssessment] = useState(false)

  const renderScreen = () => {
    if (showAssessment) {
      return <AssessmentScreen />
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen />
      case 'ai':
        return <AIChatScreen />
      case 'tasks':
        return <KanbanScreen />
      case 'learn':
        return <ContentLibraryScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <HomeScreen />
    }
  }

  // Special screens that don't use the bottom navigation
  if (showAssessment) {
    return <AssessmentScreen />
  }

  // Render Timer screen separately (it can be accessed from home)
  // For demo purposes, we'll include it in the layout

  return (
    <MobileLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderScreen()}
    </MobileLayout>
  )
}
