# SOFTWARE CEO — GPT-6 PRO FULL GAME EXECUTION PROMPT
## Build · Ship · Survive | Browser-First | Production-Grade Playable MVP

**EXECUTION MANDATE:** You are GPT-6 Pro acting directly as the complete in-chat game production team. Implement, create assets, test, debug, polish, package, and verify the actual Software CEO game. Do **not** delegate to Codex, another coding agent, or a hypothetical engineer. Do not turn this into a plan-only exercise.

**Communication:** Speak to the project owner in Vietnamese. Source code, technical symbols, identifiers, and structured technical documents may use English. Write concise, exact technical notes and make actual files/results the primary output.

## 0. APPROVED DECISIONS — DO NOT REOPEN

The owner has already approved the following:

- **Game:** Software CEO — a full, playable **Balanced Tycoon** where the player is CEO of a software company. Three starting strategies are **Product**, **Outsourcing**, and **Venture Startup**. These share one simulation core, permit a limited secondary business and quarterly strategic transitions.
- **Audience:** mainstream tycoon players, not only software professionals. A beginner should understand important decisions and consequences without technical jargon.
- **Runtime:** browser-first, desktop-first; open a URL to play, no installation, launcher, login, or required backend. **Native HTML Canvas 2D** renders a 2.5D isometric sprite world; HTML/CSS/React provides management UI. Do not silently replace Canvas 2D with a 3D runtime, Unity WebGL, or unrelated engine.
- **Stack:** TypeScript, React, Vite, modular deterministic simulation, IndexedDB saves, export/import. Static build suitable for Cloudflare Pages or equivalent; publishing is separately controlled.
- **Visual baseline:** the **V4 developer + workstation** GLB and its actual render/sprite files included in the attached kit. The owner subsequently **accepted V4** as the stylistic/ergonomic baseline and approved expanding it. Its historic ZIP/README names saying `UNAPPROVED` refer to an earlier moment and do not revoke that user approval. V4 is **not proof of finished character rigging or animations**: those must be produced and tested.
- **Art quality:** polished stylized low-poly, not primitive-only blockout. Physically plausible human poses, correct head/neck/torso alignment, usable workstations, hands reaching keyboard/mouse, correct monitor direction, credible foot/chair contact, correct object occlusion, good composition. Never cheat character orientation to face the camera.
- **Scope:** a production-grade, fully playable **approved MVP**, NOT unlimited feature scope. The game needs polished meaningful gameplay, art, accessibility, persistence and release engineering; it does not need multiplayer, M&A, IPO, city simulation, LLM dialogue, detailed taxes or a backend.
- **Authorization:** this instruction **authorizes the full local development scope** from preflight through a release candidate (S0–W5). Milestone checks are **internal quality gates**, not repeated approval stops. The previous Codex-specific per-milestone approval rule is superseded **for this local execution**. Do not ask whether to begin or whether to proceed after a successful internal milestone. **No remote repo writes, paid service/API purchases, preview publication, production deployment, credential changes, or external releases without separate explicit permission.**

## 1. MANDATORY INPUTS AND SOURCE-OF-TRUTH ORDER

First locate, open, and inspect the attached files rather than trusting filename guesses:

1. `docs/GDD_v1.1_Web_Canvas.md` — authoritative gameplay, web platform, simulation rules, numbers, content, MVP scope, and DoD.
2. `docs/GDD_v1.0_Software_CEO.md` — supporting historical design details only where v1.1 is silent.
3. `art/Software_CEO_Art_Review_v4/models/01_workstation_typing.glb` — approved real 3D visual and ergonomic baseline.
4. `art/Software_CEO_Art_Review_v4/renders/01_isometric_hero_review.jpg` and `renders/02_ergonomics_side_review.jpg` — actual model-review renders.
5. `art/Software_CEO_Art_Review_v4/sprites/00_sprite_contact_sheet.png` — reference sprite exports from V4.
6. `docs/ART_BASELINE_APPROVAL.md` — later user approval and quality requirements that supersede the historical V4 README status.
7. Any existing project repository and its README, AGENTS.md, project rules, tests, licenses, and approved architecture decisions.

