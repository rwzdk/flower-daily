/* ============================================================
   花海生活报 · Vue 应用逻辑（桌面版与手机版共用）
   ============================================================ */

const CONFIG = {
  profile: { name: "阿棠", avatar: "🌼", subtitle: "花海编辑部 · 主笔" },
  storageKey: "flower-daily-v1",
  modules: [
    { id: "home",  type: "dashboard", icon: "home", name: "头版",     en: "FRONT PAGE", desc: "今日总览与导览" },
    { id: "todo",  type: "todo",      icon: "pin", name: "今日要务", en: "AGENDA",     desc: "当天计划，办完就划掉",
      seed: [
        { text: "写花海专题开篇", level: "high", done: true },
        { text: "校对上周账目版面", level: "mid", done: true },
        { text: "给绿萝浇水并拍照存档", level: "mid", done: false },
        { text: "整理灵感剪报夹", level: "low", done: false }
      ] },
    { id: "check", type: "checkin",   icon: "bloom", name: "盖章处",   en: "POSTMARKS",  desc: "习惯打卡，完成即盖戳",
      seed: [
        { name: "晨跑 3km", emoji: "🏃", done: true,  streak: 12 },
        { name: "阅读 30 分钟", emoji: "📖", done: true,  streak: 8 },
        { name: "喝够 8 杯水", emoji: "💧", done: false, streak: 5 }
      ] },
    { id: "money", type: "ledger",    icon: "receipt", name: "账房",     en: "LEDGER",     desc: "收支流水，心中有数",
      categories: ["餐饮", "购物", "交通", "花草", "居家", "娱乐", "稿费", "工资", "其他"],
      seed: [
        { kind: "expense", cat: "餐饮", amount: 28, note: "手冲咖啡", date: "today" },
        { kind: "expense", cat: "花草", amount: 35, note: "花市买洋桔梗", date: "today" },
        { kind: "expense", cat: "餐饮", amount: 23, note: "午餐·牛肉面", date: "today" },
        { kind: "income",  cat: "稿费", amount: 500, note: "专栏稿费到账", date: "today" }
      ] },
    { id: "goal",  type: "goal",      icon: "sprout", name: "长线连载", en: "SERIALS",    desc: "长期目标，每天 +1",
      seed: [
        { name: "读完《植物图鉴》", emoji: "📚", current: 128, target: 240, unit: "页", note: "读到菊科了，很应季", lastStep: "" },
        { name: "存下旅行基金", emoji: "✈️", current: 3200, target: 8000, unit: "元", note: "春天去看油菜花", lastStep: "" },
        { name: "学会 30 道家常菜", emoji: "🍳", current: 17, target: 30, unit: "道", note: "", lastStep: "" }
      ] },
    { id: "note",  type: "notes",     icon: "scissors", name: "灵感剪报", en: "CLIPPINGS",  desc: "摘录、灵感与碎碎念",
      seed: [
        { title: "把日子过成连载", body: "每天一小块版面，坚持刊出，就是一部个人编年史。", tag: "写作", date: "today" },
        { title: "花海配色实验记录", body: "橘黄做标题、墨绿做骨架，米白留呼吸——像野花一样有秩序地生长。", tag: "设计", date: "today" },
        { title: "给绿萝的信", body: "你长新叶了，我也长本事了。", tag: "碎碎念", date: "today" }
      ] }
  ],
  tabbar: ["home", "todo", "check", "money", "note"]
};

