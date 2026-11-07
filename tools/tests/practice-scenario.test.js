const { chromium } = require('playwright');
const fs = require('fs');
const out = '/tmp/claude-0/-home-user/1e676488-d029-5546-acad-d6f90a5aa190/scratchpad/';
const file = '/home/user/TN-UOP-FIN/deliverables/wn7-practice-scenario.html';
const url = 'file://' + file;
const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
const shown = (p, id) => p.evaluate((id) => { const e = document.getElementById(id); return !!e && !e.hidden && getComputedStyle(e).display !== 'none'; }, id);
(async () => {
  const b = await chromium.launch();

  for (const vp of [{ w: 390, h: 844, n: 'mobile' }, { w: 1280, h: 900, n: 'desktop' }]) {
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h } });
    const p = await ctx.newPage();
    const requests = [];
    p.on('request', r => { if (!r.url().startsWith('file:')) requests.push(r.method() + ' ' + r.url()); });
    await p.goto(url, { waitUntil: 'networkidle' });
    const N = vp.n;
    ok(`${N}: no horizontal scroll`, await p.evaluate((w) => document.documentElement.scrollWidth <= w, vp.w));
    ok(`${N}: intro only at start`, await shown(p, 'intro') && !(await shown(p, 'm1')) && !(await shown(p, 'call')));
    ok(`${N}: progress steps 2-4 locked`, await p.evaluate(() => [...document.querySelectorAll('nav.prog button')].map(b => b.disabled).join() === 'false,true,true,true'));
    // Start via keyboard
    await p.focus('#intro [data-go="m1"]'); await p.keyboard.press('Enter');
    ok(`${N}: m1 shown with call card`, await shown(p, 'm1') && await shown(p, 'call') && !(await shown(p, 'intro')));
    ok(`${N}: focus on m1 heading`, await p.evaluate(() => document.activeElement.id === 'h-m1'));
    ok(`${N}: simulated result labelled Not eligible`, await p.evaluate(() => /Simulated result/.test(document.querySelector('.orbit').textContent) && /Not eligible/.test(document.querySelector('.orbit').textContent)));
    // Empty compare
    await p.click('[data-compare="1"]');
    ok(`${N}: empty compare prompts and keeps model hidden`, (await p.textContent('#s1')).includes('Write your answer') && !(await p.evaluate(() => document.getElementById('r1').open)));
    ok(`${N}: empty compare focuses textarea`, await p.evaluate(() => document.activeElement.id === 't1'));
    await p.keyboard.type('Symptoms match, so check. Orbit says not eligible, so no replacement.');
    await p.click('[data-compare="1"]');
    ok(`${N}: model 1 revealed`, await shown(p, 'r1') && await p.evaluate(() => document.getElementById('r1').open));
    ok(`${N}: own response echoed`, (await p.textContent('#y1')).includes('Orbit says not eligible'));
    ok(`${N}: progress step 2 unlocked`, await p.evaluate(() => !document.querySelector('nav.prog [data-go="m2"]').disabled));
    // Revise
    await p.click('[data-revise="1"]');
    ok(`${N}: revise focuses textarea, text kept`, await p.evaluate(() => document.activeElement.id === 't1' && document.activeElement.value.length > 10));
    await p.keyboard.type(' Still acknowledge impact.');
    await p.click('[data-compare="1"]');
    ok(`${N}: re-compare updates echo`, (await p.textContent('#y1')).includes('acknowledge impact'));
    if (N === 'mobile') await p.screenshot({ path: out + 'sp-m1.png', fullPage: true });
    // Moment 2
    await p.click('#r1 [data-go="m2"]');
    ok(`${N}: m2 shown, m1 hidden`, await shown(p, 'm2') && !(await shown(p, 'm1')));
    await p.fill('#t2', 'Keep troubleshooting the drops; no replacement promise.');
    await p.click('[data-compare="2"]');
    ok(`${N}: model 2 revealed`, await p.evaluate(() => document.getElementById('r2').open));
    // Back to m1 keeps text
    await p.click('#r2 [data-go="m1"]');
    ok(`${N}: back to m1 keeps answer and model`, await shown(p, 'm1') && await p.evaluate(() => document.getElementById('t1').value.includes('acknowledge') && document.getElementById('r1').open));
    // Progress nav jump to m2
    await p.click('nav.prog [data-go="m2"]');
    ok(`${N}: progress nav to m2`, await shown(p, 'm2'));
    ok(`${N}: progress marks current step`, await p.evaluate(() => document.querySelector('nav.prog [aria-current="step"]').getAttribute('data-go') === 'm2'));
    await p.click('#r2 [data-go="m3"]');
    // Moment 3: two fields; only second filled is allowed
    // Both empty
    await p.click('[data-compare="3"]');
    ok(`${N}: m3 both empty blocked, names both`, !(await p.evaluate(() => document.getElementById('r3').open)) && /say to the customer and what you'd note/.test(await p.textContent('#s3')));
    ok(`${N}: m3 both empty focuses say field`, await p.evaluate(() => document.activeElement.id === 't3a'));
    ok(`${N}: m3 both empty marks both invalid`, await p.evaluate(() => document.getElementById('t3a').getAttribute('aria-invalid') === 'true' && document.getElementById('t3b').getAttribute('aria-invalid') === 'true'));
    // Only note filled
    await p.fill('#t3b', 'Not eligible; troubleshooting done; no open follow-up.');
    await p.click('[data-compare="3"]');
    ok(`${N}: m3 note-only blocked, names say field`, !(await p.evaluate(() => document.getElementById('r3').open)) && /say to the customer/.test(await p.textContent('#s3')) && !/note for the next/.test(await p.textContent('#s3')));
    ok(`${N}: m3 note-only focuses say field`, await p.evaluate(() => document.activeElement.id === 't3a'));
    ok(`${N}: m3 note-only clears invalid on note`, await p.evaluate(() => !document.getElementById('t3b').hasAttribute('aria-invalid')));
    // Only say filled
    await p.fill('#t3b', '   ');
    await p.fill('#t3a', 'Your hub is not in the affected group; we will keep troubleshooting.');
    await p.click('[data-compare="3"]');
    ok(`${N}: m3 say-only (whitespace note) blocked, names note field`, !(await p.evaluate(() => document.getElementById('r3').open)) && /note for the next Guide/.test(await p.textContent('#s3')));
    ok(`${N}: m3 say-only focuses note field`, await p.evaluate(() => document.activeElement.id === 't3b'));
    // Both filled
    await p.fill('#t3b', 'Not eligible; troubleshooting done; no open follow-up.');
    await p.click('[data-compare="3"]');
    ok(`${N}: m3 both filled reveals model`, await p.evaluate(() => document.getElementById('r3').open));
    ok(`${N}: m3 prompt cleared and invalid removed`, (await p.textContent('#s3')) === '' && await p.evaluate(() => !document.getElementById('t3a').hasAttribute('aria-invalid') && !document.getElementById('t3b').hasAttribute('aria-invalid')));
    ok(`${N}: echo shows Say/Note`, (await p.textContent('#y3')).includes('Note: Not eligible') && (await p.textContent('#y3')).includes('Say: Your hub'));
    // Revise keeps model visible
    await p.click('[data-revise="3"]');
    ok(`${N}: m3 revise focuses say field, model stays visible`, await p.evaluate(() => document.activeElement.id === 't3a' && document.getElementById('r3').open));
    if (N === 'mobile') await p.screenshot({ path: '/tmp/claude-0/-home-user/1e676488-d029-5546-acad-d6f90a5aa190/scratchpad/sp-m3.png', fullPage: true });
    await p.click('#r3 [data-go="reflect"]');
    ok(`${N}: wrap-up shown, call hidden`, await shown(p, 'reflect') && !(await shown(p, 'call')));
    ok(`${N}: wrap-up states participation not proficiency`, (await p.textContent('#reflect')).includes("doesn't measure how you handle live calls"));
    // Optional variation
    await p.click('#reflect [data-go="variation"]');
    ok(`${N}: variation shown`, await shown(p, 'variation'));
    await p.fill('#t4', "Don't guess; ask Lead; review case.");
    await p.click('[data-compare="4"]');
    ok(`${N}: variation model revealed`, await p.evaluate(() => document.getElementById('r4').open));
    await p.click('#r4 [data-go="reflect"]');
    ok(`${N}: back to wrap-up`, await shown(p, 'reflect'));
    if (N === 'desktop') await p.screenshot({ path: out + 'sp-d-reflect.png', fullPage: true });
    // Storage / network
    ok(`${N}: nothing in localStorage/sessionStorage`, await p.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0));
    ok(`${N}: no cookies`, (await ctx.cookies()).length === 0);
    ok(`${N}: no POST or non-font requests`, requests.every(r => r.startsWith('GET https://fonts.')) );
    // Reload loses answers (not persisted)
    await p.reload();
    ok(`${N}: answers gone after reload`, await p.evaluate(() => document.getElementById('t1').value === ''));
    await ctx.close();
  }

  // Source check: no storage APIs or fetch/XHR/form submission in the file
  const src = fs.readFileSync(file, 'utf8');
  ok('source: no storage/network APIs or forms', !/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|<form/i.test(src));
  ok('source: logo path relative', src.includes('src="assets/northstar-logo-white.png"'));

  // No JS: everything readable
  let ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  let p = await ctx.newPage(); await p.goto(url);
  ok('no-JS: all moments visible', (await Promise.all(['m1','m2','m3','reflect','variation','call'].map(id => shown(p, id)))).every(Boolean));
  ok('no-JS: progress nav hidden', !(await p.evaluate(() => getComputedStyle(document.querySelector('nav.prog')).display !== 'none')));
  ok('no-JS: model answers available via disclosure', await p.evaluate(() => [...document.querySelectorAll('details.model > summary')].every(s => getComputedStyle(s).display !== 'none')));
  await p.click('#r1 > summary');
  ok('no-JS: disclosure opens model 1', await p.evaluate(() => document.getElementById('r1').open));
  ok('no-JS: fictional framing visible', (await p.textContent('#intro')).includes('fictionalized practice call') && (await p.textContent('#call')).includes('not a reconstruction'));
  await p.click('#r3 > summary');
  ok('no-JS: model 3 opens via disclosure', await p.evaluate(() => document.getElementById('r3').open));
  await ctx.close();

  // Init failure: matchMedia not used; break querySelectorAll on nav
  ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  p = await ctx.newPage();
  await p.addInitScript(() => { const orig = Element.prototype.closest; HTMLDetailsElement.prototype.__defineSetter__('open', function () { throw new Error('boom'); }); });
  await p.goto(url);
  ok('init failure: falls back (no sp-ready)', await p.evaluate(() => !document.documentElement.classList.contains('sp-ready')));
  ok('init failure: all moments visible', (await Promise.all(['m1','m2','m3'].map(id => shown(p, id)))).every(Boolean));
  await ctx.close();

  // Offline
  ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  p = await ctx.newPage(); await p.route(/^https?:/, r => r.abort());
  await p.goto(url, { waitUntil: 'load' });
  ok('offline: logo loads', await p.evaluate(() => { const i = document.querySelector('header img'); return i.complete && i.naturalWidth > 0; }));
  ok('offline: interaction ready', await p.evaluate(() => document.documentElement.classList.contains('sp-ready')));
  ok('offline: no web fonts loaded (system fallback)', await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').length === 0));
  ok('offline: no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= 390));
  await p.click('#intro [data-go="m1"]'); await p.fill('#t1', 'x'); await p.click('[data-compare="1"]');
  ok('offline: compare works', await p.evaluate(() => document.getElementById('r1').open));
  await ctx.close();

  await b.close();
})();