**Precedence:** latest explicit owner approval > this execution mandate > GDD v1.1 > GDD v1.0 > historic unapproved suggestions. If an existing repo contradicts approved rules, document the conflict and make the smallest safe implementation change. Do not silently change game design or throw away a functioning repository. Do not mistake concept-art collages from earlier rejected versions for the approved 3D sources.

If a file truly is absent, use file search or directory inspection first; report exactly what is missing. Do not invent measurements, downloaded assets, test results, citations or unavailable tools.

## 2. YOUR JOB IS TO EXECUTE — NOT TO GENERATE ANOTHER PROMPT

You own end-to-end delivery in the ChatGPT tool environment as:

- **Game Director & Systems Designer:** rules, progression, economy, content, balance, onboarding.
- **Technical Director & Principal Engineer:** architecture, codebase, deterministic simulation, persistence, maintainability.
- **Canvas/Frontend Engineer:** 2.5D renderer, camera, depth, hit-testing, interactive React UI.
- **Technical Artist & Animator:** actual usable V4-derived assets, sprite production, animation, asset QA.
- **QA, Accessibility & Release Engineer:** automated testing, browser validation, performance, security, documentation, build, release candidate.

**Do real work using actual available tools:** inspect files, write source, run tests/builds, create asset files, render inspectable images, run browser checks when supported, and package a runnable project. Do not output a list of suggested actions and stop. Do not create a Codex prompt.

A full game is multi-stage and may exceed one response/tool session. **Never claim you will continue asynchronously or produce a result later without being invoked again.** In each active turn do the maximum feasible substantive work and persist all outputs in the project workspace. If you reach a tool, runtime, or context limit, deliver the current runnable checkpoint plus an exact `SESSION_HANDOFF.md`, with files, completed tests, known failures, and next commands; subsequent turns can continue from these persistent artifacts. Do not announce success until verified.

**No approval friction for within-scope implementation:** do not use “shall I proceed?” at every milestone. Only ask when an essential inaccessible input or a materially new/unapproved decision makes progress impossible, or when separate permission is actually required (e.g., deploying, spending money).

## 3. DELIVERABLES THAT MUST EXIST ON DISK

Create or update a cohesive `software-ceo/` project containing:

```text
software-ceo/
├── package.json, tsconfig*, vite.config.*, index.html
├── src/
│   ├── simulation/         # pure TS: clock, RNG, state, commands, systems, selectors
│   ├── gameplay/           # product, outsourcing, startup, progression
│   ├── content/            # scenarios, employee archetypes, events, localization
│   ├── renderer/           # Canvas 2D isometric, camera, sprites, input, depth
│   ├── ui/                 # React HUD, screens, modals, onboarding, a11y
│   ├── persistence/        # IndexedDB, migrations, save validation, import/export
│   ├── audio/              # user-controlled music/SFX with mute and reduced motion
│   └── app/                # composition, lifecycle, command dispatcher
├── public/assets/         # licensed, optimized sprite atlases, audio, UI assets
├── art-source/             # approved V4 sources + own reproducible art source files
├── tests/                  # unit, domain invariants, replay, integration, UI, E2E
├── scripts/                # repeatable build, asset checking, balance runs
├── docs/                   # GDD copies, ADRs, player guide, controls, licenses
├── evidence/               # measured QA results and screenshots where possible
├── PROJECT_STATE.md
├── TASKS.md
├── SESSION_HANDOFF.md
├── CHANGELOG.md
├── ART_QA_REPORT.md
├── RELEASE_CHECKLIST.md
└── README.md
```

Adjust folder names when there is a good architectural reason, but keep responsibilities separate.

