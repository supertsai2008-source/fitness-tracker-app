import Constants from "expo-constants";

export function isAppleAvailable() {
  const env: any = Constants?.expoConfig?.extra || {};
  return !!(env.APPLE_SERVICE_ID && env.APPLE_REDIRECT_URI && env.APPLE_TEAM_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY);
}

export async function signInWithApple() {
  if (!isAppleAvailable()) throw new Error("Apple 登入尚未設定（缺少 Service ID 或密鑰），目前暫不提供");
  // NOTE: Implementing full Apple web OAuth requires generating a client secret (JWT) — typically on a backend.
  // In this environment, we avoid leaking secrets. If you provide credentials, we can wire a secure flow.
  throw new Error("Apple 登入需伺服器端 client secret，請提供設定後再啟用");
}
