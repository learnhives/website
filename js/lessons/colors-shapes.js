// ── helpers ──
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ── shape rendering (filled) ──
function renderShape(name, size, fill) {
  const f = fill || '#888';
  const inner = ({
    circle:    `<circle cx="50" cy="50" r="42" fill="${f}"/>`,
    square:    `<rect x="8" y="8" width="84" height="84" rx="4" fill="${f}"/>`,
    triangle:  `<polygon points="50,8 92,92 8,92" fill="${f}"/>`,
    rectangle: `<rect x="5" y="20" width="90" height="60" rx="4" fill="${f}"/>`,
    star:      `<polygon points="50,6 60.6,35.4 91.8,36.4 67.1,55.6 75.9,85.6 50,68 24.1,85.6 32.9,55.6 8.2,36.4 39.4,35.4" fill="${f}"/>`,
    oval:      `<ellipse cx="50" cy="50" rx="44" ry="28" fill="${f}"/>`,
    diamond:   `<polygon points="50,8 92,50 50,92 8,50" fill="${f}"/>`,
    heart:     `<path d="M 50,75 C 15,55 5,35 5,25 Q 5,8 22,8 Q 38,8 50,28 Q 62,8 78,8 Q 95,8 95,25 C 95,35 85,55 50,75 Z" fill="${f}"/>`,
    hexagon:   `<polygon points="94,50 72,88 28,88 6,50 28,12 72,12" fill="${f}"/>`,
    pentagon:  `<polygon points="50,6 91.8,36.4 75.9,85.6 24.1,85.6 8.2,36.4" fill="${f}"/>`,
    crescent:  `<path d="M 50,8 A 42,42 0 1,0 50,92 Q 72,50 50,8 Z" fill="${f}"/>`,
  })[name] || '';
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

// ── shape rendering (dashed outline for worksheets) ──
function renderShapeOutline(name, size) {
  const a = `fill="none" stroke="#bbb" stroke-width="4" stroke-dasharray="10,6"`;
  const inner = ({
    circle:    `<circle cx="50" cy="50" r="42" ${a}/>`,
    square:    `<rect x="8" y="8" width="84" height="84" rx="4" ${a}/>`,
    triangle:  `<polygon points="50,8 92,92 8,92" ${a}/>`,
    rectangle: `<rect x="5" y="20" width="90" height="60" rx="4" ${a}/>`,
    star:      `<polygon points="50,6 60.6,35.4 91.8,36.4 67.1,55.6 75.9,85.6 50,68 24.1,85.6 32.9,55.6 8.2,36.4 39.4,35.4" ${a}/>`,
    oval:      `<ellipse cx="50" cy="50" rx="44" ry="28" ${a}/>`,
    diamond:   `<polygon points="50,8 92,50 50,92 8,50" ${a}/>`,
    heart:     `<path d="M 50,75 C 15,55 5,35 5,25 Q 5,8 22,8 Q 38,8 50,28 Q 62,8 78,8 Q 95,8 95,25 C 95,35 85,55 50,75 Z" ${a}/>`,
    hexagon:   `<polygon points="94,50 72,88 28,88 6,50 28,12 72,12" ${a}/>`,
    pentagon:  `<polygon points="50,6 91.8,36.4 75.9,85.6 24.1,85.6 8.2,36.4" ${a}/>`,
    crescent:  `<path d="M 50,8 A 42,42 0 1,0 50,92 Q 72,50 50,8 Z" ${a}/>`,
  })[name] || '';
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="display:inline-block;margin:4px" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

// ── color swatch (rounded rect) ──
function renderSwatch(hex, border, size) {
  const s = `stroke="${border || 'rgba(0,0,0,0.1)'}" stroke-width="2"`;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="92" height="92" rx="14" fill="${hex}" ${s}/></svg>`;
}

// ── COLOR DATA ──
const COLORS = {
  red:    { icon:'🍎', hex:'#E53E3E', fact:'Red is one of the three primary colors!',           example:'Apples, stop signs, fire trucks' },
  blue:   { icon:'💧', hex:'#3B82F6', fact:'Blue is one of the three primary colors!',          example:'The sky, the ocean, blueberries' },
  yellow: { icon:'🌞', hex:'#F5C518', fact:'Yellow is one of the three primary colors!',        example:'Bananas, sunflowers, the sun', border:'#A08010' },
  green:  { icon:'🌿', hex:'#22C55E', fact:'Green is made by mixing blue and yellow!',          example:'Grass, frogs, leaves' },
  orange: { icon:'🍊', hex:'#F97316', fact:'Orange is made by mixing red and yellow!',          example:'Oranges, pumpkins, tigers' },
  purple: { icon:'🍇', hex:'#A855F7', fact:'Purple is made by mixing red and blue!',            example:'Grapes, lavender, plums' },
  pink:   { icon:'🌸', hex:'#EC4899', fact:'Pink is a lighter shade of red!',                   example:'Flamingos, cherry blossoms, roses' },
  brown:  { icon:'🍫', hex:'#92400E', fact:'Brown is made by mixing all three primary colors!', example:'Chocolate, tree bark, teddy bears' },
  black:  { icon:'🖤', hex:'#111827', fact:'Black absorbs all light — that is why it looks dark!',   example:'Night sky, pandas, piano keys' },
  white:  { icon:'⬜', hex:'#F9FAFB', fact:'White reflects all light — that is why it looks bright!', example:'Clouds, snow, polar bears', border:'#CBD5E1' },
};

// ── SHAPE DATA ──
const SHAPES = {
  circle:    { icon:'⭕', fill:'#E53E3E', sides:0, corners:0, fact:'A circle is perfectly round — no sides or corners!',    example:'Wheels, clocks, coins' },
  square:    { icon:'🟦', fill:'#3B82F6', sides:4, corners:4, fact:'A square has 4 equal sides and 4 corners!',             example:'Windows, tiles, crackers' },
  triangle:  { icon:'🔺', fill:'#22C55E', sides:3, corners:3, fact:'A triangle has 3 sides and 3 corners!',                example:'Pizza slices, mountains, rooftops' },
  rectangle: { icon:'🟧', fill:'#F97316', sides:4, corners:4, fact:'A rectangle has 4 sides — 2 long and 2 short!',        example:'Doors, books, screens' },
  star:      { icon:'⭐', fill:'#F5C518', sides:5, corners:5, fact:'A star has 5 points — like 5 triangles in a ring!',    example:'Starfish, gold stars, badges' },
  oval:      { icon:'🥚', fill:'#EC4899', sides:0, corners:0, fact:'An oval is like a stretched circle — no corners!',     example:'Eggs, faces, rugby balls' },
  diamond:   { icon:'💎', fill:'#A855F7', sides:4, corners:4, fact:'A diamond is a square tilted on one corner!',          example:'Kite shapes, playing card suits' },
  heart:     { icon:'❤️', fill:'#EF4444', sides:0, corners:0, fact:'A heart has two bumps at the top and a point below!',  example:'Valentine cards, stickers' },
  hexagon:   { icon:'⬡',  fill:'#F59E0B', sides:6, corners:6, fact:'A hexagon has 6 sides — just like a honeycomb cell!',  example:'Honeycomb, nuts and bolts, tiles' },
  pentagon:  { icon:'⬠',  fill:'#10B981', sides:5, corners:5, fact:'A pentagon has 5 sides and 5 corners!',               example:'Home plate in baseball, some road signs' },
  crescent:  { icon:'🌙', fill:'#6366F1', sides:0, corners:0, fact:'A crescent looks like the moon when it is partly lit!', example:'The moon, croissants, curved horns' },
};

// ── ITEMS (type-tagged union) ──
const ITEMS = {
  ...Object.fromEntries(Object.entries(COLORS).map(([k, v]) => [k, { type: 'color', ...v }])),
  ...Object.fromEntries(Object.entries(SHAPES).map(([k, v]) => [k, { type: 'shape', ...v }])),
};

// Stage-filtered item sets — colors first, then shapes, growing with each stage
const STAGE_ITEMS = {
  seedling: ['red','blue','yellow','green',
             'circle','square','triangle'],
  sprout:   ['red','blue','yellow','green','orange','purple',
             'circle','square','triangle','rectangle','star'],
  blossom:  ['red','blue','yellow','green','orange','purple','pink','brown','black','white',
             'circle','square','triangle','rectangle','star','oval','diamond','heart'],
  bloom:    ['red','blue','yellow','green','orange','purple','pink','brown','black','white',
             'circle','square','triangle','rectangle','star','oval','diamond','heart','hexagon','pentagon','crescent'],
};

export const LESSON_CONFIG = {
  subject:   'Colors & Shapes',
  lessonKey: 'colors-shapes',
  icon:      '🎨',

  stages: {
    seedling: { label:'🌱 Seedling', age:'Age 2–3', avatar:'🌱',
      story: (key, d) => d.type === 'color'
        ? `This is the color <strong>${cap(key)}</strong>! ${d.icon}<br><br>Can you find something ${key} near you?<br><br>${d.fact}<br><br>Buzz loves colors! Bzzz! 🐝`
        : `This shape is a <strong>${cap(key)}</strong>! ${d.icon}<br><br>Can you find a ${key} shape near you?<br><br>${d.fact}<br><br>Buzz loves shapes! Bzzz! 🐝`,
      prompt: (key, d) => d.type === 'color'
        ? `You are Buzz the Bee, a warm cheerful tutor for a 2-3 year old in LearnHives. The lesson is the color ${key}. Use VERY simple words, very short sentences, lots of emojis, say "bzzz" sometimes. Name objects that are ${key}. Celebrate everything. Under 50 words. Never anything scary.`
        : `You are Buzz the Bee, a warm cheerful tutor for a 2-3 year old in LearnHives. The lesson is the shape ${key}. Use VERY simple words, very short sentences, lots of emojis, say "bzzz" sometimes. ${d.fact} Name real-world examples. Celebrate everything. Under 50 words.`,
    },
    sprout: { label:'🌿 Sprout', age:'Age 3–4', avatar:'🌿',
      story: (key, d) => d.type === 'color'
        ? `Let's learn about <strong>${cap(key)}</strong>! ${d.icon}<br><br>${d.fact}<br><br>Things that are ${key}: ${d.example}!<br><br>What is your favourite ${key} thing? 🐝`
        : `Let's learn the <strong>${cap(key)}</strong>! ${d.icon}<br><br>${d.fact}<br><br>${cap(key)}s in real life: ${d.example}!<br><br>Can you draw a ${key}? 🐝`,
      prompt: (key, d) => d.type === 'color'
        ? `You are Buzz the Bee, an enthusiastic tutor for a 3-4 year old in LearnHives. Lesson: the color ${key}. Name ${key} objects, encourage finding examples in the room. Simple language, emojis. Under 70 words.`
        : `You are Buzz the Bee, an enthusiastic tutor for a 3-4 year old in LearnHives. Lesson: the shape ${key} (${d.fact}). Encourage drawing and finding shapes in the room. Simple language, emojis. Under 70 words.`,
    },
    blossom: { label:'🌸 Blossom', age:'Age 4–5', avatar:'🌸',
      story: (key, d) => d.type === 'color'
        ? `Let's explore the color <strong>${cap(key)}</strong>!<br><br>${d.fact}<br><br>You can find ${key} in: ${d.example}.<br><br>Can you think of three more ${key} things? ✏️`
        : `Let's explore the <strong>${cap(key)}</strong> shape!<br><br>${d.fact}${d.sides > 0 ? `<br><br>Sides: <strong>${d.sides}</strong> · Corners: <strong>${d.corners}</strong>` : ''}<br><br>${cap(key)} shapes in real life: ${d.example}. ✏️`,
      prompt: (key, d) => d.type === 'color'
        ? `You are Buzz the Bee, a fun knowledgeable tutor for a 4-5 year old in LearnHives. Lesson: the color ${key}. ${d.fact} Ask the child to name examples, explore mixing colors. Under 90 words.`
        : `You are Buzz the Bee, a fun knowledgeable tutor for a 4-5 year old in LearnHives. Lesson: the shape ${key}. ${d.fact}${d.sides > 0 ? ` It has ${d.sides} sides and ${d.corners} corners.` : ''} Find and draw real-world examples. Under 90 words.`,
    },
    bloom: { label:'🌻 Bloom', age:'Age 5–6', avatar:'🌻',
      story: (key, d) => d.type === 'color'
        ? `The color <strong>${cap(key)}</strong> — ${d.fact}<br><br>Found in: ${d.example}.<br><br>Challenge: name 5 ${key} things. What happens when you mix ${key} with another color? 📚`
        : `The <strong>${cap(key)}</strong> shape — ${d.fact}${d.sides > 0 ? `<br><br><strong>${d.sides} sides</strong> and <strong>${d.corners} corners</strong>.` : ''}<br><br>Found in: ${d.example}.<br><br>Challenge: draw a ${key} and make it into a picture! 📚`,
      prompt: (key, d) => d.type === 'color'
        ? `You are Buzz the Bee, a smart encouraging tutor for a 5-6 year old in LearnHives. Lesson: the color ${key}. ${d.fact} Explore color mixing, shades, and real-world uses. Challenge with questions. Under 110 words.`
        : `You are Buzz the Bee, a smart encouraging tutor for a 5-6 year old in LearnHives. Lesson: the shape ${key}. ${d.fact}${d.sides > 0 ? ` ${d.sides} sides, ${d.corners} corners.` : ''} Explore symmetry, real-world examples, and simple geometry. Under 110 words.`,
    },
  },

  uiStrings: {
    en: {
      pickItem:  '🎨 Pick a color or shape',
      nextItem:  'Next →',
      printPack: '🖨️ Print Colors & Shapes Pack',
    }
  },

  // One visual card per item (front = color/shape, back = facts)
  getCards(key) { return [{ type: 'visual' }]; },

  renderCard(card, key, stageKey) {
    const d = ITEMS[key];
    const name = cap(key);
    if (d.type === 'color') {
      const emojiSvg = renderSwatch(d.hex, d.border, 80);
      let backHtml = `<strong style="color:var(--amber);font-size:28px">${name}</strong><br><em style="color:var(--moss)">${d.fact}</em>`;
      if (stageKey === 'blossom' || stageKey === 'bloom') {
        backHtml += `<br><br><small style="color:var(--text-mid)">${d.example}</small>`;
      }
      return { emoji: emojiSvg, label: name, backHtml };
    } else {
      const emojiSvg = renderShape(key, 80, d.fill);
      let backHtml;
      if ((stageKey === 'blossom' || stageKey === 'bloom') && d.sides > 0) {
        backHtml = `<strong style="color:var(--amber);font-size:26px">${name}</strong><br><em style="color:var(--moss)">${d.sides} sides · ${d.corners} corners</em><br>${d.fact}`;
      } else {
        backHtml = `<strong style="color:var(--amber);font-size:26px">${name}</strong><br><em style="color:var(--moss)">${d.fact}</em>`;
      }
      if (stageKey === 'blossom' || stageKey === 'bloom') {
        backHtml += `<br><br><small style="color:var(--text-mid)">${d.example}</small>`;
      }
      return { emoji: emojiSvg, label: name, backHtml };
    }
  },

  buildQuiz(key, stageKey) {
    const d = ITEMS[key];
    const name = cap(key);
    const items = this.getItems(stageKey);
    // Distractors of the same type only — never mix "red circle" combos
    const sameType = items.filter(k => ITEMS[k].type === d.type && k !== key);
    const getDist3 = () => shuffle(sameType).slice(0, 3);

    if (d.type === 'color') {
      // Q1: swatch → name
      const d1 = getDist3();
      const q1 = {
        question: 'What color is this?',
        image: renderSwatch(d.hex, d.border, 80),
        options: shuffle([
          { e: d.icon, l: name, c: true },
          ...d1.map(k => ({ e: ITEMS[k].icon, l: cap(k), c: false }))
        ])
      };
      // Q2: name → swatch
      const d2 = getDist3();
      const q2 = {
        question: `Find the ${name} color!`,
        image: d.icon,
        options: shuffle([
          { e: renderSwatch(d.hex, d.border, 36), l: name, c: true },
          ...d2.map(k => ({ e: renderSwatch(ITEMS[k].hex, ITEMS[k].border, 36), l: cap(k), c: false }))
        ])
      };
      // Q3: example → name (Sprout+) | name → swatch (Seedling)
      const d3 = getDist3();
      const exampleItem = d.example.split(',')[0].trim();
      const q3 = stageKey === 'seedling'
        ? {
            question: `Which one is ${key}?`,
            image: name,
            options: shuffle([
              { e: renderSwatch(d.hex, d.border, 36), l: name, c: true },
              ...d3.map(k => ({ e: renderSwatch(ITEMS[k].hex, ITEMS[k].border, 36), l: cap(k), c: false }))
            ])
          }
        : {
            question: `${d.icon} ${exampleItem} are...`,
            image: d.icon,
            options: shuffle([
              { e: d.icon, l: name, c: true },
              ...d3.map(k => ({ e: ITEMS[k].icon, l: cap(k), c: false }))
            ])
          };
      return [q1, q2, q3];

    } else {
      // Q1: shape → name
      const d1 = getDist3();
      const q1 = {
        question: 'What shape is this?',
        image: renderShape(key, 80, d.fill),
        options: shuffle([
          { e: renderShape(key, 30, d.fill), l: name, c: true },
          ...d1.map(k => ({ e: renderShape(k, 30, ITEMS[k].fill), l: cap(k), c: false }))
        ])
      };
      // Q2: name → shape
      const d2 = getDist3();
      const q2 = {
        question: `Find the ${name}!`,
        image: name,
        options: shuffle([
          { e: renderShape(key, 40, d.fill), l: name, c: true },
          ...d2.map(k => ({ e: renderShape(k, 40, ITEMS[k].fill), l: cap(k), c: false }))
        ])
      };
      // Q3: sides (Blossom/Bloom) | alternate-fill recognition (Seedling/Sprout — teaches shape ≠ color)
      const d3 = getDist3();
      let q3;
      if ((stageKey === 'blossom' || stageKey === 'bloom') && d.sides > 0) {
        const wrongSides = shuffle([2, 3, 4, 5, 6, 8].filter(s => s !== d.sides)).slice(0, 3);
        q3 = {
          question: `How many sides does a ${name} have?`,
          image: renderShape(key, 80, d.fill),
          options: shuffle([
            { e: '✅', l: String(d.sides), c: true },
            ...wrongSides.map(s => ({ e: '❌', l: String(s), c: false }))
          ])
        };
      } else if ((stageKey === 'blossom' || stageKey === 'bloom') && d.sides === 0) {
        q3 = {
          question: `Does a ${name} have any sides?`,
          image: renderShape(key, 80, d.fill),
          options: shuffle([
            { e: '✅', l: 'No sides!', c: true },
            { e: '❌', l: '3 sides', c: false },
            { e: '❌', l: '4 sides', c: false },
            { e: '❌', l: '2 sides', c: false },
          ])
        };
      } else {
        // Same shape, different fill — teaches shape = form, independent of color
        q3 = {
          question: 'What shape is this?',
          image: renderShape(key, 80, '#7C3AED'),
          options: shuffle([
            { e: renderShape(key, 30, d.fill), l: name, c: true },
            ...d3.map(k => ({ e: renderShape(k, 30, ITEMS[k].fill), l: cap(k), c: false }))
          ])
        };
      }
      return [q1, q2, q3];
    }
  },

  getQuickPrompts(key) {
    const d = ITEMS[key];
    const name = cap(key);
    if (d.type === 'color') {
      return [
        { t:`🎨 About ${name}`, m:`Tell me about the color ${key}!` },
        { t:`🔍 Find ${name}`,   m:`What things around me are ${key}?` },
        { t:'🎨 Mix colors',     m:`What colors can I mix with or from ${key}?` },
        { t:'🟢 Easier',         m:'Can you explain that in an easier way?' },
        { t:'🔴 Harder',         m:'Can you make it a bit harder for me?' },
      ];
    } else {
      return [
        { t:`⬡ About ${name}`,  m:`Tell me about the ${key} shape!` },
        { t:`🔍 Find ${name}s`,  m:`What real things around me are shaped like a ${key}?` },
        { t:'📐 Sides',          m:`How many sides and corners does a ${key} have?` },
        { t:'🟢 Easier',         m:'Can you explain that in an easier way?' },
        { t:'🔴 Harder',         m:'Can you make it a bit harder for me?' },
      ];
    }
  },

  renderWorksheet(key, stageKey, isLast) {
    return _buildCSHTML(key, ITEMS[key], LESSON_CONFIG.stages[stageKey], stageKey, isLast);
  },

  // Seedling has 7, Sprout 11, Blossom 18, Bloom 21
  getItems(stageKey) { return STAGE_ITEMS[stageKey]; },

  getItemTitle(key) {
    const d = ITEMS[key];
    return d.type === 'color' ? `The Color ${cap(key)}` : `The ${cap(key)} Shape`;
  },
  getItemDisplayName(key) {
    const d = ITEMS[key];
    return d.type === 'color' ? `the color ${key}` : `the ${key} shape`;
  },
  getProgressLabel(key)  { return `${cap(key)} Progress`; },
  getItemBadge(key, stageKey) {
    const items = stageKey ? this.getItems(stageKey) : this.items;
    const d = ITEMS[key];
    return `${d.type === 'color' ? 'Color' : 'Shape'} ${items.indexOf(key) + 1} of ${items.length}`;
  },
  getWorksheetTitle(key) {
    const d = ITEMS[key];
    return d.type === 'color' ? `${cap(key)} Color Worksheet` : `${cap(key)} Shape Worksheet`;
  },
  getItemEmoji(key)      { return ITEMS[key].icon; },
  getStory(key, stageKey)      { return LESSON_CONFIG.stages[stageKey].story(key, ITEMS[key]); },
  getBuzzPrompt(key, stageKey) { return LESSON_CONFIG.stages[stageKey].prompt(key, ITEMS[key]); },

  getGreeting(key, stageKey) {
    const d = ITEMS[key];
    const name = cap(key);
    if (d.type === 'color') {
      if (stageKey === 'seedling')
        return `Bzzz! 🐝 Hi! Today we're learning the color <strong>${name}</strong>! ${d.icon} Can you find something ${key} near you?`;
      return `Hi explorer! 🐝 Today we're learning about the color <strong>${name}</strong>. ${d.fact} Ask me anything!`;
    } else {
      if (stageKey === 'seedling')
        return `Bzzz! 🐝 Hi! Today we're learning about the <strong>${name}</strong> shape! ${d.icon} Can you find a ${key} shape near you?`;
      return `Hi explorer! 🐝 Today we're learning about the <strong>${name}</strong> shape. ${d.fact} Ask me anything!`;
    }
  },
};

