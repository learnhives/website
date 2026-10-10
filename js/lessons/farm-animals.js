// Farm Animals lesson — all 4 stages. Photo-based, single card per animal.
// FRONT: big photo + animal name.
// BACK:  white page with name header, large photo, sound + fun fact, speaker.
// Seedling sees 5 animals, Sprout 8, Blossom 12, Bloom all 16 (each stage includes the previous).
// Same config interface the shared engine expects via startLesson(config).

// ── Per-animal data. `emoji` is only a safe fallback glyph; the photo is the real visual. ──
const ANIMALS = {
  'Cow':     { word:'Cow',     emoji:'🐄', image:'/assets/images/farm-animals/cow.png',     sound:'moo',        baby:'calf',     home:'barn',   food:'grass',
               fact_s:'Cows give us milk!',                  fact_m:'Cows eat grass all day',                  fact_b:"A cow's stomach has four parts",
               clue:'Which animal says "moo" and gives us milk?', avoid:['Bull'] },
  'Camel':   { word:'Camel',   emoji:'🐪', image:'/assets/images/farm-animals/camel.png',   sound:'grunt',      baby:'calf',     home:'date palms', food:'grass and leaves',
               fact_s:'Camels have a big hump!',            fact_m:'Camels store fat in humps',            fact_b:'Its hump stores fat for long walks',
               clue:'Which animal has a big hump and walks in the desert?', avoid:[] },
  'Dog':     { word:'Dog',     emoji:'🐕', image:'/assets/images/farm-animals/dog.png',     sound:'woof',       baby:'puppy',    home:'farmhouse', food:'dog food',
               fact_s:'Dogs help the farmer!',              fact_m:'Dogs help the farmer',              fact_b:'Farm dogs help herd the sheep',
               clue:'Which animal says "woof"?', avoid:[] },
  'Cat':     { word:'Cat',     emoji:'🐈', image:'/assets/images/farm-animals/cat.png',     sound:'meow',       baby:'kitten',   home:'barn',   food:'cat food',
               fact_s:'Cats purr when happy!',                   fact_m:'Cats purr when happy',                   fact_b:'Barn cats keep the grain safe',
               clue:'Which animal says "meow"?', avoid:[] },
  'Duck':    { word:'Duck',    emoji:'🦆', image:'/assets/images/farm-animals/duck.png',    sound:'quack',      baby:'duckling', home:'pond',   food:'plants and seeds',
               fact_s:'Ducks love to swim!',                fact_m:'Ducks love swimming in ponds',                fact_b:'Duck feathers are waterproof, so water rolls off',
               clue:'Which animal says "quack"?', avoid:[] },
  'Sheep':   { word:'Sheep',   emoji:'🐑', image:'/assets/images/farm-animals/sheep.png',   sound:'baa',        baby:'lamb',     home:'field',  food:'grass',
               fact_s:'Sheep have soft, fluffy wool!',      fact_m:'Sheep have fluffy wool',      fact_b:'Sheep wool makes warm jumpers',
               clue:'Which animal says "baa" and has fluffy wool?', avoid:['Goat','Llama'] },
  'Horse':   { word:'Horse',   emoji:'🐴', image:'/assets/images/farm-animals/horse.png',   sound:'neigh',      baby:'foal',     home:'stable', food:'hay and oats',
               fact_s:'Horses run fast!',                   fact_m:'Horses can run fast',                   fact_b:'A horse can sleep standing up',
               clue:'Which animal says "neigh" and gallops?', avoid:['Donkey'] },
  'Hen':     { word:'Hen',     emoji:'🐔', image:'/assets/images/farm-animals/hen.png',     sound:'cluck',      baby:'chick',    home:'henhouse', food:'seeds and corn',
               fact_s:'Hens lay eggs!',                     fact_m:'Hens lay eggs',                     fact_b:'A hen lays about one egg a day',
               clue:'Which animal says "cluck" and lays eggs?', avoid:['Rooster'] },
  'Goat':    { word:'Goat',    emoji:'🐐', image:'/assets/images/farm-animals/goat.png',    sound:'meh',        baby:'kid',      home:'barn',   food:'leaves and grass',
               fact_s:'Goats love to climb!',               fact_m:'Goats love to climb',               fact_b:'Goats are great climbers, even on rocks',
               clue:'Which animal says "meh" and loves to climb?', avoid:['Sheep'] },
  'Rabbit':  { word:'Rabbit',  emoji:'🐇', image:'/assets/images/farm-animals/rabbit.png',  sound:'thump',      baby:'kit',      home:'hutch',  food:'carrots and leaves',
               fact_s:'Rabbits hop and love carrots!',      fact_m:'Rabbits hop and love carrots',      fact_b:'Rabbits thump their feet to warn friends',
               clue:'Which animal hops and loves carrots?', avoid:[] },
  'Donkey':  { word:'Donkey',  emoji:'🐴', image:'/assets/images/farm-animals/donkey.png',  sound:'hee-haw',    baby:'foal',     home:'stable', food:'hay and grass',
               fact_s:'Donkeys have long ears!',            fact_m:'Donkeys have long ears',            fact_b:'Donkeys have big ears and carry loads',
               clue:'Which animal says "hee-haw" and has long ears?', avoid:['Horse'] },
  'Rooster': { word:'Rooster', emoji:'🐓', image:'/assets/images/farm-animals/rooster.png', sound:'cock-a-doodle-doo', baby:'chick', home:'henhouse', food:'seeds and corn',
               fact_s:'Roosters crow in the morning!',      fact_m:'Roosters crow at sunrise',      fact_b:'Roosters crow at sunrise to wake everyone',
               clue:'Which animal crows "cock-a-doodle-doo" in the morning?', avoid:['Hen'] },
  'Goose':   { word:'Goose',   emoji:'🦆', image:'/assets/images/farm-animals/goose.png',   sound:'honk',       baby:'gosling',  home:'pond',   food:'grass and plants',
               fact_s:'Geese go honk, honk!',               fact_m:'Geese honk and fly',               fact_b:'Geese fly together in a V shape',
               clue:'Which animal says "honk"?', avoid:['Duck'] },
  'Turkey':  { word:'Turkey',  emoji:'🦃', image:'/assets/images/farm-animals/turkey.png',  sound:'gobble',     baby:'poult',    home:'farmyard', food:'seeds and corn',
               fact_s:'Turkeys go gobble, gobble!',         fact_m:'Turkeys spread their tail feathers',         fact_b:'Turkeys spread their tails like a fan',
               clue:'Which animal says "gobble"?', avoid:[] },
  'Bull':    { word:'Bull',    emoji:'🐂', image:'/assets/images/farm-animals/bull.png',    sound:'snort',      baby:'calf',     home:'pasture', food:'grass',
               fact_s:'Bulls are big and strong!',          fact_m:'Bulls are big and strong',          fact_b:'A bull is a grown-up male cow',
               clue:'Which big farm animal is a grown-up male cow?', avoid:['Cow'] },
  'Llama':   { word:'Llama',   emoji:'🦙', image:'/assets/images/farm-animals/llama.png',   sound:'hum',        baby:'cria',     home:'mountain farm', food:'grass and hay',
               fact_s:'Llamas have long, fuzzy necks!',     fact_m:'Llamas hum to each other',     fact_b:'Llamas hum and can carry packs',
               clue:'Which animal hums and has a long, fuzzy neck?', avoid:['Sheep'] }
};

