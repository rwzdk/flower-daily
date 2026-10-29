import { createApp } from "vue";
import AppMobile from "./AppMobile.vue";
import "../assets/app.css";

function failBanner(e) {
  document.getElementById("app").innerHTML =
    '<div style="max-width:340px;margin:60px auto;padding:24px;border:2px solid #e07b39;border-radius:14px;font-family:sans-serif;text-align:center">' +
    '<h2 style="margin:0 0 10px">📰 报纸印刷故障</h2>' +
    '<p style="margin:6px 0">页面没有正常渲染，请刷新重试。</p>' +
    '<p style="color:#999;font-size:12px">' + (e && e.message ? e.message : "") + "</p></div>";
}

try {
  createApp(AppMobile).mount("#app");
} catch (e) {
  failBanner(e);
}