**Required runnable commands** (names may match package scripts): `dev`, `build`, `typecheck`, `lint`, `test`, `test:e2e`, `test:simulation`, `test:balance`, `verify`. Do not claim a command works unless you ran it successfully. If an existing repo uses equivalent commands, document the mapping.

**Final deliverable:** an editable source codebase **and**, when working via chat files rather than an accessible repository, a verified downloadable `Software_CEO_Web_Game_Release_Candidate.zip` containing the complete buildable project. The static `dist/` build should be included or reproducible from the README. No fake download links.

## 4. ENGINEERING ARCHITECTURE (IMPLEMENT, DO NOT ONLY DRAW)

Required data flow:

`Player Input → Validated Game Command → Pure Simulation Transition → New Game State + Domain Events → UI Selectors/Canvas Projections → Versioned Save`.

### Simulation Core

- Pure TypeScript; no DOM, Canvas, React, storage, browser clock or network dependencies in business rules.
- Versioned typed state, explicit validated commands, deterministic update order, seeded PRNG with restorable state, fixed-step **simulated days**.
- Time controls Pause, x1, x2, x4; one simulated day about five real seconds at x1 is GDD T0. Render frame rate never changes simulation outcome. Hidden tab pauses **without catch-up**.
- Separate animation/interpolation time and business-simulation time. Do not call unseeded `Math.random()` or `Date.now()` inside core outcome logic. Handle delayed effects and pending events reproducibly.
- Finance modeled using an auditable ledger. Distinguish `Cash`, `Revenue`, `Profit`, `Cash Flow`, `Accounts Receivable`, `Liabilities`, `Runway`. Invoices and accepted milestones are **not cleared cash**. Reconcile every debit/credit and payroll crisis.
- One work item may not complete twice; enforce assignment limits, no negative cash without explicit liabilities/crisis rules, no negative counts, all 0–100 stats bounded, no duplicate user conversion or equity dilution.
- T0 values and formulas from GDD, as real executable rules, not decorative KPI counters. Keep balancing parameters data-driven and versioned.

### Application and Rendering

- Application layer owns command dispatch, pausing, subscriptions, selectors, navigation, notification queue and saving. Never let a React button mutate state bypassing game commands.
- Native HTML Canvas 2D draws actual independent sprites/tiles with deterministic isometric projection, correct feet/ground anchors, world-space depth sorting and occlusion, pan/zoom, click selection, hover and contextual overlays.
- NPC visual state derives from employment and task state: idle, working, meeting, walking, alert. Cosmetic animation never adds Work Points.
- Cache static layers, manage DPR/backing resolution, avoid React render at every animation frame, use sprite batching/atlases or equivalent optimizations when justified by measured performance.
- All meaningful interactions also accessible through HTML panels, not tiny canvas click targets only.
- Prefer simple purposeful modules and established tooling; no speculative framework rewrites or unnecessary abstractions.

## 5. COMPLETE SIMULATION GAMEPLAY — ALL THREE PATHS

### Shared Company Systems

Implement company setup, company state, time, difficulty (Friendly/Standard/Tough), employee hiring/onboarding, skills/traits, monthly salary, morale/energy, burnout/overtime, assignments, work-point productivity, delivery policy, technical debt, defect creation/discovery, QA, refactoring, reputation, trust, three CEO Actions/week and emergency borrowing, standing policies, Promise Ledger, event warnings/delayed consequences, market signals, finance review, seasonal/progression unlocks, failures, wins, tutorial, campaign 36 months and continue-in-Sandbox.

**Operational details to preserve:**

- WP uses Skill, Role Fit, Morale, Energy, Focus, Process and Debt factors; maximum two assignments per employee in MVP.
- Onboarding has genuine week-one/week-two penalties. Senior productivity comes with meaningful payroll trade-offs.
- `Ship Fast` / `Balanced` / `Quality First` alter speed, bugs and debt with opportunity costs. Hidden bugs and post-release incidents must exist; progress 100% is not quality guaranteed.
- Monthly payroll, office expenses, marketing/hosting, booked revenue, invoice issue and actual cleared payments are different transitions. Cash shortage issues have a communicated 14-day payroll-crisis rule.
- Major events are contextual and rare enough to remain meaningful, normally preceded by reasonable signals. Every important decision has understandable consequences and history.
- Each week, a player should face at least one meaningful decision with multiple rational strategies rather than merely clicking through a deterministic optimal script.

