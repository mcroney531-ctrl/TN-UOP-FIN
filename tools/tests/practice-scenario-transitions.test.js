// Make the Call transition checks (item 156). Same path convention as the other suites: /home/user/TN-UOP-FIN.
const { chromium } = require('playwright');
const D = require('os').tmpdir(); require('fs').mkdirSync(D + '/shots', { recursive: true });
const URL = 'file:///home/user/TN-UOP-FIN/deliverables/wn7-practice-scenario.html';
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const state = (p) => p.evaluate(() => ({
  cur: [...document.querySelectorAll('.is-current')].map(e => e.id),
  on: document.getElementById('handoff').classList.contains('on'),
  title: document.querySelector('.ho-title').textContent,
  anims: document.getAnimations().filter(a => a.playState === 'running').length,
  focus: document.activeElement.id,
  hscroll: document.documentElement.scrollWidth > window.innerWidth,
  navH: document.querySelector('nav.prog').getBoundingClientRect().height,
}));
(async () => {
  const b = await chromium.launch();
  for (const [name, vp, mobile] of [['desktop', { width: 1366, height: 860 }, false], ['phone', { width: 390, height: 844 }, true]]) {
    const c = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 2 }); await c.route(/^https?:/, r => r.abort());
    const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto(URL);
    const nav0 = (await state(p)).navH;
    const settle = async () => { await p.waitForTimeout(850); const s = await state(p); ok(s.anims === 0 && !s.on, `${name} settled (anims ${s.anims}, on ${s.on})`); return s; };
    const fwd = async (sel, title, focus, shot) => {
      await p.click(sel);
      const s0 = await state(p);
      ok(s0.on && s0.title === title, `${name} forward strip "${s0.title}"`);
      ok(s0.focus === focus, `${name} focus immediately on ${focus} (got ${s0.focus})`);
      await p.waitForTimeout(300);
      const mid = await state(p);
      ok(!mid.hscroll, `${name} no hscroll mid-transition`);
      ok(mid.navH === nav0, `${name} no layout shift in stepper`);
      if (shot) await p.screenshot({ path: `${D}/shots/transition-${name}-${shot}.png`, clip: { x: 0, y: 0, width: vp.width, height: mobile ? 760 : 620 } });
      const s1 = await settle();
      ok(s1.focus === focus, `${name} focus kept after transition`);
      const op = await p.evaluate(f => { const sc = document.getElementById(f.replace('h-', '')) || document.getElementById(f).closest('section'); const cs = getComputedStyle(sc); return cs.opacity + '|' + cs.transform; }, focus);
      ok(op === '1|none', `${name} card at rest (${op})`);
    };
    await fwd('#intro [data-go=m1]', 'Moving to Recognize & Verify', 'h-m1', 'intro-m1');
    await p.fill('#t1', 'a'); await p.click('[data-compare="1"]');
    await fwd('#r1 [data-go=m2]', 'Moving to Decide', 'h-m2', 'm1-m2');
    ok(await p.evaluate(() => { const m = document.querySelector('#thread .msg[data-from="2"]'); return !m.hidden && m.classList.contains('is-new'); }), `${name} m2 line revealed after transition`);
    await p.fill('#t2', 'b'); await p.click('[data-compare="2"]');
    // backward: light, no strip
    await p.click('#r2 [data-go=m1]');
    let s = await state(p); ok(!s.on && s.anims > 0 && s.cur.includes('m1'), `${name} back: light slide, no strip`);
    ok(await p.inputValue('#t1') === 'a' && await p.locator('#r1').isVisible(), `${name} back keeps answer + comparison`);
    await settle();
    // direct stepper jump forward m1 -> m3: one transition, not intermediates
    await fwd('nav.prog button[data-go=m3]', 'Moving to Explain & Document', 'h-m3');
    // rapid repeated clicks
    await p.evaluate(() => { const g = id => document.querySelector(`nav.prog button[data-go=${id}]`).click(); g('m1'); g('m2'); g('m1'); g('m3'); g('m2'); });
    s = await state(p); ok(s.cur.length === 1 && s.cur[0] === 'm2' && s.focus === 'h-m2', `${name} rapid clicks end on m2 (${s.cur})`);
    s = await settle(); ok(s.cur[0] === 'm2', `${name} still m2 after settle`);
    ok(await p.inputValue('#t2') === 'b', `${name} response kept through rapid nav`);
    await p.click('nav.prog button[data-go=m3]'); await settle();
    await p.fill('#t3a', 'c'); await p.fill('#t3b', 'd'); await p.click('[data-compare="3"]');
    await fwd('#r3 [data-go=reflect]', 'Moving to Wrap-up', 'h-ref', 'm3-wrap');
    // variation: simple entrance, no strip
    await p.click('#reflect [data-go=variation]');
    s = await state(p); ok(!s.on && s.anims > 0, `${name} variation: simple entrance, no strip`); await settle();
    await p.click('[data-compare="4"]'); await p.fill('#t4', 'e'); await p.click('[data-compare="4"]');
    await p.click('#r4 [data-go=reflect]'); s = await state(p); ok(!s.on, `${name} variation -> wrap-up is light`); await settle();
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('handoff')).pointerEvents === 'none' && document.getElementById('handoff').getAttribute('aria-hidden') === 'true'), `${name} strip decorative`);
    ok(errs.length === 0, `${name} no errors ${errs}`);
    await c.close();
  }
  // Reduced motion
  { const c = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }); await c.route(/^https?:/, r => r.abort()); const p = await c.newPage(); await p.goto(URL);
    await p.click('#intro [data-go=m1]'); let s = await state(p);
    ok(!s.on && s.anims === 0 && s.focus === 'h-m1', 'reduced: no motion, immediate, focus');
    await p.fill('#t1', 'a'); await p.click('[data-compare="1"]'); await p.click('#r1 [data-go=m2]'); s = await state(p);
    ok(!s.on && s.anims === 0, 'reduced: m2 no motion (incl. new message)');
    await p.click('#r2 >> text=Back').catch(() => {}); await c.close(); }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close();
})();
