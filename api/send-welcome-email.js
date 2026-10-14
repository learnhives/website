const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

const resend = new Resend(process.env.RESEND_API_KEY);

// Admin client: the service role key is the only way to write app_metadata, which the
// browser cannot change. Used only to record that the welcome email was sent.
const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Accounts older than this never get a welcome email. This stops accounts that were created
// before the once-only marker existed (and already received the email at sign-up) from
// getting a second one.
const WELCOME_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

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

  // Use the server-verified identity only. Any email or name in the request body is ignored,
  // so this endpoint can only ever email the signed-in user's own address.
  const email = user.email;
  if (!email) {
    return res.status(400).json({ error: 'account has no email address' });
  }
  const name = user.user_metadata?.full_name;

  // Once per account: skip if already sent, or if the account is too old to be a new sign-up.
  if (user.app_metadata?.welcome_email_sent_at) {
    return res.status(200).json({ skipped: 'already sent' });
  }
  if (Date.now() - new Date(user.created_at).getTime() > WELCOME_WINDOW_MS) {
    return res.status(200).json({ skipped: 'not a new account' });
  }

  // Claim the marker BEFORE sending so two quick calls do not both send.
  const claimedAt = new Date().toISOString();
  const { error: claimError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, welcome_email_sent_at: claimedAt },
  });
  if (claimError) {
    console.error('Welcome email: could not record marker:', claimError.message);
    return res.status(500).json({ error: 'could not send' });
  }

  const rawFirst = (name || 'there').split(' ')[0].slice(0, 50);
  const firstName = escapeHtml(rawFirst);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Buzz from LearnHives <hello@learnhives.com>',
      to: [email],
      subject: '🐝 Welcome to LearnHives — your hive is ready!',
      html: buildEmail(firstName),
    });

    if (error) {
      console.error('Resend error:', error);
      await releaseMarker(user);
      return res.status(500).json({ error: 'could not send' });
    }

    res.status(200).json({ id: data.id });
  } catch (err) {
    console.error('Send welcome email error:', err);
    await releaseMarker(user);
    res.status(500).json({ error: 'could not send' });
  }
};

// If sending failed, clear the marker so a later dashboard visit can try again.
async function releaseMarker(user) {
  try {
    // app_metadata keys are merged, so a null value removes the key
    await admin.auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, welcome_email_sent_at: null } });
  } catch (e) {
    console.error('Welcome email: could not clear marker:', e.message);
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function buildEmail(firstName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to LearnHives!</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF8E7;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8E7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#F5A623;padding:36px 40px;text-align:center;">
              <div style="font-size:48px;line-height:1;">🐝</div>
              <div style="font-size:28px;font-weight:900;color:#ffffff;margin-top:8px;letter-spacing:-0.5px;">LearnHives</div>
              <div style="font-size:14px;color:rgba(255,255,255,0.85);margin-top:4px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Where little learners bloom</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1a1a2e;">
                Hi ${firstName}! 👋
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#444444;line-height:1.6;">
                Welcome to the hive! I'm <strong>Buzz</strong>, and I'm so excited to be your little one's learning companion. We've been busy building something special just for curious preschool minds — and now your family is part of it. 🍯
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#F5A623;border-radius:50px;">
                    <a href="https://learnhives.com/app/dashboard.html"
                       style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                      🚀 Go to your dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Features -->
              <p style="margin:0 0 16px;font-size:14px;font-weight:800;color:#888888;text-transform:uppercase;letter-spacing:1px;">What's waiting for you</p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 16px;background:#FFF8E7;border-radius:12px;margin-bottom:10px;display:block;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:28px;padding-right:14px;vertical-align:middle;">🐝</td>
                        <td style="vertical-align:middle;">
                          <div style="font-size:15px;font-weight:800;color:#1a1a2e;margin-bottom:2px;">Meet Buzz & Friends</div>
                          <div style="font-size:13px;color:#666666;line-height:1.4;">Buzz guides your little one through letters, numbers, colours, animals and more — each lesson taught with warmth and wonder.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <div style="height:8px;"></div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 16px;background:#FFF8E7;border-radius:12px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:28px;padding-right:14px;vertical-align:middle;">🎯</td>
                        <td style="vertical-align:middle;">
                          <div style="font-size:15px;font-weight:800;color:#1a1a2e;margin-bottom:2px;">Activities Made for 2–6 Year Olds</div>
                          <div style="font-size:13px;color:#666666;line-height:1.4;">Short, playful sessions designed for tiny attention spans — learning disguised as pure fun.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <div style="height:8px;"></div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 16px;background:#FFF8E7;border-radius:12px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:28px;padding-right:14px;vertical-align:middle;">📊</td>
                        <td style="vertical-align:middle;">
                          <div style="font-size:15px;font-weight:800;color:#1a1a2e;margin-bottom:2px;">See Your Child Grow</div>
                          <div style="font-size:13px;color:#666666;line-height:1.4;">Track progress across subjects and celebrate every milestone together from your parent dashboard.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="height:32px;"></div>
              <p style="margin:0;font-size:15px;color:#444444;line-height:1.6;">
                Have questions? Just reply to this email — we read every message and genuinely love hearing from families. 💛
              </p>
              <p style="margin:16px 0 0;font-size:15px;color:#444444;">
                Buzz-tastically yours,<br />
                <strong style="color:#1a1a2e;">Buzz 🐝 &amp; the LearnHives team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#FFF8E7;border-top:1px solid #F0E6CC;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999999;line-height:1.6;">
                🐝 LearnHives · <a href="https://learnhives.com" style="color:#F5A623;text-decoration:none;">learnhives.com</a><br />
                You're receiving this because you created an account. No spam — ever.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
