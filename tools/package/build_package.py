"""Assemble 'WN7 Proposal Package.zip' from the approved repo files (item 159).
Copies files under reader-facing names, keeps each HTML file's assets/ folder beside it, and repoints only
cross-file links to their packaged locations. Usage: python3 tools/package/build_package.py OUT_DIR"""
import os, sys, shutil, zipfile, re
from urllib.parse import quote
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D, I = f'{R}/deliverables', f'{R}/interviewer'
out = os.path.abspath(sys.argv[1]); root_name = 'WN7 Proposal Package'
P, U = '01 — Proposal', '02 — UOP Interviewer Notes'
SH, NA, LR = f'{P}/00 — Start Here', f'{P}/01 — Needs Assessment and Planning', f'{P}/02 — Learning Resources'
FILES = {  # packaged path : source
    f'{SH}/Resource Overview.html': f'{D}/wn7-resource-overview.html',
    f'{SH}/Rollout Plan Overview.html': f'{D}/wn7-rollout-overview.html',
    f'{SH}/Ownership Map.html': f'{D}/wn7-ownership-map.html',
    f'{NA}/Needs Assessment & Planning Organizer.pdf': f'{D}/wn7-needs-assessment-planning.pdf',
    f'{NA}/Full Rollout Plan.pdf': f'{D}/wn7-rollout-plan.pdf',
    f'{NA}/AI Extensions.pdf': f'{I}/wn7-ai-extensions.pdf',
    f'{LR}/Leads/Lead Alignment Meeting Plan.pdf': f'{D}/wn7-lead-meeting-plan.pdf',
    f'{LR}/Leads/Lead Quick Reference.pdf': f'{D}/wn7-lead-quick-reference.pdf',
    f'{LR}/Leads/Lead Coaching Cues.pdf': f'{D}/wn7-coaching-cues.pdf',
    f'{LR}/Leads/Huddle Sequence Slide.pdf': f'{D}/wn7-huddle-slide.pdf',
    f'{LR}/Leads/Huddle Sequence Slide.html': f'{D}/wn7-huddle-slide.html',
    f'{LR}/Guides/WN7 Call Path.html': f'{D}/wn7-guide-call-path.html',
    f'{LR}/Guides/WN7 Call Path (Print).pdf': f'{D}/wn7-guide-call-path.pdf',
    f'{LR}/Guides/Make the Call.html': f'{D}/wn7-practice-scenario.html',
    f'{U}/Interviewer\'s Note.pdf': f'{I}/wn7-behind-the-design.pdf',
    f'{U}/Design Decision Log.pdf': f'{I}/wn7-design-decision-log.pdf',
}
ASSETS = {}  # images are embedded in each HTML (item 160), so no assets/ folders ship
src_to_pkg = {os.path.basename(v): k for k, v in FILES.items()}
def rel_href(from_pkg, to_pkg):
    r = os.path.relpath(to_pkg, os.path.dirname(from_pkg))
    return '/'.join(quote(part) for part in r.split(os.sep))
stage = f'{out}/{root_name}'
shutil.rmtree(stage, ignore_errors=True)
changes = {}
for pkg, src in FILES.items():
    dst = f'{stage}/{pkg}'; os.makedirs(os.path.dirname(dst), exist_ok=True)
    if pkg.endswith('.html'):
        s = open(src, encoding='utf-8').read(); n = 0
        def fix(m):
            global_n = None
            target = m.group(2)
            if target in src_to_pkg:
                return f'{m.group(1)}"{rel_href(pkg, src_to_pkg[target])}"'
            return m.group(0)
        s2, n = re.subn(r'(href=)"(wn7-[\w.-]+\.(?:pdf|html))"', fix, s)
        import base64, mimetypes
        def inline(m):
            f = os.path.join(D, m.group(2)); mt = mimetypes.guess_type(f)[0]
            return f'{m.group(1)}"data:{mt};base64,{base64.b64encode(open(f, "rb").read()).decode()}"'
        s2, k = re.subn(r'(src=)"(assets/[\w.-]+\.(?:png|jpe?g))"', inline, s2)
        assert 'src="assets/' not in s2, pkg
        unresolved = re.findall(r'href="(wn7-[\w.-]+\.(?:pdf|html))"', s2)
        assert not unresolved, (pkg, unresolved)
        open(dst, 'w', encoding='utf-8').write(s2); changes[pkg] = n
    else:
        shutil.copyfile(src, dst)
# PDF links: Chromium wrote absolute machine paths for relative links (Interviewer's Note -> Decision Log).
# Repoint them to the packaged sibling with a standard cross-PDF link (GoToR); text and layout are untouched.
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, DictionaryObject, TextStringObject, ArrayObject, NumberObject
PDF_LINKS = {'wn7-design-decision-log.html': 'Design Decision Log.pdf'}
for pkg in [k for k in FILES if k.endswith('.pdf')]:
    path = f'{stage}/{pkg}'; r = PdfReader(path); changed = 0
    for pg in r.pages:
        for a in pg.get('/Annots') or []:
            a = a.get_object(); A = a.get('/A')
            if not A: continue
            A = A.get_object(); uri = str(A.get('/URI', ''))
            if uri.startswith('file:'):
                tgt = next((v for k, v in PDF_LINKS.items() if uri.endswith(k)), None)
                assert tgt and os.path.exists(os.path.join(os.path.dirname(path), tgt)), (pkg, uri)
                a[NameObject('/A')] = DictionaryObject({NameObject('/S'): NameObject('/GoToR'), NameObject('/F'): TextStringObject(tgt),
                                                        NameObject('/D'): ArrayObject([NumberObject(0), NameObject('/Fit')]), NameObject('/NewWindow'): __import__('pypdf').generic.BooleanObject(True)})
                changed += 1
    if changed:
        w = PdfWriter(clone_from=r); w.write(path); print(f'PDF links repointed in {pkg}: {changed}')
# guard: no packaged PDF may point at a machine-specific path
for pkg in [k for k in FILES if k.endswith('.pdf')]:
    for pg in PdfReader(f'{stage}/{pkg}').pages:
        for a in pg.get('/Annots') or []:
            A = a.get_object().get('/A'); u = str(A.get_object().get('/URI', '')) if A else ''
            assert not u.startswith('file:'), (pkg, u)
for folder, names in ASSETS.items():
    os.makedirs(f'{stage}/{folder}', exist_ok=True)
    for nm in names: shutil.copyfile(f'{D}/assets/{nm}', f'{stage}/{folder}/{nm}')
zp = f'{out}/{root_name}.zip'
if os.path.exists(zp): os.remove(zp)
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for dirpath, dirnames, filenames in sorted(os.walk(stage)):
        dirnames.sort()
        rel = os.path.relpath(dirpath, out)
        z.writestr(zipfile.ZipInfo(rel.replace(os.sep, '/') + '/', date_time=(2026, 11, 8, 12, 0, 0)), '')
        for fn in sorted(filenames):
            zi = zipfile.ZipInfo(f'{rel}/{fn}'.replace(os.sep, '/'), date_time=(2026, 11, 8, 12, 0, 0))
            zi.compress_type = zipfile.ZIP_DEFLATED; zi.external_attr = 0o644 << 16
            z.writestr(zi, open(f'{dirpath}/{fn}', 'rb').read())
print('links repointed:', {k: v for k, v in changes.items() if v})
print('zip:', zp, os.path.getsize(zp), 'bytes')
