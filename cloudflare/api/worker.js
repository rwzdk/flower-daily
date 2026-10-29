// 花海生活报 · 云端 API（Cloudflare Worker + D1）
// 能力：QQ 邮箱验证码注册 / 密码登录 / 找回密码 / 用户资料 / 登录地点记录
//      用户数据云端同步 / 对话室（反馈） / 管理员统计（编辑部看板）
// 结构参考 study-room 的 study-cloud 模块。
import { sendVerificationEmail } from "./smtp.js";

const PBKDF2_ITERATIONS = 100_000;
const SESSION_DAYS = 90;
const CODE_TTL_MS = 10 * 60_000;       // 验证码 10 分钟有效
const CODE_SEND_GAP_MS = 60_000;       // 同一邮箱 60 秒内只能发一次
const MAX_STATE_BYTES = 512 * 1024;
const MAX_AVATAR_BYTES = 64 * 1024;    // 头像 base64 上限
const MAX_CONTENT_CHARS = 500;
const ONLINE_WINDOW_MS = 5 * 60_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 128;
const NICKNAME_MAX = 24;

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-max-age": "86400",
};
const JSON_HEADERS = {
  ...CORS_HEADERS,
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};

const json = (value, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: JSON_HEADERS });

const encoder = new TextEncoder();