/* ---- 编辑器字段配置 ---- */
const FIELDS = {
  todo: [
    { k: "text",  l: "事项内容", t: "text", ph: "今天要刊登什么任务？" },
    { k: "level", l: "优先级",   t: "seg", options: [{ v: "high", l: "P0 紧急" }, { v: "mid", l: "P1 普通" }, { v: "low", l: "P2 缓办" }] }
  ],
  checkin: [
    { k: "name",  l: "习惯名称", t: "text", ph: "如：晨跑 3km" },
    { k: "emoji", l: "图标 emoji", t: "text", ph: "如：🏃" }
  ],
  ledger: [
    { k: "kind",   l: "收支类型", t: "seg", options: [{ v: "expense", l: "支出" }, { v: "income", l: "收入" }] },
    { k: "cat",    l: "分类",     t: "select" },
    { k: "amount", l: "金额",     t: "number", ph: "0.00" },
    { k: "note",   l: "备注",     t: "text", ph: "花在哪 / 从哪来" },
    { k: "date",   l: "日期",     t: "date" }
  ],
  goal: [
    { k: "name",    l: "目标名称", t: "text", ph: "如：读完《植物图鉴》" },
    { k: "emoji",   l: "图标 emoji", t: "text", ph: "如：📚" },
    { k: "current", l: "当前进度", t: "number", ph: "0" },
    { k: "target",  l: "目标总量", t: "number", ph: "100" },
    { k: "unit",    l: "单位",     t: "text", ph: "页 / 元 / 天…" },
    { k: "note",    l: "编辑批注", t: "text", ph: "一句给自己打气的话" }
  ],
  notes: [
    { k: "title", l: "标题", t: "text", ph: "这则剪报叫什么？" },
    { k: "body",  l: "正文", t: "textarea", ph: "剪下这一刻的想法…" },
    { k: "tag",   l: "标签", t: "text", ph: "如：写作 / 设计 / 碎碎念" }
  ]
};

const CAT_EMOJI = { "餐饮": "🍜", "购物": "🛍️", "交通": "🚌", "花草": "🌷", "居家": "🏠", "娱乐": "🎈", "稿费": "✒️", "工资": "💰", "其他": "📦" };

/* ---- 手绘卡通图标（墨线描边 + 橘黄墨绿填充，贴合手账花海风格） ---- */
const ICONS = {
  home: '<path d="M4.5 11.4 12 4.6l7.5 6.8"/><path d="M6.6 10.2v9.2h10.8v-9.2" fill="#fffdf6"/><rect x="10.1" y="13.6" width="3.8" height="5.8" rx="1.2" fill="#f09a33"/><circle cx="16.9" cy="7.2" r="1.2" fill="#f6c453"/>',
  pin: '<path d="M9.2 3.6h5.6l-.9 5.5 2.9 2.6v1.8H7.2v-1.8l2.9-2.6z" fill="#f09a33"/><path d="M12 13.5v6.3"/><circle cx="12" cy="6.4" r="1.1" fill="#fffdf6"/>',
  bloom: '<g fill="#fffdf6"><ellipse cx="12" cy="6.6" rx="2.2" ry="3.1"/><ellipse cx="17" cy="10.2" rx="2.2" ry="3.1" transform="rotate(72 17 10.2)"/><ellipse cx="15.2" cy="16.1" rx="2.2" ry="3.1" transform="rotate(144 15.2 16.1)"/><ellipse cx="8.8" cy="16.1" rx="2.2" ry="3.1" transform="rotate(216 8.8 16.1)"/><ellipse cx="7" cy="10.2" rx="2.2" ry="3.1" transform="rotate(288 7 10.2)"/></g><circle cx="12" cy="11.8" r="2.6" fill="#f6c453"/>',
  receipt: '<path d="M6.5 3.6h11v16.8l-1.8-1.4-1.8 1.4-1.9-1.4-1.9 1.4-1.8-1.4-1.8 1.4z" fill="#fffdf6"/><path d="M9.2 8.2h5.6M9.2 11.6h5.6M9.2 15h3.6"/>',
  sprout: '<path d="M6.6 13.4h10.8l-1.4 6.8H8z" fill="#f4a24a"/><path d="M12 13.4V9.2"/><path d="M12 9.2c0-3-2.4-4.6-5.4-4.4.2 3 2.2 4.6 5.4 4.4z" fill="#8cb874"/><path d="M12 9.9c0-2.6 2-4 4.8-3.9-.2 2.6-2 4-4.8 3.9z" fill="#5c8a4e"/>',
  scissors: '<circle cx="6.9" cy="6.9" r="2.6" fill="#fffdf6"/><circle cx="6.9" cy="17.1" r="2.6" fill="#fffdf6"/><path d="M9.1 8.7 18.6 17M9.1 15.3 18.6 7"/>',
  mail: '<rect x="4" y="6" width="16" height="12" rx="2.2" fill="#fffdf6"/><path d="m5.2 7.6 6.8 5.3 6.8-5.3"/>',
  daisy: '<g fill="#fffdf6"><ellipse cx="12" cy="6.6" rx="2.2" ry="3.1"/><ellipse cx="17" cy="10.2" rx="2.2" ry="3.1" transform="rotate(72 17 10.2)"/><ellipse cx="15.2" cy="16.1" rx="2.2" ry="3.1" transform="rotate(144 15.2 16.1)"/><ellipse cx="8.8" cy="16.1" rx="2.2" ry="3.1" transform="rotate(216 8.8 16.1)"/><ellipse cx="7" cy="10.2" rx="2.2" ry="3.1" transform="rotate(288 7 10.2)"/></g><circle cx="12" cy="11.8" r="2.6" fill="#f6c453"/>'
};

