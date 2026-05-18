// VidyaMagic — Theme System
// Three themes: jungle, space, magic. Stored in localStorage.

export const THEMES = {
  jungle: {
    id: 'jungle',
    name: 'Jungle Explorer',
    icon: '🌴',
    mascot: '🐵',
    mascotName: 'Banu the Monkey',
    bgGradient: 'linear-gradient(180deg,#8DD17A 0%,#6FB76A 35%,#3F9447 70%,#2C7A3F 100%)',
    heroGradient: 'linear-gradient(135deg,#2C7A3F 0%,#6FB76A 60%,#FFB347 100%)',
    pathColor: 'rgba(255,235,180,0.85)',
    glowColor: 'rgba(255,210,100,0.4)',
    accents: { yellow:'#FFD93D', orange:'#FF8C42', pink:'#E8743C', purple:'#3F9447', blue:'#5DA9D6', green:'#9CCC65' },
    labels: {
      mainTitle: 'Jungle Adventure!',
      subtitle: 'Find the hidden treasures 🗺️',
      topicWord: 'Treasures',
      finishWord: 'All Treasures Found! 🏆',
      welcomeMsg: 'Welcome back, Explorer! Time to find some treasure! 🌴'
    },
    decoEmojis: ['🌳','🌴','🌿','🦜','🐅','🦋','🌺','🍃']
  },

  space: {
    id: 'space',
    name: 'Space Mission',
    icon: '🚀',
    mascot: '👨‍🚀',
    mascotName: 'Captain Vega',
    bgGradient: 'linear-gradient(180deg,#0B1A3C 0%,#1A237E 40%,#3D5AFE 80%,#7C4DFF 100%)',
    heroGradient: 'linear-gradient(135deg,#1A237E 0%,#3D5AFE 60%,#FF4081 100%)',
    pathColor: 'rgba(255,255,255,0.7)',
    glowColor: 'rgba(125,222,255,0.45)',
    accents: { yellow:'#FFD600', orange:'#FF6E40', pink:'#FF4081', purple:'#7C4DFF', blue:'#40C4FF', green:'#00E5FF' },
    labels: {
      mainTitle: 'Space Mission!',
      subtitle: 'Visit every planet 🪐',
      topicWord: 'Planets',
      finishWord: 'All Planets Visited! 🏆',
      welcomeMsg: "Welcome aboard, Captain! Let's launch the next mission! 🚀"
    },
    decoEmojis: ['⭐','🌟','✨','🪐','🌙','☄️','👽','🛸']
  },

  magic: {
    id: 'magic',
    name: 'Magic Kingdom',
    icon: '🏰',
    mascot: '🦉',
    mascotName: 'Hooty the Wise Owl',
    bgGradient: 'linear-gradient(180deg,#FFE5F1 0%,#FFD6E8 35%,#E8D5FF 70%,#C9B6FF 100%)',
    heroGradient: 'linear-gradient(135deg,#9B5DE5 0%,#F15BB5 60%,#FF6B35 100%)',
    pathColor: 'rgba(255,255,255,0.85)',
    glowColor: 'rgba(255,215,80,0.45)',
    accents: { yellow:'#FFD93D', orange:'#FF6B35', pink:'#F15BB5', purple:'#9B5DE5', blue:'#00BBF9', green:'#00F5D4' },
    labels: {
      mainTitle: 'Magic Kingdom!',
      subtitle: 'Cast every spell ✨',
      topicWord: 'Spells',
      finishWord: 'All Spells Mastered! 🏆',
      welcomeMsg: 'Welcome back, Math Hero! Ready for today\'s adventure? 🚀'
    },
    decoEmojis: ['✨','🌟','💫','🦋','🌸','🍀','🪄','💎']
  }
};

const KEY = 'vm_theme';

export function getTheme() {
  const id = localStorage.getItem(KEY);
  return THEMES[id] || null;
}

export function setTheme(id) {
  if (!THEMES[id]) return;
  localStorage.setItem(KEY, id);
  applyTheme(THEMES[id]);
}

export function applyTheme(theme) {
  if (!theme) return;
  const r = document.documentElement.style;
  const a = theme.accents;
  r.setProperty('--vm-yellow', a.yellow);
  r.setProperty('--vm-orange', a.orange);
  r.setProperty('--vm-pink', a.pink);
  r.setProperty('--vm-purple', a.purple);
  r.setProperty('--vm-blue', a.blue);
  r.setProperty('--vm-green', a.green);
  r.setProperty('--vm-bg-gradient', theme.bgGradient);
  r.setProperty('--vm-hero-gradient', theme.heroGradient);
  r.setProperty('--vm-path-color', theme.pathColor);
  r.setProperty('--vm-glow-color', theme.glowColor);
  document.body.dataset.theme = theme.id;
}

export function ensureTheme() {
  // Apply theme on every page; returns null if no theme yet
  const t = getTheme();
  if (t) applyTheme(t);
  return t;
}
