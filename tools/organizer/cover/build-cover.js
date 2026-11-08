// Renders wn7-organizer-cover.html to a 1-page US Letter PDF (same approach as tools/build-pdfs.js).
const { chromium } = require('playwright'); const path = require('path');
(async () => { const dir = __dirname; const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 816, height: 1056 } });
  await p.goto('file://' + path.join(dir, 'wn7-organizer-cover.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const ok = await p.evaluate(() => { const i = document.querySelector('.lockup img'); const t = document.querySelector('.titles').getBoundingClientRect(), l = document.querySelector('.lockup').getBoundingClientRect(), h = document.querySelector('.hero').getBoundingClientRect(), d = document.querySelector('.lower').getBoundingClientRect(), f = document.querySelector('.foot').getBoundingClientRect();
    return { logo: i.naturalWidth, font: document.fonts.check('700 38pt Inter'), titleGapBelowLockup: Math.round(t.top - l.bottom), titleInHero: t.bottom <= h.bottom, descToFoot: Math.round(f.top - d.bottom) }; });
  console.log(JSON.stringify(ok));
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: path.join(dir, 'wn7-organizer-cover.pdf'), format: 'Letter', printBackground: true, preferCSSPageSize: true });
  await b.close(); })();
