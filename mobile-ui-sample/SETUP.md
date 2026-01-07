# 📱 モバイルUI サンプル - セットアップガイド

## 🚀 クイックスタート

このUIサンプルは、既存のcapy-uiプロジェクトと統合して使用します。

### オプション1: 既存プロジェクトで表示（推奨）

capy-uiプロジェクトは既にNext.js、TypeScript、Tailwind CSSがセットアップされています。

#### 新しいページとして追加

1. **新しいルートを作成**
   ```bash
   cd /Users/naoyakusunoki/Desktop/dev/capy-ui
   mkdir -p src/app/mobile-demo
   ```

2. **mobile-ui-sampleのコンポーネントをインポート**
   ```typescript
   // src/app/mobile-demo/page.tsx
   'use client'

   import dynamic from 'next/dynamic'

   const App = dynamic(() => import('../../../mobile-ui-sample/src/App'), {
     ssr: false
   })

   export default function MobileDemoPage() {
     return <App />
   }
   ```

3. **アクセス**
   ```
   http://localhost:3001/mobile-demo
   ```

### オプション2: スタンドアロンプロジェクトとして使用

完全に独立したプロジェクトとして実行する場合：

1. **package.jsonを作成**
   ```json
   {
     "name": "mobile-ui-sample",
     "version": "1.0.0",
     "scripts": {
       "dev": "vite",
       "build": "tsc && vite build",
       "preview": "vite preview"
     },
     "dependencies": {
       "react": "^18.2.0",
       "react-dom": "^18.2.0",
       "lucide-react": "^0.263.1"
     },
     "devDependencies": {
       "@types/react": "^18.2.0",
       "@types/react-dom": "^18.2.0",
       "@vitejs/plugin-react": "^4.0.0",
       "typescript": "^5.0.0",
       "vite": "^4.4.0",
       "tailwindcss": "^3.3.0",
       "autoprefixer": "^10.4.0",
       "postcss": "^8.4.0"
     }
   }
   ```

2. **依存関係をインストール**
   ```bash
   cd mobile-ui-sample
   npm install
   ```

3. **Vite設定（vite.config.ts）**
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     server: {
       port: 3002
     }
   })
   ```

4. **Tailwind設定（tailwind.config.js）**
   ```javascript
   module.exports = {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

5. **main.tsxを作成**
   ```typescript
   import React from 'react'
   import ReactDOM from 'react-dom/client'
   import App from './App'
   import './index.css'

   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <App />
     </React.StrictMode>,
   )
   ```

6. **index.cssを作成**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

7. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

## 📱 モバイルデバイスでのテスト

### Chrome DevTools
1. F12でDevToolsを開く
2. デバイスツールバーを有効化（Ctrl+Shift+M）
3. iPhone 14 Pro や Samsung Galaxy S21 などを選択

### 実機テスト
1. 同じネットワークに接続
2. PCのローカルIPアドレスを確認
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```
3. モバイルブラウザで `http://[YOUR_IP]:3001/mobile-demo` にアクセス

### Safari (iOS)
- 開発者メニューを有効化
- リモートデバッグで確認

## 🎨 カスタマイズ

### 色の変更
`src/screens/*.tsx` 内のグラデーションクラスを編集：
```tsx
// Green → Blue グラデーション
className="bg-gradient-to-r from-green-400 to-blue-500"

// Purple → Pink グラデーション
className="bg-gradient-to-r from-purple-400 to-pink-500"
```

### アイコンの変更
Lucide Reactの他のアイコンを使用：
```tsx
import { Heart, Star, Zap } from 'lucide-react'
```

### レイアウト調整
Tailwindのユーティリティクラスで調整：
```tsx
// 余白の調整
className="p-6"  // padding: 1.5rem

// 角丸の調整
className="rounded-3xl"  // border-radius: 1.5rem
```

## 🔧 トラブルシューティング

### Tailwindのスタイルが効かない
- `tailwind.config.js` でコンテンツパスが正しいか確認
- 開発サーバーを再起動

### アイコンが表示されない
- `lucide-react` がインストールされているか確認
  ```bash
  npm install lucide-react
  ```

### TypeScriptエラー
- `tsconfig.json` で `jsx: "react-jsx"` が設定されているか確認

## 📚 参考資料

- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [Lucide React アイコン](https://lucide.dev/)
- [Next.js ドキュメント](https://nextjs.org/docs)

## 💡 Tips

### パフォーマンス最適化
- 画像の最適化
- コンポーネントのメモ化（React.memo）
- 仮想スクロールの実装

### UX改善
- スケルトンローディング
- エラーバウンダリ
- オフライン対応（PWA）

---

**Happy Coding! 🚀**
