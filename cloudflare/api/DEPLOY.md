# 云端 API 部署指引（Cloudflare Worker + D1）

登录系统、数据云同步、对话室、编辑部看板都跑在一个 Worker 上，前端仍是纯静态站点（qoder site 直接发布 `dist/` 即可）。

## 一、创建数据库并部署

```bash
cd cloudflare/api

# 1. 登录（首次）
npx wrangler login

# 2. 创建 D1 数据库，把输出的 database_id 填进 wrangler.toml
npx wrangler d1 create flower-daily

# 3. 配置 QQ 邮箱 SMTP 机密（授权码在 qc-student/.env 的 MAIL_PASSWORD）
npx wrangler secret put MAIL_USER   # 输入你的 QQ 邮箱，如 235173498@qq.com
npx wrangler secret put MAIL_PASS   # 输入 QQ 邮箱 SMTP 授权码（不是 QQ 密码）

# 4. 部署
npx wrangler deploy
```

部署成功后会得到 Worker 地址，如 `https://flower-daily-api.<你的子域>.workers.dev`。

## 二、前端指向 API

编辑根目录 [src/config.js](../../src/config.js)，把 `apiBase` 改成 Worker 地址：

```js
apiBase: "https://flower-daily-api.xxx.workers.dev",
```

然后 `npm run build`，把 `dist/` 发布到 qoder site。

> 表结构会在首次请求时自动创建（幂等 DDL），无需手动跑迁移；`migrations/` 仅供 `wrangler d1 migrations apply` 使用。

## 三、本地开发

```bash
# 终端 1：起 Worker（需先在 cloudflare/api/.dev.vars 里写 MAIL_USER / MAIL_PASS）
npx wrangler dev          # 默认 127.0.0.1:8787

# 终端 2：起前端（vite 已把 /api 代理到 8787）
npm run dev
```

## 功能对照

| 功能 | 接口 |
| --- | --- |
| 邮箱验证码（QQ 邮箱 SMTP） | `POST /api/auth/code` |
| 注册 / 登录 / 找回密码 | `POST /api/auth/register` `/api/auth/login` `/api/auth/password` |
| 当前用户 + 最近登录地点 | `GET /api/auth/me` |
| 资料编辑（昵称/头像/签名） | `PUT /api/user/profile` |
| 数据云同步（多设备冲突保护） | `GET/PUT /api/state` |
| 对话室（反馈交流） | `GET/POST /api/chat` |
| 编辑部看板（仅管理员） | `GET /api/admin/stats` |

管理员 = `wrangler.toml` 里 `ADMIN_EMAIL` 指定的邮箱（默认 235173498@qq.com），该邮箱注册后右上角会出现「编辑部看板」，可查看全站用户增长、登录趋势、登录地点分布、对话室活跃等手绘风图表。登录地点取自 Cloudflare 边缘节点的地理信息（城市/省份/国家）+ 访客 IP，记录在 `fd_login_logs` 表。
