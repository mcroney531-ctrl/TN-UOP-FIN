// Rollout Plan Overview checks. Run: node TN-UOP-FIN/tools/tests/rollout-overview.test.js
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const dir = path.resolve(__dirname, '..', '..', 'deliverables');
const url = 'file://' + path.join(dir, 'wn7-rollout-overview.html');
const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
(async () => {
  const b = await chromium.launch();
  for (const [w, h, n] of [[1280, 900, 'desktop'], [390, 844, 'mobile']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const reqs = []; p.on('request', r => { if (!/^(file|data):/.test(r.url())) reqs.push(r.url()); });
    await p.goto(url, { waitUntil: 'networkidle' });
    ok(`${n}: no horizontal scroll`, await p.evaluate(w => document.documentElement.scrollWidth <= w, w));
    ok(`${n}: five phases in order`, await p.evaluate(() => [...document.querySelectorAll('.phase h3')].map(x => x.textContent).join('|') === 'Prepare|Pilot|Observe & Adjust|Expand|Sustain'));
    ok(`${n}: every phase has what happens, who coordinates, and a gate`, await p.evaluate(() => [...document.querySelectorAll('.phase')].every(ph => ph.querySelector('.ph-body ul') && ph.querySelector('.ph-who') && ph.querySelector('.gate .gq'))));
    ok(`${n}: six indicators listed`, await p.evaluate(() => [...document.querySelectorAll('.chips li')].map(x => x.textContent).join('|') === 'Recognition|Verification|Decision|Recovery|Communication|Documentation'));
    ok(`${n}: baseline figures 76/13/115 of 204`, await p.evaluate(() => { const t = document.querySelector('.baseline').textContent; return /76/.test(t) && /13/.test(t) && /115/.test(t) && /204/.test(t); }));
    ok(`${n}: every decision point carries a status label`, await p.evaluate(() => [...document.querySelectorAll('.dp-items li')].every(li => li.querySelector('.st'))));
    ok(`${n}: no individual named as thread Admin`, await p.evaluate(() => !/Priya/.test(document.body.textContent)));
    const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
    ok(`${n}: cross-links resolve to files (${links.join(', ')})`, links.length === 2 && links.every(l => fs.existsSync(path.join(dir, l))));
    ok(`${n}: logo present`, await p.evaluate(() => { const i = document.querySelector('.mast-logo'); return i && i.naturalWidth > 0; }));
    ok(`${n}: no remote requests except fonts`, reqs.every(u => /fonts\.(googleapis|gstatic)/.test(u)));
    await p.close();
  }
  await b.close();
})();
