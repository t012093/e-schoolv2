# タスク関連性設計書

## 概要

現在の個別タスク管理から、学習プラットフォームに適した包括的なタスク関連システムへの設計変更。タスク同士の依存関係、階層構造、進捗の連鎖を実現する。

## 現在の課題

- タスクが独立しており、学習の流れが見えない
- 大きな目標と日々のタスクが分離している
- 進捗の全体像が把握しにくい
- 学習プランとタスクの連携が不十分

## 新設計：階層型タスク関連システム

### 1. タスク階層構造

```
学習目標 (Goal)
├── 学習プラン (Plan)
│   ├── フェーズ (Phase)
│   │   ├── モジュール (Module)
│   │   │   ├── レッスン (Lesson)
│   │   │   │   ├── アクティビティ (Activity)
│   │   │   │   └── 評価 (Assessment)
│   │   │   └── チェックポイント (Checkpoint)
│   │   └── マイルストーン (Milestone)
│   └── 最終評価 (Final Assessment)
└── 成果物 (Deliverable)
```

### 2. データモデル設計

#### 基本タスクエンティティ

```typescript
interface BaseTask {
  id: string
  title: string
  description?: string
  type: TaskType
  status: TaskStatus
  priority: Priority
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  estimatedDuration?: number // 分
  actualDuration?: number // 分
  tags: string[]
  metadata: Record<string, any>
}

enum TaskType {
  GOAL = 'goal',           // 学習目標
  PLAN = 'plan',           // 学習プラン
  PHASE = 'phase',         // フェーズ
  MODULE = 'module',       // モジュール
  LESSON = 'lesson',       // レッスン
  ACTIVITY = 'activity',   // アクティビティ
  ASSESSMENT = 'assessment', // 評価
  CHECKPOINT = 'checkpoint', // チェックポイント
  MILESTONE = 'milestone',   // マイルストーン
  PROJECT = 'project',     // プロジェクト
  EPIC = 'epic',           // エピック
  STORY = 'story',         // ストーリー
  TASK = 'task',           // 基本タスク
  SUBTASK = 'subtask'      // サブタスク
}

enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  REVIEW = 'review',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
```

#### 関連性エンティティ

```typescript
interface TaskRelationship {
  id: string
  parentId: string
  childId: string
  relationshipType: RelationshipType
  order?: number // 兄弟間の順序
  isRequired: boolean // 必須関係かどうか
  createdAt: Date
}

enum RelationshipType {
  PARENT_CHILD = 'parent_child',     // 親子関係
  DEPENDENCY = 'dependency',         // 依存関係
  SEQUENCE = 'sequence',             // 順序関係
  GROUP = 'group',                   // グループ関係
  PREREQUISITE = 'prerequisite',     // 前提条件
  BLOCKS = 'blocks',                 // ブロック関係
  RELATES_TO = 'relates_to'          // 関連
}

interface TaskDependency {
  id: string
  sourceTaskId: string
  targetTaskId: string
  dependencyType: DependencyType
  description?: string
  isOptional: boolean
  createdAt: Date
}

enum DependencyType {
  FINISH_TO_START = 'finish_to_start',   // 前タスク完了後に開始
  START_TO_START = 'start_to_start',     // 前タスク開始と同時に開始
  FINISH_TO_FINISH = 'finish_to_finish', // 前タスク完了と同時に完了
  START_TO_FINISH = 'start_to_finish'    // 前タスク開始後に完了
}
```

#### 進捗追跡エンティティ

```typescript
interface TaskProgress {
  taskId: string
  progressPercentage: number
  completedSubtasks: number
  totalSubtasks: number
  timeSpent: number // 分
  lastActivity: Date
  notes?: string
  blockers?: string[]
  achievements?: Achievement[]
}

interface Achievement {
  id: string
  title: string
  description: string
  iconUrl?: string
  earnedAt: Date
  criteria: AchievementCriteria
}

interface AchievementCriteria {
  type: 'completion' | 'streak' | 'time' | 'quality'
  threshold: number
  description: string
}
```

