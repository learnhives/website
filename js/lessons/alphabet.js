export const LESSON_CONFIG = {
  subject:   'Alphabet',
  lessonKey: 'alphabet',
  icon:      '🔤',

  // Per-stage generators: build story text + Buzz system prompt
  stages: {
    seedling: { label:'🌱 Seedling', age:'Age 2–3', avatar:'🌱',
      story: (L,d) => `This is the letter <strong>${L}</strong>! ${d.emoji}<br><br>${L} says <em>"${d.sound}"</em>!<br><br>Like in <strong>${d.words[0].w}</strong> ${d.words[0].e}!<br><br>Can you say <strong>${L}</strong>? Buzz can! Bzzz! 🐝`,
      prompt: (L,d) => `You are Buzz the Bee, a warm cheerful tutor for a 2-3 year old in the LearnHives app. The lesson is the letter ${L}, which sounds like "${d.sound}". Use VERY simple words, very short sentences, lots of emojis, say "bzzz" sometimes. Celebrate everything. Under 50 words. Never anything scary.`
    },
    sprout: { label:'🌿 Sprout', age:'Age 3–4', avatar:'🌿',
      story: (L,d) => `The letter <strong>${L}</strong> makes the <em>"${d.sound}"</em> sound! 🔊<br><br>Words that start with ${L}:<br>${d.words.slice(0,3).map(x=>`${x.e} <strong>${x.w}</strong>`).join(' · ')}<br><br>${d.fact}<br><br>Can you find the ${L} sound around your house? 🐝`,
      prompt: (L,d) => `You are Buzz the Bee, an enthusiastic tutor for a 3-4 year old in LearnHives. Lesson: letter ${L} ("${d.sound}" sound). Use simple language, fun ${L}-words, emojis. Under 70 words. Encouraging.`
    },
    blossom: { label:'🌸 Blossom', age:'Age 4–5', avatar:'🌸',
      story: (L,d) => `Let's explore the letter <strong>${L}</strong>! ${d.isVowel?'It is a special <em>vowel</em>! 🌟':''}<br><br>It makes the <em>"${d.sound}"</em> sound.<br><br>${L}-words: ${d.words.map(x=>`${x.e} ${x.w}`).join(', ')}<br><br>${d.fact}<br><br>Can you think of one more word that starts with <strong>${L}</strong>? ✏️`,
      prompt: (L,d) => `You are Buzz the Bee, a fun knowledgeable tutor for a 4-5 year old in LearnHives. Lesson: letter ${L} ("${d.sound}"${d.isVowel?', a vowel':''}). Use light phonics, clear ${L}-word examples, ask follow-ups. Under 90 words.`
    },
    bloom: { label:'🌻 Bloom', age:'Age 5–6', avatar:'🌻',
      story: (L,d) => `The letter <strong>${L}</strong> ${d.isVowel?'is a <em>vowel</em> — one of the 5 most important letters! 🏆':'is a consonant.'}<br><br>Sound: <em>"${d.sound}"</em><br>Words: ${d.words.map(x=>`${x.e} <strong>${x.w}</strong>`).join(', ')}<br><br>${d.fact}<br><br>Challenge: write a short sentence using a word that starts with <strong>${L}</strong>! 📚`,
      prompt: (L,d) => `You are Buzz the Bee, a smart encouraging tutor for a 5-6 year old in LearnHives. Lesson: letter ${L} ("${d.sound}"${d.isVowel?', a vowel':''}). Use age-appropriate phonics, vocabulary, encourage writing sentences, ask thoughtful questions. Under 110 words.`
    }
  },

  // ── THE 26 LETTERS ── (emoji = main illustration, words = flashcards, sound, fact)
  letters: {
    A:{emoji:'🍎',sound:'Ah',isVowel:true, words:[{e:'🍎',w:'Apple'},{e:'🐜',w:'Ant'},{e:'🥑',w:'Avocado'},{e:'🐊',w:'Alligator'}],fact:'A is the very first letter of the alphabet!'},
    B:{emoji:'🐝',sound:'Buh',isVowel:false,words:[{e:'🐝',w:'Bee'},{e:'🍌',w:'Banana'},{e:'🐻',w:'Bear'},{e:'⚽',w:'Ball'}],fact:'Buzz the Bee starts with B!'},
    C:{emoji:'🐱',sound:'Kuh',isVowel:false,words:[{e:'🐱',w:'Cat'},{e:'🚗',w:'Car'},{e:'🥕',w:'Carrot'},{e:'🎂',w:'Cake'}],fact:'C can sound like K (cat) or S (city)!'},
    D:{emoji:'🐕',sound:'Duh',isVowel:false,words:[{e:'🐕',w:'Dog'},{e:'🦆',w:'Duck'},{e:'🍩',w:'Donut'},{e:'🥁',w:'Drum'}],fact:'D is for the drum that goes boom!'},
    E:{emoji:'🥚',sound:'Eh',isVowel:true, words:[{e:'🥚',w:'Egg'},{e:'🐘',w:'Elephant'},{e:'🦅',w:'Eagle'},{e:'👂',w:'Ear'}],fact:'E is the most common letter in English!'},
    F:{emoji:'🐸',sound:'Fff',isVowel:false,words:[{e:'🐸',w:'Frog'},{e:'🐟',w:'Fish'},{e:'🌸',w:'Flower'},{e:'🦊',w:'Fox'}],fact:'F makes a soft "fff" like a whisper!'},
    G:{emoji:'🍇',sound:'Guh',isVowel:false,words:[{e:'🍇',w:'Grapes'},{e:'🦒',w:'Giraffe'},{e:'🎁',w:'Gift'},{e:'🐐',w:'Goat'}],fact:'G can be hard (goat) or soft (giraffe)!'},
    H:{emoji:'🏠',sound:'Huh',isVowel:false,words:[{e:'🏠',w:'House'},{e:'🎩',w:'Hat'},{e:'🐴',w:'Horse'},{e:'🍯',w:'Honey'}],fact:'H is for Honey — Buzz loves it!'},
    I:{emoji:'🍦',sound:'Ih',isVowel:true, words:[{e:'🍦',w:'Ice cream'},{e:'🧊',w:'Ice'},{e:'🦎',w:'Iguana'},{e:'🏝️',w:'Island'}],fact:'I is a vowel — and the shortest word too!'},
    J:{emoji:'🧃',sound:'Juh',isVowel:false,words:[{e:'🧃',w:'Juice'},{e:'🐆',w:'Jaguar'},{e:'🫙',w:'Jar'},{e:'👖',w:'Jeans'}],fact:'J is for a jug of juice!'},
    K:{emoji:'🪁',sound:'Kuh',isVowel:false,words:[{e:'🪁',w:'Kite'},{e:'🔑',w:'Key'},{e:'🦘',w:'Kangaroo'},{e:'👑',w:'King'}],fact:'K and C can sound the same!'},
    L:{emoji:'🦁',sound:'Lll',isVowel:false,words:[{e:'🦁',w:'Lion'},{e:'🍋',w:'Lemon'},{e:'🍃',w:'Leaf'},{e:'💡',w:'Lamp'}],fact:'L is for the lion that roars!'},
    M:{emoji:'🌙',sound:'Mmm',isVowel:false,words:[{e:'🌙',w:'Moon'},{e:'🐵',w:'Monkey'},{e:'🍄',w:'Mushroom'},{e:'🥛',w:'Milk'}],fact:'M is the sound you make for yummy — mmm!'},
    N:{emoji:'👃',sound:'Nnn',isVowel:false,words:[{e:'👃',w:'Nose'},{e:'🥜',w:'Nut'},{e:'🪺',w:'Nest'},{e:'🔢',w:'Number'}],fact:'N is for your nose on your face!'},
    O:{emoji:'🐙',sound:'Oh',isVowel:true, words:[{e:'🐙',w:'Octopus'},{e:'🍊',w:'Orange'},{e:'🦉',w:'Owl'},{e:'🧅',w:'Onion'}],fact:'O is a vowel shaped like a circle!'},
    P:{emoji:'🐧',sound:'Puh',isVowel:false,words:[{e:'🐧',w:'Penguin'},{e:'🍕',w:'Pizza'},{e:'🐷',w:'Pig'},{e:'🍐',w:'Pear'}],fact:'P pops your lips — puh puh puh!'},
    Q:{emoji:'👑',sound:'Kwuh',isVowel:false,words:[{e:'👑',w:'Queen'},{e:'🪶',w:'Quill'},{e:'🤫',w:'Quiet'},{e:'🛌',w:'Quilt'}],fact:'Q almost always brings its friend U!'},
    R:{emoji:'🌈',sound:'Rrr',isVowel:false,words:[{e:'🌈',w:'Rainbow'},{e:'🐰',w:'Rabbit'},{e:'🚀',w:'Rocket'},{e:'🌹',w:'Rose'}],fact:'R is the sound a tiger makes — rrr!'},
    S:{emoji:'☀️',sound:'Sss',isVowel:false,words:[{e:'☀️',w:'Sun'},{e:'🐍',w:'Snake'},{e:'⭐',w:'Star'},{e:'🍓',w:'Strawberry'}],fact:'S hisses like a snake — sssss!'},
    T:{emoji:'🐯',sound:'Tuh',isVowel:false,words:[{e:'🐯',w:'Tiger'},{e:'🌳',w:'Tree'},{e:'🚂',w:'Train'},{e:'🐢',w:'Turtle'}],fact:'T is for the tall tree!'},
    U:{emoji:'☂️',sound:'Uh',isVowel:true, words:[{e:'☂️',w:'Umbrella'},{e:'🦄',w:'Unicorn'},{e:'🛸',w:'UFO'},{e:'🆙',w:'Up'}],fact:'U is a vowel shaped like a cup!'},
    V:{emoji:'🎻',sound:'Vvv',isVowel:false,words:[{e:'🎻',w:'Violin'},{e:'🌋',w:'Volcano'},{e:'🚐',w:'Van'},{e:'🌿',w:'Vine'}],fact:'V makes your lips buzz — vvv!'},
    W:{emoji:'🐋',sound:'Wuh',isVowel:false,words:[{e:'🐋',w:'Whale'},{e:'🍉',w:'Watermelon'},{e:'⌚',w:'Watch'},{e:'🌊',w:'Wave'}],fact:'W is called "double-U"!'},
    X:{emoji:'🎵',sound:'Ks',isVowel:false,words:[{e:'🎵',w:'Xylophone'},{e:'🩻',w:'X-ray'},{e:'❌',w:'X mark'},{e:'📦',w:'Box (ends in x)'}],fact:'X usually sounds like "ks" at the end!'},
    Y:{emoji:'🪀',sound:'Yuh',isVowel:false,words:[{e:'🪀',w:'Yo-yo'},{e:'💛',w:'Yellow'},{e:'🧶',w:'Yarn'},{e:'🥱',w:'Yawn'}],fact:'Y can be a sound AND sometimes a vowel!'},
    Z:{emoji:'🦓',sound:'Zzz',isVowel:false,words:[{e:'🦓',w:'Zebra'},{e:'0️⃣',w:'Zero'},{e:'⚡',w:'Zigzag'},{e:'🤐',w:'Zip'}],fact:'Z is the very LAST letter — and it buzzes like Buzz!'}
  },

  // ── Subject-specific UI string overrides (merged into engine t() lookup) ──
  uiStrings: {
    en: {
      pickItem:  '🔤 Pick a letter to learn',
      nextItem:  'Next Letter →',
      printPack: '🖨️ Print A–Z Pack',
    }
  },

  // ── Engine interface ──

  getCards(key){ return this.letters[key].words; },

  renderCard(card, key, stageKey){
    return {
      emoji:   card.e,
      label:   card.w.toUpperCase(),
      backHtml:`<strong style="color:var(--amber)">${key}</strong> is for<br><em style="color:var(--moss)">${card.w}</em> ${card.e}<br>${key}–${key}–${card.w}!`
    };
  },

  buildQuiz(key, stageKey){
    const d      = this.letters[key];
    const others = this.items.filter(x=>x!==key).flatMap(x=>this.letters[x].words.map(w=>({...w,from:x})));
    const pick    = n => [...others].sort(()=>Math.random()-0.5).slice(0,n);
    const shuffle = arr => arr.sort(()=>Math.random()-0.5);

    const q1d = pick(3);
    const q1  = { question:`Which picture starts with ${key}?`, image:'🤔',
      options:shuffle([{e:d.words[0].e,l:d.words[0].w,c:true},...q1d.map(x=>({e:x.e,l:x.w,c:false}))]) };

    const q2d = pick(3);
    const q2  = { question:`Which word starts with the letter ${key}?`, image:d.emoji,
      options:shuffle([{e:d.words[1]?d.words[1].e:d.words[0].e,l:d.words[1]?d.words[1].w:d.words[0].w,c:true},...q2d.map(x=>({e:x.e,l:x.w,c:false}))]) };

    const wrongKeys = shuffle(this.items.filter(x=>x!==key)).slice(0,3);
    const q3  = { question:`Find the letter ${key}!`, image:'🔤',
      options:shuffle([{e:key,l:'Letter '+key,c:true},...wrongKeys.map(x=>({e:x,l:'Letter '+x,c:false}))]) };

    return [q1,q2,q3];
  },

  getQuickPrompts(key){
    return [
      {t:`🔊 ${key} sound`, m:`Say the ${key} sound for me!`},
      {t:`💬 ${key} word`,  m:`Give me a fun word that starts with ${key}!`},
      {t:'🌟 Fun fact',     m:`Tell me a fun fact about the letter ${key}`},
      {t:'🟢 Easier',       m:'Can you explain that in an easier way?'},
      {t:'🔴 Harder',       m:'Can you make it a bit harder for me?'}
    ];
  },

  renderWorksheet(key, stageKey, isLast){
    return _buildLetterHTML(key, this.letters[key], this.stages[stageKey], stageKey, isLast);
  },

  getItemTitle(key)          { return `The Letter ${key}`; },
  getItemDisplayName(key)    { return `the letter ${key}`; },
  getProgressLabel(key)      { return `Letter ${key} Progress`; },
  getItemBadge(key)          { return `Letter ${this.items.indexOf(key)+1} of ${this.items.length}`; },
  getWorksheetTitle(key)     { return `Letter ${key} Worksheet`; },
  getItemEmoji(key)          { return this.letters[key].emoji; },
  getStory(key, stageKey)    { return this.stages[stageKey].story(key, this.letters[key]); },
  getBuzzPrompt(key, stageKey){ return this.stages[stageKey].prompt(key, this.letters[key]); },

  getGreeting(key, stageKey){
    const d = this.letters[key];
    if(stageKey==='seedling')
      return `Bzzz! 🐝 Hi! Let's learn the letter <strong>${key}</strong>! ${d.emoji} It says "${d.sound}"! Tap a chip or talk to me!`;
    return `Hi explorer! 🐝 Today we're learning the letter <strong>${key}</strong> — it makes the "${d.sound}" sound. Ask me anything about ${key}!`;
  },
};

