# WN7 Needs Assessment & Planning organizer: PDF build

Builds `deliverables/wn7-needs-assessment-planning.pdf` (cover + four organizer stops, 11 pages). Decision items 157–158 in `UOPFIN-BTB/DECISIONS.md`.

- `src/*.gdoc.html`: the four stops as exported from Google Drive (folder "Northstar Migration", Nov 8). These are the source of truth for every word.
- `cover/`: the approved cover (no icon). Rebuild its PDF with `node cover/build-cover.js`.
- `overrides.json`: structure taken from the organizer screenshots that the Drive copy lost (stop 01's evidence column is a bulleted list). Words are never changed.

Rebuild (from this folder):

    for n in 01-lead-alignment 02-equipping-guides 03-rollout-reinforcement 04-ownership; do python3 simplify.py src/$n.gdoc.html src/$n.clean.html src/$n.txt; done
    python3 build.py 01 src/01-lead-alignment.clean.html build/01-lead-alignment.html organizer.css   # likewise 02, 03, 04 (build/ is git-ignored and recreated)
    node cover/build-cover.js
    python3 assemble.py cover/wn7-organizer-cover.pdf ../../deliverables/wn7-needs-assessment-planning.pdf
    python3 verify.py src/<stop>.gdoc.html src/<stop>.clean.html build/<stop>.html build/<stop>.nofoot.pdf 0   # word-for-word check

`verify.py` checks that the built page's text equals the Drive export in order, and that every word appears in the PDF.