### 3. 学習プラットフォーム専用設計

#### 英語学習の例

```typescript
interface EnglishLearningGoal extends BaseTask {
  type: TaskType.GOAL
  targetLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  skills: ('speaking' | 'listening' | 'reading' | 'writing')[]
  deadline: Date
  motivation: string
}

interface LearningPhase extends BaseTask {
  type: TaskType.PHASE
  duration: number // 週数
  focusAreas: string[]
  prerequisites: string[]
  learningObjectives: string[]
}

interface LearningModule extends BaseTask {
  type: TaskType.MODULE
  subject: string
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedHours: number
  resources: LearningResource[]
  assessmentCriteria: AssessmentCriteria[]
}

interface LearningResource {
  id: string
  title: string
  type: 'video' | 'article' | 'exercise' | 'book' | 'app'
  url?: string
  duration?: number
  description?: string
}

interface AssessmentCriteria {
  skill: string
  minScore: number
  weight: number
  description: string
}
```

### 4. 関連性管理機能

#### 依存関係の自動解決

```typescript
class TaskDependencyResolver {
  // 前提条件チェック
  canStartTask(taskId: string): boolean {
    const dependencies = this.getDependencies(taskId)
    return dependencies.every(dep => 
      dep.isOptional || this.isTaskCompleted(dep.sourceTaskId)
    )
  }

  // 完了時の連鎖処理
  onTaskCompleted(taskId: string): void {
    // 1. 子タスクの進捗更新
    this.updateParentProgress(taskId)
    
    // 2. 依存タスクのブロック解除
    this.unblockDependentTasks(taskId)
    
    // 3. マイルストーン確認
    this.checkMilestones(taskId)
    
    // 4. 実績解除
    this.checkAchievements(taskId)
  }

  // 進捗の親への伝播
  private updateParentProgress(childTaskId: string): void {
    const parentId = this.getParentTask(childTaskId)
    if (!parentId) return

    const siblings = this.getChildTasks(parentId)
    const completed = siblings.filter(t => t.status === TaskStatus.COMPLETED)
    const progressPercentage = (completed.length / siblings.length) * 100

    this.updateTaskProgress(parentId, progressPercentage)
  }
}
```

#### 学習パス生成

```typescript
class LearningPathGenerator {
  generatePath(goal: EnglishLearningGoal): LearningPath {
    const path: LearningPath = {
      goalId: goal.id,
      phases: [],
      estimatedDuration: 0,
      difficulty: this.calculateDifficulty(goal)
    }

    // 現在レベルと目標レベルの差分分析
    const levelGap = this.analyzeLevelGap(goal.currentLevel, goal.targetLevel)
    
    // フェーズ生成
    path.phases = this.generatePhases(levelGap, goal.skills)
    
    // 各フェーズにモジュール追加
    path.phases.forEach(phase => {
      phase.modules = this.generateModules(phase.focusAreas, phase.difficulty)
      
      // 各モジュールにレッスン追加
      phase.modules.forEach(module => {
        module.lessons = this.generateLessons(module.subject, module.difficulty)
      })
    })

    return path
  }

  private generatePhases(levelGap: LevelGap, skills: string[]): LearningPhase[] {
    // 基礎固め → 中級力増強 → 試験対策のような段階的フェーズ生成
    return [
      this.createFoundationPhase(levelGap, skills),
      this.createIntermediatePhase(levelGap, skills),
      this.createAdvancedPhase(levelGap, skills)
    ].filter(phase => phase !== null)
  }
}
```

### 5. ユーザーインターフェース設計

#### タスク階層表示

```typescript
interface TaskTreeView {
  // 階層表示コンポーネント
  renderTaskTree(rootTaskId: string): JSX.Element
  
  // 依存関係可視化
  renderDependencyGraph(taskIds: string[]): JSX.Element
  
  // 進捗サマリー
  renderProgressSummary(taskId: string): JSX.Element
}

// Ganttチャート風の表示
interface TaskGanttView {
  tasks: TaskWithTimeline[]
  dependencies: TaskDependency[]
  milestones: Milestone[]
  
  renderTimeline(): JSX.Element
  renderDependencyLines(): JSX.Element
  renderCriticalPath(): JSX.Element
}
```

