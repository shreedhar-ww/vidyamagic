# VidyaMagic — Implementation Plan

> **Tagline:** *India's themed adventure learning app — pick Jungle, Space, or Magic. Master Math, discover Bharat, and learn through play. ₹99/year.*

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
│  ─ users, kids, progress, skill_state, ...    │
└──────────────────────────────────────────────┘
```

## 2. Folder Structure

```
VidyaMagic/
├── IMPLEMENTATION.md            ← This file
├── prototype.html               ← Page 1: Theme picker + Adventure Map
├── topic-addition.html          ← Page 2: Adaptive Addition
├── manifest.json                ← PWA install config
├── service-worker.js            ← Offline support
├── icons/                       ← PWA icons
├── js/
│   ├── theme.js                 ← Theme system
│   ├── progress.js              ← LocalStorage progress + sync
│   ├── adaptive.js              ← Adaptive learning engine
│   └── api.js                   ← Backend HTTP client
├── css/
│   └── themes.css               ← Theme CSS variables
└── backend/
    ├── package.json
    ├── server.js
    ├── db.js
    ├── schema.sql
    ├── .env.example
    └── routes/
        ├── auth.js
        ├── progress.js
        └── attempts.js
```

## 3. Themes

| Theme | Mascot | Map metaphor | Palette |
|---|---|---|---|
| 🌴 **Jungle Explorer** | 🐵 Monkey | Treasure trail | Greens + earth |
| 🚀 **Space Mission** | 👨‍🚀 Astronaut | Planets to visit | Deep blues + purple |
| 🏰 **Magic Kingdom** | 🦉 Wise Owl | Castle path | Purple + pink + gold |

Stored in `localStorage.vm_theme`. Swaps CSS variables, mascot, and label words.

## 4. Adaptive Learning Engine

### Per-skill state
```js
{
  difficulty: 1-5,
  mastery: 0.0-1.0,
  streak: int,
  lastResults: [1,1,0,1,1],   // sliding window
  totalAttempts: int,
  totalCorrect: int,
  weakSpots: []               // wrong questions to revisit
}
```

### Promotion / demotion
- 5/5 correct → `difficulty + 1` (reset window)
- 0/5 correct → `difficulty - 1` (reset window)
- Mixed → stay

### Question mix
- 70% current skill at current difficulty
- 20% review from weakSpots
- 10% preview at `difficulty + 1`

### Mastery formula
```
mastery = 0.6 × accuracy_window + 0.3 × prev_mastery + 0.1 × speed_bonus
```

### Skill catalog (Addition)
| Skill | Difficulty | Example |
|---|---|---|
| `add_no_carry_2d` | 1 | 23 + 14 |
| `add_with_carry_2d` | 2 | 38 + 47 |
| `add_3digit` | 3 | 356 + 478 |
| `add_4digit` | 4 | 1234 + 5678 |
| `add_missing_addend` | 5 | __ + 25 = 80 |

## 5. Database Schema

See `backend/schema.sql`.
- **users** — parent accounts
- **kids** — child profiles
- **progress** — per-kid per-topic aggregate
- **skill_state** — per-kid per-skill adaptive state
- **attempts** — every question answered
- **payments** — subscriptions

## 6. PWA Setup
- `manifest.json` declares app, icons, theme color
- `service-worker.js` caches static assets
- "Add to Home Screen" prompt fires on second visit

## 7. API Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Parent creates account |
| POST | `/api/auth/login` | Parent login → JWT |
| GET | `/api/kids` | List kids |
| POST | `/api/kids` | Add a kid |
| GET | `/api/progress/:kidId` | Get full progress |
| POST | `/api/progress/sync` | Sync localStorage → DB |
| POST | `/api/attempts` | Log a question attempt |
| GET | `/api/skill-state/:kidId/:skill` | Get adaptive state |

## 8. Build Order

✅ Backend skeleton
✅ PWA files
✅ JS modules
✅ CSS theme variables
✅ prototype.html (theme picker + adventure map)
✅ topic-addition.html (adaptive)

## 9. Running the App

### Frontend
```bash
cd VidyaMagic
python3 -m http.server 8080
# Open http://localhost:8080/prototype.html
```

### Backend
```bash
cd VidyaMagic/backend
cp .env.example .env       # Fill in DB credentials
npm install
createdb vidyamagic
psql -d vidyamagic -f schema.sql
npm run dev                # Runs on port 3001
```

## 10. Roadmap

| Phase | Scope |
|---|---|
| 1 (now) | Math (Addition adaptive) + Theme system + PWA |
| 2 (week 3) | Subtraction, Multiplication adaptive |
| 3 (month 2) | Bharat Discover (GK) — 5 states |
| 4 (month 3) | Razorpay payments |
| 5 (month 4) | Parent dashboard |
| 6 (month 6) | Claude AI tutor |
