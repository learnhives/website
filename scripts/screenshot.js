// Usage: node scripts/screenshot.js app/lesson-numbers.html [more pages...]
// Serves the project locally, screenshots each page at 3 widths (full page),
// plus the Quiz tab and Kid Mode if present. Output: screenshots/<page-name>/<width>-<view>.png
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8080;
const ROOT = path.resolve(__dirname, '..');
const WIDTHS = [
  { w: 390, h: 844 },   // phone
  { w: 820, h: 1180 },  // iPad
  { w: 1280, h: 800 },  // laptop
];

async function waitForServer(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok || r.status === 404) return; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('Local server did not start');
}

async function shoot(page, file, fullPage = true) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.screenshot({ path: file, fullPage });
  console.log('    saved', path.relative(ROOT, file), fullPage ? '(full page)' : '(viewport)');
}

// Click a control if it exists and is visible; log what happened. Returns true on a real click.
async function tryClick(label, locator) {
  try {
    if (!(await locator.count())) { console.log(`    [skip] ${label}: not found`); return false; }
    if (!(await locator.first().isVisible())) { console.log(`    [skip] ${label}: found but not visible`); return false; }
    await locator.first().click({ timeout: 3000 });
    console.log(`    [click] ${label}`);
    return true;
  } catch (e) {
    console.log(`    [FAIL] ${label}: ${e.message.split('\n')[0]}`);
    return false;
  }
}

(async () => {
  const pages = process.argv.slice(2);
  if (!pages.length) { console.error('Usage: node scripts/screenshot.js <page.html> [...]'); process.exit(1); }

  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  const browser = await chromium.launch();
  try {
    await waitForServer(`http://127.0.0.1:${PORT}/`);
    for (const p of pages) {
      const name = path.basename(p, path.extname(p));
      const outDir = path.join(ROOT, 'screenshots', name);
      console.log(p);
      for (const { w, h } of WIDTHS) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h } });
        const page = await ctx.newPage();
        await page.goto(`http://127.0.0.1:${PORT}/${p}`, { waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(800);
        console.log(`  width ${w}`);
        await shoot(page, path.join(outDir, `${w}-main.png`));

        // Parent view: Quiz tab. Check the tab really became active, not just that the click ran.
        const quizTab = page.locator('.activity-tab', { hasText: 'Quiz' });
        if (await tryClick('Quiz tab', quizTab)) {
          await page.waitForTimeout(500);
          const active = await quizTab.first().evaluate(el => el.classList.contains('active'));
          console.log(`    quiz tab active after click: ${active}`);
          await shoot(page, path.join(outDir, `${w}-quiz.png`));
        }

        // Kid Mode: viewport only (what a child sees). Cards step, then forward to the quiz step.
        if (await tryClick('Hand to child button', page.locator('.hand-to-child-btn'))) {
          await page.waitForTimeout(800);
          await shoot(page, path.join(outDir, `${w}-kidmode.png`), false);
          if (await tryClick('Kid Mode forward arrow (#kidFwdBtn)', page.locator('#kidFwdBtn'))) {
            await page.waitForTimeout(800);
            const step = await page.evaluate(() => document.getElementById('kidMode')?.dataset.step);
            console.log(`    kid step after forward: ${step}`);
            if (step === 'quiz') await shoot(page, path.join(outDir, `${w}-kidmode-quiz.png`), false);
            else console.log('    [skip] kid quiz shot: not on the quiz step');
          }
        }
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
    server.kill();
  }
})().catch(e => { console.error(e); process.exit(1); });
