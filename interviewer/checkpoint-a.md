# Interviewer materials — Checkpoint A (content and structure, for review)

Not for Dana. Two interviewer-only documents, to be packaged outside Dana's three folders. Nothing below is final design; visual production waits for approval.

- **Part 1:** Interviewer Note draft, *Behind the Design: WN7 Recovery Strategy*
- **Part 2:** Design Decision Log, curated inventory of proposed entries
- **Part 3:** Source gaps, unsupported points and decisions for you

Source keys like `(D45)` point to items in `UOPFIN-BTB/DECISIONS.md`. They would appear in the Decision Log, not the Note.

---

# Part 1 — Interviewer Note draft

## Behind the Design: WN7 Recovery Strategy
*An LxD decision-making and reflection note*

### 01 — From request to performance problem

Dana asked for a five-minute video to help Guides handle upset callers without losing control of the conversation. She needed something practical for supervisors within days.

I treated the video as a proposed solution rather than a diagnosis. Before choosing a format, I worked through the Orbit call sample and operations data, the meeting notes and threads, Guide and Lead feedback, and the recovery guidance itself (BH-4419 and the Product Operations reference behind it).

The data pointed somewhere specific. In a systematic sample of 204 eligible General Care calls from September 21–30, 115 (56%) went through generic troubleshooting instead of recovery. Of the 159 with a serial check recorded, 70 still ended in generic troubleshooting.

That established a performance gap between identifying an eligible customer and completing the recovery. It didn't establish the cause. A recorded check doesn't show what a Guide saw or understood, and the qualitative sources pointed in several directions at once: unclear Plus answers, an Orbit result some Guides couldn't read, uneven access, inconsistent Lead messaging. Priya summed up one feedback session as "a search problem, an eligibility problem, a conversation problem, and a completion problem." Keeping the gap and its causes separate shaped everything after it.

### 02 — Five decisions that shaped the strategy

**1. Align Leads before expanding to Guides**

*Decision.* Make Lead alignment the foundation, and design Guide support to sit on top of it.

*Why.* Guides go to their Leads mid-call, and the release had already relied on Leads to pass the change along without equipping them. Two Leads said their Guides first heard about BH-4419 from a reviewer. If Leads give different answers, Guide training can't produce consistent calls.

*What it changed.* The first resource became a 25-minute working meeting built on two cases, followed by two one-page references Leads keep (a Quick Reference and Coaching Cues). The rollout sequence aligns each Lead before their own Guides start, and the Lead's role shifted from "pass this on" to diagnosing and coaching against one shared standard.

**2. Address performance, not just knowledge**

*Decision.* Treat the gap as a performance problem with learning and non-learning causes, not only an information gap.

*Why.* A Lead put it plainly: "People can tell you all five CLEAR steps in a quiz. The issue is the pivot from listening to acting." Several barriers weren't about knowledge at all: no approved answer for a pending Plus credit, an Orbit result some Guides couldn't locate, possible permission gaps. A video can communicate the process. It can't fix those.

*What it changed.* The package pairs learning with in-the-moment support (the Guide Call Path) and makes operational validation part of the plan: the Ownership Map names who must confirm Plus guidance, Orbit access and delivery before any Guide sees the materials. The video stayed in the plan as an optional, narrower Orbit tool walkthrough, conditional on an approved screen reference.

**3. Differentiate support by audience**

*Decision.* Design around what each audience has to do, not one course for everyone.

*Why.* Leads need to recognize good execution, diagnose a breakdown before coaching it, and tell a performance gap from an operational blocker. Guides need the next step at the moment of decision and a chance to practice the hard call before it counts.

*What it changed.* Leads get the meeting, Quick Reference and Coaching Cues. Guides get the Call Path and a short individual practice. The existing team huddle connects them, with one Lead-facilitated slide. The practice, *Make the Call*, deliberately centers on a **Not eligible** result: a customer whose symptoms fit the WN7 pattern but whose serial doesn't qualify. The Guide has to make and explain the decision without promising a recovery the policy doesn't support, because "the easy example always has a happy ending."

**4. Minimize operational disruption**

*Decision.* Treat time off the phones as a design constraint, not an afterthought.

