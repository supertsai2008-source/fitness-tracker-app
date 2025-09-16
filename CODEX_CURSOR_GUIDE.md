# Codex 與 Cursor 使用指南

## 🎉 恭喜！您已成功連接 Codex 與 Cursor

現在您可以充分利用 AI 輔助開發來提升您的 React Native 應用程式開發效率。

## 📋 當前項目概況

您的項目是一個完整的 **VibeCode - Weight Loss Tracker** 應用程式，包含：

- **框架**: React Native + Expo
- **版本**: Expo SDK 53
- **主要功能**: 體重追蹤、食物分析、運動計劃
- **狀態管理**: Zustand
- **UI 框架**: NativeWind (Tailwind CSS for React Native)
- **數據庫**: InstantDB
- **AI 集成**: OpenAI, Anthropic, Grok

## 🚀 如何使用 Codex 與 Cursor

### 1. 基本對話功能
- 直接在聊天框中輸入您的問題或需求
- 例如：「幫我添加一個新的體重記錄功能」
- 例如：「修復這個錯誤：[貼上錯誤訊息]」

### 2. 代碼生成與修改
- 描述您想要的功能，AI 會生成相應的代碼
- 可以要求重構現有代碼
- 可以要求添加新的組件或功能

### 3. 項目特定功能
由於您的項目已經有完整的結構，您可以：

#### 🏗️ 添加新功能
```
"幫我在主頁面添加一個快速記錄體重的按鈕"
"創建一個新的食物搜索組件"
"添加運動計劃建議功能"
```

#### 🐛 調試與修復
```
"這個組件有錯誤，幫我修復"
"優化這個函數的性能"
"修復 TypeScript 類型錯誤"
```

#### 📱 UI/UX 改進
```
"讓這個頁面更美觀"
"添加動畫效果"
"改進用戶體驗"
```

### 4. 項目結構導航
您的項目包含以下主要目錄：

- `src/components/` - React 組件
- `src/screens/` - 應用程式頁面
- `src/api/` - API 集成
- `src/state/` - 狀態管理
- `src/types/` - TypeScript 類型定義

## 💡 實用技巧

### 1. 具體描述需求
❌ 不好的例子：「讓應用程式更好」
✅ 好的例子：「在首頁添加一個顯示今日卡路里攝入的圓形進度條」

### 2. 提供上下文
- 告訴 AI 您想要修改哪個文件
- 提供相關的代碼片段
- 說明預期的行為

### 3. 逐步開發
- 先實現基本功能
- 然後添加樣式和動畫
- 最後進行優化和測試

## 🛠️ 常用命令

### 啟動開發服務器
```bash
npm start
# 或
expo start
```

### 運行在特定平台
```bash
npm run ios      # iOS 模擬器
npm run android  # Android 模擬器
npm run web      # Web 瀏覽器
```

### 構建應用程式
```bash
eas build --platform ios
eas build --platform android
```

## 📚 學習資源

1. **React Native 文檔**: https://reactnative.dev/
2. **Expo 文檔**: https://docs.expo.dev/
3. **NativeWind 文檔**: https://www.nativewind.dev/
4. **InstantDB 文檔**: https://instantdb.com/docs

## 🎯 下一步建議

1. **熟悉項目結構** - 瀏覽 `src/` 目錄了解現有功能
2. **運行應用程式** - 使用 `npm start` 啟動開發服務器
3. **嘗試修改** - 從簡單的 UI 調整開始
4. **添加功能** - 逐步添加新功能

## 💬 開始使用

現在就開始與 AI 對話吧！您可以：

1. 問任何關於代碼的問題
2. 請求添加新功能
3. 尋求代碼優化建議
4. 獲取最佳實踐指導

**記住**: AI 是您的編程夥伴，隨時準備幫助您解決問題和實現想法！

---

*祝您編程愉快！🚀*