// Introduced in this order; each stage includes everything from the one before.
const STAGE_ITEMS = {
  seedling: ['Cow','Camel','Dog','Cat','Duck'],
  sprout:   ['Cow','Camel','Dog','Cat','Duck','Sheep','Horse','Hen'],
  blossom:  ['Cow','Camel','Dog','Cat','Duck','Sheep','Horse','Hen','Goat','Rabbit','Donkey','Rooster'],
  bloom:    ['Cow','Camel','Dog','Cat','Duck','Sheep','Horse','Hen','Goat','Rabbit','Donkey','Rooster','Goose','Turkey','Bull','Llama']
};

// ── Stories (rubric limits): Seedling ≤3 sentences · Sprout ≤4 (adds baby + home) · Blossom ≤6 · Bloom ≤8; Blossom/Bloom end with a question. ──
const lower = s => s.toLowerCase();
const article = w => (/^[aeiou]/i.test(w) ? 'an' : 'a');

const STORY = {
  seedling: d =>
    `This is ${article(d.word)} ${lower(d.word)}! ${d.emoji} ${d.fact_s} Can you say "${d.sound}" too? 🐝`,
  sprout: d =>
    `This is ${article(d.word)} ${lower(d.word)}! ${d.emoji} ${d.fact_s} A baby ${lower(d.word)} lives near the ${d.home}. Can you say "${d.sound}" like a ${lower(d.word)}? 🐝`,
  blossom: d =>
    `Meet the ${lower(d.word)}! ${d.emoji} A ${lower(d.word)} says "${d.sound}!" ${d.fact_b}. ` +
    `A baby ${lower(d.word)} is called a ${d.baby}, and it likes to eat ${d.food}. ` +
    `On the farm you can find it near the ${d.home}. Why do you think the farmer needs a ${lower(d.word)}? 🐝`
};
STORY.bloom = STORY.blossom;