### Outsourcing (first complete business vertical slice)

Fully implement:
`Lead → Qualification → Estimate → Quote → Contract (Fixed Price or T&M) → Assign & Deliver → QA → Acceptance → Invoice → Cleared Payment → Trust/Repeat Business`.

Include estimation variance with uncertainty shown to player, milestone progress, upfront deposit, 20/40/40 $30,000 starting sample, scope changes, Change Requests, budget/margin, client trust, late payments, overdue warnings, renegotiation, defects/support, cash crises. Acceptance and actual cash collection must remain separate. Demonstrate two viable strategies with different observed outcomes.

### Product

Fully implement:
`Customer Need → Feature Roadmap → Development → QA → Release → Leads/Conversion → Paid Customers → Subscription Billing → Churn/Retention → Reinvest`.

Starting T0: $70,000 cash; 2 staff; MVP product with 35 paid users at $79/month. Real effects for fit, feature targeting, defects, reliability, pricing, marketing, MRR, churn, support load and cash. Marketing cannot solve bad retention by itself; shipping more features cannot erase technical debt.

### Venture Startup

Fully implement:
`Hypothesis → Discovery → Experiment → Evidence → MVP → Freemium/Paid Traction → Funding Offer → Accept/Reject/Pivot → Growth/Runway`.

Starting T0: $100,000 cash, 2 employees, unvalidated idea. Experiments must generate evidence, not just arbitrary “+market fit”. Free and paid users tracked without duplication; one funding round max in MVP, term sheet and ownership dilution correct. Pivot costs time/resources. Funding increases cash but carries equity/control/commitment trade-offs.

### Interactions & Progression

At quarterly reviews allow changing the primary focus (CEO Action + clear confirmation), and one secondary line of business. Keep at most 12 employees, 2 active client projects, 1 owned product, 1 funding round, one active office. Include campaign outcome at 36 months, explicit game-over only when justified by a documented failure condition, and Sandbox continuation. Implement meaningful and testable stage progression and office tier unlocks.

## 6. CONTENT — ACTUAL PLAYABLE DATA, NOT EMPTY CARDS

Create and integrate at least the approved MVP content targets from GDD v1.1:

- 3 start playbooks, 3 market segments, 5 functional employee roles.
- 24 employee archetypes with seedable traits/skills/names.
- 6 contract templates; Fixed Price and Time & Materials.
- 3 product concepts and 18 feature cards.
- 6 startup experiment cards and 3 investor term sheet types.
- 18 contextual event templates with 2–4 meaningful choices each, triggers, warnings, immediate/delayed effects and cause history.
- 2 office environments/tiers; 3 short challenge scenarios; 6 contextual tutorial steps.

Do not pad counts with copy-pasted names, fake outcomes or cards that do nothing. Content must be data-driven, localized EN/VI with usable copy, and connected to actual systems. Provide event, feature and scenario validation scripts.

## 7. APPROVED V4 ART — TRUE PRODUCTION ASSETS

**Approved baseline files** are part of the attached kit. Preserve actual authored provenance.

### Asset standard

- Stylized low-poly, **polished rather than crude geometric placeholders**. Consistent material/light/camera language and silhouettes.
- **Physical/anatomical checks**: developer seated facing the monitor; head/neck/torso/hips naturally aligned; both hands functionally placed; chair supports pelvis; feet and shoes on floor; no impossible rotations, leg/table penetration, mesh clipping or swapped-facing screens.
- Maintain correct workstation direction, consistent scale/camera/projection and anchors between 3D authoring and sprites.
- Previous AI collage concept art is NOT the approved 3D source and does not qualify as sprite evidence.

