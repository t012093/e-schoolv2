# 体調管理機能 バックエンド設計書

## 概要
体調データの保存、分析、AIによるインサイト生成を行うバックエンドシステム設計

## アーキテクチャ

### 技術スタック
- **フレームワーク**: Next.js 13 App Router
- **API**: Next.js API Routes (App Router)
- **データ保存**: 
  - LocalStorage (MVP/プロトタイプ版)
  - Supabase/Firebase (本番版推奨)
- **AI分析**: 
  - OpenAI API (GPT-4)
  - または Claude API
- **状態管理**: React Context + useReducer

## データモデル

### 1. HealthCheckEntry (体調記録エントリー)
```typescript
interface HealthCheckEntry {
  id: string;                    // UUID
  userId: string;                 // ユーザーID
  timestamp: string;              // ISO 8601形式
  
  // 基本データ
  condition: 'excellent' | 'good' | 'normal' | 'poor' | 'bad';
  sleepHours: number;            // 0-24
  sleepQuality: number;          // 1-5
  stressLevel: 'low' | 'medium' | 'high';
  exercise: {
    done: boolean;
    type?: string;              // 運動の種類
    duration?: number;          // 分単位
  };
  
  // オプションデータ
  mood?: string[];               // ['energetic', 'tired', 'focused', etc.]
  meals?: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  waterIntake?: number;          // グラス数
  
  // メモ
  note?: string;                 // 自由記述
  
  // メタデータ
  createdAt: string;
  updatedAt: string;
}
```

### 2. HealthInsight (AI分析結果)
```typescript
interface HealthInsight {
  id: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  generatedAt: string;
  
  summary: {
    overallTrend: 'improving' | 'stable' | 'declining';
    averageCondition: number;    // 1-5のスコア
    averageSleep: number;
    averageStress: number;
    exerciseRate: number;         // パーセンテージ
  };
  
  patterns: {
    type: string;                 // パターンタイプ
    description: string;          // 説明
    confidence: number;           // 信頼度 0-1
  }[];
  
  recommendations: {
    category: 'sleep' | 'exercise' | 'stress' | 'routine' | 'learning';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionItems: string[];
  }[];
  
  alerts?: {
    type: 'warning' | 'info';
    message: string;
    relatedMetric: string;
  }[];
}
```

### 3. UserHealthProfile (ユーザー健康プロファイル)
```typescript
interface UserHealthProfile {
  userId: string;
  
  // 基準値（個人の標準）
  baseline: {
    averageSleep: number;
    typicalStressLevel: string;
    exerciseFrequency: number;    // 週あたり
  };
  
  // 目標設定
  goals: {
    targetSleep: number;
    targetExerciseDays: number;
    stressReductionPlan?: string;
  };
  
  // パーソナライズ設定
  preferences: {
    reminderTime: string;         // "09:00"
    notificationEnabled: boolean;
    analysisFrequency: 'daily' | 'weekly';
    shareWithAICoach: boolean;
  };
  
  // 統合設定
  integrations: {
    learningProfileId?: string;   // PersonalizedAssessmentとの連携
    syncWithCalendar: boolean;
  };
}
```

## API エンドポイント設計

### 1. 体調記録API
```typescript
// POST /api/health/check
// 新規体調記録の作成
{
  request: HealthCheckEntry (without id, timestamps)
  response: {
    success: boolean;
    data: HealthCheckEntry;
    quickInsight?: string;  // 即座のフィードバック
  }
}

// GET /api/health/check
// 体調記録の取得
{
  query: {
    userId: string;
    from?: string;        // ISO date
    to?: string;          // ISO date
    limit?: number;
  }
  response: {
    data: HealthCheckEntry[];
    total: number;
  }
}

// PUT /api/health/check/:id
// 体調記録の更新
{
  request: Partial<HealthCheckEntry>
  response: {
    success: boolean;
    data: HealthCheckEntry;
  }
}
```

### 2. 分析・インサイトAPI
```typescript
// GET /api/health/insights
// AI分析結果の取得
{
  query: {
    userId: string;
    period: 'daily' | 'weekly' | 'monthly';
    force?: boolean;      // 再生成を強制
  }
  response: {
    data: HealthInsight;
    cached: boolean;
    generatedAt: string;
  }
}

// POST /api/health/analyze
// オンデマンド分析リクエスト
{
  request: {
    userId: string;
    dateRange: {
      from: string;
      to: string;
    };
    focusAreas?: string[];  // ['sleep', 'stress', etc.]
  }
  response: {
    analysis: {
      patterns: any[];
      correlations: any[];
      suggestions: string[];
    }
  }
}
```

### 3. プロファイル管理API
```typescript
// GET /api/health/profile
// ユーザー健康プロファイルの取得
{
  query: { userId: string }
  response: UserHealthProfile
}

// PUT /api/health/profile
// プロファイルの更新
{
  request: Partial<UserHealthProfile>
  response: {
    success: boolean;
    data: UserHealthProfile;
  }
}
```

### 4. レポート生成API
```typescript
// GET /api/health/report/monthly
// 月次レポートの生成
{
  query: {
    userId: string;
    year: number;
    month: number;
  }
  response: {
    report: {
      period: string;
      summary: any;
      charts: any[];
      insights: string[];
      comparisons: any;
    };
    exportUrl?: string;  // PDF URL
  }
}
```

## サービス層の設計

