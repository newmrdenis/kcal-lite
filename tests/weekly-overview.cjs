const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const helpers = html.slice(html.indexOf('    function getDayBudget('), html.indexOf('    function budgetRingMarkup('));
const state = {settings: {dailyGoal: 1900, includeExerciseInBudget: true}, days: {}};
const context = vm.createContext({appState: state, getLocalDateString: d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`});
vm.runInContext(helpers, context);
for (const [today, first, last] of [
  [new Date(2026,10,3), '2026-11-02', '2026-11-08'],
  [new Date(2026,10,8), '2026-11-02', '2026-11-08'],
  [new Date(2027,0,1), '2026-12-28', '2027-01-03'],
  [new Date(2026,2,8), '2026-03-02', '2026-03-08']
]) {
  const week = context.getCurrentWeek(today);
  assert.equal(week.length, 7);
  assert.equal(week[0].date, first);
  assert.equal(week[6].date, last);
  assert.equal(week.reduce((sum, day) => sum + day.effectiveBudget, 0), 13300);
}
assert.equal(Object.keys(state.days).length, 0);
state.days['2026-11-02'] = {entries: [{type:'food',kcal:2000},{type:'workout',kcal:100}],healthSyncKcal:500};
let week = context.getCurrentWeek(new Date(2026,10,3));
assert.equal(week.reduce((sum,day) => sum + day.eatenKcal, 0), 2000);
assert.equal(week.reduce((sum,day) => sum + day.effectiveBudget, 0), 13600);
state.settings.includeExerciseInBudget = false;
week = context.getCurrentWeek(new Date(2026,10,3));
assert.equal(week.reduce((sum,day) => sum + day.effectiveBudget, 0), 13300);
assert.equal(context.getBudgetColor(0.9).redProgress, 0);
assert.equal(context.getBudgetColor(1).ringColor, 'rgb(16, 185, 129)');
assert.equal(context.getBudgetColor(0.99).ringColor, context.getBudgetColor(1).ringColor);
assert.equal(context.getBudgetColor(1.001).ringColor, 'rgb(239, 68, 68)');
assert.equal(context.getBudgetColor(1.2).ringColor, context.getBudgetColor(1.001).ringColor);
console.log('PASS: current week, year and DST boundaries, empty days, totals, activity toggle and colors');