// ── Helpers ──
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const stageItems = stageKey => STAGE_ITEMS[stageKey] || STAGE_ITEMS.bloom;
// `count` random animals from the stage that are not `key` and don't plausibly share its clue.
const wrongAnimals = (key, stageKey, count) => {
  const avoid = ANIMALS[key].avoid;
  let pool = stageItems(stageKey).filter(k => k !== key && !avoid.includes(k));
  if (pool.length < count) pool = Object.keys(ANIMALS).filter(k => k !== key && !avoid.includes(k));
  return shuffle(pool).slice(0, count);
};
const photoThumb = k =>
  `<img src="${ANIMALS[k].image}" alt="" style="width:clamp(70px,14dvh,120px); height:clamp(70px,14dvh,120px); object-fit:contain; background:transparent; border:none;">`;
const esc = s => s.replace(/"/g, '&quot;');

export const LESSON_CONFIG = {
  subject:   'Farm Animals',
  lessonKey: 'farm-animals',
  icon:      '🐄',

  stages: {
    seedling: { label:'🌱 Seedling', age:'Age 2–3', avatar:'🌱' },
    sprout:   { label:'🌿 Sprout',   age:'Age 3–4', avatar:'🌿' },
    blossom:  { label:'🌸 Blossom',  age:'Age 4–5', avatar:'🌸' },
    bloom:    { label:'🌻 Bloom',    age:'Age 5–6', avatar:'🌻' }
  },

  uiStrings: {
    en: {
      pickItem:  '🐄 Pick an animal to learn',
      nextItem:  'Next Animal →',
      printPack: '🖨️ Print Farm Animals Pack',
    }
  },

  // Seedling 5 · Sprout 8 · Blossom 12 · Bloom 16 animals.
  getItems(stageKey) { return stageItems(stageKey); },

  // ── Engine interface ──

  // One card per animal (front: photo + name; back: white book page with sound + fact).
  getCards(key) {
    return [{ type:'animal' }];
  },

  renderCard(card, key, stageKey) {
    const d = ANIMALS[key];
    const older = stageKey === 'blossom' || stageKey === 'bloom';
    // Seedling/Sprout backs: name and sound only. Blossom: fact ≤5 words. Bloom: fact ≤8 words.
    const fact  = stageKey === 'bloom' ? d.fact_b : stageKey === 'blossom' ? d.fact_m : '';
    const speakText = esc(`${d.word}! A ${d.word.toLowerCase()} says ${d.sound}.${fact ? ' ' + fact : ''}`);

    const backHtml =
      `<div style="position:relative; background:#FFFFFF; width:100%; height:100%; border-radius:inherit; padding:8px; display:flex; flex-direction:column; align-items:center;">` +
        `<div style="position:absolute; top:10px; left:14px; font-family:'Fredoka One',Fredoka,cursive; font-size:clamp(28px,5dvh,42px); color:#E8850A; font-weight:bold;">${d.word}</div>` +
        `<div style="position:absolute; top:10px; right:14px; font-family:'Fredoka',sans-serif; font-size:clamp(20px,3.6dvh,30px); color:#7A5C1E; font-weight:700;">“${d.sound}!”</div>` +
        `<div style="flex:1; display:flex; align-items:center; justify-content:center; margin-top:clamp(40px,6dvh,56px); width:100%; min-height:0;">` +
          `<img src="${d.image}" alt="${d.word}" loading="lazy" style="max-width:95%; max-height:90%; object-fit:contain; background:transparent; border:none;">` +
        `</div>` +
        (fact ? `<div style="font-family:Nunito,sans-serif; font-size:clamp(15px,2.4dvh,20px); font-weight:700; color:#3B2A00; text-align:center; padding:0 64px 10px;">${fact}</div>` : '') +
        `<button class="card-back-speak" type="button" data-speak="${speakText}" aria-label="Listen" style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.08); border:none; border-radius:50%; width:52px; height:52px; cursor:pointer; font-size:1.6rem;">🔊</button>` +
      `</div>`;

    return { image: d.image, label: d.word, frontSpeak: `This is ${article(d.word)} ${d.word.toLowerCase()}! ${article(d.word)} ${d.word.toLowerCase()} says ${d.sound}.`, backHtml };
  },

  buildQuiz(key, stageKey) {
    const d     = ANIMALS[key];
    const nOpts = { seedling:2, sprout:3, blossom:3, bloom:4 }[stageKey] || 3;

    // Q1 — photo → which animal is this? (text options, so the photo doesn't give it away twice)
    const q1 = {
      question: 'Which animal is this?',
      image:
        `<div style="background:#FFFFFF; border-radius:16px; padding:16px; display:inline-block;">` +
          `<img src="${d.image}" alt="${d.word}" style="max-width:60dvh; max-height:40dvh; object-fit:contain; background:transparent; border:none;">` +
        `</div>`,
      options: shuffle([
        { e:'🐾', l:d.word, c:true },
        ...wrongAnimals(key, stageKey, nOpts - 1).map(k => ({ e:'🐾', l:ANIMALS[k].word, c:false }))
      ])
    };

    // Q2 — clue (sound / trait) → pick the right animal photo.
    const q2 = {
      question: d.clue,
      image: `<span style="font-size:clamp(60px,12dvh,100px);">🔊</span>`,
      options: shuffle([
        { e:photoThumb(key), l:'', c:true },
        ...wrongAnimals(key, stageKey, nOpts - 1).map(k => ({ e:photoThumb(k), l:'', c:false }))
      ])
    };

    return [q1, q2];
  },

  getQuickPrompts(key) {
    const d = ANIMALS[key];
    return [
      { t:`🔊 ${d.word} sound`, m:`What sound does a ${d.word.toLowerCase()} make?` },
      { t:`🍽️ What it eats`,   m:`What does a ${d.word.toLowerCase()} like to eat?` },
      { t:`🌟 ${d.word}`,      m:`Tell me a fun fact about the ${d.word.toLowerCase()}!` },
      { t:'🟢 Easier',         m:'Can you explain that in an easier way?' },
      { t:'🔴 Harder',         m:'Can you make it a bit harder for me?' }
    ];
  },

  renderWorksheet(key, stageKey, isLast) {
    return _buildAnimalHTML(key, ANIMALS[key], this.stages[stageKey], stageKey, isLast);
  },

  getItemTitle(key)       { return `The ${ANIMALS[key].word}`; },
  getItemDisplayName(key) { return `the ${ANIMALS[key].word.toLowerCase()}`; },
  getProgressLabel(key)   { return ANIMALS[key].word; },
  getItemBadge(key)       { return ANIMALS[key].word; },
  getWorksheetTitle(key)  { return `${ANIMALS[key].word} Worksheet`; },
  getItemEmoji(key)       { return ANIMALS[key].word; },

  // Photo lives inside getStory's mini "card-back" box; undefined (not '') hides the empty slot.
  getStoryIllustration() { return undefined; },

  getStory(key, stageKey) {
    const d = ANIMALS[key];
    const story = (STORY[stageKey] || STORY.bloom)(d);

    const box =
      `<div style="background:#FFFFFF; border-radius:16px; padding:12px; margin:0 auto 16px; max-width:min(80%, 500px); position:relative;">` +
        `<div style="position:absolute; top:8px; left:12px; font-family:'Fredoka One',Fredoka,cursive; font-size:clamp(20px,3dvh,28px); color:#E8850A; font-weight:bold;">${d.word}</div>` +
        `<img src="${d.image}" alt="${d.word}" style="display:block; margin:clamp(32px,4dvh,40px) auto 8px; max-width:70%; max-height:25dvh; object-fit:contain; background:transparent;">` +
      `</div>`;
    const text =
      `<div style="max-width:500px; margin:0 auto; text-align:center;">` +
        `<div style="font-family:Nunito,sans-serif; font-size:clamp(15px,2.4dvh,20px); line-height:1.5; color:#3B2A00;">${story}</div>` +
      `</div>`;

    return box + text;
  },

  getBuzzPrompt(key, stageKey) {
    const d   = ANIMALS[key];
    const age = { seedling:'2-3', sprout:'3-4', blossom:'4-5', bloom:'5-6' }[stageKey] || '3-4';
    return `You are Buzz the Bee, teaching a young child about the farm animal "${d.word}". ` +
      `A ${d.word.toLowerCase()} says "${d.sound}" and lives near the ${d.home}. Keep your response to one short, enthusiastic sentence ` +
      `appropriate for a ${age} year old. Use simple words, a warm encouraging tone, and you can say "bzzz" sometimes. ` +
      `Never correct the child harshly. Never ask for the child's name, school, location or any personal detail.`;
  },

  getGreeting(key, stageKey) {
    const d = ANIMALS[key];
    if (stageKey === 'seedling')
      return `Let's meet the <strong>${d.word}</strong> and say "${d.sound}"! 🐝 You can do it!`;
    return `Let's visit the <strong>${d.word}</strong> on the farm! 🐝 Ask me anything, you're doing great!`;
  },
};

// Ordered item key list (all 16; getItems narrows it per stage).
LESSON_CONFIG.items = STAGE_ITEMS.bloom;

// ── Worksheet renderer (called via config.renderWorksheet) ──
function _buildAnimalHTML(key, d, s, stageKey, isLast) {
  const pgBreak = isLast ? '' : ' style="page-break-after:always"';
  const older   = stageKey === 'blossom' || stageKey === 'bloom';
  const img = (k, px) => `<img src="${ANIMALS[k].image}" alt="${ANIMALS[k].word}" style="width:${px}px; height:${px}px; object-fit:contain;">`;
  const others = wrongAnimals(key, stageKey, 4);

  // Activity 1: Colour the animal
  const act1 = `<div class="ws-draw-box"><div class="ws-draw-emoji">${img(key, 64)}</div><div class="ws-draw-label">Colour the ${d.word.toLowerCase()}! 🎨</div></div>`;

  // Activity 2: Circle every <animal> in a row of photos
  const row = shuffle(older ? [key, others[0], key, others[1], others[2], key] : [key, others[0], key, others[1]]);
  const act2 = `<div class="ws-circle-row">${row.map(k => `<span class="ws-ci">${img(k, 48)}</span>`).join('')}</div>`;

  // Activity 3: What does it say? (circle the sound)
  const sounds = shuffle([d.sound, ...others.slice(0, 2).map(k => ANIMALS[k].sound).filter(x => x !== d.sound)]);
  const act3 = `<div class="ws-circle-row">${sounds.map(x => `<span class="ws-ci" style="font-size:20px;">${x}</span>`).join('')}</div>`;

  // Activity 4: Draw its home (older stages) / say it (younger)
  const act4 = older
    ? `<div class="ws-draw-box"><div class="ws-draw-label">Draw where the ${d.word.toLowerCase()} lives: the ${d.home}. 🖍️</div></div>`
    : `<div class="ws-draw-box"><div class="ws-draw-label">Say it loud: "${d.sound}!" 🗣️</div></div>`;

  const t4 = older ? `Draw its home` : `Say the sound`;

  return `<div class="ws-letter-section"${pgBreak}>
    <div class="ws-print-header">
      <div class="ws-print-logo">🐝</div>
      <div>
        <div class="ws-print-title">LearnHives · ${d.word} · ${s.label}</div>
        <div class="ws-print-sub">${s.age} · Farm Animals</div>
      </div>
    </div>
    <div class="ws-name-line">
      <div class="ws-name-field">Name: _______________</div>
      <div class="ws-name-field">Date: _______________</div>
      <div class="ws-name-field">🌟 Stars: _______________</div>
    </div>
    <div class="ws-section"><div class="ws-section-title">1. Colour the ${d.word.toLowerCase()}</div>${act1}</div>
    <div class="ws-section"><div class="ws-section-title">2. Circle every ${d.word.toLowerCase()}</div>${act2}</div>
    <div class="ws-section"><div class="ws-section-title">3. Circle the sound a ${d.word.toLowerCase()} makes</div>${act3}</div>
    <div class="ws-section"><div class="ws-section-title">4. ${t4}</div>${act4}</div>
    <div class="ws-footer">🐝 LearnHives · learnhives.com · Great work! 🌟</div>
  </div>`;
}
