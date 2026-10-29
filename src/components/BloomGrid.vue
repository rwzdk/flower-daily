<script setup>
import { useApp } from "../store";
const { checks, toggleCheck, del } = useApp();
</script>

<template>
  <div class="bloom-grid">
    <div v-for="x in checks" :key="x.id" class="bloom" :class="{done:x.done}" @click="toggleCheck(x)">
      <button class="del" @click.stop="del('check',x.id)">×</button>
      <div class="e"><img v-if="x.img" class="stamp-img" :src="x.img" alt=""><template v-else>{{ x.emoji }}</template></div>
      <div class="n">{{ x.name }}</div>
      <div class="s">连续 {{ x.streak }} 天</div>
    </div>
  </div>
</template>
