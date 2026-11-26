const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const helpers = html.slice(html.indexOf('    function maintenanceFor('), html.indexOf('    function renderHeroSummary('));
const state = {settings: {dailyGoal: 1900, includeExerciseInBudget: true}, days: {}};
const elements = {};
const context = vm.createContext({document: {getElementById: id => elements[id] ??= {}}, escapeHtml: text => text, appState: state, getLocalDateString: (d = new Date(2026, 10, 16)) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`});
vm.runInContext(helpers, context);
for (const [today, first, last] of [
  ['2026-11-03', '2026-11-02', '2026-11-08'],
  ['2026-11-08', '2026-11-02', '2026-11-08'],
  ['2027-01-01', '2026-12-28', '2027-01-03'],
  ['2026-03-08', '2026-03-02', '2026-03-08']
]) {
  const week = context.getWeekForDate(today);
  assert.equal(week.length, 7);
  assert.equal(week[0].date, first);
  assert.equal(week[6].date, last);
  assert.equal(week.reduce((sum, day) => sum + day.effectiveBudget, 0), 13300);
}
assert.equal(Object.keys(state.days).length, 0);
state.days['2026-11-02'] = {entries: [{type:'food',kcal:2000},{type:'workout',kcal:100}],healthSyncKcal:500};
let week = context.getWeekForDate('2026-11-03');
assert.equal(week.reduce((sum,day) => sum + day.eatenKcal, 0), 2000);
assert.equal(week.reduce((sum,day) => sum + day.effectiveBudget, 0), 13600);
state.settings.includeExerciseInBudget = false;
week = context.getWeekForDate('2026-11-03');
assert.equal(week.reduce((sum,day) => sum + day.effectiveBudget, 0), 13300);
assert.equal(context.getBudgetColor(0.9).redProgress, 0);
assert.equal(context.getBudgetColor(1).ringColor, 'rgb(16, 185, 129)');
assert.equal(context.getBudgetColor(0.99).ringColor, context.getBudgetColor(1).ringColor);
assert.equal(context.getBudgetColor(1.001).ringColor, 'rgb(239, 68, 68)');
assert.equal(context.getBudgetColor(1.2).ringColor, context.getBudgetColor(1.001).ringColor);
context.selectedDate = '2026-11-16';
context.renderWeeklyOverview();
assert.equal(elements.weekTotals.textContent, '0 / 13300 kcal');
assert.match(elements.weekDayRings.innerHTML, /2026-11-22/);
context.selectedDate = '2026-11-15';
state.days['2026-11-15'] = {entries: [{type: 'food', kcal: 1200}], healthSyncKcal: 400};
state.settings.includeExerciseInBudget = true;
context.renderWeeklyOverview();
assert.equal(elements.weekTotals.textContent, '1200 / 13500 kcal');
assert.match(elements.weekDayRings.innerHTML, /2026-11-09/);
assert.match(elements.weekDayRings.innerHTML, /2026-11-15.*aria-pressed="true"/);
assert.doesNotMatch(elements.weekDayRings.innerHTML, /2026-11-16/);
// Closed days get a check mark in the ring; open days are neutral, never red unless over budget.
assert.equal(context.dayStatus('2026-11-15', 1200, 2100, '2026-11-02', '2026-11-16'), 'open');
assert.equal(context.dayStatus('2026-11-15', 2200, 2100, '2026-11-02', '2026-11-16'), 'over');
assert.doesNotMatch(elements.weekDayRings.innerHTML, /data-closed-mark/);
state.days['2026-11-15'].closed = true;
assert.equal(context.dayStatus('2026-11-15', 1200, 2100, '2026-11-02', '2026-11-16'), 'ok');
context.renderWeeklyOverview();
assert.equal(elements.weekDayRings.innerHTML.match(/data-closed-mark/g).length, 1);
context.renderMonthOverview();
assert.equal(elements.monthGrid.innerHTML.match(/data-closed-mark/g).length, 1);
assert.doesNotMatch(elements.monthSummary.innerHTML, /не заверш/);
assert.doesNotMatch(context.dayRingMarkup(500, 2000, 'open', 'x'), /239, 68, 68/);
console.log('PASS: current week, year and DST boundaries, empty days, totals, activity toggle and colors');
