'use client'

import { useState, useEffect } from 'react'
import { 
  Heart, 
  Moon, 
  Brain, 
  Activity, 
  TrendingUp,
  Calendar,
  ChevronRight,
  ChevronDown,
  Download,
  Filter,
  Droplets,
  Coffee,
  AlertCircle,
  Search,
  PanelLeft,
  FileText,
  Globe,
  CheckSquare,
  BarChart3,
  BookOpen,
  User,
  Settings,
  Bell,
  LayoutDashboard,
  MessageCircle,
  Timer
} from 'lucide-react'
import { HealthCheckModal, HealthCheckData } from '../../components/HealthCheckModal'

export default function HealthPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showHealthCheck, setShowHealthCheck] = useState(false)
  const [healthData, setHealthData] = useState<HealthCheckData[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [selectedMetric, setSelectedMetric] = useState<'condition' | 'sleep' | 'stress' | 'exercise'>('condition')

  useEffect(() => {
    // Load saved health data
    const saved = localStorage.getItem('health.records')
    if (saved) {
      setHealthData(JSON.parse(saved))
    }

    // Check if should show modal (12 hours since last check)
    const lastCheck = localStorage.getItem('health.lastCheck')
    if (!lastCheck || Date.now() - new Date(lastCheck).getTime() > 12 * 60 * 60 * 1000) {
      setShowHealthCheck(true)
    }
  }, [])

  const handleHealthCheckComplete = (data: HealthCheckData) => {
    const newData = [...healthData, data]
    setHealthData(newData)
    localStorage.setItem('health.records', JSON.stringify(newData))
    localStorage.setItem('health.lastCheck', new Date().toISOString())
  }

  // Get today's data or latest
  const todayData = healthData[healthData.length - 1]

  // Calculate averages for the period
  const getAverages = () => {
    if (healthData.length === 0) return null
    
    const recent = healthData.slice(-7) // Last 7 records
    const avgSleep = recent.reduce((sum, d) => sum + d.sleepHours, 0) / recent.length
    const avgQuality = recent.reduce((sum, d) => sum + d.sleepQuality, 0) / recent.length
    const exerciseDays = recent.filter(d => d.exercise.done).length
    
    return { avgSleep, avgQuality, exerciseDays, totalDays: recent.length }
  }

  const averages = getAverages()

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-200 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-12 px-2.5 pt-2">
          <div className={`${sidebarCollapsed ? 'hidden' : 'flex-1'}`}>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-transparent hover:bg-gray-50 rounded w-full justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-sm"></div>
                {!sidebarCollapsed && <span className="text-gray-600">Select project...</span>}
              </div>
              {!sidebarCollapsed && <ChevronDown className="w-4 h-4 opacity-50" />}
            </button>
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Search Button */}
        <div className="px-2.5 mb-2">
          <button className="flex items-center gap-2.5 w-full p-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md shadow-sm">
            <Search className="w-4.5 h-4.5" />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left text-sm">Search</span>
                <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-gray-50 px-1.5 text-xs font-mono text-gray-500">
                  <span>⌘</span>K
                </kbd>
              </>
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2.5">
          <ul className="space-y-1">
            <li>
              <a
                href="/"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </a>
            </li>
            <li>
              <a
                href="/?tab=tasks"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <CheckSquare className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Tasks</span>}
              </a>
            </li>
            <li>
              <a
                href="/?tab=plans"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <BookOpen className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Plans</span>}
              </a>
            </li>
            <li>
              <a
                href="/?tab=kanban"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <BarChart3 className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Kanban Board</span>}
              </a>
            </li>
            <li>
              <a
                href="/?tab=calendar"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Calendar className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Calendar</span>}
              </a>
            </li>
            <li>
              <a
                href="/?tab=files"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <FileText className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Files</span>}
              </a>
            </li>
            <li>
              <a
                href="/?tab=apps"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Globe className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Apps</span>}
              </a>
            </li>
            <li>
              <a
                href="/?tab=personalize"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Brain className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>パーソナライズ</span>}
              </a>
            </li>
            <li>
              <a
                href="/?tab=ai-coach"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>AIコーチ</span>}
              </a>
            </li>
            <li>
              <a
                href="/?tab=routine-timer"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Timer className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>学習タイマー</span>}
              </a>
            </li>
            <li>
              <button
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors bg-red-100 text-red-900 font-medium"
              >
                <Heart className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>体調管理</span>}
              </button>
            </li>
          </ul>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>

          {/* User & Settings Section */}
          <ul className="space-y-1">
            <li>
              <a
                href="/?tab=notifications"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors relative text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Bell className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Notifications</span>}
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </a>
            </li>
            <li>
              <a
                href="/?tab=profile"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <User className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Profile</span>}
              </a>
            </li>
            <li>
              <a
                href="/?tab=settings"
                className="flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Settings className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>Settings</span>}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">体調管理</h1>
                <p className="text-sm text-gray-500">健康状態をトラッキングして学習効率を最適化</p>
              </div>
            </div>
            <button
              onClick={() => setShowHealthCheck(true)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 transition-all"
            >
              今日の体調を記録
            </button>
          </div>
        </header>

      <main className="p-6 space-y-6">
        {/* Today's Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">今日の体調サマリー</h2>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </span>
          </div>

          {todayData ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard
                icon={<Heart className="w-5 h-5" />}
                label="体調"
                value={getConditionLabel(todayData.condition)}
                color={getConditionColor(todayData.condition)}
              />
              <SummaryCard
                icon={<Moon className="w-5 h-5" />}
                label="睡眠"
                value={`${todayData.sleepHours}時間`}
                subValue={`質: ${'⭐'.repeat(todayData.sleepQuality)}`}
                color="bg-indigo-100 text-indigo-700"
              />
              <SummaryCard
                icon={<Brain className="w-5 h-5" />}
                label="ストレス"
                value={getStressLabel(todayData.stressLevel)}
                color={getStressColor(todayData.stressLevel)}
              />
              <SummaryCard
                icon={<Activity className="w-5 h-5" />}
                label="運動"
                value={todayData.exercise.done ? '完了' : '未実施'}
                subValue={todayData.exercise.done ? `${todayData.exercise.duration}分` : undefined}
                color={todayData.exercise.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">まだ今日の記録がありません</p>
              <button
                onClick={() => setShowHealthCheck(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                記録を始める
              </button>
            </div>
          )}
        </div>

        {/* Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">週間トレンド</h2>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['week', 'month', 'year'] as const).map(period => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      selectedPeriod === period 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {period === 'week' ? '週' : period === 'month' ? '月' : '年'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {(['condition', 'sleep', 'stress', 'exercise'] as const).map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  selectedMetric === metric
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {metric === 'condition' ? '体調' : 
                 metric === 'sleep' ? '睡眠' : 
                 metric === 'stress' ? 'ストレス' : '運動'}
              </button>
            ))}
          </div>

          {/* Simple chart placeholder */}
          <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">グラフエリア</p>
              <p className="text-sm text-gray-400">データが蓄積されると表示されます</p>
            </div>
          </div>
        </div>

        {/* Daily Records */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">日々の記録</h2>
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <Filter className="w-4 h-4" />
              フィルター
            </button>
          </div>

          <div className="space-y-3">
            {healthData.slice().reverse().slice(0, 7).map((data, index) => (
              <DailyRecord key={index} data={data} />
            ))}
            
            {healthData.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>記録がまだありません</p>
                <p className="text-sm mt-1">毎日の体調を記録して健康管理を始めましょう</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">AIインサイト</h3>
            </div>
            
            <div className="space-y-3">
              {averages && (
                <>
                  <InsightItem
                    type="info"
                    text={`平均睡眠時間は${averages.avgSleep.toFixed(1)}時間です`}
                  />
                  <InsightItem
                    type="success"
                    text={`週${averages.exerciseDays}日運動を実施しました`}
                  />
                  {averages.avgSleep < 7 && (
                    <InsightItem
                      type="warning"
                      text="睡眠時間が不足気味です。7-8時間を目標にしましょう"
                    />
                  )}
                </>
              )}
              {!averages && (
                <p className="text-sm text-gray-600">
                  データが蓄積されるとAIによる分析とアドバイスが表示されます
                </p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">推奨アクション</h3>
            </div>
            
            <div className="space-y-3">
              <ActionItem
                icon={<Moon className="w-4 h-4" />}
                title="睡眠改善"
                description="就寝1時間前のスマホ使用を控えましょう"
              />
              <ActionItem
                icon={<Droplets className="w-4 h-4" />}
                title="水分補給"
                description="1日2リットルを目標に水分を摂取しましょう"
              />
              <ActionItem
                icon={<Activity className="w-4 h-4" />}
                title="運動習慣"
                description="週3回、30分の軽い運動から始めましょう"
              />
            </div>
          </div>
        </div>

        {/* Monthly Report Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">月間レポート</h3>
              <p className="text-sm text-gray-600">詳細な分析とトレンドを確認</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              レポートを見る
            </button>
          </div>
        </div>
      </main>
      </div>

      {/* Health Check Modal */}
      <HealthCheckModal
        isOpen={showHealthCheck}
        onClose={() => setShowHealthCheck(false)}
        onComplete={handleHealthCheckComplete}
      />
    </div>
  )
}

// Helper Components
function SummaryCard({ 
  icon, 
  label, 
  value, 
  subValue, 
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
  color: string
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
    </div>
  )
}

function DailyRecord({ data }: { data: HealthCheckData }) {
  const date = new Date(data.timestamp)
  
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{date.getDate()}</p>
          <p className="text-xs text-gray-500">
            {date.toLocaleDateString('ja-JP', { month: 'short' })}
          </p>
        </div>
        
        <div className="h-12 w-px bg-gray-300" />
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getConditionEmoji(data.condition)}</span>
            <span className="text-sm text-gray-600">{getConditionLabel(data.condition)}</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Moon className="w-4 h-4" />
            <span>{data.sleepHours}h</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Brain className="w-4 h-4" />
            <span>{getStressEmoji(data.stressLevel)}</span>
          </div>
          
          {data.exercise.done && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Activity className="w-4 h-4" />
              <span>{data.exercise.duration}分</span>
            </div>
          )}
        </div>
      </div>
      
      {data.note && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">メモあり</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  )
}

function InsightItem({ type, text }: { type: 'info' | 'success' | 'warning', text: string }) {
  const colors = {
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700'
  }
  
  return (
    <div className={`p-3 rounded-lg ${colors[type]}`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5" />
        <p className="text-sm">{text}</p>
      </div>
    </div>
  )
}

function ActionItem({ icon, title, description }: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

// Helper functions
function getConditionLabel(condition: string) {
  const labels: Record<string, string> = {
    excellent: 'とても良い',
    good: '良い',
    normal: '普通',
    poor: '少し悪い',
    bad: '悪い'
  }
  return labels[condition] || '—'
}

function getConditionEmoji(condition: string) {
  const emojis: Record<string, string> = {
    excellent: '😊',
    good: '🙂',
    normal: '😐',
    poor: '😔',
    bad: '😷'
  }
  return emojis[condition] || '—'
}

function getConditionColor(condition: string) {
  const colors: Record<string, string> = {
    excellent: 'bg-green-100 text-green-700',
    good: 'bg-blue-100 text-blue-700',
    normal: 'bg-yellow-100 text-yellow-700',
    poor: 'bg-orange-100 text-orange-700',
    bad: 'bg-red-100 text-red-700'
  }
  return colors[condition] || 'bg-gray-100 text-gray-700'
}

function getStressLabel(level: string) {
  const labels: Record<string, string> = {
    low: '低い',
    medium: '普通',
    high: '高い'
  }
  return labels[level] || '—'
}

function getStressEmoji(level: string) {
  const emojis: Record<string, string> = {
    low: '🟢',
    medium: '🟡',
    high: '🔴'
  }
  return emojis[level] || '—'
}

function getStressColor(level: string) {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  }
  return colors[level] || 'bg-gray-100 text-gray-700'
}