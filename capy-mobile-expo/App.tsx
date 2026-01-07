import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

type TabName = 'home' | 'ai' | 'tasks' | 'learn' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'ai':
        return <AIScreen />;
      case 'tasks':
        return <TasksScreen />;
      case 'learn':
        return <LearnScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}

// Home Screen Component
function HomeScreen() {
  const [displayProgress, setDisplayProgress] = useState(0);
  const progress = 65;

  useEffect(() => {
    setTimeout(() => setDisplayProgress(progress), 300);
  }, []);

  const stats = [
    { icon: 'flame' as const, value: 7, label: '日連続', color: '#FB923C' },
    { icon: 'target' as const, value: 12, label: '完了', color: '#60A5FA' },
    { icon: 'trending-up' as const, value: '85%', label: '達成率', color: '#4ADE80' },
  ];

  const quickActions = [
    { emoji: '🎯', title: '体調チェック', subtitle: '今日の調子はどう？', bg: '#E9D5FF', hasIndicator: true },
    { emoji: '🤖', title: 'AIコーチに相談', subtitle: '学習のアドバイスを受ける', bg: '#DBEAFE', hasIndicator: false },
  ];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>こんにちは！</Text>
        <Text style={styles.subtitle}>今日も学習を続けましょう</Text>
      </View>

      <Pressable style={({ pressed }) => [styles.learningCard, pressed && styles.pressed]}>
        <LinearGradient colors={['#4ADE80', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          <View style={styles.learningCardContent}>
            <View>
              <Text style={styles.cardTitle}>今日の学習</Text>
              <Text style={styles.cardSubtitle}>おすすめのコンテンツ</Text>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{displayProgress}%</Text>
            </View>
          </View>
          <Pressable style={styles.startButton}>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.startButtonText}>学習を始める</Text>
          </Pressable>
        </LinearGradient>
      </Pressable>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Pressable key={index} style={({ pressed }) => [styles.statCard, pressed && styles.pressed]}>
            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>クイックアクション</Text>
        {quickActions.map((action, index) => (
          <Pressable key={index} style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
            <View style={styles.actionContent}>
              <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
            </View>
            {action.hasIndicator && <View style={styles.indicator} />}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// AI Screen Component
function AIScreen() {
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string; isUser: boolean; time: string}>>([
    { text: 'こんにちは！今日は何を学習しますか？', isUser: false, time: '10:00' },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const assessments = [
    {
      emoji: '🧠',
      title: '性格診断',
      subtitle: 'MBTI風の性格タイプを診断',
      progress: 0,
      color: '#A78BFA',
      bgGradient: ['#A78BFA', '#EC4899'],
    },
    {
      emoji: '📚',
      title: '学習スタイル診断',
      subtitle: 'あなたに最適な学習方法を発見',
      progress: 60,
      color: '#60A5FA',
      bgGradient: ['#60A5FA', '#3B82F6'],
    },
    {
      emoji: '🎯',
      title: 'モチベーション分析',
      subtitle: 'やる気の源泉を見つける',
      progress: 100,
      color: '#4ADE80',
      bgGradient: ['#4ADE80', '#10B981'],
    },
  ];

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Add user message
    setMessages(prev => [...prev, { text: inputText, isUser: true, time: timeStr }]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        '素晴らしいですね！一緒に頑張りましょう！',
        'その目標に向かって、どんな学習方法がいいと思いますか？',
        'いいですね！まずは基礎から始めましょうか？',
        'その調子です！コツコツ続けることが大切ですよ。',
      ];
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages(prev => [...prev, { text: response, isUser: false, time: timeStr }]);
    }, 1000);
  };

  if (isChatMode) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.chatScreenContainer}>
          {/* Header */}
          <View style={styles.chatScreenHeader}>
            <Pressable onPress={() => setIsChatMode(false)} style={styles.chatBackButton}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </Pressable>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderTitle}>AIコーチ</Text>
              <Text style={styles.chatHeaderSubtitle}>オンライン</Text>
            </View>
            <View style={styles.chatHeaderAvatar}>
              <Text style={styles.chatHeaderAvatarText}>🤖</Text>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                {!message.isUser && (
                  <View style={styles.aiAvatarSmall}>
                    <Text style={styles.aiAvatarSmallText}>🤖</Text>
                  </View>
                )}
                <View style={[
                  styles.messageContent,
                  message.isUser ? styles.userMessageContent : styles.aiMessageContent,
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.aiMessageText,
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    message.isUser ? styles.userMessageTime : styles.aiMessageTime,
                  ]}>
                    {message.time}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Input */}
          <View style={styles.chatInputContainer}>
            <View style={styles.chatInputWrapper}>
              <TextInput
                style={styles.chatInput}
                placeholder="メッセージを入力..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={sendMessage}
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                disabled={!inputText.trim()}
              >
                <Ionicons name="send" size={20} color={inputText.trim() ? '#fff' : '#9CA3AF'} />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>AIコーチ</Text>
        <Text style={styles.subtitle}>学習のサポートをします</Text>
      </View>

      {/* Assessment Cards */}
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionTitleText}>パーソナライズ診断</Text>
        <Text style={styles.sectionSubtitle}>あなた専用の学習プランを作成</Text>
      </View>

      {assessments.map((assessment, index) => (
        <Pressable
          key={index}
          style={({ pressed }) => [styles.assessmentCard, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={assessment.bgGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.assessmentGradient}
          >
            <View style={styles.assessmentHeader}>
              <View style={styles.assessmentIconContainer}>
                <Text style={styles.assessmentEmoji}>{assessment.emoji}</Text>
              </View>
              <View style={styles.assessmentInfo}>
                <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                <Text style={styles.assessmentSubtitle}>{assessment.subtitle}</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.assessmentProgress}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${assessment.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{assessment.progress}%</Text>
            </View>

            {/* Action Button */}
            <Pressable style={styles.assessmentButton}>
              <Text style={styles.assessmentButtonText}>
                {assessment.progress === 0 ? '診断を開始' : assessment.progress === 100 ? '結果を見る' : '続きから'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </Pressable>
          </LinearGradient>
        </Pressable>
      ))}

      {/* AI Chat Section */}
      <View style={[styles.sectionTitle, { marginTop: 32 }]}>
        <Text style={styles.sectionTitleText}>AIコーチに相談</Text>
      </View>

      <View style={styles.chatContainer}>
        <Text style={styles.chatEmoji}>🤖</Text>
        <Text style={styles.chatMessage}>こんにちは！今日は何を学習しますか？</Text>
        <Pressable style={styles.chatStartButton} onPress={() => setIsChatMode(true)}>
          <Text style={styles.chatStartButtonText}>チャットを始める</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// Tasks Screen Component
function TasksScreen() {
  const tasks = [
    { title: '英単語100語を覚える', tag: '英語', completed: false },
    { title: 'リスニング練習30分', tag: '英語', completed: true },
    { title: 'プログラミング課題', tag: 'IT', completed: false },
  ];

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>タスク</Text>
        <Text style={styles.subtitle}>今日のタスク一覧</Text>
      </View>
      {tasks.map((task, index) => (
        <View key={index} style={styles.taskCard}>
          <View style={[styles.taskCheckbox, task.completed && styles.taskCheckboxCompleted]}>
            {task.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <View style={styles.taskContent}>
            <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
          </View>
          <View style={styles.taskTag}>
            <Text style={styles.taskTagText}>{task.tag}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// Learn Screen Component
function LearnScreen() {
  const content = [
    { emoji: '🎥', title: '英単語1000：基礎編', progress: 60, duration: '15分' },
    { emoji: '📖', title: '英文法の基礎完全ガイド', progress: 0, duration: '20分' },
    { emoji: '🎧', title: 'リスニング練習 Lesson 3', progress: 100, duration: '25分' },
  ];

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>学習コンテンツ</Text>
        <Text style={styles.subtitle}>あなたにおすすめ</Text>
      </View>
      {content.map((item, index) => (
        <Pressable key={index} style={({ pressed }) => [styles.contentCard, pressed && styles.pressed]}>
          <View style={styles.contentIcon}>
            <Text style={styles.contentEmoji}>{item.emoji}</Text>
          </View>
          <View style={styles.contentText}>
            <Text style={styles.contentTitle}>{item.title}</Text>
            <Text style={styles.contentDuration}>{item.duration} • {item.progress}%</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>
      ))}
    </ScrollView>
  );
}

// Profile Screen Component
function ProfileScreen() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>マイページ</Text>
        <Text style={styles.subtitle}>あなたのプロフィール</Text>
      </View>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>😊</Text>
        </View>
        <Text style={styles.profileName}>学習者</Text>
        <Text style={styles.profileLevel}>レベル 5</Text>
      </View>
      <View style={styles.menuSection}>
        {['設定', '学習履歴', 'バッジ', 'ヘルプ'].map((item, index) => (
          <Pressable key={index} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
            <Text style={styles.menuItemText}>{item}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// Bottom Navigation Component
function BottomNav({ activeTab, onTabChange }: { activeTab: TabName; onTabChange: (tab: TabName) => void }) {
  const tabs = [
    { id: 'home' as TabName, icon: 'home' as const, label: 'ホーム' },
    { id: 'ai' as TabName, icon: 'chatbubble-ellipses' as const, label: 'AI' },
    { id: 'tasks' as TabName, icon: 'checkbox' as const, label: 'タスク' },
    { id: 'learn' as TabName, icon: 'book' as const, label: '学習' },
    { id: 'profile' as TabName, icon: 'person' as const, label: 'マイページ' },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={({ pressed }) => [
              styles.navItem,
              isActive && styles.navItemActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={isActive ? '#4ADE80' : '#9CA3AF'}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  learningCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  gradient: {
    padding: 32,
    borderRadius: 24,
  },
  learningCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
  },
  progressText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  // AI Screen
  sectionTitleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  assessmentCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  assessmentGradient: {
    padding: 20,
    borderRadius: 24,
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  assessmentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assessmentEmoji: {
    fontSize: 32,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  assessmentSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  assessmentProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  assessmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  assessmentButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  chatContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  chatEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  chatMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  chatStartButton: {
    backgroundColor: '#4ADE80',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  chatStartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Tasks Screen
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxCompleted: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  // Learn Screen
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  contentIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentEmoji: {
    fontSize: 28,
  },
  contentText: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  contentDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Profile Screen
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileLevel: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  navItemActive: {
    backgroundColor: '#F0FDF4',
  },
  navLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#4ADE80',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  // Chat Screen
  chatScreenContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  chatScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  chatBackButton: {
    padding: 4,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  chatHeaderSubtitle: {
    fontSize: 12,
    color: '#4ADE80',
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderAvatarText: {
    fontSize: 20,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiAvatarSmallText: {
    fontSize: 16,
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userMessageContent: {
    backgroundColor: '#4ADE80',
    marginLeft: 'auto',
  },
  aiMessageContent: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 11,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiMessageTime: {
    color: '#9CA3AF',
  },
  chatInputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
  },
  chatInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
});
