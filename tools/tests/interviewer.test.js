// Interviewer Note + Design Decision Log checks. Run: node TN-UOP-FIN/tools/tests/interviewer.test.js
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const dir = path.resolve(__dirname, '..', '..', 'interviewer');
const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
(async () => {
  const b = await chromium.launch();
  for (const [w, h, n] of [[1280, 900, 'desktop'], [390, 844, 'phone']]) {
    for (const f of ['wn7-behind-the-design.html', 'wn7-design-decision-log.html']) {
      const p = await b.newPage({ viewport: { width: w, height: h } });
      const reqs = []; p.on('request', r => { if (!/^(file|data):/.test(r.url())) reqs.push(r.url()); });
      await p.goto('file://' + path.join(dir, f), { waitUntil: 'networkidle' });
      const t = `${n} ${f.replace('.html', '')}`;
      ok(`${t}: no horizontal scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      ok(`${t}: red banner with hex pattern`, await p.evaluate(() => !!document.querySelector('.masthead .mast-hex') && getComputedStyle(document.querySelector('.masthead')).backgroundImage.includes('184, 32, 43')));
      const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => !h.startsWith('#')));
      ok(`${t}: relative links resolve (${[...new Set(links)].join(', ')})`, links.length > 0 && links.every(l => !/^[a-z]+:/i.test(l) && fs.existsSync(path.join(dir, l))));
      ok(`${t}: marked interviewer-only`, await p.evaluate(() => /Not part of Dana's package/.test(document.querySelector('.mast-for').textContent)));
      ok(`${t}: no remote requests except fonts`, reqs.every(u => /fonts\.(googleapis|gstatic)/.test(u)));
      if (f.includes('behind')) {
        ok(`${t}: five decisions, each with decision/why/what changed`, await p.evaluate(() => { const d = [...document.querySelectorAll('.dec')]; return d.length === 5 && d.every(x => [...x.querySelectorAll('dt')].map(e => e.textContent).join('|') === 'Decision|Why|What changed'); }));
        ok(`${t}: harness section with three oversight examples`, await p.evaluate(() => document.querySelectorAll('.harness .check').length === 3));
        ok(`${t}: key sources in four groups`, await p.evaluate(() => document.querySelectorAll('.src').length === 4));
        ok(`${t}: agenda stated as 3 · 9 · 10 · 3`, await p.evaluate(() => document.body.textContent.includes('3 · 9 · 10 · 3')));
      } else {
        ok(`${t}: every entry has status, raised/decided, four fields, source refs`, await p.evaluate(() => [...document.querySelectorAll('.entry')].every(e => e.querySelector('.st') && /Raised by:.*Decided by:/.test(e.querySelector('.who').textContent) && e.querySelectorAll('dt').length === 4 && e.querySelector('.ref'))));
        ok(`${t}: no "3 · 19 · 3" agenda shorthand`, await p.evaluate(() => !document.body.textContent.includes('3 · 19 · 3')));
      }
      ok(`${t}: no individual named as thread Admin`, await p.evaluate(() => !/Priya[^.]*Admin/.test(document.body.textContent) || /thread Admin\. She|manager, not a Lead/.test(document.body.textContent)));
      await p.close();
    }
  }
  await b.close();
})();