### 1. HealthTrackingService
```typescript
class HealthTrackingService {
  // データ保存・取得
  async saveHealthCheck(data: HealthCheckInput): Promise<HealthCheckEntry>
  async getHealthChecks(userId: string, options?: QueryOptions): Promise<HealthCheckEntry[]>
  async updateHealthCheck(id: string, data: Partial<HealthCheckEntry>): Promise<HealthCheckEntry>
  
  // 統計・集計
  async getStatistics(userId: string, period: Period): Promise<Statistics>
  async getTrends(userId: string, metric: string): Promise<TrendData>
  
  // リマインダー
  async shouldShowReminder(userId: string): Promise<boolean>
  async updateLastReminderTime(userId: string): Promise<void>
}
```

### 2. HealthAnalysisService
```typescript
class HealthAnalysisService {
  // AI分析
  async generateInsights(userId: string, data: HealthCheckEntry[]): Promise<HealthInsight>
  async detectPatterns(data: HealthCheckEntry[]): Promise<Pattern[]>
  async generateRecommendations(profile: any, data: any[]): Promise<Recommendation[]>
  
  // 相関分析
  async analyzeCorrelations(data: HealthCheckEntry[]): Promise<Correlation[]>
  async predictTrends(data: HealthCheckEntry[]): Promise<Prediction[]>
  
  // アラート生成
  async checkAlerts(data: HealthCheckEntry[]): Promise<Alert[]>
}
```

### 3. AIIntegrationService
```typescript
class AIIntegrationService {
  private openaiClient: OpenAI;
  
  // プロンプト生成
  async analyzeHealthData(data: HealthCheckEntry[]): Promise<string>
  async generatePersonalizedAdvice(profile: ComprehensiveProfile, healthData: any): Promise<string>
  async summarizeMonthlyData(data: any[]): Promise<string>
  
  // 学習プランとの統合
  async adjustLearningPlan(healthStatus: any, learningPlan: any): Promise<any>
  async suggestOptimalStudyTime(healthData: any): Promise<TimeSlot[]>
}
```

## データフロー

### 1. 体調記録フロー
```
User Input → HealthCheckModal
    ↓
Validation → API Call (/api/health/check)
    ↓
Save to Storage (LocalStorage/DB)
    ↓
Quick Analysis (同期的)
    ↓
Return Response with Instant Feedback
    ↓
Trigger Background Analysis (非同期)
```

### 2. AI分析フロー
```
Scheduled/On-demand Trigger
    ↓
Fetch Recent Health Data (7-30 days)
    ↓
Preprocess Data
    ↓
Send to AI Service (OpenAI/Claude)
    ↓
Parse AI Response
    ↓
Generate Structured Insights
    ↓
Cache Results (1-24 hours)
    ↓
Notify User (if significant findings)
```

### 3. 統合フロー（学習システムとの連携）
```
Health Data + Learning Profile
    ↓
Combined Analysis
    ↓
Generate Holistic Recommendations
    ↓
Update AI Coach Context
    ↓
Adjust Learning Schedule/Intensity
```

## キャッシュ戦略

### 1. LocalStorage構造
```javascript
localStorage: {
  'health.entries.v1': HealthCheckEntry[],      // 最新100件
  'health.insights.v1': HealthInsight,          // 最新の分析結果
  'health.profile.v1': UserHealthProfile,       // ユーザープロファイル
  'health.cache.monthly': MonthlyData,          // 月次キャッシュ
  'health.lastCheck': string,                   // 最終記録時刻
}
```

### 2. キャッシュ有効期限
- 体調記録: 永続化
- インサイト: 24時間
- 月次レポート: 30日
- 統計データ: 6時間

## セキュリティ・プライバシー

### 1. データ保護
- 健康データの暗号化（保存時）
- ユーザーIDベースのアクセス制御
- センシティブデータのマスキング

### 2. プライバシー設定
- データ共有の明示的な同意
- 削除権の保証（GDPR準拠）
- エクスポート機能の提供

### 3. AI利用時の配慮
- 個人識別情報の除去
- 集約データのみのAI送信
- オプトアウト機能

## エラーハンドリング

### 1. API エラーコード
```typescript
enum HealthErrorCode {
  INVALID_INPUT = 'HEALTH_001',
  DATA_NOT_FOUND = 'HEALTH_002',
  ANALYSIS_FAILED = 'HEALTH_003',
  QUOTA_EXCEEDED = 'HEALTH_004',
  AI_SERVICE_ERROR = 'HEALTH_005',
}
```

### 2. フォールバック戦略
- AI分析失敗時: 基本統計のみ表示
- データ保存失敗時: LocalStorage使用
- ネットワークエラー時: オフラインモード

## パフォーマンス最適化

### 1. データ取得
- ページネーション（20件/ページ）
- 遅延ローディング（スクロール時）
- 必要最小限のフィールド取得

### 2. 分析処理
- バックグラウンド処理（Web Workers検討）
- インクリメンタル分析
- 差分更新

### 3. AI API呼び出し
- バッチ処理（複数日のデータをまとめて）
- レート制限対応（429エラー時のリトライ）
- コスト最適化（必要時のみ呼び出し）

## 将来の拡張

### 1. 外部連携
- Fitbit/Apple Health連携
- Google Fit API
- 医療機関APIとの連携

### 2. 高度な分析
- 機械学習モデルの導入
- 予測分析の強化
- 個人化アルゴリズムの改善

### 3. リアルタイム機能
- WebSocketによるリアルタイム通知
- 共有ダッシュボード
- チーム/家族での健康管理