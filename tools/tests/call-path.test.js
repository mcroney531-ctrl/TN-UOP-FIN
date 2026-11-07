const { chromium } = require('playwright');
const out = '/tmp/claude-0/-home-user/1e676488-d029-5546-acad-d6f90a5aa190/scratchpad/';
const url = 'file:///home/user/TN-UOP-FIN/deliverables/wn7-guide-call-path.html';
const vis = (p) => p.evaluate(() => ['b-eligible','b-not','b-unclear'].map(i => getComputedStyle(document.getElementById(i)).display !== 'none'));
const pickerVis = (p) => p.evaluate(() => getComputedStyle(document.querySelector('.picker')).display !== 'none');
const ok = (name, cond) => console.log((cond ? 'PASS ' : 'FAIL ') + name);
(async () => {
  const b = await chromium.launch();

  // --- Mobile, normal
  let ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  let p = await ctx.newPage(); await p.goto(url, { waitUntil: 'networkidle' });
  ok('mobile: no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= 390));
  ok('mobile: ready class', await p.evaluate(() => document.documentElement.classList.contains('cp-ready')));
  ok('mobile: picker visible', await pickerVis(p));
  ok('mobile: no branch shown before choice', JSON.stringify(await vis(p)) === '[false,false,false]');
  // Complete before choice
  await p.click('[data-nav="complete"]');
  ok('mobile: Complete w/o choice shows prompt', (await p.textContent('#pick-msg')).includes('Choose the result'));
  ok('mobile: Complete w/o choice focuses picker', await p.evaluate(() => document.activeElement.getAttribute('data-b') === 'eligible'));
  // Choose each branch via keyboard
  for (const [k, idx] of [['eligible',0],['not',1],['unclear',2]]) {
    await p.focus(`.pick button[data-b="${k}"]`); await p.keyboard.press('Enter');
    const v = await vis(p);
    ok(`mobile: ${k} shows only its branch`, v.filter(Boolean).length === 1 && v[idx]);
    ok(`mobile: ${k} focus moves to branch heading`, await p.evaluate((k) => document.activeElement.closest('.branch') && document.activeElement.closest('.branch').id === 'b-' + k, k));
  }
  // Complete after choice (unclear selected)
  await p.click('[data-nav="complete"]');
  ok('mobile: Complete after choice focuses that Complete step', await p.evaluate(() => document.activeElement.id === 'c-unclear'));
  await p.screenshot({ path: out + 'cp2-m-unclear.png' });
  // Change result
  await p.click('#b-unclear [data-reset]');
  ok('mobile: Change result hides branches', JSON.stringify(await vis(p)) === '[false,false,false]');
  ok('mobile: Change result focuses picker', await p.evaluate(() => document.activeElement.getAttribute('data-b') === 'eligible'));
  // Space key
  await p.keyboard.press('Tab'); await p.keyboard.press('Space');
  ok('mobile: Space selects Not eligible', (await vis(p))[1]);
  await p.click('.pick button[data-b="eligible"]');
  await p.screenshot({ path: out + 'cp2-m-eligible.png', fullPage: true });
  await ctx.close();

  // --- Desktop, normal
  ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  p = await ctx.newPage(); await p.goto(url, { waitUntil: 'networkidle' });
  ok('desktop: picker hidden', !(await pickerVis(p)));
  ok('desktop: all three branches visible', JSON.stringify(await vis(p)) === '[true,true,true]');
  ok('desktop: three columns', await p.evaluate(() => { const r = ['b-eligible','b-not','b-unclear'].map(i => document.getElementById(i).getBoundingClientRect().top); return Math.abs(r[0]-r[1]) < 2 && Math.abs(r[1]-r[2]) < 2; }));
  await p.click('[data-nav="complete"]');
  await p.waitForTimeout(200);
  ok('desktop: Complete goes to #complete', await p.evaluate(() => location.hash === '#complete'));
  ok('desktop: Change result buttons hidden', await p.evaluate(() => getComputedStyle(document.querySelector('[data-reset]')).display === 'none'));
  await p.screenshot({ path: out + 'cp2-d.png', fullPage: true });
  await ctx.close();

  // --- Resize from mobile with a choice to desktop: all visible
  ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  p = await ctx.newPage(); await p.goto(url, { waitUntil: 'networkidle' });
  await p.click('.pick button[data-b="not"]');
  await p.setViewportSize({ width: 1280, height: 900 });
  ok('resize to desktop: all three visible', JSON.stringify(await vis(p)) === '[true,true,true]');
  await ctx.close();

  // --- JavaScript disabled
  for (const w of [390, 1280]) {
    ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: w, height: 900 } });
    p = await ctx.newPage(); await p.goto(url);
    ok(`no-JS ${w}: all branches visible`, JSON.stringify(await vis(p)) === '[true,true,true]');
    ok(`no-JS ${w}: picker hidden`, !(await pickerVis(p)));
    ok(`no-JS ${w}: Change result hidden`, await p.evaluate(() => getComputedStyle(document.querySelector('[data-reset]')).display === 'none'));
    if (w === 390) await p.screenshot({ path: out + 'cp2-nojs-m.png', fullPage: true });
    await ctx.close();
  }

  // --- Initialisation failure A: markup missing (script throws on its own check)
  ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  p = await ctx.newPage();
  await p.goto('file:///tmp/claude-0/-home-user/1e676488-d029-5546-acad-d6f90a5aa190/scratchpad/cp-broken.html');
  ok('init fail A: no ready class', await p.evaluate(() => !document.documentElement.classList.contains('cp-ready')));
  ok('init fail A: all branches visible', JSON.stringify(await vis(p)) === '[true,true,true]');
  ok('init fail A: picker hidden', !(await pickerVis(p)));
  await ctx.close();

  // --- Initialisation failure B: a browser API throws mid-initialisation
  ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  p = await ctx.newPage();
  await p.addInitScript(() => { window.matchMedia = () => { throw new Error('boom'); }; });
  await p.goto(url);
  ok('init fail B: all branches visible', JSON.stringify(await vis(p)) === '[true,true,true]');
  ok('init fail B: picker hidden', !(await pickerVis(p)));
  await ctx.close();

  // --- Offline: block every network request; only file:// allowed
  ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  p = await ctx.newPage();
  let blocked = 0;
  await p.route(/^https?:/, (route) => { blocked++; route.abort(); });
  await p.goto(url, { waitUntil: 'load' });
  ok('offline: remote requests attempted only for fonts', blocked >= 1);
  ok('offline: logo loads', await p.evaluate(() => { const i = document.querySelector('header img'); return i.complete && i.naturalWidth > 0; }));
  ok('offline: no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= 390));
  ok('offline: script works', await p.evaluate(() => document.documentElement.classList.contains('cp-ready')));
  ok('offline: falls back to system font', await p.evaluate(() => !document.fonts.check('16px Inter')));
  await p.click('.pick button[data-b="eligible"]');
  ok('offline: branch selection works', (await vis(p))[0]);
  await p.screenshot({ path: out + 'cp2-offline.png' });
  await ctx.close();

  await b.close();
})();
