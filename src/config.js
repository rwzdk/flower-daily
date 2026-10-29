/* ---- 全局配置（两个入口共用） ---- */
export const CONFIG = {
  profile: { name: "阿棠", avatar: "🌼", subtitle: "花海编辑部 · 主笔" },
  storageKey: "flower-daily-v1",
  /* 后端 API 地址（Cloudflare Worker）：
     开发时留空（vite 已代理到 127.0.0.1:8787）；
     部署后改成你的 Worker 地址，如 "https://flower-daily-api.xxx.workers.dev"，
     也可在浏览器控制台 localStorage.setItem("fd-api-base", "https://…") 临时覆盖 */
  apiBase: "https://flower-daily-api.qixin-study.workers.dev",
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
    { k: "emoji", l: "图标 emoji", t: "text", ph: "如：🏃" },
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

export const CAT_EMOJI = { "餐饮": "🍜", "购物": "🛍️", "交通": "🚌", "花草": "🌷", "居家": "🏠", "娱乐": "🎈", "稿费": "✒️", "工资": "💰", "其他": "📦" };

/* ---- 手绘多彩图标（墨线勾边 + 橘黄/墨绿/奶黄/米白手账配色） ---- */
export const ICONS = {
  home: '<path d="M4.2 11.8 12 4.6l7.8 7.2"/><path d="M6.3 10.4v9.2h11.4v-9.2" fill="#fffdf6"/><path d="M6.3 10.4v9.2h11.4v-9.2"/><rect x="9.9" y="13.2" width="4.2" height="6.4" rx="1.3" fill="#f09a33"/><path d="M9.9 16.4h4.2"/><circle cx="16.9" cy="13.4" r="1.35" fill="#f6c453"/><path d="M16.9 12.05v2.7M15.55 13.4h2.7"/><ellipse cx="4.6" cy="19.7" rx="1.9" ry="1.3" fill="#8cb874"/><path d="M2.7 19.7h3.8"/>',
  pin: '<path d="M9 3.7h6l-.9 5.4 2.8 2.5v1.9H7.1v-1.9l2.8-2.5z" fill="#f09a33"/><path d="M9 3.7h6l-.9 5.4 2.8 2.5v1.9H7.1v-1.9l2.8-2.5z"/><path d="M12 13.5v6.4"/><circle cx="12" cy="6.3" r="1.2" fill="#f6c453"/><path d="M12 5.1v2.4"/>',
  bloom: '<g fill="#f4a24a"><ellipse cx="12" cy="5.6" rx="2.3" ry="3.2"/><ellipse cx="17.1" cy="9.3" rx="2.3" ry="3.2" transform="rotate(72 17.1 9.3)"/><ellipse cx="15.2" cy="15.4" rx="2.3" ry="3.2" transform="rotate(144 15.2 15.4)"/><ellipse cx="8.8" cy="15.4" rx="2.3" ry="3.2" transform="rotate(216 8.8 15.4)"/><ellipse cx="6.9" cy="9.3" rx="2.3" ry="3.2" transform="rotate(288 6.9 9.3)"/></g><g stroke="#6b573c" stroke-width="1.1"><ellipse cx="12" cy="5.6" rx="2.3" ry="3.2"/><ellipse cx="17.1" cy="9.3" rx="2.3" ry="3.2" transform="rotate(72 17.1 9.3)"/><ellipse cx="15.2" cy="15.4" rx="2.3" ry="3.2" transform="rotate(144 15.2 15.4)"/><ellipse cx="8.8" cy="15.4" rx="2.3" ry="3.2" transform="rotate(216 8.8 15.4)"/><ellipse cx="6.9" cy="9.3" rx="2.3" ry="3.2" transform="rotate(288 6.9 9.3)"/></g><circle cx="12" cy="10.9" r="2.7" fill="#f6c453" stroke="#6b573c" stroke-width="1.1"/><path d="M12 15.4v6.2" stroke="#5c8a4e" stroke-width="1.9"/><path d="M11.9 19.3c-2.7-.3-4.5-1.8-5.1-4.1 2.7.2 4.5 1.6 5.1 4.1z" fill="#8cb874" stroke="#6b573c" stroke-width="1"/>',
  receipt: '<path d="M6.5 3.7h11v16.7l-1.8-1.4-1.8 1.4-1.9-1.4-1.9 1.4-1.8-1.4-1.8 1.4z" fill="#fffdf6"/><path d="M6.5 3.7h11v16.7l-1.8-1.4-1.8 1.4-1.9-1.4-1.9 1.4-1.8-1.4-1.8 1.4z"/><path d="M9.2 8h5.6M9.2 11.4h5.6" stroke-dasharray="1.4 1.4"/><path d="M9.2 15h2.8"/><circle cx="15.9" cy="15.6" r="2.5" fill="#f6c453" stroke="#6b573c" stroke-width="1.1"/><path d="M15.9 14.3v2.6M14.6 15.6h2.6"/>',
  sprout: '<path d="M6.7 13.4h10.6l-1.4 6.9H8.1z" fill="#f4a24a"/><path d="M6.7 13.4h10.6l-1.4 6.9H8.1z"/><path d="M12 13.4V9.1"/><path d="M11.9 9c-.1-2.9-2.3-4.5-5.2-4.3.2 2.9 2.2 4.5 5.2 4.3z" fill="#8cb874"/><path d="M12.1 9.6c.1-2.5 2-3.9 4.6-3.8-.2 2.5-2 3.9-4.6 3.8z" fill="#5c8a4e"/><path d="M8.6 16.2h6.8"/>',
  scissors: '<circle cx="6.8" cy="6.9" r="2.7" fill="#f4a24a"/><circle cx="6.8" cy="6.9" r="2.7"/><circle cx="6.8" cy="17.1" r="2.7" fill="#8cb874"/><circle cx="6.8" cy="17.1" r="2.7"/><path d="M9.2 8.8 18.7 17.1M9.2 15.2 18.7 6.9"/><path d="M13.5 12.4l2 1.7"/><circle cx="6.8" cy="6.9" r="1" fill="#fffdf6"/><circle cx="6.8" cy="17.1" r="1" fill="#fffdf6"/>',
  mail: '<rect x="3.8" y="5.8" width="16.4" height="12.4" rx="2.3" fill="#fffdf6"/><rect x="3.8" y="5.8" width="16.4" height="12.4" rx="2.3"/><path d="m5.1 7.5 6.9 5.4 6.9-5.4"/><circle cx="12" cy="14" r="2.3" fill="#f09a33" stroke="#6b573c" stroke-width="1.1"/><path d="M12 12.8v2.4M10.8 14h2.4"/>',
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
