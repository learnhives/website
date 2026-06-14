// js/lesson-engine.js — subject-agnostic lesson engine
// Usage: import { startLesson } from '../js/lesson-engine.js'; startLesson(config);

export function startLesson(config) {

  // ── SETTINGS (stage · lang · theme) ──
  // TODO: replace URL fallbacks with child's Supabase profile:
  //   const {data:p} = await db.from('children').select('stage,lang,theme').eq('id',childId).single()
  //   currentStage=p?.stage??_STAGES[0]; currentLang=p?.lang??'en'; currentTheme=p?.theme??'honey'
  const _params  = new URLSearchParams(location.search);
  const _STAGES  = Object.keys(config.stages);
  const _LANGS   = ['en'];
  const _THEMES  = ['honey','ocean'];
  let currentStage = _STAGES.includes(_params.get('stage')) ? _params.get('stage') : _STAGES[0];
  let currentLang  = _LANGS.includes(_params.get('lang'))   ? _params.get('lang')  : 'en';
  let currentTheme = _THEMES.includes(_params.get('theme')) ? _params.get('theme') : 'honey';

  // ── i18n ──
  // Subject-specific overrides live in config.uiStrings; these are generic fallbacks.
  const UI_STRINGS = {
    en: {
      backBtn:'← Dashboard',
      tabCards:'🃏 Cards', tabQuiz:'🎯 Quiz', tabStory:'📖 Story',
      printPack:'🖨️ Print Pack',
      ageStageLabel:'Age Stage',
      pickItem:'Pick one to learn',
      cardHint:'Tap to flip!',
      prevCard:'← Prev', nextCard:'Next →',
      nextQuestion:'Next Question →',
      listenBtn:'🔊 Listen', listenSpeaking:'🔊 Speaking...', finishStory:'I read it! ✅',
      wsPageTrace:'📝 Trace', wsPageDraw:'🎨 Draw', wsPageCircle:'🔵 Circle', wsPageMatch:'🔗 Match',
      printWorksheet:'🖨️ Print Worksheet',
      buzzName:'Buzz the Bee', buzzReady:'Ready to help!',
      chatPlaceholder:'Ask Buzz anything…',
      modalTitle:'Amazing Work!', modalXP:'+50 Honey Points! 🍯',
      stayHere:'Stay Here', nextItem:'Next →',
      quizComplete:'🎉 Quiz complete! Great job!',
      feedbackCorrect:"Yes! That's right!",
      feedbackTryAgain:'Try again!',
      feedbackReveal:label=>`The answer is ${label}!`,
      buzzTired:'Bzzz! 🐝 My wings are a little tired — try again in a moment!',
      noVoice:"🐝 Your browser doesn't support voice yet — try Chrome or Safari!",
    }
  };
  function t(key,...args){
    const str = config.uiStrings?.[currentLang]?.[key]
      ?? config.uiStrings?.en?.[key]
      ?? UI_STRINGS[currentLang]?.[key]
      ?? UI_STRINGS.en[key];
    return typeof str==='function'?str(...args):(str??key);
  }

  // ── STAGE-AWARE ITEMS ──
  // If config defines getItems(stage), use it (e.g. numbers shows 1–10 in seedling/sprout).
  // Falls back to config.items so alphabet (no getItems) is unaffected.
  const getStageItems = (stage) => config.getItems?.(stage) ?? config.items;

  // ── STATE ──
  let currentKey   = getStageItems(currentStage)[0];
  let currentCard  = 0, currentQuestion = 0, answered = false, wrongAttempts = 0;
  let isTyping = false, isListening = false, recognition = null, quizSet = [];
  let chatHistory  = [];
  let seenCards = new Set(), answeredQuestions = new Set(), storyDone = false, completionShown = false;

  // ── KID MODE STATE ──
  const KID = { active: false, step: 'cards', lastMoved: null, holdTimer: null, buzzLineIdx: 0, wobbleTimer: null, wiggleTimer: null, isThinking: false };

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.theme = currentTheme;
    document.body.dataset.lesson = config.lessonKey; // lets CSS target per-lesson chrome (e.g. numbers card back)
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.getElementById('chatInput').placeholder = t('chatPlaceholder');
    if (_params.get('preview') === '1') {
      document.body.classList.add('preview-mode');
      document.querySelectorAll('.stage-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.stage === currentStage));
    }
    buildItemStrip();
    loadItem(getStageItems(currentStage)[0]);
    window.onbeforeprint = buildWorksheet;
    injectKidModeDom();
  });

  // ── ITEM STRIP ──
  function buildItemStrip() {
    const strip = document.getElementById('itemStrip');
    strip.innerHTML = '';
    getStageItems(currentStage).forEach(key => {
      const b = document.createElement('button');
      b.className = 'item-key' + (key === currentKey ? ' active' : '');
      b.id = 'key-' + key;
      b.textContent = key;
      b.onclick = () => loadItem(key);
      if (isItemDone(key)) b.classList.add('done');
      strip.appendChild(b);
    });
  }

  function loadItem(key) {
    currentKey = key;
    document.querySelectorAll('.item-key').forEach(k => k.classList.remove('active'));
    document.getElementById('key-' + key)?.classList.add('active');
    currentCard = 0; currentQuestion = 0; answered = false; completionShown = false;
    document.querySelectorAll('.star').forEach(star => star.classList.remove('earned'));
    applyStage(currentStage);
    buildQuizData();
    renderQuiz();
    updateCard();
    buildWorksheet();
    loadProgress();
  }

  function nextItem() {
    const items = getStageItems(currentStage);
    const i = items.indexOf(currentKey);
    if (i < items.length - 1) loadItem(items[i + 1]);
  }

  // ── STAGE ──
  function setStage(stage, btn) {
    document.querySelectorAll('.stage-tab').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
    currentStage = stage;
    completionShown = false;
    // If currentKey is outside the new stage's item set, reset to first valid item
    const items = getStageItems(stage);
    if (!items.includes(currentKey)) {
      currentKey = items[0];
      currentCard = 0; currentQuestion = 0; answered = false; completionShown = false;
      document.querySelectorAll('.star').forEach(star => star.classList.remove('earned'));
    }
    buildItemStrip();
    applyStage(stage);
    buildQuizData(); renderQuiz(); updateCard(); buildWorksheet(); loadProgress();
  }

  function applyStage(stage) {
    const s = config.stages[stage];
    document.getElementById('stageBadge').textContent       = s.label;
    document.getElementById('ageBadge').textContent         = s.age;
    document.getElementById('itemBadge').textContent        = config.getItemBadge(currentKey, stage);
    document.getElementById('childAvatarNav').textContent   = s.avatar;
    document.getElementById('lessonTitle').textContent      = config.getItemTitle(currentKey);
    document.getElementById('subjectIcon').textContent      = config.getItemEmoji(currentKey);
    document.getElementById('storyIllustration').textContent = config.getItemEmoji(currentKey);
    document.getElementById('storyText').innerHTML          = config.getStory(currentKey, stage);
    document.getElementById('wsTitle').textContent          = config.getWorksheetTitle(currentKey);
    document.getElementById('wsStage').textContent          = s.label.replace(/^[^\s]+\s/, '');
    document.getElementById('progressLabel').textContent    = config.getProgressLabel(currentKey);
    buildQuickPrompts();
    chatHistory = [];
    const chat = document.getElementById('chatMessages'); chat.innerHTML = '';
    addMessage('buzz', config.getGreeting(currentKey, stage));
  }

  // ── TABS ──
  function switchTab(tab, btn) {
    document.querySelectorAll('.activity-tab').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.activity-content').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
  }

  // ── FLASHCARDS ──
  function updateCard() {
    const cards = config.getCards(currentKey);
    currentCard = Math.min(currentCard, cards.length - 1);
    const rendered = config.renderCard(cards[currentCard], currentKey, currentStage);
    // Card visual: prefer an <img> when the config supplies `image`, else fall back to `emoji`.
    // Shared by parent view and Kid Mode (Kid Mode reuses this same #cardEmoji element).
    if (rendered.image) {
      const altText = (rendered.label || '').replace(/"/g, '&quot;');
      document.getElementById('cardEmoji').innerHTML =
        `<img class="card-img" src="${rendered.image}" alt="${altText}" loading="lazy" ` +
        `style="max-width:80%;max-height:60%;object-fit:contain;">`;
    } else {
      document.getElementById('cardEmoji').innerHTML = rendered.emoji;
    }
    document.getElementById('cardWord').textContent    = rendered.label;
    const backText = document.getElementById('cardBackText');
    backText.innerHTML = rendered.backHtml;
    // Wire any in-back speaker button (e.g. numbers card back) — reads its `data-speak` text aloud.
    // stopPropagation so tapping it doesn't flip the card. Shared by parent view + Kid Mode.
    const backSpeak = backText.querySelector('.card-back-speak');
    if (backSpeak) {
      backSpeak.addEventListener('click', e => {
        e.stopPropagation();
        const txt = backSpeak.getAttribute('data-speak');
        if (txt) speakQuiz(txt);
      });
    }
    document.getElementById('cardCounter').textContent = (currentCard + 1) + ' / ' + cards.length;
    document.getElementById('flashcard').classList.remove('flipped');
  }

  function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
    if (KID.active) stopCardWobble();
  }

  function nextCard() {
    const cards = config.getCards(currentKey);
    currentCard = (currentCard + 1) % cards.length;
    updateCard();
    seenCards.add(currentCard);
    recomputeProgress();
  }

  function prevCard() {
    const cards = config.getCards(currentKey);
    currentCard = (currentCard - 1 + cards.length) % cards.length;
    updateCard();
    seenCards.add(currentCard);
    recomputeProgress();
  }

  // ── QUIZ ──
  function buildQuizData() {
    quizSet = config.buildQuiz(currentKey, currentStage);
  }

  function renderQuiz() {
    if (currentQuestion >= quizSet.length) {
      document.getElementById('quizQuestion').textContent = t('quizComplete');
      document.getElementById('quizOptions').innerHTML = '';
      document.getElementById('quizImage').textContent = '🏆';
      document.getElementById('nextQBtn').disabled = true;
      return;
    }
    const q = quizSet[currentQuestion];
    document.getElementById('quizQuestion').textContent = q.question;
    document.getElementById('quizImage').innerHTML   = q.image;
    document.getElementById('quizFeedback').textContent = '';
    document.getElementById('nextQBtn').disabled = true;
    answered = false; wrongAttempts = 0;
    const optEl = document.getElementById('quizOptions'); optEl.innerHTML = '';
    q.options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'quiz-option';
      b.innerHTML = `<span class="opt-emoji">${opt.e}</span>${opt.l}`;
      b.onclick = () => answerQuiz(b, opt.c);
      optEl.appendChild(b);
    });
    if (KID.active) setTimeout(() => speakQuiz(q.question), 400);
  }

  function speakQuiz(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  function answerQuiz(btn, correct) {
    if (btn.disabled) return;
    const fb = document.getElementById('quizFeedback');
    if (correct) {
      document.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
      btn.classList.add('correct');
      fb.className = 'quiz-feedback feedback-correct';
      fb.innerHTML = '<span class="qfb-emoji">⭐</span>' + t('feedbackCorrect');
      speakQuiz(t('feedbackCorrect'));
      answered = true;
      document.getElementById('nextQBtn').disabled = false;
      answeredQuestions.add(currentQuestion);
      recomputeProgress();
    } else {
      btn.disabled = true;
      btn.classList.add('wrong');
      wrongAttempts++;
      if (wrongAttempts >= 2) {
        document.querySelectorAll('.quiz-option').forEach((b, i) => {
          b.disabled = true;
          if (quizSet[currentQuestion].options[i]?.c) b.classList.add('correct');
        });
        const correctLabel = quizSet[currentQuestion].options.find(o => o.c)?.l || '';
        fb.className = 'quiz-feedback feedback-correct';
        fb.innerHTML = '<span class="qfb-emoji">✅</span>' + t('feedbackReveal', correctLabel);
        speakQuiz(t('feedbackReveal', correctLabel));
        answered = true;
        document.getElementById('nextQBtn').disabled = false;
      } else {
        fb.className = 'quiz-feedback feedback-wrong';
        fb.innerHTML = '<span class="qfb-emoji">🤔</span>' + t('feedbackTryAgain');
        speakQuiz(t('feedbackTryAgain'));
      }
    }
  }

  function nextQuestion() {
    currentQuestion++;
    if (KID.active && currentQuestion >= quizSet.length) {
      renderQuiz(); // shows 🏆 state briefly
      setTimeout(() => kidShowStep('story'), 700);
      return;
    }
    renderQuiz();
  }

  // ── STORY ──
  function listenStory() {
    const text = (document.getElementById('storyText').innerText || '').trim();
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US'; utter.rate = 0.9;
    const btn = document.getElementById('listenBtn');
    if (btn) { btn.classList.add('speaking'); btn.textContent = t('listenSpeaking'); }
    utter.onend = utter.onerror = () => {
      if (btn) { btn.classList.remove('speaking'); btn.textContent = t('listenBtn'); }
      if (KID.active) setTimeout(() => kidShowStep('done'), 500);
    };
    window.speechSynthesis.speak(utter);
    storyDone = true;
    recomputeProgress();
  }

  function finishStory() {
    storyDone = true;
    recomputeProgress();
    if (KID.active) setTimeout(() => kidShowStep('done'), 400);
  }

  // ── BUZZ CHAT ──
  function addMessage(role, html) {
    const chat = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'msg ' + role;
    div.innerHTML = `<div class="msg-avatar">${role === 'buzz' ? '🐝' : '👤'}</div><div class="msg-bubble">${html}</div>`;
    chat.appendChild(div); chat.scrollTop = chat.scrollHeight;
    if (role === 'user') chatHistory.push({ role: 'user', content: html.replace(/<[^>]+>/g, '') });
  }

  function showTyping() {
    const chat = document.getElementById('chatMessages');
    const div = document.createElement('div'); div.className = 'msg buzz'; div.id = 'typingIndicator';
    div.innerHTML = `<div class="msg-avatar">🐝</div><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
    chat.appendChild(div); chat.scrollTop = chat.scrollHeight;
  }

  function removeTyping() { document.getElementById('typingIndicator')?.remove(); }

  async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || isTyping) return;
    input.value = ''; input.style.height = 'auto';
    addMessage('user', text);
    isTyping = true; document.getElementById('sendBtn').disabled = true;
    showTyping();
    const messages = [...chatHistory.slice(-8), { role: 'user', content: text }];
    try {
      const res = await fetch('/api/claude-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: config.getBuzzPrompt(currentKey, currentStage) + ` Respond in language: ${currentLang}.`,
          messages,
          max_tokens: 200
        })
      });
      const data = await res.json();
      const reply = data?.content?.[0]?.text || data?.reply || "Bzzz! 🐝 Let me think about that...";
      removeTyping(); addMessage('buzz', reply);
      chatHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      removeTyping();
      addMessage('buzz', t('buzzTired'));
      console.error(err);
    }
    isTyping = false; document.getElementById('sendBtn').disabled = false;
  }

  function sendQuick(m) { document.getElementById('chatInput').value = m; sendMessage(); }
  function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }
  function autoResize(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 100) + 'px'; }

  // ── VOICE ──
  function toggleVoice() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addMessage('buzz', t('noVoice')); return;
    }
    const btn = document.getElementById('voiceBtn');
    if (isListening) { recognition?.stop(); isListening = false; btn.classList.remove('listening'); btn.textContent = '🎤'; return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR(); recognition.lang = 'en-US'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart  = () => { isListening = true; btn.classList.add('listening'); btn.textContent = '🔴'; };
    recognition.onresult = e => { document.getElementById('chatInput').value = e.results[0][0].transcript; isListening = false; btn.classList.remove('listening'); btn.textContent = '🎤'; sendMessage(); };
    recognition.onerror  = () => { isListening = false; btn.classList.remove('listening'); btn.textContent = '🎤'; };
    recognition.onend    = () => { isListening = false; btn.classList.remove('listening'); btn.textContent = '🎤'; };
    recognition.start();
  }

  // ── QUICK PROMPTS ──
  function buildQuickPrompts() {
    const el = document.getElementById('quickPrompts');
    el.innerHTML = '';
    config.getQuickPrompts(currentKey).forEach(c => {
      const b = document.createElement('button');
      b.className = 'quick-chip'; b.textContent = c.t;
      b.onclick = () => sendQuick(c.m);
      el.appendChild(b);
    });
  }

  // ── PROGRESS ──
  function recomputeProgress() {
    const totalCards     = config.getCards(currentKey).length;
    const totalQuestions = quizSet.length || 1;
    const xp = Math.round(
      (seenCards.size / totalCards) * 40 +
      (answeredQuestions.size / totalQuestions) * 40 +
      (storyDone ? 1 : 0) * 20
    );
    document.getElementById('xpBadge').textContent = xp + ' 🍯';
    document.getElementById('progressFill').style.width = xp + '%';
    document.getElementById('s1')?.classList.toggle('earned', storyDone);
    document.getElementById('s2')?.classList.toggle('earned', seenCards.size >= totalCards);
    document.getElementById('s3')?.classList.toggle('earned', answeredQuestions.size >= totalQuestions);
    saveProgress();
    if (xp >= 100 && !completionShown) { completionShown = true; showCompletion(); }
  }

  // ── COMPLETION ──
  function showCompletion() {
    document.getElementById('key-' + currentKey)?.classList.add('done');
    saveProgress(true);
    if (KID.active) return; // modal suppressed in kid mode; celebration via kid done screen
    document.getElementById('modalSubtitle').innerHTML =
      `You finished ${config.getItemDisplayName(currentKey)}!<br>Buzz the Bee is so proud of you!`;
    document.getElementById('completionModal').classList.add('visible');
  }

  function closeModal() { document.getElementById('completionModal').classList.remove('visible'); }

  // ── PROGRESS STORAGE ──
  function progressKey(key = currentKey, stage = currentStage) {
    return `lh_progress_${config.lessonKey}_${key}_${stage}`;
  }

  function saveProgress(completed = false) {
    try {
      localStorage.setItem(progressKey(), JSON.stringify({
        seenCards: [...seenCards], answeredQuestions: [...answeredQuestions],
        storyDone, completed, ts: Date.now()
      }));
    } catch (e) {}
  }

  function loadProgress() {
    seenCards = new Set(); answeredQuestions = new Set(); storyDone = false;
    try {
      const raw = localStorage.getItem(progressKey());
      if (raw) {
        const d = JSON.parse(raw);
        seenCards         = new Set(d.seenCards || []);
        answeredQuestions = new Set(d.answeredQuestions || []);
        storyDone         = d.storyDone || false;
        if (d.completed) completionShown = true;
      }
    } catch (e) {}
    recomputeProgress();
  }

  function isItemDone(key) {
    return Object.keys(config.stages).some(st => {
      try { const r = localStorage.getItem(progressKey(key, st)); return r && JSON.parse(r).completed; }
      catch (e) { return false; }
    });
  }

  // ── WORKSHEET ──
  function buildWorksheet() {
    document.getElementById('print-worksheet').innerHTML =
      config.renderWorksheet(currentKey, currentStage, true);
  }

  function buildFullWorksheet() {
    const items = getStageItems(currentStage);
    document.getElementById('print-worksheet').innerHTML =
      items.map((key, i) =>
        config.renderWorksheet(key, currentStage, i === items.length - 1)
      ).join('');
  }

  function printWorksheet() {
    buildWorksheet();
    window.onbeforeprint = buildWorksheet;
    window.print();
  }

  function printPack() {
    buildFullWorksheet();
    window.onbeforeprint = buildFullWorksheet;
    window.print();
  }

  // ── KID MODE ──

  function enterKidMode() {
    KID.active = true;
    KID.step   = 'cards';
    const km = document.getElementById('kidMode');
    km.classList.add('active');
    // Fullscreen on document root (broader support); scroll trick as iOS fallback for address bar
    const fsEl = document.documentElement;
    const rfs = fsEl.requestFullscreen || fsEl.webkitRequestFullscreen || fsEl.mozRequestFullScreen || fsEl.msRequestFullscreen;
    rfs?.call(fsEl).catch(() => {});
    setTimeout(() => window.scrollTo(0, 1), 80);
    document.body.classList.add('kid-active');
    startBuzzWiggle();
    kidShowStep('cards');
    showKidHint('Hold 🔒 to exit');
  }

  function exitKidMode() {
    kidDismissChips();
    stopBuzzWiggle();
    document.body.classList.remove('kid-active');
    kidRestoreTab();
    document.getElementById('kidMode').classList.remove('active');
    KID.active = false;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen)?.call(document).catch(() => {});
    }
  }

  function kidShowStep(step) {
    kidRestoreTab();
    stopCardWobble();
    KID.step = step;
    document.getElementById('kidMode').dataset.step = step;

    const wrap = document.getElementById('kidActivityWrap');
    const done = document.getElementById('kidDoneScreen');
    if (done) done.style.display = (step === 'done') ? 'flex' : 'none';

    if (step === 'done') { kidShowDone(); }
    if (step !== 'done') {
      const tabEl = document.getElementById('tab-' + step);
      if (tabEl) {
        tabEl.classList.add('active');
        wrap.appendChild(tabEl);
        KID.lastMoved = step;
      }
      // Re-render content for the new step
      if (step === 'cards') {
        currentCard = 0;
        updateCard();
        seenCards.add(0);
        recomputeProgress();
        startCardWobble();
        ensureKidSpeakerBtn();
      }
      if (step === 'quiz') {
        currentQuestion = 0; answered = false; wrongAttempts = 0;
        buildQuizData();
        renderQuiz();
      }
      // story: already rendered by applyStage() when item was loaded — no re-render needed
    }

    updateKidNav();
    updateKidDots();
  }

  function kidRestoreTab() {
    if (!KID.lastMoved) return;
    const tabEl = document.getElementById('tab-' + KID.lastMoved);
    if (tabEl) {
      tabEl.classList.remove('active');
      document.querySelector('.panel-card')?.appendChild(tabEl);
    }
    KID.lastMoved = null;
  }

  function kidAdvance() {
    if (KID.step === 'cards') {
      const cards = config.getCards(currentKey);
      if (currentCard < cards.length - 1) {
        nextCard();
        updateKidNav();
      } else {
        kidShowStep('quiz');
      }
    }
    // Quiz and story advance via their own UI; no kidAdvance action needed
  }

  function kidBack() {
    if (KID.step === 'cards' && currentCard > 0) {
      prevCard();
      updateKidNav();
    }
  }

  function kidShowDone() {
    const items  = getStageItems(currentStage);
    const isLast = items.indexOf(currentKey) >= items.length - 1;
    const emoji  = document.getElementById('kidDoneEmoji');
    const label  = document.getElementById('kidDoneLabel');
    const nextBtn = document.getElementById('kidNextItemBtn');
    const exitBtn = document.getElementById('kidDoneExitBtn');
    if (emoji)   emoji.textContent  = isLast ? '🏆' : '🎉';
    if (label)   label.textContent  = isLast
      ? 'You did it all! Amazing! 🌟'
      : config.getItemDisplayName(currentKey) + ' — well done!';
    if (nextBtn) nextBtn.style.display = isLast ? 'none' : '';
    if (exitBtn) exitBtn.style.display = isLast ? '' : 'none';
    spawnConfetti();
    kidBuzzJump();
  }

  function kidNextItem() {
    nextItem();          // loads next item: resets state, re-renders tabs into .panel-card
    kidShowStep('cards');
  }

  // ── KID MODE — PHASE 2B HELPERS ──

  function prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  function kidBuzzTap() {
    if (KID.isThinking) return;
    kidShowChips();
  }

  function kidBuzzJump() {
    if (prefersReducedMotion()) return;
    const buzz = document.getElementById('kidBuzz');
    if (!buzz) return;
    buzz.classList.add('buzz-jump');
    setTimeout(() => buzz.classList.remove('buzz-jump'), 920);
  }

  function startBuzzWiggle() {
    stopBuzzWiggle();
    if (prefersReducedMotion()) return;
    KID.wiggleTimer = setInterval(() => {
      if (!KID.active) { stopBuzzWiggle(); return; }
      const buzz = document.getElementById('kidBuzz');
      if (!buzz || document.getElementById('kidChipOverlay')) return;
      buzz.classList.add('buzz-wiggle');
      setTimeout(() => buzz?.classList.remove('buzz-wiggle'), 900);
    }, 5000);
  }

  function stopBuzzWiggle() {
    clearInterval(KID.wiggleTimer);
    KID.wiggleTimer = null;
    document.getElementById('kidBuzz')?.classList.remove('buzz-wiggle');
  }

  function kidShowChips() {
    if (document.getElementById('kidChipOverlay')) { kidDismissChips(); return; }
    const CHIPS = [
      { type: 'count', icon: '🔢' },
      { type: 'sound', icon: '🔊' },
      { type: 'fact',  icon: '⭐' }
    ];
    const overlay = document.createElement('div');
    overlay.id = 'kidChipOverlay';
    overlay.innerHTML =
      '<div class="kid-chips-container">' +
      CHIPS.map(c => `<button class="kid-chip" data-type="${c.type}">${c.icon}</button>`).join('') +
      '</div>';
    overlay.addEventListener('click', e => { if (e.target === overlay) kidDismissChips(); });
    overlay.querySelectorAll('.kid-chip').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); kidChipAction(btn.dataset.type); });
    });
    document.getElementById('kidMode').appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
  }

  function kidDismissChips() {
    const overlay = document.getElementById('kidChipOverlay');
    if (!overlay) return;
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 260);
  }

  async function kidChipAction(type) {
    if (KID.isThinking) return;
    KID.isThinking = true;
    kidDismissChips();
    const buzz = document.getElementById('kidBuzz');
    buzz?.classList.add('buzz-thinking');
    const PROMPTS = {
      count: `In 1 short sentence, help this child understand the quantity or meaning of "${currentKey}". Be playful and encouraging.`,
      sound: `In 1 short sentence, say the sound or name of "${currentKey}" and give one example for a young child.`,
      fact:  `Share one amazing fun fact about "${currentKey}" in 1 short sentence. Be excited and playful.`
    };
    const FALLBACKS = {
      count: "Let's count together — you're amazing! 🍯",
      sound: "Great listening! You're a superstar! 🌟",
      fact:  "Bzzz! Learning is so fun! 🐝"
    };
    try {
      const sys = (config.getBuzzPrompt?.(currentKey, currentStage) ??
        'You are Buzz, a friendly bee teaching young children. Be warm and playful.') +
        ' Reply in exactly 1 sentence. No markdown. Speak directly to the child.';
      const res = await fetch('/api/claude-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: sys,
          messages: [{ role: 'user', content: PROMPTS[type] }],
          max_tokens: 80
        })
      });
      if (!res.ok) throw new Error('proxy ' + res.status);
      const data = await res.json();
      const reply = data?.content?.[0]?.text?.trim() || FALLBACKS[type];
      kidBuzzSpeak(reply);
    } catch (_) {
      kidBuzzSpeak(FALLBACKS[type]);
    } finally {
      KID.isThinking = false;
      buzz?.classList.remove('buzz-thinking');
    }
  }

  function kidBuzzSpeak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.9; u.pitch = 1.05;
    window.speechSynthesis.speak(u);
    kidBuzzJump();
  }

  function spawnConfetti() {
    if (prefersReducedMotion()) {
      const screen = document.getElementById('kidDoneScreen');
      if (screen && !screen.querySelector('.kid-star-static')) {
        const stars = document.createElement('div');
        stars.className = 'kid-star-static';
        stars.textContent = '⭐ ⭐ ⭐';
        stars.style.cssText = 'font-size:32px;text-align:center;margin:8px 0;position:relative;z-index:5';
        screen.insertBefore(stars, screen.firstChild);
        setTimeout(() => stars.remove(), 3000);
      }
      return;
    }
    const screen = document.getElementById('kidDoneScreen');
    if (!screen) return;
    const COLORS = [
      'var(--vivid-red)', 'var(--vivid-blue)', 'var(--vivid-green)',
      'var(--vivid-yellow)', 'var(--vivid-purple)', 'var(--vivid-orange)'
    ];
    for (let i = 0; i < 24; i++) {
      const el = document.createElement('div');
      el.className = 'kid-confetti';
      el.style.cssText = [
        `left:${5 + Math.random() * 90}%`,
        `top:${5 + Math.random() * 30}%`,
        `background:${COLORS[i % COLORS.length]}`,
        `animation-delay:${(Math.random() * 0.4).toFixed(2)}s`,
        `animation-duration:${(1.2 + Math.random() * 0.9).toFixed(2)}s`,
        `width:${8 + Math.floor(Math.random() * 8)}px`,
        `height:${8 + Math.floor(Math.random() * 8)}px`,
        `border-radius:${Math.random() > 0.5 ? '50%' : '3px'}`,
        `transform:rotate(${Math.floor(Math.random() * 360)}deg)`,
      ].join(';');
      screen.appendChild(el);
      setTimeout(() => el.remove(), 2800);
    }
  }

  function startCardWobble() {
    stopCardWobble();
    if (prefersReducedMotion()) return;
    KID.wobbleTimer = setInterval(() => {
      if (KID.step !== 'cards') { stopCardWobble(); return; }
      const card = document.getElementById('flashcard');
      if (!card || card.classList.contains('flipped')) return;
      card.classList.add('kid-wobble');
      setTimeout(() => card?.classList.remove('kid-wobble'), 700);
    }, 3800);
  }

  function stopCardWobble() {
    clearInterval(KID.wobbleTimer);
    KID.wobbleTimer = null;
    document.getElementById('flashcard')?.classList.remove('kid-wobble');
  }

  function ensureKidSpeakerBtn() {
    if (document.getElementById('kidCardSpeaker')) return;
    const front = document.querySelector('#kidActivityWrap .flashcard-front');
    if (!front) return;
    const btn = document.createElement('button');
    btn.id = 'kidCardSpeaker';
    btn.setAttribute('aria-label', 'Listen');
    btn.innerHTML = '🔊';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const word = document.getElementById('cardWord')?.textContent?.trim();
      if (word) speakQuiz(word);
    });
    front.appendChild(btn);
  }

  function updateKidNav() {
    const fwd = document.getElementById('kidFwdBtn');
    const bk  = document.getElementById('kidBackBtn');
    const bar = document.getElementById('kidNavBar');
    if (!fwd || !bk || !bar) return;

    if (KID.step === 'done') {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = '';

    if (KID.step === 'cards') {
      bk.style.visibility  = currentCard === 0 ? 'hidden' : '';
      fwd.style.visibility = '';
      fwd.disabled = false;
    } else {
      // Quiz and story: hide both arrows — interaction is within the activity itself
      bk.style.visibility  = 'hidden';
      fwd.style.visibility = 'hidden';
    }
  }

  function updateKidDots() {
    const FLOW = ['cards', 'quiz', 'story'];
    const idx  = FLOW.indexOf(KID.step);
    FLOW.forEach((s, i) => {
      const dot = document.getElementById('kidDot' + i);
      if (!dot) return;
      dot.className = 'kid-dot';
      if (i < idx) dot.classList.add('done');
      else if (i === idx) dot.classList.add('active');
    });
  }

  function kidLockStart() {
    KID.holdTimer = setTimeout(exitKidMode, 3000);
    document.getElementById('kidLockBtn')?.classList.add('holding');
  }

  function kidLockEnd() {
    clearTimeout(KID.holdTimer);
    document.getElementById('kidLockBtn')?.classList.remove('holding');
  }

  function showKidHint(msg) {
    const el = document.getElementById('kidHint');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 3500);
  }

  // ESC / browser back exits kid mode via fullscreenchange
  document.addEventListener('fullscreenchange',       () => { if (!document.fullscreenElement && !document.webkitFullscreenElement && KID.active) exitKidMode(); });
  document.addEventListener('webkitfullscreenchange', () => { if (!document.fullscreenElement && !document.webkitFullscreenElement && KID.active) exitKidMode(); });

  function injectKidModeDom() {
    // ── PWA meta: minimize browser chrome on mobile ──
    [['apple-mobile-web-app-capable','yes'],['mobile-web-app-capable','yes']].forEach(([n,v]) => {
      if (!document.querySelector(`meta[name="${n}"]`)) {
        const m = document.createElement('meta'); m.name = n; m.content = v;
        document.head.appendChild(m);
      }
    });

    // ── CSS ──
    // Pre-compute the encoded honeycomb SVG for the data-URI background
    const _hexSVG = encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='28' height='24'>" +
      "<polygon points='14,2 24,8.5 24,15.5 14,22 4,15.5 4,8.5' " +
      "fill='none' stroke='rgba(200,140,40,0.09)' stroke-width='1'/></svg>"
    );

    const style = document.createElement('style');
    style.textContent = `
      /* ═══════════════════════════════════════════
         KID MODE — injected by lesson-engine.js
         All selectors scoped to #kidMode / #kidActivityWrap
         to guarantee zero impact on parent view.
      ═══════════════════════════════════════════ */

      /* ── Vivid palette (learning objects only; chrome stays warm neutrals) ── */
      #kidMode {
        --vivid-red:    #E8281C;
        --vivid-blue:   #1C6AE8;
        --vivid-green:  #16A34A;
        --vivid-yellow: #FACC15;
        --vivid-purple: #7C3AED;
        --vivid-orange: #EA580C;
      }

      /* Overlay container — sky-gradient background replaces flat cream */
      #kidMode {
        display: none; position: fixed; inset: 0; z-index: 9999;
        background: linear-gradient(175deg, #A8DCEF 0%, #C6E8F2 28%, #F5E8C8 70%, #F0D88A 100%);
        flex-direction: column; overflow: hidden;
        font-family: 'Fredoka', 'Nunito', sans-serif;
        height: 100dvh; height: 100vh; /* dvh with vh fallback */
      }
      #kidMode.active { display: flex; }

      /* ── World backdrop (absolute, behind all content) ── */
      #kidBg {
        position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
      }
      #kidBgDrip {
        position: absolute; top: 0; left: 0; right: 0; height: 36px; z-index: 2;
      }
      #kidBgDrip svg { display: block; width: 100%; height: 36px; }
      #kidBgHive {
        position: absolute; top: 54px; right: 14px; z-index: 2; opacity: .82;
        line-height: 0;
      }
      .kid-bg-bee {
        position: absolute; z-index: 2; line-height: 0;
        will-change: transform;
      }
      .kid-bee-1 { top: 10%; left:  6%; animation: kid-bee-drift1 16s ease-in-out infinite; }
      .kid-bee-2 { top: 22%; left: 52%; animation: kid-bee-drift2 21s ease-in-out infinite 3s; }
      .kid-bee-3 { top:  7%; left: 28%; animation: kid-bee-drift3 13s ease-in-out infinite 7s; }
      #kidBgGround {
        position: absolute; bottom: 0; left: 0; right: 0; z-index: 1; line-height: 0;
      }
      #kidBgGround svg { display: block; width: 100%; }

      /* ── Buzz the Bee character (lower corner) ── */
      #kidBuzz {
        position: absolute; bottom: 92px; right: 16px; z-index: 10;
        width: clamp(44px, 10dvh, 62px); height: auto; line-height: 0;
        cursor: pointer; animation: kid-buzz-bob 2.8s ease-in-out infinite;
        -webkit-user-select: none; user-select: none; touch-action: none;
        will-change: transform;
      }
      #kidBuzz svg { display: block; width: 100%; height: auto; }

      /* ── ANIMATIONS ── */
      @keyframes kid-bee-drift1 {
        0%   { transform: translate(0,    0)     rotate(0deg);   }
        20%  { transform: translate(22px,-18px)  rotate(-10deg); }
        45%  { transform: translate(40px, 12px)  rotate(7deg);   }
        70%  { transform: translate(18px,-24px)  rotate(-6deg);  }
        100% { transform: translate(0,    0)     rotate(0deg);   }
      }
      @keyframes kid-bee-drift2 {
        0%   { transform: translate(0,    0)     rotate(0deg); }
        30%  { transform: translate(-28px,14px)  rotate(9deg); }
        60%  { transform: translate(-12px,-20px) rotate(-7deg); }
        100% { transform: translate(0,    0)     rotate(0deg); }
      }
      @keyframes kid-bee-drift3 {
        0%   { transform: translate(0,    0)    rotate(0deg);   }
        35%  { transform: translate(16px, 20px) rotate(12deg);  }
        65%  { transform: translate(-10px, 8px) rotate(-5deg);  }
        100% { transform: translate(0,    0)    rotate(0deg);   }
      }
      @keyframes kid-buzz-bob {
        0%, 100% { transform: translateY(0);    }
        50%       { transform: translateY(-8px); }
      }
      @keyframes kid-buzz-jump {
        0%   { transform: translateY(0)     scale(1);    }
        30%  { transform: translateY(-28px) scale(1.15); }
        60%  { transform: translateY(-8px)  scale(1.05); }
        100% { transform: translateY(0)     scale(1);    }
      }
      #kidBuzz.buzz-jump  { animation: kid-buzz-jump  .92s ease-out forwards; }
      #kidBuzz.buzz-speak { animation: kid-buzz-jump  .55s ease-out forwards; }
      @keyframes kid-buzz-wiggle {
        0%, 100% { transform: translateY(0)    rotate(0deg);   }
        20%      { transform: translateY(-5px) rotate(-10deg); }
        45%      { transform: translateY(-3px) rotate(8deg);   }
        70%      { transform: translateY(-6px) rotate(-5deg);  }
      }
      #kidBuzz.buzz-wiggle { animation: kid-buzz-wiggle .9s ease-in-out; }
      @keyframes kid-buzz-thinking {
        0%, 100% { transform: translateY(0)    scale(1);    }
        50%      { transform: translateY(-7px) scale(1.12); }
      }
      #kidBuzz.buzz-thinking { animation: kid-buzz-thinking .65s ease-in-out infinite; }

      /* ── Buzz chip overlay ── */
      #kidChipOverlay {
        position: absolute; inset: 0; z-index: 15;
        background: rgba(0,0,0,.2);
        opacity: 0; transition: opacity .22s;
      }
      #kidChipOverlay.visible { opacity: 1; }
      .kid-chips-container {
        position: absolute; bottom: 196px; right: 14px;
        display: flex; flex-direction: column; align-items: center; gap: 12px;
      }
      .kid-chip {
        display: flex; align-items: center; justify-content: center;
        width: 72px; height: 72px;
        background: white; border: none; border-radius: 50%;
        font-size: clamp(28px, 6dvh, 40px);
        box-shadow: 0 6px 22px rgba(0,0,0,.22);
        cursor: pointer; touch-action: manipulation;
        animation: kid-chip-pop .24s cubic-bezier(.34,1.56,.64,1) both;
        -webkit-user-select: none; user-select: none;
      }
      .kid-chip:nth-child(1) { animation-delay: .04s; }
      .kid-chip:nth-child(2) { animation-delay: .10s; }
      .kid-chip:nth-child(3) { animation-delay: .16s; }
      .kid-chip:active { transform: scale(.88); }
      @keyframes kid-chip-pop {
        from { opacity: 0; transform: translateY(16px) scale(.82); }
        to   { opacity: 1; transform: translateY(0)    scale(1);   }
      }

      @keyframes kid-card-wobble {
        0%,100% { transform: rotate(0deg);  }
        20%      { transform: rotate(-3deg); }
        40%      { transform: rotate(3deg);  }
        60%      { transform: rotate(-2deg); }
        80%      { transform: rotate(2deg);  }
      }
      #kidActivityWrap .flashcard.kid-wobble {
        animation: kid-card-wobble .7s ease-in-out;
      }

      /* Confetti particles */
      .kid-confetti {
        position: absolute; z-index: 20; pointer-events: none;
        animation: kid-confetti-fall 1.8s ease-in forwards;
        will-change: transform, opacity;
      }
      @keyframes kid-confetti-fall {
        0%   { transform: translateY(0)     rotate(0deg);   opacity: 1; }
        80%  { opacity: 0.8; }
        100% { transform: translateY(150px) rotate(360deg); opacity: 0; }
      }

      /* ── Speaker button (card front, kid-layer only) ── */
      #kidCardSpeaker {
        display: none; /* hidden when flashcard is in parent view */
        position: absolute; bottom: 10px; right: 10px; z-index: 10;
        font-size: 20px; background: rgba(255,255,255,.78); border: none;
        border-radius: 50%; width: 38px; height: 38px;
        align-items: center; justify-content: center;
        cursor: pointer; transition: background .15s;
        -webkit-user-select: none; user-select: none;
      }
      #kidActivityWrap .flashcard-front #kidCardSpeaker { display: flex; }
      #kidCardSpeaker:active { background: rgba(245,166,35,.3); }

      /* ── Honeycomb texture on the flashcard area only ── */
      #kidActivityWrap .flashcard-area {
        background-image: url("data:image/svg+xml,${_hexSVG}");
        background-size: 28px 24px;
        background-repeat: repeat;
        border-radius: 16px;
      }

      /* ── Vivid colors on learning content ── */
      #kidActivityWrap .quiz-option.correct {
        box-shadow: 0 0 0 3px var(--vivid-green), 0 4px 16px rgba(22,163,74,.22);
      }
      #kidActivityWrap .story-illustration {
        filter: drop-shadow(0 0 12px rgba(245,195,35,.38));
      }
      #kidDoneScreen #kidDoneEmoji {
        filter: drop-shadow(0 0 20px rgba(250,204,21,.52));
      }

      /* ── NO-WORDS: hide option text labels (emoji carries the meaning) ── */
      #kidActivityWrap .quiz-option { font-size: 0 !important; }

      /* ── REDUCED MOTION ── */
      @media (prefers-reduced-motion: reduce) {
        .kid-bg-bee, #kidBuzz,
        #kidActivityWrap .flashcard.kid-wobble,
        .kid-confetti, .kid-chip { animation: none !important; }
        #kidChipOverlay { transition: none; }
      }

      /* Ensure flex content sits above the absolute #kidBg layer */
      #kidHeader, #kidActivityWrap, #kidDoneScreen, #kidNavBar {
        position: relative; z-index: 1;
      }

      /* During the quiz, hide the drifting bees — they float over the counting
         objects and make "How many?" ambiguous. */
      #kidMode[data-step="quiz"] .kid-bg-bee { display: none !important; }

      /* ── Header row: lock + progress bar placeholder ── */
      #kidHeader {
        display: flex; align-items: center;
        padding: 10px 14px; flex-shrink: 0; gap: 12px;
      }
      #kidLockBtn {
        font-size: 24px; background: none; border: 2px solid transparent;
        border-radius: 50%; width: 44px; height: 44px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: background .2s, border-color .2s;
        -webkit-user-select: none; user-select: none; touch-action: none;
        flex-shrink: 0;
      }
      #kidLockBtn.holding {
        background: rgba(212,112,10,.15); border-color: var(--amber);
        animation: kid-lock-pulse 3s linear forwards;
      }
      @keyframes kid-lock-pulse {
        0%   { box-shadow: 0 0 0 0  rgba(212,112,10,.5); }
        100% { box-shadow: 0 0 0 24px rgba(212,112,10,0); }
      }
      #kidProgressPlaceholder {
        flex: 1; height: 8px; background: var(--comb); border-radius: 100px;
        /* Phase 3: replace with bee + honey-jar SVG progress visualization */
      }

      /* ── Activity content host ── */
      #kidActivityWrap {
        flex: 1; min-height: 0; overflow: hidden;
        display: flex; flex-direction: column;
        padding: 0 14px;
      }
      /* Hide parent-only chrome that lives inside the moved tabs */
      #kidMode .activity-tabs     { display: none !important; }
      #kidMode .worksheet-preview { display: none !important; }
      /* Tab divs become full-height flex columns inside the wrap */
      #kidActivityWrap .activity-content {
        display: flex !important; flex-direction: column;
        flex: 1; min-height: 0; padding: 0;
      }
      /* Hide parent chat panel while kid mode is active */
      body.kid-active .buzz-panel { display: none !important; }

      /* ── Number combo card (parent view + kid mode) ── */
      .num-combo {
        display: flex; flex-direction: column; align-items: center;
        gap: 0.08em; width: 100%;
      }
      .num-big {
        font-size: 1em; font-weight: 700;
        color: var(--amber, #F5A623); line-height: 1;
      }
      .num-pots {
        font-size: 0.32em; line-height: 1.35; text-align: center;
        overflow: hidden; max-width: 100%;
      }

      /* Quiz Q1 counting image (numbers lesson) */
      .num-q1-img {
        font-size: clamp(18px, 4dvh, 32px);
        line-height: 1.4; text-align: center;
        overflow: hidden; max-width: 100%;
      }

      /* Photo counting objects (e.g. honeypot.png) — parent view + kid mode */
      .counting-obj {
        width: clamp(36px, 7dvh, 56px); height: auto;
        vertical-align: middle; margin: 2px;
      }
      /* Smaller variant for high counts (11–20) so the grid stays inside the card */
      .counting-obj-sm {
        width: clamp(24px, 4dvh, 36px); height: auto;
        vertical-align: middle; margin: 1px;
      }
      /* Tighten honeypot rows when there are many (>10): pull rows closer together */
      .num-pots.num-pots-dense, .num-q1-img.num-q1-img-dense {
        line-height: 1.05;
      }

      /* ═══ Number card BACK (numbers lesson only) — parent view + Kid Mode ═══ */
      /* White face so white-background photos blend seamlessly. */
      body[data-lesson="numbers"] .flashcard-back {
        background: #FFFFFF; overflow: hidden;
      }
      /* Remove the shell's static decorative speaker — keep only #cardBackText. */
      body[data-lesson="numbers"] .flashcard-back > div:not(#cardBackText) {
        display: none !important;
      }
      /* Let the back text host fill the card so the column can distribute top→bottom. */
      body[data-lesson="numbers"] #cardBackText {
        width: 100%; height: 100%;
        display: flex; align-items: stretch;
      }
      .num-back {
        flex: 1; width: 100%; min-height: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: clamp(4px, 1.2dvh, 10px); text-align: center; overflow: hidden;
      }
      /* Photo grid zone — ~60% of the card height, contents vertically centered. */
      .num-photo-zone {
        flex: 0 1 60%; min-height: 0; width: 100%;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
      }
      /* Inner grid is plain inline flow (imgs + <br>) so rows-of-5 grouping renders. */
      .num-photo-grid { line-height: 1.05; max-width: 100%; text-align: center; }
      .num-photo { object-fit: contain; margin: 2px; vertical-align: middle; }
      .num-photo-xl { width: clamp(80px, 12dvh, 120px); height: auto; }
      .num-photo-lg { width: clamp(56px,  9dvh,  80px); height: auto; }
      .num-photo-md { width: clamp(40px,  7dvh,  60px); height: auto; }
      .num-photo-sm { width: clamp(30px,  5dvh,  44px); height: auto; }
      .num-photo-xs { width: clamp(24px,  4dvh,  36px); height: auto; }
      /* Word → fact → speaker, below the photo grid. */
      .num-back-word {
        flex: 0 0 auto; font-family: 'Fredoka', 'Nunito', sans-serif; font-weight: 700;
        color: var(--amber, #D4700A); font-size: clamp(18px, 3.4dvh, 30px); line-height: 1.1;
      }
      .num-back-fact {
        flex: 0 0 auto; color: var(--moss, #6B8F3E); max-width: 92%;
        font-size: clamp(11px, 2.2dvh, 17px); line-height: 1.35;
      }
      .num-back-fact .num-bloom { color: var(--amber, #D4700A); font-weight: 700; }
      .card-back-speak {
        flex: 0 0 auto; margin-top: 2px;
        width: clamp(40px, 6dvh, 52px); height: clamp(40px, 6dvh, 52px);
        font-size: clamp(18px, 3.4dvh, 28px); line-height: 1;
        background: rgba(245,166,35,.14); border: none; border-radius: 50%;
        display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer; -webkit-user-select: none; user-select: none;
        transition: background .15s;
      }
      .card-back-speak:active { background: rgba(245,166,35,.32); }

      /* ── CARDS layout ── */
      /* Definitively hide all text nav chrome — real class is .flashcard-nav */
      #kidActivityWrap .flashcard-nav,
      #kidActivityWrap .card-nav,
      #kidActivityWrap .card-counter,
      #kidActivityWrap .card-btn      { display: none !important; }
      #kidActivityWrap .card-hint     { display: none !important; }

      #kidActivityWrap .flashcard-area {
        flex: 1; min-height: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 0;
      }
      /* Card sized to fill ~75 % of the viewport height */
      #kidActivityWrap .flashcard {
        width:  min(90vw, 56dvh);
        height: min(72dvh, 112vw);
        max-width: unset; aspect-ratio: unset;
        border-radius: 24px;
        /* override any inline width/height the HTML shell may set */
      }
      #kidActivityWrap .flashcard-inner {
        height: 100%;
      }
      /* Force front absolute so it fills the enlarged card
         (numbers / colors-shapes shells use position:relative for content-driven height;
          in kid mode we always have a fixed card size) */
      #kidActivityWrap .flashcard-front {
        position: absolute !important; inset: 0 !important;
        display: flex !important; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 10px; padding: 20px; overflow: hidden;
      }
      #kidActivityWrap .card-emoji {
        font-size: clamp(80px, 24dvh, 180px);
        line-height: 1; flex: 1;
        display: flex; align-items: center; justify-content: center;
        text-align: center; overflow: hidden;
      }
      /* Scale up inline SVGs (colors-shapes, numbers ten-frames) */
      #kidActivityWrap .card-emoji svg {
        width:  clamp(110px, 30dvh, 240px) !important;
        height: clamp(110px, 30dvh, 240px) !important;
      }
      #kidActivityWrap .card-word {
        font-size: clamp(22px, 5.5dvh, 44px); flex-shrink: 0;
      }
      #kidActivityWrap .flashcard-back {
        display: flex; align-items: center; justify-content: center;
        padding: 20px; overflow: hidden;
      }
      #kidActivityWrap .card-back-text {
        font-size: clamp(12px, 2.8dvh, 22px);
        line-height: 1.45; overflow: hidden; text-align: center;
      }

      /* ── QUIZ layout — three balanced zones ── */
      #kidActivityWrap #tab-quiz {
        gap: clamp(4px, 1dvh, 10px); padding: clamp(4px, 1dvh, 8px) 0 0;
      }
      /* ZONE 1: stage — counting objects / numeral / decorative emoji.
         Grows to ~50-55% of the quiz zone so objects display large & countable. */
      #kidActivityWrap .quiz-image {
        flex: 1.3 1 0; min-height: 0; overflow: hidden;
        font-size: clamp(44px, 13dvh, 88px); line-height: 1.05;
        display: flex; align-items: center; justify-content: center;
        flex-wrap: wrap; word-break: break-all;
      }
      #kidActivityWrap .quiz-image svg {
        width:  clamp(64px, 16dvh, 120px) !important;
        height: clamp(64px, 16dvh, 120px) !important;
      }
      /* Numbers lesson "How many?" counting image — scale honeypots up & let them grow */
      #kidActivityWrap .quiz-image .num-q1-img {
        font-size: clamp(34px, 9dvh, 64px); line-height: 1.25;
      }
      /* ZONE 2: prompt — question + feedback */
      #kidActivityWrap .quiz-question {
        flex: 0 0 auto;
        font-size: clamp(14px, 3dvh, 22px);
        text-align: center; margin: 0;
      }
      #kidActivityWrap .quiz-feedback {
        flex: 0 0 auto;
        font-size: clamp(12px, 2.8dvh, 18px) !important;
        min-height: clamp(18px, 3.5dvh, 28px);
      }
      /* ZONE 3: actions — 2×2 grid, ~45% share; tiles stay tappable but not oversized */
      #kidActivityWrap .quiz-options {
        flex: 1 1 0; min-height: 0; max-height: 42dvh;
        display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
        gap: 8px;
      }
      #kidActivityWrap .quiz-option {
        min-height: clamp(60px, 9dvh, 84px);
        padding: 6px 4px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 4px;
        border-radius: 14px;
      }
      #kidActivityWrap .opt-emoji {
        font-size: clamp(22px, 5.5dvh, 42px) !important; line-height: 1; display: block;
      }
      #kidActivityWrap .opt-emoji svg {
        width:  clamp(26px, 6dvh, 46px) !important;
        height: clamp(26px, 6dvh, 46px) !important;
      }
      #kidActivityWrap #nextQBtn {
        flex: 0 0 auto;
        font-size: clamp(13px, 3dvh, 20px);
        padding: clamp(8px, 1.6dvh, 14px) clamp(16px, 3vw, 26px);
        margin-top: 2px; border-radius: 100px;
      }

      /* ── STORY layout — three balanced zones, no scroll ── */
      #kidActivityWrap #tab-story {
        align-items: center; justify-content: flex-start;
        gap: clamp(6px, 1.5dvh, 14px);
        text-align: center; padding: clamp(4px, 1dvh, 10px) 0 0;
      }
      /* ZONE 1: stage — story emoji, compact so text gets more room */
      #kidActivityWrap .story-illustration {
        flex: 0 0 auto;
        font-size: clamp(36px, 9dvh, 68px); line-height: 1;
      }
      /* ZONE 2: prompt — auto-scales to fill remaining space, NO scroll ever */
      #kidActivityWrap #storyText {
        flex: 1; min-height: 0; overflow: hidden;
        font-size: clamp(11px, 2.6dvh, 20px);
        line-height: 1.45; text-align: center;
        padding: 0 4px; width: 100%;
      }
      /* Strip any left-align or list-indent the subject config may have set */
      #kidActivityWrap #storyText p,
      #kidActivityWrap #storyText ul,
      #kidActivityWrap #storyText li { text-align: center; list-style: none; padding: 0; margin: 0; }
      /* ZONE 3: actions */
      #kidActivityWrap .story-actions {
        flex: 0 0 auto;
        display: flex; gap: 12px;
        flex-wrap: wrap; justify-content: center; align-items: center;
        padding-bottom: clamp(4px, 1dvh, 10px);
      }
      #kidActivityWrap .story-actions button {
        font-family: 'Fredoka', sans-serif;
        font-size: clamp(14px, 3.2dvh, 22px); font-weight: 700;
        padding: clamp(10px, 1.8dvh, 16px) clamp(18px, 4vw, 32px);
        border-radius: 100px;
      }

      /* ── DONE / celebration screen ── */
      #kidDoneScreen {
        display: none; flex: 1; flex-direction: column;
        align-items: center; justify-content: center;
        gap: clamp(14px, 3dvh, 28px); padding: 28px; text-align: center;
      }
      .kid-done-emoji {
        font-size: clamp(72px, 18dvh, 130px); line-height: 1;
      }
      .kid-done-label {
        font-family: 'Fredoka', sans-serif;
        font-size: clamp(20px, 4.5dvh, 34px);
        font-weight: 700; color: var(--amber); margin: 0;
      }
      .kid-done-actions {
        display: flex; gap: 16px; align-items: center; justify-content: center; flex-wrap: wrap;
      }
      /* Giant → for "next item" — thumb-reachable, honey-colored */
      .kid-next-item-btn {
        font-size: clamp(30px, 7dvh, 52px); font-weight: 700; line-height: 1;
        background: var(--honey); border: none; border-radius: 50%; color: white;
        width: clamp(70px, 15dvh, 104px); height: clamp(70px, 15dvh, 104px);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .18s;
        box-shadow: 0 6px 24px rgba(200,120,20,.4);
        -webkit-user-select: none; user-select: none;
      }
      .kid-next-item-btn:active { transform: scale(0.93); }
      /* Smaller exit button for last-item screen */
      .kid-done-exit-btn {
        font-family: 'Fredoka', sans-serif;
        font-size: clamp(15px, 3.5dvh, 22px); font-weight: 700;
        background: var(--honey-pale); color: var(--amber);
        border: 2px solid var(--honey-light); border-radius: 100px;
        padding: clamp(10px, 2dvh, 14px) clamp(22px, 4vw, 36px);
        cursor: pointer; transition: all .18s;
      }
      .kid-done-exit-btn:hover { background: var(--honey-light); }

      /* ── Nav bar: ← dots → (cards step only) ── */
      #kidNavBar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 18px; flex-shrink: 0;
        background: var(--cream); border-top: 2px solid var(--comb);
      }
      .kid-arrow {
        font-size: clamp(24px, 6vw, 32px); font-weight: 700; line-height: 1;
        background: var(--honey-pale); border: 3px solid var(--honey-light);
        border-radius: 50%;
        width:  clamp(54px, 13vw, 70px);
        height: clamp(54px, 13vw, 70px);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .18s; flex-shrink: 0;
        -webkit-user-select: none; user-select: none;
      }
      .kid-arrow:disabled { opacity: .3; cursor: default; }
      .kid-arrow:not(:disabled):active { transform: scale(0.91); background: var(--honey-light); }
      .kid-step-dots { display: flex; gap: 10px; align-items: center; }
      .kid-dot {
        width: 12px; height: 12px; border-radius: 50%;
        background: var(--comb); transition: all .3s;
      }
      .kid-dot.active { background: var(--honey); transform: scale(1.4); box-shadow: 0 0 0 3px rgba(245,166,35,.25); }
      .kid-dot.done   { background: var(--leaf); }

      /* ── Hint toast ── */
      #kidHint {
        position: fixed; bottom: 110px; left: 50%; transform: translateX(-50%);
        background: rgba(58,42,10,.88); color: white;
        padding: 10px 22px; border-radius: 100px;
        font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 700;
        z-index: 10000; opacity: 0; transition: opacity .35s;
        pointer-events: none; white-space: nowrap;
      }
      #kidHint.visible { opacity: 1; }

      /* ── Hand-to-child button (parent nav, injected) ── */
      .hand-to-child-btn {
        display: flex; align-items: center; gap: 6px;
        background: var(--honey); border: none; border-radius: 100px;
        padding: 8px 16px;
        font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 700;
        color: white; cursor: pointer; transition: all .18s;
        box-shadow: 0 3px 12px rgba(200,120,20,.25); white-space: nowrap;
      }
      .hand-to-child-btn:hover { background: var(--honey-deep); transform: translateY(-1px); }
    `;
    document.head.appendChild(style);

    // ── KID MODE OVERLAY HTML ──
    const km = document.createElement('div');
    km.id = 'kidMode';
    km.setAttribute('role', 'dialog');
    km.setAttribute('aria-modal', 'true');
    km.setAttribute('aria-label', 'Kid mode');
    km.innerHTML = `
      <div id="kidBg" aria-hidden="true">
        <div id="kidBgDrip"></div>
        <div id="kidBgHive"></div>
        <div class="kid-bg-bee kid-bee-1"></div>
        <div class="kid-bg-bee kid-bee-2"></div>
        <div class="kid-bg-bee kid-bee-3"></div>
        <div id="kidBgGround"></div>
      </div>
      <div id="kidHeader">
        <button id="kidLockBtn" aria-label="Hold 3 seconds to exit kid mode">🔒</button>
        <div id="kidProgressPlaceholder" aria-hidden="true"></div>
      </div>
      <div id="kidActivityWrap" aria-live="polite"></div>
      <div id="kidDoneScreen">
        <div class="kid-done-emoji" id="kidDoneEmoji">🎉</div>
        <p class="kid-done-label" id="kidDoneLabel">Well done!</p>
        <div class="kid-done-actions">
          <button class="kid-next-item-btn" id="kidNextItemBtn" aria-label="Next">→</button>
          <button class="kid-done-exit-btn" id="kidDoneExitBtn">✅ All done</button>
        </div>
      </div>
      <div id="kidNavBar">
        <button class="kid-arrow" id="kidBackBtn" aria-label="Previous card">←</button>
        <div class="kid-step-dots" aria-hidden="true">
          <span class="kid-dot" id="kidDot0"></span>
          <span class="kid-dot" id="kidDot1"></span>
          <span class="kid-dot" id="kidDot2"></span>
        </div>
        <button class="kid-arrow" id="kidFwdBtn" aria-label="Next card">→</button>
      </div>
      <div id="kidBuzz" role="button" tabindex="0" aria-label="Buzz says hi — tap me!"></div>
    `;
    document.body.appendChild(km);

    // ── Buzz — front-facing bee SVG ──
    document.getElementById('kidBuzz').innerHTML =
      "<svg viewBox='0 0 58 66' xmlns='http://www.w3.org/2000/svg'>" +
        // Wings (behind body, slight transparency)
        "<ellipse cx='12' cy='34' rx='12' ry='7.5' transform='rotate(-22 12 34)' fill='rgba(235,248,255,.88)' stroke='#C8A820' stroke-width='.7'/>" +
        "<ellipse cx='46' cy='34' rx='12' ry='7.5' transform='rotate(22 46 34)' fill='rgba(235,248,255,.88)' stroke='#C8A820' stroke-width='.7'/>" +
        // Body
        "<ellipse cx='29' cy='48' rx='12' ry='16' fill='#F5C823'/>" +
        "<path d='M17.5,44 Q29,47 40.5,44 L40.5,51 Q29,54 17.5,51 Z' fill='#2A1A05'/>" +
        "<path d='M18.5,55 Q29,58 39.5,55 L39,61 Q29,64 19,61 Z' fill='#2A1A05'/>" +
        // Head
        "<circle cx='29' cy='22' r='15' fill='#F5C823'/>" +
        // Antennae
        "<line x1='24' y1='10' x2='17' y2='3' stroke='#2A1A05' stroke-width='1.6' stroke-linecap='round'/>" +
        "<line x1='34' y1='10' x2='41' y2='3' stroke='#2A1A05' stroke-width='1.6' stroke-linecap='round'/>" +
        "<circle cx='16.5' cy='2.5' r='2.6' fill='#F5C823' stroke='#2A1A05' stroke-width='1.2'/>" +
        "<circle cx='41.5' cy='2.5' r='2.6' fill='#F5C823' stroke='#2A1A05' stroke-width='1.2'/>" +
        // Eyes
        "<circle cx='22' cy='20' r='5.5' fill='white'/>" +
        "<circle cx='36' cy='20' r='5.5' fill='white'/>" +
        "<circle cx='23' cy='20' r='3.2' fill='#1A0A00'/>" +
        "<circle cx='37' cy='20' r='3.2' fill='#1A0A00'/>" +
        "<circle cx='23.8' cy='18.8' r='1.1' fill='white'/>" +
        "<circle cx='37.8' cy='18.8' r='1.1' fill='white'/>" +
        // Smile
        "<path d='M23,28 Q29,33.5 35,28' stroke='#2A1A05' stroke-width='2' fill='none' stroke-linecap='round'/>" +
        // Cheek blush
        "<ellipse cx='16' cy='26' rx='4' ry='2.5' fill='rgba(255,110,110,.22)'/>" +
        "<ellipse cx='42' cy='26' rx='4' ry='2.5' fill='rgba(255,110,110,.22)'/>" +
      "</svg>";

    // ── WORLD SVGs ──
    document.getElementById('kidBgDrip').innerHTML =
      "<svg viewBox='0 0 400 32' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'>" +
        "<rect x='0' y='0' width='400' height='10' fill='#F5A623'/>" +
        "<path d='M76,10 L76,19 Q76,30 80,30 Q84,30 84,19 L84,10 Z' fill='#F5A623'/>" +
        "<path d='M216,10 L216,22 Q216,32 220,32 Q224,32 224,22 L224,10 Z' fill='#F5A623'/>" +
        "<path d='M336,10 L336,17 Q336,26 340,26 Q344,26 344,17 L344,10 Z' fill='#F5A623'/>" +
      "</svg>";

    document.getElementById('kidBgHive').innerHTML =
      "<svg viewBox='0 0 88 112' width='68' height='86' xmlns='http://www.w3.org/2000/svg'>" +
        "<rect x='40' y='0' width='8' height='22' rx='3' fill='#8B6A3E'/>" +
        "<ellipse cx='26' cy='8' rx='14' ry='5' fill='#5A9A2A' transform='rotate(-25,26,8)'/>" +
        "<ellipse cx='62' cy='13' rx='12' ry='4.5' fill='#4A8A20' transform='rotate(22,62,13)'/>" +
        "<path d='M44,22 Q44,30 44,32' stroke='#C8901A' stroke-width='2' fill='none'/>" +
        "<path d='M16,108 Q16,58 24,38 Q32,20 44,18 Q56,20 64,38 Q72,58 72,108 Z' fill='#F5A623'/>" +
        "<ellipse cx='44' cy='100' rx='28' ry='5.5' fill='none' stroke='#B87010' stroke-width='1.2' opacity='.5'/>" +
        "<ellipse cx='44' cy='90'  rx='26' ry='5'   fill='none' stroke='#B87010' stroke-width='1.2' opacity='.5'/>" +
        "<ellipse cx='44' cy='80'  rx='23' ry='4.5' fill='none' stroke='#B87010' stroke-width='1.2' opacity='.5'/>" +
        "<ellipse cx='44' cy='70'  rx='19' ry='4'   fill='none' stroke='#B87010' stroke-width='1.2' opacity='.5'/>" +
        "<ellipse cx='44' cy='61'  rx='15' ry='3.5' fill='none' stroke='#B87010' stroke-width='1.2' opacity='.5'/>" +
        "<ellipse cx='44' cy='53'  rx='11' ry='3'   fill='none' stroke='#B87010' stroke-width='1.2' opacity='.5'/>" +
        "<ellipse cx='44' cy='46'  rx='7'  ry='2.5' fill='none' stroke='#B87010' stroke-width='1.2' opacity='.5'/>" +
        "<ellipse cx='44' cy='107' rx='29' ry='6' fill='#D4780A'/>" +
        "<ellipse cx='44' cy='95'  rx='10' ry='6' fill='#1A0A00'/>" +
        "<ellipse cx='44' cy='95'  rx='13' ry='8' fill='none' stroke='#F5C823' stroke-width='1.5' opacity='.4'/>" +
      "</svg>";

    const _beeSVG =
      "<svg viewBox='0 0 36 24' width='28' height='18' xmlns='http://www.w3.org/2000/svg' style='overflow:visible'>" +
        "<ellipse cx='13' cy='8' rx='11' ry='5' fill='rgba(255,255,255,0.7)' stroke='#d4b040' stroke-width='0.6'/>" +
        "<ellipse cx='23' cy='8' rx='11' ry='5' fill='rgba(255,255,255,0.7)' stroke='#d4b040' stroke-width='0.6'/>" +
        "<ellipse cx='18' cy='16' rx='11' ry='7' fill='#F5C823'/>" +
        "<path d='M8,16 Q18,14 28,16 M8,19 Q18,17 28,19' stroke='#2A1A05' stroke-width='2.5' fill='none'/>" +
        "<circle cx='18' cy='7' r='5.5' fill='#F5C823'/>" +
        "<circle cx='16' cy='6' r='1.3' fill='#2A1A05'/><circle cx='20' cy='6' r='1.3' fill='#2A1A05'/>" +
        "<path d='M15,3 Q11,0 10,-1 M21,3 Q25,0 26,-1' stroke='#2A1A05' stroke-width='1.2' fill='none'/>" +
        "<circle cx='10' cy='-1' r='1.3' fill='#2A1A05'/><circle cx='26' cy='-1' r='1.3' fill='#2A1A05'/>" +
      "</svg>";
    document.querySelectorAll('.kid-bg-bee').forEach(el => { el.innerHTML = _beeSVG; });

    document.getElementById('kidBgGround').innerHTML =
      "<svg viewBox='0 0 1000 80' width='100%' height='80' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'>" +
        "<path d='M0,45 C120,18 250,62 400,32 C540,8 660,55 800,28 C900,10 960,42 1000,22 L1000,80 L0,80 Z' fill='#88C03A'/>" +
        "<path d='M0,62 C100,38 220,72 360,52 C480,34 600,68 740,50 C850,34 940,60 1000,44 L1000,80 L0,80 Z' fill='#5A9020'/>" +
        "<g transform='translate(140,40)'>" +
          "<line x1='0' y1='6' x2='0' y2='22' stroke='#3A8020' stroke-width='2.5'/>" +
          "<circle cx='-5' cy='-3' r='4.5' fill='#FF8C00'/><circle cx='5' cy='-3' r='4.5' fill='#FF8C00'/>" +
          "<circle cx='0' cy='-8' r='4.5' fill='#FF8C00'/><circle cx='-4' cy='5' r='4' fill='#FF8C00'/><circle cx='4' cy='5' r='4' fill='#FF8C00'/>" +
          "<circle cx='0' cy='0' r='5.5' fill='#FFD700'/>" +
        "</g>" +
        "<g transform='translate(490,32)'>" +
          "<line x1='0' y1='5' x2='-2' y2='20' stroke='#3A8020' stroke-width='2'/>" +
          "<circle cx='-5' cy='-3' r='3.8' fill='#FF1493'/><circle cx='5' cy='-3' r='3.8' fill='#FF1493'/>" +
          "<circle cx='0' cy='-7' r='3.8' fill='#FF1493'/><circle cx='-4' cy='4' r='3.5' fill='#FF1493'/><circle cx='4' cy='4' r='3.5' fill='#FF1493'/>" +
          "<circle cx='0' cy='0' r='5' fill='#FF69B4'/>" +
        "</g>" +
        "<g transform='translate(810,44)'>" +
          "<line x1='0' y1='5' x2='2' y2='18' stroke='#3A8020' stroke-width='2'/>" +
          "<circle cx='-5' cy='-3' r='3.8' fill='#9B0090'/><circle cx='5' cy='-3' r='3.8' fill='#9B0090'/>" +
          "<circle cx='0' cy='-7' r='3.8' fill='#9B0090'/><circle cx='-4' cy='4' r='3.5' fill='#9B0090'/><circle cx='4' cy='4' r='3.5' fill='#9B0090'/>" +
          "<circle cx='0' cy='0' r='5' fill='#DA70D6'/>" +
        "</g>" +
      "</svg>";

    // ── Buzz tap event ──
    const _buzz = document.getElementById('kidBuzz');
    _buzz.addEventListener('click', kidBuzzTap);
    _buzz.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kidBuzzTap(); } });

    // ── HINT TOAST ──
    const hint = document.createElement('div');
    hint.id = 'kidHint';
    hint.setAttribute('aria-live', 'assertive');
    hint.setAttribute('aria-atomic', 'true');
    document.body.appendChild(hint);

    // ── HAND-TO-CHILD BUTTON in parent nav ──
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
      const htcBtn = document.createElement('button');
      htcBtn.className = 'hand-to-child-btn';
      htcBtn.textContent = '🧒 Hand to child';
      htcBtn.onclick = enterKidMode;
      navRight.insertBefore(htcBtn, navRight.firstChild);
    }

    // ── EVENT WIRING ──
    document.getElementById('kidLockBtn').addEventListener('pointerdown',  kidLockStart);
    document.getElementById('kidLockBtn').addEventListener('pointerup',    kidLockEnd);
    document.getElementById('kidLockBtn').addEventListener('pointerleave', kidLockEnd);
    document.getElementById('kidLockBtn').addEventListener('pointercancel',kidLockEnd);
    document.getElementById('kidBackBtn').addEventListener('click', kidBack);
    document.getElementById('kidFwdBtn').addEventListener('click',  kidAdvance);
    document.getElementById('kidNextItemBtn').addEventListener('click', kidNextItem);
    document.getElementById('kidDoneExitBtn').addEventListener('click', exitKidMode);
  }

  // ── GLOBAL HANDLERS (inline onclick in HTML) ──
  window.setStage      = setStage;
  window.switchTab     = switchTab;
  window.flipCard      = flipCard;
  window.prevCard      = prevCard;
  window.nextCard      = nextCard;
  window.nextQuestion  = nextQuestion;
  window.listenStory   = listenStory;
  window.finishStory   = finishStory;
  window.printWorksheet= printWorksheet;
  window.printPack     = printPack;
  window.handleKey     = handleKey;
  window.autoResize    = autoResize;
  window.toggleVoice   = toggleVoice;
  window.sendMessage   = sendMessage;
  window.closeModal    = closeModal;
  window.nextItem      = nextItem;
  // Kid mode (also wired via addEventListener in injectKidModeDom, exposed here for completeness)
  window.enterKidMode  = enterKidMode;
  window.exitKidMode   = exitKidMode;
  window.kidAdvance    = kidAdvance;
  window.kidBack       = kidBack;
  window.kidNextItem   = kidNextItem;
}
