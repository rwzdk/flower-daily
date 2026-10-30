/* ---- 全局配置（两个入口共用） ---- */
export const CONFIG = {
  profile: { name: "阿棠", avatar: "daisy", subtitle: "花海编辑部 · 主笔" },
  storageKey: "flower-daily-v1",
  /* 后端 API 地址（Cloudflare Worker）：
     使用绑定到 Worker 的自定义域名，避免 workers.dev 在部分网络不可达；
     也可在浏览器控制台 localStorage.setItem("fd-api-base", "https://…") 临时覆盖 */
  apiBase: "https://flower-api.mindofqc.dpdns.org",
  github: "https://github.com/rwzdk/flower-daily",
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
        { name: "读完《植物图鉴》", emoji: "📚", current: 128, target: 240, unit: "页", note: "读到菊科了，很应季", lastStep: "", waterLog: [] },
        { name: "存下旅行基金", emoji: "✈️", current: 3200, target: 8000, unit: "元", note: "春天去看油菜花", lastStep: "", waterLog: [] },
        { name: "学会 30 道家常菜", emoji: "🍳", current: 17, target: 30, unit: "道", note: "", lastStep: "", waterLog: [] }
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
export const FIELDS = {
  todo: [
    { k: "text",  l: "事项内容", t: "text", ph: "今天要刊登什么任务？" },
    { k: "level", l: "优先级",   t: "seg", options: [{ v: "high", l: "P0 紧急" }, { v: "mid", l: "P1 普通" }, { v: "low", l: "P2 缓办" }] }
  ],
  checkin: [
    { k: "name",  l: "习惯名称", t: "text", ph: "如：晨跑 3km" },
    { k: "emoji", l: "图章图标", t: "icon" },
    { k: "img",   l: "自选图章", t: "file", ph: "从本地选择一张图片作为图章" }
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
    { k: "emoji",   l: "图章图标", t: "icon" },
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

export const CAT_ICON = { "餐饮": "bowl", "购物": "bag", "交通": "bus", "花草": "tulip", "居家": "home", "娱乐": "balloon", "稿费": "pencil", "工资": "coin", "其他": "box" };

/* ---- 旧 emoji 数据 → 手绘图标 映射（渲染层统一转 SVG，不再显示系统 emoji） ---- */
export const EMOJI_ICON = {
  "🏃": "run", "📖": "book", "📚": "book", "💧": "drop", "✈️": "plane2", "✈": "plane2",
  "🍳": "pan", "🌱": "sprout", "🌼": "daisy", "🌷": "tulip", "🌻": "bloom", "🌿": "sprout",
  "🍀": "clover", "🌸": "bloom", "🫖": "tea", "☕": "tea", "📌": "pin", "🧾": "receipt",
  "📊": "chart", "✂️": "scissors", "✂": "scissors", "📰": "news", "💬": "chat",
  "☁️": "cloudup", "☁": "cloudup", "✎": "pencil", "✒️": "pencil", "✒": "pencil",
  "📍": "place", "📁": "folder", "💰": "coin", "📦": "box", "🛍️": "bag", "🛍": "bag",
  "🚌": "bus", "🏠": "home", "🎈": "balloon", "🎉": "party", "🔥": "flame", "🍜": "bowl"
};

/* ---- 头像可选手绘图标集 ---- */
export const AVATAR_ICONS = ["daisy", "tulip", "bloom", "clover", "sprout", "tea", "book", "scissors", "balloon", "coin", "drop", "flame"];

/* ---- 习惯/目标图章可选集 ---- */
export const STAMP_ICONS = ["run", "book", "drop", "pan", "plane2", "sprout", "tea", "coin", "flame", "balloon", "scissors", "pin", "daisy", "tulip", "bloom", "clover"];

/* ---- 手绘多彩图标（墨线勾边 + 橘黄/墨绿/奶黄/米白手账配色） ---- */
export const ICONS = {
  home: '<path d="M4.2 11.8 12 4.6l7.8 7.2"/><path d="M6.3 10.4v9.2h11.4v-9.2" fill="#fffdf6"/><path d="M6.3 10.4v9.2h11.4v-9.2"/><rect x="9.9" y="13.2" width="4.2" height="6.4" rx="1.3" fill="#f09a33"/><path d="M9.9 16.4h4.2"/><circle cx="16.9" cy="13.4" r="1.35" fill="#f6c453"/><path d="M16.9 12.05v2.7M15.55 13.4h2.7"/><ellipse cx="4.6" cy="19.7" rx="1.9" ry="1.3" fill="#8cb874"/><path d="M2.7 19.7h3.8"/>',
  pin: '<path d="M9 3.7h6l-.9 5.4 2.8 2.5v1.9H7.1v-1.9l2.8-2.5z" fill="#f09a33"/><path d="M9 3.7h6l-.9 5.4 2.8 2.5v1.9H7.1v-1.9l2.8-2.5z"/><path d="M12 13.5v6.4"/><circle cx="12" cy="6.3" r="1.2" fill="#f6c453"/><path d="M12 5.1v2.4"/>',
  bloom: '<g fill="#f4a24a"><ellipse cx="12" cy="5.6" rx="2.3" ry="3.2"/><ellipse cx="17.1" cy="9.3" rx="2.3" ry="3.2" transform="rotate(72 17.1 9.3)"/><ellipse cx="15.2" cy="15.4" rx="2.3" ry="3.2" transform="rotate(144 15.2 15.4)"/><ellipse cx="8.8" cy="15.4" rx="2.3" ry="3.2" transform="rotate(216 8.8 15.4)"/><ellipse cx="6.9" cy="9.3" rx="2.3" ry="3.2" transform="rotate(288 6.9 9.3)"/></g><g stroke="#6b573c" stroke-width="1.1"><ellipse cx="12" cy="5.6" rx="2.3" ry="3.2"/><ellipse cx="17.1" cy="9.3" rx="2.3" ry="3.2" transform="rotate(72 17.1 9.3)"/><ellipse cx="15.2" cy="15.4" rx="2.3" ry="3.2" transform="rotate(144 15.2 15.4)"/><ellipse cx="8.8" cy="15.4" rx="2.3" ry="3.2" transform="rotate(216 8.8 15.4)"/><ellipse cx="6.9" cy="9.3" rx="2.3" ry="3.2" transform="rotate(288 6.9 9.3)"/></g><circle cx="12" cy="10.9" r="2.7" fill="#f6c453" stroke="#6b573c" stroke-width="1.1"/><path d="M12 15.4v6.2" stroke="#5c8a4e" stroke-width="1.9"/><path d="M11.9 19.3c-2.7-.3-4.5-1.8-5.1-4.1 2.7.2 4.5 1.6 5.1 4.1z" fill="#8cb874" stroke="#6b573c" stroke-width="1"/>',
  receipt: '<path d="M6.5 3.7h11v16.7l-1.8-1.4-1.8 1.4-1.9-1.4-1.9 1.4-1.8-1.4-1.8 1.4z" fill="#fffdf6"/><path d="M6.5 3.7h11v16.7l-1.8-1.4-1.8 1.4-1.9-1.4-1.9 1.4-1.8-1.4-1.8 1.4z"/><path d="M9.2 8h5.6M9.2 11.4h5.6" stroke-dasharray="1.4 1.4"/><path d="M9.2 15h2.8"/><circle cx="15.9" cy="15.6" r="2.5" fill="#f6c453" stroke="#6b573c" stroke-width="1.1"/><path d="M15.9 14.3v2.6M14.6 15.6h2.6"/>',
  sprout: '<path d="M6.7 13.4h10.6l-1.4 6.9H8.1z" fill="#f4a24a"/><path d="M6.7 13.4h10.6l-1.4 6.9H8.1z"/><path d="M12 13.4V9.1"/><path d="M11.9 9c-.1-2.9-2.3-4.5-5.2-4.3.2 2.9 2.2 4.5 5.2 4.3z" fill="#8cb874"/><path d="M12.1 9.6c.1-2.5 2-3.9 4.6-3.8-.2 2.5-2 3.9-4.6 3.8z" fill="#5c8a4e"/><path d="M8.6 16.2h6.8"/>',
  scissors: '<circle cx="6.8" cy="6.9" r="2.7" fill="#f4a24a"/><circle cx="6.8" cy="6.9" r="2.7"/><circle cx="6.8" cy="17.1" r="2.7" fill="#8cb874"/><circle cx="6.8" cy="17.1" r="2.7"/><path d="M9.2 8.8 18.7 17.1M9.2 15.2 18.7 6.9"/><path d="M13.5 12.4l2 1.7"/><circle cx="6.8" cy="6.9" r="1" fill="#fffdf6"/><circle cx="6.8" cy="17.1" r="1" fill="#fffdf6"/>',
  mail: '<rect x="3.8" y="5.8" width="16.4" height="12.4" rx="2.3" fill="#fffdf6"/><rect x="3.8" y="5.8" width="16.4" height="12.4" rx="2.3"/><path d="m5.1 7.5 6.9 5.4 6.9-5.4"/><circle cx="12" cy="14" r="2.3" fill="#f09a33" stroke="#6b573c" stroke-width="1.1"/><path d="M12 12.8v2.4M10.8 14h2.4"/>',
  news: '<rect x="4" y="4.5" width="13" height="15" rx="1.6" fill="#fffdf6"/><rect x="4" y="4.5" width="13" height="15" rx="1.6"/><path d="M17 8h2.4a1 1 0 0 1 1 1v8.5a2.5 2.5 0 0 1-2.5 2.5H6"/><path d="M7 8.2h7M7 11h7M7 13.8h4.2"/><circle cx="14.6" cy="15.2" r="2.2" fill="#f4a24a" stroke="#6b573c" stroke-width="1"/><circle cx="14.6" cy="15.2" r=".8" fill="#f6c453"/>',
  pencil: '<path d="M4.5 19.5 5.8 15 16 4.8l3.2 3.2L9 18.2z" fill="#f6c453"/><path d="M4.5 19.5 5.8 15 16 4.8l3.2 3.2L9 18.2z"/><path d="M14.7 6.1l2.5 2.5"/><path d="M18.6 5l1-1a1.4 1.4 0 0 1 2 2l-1 1" fill="#ef8fa3"/><path d="M4.5 19.5l3.6-1.3" fill="#f09a33"/>',
  chat: '<path d="M4 6.5h16v9.5h-8.5l-4 3.5v-3.5H4z" fill="#fffdf6"/><path d="M4 6.5h16v9.5h-8.5l-4 3.5v-3.5H4z"/><circle cx="8.8" cy="11.2" r="1.2" fill="#f4a24a"/><circle cx="12.6" cy="11.2" r="1.2" fill="#8cb874"/><circle cx="16.4" cy="11.2" r="1.2" fill="#7fa8c9"/>',
  chart: '<path d="M4 20.5h16.5"/><rect x="5.3" y="11" width="3.6" height="9.5" rx="1" fill="#8cb874"/><rect x="10.2" y="6.5" width="3.6" height="14" rx="1" fill="#f4a24a"/><rect x="15.1" y="13.5" width="3.6" height="7" rx="1" fill="#7fa8c9"/>',
  cloudup: '<path d="M7 16.5a3.6 3.6 0 0 1 .8-7.1A5.2 5.2 0 0 1 18 8a3.8 3.8 0 0 1-.4 7.6z" fill="#eef4f8"/><path d="M7 16.5a3.6 3.6 0 0 1 .8-7.1A5.2 5.2 0 0 1 18 8a3.8 3.8 0 0 1-.4 7.6"/><path d="M12 20.5v-5M9.8 17.6 12 15.4l2.2 2.2"/>',
  drop: '<path d="M12 3.8C9 8 6.6 11 6.6 14a5.4 5.4 0 0 0 10.8 0c0-3-2.4-6-5.4-10.2z" fill="#a9cde8"/><path d="M12 3.8C9 8 6.6 11 6.6 14a5.4 5.4 0 0 0 10.8 0c0-3-2.4-6-5.4-10.2z"/><path d="M9.6 14.2a2.4 2.4 0 0 0 2 2.4" stroke="#fff"/>',
  flame: '<path d="M12 3.5c1 3-2.4 4.6-2.4 7.2a4.6 4.6 0 0 0 9.2.8C19.4 7 14.5 6 12 3.5z" fill="#f4a24a"/><path d="M12 3.5c1 3-2.4 4.6-2.4 7.2a4.6 4.6 0 0 0 9.2.8C19.4 7 14.5 6 12 3.5z"/><path d="M12 20.5a3 3 0 0 1-3-3c0-1.8 1.6-2.6 3-4.6 1.4 2 3 2.8 3 4.6a3 3 0 0 1-3 3z" fill="#f6c453"/>',
  party: '<path d="M4.5 19.5 10 8l9.5 2.5z" fill="#8cb874"/><path d="M4.5 19.5 10 8l9.5 2.5z"/><circle cx="14" cy="5.6" r="1.1" fill="#f4a24a"/><circle cx="17.6" cy="4.2" r="1.1" fill="#ef8fa3"/><circle cx="19.4" cy="8.4" r="1.1" fill="#7fa8c9"/><path d="M15.4 10.6l1.8-1M13 13l2-.8" stroke="#fff"/>',
  place: '<path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" fill="#ef8fa3"/><path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.3" r="2.2" fill="#fffdf6"/>',
  folder: '<path d="M3.5 6.5h6l2 2.2h9v10.8h-17z" fill="#f6c453"/><path d="M3.5 6.5h6l2 2.2h9v10.8h-17z"/><path d="M3.5 8.7h17" opacity=".5"/>',
  book: '<path d="M12 6.5C10 4.8 7 4.5 4.5 5.4v12.6c2.5-.9 5.5-.6 7.5 1.1 2-1.7 5-2 7.5-1.1V5.4C17 4.5 14 4.8 12 6.5z" fill="#fffdf6"/><path d="M12 6.5C10 4.8 7 4.5 4.5 5.4v12.6c2.5-.9 5.5-.6 7.5 1.1 2-1.7 5-2 7.5-1.1V5.4C17 4.5 14 4.8 12 6.5z"/><path d="M12 6.5v12.6"/><path d="M7 9h3M7 12h3M14 9h3M14 12h3" stroke-dasharray="1.3 1.3"/>',
  plane2: '<path d="M3.5 11.5 20.5 4 14 20l-3.4-5.5z" fill="#fffdf6"/><path d="M3.5 11.5 20.5 4 14 20l-3.4-5.5z"/><path d="M20.5 4 10.6 14.5"/><path d="M5 16c1.2.6 2.4.6 3.6 0" opacity=".5"/>',
  pan: '<circle cx="10" cy="11" r="6.5" fill="#fdf3e0"/><circle cx="10" cy="11" r="6.5"/><circle cx="10" cy="11" r="2.6" fill="#f6c453"/><path d="M10 8.4c.8 0 1.6.4 2 1" opacity=".6"/><path d="M16.5 11h5" stroke-width="2.4"/>',
  run: '<circle cx="14.5" cy="4.6" r="1.9" fill="#f6c453"/><circle cx="14.5" cy="4.6" r="1.9"/><path d="M13.5 7.5 10 10l-3 .5M13.5 7.5l2.5 3 3.5 1M12.5 10.5 10 14l-2.5 5.5M12.5 10.5l3 3.5 1 5.5"/>',
  cup: '<path d="M7 5h10v4.5a5 5 0 0 1-10 0z" fill="#a9cde8"/><path d="M7 5h10v4.5a5 5 0 0 1-10 0z"/><path d="M8 18.5h8M12 14.5v4"/><path d="M9.5 7.2v2" stroke="#fff"/>',
  bowl: '<path d="M4.5 11h15a7.5 7.5 0 0 1-15 0z" fill="#fffdf6"/><path d="M4.5 11h15a7.5 7.5 0 0 1-15 0z"/><path d="M8 8c0-1.5 1.5-1.5 1.5-3M12 8c0-1.5 1.5-1.5 1.5-3M16 8c0-1.5 1.5-1.5 1.5-3"/><path d="M9 20.5h6"/><path d="M7.5 13.6c2 1 7 1 9 0" opacity=".5"/>',
  bag: '<path d="M5.5 8h13l-1 12h-11z" fill="#f2a9c4"/><path d="M5.5 8h13l-1 12h-11z"/><path d="M9 8V6.8a3 3 0 0 1 6 0V8"/><circle cx="9.6" cy="12" r=".9" fill="#6b573c"/><circle cx="14.4" cy="12" r=".9" fill="#6b573c"/>',
  bus: '<rect x="4" y="5" width="16" height="11" rx="2" fill="#f4a24a"/><rect x="4" y="5" width="16" height="11" rx="2"/><path d="M4 10.5h16"/><rect x="6" y="6.8" width="3" height="2.4" rx=".6" fill="#eef4f8"/><rect x="10.5" y="6.8" width="3" height="2.4" rx=".6" fill="#eef4f8"/><rect x="15" y="6.8" width="3" height="2.4" rx=".6" fill="#eef4f8"/><circle cx="8" cy="17.4" r="1.8" fill="#6b573c"/><circle cx="16" cy="17.4" r="1.8" fill="#6b573c"/>',
  tulip: '<path d="M12 13v8"/><path d="M12 18.5c-2.4-.8-4-2.8-4-4.8 1.7.2 3.4 1.6 4 3" fill="#8cb874"/><path d="M7.5 4.5c0 4.5 1.8 8.5 4.5 8.5s4.5-4 4.5-8.5" fill="#f2a9c4"/><path d="M7.5 4.5c0 4.5 1.8 8.5 4.5 8.5s4.5-4 4.5-8.5"/><path d="M7.5 4.5l1.7-2.4 1.3 2L12 1.5l1.5 2.6 1.3-2 1.7 2.4"/>',
  coin: '<circle cx="12" cy="12" r="8.5" fill="#f6c453"/><circle cx="12" cy="12" r="8.5"/><path d="M9 8.5l3 3 3-3M12 11.5v5M9.5 13.5h5M9.5 15.8h5"/>',
  box: '<path d="M4 8.5 12 4.5l8 4v9L12 21.5l-8-3z" fill="#d9a06b"/><path d="M4 8.5 12 4.5l8 4v9L12 21.5l-8-3z"/><path d="M4 8.5 12 12l8-3.5M12 12v9.5"/><path d="M8 6.5l8 4" stroke="#fdf3e0"/>',
  tea: '<path d="M5 10h11v5a4.5 4.5 0 0 1-9 0z" fill="#fffdf6"/><path d="M5 10h11v5a4.5 4.5 0 0 1-9 0z"/><path d="M16 11h2a2 2 0 0 1 0 4h-2.4"/><path d="M8.5 7c0-1.4 1.2-1.4 1.2-2.6M12 7c0-1.4 1.2-1.4 1.2-2.6"/><ellipse cx="10.5" cy="20.5" rx="6" ry="1" fill="#8cb874" opacity=".5"/>',
  clover: '<g fill="#8cb874"><circle cx="9" cy="8.5" r="3.4"/><circle cx="15" cy="8.5" r="3.4"/><circle cx="12" cy="13.5" r="3.4"/></g><circle cx="12" cy="10.8" r="1.4" fill="#f6c453"/><path d="M12 15c0 3.5-1 5.5-3 8"/>',
  balloon: '<path d="M12 3.5c-4.5 0-7 3-7 6.5 0 4 3.5 7 7 7s7-3 7-7c0-3.5-2.5-6.5-7-6.5z" fill="#f2a9c4"/><path d="M12 3.5c-4.5 0-7 3-7 6.5 0 4 3.5 7 7 7s7-3 7-7c0-3.5-2.5-6.5-7-6.5z"/><path d="M9.5 6.5c-1 1.2-1.4 2.6-1 4" stroke="#fff" opacity=".8"/><path d="M10.8 17l1.2 2 1.2-2" fill="#ef8fa3"/><path d="M12 19c-1.5 2 1.5 3 0 5"/>',
  exit: '<path d="M9 4.5H5.5v15H9"/><path d="M14 8l4 4-4 4M18 12H9" stroke="#c0503c"/><circle cx="18.6" cy="5.4" r="1.6" fill="#f6c453" stroke="#6b573c" stroke-width="1"/>',
  daisy: '<g fill="#fffdf6" stroke="#6b573c" stroke-width="1.1"><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9"/><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9" transform="rotate(45 12 8.9)"/><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9" transform="rotate(90 12 8.9)"/><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9" transform="rotate(135 12 8.9)"/><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9" transform="rotate(180 12 8.9)"/><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9" transform="rotate(225 12 8.9)"/><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9" transform="rotate(270 12 8.9)"/><ellipse cx="12" cy="5.4" rx="1.9" ry="2.9" transform="rotate(315 12 8.9)"/></g><circle cx="12" cy="8.9" r="2.7" fill="#f6c453" stroke="#6b573c" stroke-width="1.1"/><path d="M12 12.4V21" stroke="#5c8a4e" stroke-width="1.9"/><path d="M11.9 17.6c-2.5-.3-4.1-1.7-4.7-3.9 2.5.2 4.1 1.5 4.7 3.9z" fill="#8cb874" stroke="#6b573c" stroke-width="1"/>'
};

/* ---- 模块卡角落专属手绘花（每张卡一种花） ---- */
export const CARD_FLOWERS = {
  todo: '<path d="M24 27v16.5"/><path d="M24 40c-5-1.5-8.5-6-8.5-10.5 3.8.4 7.6 3.4 8.5 7" fill="#8cb874"/><path d="M14 11c0 9.5 4 16 10 16s10-6.5 10-16" fill="#f4a24a"/><path d="M14 11l3.5-5.5 3 4.5L23 4l2 6 3-4.5L34 11" fill="#f4a24a"/>',
  check: '<g fill="#fffdf6"><ellipse cx="24" cy="7.6" rx="2.6" ry="4.4"/><ellipse cx="24" cy="7.6" rx="2.6" ry="4.4" transform="rotate(45 24 14)"/><ellipse cx="24" cy="7.6" rx="2.6" ry="4.4" transform="rotate(90 24 14)"/><ellipse cx="24" cy="7.6" rx="2.6" ry="4.4" transform="rotate(135 24 14)"/><ellipse cx="24" cy="7.6" rx="2.6" ry="4.4" transform="rotate(180 24 14)"/><ellipse cx="24" cy="7.6" rx="2.6" ry="4.4" transform="rotate(225 24 14)"/><ellipse cx="24" cy="7.6" rx="2.6" ry="4.4" transform="rotate(270 24 14)"/><ellipse cx="24" cy="7.6" rx="2.6" ry="4.4" transform="rotate(315 24 14)"/></g><circle cx="24" cy="14" r="4" fill="#f6c453"/><path d="M24 18.5c-.5 9 .5 17 1 25.5"/><path d="M24.5 34c-4.5-.6-8-4-9-8.5 4.5.4 8 3.6 9 7" fill="#8cb874"/>',
  money: '<g fill="#f09a33"><ellipse cx="24" cy="8" rx="2.2" ry="4.6"/><ellipse cx="24" cy="8" rx="2.2" ry="4.6" transform="rotate(30 24 15)"/><ellipse cx="24" cy="8" rx="2.2" ry="4.6" transform="rotate(60 24 15)"/><ellipse cx="24" cy="8" rx="2.2" ry="4.6" transform="rotate(90 24 15)"/><ellipse cx="24" cy="8" rx="2.2" ry="4.6" transform="rotate(120 24 15)"/><ellipse cx="24" cy="8" rx="2.2" ry="4.6" transform="rotate(150 24 15)"/><ellipse cx="24" cy="8" rx="2.2" ry="4.6" transform="rotate(180 24 15)"/><ellipse cx="24" cy="8" rx="2.2" ry="4.6" transform="rotate(210 24 15)"/><ellipse cx="24" cy="8" rx="2.2" ry="4.6" transform="rotate(240 24 15)"/><ellipse cx="24" cy="8" rx="2.2" ry="4.6" transform="rotate(270 24 15)"/><ellipse cx="24" cy="8" rx="2.2" ry="4.6" transform="rotate(300 24 15)"/><ellipse cx="24" cy="8" rx="2.2" ry="4.6" transform="rotate(330 24 15)"/></g><circle cx="24" cy="15" r="5.2" fill="#6b573c"/><circle cx="22" cy="14" r=".9" fill="#f6c453"/><circle cx="26" cy="15.6" r=".9" fill="#f6c453"/><circle cx="23.4" cy="17" r=".9" fill="#f6c453"/><path d="M24 20.5v23"/><path d="M24 36c-4.5-.6-8-4-9-8.5 4.5.4 8 3.6 9 7" fill="#8cb874"/>',
  goal: '<g fill="#8cb874"><ellipse cx="18" cy="11.5" rx="4.4" ry="5.6" transform="rotate(-28 18 11.5)"/><ellipse cx="30" cy="11.5" rx="4.4" ry="5.6" transform="rotate(28 30 11.5)"/><ellipse cx="18" cy="21" rx="4.4" ry="5.6" transform="rotate(28 18 21)"/><ellipse cx="30" cy="21" rx="4.4" ry="5.6" transform="rotate(-28 30 21)"/></g><path d="M24 16c.6 9-.4 17-2 28"/>',
  note: '<path d="M24 19c-8 1-13-4-11-10 2-5 8-5 11-2 3-3 9-3 11 2 2 6-3 11-11 10z" fill="#f4a24a"/><circle cx="24" cy="12" r="2.8" fill="#6b573c"/><circle cx="22.8" cy="11" r=".7" fill="#f6c453"/><circle cx="25.2" cy="12.8" r=".7" fill="#f6c453"/><path d="M24 19c-.4 9 .4 16 1 24.5"/><path d="M24.5 33c-4.4-.6-7.8-4-8.8-8.4 4.4.4 7.8 3.5 8.8 6.8" fill="#8cb874"/>'
};
