<script setup>
/* ---- 对话室：编辑部茶水间 · 用户反馈交流（参考 study-room ChatRoom） ---- */
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { api } from "../api";
import { auth } from "../auth";
import { toast } from "../store";
import Avatar from "./Avatar.vue";

const emit = defineEmits(["close"]);

const messages = ref([]);
const loading = ref(true);
const error = ref("");
const text = ref("");
const sending = ref(false);
const cooldown = ref(0);
const listEl = ref(null);
let pollTimer = null;
let cdTimer = null;

function scrollBottom() {
  nextTick(() => { if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight; });
}

async function load() {
  try {
    const r = await api("/api/chat?limit=100");
    messages.value = r.messages || [];
    error.value = "";
    scrollBottom();
  } catch (e) {
    error.value = e.message;
  }
  loading.value = false;
}

async function send() {
  const content = text.value.trim();
  if (!content || sending.value || cooldown.value > 0) return;
  sending.value = true;
  try {
    const r = await api("/api/chat", { method: "POST", body: { content } });
    messages.value.push(r.message);
    text.value = "";
    cooldown.value = 3;
    cdTimer = setInterval(() => {
      cooldown.value -= 1;
      if (cooldown.value <= 0) clearInterval(cdTimer);
    }, 1000);
    scrollBottom();
  } catch (e) {
    toast(e.message);
  }
  sending.value = false;
}

function fmtTime(iso) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

onMounted(async () => {
  await load();
  pollTimer = setInterval(load, 15000);
});
onUnmounted(() => { clearInterval(pollTimer); clearInterval(cdTimer); });
</script>

<template>
  <Teleport to="body">
    <div class="mask chat-mask" @click.self="emit('close')">
      <div class="chat-panel">
        <span class="tape"></span>
        <div class="chat-head">
          <h3>对话室 · 编辑部茶水间</h3>
          <span class="en">TEA ROOM</span>
          <button class="chat-x" @click="emit('close')">×</button>
        </div>
        <p class="chat-sub">聊聊使用感受、丢点建议，编辑部都会看到 ✎</p>

        <div ref="listEl" class="chat-list">
          <div v-if="loading" class="chat-empty">正在泡茶…</div>
          <div v-else-if="error" class="chat-empty">
            {{ error }}<br /><button class="btn ghost" style="margin-top:10px" @click="load">再试一次</button>
          </div>
          <div v-else-if="!messages.length" class="chat-empty">
            <span class="e">🫖</span>茶水间还没人说话，来当第一位吧
          </div>
          <div v-for="m in messages" :key="m.id" class="chat-msg" :class="{ mine: m.userId === auth.user?.id }">
            <Avatar :a="m.avatar" :size="30" />
            <div class="cb">
              <div class="cm-meta"><b>{{ m.nickname }}</b><span>{{ fmtTime(m.createdAt) }}</span></div>
              <div class="cm-text">{{ m.content }}</div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <input v-model="text" maxlength="500" placeholder="说点什么…（Enter 发送）"
                 @keydown.enter.prevent="send">
          <button class="btn" :disabled="sending || cooldown > 0 || !text.trim()" @click="send">
            {{ cooldown > 0 ? cooldown + "s" : "寄出" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
