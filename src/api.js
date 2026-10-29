/* ---- 后端 API 访问封装（Cloudflare Worker） ----
   生产环境：把 config.js 里的 apiBase 改成你的 Worker 地址，
   或在浏览器控制台执行 localStorage.setItem("fd-api-base", "https://xxx.workers.dev")
   开发环境：留空即可，vite 已把 /api 代理到 wrangler dev（127.0.0.1:8787）。 */
import { CONFIG } from "./config";

const TOKEN_KEY = "fd-token";

export function apiBase() {
  return (localStorage.getItem("fd-api-base") || CONFIG.apiBase || "").replace(/\/$/, "");
}
export function getToken() { return localStorage.getItem(TOKEN_KEY) || ""; }
export function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

const ERROR_TEXT = {
  invalid_input: "提交的内容格式不对",
  invalid_email: "邮箱格式看起来不对哦",
  invalid_code: "验证码不对或已过期",
  invalid_credentials: "邮箱或密码不对",
  invalid_nickname: "昵称不能为空",
  email_taken: "这个邮箱已经注册过啦，直接登录试试",
  no_such_email: "该邮箱尚未注册",
  code_wait: "发送太频繁啦，一分钟后再试",
  mail_failed: "验证码邮件发送失败，请稍后再试",
  mail_not_configured: "邮箱服务未配置（管理员操作）",
  state_too_large: "数据太大，云端装不下了",
  avatar_too_large: "头像图片太大，请换一张小一点的",
  chat_slow_down: "说话太快啦，歇两秒",
  unauthorized: "登录已过期，请重新登录",
  forbidden: "没有权限",
  not_found: "接口不存在",
  cloud_unavailable: "云端服务暂不可用",
  server_error: "云端开小差了，稍后再试",
};

export async function api(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(apiBase() + path, {
      method,
      headers: {
        "content-type": "application/json",
        ...(getToken() ? { authorization: `Bearer ${getToken()}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw Object.assign(new Error("网络不通，检查一下连接或 API 地址"), { code: "network" });
  }
  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch { /* 空响应 */ }
  if (!res.ok) {
    const code = data?.error || "server_error";
    const err = new Error(ERROR_TEXT[code] || data?.error || "请求失败");
    err.code = code;
    err.status = res.status;
    if (code === "conflict") err.server = { state: data.state, revision: data.revision, updatedAt: data.updatedAt };
    throw err;
  }
  return data;
}
