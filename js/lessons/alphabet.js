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
  }
};
