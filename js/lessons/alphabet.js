// Alphabet lesson — Seedling + Sprout only. Photo-based, single card per letter.
// FRONT: big letter glyph (A / "A a") with the real photo below.
// BACK:  letter + word header, large photo, "A is for Apple!" sentence + fun fact, speaker.
// Quizzes and the story illustration use the same real photos (no emoji/honeypots).
// Same config interface the shared engine expects via startLesson(config).

// ── Per-letter data: main word + photo, a second "also" word, and stage-specific facts ──
const ALPHA_IMAGES = {
  'A': { word: 'Apple', also: 'Ant', image: '/assets/images/fruits/apple.png', fact_s: 'Apples are yummy!', fact_sp: 'Apples can be red, green, or yellow!' },
  'B': { word: 'Bear', also: 'Ball', image: '/assets/images/wild-animals/bear.png', fact_s: 'Bears are big and strong!', fact_sp: 'Bears love to eat honey!' },
  'C': { word: 'Cat', also: 'Car', image: '/assets/images/farm-animals/cat.png', fact_s: 'Cats say meow!', fact_sp: 'Cats can see in the dark!' },
  'D': { word: 'Dog', also: 'Duck', image: '/assets/images/farm-animals/dog.png', fact_s: 'Dogs are our best friends!', fact_sp: 'Dogs wag their tails when happy!' },
  'E': { word: 'Elephant', also: 'Egg', image: '/assets/images/wild-animals/elephant.png', fact_s: 'Elephants are very big!', fact_sp: 'Elephants never forget!' },
  'F': { word: 'Fox', also: 'Fish', image: '/assets/images/wild-animals/fox.png', fact_s: 'Foxes are clever!', fact_sp: 'Foxes have fluffy tails!' },
  'G': { word: 'Giraffe', also: 'Grapes', image: '/assets/images/wild-animals/giraffe.png', fact_s: 'Giraffes are so tall!', fact_sp: 'Giraffes have long purple tongues!' },
  'H': { word: 'Horse', also: 'Hat', image: '/assets/images/farm-animals/horse.png', fact_s: 'Horses run fast!', fact_sp: 'Horses can sleep standing up!' },
  'I': { word: 'Ice Cream', also: 'Igloo', image: '/assets/images/common/ice-cream.png', fact_s: 'Ice cream is cold and sweet!', fact_sp: 'Vanilla is the most popular ice cream flavor!' },
  'J': { word: 'Jellyfish', also: 'Juice', image: '/assets/images/common/jellyfish.png', fact_s: 'Jellyfish live in the sea!', fact_sp: 'Jellyfish have no brain or bones!' },
  'K': { word: 'Kiwi', also: 'Kite', image: '/assets/images/fruits/kiwi.png', fact_s: 'Kiwis are green inside!', fact_sp: 'Kiwi is a fruit and also a bird!' },
  'L': { word: 'Lion', also: 'Leaf', image: '/assets/images/wild-animals/lion.png', fact_s: 'Lions are the king of the jungle!', fact_sp: 'Only male lions have manes!' },
  'M': { word: 'Monkey', also: 'Moon', image: '/assets/images/wild-animals/monkey.png', fact_s: 'Monkeys love bananas!', fact_sp: 'Monkeys use their tails to hang from trees!' },
  'N': { word: 'Nest', also: 'Nose', image: '/assets/images/common/nest.png', fact_s: 'Birds live in nests!', fact_sp: 'Birds build nests with twigs and leaves!' },
  'O': { word: 'Orange', also: 'Owl', image: '/assets/images/fruits/orange.png', fact_s: 'Oranges are juicy!', fact_sp: 'Oranges are full of Vitamin C!' },
  'P': { word: 'Parrot', also: 'Pen', image: '/assets/images/birds/parrot.png', fact_s: 'Parrots are colorful!', fact_sp: 'Parrots can learn to talk!' },
  'Q': { word: 'Queen Bee', also: 'Quilt', image: '/assets/images/common/queen-bee.png', fact_s: 'The queen bee is the boss!', fact_sp: 'Every beehive has one queen bee!' },
  'R': { word: 'Rabbit', also: 'Rain', image: '/assets/images/farm-animals/rabbit.png', fact_s: 'Rabbits love carrots!', fact_sp: 'Rabbits can hop very fast!' },
  'S': { word: 'Strawberry', also: 'Sun', image: '/assets/images/fruits/strawberry.png', fact_s: 'Strawberries are sweet!', fact_sp: 'Strawberries have tiny seeds on the outside!' },
  'T': { word: 'Tiger', also: 'Tree', image: '/assets/images/wild-animals/tiger.png', fact_s: 'Tigers have stripes!', fact_sp: 'Every tiger has a unique stripe pattern!' },
  'U': { word: 'Umbrella', also: 'Unicorn', image: '/assets/images/common/umbrella.png', fact_s: 'Umbrellas keep us dry!', fact_sp: 'Umbrellas were invented over 3,000 years ago!' },
  'V': { word: 'Vulture', also: 'Van', image: '/assets/images/birds/vulture.png', fact_s: 'Vultures are big birds!', fact_sp: 'Vultures can fly very high in the sky!' },
  'W': { word: 'Wolf', also: 'Water', image: '/assets/images/wild-animals/wolf.png', fact_s: 'Wolves howl at the moon!', fact_sp: 'Wolves live and hunt in packs!' },
  'X': { word: 'Xylophone', also: 'X-ray', image: '/assets/images/common/xylophone.png', fact_s: 'Xylophones make music!', fact_sp: 'Each bar on a xylophone plays a different note!' },
  'Y': { word: 'Yak', also: 'Yarn', image: '/assets/images/common/yak.png', fact_s: 'Yaks are big and hairy!', fact_sp: 'Yaks live in cold mountains!' },
  'Z': { word: 'Zebra', also: 'Zoo', image: '/assets/images/wild-animals/zebra.png', fact_s: 'Zebras have black and white stripes!', fact_sp: 'No two zebras have the same stripes!' }
};

