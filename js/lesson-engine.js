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

  // ── STATE ──
  let currentKey   = config.items[0];
  let currentCard  = 0, currentQuestion = 0, answered = false, wrongAttempts = 0;
  let isTyping = false, isListening = false, recognition = null, quizSet = [];
  let chatHistory  = [];
  let seenCards = new Set(), answeredQuestions = new Set(), storyDone = false, completionShown = false;

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.theme = currentTheme;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.getElementById('chatInput').placeholder = t('chatPlaceholder');
    if (_params.get('preview') === '1') {
      document.body.classList.add('preview-mode');
      document.querySelectorAll('.stage-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.stage === currentStage));
    }
    buildItemStrip();
    loadItem(config.items[0]);
    window.onbeforeprint = buildWorksheet;
  });

  // ── ITEM STRIP ──
  function buildItemStrip() {
    const strip = document.getElementById('itemStrip');
    strip.innerHTML = '';
    config.items.forEach(key => {
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
    const i = config.items.indexOf(currentKey);
    if (i < config.items.length - 1) loadItem(config.items[i + 1]);
  }

  // ── STAGE ──
  function setStage(stage, btn) {
    document.querySelectorAll('.stage-tab').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
    currentStage = stage;
    completionShown = false;
    applyStage(stage);
    buildQuizData(); renderQuiz(); updateCard(); buildWorksheet(); loadProgress();
  }

  function applyStage(stage) {
    const s = config.stages[stage];
    document.getElementById('stageBadge').textContent       = s.label;
    document.getElementById('ageBadge').textContent         = s.age;
    document.getElementById('itemBadge').textContent        = config.getItemBadge(currentKey);
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
    document.getElementById('cardEmoji').textContent   = rendered.emoji;
    document.getElementById('cardWord').textContent    = rendered.label;
    document.getElementById('cardBackText').innerHTML  = rendered.backHtml;
    document.getElementById('cardCounter').textContent = (currentCard + 1) + ' / ' + cards.length;
    document.getElementById('flashcard').classList.remove('flipped');
  }

  function flipCard() { document.getElementById('flashcard').classList.toggle('flipped'); }

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
    document.getElementById('quizImage').textContent = q.image;
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

  function nextQuestion() { currentQuestion++; renderQuiz(); }

  // ── STORY ──
  function listenStory() {
    const text = (document.getElementById('storyText').innerText || '').trim();
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US'; utter.rate = 0.9;
    const btn = document.getElementById('listenBtn');
    if (btn) { btn.classList.add('speaking'); btn.textContent = t('listenSpeaking'); }
    utter.onend = utter.onerror = () => { if (btn) { btn.classList.remove('speaking'); btn.textContent = t('listenBtn'); } };
    window.speechSynthesis.speak(utter);
    storyDone = true;
    recomputeProgress();
  }

  function finishStory() { storyDone = true; recomputeProgress(); }

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
    document.getElementById('modalSubtitle').innerHTML =
      `You finished ${config.getItemDisplayName(currentKey)}!<br>Buzz the Bee is so proud of you!`;
    document.getElementById('completionModal').classList.add('visible');
    document.getElementById('key-' + currentKey)?.classList.add('done');
    saveProgress(true);
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
    document.getElementById('print-worksheet').innerHTML =
      config.items.map((key, i) =>
        config.renderWorksheet(key, currentStage, i === config.items.length - 1)
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
}