### Art deliverables

- Reuse and improve real V4 3D model sources; produce a coherent visual family for needed worker roles, multiple outfits/variations, furniture, meeting area, CEO area, pantry/lounge, office tiers, signage, plants and props.
- Build real game-readable animation cycles or technically equivalent authored frame sequences: at least idle, working/typing, walking, meeting/talking, alert. Add thinking/mouse use/transition actions as assets permit, without breaking postures.
- Render transparent sprites and stable atlases **from actual models or authored frames**, not isolated generated reference pictures. Include atlas manifest with sprite IDs, frames, directions, durations, pivots/foot anchors and bounding boxes.
- Test same employee/workstation from gameplay isometric angle AND side angle. Do not hide errors with camera tricks. Animate at working game zoom, not just enlarged showcase renders.
- Load actual integrated assets in Canvas; interactive furniture/NPCs must be separate objects and animate from game state; never use one giant pre-rendered office background to masquerade as a functional world.
- Audit licensing/origin and size/performance. Do not label static frames or repeated pictures as real animations. Do not declare asset PASS when model/animation/source is absent.

**Art process:** inspect V4 → upgrade one complete worker/workstation unit → render and physically review → create actual frames → test on Canvas → expand roles/furniture → office tiers → final optimize. V4 being approved does NOT mean every animation or all production art has been delivered.

## 8. PLAYER INTERFACE & ONBOARDING

Build functional—not decorative—HTML/React UI with:

- Main Menu: New Game, Continue, Load, Settings, Language, Credits.
- Choose strategy and difficulty, clearly show unique starting advantages/risks.
- HUD: Cash, relevant path KPI, reputation/morale, current objective, time/pause/speed.
- CEO Inbox, decisions with risks/costs/forecasts and delayed consequences.
- Office (Canvas), Work Board, People, Market, Finance, Strategy, Promise Ledger, Weekly/Monthly Reviews, Company History, Notifications.
- Recruitment, assignments, policy selection, contract negotiations, product backlog, experiment selection, funding, office upgrade and quarterly strategic transition.
- Game-over/campaign evaluation with explanation and replay/continue controls.
- Save/Load manager, 3 slots, export/import, recoverable errors.

**Player UX rule:** every important screen answers “What is happening? Why? What can I do?” Translate jargon, use meaningful graph captions, warn before major irreversible actions, include input/keyboard behavior and error/empty/loading states. Complete EN/VI localization; no overflow at 1280×720 and 1920×1080. Support UI scaling, keyboard focus, reduced motion and color-independent status cues. Tablet landscape is optional beta; do not claim polished mobile support unless tested.

## 9. LOCAL SAVES AND STABILITY

- Use IndexedDB with 3 player slots, manual saves, autosave each in-game week, durable schema version and migrations, import/export JSON and validation/checksum metadata.
- Preserve clock, simulation seed and PRNG state, pending/delayed events, Promise Ledger, invoices/collections, employees, assignments, role progression, all three business systems, scenario version and world state.
- Corrupted/unsupported saves produce recoverable messages; never silently reset company state. Export/import must pass round-trip tests.
- Hide tab pauses simulation without fast-forward. Handle resize, multi-tab conflicts, invalid commands, storage denied/full and asset failures without losing gameplay data.
- No auth, PII, tracking, ads, paid API or unnecessary networking in MVP. If optional analytics is proposed, keep it disabled and seek permission.

## 10. GAMEPLAY TESTING, BALANCE, PERFORMANCE & SECURITY

### Mandatory automated tests

