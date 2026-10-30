<script setup>
/* ---- 个人资料编辑（昵称 / 头像 / 签名） ---- */
import { reactive, ref } from "vue";
import { saveProfile } from "../auth";
import { auth } from "../auth";
import { toast, icon } from "../store";
import { AVATAR_ICONS } from "../config";
import Avatar from "./Avatar.vue";

const emit = defineEmits(["close"]);

const form = reactive({
  nickname: auth.user?.nickname || "",
  avatar: auth.user?.avatar || "",
  bio: auth.user?.bio || "",
});
const busy = ref(false);

function pickImg(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    const img = new Image();
    img.onload = () => {
      // 压到 96px，base64 后一般 <15KB，D1 存得下
      const c = document.createElement("canvas");
      const s = Math.min(1, 96 / Math.max(img.width, img.height));
      c.width = Math.max(1, Math.round(img.width * s));
      c.height = Math.max(1, Math.round(img.height * s));
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      form.avatar = c.toDataURL("image/png");
    };
    img.src = rd.result;
  };
  rd.readAsDataURL(file);
}

async function save() {
  if (!form.nickname.trim()) return toast("笔名不能为空");
  busy.value = true;
  try {
    await saveProfile({ nickname: form.nickname.trim(), avatar: form.avatar, bio: form.bio.trim() });
    toast("资料已付印 ✓");
    emit("close");
  } catch (e) {
    toast(e.message);
  }
  busy.value = false;
}

const AVATARS = AVATAR_ICONS;
</script>

<template>
  <div class="mask" @click.self="emit('close')">
    <div class="editor profile-editor">
      <h3>我的资料</h3>
      <div class="profile-top">
        <Avatar :a="form.avatar" :size="64" />
        <div class="profile-top-acts">
          <label class="fp-btn"><span class="icn-inline" v-html="icon('folder')"></span> 上传头像<input type="file" accept="image/*" hidden @change="pickImg"></label>
          <button class="fp-clear2" v-if="form.avatar" @click="form.avatar=''">移除图片</button>
        </div>
        <div class="profile-email">{{ auth.user?.email }}</div>
      </div>
      <div class="emoji-row">
        <button v-for="e in AVATARS" :key="e" class="emoji-pick" :class="{ on: form.avatar === e }" @click="form.avatar = e" v-html="icon(e)"></button>
      </div>
      <div class="f-row"><label>笔名</label>
        <input v-model.trim="form.nickname" type="text" maxlength="24" placeholder="在这份报纸上怎么称呼你">
      </div>
      <div class="f-row"><label>签名</label>
        <input v-model.trim="form.bio" type="text" maxlength="60" placeholder="一句话介绍自己（可选）">
      </div>
      <div class="f-row" v-if="auth.lastLogin"><label>上次登录</label>
        <div class="login-loc"><span class="icn-inline" v-html="icon('place')"></span> {{ auth.lastLogin.location || "未知" }} · {{ (auth.lastLogin.created_at || "").slice(0, 16).replace("T", " ") }}</div>
      </div>
      <div class="f-acts">
        <button class="btn ghost" @click="emit('close')">再想想</button>
        <button class="btn" :disabled="busy" @click="save">付印保存 ✓</button>
      </div>
    </div>
  </div>
</template>
