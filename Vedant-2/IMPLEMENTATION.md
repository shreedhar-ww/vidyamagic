# Math Magic — Implementation Plan

> **Goal:** Build an adaptive, themed, PWA-based learning app for Indian Class 2 kids. Math + GK at launch. ₹99/year pricing.

---

## 1. Architecture

```
┌──────────────────────────────────────────────┐
│  FRONTEND (PWA — installable, offline-first) │
│  ─ HTML / CSS / JS (no framework yet)        │
│  ─ Service Worker for offline                │
│  ─ Manifest for install                      │
│  ─ LocalStorage for progress (offline)       │
│  ─ Sync to backend when online               │
└──────────────────────────────────────────────┘
                     ↕ REST API
┌──────────────────────────────────────────────┐
│  BACKEND (Node.js + Express)                  │
│  ─ Auth (JWT)                                │
│  ─ Progress sync                             │
│  ─ Attempts logging                          │
│  ─ Adaptive engine helpers                   │
└──────────────────────────────────────────────┘
                     ↕
┌──────────────────────────────────────────────┐
│  DATABASE (PostgreSQL)                        │
│  ─ users, kids, progress, attempts, payments  │
└──────────────────────────────────────────────┘
```

---

## 2. Folder Structure

```
Vedant-2/
├── IMPLEMENTATION.md            ← This file
├── prototype.html               ← Page 1: Theme picker + Adventure Map
├── topic-addition.html          ← Page 2: Adaptive Addition learning
├── manifest.json                ← PWA install config
├── service-worker.js            ← Offline support
├── js/
│   ├── theme.js                 ← Theme system (Jungle/Space/Magic)
│   ├── progress.js              ← LocalStorage progress + backend sync
│   ├── adaptive.js              ← Adaptive learning engine
│   └── api.js                   ← Backend HTTP client
├── css/
│   └── themes.css               ← Theme CSS variables
└── backend/
    ├── package.json
    ├── server.js
    ├── db.js
    ├── schema.sql               ← Postgres schema
    ├── .env.example
    └── routes/
        ├── auth.js
        ├── progress.js
        └── attempts.js
```

---

## 3. Themes System

Three themes, swappable at runtime via CSS variables + label dictionary:

| Theme | Mascot | Map metaphor | Color palette |
|---|---|---|---|
| 🌴 **Jungle Explorer** | 🐵 Monkey guide | Treasure trail through forest | Greens + earth tones |
| 🚀 **Space Mission** | 👨‍🚀 Astronaut kid | Planets to visit | Deep blues + purples |
| 🏰 **Magic Kingdom** | 🦉 Wise owl | Castle path through enchanted land | Purple + pink + gold |

**Implementation:** Theme stored in `localStorage.theme`. Loaded on every page. Swaps:
- CSS variables (colors, gradient backgrounds)
- Mascot emoji
- Label words ("Topics" → "Treasures" / "Missions" / "Spells")

---

## 4. Adaptive Learning Engine

### Per-skill tracking

For every kid × skill combination, we track:

```js
{
  difficulty: 1-5,        // current question level
  mastery: 0.0-1.0,       // rolling skill score
  streak: int,            // correct in a row
  lastResults: [],        // sliding window of last 5 (1=correct, 0=wrong)
  totalAttempts: int,
  totalCorrect: int,
  weakSpots: []           // wrong questions to revisit
}
```

### Decision rules

```
After each answer:
  1. Push result into lastResults (max 5)
  2. Update streak (+1 if correct, reset to 0 if wrong)
  3. Update mastery = 0.6×accuracy + 0.3×prev + 0.1×speedBonus

If lastResults = [1,1,1,1,1]:
  → PROMOTE (difficulty + 1, reset window)
If lastResults = [0,0,0,0,0]:
  → DEMOTE (difficulty - 1, reset window)
```

### Question selection

```
Each session:
  70% — current skill at current difficulty
  20% — review: from weakSpots (past mistakes)
  10% — preview: next-difficulty question (gentle exposure)
```

### Skills for Addition

| Skill | Difficulty | Example |
|---|---|---|
| `add_no_carry_2d` | 1 | 23 + 14 |
| `add_with_carry_2d` | 2 | 38 + 47 |
| `add_3digit` | 3 | 356 + 478 |
| `add_4digit` | 4 | 1234 + 5678 |
| `add_missing_addend` | 5 | __ + 25 = 80 |

---

## 5. Database Schema

See `backend/schema.sql` for full SQL. Tables:

- **users** — parent accounts
- **kids** — child profiles (one parent → many kids)
- **progress** — per-kid per-topic aggregate
- **skill_state** — per-kid per-skill adaptive state (mastery, difficulty)
- **attempts** — every question answered (for analytics)

---

## 6. PWA Setup

- `manifest.json` declares app name, icons, theme color, display mode
- `service-worker.js` caches static assets for offline play
- "Add to Home Screen" prompt fires after 2 sessions

---

## 7. API Endpoints (Backend)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Parent creates account |
| POST | `/api/auth/login` | Parent login → JWT |
| GET | `/api/kids` | List kids for parent |
| POST | `/api/kids` | Add a kid |
| GET | `/api/progress/:kidId` | Get full progress |
| POST | `/api/progress/sync` | Sync localStorage → DB |
| POST | `/api/attempts` | Log a question attempt |
| GET | `/api/skill-state/:kidId/:skill` | Get adaptive state |

---

## 8. Build Order (This Session)

✅ **Phase A — Foundation**
1. IMPLEMENTATION.md (this file)
2. Backend skeleton (server, db, schema, routes)
3. PWA files (manifest, service worker)
4. JS modules (theme, progress, adaptive, api)
5. CSS theme variables

✅ **Phase B — Page 1: prototype.html**
- Theme picker on first launch
- Adventure Map themed by selection
- Topic unlock states from localStorage progress

✅ **Phase C — Page 2: topic-addition.html**
- Themed header
- Adaptive Quiz (uses adaptive engine)
- Mastery bar showing skill progress
- Auto-promote/demote difficulty
- localStorage progress + backend sync

---

## 9. Running the App

### Frontend (no build needed)
```bash
# From project root
python3 -m http.server 8080
# Open http://localhost:8080/prototype.html
```

### Backend (requires Node 18+ and Postgres 14+)
```bash
cd backend
cp .env.example .env       # Fill in DB credentials
npm install
psql -U postgres -d mathmagic -f schema.sql
npm run dev                # Runs on port 3001
```

Frontend talks to backend at `http://localhost:3001/api/*`.

---

## 10. Future Phases

- Phase 2 (Week 3+): Add Stories tab adaptive logic
- Phase 3: GK section (Bharat Discover)
- Phase 4: Razorpay payment integration
- Phase 5: Parent dashboard
- Phase 6: AI tutor via Claude API (Edge Function)
