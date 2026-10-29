<script setup>
import { ref, onMounted } from "vue";
import { useApp, initApp } from "./store";
import { auth, doLogout } from "./auth";
import { CONFIG } from "./config";
import EditorModal from "./components/EditorModal.vue";
import ToastList from "./components/ToastList.vue";
import BloomGrid from "./components/BloomGrid.vue";
import GoalCard from "./components/GoalCard.vue";
import NoteClip from "./components/NoteClip.vue";
import AuthGate from "./components/AuthGate.vue";
import ChatRoom from "./components/ChatRoom.vue";
import ProfileModal from "./components/ProfileModal.vue";
import AdminBoard from "./components/AdminBoard.vue";
import Avatar from "./components/Avatar.vue";

const app = useApp();
const { screen, drawer, ed, noteTag, cfg, profile, cnDate, issueNo, greeting, totalProgress,
  todoDone, todos, checkDone, checks, todayOut, goalAvg, notes, dailyQuote, monthOut,
  sortedTodos, bills, monthIn, catBars, goals, archivePick, filteredNotes, noteTags,
  edFields, edMod, go, openEditor, saveRecord, del, toggleTodo, fmt, catEmoji, quickAdd } = app;

const booted = ref(false);
onMounted(async () => { await initApp(); booted.value = true; });

const chatOpen = ref(false);
const profileOpen = ref(false);
const adminOpen = ref(false);
function logout() {
  doLogout();
  location.reload();
}
</script>

