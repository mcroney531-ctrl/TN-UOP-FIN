"""Apply the Northstar WN7 Round 2 visual system to the five in-scope resources.
Idempotent: replaces the marked NS-SYSTEM block and re-applies class hooks. Content text is never changed.
Usage: python3 TN-UOP-FIN/tools/ns-system/apply.py   (then rebuild PDFs: node tools/build-pdfs.js; node tools/build-slide-pdf.js)
"""
import os, re
here = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(here, '..', '..', 'deliverables')
PRINT = open(os.path.join(here, 'ns-system-print.css')).read()
WEB = open(os.path.join(here, 'ns-system-web.css')).read()
WEB_EXTRA = '''/* NS-SYSTEM-WEB:BEGIN */
  header.top { background: var(--ns-grad); }
  header.top img { padding-right: 14px; border-right: 1px solid rgba(255,255,255,.45); box-sizing: content-box; }
  #b-eligible { --c: #2a7347; --cs: var(--green-soft); } #b-not { --c: var(--navy); --cs: var(--ice); } #b-unclear { --c: #8a5a00; --cs: var(--amber-soft); }
  .tip.ns-info { background: var(--ice); border-left: 4px solid var(--cobalt); border-radius: 0 8px 8px 0; padding: 8px 12px; color: var(--ink); }
  .step h2 .n, .branch h4 .n, .n { background: var(--navy); }
/* NS-SYSTEM-WEB:END */
'''
def inject(s, block, tag='NS-SYSTEM'):
    s = re.sub(r'/\* %s:BEGIN.*?/\* %s:END \*/\n?' % (tag, tag), '', s, flags=re.S)
    i = s.index('</style>'); return s[:i] + block + s[i:]
def hook(s, old, new):
    if new in s: return s
    assert s.count(old) == 1, old[:70]; return s.replace(old, new)

jobs = {
 'wn7-lead-meeting-plan-print.html': [('<div class="ask"><span class="tagl">Ask Leads</span>“How do we help', '<div class="ask ns-ico ns-i-people"><span class="tagl">Ask Leads</span>“How do we help')],
 'wn7-lead-quick-reference-print.html': [('<p class="qwarn">', '<p class="qwarn ns-ico ns-i-info">')],
 'wn7-coaching-cues-print.html': [('<p class="mnote">', '<p class="mnote ns-ico ns-i-info">')],
 'wn7-guide-call-path-print.html': [('<p class="nt"><b>Listen for the impact first.</b>', '<p class="nt ns-ico ns-i-headset"><b>Listen for the impact first.</b>'),
                                     ('<p class="nt ns-ico ns-i-info"><b>Running the check', '<p class="nt ns-ico ns-i-info-warm"><b>Running the check')],
}
for f, hooks in jobs.items():
    p = os.path.join(D, f); s = open(p).read()
    for o, n in hooks: s = hook(s, o, n)
    open(p, 'w').write(inject(s, PRINT))

p = os.path.join(D, 'wn7-guide-call-path.html'); s = open(p).read()
for o, n in [('<p class="note"><b>Listen for the impact first.</b>', '<p class="note ns-ico ns-i-headset"><b>Listen for the impact first.</b>'),
             ('<p class="note ns-ico ns-i-info"><b>Running the check', '<p class="note ns-ico ns-i-info-warm"><b>Running the check'),
             ('<p class="tip">The pattern tells you', '<p class="tip ns-info ns-ico ns-i-info">The pattern tells you'),
             ('<p class="note"><b>Check that the customer understands', '<p class="note ns-ico ns-i-clip"><b>Check that the customer understands')]:
    s = hook(s, o, n)
s = inject(s, WEB); s = inject(s, WEB_EXTRA, 'NS-SYSTEM-WEB')
open(p, 'w').write(s)

p = os.path.join(D, 'wn7-huddle-slide.html'); s = open(p).read()
SLIDE = '''/* NS-SYSTEM:BEGIN · Round 2 tokens + semantic result cards for the slide */
  :root { --navy: #0F2E5E; --navy-deep: #08183a; --navy-mid: #0F2E5E; --cobalt: #2E6BD1; --tint: #E9F1FB; }
  .banner { background: linear-gradient(115deg, #08183a 0%, #0F2E5E 55%, #1d4686 100%); }
  .b-yes { border-color: #2a7347; background: #E5F4E9; } .b-yes .mark { background: #2a7347; color: #fff; }
  .b-no { border-color: var(--navy); background: #E9F1FB; }
  .b-unsure { border-style: solid; border-color: #b07a12; background: #F8EED6; } .b-unsure .mark { border: .15cqw solid #b07a12; color: #8a5a00; background: #fff; }
  .step .num { box-shadow: 0 0 0 .12cqw #fff, 0 0 0 .22cqw rgba(46,107,209,.35); }
  @media (max-width: 760px) { .b-unsure .mark { border-width: 1.5px; } }
/* NS-SYSTEM:END */
'''
open(p, 'w').write(inject(s, SLIDE))
print('applied')
