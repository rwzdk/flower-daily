<script setup>
/* ---- 登录 / 注册 / 找回密码（手绘订阅卡） ---- */
import { reactive, ref, onUnmounted } from "vue";
import { sendCode, doLogin, doRegister, doResetPassword } from "../auth";
import { loadCloudState, toast } from "../store";

const mode = ref("login"); // login | register | reset
const busy = ref(false);
const form = reactive({ email: "", password: "", newPassword: "", code: "", nickname: "" });
const countdown = ref(0);
let timer = null;

const titles = { login: "订户登录", register: "新订户登记", reset: "找回密码" };

function switchMode(m) {
  mode.value = m;
  form.code = "";
}

async function requestCode() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) return toast("先填好邮箱地址哦");
  if (countdown.value > 0) return;
  try {
    await sendCode(form.email.trim(), mode.value === "reset" ? "reset" : "register");
    toast("验证码已寄出，请查收邮箱");
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) clearInterval(timer);
    }, 1000);
  } catch (e) {
    toast(e.message);
  }
}

async function submit() {
  if (busy.value) return;
  busy.value = true;
  try {
    if (mode.value === "login") {
      await doLogin(form.email.trim(), form.password);
    } else if (mode.value === "register") {
      if (!form.nickname.trim()) { busy.value = false; return toast("给自己起个笔名吧"); }
      await doRegister({
        email: form.email.trim(),
        code: form.code.trim(),
        password: form.password,
        nickname: form.nickname.trim(),
      });
    } else {
      await doResetPassword({ email: form.email.trim(), code: form.code.trim(), newPassword: form.newPassword });
      toast("密码已改好，用新密码登录吧");
      mode.value = "login";
      busy.value = false;
      return;
    }
    await loadCloudState();
    toast(`欢迎回来，${form.nickname || "主笔"}`);
  } catch (e) {
    toast(e.message);
  }
  busy.value = false;
}
onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div class="auth-mask">
    <div class="auth-card">
      <span class="tape"></span>
      <div class="auth-head">
        <span class="icn-inline"><svg class="icn" viewBox="0 0 24 24" fill="none" stroke="#6b573c" stroke-width="1.1"><g fill="#fffdf6"><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9"/><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9" transform="rotate(90 12 8.9)"/><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9" transform="rotate(180 12 8.9)"/><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9" transform="rotate(270 12 8.9)"/></g><circle cx="12" cy="8.9" r="2.7" fill="#f6c453"/><path d="M12 12.4V21" stroke="#5c8a4e" stroke-width="1.9"/></svg></span>
        <h2>花海生活报</h2>
        <p>登记成为订户，报纸只寄给你一个人</p>
      </div>

      <div class="auth-tabs">
        <button :class="{ on: mode === 'login' }" @click="switchMode('login')">登录</button>
        <button :class="{ on: mode === 'register' }" @click="switchMode('register')">注册</button>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <div class="f-row"><label>邮箱</label>
          <input v-model.trim="form.email" type="email" placeholder="你的 QQ 邮箱，如 xxx@qq.com" autocomplete="email">
        </div>

        <div v-if="mode === 'register'" class="f-row"><label>笔名</label>
          <input v-model.trim="form.nickname" type="text" maxlength="24" placeholder="在这份报纸上怎么称呼你">
        </div>

        <div v-if="mode !== 'login'" class="f-row"><label>验证码</label>
          <div class="code-row">
            <input v-model.trim="form.code" type="text" inputmode="numeric" maxlength="6" placeholder="6 位邮箱验证码">
            <button type="button" class="code-btn" :disabled="countdown > 0" @click="requestCode">
              {{ countdown > 0 ? countdown + "s" : "发送验证码" }}
            </button>
          </div>
        </div>

        <div v-if="mode !== 'reset'" class="f-row"><label>密码</label>
          <input v-model="form.password" type="password" placeholder="至少 6 位" autocomplete="current-password">
        </div>

        <div v-if="mode === 'reset'" class="f-row"><label>新密码</label>
          <input v-model="form.newPassword" type="password" placeholder="至少 6 位" autocomplete="new-password">
        </div>

        <button class="btn auth-submit" :disabled="busy">
          {{ busy ? "处理中…" : (mode === "login" ? "登录报社 ✓" : mode === "register" ? "登记订户 ✓" : "重置密码 ✓") }}
        </button>
      </form>

      <div class="auth-foot">
        <button v-if="mode !== 'reset'" @click="switchMode('reset')">忘记密码？</button>
        <span v-else>想起密码了？</span>
        <button v-if="mode === 'reset'" @click="switchMode('login')">去登录</button>
      </div>
      <p class="auth-note">数据云端同步 · 换设备也不丢 · 仅用于个人学习</p>
    </div>
  </div>
</template>