// Full item key list (Bloom set covers everything)
LESSON_CONFIG.items = STAGE_ITEMS.bloom;

// ── Worksheet renderer ──
function _buildCSHTML(key, d, s, stageKey, isLast) {
  const pgBreak = isLast ? '' : ' style="page-break-after:always"';
  const name = cap(key);

  if (d.type === 'color') {
    // Act 1: color some outline circles in this color
    const outlineCircle = `<svg viewBox="0 0 60 60" width="52" height="52" style="margin:4px" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="26" fill="white" stroke="${d.hex}" stroke-width="3"/></svg>`;
    const act1 = `<div class="ws-color-row">${outlineCircle.repeat(3)}</div>
      <div class="ws-section-note">Use your ${key} crayon to color these circles!</div>`;

    // Act 2: circle the correct color word in a list
    const allColorKeys = ['red','blue','yellow','green','orange','purple','pink','brown','black','white'];
    const distractors = shuffle(allColorKeys.filter(c => c !== key)).slice(0, 4);
    const wordList = shuffle([key, ...distractors]);
    const act2 = `<div class="ws-circle-row">${wordList.map(c =>
      `<span class="ws-ci">${cap(c)}</span>`
    ).join('')}</div>
    <div class="ws-section-note">Circle the word "${name}"!</div>`;

    // Act 3: draw things that are this color
    const act3 = stageKey === 'seedling'
      ? `<div class="ws-draw-box"><div class="ws-draw-emoji">${d.icon}${d.icon}${d.icon}</div><div class="ws-draw-label">These are ${key}! Color them ${key}! 🖍️</div></div>`
      : `<div class="ws-draw-box"><div class="ws-draw-label">Draw 3 things that are ${key}! ✏️</div></div>`;

    // Act 4: trace the color name
    let act4;
    if (stageKey === 'seedling') {
      act4 = `<div class="ws-circle-answer"><div class="ws-answer-item"><span style="font-size:40px">${d.icon}</span><div class="ws-answer-label">${name}</div></div></div>`;
    } else {
      const boxes = key.split('').map(ch => `<div class="ws-trace-box"><span class="ws-guide">${ch}</span></div>`).join('');
      let extra = '';
      if (stageKey === 'blossom') extra = `<div class="ws-words-note">⭐ Can you write it without looking?</div>`;
      if (stageKey === 'bloom') extra = `<div class="ws-write-prompt">Finish: <strong>${key} + white =</strong> ___________</div>`;
      act4 = `<div class="ws-trace-row">${boxes}</div>${extra}`;
    }

    return `<div class="ws-letter-section"${pgBreak}>
      <div class="ws-print-header">
        <div class="ws-print-logo">🐝</div>
        <div>
          <div class="ws-print-title">LearnHives · Color: ${name} · ${s.label}</div>
          <div class="ws-print-sub">${s.age} · ${d.fact.split('!')[0]}! · ${d.icon}</div>
        </div>
      </div>
      <div class="ws-name-line">
        <div class="ws-name-field">Name: _______________</div>
        <div class="ws-name-field">Date: _______________</div>
        <div class="ws-name-field">🌟 Stars: _______________</div>
      </div>
      <div class="ws-section"><div class="ws-section-title">1. Color these circles ${key}!</div>${act1}</div>
      <div class="ws-section"><div class="ws-section-title">2. Find the word "${name}"</div>${act2}</div>
      <div class="ws-section"><div class="ws-section-title">3. ${stageKey === 'seedling' ? `Color the ${key} things` : `Draw 3 ${key} things`}</div>${act3}</div>
      <div class="ws-section"><div class="ws-section-title">4. Trace the word "${name}"</div>${act4}</div>
      <div class="ws-footer">🐝 LearnHives · learnhives.com · Great work! 🌟</div>
    </div>`;

  } else {
    // Shape worksheet
    // Act 1: trace dashed outlines
    const act1 = `<div class="ws-shape-trace-row">${[1, 2, 3].map(() => renderShapeOutline(key, 62)).join('')}</div>
      <div class="ws-section-note">Trace around each ${key} with your pencil!</div>`;

    // Act 2: count sides / corners
    const act2 = d.sides > 0
      ? `<div style="text-align:center;margin:6px 0">${renderShape(key, 60, d.fill)}</div>
         <div class="ws-section-note">This shape has <strong>___</strong> sides and <strong>___</strong> corners. (Answer: ${d.sides})</div>`
      : `<div style="text-align:center;margin:6px 0">${renderShape(key, 60, d.fill)}</div>
         <div class="ws-section-note">Does this shape have sides? <strong>___</strong> (Answer: No!)</div>`;

    // Act 3: draw something shaped like this
    const act3 = stageKey === 'seedling'
      ? `<div class="ws-draw-box"><div class="ws-draw-emoji">${d.icon}</div><div class="ws-draw-label">This is a ${key}! Color it! 🖍️</div></div>`
      : `<div class="ws-draw-box"><div class="ws-draw-label">Draw something that looks like a ${key}! ✏️</div></div>`;

    // Act 4: trace the shape name
    let act4;
    if (stageKey === 'seedling') {
      act4 = `<div class="ws-circle-answer"><div class="ws-answer-item"><span style="font-size:40px">${d.icon}</span><div class="ws-answer-label">${name}</div></div></div>`;
    } else {
      const boxes = key.split('').map(ch => `<div class="ws-trace-box"><span class="ws-guide">${ch}</span></div>`).join('');
      let extra = '';
      if (stageKey === 'blossom') extra = `<div class="ws-words-note">⭐ Can you write it without looking?</div>`;
      if (stageKey === 'bloom' && d.sides > 0) extra = `<div class="ws-write-prompt">A ${key} has <strong>___</strong> sides and <strong>___</strong> corners.</div>`;
      act4 = `<div class="ws-trace-row">${boxes}</div>${extra}`;
    }

    return `<div class="ws-letter-section"${pgBreak}>
      <div class="ws-print-header">
        <div class="ws-print-logo">🐝</div>
        <div>
          <div class="ws-print-title">LearnHives · Shape: ${name} · ${s.label}</div>
          <div class="ws-print-sub">${s.age} · ${d.fact.split('!')[0]}!</div>
        </div>
      </div>
      <div class="ws-name-line">
        <div class="ws-name-field">Name: _______________</div>
        <div class="ws-name-field">Date: _______________</div>
        <div class="ws-name-field">🌟 Stars: _______________</div>
      </div>
      <div class="ws-section"><div class="ws-section-title">1. Trace the ${key}</div>${act1}</div>
      <div class="ws-section"><div class="ws-section-title">2. ${d.sides > 0 ? 'Count the sides and corners' : 'Does it have sides?'}</div>${act2}</div>
      <div class="ws-section"><div class="ws-section-title">3. ${stageKey === 'seedling' ? `Color the ${key}` : `Draw a ${key}`}</div>${act3}</div>
      <div class="ws-section"><div class="ws-section-title">4. Trace the word "${name}"</div>${act4}</div>
      <div class="ws-footer">🐝 LearnHives · learnhives.com · Great work! 🌟</div>
    </div>`;
  }
}
