// Render the two interviewer-only pages to PDF (US Letter, tagged).
// Usage: python3 TN-UOP-FIN/interviewer/src/build.py && node TN-UOP-FIN/tools/build-interviewer-pdfs.js
const { chromium } = require('playwright');
const path = require('path');
const dir = path.resolve(__dirname, '..', 'interviewer');
(async () => {
  const b = await chromium.launch();
  for (const f of ['wn7-behind-the-design', 'wn7-design-decision-log']) {
    const p = await b.newPage({ viewport: { width: 816, height: 1056 } });
    await p.emulateMedia({ colorScheme: 'light' });
    await p.goto('file://' + path.join(dir, f + '.html'), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.emulateMedia({ media: 'print', colorScheme: 'light' });
    await p.pdf({ path: path.join(dir, f + '.pdf'), format: 'Letter', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: '<div style="width:100%;font:7.5pt Inter,Arial,sans-serif;color:#6b6f76;padding:0 0.6in;display:flex;justify-content:space-between"><span>' + (f.includes('log') ? 'Design Decision Log' : 'Behind the Design: WN7 Recovery Strategy') + ' · interviewer material</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>' });
    console.log('wrote', f + '.pdf');
    await p.close();
  }
  await b.close();
})();
