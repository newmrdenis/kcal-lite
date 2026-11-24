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

// Apple Health import through the URL is switched off (2026-11-24): both parameters are ignored.
const importHistory = value => context.processUrlQueryParameters('?active_history=' + encodeURIComponent(value));
importHistory('2026-11-12=520\n2026-11-11=310');
assert.equal(saves, 0);
assert.equal(days['2026-11-11'].healthSyncKcal, 400);
assert.equal(days['2026-11-12'], undefined);
context.processUrlQueryParameters('?active_kcal=200');
assert.equal(saves, 0);
assert.equal(days['2026-11-13'], undefined);
// Quick food entry through the URL still works.
context.processUrlQueryParameters('?food=test&kcal=180');
assert.equal(saves, 1);
assert.equal(days['2026-11-13'].entries[0].kcal, 180);
console.log('PASS: shortcut launch text, Apple Health URL import ignored, quick food entry kept');