*Why.* There are roughly 900 hourly Guides on rotating schedules, Specialist Care can absorb only a limited number of WN7 transfers, and Workforce warned that a broad session would push abandonment higher.

*What it changed.* Every component is small and fits existing routines: a 25-minute Lead meeting, reinforcement in huddles Leads already run, a 5–7 minute individual practice in scheduled work time (subject to Workforce scheduling), and a one-page Call Path for live calls. The aim was to minimize disruption without thinning out the support each audience actually needs.

**5. Pilot, evaluate, then scale**

*Decision.* Start with two or three representative Lead teams, subject to Workforce approval, and expand by wave only on evidence.

*Why.* The intervention depends on operational conditions that haven't been confirmed yet, and completion data alone wouldn't show whether calls changed. Marisol said she needed "a reason to believe it will work."

*What it changed.* The rollout plan has five phases, each closed by a proceed / adjust / pause decision. Expansion needs both Care leadership's judgment and Workforce's approval for each wave. Delivery measures are reported as reach, never as proficiency. Reducing avoidable escalations to Specialists is a hoped-for downstream benefit, not a demonstrated outcome.

### Beyond the five

These five decisions had the greatest influence on the overall strategy, but they represent only part of the design process. Additional decisions involving scenario selection, coaching structure, resource formats, operational constraints, and implementation details are documented in the accompanying **Design Decision Log** (`wn7-design-decision-log.html`).

### 03 — Intentional tradeoffs

- **The video wasn't the whole intervention.** I didn't rule it out; it became an optional, narrower tool walkthrough that depends on an approved Orbit screen reference.
- **No simultaneous launch.** A full-population rollout would have been faster to announce but would have cost phone time and given no way to learn what works first.
- **Existing huddles over another live exercise.** I had proposed a short Guide practice huddle; it was replaced with an individual digital scenario, keeping the team huddle and slide but removing a second Lead-run activity.
- **Lightweight, targeted resources over a course.** Each resource has one job and points to Beacon as the single authority, so nothing becomes a competing source of procedure.
- **Dependencies stay visible.** Where the case left something unresolved (a pending Plus credit, the follow-up expectation for an eligibility review case, the fallback when a Lead is unavailable), the materials name the owner who must confirm it rather than filling the gap.

### 04 — What I'd validate

- **Readiness.** Are Plus guidance, Orbit workflow and access, the Lead support route and fallback, practice delivery, and pilot scheduling confirmed by their owners?
- **Performance.** On reviewed calls, are Guides recognizing, verifying, deciding, completing, communicating and documenting as intended?
- **Operational impact.** Are complete recoveries increasing without unacceptable effects on handle time, wait and abandonment, or Lead and Specialist load?

A small pilot can surface problems and give directional evidence. It can't, on its own, prove the intervention caused an improvement, especially with a baseline whose eligibility was classified after the fact.

### 05 — What I'd do next in a real engagement

- Confirm policy and operational ownership, starting with Plus handling and Orbit access.
- Observe real Guide and Lead workflows instead of relying on meeting notes.
- Validate the Call Path, practice model answers and Lead materials with Quality and Specialist Care.
- Test usability with a few Guides and Leads, including screen-reader use.
- Agree the evaluation baseline and its limits with Quality.
- Pilot, gather evidence, and iterate before expanding.

None of this has happened yet; it's what the proposal sets up.

### 06 — How I worked with the coding-agent harness *(proposed addition — see Part 3, gap 1)*

I used Claude Code as the builder and source-checker, and GPT in a separate chat as a design reviewer. I made the decisions. Claude drafted, checked claims against the case packet and logged every decision with attribution ([You], [GPT], [Claude]) in a running decision log. Each deliverable went through build → review → targeted fixes → lock.

Examples of checks and corrections:

