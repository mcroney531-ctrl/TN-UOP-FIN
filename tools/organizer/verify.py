"""Word-for-word check of a built stop against its Google Docs export.
1) Rendered DOM text (in order) must equal the source text, ignoring only the band chrome.
2) Every source word must appear in the PDF text, with the same counts (catches clipping or loss)."""
import sys, re, subprocess, json, collections, difflib
from bs4 import BeautifulSoup
gdoc, clean, built, pdf, num = sys.argv[1:6]
def words(s): return re.sub(r'\s+', ' ', s).strip().split(' ')
def toks(s): return re.findall(r"\w+|[^\w\s]", s)  # words and punctuation as separate tokens (PDF joins runs the doc splits)
# Source straight from the Google export (not from our simplified copy)
g = BeautifulSoup(open(gdoc, encoding='utf-8').read(), 'html.parser')
for t in g(['style', 'script', 'head']): t.decompose()
src = words(g.body.get_text(' '))
# Built page DOM text, minus band chrome (eyebrow + number); the title is source text
b = BeautifulSoup(open(built, encoding='utf-8').read(), 'html.parser')
for t in b(['style', 'script', 'head']): t.decompose()
b.select_one('.band .eyebrow').decompose(); b.select_one('.band .n').decompose()
dom = words(b.body.get_text(' '))
sm = difflib.SequenceMatcher(a=src, b=dom, autojunk=False)
diffs = [(op, ' '.join(src[i1:i2]), ' '.join(dom[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
print(f'source words: {len(src)}  page words: {len(dom)}  in-order differences: {len(diffs)}')
for d in diffs[:20]: print('  ', d)
# PDF text
# word boxes as drawn on the page (plain pdftotext silently drops line-end hyphens: "one-/pager" -> "onepager")
import html as _h
bb = subprocess.run(['pdftotext', '-bbox', pdf, '-'], capture_output=True, text=True).stdout
t = ' '.join(_h.unescape(w) for w in re.findall(r'<word [^>]*>([^<]*)</word>', bb))
pw = collections.Counter(toks(t))
chrome = collections.Counter(words('WN7 Needs Assessment & Planning') * 1)
missing = collections.Counter(toks(' '.join(src))) - pw
print('words missing from PDF:', dict(missing) if missing else 'none')
