const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
for (const [, code] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(code);

const entries = [{type: 'food', kcal: 600}];
const days = {'2026-11-11': {entries, healthSyncKcal: 400, healthSyncTime: '07:00'}};
let saves = 0;
let time = '09:00';
const window = {location: {href: '', pathname: '/kcal-lite/'}, history: {replaceState(){}}};
const context = vm.createContext({
  window, URLSearchParams, document: {title: ''}, selectedDate: '2026-11-10',
  appState: {settings: {shortcutName: 'Health Sync'}},
  ensureDayRecord: date => days[date] ??= {entries: []},
  getLocalDateString: () => '2026-11-13',
  getCurrentTimeStr: () => time,
  saveState: () => saves++,
  renderAll(){}, showToast(){}
});
vm.runInContext(html.slice(html.indexOf('    function parseActiveHistory('), html.indexOf('    function addLogEntry(')), context);
context.triggerIosShortcut();
assert.equal(new URL(window.location.href).searchParams.get('text'), '2026-11-10');
context.triggerIosShortcut('last30');
assert.equal(new URL(window.location.href).searchParams.get('text'), 'last30');

const importHistory = value => context.processUrlQueryParameters('?active_history=' + encodeURIComponent(value));
importHistory('2026-11-12=520\n\n2026-11-11=310\n2026-11-12=510');
assert.equal(saves, 1);
assert.equal(days['2026-11-12'].healthSyncKcal, 510);
assert.equal(days['2026-11-11'].healthSyncKcal, 310);
assert.equal(days['2026-11-11'].entries, entries);
time = '10:00';
importHistory('2026-11-12=510\n2026-11-11=310');
assert.equal(saves, 1);
assert.equal(days['2026-11-12'].healthSyncTime, '09:00');
importHistory('2026-11-12=123\n2026-11-31=500');
assert.equal(saves, 1);
assert.equal(days['2026-11-12'].healthSyncKcal, 510);
importHistory('2026-11-10=0');
assert.equal(context.selectedDate, '2026-11-10');
assert.equal(days['2026-11-10'].healthSyncKcal, 0);
context.processUrlQueryParameters('?active_kcal=200');
assert.equal(days['2026-11-13'].healthSyncKcal, 200);
console.log('PASS: selected date and batch launches, replacement, unchanged reimport, invalid data, legacy links');
