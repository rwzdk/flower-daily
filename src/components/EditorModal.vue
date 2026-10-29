<script setup>
const props = defineProps(["ed", "fields", "mod"]);
defineEmits(["save", "close"]);

function pickImg(e, k) {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    const img = new Image();
    img.onload = () => {
      // 压缩到最大 144px，避免 localStorage 撑爆
      const c = document.createElement("canvas");
      const s = Math.min(1, 144 / Math.max(img.width, img.height));
      c.width = Math.max(1, Math.round(img.width * s));
      c.height = Math.max(1, Math.round(img.height * s));
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      props.ed.form[k] = c.toDataURL("image/png");
    };
    img.src = rd.result;
  };
  rd.readAsDataURL(file);
}
</script>

<template>
  <div class="mask" @click.self="$emit('close')">
    <div class="editor">
      <h3>{{ ed.editing ? "修订这则记录" : "新增 · " + mod.name }}</h3>
      <div class="f-row" v-for="f in fields" :key="f.k">
        <label>{{ f.l }}</label>
        <input v-if="f.t==='text'" type="text" v-model="ed.form[f.k]" :placeholder="f.ph||''">
        <textarea v-else-if="f.t==='textarea'" v-model="ed.form[f.k]" :placeholder="f.ph||''"></textarea>
        <input v-else-if="f.t==='number'" type="number" min="0" step="any" v-model.number="ed.form[f.k]" :placeholder="f.ph||''">
        <input v-else-if="f.t==='date'" type="date" v-model="ed.form[f.k]">
        <select v-else-if="f.t==='select'" v-model="ed.form[f.k]">
          <option v-for="c in mod.categories||[]" :key="c" :value="c">{{ c }}</option>
        </select>
        <div v-else-if="f.t==='file'" class="filepick">
          <label class="fp-btn">📁 从本地选择图片<input type="file" accept="image/*" hidden @change="pickImg($event, f.k)"></label>
          <span v-if="ed.form[f.k]" class="fp-prev"><img :src="ed.form[f.k]" alt=""><button class="fp-clear" @click="ed.form[f.k]=''">×</button></span>
          <span v-else class="fp-hint">{{ f.ph || '可选，未选则显示 emoji' }}</span>
        </div>
        <div v-else-if="f.t==='seg'" class="seg">
          <button v-for="o in f.options" :key="o.v" class="op" :class="{on:ed.form[f.k]===o.v}" @click="ed.form[f.k]=o.v">{{ o.l }}</button>
        </div>
      </div>
      <div class="f-acts">
        <button class="btn ghost" @click="$emit('close')">再想想</button>
        <button class="btn" :class="{orange:mod.type==='ledger'}" @click="$emit('save')">付印保存 ✓</button>
      </div>
    </div>
  </div>
</template>