- **Headcount.** My brief said about 600 Guides; Claude flagged that the packet says 900 in two places. I corrected it.
- **Plus wording.** GPT suggested "Plus credit (if applicable)" for the huddle slide. Claude showed that Finance, PO-117 and the locked Call Path all require both parts for an eligible serial. We kept both required.
- **Attribution.** A brief attributed "not just a training problem" to a Guide; the source showed it was Priya's summary. The email quotes each accurately.
- **Thread Admin.** An early draft named Priya as the Lead thread Admin; she's a manager, not a Lead. It became "a participating Lead designated by Care leadership."
- **Inference.** The first Call Path draft claimed PO-117 specified a follow-up expectation; it doesn't. The audit (`CALL_PATH_AUDIT.md`) lists that and three other gaps instead of resolving them silently.
- **Test claims.** Browser checks are Claude's automated suites, reported as such. One reported pass count was corrected after a faulty test was found. No independent or screen-reader testing has been done.

### 07 — What remains uncertain *(proposed addition)*

- The root cause of the gap, and how it splits between knowledge, tool access, policy clarity and workflow.
- How well Leads themselves know the WN7 path; the packet has no baseline.
- How to handle a pending Plus credit, the eligibility-review follow-up expectation, and the Lead-unavailable fallback.
- Whether Sana can host the free-text practice natively.
- Whether the meeting, slide and practice change live calls. That's what the pilot is for.

### 08 — Closing reflection

The request was for a video. What the evidence described was a team being asked to carry out a new process, under time pressure, with partial answers and uneven support. I tried to design for that reality: understand what each person has to do on the call or in the review, give them support at that point, and set up a way to see whether performance actually changes. Producing content was the smallest part of the job.

---

# Part 2 — Design Decision Log: proposed inventory

Format per entry: **Decision · Rationale · Alternative or tradeoff · Design consequence · Status**. Status labels: *Designer decision* · *Proposed, needs approval* · *Required by case materials*. About 22 entries in 8 groups. Each draws on a recorded choice with a real alternative or correction; plain build steps are excluded.

**A. Needs assessment and problem framing**
1. **Separate Dana's need from her proposed solution** (D35). Video kept as an option, not ruled out. → Needs assessment before format.
2. **Run the workbook pass before setting priorities** (D64). Added the 70/159 cut and the warning that the 44% figure doesn't mean 44% of Guides need a video (D72 correction). → The Case B design and the email's evidence.
3. **Lock design targets before formats** (D65, D67). GPT's organizer structure was parked: no formats until each part's job was defined. → Five targets drove every resource.

**B. Lead alignment and coaching**
4. **Lead-anchored, but not a gate** (D45). GPT's three-layer model was noted but not adopted; Guide support develops in parallel. → Leads first, Guide practice not blocked.
5. **What Leads know vs. what they asked for** (D66). A Lead WN7 knowledge assessment was considered (GPT) and not adopted; calibration through realistic cases instead, because the gap looked like what reached Leads, not what they knew. → The 3-minute "verified current state" refresher.
6. **Meeting length: 20 → 25 minutes** (D69, D79). A trade against Lead-time evidence ("one Lead could spare ten minutes"); justified as one session that replaces fragmented coaching later. Agenda moved through four splits to 3 · 19 · 3. → Locked meeting plan. *Proposed; Workforce schedules.*
7. **Two cases, not three; no second Plus case** (D73, D80). The ineligible case moved to Guide practice; Case B is a labeled composite. → Diagnose-before-coaching practice.
8. **Excerpt bank became Coaching Cues** (D74, D76). Real excerpts only if Quality can supply verified recordings; otherwise illustrative lines, labeled. → One-page Coaching Cues.
9. **INVESTIGATE as a Lead response** (D105–106). Added because coaching before the cause is found is the mistake to prevent. → Quick Reference response key.
10. **Don't infer Orbit confusion from call timing** (D108). The "long pause / hold / transfer" signal was replaced with stated uncertainty. → Coaching Cues wording.

**C. Guide Call Path**
11. **One authority, one job per resource** (D76). The Call Path points to Beacon; it doesn't replicate it. → Short, non-procedural Call Path.
12. **Three branches, including No clear result** (D76, D84). Recovery-only paths teach "WN7 = replacement"; roughly half of WN7-product calls were ineligible. → Branching Call Path and slide.
13. **Don't fill policy gaps** (D110, `CALL_PATH_AUDIT.md`). Pending credit treated as not complete; follow-up expectation left to Product Ops; repeat-back softened, with the gap recorded. *Required by case materials; owner confirmation pending.*

