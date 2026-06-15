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

// ── Per-letter stories (Seedling: 3–4 sentences · Sprout: 4–5 sentences ending in a question).
// Each teaches something fun about the word's real-world object — not just "X is for Y". ──
const STORIES = {
  'A': { s: 'A is for Apple! 🍎 Apples grow on tall trees. They can be red, green, or yellow. Buzz loves a crunchy apple snack! 🐝',
         sp: 'A is for Apple and Ant! 🍎🐜 Apples grow on big trees in orchards. Ants are tiny but super strong — they can carry food much bigger than themselves! They live together in busy little nests. Can you find something around you that starts with A? 🐝' },
  'B': { s: 'B is for Bear! 🐻 Bears are big and furry. They love to munch on sweet honey. In winter, bears take a long, cozy nap! 🐝',
         sp: 'B is for Bear and Ball! 🐻⚽ Bears are strong animals that love honey — just like Buzz! When it gets cold, they sleep all winter long. A ball is round and bouncy and fun to roll. Can you bounce like a ball that starts with B? 🐝' },
  'C': { s: 'C is for Cat! 🐱 Cats say soft little meows. They have whiskers and fluffy tails. Cats love to nap in warm, sunny spots! 🐝',
         sp: 'C is for Cat and Car! 🐱🚗 Cats can see in the dark with their big eyes. They purr when they feel happy and cozy. A car has four wheels and zooms down the road — vroom! Can you find something that starts with C? 🐝' },
  'D': { s: 'D is for Dog! 🐕 Dogs are our best friends. They wag their tails when they are happy. Dogs love to run, play, and fetch! 🐝',
         sp: 'D is for Dog and Duck! 🐕🦆 Dogs wag their tails when they feel happy and love to play fetch. A duck says quack and loves to splash in the water. Ducks have soft feathers that keep them dry! Can you waddle like a duck that starts with D? 🐝' },
  'E': { s: 'E is for Elephant! 🐘 Elephants are the biggest land animals. They have long trunks and big floppy ears. Elephants never forget a friend! 🐝',
         sp: 'E is for Elephant and Egg! 🐘🥚 Elephants use their long trunks to drink water and pick up food. They have huge ears and never forget! An egg is smooth and round, and a baby bird can hatch right out of one. Can you stomp like an elephant that starts with E? 🐝' },
  'F': { s: 'F is for Fox! 🦊 Foxes are clever and quick. They have bushy, fluffy tails. Foxes like to play and pounce in the grass! 🐝',
         sp: 'F is for Fox and Fish! 🦊🐟 Foxes are clever animals with big fluffy tails, and they sneak quietly through the forest. A fish swims in the water and breathes with its gills — it never needs to come up for air! Can you find something that starts with F? 🐝' },
  'G': { s: 'G is for Giraffe! 🦒 Giraffes are so very tall. They reach leaves high up in the trees. Giraffes have long purple tongues! 🐝',
         sp: 'G is for Giraffe and Grapes! 🦒🍇 Giraffes are the tallest animals and reach leaves at the very top of trees. Their tongues are long and purple! Grapes are tiny, juicy fruits that grow in bunches. Can you stretch up tall like a giraffe that starts with G? 🐝' },
  'H': { s: 'H is for Horse! 🐴 Horses run very fast. They have long, swishy tails. Horses can even sleep standing up! 🐝',
         sp: 'H is for Horse and Hat! 🐴🎩 Horses gallop fast and love to run in big open fields, and they can even sleep standing up! A hat sits on top of your head and keeps you warm or shady. Can you trot like a horse that starts with H? 🐝' },
  'I': { s: 'I is for Ice Cream! 🍦 Ice cream is cold and sweet. It comes in lots of yummy flavors. Eat it quick before it melts! 🐝',
         sp: 'I is for Ice Cream and Igloo! 🍦🏠 Ice cream is a cold, sweet treat with flavors like vanilla and chocolate. An igloo is a little house made of ice blocks in snowy places. Both are icy and start with I! Can you find something that starts with I? 🐝' },
  'J': { s: 'J is for Jellyfish! 🪼 Jellyfish live deep in the sea. They are soft and squishy. Jellyfish float and wiggle in the water! 🐝',
         sp: 'J is for Jellyfish and Juice! 🪼🧃 Jellyfish drift through the ocean and have no bones or brain at all! They wiggle their squishy arms to swim along. Juice is a tasty drink made by squeezing fruit. Can you wiggle like a jellyfish that starts with J? 🐝' },
  'K': { s: 'K is for Kiwi! 🥝 Kiwis are green and fuzzy. They are sweet and juicy inside. Kiwi is full of tiny black seeds! 🐝',
         sp: 'K is for Kiwi and Kite! 🥝🪁 A kiwi is a fuzzy fruit that is bright green inside with little black seeds — and kiwi is also the name of a bird! A kite flies high in the wind on a long string. Can you fly a kite that starts with K? 🐝' },
  'L': { s: 'L is for Lion! 🦁 Lions roar very loud. They are the king of the jungle. Lions have soft, fuzzy manes! 🐝',
         sp: 'L is for Lion and Leaf! 🦁🍃 Lions are big cats with a loud roar — they are the king of the jungle! Only the boy lions grow fluffy manes. A leaf grows on trees and turns green, yellow, or red. Can you roar like a lion that starts with L? 🐝' },
  'M': { s: 'M is for Monkey! 🐵 Monkeys love to climb. They swing from tree to tree. Monkeys munch on yummy bananas! 🐝',
         sp: 'M is for Monkey and Moon! 🐵🌙 Monkeys swing through the trees using their long tails and love to eat bananas. The moon glows in the night sky and changes its shape each night. Can you climb like a monkey that starts with M? 🐝' },
  'N': { s: 'N is for Nest! 🪺 Birds build cozy nests. Nests are made of twigs and leaves. Baby birds rest safe inside! 🐝',
         sp: 'N is for Nest and Nose! 🪺👃 Birds build nests out of twigs, grass, and leaves to keep their eggs safe and warm. Your nose helps you smell yummy things and breathe in fresh air. Can you wiggle your nose that starts with N? 🐝' },
  'O': { s: 'O is for Orange! 🍊 Oranges are round and juicy. They are sweet and a little tangy. Oranges help keep us healthy! 🐝',
         sp: 'O is for Orange and Owl! 🍊🦉 An orange is a round, juicy fruit full of Vitamin C to keep you strong. An owl is a bird that stays awake at night and says hoo-hoo! Can you find something round that starts with O? 🐝' },
  'P': { s: 'P is for Parrot! 🦜 Parrots are bright and colorful. They can flap and fly. Parrots can even learn to talk! 🐝',
         sp: 'P is for Parrot and Pen! 🦜🖊️ Parrots have rainbow feathers and can copy the words you say! A pen is used to write and draw on paper. Can you say a word like a talking parrot that starts with P? 🐝' },
  'Q': { s: 'Q is for Queen Bee! 👑 The queen bee is the boss. She lives in a busy hive. All the bees take care of her! 🐝',
         sp: 'Q is for Queen Bee and Quilt! 👑🐝 The queen bee is the most important bee in the whole hive — every hive has just one! A quilt is a warm, cozy blanket made of many pretty patches. Can you buzz like a queen bee that starts with Q? 🐝' },
  'R': { s: 'R is for Rabbit! 🐰 Rabbits hop very fast. They have long, soft ears. Rabbits love to nibble carrots! 🐝',
         sp: 'R is for Rabbit and Rain! 🐰🌧️ Rabbits have long ears and strong back legs that help them hop super fast, and they love crunchy carrots! Rain falls from the clouds and helps the plants grow. Can you hop like a rabbit that starts with R? 🐝' },
  'S': { s: 'S is for Strawberry! 🍓 Strawberries are red and sweet. They have tiny seeds outside. Yum, strawberries are juicy! 🐝',
         sp: 'S is for Strawberry and Sun! 🍓☀️ A strawberry is a sweet red fruit with tiny seeds on the outside instead of the inside. The sun shines bright in the sky and keeps us warm all day. Can you find something sunny that starts with S? 🐝' },
  'T': { s: 'T is for Tiger! 🐯 Tigers have orange stripes. They are big, strong cats. Every tiger has its own stripes! 🐝',
         sp: 'T is for Tiger and Tree! 🐯🌳 Tigers are the biggest cats, and every tiger has special stripes — no two are the same, like a fingerprint! A tree grows tall with leaves and gives us cool shade. Can you growl like a tiger that starts with T? 🐝' },
  'U': { s: 'U is for Umbrella! ☂️ Umbrellas keep us dry. We use them in the rain. Umbrellas open up wide! 🐝',
         sp: 'U is for Umbrella and Unicorn! ☂️🦄 An umbrella keeps you dry when it rains by opening up wide over your head. A unicorn is a magical horse with a sparkly horn on its head! Can you find something that starts with U? 🐝' },
  'V': { s: 'V is for Vulture! 🦅 Vultures are big birds. They fly way up high. Vultures glide across the sky! 🐝',
         sp: 'V is for Vulture and Van! 🦅🚐 A vulture is a big bird that soars high in the sky on wide, strong wings. A van is a big vehicle with lots of room to carry people and things. Can you flap your wings like a vulture that starts with V? 🐝' },
  'W': { s: 'W is for Wolf! 🐺 Wolves howl at the moon. They live with their family. Wolves run together in a pack! 🐝',
         sp: 'W is for Wolf and Water! 🐺💧 Wolves live and hunt together in family groups called packs, and they howl at the moon — awooo! Water is what we drink to stay healthy, and fish live in it too. Can you howl like a wolf that starts with W? 🐝' },
  'X': { s: 'X is for Xylophone! 🎵 A xylophone makes music. You tap it with little sticks. Each bar makes a new sound! 🐝',
         sp: 'X is for Xylophone and X-ray! 🎵🩻 A xylophone makes pretty music when you tap its colorful bars — each one plays a different note! An X-ray is a special picture that shows the bones inside you. Can you tap out a tune that starts with X? 🐝' },
  'Y': { s: 'Y is for Yak! 🐂 Yaks are big and hairy. They live where it is cold. Yaks have long, shaggy fur! 🐝',
         sp: 'Y is for Yak and Yarn! 🐂🧶 A yak is a big, furry animal that lives high up in the cold, snowy mountains. Yarn is soft, fuzzy string we use to knit warm sweaters and hats. Can you find something soft that starts with Y? 🐝' },
  'Z': { s: 'Z is for Zebra! 🦓 Zebras have black and white stripes. They look like striped horses. No two zebras match! 🐝',
         sp: 'Z is for Zebra and Zoo! 🦓🦁 A zebra has black and white stripes, and no two zebras have the very same pattern! A zoo is a place where you can visit lots of amazing animals from around the world. Can you find a striped thing that starts with Z? 🐝' }
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

  // One card per letter (front: big letter only; back: word + big photo).
  getCards(key) {
    return [{ type:'letter' }];
  },

  renderCard(card, key, stageKey) {
    const d      = ALPHA_IMAGES[key];
    const lc     = key.toLowerCase();
    const sprout = stageKey === 'sprout';

    // ── Card FRONT ── pure letter, nothing else. No photo, no word (label is '' below).
    // Seedling shows "A"; Sprout shows "A a" (upper + lower). Default amber/cream bg (not white).
    // The big glyph fills the card; the Kid-Mode front speaker says `frontSpeak`.
    const frontLetter = sprout ? `${key} ${lc}` : key;
    const frontFont   = sprout ? 'clamp(120px,22dvh,200px)' : 'clamp(140px,25dvh,220px)';
    const emoji =
      `<span style="font-family:'Fredoka One',Fredoka,cursive; font-size:${frontFont}; color:#E8850A; font-weight:bold; display:block; text-align:center; line-height:1;">${frontLetter}</span>`;

    // ── Card BACK ── white book page: letter top-left, word top-right, BIG photo, speaker.
    // No fun-fact text — kept clean. Speaker says a simple "A for Apple".
    const backLetter = sprout ? `${key} ${lc}` : key;
    const speakText  = `${key} for ${d.word}`.replace(/"/g, '&quot;');
    const backHtml =
      `<div style="position:relative; background:#FFFFFF; width:100%; height:100%; border-radius:inherit; padding:8px; display:flex; flex-direction:column; align-items:center;">` +
        `<div style="position:absolute; top:10px; left:14px; font-family:'Fredoka One',Fredoka,cursive; font-size:clamp(28px,5dvh,42px); color:#E8850A; font-weight:bold;">${backLetter}</div>` +
        `<div style="position:absolute; top:10px; right:14px; font-family:'Fredoka One',Fredoka,cursive; font-size:clamp(28px,5dvh,42px); color:#E8850A; font-weight:bold;">${d.word}</div>` +
        `<div style="flex:1; display:flex; align-items:center; justify-content:center; margin-top:clamp(40px,6dvh,56px); width:100%;">` +
          `<img src="${d.image}" alt="${d.word}" loading="lazy" style="max-width:95%; max-height:90%; object-fit:contain; background:transparent; border:none;">` +
        `</div>` +
        `<button class="card-back-speak" type="button" data-speak="${speakText}" aria-label="Listen" style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.08); border:none; border-radius:50%; width:52px; height:52px; cursor:pointer; font-size:1.6rem;">🔊</button>` +
      `</div>`;

    return { emoji, label: '', frontSpeak: `This is the letter ${key}!`, backHtml };
  },

  buildQuiz(key, stageKey) {
    const d      = ALPHA_IMAGES[key];
    const lc     = key.toLowerCase();
    const sprout = stageKey === 'sprout';
    const nOpts  = sprout ? 4 : 3; // total options per question

    // Q1 — photo (on a clean white rounded card so it never crops) → which letter starts it?
    const q1 = {
      question: 'What letter does this start with?',
      singleCol: true,
      image:
        `<div style="background:#FFFFFF; border-radius:16px; padding:12px; display:inline-block;">` +
          `<img src="${d.image}" alt="${d.word}" style="max-width:50dvh; max-height:35dvh; object-fit:contain; background:transparent; border:none;">` +
        `</div>`,
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
        singleCol: true,
        image: bigLetter(key),
        options: shuffle([
          { e: lc, l: lc, c: true },
          ...wrongLetters(key, nOpts - 1).map(x => ({ e: x.toLowerCase(), l: x.toLowerCase(), c: false }))
        ])
      };
    } else {
      q2 = {
        question: 'What is this letter?',
        singleCol: true,
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

  // The story photo lives inside getStory's mini "card-back" box, so the separate
  // illustration slot is left empty (avoids showing the photo twice).
  getStoryIllustration() { return ''; },

  getStory(key, stageKey) {
    const d      = ALPHA_IMAGES[key];
    const lc     = key.toLowerCase();
    const sprout = stageKey === 'sprout';
    const boxLetter = sprout ? `${key} ${lc}` : key;
    const story     = sprout ? STORIES[key].sp : STORIES[key].s;

    // Mini "card back" for visual continuity: letter top-left, word top-right, photo center.
    const box =
      `<div style="background:#FFFFFF; border-radius:16px; padding:12px; margin:0 auto 16px; max-width:80%; position:relative;">` +
        `<div style="position:absolute; top:8px; left:12px; font-family:'Fredoka One',Fredoka,cursive; font-size:clamp(20px,3dvh,28px); color:#E8850A; font-weight:bold;">${boxLetter}</div>` +
        `<div style="position:absolute; top:8px; right:12px; font-family:'Fredoka One',Fredoka,cursive; font-size:clamp(20px,3dvh,28px); color:#E8850A; font-weight:bold;">${d.word}</div>` +
        `<img src="${d.image}" alt="${d.word}" style="display:block; margin:clamp(32px,4dvh,40px) auto 8px; max-width:70%; max-height:25dvh; object-fit:contain; background:transparent;">` +
      `</div>`;
    const text =
      `<div style="font-family:Nunito,sans-serif; font-size:clamp(15px,2.4dvh,20px); line-height:1.5; color:#3B2A00; max-width:90%; margin:0 auto;">${story}</div>`;

    return box + text;
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
