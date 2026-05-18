// VidyaMagic — Adaptive Learning Engine
// Question generators + difficulty/mastery management.

import { getSkill, save, pushAttempt } from './progress.js';

// ── SKILL CATALOG ──
export const ADDITION_SKILLS = [
  { id: 'add_no_carry_2d',   level: 1, label: '2-digit, no carry' },
  { id: 'add_with_carry_2d', level: 2, label: '2-digit, with carry' },
  { id: 'add_3digit',        level: 3, label: '3-digit numbers' },
  { id: 'add_4digit',        level: 4, label: '4-digit numbers' },
  { id: 'add_missing_addend',level: 5, label: 'Find the missing number' }
];

const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => a.slice().sort(() => Math.random() - 0.5);

// ── QUESTION GENERATORS ──
function genNoCarry2d() {
  let a, b;
  do {
    a = rnd(80) + 10;
    b = rnd(80) + 10;
  } while ((a % 10) + (b % 10) >= 10 || a + b > 99);
  return makeMCQ(`${a} + ${b}`, a + b, 'add_no_carry_2d');
}

function genWithCarry2d() {
  let a, b;
  do {
    a = rnd(80) + 10;
    b = rnd(80) + 10;
  } while ((a % 10) + (b % 10) < 10);
  return makeMCQ(`${a} + ${b}`, a + b, 'add_with_carry_2d');
}

function gen3digit() {
  const a = rnd(800) + 100;
  const b = rnd(800) + 100;
  return makeMCQ(`${a} + ${b}`, a + b, 'add_3digit');
}

function gen4digit() {
  const a = rnd(8000) + 1000;
  const b = rnd(8000) + 1000;
  return makeMCQ(`${a} + ${b}`, a + b, 'add_4digit');
}

function genMissingAddend() {
  const b = rnd(40) + 10;
  const c = rnd(80) + 30;
  const a = c - b;
  if (a < 1) return genMissingAddend();
  return makeMCQ(`___ + ${b} = ${c}`, a, 'add_missing_addend');
}

function makeMCQ(q, ans, skill) {
  const wrongs = uniqueWrongs(ans);
  const opts = shuffle([ans, ...wrongs.slice(0, 3)]);
  return { q, ans, options: opts, skill };
}

function uniqueWrongs(ans) {
  const set = new Set();
  const tries = [ans + 10, ans - 10, ans + 1, ans - 1, ans + 100, ans - 100, ans + 9, ans - 9];
  for (const w of tries) if (w > 0 && w !== ans) set.add(w);
  return Array.from(set);
}

const GENERATORS = {
  add_no_carry_2d:    genNoCarry2d,
  add_with_carry_2d:  genWithCarry2d,
  add_3digit:         gen3digit,
  add_4digit:         gen4digit,
  add_missing_addend: genMissingAddend
};

// ── ADAPTIVE QUESTION SELECTION ──
// Mix: 70% current skill, 20% review weakSpots, 10% preview next skill
export function nextQuestion(progress, currentSkillId) {
  const skillState = getSkill(progress, currentSkillId);
  const r = Math.random();

  // Review from weakSpots
  if (r < 0.2 && skillState.weakSpots.length > 0) {
    const spot = skillState.weakSpots[rnd(skillState.weakSpots.length)];
    return { ...spot, isReview: true };
  }

  // Preview next-level skill
  if (r < 0.3) {
    const next = nextSkillId(currentSkillId);
    if (next && GENERATORS[next]) {
      return { ...GENERATORS[next](), isPreview: true };
    }
  }

  // Default: current skill
  return GENERATORS[currentSkillId]();
}

export function nextSkillId(currentId) {
  const idx = ADDITION_SKILLS.findIndex(s => s.id === currentId);
  return idx >= 0 && idx + 1 < ADDITION_SKILLS.length ? ADDITION_SKILLS[idx + 1].id : null;
}

// ── RECORD AN ATTEMPT ──
// Returns { promoted, demoted, newDifficulty }
export function recordAttempt(progress, skillId, question, answerGiven, isCorrect, timeTaken) {
  const s = getSkill(progress, skillId);

  // Sliding window
  s.lastResults.push(isCorrect ? 1 : 0);
  if (s.lastResults.length > 5) s.lastResults.shift();

  // Streak
  s.streak = isCorrect ? s.streak + 1 : 0;

  // Totals
  s.totalAttempts += 1;
  if (isCorrect) s.totalCorrect += 1;

  // Mastery: 0.6 × accuracy + 0.3 × prev + 0.1 × speed
  const accuracy = s.lastResults.reduce((a, b) => a + b, 0) / s.lastResults.length;
  const speedBonus = isCorrect && timeTaken < 6 ? 0.1 : 0;
  s.mastery = Math.min(1, 0.6 * accuracy + 0.3 * (s.mastery || 0) + speedBonus);

  // Track weakSpots (keep up to 5)
  if (!isCorrect) {
    s.weakSpots = s.weakSpots || [];
    if (!s.weakSpots.find(w => w.q === question.q)) {
      s.weakSpots.push({ q: question.q, ans: question.ans, options: question.options, skill: skillId });
      if (s.weakSpots.length > 5) s.weakSpots.shift();
    }
  } else {
    // remove from weakSpots if revisited correctly
    s.weakSpots = (s.weakSpots || []).filter(w => w.q !== question.q);
  }

  // Promotion / demotion check
  let promoted = false, demoted = false;
  if (s.lastResults.length === 5) {
    const sum = s.lastResults.reduce((a, b) => a + b, 0);
    if (sum === 5) {
      s.difficulty = Math.min(5, s.difficulty + 1);
      s.lastResults = [];
      promoted = true;
    } else if (sum === 0) {
      s.difficulty = Math.max(1, s.difficulty - 1);
      s.lastResults = [];
      demoted = true;
    }
  }

  // Log attempt
  pushAttempt(progress, {
    skill: skillId,
    question: question.q,
    answerGiven: String(answerGiven),
    isCorrect, timeTaken,
    difficulty: s.difficulty
  });

  save(progress);
  return { promoted, demoted, newDifficulty: s.difficulty, mastery: s.mastery };
}

// Pick the active skill for a topic based on which is "current"
// For Addition, the current skill = first skill where mastery < 0.85 (Khan Academy style)
export function activeSkillFor(progress, skills) {
  for (const s of skills) {
    const state = getSkill(progress, s.id);
    if (state.mastery < 0.85 || state.totalAttempts < 5) return s.id;
  }
  return skills[skills.length - 1].id; // all mastered → stay at last
}
