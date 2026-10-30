<script setup>
import { ref, onMounted } from "vue";
import { useApp } from "./store";
import { initApp } from "./store";
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
  edFields, edMod, go, openEditor, saveRecord, del, toggleTodo, fmt } = app;

const booted = ref(false);
onMounted(async () => { await initApp(); booted.value = true; });

const chatOpen = ref(false);
const profileOpen = ref(false);
const adminOpen = ref(false);
const menuOpen = ref(false);
function logout() {
  menuOpen.value = false;
  doLogout();
  location.reload();
}
</script>

<template>
  <div class="d-wrap">
    <!-- 角落手绘花丛（左上垂落 / 右下生长） -->
    <svg class="flower-corner fc-tl" viewBox="0 0 200 185" fill="none" stroke="#6b573c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M100 183C96 136 84 100 62 64"/><path d="M100 183C102 132 108 96 100 48"/><path d="M100 183C110 136 130 102 152 72"/>
      <path d="M88 122c-14-2-24-12-26-26 14 2 24 12 26 24" fill="#8cb874"/>
      <path d="M112 112c12-2 22-12 24-26-14 2-24 12-26 24" fill="#a8d193"/>
      <path d="M96 152c-10 0-18-8-19-18 10 0 18 8 19 17" fill="#8cb874"/>
      <path d="M50 26c0 20 6 32 16 32s16-12 16-32" fill="#f2a9c4"/>
      <path d="M50 26l6-11 5 9 5-11 5 11 5-9 6 11" fill="#f2a9c4"/>
      <circle cx="100" cy="34" r="6" fill="#f6c453"/>
      <g fill="#fffdf6">
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z"/>
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z" transform="rotate(60 100 34)"/>
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z" transform="rotate(120 100 34)"/>
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z" transform="rotate(180 100 34)"/>
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z" transform="rotate(240 100 34)"/>
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z" transform="rotate(300 100 34)"/>
      </g>
      <circle cx="152" cy="58" r="7" fill="#f4a24a"/>
      <g fill="#f9cf6b">
        <path d="M152 51c-3-7-1-13 0-15 1 2 2 8 0 15Z"/>
        <path d="M152 51c-3-7-1-13 0-15 1 2 2 8 0 15Z" transform="rotate(72 152 58)"/>
        <path d="M152 51c-3-7-1-13 0-15 1 2 2 8 0 15Z" transform="rotate(144 152 58)"/>
        <path d="M152 51c-3-7-1-13 0-15 1 2 2 8 0 15Z" transform="rotate(216 152 58)"/>
        <path d="M152 51c-3-7-1-13 0-15 1 2 2 8 0 15Z" transform="rotate(288 152 58)"/>
      </g>
      <circle cx="34" cy="88" r="2.2" fill="#f2a9c4" stroke="none"/><circle cx="172" cy="96" r="2.2" fill="#f6c453" stroke="none"/><circle cx="126" cy="20" r="2.2" fill="#8cb874" stroke="none"/>
    </svg>
    <svg class="flower-corner fc-br" viewBox="0 0 200 185" fill="none" stroke="#6b573c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M100 183C96 136 84 100 62 64"/><path d="M100 183C102 132 108 96 100 48"/><path d="M100 183C110 136 130 102 152 72"/>
      <path d="M88 122c-14-2-24-12-26-26 14 2 24 12 26 24" fill="#8cb874"/>
      <path d="M112 112c12-2 22-12 24-26-14 2-24 12-26 24" fill="#a8d193"/>
      <path d="M96 152c-10 0-18-8-19-18 10 0 18 8 19 17" fill="#8cb874"/>
      <path d="M50 26c0 20 6 32 16 32s16-12 16-32" fill="#f2a9c4"/>
      <path d="M50 26l6-11 5 9 5-11 5 11 5-9 6 11" fill="#f2a9c4"/>
      <circle cx="100" cy="34" r="6" fill="#f6c453"/>
      <g fill="#fffdf6">
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z"/>
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z" transform="rotate(60 100 34)"/>
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z" transform="rotate(120 100 34)"/>
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z" transform="rotate(180 100 34)"/>
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z" transform="rotate(240 100 34)"/>
        <path d="M100 28c-4-8-1-16 0-18 1 2 3 10 0 18Z" transform="rotate(300 100 34)"/>
      </g>
      <circle cx="152" cy="58" r="7" fill="#f4a24a"/>
      <g fill="#f9cf6b">
        <path d="M152 51c-3-7-1-13 0-15 1 2 2 8 0 15Z"/>
        <path d="M152 51c-3-7-1-13 0-15 1 2 2 8 0 15Z" transform="rotate(72 152 58)"/>
        <path d="M152 51c-3-7-1-13 0-15 1 2 2 8 0 15Z" transform="rotate(144 152 58)"/>
        <path d="M152 51c-3-7-1-13 0-15 1 2 2 8 0 15Z" transform="rotate(216 152 58)"/>
        <path d="M152 51c-3-7-1-13 0-15 1 2 2 8 0 15Z" transform="rotate(288 152 58)"/>
      </g>
      <circle cx="34" cy="88" r="2.2" fill="#f2a9c4" stroke="none"/><circle cx="172" cy="96" r="2.2" fill="#f6c453" stroke="none"/><circle cx="126" cy="20" r="2.2" fill="#8cb874" stroke="none"/>
    </svg>

    <!-- 背景手绘贴图 -->
    <span class="doodle dd-sun"><svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
      <circle cx="40" cy="40" r="14" fill="rgba(246,196,83,.6)"/><circle cx="40.8" cy="39.4" r="13.2" opacity=".35"/>
      <path d="M40 12v8M40 60v8M12 40h8M60 40h8M20.2 20.2l5.6 5.6M54.2 54.2l5.6 5.6M59.8 20.2l-5.6 5.6M25.8 54.2l-5.6 5.6"/>
    </svg></span>
    <span class="doodle dd-cloud"><svg viewBox="0 0 96 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
      <path d="M16 38a8.5 8.5 0 0 1 1.8-16.7A13 13 0 0 1 42 12a10.5 10.5 0 0 1 19.5 5A8.5 8.5 0 0 1 70 38Z" fill="#eef4f8"/>
      <path d="M30 30c2-3 6-4 9-3" opacity=".5"/>
    </svg></span>
    <span class="doodle dd-leaf"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 36C8 30 6 16 12 6c10 2 18 10 16 22-2 6-5 8-8 8Z" fill="#cfe3bd"/>
      <path d="M14 12c4 8 8 14 14 20"/>
    </svg></span>
    <span class="doodle dd-butterfly"><svg viewBox="0 0 64 58" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 16c-10-14-26-12-24-2 1 7 11 7 15 6" fill="#f2a9c4"/>
      <path d="M32 16c10-14 26-12 24-2-1 7-11 7-15 6" fill="#f2a9c4"/>
      <path d="M32 28c-8-1-18 1-16 9 2 7 12 4 16-3" fill="#f9cf6b"/>
      <path d="M32 28c8-1 18 1 16 9-2 7-12 4-16-3" fill="#f9cf6b"/>
      <path d="M32 14v32"/><path d="M29 12c-2-3-5-5-8-6M35 12c2-3 5-5 8-6"/>
    </svg></span>
    <span class="doodle dd-daisy"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="30" cy="30" r="5.5" fill="rgba(240,154,51,.4)"/>
      <path d="M30 24.5c-3.5-7-1-14 0-15 1 1 3.5 8 0 15Z" fill="#fffdf6"/>
      <g transform="rotate(45 30 30)"><path d="M30 24.5c-3.5-7-1-14 0-15 1 1 3.5 8 0 15Z" fill="#fffdf6"/></g>
      <g transform="rotate(90 30 30)"><path d="M30 24.5c-3.5-7-1-14 0-15 1 1 3.5 8 0 15Z" fill="#fffdf6"/></g>
      <g transform="rotate(135 30 30)"><path d="M30 24.5c-3.5-7-1-14 0-15 1 1 3.5 8 0 15Z" fill="#fffdf6"/></g>
      <g transform="rotate(180 30 30)"><path d="M30 24.5c-3.5-7-1-14 0-15 1 1 3.5 8 0 15Z" fill="#fffdf6"/></g>
      <g transform="rotate(225 30 30)"><path d="M30 24.5c-3.5-7-1-14 0-15 1 1 3.5 8 0 15Z" fill="#fffdf6"/></g>
      <g transform="rotate(270 30 30)"><path d="M30 24.5c-3.5-7-1-14 0-15 1 1 3.5 8 0 15Z" fill="#fffdf6"/></g>
      <g transform="rotate(315 30 30)"><path d="M30 24.5c-3.5-7-1-14 0-15 1 1 3.5 8 0 15Z" fill="#fffdf6"/></g>
    </svg></span>
    <span class="doodle dd-sparkle"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 6l2.6 8L30.5 16.6 22.6 19.2 20 27l-2.6-7.8L9.5 16.6l7.9-2.6Z" fill="#f6c453"/>
      <path d="M44 30l1.8 5.5 5.3 1.8-5.3 1.9L44 44.6l-1.8-5.4-5.3-1.9 5.3-1.8Z" fill="#f2a9c4"/>
      <path d="M14 40l1.3 4 4 1.4-4 1.4L14 50.8l-1.3-4-4-1.4 4-1.4Z" fill="#8cb874"/>
    </svg></span>
    <span class="doodle dd-bee"><svg viewBox="0 0 64 52" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="32" cy="33" rx="14" ry="10" fill="#f6c453"/>
      <path d="M26 24v18M34 23v20"/>
      <path d="M27 23c-4-9-13-11-15-5-2 6 7 9 13 7" fill="#dff0f5"/>
      <path d="M37 23c2-9 11-13 14-8 3 6-5 10-12 9" fill="#dff0f5"/>
      <path d="M18 33h-6M20 37l-6 3M46 30l5-3"/>
    </svg></span>
    <span class="doodle dd-sprig"><svg viewBox="0 0 56 72" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M28 68C26 44 26 24 31 6"/>
      <path d="M27.5 57c-6-1-11-6-12-12 6 0 11 4 12 9" fill="#8cb874"/>
      <path d="M28.5 45c6-1 11-6 12-12-6 0-11 4-12 9" fill="#a8d193"/>
      <path d="M27.5 33c-6-1-11-6-12-12 6 0 11 4 12 9" fill="#8cb874"/>
      <path d="M29.5 21c6-1 11-6 12-12-6 0-11 4-12 9" fill="#a8d193"/>
      <circle cx="31" cy="8" r="3" fill="#f2a9c4"/>
    </svg></span>
    <span class="doodle dd-tulip"><svg viewBox="0 0 48 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M24 34v26"/>
      <path d="M24 54c-6-2-10-8-10-14 4 0 9 4 10 8" fill="#8cb874"/>
      <path d="M24 47c6-2 10-8 10-14-4 0-9 4-10 8" fill="#8cb874"/>
      <path d="M14 15c0 11 4 19 10 19s10-8 10-19" fill="#f2a9c4"/>
      <path d="M14 15l4-7 3 5.5L24 6l3 7.5L30 8l4 7" fill="#f2a9c4"/>
    </svg></span>
    <span class="doodle dd-heart"><svg viewBox="0 0 40 36" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 32C8 24 4 16 6 10.5 8 5.5 15 4.5 20 10.5 25 4.5 32 5.5 34 10.5c2 5.5-2 13.5-14 21.5Z" fill="#ef8fa3"/>
    </svg></span>
    <span class="doodle dd-snail"><svg viewBox="0 0 66 44" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="24" cy="22" r="14" fill="#f6d9a0"/>
      <path d="M24 22c2.5 0 4-2 3-4.5-1.2-3-6.5-2.4-7.6.8-1.2 3.6 1.8 7.2 5.6 7.2"/>
      <path d="M12 34c10 3 24 3 32-1 4-2 8-6 8-11 0-3-2-5-4.5-4.6-2 .3-3 2-3.4 4" fill="#f9e2c0"/>
      <path d="M47 13l1.5-7M53 14.5l4-5.5"/>
      <circle cx="49" cy="5" r="1.6" fill="currentColor" stroke="none"/><circle cx="58.5" cy="8" r="1.6" fill="currentColor" stroke="none"/>
    </svg></span>
    <span class="doodle dd-mushroom"><svg viewBox="0 0 48 50" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 25C5 13 13.5 6 24 6s19 7 19 19c-7 2-31 2-38 0Z" fill="#e8897b"/>
      <path d="M17 26c0 8-.8 13-1.8 17 3.4 2.4 14.2 2.4 17.6 0-1-4-1.8-9-1.8-17" fill="#fdf3e0"/>
      <circle cx="17" cy="15" r="2.2" fill="#fffdf6"/><circle cx="29" cy="11" r="2.6" fill="#fffdf6"/><circle cx="33.5" cy="19" r="1.8" fill="#fffdf6"/>
    </svg></span>
    <span class="doodle dd-grass"><svg viewBox="0 0 64 36" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
      <path d="M8 34C7 24 5 16 2 10" stroke="#8cb874"/>
      <path d="M19 34c0-10-1-20-4-26"/>
      <path d="M31 34c1-12-1-22-6-30" stroke="#a8d193"/>
      <path d="M43 34c0-10 2-18 8-24" stroke="#8cb874"/>
      <path d="M55 34c1-8 4-14 8-18" stroke="#a8d193"/>
      <circle cx="15" cy="20" r="3.2" fill="#f6c453" stroke="#8a6f4d"/>
      <circle cx="46" cy="22" r="3.2" fill="#f2a9c4" stroke="#8a6f4d"/>
    </svg></span>
    <span class="doodle dd-rainbow"><svg viewBox="0 0 84 50" fill="none" stroke-linecap="round">
      <path d="M10 46a32 32 0 0 1 64 0" stroke="#e8897b" stroke-width="4.6"/>
      <path d="M17 44a25 25 0 0 1 50 0" stroke="#f4a24a" stroke-width="4.6"/>
      <path d="M24 44a18 18 0 0 1 36 0" stroke="#f6c453" stroke-width="4.6"/>
      <path d="M31 44a11 11 0 0 1 22 0" stroke="#8cb874" stroke-width="4.6"/>
      <path d="M38 44a4 4 0 0 1 8 0" stroke="#7fa8c9" stroke-width="4.6"/>
      <circle cx="10" cy="45" r="6" fill="#fffdf6" stroke="#8a6f4d" stroke-width="2"/>
      <circle cx="74" cy="46" r="6" fill="#fffdf6" stroke="#8a6f4d" stroke-width="2"/>
    </svg></span>
    <span class="doodle dd-balloon"><svg viewBox="0 0 44 66" fill="none" stroke="#8a6f4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 4C12 4 6 12 6 21c0 10 8 18 16 18s16-8 16-18C38 12 32 4 22 4Z" fill="#f2a9c4"/>
      <path d="M13 13c-2.5 3-3.5 6.5-2.5 10" stroke="#fff" opacity=".8"/>
      <path d="M19.5 39l2.5 5 2.5-5" fill="#ef8fa3"/>
      <path d="M22 44c-3.5 5 3.5 9 0 16"/>
    </svg></span>
    <span class="doodle dd-kite"><svg viewBox="0 0 56 78" fill="none" stroke="#8a6f4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M28 3 45 21 28 39 11 21Z" fill="#f4a24a"/>
      <path d="M28 3 28 39M11 21h34"/>
      <path d="M28 3 11 21h17Z" fill="#8cb874" opacity=".85"/>
      <path d="M28 39c-2 8 4 10 2 17s4 9 2 15"/>
      <path d="M30 49l6-2-2 6Z" fill="#f2a9c4"/>
      <path d="M29 62l6-2-2 6Z" fill="#7fa8c9"/>
    </svg></span>
    <span class="doodle dd-ladybug"><svg viewBox="0 0 42 38" fill="none" stroke="#8a6f4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="21" cy="22" r="12" fill="#e26d5a"/>
      <path d="M21 11v22"/>
      <circle cx="15.5" cy="18" r="2" fill="#4a3c28" stroke="none"/>
      <circle cx="26.5" cy="18" r="2" fill="#4a3c28" stroke="none"/>
      <circle cx="17" cy="26" r="1.6" fill="#4a3c28" stroke="none"/>
      <circle cx="25" cy="27" r="1.6" fill="#4a3c28" stroke="none"/>
      <path d="M15 12c-2-4-6-5-8-4M27 12c2-4 6-5 8-4"/>
    </svg></span>
    <span class="doodle dd-flowerpot"><svg viewBox="0 0 48 58" fill="none" stroke="#8a6f4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M24 32V18"/>
      <g fill="#f2a9c4"><circle cx="24" cy="9" r="4.2"/><circle cx="16.5" cy="14" r="4.2"/><circle cx="31.5" cy="14" r="4.2"/><circle cx="18.5" cy="20.5" r="4.2"/><circle cx="29.5" cy="20.5" r="4.2"/></g>
      <circle cx="24" cy="15" r="3.6" fill="#f6c453"/>
      <path d="M24 27c-4.5-.8-7-4-7.5-7.5 3.6.3 6.6 2.6 7.5 5.5" fill="#8cb874"/>
      <path d="M10 32h28v6H10Z" fill="#c98a52"/>
      <path d="M13 38h22l-3 16H16Z" fill="#d9a06b"/>
    </svg></span>
    <span class="doodle dd-stars"><svg viewBox="0 0 62 52" fill="none" stroke="#8a6f4d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 6l2.4 7.4 7.4 2.4-7.4 2.4L16 25.6l-2.4-7.4L6.2 15.8l7.4-2.4Z" fill="#f6c453"/>
      <path d="M44 22l1.8 5.6 5.6 1.8-5.6 1.8L44 36.8l-1.8-5.6-5.6-1.8 5.6-1.8Z" fill="#f2a9c4"/>
      <path d="M34 38l1.4 4.4 4.4 1.4-4.4 1.4L34 49.6l-1.4-4.4-4.4-1.4 4.4-1.4Z" fill="#8cb874"/>
      <path d="M50 6l1 3.2 3.2 1-3.2 1-1 3.2-1-3.2-3.2-1 3.2-1Z" fill="#7fa8c9"/>
    </svg></span>
    <span class="doodle dd-berry"><svg viewBox="0 0 46 50" fill="none" stroke="#8a6f4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M23 5c1.5 10-.5 17-8 24M23 5c3 7 7.5 11 12 14"/>
      <path d="M23 5c2-2.5 5-3.5 8-3-1 2.5-4 3.8-7 3.4" fill="#8cb874"/>
      <circle cx="13" cy="35" r="8.5" fill="#e26d5a"/>
      <circle cx="33" cy="30" r="8" fill="#ef8fa3"/>
      <path d="M10 31c-1.5 2-2 4-1.5 6M30 26.5c-1.4 1.8-1.8 3.8-1.4 5.6" stroke="#fff" opacity=".75"/>
    </svg></span>
    <span class="doodle dd-plane"><svg viewBox="0 0 52 44" fill="none" stroke="#8a6f4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 20 48 4 30 40 23 25Z" fill="#fffdf6"/>
      <path d="M48 4 23 25"/>
      <path d="M23 25l-4 11 6-7" fill="#dff0f5"/>
      <path d="M6 34c2 1 4 1 6 0M2 28c2 1 4 1 6 0" opacity=".5"/>
    </svg></span>
    <span class="doodle dd-acorn"><svg viewBox="0 0 38 46" fill="none" stroke="#8a6f4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 18c0-6 6-10 13-10s13 4 13 10c-4 3-22 3-26 0Z" fill="#c98a52"/>
      <path d="M18 8c0-3 1-5 3-6"/>
      <path d="M8 20c0 10 4 18 10 21 6-3 10-8 10-21-5 2-15 2-20 0Z" fill="#d9a06b"/>
      <circle cx="14" cy="26" r="1.2" fill="#8a6f4d" stroke="none"/><circle cx="22" cy="30" r="1.2" fill="#8a6f4d" stroke="none"/>
    </svg></span>
    <span class="doodle dd-clover"><svg viewBox="0 0 42 48" fill="none" stroke="#8a6f4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <g fill="#8cb874"><circle cx="15" cy="13" r="7"/><circle cx="27" cy="13" r="7"/><circle cx="21" cy="21" r="7"/></g>
      <circle cx="21" cy="17" r="3" fill="#f6c453" stroke="none"/>
      <path d="M21 27c0 8-2 14-6 19"/>
      <path d="M18 38c-3-1-5-3-5.5-5.5 2.8.3 5 2 5.5 4" fill="#8cb874"/>
    </svg></span>

    <!-- 登录闸门：未登录时只显示订阅卡 -->
    <div v-if="!booted" class="boot-loading"><span class="icn-inline" v-html="app.icon('news')"></span> 正在翻开报纸…</div>
    <AuthGate v-else-if="!auth.user" />

    <div class="d-page" v-else>

      <!-- ======== 右上角：GitHub / 对话室 / 用户菜单 ======== -->
      <div class="top-actions" @click.outside="menuOpen = false">
        <a class="ta-btn" :href="CONFIG.github" target="_blank" rel="noopener" title="GitHub 仓库">
          <svg viewBox="0 0 16 16" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
        </a>
        <button class="ta-btn ta-chat" title="对话室 · 反馈交流" @click="chatOpen = true">
          <span v-html="app.icon('chat')"></span>
        </button>
        <button class="ta-btn ta-ava" title="账号" @click.stop="menuOpen = !menuOpen">
          <Avatar :a="profile.avatar" :size="28" />
        </button>
        <div v-if="menuOpen" class="ta-menu" @click.stop>
          <div class="ta-me">
            <Avatar :a="profile.avatar" :size="38" />
            <span><b>{{ profile.name }}</b><i>{{ auth.user?.email }}</i></span>
          </div>
          <button class="ta-item" @click="profileOpen = true; menuOpen = false"><span class="icn-inline" v-html="app.icon('pencil')"></span> 我的资料</button>
          <button class="ta-item" @click="chatOpen = true; menuOpen = false"><span class="icn-inline" v-html="app.icon('chat')"></span> 对话室 · 意见反馈</button>
          <button v-if="auth.user?.isAdmin" class="ta-item" @click="adminOpen = true; menuOpen = false"><span class="icn-inline" v-html="app.icon('chart')"></span> 编辑部看板</button>
          <button class="ta-item danger" @click="logout"><span class="icn-inline" v-html="app.icon('exit')"></span> 退出登录</button>
        </div>
      </div>

      <!-- ======== 报头 ======== -->
      <header class="masthead">
        <img class="bouquet" src="../assets/flower-corner.jpg" alt="" />
        <div class="stamp-corner"><span v-html="app.icon('daisy')"></span></div>
        <div class="meta-top"><span>FLOWER FIELD DAILY PRESS</span><span>vol.{{ issueNo }} · 每日刊</span></div>
        <h1><svg class="t-deco" viewBox="0 0 56 72" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M28 68C26 44 26 24 31 6"/><path d="M27.5 57c-6-1-11-6-12-12 6 0 11 4 12 9"/><path d="M28.5 45c6-1 11-6 12-12-6 0-11 4-12 9"/><path d="M27.5 33c-6-1-11-6-12-12 6 0 11 4 12 9"/><path d="M29.5 21c6-1 11-6 12-12-6 0-11 4-12 9"/></svg>花海生活报<svg class="t-deco flip" viewBox="0 0 56 72" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M28 68C26 44 26 24 31 6"/><path d="M27.5 57c-6-1-11-6-12-12 6 0 11 4 12 9"/><path d="M28.5 45c6-1 11-6 12-12-6 0-11 4-12 9"/><path d="M27.5 33c-6-1-11-6-12-12 6 0 11 4 12 9"/><path d="M29.5 21c6-1 11-6 12-12-6 0-11 4-12 9"/></svg></h1>
        <div class="sub">花 海 编 辑 部 · 每 日 出 版</div>
        <div class="rule"><i></i><b>★ 今日晴 · 宜播种 · 宜记录 ★</b><i></i></div>
      </header>

      <div class="dateline">
        <span>{{ cnDate }}</span>
        <span>主笔：<b>{{ profile.name }}</b> <span class="icn-inline" v-html="app.icon('daisy')"></span> · 今日已付印 <b>{{ totalProgress }}%</b></span>
      </div>

      <!-- ======== 版面导航 ======== -->
      <nav class="tabnav">
        <button v-for="m in cfg.modules" :key="m.id" class="tb" :class="{on:screen===m.id}" @click="go(m.id)">
          <span class="e" v-html="app.icon(m.icon)"></span>{{ m.name }}
        </button>
        <span class="tail">数据已云端同步 <span class="icn-inline" v-html="app.icon('cloudup')"></span> 多设备共享</span>
      </nav>

      <!-- ======== 头版（首页） ======== -->
      <section v-show="screen==='home'">
        <div class="headline">
          <div class="kicker">TODAY'S HEADLINE · 今日头版</div>
          <h2>{{ greeting }}，<em>{{ profile.name }}</em>！<br/>花田长势良好，今日进度 {{ totalProgress }}%。</h2>
          <p class="lede">本报讯：今日要务完成 {{ todoDone }}/{{ todos.length }}，盖章 {{ checkDone }}/{{ checks.length }} 枚，账房支出 ¥{{ fmt(todayOut) }}。编辑部一致认为——值得加印一朵小红花。</p>
          <div class="hstats">
            <div class="hstat"><div class="n">{{ todoDone }}/{{ todos.length }}</div><div class="t">今日要务</div></div>
            <div class="hstat"><div class="n">{{ checkDone }}/{{ checks.length }}</div><div class="t">习惯盖章</div></div>
            <div class="hstat"><div class="n">¥{{ fmt(todayOut) }}</div><div class="t">今日支出</div></div>
            <div class="hstat"><div class="n">{{ goalAvg }}%</div><div class="t">连载进度</div></div>
          </div>
        </div>

        <div class="modgrid">
          <div v-for="m in cfg.modules.filter(x=>x.id!=='home')" :key="m.id" class="modcard" @click="go(m.id)">
            <span class="tape mini"></span>
            <div class="mc-head">
              <span class="mc-ic" v-html="app.icon(m.icon)"></span>
              <span><div class="mc-name">{{ m.name }}</div><div class="mc-en">{{ m.en }}</div></span>
            </div>
            <span class="mc-flower" v-html="app.cardIcon(m.id)"></span>
            <p class="mc-desc">{{ m.desc }}</p>
            <div class="mc-stat" v-if="m.id==='todo'">{{ todoDone }}/{{ todos.length }}<span>已完成</span></div>
            <div class="mc-stat" v-else-if="m.id==='check'">{{ checkDone }}/{{ checks.length }}<span>已盖章</span></div>
            <div class="mc-stat" v-else-if="m.id==='money'">¥{{ fmt(monthOut) }}<span>本月支出</span></div>
            <div class="mc-stat" v-else-if="m.id==='goal'">{{ goalAvg }}%<span>平均进度</span></div>
            <div class="mc-stat" v-else-if="m.id==='note'">{{ notes.length }}<span>则剪报</span></div>
          </div>
        </div>

        <div class="daily-quote"><span class="qm">❝</span>{{ dailyQuote }}<span class="qm">❞</span></div>

        <!-- 本报宣言：为谁办、解决什么、怎么办 -->
        <div class="values">
          <div class="v"><b>为谁而办</b>想把日子过好的普通人：学生、上班族、自由职业者——不需要复杂系统，只要一张每天付印的小报。</div>
          <div class="v"><b>解决什么</b>计划散在各处记不住、好习惯三天就断、钱花得糊里糊涂、长期目标遥遥无期、灵感一闪就丢。</div>
          <div class="v"><b>本报怎么办</b>要事一栏勾掉、习惯盖章、收支入账、目标每天浇一次水、灵感随手剪贴——注册登录后云端同步，换设备不丢。</div>
        </div>
      </section>

      <!-- ======== 今日要务 ======== -->
      <section v-show="screen==='todo'">
        <div class="cols c2">
          <div class="col">
            <div class="pcard tilt-l">
              <span class="tape"></span>
              <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>今日要务</h3><span class="en">AGENDA</span>
                <span class="tail"><span class="cnt">{{ todoDone }}/{{ todos.length }}</span><button class="add" @click="openEditor('todo')">＋ 刊登</button></span>
              </div>
              <div v-if="!todos.length" class="empty"><span class="e" v-html="app.icon('pin')"></span>今日版面空空，刊登一条要务吧</div>
              <div v-for="x in sortedTodos" :key="x.id" class="todo" :class="{done:x.done}">
                <i class="box" @click="toggleTodo(x)"></i>
                <span class="tx" @click="toggleTodo(x)" style="cursor:pointer">{{ x.text }}</span>
                <span class="chip" :class="x.level">{{ {high:'P0',mid:'P1',low:'P2'}[x.level] }}</span>
                <button class="del" @click="del('todo',x.id)">撤稿</button>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="pcard tilt-r">
              <span class="tape green slant"></span>
              <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>编辑手记</h3><span class="en">NOTES</span></div>
              <p style="font-size:13px;color:var(--ink-soft)">先把最难的那条放在头版头条，完成它，今天的报纸就算办成了。</p>
              <div style="margin-top:14px"><span class="pencil"><span class="icn-inline" v-html="app.icon('pencil')"></span> 点击事项即可划掉，划掉的声音很治愈</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======== 盖章处 ======== -->
      <section v-show="screen==='check'">
        <div class="cols c2">
          <div class="col">
            <div class="pcard tilt-r">
              <span class="tape slant"></span>
              <div class="stamp-pic" v-html="app.icon('mail')"></div>
              <div class="sec-head" style="padding-right:66px"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>盖章处</h3><span class="en">POSTMARKS</span>
                <span class="tail"><span class="cnt">{{ checkDone }}/{{ checks.length }}</span><button class="add" @click="openEditor('checkin')">＋ 新增习惯</button></span>
              </div>
              <div v-if="!checks.length" class="empty"><span class="e" v-html="app.icon('tulip')"></span>还没有习惯，种下第一颗种子吧</div>
              <BloomGrid />
              <div style="margin-top:12px"><span class="pencil"><span class="icn-inline" v-html="app.icon('pencil')"></span> 点一下盖戳，再点一下取消；跨天自动开新版面</span></div>
            </div>
          </div>
          <div class="col">
            <div class="pcard tilt-l">
              <span class="tape green"></span>
              <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>连击榜</h3><span class="en">STREAKS</span></div>
              <div v-for="x in checks.slice().sort((a,b)=>b.streak-a.streak)" :key="x.id"
                   style="display:flex;justify-content:space-between;font-size:13px;padding:8px 2px;border-bottom:1px dotted var(--line-strong)">
                <span>{{ x.emoji }} {{ x.name }}</span>
                <b style="font-family:var(--serif);color:var(--orange-deep)">{{ x.streak }} 天</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======== 账房 ======== -->
      <section v-show="screen==='money'">
        <div class="cols" style="grid-template-columns:1.35fr .85fr">
          <div class="col">
            <div class="pcard tilt-l">
              <span class="tape"></span>
              <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>账房流水</h3><span class="en">LEDGER</span>
                <span class="tail"><button class="add" @click="openEditor('ledger')">＋ 记一笔</button></span>
              </div>
              <div v-if="!bills.length" class="empty"><span class="e" v-html="app.icon('receipt')"></span>账本是空的，记一笔今天的第一笔吧</div>
              <div v-for="x in bills" :key="x.id" class="bill">
                <span class="cat-ic" v-html="app.catIcon(x.cat)"></span>
                <span class="info"><span class="t">{{ x.note || x.cat }}</span><br/><span class="d">{{ x.cat }} · {{ x.date }}</span></span>
                <span class="amt" :class="x.kind==='income'?'in':'out'">{{ x.kind==='income'?'+':'−' }} ¥{{ fmt(x.amount) }}</span>
                <button class="del" @click="del('money',x.id)">×</button>
              </div>
              <div class="bill-total">
                <span>本月小结</span>
                <b>支 <span class="out-sum" style="font-family:var(--serif)">¥{{ fmt(monthOut) }}</span> · 收 ¥{{ fmt(monthIn) }}</b>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="pcard tilt-r">
              <span class="tape green slant"></span>
              <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>支出构成</h3><span class="en">ANALYSIS</span></div>
              <div v-if="!catBars.length" class="empty"><span class="e" v-html="app.icon('chart')"></span>本月还没有支出</div>
              <div v-for="c in catBars" :key="c.cat" class="cbar">
                <span class="lb"><span class="icn-inline" v-html="app.catIcon(c.cat)"></span> {{ c.cat }}</span>
                <span class="tr"><i :style="{width:c.pct+'%'}"></i></span>
                <span class="vl">¥{{ fmt(c.v) }}</span>
              </div>
              <div style="margin-top:14px"><span class="pencil"><span class="icn-inline" v-html="app.icon('pencil')"></span> 花钱栏目请克制一点 —— 未来的你</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======== 长线连载 ======== -->
      <section v-show="screen==='goal'">
        <div class="cols c2">
          <div class="col">
            <div class="pcard tilt-r">
              <span class="tape green"></span>
              <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>长线连载</h3><span class="en">SERIALS</span>
                <span class="tail"><span class="cnt">平均 {{ goalAvg }}%</span><button class="add" @click="openEditor('goal')">＋ 种一棵</button></span>
              </div>
              <div v-if="!goals.length" class="empty"><span class="e" v-html="app.icon('sprout')"></span>还没有长期目标，种一棵慢慢养吧</div>
              <GoalCard v-for="g in goals" :key="g.id" :g="g" />
            </div>
          </div>
          <div class="col">
            <div class="pcard tilt-l">
              <span class="tape slant"></span>
              <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>编辑部寄语</h3><span class="en">WORDS</span></div>
              <p style="font-size:13px;color:var(--ink-soft)">每个长期目标都是一棵花：点「＋1」浇一次水，藤蔓爬过 25% / 50% / 75% 会各开一朵里程碑小花，浇满就收成。</p>
              <div style="margin-top:14px"><span class="pencil"><span class="icn-inline" v-html="app.icon('pencil')"></span> 今天浇过水的会挂上「已浇水」牌</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======== 灵感剪报 ======== -->
      <section v-show="screen==='note'">
        <div class="pcard tilt" v-if="archivePick" style="margin-bottom:18px">
          <span class="tape mini"></span>
          <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>旧稿重读</h3><span class="en">FROM THE ARCHIVE</span>
            <span class="tail"><span class="cnt">每天自动翻出一则你的旧剪报</span></span>
          </div>
          <p class="archive-q"><span class="qt">❝</span>{{ archivePick.body }}</p>
          <div class="archive-meta"><span>《{{ archivePick.title }}》</span><span v-if="archivePick.tag"># {{ archivePick.tag }}</span><span>剪于 {{ archivePick.date }}</span></div>
        </div>
        <div class="pcard tilt-l">
          <span class="tape"></span>
          <div class="sec-head"><span class="icn-inline" v-html="app.icon('daisy')"></span><h3>灵感剪报夹</h3><span class="en">CLIPPINGS</span>
            <span class="tail"><span class="cnt">{{ filteredNotes.length }} / {{ notes.length }} 则</span><button class="add" @click="openEditor('notes')">＋ 剪一则</button></span>
          </div>
          <div class="tagrow" v-if="noteTags.length">
            <button class="tchip" :class="{on:noteTag===''}" @click="noteTag=''">全部</button>
            <button v-for="t in noteTags" :key="t" class="tchip" :class="{on:noteTag===t}" @click="noteTag=t"># {{ t }}</button>
          </div>
          <div v-if="!filteredNotes.length" class="empty"><span class="e" v-html="app.icon('scissors')"></span>剪报夹空空，去生活里剪点什么吧</div>
          <div class="cols c3">
            <div class="col" v-for="(colItems,ci) in [filteredNotes.filter((_,i)=>i%3===0),filteredNotes.filter((_,i)=>i%3===1),filteredNotes.filter((_,i)=>i%3===2)]" :key="ci">
              <NoteClip v-for="x in colItems" :key="x.id" :x="x" />
            </div>
          </div>
        </div>
      </section>

      <div class="flower-divider"></div>
      <footer class="colophon">花海生活报 · 本期完 · 明日准时出版</footer>
    </div>

    <!-- 编辑器 + 对话室 + 资料 + 看板 + toast -->
    <EditorModal v-if="ed.show" :ed="ed" :fields="edFields" :mod="edMod"
      @save="saveRecord" @close="ed.show=false" />
    <ChatRoom v-if="chatOpen" @close="chatOpen = false" />
    <ProfileModal v-if="profileOpen" @close="profileOpen = false" />
    <AdminBoard v-if="adminOpen" @close="adminOpen = false" />
    <ToastList />
  </div>
</template>
