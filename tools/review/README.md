# Review annotation pages

Self-contained pages used for the user's editorial reviews: select text, add a note, then copy or download all notes (with the document's current text) to take to GPT.

- `dana-email-notes.html`: Dana's pre-read email (text as of item 135; the email has changed since, so refresh the text before reuse).
- `interviewer-docs-notes.html`: the Interviewer Note (with the expanded harness section) and the Decision Log, as of item 139. Refresh before reuse.

To make a new one: copy either file, replace the document markup inside `<div id="email">…</div>` (the interviewer version wraps each document in `<section class="doc" data-doc="Name">`), and change the `KEY` storage name in the script so old notes don't carry over. Publish it as an artifact with the `downloads` capability declared; the Download button only appears where the viewer grants it. Notes are stored in the viewer's browser only.

- `resource-overview-preview.html`: preview-only copy of the Resource Overview for the claude.ai artifact. The viewer blocks new tabs, so the `Open…` links show each deliverable in an in-page viewer (PDFs mapped to their `-print.html` pages). Publish it as `index.html` alongside the deliverable files and their `-print.html` pages. Never ship it; the ZIP uses `deliverables/wn7-resource-overview.html`.
