/* ---- 日期与 id 工具 ---- */
export function dstr(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
export function todayStr(d) { return dstr(d || new Date()); }
export function yesterdayStr() {
  const d = new Date(); d.setDate(d.getDate() - 1); return dstr(d);
}
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