/* ---- 工具 ---- */
function dstr(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function todayStr() { return dstr(new Date()); }
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return dstr(d); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

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

/* ---- 编辑器组件（两端共用） ---- */
const EditorModal = {
  props: ["ed", "fields", "mod"],
  emits: ["save", "close"],
  template: `
  <div class="mask" @click.self="$emit('close')">
    <div class="editor">
      <h3>{{ ed.editing ? "修订这则记录" : "新增 · " + mod.name }}</h3>
      <div class="f-row" v-for="f in fields" :key="f.k">
        <label>{{ f.l }}</label>
        <input v-if="f.t==='text'" type="text" v-model="ed.form[f.k]" :placeholder="f.ph||''">
        <textarea v-else-if="f.t==='textarea'" v-model="ed.form[f.k]" :placeholder="f.ph||''"></textarea>
        <input v-else-if="f.t==='number'" type="number" min="0" step="any" v-model.number="ed.form[f.k]" :placeholder="f.ph||''">
        <input v-else-if="f.t==='date'" type="date" v-model="ed.form[f.k]">
        <select v-else-if="f.t==='select'" v-model="ed.form[f.k]">
          <option v-for="c in mod.categories||[]" :key="c" :value="c">{{ c }}</option>
        </select>
        <div v-else-if="f.t==='seg'" class="seg">
          <button v-for="o in f.options" :key="o.v" class="op" :class="{on:ed.form[f.k]===o.v}" @click="ed.form[f.k]=o.v">{{ o.l }}</button>
        </div>
      </div>
      <div class="f-acts">
        <button class="btn ghost" @click="$emit('close')">再想想</button>
        <button class="btn" :class="{orange:mod.type==='ledger'}" @click="$emit('save')">付印保存 ✓</button>
      </div>
    </div>
  </div>`
};

/* ---- 应用工厂 ---- */
function createWorkbenchApp() {
  const app = Vue.createApp({
    data() {
      return {
        cfg: CONFIG,
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
      };
    },
    computed: {
      today() { return todayStr(); },
      cnDate() {
        const d = new Date();
        const wk = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${wk}`;
      },
      issueNo() {
        const d = new Date(), s = new Date(d.getFullYear(), 0, 0);
        return String(Math.floor((d - s) / 864e5)).padStart(3, "0");
      },
      greeting() {
        const h = new Date().getHours();
        return h < 6 ? "夜深了" : h < 9 ? "早上好" : h < 12 ? "上午好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";
      },
      curMod() { return this.cfg.modules.find(m => m.id === this.screen); },
      edFields() { return FIELDS[this.ed.type] || []; },
      edMod() { return this.cfg.modules.find(m => m.type === this.ed.type) || this.cfg.modules[0]; },
      todos() { return this.data.todo || []; },
      todoDone() { return this.todos.filter(x => x.done).length; },
      checks() { return this.data.check || []; },
      checkDone() { return this.checks.filter(x => x.done).length; },
      goals() { return this.data.goal || []; },
      notes() { return this.data.note || []; },
      bills() { return (this.data.money || []).slice().sort((a, b) => b.date.localeCompare(a.date)); },
      monthBills() { const p = this.today.slice(0, 7); return this.bills.filter(b => (b.date || "").startsWith(p)); },
      monthOut() { return this.monthBills.filter(b => b.kind === "expense").reduce((s, b) => s + (+b.amount || 0), 0); },
      monthIn() { return this.monthBills.filter(b => b.kind === "income").reduce((s, b) => s + (+b.amount || 0), 0); },
      todayOut() { return this.bills.filter(b => b.kind === "expense" && b.date === this.today).reduce((s, b) => s + (+b.amount || 0), 0); },
      catBars() {
        const map = {};
        this.monthBills.filter(b => b.kind === "expense").forEach(b => { map[b.cat] = (map[b.cat] || 0) + (+b.amount || 0); });
        const arr = Object.entries(map).map(([cat, v]) => ({ cat, v })).sort((a, b) => b.v - a.v);
        const max = arr.length ? arr[0].v : 1;
        return arr.map(x => ({ cat: x.cat, v: x.v, pct: Math.round(x.v / max * 100) }));
      },
      goalAvg() {
        if (!this.goals.length) return 0;
        return Math.round(this.goals.reduce((s, g) => s + Math.min(100, (g.current / (g.target || 1)) * 100), 0) / this.goals.length);
      },
      sortedTodos() {
        const rank = { high: 0, mid: 1, low: 2 };
        return this.todos.slice().sort((a, b) => (a.done - b.done) || ((rank[a.level] ?? 1) - (rank[b.level] ?? 1)));
      },
      noteTags() {
        return [...new Set(this.notes.map(n => n.tag).filter(Boolean))];
      },
      filteredNotes() {
        const list = this.noteTag ? this.notes.filter(n => n.tag === this.noteTag) : this.notes.slice();
        return list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      },
      dailyQuote() {
        return this.quotes[(+this.issueNo) % this.quotes.length];
      },
      totalProgress() {
        const parts = [];
        if (this.todos.length) parts.push(this.todoDone / this.todos.length);
        if (this.checks.length) parts.push(this.checkDone / this.checks.length);
        if (!parts.length) return 0;
        return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length * 100);
      }
    },
    watch: {
      data: { deep: true, handler() { this.persist(); } },
      checkinDay() { this.persist(); }
    },
    created() {
      try {
        const raw = localStorage.getItem(this.cfg.storageKey);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.data) this.data = saved.data;
          if (saved.checkinDay) this.checkinDay = saved.checkinDay;
        }
      } catch (e) { /* 数据损坏则用种子数据 */ }
      // 跨天自动重置打卡（保留连续天数）
      if (this.checkinDay !== this.today) {
        this.checks.forEach(c => { c.done = false; });
        this.checkinDay = this.today;
      }
    },
    methods: {
      persist() {
        try { localStorage.setItem(this.cfg.storageKey, JSON.stringify({ data: this.data, checkinDay: this.checkinDay })); } catch (e) {}
      },
      go(id) { this.screen = id; this.drawer = false; window.scrollTo({ top: 0, behavior: "smooth" }); },
      toast(msg) {
        const t = { id: uid(), msg };
        this.toasts.push(t);
        setTimeout(() => { this.toasts = this.toasts.filter(x => x.id !== t.id); }, 2200);
      },
      catEmoji(cat) { return CAT_EMOJI[cat] || "📦"; },
      icon(name) {
        return `<svg class="icn" viewBox="0 0 24 24" fill="none" stroke="#6b573c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.daisy}</svg>`;
      },
      fmt(n) { return (Math.round(n * 100) / 100).toLocaleString("zh-CN"); },
      goalPct(g) { return Math.min(100, Math.round((g.current / (g.target || 1)) * 100)); },

      /* ---- 编辑器 ---- */
      openEditor(type, item) {
        const mod = this.cfg.modules.find(m => m.type === type);
        const form = {};
        (FIELDS[type] || []).forEach(f => {
          if (f.t === "number") form[f.k] = item ? item[f.k] : (f.k === "target" ? 100 : (f.k === "amount" ? null : 0));
          else if (f.t === "date") form[f.k] = item ? item[f.k] : this.today;
          else if (f.t === "seg") form[f.k] = item ? item[f.k] : f.options[0].v;
          else if (f.t === "select") form[f.k] = item ? item[f.k] : (mod.categories || [])[0];
          else form[f.k] = item ? item[f.k] : "";
        });
        this.ed = { show: true, type, form, editing: item ? item.id : null };
      },
      saveRecord() {
        const { type, form, editing } = this.ed;
        const mod = this.cfg.modules.find(m => m.type === type);
        // 基本校验
        if (type === "todo" && !form.text.trim()) return this.toast("事项内容还没写");
        if (type === "checkin" && !form.name.trim()) return this.toast("习惯名称还没写");
        if (type === "ledger" && !(+form.amount > 0)) return this.toast("金额要大于 0");
        if (type === "goal" && (!form.name.trim() || !(+form.target > 0))) return this.toast("目标名称和总量必填");
        if (type === "notes" && !form.title.trim()) return this.toast("标题还没写");

        const list = this.data[mod.id] || (this.data[mod.id] = []);
        if (editing) {
          const it = list.find(x => x.id === editing);
          if (it) Object.assign(it, form);
          this.toast("修订已付印 ✓");
        } else {
          const it = Object.assign({ id: uid() }, form);
          if (type === "todo") it.done = false;
          if (type === "checkin") { it.done = false; it.streak = 0; it.lastDone = ""; if (!it.emoji) it.emoji = "🌱"; }
          if (type === "goal") { it.current = +it.current || 0; it.target = +it.target; if (!it.emoji) it.emoji = "🌱"; it.lastStep = ""; }
          if (type === "ledger") { it.amount = +it.amount; if (!it.date) it.date = this.today; }
          if (type === "notes") it.date = this.today;
          list.unshift(it);
          this.toast("已刊登到本报 ✓");
        }
        this.ed.show = false;
      },
      del(modId, id) {
        this.data[modId] = this.data[modId].filter(x => x.id !== id);
        this.toast("已撤下该条");
      },

      /* ---- 模块操作 ---- */
      toggleTodo(x) { x.done = !x.done; },
      toggleCheck(x) {
        if (!x.done) {
          x.streak = (x.lastDone === yesterdayStr()) ? (x.streak || 0) + 1 : 1;
          x.done = true; x.lastDone = this.today;
          this.toast(`盖章成功！连续 ${x.streak} 天 🌸`);
        } else {
          x.done = false; x.streak = Math.max(0, (x.streak || 1) - 1); x.lastDone = "";
        }
      },
      stepGoal(g) {
        if (g.current < g.target) {
          g.current = (+g.current || 0) + 1;
          g.lastStep = this.today;
          if (g.current >= g.target) this.toast("🎉 目标达成，加印喜报！");
          else this.toast("浇水成功，藤蔓 +1 🌿");
        }
      },
      pinNote(x) { x.pinned = !x.pinned; },
      quickAdd() {
        const m = this.curMod;
        if (m && m.type !== "dashboard") this.openEditor(m.type);
        else this.openEditor("todo");
      }
    }
  });
  app.component("editor-modal", EditorModal);
  return app;
}
