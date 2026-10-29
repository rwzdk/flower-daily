-- 花海生活报 · 用户系统 / 云端数据 / 对话室
CREATE TABLE IF NOT EXISTS fd_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  iterations INTEGER NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  last_login_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fd_sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  last_seen_at TEXT,
  user_agent TEXT,
  ip TEXT,
  location TEXT
);

CREATE INDEX IF NOT EXISTS idx_fd_sessions_user ON fd_sessions (user_id);

-- 邮箱验证码（注册 / 找回密码共用）
CREATE TABLE IF NOT EXISTS fd_email_codes (
  email TEXT NOT NULL,
  purpose TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fd_email_codes_email ON fd_email_codes (email, purpose);

-- 用户数据（习惯/待办/记账等整体 JSON）
CREATE TABLE IF NOT EXISTS fd_user_state (
  user_id TEXT PRIMARY KEY,
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1
);

-- 登录日志（IP + 地点，供管理员看板统计）
CREATE TABLE IF NOT EXISTS fd_login_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  ip TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fd_login_logs_user ON fd_login_logs (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_fd_login_logs_time ON fd_login_logs (created_at);

-- 对话室（用户反馈/交流）
CREATE TABLE IF NOT EXISTS fd_chat_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);