// ── Helpers ──
const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
// `count` random letters that are NOT `key`.
const wrongLetters = (key, count) => shuffle(ALL_LETTERS.filter(l => l !== key)).slice(0, count);

// Big-letter quiz prompt (uppercase or lowercase). Mirrors the numbers lesson's .num-quiz-big.
const bigLetter = letter =>
  `<span class="num-quiz-big" style="font-family:'Fredoka One',Fredoka,cursive; font-size:clamp(60px,12dvh,100px); color:#E8850A;">${letter}</span>`;

export const LESSON_CONFIG = {
  subject:   'Alphabet',
  lessonKey: 'alphabet',
  icon:      '🔤',

  // ── Only two stages ──
  stages: {
    seedling: { label:'🌱 Seedling', age:'Age 2–3', avatar:'🌱' },
    sprout:   { label:'🌿 Sprout',   age:'Age 3–4', avatar:'🌿' }
  },

  // ── Subject-specific UI string overrides ──
  uiStrings: {
    en: {
      pickItem:  '🔤 Pick a letter to learn',
      nextItem:  'Next Letter →',
      printPack: '🖨️ Print A–Z Pack',
    }
  },

  // ── Engine interface ──

  // One combined card per letter (front: letter glyph + photo; back: details).
  getCards(key) {
    return [{ type:'letter' }];
  },

  renderCard(card, key, stageKey) {
    const d      = ALPHA_IMAGES[key];
    const lc     = key.toLowerCase();
    const sprout = stageKey === 'sprout';

    // ── Card FRONT ── big letter glyph with the real photo embedded below it.
    // Seedling shows just "A"; Sprout shows "A a" (upper + lower) to introduce both cases.
    // We deliberately use the `emoji` field (rendered as innerHTML) and NOT `image`, so the
    // letter AND the photo both appear on the front.
    const frontLetter = sprout ? `${key} ${lc}` : key;
    const frontFont   = sprout ? 'clamp(60px,12dvh,100px)' : 'clamp(80px,15dvh,120px)';
    const emoji =
      `<span style="font-family:'Fredoka One',Fredoka,cursive; font-size:${frontFont}; color:#E8850A; font-weight:bold; display:block; line-height:1;">${frontLetter}</span>` +
      `<img src="${d.image}" alt="${d.word}" loading="lazy" style="max-width:55%; max-height:30dvh; object-fit:contain; background:transparent; border:none; margin-top:8px;">`;

    // ── Card BACK ── white "children's book page": letter top-left, word top-right,
    // big photo centered, sentence + fun fact below, speaker bottom-left.
    const backLetter = sprout ? `${key} ${lc}` : key;
    const sentence   = sprout ? `${key} is for ${d.word} and ${d.also}!` : `${key} is for ${d.word}!`;
    const fact       = sprout ? d.fact_sp : d.fact_s;
    const speakText  = `${sentence} ${fact}`.replace(/"/g, '&quot;');

    const backHtml =
      `<div class="alpha-back" style="position:relative; background:#FFFFFF; width:100%; height:100%; border-radius:inherit; padding:8px; display:flex; flex-direction:column; align-items:center;">` +
        `<div style="position:absolute; top:8px; left:12px; font-family:'Fredoka One',Fredoka,cursive; font-size:clamp(28px,5dvh,42px); color:#E8850A; font-weight:bold;">${backLetter}</div>` +
        `<div style="position:absolute; top:8px; right:12px; font-family:'Fredoka One',Fredoka,cursive; font-size:clamp(28px,5dvh,42px); color:#E8850A; font-weight:bold;">${d.word}</div>` +
        `<div style="flex:1; display:flex; align-items:center; justify-content:center; margin-top:clamp(40px,6dvh,56px);">` +
          `<img src="${d.image}" alt="${d.word}" loading="lazy" style="max-width:80%; max-height:60%; object-fit:contain; background:transparent; border:none;">` +
        `</div>` +
        `<div style="text-align:center; padding:4px 8px 40px;">` +
          `<div style="font-family:Nunito,sans-serif; font-size:clamp(16px,2.5dvh,22px); font-weight:700; color:#3B2A00;">${sentence}</div>` +
          `<div style="font-family:Nunito,sans-serif; font-size:clamp(14px,2dvh,18px); font-weight:600; color:#E8850A; margin-top:4px;">${fact}</div>` +
        `</div>` +
        `<button class="card-back-speak" type="button" data-speak="${speakText}" aria-label="Listen" style="position:absolute; bottom:8px; left:8px; background:rgba(0,0,0,0.05); border:none; border-radius:50%; width:36px; height:36px; cursor:pointer; font-size:1.2rem;">🔊</button>` +
      `</div>`;

    return { emoji, label: d.word, backHtml };
  },

  buildQuiz(key, stageKey) {
    const d      = ALPHA_IMAGES[key];
    const lc     = key.toLowerCase();
    const sprout = stageKey === 'sprout';
    const nOpts  = sprout ? 4 : 3; // total options per question

    // Q1 — photo → which letter does it start with? (text-only letter options)
    const q1 = {
      question: 'What letter does this start with?',
      image: `<img src="${d.image}" alt="${d.word}" style="max-width:60%; max-height:40dvh; object-fit:contain; background:transparent;">`,
      options: shuffle([
        { e: key, l: key, c: true },
        ...wrongLetters(key, nOpts - 1).map(x => ({ e: x, l: x, c: false }))
      ])
    };

    // Q2 — Seedling: identify the uppercase letter. Sprout: match upper → lowercase.
    let q2;
    if (sprout) {
      q2 = {
        question: `Match the big and small letter! Find the small version of ${key}.`,
        image: bigLetter(key),
        options: shuffle([
          { e: lc, l: lc, c: true },
          ...wrongLetters(key, nOpts - 1).map(x => ({ e: x.toLowerCase(), l: x.toLowerCase(), c: false }))
        ])
      };
    } else {
      q2 = {
        question: 'What is this letter?',
        image: bigLetter(key),
        options: shuffle([
          { e: key, l: key, c: true },
          ...wrongLetters(key, nOpts - 1).map(x => ({ e: x, l: x, c: false }))
        ])
      };
    }

    return [q1, q2];
  },

  getQuickPrompts(key) {
    const d = ALPHA_IMAGES[key];
    return [
      { t:`✏️ Write ${key}`,  m:`How do you write the letter ${key}?` },
      { t:`💬 ${key} words`,  m:`What are some words that start with ${key}?` },
      { t:`🌟 ${d.word}`,     m:`Tell me about ${d.word}!` },
      { t:'🟢 Easier',        m:'Can you explain that in an easier way?' },
      { t:'🔴 Harder',        m:'Can you make it a bit harder for me?' }
    ];
  },

  renderWorksheet(key, stageKey, isLast) {
    return _buildLetterHTML(key, ALPHA_IMAGES[key], this.stages[stageKey], stageKey, isLast);
  },

  getItemTitle(key)       { return `The Letter ${key}`; },
  getItemDisplayName(key) { return `the letter ${key}`; },
  getProgressLabel(key)   { return `Letter ${key}`; },
  getItemBadge(key)       { return key; },
  getWorksheetTitle(key)  { return `Letter ${key} Worksheet`; },
  // Subject header icon (rendered as text). The word displays cleanly; the photo lives in
  // getStoryIllustration / the cards.
  getItemEmoji(key)       { return ALPHA_IMAGES[key].word; },

  // Story illustration = the real photo (same asset the card uses).
  getStoryIllustration(key) {
    const d = ALPHA_IMAGES[key];
    return `<img src="${d.image}" alt="${d.word}" loading="lazy" ` +
      `style="max-width:50%; max-height:30dvh; object-fit:contain; background:transparent; border:none; display:block; margin:0 auto;">`;
  },

  getStory(key, stageKey) {
    const d = ALPHA_IMAGES[key];
    const title = `The Letter ${key} — ${d.word}!`;
    if (stageKey === 'sprout') {
      return `<strong>${title}</strong><br><br>This is the letter <strong>${key}</strong>! ` +
        `${key} is for <strong>${d.word}</strong>. <strong>${d.also}</strong> also starts with ${key}!<br><br>` +
        `Can you find something around you that starts with <strong>${key}</strong>? 🐝`;
    }
    return `<strong>${title}</strong><br><br>This is the letter <strong>${key}</strong>! ` +
      `${key} is for <strong>${d.word}</strong>! 🐝`;
  },

  getBuzzPrompt(key, stageKey) {
    const d   = ALPHA_IMAGES[key];
    const age = stageKey === 'sprout' ? '3-4' : '2-3';
    return `You are Buzz the Bee, teaching a young child about the letter ${key}. ` +
      `${key} is for ${d.word} and ${d.also}. Keep your response to one short, enthusiastic sentence ` +
      `appropriate for a ${age} year old. Use simple words, a warm encouraging tone, and you can say "bzzz" sometimes.`;
  },

  getGreeting(key, stageKey) {
    const d = ALPHA_IMAGES[key];
    if (stageKey === 'seedling')
      return `Bzzz! 🐝 Hi! Let's learn the letter <strong>${key}</strong>! ${key} is for <strong>${d.word}</strong>! Tap a chip or talk to me!`;
    return `Hi explorer! 🐝 Today we're learning the letter <strong>${key}</strong> — ${key} is for <strong>${d.word}</strong> and <strong>${d.also}</strong>. Ask me anything about ${key}!`;
  },
};

// Ordered item key list (A–Z, computed once after the object is fully defined).
LESSON_CONFIG.items = Object.keys(ALPHA_IMAGES);

// ── Worksheet renderer (alphabet-specific; called via config.renderWorksheet) ──
// Seedling + Sprout only. Uses the real photo wherever the old version used an emoji.
function _buildLetterHTML(L, d, s, stageKey, isLast) {
  const pgBreak = isLast ? '' : ' style="page-break-after:always"';
  const da = ALL_LETTERS.filter(c => c !== L);
  const [d0, d1, d2, d3, d4] = shuffle(da);
  const photoImg = `<img src="${d.image}" alt="${d.word}" style="width:48px; height:48px; object-fit:contain;">`;

  // Activity 1: Trace the letter
  const guideBox = `<div class="ws-trace-box"><span class="ws-guide">${L}</span></div>`;
  const emptyBox = `<div class="ws-trace-box"></div>`;
  const act1 = stageKey === 'seedling'
    ? `<div class="ws-trace-row">${guideBox.repeat(5)}</div>`
    : `<div class="ws-trace-row">${guideBox}${guideBox}${emptyBox}${emptyBox}${emptyBox}</div>`;

  // Activity 2: Circle every letter L
  const circleItems = stageKey === 'seedling'
    ? [L, d0, L, d1, d2]
    : [d0, L, d1, d2, L, d3, L, d4];
  const ciExtra = stageKey === 'seedling' ? ' ws-ci-lg' : '';
  const act2 = `<div class="ws-circle-row">${circleItems.map(c => `<span class="ws-ci${ciExtra}">${c}</span>`).join('')}</div>`;

  // Activity 3: Color / draw the photo word
  const drawContent = stageKey === 'seedling'
    ? `<div class="ws-draw-emoji">${photoImg}</div><div class="ws-draw-label">Color the ${d.word}! 🎨</div>`
    : `<div class="ws-draw-label">Draw a ${d.word}. 🖍️</div>`;
  const act3 = `<div class="ws-draw-box">${drawContent}</div>`;

  // Activity 4: L words — the main photo word + the "also" word
  const wordItems =
    `<div class="ws-answer-item">${photoImg}<div class="ws-answer-label">${d.word}</div></div>` +
    `<div class="ws-answer-item"><span class="ws-ci" style="border:none">${L}</span><div class="ws-answer-label">${d.also}</div></div>`;
  const act4 = `<div class="ws-circle-answer">${wordItems}</div>`;

  const t2 = `Circle every letter ${L}`;
  const t3 = stageKey === 'seedling' ? `Color the ${d.word}` : `Draw a ${d.word}`;
  const t4 = stageKey === 'seedling' ? `${L} words — say each one!` : `${L} words`;

  return `<div class="ws-letter-section"${pgBreak}>
    <div class="ws-print-header">
      <div class="ws-print-logo">🐝</div>
      <div>
        <div class="ws-print-title">LearnHives · Letter ${L} · ${s.label}</div>
        <div class="ws-print-sub">${s.age} · ${L} is for ${d.word}</div>
      </div>
    </div>
    <div class="ws-name-line">
      <div class="ws-name-field">Name: _______________</div>
      <div class="ws-name-field">Date: _______________</div>
      <div class="ws-name-field">🌟 Stars: _______________</div>
    </div>
    <div class="ws-section"><div class="ws-section-title">1. Trace the letter ${L}</div>${act1}</div>
    <div class="ws-section"><div class="ws-section-title">2. ${t2}</div>${act2}</div>
    <div class="ws-section"><div class="ws-section-title">3. ${t3}</div>${act3}</div>
    <div class="ws-section"><div class="ws-section-title">4. ${t4}</div>${act4}</div>
    <div class="ws-footer">🐝 LearnHives · learnhives.com · Great work! 🌟</div>
  </div>`;
}
