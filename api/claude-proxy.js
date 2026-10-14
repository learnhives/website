const https = require('https');

// Nothing the browser sends is ever used as a prompt. The browser may only pick
// from the fixed requests below; this server holds every prompt. This keeps the
// endpoint from being used to send a child's (or anyone's) own text to Anthropic.
// See docs/LEGAL-REQUIREMENTS.md (C20, C21, C23).
const SYSTEM_PROMPT = `You are Buzz the Bee, a warm, enthusiastic, and gentle AI tutor for preschool children aged 2-6, living in the LearnHives educational beehive.
You explain things using very simple words and child-friendly comparisons.
You use bee and honey metaphors where they fit naturally, and a few emojis (🐝🍯🌸).
You celebrate curiosity and always make the child feel good. You never use words a 4-year-old wouldn't understand.
Rules you must always follow:
- Never ask for, repeat or guess the child's name, school, location or any personal detail.
- Always be kind. Never correct the child harshly.
- Nothing scary. No hunting, killing or eating-prey wording for any animal.
- Use British English (colour, favourite, jumper).
- Reply in 1 or 2 short sentences. No markdown.`;

const STAGE_STYLE = {
  seedling: 'The child is 2-3 years old: use only very simple words and one idea.',
  sprout:   'The child is 3-4 years old: use simple words and short sentences.',
  blossom:  'The child is 4-5 years old: simple words, one small new idea.',
  bloom:    'The child is 5-6 years old: simple words, you may add one small challenge.'
};
const DEFAULT_STAGE = 'sprout';

// Landing-page demo: five fixed topics, chosen by key.
const DEMO_PROMPTS = {
  'letter-b': 'What is the letter B? Explain it like I am a 4 year old bee lover.',
  'number-5': 'What is the number 5? Explain it like I am a 4 year old bee lover.',
  'yellow':   'What is the colour yellow? Explain it like I am a 4 year old bee lover.',
  'bees':     'Tell me about bees and how they make honey, for a 4 year old.',
  'flowers':  'What is a flower? Explain it for a 4 year old who loves bees.'
};

// Lesson chips. `item` is validated below (short, plain characters only).
const CHIP_PROMPTS = {
  count: item => `Help this child understand the quantity or meaning of "${item}". Be playful and encouraging.`,
  sound: item => `Say the sound or name of "${item}" and give one example for a young child.`,
  fact:  item => `Share one amazing fun fact about "${item}". Be excited and playful.`
};

const ITEM_PATTERN = /^[\p{L}\p{N} '-]{1,30}$/u;

// Production site and this project's Vercel preview deployments only
// (project "website", team "learn-hives-projects").
const ALLOWED_ORIGINS = ['https://learnhives.com', 'https://www.learnhives.com'];
const PREVIEW_ORIGIN = /^https:\/\/website-[a-z0-9-]+-learn-hives-projects\.vercel\.app$/;
const MAX_TOKENS = 150;

// Turn a request body into a prompt, or return null if it is not one of the two allowed shapes.
function buildRequest(body) {
  if (!body || typeof body !== 'object') return null;
  if (body.kind === 'demo') {
    const prompt = typeof body.topic === 'string' && Object.hasOwn(DEMO_PROMPTS, body.topic) ? DEMO_PROMPTS[body.topic] : null;
    return prompt ? { prompt, stage: DEFAULT_STAGE } : null;
  }
  if (body.kind === 'chip') {
    const { chip, item, stage } = body;
    if (typeof chip !== 'string' || !Object.hasOwn(CHIP_PROMPTS, chip)) return null;
    if (typeof stage !== 'string' || !Object.hasOwn(STAGE_STYLE, stage)) return null;
    if (typeof item !== 'string' || !ITEM_PATTERN.test(item)) return null;
    return { prompt: CHIP_PROMPTS[chip](item.trim()), stage };
  }
  return null;
}

// ── Rate limiting ────────────────────────────────────────────────────────────
// In-memory sliding window: 5 requests per IP per 60 seconds.
// Resets on cold start; sufficient to prevent casual abuse without extra infra.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now = Date.now();

  // Prune expired entries whenever the store grows large
  if (rateLimitStore.size > 500) {
    for (const [key, val] of rateLimitStore) {
      if (now > val.windowStart + RATE_WINDOW_MS) rateLimitStore.delete(key);
    }
  }

  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.windowStart + RATE_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (entry.count >= RATE_MAX) {
    const retryAfter = Math.ceil((entry.windowStart + RATE_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }
  entry.count++;
  return { allowed: true };
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return (forwarded ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress) || 'unknown';
}
// ────────────────────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  // Browser calls only: a request must carry an Origin header from our own site
  // (production or this project's Vercel previews). No Origin header = refused.
  const origin = req.headers.origin;
  if (!origin || !(ALLOWED_ORIGINS.includes(origin) || PREVIEW_ORIGIN.test(origin))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit by IP
  const ip = getClientIp(req);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    res.setHeader('Retry-After', limit.retryAfter);
    return res.status(429).json({
      error: `Too many requests. Try again in ${limit.retryAfter} seconds. 🍯`,
    });
  }

  // Only the two fixed request shapes are accepted. Any `system`, `messages` or
  // `max_tokens` sent by the browser is ignored.
  const request = buildRequest(req.body);
  if (!request) {
    return res.status(400).json({ error: 'Unsupported request' });
  }

  const payload = JSON.stringify({
    model: 'claude-opus-4-8',
    max_tokens: MAX_TOKENS,
    system: `${SYSTEM_PROMPT}\n${STAGE_STYLE[request.stage]}`,
    messages: [{ role: 'user', content: request.prompt }],
  });

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  try {
    const anthropicRes = await new Promise((resolve, reject) => {
      const proxyReq = https.request(options, (proxyRes) => {
        let body = '';
        proxyRes.on('data', (chunk) => { body += chunk; });
        proxyRes.on('end', () => resolve({ status: proxyRes.statusCode, body }));
      });
      proxyReq.on('error', reject);
      proxyReq.write(payload);
      proxyReq.end();
    });

    res.status(anthropicRes.status).json(JSON.parse(anthropicRes.body));
  } catch (error) {
    console.error('Claude proxy error:', error);
    res.status(500).json({ error: 'Buzz is resting' });
  }
};
