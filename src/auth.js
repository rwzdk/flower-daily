/* ---- 登录态：全局响应式认证状态 ---- */
import { reactive } from "vue";
import { api, getToken, setToken, clearToken } from "./api";

const USER_KEY = "fd-user-cache";

function cacheUser(u) {
  try {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  } catch { /* 忽略 */ }
}

export const auth = reactive({
  ready: false,
  user: null,       // { id, email, nickname, avatar, bio, isAdmin }
  lastLogin: null,  // { ip, location, created_at }
});

// 先用本地缓存快速点亮界面，再向后端确认
try {
  const c = localStorage.getItem(USER_KEY);
  if (c && getToken()) auth.user = JSON.parse(c);
} catch { /* 缓存损坏则忽略 */ }

export async function bootAuth() {
  if (!getToken()) { auth.user = null; auth.ready = true; return; }
  try {
    const r = await api("/api/auth/me");
    auth.user = r.user;
    auth.lastLogin = r.lastLogin || null;
    cacheUser(r.user);
  } catch (e) {
    if (e.code === "unauthorized") { clearToken(); auth.user = null; }
  }
  auth.ready = true;
}

export async function sendCode(email, purpose) {
  return api("/api/auth/code", { method: "POST", body: { email, purpose } });
}

async function adoptSession(r) {
  setToken(r.token);
  auth.user = r.user;
  auth.lastLogin = r.lastLogin || null;
  cacheUser(r.user);
}

export async function doRegister({ email, code, password, nickname }) {
  const r = await api("/api/auth/register", { method: "POST", body: { email, code, password, nickname } });
  await adoptSession(r);
  return r;
}

export async function doLogin(email, password) {
  const r = await api("/api/auth/login", { method: "POST", body: { email, password } });
  await adoptSession(r);
  return r;
}

export async function doResetPassword({ email, code, newPassword }) {
  return api("/api/auth/password", { method: "POST", body: { email, code, newPassword } });
}

export async function saveProfile(patch) {
  const r = await api("/api/user/profile", { method: "PUT", body: patch });
  auth.user = r.user;
  cacheUser(r.user);
  return r.user;
}

export async function doLogout() {
  try { await api("/api/auth/logout", { method: "POST" }); } catch { /* 离线也能退 */ }
  clearToken();
  auth.user = null;
  cacheUser(null);
}

export async function ping() {
  try { await api("/api/presence", { method: "POST" }); } catch { /* 心跳失败不打扰 */ }
}
