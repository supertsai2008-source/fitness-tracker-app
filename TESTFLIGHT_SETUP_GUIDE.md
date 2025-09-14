# 🧪 TestFlight 設定指南

## 🎯 目標
將 VibeCode Weight Loss Tracker 設定到 TestFlight 進行測試

## 📋 必要資訊準備

### App 基本資訊
- **App Name**: VibeCode - Weight Loss Tracker
- **Bundle ID**: com.vibecode.weighttracker
- **Version**: 1.0.0
- **Build Number**: 1
- **Category**: Health & Fitness

### ASC App ID
- **ASC App ID**: 6752516668
- **Project ID**: fe32f084-0b35-49e5-b04d-77992b9284f1

## 🚀 步驟 1: 登入 App Store Connect

1. 前往: https://appstoreconnect.apple.com
2. 使用 Apple ID: yf.68@hotmail.com 登入
3. 選擇 Team: YI FENG TSAI (894GZLJLJ8)

## 🚀 步驟 2: 找到你的 App

1. 點擊 "My Apps"
2. 找到 "VibeCode - Weight Loss Tracker"
3. 點擊進入 app 詳情

## 🚀 步驟 3: 設定基本 App 資訊

### App Information 標籤
填寫以下資訊：
- **Name**: VibeCode - Weight Loss Tracker
- **Subtitle**: Track your weight loss journey
- **Category**: Health & Fitness
- **Content Rights**: Yes

### App Privacy 標籤
根據你的 app 功能選擇：
- **Contact Info**: 如果收集用戶 email/姓名
- **Health & Fitness**: 是 (因為是健康追蹤 app)
- **Identifiers**: 如果使用用戶 ID
- **Usage Data**: 如果收集使用統計
- **Diagnostics**: 如果收集崩潰報告

**Privacy Policy URL**: 如果你有隱私政策頁面

## 🚀 步驟 4: 設定 TestFlight

### 4.1 前往 TestFlight 標籤
1. 點擊 "TestFlight" 標籤
2. 你應該會看到 Build 1.0.0 (1)

### 4.2 設定 Internal Testing
1. 點擊 "Internal Testing"
2. 點擊 "+" 創建新的測試群組
3. 群組名稱: "VibeCode Internal Testers"
4. 添加測試者 email 地址

### 4.3 測試者 Email 清單
準備要添加的測試者 email：
- 你的主要 email
- 團隊成員 email
- 朋友/家人的 email (最多 100 個)

## 🚀 步驟 5: 準備測試資訊

### Internal Testing 設定
- **Test Notes**:
```
VibeCode Weight Loss Tracker - Internal Beta Test

請測試以下功能：
1. 註冊新帳號和登入
2. 添加體重記錄
3. 設定減重目標
4. 查看進度圖表
5. 測試餐食和運動建議
6. 在不同裝置上測試資料同步

如有任何問題或建議，請回報給開發團隊。
```

## 🚀 步驟 6: 啟動測試

### 6.1 啟用 Build
1. 在 TestFlight 中找到你的 build
2. 點擊 "Enable Testing"
3. 選擇 "Internal Testing" 群組
4. 點擊 "Start Testing"

### 6.2 發送邀請
1. 測試者會收到 email 邀請
2. 他們需要下載 TestFlight app
3. 點擊邀請連結安裝你的 app

## 📱 測試者指南

### 如何安裝
1. 下載 TestFlight app (App Store)
2. 點擊邀請 email 中的連結
3. 在 TestFlight 中安裝 VibeCode app
4. 開始測試

### 測試重點
- [ ] App 啟動無崩潰
- [ ] 用戶註冊/登入功能
- [ ] 體重記錄功能
- [ ] 資料同步功能
- [ ] 圖表顯示
- [ ] 目標設定
- [ ] 訂閱功能 (如有)
- [ ] 離線功能
- [ ] 不同裝置相容性

## 🔧 故障排除

### 常見問題
1. **找不到 app**: 確認 Bundle ID 正確
2. **無法安裝**: 檢查測試者 email 是否正確
3. **App 崩潰**: 檢查 build 是否正確上傳

### 檢查 Build 狀態
```bash
npx eas build:list --platform ios
```

## 📊 測試回饋收集

### 回饋管道
- TestFlight 內建回饋功能
- Email: 你的 email 地址
- 測試群組討論

### 回饋重點
- 功能是否正常運作
- 用戶體驗如何
- 是否有 bug
- 效能表現
- 建議改進

## 🎉 完成檢查清單

- [ ] App Store Connect 基本資訊設定完成
- [ ] TestFlight Internal Testing 群組創建
- [ ] 測試者 email 添加完成
- [ ] Build 啟用測試
- [ ] 測試者收到邀請
- [ ] 開始收集測試回饋

## 📞 需要幫助？

如果遇到問題：
1. 檢查 Apple Developer 帳號狀態
2. 確認 Bundle ID 和證書正確
3. 查看 EAS 文檔: https://docs.expo.dev/submit/introduction/
4. 檢查 App Store Connect 幫助: https://help.apple.com/app-store-connect/

---

**準備好了嗎？現在就去 App Store Connect 開始設定吧！** 🚀
