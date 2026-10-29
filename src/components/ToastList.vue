<script setup>
import { useApp } from "../store";
const { toasts } = useApp();
</script>

<template>
  <div class="toasts"><div v-for="t in toasts" :key="t.id" class="toast">{{ t.msg }}</div></div>
</template>