<template>
  <div class="m-wrap">
    <img class="flower-corner fc-tl" src="../assets/flower-corner.jpg" alt="" />
    <img class="flower-corner fc-br" src="../assets/flower-corner.jpg" alt="" />

    <!-- ======== 顶栏（小报头） ======== -->
    <header class="m-topbar">
      <button class="menu" @click="drawer=true">☰</button>
      <div class="brand" style="display:flex;align-items:center;justify-content:center;gap:6px"><span class="icn-inline" v-html="app.icon('daisy')"></span>花海生活报</div>
      <div class="dt">NO.{{ issueNo }} · {{ cnDate }}</div>
      <div class="m-top-actions">
        <a class="ta-btn" :href="CONFIG.github" target="_blank" rel="noopener" aria-label="GitHub">
          <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
        </a>
        <button class="ta-btn" aria-label="对话室" @click="chatOpen = true">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5c4.7 0 8.5 3.8 8.5 8.5Z"/></svg>
        </button>
        <button class="ta-btn ta-ava" aria-label="账号" @click="drawer = true">
          <Avatar :a="profile.avatar" :size="24" />
        </button>
      </div>
    </header>

    <!-- 登录闸门 -->
    <div v-if="!booted" class="boot-loading">📰 正在翻开报纸…</div>
    <AuthGate v-else-if="!auth.user" />

    <main class="m-screen" v-else>

      <!-- ======== 头版 ======== -->
      <section v-show="screen==='home'">
        <div class="m-headline">
          <h2>{{ greeting }}，<em>{{ profile.name }}</em>！<br/>今日进度 {{ totalProgress }}%</h2>
          <p class="lede">要务 {{ todoDone }}/{{ todos.length }} · 盖章 {{ checkDone }}/{{ checks.length }} · 支出 ¥{{ fmt(todayOut) }}</p>
          <div class="hstats">
            <div class="hstat"><div class="n">{{ todoDone }}/{{ todos.length }}</div><div class="t">要务</div></div>
            <div class="hstat"><div class="n">{{ checkDone }}/{{ checks.length }}</div><div class="t">盖章</div></div>
            <div class="hstat"><div class="n">{{ goalAvg }}%</div><div class="t">连载</div></div>
          </div>
        </div>

        <div class="modgrid">
          <div v-for="m in cfg.modules.filter(x=>x.id!=='home')" :key="m.id" class="modcard" @click="go(m.id)">
            <span class="tape mini"></span>
            <div class="mc-head">
              <span class="mc-ic" v-html="app.icon(m.icon)"></span>
              <span><div class="mc-name" style="font-size:13.5px">{{ m.name }}</div><div class="mc-en">{{ m.en }}</div></span>
            </div>
            <span class="mc-flower" v-html="app.icon('daisy')"></span>
            <div class="mc-stat" style="font-size:15px" v-if="m.id==='todo'">{{ todoDone }}/{{ todos.length }}<span>完成</span></div>
            <div class="mc-stat" style="font-size:15px" v-else-if="m.id==='check'">{{ checkDone }}/{{ checks.length }}<span>盖章</span></div>
            <div class="mc-stat" style="font-size:15px" v-else-if="m.id==='money'">¥{{ fmt(monthOut) }}<span>月支出</span></div>
            <div class="mc-stat" style="font-size:15px" v-else-if="m.id==='goal'">{{ goalAvg }}%<span>进度</span></div>
            <div class="mc-stat" style="font-size:15px" v-else-if="m.id==='note'">{{ notes.length }}<span>则剪报</span></div>
          </div>
        </div>
        <div class="daily-quote" style="font-size:14px;padding-top:14px"><span class="qm">❝</span>{{ dailyQuote }}<span class="qm">❞</span></div>
        <div class="values" style="font-size:11.5px">
          <div class="v"><b>为谁而办</b>想把日子过好的普通人——只要一张每天付印的小报，不需要复杂系统。</div>
          <div class="v"><b>解决什么</b>计划散、坚持难、账目糊、目标远、灵感易丢。</div>
          <div class="v"><b>本报怎么办</b>要事勾掉、习惯盖章、收支入账、目标浇水、灵感剪贴——云端同步，换设备不丢。</div>
        </div>
      </section>

      <!-- ======== 今日要务 ======== -->
      <section v-show="screen==='todo'" class="m-sec">
        <div class="pcard">
          <span class="tape"></span>
          <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>今日要务</h3><span class="en">AGENDA</span>
            <span class="tail"><span class="cnt">{{ todoDone }}/{{ todos.length }}</span><button class="add" @click="openEditor('todo')">＋</button></span>
          </div>
          <div v-if="!todos.length" class="empty"><span class="e">📌</span>刊登一条今日要务吧</div>
          <div v-for="x in sortedTodos" :key="x.id" class="todo" :class="{done:x.done}">
            <i class="box" @click="toggleTodo(x)"></i>
            <span class="tx" @click="toggleTodo(x)">{{ x.text }}</span>
            <span class="chip" :class="x.level">{{ {high:'P0',mid:'P1',low:'P2'}[x.level] }}</span>
            <button class="del" @click="del('todo',x.id)">×</button>
          </div>
          <div style="margin-top:10px"><span class="pencil">✎ 点事项即可划掉</span></div>
        </div>
      </section>

      <!-- ======== 盖章处 ======== -->
      <section v-show="screen==='check'" class="m-sec">
        <div class="pcard">
          <span class="tape green slant"></span>
          <div class="stamp-pic" v-html="app.icon('mail')"></div>
          <div class="sec-head" style="padding-right:60px"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>盖章处</h3><span class="en">STAMPS</span>
            <span class="tail"><span class="cnt">{{ checkDone }}/{{ checks.length }}</span><button class="add" @click="openEditor('checkin')">＋</button></span>
          </div>
          <div v-if="!checks.length" class="empty"><span class="e">🌷</span>种下第一个习惯吧</div>
          <BloomGrid />
          <div style="margin-top:10px"><span class="pencil">✎ 完成就盖戳，跨天自动翻新</span></div>
        </div>
      </section>

      <!-- ======== 账房 ======== -->
      <section v-show="screen==='money'" class="m-sec">
        <div class="pcard">
          <span class="tape"></span>
          <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>账房流水</h3><span class="en">LEDGER</span>
            <span class="tail"><button class="add" @click="openEditor('ledger')">＋ 记一笔</button></span>
          </div>
          <div v-if="!bills.length" class="empty"><span class="e">🧾</span>账本空空，记一笔吧</div>
          <div v-for="x in bills" :key="x.id" class="bill">
            <span class="cat-ic">{{ catEmoji(x.cat) }}</span>
            <span class="info"><span class="t">{{ x.note || x.cat }}</span><br/><span class="d">{{ x.cat }} · {{ x.date }}</span></span>
            <span class="amt" :class="x.kind==='income'?'in':'out'">{{ x.kind==='income'?'+':'−' }}{{ fmt(x.amount) }}</span>
            <button class="del" @click="del('money',x.id)">×</button>
          </div>
          <div class="bill-total"><span>本月</span><b>支 <span class="out-sum">¥{{ fmt(monthOut) }}</span> · 收 ¥{{ fmt(monthIn) }}</b></div>
        </div>
        <div class="pcard" style="margin-top:16px">
          <span class="tape green"></span>
          <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>支出构成</h3><span class="en">CHART</span></div>
          <div v-if="!catBars.length" class="empty"><span class="e">📊</span>本月暂无支出</div>
          <div v-for="c in catBars" :key="c.cat" class="cbar">
            <span class="lb">{{ catEmoji(c.cat) }} {{ c.cat }}</span>
            <span class="tr"><i :style="{width:c.pct+'%'}"></i></span>
            <span class="vl">¥{{ fmt(c.v) }}</span>
          </div>
        </div>
      </section>

      <!-- ======== 长线连载 ======== -->
      <section v-show="screen==='goal'" class="m-sec">
        <div class="pcard">
          <span class="tape slant"></span>
          <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>长线连载</h3><span class="en">SERIALS</span>
            <span class="tail"><span class="cnt">{{ goalAvg }}%</span><button class="add" @click="openEditor('goal')">＋ 种一棵</button></span>
          </div>
          <div v-if="!goals.length" class="empty"><span class="e">🌱</span>种一棵长期目标慢慢养</div>
          <GoalCard v-for="g in goals" :key="g.id" :g="g" />
        </div>
      </section>

      <!-- ======== 灵感剪报 ======== -->
      <section v-show="screen==='note'" class="m-sec">
        <div class="pcard tilt" v-if="archivePick" style="margin-bottom:14px">
          <span class="tape mini"></span>
          <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>旧稿重读</h3><span class="en">ARCHIVE</span></div>
          <p class="archive-q" style="font-size:13px"><span class="qt">❝</span>{{ archivePick.body }}</p>
          <div class="archive-meta"><span>《{{ archivePick.title }}》</span><span v-if="archivePick.tag"># {{ archivePick.tag }}</span><span>{{ archivePick.date }}</span></div>
        </div>
        <div class="pcard">
          <span class="tape green"></span>
          <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>灵感剪报夹</h3><span class="en">CLIPS</span>
            <span class="tail"><span class="cnt">{{ filteredNotes.length }} 则</span><button class="add" @click="openEditor('notes')">＋</button></span>
          </div>
          <div class="tagrow" v-if="noteTags.length">
            <button class="tchip" :class="{on:noteTag===''}" @click="noteTag=''">全部</button>
            <button v-for="t in noteTags" :key="t" class="tchip" :class="{on:noteTag===t}" @click="noteTag=t"># {{ t }}</button>
          </div>
          <div v-if="!filteredNotes.length" class="empty"><span class="e">✂️</span>剪下这一刻的想法吧</div>
          <NoteClip v-for="x in filteredNotes" :key="x.id" :x="x" />
        </div>
      </section>

      <footer class="colophon" style="border-top-width:1px">花海生活报 · 随身版</footer>
    </main>

    <!-- ======== 抽屉 ======== -->
    <div v-if="drawer">
      <div class="m-drawer-mask" @click="drawer=false"></div>
      <aside class="m-drawer">
        <div class="who">
          <Avatar :a="profile.avatar" :size="46" />
          <span><b>{{ profile.name }}</b><p>{{ profile.subtitle }}</p></span>
        </div>
        <div class="navi" @click="profileOpen = true; drawer = false">✎ 我的资料</div>
        <div class="navi" @click="chatOpen = true; drawer = false">💬 对话室 · 反馈</div>
        <div v-if="auth.user?.isAdmin" class="navi" @click="adminOpen = true; drawer = false">📊 编辑部看板</div>
        <div class="navi" @click="logout">⏏ 退出登录</div>
        <div v-for="m in cfg.modules" :key="m.id" class="navi" :class="{on:screen===m.id}" @click="go(m.id)">
          <span class="e" v-html="app.icon(m.icon)"></span>{{ m.name }}<span style="margin-left:auto;font-size:9.5px;color:var(--ink-faint);letter-spacing:.1em">{{ m.en }}</span>
        </div>
        <p style="font-size:10.5px;color:var(--ink-faint);margin-top:18px;line-height:1.7">数据已云端同步，换设备登录也不丢。GitHub：<a :href="CONFIG.github" target="_blank" rel="noopener" style="color:var(--green-deep)">{{ CONFIG.github.replace('https://github.com/','') }}</a></p>
      </aside>
    </div>

    <!-- ======== 底栏 + 浮动加号 ======== -->
    <nav class="m-tabbar">
      <button v-for="id in cfg.tabbar" :key="id" class="tb" :class="{on:screen===id}" @click="go(id)">
        <span class="e" v-html="app.icon(cfg.modules.find(m=>m.id===id).icon)"></span>
        {{ cfg.modules.find(m=>m.id===id).name }}
      </button>
    </nav>
    <button class="m-fab" @click="quickAdd">＋</button>

    <EditorModal v-if="ed.show" :ed="ed" :fields="edFields" :mod="edMod"
      @save="saveRecord" @close="ed.show=false" />
    <ChatRoom v-if="chatOpen" @close="chatOpen = false" />
    <ProfileModal v-if="profileOpen" @close="profileOpen = false" />
    <AdminBoard v-if="adminOpen" @close="adminOpen = false" />
    <ToastList />
  </div>
</template>
