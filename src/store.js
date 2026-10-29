/* ============================================================
   花海生活报 · 全局响应式 Store（桌面版与手机版共用）
   ============================================================ */
import { reactive, computed, watch, toRefs } from "vue";
import { CONFIG, FIELDS, CAT_EMOJI, ICONS, CARD_FLOWERS } from "./config";
import { todayStr, yesterdayStr, uid } from "./utils";
import { auth, bootAuth, ping } from "./auth";
import { api } from "./api";

function seedData() {
  const data = {};
  CONFIG.modules.forEach(m => {
    if (!m.seed) return;
    data[m.id] = m.seed.map(x => {
      const it = Object.assign({ id: uid() }, x);
      if (it.date === "today") it.date = todayStr();
      if (m.type === "checkin") it.lastDone = it.done ? todayStr() : "";
      return it;
    });
  });
  return data;
}

/* ---- 全局单例状态 ---- */
export const store = reactive({
  screen: "home",
  drawer: false,
  data: seedData(),
  checkinDay: todayStr(),
  ed: { show: false, type: null, form: {}, editing: null },
  noteTag: "",
  quotes: [
    "把日子过成连载，每天一小块版面。",
    "花会慢慢开，事要一件件办。",
    "先办最难的那件，剩下的都是下坡。",
    "记账不是抠门，是给生活校对版面。",
    "每天浇一次水，藤蔓自己会往前爬。",
    "灵感不剪下来，风一吹就没了。"
  ],
  toasts: []
});

/* ---- 云端同步 ----
   数据以 { data, checkinDay } 整体存 D1；本地不再持久化。
   修改后 900ms 防抖推送；冲突（其他设备写过）时采用云端最新版。 */
let rev = 0;
let saveTimer = null;
let syncing = false;

export async function loadCloudState() {
  if (!auth.user || syncing) return;
  syncing = true;
  try {
    const r = await api("/api/state");
    const saved = JSON.parse(r.state);
    if (saved.data) store.data = saved.data;
    if (saved.checkinDay) store.checkinDay = saved.checkinDay;
    rev = Number(r.revision) || 1;
  } catch (e) {
    if (e.code === "no_state") {
      // 新订户：优先迁移老版本本地数据，否则用种子数据
      rev = 0;
      let migrated = null;
      try {
        const raw = localStorage.getItem(CONFIG.storageKey);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.data) migrated = saved;
        }
      } catch { /* 老数据损坏则忽略 */ }
      if (migrated) {
        store.data = migrated.data;
        if (migrated.checkinDay) store.checkinDay = migrated.checkinDay;
        localStorage.removeItem(CONFIG.storageKey);
        toast("已把本地旧数据搬进云端花园 🌸");
      } else {
        store.data = seedData();
        store.checkinDay = todayStr();
      }
      pushState();
    } else {
      toast(e.message || "云端数据读取失败");
    }
  }
  crossDayReset();
  syncing = false;
}

async function pushState() {
  if (!auth.user) return;
  const payload = JSON.stringify({ data: store.data, checkinDay: store.checkinDay });
  try {
    const r = await api("/api/state", { method: "PUT", body: { state: payload, baseRevision: rev } });
    rev = Number(r.revision) || rev + 1;
  } catch (e) {
    if (e.code === "conflict" && e.server) {
      try {
        const saved = JSON.parse(e.server.state);
        rev = Number(e.server.revision) || rev;
        store.data = saved.data;
        store.checkinDay = saved.checkinDay;
        toast("发现其他设备的修改，已采用云端最新版");
      } catch { /* 冲突数据损坏则忽略 */ }
    }
  }
}
function schedulePush() {
  if (!auth.user) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(pushState, 900);
}
watch(() => store.data, schedulePush, { deep: true });
watch(() => store.checkinDay, schedulePush);

function crossDayReset() {
  if (store.checkinDay !== todayStr()) {
    (store.data.check || []).forEach(c => { c.done = false; });
    store.checkinDay = todayStr();
  }
}

/* ---- 应用启动：认证 + 拉取云端数据 + 在线心跳 ---- */
export async function initApp() {
  await bootAuth();
  if (auth.user) {
    await loadCloudState();
    setInterval(ping, 60_000);
  }
}

/* ---- 当前订户资料（替代原写死的 CONFIG.profile） ---- */
export const profile = computed(() => {
  const u = auth.user;
  return {
    name: u ? (u.nickname || u.email.split("@")[0]) : "游客",
    avatar: u ? (u.avatar || "🌼") : "🌼",
    subtitle: u ? u.email : "未登录",
  };
});

