const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system, messages } = req.body;

  const payload = JSON.stringify({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    system,
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
