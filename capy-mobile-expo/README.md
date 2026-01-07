# 📱 Capy Mobile - Expo React Native版

既存のWebモバイルUIをExpo React Nativeで再実装したデモプロジェクトです。

## 🎯 目的

- Expo + React NativeでのUIを体験
- Web版モバイルUIと比較
- ネイティブアプリの操作感を確認

## 🚀 起動方法

### 1. Web版で確認（最も簡単）

```bash
cd capy-mobile-expo
npx expo start --web
```

ブラウザで `http://localhost:8081` が自動的に開きます。

### 2. iOS シミュレータで確認（Macのみ）

```bash
npx expo start --ios
```

※ Xcodeのインストールが必要

### 3. Android エミュレータで確認

```bash
npx expo start --android
```

※ Android Studioのインストールが必要

### 4. 実機で確認

```bash
npx expo start
```

1. スマホに「Expo Go」アプリをインストール
2. 表示されるQRコードをスキャン
3. アプリが起動

## 📦 含まれる機能

- ✅ グラデーションカード
- ✅ 統計カード（3つ）
- ✅ クイックアクション
- ✅ タップアニメーション（Pressable）
- ✅ iOS/Android/Web全対応

## 🎨 使用技術

- **Expo SDK 54**
- **React Native**
- **TypeScript**
- **React Native Reanimated** (アニメーション)
- **Expo Linear Gradient** (グラデーション)
- **Expo Vector Icons** (アイコン)

## 📊 Web版との比較ポイント

### タッチ反応
- タップしたときの反応速度を確認
- `Pressable`コンポーネントのフィードバック

### スクロール
- スクロールの滑らかさ
- 慣性スクロールの自然さ

### 見た目
- デザインの再現度
- グラデーション、影の品質

## 🔄 Next.js版との違い

| 項目 | Next.js版 | Expo版 |
|------|-----------|--------|
| スタイリング | Tailwind CSS | StyleSheet |
| アニメーション | Framer Motion | React Native Reanimated |
| アイコン | Lucide React | Expo Vector Icons |
| レイアウト | div, className | View, style |

## 📝 次のステップ

もし気に入ったら：
1. 他の画面も実装（AI Chat、Kanban等）
2. ボトムナビゲーションを追加
3. React Native Webで完全統合

## 💡 Tips

### Web版でモバイルビューにする
ブラウザの開発者ツール（F12）→ デバイスツールバー（Ctrl+Shift+M）で、iPhone/Androidとして表示できます。

### Hot Reload
コードを編集すると自動的に反映されます。便利！

---

**作成日**: 2025年11月22日
**目的**: Web版とExpo版の比較検証