**D. Practice and scenario design**
14. **Individual digital scenario replaced the micro-huddle** (D84, D87). Claude first read it as replacing the whole huddle; you kept the team huddle and slide. → The current Lead + Guide flow.
15. **Not eligible as the primary scenario** (D84, D111). Pending Plus left out to avoid unapproved wording. → *Make the Call*.
16. **Fictionalize openly** (D112–113). WN7 symptoms added to a documented ineligible call; labeled as fictionalized. → Scenario framing.
17. **No scoring; completion isn't competence** (D87). → Delivery reported as reach.

**E. Huddle and delivery**
18. **Slide is Lead-facilitated, lean, and keeps the Plus requirement** (D84, D130). "If applicable" rejected against Finance and PO-117. → The locked slide.

**F. Time, coverage and capacity**
19. **Specialist safety net routed through Leads** (D85). A Guide–Specialist side chat was considered and rejected for capacity and noise. Two separate approvals from Mateo; the Lead meeting comes first if only one is possible. *Proposed; needs approval.*

**G. Rollout, ownership and evaluation**
20. **Define success before the plan; no numeric targets** (D88–89). "Rubric" renamed to indicators, to avoid implying scoring. → Rollout plan p. 4.
21. **Baseline without deadlock** (D99). Where call evidence is missing, Quality states the limits instead of claiming indicator-level gains. → Evaluation approach.
22. **Confirmed vs. proposed vs. to confirm; three readiness tiers** (D122–124, D126). The Admin is needed only if the thread opens. → Ownership Map and Rollout Overview.

**H. Packaging and communication**
23. **Three front-door overviews before the detail** (D115–117, D131). Related Plans split out of the Resource Overview. → Three-folder ZIP.
24. **Email argues before it navigates** (D131–136). The named Guide quote was anonymized; "my needs assessment" framing; diagnosis softened so it doesn't put the cause on Guide capability. → The locked email.

---

# Part 3 — Source gaps and decisions for you

1. **The case brief requires harness and source content that this brief leaves out.** `00_START_HERE.md` asks the interviewer note to cover "how you worked with your coding-agent harness, which sources mattered, what you checked or corrected, and what remains uncertain," with concrete examples. I drafted sections 06 (harness, checks) and 07 (uncertainty). Without them the note would miss a required element. Keep, trim, or move into the Decision Log?
2. **"Which sources mattered"** is woven into sections 01–02 rather than given its own list. A short "Key sources" strip could be added: Orbit call sample; Sep 18 shift feedback; Sep 24 listening notes; PO-117 / BH-4419; Sep 10 approval call; Sep 19 workforce planning; Oct 1 CX check-in.
3. **Decision 4 says "approved work time."** Scheduling isn't approved yet (Workforce), so the draft says "scheduled work time (subject to Workforce scheduling)".
4. **Decision 3 cites "the easy example always has a happy ending"** (Rina, Sep 18, verified). It's a third Guide quote; drop it if you want the note lean.
5. **Timeline candour.** The log shows the five decisions weren't all made at once. Lead-first came early (D45, Nov 5–6), while pilot evaluation and expansion approvals came Nov 7. The note doesn't claim an order. **Candidate to confirm:** should the note mention that some decisions changed along the way (20 → 25 minutes, micro-huddle → digital scenario)? I included them in Tradeoffs and the log.
6. **Attribution in the log.** Many choices were GPT suggestions you adopted, or Claude flags you accepted. The log can carry [You] / [GPT] / [Claude] tags, as `DECISIONS.md` does (the case brief asks to distinguish your decisions from agent suggestions). Recommended: keep the tags, light-touch.
7. **Open from D84:** you parked which resource to treat as the primary learner-facing sample in the interview (Call Path or slide). Worth deciding before production; the note currently foregrounds the Call Path and practice.
8. **Packaging:** proposed folder `00 — For Interviewers (not part of Dana's package)` beside Dana's three folders, containing the note and log (HTML + PDF), with relative links between them. The Note could also link to `DECISIONS.md` as the full record (it's in a separate repo, so a copy would need to be included in the ZIP). Your call.

*Length: the Note draft is about 1,700 words, roughly 3 printed pages at the planned type size. Sections 06–07 add about 400 words; without them it fits in about 2–2.5 pages.*