- TypeScript typecheck, lint, production build, domain-unit, command/reducer, scenario integration, replay, finance reconciliation, seeded events, UI behavior, IndexedDB migration/import/export, art metadata validation, E2E if browser automation available.
- Deterministic replay: same seed + actions + save/restore yields exactly the same state and events regardless of FPS. Snapshot/digest comparisons.
- Finance and domain invariants: no phantom cash, no duplicate payroll/payment/release, no negative headcount/customers, no multiply-assigned hidden capacity, no double-counted free/paying users, correct ownership percentages and event due dates.
- 3 initial strategies start and finish a logical scenario; 36-month campaign evaluation reachable. Exercise failures and recovery (all staff leave, cash runs out, no customers/contracts, failed QA, storage errors).
- End-to-end paths: outsource contract from lead to cash, product release to paid subscriber to churn, startup experiment to funding/dilution, quarterly path transition, manually saving and reloading.

### Balance

Run **at least 900 seeded automated game runs** covering `3 strategies × 3 difficulties × 100 seeds`, using documented bots/decision scripts. Track victory, survival, cash, debt, defects, churn, margin, morale, crisis, event frequency, fairness and exploit loops. Test conservative/balanced/aggressive policies as meaningful subsets or additional runs. Fix exploitable or hopeless systems without hiding GDD changes; record revisions and rationale.

### Browser and performance

- Visually inspect actual Canvas and UI states using browser tools if available; captures are evidence, not substitutes for working logic.
- Chrome, Edge, Firefox and desktop Safari are targets. Where actual native Safari is unavailable, state that fact (Playwright WebKit is not identical to native Safari).
- Target smooth 60 FPS desktop with up to 12 NPCs at 1280×720 and 1920×1080. Measure actual FPS/jank; don't claim performance without measurement. Target first-play transfer below 15 MB; report actual asset and bundle weight.
- Test tab visibility, DPR, resizing, keyboard/pointer input, animation speed, zoom/pan/hit testing, overlays, audio mute, reload, 30–60 minute soak when feasible.
- Fix memory leaks, listener duplication, uncaught errors, unsafe HTML injection, untrusted save imports, package vulnerabilities and broken paths.
- License audit: all assets must have clear ownership or a compatible license; credit as required. No copied proprietary game artwork.

### Completion bar

Every promised UI action must work. No debug widgets in release, fake charts, static counters posing as simulation data, placeholder art passed off as final, duplicated animation frames passed off as animation, hidden broken buttons, disabled tests or “happy-path-only” play.

## 11. EXECUTION MILESTONES — AUTONOMOUS LOCAL WORK

Complete in this sequence; **do not require another approval to move between phases inside the already authorized local scope**. For each stage, create working artifacts, run tests and update `PROJECT_STATE.md` and evidence. If a milestone fails, repair it before expanding scope.

### S0 — Inspect & Resolve

Inspect GDD, source art, existing repository, installed tools, render/browser availability; write a concise architecture, risks, asset inventory, feature-to-test traceability and local tool setup. **S0 is a short launchpad, not the deliverable. Continue directly to W0 when feasible.**

### W0 — Canvas/React Foundation

Buildable Vite + React + TS project, isometric Canvas stage, separate NPC/workstation sprites from V4, camera pan/zoom, selection/panels, correct depth sorting and basic animation preview. `dev`, `build`, typecheck and smoke launch pass.

### W1 — Deterministic Graybox

Playable 15–20 minute loop: start company, assign employees, work points, policies, cash/payroll, 3 CEO decisions with delayed effects, weekly review; seed + command replay; actual QA tests on core and ledger. No decorative fake mechanics.

### W2 — Complete Outsourcing Vertical Slice

Fixed Price and T&M lead-to-cash, QA/bugs/debt, contract milestones, change requests, trust, delayed collection and crises. Two demonstrably different valid strategies; automated E2E and visual evidence.

### W3 — Shared Three-Path Playable MVP

Product, Startup and Outsourcing run on same architecture, all three gameplay loops, cross-path business, multiple difficulties, full 36-month campaign evaluation, victories/losses and Sandbox continuation. Seeded scenario playthroughs succeed.

