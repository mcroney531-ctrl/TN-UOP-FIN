// Render a stop's print HTML to PDF (US Letter) with a running footer and page numbers.
const { chromium } = require('playwright');
const [,, html, pdf, footLabel] = process.argv;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 816, height: 1056 } });
  await p.goto('file://' + html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.emulateMedia({ media: 'print' });
  const foot = `<div style="width:100%;font-family:Inter,Arial,sans-serif;font-size:7.4pt;color:#5a6376;padding:0 0.6in;display:flex;justify-content:space-between;-webkit-print-color-adjust:exact">
    <span style="border-top:1px solid #d6dae3;padding-top:5pt;flex:1;display:flex;justify-content:space-between"><span>${footLabel}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></span></div>`;
  await p.pdf({ path: pdf, format: 'Letter', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: footLabel !== '--no-footer', headerTemplate: '<span></span>', footerTemplate: foot });
  await b.close(); })();
