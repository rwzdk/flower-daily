# 花海生活报 · Flower Field Daily Press

> 把日子过成连载，每天一小块版面 —— 一张手账风格的个人生活小报。

![花海生活报首页](docs/preview.png)

「花海生活报」是一个**纯本地存储**的单页应用：没有账号、没有服务器、没有构建步骤，打开就是一份每天"付印"的私人小报。适合想把日子过好的学生、上班族与自由职业者。

## ✨ 五个版面

| 版面 | 功能 |
| --- | --- |
| 📌 今日要务 AGENDA | 当天计划，点一下划掉，按优先级自动排序 |
| 🌸 盖章处 POSTMARKS | 习惯打卡，完成即盖戳，支持上传本地图片自选图章、连击统计 |
| 📖 账房 LEDGER | 收支流水、月度汇总、分类占比，全本地记账 |
| 🌱 长线连载 SERIALS | 长期目标养成：点「＋1」浇水，进度爬过 25% / 50% / 75% 里程碑开花，浇满收成 |
| ✂️ 灵感剪报 CLIPPINGS | 摘录、灵感与碎碎念，支持标签筛选、置顶、每日"旧稿重读" |

![盖章处](docs/preview-check.png)

## 🚀 使用

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（Vite 热更新）
npm run build      # 构建产物输出到 dist/
npm run preview    # 本地预览构建产物
```

- **部署**：任意静态托管（GitHub Pages、Qoder Site、Vercel 等），发布 `dist/` 目录，构建命令 `npm run build`，输出目录 `dist`；
- **数据**：全部保存在浏览器 `localStorage` 中，跨天自动重置打卡、保留连续记录。**清理浏览器数据会清空报纸存档，请留意。**

## 🧱 技术栈与工程结构

- [Vue 3](https://vuejs.org/)（`<script setup>` 单文件组件）+ [Vite](https://vitejs.dev/) 构建
- 双入口：`index.html`（桌面版）/ `mobile.html`（随身版），共享同一套 store 与组件
- 图标为手绘多彩 SVG（墨线勾边 + 橘黄/墨绿/奶黄手账配色），内置于 `src/config.js`

```
src/
├── main-desktop.js / main-mobile.js   # 双入口
├── AppDesktop.vue / AppMobile.vue     # 两个端的应用外壳
├── store.js                           # 全局响应式状态 + 持久化
├── config.js                          # 配置、字段、手绘图标库
├── utils.js                           # 日期/工具函数
└── components/
    ├── EditorModal.vue                # 通用新增/编辑弹窗（含本地图章上传）
    ├── BloomGrid.vue                  # 盖章处习惯网格
    ├── GoalCard.vue                   # 长线连载目标卡（浇水养成花）
    ├── NoteClip.vue                   # 灵感剪报卡
    └── ToastList.vue                  # 轻提示
```

## 📄 协议

本项目采用自定义 [LICENSE](LICENSE)：**仅供个人学习、研究使用**。

- ✅ 允许：克隆 / 拉取本仓库，本地运行、阅读、学习源码
- ❌ 禁止：任何商业用途；以任何形式再分发（含修改版）原版或修改后的代码与素材

任何超出上述范围的使用，请先通过 GitHub Issue 联系作者获得书面许可。
