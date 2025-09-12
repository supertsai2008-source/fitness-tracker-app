import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import { useAccountStore } from "../../state/accountStore";
import { saveAllSnapshots, loadAllSnapshots } from "../../state/multiTenant";

const env: any = Constants?.expoConfig?.extra || {};

export async function signInWithGoogle() {
  const clientId = env?.EXPO_GOOGLE_IOS_CLIENT_ID || env?.EXPO_GOOGLE_ANDROID_CLIENT_ID || env?.EXPO_GOOGLE_WEB_CLIENT_ID;
  if (!clientId) throw new Error("Google OAuth 尚未設定，請在 .env 提供 client ids");

  const redirectUri = AuthSession.makeRedirectUri();
  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  } as const;

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    responseType: AuthSession.ResponseType.Token,
    scopes: ["openid", "email", "profile"],
    extraParams: { prompt: "select_account" },
  });
  const result = await request.promptAsync(discovery);
  if (result.type !== "success") throw new Error("Google 登入已取消");
  const accessToken = (result as any).params?.access_token as string | undefined;
  if (!accessToken) throw new Error("未取得 access_token");

  // Fetch user profile
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = await profileRes.json();
  const sub = profile?.sub || "unknown";
  const email = profile?.email;
  const name = profile?.name;
  const picture = profile?.picture;
  const accountId = `google:${sub}`;

  const { currentAccountId, upsertAccount, signInAs } = useAccountStore.getState();
  if (currentAccountId) await saveAllSnapshots(currentAccountId);
  upsertAccount({ id: accountId, provider: "google", email, displayName: name, avatarUrl: picture, createdAt: new Date().toISOString() });
  await loadAllSnapshots(accountId);
  signInAs(accountId);
}
