// Build the optional bonus "Beyond the Rollout" (HTML assembled from interviewer/src, then a tagged 2-page Letter PDF).
// Usage: node TN-UOP-FIN/tools/build-ai-extensions.js
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const d = path.resolve(__dirname, '..', 'interviewer');
const logo = 'data:image/png;base64,' + fs.readFileSync(path.resolve(__dirname, '..', 'deliverables', 'assets', 'northstar-logo-white.png')).toString('base64');
const body = fs.readFileSync(path.join(d, 'src', 'ai-extensions-body.html'), 'utf8').replace('%%LOGO%%', logo);
const css = fs.readFileSync(path.join(d, 'src', 'ai-extensions.css'), 'utf8');
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Beyond the Rollout · WN7</title>
<meta name="description" content="Optional bonus: two future AI concepts that could extend WN7 performance support, with boundaries and evaluation.">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
${css}</style>
</head>
<body>
${body}
</body>
</html>
`;
fs.writeFileSync(path.join(d, 'wn7-ai-extensions.html'), html);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 816, height: 1056 } });
  await p.emulateMedia({ colorScheme: 'light' });
  await p.goto('file://' + path.join(d, 'wn7-ai-extensions.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.emulateMedia({ media: 'print', colorScheme: 'light' });
  await p.pdf({ path: path.join(d, 'wn7-ai-extensions.pdf'), format: 'Letter', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
  console.log('wrote wn7-ai-extensions.html + .pdf');
  await b.close();
})();
