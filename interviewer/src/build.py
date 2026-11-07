"""Assemble the two interviewer-only pages from src/ into ../ (HTML).
Run:  python3 TN-UOP-FIN/interviewer/src/build.py   then   node TN-UOP-FIN/tools/build-interviewer-pdfs.js
"""
import html, os, sys
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.dirname(here)
sys.path.insert(0, here)
from log_entries import GROUPS

shared = open(os.path.join(here, 'shared.css')).read()
HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
'''

def page(title, desc, css, body):
    return HEAD.format(title=title, desc=desc, css=shared + css) + body + '\n</body>\n</html>\n'

# ---- Interviewer Note
src = open(os.path.join(here, 'note-body.html')).read()
css, body = src.split('<!--BODY-->'); css = css.replace('<!--CSS-->', '')
open(os.path.join(out, 'wn7-behind-the-design.html'), 'w').write(
    page('Behind the Design · WN7', 'Interviewer note: how the WN7 recovery strategy was designed, the five decisions that shaped it, harness use, and open uncertainties.', css, body))

# ---- Decision Log
STATUS = {
    'designer': ('Designer decision', 'st-d'),
    'proposed': ('Proposed · needs approval', 'st-p'),
    'required': ('Required by case materials', 'st-r'),
}
e = lambda t: html.escape(t, quote=False)
log_css = '''
  .key { display: flex; flex-wrap: wrap; gap: 8px 22px; margin: 18px 0 0; padding: 14px 16px; background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius); font-size: 14px; color: var(--ink-soft); }
  .key div { display: flex; align-items: baseline; gap: 8px; }
  .key .attr { flex-basis: 100%; margin: 4px 0 0; }
  .st { flex: none; display: inline-block; padding: 1px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; line-height: 1.7; white-space: nowrap; }
  .st-d { background: var(--accent); color: var(--on-accent); border: 1.5px solid var(--accent); }
  .st-p { background: var(--paper); color: var(--accent); border: 1.5px solid var(--accent); }
  .st-r { background: transparent; color: var(--ink-soft); border: 1.5px dashed #8a8f97; }
  .toc { margin: 14px 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 6px 10px; font-size: 14px; }
  .toc a { display: inline-block; padding: 3px 10px; border-radius: 999px; background: var(--tint); text-decoration: none; color: var(--accent); font-weight: 600; }
  .grp { margin-top: 36px; }
  .grp h2 { display: flex; align-items: baseline; gap: 12px; margin: 0 0 12px; font-size: 21px; letter-spacing: -.01em; }
  .grp h2 .n { color: var(--accent-2); font-size: 14px; font-weight: 700; letter-spacing: .1em; }
  .entries { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
  .entry { background: var(--paper); border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: var(--radius); padding: 14px 18px 12px; }
  .entry-top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 6px 14px; }
  .entry h3 { margin: 0; font-size: 17px; line-height: 1.3; }
  .entry h3 .id { color: var(--accent-2); font-size: 13px; font-weight: 700; margin-right: 8px; }
  .who { margin: 6px 0 10px; font-size: 13px; color: var(--ink-muted); }
  .who b { color: var(--ink-soft); font-weight: 600; }
  .fields { margin: 0; display: grid; grid-template-columns: 150px 1fr; gap: 6px 16px; }
  .fields dt { color: var(--accent-2); font-size: 11.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding-top: 3px; }
  .fields dd { margin: 0; color: var(--ink-soft); font-size: 15px; }
  .ref { display: block; margin-top: 8px; text-align: right; font-size: 12px; color: var(--ink-muted); }
  .back { margin: 26px 0 0; padding: 14px 18px; border: 1px dashed var(--accent-2); border-radius: var(--radius); background: var(--paper); }
  .back p { margin: 0; }
  @media (max-width: 600px) { .fields { grid-template-columns: 1fr; gap: 2px; } .fields dd { margin-bottom: 8px; } }
  @media print {
    .key { font-size: 9pt; padding: 8px 10px; }
    .toc { display: none; }
    .grp { margin-top: 18px; } .grp h2 { font-size: 13.5pt; margin-bottom: 8px; break-after: avoid; }
    .entries { gap: 8px; }
    .entry { padding: 9px 12px 7px; break-inside: avoid; }
    .entry h3 { font-size: 11pt; } .who { font-size: 8.4pt; margin: 3px 0 6px; }
    .fields { grid-template-columns: 112px 1fr; gap: 3px 10px; } .fields dt { font-size: 7.4pt; } .fields dd { font-size: 9.6pt; }
    .st { font-size: 7.2pt; } .ref { font-size: 7.6pt; margin-top: 4px; }
    .back { break-inside: avoid; }
  }
'''
n = 0
parts = ['''<div class="masthead">
    <svg class="mast-hex" viewBox="0 0 640 240" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hexfade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
        <mask id="hexmask"><rect width="640" height="240" fill="url(#hexfade)"/></mask>
      </defs>
      <g mask="url(#hexmask)" fill="none" stroke="#fff" stroke-width="1.5">
        <polygon points="430.0,-64.0 511.4,-17.0 511.4,77.0 430.0,124.0 348.6,77.0 348.6,-17.0" stroke-opacity="0.16" fill="#fff" fill-opacity="0"/>
        <polygon points="603.2,-64.0 684.6,-17.0 684.6,77.0 603.2,124.0 521.8,77.0 521.8,-17.0" stroke-opacity="0.11" fill="#fff" fill-opacity="0"/>
        <polygon points="516.6,86.0 598.0,133.0 598.0,227.0 516.6,274.0 435.2,227.0 435.2,133.0" stroke-opacity="0.13" fill="#fff" fill-opacity="0.035"/>
        <polygon points="343.4,86.0 424.8,133.0 424.8,227.0 343.4,274.0 262.0,227.0 262.0,133.0" stroke-opacity="0.08" fill="#fff" fill-opacity="0"/>
      </g>
    </svg>
  <div class="wrap">
    <div>
      <p class="mast-for">For interviewers · Not part of Dana's package</p>
      <p class="mast-name">Design Decision Log</p>
      <p class="mast-role">Companion to <i>Behind the Design: WN7 Recovery Strategy</i></p>
    </div>
  </div>
</div>
<main class="wrap">
  <p class="lede">A curated record of the choices underneath the five defining decisions: what I chose, why, what I considered or changed, and how it shaped the proposal. It isn't a build history. Each entry traces to the full working log kept during the project (item numbers at the right of each entry).</p>
  <div class="key" aria-label="How to read this log">
    <div><span class="st st-d">Designer decision</span>my call as the designer</div>
    <div><span class="st st-p">Proposed · needs approval</span>depends on an organizational owner</div>
    <div><span class="st st-r">Required by case materials</span>a constraint from policy or the case record</div>
    <p class="attr"><b>Raised by</b> names who originated the idea or flag: me, GPT (design reviewer in a separate chat), Claude (builder and source checker), or a case source. <b>Decided by</b> is who made the final call and how: adopted, modified, kept or rejected. Agents suggested; I decided.</p>
  </div>
  <ul class="toc" aria-label="Sections">''']
for letter, name, entries in GROUPS:
    parts.append(f'<li><a href="#g{letter}">{letter} · {e(name)}</a></li>')
parts.append('</ul>')
for letter, name, entries in GROUPS:
    parts.append(f'<section class="grp" id="g{letter}" aria-labelledby="g{letter}-h"><h2 id="g{letter}-h"><span class="n">{letter}</span>{e(name)}</h2><ol class="entries">')
    for x in entries:
        n += 1
        lab, cls = STATUS[x['status']]
        parts.append(f'''<li class="entry"><div class="entry-top"><h3><span class="id">{letter}{n}</span>{e(x['title'])}</h3><span class="st {cls}">{lab}</span></div>
<p class="who"><b>Raised by:</b> {e(x['raised'])} · <b>Decided by:</b> {e(x['decided'])}</p>
<dl class="fields"><dt>Decision</dt><dd>{e(x['decision'])}</dd><dt>Rationale</dt><dd>{e(x['rationale'])}</dd><dt>Alternative / tradeoff</dt><dd>{e(x['alternative'])}</dd><dt>Consequence</dt><dd>{e(x['consequence'])}</dd></dl>
<span class="ref">Working log: {e(x['refs'])}</span></li>''')
    parts.append('</ol></section>')
parts.append('''<div class="back"><p>The five decisions with the most influence on the strategy, plus harness use and open uncertainties, are in <a href="wn7-behind-the-design.html"><b>Behind the Design: WN7 Recovery Strategy</b></a>.</p></div>
</main>
<footer class="foot"><div class="wrap">Interviewer material, separate from the materials for Dana. Item numbers refer to the project's working decision log, which isn't included in the package. Fictional work sample; Northstar Home, its people and its data are synthetic.</div></footer>''')
open(os.path.join(out, 'wn7-design-decision-log.html'), 'w').write(
    page('Design Decision Log · WN7', 'Interviewer companion: curated design decisions, alternatives and tradeoffs behind the WN7 recovery proposal.', log_css, '\n'.join(parts)))
print('entries:', n)