### W4 — Full Art, Content, UX & Persistence

Replace graybox visuals with assets aligned to V4; actual sprites/animation; two coherent office tiers; complete specified content counts; functional management UI and tutorial, localized EN/VI, audio/mute, 3 save slots, schema migrations, import/export and challenge modes. No production-scope placeholder content.

### W5 — Production-Grade Release Candidate

Run/fix quality gates, 900-run balance suite, regression, accessibility, supported-browser checks, reproducible build, bundle/profile/security/license reports, in-browser 30–60-minute soak when possible; create `RELEASE_CHECKLIST.md` with **PASS / FAIL / NOT TESTED / BLOCKED** and actual evidence. Generate project ZIP and build. **STOP before publication**; request explicit permission for hosted preview/production.

### W6 — Hosted Preview / Production (separately authorized only)

After the owner explicitly authorizes the environment and action: publish a preview, test a real HTTPS URL and all three playbooks, verify routing/cache/headers/save behavior, and separately request production approval. Do not assume permission for hosting, GitHub push or public release merely because source implementation was authorized.

## 12. STATE MANAGEMENT AND CONTINUATION ACROSS CHAT TURNS

Persist and update at each working checkpoint:

- `PROJECT_STATE.md`: milestone, verified features, known issues, commands and outputs.
- `TASKS.md`: prioritized tasks with DONE/IN PROGRESS/BLOCKED, references to actual files.
- `SESSION_HANDOFF.md`: exact resumption steps, critical decisions, tests to rerun, last generated artifacts, current blockers.
- `CHANGELOG.md`: architectural/gameplay changes and why; record GDD deviations in ADRs.
- `evidence/`: text test logs, reports, screenshots/video only if genuinely produced.

When a turn ends before the full game is done, produce a **usable code/art checkpoint**, not a promise to do invisible background work. In a new ChatGPT turn, resume from the persisted state and real source files without redoing earlier work, when they are accessible. If context/files are not accessible, request the last project ZIP only when needed.

**Never say “finished”, “production-ready”, “tested”, “deployed”, or “playable URL” without verifiable evidence.** Separate implemented, visually reviewed, tested, not tested, and blocked. Prefer honest partial completion to fake full completion.

## 13. REQUIRED RESPONSE / EVIDENCE FORMAT

Every substantive checkpoint should show:

1. **What is playable now:** specific player actions working end-to-end.
2. **Files delivered:** real project paths and downloadable artifacts if generated in the present session.
3. **Tests executed:** exact commands, actual pass/fail, skipped.
4. **Visual/Canvas evidence:** real screenshot/preview artifacts or explicit NOT TESTED.
5. **Simulation validation:** seed(s), replay, ledger invariants and resolved issues.
6. **Issues and remaining scope:** specific and prioritized.
7. **Next execution step:** implement the next within-scope task automatically while tools/session permit; do not ask routine permission.

**At the final local release-candidate checkpoint:** link to a verified source-project ZIP, give real run/build instructions and an honest release checklist; request permission only for W6 hosting/deployment.

## 14. START EXECUTING NOW

Extract the supplied kit. Read the authoritative GDDs and inspect the **actual V4 model/render/sprite files** first. If an existing project source exists, inspect and continue it; otherwise initialize `software-ceo/`.

Create a short S0 decision/risk record and immediately begin W0 in the same active work session. **Write files and produce a working Canvas-based browser project. Do not stop after architecture planning.** Continue implementing W1–W5 using the scope and quality gates above as far as the available tools and session allow, preserving runnable checkpoint artifacts for continuation.

You are not tasked with recommending an agent, writing another plan, or creating a prompt for Codex. **You are tasked with directly delivering the actual Software CEO game.**

**North Star:** A typical in-game week gives the CEO at least one understandable, consequential choice. Several weeks later the game tells the player what changed, why it changed, and how their earlier choice contributed. The isometric office makes the company feel alive; the deterministic simulation makes it a real game.
