const { chromium } = require('playwright');
const out = '/tmp/claude-0/-home-user/1e676488-d029-5546-acad-d6f90a5aa190/scratchpad/ro/';
const url = 'file:///home/user/TN-UOP-FIN/deliverables/wn7-resource-overview.html';
const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
(async () => {
  const b = await chromium.launch();
  for (const [w, h, n] of [[1280, 900, 'desktop'], [390, 844, 'mobile']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    const reqs = []; p.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) reqs.push(r.url()); });
    await p.goto(url, { waitUntil: 'networkidle' });
    ok(`${n}: no horizontal scroll`, await p.evaluate((w) => document.documentElement.scrollWidth <= w, w));
    ok(`${n}: four sections + alongside`, await p.evaluate(() => ['lead','guide','huddle','plans','alongside'].every(id => document.getElementById(id))));
    ok(`${n}: old bottom sections removed`, await p.evaluate(() => !['fit','owners','rollout'].some(id => document.getElementById(id))));
    for (const id of ['dlg-lead-meeting','dlg-lead-quick-reference','dlg-lead-coaching-cues','dlg-guide-call-path','dlg-guide-practice','dlg-huddle-slide']) {
      await p.click(`[data-open="${id}"]`);
      const open = await p.evaluate((id) => document.getElementById(id).open, id);
      await p.keyboard.press('Escape');
      const closed = await p.evaluate((id) => !document.getElementById(id).open, id);
      const back = await p.evaluate((id) => document.activeElement.getAttribute('data-open') === id, id);
      ok(`${n}: ${id} opens, Esc closes, focus returns`, open && closed && back);
    }
    if (n === 'desktop') {
      await p.screenshot({ path: out + 'd-full.png', fullPage: true });
      await p.click('[data-open="dlg-guide-practice"]');
      await p.screenshot({ path: out + 'd-dialog.png' });
    } else {
      await p.screenshot({ path: out + 'm-full.png', fullPage: true });
    }
    ok(`${n}: no remote requests except fonts`, reqs.every(u => /fonts\.(googleapis|gstatic)/.test(u)));
    await ctx.close();
  }
  await b.close();
})();
