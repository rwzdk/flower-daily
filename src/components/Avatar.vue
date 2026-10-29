<script setup>
/* ---- 用户头像：支持 emoji 或本地上传的图片（base64） ---- */
defineProps({ a: { type: String, default: "" }, size: { type: Number, default: 34 } });
</script>

<template>
  <span class="ava-dot" :style="{ width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.6) + 'px' }">
    <img v-if="a && a.startsWith('data:')" :src="a" alt="" />
    <template v-else>{{ a || "🌼" }}</template>
  </span>
</template>
