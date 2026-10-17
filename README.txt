Kcal Lite — centered toasts + two-stage calorie-overage colors

Files to place into the GitHub Pages repository root:
  index.html
  sw.js
  manifest.webmanifest

User-facing changes:
  - Toast messages appear at the CENTER of the viewport, rather than top-left.
  - Effective calorie budget = base daily goal + exercise calories if the option is enabled.
  - Eaten <= effective budget: normal green colors.
  - Effective budget < eaten <= effective budget * 1.10: orange app background, hero and progress ring.
  - Eaten > effective budget * 1.10: vibrant red background, hero and progress ring.
  - Both dark and light appearance are supported; changes update when selecting another day.

Examples (daily effective budget 2000 kcal):
  2000 kcal: green
  2001..2200 kcal: orange
  2201 kcal or more: red

The WebDAV sync code and autosync schedule have NOT been changed.
Remote WebDAV address stays https://pica.tailda1815.ts.net:6065/state.json
The WebDAV user kcal has its root at /home/denis/data/webdav/kcal-lite,
so the file is physically stored at /home/denis/data/webdav/kcal-lite/state.json.

Deployment:
  Copy index.html, sw.js, manifest.webmanifest to repo; commit and push.
  Wait for GitHub Pages deployment; reload the app. Service Worker cache version is bumped to v3.
  To test without altering your actual diary, add entries to a previously unused date.
