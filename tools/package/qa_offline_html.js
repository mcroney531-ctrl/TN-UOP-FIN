// Offline QA for an extracted package: opens every HTML with internet blocked; checks images, script errors, local links, and clicks each cross-file link.
// Usage: node tools/package/qa_offline_html.js "<extracted>/WN7 Proposal Package"
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { fileURLToPath, pathToFileURL } = require('url');
const ROOT = process.argv[2];
const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith('.html')) files.push(p); } })(ROOT);
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { const b = await chromium.launch();
  for (const f of files.sort()) {
    const rel = path.relative(ROOT, f);
    for (const [vpName, vp] of [['desktop', { width: 1366, height: 860 }], ['phone', { width: 390, height: 844 }]]) {
      const c = await b.newContext({ viewport: vp, acceptDownloads: true });
      const blocked = []; await c.route(/^https?:/, r => { blocked.push(r.request().url()); r.abort(); });
      const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
      const requested = []; c.on('request', r => requested.push(r.url()));
      const failed = []; p.on('requestfailed', r => { if (r.url().startsWith('file:')) failed.push(r.url()); });
      await p.goto(pathToFileURL(f).href, { waitUntil: 'load' }); await p.waitForTimeout(300);
      // bring lazy-loaded images into view so they actually load before checking them
      await p.evaluate(async () => { for (const i of document.images) { i.loading = 'eager'; i.scrollIntoView(); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
      await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 5000 }).catch(() => {});
      const info = await p.evaluate(() => ({
        imgs: [...document.images].map(i => ({ src: i.getAttribute('src').slice(0, 60), ok: i.complete && i.naturalWidth > 0 })),
        links: [...document.querySelectorAll('a[href]')].map(a => a.href).filter(h => h.startsWith('file:')),
        hscroll: document.documentElement.scrollWidth > window.innerWidth + 1, title: document.title }));
      ok(errs.length === 0, `${rel} [${vpName}] script errors: ${errs}`);
      ok(failed.length === 0, `${rel} [${vpName}] missing local files: ${failed}`);
      ok(info.imgs.every(i => i.ok), `${rel} [${vpName}] broken images: ${JSON.stringify(info.imgs.filter(i => !i.ok))}`);
      ok(!info.hscroll, `${rel} [${vpName}] horizontal scroll`);
      const nonFont = blocked.filter(u => !/fonts\.(googleapis|gstatic)\.com/.test(u));
      ok(nonFont.length === 0, `${rel} [${vpName}] needs internet for: ${nonFont}`);
      if (vpName === 'desktop') {
        const local = [...new Set(info.links.map(h => h.split('#')[0]).filter(h => h !== pathToFileURL(f).href))];
        for (const h of local) ok(fs.existsSync(fileURLToPath(h)), `${rel} link target missing: ${decodeURIComponent(h)}`);
        console.log(`${rel}: "${info.title}" · images ${info.imgs.length} ok · local links ${local.length} resolve · internet requests (fonts only, blocked): ${blocked.length}`);
        // click every cross-file link and confirm it opens the right file
        for (const h of local) {
          const target = fileURLToPath(h);
          const tgt = await p.evaluate(href => { const a = [...document.querySelectorAll('a[href]')].find(x => x.href === href); return a ? (a.getAttribute('target') || '_self') : null; }, h);
          if (tgt === '_blank') {
            const popup = c.waitForEvent('page', { timeout: 5000 });
            await p.evaluate(href => [...document.querySelectorAll('a[href]')].find(x => x.href === href).click(), h);
            const np = await popup;
            let got;
            if (h.endsWith('.pdf')) {   // headless Chromium has no PDF viewer: confirm the new tab requested exactly this file
              await np.waitForTimeout(800); got = requested.includes(h) ? h : `no request for it (requested: ${requested.slice(-2)})`;
              ok(fs.existsSync(target) && fs.statSync(target).size > 10000, `${rel} -> PDF missing/empty ${target}`);
            } else { await np.waitForLoadState('load'); got = np.url(); }
            ok(got === h, `${rel} new-tab click -> ${path.relative(ROOT, target)} got ${got}`);
            if (got === h) console.log(`   new tab OK -> ${path.relative(ROOT, target)}${h.endsWith('.html') ? ' ("' + await np.title() + '")' : ' (PDF requested; file present)'}`);
            await np.close().catch(() => {});
          } else {
            const nav = h.endsWith('.pdf') ? null : p.waitForURL(h, { timeout: 5000 }).then(() => true).catch(() => false);
            await p.evaluate(href => [...document.querySelectorAll('a[href]')].find(x => x.href === href).click(), h);
            if (!nav) await p.waitForTimeout(800);
            const okNav = nav ? await nav : (requested.includes(h) && fs.existsSync(target)); ok(okNav, `${rel} same-tab click -> ${path.relative(ROOT, target)} got ${p.url()}`);
            if (okNav) console.log(`   same tab OK -> ${path.relative(ROOT, target)} ("${await p.title()}")`);
            await p.goBack({ waitUntil: 'load' }).catch(() => {}); await p.waitForTimeout(200);
          }
        }
      }
      await c.close();
    }
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); })();
