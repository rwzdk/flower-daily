<script setup>
/* ---- 编辑部看板：管理员专用全站统计（手绘风 SVG 图表） ---- */
import { ref, computed, onMounted } from "vue";
import { api } from "../api";
import { toast } from "../store";

const emit = defineEmits(["close"]);
const data = ref(null);
const loading = ref(true);
const err = ref("");

onMounted(async () => {
  try {
    data.value = await api("/api/admin/stats");
  } catch (e) {
    err.value = e.message;
  }
  loading.value = false;
});

/* 折线图：把 14 天趋势映射为 SVG 折线 */
const CHART_W = 560, CHART_H = 170, PAD_L = 34, PAD_B = 24, PAD_T = 12;
const series = computed(() => {
  if (!data.value) return [];
  const t = data.value.trend;
  return [
    { key: "register", name: "注册", color: "#f09a33", pts: t.register.map(x => x.count) },
    { key: "login", name: "登录", color: "#5c8a4e", pts: t.login.map(x => x.count) },
    { key: "chat", name: "发言", color: "#e8b93c", pts: t.chat.map(x => x.count) },
  ];
});
const maxY = computed(() => {
  let m = 4;
  series.value.forEach(s => s.pts.forEach(v => { if (v > m) m = v; }));
  return Math.ceil(m * 1.2);
});
function px(i) { return PAD_L + i * ((CHART_W - PAD_L - 8) / 13); }
function py(v) { return CHART_H - PAD_B - (v / maxY.value) * (CHART_H - PAD_B - PAD_T); }
function polyOf(pts) { return pts.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" "); }
function maxCountOf(pts) { return Math.max(...pts, 0); }

const locMax = computed(() => (data.value?.locations || [])[0]?.count || 1);
function fmtBytes(n) {
  if (n > 1048576) return (n / 1048576).toFixed(1) + " MB";
  if (n > 1024) return (n / 1024).toFixed(1) + " KB";
  return n + " B";
}
function dayLabel(d) { return d.slice(5); }
function shortTime(iso) { return (iso || "").slice(5, 16).replace("T", " "); }

/* 手绘抖动折线：在直线上加轻微扰动 */
function wobbly(pts) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    out.push(`M${x1},${y1}`);
    out.push(`Q${(x1 + x2) / 2},${((y1 + y2) / 2) + (((i % 2) ? 2.2 : -2.2))} ${x2},${y2}`);
  }
  return out.join(" ");
}
const seriesPaths = computed(() => series.value.map(s => ({
  ...s,
  path: wobbly(s.pts.map((v, i) => [px(i), py(v)])),
  dots: s.pts.map((v, i) => ({ x: px(i), y: py(v), v })),
  max: maxCountOf(s.pts),
  total: s.pts.reduce((a, b) => a + b, 0),
})));
</script>

<template>
  <div class="mask admin-mask" @click.self="emit('close')">
    <div class="admin-sheet">
      <span class="tape"></span>
      <div class="chat-head">
        <h3>编辑部看板</h3><span class="en">PRESS ROOM</span>
        <button class="chat-x" @click="emit('close')">×</button>
      </div>
      <p class="chat-sub">全站订户与活动统计 · 仅管理员可见</p>

      <div v-if="loading" class="chat-empty">正在汇总版面…</div>
      <div v-else-if="err" class="chat-empty">{{ err }}</div>
      <template v-else>
        <!-- 指标卡 -->
        <div class="astats">
          <div class="astat"><b>{{ data.totals.users }}</b><span>订户总数</span><i>今日 +{{ data.totals.usersToday }}</i></div>
          <div class="astat"><b>{{ data.totals.online }}</b><span>当前在线</span><i>5 分钟活跃</i></div>
          <div class="astat"><b>{{ data.totals.usersWeek }}</b><span>近 7 天新增</span><i>注册订户</i></div>
          <div class="astat"><b>{{ data.totals.chats }}</b><span>对话室消息</span><i>今日 +{{ data.totals.chatsToday }}</i></div>
          <div class="astat"><b>{{ data.totals.stateRows }}</b><span>云端数据份数</span><i>{{ fmtBytes(data.totals.stateBytes) }}</i></div>
        </div>

        <!-- 折线图：近 14 天趋势 -->
        <div class="achart">
          <div class="achart-head">
            <b>近 14 天动向</b>
            <span class="legend">
              <i v-for="s in seriesPaths" :key="s.key" :style="{ '--c': s.color }">{{ s.name }} {{ s.total }}</i>
            </span>
          </div>
          <svg :viewBox="`0 0 ${CHART_W} ${CHART_H}`" class="aline">
            <line v-for="g in 4" :key="g" :x1="PAD_L" :x2="CHART_W - 8"
                  :y1="PAD_T + (g - 1) * (CHART_H - PAD_B - PAD_T) / 3"
                  :y2="PAD_T + (g - 1) * (CHART_H - PAD_B - PAD_T) / 3"
                  stroke="#d3c49c" stroke-dasharray="3 4" stroke-width="1" />
            <text v-for="g in 4" :key="'t' + g" :x="PAD_L - 6"
                  :y="PAD_T + (g - 1) * (CHART_H - PAD_B - PAD_T) / 3 + 3"
                  text-anchor="end" font-size="9" fill="#b4a488">{{ Math.round(maxY * (4 - g) / 3) }}</text>
            <g v-for="s in seriesPaths" :key="s.key">
              <path :d="s.path" fill="none" :stroke="s.color" stroke-width="2.2" stroke-linecap="round" />
              <circle v-for="(d, i) in s.dots" :key="i" :cx="d.x" :cy="d.y" r="2.6" :fill="s.color" opacity=".85" />
            </g>
            <text v-for="(d, i) in data.trend.days" :key="d" :x="px(i)" :y="CHART_H - 8"
                  text-anchor="middle" font-size="8.5" fill="#b4a488"
                  :opacity="i % 2 ? 0.6 : 1">{{ dayLabel(d) }}</text>
          </svg>
        </div>

        <div class="acols">
          <!-- 登录地点 Top -->
          <div class="acard">
            <div class="achart-head"><b>登录地点 Top 10</b></div>
            <div v-if="!data.locations.length" class="chat-empty">还没有登录记录</div>
            <div v-for="l in data.locations" :key="l.location" class="cbar">
              <span class="lb">📍 {{ l.location }}</span>
              <span class="tr"><i :style="{ width: Math.max(4, l.count / locMax * 100) + '%' }"></i></span>
              <span class="vl">{{ l.count }}</span>
            </div>
          </div>
          <!-- 最近注册订户 -->
          <div class="acard">
            <div class="achart-head"><b>最近登记订户</b></div>
            <div v-if="!data.recentUsers.length" class="chat-empty">还没有订户</div>
            <div v-for="u in data.recentUsers" :key="u.email + u.createdAt" class="arow">
              <span class="an">{{ u.nickname }}</span>
              <span class="am">{{ u.email }}</span>
              <span class="al">📍 {{ u.location }}</span>
              <span class="at">{{ shortTime(u.createdAt) }} 登记</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