#### 学習ダッシュボード統合

```typescript
interface LearningDashboard {
  // 現在の学習フェーズ
  currentPhase: LearningPhase
  
  // 今日のタスク（依存関係を考慮）
  todaysTasks: Task[]
  
  // 全体進捗
  overallProgress: {
    goalProgress: number
    phaseProgress: number
    moduleProgress: number
  }
  
  // 次にすべきアクション
  nextActions: RecommendedAction[]
  
  // ブロッカー警告
  blockers: TaskBlocker[]
}

interface RecommendedAction {
  taskId: string
  priority: Priority
  reason: string
  estimatedTime: number
  prerequisites: string[]
}
```

### 6. 実装段階

#### Phase 1: 基本階層構造
- [ ] タスクエンティティの拡張
- [ ] 親子関係の実装
- [ ] 基本的な階層表示

#### Phase 2: 依存関係
- [ ] 依存関係エンティティ
- [ ] 依存解決ロジック
- [ ] ブロッカー検出

#### Phase 3: 学習プラン統合
- [ ] 学習目標からタスク生成
- [ ] 進捗の自動追跡
- [ ] 推奨アクション生成

#### Phase 4: 高度な機能
- [ ] Ganttチャート表示
- [ ] クリティカルパス分析
- [ ] 実績システム統合

## データベーススキーマ

### PostgreSQL設計例

```sql
-- 基本タスクテーブル
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- 分
  actual_duration INTEGER, -- 分
  tags TEXT[],
  metadata JSONB DEFAULT '{}'
);

-- タスク関係テーブル
CREATE TABLE task_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  child_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL,
  order_index INTEGER,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(parent_id, child_id)
);

-- タスク依存関係テーブル
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  target_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) NOT NULL,
  description TEXT,
  is_optional BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(source_task_id, target_task_id)
);

-- 進捗追跡テーブル
CREATE TABLE task_progress (
  task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_subtasks INTEGER DEFAULT 0,
  total_subtasks INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- 分
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  blockers TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_task_relationships_parent ON task_relationships(parent_id);
CREATE INDEX idx_task_relationships_child ON task_relationships(child_id);
CREATE INDEX idx_task_dependencies_source ON task_dependencies(source_task_id);
CREATE INDEX idx_task_dependencies_target ON task_dependencies(target_task_id);
```

## APIエンドポイント設計

```typescript
// タスク階層操作
GET    /api/tasks/{id}/hierarchy          // 階層構造取得
POST   /api/tasks/{id}/children           // 子タスク作成
PUT    /api/tasks/{id}/parent/{parentId}  // 親子関係設定
DELETE /api/tasks/{id}/parent             // 親子関係解除

// 依存関係操作
GET    /api/tasks/{id}/dependencies       // 依存関係取得
POST   /api/tasks/{id}/dependencies       // 依存関係作成
DELETE /api/tasks/{id}/dependencies/{depId} // 依存関係削除

// 進捗操作
GET    /api/tasks/{id}/progress           // 進捗取得
PUT    /api/tasks/{id}/progress           // 進捗更新
POST   /api/tasks/{id}/complete           // 完了処理（連鎖処理含む）

// 学習プラン統合
POST   /api/learning-plans/{id}/generate-tasks  // プランからタスク生成
GET    /api/learning-paths/{goalId}            // 学習パス取得
POST   /api/learning-goals/{id}/start          // 学習開始
```

## まとめ

この設計により、単純なタスク管理から学習プラットフォームに適した包括的なタスク関連システムへと発展します。タスク同士の関連性を明確にし、学習の流れを可視化し、進捗を自動的に追跡することで、ユーザーにとって直感的で効果的な学習体験を提供できます。