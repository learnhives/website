const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Verify the bearer token and return the authenticated user, or null.
// Uses the anon key + user JWT so Supabase validates the token server-side —
// we never trust userId or email values sent by the browser.
async function getAuthenticatedUser(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;

  const token = auth.slice(7);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Reject the request if the JWT is missing or invalid
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Use server-verified identity — ignore any userId/email in the request body
  const userId = user.id;
  const email = user.email;

  const { priceId } = req.body;
  if (!priceId || typeof priceId !== 'string') {
    return res.status(400).json({ error: 'priceId is required' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 30,
        metadata: { userId },
      },
      success_url: 'https://www.learnhives.com/app/dashboard.html?subscribed=true',
      cancel_url: 'https://www.learnhives.com/app/pricing.html',
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
};
