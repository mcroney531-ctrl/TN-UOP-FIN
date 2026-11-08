// Build 'Dana Email Draft.docx' from email/wn7-dana-pre-read-email.md (item 159). Words come from the markdown unchanged.
// Usage: node tools/package/build_dana_docx.js OUT.docx
const fs = require('fs'), path = require('path');
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, ShadingType, LevelFormat, Footer, PageNumber } = require('docx');
const md = fs.readFileSync(path.join(__dirname, '..', '..', 'email', 'wn7-dana-pre-read-email.md'), 'utf8').split('\n');
const NAVY = '0F2E5E', MUTED = '5A6376', FONT = 'Calibri';
function runs(text, base = {}) {            // **bold** and *italic* inline
  const out = []; const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g; let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const t = m[0];
    out.push(t.startsWith('**') ? new TextRun({ text: t.slice(2, -2), bold: true, ...base }) : new TextRun({ text: t.slice(1, -1), italics: true, ...base }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}
const body = [];
// status banner
body.push(new Paragraph({ shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F8EED6' }, border: { left: { style: BorderStyle.SINGLE, size: 24, color: '8A5A00', space: 8 } },
  spacing: { before: 0, after: 60 }, indent: { left: 120 }, children: [new TextRun({ text: 'DRAFT — NOT SENT', bold: true, size: 26, color: '7D5200', characterSpacing: 20 })] }));
let i = 0, inHeader = true, sawRule = 0;
for (; i < md.length; i++) {
  const l = md[i];
  if (l.startsWith('# ')) {           // document title -> line under the banner
    body.push(new Paragraph({ spacing: { after: 240 }, indent: { left: 120 }, children: [new TextRun({ text: l.slice(2), color: MUTED, size: 20 })] }));
    continue;
  }
  if (l.trim() === '---') { sawRule++;
    body.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D6DAE3', space: 1 } }, spacing: { before: 120, after: 240 }, children: [] }));
    continue; }
  if (!l.trim()) continue;
  const hdr = l.match(/^\*\*(To|From|Subject):\*\*\s*(.*)$/);
  if (hdr) { body.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: hdr[1] + ':', bold: true, color: NAVY }), new TextRun({ text: '\t' + hdr[2] })], tabStops: [{ type: 'left', position: 1100 }] })); continue; }
  if (/^\*\*[^*]+\*\*$/.test(l.trim())) {  // section label inside the email
    body.push(new Paragraph({ keepNext: true, spacing: { before: 240, after: 80 }, children: [new TextRun({ text: l.trim().slice(2, -2), bold: true, color: NAVY, size: 23 })] })); continue; }
  if (l.startsWith('- ')) { body.push(new Paragraph({ numbering: { reference: 'bul', level: 0 }, spacing: { after: 80 }, children: runs(l.slice(2)) })); continue; }
  if (sawRule >= 2) {                 // closing note after the final rule
    body.push(new Paragraph({ spacing: { after: 0 }, children: runs(l, { color: MUTED, size: 18 }) })); continue; }
  const isAttachment = l.startsWith('*Attachment:');
  body.push(new Paragraph({ spacing: { after: isAttachment ? 0 : 160, before: isAttachment ? 200 : 0 }, children: runs(l, isAttachment ? { color: MUTED } : {}) }));
}
const doc = new Document({
  creator: 'Learning Experience Design (fictional work sample)', title: 'Dana Email Draft — DRAFT — NOT SENT',
  styles: { default: { document: { run: { font: FONT, size: 22, color: '1D2433' }, paragraph: { spacing: { line: 288 } } } } },
  numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1260, bottom: 1260, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DRAFT — NOT SENT · Fictional work sample · Page ', size: 16, color: MUTED }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED })] })] }) },
    children: body }]
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(process.argv[2], b); console.log('wrote', process.argv[2]); });
