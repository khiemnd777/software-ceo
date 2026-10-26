# Feature-to-test traceability

State labels refer to implementation and actual evidence, not certification on every target browser. See RELEASE_CHECKLIST.md for final gate decisions.

## T0.4 /24h — 2026-10-26

Evidence mới tại evidence/time-24h/integration-2026-10-26/.105 unit+3 harness,46 Edge E2E,900/1200/270simulation,profileDPR1–2 vàsoak30 phút 23,8 giây PASS. Human/owner acceptance vàcờOutsourcingToughOPEN. Firefox/WebKitlaunchBLOCKEDthiếu runtime; native hidden-tabNOT_RUN. Không dùng số cũ bên dưới để thay bằng chứng của build này.

| Yêu cầu mới | Implementation | Kiểm chứng |
|---|---|---|
| 96quarter/ngày, ca/OT/health, RNG/caps, cents/forecasts | simulation/clock,workStatus,health,accrual,work,engine,finance,selectors; gameplay/progression | intraday*,app-clock; replay2/7/30/90; ba playbook1080; rate/tier/hire/budget/carry |
| v3 và legacy period/backup/quota/conflict | persistence/schema,saves; SaveManager | persistence/intraday; intraday-save E2E export byte gốc; slots/stale/denial/import |
| Clock15/trời-liên-tục/weather5/switch/monitors/beams | Office,officeOverlay,renderer/lighting | intraday E2E12layout; office-displayghế/8pose; protected301SHA; nativeảnh12 nhân viên |
| Lifecycle/hiệu năng | GameStore/App/Office; profile/soak harness | emulatedhidden/sleep PASS;8profile samples60FPS;30min30samplesSHA; memorycontrol |

## Ma trận lịch sử và các nhóm chức năng giữ lại

| Requirement | Implementation | Verification / evidence |
|---|---|---|
| Simulate thống nhất, hồ sơ dự án, phân công thủ công/draft/batch, quản lý theo người/địa điểm; chọn xem không ghi campaign, nhắc thu không tăng cash | ui/SimulateWorkspace.tsx, ProjectDossier.tsx, ContractDetail.tsx, simulateModel.ts, projectView.ts; Panels.tsx/BusinessPanels.tsx | simulate-ui.test.ts; 30 E2E Edge, gồm work-unified/management-workspace/people-roster/command-center; evidence/simulate-runtime/delivery/; docs/SIMULATE_RUNTIME.md |
| HUD icon+số, tooltip pointer/keyboard, tutorial một dòng/giải thích nổi; giữ state và completion policy | ui/TooltipButton.tsx, SimulateWorkspace.tsx, Tutorial.tsx, common.tsx, simulate.css | compact-hud.spec.ts;35E2E Edge;36tổ hợp VI/EN/UI100–150;docs/COMPACT_HUD_INTEGRATION.md;evidence/compact-hud/integration/ |
| Three starting playbooks and shared rules | simulation/create.ts; gameplay modules | three-paths.test.ts; 900 campaigns |
| Deterministic RNG, command rollback, immutable input | simulation/helpers.ts, engine.ts | core.test.ts; app-clock.test.ts; adversarial.test.ts |
| 3 weekly actions, emergency borrowing | simulation/commands.ts, engine.ts | core.test.ts; mixed-command adversarial tests |
| WP, two assignments, onboarding, skills/traits, health | simulation/work.ts, commands.ts | core.test.ts; support-events.test.ts; 12-staff fixture |
| QA finds, Dev fixes, quality gate, debt | simulation/work.ts | contracts.test.ts; Product and Startup E2E |
| Fixed-price 20/40/40, deposits/revenue/AR/cash | gameplay/contracts.ts; simulation/finance.ts | contracts.test.ts; contract-to-cash E2E |
| T&M actual effort, partial week and budget cap | gameplay/contracts.ts; WorkItem.effort | contracts.test.ts; support-events.test.ts |
| Changes, trust, repeats, late collection | gameplay/contracts.ts | contract tests; 900 Outsourcing campaigns; deadline staffing trace |
| Payroll crisis, 14-day deadline, loan recovery | simulation/finance.ts | core/contracts tests; passive insolvency; outcome E2E |
| Product fit/features/pricing/marketing/retention | gameplay/product.ts; content/products.ts | three-paths and support tests; Product release E2E; 300 Product campaigns |
| Real support workload | productDay; simulation/work.ts | queue/capacity tests; long-run staffing demand |
| Experiments, samples, evidence, MVP, funding/equity | gameplay/startup.ts | three-paths.test.ts; Startup funding E2E; 300 Startup campaigns |
| Pivot, secondary business, quarterly focus | gameplay/startup.ts, progression.ts | domain tests; quarterly transition E2E |
| 36-month outcome and Sandbox continuation | gameplay/progression.ts; App.tsx | 900 outcomes; three outcome E2E fixtures |
| Office unlock and 12-person limit | commands.ts; renderer/Office.tsx | command tests, public-command QA fixture, actual Canvas capture |
| 18 events, warnings, choices, delayed effects/promises | content/events.ts; simulation/events.ts | support-events.test.ts; validate-content.ts; repeat/replay tests |
| 24 employees, 6 contracts, 3 concepts/18 features | content modules | content-validation.json; catalog references and meaningful effects |
| 6 experiments, 3 terms, 3 challenges, 6 tutorials | content + UI Tutorial | content validation; challenge staffing and balance report |
| Native Canvas 2D, V4-derived separate sprites | renderer/Office.tsx; art scripts | real browser screenshots; canvas/profile checks; GLB and frame audit |
| Real animation and two office tiers | 480 frame atlas; pose selector | unique-pixel/source check; side renders; browser video |
| Keyboard/camera/desktop scaling, EN/VI | React UI and CSS | locale/scale/keyboard E2E; axe 7 views; DPR2 static smoke |
| Original music, sound controls, visibility handling | audio/player.ts; SettingsDialog | actual browser audio currentTime/readyState and mute checks; visibility unit/E2E |
| IndexedDB slots/autosave, SHA256, JSON, v1 migration | persistence modules | saves.test.ts; real download/reload/import E2E; standalone offline test |
| Multi-tab conflict, denied storage, malformed input | persistence + SaveManager | stale-tab E2E; denied-storage E2E; corruption/depth/10 MB tests |
| Rendering independent from simulation speed | GameStore and Canvas separate clocks | app-clock.test.ts; seeded save/future replay |
| Dependency audit and static security | lockfile, jitless schema, deploy example | npm-audit.json; dependency-inventory.json; local CSP smoke |
| Reproducible source/build/portable ZIP | scripts/repro-build.mjs; package.py | per-file dist SHA256 and archive CRC/manifest |
| 30-minute stability | scripts/soak.mjs | soak-30min.json when completed; scope and build digest recorded |
| Chrome/Edge/Firefox/native Safari | configurable Playwright targets | Available Chromium only; other targets BLOCKED/NOT TESTED on this host |
| New-player comprehension and sustained fun | Requires observed human playtest | NOT TESTED; bots and axe do not establish these outcomes |
