"""Turn a Google Docs HTML export into clean semantic HTML (+ a text outline) without changing any words.
Keeps: headings, paragraphs, bold/italic/underline, links, nested bullet/number lists (rebuilt from Google's
per-item list classes), tables (cell paragraphs joined with <br>). Drops Google styling only."""
import sys, re, html
from bs4 import BeautifulSoup, NavigableString

src, out_html, out_txt = sys.argv[1:4]
soup = BeautifulSoup(open(src, encoding='utf-8').read(), 'html.parser')
css = soup.style.string if soup.style else ''
fmt = {}
for m in re.finditer(r'\.([\w-]+)\{([^}]*)\}', css):
    cls, body = m.group(1), m.group(2)
    f = set()
    if re.search(r'font-weight:\s*(700|bold)', body): f.add('b')
    if 'font-style:italic' in body: f.add('i')
    if 'text-decoration:underline' in body: f.add('u')
    fmt[cls] = f
list_type = {}  # lst-kix_xxx-N -> ol/ul from list-style-type
for m in re.finditer(r'ol\.(lst-kix_[\w-]+)\{[^}]*list-style-type:\s*([\w-]+)', css):
    list_type[m.group(1)] = 'ol'

def inline(node):
    """Render inline content of a <p>/<h*>/<li>, keeping b/i/u and links, exact text."""
    parts = []
    for ch in node.children:
        if isinstance(ch, NavigableString):
            parts.append(html.escape(str(ch), quote=False)); continue
        if ch.name == 'br': parts.append('<br>'); continue
        if ch.name == 'a':
            href = ch.get('href', '')
            m = re.search(r'[?&]q=([^&]+)', href)
            if m: from urllib.parse import unquote; href = unquote(m.group(1))
            t = inline(ch)
            parts.append(f'<a href="{html.escape(href)}">{t}</a>' if href and not href.startswith('#') else t); continue
        if ch.name in ('sup',): parts.append(f'<sup>{inline(ch)}</sup>'); continue
        t = inline(ch)
        f = set()
        for c in ch.get('class', []): f |= fmt.get(c, set())
        st = ch.get('style', '')
        if re.search(r'font-weight:\s*(700|bold)', st): f.add('b')
        if re.search(r'font-style:\s*italic', st): f.add('i')
        if re.search(r'text-decoration:[^;]*underline', st): f.add('u')
        for tag in ('u', 'i', 'b'):
            if tag in f and t.strip(): t = f'<{tag}>{t}</{tag}>'
        parts.append(t)
    s = ''.join(parts)
    s = re.sub(r'</(b|i|u)><\1>', '', s)  # merge adjacent identical runs
    return s

def text(s): return html.unescape(re.sub(r'<br>', '\n', re.sub(r'<(?!br)[^>]+>', '', s)))

out, txt = [], []
stack = []  # open lists: (tag, level)
def close_to(level):
    while stack and stack[-1][1] >= level:
        out.append(f'</li></{stack.pop()[0]}>')
body = soup.body
for el in body.children:
    if isinstance(el, NavigableString): continue
    if el.name in ('ul', 'ol'):
        cls = next((c for c in el.get('class', []) if c.startswith('lst-kix_')), '')
        lvl = int(cls.rsplit('-', 1)[1]) if cls else 0
        tag = 'ol' if el.name == 'ol' else 'ul'
        for li in el.find_all('li', recursive=False):
            if stack and stack[-1][1] == lvl:
                out.append('</li><li>')
            elif stack and stack[-1][1] > lvl:
                close_to(lvl + 1); out.append('</li><li>') if stack and stack[-1][1] == lvl else (out.append(f'<{tag}><li>'), stack.append((tag, lvl)))
            else:
                out.append(f'<{tag}><li>'); stack.append((tag, lvl))
            s = inline(li); out.append(s); txt.append('  ' * lvl + '- ' + text(s))
            if not text(s).strip(): out[-2] = out[-2].replace('<li>', '<li class="empty">')
        continue
    close_to(0)
    if el.name and re.fullmatch(r'h[1-6]', el.name):
        s = inline(el)
        if text(s).strip(): out.append(f'<{el.name}>{s}</{el.name}>'); txt.append('#' * int(el.name[1]) + ' ' + text(s))
    elif el.name == 'p':
        s = inline(el)
        # the organizer's subtitle style: 11.5pt grey text directly in the document
        spans = [sp_ for sp_ in el.find_all('span') if sp_.get_text().strip()]
        is_dek = bool(spans) and all(re.search(r'font-size:\s*11\.5pt', sp_.get('style', '')) and re.search(r'color:\s*#5d667a', sp_.get('style', ''), re.I) for sp_ in spans)
        if text(s).strip(): out.append(f'<p class="dek">{s}</p>' if is_dek else f'<p>{s}</p>'); txt.append(text(s))
        else: txt.append('')
    elif el.name == 'table':
        out.append('<table>'); txt.append('[TABLE]')
        for tr in el.find_all('tr'):
            cells = []
            for td in tr.find_all('td', recursive=False):
                # keep paragraphs as lines and list items as real lists, in document order
                html_parts, items = [], []
                def flush(items):
                    # rebuild nesting from Google's per-item list level (lst-kix_...-N)
                    base = min(l for l, _ in items); h, depth = '', base - 1
                    for lvl, it in items:
                        if lvl > depth:
                            for _ in range(lvl - depth): h += '<ul><li>'
                        else:
                            for _ in range(depth - lvl): h += '</li></ul>'
                            h += '</li><li>'
                        h += it; depth = lvl
                    for _ in range(depth - base + 1): h += '</li></ul>'
                    return h
                for blk in td.find_all(['p', 'li']):
                    if blk.find_parent('li') is not None and blk.name == 'p': continue
                    s_ = inline(blk)
                    if not text(s_).strip(): continue
                    if blk.name == 'li':
                        par = blk.find_parent(['ul', 'ol']); cls = next((c for c in (par.get('class', []) if par else []) if c.startswith('lst-kix_')), '')
                        items.append((int(cls.rsplit('-', 1)[1]) if cls else 0, s_))
                    else:
                        if items: html_parts.append(flush(items)); items = []
                        html_parts.append(s_)
                if items: html_parts.append(flush(items))
                out_c = ''
                for k, part in enumerate(html_parts):
                    if k and not part.startswith('<ul>') and not html_parts[k-1].startswith('<ul>'): out_c += '<br>'
                    out_c += part
                cells.append(out_c)
            first = tr.find('td', recursive=False)
            shaded = bool(first is not None and re.search(r'background-color:\s*#f3f4f7', first.get('style', ''), re.I))
            out.append(('<tr class="hdr">' if shaded else '<tr>') + ''.join(f'<td>{c}</td>' for c in cells) + '</tr>')
            txt.append(' | '.join(text(c).replace('\n', ' // ') for c in cells))
        out.append('</table>'); txt.append('[/TABLE]')
    else:
        s = inline(el)
        if text(s).strip(): out.append(f'<div data-src="{el.name}">{s}</div>'); txt.append(f'[{el.name}] ' + text(s))
close_to(0)
open(out_html, 'w').write('\n'.join(out) + '\n')
open(out_txt, 'w').write('\n'.join(txt) + '\n')
