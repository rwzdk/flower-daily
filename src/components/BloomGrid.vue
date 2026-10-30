<script setup>
import { useApp } from "../store";
const { checks, toggleCheck, del, pic } = useApp();
</script>

<template>
  <div class="bloom-grid">
    <div v-for="x in checks" :key="x.id" class="bloom" :class="{done:x.done}" @click="toggleCheck(x)">
      <button class="del" @click.stop="del('check',x.id)">×</button>
      <div class="e"><img v-if="x.img" class="stamp-img" :src="x.img" alt=""><span v-else class="e-icn" v-html="pic(x.emoji)"></span></div>
      <div class="n">{{ x.name }}</div>
      <div class="s">连续 {{ x.streak }} 天</div>
    </div>
  </div>
</template>
