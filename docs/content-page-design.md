# コンテンツページ UI設計書

## 概要
「Files」メニューを「コンテンツ」に変更し、学習コンテンツを効率的に管理・閲覧できる機能を提供します。動画教材、記事、演習問題、参考資料などを統合的に管理し、学習プランとの連携により効果的な学習をサポートします。

## 変更内容サマリー

### メニュー変更
- **項目名**: "Files" → "コンテンツ"
- **アイコン**: `FileText` → `BookOpen` (学習コンテンツを象徴)
- **位置**: サイドバーの既存位置を維持

## 主要機能

### 1. コンテンツカテゴリー管理
学習コンテンツを以下のタイプで分類:
- 📹 **動画教材**: 講義動画、解説動画
- 📄 **記事・テキスト**: 読み物、教科書的コンテンツ
- ✍️ **演習問題**: 練習問題、テスト、クイズ
- 📚 **参考資料**: 補足資料、リンク集、PDF
- 🎧 **音声コンテンツ**: ポッドキャスト、音声講義

### 2. フィルタリング・検索機能
- **タイプフィルター**: コンテンツタイプでの絞り込み
- **カテゴリーフィルター**: 科目/トピックでの絞り込み
- **進捗フィルター**: 未開始/進行中/完了での絞り込み
- **難易度フィルター**: 初級/中級/上級での絞り込み
- **キーワード検索**: タイトル・説明文での検索

### 3. ビュー切り替え
- **グリッドビュー**: カード型表示（デフォルト）
- **リストビュー**: 詳細情報を含む一覧表示

## UI コンポーネント構成

### メインレイアウト
```
┌─────────────────────────────────────────────────────────────┐
│  ヘッダーバー                                                 │
│  [コンテンツライブラリ]  [+ 新規追加]  [グリッド/リスト切替]  │
├─────────────────────────────────────────────────────────────┤
│  フィルターバー                                               │
│  [全て][動画][記事][演習][資料]  [難易度▼][進捗▼]  [🔍検索]  │
├─────────────────────────────────────────────────────────────┤
│  統計サマリー                                                 │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │全コンテンツ│ 進行中    │ 完了済み  │ 今週追加  │            │
│  │    48     │    12    │    23    │     3    │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
├─────────────────────────────────────────────────────────────┤
│  コンテンツグリッド                                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│  │ 📹 動画     │ │ 📄 記事     │ │ ✍️ 演習     │            │
│  │ タイトル    │ │ タイトル    │ │ タイトル    │            │
│  │ ────────   │ │ ────────   │ │ ────────   │            │
│  │ 15分 | 中級 │ │ 10分 | 初級 │ │ 20分 | 上級 │            │
│  │ 進行中 60%  │ │ 未開始      │ │ 完了 ✓     │            │
│  │ [開く]     │ │ [開く]     │ │ [復習]     │            │
│  └────────────┘ └────────────┘ └────────────┘            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│  │ 📚 参考資料 │ │ 🎧 音声     │ │ 📹 動画     │            │
│  │ ...        │ │ ...        │ │ ...        │            │
│  └────────────┘ └────────────┘ └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### コンテンツカードコンポーネント設計

#### グリッドビュー（カード型）
```tsx
┌─────────────────────────┐
│ 📹 [タイプアイコン]      │ ← 色分けされたアイコン
│                         │
│ タイトル（2行まで）      │ ← 大きめのフォント
│ 説明テキスト（3行まで）  │ ← 小さめのグレー文字
│                         │
│ ┌─────────────────┐    │
│ │ ████████░░░ 75% │    │ ← 進捗バー
│ └─────────────────┘    │
│                         │
│ 🏷️ 中級 | ⏱️ 20分      │ ← メタ情報
│ 📅 3日前更新            │
│                         │
│ [▶ 開く]  [⭐]  [...]  │ ← アクションボタン
└─────────────────────────┘
```

#### リストビュー
```
[📹] タイトル                | 科目: 英語 | 難易度: 中級 | 20分 | 進行中 75% | [開く][⭐][...]
[📄] タイトル                | 科目: 数学 | 難易度: 初級 | 10分 | 未開始     | [開く][⭐][...]
[✍️] タイトル                | 科目: 英語 | 難易度: 上級 | 30分 | 完了 ✓    | [復習][⭐][...]
```

## データ構造

### ContentItem型定義
```typescript
type ContentType = 'video' | 'article' | 'exercise' | 'reference' | 'audio'
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
type ProgressStatus = 'not-started' | 'in-progress' | 'completed'

