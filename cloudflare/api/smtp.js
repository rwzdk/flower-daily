// QQ 邮箱 SMTP 验证码发送（参考 qc-student 的 smtp.qq.com:465 SSL 方案）。
// Workers 无法直接用 nodemailer，这里用 cloudflare:sockets 建立隐式 TLS 连接，
// 手写 SMTP 对话（EHLO → AUTH LOGIN → MAIL/RCPT/DATA → QUIT）。
import { connect } from "cloudflare:sockets";

const TIMEOUT_MS = 15_000;

function withTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`smtp_timeout:${label}`)), TIMEOUT_MS),
    ),
  ]);
}

/** 逐行读取器：把字节流切成以 \r\n 分隔的行。 */
class LineReader {
  constructor(socket) {
    this.reader = socket.readable.getReader();
    this.decoder = new TextDecoder();
    this.buf = "";
  }
  async readLine() {
    for (;;) {
      const idx = this.buf.indexOf("\r\n");
      if (idx >= 0) {
        const line = this.buf.slice(0, idx);
        this.buf = this.buf.slice(idx + 2);
        return line;
      }
      const { done, value } = await this.reader.read();
      if (done) throw new Error("smtp_closed");
      this.buf += this.decoder.decode(value, { stream: true });
    }
  }
  /** 读取一条应答，跳过 "250-..." 的多行中间行，返回最后一行。 */
  async readReply() {
    let line = "";
    for (;;) {
      line = await this.readLine();
      if (line.length < 4 || line[3] !== "-") return line;
    }
  }
}

function b64(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

function b64Wrapped(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  // 按 76 字符折行（MIME 规范）
  return (btoa(binary).match(/.{1,76}/g) || []).join("\r\n");
}

function mimeHeader(name, value) {
  return `${name}: =?UTF-8?B?${b64(value)}?=`;
}

/** 发一封验证码邮件，失败时抛错（错误信息只含阶段代号，不带密钥）。 */
export async function sendVerificationEmail(env, to, code, purpose) {
  const user = env.MAIL_USER;
  const pass = env.MAIL_PASS;
  if (!user || !pass) throw new Error("mail_not_configured");
  const fromName = env.MAIL_SENDER_NAME || "花海生活报";
  const scene = purpose === "reset" ? "找回密码" : "注册";

  const subject = `【${fromName}】${scene}验证码：${code}`;
  const body = `<!doctype html><html><body style="margin:0;padding:24px;background:#faf5e7;font-family:'PingFang SC','Microsoft YaHei',sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#fffdf6;border:2px solid #6b573c;border-radius:14px;overflow:hidden">
    <div style="background:#f09a33;padding:14px 22px;color:#fffdf6;font-size:17px;font-weight:700;letter-spacing:.08em">🌸 ${fromName} · 邮箱验证</div>
    <div style="padding:24px 26px;color:#5a4630;font-size:14px;line-height:1.8">
      <p style="margin:0 0 12px">你好呀， flower 订户：</p>
      <p style="margin:0 0 16px">你的${scene}验证码是下面这串数字，10 分钟内有效。请勿透露给任何人～</p>
      <div style="text-align:center;margin:18px 0">
        <span style="display:inline-block;padding:12px 30px;border:2px dashed #d97f18;border-radius:10px;font-size:30px;font-weight:800;letter-spacing:.35em;color:#d97f18">${code}</span>
      </div>
      <p style="margin:0;color:#8b7656;font-size:12px">如果这不是你本人的操作，请忽略这封邮件。报纸照常出版，不受影响。</p>
    </div>
    <div style="border-top:1px dashed #d3c49c;padding:12px 22px;color:#b4a488;font-size:11px;text-align:center">花海生活报 · 花会慢慢开，事要一件件办</div>
  </div>
</body></html>`;

  const socket = connect({ hostname: "smtp.qq.com", port: 465 }, {
    secureTransport: "on",
    allowHalfOpen: false,
  });
  const writer = socket.writable.getWriter();
  const reader = new LineReader(socket);
  const enc = new TextEncoder();
  let stage = "connect";

  const write = (s) => writer.write(enc.encode(s));
  const cmd = async (line, expect, nextStage) => {
    await write(line + "\r\n");
    const rep = await reader.readReply();
    if (!rep.startsWith(expect)) {
      throw new Error(`smtp_bad_reply:${stage}:${rep.slice(0, 60)}`);
    }
    stage = nextStage;
    return rep;
  };

  try {
    const greeting = await withTimeout(reader.readReply(), "greeting");
    if (!greeting.startsWith("220")) throw new Error(`smtp_greeting:${greeting.slice(0, 60)}`);

    await cmd(`EHLO flower-daily`, "250", "ehlo");
    await cmd("AUTH LOGIN", "334", "auth_user");
    await cmd(b64(user), "334", "auth_pass");
    await cmd(b64(pass), "235", "mail_from");
    await cmd(`MAIL FROM:<${user}>`, "250", "rcpt");
    await cmd(`RCPT TO:<${to}>`, "250", "data");

    await cmd("DATA", "354", "body");
    const dotStuffed = body
      .split("\r\n")
      .map((l) => (l.startsWith(".") ? "." + l : l))
      .join("\r\n");
    await write(
      [
        `From: =?UTF-8?B?${b64(fromName)}?= <${user}>`,
        `To: <${to}>`,
        mimeHeader("Subject", subject),
        "MIME-Version: 1.0",
        'Content-Type: text/html; charset=UTF-8',
        "Content-Transfer-Encoding: base64",
        "",
        b64Wrapped(dotStuffed),
        ".",
        "",
      ].join("\r\n"),
    );
    const rep = await withTimeout(reader.readReply(), "data_end");
    if (!rep.startsWith("250")) throw new Error(`smtp_bad_reply:${stage}:${rep.slice(0, 60)}`);

    await write("QUIT\r\n");
  } finally {
    try { await writer.close(); } catch { /* 连接可能已断开 */ }
    try { socket.close(); } catch { /* 同上 */ }
  }
}
