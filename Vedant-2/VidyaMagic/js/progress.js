// VidyaMagic — Progress Tracking (LocalStorage + optional backend sync)

const KEY = 'vm_progress';

const DEFAULT = {
  kidId: null,             // set when user signs up; null = local-only mode
  kidName: 'Explorer',
  totalStars: 0,
  topics: {},              // { addition: { currentLevel, sections, stars } }
  skills: {},              // { add_no_carry_2d: { difficulty, mastery, ... } }
  attempts: []             // recent attempts buffer (up to 100)
};

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { localStorage.setItem(KEY, JSON.stringify(DEFAULT)); return { ...DEFAULT }; }
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

export function save(p) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function getTopic(p, subject, topic) {
  const key = `${subject}.${topic}`;
  if (!p.topics[key]) {
    p.topics[key] = {
      subject, topic,
      currentLevel: 1,
      sections: { learn: false, stories: false, quiz: false },
      stars: 0,
      lastPlayed: null
    };
  }
  return p.topics[key];
}

export function getSkill(p, skill) {
  if (!p.skills[skill]) {
    p.skills[skill] = {
      skill,
      difficulty: 1,
      mastery: 0,
      streak: 0,
      lastResults: [],
      totalAttempts: 0,
      totalCorrect: 0,
      weakSpots: []
    };
  }
  return p.skills[skill];
}

export function addStars(p, n) {
  p.totalStars = (p.totalStars || 0) + n;
}

export function pushAttempt(p, attempt) {
  p.attempts = p.attempts || [];
  p.attempts.push({ ...attempt, ts: Date.now() });
  if (p.attempts.length > 100) p.attempts = p.attempts.slice(-100);
}

export function reset() {
  localStorage.removeItem(KEY);
}
