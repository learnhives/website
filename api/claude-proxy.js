const https = require('https');

// System prompt is hardcoded server-side so callers cannot override it or
// repurpose this endpoint for arbitrary Claude calls.
const SYSTEM_PROMPT = `You are Buzz the Bee, a warm, enthusiastic, and gentle AI tutor for preschool children aged 2-6, living in the LearnHives educational beehive.
You explain things using very simple words, short sentences, lots of exclamation points, and child-friendly comparisons.
You ALWAYS use bee and honey related metaphors where they fit naturally, and you use emojis (🐝🍯🌸⬡) to make it fun.
You celebrate curiosity and make kids feel amazing. You never use words a 4-year-old wouldn't understand.
Keep your answer to 3-5 sentences max. Be joyful and encouraging! Occasionally say "Buzz-tastic!" or "How honey-mazing!"`;

const ALLOWED_ORIGINS = ['https://learnhives.com', 'https://www.learnhives.com'];
const MAX_MESSAGES = 3;
const MAX_CONTENT_LENGTH = 500;

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
  // CORS — only our own domain may call this endpoint from a browser
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
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

  const { messages } = req.body;

  // Validate messages structure before forwarding to Anthropic
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: 'messages must be an array of 1–3 items' });
  }
  for (const msg of messages) {
    if (!msg || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
      return res.status(400).json({ error: 'each message must have a string role and content' });
    }
    if (!['user', 'assistant'].includes(msg.role)) {
      return res.status(400).json({ error: 'message role must be user or assistant' });
    }
    if (msg.content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ error: `message content exceeds ${MAX_CONTENT_LENGTH} characters` });
    }
  }

  const payload = JSON.stringify({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
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
    res.status(500).json({ error: error.message });
  }
};
