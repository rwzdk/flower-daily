<script setup>
import { useApp } from "../store";
defineProps(["g"]);
const { today, del, goalPct, stepGoal, goalStreak, last7, flowerSvg, pic, icon } = useApp();
</script>

<template>
  <div class="goal">
    <div class="goal-row">
      <div class="pot" v-html="flowerSvg(g)"></div>
      <div class="goal-main">
        <div class="gt">
          <span><span class="em" v-html="pic(g.emoji)"></span>{{ g.name }}
            <span v-if="g.lastStep===today" class="watered"><span class="icn-inline" v-html="icon('drop')"></span> 今日已浇水</span>
            <button class="gdel" @click="del('goal',g.id)">撤下</button></span>
          <span>{{ g.current }} / {{ g.target }} {{ g.unit }}</span>
        </div>
        <div class="vine">
          <span class="tr"><i :style="{width:goalPct(g)+'%'}"></i>
            <b v-for="ms in [25,50,75]" :key="ms" class="ms" :class="{ok:goalPct(g)>=ms}" :style="{left:ms+'%'}"></b>
          </span>
          <button class="step" @click="stepGoal(g)" title="浇水 +1">＋1</button>
        </div>
        <div class="waterweek">
          <span v-for="d in last7" :key="d" class="wd" :class="{ok:g.waterLog && g.waterLog.includes(d)}"></span>
          <span class="streak" v-if="goalStreak(g)>0"><span class="icn-inline" v-html="icon('flame')"></span> 连浇 {{ goalStreak(g) }} 天</span>
          <span v-else style="font-size:10px;color:var(--ink-faint)">近 7 天浇水记录</span>
        </div>
        <div class="eta" v-if="g.current<g.target">按每天 ＋1，约 <b>{{ g.target-g.current }}</b> 天后收成<span v-if="g.note"> · <span class="icn-inline" v-html="icon('pencil')"></span> {{ g.note }}</span></div>
        <div class="eta" v-else><b><span class="icn-inline" v-html="icon('party')"></span> 已收成，加印喜报！</b><span v-if="g.note"> · <span class="icn-inline" v-html="icon('pencil')"></span> {{ g.note }}</span></div>
      </div>
    </div>
  </div>
</template>
