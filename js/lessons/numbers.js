const NUM_WORDS = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty'];

// Counting object: a real honeypot photo (card front). Size tier mirrors the back photo
// tiers (getBackPhotoSize) so front and back scale identically. Classes are defined in
// lesson-engine.js (parent view + Kid Mode); the pot shrinks as the count rises.
const honeypot = (n) => {
  const cls =
    n === 1 ? 'counting-obj-hero' :
    n <= 4  ? 'counting-obj-lg'   :
    n <= 6  ? 'counting-obj-md'   :
    n <= 9  ? 'counting-obj-sm'   :
    n <= 16 ? 'counting-obj-xs'   :
              'counting-obj-xxs';
  return `<img src="/assets/images/common/honeypot.png" alt="honeypot" class="${cls}">`;
};

// Decorative real photo shown on the back of each number card (1–20).
const IMAGE_MAP = {
  '1':'/assets/images/wild-animals/elephant.png', '2':'/assets/images/farm-animals/horse.png',
  '3':'/assets/images/farm-animals/dog.png',      '4':'/assets/images/farm-animals/cat.png',
  '5':'/assets/images/birds/parrot.png',          '6':'/assets/images/fruits/banana.png',
  '7':'/assets/images/fruits/apple.png',          '8':'/assets/images/fruits/strawberry.png',
  '9':'/assets/images/fruits/orange.png',         '10':'/assets/images/fruits/mango.png',
  '11':'/assets/images/vegetables/pumpkin.png',   '12':'/assets/images/vegetables/tomato.png',
  '13':'/assets/images/fruits/peach.png',         '14':'/assets/images/vegetables/onion.png',
  '15':'/assets/images/fruits/kiwi.png',          '16':'/assets/images/vegetables/cabbage.png',
  '17':'/assets/images/vegetables/broccoli.png',  '18':'/assets/images/fruits/coconut.png',
  '19':'/assets/images/vegetables/beetroot.png',  '20':'/assets/images/fruits/watermelon.png'
};

const NUM_EMOJI = {
  1:'🍎', 2:'🐝', 3:'🌸', 4:'🌟', 5:'🐸',
  6:'🍓', 7:'🦋', 8:'🦁', 9:'🌈', 10:'🍯',
  11:'🚀', 12:'🐠', 13:'🌻', 14:'🦊', 15:'🎈',
  16:'🐬', 17:'🍕', 18:'🦜', 19:'🌙', 20:'🏆'
};

// Generic number facts — deliberately NOT tied to the IMAGE_MAP photo (the photo is just
// a decorative count, never "3 horses"). Keeps the spoken/written fact honest.
const NUM_FACTS = {
  1:'1 is the first counting number!',
  2:'You have 2 eyes, 2 ears, and 2 hands!',
  3:'A triangle has 3 sides!',
  4:'A square has 4 sides!',
  5:'You have 5 fingers on one hand!',
  6:'Insects have 6 legs!',
  7:'There are 7 days in a week!',
  8:'An octopus has 8 arms!',
  9:'A cat has 9 lives!',
  10:'We have 10 fingers and 10 toes!',
  11:'A football team has 11 players!',
  12:'A dozen means 12!',
  13:'13 is a teenager number!',
  14:'Two weeks have 14 days!',
  15:'A quarter hour is 15 minutes!',
  16:'16 = 4 groups of 4!',
  17:'17 is a prime number!',
  18:'18 = 3 groups of 6!',
  19:'19 is the last teen number!',
  20:'20 = 2 groups of 10!'
};

// ── Row layout: how many items go in each (centered) row, per number ──
// Adaptive balanced rows (not fixed rows-of-5) so the grid reads like dice/domino pips.
// Each entry sums to its key. Used by BOTH the front honeypots and the back photos.
const ROW_LAYOUTS = {
  1:[1],          2:[2],          3:[2,1],        4:[2,2],        5:[2,2,1],
  6:[2,2,2],      7:[3,2,2],      8:[3,3,2],      9:[3,3,3],      10:[3,3,3,1],
  11:[3,3,3,2],   12:[3,3,3,3],   13:[4,3,3,3],   14:[4,4,3,3],   15:[4,4,4,3],
  16:[4,4,4,4],   17:[4,4,4,4,1], 18:[4,4,4,4,2], 19:[4,4,4,4,3], 20:[4,4,4,4,4]
};
function getRowLayout(n) {
  return ROW_LAYOUTS[n] || [n];
}

