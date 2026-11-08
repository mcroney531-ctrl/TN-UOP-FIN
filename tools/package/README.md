# Final packaging (item 159)

    python3 tools/package/build_package.py OUT_DIR          # -> OUT_DIR/WN7 Proposal Package.zip (+ staged folder)
    node tools/package/build_dana_docx.js "OUT_DIR/Dana Email Draft.docx"
    node tools/package/qa_offline_html.js "<extracted>/WN7 Proposal Package"

`build_package.py` copies the approved files under reader-facing names, embeds each HTML file's images as data URIs (so a page shows its images even if opened straight from the ZIP; no `assets/` folders ship), repoints only cross-file links (Resource Overview, Rollout Plan Overview, and the Interviewer's Note's link to the Decision Log) to their packaged locations, and refuses to build if a packaged PDF still points at a machine path. Final attachments are in `submission/`.
