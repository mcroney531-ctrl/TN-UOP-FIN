// Rebuild every PDF in ../deliverables from its *-print.html source.
// Usage (from anywhere):  node TN-UOP-FIN/tools/build-pdfs.js [name-filter]
// Needs Playwright with Chromium (preinstalled in Claude Code cloud sessions).
// Each print page is fixed-size US Letter (.page divs, 8.5in x 11in); the script reports
// how much room is left above each page footer. A negative number means content overflows: fix before shipping.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..', 'deliverables');
const filter = process.argv[2] || '';

(async () => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('-print.html') && f.includes(filter));
  const browser = await chromium.launch();
  for (const f of files) {
    const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });
    await page.goto('file://' + path.join(dir, f), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const gaps = await page.evaluate(() => [...document.querySelectorAll('.page')].map(pg => {
      const foot = pg.querySelector('.pfoot, .qfoot');
      if (!foot) return null;
      const top = foot.getBoundingClientRect().top;
      let bottom = 0;
      pg.querySelectorAll(':scope > *:not(.pfoot):not(.qfoot)').forEach(e => { bottom = Math.max(bottom, e.getBoundingClientRect().bottom); });
      return Math.round(top - bottom);
    }));
    await page.emulateMedia({ media: 'print' });
    const out = path.join(dir, f.replace('-print.html', '.pdf'));
    await page.pdf({ path: out, format: 'Letter', printBackground: true, preferCSSPageSize: true });
    console.log(`${path.basename(out)}  pages=${gaps.length}  room above footer (px): ${gaps.join(', ')}`);
    await page.close();
  }
  await browser.close();
})();