// Ordered item key list (computed once after object is fully defined)
LESSON_CONFIG.items = Object.keys(LESSON_CONFIG.letters);

// ── Worksheet renderer (alphabet-specific; called via config.renderWorksheet) ──
function _buildLetterHTML(L, d, s, stageKey, isLast){
  const pgBreak = isLast ? '' : ' style="page-break-after:always"';
  const lc = L.toLowerCase();
  const da = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(c=>c!==L);
  const [d0,d1,d2,d3,d4,d5,d6,d7] = da;

  // Activity 1: Trace
  const guideBox = `<div class="ws-trace-box"><span class="ws-guide">${L}</span></div>`;
  const emptyBox = `<div class="ws-trace-box"></div>`;
  let act1;
  if(stageKey==='seedling')     act1=`<div class="ws-trace-row">${guideBox.repeat(5)}</div>`;
  else if(stageKey==='sprout')  act1=`<div class="ws-trace-row">${guideBox}${guideBox}${emptyBox}${emptyBox}${emptyBox}</div>`;
  else if(stageKey==='blossom') act1=`<div class="ws-trace-row">${guideBox}${emptyBox}${emptyBox}${emptyBox}${emptyBox}</div>`;
  else act1=`<div class="ws-trace-row-bloom">${guideBox}<div class="ws-hw-area"><div class="ws-hw-baseline"></div><div class="ws-hw-baseline dashed"></div><div class="ws-hw-baseline"></div></div></div>`;

  // Activity 2: Circle
  let circleItems, circleClass, ciExtra;
  if(stageKey==='seedling'){      circleItems=[L,d0,L,d1,d2];                      circleClass='ws-circle-row';  ciExtra=' ws-ci-lg'; }
  else if(stageKey==='sprout'){   circleItems=[d0,L,d1,d2,L,d3,L,d4];             circleClass='ws-circle-row';  ciExtra=''; }
  else if(stageKey==='blossom'){  circleItems=[L,d0,d1,L,d2,d3,d4,L,d5,L,d6,d7]; circleClass='ws-circle-grid'; ciExtra=''; }
  else{ circleItems=[L,d0,lc,d1.toLowerCase(),L,d2.toLowerCase(),lc,d3,d4.toLowerCase(),L,d5,lc]; circleClass='ws-circle-grid'; ciExtra=''; }
  const act2=`<div class="${circleClass}">${circleItems.map(c=>`<span class="ws-ci${ciExtra}">${c}</span>`).join('')}</div>`;

  // Activity 3: Draw
  const w0=d.words[0];
  let drawContent;
  if(stageKey==='seedling')     drawContent=`<div class="ws-draw-emoji">${w0.e}</div><div class="ws-draw-label">Color the ${w0.w}! 🎨</div>`;
  else if(stageKey==='sprout')  drawContent=`<div class="ws-draw-label">Draw a ${w0.w}. 🖍️</div>`;
  else if(stageKey==='blossom') drawContent=`<div class="ws-draw-label">Draw 2 things that start with ${L}. ✏️</div>`;
  else drawContent=`<div class="ws-draw-label">Draw something starting with ${L} and write its name:</div><div class="ws-write-line"></div>`;
  const act3=`<div class="ws-draw-box">${drawContent}</div>`;

  // Activity 4: Words
  const wordList  = stageKey==='seedling' ? d.words.slice(0,3) : d.words;
  const wordItems = wordList.map(w=>`<div class="ws-answer-item">${w.e}<div class="ws-answer-label">${w.w}</div></div>`).join('');
  let act4extra='';
  if(stageKey==='blossom') act4extra=`<div class="ws-words-note">⭐ Circle your favourite!</div>`;
  if(stageKey==='bloom')   act4extra=`<div class="ws-write-prompt">Write a word that starts with <strong>${L}</strong>: <span class="ws-write-line-inline"></span></div>`;
  const act4=`<div class="ws-circle-answer">${wordItems}</div>${act4extra}`;

  const t2 = stageKey==='bloom' ? `Find the letters ${L} and ${lc}` : `Circle every letter ${L}`;
  const t3 = stageKey==='seedling' ? `Color the ${w0.w}` : stageKey==='sprout' ? `Draw a ${w0.w}` : `Draw`;
  const t4 = stageKey==='seedling' ? `${L} words — say each one!` : stageKey==='bloom' ? `${L} words — say & write!` : `${L} words`;

  return `<div class="ws-letter-section"${pgBreak}>
    <div class="ws-print-header">
      <div class="ws-print-logo">🐝</div>
      <div>
        <div class="ws-print-title">LearnHives · Letter ${L} · ${s.label}</div>
        <div class="ws-print-sub">${s.age} · sound "${d.sound}"${d.isVowel?' · vowel ⭐':''}</div>
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
