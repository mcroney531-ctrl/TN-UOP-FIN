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
        ok(`${t}: harness section with its four subsections`, await p.evaluate(() => [...document.querySelectorAll('.harness h3.sub')].map(h => h.textContent).join('|') === 'Building a persistent project memory|Building small tools to improve the work itself|Separating collaboration from implementation|Review, correction, and validation'));
        ok(`${t}: verified opening signals present`, await p.evaluate(() => { const t = document.body.textContent; return t.includes('once we know whether there is a behavior we can change') && t.includes('dug into the data yet') && t.includes('We have not told Leads what to coach') && t.includes('what I click and what I say when the customer asks whether we are replacing it'); }));
        ok(`${t}: removed lines are gone`, await p.evaluate(() => { const t = document.body.textContent; return !t.includes('None of this has happened yet') && !t.includes('everything in the case are fictional') && !t.includes('revisit the closing'); }));
        ok(`${t}: key sources in four groups`, await p.evaluate(() => document.querySelectorAll('.src').length === 4));
        ok(`${t}: agenda stated as 3 · 9 · 10 · 3`, await p.evaluate(() => document.body.textContent.includes('3 · 9 · 10 · 3')));
      } else {
        ok(`${t}: every entry is Decision / Rationale / Result with hidden traceability`, await p.evaluate(() => [...document.querySelectorAll('.entry')].every(e => [...e.querySelectorAll('dt')].map(d => d.textContent).join('|') === 'Decision|Rationale|Result' && e.dataset.refs)));
        ok(`${t}: no visible working-log refs, attribution lines or designer badges`, await p.evaluate(() => !/Working log|Raised by|Decided by|Designer decision/.test(document.body.innerText)));
        ok(`${t}: entries numbered sequentially`, await p.evaluate(() => [...document.querySelectorAll('.entry .id')].every((s, i) => +s.textContent.slice(1) === i + 1)));
        ok(`${t}: no "3 · 19 · 3" agenda shorthand`, await p.evaluate(() => !document.body.textContent.includes('3 · 19 · 3')));
      }
      ok(`${t}: no individual named as thread Admin`, await p.evaluate(() => !/Priya[^.]*Admin/.test(document.body.textContent) || /thread Admin\. She|manager, not a Lead/.test(document.body.textContent)));
      await p.close();
    }
  }
  await b.close();
})();
