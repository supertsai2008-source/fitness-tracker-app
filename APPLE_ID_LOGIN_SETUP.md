# 🍎 Apple ID 登入設置指南

## 🎯 目標
設置 Apple ID 登入，用於提交應用程式到 App Store。

## 📋 當前狀態檢查

### ✅ 已完成的配置
- ✅ EAS 項目已設置 (Project ID: `fe32f084-0b35-49e5-b04d-77992b9284f1`)
- ✅ Bundle ID: `com.vibecode.weighttracker`
- ✅ iOS 構建配置已準備
- ✅ App Store Connect 設置指南已準備

## 🚀 步驟 1: Apple Developer 帳戶設置

### 1.1 檢查 Apple Developer 帳戶狀態
```bash
# 檢查當前登入狀態
npx eas whoami

# 檢查 Apple Developer 帳戶
npx eas credentials
```

### 1.2 登入 Apple Developer 帳戶
```bash
# 登入 Apple Developer 帳戶
npx eas credentials --platform ios
```

## 🔐 步驟 2: Apple ID 認證設置

### 2.1 使用 Apple ID 登入
```bash
# 方法 1: 使用 Apple ID 登入
npx eas login --apple-id

# 方法 2: 使用 Apple ID 和密碼
npx eas login --apple-id your-apple-id@example.com
```

### 2.2 設置 App Store Connect API Key
```bash
# 生成 App Store Connect API Key
npx eas credentials --platform ios --clear-credentials
```

## 📱 步驟 3: App Store Connect 設置

### 3.1 登入 App Store Connect
1. 前往：https://appstoreconnect.apple.com
2. 使用您的 Apple ID 登入
3. 確認您有開發者權限

### 3.2 創建應用程式
1. 點擊 "My Apps"
2. 點擊 "+" 創建新應用程式
3. 填寫以下資訊：
   - **Platform**: iOS
   - **Name**: VibeCode - Weight Loss Tracker
   - **Primary Language**: English
   - **Bundle ID**: com.vibecode.weighttracker
   - **SKU**: vibecode-weight-tracker-001

## 🛠️ 步驟 4: EAS 配置更新

### 4.1 更新 eas.json 配置
```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "autoIncrement": "buildNumber"
      },
      "android": {
        "autoIncrement": "versionCode"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "6752516668",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### 4.2 設置環境變數
```bash
# 設置 Apple ID
export APPLE_ID="your-apple-id@example.com"

# 設置 App Store Connect API Key
export APP_STORE_CONNECT_API_KEY="your-api-key"

# 設置 Team ID
export APPLE_TEAM_ID="YOUR_TEAM_ID"
```

## 🔑 步驟 5: 認證憑證設置

### 5.1 生成認證憑證
```bash
# 生成 iOS 認證憑證
npx eas credentials --platform ios

# 選擇以下選項：
# 1. Build credentials
# 2. Distribution certificate
# 3. Provisioning profile
```

### 5.2 設置自動認證
```bash
# 啟用自動認證
npx eas credentials --platform ios --auto
```

## 📤 步驟 6: 提交應用程式

### 6.1 構建生產版本
```bash
# 構建 iOS 生產版本
npx eas build --platform ios --profile production
```

### 6.2 提交到 App Store
```bash
# 提交到 App Store
npx eas submit --platform ios

# 或者提交特定構建
npx eas submit --platform ios --id BUILD_ID
```

## 🔍 步驟 7: 驗證設置

### 7.1 檢查登入狀態
```bash
# 檢查 EAS 登入狀態
npx eas whoami

# 檢查 Apple Developer 帳戶
npx eas credentials --platform ios --list
```

### 7.2 測試提交流程
```bash
# 測試提交（不實際上傳）
npx eas submit --platform ios --dry-run
```

## 🚨 常見問題解決

### 問題 1: Apple ID 登入失敗
```bash
# 清除認證快取
npx eas logout
npx eas login --apple-id

# 或使用瀏覽器登入
npx eas login --web
```

### 問題 2: 認證憑證過期
```bash
# 重新生成認證憑證
npx eas credentials --platform ios --clear-credentials
npx eas credentials --platform ios
```

### 問題 3: Bundle ID 不匹配
```bash
# 檢查 Bundle ID 設置
npx eas build:configure

# 更新 app.json 中的 Bundle ID
```

## 📋 檢查清單

### ✅ Apple ID 設置
- [ ] Apple Developer 帳戶已啟用
- [ ] Apple ID 已登入 EAS
- [ ] App Store Connect 存取權限已確認
- [ ] Team ID 已設置

### ✅ 認證憑證
- [ ] Distribution certificate 已生成
- [ ] Provisioning profile 已設置
- [ ] 認證憑證未過期

### ✅ 應用程式設置
- [ ] Bundle ID 已註冊
- [ ] App Store Connect 應用程式已創建
- [ ] 應用程式資訊已填寫

### ✅ 提交準備
- [ ] 生產版本已構建
- [ ] 提交命令已測試
- [ ] 所有必要資訊已準備

## 🎯 快速開始命令

### 一次性設置
```bash
# 1. 登入 Apple ID
npx eas login --apple-id

# 2. 設置認證憑證
npx eas credentials --platform ios

# 3. 構建生產版本
npx eas build --platform ios --profile production

# 4. 提交到 App Store
npx eas submit --platform ios
```

## 📞 需要幫助？

如果遇到問題，可以：

1. **檢查 EAS 文檔**: https://docs.expo.dev/submit/introduction/
2. **查看 Apple Developer 文檔**: https://developer.apple.com/documentation/
3. **聯繫支援**: 在 EAS 或 Apple Developer 論壇尋求幫助

## 🎉 完成！

設置完成後，您就可以：
- ✅ 使用 Apple ID 登入
- ✅ 構建 iOS 應用程式
- ✅ 提交到 App Store
- ✅ 管理應用程式版本

---

**下一步**: 運行 `npx eas login --apple-id` 開始設置！