interface ContentItem {
  id: string
  type: ContentType
  title: string
  description: string
  category: string[] // ['英語', '語彙', 'TOEIC対策']
  difficulty: DifficultyLevel
  duration: number // 分単位
  progress: number // 0-100
  status: ProgressStatus
  isFavorite: boolean
  url?: string
  thumbnailUrl?: string
  createdAt: Date
  updatedAt: Date
  lastAccessedAt?: Date
  tags: string[]
  relatedPlanId?: string // 学習プランとの紐付け
}
```

## UIコンポーネント階層

```
src/
├── app/
│   └── page.tsx (メインダッシュボード - コンテンツセクション追加)
├── components/
│   ├── ContentCard.tsx (コンテンツカード)
│   ├── ContentList.tsx (リストビュー用)
│   ├── ContentFilters.tsx (フィルターバー)
│   ├── ContentStats.tsx (統計サマリー)
│   └── ContentDetailModal.tsx (詳細表示モーダル - 将来拡張用)
└── hooks/
    └── useContent.ts (コンテンツデータ管理フック)
```

## デザイン仕様

### カラーパレット
コンテンツタイプ別の色分け:
- **動画**: `#3B82F6` (blue-500) - ビデオアイコンの背景
- **記事**: `#10B981` (green-500) - テキストコンテンツ
- **演習**: `#F59E0B` (amber-500) - アクティブな学習
- **参考資料**: `#8B5CF6` (violet-500) - 補助的な資料
- **音声**: `#EC4899` (pink-500) - オーディオコンテンツ

### 進捗状態の色
- **未開始**: `#9CA3AF` (gray-400)
- **進行中**: `#3B82F6` (blue-500)
- **完了**: `#10B981` (green-500)

### アイコン（Lucide React使用）
- `BookOpen`: メインアイコン（コンテンツメニュー）
- `Video`: 動画コンテンツ
- `FileText`: 記事・テキスト
- `PenTool`: 演習問題
- `BookMarked`: 参考資料
- `Headphones`: 音声コンテンツ
- `Filter`: フィルター機能
- `Search`: 検索機能
- `Grid`: グリッドビュー
- `List`: リストビュー
- `Star`: お気に入り
- `Play`: 再生/開始
- `CheckCircle`: 完了マーク
- `Clock`: 所要時間
- `BarChart3`: 進捗表示

### タイポグラフィ
- **カードタイトル**: `text-base font-semibold text-gray-900`
- **カード説明**: `text-sm text-gray-600`
- **メタ情報**: `text-xs text-gray-500`
- **統計数値**: `text-2xl font-bold text-gray-900`
- **統計ラベル**: `text-sm font-medium text-gray-600`

### スペーシング
- **カード間隔**: `gap-4` (1rem)
- **カード内パディング**: `p-4` (1rem)
- **セクション間隔**: `space-y-6` (1.5rem)

### レスポンシブデザイン
```css
/* モバイル (< 768px) */
- グリッド: 1カラム
- フィルター: 縦スタック
- 統計: 2x2グリッド

/* タブレット (768px - 1024px) */
- グリッド: 2カラム
- フィルター: 横並び（折り返し可）
- 統計: 4カラム

/* デスクトップ (> 1024px) */
- グリッド: 3カラム
- フィルター: 横並び（固定）
- 統計: 4カラム
```

## インタラクション仕様

### カードホバー
- 影を強調: `hover:shadow-lg`
- わずかに浮き上がる: `hover:-translate-y-1 transition-all`
- ボーダーの色変更: `hover:border-blue-300`

