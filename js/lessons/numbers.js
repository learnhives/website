const NUM_WORDS = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty'];

const NUM_EMOJI = {
  1:'🍎', 2:'🐝', 3:'🌸', 4:'🌟', 5:'🐸',
  6:'🍓', 7:'🦋', 8:'🦁', 9:'🌈', 10:'🍯',
  11:'🚀', 12:'🐠', 13:'🌻', 14:'🦊', 15:'🎈',
  16:'🐬', 17:'🍕', 18:'🦜', 19:'🌙', 20:'🏆'
};

const NUM_FACTS = {
  1:'1 is the first counting number!',
  2:'You have 2 eyes, 2 ears, and 2 hands!',
  3:'A triangle has 3 sides!',
  4:'A car has 4 wheels!',
  5:'You have 5 fingers on one hand!',
  6:'Insects have 6 legs!',
  7:'There are 7 days in a week!',
  8:'An octopus has 8 arms!',
  9:'A cat has 9 lives — so they say!',
  10:'We have 10 fingers and 10 toes!',
  11:'11 looks like two 1s standing side by side!',
  12:'A dozen means 12 — like 12 eggs!',
  13:'13 is called a baker\'s dozen!',
  14:'14 days = 2 weeks = 1 fortnight!',
  15:'15 minutes is a quarter of an hour!',
  16:'16 = 4 groups of 4!',
  17:'17 is a prime number!',
  18:'18 = 10 + 8!',
  19:'19 is just one step away from 20!',
  20:'20 = 2 groups of 10!'
};

// Render n copies of emoji in rows of 5 (ten-frame style for 6–10; natural rows for larger)
function makeObjRows(emoji, n) {
  const rows = [];
  for (let i = 0; i < n; i += 5) rows.push(emoji.repeat(Math.min(5, n - i)));
  return rows.join('\n');
}

// Rows of 5; for n>10 inserts a blank line after position 10 so "ten block + remainder" reads clearly.
// Returns \n-joined string → use white-space:pre-line for textContent, .replace(/\n/g,'<br>') for innerHTML.
function makeGroupedRows(emoji, n) {
  const rows = [];
  for (let i = 0; i < n; i += 5) {
    rows.push(emoji.repeat(Math.min(5, n - i)));
    if (n > 10 && i + 5 === 10) rows.push(''); // blank separator after the 10th object
  }
  return rows.join('\n');
}

// Front label for the count card (textContent, so \n works with white-space:pre-line)
function countLabel(n, word, objEmoji, stageKey) {
  const objPart = makeGroupedRows(objEmoji, n);
  return stageKey === 'seedling' ? objPart : word + '\n' + objPart;
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

  // Two cards per number: count (visual) and word (reading)
  getCards(key) {
    return [{ type:'count' }, { type:'word' }];
  },

  renderCard(card, key, stageKey) {
    const n    = parseInt(key);
    const d    = this.numbers[key];
    const honey    = '🍯';
    const useHoney = stageKey === 'seedling' || stageKey === 'sprout';
    const objEmoji = useHoney ? honey : d.emoji;

    if (card.type === 'count') {
      // Front: big numeral + object rows (+ word for Sprout+)
      // Back: word + fact (+ +1 peek for Bloom)
      const label = countLabel(n, d.word, objEmoji, stageKey);
      let backHtml = `<strong style="color:var(--amber);font-size:28px">${d.word}</strong><br><em style="color:var(--moss)">${d.fact}</em>`;
      if (stageKey === 'bloom' && n < 20) {
        backHtml += `<br><br><strong style="color:var(--amber)">${n} + 1 = ${n+1} 🌟</strong>`;
      }
      return { emoji: String(n), label, backHtml };
    } else {
      // Word card — Front: per-number emoji + word name. Back: numeral + fact + peek
      let backHtml = `<strong style="color:var(--amber);font-size:36px">${n}</strong><br><em style="color:var(--moss)">${d.word}</em><br>${d.fact}`;
      if (stageKey === 'bloom' && n < 20) {
        backHtml += `<br><br><strong style="color:var(--amber)">${n} + 1 = ${n+1}</strong>`;
      }
      return { emoji: d.emoji, label: d.word, backHtml };
    }
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

    // Q1: count the objects → pick numeral
    const dist1 = getDist();
    const q1 = {
      question: 'How many?',
      image: objEmoji.repeat(n),
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

    // Q3: see word → find numeral
    const dist3 = getDist();
    const q3 = {
      question: `Find the number "${d.word}"!`,
      image: d.emoji,
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
