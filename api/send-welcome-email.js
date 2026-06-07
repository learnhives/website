const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'valid email is required' });
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
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ id: data.id });
  } catch (err) {
    console.error('Send welcome email error:', err);
    res.status(500).json({ error: err.message });
  }
};

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
                          <div style="font-size:13px;color:#666666;line-height:1.4;">Four bee characters cover Letters, Numbers, Colors, and Nature — each topic taught with warmth and wonder.</div>
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
