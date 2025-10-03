# 出席管理Webアプリ

個人の授業出席を管理するWebアプリです。週単位の時間割形式で授業を確認し、各授業ごとに出席・欠席を記録できます。

## 機能

- 📅 週次時間割表示（月曜日〜土曜日、1〜6限）
- ✅ 出席・欠席記録（緑ボタン：出席、赤ボタン：欠席）
- 📊 授業ごとの出席回数・欠席回数表示
- ➕ 空きコマへの授業追加
- 🗑️ 授業削除（確認ダイアログ付き）
- 📱 スマホ・PC対応のレスポンシブデザイン
- ☁️ Firebase Firestoreによるクラウド同期

## 技術スタック

- **フロントエンド**: React + TypeScript + Tailwind CSS
- **バックエンド**: Firebase Firestore
- **アイコン**: Lucide React

## セットアップ

### 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd attendance-manager
npm install
```

### 2. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Firestore Databaseを有効化
3. `src/firebase.ts`の設定を更新：

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Firestoreルール設定

Firestoreのセキュリティルールを以下のように設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // 開発用（本番では適切な認証を設定）
    }
  }
}
```

### 4. アプリの起動

```bash
npm start
```

ブラウザで `http://localhost:3000` を開いてアプリを確認できます。

## 使用方法

### 授業の追加
1. 空いている時間割のコマをクリック
2. 授業名を入力して「追加」ボタンをクリック

### 出席記録
1. 授業セル内の「出席」ボタン（緑）または「欠席」ボタン（赤）をクリック
2. その日の出席状況が記録されます

### 授業詳細の確認
1. 授業名をクリック
2. 出席回数・欠席回数が表示されます
3. 右上のゴミ箱アイコンで授業を削除できます

### 授業の削除
1. 授業詳細モーダルでゴミ箱アイコンをクリック
2. 確認ダイアログで「はい」を選択

## デプロイ

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## ライセンス

MIT License