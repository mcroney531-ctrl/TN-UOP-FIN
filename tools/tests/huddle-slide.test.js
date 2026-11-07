// Huddle Sequence Slide checks. Run: node TN-UOP-FIN/tools/tests/huddle-slide.test.js
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.resolve(__dirname, '..', '..', 'deliverables', 'wn7-huddle-slide.html');
const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
(async () => {
  const b = await chromium.launch();
  for (const [w, h, n] of [[1920, 1080, 'projector 1080p'], [1280, 720, 'laptop 720p'], [390, 844, 'phone']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const reqs = []; p.on('request', r => { if (!/^(file|data):/.test(r.url())) reqs.push(r.url()); });
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    ok(`${n}: no horizontal scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    ok(`${n}: five steps in order`, await p.evaluate(() => [...document.querySelectorAll('.step h2')].map(x => x.textContent).join('|') === 'Recognize|Verify|Decide|Complete|Explain & Document'));
    ok(`${n}: three paths (Call Path labels)`, await p.evaluate(() => [...document.querySelectorAll('.branch h3')].map(x => x.textContent.replace(/^\W+/, '').trim()).join('|') === 'Eligible|Not eligible|No clear result'));
    ok(`${n}: Complete names both confirmation checks`, await p.evaluate(() => { const t = document.querySelectorAll('.step')[3].textContent; return /confirmation number/.test(t) && /Applied/.test(t) && /For an eligible serial, both/.test(t) && /Recovery isn't complete/.test(t); }));
    ok(`${n}: closing points to Call Path, Lead and fallback, practice`, await p.evaluate(() => { const t = document.querySelector('.next').textContent; return /Guide Call Path/.test(t) && /Lead/.test(t) && /fallback/.test(t) && /Make the Call/.test(t); }));
    ok(`${n}: no activity beyond the slide (quiz, role-play, group practice)`, await p.evaluate(() => !/quiz|role-play|roleplay|group practice/i.test(document.body.textContent)));
    if (w > 760) {
      ok(`${n}: slide is 16:9`, await p.evaluate(() => { const r = document.querySelector('.slide').getBoundingClientRect(); return Math.abs(r.width / r.height - 16 / 9) < 0.01; }));
      ok(`${n}: nothing overflows the slide`, await p.evaluate(() => { const s = document.querySelector('.slide').getBoundingClientRect(); return [...document.querySelectorAll('.slide *')].every(e => { const r = e.getBoundingClientRect(); return r.bottom <= s.bottom + 1 && r.right <= s.right + 1; }); }));
      ok(`${n}: step body text at least 1.2% of slide width`, await p.evaluate(() => { const sw = document.querySelector('.slide').getBoundingClientRect().width; return [...document.querySelectorAll('.step p, .branch p, .next p')].every(e => parseFloat(getComputedStyle(e).fontSize) >= sw * 0.0112); }));
    } else {
      ok(`${n}: body text at least 16px`, await p.evaluate(() => [...document.querySelectorAll('.step p, .branch p, .next p')].every(e => parseFloat(getComputedStyle(e).fontSize) >= 16)));
      ok(`${n}: paths sit directly under Decide`, await p.evaluate(() => { const d = document.querySelectorAll('.step')[2].getBoundingClientRect(), br = document.querySelector('.branches').getBoundingClientRect(), c = document.querySelectorAll('.step')[3].getBoundingClientRect(); return br.top > d.bottom && br.bottom < c.top; }));
    }
    ok(`${n}: logo loads`, await p.evaluate(() => { const i = document.querySelector('.logo'); return i.complete && i.naturalWidth > 0; }));
    ok(`${n}: no remote requests except fonts`, reqs.every(u => /fonts\.(googleapis|gstatic)/.test(u)));
    await p.close();
  }
  await b.close();
})();