function toBase64(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}
function fromBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function toBase64Url(bytes) {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

async function deriveHash(password, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: fromBase64(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return toBase64(new Uint8Array(bits));
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sha256Hex(text) {
  const bits = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function validEmail(email) {
  return typeof email === "string" && email.length <= 64 && EMAIL_RE.test(email);
}
function validPassword(p) {
  return typeof p === "string" && p.length >= PASSWORD_MIN && p.length <= PASSWORD_MAX;
}
function cleanNickname(v) {
  const s = (typeof v === "string" ? v : "").trim();
  return s && encoder.encode(s).length <= NICKNAME_MAX * 4 ? s : "";
}
function cleanText(v, maxBytes) {
  const s = (typeof v === "string" ? v : "").replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return encoder.encode(s).length <= maxBytes ? s : "";
}
function cleanAvatar(v) {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return "";
  if (s.startsWith("data:image/") && s.length <= MAX_AVATAR_BYTES) return s;
  return cleanText(s, 32); // emoji 或短字符
}

async function readBody(request) {
  const type = (request.headers.get("content-type") || "").toLowerCase();
  if (!type.includes("application/json")) return null;
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

/* ---------- 登录地点：优先 Cloudflare 边缘自带的地理信息 ---------- */
function locate(request) {
  const cf = request.cf || {};
  const parts = [cf.city, cf.region, cf.country].filter((x) => typeof x === "string" && x);
  const location = parts.length ? parts.join(" · ") : "未知";
  const ip = request.headers.get("cf-connecting-ip") || "";
  return { ip, location };
}

function publicUser(env, row) {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    avatar: row.avatar || "",
    bio: row.bio || "",
    isAdmin: Number(row.is_admin) === 1 || adminEmails(env).has(String(row.email || "").toLowerCase()),
  };
}
function adminEmails(env) {
  return new Set(
    String(env.ADMIN_EMAIL || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function createSession(env, userId, request) {
  const token = toBase64Url(randomBytes(32));
  const now = new Date();
  const { ip, location } = locate(request);
  const ua = (request.headers.get("user-agent") || "").slice(0, 200);
  await env.DB.prepare(
    "INSERT INTO fd_sessions (token, user_id, created_at, expires_at, last_seen_at, user_agent, ip, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(token, userId, now.toISOString(), new Date(now.getTime() + SESSION_DAYS * 86_400_000).toISOString(), now.toISOString(), ua, ip, location)
    .run();
  return { token, expiresAt: new Date(now.getTime() + SESSION_DAYS * 86_400_000).toISOString() };
}

async function authenticate(env, request) {
  const header = request.headers.get("authorization") || "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  const row = await env.DB.prepare(
    "SELECT s.user_id, s.token, s.expires_at, u.email, u.nickname, u.avatar, u.bio, u.is_admin FROM fd_sessions s JOIN fd_users u ON u.id = s.user_id WHERE s.token = ?",
  )
    .bind(token)
    .first();
  if (!row || Date.parse(row.expires_at) < Date.now()) return null;
  return {
    userId: row.user_id,
    token: row.token,
    isAdmin: Number(row.is_admin) === 1 || adminEmails(env).has(String(row.email).toLowerCase()),
    user: { id: row.user_id, email: row.email, nickname: row.nickname, avatar: row.avatar || "", bio: row.bio || "", isAdmin: false },
  };
}

async function logLogin(env, userId, request) {
  const { ip, location } = locate(request);
  const ua = (request.headers.get("user-agent") || "").slice(0, 200);
  await env.DB.prepare(
    "INSERT INTO fd_login_logs (id, user_id, ip, location, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(crypto.randomUUID(), userId, ip, location, ua, new Date().toISOString())
    .run();
  return { ip, location };
}

/* ---------------- 验证码 ---------------- */
async function handleSendCode(request, env) {
  const body = await readBody(request);
  if (!body || !validEmail(body.email)) return json({ error: "invalid_email" }, 400);
  const purpose = body.purpose === "reset" ? "reset" : "register";
  const email = body.email.trim().toLowerCase();
  const nowIso = new Date().toISOString();

  if (purpose === "register") {
    const exists = await env.DB.prepare("SELECT id FROM fd_users WHERE email = ?").bind(email).first();
    if (exists) return json({ error: "email_taken" }, 409);
  } else {
    const exists = await env.DB.prepare("SELECT id FROM fd_users WHERE email = ?").bind(email).first();
    if (!exists) return json({ error: "no_such_email" }, 404);
  }
  // 发送频率限制
  const recent = await env.DB.prepare(
    "SELECT created_at FROM fd_email_codes WHERE email = ? AND created_at >= ?",
  )
    .bind(email, new Date(Date.now() - CODE_SEND_GAP_MS).toISOString())
    .first();
  if (recent) return json({ error: "code_wait" }, 429);

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await env.DB.prepare(
    "INSERT INTO fd_email_codes (email, purpose, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(email, purpose, await sha256Hex(code), new Date(Date.now() + CODE_TTL_MS).toISOString(), nowIso)
    .run();

  try {
    await sendVerificationEmail(env, email, code, purpose);
  } catch (err) {
    return json({ error: "mail_failed", stage: String(err?.message || err).slice(0, 80) }, 502);
  }
  return json({ ok: true });
}

/** 校验验证码；consume=true 时标记已用。 */
async function verifyCode(env, email, purpose, code, consume) {
  const rows = await env.DB.prepare(
    "SELECT rowid, code_hash, expires_at, used_at FROM fd_email_codes WHERE email = ? AND purpose = ? AND expires_at >= ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 5",
  )
    .bind(email, purpose, new Date().toISOString())
    .all();
  const hash = await sha256Hex(String(code));
  const hit = (rows.results || []).find((r) => safeEqual(hash, r.code_hash));
  if (!hit) return false;
  if (consume) {
    await env.DB.prepare("UPDATE fd_email_codes SET used_at = ? WHERE rowid = ?").bind(new Date().toISOString(), hit.rowid).run();
  }
  return true;
}

/* ---------------- 注册 / 登录 / 密码 ---------------- */
async function handleRegister(request, env) {
  const body = await readBody(request);
  if (!body) return json({ error: "invalid_input" }, 400);
  const email = String(body.email || "").trim().toLowerCase();
  const nickname = cleanNickname(body.nickname) || email.split("@")[0];
  const password = body.password;
  if (!validEmail(email) || !validPassword(password)) return json({ error: "invalid_input" }, 400);
  if (typeof body.code !== "string" || body.code.length !== 6) return json({ error: "invalid_code" }, 400);

  const exists = await env.DB.prepare("SELECT id FROM fd_users WHERE email = ?").bind(email).first();
  if (exists) return json({ error: "email_taken" }, 409);
  if (!(await verifyCode(env, email, "register", body.code, false))) return json({ error: "invalid_code" }, 400);

  const salt = toBase64(randomBytes(16));
  const hash = await deriveHash(password, salt);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const isAdmin = adminEmails(env).has(email) ? 1 : 0;
  try {
    await env.DB.prepare(
      "INSERT INTO fd_users (id, email, nickname, avatar, bio, salt, password_hash, iterations, is_admin, created_at, last_login_at) VALUES (?, ?, ?, '', '', ?, ?, ?, ?, ?, ?)",
    )
      .bind(id, email, nickname, salt, hash, PBKDF2_ITERATIONS, isAdmin, now, now)
      .run();
  } catch {
    return json({ error: "email_taken" }, 409);
  }
  await verifyCode(env, email, "register", body.code, true);
  const lastLogin = await logLogin(env, id, request);
  const session = await createSession(env, id, request);
  return json({ ...session, user: { id, email, nickname, avatar: "", bio: "", isAdmin: !!isAdmin }, lastLogin }, 201);
}

async function handleLogin(request, env) {
  const body = await readBody(request);
  if (!body || !validEmail(body.email) || !validPassword(body.password)) {
    return json({ error: "invalid_credentials" }, 401);
  }
  const email = body.email.trim().toLowerCase();
  const row = await env.DB.prepare(
    "SELECT id, email, nickname, avatar, bio, is_admin, salt, password_hash FROM fd_users WHERE email = ?",
  )
    .bind(email)
    .first();
  const salt = row?.salt ?? toBase64(randomBytes(16));
  const hash = await deriveHash(body.password, salt);
  if (!row || !safeEqual(hash, row.password_hash)) return json({ error: "invalid_credentials" }, 401);

  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE fd_users SET last_login_at = ? WHERE id = ?").bind(now, row.id).run();
  await env.DB.prepare("DELETE FROM fd_sessions WHERE expires_at < ?").bind(new Date(Date.now() - 30 * 86_400_000).toISOString()).run();
  const lastLogin = await logLogin(env, row.id, request);
  const session = await createSession(env, row.id, request);
  const isAdmin = Number(row.is_admin) === 1 || adminEmails(env).has(row.email);
  return json({
    ...session,
    user: { id: row.id, email: row.email, nickname: row.nickname, avatar: row.avatar || "", bio: row.bio || "", isAdmin },
    lastLogin,
  });
}

async function handleResetPassword(request, env) {
  const body = await readBody(request);
  if (!body) return json({ error: "invalid_input" }, 400);
  const email = String(body.email || "").trim().toLowerCase();
  const newPassword = body.newPassword;
  if (!validEmail(email) || !validPassword(newPassword)) return json({ error: "invalid_input" }, 400);
  if (typeof body.code !== "string" || body.code.length !== 6) return json({ error: "invalid_code" }, 400);
  if (!(await verifyCode(env, email, "reset", body.code, false))) return json({ error: "invalid_code" }, 400);

  const row = await env.DB.prepare("SELECT id FROM fd_users WHERE email = ?").bind(email).first();
  if (!row) return json({ error: "no_such_email" }, 404);
  const salt = toBase64(randomBytes(16));
  const hash = await deriveHash(newPassword, salt);
  await env.DB.prepare("UPDATE fd_users SET salt = ?, password_hash = ?, iterations = ? WHERE id = ?")
    .bind(salt, hash, PBKDF2_ITERATIONS, row.id)
    .run();
  await verifyCode(env, email, "reset", body.code, true);
  await env.DB.prepare("DELETE FROM fd_sessions WHERE user_id = ?").bind(row.id).run();
  return json({ ok: true });
}

async function handleMe(request, env) {
  const auth = await authenticate(env, request);
  if (!auth) return json({ error: "unauthorized" }, 401);
  const last = await env.DB.prepare(
    "SELECT ip, location, created_at FROM fd_login_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
  )
    .bind(auth.userId)
    .first();
  auth.user.isAdmin = auth.isAdmin;
  return json({ user: auth.user, lastLogin: last || null });
}

async function handleLogout(request, env) {
  const auth = await authenticate(env, request);
  if (auth) {
    await env.DB.prepare("DELETE FROM fd_sessions WHERE token = ?").bind(auth.token).run();
  }
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/* ---------------- 用户资料 ---------------- */
async function handleProfile(request, env) {
  const auth = await authenticate(env, request);
  if (!auth) return json({ error: "unauthorized" }, 401);
  if (request.method === "PUT") {
    const body = await readBody(request);
    if (!body) return json({ error: "invalid_input" }, 400);
    const nickname = cleanNickname(body.nickname);
    const avatar = cleanAvatar(body.avatar);
    const bio = cleanText(body.bio, 200);
    if (body.nickname !== undefined && !nickname) return json({ error: "invalid_nickname" }, 400);
    if (body.avatar !== undefined && body.avatar && !avatar) return json({ error: "avatar_too_large" }, 413);
    await env.DB.prepare("UPDATE fd_users SET nickname = ?, avatar = ?, bio = ? WHERE id = ?")
      .bind(nickname || auth.user.nickname, avatar || auth.user.avatar || "", bio, auth.userId)
      .run();
  }
  const row = await env.DB.prepare("SELECT * FROM fd_users WHERE id = ?").bind(auth.userId).first();
  return json({ user: publicUser(env, row) });
}

/* ---------------- 用户数据云同步 ---------------- */
async function handleGetState(request, env) {
  const auth = await authenticate(env, request);
  if (!auth) return json({ error: "unauthorized" }, 401);
  const row = await env.DB.prepare("SELECT state_json, updated_at, revision FROM fd_user_state WHERE user_id = ?")
    .bind(auth.userId)
    .first();
  if (!row) return json({ error: "no_state" }, 404);
  return json({ state: row.state_json, updatedAt: row.updated_at, revision: row.revision });
}

async function handlePutState(request, env) {
  const auth = await authenticate(env, request);
  if (!auth) return json({ error: "unauthorized" }, 401);
  const body = await readBody(request);
  if (!body || typeof body.state !== "string") return json({ error: "invalid_input" }, 400);
  if (encoder.encode(body.state).length > MAX_STATE_BYTES) return json({ error: "state_too_large" }, 413);
  try {
    const parsed = JSON.parse(body.state);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return json({ error: "invalid_input" }, 400);
  } catch {
    return json({ error: "invalid_input" }, 400);
  }

  const baseRevision = Number.isInteger(body.baseRevision) ? body.baseRevision : null;
  const now = new Date().toISOString();
  const current = await env.DB.prepare("SELECT revision, state_json, updated_at FROM fd_user_state WHERE user_id = ?")
    .bind(auth.userId)
    .first();

  if (!current) {
    await env.DB.prepare("INSERT INTO fd_user_state (user_id, state_json, updated_at, revision) VALUES (?, ?, ?, 1)")
      .bind(auth.userId, body.state, now)
      .run();
    return json({ updatedAt: now, revision: 1 });
  }
  if (baseRevision !== null && baseRevision !== current.revision) {
    return json({ error: "conflict", state: current.state_json, updatedAt: current.updated_at, revision: current.revision }, 409);
  }
  const revision = Number(current.revision || 0) + 1;
  await env.DB.prepare("UPDATE fd_user_state SET state_json = ?, updated_at = ?, revision = ? WHERE user_id = ?")
    .bind(body.state, now, revision, auth.userId)
    .run();
  return json({ updatedAt: now, revision });
}

/* ---------------- 在线心跳 ---------------- */
async function handlePresence(request, env) {
  const auth = await authenticate(env, request);
  if (!auth) return json({ error: "unauthorized" }, 401);
  const { ip, location } = locate(request);
  await env.DB.prepare("UPDATE fd_sessions SET last_seen_at = ?, ip = ?, location = ? WHERE token = ?")
    .bind(new Date().toISOString(), ip, location, auth.token)
    .run();
  return json({ ok: true });
}

/* ---------------- 对话室 ---------------- */
async function chatList(env, url) {
  const limitRaw = url.searchParams.get("limit");
  let limit = 100;
  if (limitRaw && /^\d+$/.test(limitRaw)) limit = Math.min(200, Math.max(1, Number(limitRaw)));
  const result = await env.DB.prepare(
    "SELECT id, user_id, nickname, avatar, content, created_at FROM fd_chat_messages ORDER BY created_at DESC LIMIT ?",
  )
    .bind(limit)
    .all();
  const messages = (result.results || []).reverse().map((r) => ({
    id: r.id,
    userId: r.user_id,
    nickname: r.nickname,
    avatar: r.avatar || "",
    content: r.content,
    createdAt: r.created_at,
  }));
  return json({ messages, now: new Date().toISOString() });
}

async function chatCreate(request, env) {
  const auth = await authenticate(env, request);
  if (!auth) return json({ error: "unauthorized" }, 401);
  const body = await readBody(request);
  const content = typeof body?.content === "string" ? body.content.replace(/\r\n?/g, "\n").trim() : "";
  if (!content || content.length > MAX_CONTENT_CHARS || encoder.encode(content).length > 4000) {
    return json({ error: "invalid_input" }, 400);
  }
  const last = await env.DB.prepare(
    "SELECT created_at FROM fd_chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
  )
    .bind(auth.userId)
    .first();
  if (last && Date.now() - Date.parse(last.created_at) < 2000) return json({ error: "chat_slow_down" }, 429);

  const row = await env.DB.prepare("SELECT nickname, avatar FROM fd_users WHERE id = ?").bind(auth.userId).first();
  const msg = {
    id: crypto.randomUUID(),
    userId: auth.userId,
    nickname: row?.nickname || auth.user.nickname,
    avatar: row?.avatar || "",
    content,
    createdAt: new Date().toISOString(),
  };
  await env.DB.prepare("INSERT INTO fd_chat_messages (id, user_id, nickname, avatar, content, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(msg.id, msg.userId, msg.nickname, msg.avatar, msg.content, msg.createdAt)
    .run();
  return json({ message: msg }, 201);
}

/* ---------------- 管理员统计（编辑部看板） ---------------- */
async function countOf(env, sql, ...binds) {
  const row = await env.DB.prepare(sql).bind(...binds).first();
  return Number(row?.c ?? 0);
}

function maskEmail(email) {
  const [name, domain] = String(email || "").split("@");
  if (!domain) return "***";
  const head = name.slice(0, Math.min(2, name.length));
  return `${head}***@${domain}`;
}

async function handleAdminStats(request, env) {
  const auth = await authenticate(env, request);
  if (!auth) return json({ error: "unauthorized" }, 401);
  if (!auth.isAdmin) return json({ error: "forbidden" }, 403);

  const now = new Date();
  const nowIso = now.toISOString();
  const today = nowIso.slice(0, 10);
  const day14 = new Date(now.getTime() - 13 * 86_400_000).toISOString().slice(0, 10);
  const onlineSince = new Date(now.getTime() - ONLINE_WINDOW_MS).toISOString();

  const [
    usersTotal, usersToday, usersWeek, online,
    chatsTotal, chatsToday,
    stateRows, stateBytes, stateToday,
  ] = await Promise.all([
    countOf(env, "SELECT COUNT(*) AS c FROM fd_users"),
    countOf(env, "SELECT COUNT(*) AS c FROM fd_users WHERE substr(created_at,1,10) >= ?", today),
    countOf(env, "SELECT COUNT(*) AS c FROM fd_users WHERE created_at >= ?", new Date(now.getTime() - 7 * 86_400_000).toISOString()),
    countOf(env, "SELECT COUNT(DISTINCT user_id) AS c FROM fd_sessions WHERE expires_at > ? AND COALESCE(last_seen_at, created_at) >= ?", nowIso, onlineSince),
    countOf(env, "SELECT COUNT(*) AS c FROM fd_chat_messages"),
    countOf(env, "SELECT COUNT(*) AS c FROM fd_chat_messages WHERE substr(created_at,1,10) >= ?", today),
    countOf(env, "SELECT COUNT(*) AS c FROM fd_user_state"),
    env.DB.prepare("SELECT COALESCE(SUM(LENGTH(state_json)),0) AS c FROM fd_user_state").first(),
    countOf(env, "SELECT COUNT(*) AS c FROM fd_user_state WHERE updated_at >= ?", nowIso.slice(0, 10)),
  ]);

  // 近 14 天趋势：注册 / 登录 / 对话室消息
  const days = Array.from({ length: 14 }, (_, i) =>
    new Date(now.getTime() - (13 - i) * 86_400_000).toISOString().slice(0, 10),
  );
  const trendQuery = async (table, col) => {
    const res = await env.DB.prepare(
      `SELECT substr(${col},1,10) AS d, COUNT(*) AS c FROM ${table} WHERE ${col} >= ? GROUP BY d`,
    )
      .bind(`${day14}T00:00:00.000Z`)
      .all();
    const map = {};
    for (const r of res.results || []) map[r.d] = Number(r.c);
    return days.map((d) => ({ day: d, count: map[d] || 0 }));
  };
  const [regTrend, loginTrend, chatTrend] = await Promise.all([
    trendQuery("fd_users", "created_at"),
    trendQuery("fd_login_logs", "created_at"),
    trendQuery("fd_chat_messages", "created_at"),
  ]);

  // 登录地点 Top 10
  const locRes = await env.DB.prepare(
    `SELECT COALESCE(NULLIF(location,''),'未知') AS location, COUNT(*) AS c FROM fd_login_logs GROUP BY location ORDER BY c DESC LIMIT 10`,
  ).all();

  // 最近注册用户 + 最近登录
  const recentUsers = await env.DB.prepare(
    `SELECT u.email, u.nickname, u.created_at, u.last_login_at,
            (SELECT location FROM fd_login_logs l WHERE l.user_id = u.id ORDER BY created_at DESC LIMIT 1) AS location
     FROM fd_users u ORDER BY u.created_at DESC LIMIT 20`,
  ).all();

  return json({
    now: nowIso,
    totals: {
      users: usersTotal,
      usersToday,
      usersWeek,
      online,
      chats: chatsTotal,
      chatsToday,
      stateRows,
      stateBytes: Number(stateBytes?.c ?? 0),
      stateToday,
    },
    trend: { days, register: regTrend, login: loginTrend, chat: chatTrend },
    locations: (locRes.results || []).map((r) => ({ location: r.location, count: Number(r.c) })),
    recentUsers: (recentUsers.results || []).map((r) => ({
      email: maskEmail(r.email),
      nickname: r.nickname,
      createdAt: r.created_at,
      lastLoginAt: r.last_login_at,
      location: r.location || "未知",
    })),
  });
}

/* ---------------- Schema 自检（免迁移直接可用） ---------------- */
let schemaReady = false;
async function ensureSchema(env) {
  if (schemaReady) return;
  const statements = [
    "CREATE TABLE IF NOT EXISTS fd_users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, nickname TEXT NOT NULL, avatar TEXT NOT NULL DEFAULT '', bio TEXT NOT NULL DEFAULT '', salt TEXT NOT NULL, password_hash TEXT NOT NULL, iterations INTEGER NOT NULL, is_admin INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, last_login_at TEXT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS fd_sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, last_seen_at TEXT, user_agent TEXT, ip TEXT, location TEXT)",
    "CREATE INDEX IF NOT EXISTS idx_fd_sessions_user ON fd_sessions (user_id)",
    "CREATE TABLE IF NOT EXISTS fd_email_codes (email TEXT NOT NULL, purpose TEXT NOT NULL, code_hash TEXT NOT NULL, expires_at TEXT NOT NULL, used_at TEXT, created_at TEXT NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_fd_email_codes_email ON fd_email_codes (email, purpose)",
    "CREATE TABLE IF NOT EXISTS fd_user_state (user_id TEXT PRIMARY KEY, state_json TEXT NOT NULL, updated_at TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS fd_login_logs (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, ip TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '', user_agent TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_fd_login_logs_user ON fd_login_logs (user_id, created_at)",
    "CREATE INDEX IF NOT EXISTS idx_fd_login_logs_time ON fd_login_logs (created_at)",
    "CREATE TABLE IF NOT EXISTS fd_chat_messages (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nickname TEXT NOT NULL, avatar TEXT NOT NULL DEFAULT '', content TEXT NOT NULL, created_at TEXT NOT NULL)",
  ];
  for (const sql of statements) await env.DB.prepare(sql).run();
  schemaReady = true;
}

/* ---------------- 路由 ---------------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
    if (!env.DB) return json({ error: "cloud_unavailable" }, 503);
    if (!url.pathname.startsWith("/api/")) return json({ error: "not_found" }, 404);

    try {
      await ensureSchema(env);
      const p = url.pathname;
      const m = request.method;

      if (p === "/api/auth/code" && m === "POST") return await handleSendCode(request, env);
      if (p === "/api/auth/register" && m === "POST") return await handleRegister(request, env);
      if (p === "/api/auth/login" && m === "POST") return await handleLogin(request, env);
      if (p === "/api/auth/password" && m === "POST") return await handleResetPassword(request, env);
      if (p === "/api/auth/me" && m === "GET") return await handleMe(request, env);
      if (p === "/api/auth/logout" && m === "POST") return await handleLogout(request, env);
      if (p === "/api/user/profile" && (m === "PUT" || m === "GET")) return await handleProfile(request, env);
      if (p === "/api/state" && m === "GET") return await handleGetState(request, env);
      if (p === "/api/state" && m === "PUT") return await handlePutState(request, env);
      if (p === "/api/presence" && m === "POST") return await handlePresence(request, env);
      if (p === "/api/chat" && m === "GET") return await chatList(env, url);
      if (p === "/api/chat" && m === "POST") return await chatCreate(request, env);
      if (p === "/api/admin/stats" && m === "GET") return await handleAdminStats(request, env);

      return json({ error: "not_found" }, 404);
    } catch (err) {
      return json({ error: "server_error", detail: String(err?.message || err).slice(0, 120) }, 500);
    }
  },
};
