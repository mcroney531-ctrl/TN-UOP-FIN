// "Beyond the Rollout" bonus checks. Run: node TN-UOP-FIN/tools/tests/ai-extensions.test.js
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.resolve(__dirname, '..', '..', 'interviewer', 'wn7-ai-extensions.html');
const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
(async () => {
  const b = await chromium.launch();
  for (const [w, h, n] of [[1280, 900, 'desktop'], [390, 844, 'phone']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const reqs = []; p.on('request', r => { if (!/^(file|data):/.test(r.url())) reqs.push(r.url()); });
    await p.goto(url, { waitUntil: 'networkidle' });
    ok(`${n}: no horizontal scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    ok(`${n}: two concepts, each with the same four sections`, await p.evaluate(() => { const c = [...document.querySelectorAll('.concept')]; return c.length === 2 && c.every(x => [...x.querySelectorAll('.quad h2')].map(e => e.textContent).join('|') === "The opportunity|What it would look like|What it would take|How we'd know it works"); }));
    ok(`${n}: each mockup labeled as conceptual and not existing software`, await p.evaluate(() => [...document.querySelectorAll('.mock figcaption')].length === 2 && [...document.querySelectorAll('.mock figcaption')].every(f => /Conceptual mockup/.test(f.textContent) && /not existing Northstar software/.test(f.textContent))));
    ok(`${n}: simulator result marked simulated`, await p.evaluate(() => /simulated/.test(document.querySelector('.sysres').textContent)));
    ok(`${n}: assistant shows citations, a gap flag and its limits`, await p.evaluate(() => document.querySelectorAll('.ans sup').length >= 2 && !!document.querySelector('.gap') && /Can't do/.test(document.querySelector('.limits').textContent)));
    ok(`${n}: framed as optional, not part of the rollout`, await p.evaluate(() => /Not part of the WN7 rollout/i.test(document.querySelector('.mast-for').textContent) && /not proposals/.test(document.querySelector('.frame').textContent)));
    ok(`${n}: no budget, ROI, vendor or timeline figures`, await p.evaluate(() => !/\$\d|ROI|return on investment|\bQ[1-4]\b|20\d\d/.test(document.body.innerText)));
    ok(`${n}: logo loads`, await p.evaluate(() => { const i = document.querySelector('.mast-logo'); return i.complete && i.naturalWidth > 0; }));
    ok(`${n}: no remote requests except fonts`, reqs.every(u => /fonts\.(googleapis|gstatic)/.test(u)));
    await p.close();
  }
  await b.close();
})();
