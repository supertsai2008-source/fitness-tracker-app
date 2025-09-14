# 💰 RevenueCat 設定指南

## 🎯 概述
你的 VibeCode Weight Loss Tracker 已經準備好 RevenueCat 整合，現在需要完成設定。

## ✅ 已完成的設定
- ✅ RevenueCat SDK 已安裝 (`react-native-purchases`)
- ✅ 整合服務已建立 (`src/api/revenuecat-integration.ts`)
- ✅ InstantDB 同步已配置
- ✅ 資料模型已定義

## 🚀 需要完成的設定

### 1. 創建 RevenueCat 帳號
1. 前往 https://app.revenuecat.com/
2. 註冊新帳號或登入
3. 創建新專案：VibeCode Weight Loss Tracker

### 2. 設定 App
在 RevenueCat 儀表板中：
1. 點擊 "Add App"
2. 選擇平台：iOS
3. 輸入 Bundle ID: `com.vibecode.weighttracker`
4. 輸入 App Name: VibeCode - Weight Loss Tracker

### 3. 獲取 API Keys
1. 在 App 設定中找到 "API Keys"
2. 複製 iOS API Key
3. 更新 `src/api/revenuecat-config.ts` 中的 API key

### 4. 設定產品 (Products)
在 App Store Connect 中創建訂閱產品：

#### 月費訂閱
- **Product ID**: `vibecode_premium_monthly`
- **Price**: 你的定價 (例如 $4.99/月)
- **Duration**: 1 Month

#### 年費訂閱
- **Product ID**: `vibecode_premium_yearly`
- **Price**: 你的定價 (例如 $39.99/年)
- **Duration**: 1 Year

### 5. 在 RevenueCat 中設定 Entitlements
1. 前往 "Entitlements" 標籤
2. 創建新的 Entitlement：
   - **Identifier**: `premium`
   - **Description**: Premium features access

### 6. 設定 Offerings
1. 前往 "Offerings" 標籤
2. 創建新的 Offering：
   - **Identifier**: `default`
   - **Description**: Default subscription offering
3. 添加你的產品到這個 offering

## 🔧 更新設定檔案

### 更新 API Keys
編輯 `src/api/revenuecat-config.ts`：

```typescript
export const REVENUECAT_CONFIG = {
  ios: {
    apiKey: 'YOUR_ACTUAL_IOS_API_KEY_HERE', // 替換為你的實際 API key
  },
  android: {
    apiKey: 'YOUR_ACTUAL_ANDROID_API_KEY_HERE', // 替換為你的實際 API key
  },
};
```

### 更新產品 ID
根據你在 App Store Connect 中設定的產品 ID 更新：

```typescript
export const PRODUCT_IDS = {
  monthly: 'vibecode_premium_monthly', // 你的月費產品 ID
  yearly: 'vibecode_premium_yearly',   // 你的年費產品 ID
  weekly: 'vibecode_premium_weekly',   // 你的週費產品 ID (可選)
} as const;
```

## 📱 在 App 中初始化 RevenueCat

在你的主要 App 組件中添加初始化：

```typescript
import { initializeRevenueCat } from './src/api/revenuecat-config';
import { syncCurrentSubscriptionStatus } from './src/api/revenuecat-integration';

// 在 App 啟動時
useEffect(() => {
  const initRevenueCat = async () => {
    await initializeRevenueCat();
    await syncCurrentSubscriptionStatus();
  };
  
  initRevenueCat();
}, []);
```

## 🧪 TestFlight 測試

### 設定沙盒測試
1. 在 App Store Connect 中創建沙盒測試者
2. 使用沙盒帳號測試購買流程
3. 確認訂閱狀態正確同步到 InstantDB

### 測試流程
1. 安裝 TestFlight 版本
2. 嘗試購買訂閱
3. 檢查 InstantDB 中的 `entitlements` 表格
4. 測試訂閱恢復功能
5. 測試取消訂閱

## 🔍 檢查清單

### RevenueCat 設定
- [ ] RevenueCat 帳號已創建
- [ ] App 已添加到 RevenueCat
- [ ] API Keys 已獲取並更新
- [ ] 產品已在 App Store Connect 中創建
- [ ] Entitlements 已設定
- [ ] Offerings 已配置

### App 設定
- [ ] API Keys 已更新到 `revenuecat-config.ts`
- [ ] 產品 ID 已更新
- [ ] RevenueCat 已在 App 中初始化
- [ ] 訂閱狀態同步已測試

### 測試
- [ ] 沙盒購買測試成功
- [ ] 訂閱狀態正確顯示
- [ ] InstantDB 同步正常
- [ ] 訂閱恢復功能正常
- [ ] TestFlight 測試完成

## 🚨 重要注意事項

### 生產環境
- 確保使用正確的 API Keys
- 測試所有購買流程
- 設定適當的錯誤處理

### 隱私政策
- 如果收集用戶資料，需要更新隱私政策
- 在 App Store Connect 中提供隱私政策 URL

### 審核準備
- 確保訂閱功能完整
- 提供測試帳號給 Apple 審核
- 準備訂閱功能的說明文件

## 📞 需要幫助？

### RevenueCat 資源
- [RevenueCat 文檔](https://docs.revenuecat.com/)
- [React Native 整合指南](https://docs.revenuecat.com/docs/react-native)
- [App Store Connect 設定](https://docs.revenuecat.com/docs/app-store-connect)

### 常見問題
1. **API Key 無效**: 檢查是否複製正確
2. **產品 ID 不匹配**: 確保 App Store Connect 和 RevenueCat 中的 ID 一致
3. **沙盒測試失敗**: 確保使用沙盒測試者帳號

---

**完成這些設定後，你的 RevenueCat 整合就準備好了！** 🎉
