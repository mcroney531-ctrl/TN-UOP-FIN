// Ownership Map Overview checks. Run: node TN-UOP-FIN/tools/tests/ownership-map.test.js
const { chromium } = require('playwright');
const url = 'file:///home/user/TN-UOP-FIN/deliverables/wn7-ownership-map.html';
const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
(async () => {
  const b = await chromium.launch();
  for (const [w, h, n] of [[1280, 900, 'desktop'], [390, 844, 'mobile']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const reqs = []; p.on('request', r => { if (!/^(file|data):/.test(r.url())) reqs.push(r.url()); });
    await p.goto(url, { waitUntil: 'networkidle' });
    ok(`${n}: no horizontal scroll`, await p.evaluate(w => document.documentElement.scrollWidth <= w, w));
    ok(`${n}: four responsibility groups`, await p.evaluate(() => document.querySelectorAll('.group').length === 4));
    ok(`${n}: each group has Primary responsibilities, Supports, Confirmation needed`, await p.evaluate(() => [...document.querySelectorAll('.group')].every(g => [...g.querySelectorAll('dt')].map(d => d.textContent.trim()).join('|') === 'Primary responsibilities|Supports|Confirmation needed')));
    ok(`${n}: every row carries a status label`, await p.evaluate(() => [...document.querySelectorAll('.rows dd')].every(d => d.querySelector('.st'))));
    ok(`${n}: six open decisions, each with an owner and reason`, await p.evaluate(() => { const r = [...document.querySelectorAll('.register tbody tr')]; return r.length === 6 && r.every(x => x.querySelectorAll('td').length === 2 && [...x.querySelectorAll('td')].every(t => t.textContent.trim())); }));
    ok(`${n}: no individual named as thread Admin`, await p.evaluate(() => !/Priya/.test(document.body.textContent)));
    ok(`${n}: logo present`, await p.evaluate(() => { const i = document.querySelector('.mast-logo'); return i && i.naturalWidth > 0; }));
    ok(`${n}: no remote requests except fonts`, reqs.every(u => /fonts\.(googleapis|gstatic)/.test(u)));
    await p.close();
  }
  await b.close();
})();