// ── Shared grid builder (card FRONT honeypots + card BACK photos) ──
// Lays out exactly `count` copies of `itemHtml` using getRowLayout(count) — each row centered.
// `sizeClass` is added to the grid container so engine CSS can size the items inside.
// Row/item spacing (4px) and item sizing live in lesson-engine.js (.num-grid / .num-grid-row).
function buildGrid(count, itemHtml, sizeClass = '') {
  const rows = getRowLayout(count)
    .map(r => `<div class="num-grid-row">${itemHtml.repeat(r)}</div>`)
    .join('');
  return `<div class="num-grid${sizeClass ? ' ' + sizeClass : ''}">${rows}</div>`;
}

// Card-BACK photo size tier (engine CSS sizes `.num-photo` per tier). Bigger for low counts.
function getBackPhotoSize(n) {
  if (n === 1) return 'num-photo-hero'; // single hero
  if (n <= 4)  return 'num-photo-lg';   // 2–4
  if (n <= 6)  return 'num-photo-md';   // 5–6
  if (n <= 9)  return 'num-photo-sm';   // 7–9
  if (n <= 16) return 'num-photo-xs';   // 10–16
  return 'num-photo-xxs';               // 17–20
}

// Rows of 5; for n>10 inserts a blank line after position 10 so "ten block + remainder" reads
// clearly. Used by the quiz "How many?" image and the printable worksheet (NOT the cards).
// Returns \n-joined string → .replace(/\n/g,'<br>') for innerHTML.
function makeGroupedRows(emoji, n) {
  const rows = [];
  for (let i = 0; i < n; i += 5) {
    rows.push(emoji.repeat(Math.min(5, n - i)));
    if (n > 10 && i + 5 === 10) rows.push(''); // blank separator after the 10th object
  }
  return rows.join('\n');
}

