"""Build a branded print HTML for one organizer stop from its clean HTML. Words are never changed:
only element roles/classes are assigned. Usage: build.py NN 'Title from doc' clean.html out.html"""
import sys, re, copy
from bs4 import BeautifulSoup, NavigableString, Tag
num, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
css = open(sys.argv[4]).read()
soup = BeautifulSoup('<div id="c">' + open(src, encoding='utf-8').read() + '</div>', 'html.parser')
c = soup.find(id='c')
h2 = c.find('h2'); title_html = ''.join(str(x) for x in h2.contents); h2.decompose()

def txt(el): return el.get_text() if isinstance(el, Tag) else str(el)
def starts_star(el): return txt(el).lstrip().startswith('*')

# Lists: items that begin with a line break hold a note, not a bullet point.
for li in c.find_all('li'):
    lead = [ch for ch in li.contents]
    while li.contents and (isinstance(li.contents[0], Tag) and li.contents[0].name == 'br' or (isinstance(li.contents[0], NavigableString) and not str(li.contents[0]).strip())):
        if isinstance(li.contents[0], Tag) and li.contents[0].name == 'br': li['class'] = li.get('class', []) + ['note-li']
        li.contents[0].extract()
# Footnotes inside list items: a line break followed by "*..." starts a footnote that runs to the end of the item's own text.
for li in c.find_all('li'):
    kids = list(li.children)
    for i, ch in enumerate(kids):
        is_start = (i == 0 and 'note-li' in li.get('class', []) and starts_star(ch)) or \
                   (isinstance(ch, Tag) and ch.name == 'br' and i + 1 < len(kids) and starts_star(kids[i + 1]))
        if is_start:
            span = soup.new_tag('span', attrs={'class': 'fn'})
            start = i if i == 0 else i + 1
            if i > 0: ch.extract()
            ch_list = kids[start:]
            first = ch_list[0]; first.insert_before(span)
            # a footnote is the run of italic text (and line breaks) starting with "*"; regular text after it stays regular
            for x in ch_list:
                if isinstance(x, Tag) and x.name in ('ul', 'ol'): break
                if isinstance(x, NavigableString) and str(x).strip(): break
                if isinstance(x, Tag) and x.name not in ('i', 'br'): break
                span.append(x.extract())
            while span.contents and isinstance(span.contents[-1], Tag) and span.contents[-1].name == 'br':
                span.insert_after(span.contents[-1].extract())
            last_i = span.find_all('i')[-1] if span.find_all('i') else None
            if last_i is not None and last_i.contents and isinstance(last_i.contents[-1], Tag) and last_i.contents[-1].name == 'br':
                span.insert_after(last_i.contents[-1].extract())
            break
# Paragraph roles
for p in c.find_all('p', recursive=False):
    t = p.get_text().strip()
    kids = [k for k in p.contents if not (isinstance(k, NavigableString) and not str(k).strip())]
    # entirely italic: every piece of text sits inside an <i>
    all_italic = bool(t) and all((isinstance(k, Tag) and (k.name == 'i' or (k.find('i') is not None and k.get_text().strip() == ''.join(x.get_text() for x in k.find_all('i')).strip()))) for k in kids)
    prev = p.find_previous_sibling()
    if t.startswith('*'): p['class'] = ['fn']
    elif t[:1] in '“"' and t.rstrip()[-1:] in '”"' : p['class'] = ['quote']
    elif prev is not None and prev.name == 'p' and 'quote' in prev.get('class', []): p['class'] = ['attrib']
    elif all_italic: p['class'] = ['note']
    elif 'dek' in p.get('class', []): pass  # subtitle, as styled in the source doc
# A heading directly followed by another heading introduces a group.
for h in c.find_all('h3', recursive=False):
    nxt = h.find_next_sibling()
    if nxt is not None and nxt.name == 'h3': h['class'] = ['group']
# Tables: an all-bold first row is a header row; otherwise an all-bold first column labels the rows.
def all_bold(cell):
    t = cell.get_text().strip()
    return bool(t) and ''.join(b.get_text() for b in cell.find_all('b')).strip() == t
for tb in c.find_all('table'):
    rows = tb.find_all('tr')
    if rows and ('hdr' in rows[0].get('class', []) or all(all_bold(td) for td in rows[0].find_all('td'))):
        thead = soup.new_tag('thead'); tr0 = rows[0].extract(); thead.append(tr0); del tr0['class']
        for td in tr0.find_all('td'):
            td.name = 'th'
            for b in td.find_all('b'): b.unwrap()
        tbody = soup.new_tag('tbody')
        for r in tb.find_all('tr'): tbody.append(r.extract())
        tb.append(thead); tb.append(tbody)
    elif rows and all(all_bold(r.find('td')) for r in rows):
        tb['class'] = ['rowlabels']
        for r in rows:
            td = r.find('td'); td.name = 'th'; td['scope'] = 'row'
            for b in td.find_all('b'): b.unwrap()

# Per-stop structure taken from the organizer screenshots (words unchanged): table cells whose lines are bullets there.
import json, os
ov = json.load(open(os.path.join(os.path.dirname(__file__), 'overrides.json'))).get(num, {})
for spec in ov.get('bullet_columns', []):
    tb = c.find_all('table')[spec['table']]
    for tr in tb.find('tbody').find_all('tr') if tb.find('tbody') else tb.find_all('tr'):
        cell = tr.find_all(['td', 'th'])[spec['column']]
        lines, cur = [], []
        for ch in list(cell.contents):
            if isinstance(ch, Tag) and ch.name == 'br': lines.append(cur); cur = []
            else: cur.append(ch.extract() if hasattr(ch, 'extract') else ch)
        lines.append(cur)
        cell.clear(); ul = soup.new_tag('ul')
        for ln in lines:
            if not ''.join(x.get_text() if isinstance(x, Tag) else str(x) for x in ln).strip(): continue
            li = soup.new_tag('li')
            for x in ln: li.append(x)
            ul.append(li)
        cell.append(ul)
body = ''.join(str(x) for x in c.contents)
doc = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>{num} {BeautifulSoup(title_html, 'html.parser').get_text()}: WN7 Needs Assessment &amp; Planning</title>
<style>
{css}
</style></head>
<body>
<header class="band">
  <div class="top"><img src="../../../deliverables/assets/northstar-logo-white.png" alt="Northstar Home"><div class="eyebrow">WN7 Needs Assessment &amp; Planning</div></div>
  <div class="t"><div class="n">{num}</div><h1>{title_html}</h1></div>
</header>
{body}
</body></html>'''
import os; os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(doc)
