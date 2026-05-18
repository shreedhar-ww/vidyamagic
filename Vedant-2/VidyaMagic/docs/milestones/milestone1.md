# Milestone 1 — Foundation + Adaptive Math

> **Goal:** A fully playable PWA that a Class 2 kid can open on iPad, pick a theme, and learn Addition through an adaptive quiz that adjusts difficulty based on their answers.

**Status:** 🔄 In Progress
**Target:** Week 1–2

---

## Done Criteria (Milestone Complete When ALL are ✅)

- [ ] PWA installs on iPad via Safari "Add to Home Screen"
- [ ] Theme picker works — Jungle / Space / Magic all load correctly
- [ ] Adventure map shows 12 topic nodes, Addition is the only one enabled
- [ ] Addition → Learn tab: column addition step-by-step works
- [ ] Addition → Learn tab: repeated addition with emoji picker works
- [ ] Addition → Learn tab completion unlocks Stories tab
- [ ] Addition → Quiz tab: adaptive difficulty adjusts based on last 5 answers
- [ ] Addition → Quiz tab: mastery bar updates in real time
- [ ] Addition → Quiz tab: Level Up / Level Down toast on promotion/demotion
- [ ] Progress persists after browser reload (localStorage)
- [ ] Stars earned in quiz reflect on adventure map HUD
- [ ] App works offline after first load (service worker caching)

---

## Tasks

### T1.1 — PWA Shell ✅ Done
- [x] `manifest.json` with correct `start_url`, `scope`, icons
- [x] `service-worker.js` caching static assets
- [x] PNG icons generated (192x192, 512x512)
- [x] SW registered in both HTML pages
- [ ] **Verify install prompt appears on iPad + Chrome Mac** ← open issue

### T1.2 — Theme System ✅ Done
- [x] `js/theme.js` — 3 themes with colors, mascot, labels, deco emojis
- [x] Theme picker overlay on first launch
- [x] CSS variables swap on theme change
- [x] Mascot + speech bubble swap
- [x] Adventure map decorations (trees/stars/planets) per theme
- [x] "Change theme" button in HUD
- [ ] **Test all 3 themes end-to-end on real device**

### T1.3 — Adventure Map ✅ Done
- [x] 12 topic nodes across 3 terms
- [x] Winding SVG path connects nodes
- [x] Only Addition enabled, others locked
- [x] Completed nodes show ⭐ badge
- [x] In-progress nodes show current level number
- [x] Stars + progress bar in HUD
- [ ] **Verify map path renders correctly on mobile screen widths**

### T1.4 — Addition Learn Tab ✅ Done
- [x] Column addition step-by-step with carry-over animation
- [x] Step progress dots
- [x] Repeated addition with emoji picker
- [x] Learn tab completion → unlocks Stories tab

### T1.5 — Adaptive Quiz Engine ✅ Done
- [x] `js/adaptive.js` — skill catalog, question generators, promotion/demotion
- [x] `js/progress.js` — localStorage read/write
- [x] 5 skill levels for Addition:
  - Level 1: 2-digit no carry
  - Level 2: 2-digit with carry
  - Level 3: 3-digit
  - Level 4: 4-digit
  - Level 5: missing addend
- [x] Sliding window (last 5): 5/5 → promote, 0/5 → demote
- [x] Mastery formula: `0.6×accuracy + 0.3×prev + 0.1×speed`
- [x] Question mix: 70% current / 20% review / 10% preview
- [x] WeakSpots tracking — wrong answers revisited
- [x] Mastery bar + skill pill + difficulty badge in quiz HUD
- [x] Toast notifications on level change
- [ ] **Play test: verify difficulty actually adapts with a real kid (or simulate)**

### T1.6 — Backend Skeleton ✅ Done
- [x] `backend/server.js` — Express + CORS
- [x] `backend/schema.sql` — users, kids, progress, skill_state, attempts
- [x] `backend/routes/auth.js` — signup + login (JWT)
- [x] `backend/routes/progress.js` — sync localStorage → DB
- [x] `backend/routes/attempts.js` — log every answered question
- [ ] **Install dependencies + run locally** ← next step
- [ ] **Create Postgres DB + run schema.sql**
- [ ] **Wire frontend api.js to live backend**
- [ ] **Test progress sync: play on browser → check DB has rows**

### T1.7 — Bug Fixes + Polish 🔄 Open
- [ ] Verify all 3 theme colors render correctly (check jungle green, space dark)
- [ ] Check mobile layout on 375px screen (iPhone SE)
- [ ] Check tablet layout on 768px (iPad)
- [ ] Ensure offline mode works: load app → turn off WiFi → still playable
- [ ] Test "Add to Home Screen" on iPad → opens fullscreen, no Safari bar

---

## Known Issues

| Issue | Severity | Status |
|---|---|---|
| PWA install prompt not visible on user's device | High | 🔴 Open |
| Backend not connected (frontend uses localStorage only) | Medium | 🟡 Acceptable for M1 |
| Stories tab shows "locked" placeholder (no word problems yet) | Low | 🟡 Expected |
| No sound effects yet | Low | ⬜ M8 scope |

---

## File Map for This Milestone

```
VidyaMagic/
├── prototype.html          ← Page 1: Theme picker + map
├── topic-addition.html     ← Page 2: Adaptive addition
├── manifest.json           ← PWA config
├── service-worker.js       ← Offline caching
├── js/
│   ├── theme.js            ← Theme system
│   ├── progress.js         ← localStorage progress
│   ├── adaptive.js         ← Adaptive engine
│   └── api.js              ← Backend client
├── css/themes.css          ← Theme CSS variables
├── icons/
│   ├── icon-192.png        ← PWA icon
│   └── icon-512.png        ← PWA icon
└── backend/
    ├── server.js
    ├── schema.sql
    ├── db.js
    └── routes/
        ├── auth.js
        ├── progress.js
        └── attempts.js
```

---

## How to Run for Testing

### Frontend (no setup needed)
```bash
cd VidyaMagic
python3 -m http.server 8080
# Open http://localhost:8080/prototype.html
```

### Backend (requires Node 18+ and Postgres)
```bash
cd VidyaMagic/backend
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET
npm install
createdb vidyamagic
psql -d vidyamagic -f schema.sql
npm run dev
# API running at http://localhost:3001
```

### Test adaptive engine manually
Open browser console on `topic-addition.html` and run:
```js
// Simulate 5 wrong answers → should demote difficulty
import { getSkill } from './js/progress.js';
// Watch difficulty badge change after 5 wrong answers in quiz
```

---

## Next: Milestone 2
Once all M1 tasks are ✅:
→ Add adaptive quiz to remaining 11 math topics
→ Topic unlock logic on adventure map (complete topic A → unlock topic B)
→ See [milestone2.md](milestone2.md) *(coming soon)*
