"""Cover + four stops -> one PDF with continuous page numbers stamped in each stop's footer (cover unnumbered)."""
import sys, subprocess, os, json
from pypdf import PdfReader, PdfWriter
O = os.path.dirname(os.path.abspath(__file__))
cover, out = sys.argv[1], sys.argv[2]
stops = [('01', '01-lead-alignment', 'Lead alignment'), ('02', '02-equipping-guides', 'Equipping Guides'),
         ('03', '03-rollout-reinforcement', 'Rollout & Reinforcement'), ('04', '04-ownership', 'Ownership')]
w = PdfWriter(); labels = [None]
for p in PdfReader(cover).pages: w.add_page(p)
for num, f, title in stops:
    pdf = f'{O}/build/{f}.nofoot.pdf'
    subprocess.run(['node', f'{O}/render.js', f'{O}/build/{f}.html', pdf, '--no-footer'], check=True)
    for p in PdfReader(pdf).pages: w.add_page(p); labels.append(f'WN7 Needs Assessment &amp; Planning · {num} {title.replace("&", "&amp;")}')
total = len(labels)
# footer overlay: one Letter page per document page, same position and style as the per-stop footers
pages = ''.join(f'<div class="pg">{"" if l is None else f"<div class=f><span>{l}</span><span>{i+1} / {total}</span></div>"}</div>' for i, l in enumerate(labels))
html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page {{ size: Letter; margin: 0; }} html, body {{ margin: 0; }}
.pg {{ width: 8.5in; height: 11in; position: relative; break-after: page; }} .pg:last-child {{ break-after: auto; }}
.f {{ position: absolute; left: 0.6in; right: 0.6in; bottom: 0.3in; display: flex; justify-content: space-between;
     font: 7.4pt Inter, Arial, sans-serif; color: #5a6376; border-top: 1px solid #d6dae3; padding-top: 5pt; }}
</style></head><body>{pages}</body></html>'''
open(f'{O}/build/footer-overlay.html', 'w').write(html)
subprocess.run(['node', '-e', f'''const {{chromium}}=require("playwright");(async()=>{{const b=await chromium.launch();const p=await b.newPage();
await p.goto("file://{O}/build/footer-overlay.html");await p.evaluate(()=>document.fonts.ready);
await p.pdf({{path:"{O}/build/footer-overlay.pdf",format:"Letter",printBackground:true,preferCSSPageSize:true}});await b.close()}})()'''], check=True)
ov = PdfReader(f'{O}/build/footer-overlay.pdf').pages
assert len(ov) == total, (len(ov), total)
for i, page in enumerate(w.pages):
    if labels[i] is not None: page.merge_page(ov[i])
w.add_metadata({'/Title': 'WN7 | Needs Assessment & Planning', '/Subject': 'Performance Analysis, Design Rationale & Planning Organizer', '/Author': 'Northstar Home · Customer Care Enablement (fictional work sample)'})
# bookmarks: cover first, then each stop
w.add_outline_item('Cover', 0)
start = 1
for num, f, title in stops:
    w.add_outline_item(f'{num} {title}', start); start += len(PdfReader(f'{O}/build/{f}.nofoot.pdf').pages)
with open(out, 'wb') as fh: w.write(fh)
print('pages', total)
