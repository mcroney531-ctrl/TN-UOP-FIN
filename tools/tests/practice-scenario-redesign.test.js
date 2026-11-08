// Make the Call redesign checks (item 156). Same path convention as the other suites: /home/user/TN-UOP-FIN.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs'), os = require('os');
const R = '/home/user/TN-UOP-FIN';
const AFTER = 'file://' + R + '/deliverables/wn7-practice-scenario.html';
const BEFORE = 'file://' + R + '/archive/round2-before/wn7-practice-scenario.html';
const SH = path.join(os.tmpdir(), 'practice-scenario-shots'); fs.mkdirSync(SH, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch();
  // offline: block all network
  const mk = async (opts = {}) => { const c = await b.newContext(opts); await c.route(/^https?:/, r => r.abort()); return c; };
  // 1. Text diff (no-JS DOM text, source order)
  const txt = async (u) => { const c = await mk({ javaScriptEnabled: false }); const p = await c.newPage(); await p.goto(u);
    const t = await p.evaluate(() => { const cl = document.body.cloneNode(true); cl.querySelectorAll('script,style,svg').forEach(e => e.remove()); return cl.textContent.replace(/\s+/g, ' ').trim(); }); await c.close(); return t; };
  const tb = (await txt(BEFORE)).split(' '), ta = (await txt(AFTER)).split(' ');
  // word-level LCS diff
  const n = tb.length, m = ta.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = tb[i] === ta[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  let i = 0, j = 0; const rem = [], add = [];
  while (i < n && j < m) { if (tb[i] === ta[j]) { i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) rem.push(tb[i++]); else add.push(ta[j++]); }
  while (i < n) rem.push(tb[i++]); while (j < m) add.push(ta[j++]);
  console.log('Words removed:', JSON.stringify(rem)); console.log('Words added:', JSON.stringify(add));

  for (const [name, vp, mobile] of [['desktop', { width: 1366, height: 860 }, false], ['phone', { width: 390, height: 844 }, true]]) {
    const c = await mk({ viewport: vp, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
    const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(AFTER);
    const noHScroll = async (tag) => ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${name} ${tag}: horizontal scroll`);
    const vis = (sel) => p.locator(sel).first().isVisible();
    ok(await p.evaluate(() => document.documentElement.classList.contains('sp-ready')), name + ' sp-ready');
    ok(await vis('#intro') && !(await vis('#call')) && !(await vis('#m1')), name + ' intro alone');
    await noHScroll('intro'); await p.waitForTimeout(800); await p.screenshot({ path: `${SH}/${name}-0-intro.png`, fullPage: true });
    await p.click('#intro [data-go=m1]');
    ok(await p.evaluate(() => document.activeElement.id === 'h-m1'), name + ' focus to m1 h2');
    ok(await vis('#call') && await vis('#m1'), name + ' m1 + call');
    ok(await p.locator('#thread [data-from]:visible').count() === 4, name + ' m1 shows 4 call items');
    ok(!(await p.locator('#r1').isVisible()), name + ' model hidden before writing');
    ok(await p.locator('nav.prog button[data-go=m2]').isDisabled(), name + ' step 2 locked');
    await p.click('[data-compare="1"]');
    ok((await p.textContent('#s1')).includes('Write your answer first'), name + ' write-first message');
    ok(await p.getAttribute('#t1', 'aria-invalid') === 'true', name + ' aria-invalid');
    ok(!(await p.locator('#r1').isVisible()), name + ' still hidden when empty');
    await p.waitForTimeout(800); await p.screenshot({ path: `${SH}/${name}-1-m1.png`, fullPage: true });
    await p.fill('#t1', 'Symptoms fit the pattern, so I checked. Orbit says not eligible.');
    await p.click('[data-compare="1"]');
    ok(await p.locator('#r1').isVisible(), name + ' model shown after compare');
    ok((await p.textContent('#y1')).includes('Orbit says not eligible'), name + ' your response echoed');
    ok(await p.evaluate(() => document.activeElement.tagName === 'H3'), name + ' focus to comparison');
    await noHScroll('m1 compare'); await p.waitForTimeout(800); await p.screenshot({ path: `${SH}/${name}-2-m1-compare.png`, fullPage: true });
    await p.click('[data-revise="1"]');
    ok(await p.evaluate(() => document.activeElement.id === 't1'), name + ' revise focuses field');
    await p.click('#r1 [data-go=m2]');
    ok(await vis('#m2'), name + ' m2');
    const m2panel = p.locator('#thread .msg[data-from="2"]');
    ok(await m2panel.isVisible(), name + ' m2 line revealed in call');
    ok(await m2panel.getAttribute('aria-hidden') === 'true', name + ' panel copy aria-hidden');
    ok(await p.evaluate(() => document.getElementById('m2q').classList.contains('sr-only')), name + ' m2 original sr-only');
    if (mobile) {
      ok(await p.locator('#thread .msg.is-old:visible').count() === 0, 'phone earlier collapsed');
      ok((await p.textContent('.earlier')).includes('(3)'), 'phone earlier count');
      ok(await vis('.orbit'), 'phone orbit stays visible');
      await p.waitForTimeout(800); await p.screenshot({ path: `${SH}/${name}-3-m2.png`, fullPage: true });
      await p.click('.earlier');
      ok(await p.locator('#thread .msg.is-old:visible').count() === 3, 'phone earlier expanded');
      ok(await p.getAttribute('.earlier', 'aria-expanded') === 'true', 'phone aria-expanded');
    } else {
      ok(await p.locator('#thread [data-from]:visible').count() === 5, 'desktop all 5 visible at m2');
      ok(!(await vis('.earlier')), 'desktop no earlier toggle');
      await p.waitForTimeout(800); await p.screenshot({ path: `${SH}/${name}-3-m2.png`, fullPage: true });
    }
    await p.fill('#t2', 'Acknowledge, keep troubleshooting, no promise.');
    await p.click('[data-compare="2"]');
    await p.click('#r2 [data-go=m1]');
    ok(await p.inputValue('#t1') !== '' && await p.locator('#r1').isVisible(), name + ' back keeps answer + comparison');
    ok(!(await m2panel.isVisible()), name + ' m2 line hidden when back at m1');
    await p.click('nav.prog button[data-go=m3]');
    ok(await vis('#m3'), name + ' stepper jump m3');
    ok(await p.inputValue('#t2') !== '', name + ' m2 answer preserved');
    await p.fill('#t3a', 'I can\'t offer a replacement through this path.');
    await p.click('[data-compare="3"]');
    ok((await p.textContent('#s3')).includes('what you\'d note'), name + ' two-field requirement');
    ok(!(await p.locator('#r3').isVisible()), name + ' r3 hidden until both');
    await p.fill('#t3b', 'Not eligible; troubleshooting done.');
    await p.click('[data-compare="3"]');
    ok(await p.locator('#r3').isVisible(), name + ' r3 visible');
    await noHScroll('m3'); await p.waitForTimeout(800); await p.screenshot({ path: `${SH}/${name}-4-m3.png`, fullPage: true });
    await p.click('#r3 [data-go=reflect]');
    ok(await vis('#reflect') && !(await vis('#call')), name + ' wrap-up, call hidden');
    ok(await p.locator('nav.prog .done').count() === 3, name + ' three done marks');
    await noHScroll('wrap'); await p.waitForTimeout(800); await p.screenshot({ path: `${SH}/${name}-5-wrap.png`, fullPage: true });
    await p.click('#reflect [data-go=variation]');
    ok(await vis('#variation') && await vis('#call'), name + ' variation');
    ok(await p.locator('#thread [data-from]:visible').count() === 1 && !(await vis('.orbit')), name + ' variation: only first customer line, no Orbit result');
    await p.click('[data-compare="4"]');
    ok(!(await p.locator('#r4').isVisible()), name + ' variation write-first');
    await p.fill('#t4', 'Don\'t guess, open review case.');
    await p.click('[data-compare="4"]');
    ok(await p.locator('#r4').isVisible(), name + ' variation compare');
    await noHScroll('variation'); await p.waitForTimeout(800); await p.screenshot({ path: `${SH}/${name}-6-variation.png`, fullPage: true });
    await p.click('#r4 [data-go=reflect]');
    ok(await vis('#reflect'), name + ' back to wrap-up');
    ok(await p.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0 && !document.cookie), name + ' no storage');
    ok(errs.length === 0, name + ' no page errors ' + errs.join(';'));
    await c.close();
  }
  // Keyboard only
  { const c = await mk({ viewport: { width: 1366, height: 860 } }); const p = await c.newPage(); await p.goto(AFTER);
    let found = false; for (let k = 0; k < 15 && !found; k++) { await p.keyboard.press('Tab'); found = await p.evaluate(() => document.activeElement.matches('#intro [data-go=m1]')); }
    ok(found, 'kbd reach Start'); await p.keyboard.press('Enter');
    ok(await p.evaluate(() => document.activeElement.id === 'h-m1'), 'kbd Start moves focus');
    await p.focus('#t1'); await p.keyboard.type('Check, not qualifies.'); await p.keyboard.press('Tab'); await p.keyboard.press('Enter');
    ok(await p.locator('#r1').isVisible(), 'kbd compare');
    const ring = await p.evaluate(() => { const b = document.querySelector('[data-revise="1"]'); b.focus(); return getComputedStyle(b).outlineStyle; });
    ok(ring !== 'none', 'visible focus ring');
    // m2 quote reachable for screen readers in m2 card
    await p.click('#r1 [data-go=m2]');
    const acc = await p.evaluate(() => document.getElementById('m2').innerText.length && document.getElementById('m2q').textContent);
    ok(acc.includes('So you\'re not going to replace it'), 'm2 quote stays in m2 card DOM');
    await c.close(); }
  // No JS
  for (const [name, vp] of [['desktop', { width: 1366, height: 860 }], ['phone', { width: 390, height: 844 }]]) {
    const c = await mk({ javaScriptEnabled: false, viewport: vp, deviceScaleFactor: 1 }); const p = await c.newPage(); await p.goto(AFTER);
    for (const s of ['#intro', '#call', '#m1', '#m2', '#m3', '#reflect', '#variation', '#m2q']) ok(await p.locator(s).isVisible(), `nojs ${name} ${s} visible`);
    ok(!(await p.locator('nav.prog').isVisible()), `nojs ${name} stepper hidden`);
    ok(await p.locator('#r1 > summary').isVisible(), `nojs ${name} model summary openable`);
    await p.click('#r2 > summary'); ok(await p.locator('#r2 .why').isVisible(), `nojs ${name} details opens`);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `nojs ${name} no hscroll`);
    await p.waitForTimeout(800); await p.screenshot({ path: `${SH}/nojs-${name}.png`, fullPage: true });
    await c.close(); }
  // Dark mode spot check
  { const c = await mk({ viewport: { width: 1366, height: 860 }, colorScheme: 'dark', deviceScaleFactor: 1 }); const p = await c.newPage(); await p.goto(AFTER);
    await p.click('#intro [data-go=m1]'); await p.fill('#t1', 'x'); await p.click('[data-compare="1"]'); await p.waitForTimeout(800); await p.screenshot({ path: `${SH}/dark-m1.png`, fullPage: true }); await c.close(); }
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close();
})();
