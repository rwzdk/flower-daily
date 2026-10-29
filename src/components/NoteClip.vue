<script setup>
import { useApp } from "../store";
defineProps(["x"]);
const { openEditor, pinNote, del } = useApp();
</script>

<template>
  <div class="clip" :class="{pinned:x.pinned}">
    <h4>{{ x.title }}
      <button class="pin" @click="openEditor('notes', x)">修改</button>
      <button class="pin" :class="{on:x.pinned}" @click="pinNote(x)">{{ x.pinned?'已置顶':'置顶' }}</button>
      <button class="del" @click="del('note',x.id)">撤下</button>
    </h4>
    <p>{{ x.body }}</p>
    <div class="meta"><span v-if="x.tag"># {{ x.tag }}</span><span class="dt">{{ x.date }}</span></div>
  </div>
</template>