### フィルター操作
1. フィルターボタンクリック → アクティブ状態に
2. 複数選択可能（OR条件）
3. リアルタイムでコンテンツ絞り込み
4. 「クリア」ボタンで全解除

### 検索機能
- デバウンス処理（300ms）でパフォーマンス最適化
- タイトル・説明・タグを対象に部分一致検索
- 検索中はローディングインジケーター表示

### 進捗更新
- コンテンツを開く → `lastAccessedAt` 更新
- 「完了」ボタン → `status` を `completed` に、`progress` を 100 に
- 進行中コンテンツは進捗バーをアニメーション表示

## 既存システムとの統合

### サイドバーメニュー統合
```tsx
// src/app/page.tsx のサイドバー (294-306行目)
<li>
  <button
    onClick={() => handleSectionChange('contents')}
    className={`flex items-center gap-2.5 w-full p-2.5 text-sm rounded-md transition-colors ${
      activeSection === 'contents'
        ? 'bg-gray-100 text-gray-900 font-medium'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <BookOpen className="w-4.5 h-4.5" />
    {!sidebarCollapsed && <span>コンテンツ</span>}
  </button>
</li>
```

### 学習プラン連携
- `PersonalizedLearningPlan` から推奨コンテンツを表示
- プラン内のモジュールに関連するコンテンツを自動提案
- 「次に学習すべきコンテンツ」セクションを追加

### AIコーチ連携
- AIコーチが推薦したコンテンツにバッジ表示
- 「AIコーチに相談」ボタンでコンテンツ選択をサポート
- 学習履歴から最適なコンテンツを提案

### 体調管理連携
- 体調が良くない日は軽いコンテンツを推奨
- 集中力が高い時間帯には難易度の高いコンテンツを提案

## サンプルデータ

### 初期表示用ダミーデータ
```typescript
const sampleContents: ContentItem[] = [
  {
    id: 'c1',
    type: 'video',
    title: '英単語1000：基礎編 Unit 1-5',
    description: '頻出英単語1000のうち、基礎となる最重要200語をカバーします。',
    category: ['英語', '語彙', '基礎'],
    difficulty: 'beginner',
    duration: 15,
    progress: 60,
    status: 'in-progress',
    isFavorite: true,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-12'),
    tags: ['英語', 'TOEIC', '初心者向け']
  },
  {
    id: 'c2',
    type: 'article',
    title: '英文法の基礎：時制の完全ガイド',
    description: '現在形、過去形、未来形、完了形など英語の時制を体系的に学べる記事です。',
    category: ['英語', '文法'],
    difficulty: 'intermediate',
    duration: 20,
    progress: 0,
    status: 'not-started',
    isFavorite: false,
    createdAt: new Date('2025-01-11'),
    updatedAt: new Date('2025-01-11'),
    tags: ['英語', '文法', '時制']
  },
  {
    id: 'c3',
    type: 'exercise',
    title: 'リスニング基礎：会話練習 Lesson 3',
    description: '日常会話の聞き取り練習。ネイティブスピードで10問の問題に挑戦。',
    category: ['英語', 'リスニング'],
    difficulty: 'intermediate',
    duration: 25,
    progress: 100,
    status: 'completed',
    isFavorite: true,
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-12'),
    lastAccessedAt: new Date('2025-01-12'),
    tags: ['英語', 'リスニング', '会話']
  },
  {
    id: 'c4',
    type: 'reference',
    title: 'TOEIC頻出イディオム集500',
    description: 'TOEIC試験で頻繁に出題されるイディオムと慣用表現をまとめた参考資料。',
    category: ['英語', '語彙', 'TOEIC対策'],
    difficulty: 'intermediate',
    duration: 30,
    progress: 0,
    status: 'not-started',
    isFavorite: false,
    createdAt: new Date('2025-01-09'),
    updatedAt: new Date('2025-01-09'),
    tags: ['TOEIC', 'イディオム', '資料']
  },
  {
    id: 'c5',
    type: 'audio',
    title: '英語耳を鍛える発音トレーニング',
    description: 'ネイティブ発音の聞き分けと発音練習のための音声教材。',
    category: ['英語', '発音'],
    difficulty: 'beginner',
    duration: 18,
    progress: 30,
    status: 'in-progress',
    isFavorite: false,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-13'),
    lastAccessedAt: new Date('2025-01-13'),
    tags: ['英語', '発音', 'リスニング']
  }
]
```

## アクセシビリティ

### キーボードナビゲーション
- Tab キー: カード間の移動
- Enter / Space: カード選択・アクション実行
- 矢印キー: グリッド内の移動
- Esc: モーダル・フィルター閉じる

### スクリーンリーダー対応
```tsx
// aria-label の使用例
<button aria-label="動画コンテンツでフィルター">
  <Video className="w-4 h-4" />
</button>

<div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
  進捗: {progress}%
</div>
```

### カラーコントラスト
- WCAG AA 基準を満たす配色
- 色だけでなくアイコン・テキストでも情報伝達
- ダークモード対応（将来拡張）

## パフォーマンス最適化

### 仮想スクロール
- 大量のコンテンツ（100件以上）の場合、仮想スクロールを検討
- 初期表示は20件、スクロールで追加読み込み（Infinite Scroll）

### 画像最適化
- サムネイル画像の遅延読み込み（Lazy Loading）
- Next.js の `Image` コンポーネント使用
- WebP 形式での配信

### データキャッシング
- localStorage でフィルター状態を保存
- 最近閲覧したコンテンツをキャッシュ

## 将来の拡張計画

### フェーズ2（今後の追加機能）
- コンテンツの評価・レビュー機能
- 学習メモ・ノート機能
- コンテンツのシェア機能
- オフライン対応（PWA）
- コンテンツ推薦アルゴリズム（AI）

### フェーズ3（高度な機能）
- 独自コンテンツのアップロード
- コミュニティコンテンツの共有
- リアルタイム同期（複数デバイス）
- 統合的な学習分析ダッシュボード

## 実装優先順位

### 必須（MVP）
1. ✅ メニュー名変更（Files → コンテンツ）
2. ✅ 基本的なグリッドレイアウト
3. ✅ コンテンツカード表示
4. ✅ タイプ別フィルター
5. ✅ 進捗表示
6. ✅ お気に入り機能

### 推奨（v1.1）
7. リストビュー切り替え
8. 検索機能
9. 難易度・カテゴリーフィルター
10. 統計サマリー表示

### オプション（v1.2+）
11. 詳細モーダル
12. コンテンツ推薦
13. 学習プラン連携強化
14. AIコーチ連携

## 技術実装メモ

### 状態管理
```typescript
// useContent.ts フック
const [contents, setContents] = useState<ContentItem[]>(sampleContents)
const [filters, setFilters] = useState({
  type: 'all',
  difficulty: 'all',
  status: 'all',
  searchQuery: ''
})
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

// フィルタリングロジック
const filteredContents = useMemo(() => {
  return contents.filter(item => {
    if (filters.type !== 'all' && item.type !== filters.type) return false
    if (filters.difficulty !== 'all' && item.difficulty !== filters.difficulty) return false
    if (filters.status !== 'all' && item.status !== filters.status) return false
    if (filters.searchQuery && !item.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false
    }
    return true
  })
}, [contents, filters])
```

### アニメーション
```css
/* カードホバーアニメーション */
.content-card {
  @apply transition-all duration-200;
}

.content-card:hover {
  @apply -translate-y-1 shadow-lg;
}

/* 進捗バーアニメーション */
.progress-bar {
  @apply transition-all duration-500 ease-out;
}
```

## まとめ
本設計書に基づき、「Files」を「コンテンツ」に変更し、学習コンテンツの統合管理機能を実装します。既存のデザインシステムとの整合性を保ちながら、ユーザーが直感的に操作できるUIを提供します。