export const LESSON_CONFIG = {
  subject:   'Numbers',
  lessonKey: 'numbers',
  icon:      '🔢',

  stages: {
    seedling: { label:'🌱 Seedling', age:'Age 2–3', avatar:'🌱',
      story: (n, d) => `This is the number <strong>${n}</strong>! ${d.emoji}<br><br>Can you count with me?<br><strong>${Array.from({length:n},(_,i)=>i+1).join('… ')}!</strong><br><br>${d.fact}<br><br>Buzz loves counting! Bzzz! 🐝`,
      prompt: (n, d) => `You are Buzz the Bee, a warm cheerful tutor for a 2-3 year old in the LearnHives app. The lesson is the number ${n} (${d.word}). Use VERY simple words, very short sentences, lots of emojis, say "bzzz" sometimes. Counting games only. Celebrate everything. Under 50 words. Never anything scary.`
    },
    sprout: { label:'🌿 Sprout', age:'Age 3–4', avatar:'🌿',
      story: (n, d) => `The number <strong>${n}</strong> is called <em>${d.word}</em>! 🔢<br><br>Count ${d.emoji} with me:<br>${Array.from({length:n},(_,i)=>i+1).join(' · ')}<br><br>${d.fact}<br><br>Can you count ${n} things in the room? 🐝`,
      prompt: (n, d) => `You are Buzz the Bee, an enthusiastic tutor for a 3-4 year old in LearnHives. Lesson: the number ${n} (${d.word}). Use simple language, counting games, emojis. Under 70 words. Encouraging.`
    },
    blossom: { label:'🌸 Blossom', age:'Age 4–5', avatar:'🌸',
      story: (n, d) => `Let's explore the number <strong>${n}</strong>!<br><br>We write it: <strong style="color:var(--amber)">${n}</strong><br>We say it: <em>${d.word}</em><br><br>${d.fact}<br><br>Can you think of something you see ${n} of? ✏️`,
      prompt: (n, d) => `You are Buzz the Bee, a fun knowledgeable tutor for a 4-5 year old in LearnHives. Lesson: the number ${n} (${d.word}). Light number sense, counting, simple addition. Ask follow-up questions. Under 90 words.`
    },
    bloom: { label:'🌻 Bloom', age:'Age 5–6', avatar:'🌻',
      story: (n, d) => `The number <strong>${n}</strong> — <em>${d.word}</em>!<br><br>${d.fact}<br><br>${n < 20 ? `Did you know? ${n} + 1 = <strong>${n+1}</strong>! 🌟` : `20 is a big milestone — 2 groups of 10! 🏆`}<br><br>Challenge: how many ways can you make <strong>${n}</strong>? 📚`,
      prompt: (n, d) => `You are Buzz the Bee, a smart encouraging tutor for a 5-6 year old in LearnHives. Lesson: the number ${n} (${d.word}). Number bonds, simple addition to ${n}, counting on. Challenge with equations. Under 110 words.`
    }
  },

  // ── NUMBER DATA (1–20) ──
  numbers: Object.fromEntries(
    Array.from({length:20}, (_, i) => {
      const n = i + 1;
      return [String(n), { word:NUM_WORDS[n], emoji:NUM_EMOJI[n], fact:NUM_FACTS[n] }];
    })
  ),

  // ── Subject-specific UI string overrides ──
  uiStrings: {
    en: {
      pickItem:  '🔢 Pick a number to learn',
      nextItem:  'Next Number →',
      printPack: '🖨️ Print Numbers Pack',
    }
  },

  // ── Engine interface ──

  // One card per number: combined numeral + word + honey-pot count
  getCards(key) {
    return [{ type:'combo' }];
  },

  renderCard(card, key, stageKey) {
    const n = parseInt(key);
    const d = this.numbers[key];

    // ── Card FRONT ── big numeral + the EXACT count of honeypots in centered rows of 5.
    // Double-digit numerals get a smaller class so the tall glyph doesn't clip off the top.
    // The number word ("Twenty") is rendered by the engine (cardWord) below this, always visible.
    const numClass = 'num-big' + (n >= 10 ? ' num-big-2d' : '');
    const emojiHtml =
      `<div class="num-combo">` +
        `<span class="${numClass}">${n}</span>` +
        buildGrid(n, honeypot(n)) +
      `</div>`;

    // ── Card BACK ── children's-book page (white bg). Layout (positioned via engine CSS):
    //   numeral top-left · word top-right · photo grid center (fills) · fact below · speaker bottom-left.
    // Exactly N photos, ALL the same size (one tier per card). A single per-card cap (from the
    // widest row) reins the tier size in on narrow cards so the widest row never overflows.
    const photo = IMAGE_MAP[key];
    let photoGrid = '';
    if (photo) {
      const maxCols = Math.max(...getRowLayout(n));
      const cap = n > 1 ? ` style="max-width: calc((100% - ${(maxCols - 1) * 4}px) / ${maxCols})"` : '';
      const img = `<img src="${photo}" alt="" loading="lazy" class="num-photo"${cap}>`;
      photoGrid = buildGrid(n, img, getBackPhotoSize(n));
    }
    const speakText = (d.fact || '').replace(/"/g, '&quot;');
    // Hero card (count 1) gets a reduced top margin so the lone elephant gets more room.
    const zoneClass = 'num-photo-zone' + (n === 1 ? ' num-photo-zone-hero' : '');
    const backHtml =
      `<div class="num-back">` +
        `<div class="num-back-numeral">${n}</div>` +
        `<div class="num-back-word">${d.word}</div>` +
        `<div class="${zoneClass}">${photoGrid}</div>` +
        `<div class="num-back-fact">${d.fact}</div>` +
        `<button class="card-back-speak" type="button" data-speak="${speakText}" aria-label="Listen to the fun fact">🔊</button>` +
      `</div>`;

    return { emoji: emojiHtml, label: d.word, backHtml };
  },

  buildQuiz(key, stageKey) {
    const n    = parseInt(key);
    const d    = this.numbers[key];
    const honey    = '🍯';
    const useHoney = stageKey === 'seedling' || stageKey === 'sprout';
    const objEmoji = useHoney ? honey : d.emoji;
    const shuffle  = arr => [...arr].sort(() => Math.random() - 0.5);

    // Distractor pool: nearby numbers scaled by stage difficulty
    const spread = { seedling:2, sprout:3, blossom:4, bloom:6 }[stageKey] || 3;
    const pool = new Set();
    for (let i = Math.max(1, n - spread); i <= Math.min(20, n + spread); i++) {
      if (i !== n) pool.add(i);
    }
    // Guarantee at least 3 distractors
    for (let x = 1; pool.size < 3; x++) { if (x !== n) pool.add(x); }
    const getDist = () => shuffle([...pool]).slice(0, 3);

    // Q1: see the numeral → pick the matching numeral. Text only, no counting objects.
    const dist1 = getDist();
    const q1 = {
      question: 'What number is this?',
      image: `<span class="num-quiz-big">${n}</span>`,
      options: shuffle([
        { e: String(n), l: String(n), c: true },
        ...dist1.map(x => ({ e: String(x), l: String(x), c: false }))
      ])
    };

    // Q2: see numeral → pick word
    const dist2 = getDist();
    const q2 = {
      question: `What is this number called?`,
      image: String(n),
      options: shuffle([
        { e: d.word, l: d.word, c: true },
        ...dist2.map(x => ({ e: NUM_WORDS[x], l: NUM_WORDS[x], c: false }))
      ])
    };

    // Q3: see the number word → find the matching numeral. Text only, no counting objects.
    const dist3 = getDist();
    const q3 = {
      question: `Find the number "${d.word}"!`,
      image: `<span class="num-quiz-big">${d.word}</span>`,
      options: shuffle([
        { e: String(n), l: String(n), c: true },
        ...dist3.map(x => ({ e: String(x), l: String(x), c: false }))
      ])
    };

    return [q1, q2, q3];
  },

  getQuickPrompts(key) {
    const n = parseInt(key);
    const d = this.numbers[key];
    return [
      { t:`🔢 Count to ${n}`, m:`Count from 1 to ${n} with me!` },
      { t:`💬 ${d.word}`,     m:`Tell me about the number ${n}!` },
      { t:'🌟 Fun fact',       m:`Tell me a fun fact about the number ${n}` },
      { t:'🟢 Easier',         m:'Can you explain that in an easier way?' },
      { t:'🔴 Harder',         m:'Can you make it a bit harder for me?' }
    ];
  },

  renderWorksheet(key, stageKey, isLast) {
    return _buildNumberHTML(key, parseInt(key), this.numbers[key], this.stages[stageKey], stageKey, isLast);
  },

  // Seedling & Sprout: 1–10 only. Blossom & Bloom: 1–20.
  getItems(stageKey) {
    return (stageKey === 'seedling' || stageKey === 'sprout')
      ? this.items.slice(0, 10)
      : this.items;
  },

  getItemTitle(key)            { return `The Number ${key}`; },
  getItemDisplayName(key)      { return `the number ${key}`; },
  getProgressLabel(key)        { return `Number ${key} Progress`; },
  getItemBadge(key, stageKey)  {
    const items = stageKey ? this.getItems(stageKey) : this.items;
    return `Number ${items.indexOf(key)+1} of ${items.length}`;
  },
  getWorksheetTitle(key)       { return `Number ${key} Worksheet`; },
  getItemEmoji(key)            { return NUM_EMOJI[parseInt(key)]; },
  // Story illustration = the real photo (same asset the card back uses), not an emoji.
  // Falls back to the emoji glyph if no photo is mapped.
  getStoryIllustration(key) {
    const photo = IMAGE_MAP[key];
    if (!photo) return NUM_EMOJI[parseInt(key)];
    return `<img src="${photo}" alt="${this.numbers[key].word}" loading="lazy" ` +
      `style="max-width:50%;max-height:30dvh;object-fit:contain;background:transparent;border:none;display:block;margin:0 auto;">`;
  },
  getStory(key, stageKey)      { return this.stages[stageKey].story(parseInt(key), this.numbers[key]); },
  getBuzzPrompt(key, stageKey) { return this.stages[stageKey].prompt(parseInt(key), this.numbers[key]); },

  getGreeting(key, stageKey) {
    const n = parseInt(key);
    const d = this.numbers[key];
    if (stageKey === 'seedling')
      return `Bzzz! 🐝 Hi! Let's learn the number <strong>${n}</strong>! ${d.emoji} Can you count to ${n}? Tap a chip or talk to me!`;
    return `Hi explorer! 🐝 Today we're learning the number <strong>${n}</strong> — it's called "${d.word}". Ask me anything about ${n}!`;
  },
};

// Ordered item key list (computed once after object is fully defined)
LESSON_CONFIG.items = Object.keys(LESSON_CONFIG.numbers);

// ── Worksheet renderer (numbers-specific; called via config.renderWorksheet) ──
function _buildNumberHTML(key, n, d, s, stageKey, isLast) {
  const pgBreak  = isLast ? '' : ' style="page-break-after:always"';
  const honey    = '🍯';
  const useHoney = stageKey === 'seedling' || stageKey === 'sprout';
  const objEmoji = useHoney ? honey : d.emoji;

  // Activity 1: Trace the numeral
  const guideBox = `<div class="ws-trace-box"><span class="ws-guide">${n}</span></div>`;
  const emptyBox = `<div class="ws-trace-box"></div>`;
  let act1;
  if (stageKey === 'seedling')     act1 = `<div class="ws-trace-row">${guideBox.repeat(5)}</div>`;
  else if (stageKey === 'sprout')  act1 = `<div class="ws-trace-row">${guideBox}${guideBox}${emptyBox}${emptyBox}${emptyBox}</div>`;
  else if (stageKey === 'blossom') act1 = `<div class="ws-trace-row">${guideBox}${emptyBox}${emptyBox}${emptyBox}${emptyBox}</div>`;
  else act1 = `<div class="ws-trace-row-bloom">${guideBox}<div class="ws-hw-area"><div class="ws-hw-baseline"></div><div class="ws-hw-baseline dashed"></div><div class="ws-hw-baseline"></div></div></div>`;

  // Activity 2: Count objects and circle the right number — full true count, \n → <br> for innerHTML
  const objRows = makeGroupedRows(objEmoji, n).replace(/\n/g, '<br>');
  const nearbySet = new Set([Math.max(1,n-2), Math.max(1,n-1), n, Math.min(20,n+1), Math.min(20,n+2)]);
  const nearbyNums = [...nearbySet].sort((a,b) => a-b);
  const act2 = `<div class="ws-count-objects">${objRows}</div>
    <div class="ws-section-note">Circle the number that shows how many!</div>
    <div class="ws-circle-row">${nearbyNums.map(x=>`<span class="ws-ci">${x}</span>`).join('')}</div>`;

  // Activity 3: Draw / create
  let drawContent;
  if (stageKey === 'seedling')     drawContent = `<div class="ws-draw-emoji">${objEmoji.repeat(Math.min(n,5))}</div><div class="ws-draw-label">Color ${n} objects! 🎨</div>`;
  else if (stageKey === 'sprout')  drawContent = `<div class="ws-draw-label">Draw ${n} ${objEmoji}. 🖍️</div>`;
  else if (stageKey === 'blossom') drawContent = `<div class="ws-draw-label">Draw ${n} of your favourite thing! ✏️</div>`;
  else drawContent = `<div class="ws-draw-label">Draw ${n} things, then write: ${n} + 1 = ____</div><div class="ws-write-line"></div>`;
  const act3 = `<div class="ws-draw-box">${drawContent}</div>`;

  // Activity 4: Word practice
  let act4;
  if (stageKey === 'seedling') {
    act4 = `<div class="ws-circle-answer"><div class="ws-answer-item"><span style="font-size:40px">${n}</span><div class="ws-answer-label">${d.word}</div></div></div>`;
  } else {
    const letterBoxes = d.word.split('').map(ch => `<div class="ws-trace-box"><span class="ws-guide">${ch}</span></div>`).join('');
    let extra = '';
    if (stageKey === 'blossom') extra = `<div class="ws-words-note">⭐ Can you write it without looking?</div>`;
    if (stageKey === 'bloom' && n < 20) extra = `<div class="ws-write-prompt">Write: <strong>${n} + 1 = ___</strong> <span class="ws-write-line-inline"></span></div>`;
    act4 = `<div class="ws-trace-row">${letterBoxes}</div>${extra}`;
  }

  const t2title = `Count the ${objEmoji} and circle the number`;
  const t3title = stageKey === 'seedling' ? `Color ${n} objects`
    : stageKey === 'sprout'  ? `Draw ${n} objects`
    : `Draw`;
  const t4title = stageKey === 'seedling' ? `${d.word} — say it!`
    : `Trace the word "${d.word}"`;

  return `<div class="ws-letter-section"${pgBreak}>
    <div class="ws-print-header">
      <div class="ws-print-logo">🐝</div>
      <div>
        <div class="ws-print-title">LearnHives · Number ${n} · ${s.label}</div>
        <div class="ws-print-sub">${s.age} · "${d.word}" · ${d.emoji}</div>
      </div>
    </div>
    <div class="ws-name-line">
      <div class="ws-name-field">Name: _______________</div>
      <div class="ws-name-field">Date: _______________</div>
      <div class="ws-name-field">🌟 Stars: _______________</div>
    </div>
    <div class="ws-section"><div class="ws-section-title">1. Trace the number ${n}</div>${act1}</div>
    <div class="ws-section"><div class="ws-section-title">2. ${t2title}</div>${act2}</div>
    <div class="ws-section"><div class="ws-section-title">3. ${t3title}</div>${act3}</div>
    <div class="ws-section"><div class="ws-section-title">4. ${t4title}</div>${act4}</div>
    <div class="ws-footer">🐝 LearnHives · learnhives.com · Great work! 🌟</div>
  </div>`;
}
