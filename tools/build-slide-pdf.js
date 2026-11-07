// Build the huddle slide PDF (one 13.333 x 7.5 in widescreen page, tagged for accessibility).
// Usage: node TN-UOP-FIN/tools/build-slide-pdf.js
const { chromium } = require('playwright');
const path = require('path');
const dir = path.resolve(__dirname, '..', 'deliverables');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('file://' + path.join(dir, 'wn7-huddle-slide.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.emulateMedia({ media: 'print' });
  const out = path.join(dir, 'wn7-huddle-slide.pdf');
  await p.pdf({ path: out, width: '13.333in', height: '7.5in', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
  console.log('wrote', path.basename(out));
  await b.close();
})();