/* ---- 计算属性 ---- */
export const today = computed(() => todayStr());
export const cnDate = computed(() => {
  const d = new Date();
  const wk = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${wk}`;
});
export const issueNo = computed(() => {
  const d = new Date(), s = new Date(d.getFullYear(), 0, 0);
  return String(Math.floor((d - s) / 864e5)).padStart(3, "0");
});
export const greeting = computed(() => {
  const h = new Date().getHours();
  return h < 6 ? "夜深了" : h < 9 ? "早上好" : h < 12 ? "上午好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";
});
export const curMod = computed(() => CONFIG.modules.find(m => m.id === store.screen));
export const edFields = computed(() => FIELDS[store.ed.type] || []);
export const edMod = computed(() => CONFIG.modules.find(m => m.type === store.ed.type) || CONFIG.modules[0]);
export const todos = computed(() => store.data.todo || []);
export const todoDone = computed(() => todos.value.filter(x => x.done).length);
export const checks = computed(() => store.data.check || []);
export const checkDone = computed(() => checks.value.filter(x => x.done).length);
export const goals = computed(() => store.data.goal || []);
export const notes = computed(() => store.data.note || []);
export const bills = computed(() => (store.data.money || []).slice().sort((a, b) => b.date.localeCompare(a.date)));
export const monthBills = computed(() => {
  const p = today.value.slice(0, 7);
  return bills.value.filter(b => (b.date || "").startsWith(p));
});
export const monthOut = computed(() => monthBills.value.filter(b => b.kind === "expense").reduce((s, b) => s + (+b.amount || 0), 0));
export const monthIn = computed(() => monthBills.value.filter(b => b.kind === "income").reduce((s, b) => s + (+b.amount || 0), 0));
export const todayOut = computed(() => bills.value.filter(b => b.kind === "expense" && b.date === today.value).reduce((s, b) => s + (+b.amount || 0), 0));
export const catBars = computed(() => {
  const map = {};
  monthBills.value.filter(b => b.kind === "expense").forEach(b => { map[b.cat] = (map[b.cat] || 0) + (+b.amount || 0); });
  const arr = Object.entries(map).map(([cat, v]) => ({ cat, v })).sort((a, b) => b.v - a.v);
  const max = arr.length ? arr[0].v : 1;
  return arr.map(x => ({ cat: x.cat, v: x.v, pct: Math.round(x.v / max * 100) }));
});
export const goalAvg = computed(() => {
  if (!goals.value.length) return 0;
  return Math.round(goals.value.reduce((s, g) => s + Math.min(100, (g.current / (g.target || 1)) * 100), 0) / goals.value.length);
});
export const sortedTodos = computed(() => {
  const rank = { high: 0, mid: 1, low: 2 };
  return todos.value.slice().sort((a, b) => (a.done - b.done) || ((rank[a.level] ?? 1) - (rank[b.level] ?? 1)));
});
export const noteTags = computed(() => [...new Set(notes.value.map(n => n.tag).filter(Boolean))]);
export const filteredNotes = computed(() => {
  const list = store.noteTag ? notes.value.filter(n => n.tag === store.noteTag) : notes.value.slice();
  return list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
});
export const dailyQuote = computed(() => store.quotes[(+issueNo.value) % store.quotes.length]);
export const last7 = computed(() => {
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return todayStr(d); });
});
export const archivePick = computed(() => {
  if (!notes.value.length) return null;
  return notes.value[(+issueNo.value) % notes.value.length];
});
export const totalProgress = computed(() => {
  const parts = [];
  if (todos.value.length) parts.push(todoDone.value / todos.value.length);
  if (checks.value.length) parts.push(checkDone.value / checks.value.length);
  if (!parts.length) return 0;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length * 100);
});

/* ---- 方法 ---- */
export function go(id) {
  store.screen = id;
  store.drawer = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
export function toast(msg) {
  const t = { id: uid(), msg };
  store.toasts.push(t);
  setTimeout(() => { store.toasts = store.toasts.filter(x => x.id !== t.id); }, 2200);
}
export function catEmoji(cat) { return CAT_EMOJI[cat] || "📦"; }
export function icon(name) {
  return `<svg class="icn" viewBox="0 0 24 24" fill="none" stroke="#6b573c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.daisy}</svg>`;
}
export function cardIcon(id) {
  return `<svg class="icn" viewBox="0 0 48 48" fill="none" stroke="#6b573c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${CARD_FLOWERS[id] || ICONS.daisy}</svg>`;
}
export function fmt(n) { return (Math.round(n * 100) / 100).toLocaleString("zh-CN"); }
export function goalPct(g) { return Math.min(100, Math.round((g.current / (g.target || 1)) * 100)); }

/* ---- 编辑器 ---- */
export function openEditor(type, item) {
  const mod = CONFIG.modules.find(m => m.type === type);
  const form = {};
  (FIELDS[type] || []).forEach(f => {
    if (f.t === "number") form[f.k] = item ? item[f.k] : (f.k === "target" ? 100 : (f.k === "amount" ? null : 0));
    else if (f.t === "date") form[f.k] = item ? item[f.k] : today.value;
    else if (f.t === "seg") form[f.k] = item ? item[f.k] : f.options[0].v;
    else if (f.t === "select") form[f.k] = item ? item[f.k] : (mod.categories || [])[0];
    else form[f.k] = item ? item[f.k] : "";
  });
  store.ed = { show: true, type, form, editing: item ? item.id : null };
}
export function saveRecord() {
  const { type, form, editing } = store.ed;
  const mod = CONFIG.modules.find(m => m.type === type);
  // 基本校验
  if (type === "todo" && !form.text.trim()) return toast("事项内容还没写");
  if (type === "checkin" && !form.name.trim()) return toast("习惯名称还没写");
  if (type === "ledger" && !(+form.amount > 0)) return toast("金额要大于 0");
  if (type === "goal" && (!form.name.trim() || !(+form.target > 0))) return toast("目标名称和总量必填");
  if (type === "notes" && !form.title.trim()) return toast("标题还没写");

  const list = store.data[mod.id] || (store.data[mod.id] = []);
  if (editing) {
    const it = list.find(x => x.id === editing);
    if (it) Object.assign(it, form);
    toast("修订已付印 ✓");
  } else {
    const it = Object.assign({ id: uid() }, form);
    if (type === "todo") it.done = false;
    if (type === "checkin") { it.done = false; it.streak = 0; it.lastDone = ""; if (!it.emoji) it.emoji = "🌱"; }
    if (type === "goal") { it.current = +it.current || 0; it.target = +it.target; if (!it.emoji) it.emoji = "🌱"; it.lastStep = ""; it.waterLog = []; }
    if (type === "ledger") { it.amount = +it.amount; if (!it.date) it.date = today.value; }
    if (type === "notes") it.date = today.value;
    list.unshift(it);
    toast("已刊登到本报 ✓");
  }
  store.ed.show = false;
}
export function del(modId, id) {
  store.data[modId] = store.data[modId].filter(x => x.id !== id);
  toast("已撤下该条");
}

/* ---- 模块操作 ---- */
export function toggleTodo(x) { x.done = !x.done; }
export function toggleCheck(x) {
  if (!x.done) {
    x.streak = (x.lastDone === yesterdayStr()) ? (x.streak || 0) + 1 : 1;
    x.done = true; x.lastDone = today.value;
    toast(`盖章成功！连续 ${x.streak} 天 🌸`);
  } else {
    x.done = false; x.streak = Math.max(0, (x.streak || 1) - 1); x.lastDone = "";
  }
}
export function stepGoal(g) {
  if (g.current < g.target) {
    g.current = (+g.current || 0) + 1;
    g.lastStep = today.value;
    if (!g.waterLog) g.waterLog = [];
    if (!g.waterLog.includes(today.value)) g.waterLog.push(today.value);
    g._w = true; setTimeout(() => { g._w = false; }, 950);
    if (g.current >= g.target) toast("🎉 目标达成，加印喜报！");
    else toast("浇水成功，藤蔓 +1 🌿");
  }
}
export function goalStreak(g) {
  const log = g.waterLog || [];
  let n = 0; const d = new Date();
  if (!log.includes(todayStr(d))) d.setDate(d.getDate() - 1);
  while (log.includes(todayStr(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
/* 目标养成花：按进度分 5 个生长阶段，浇水时落水滴 */
export function flowerSvg(g) {
  const pct = goalPct(g);
  const st = pct >= 100 ? 4 : pct >= 75 ? 3 : pct >= 50 ? 2 : pct >= 25 ? 1 : 0;
  const I = `stroke="#6b573c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"`;
  const GR = `stroke="#5c8a4e" stroke-width="2.4" stroke-linecap="round" fill="none"`;
  let plant = "";
  if (st === 0) {
    plant = `<ellipse cx="24" cy="48.5" rx="3.8" ry="2.6" fill="#a98a63" ${I}/>`;
  } else if (st === 1) {
    plant = `<path d="M24 49 V38" ${GR}/><path d="M24 44c-4 .4-6-1.4-6.6-4.6 3.4-.4 5.8 1.2 6.6 4.6z" fill="#8cb874" ${I}/><path d="M24 40c3.6.4 5.6-1.2 6.2-4.2-3.2-.4-5.4 1-6.2 4.2z" fill="#5c8a4e" ${I}/>`;
  } else if (st === 2) {
    plant = `<path d="M24 49 V31" ${GR}/><path d="M24 42c-4.2.4-6.2-1.4-6.8-4.8 3.6-.4 6 1.2 6.8 4.8z" fill="#8cb874" ${I}/><path d="M24 37c4 .4 6-1.2 6.6-4.6-3.4-.4-5.8 1.2-6.6 4.6z" fill="#5c8a4e" ${I}/><ellipse cx="24" cy="25.5" rx="4.6" ry="6.2" fill="#f4a24a" ${I}/><path d="M24 20c1.6 2.2 1.6 4.4 0 6.6" fill="none" stroke="#c06a14" stroke-width="1.2"/>`;
  } else {
    const big = st === 4, cx = 24, cy = big ? 22 : 24, R = big ? 4 : 3, pr = big ? 3.4 : 2.7, pl = big ? 4.8 : 4;
    let petals = "";
    for (let k = 0; k < (big ? 6 : 5); k++) {
      const a = k * (360 / (big ? 6 : 5));
      const px = cx + R * 2 * Math.sin(a * Math.PI / 180), py = cy - R * 2 * Math.cos(a * Math.PI / 180);
      petals += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${pr}" ry="${pl}" fill="#fffdf6" ${I} transform="rotate(${a} ${px.toFixed(1)} ${py.toFixed(1)})"/>`;
    }
    plant = `<path d="M24 49 V${cy + 7}" ${GR}/><path d="M24 42c-4.2.4-6.2-1.4-6.8-4.8 3.6-.4 6 1.2 6.8 4.8z" fill="#8cb874" ${I}/><path d="M24 37c4 .4 6-1.2 6.6-4.6-3.4-.4-5.8 1.2-6.6 4.6z" fill="#5c8a4e" ${I}/>${petals}<circle cx="${cx}" cy="${cy}" r="${R}" fill="#f6c453" ${I}/>`
      + (big ? `<path d="M9 12l1.6 3.2L14 16.8l-3.4 1.6L9 21.6 7.4 18.4 4 16.8l3.4-1.6z" fill="#f6c453"/><path d="M38 8l1.2 2.4 2.4 1.2-2.4 1.2L38 15.2l-1.2-2.4-2.4-1.2 2.4-1.2z" fill="#f09a33"/>` : "");
  }
  const drops = g._w ? `<g class="wdrop" fill="#8ec9e8"><circle cx="18" cy="6" r="2.2"/><circle cx="26" cy="2" r="2.4"/><circle cx="31" cy="8" r="1.9"/></g>` : "";
  return `<svg viewBox="0 0 48 66" class="fplant">${drops}${plant}<rect x="12" y="49" width="24" height="5" rx="2.2" fill="#f09a33" ${I}/><path d="M14.5 54h19l-2.6 10H17.1z" fill="#f4a24a" ${I}/></svg>`;
}
export function pinNote(x) { x.pinned = !x.pinned; }
export function quickAdd() {
  const m = curMod.value;
  if (m && m.type !== "dashboard") openEditor(m.type);
  else openEditor("todo");
}

/* ---- 统一导出给组件模板使用 ---- */
export function useApp() {
  return {
    ...toRefs(store),
    cfg: CONFIG,
    profile,
    today, cnDate, issueNo, greeting, curMod, edFields, edMod,
    todos, todoDone, checks, checkDone, goals, notes, bills,
    monthBills, monthOut, monthIn, todayOut, catBars, goalAvg,
    sortedTodos, noteTags, filteredNotes, dailyQuote, last7, archivePick, totalProgress,
    go, toast, catEmoji, icon, cardIcon, fmt, goalPct,
    openEditor, saveRecord, del, toggleTodo, toggleCheck,
    stepGoal, goalStreak, flowerSvg, pinNote, quickAdd
  };
}
