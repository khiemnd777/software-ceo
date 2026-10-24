# Changelog

## 0.9.0 — local playable candidate, balance T0.3

### Game

Implemented the shared deterministic company engine and all Product, Outsourcing and Startup loops, including work/QA/defects/debt, people and onboarding, integer-cent double-entry-style reconciliation, payroll crisis/recovery, contract quote/changes/acceptance/invoices/collection, subscription/support, experiments/MVP/funding/pivot, secondary business, quarterly focus, campaign/Sandbox and three challenges.

### Content and presentation

Integrated 24 employee archetypes, five roles/eight traits, six contracts, three segments/concepts, 18 features, six experiments, three terms, 18 contextual events and six tutorial steps. Added EN/VI management UI, keyboard/camera controls, UI scaling/reduced motion, original music/cues, two offices and actual V4-derived animation (480 explicit 3D-rendered frames).

### Persistence and robustness

Added three IndexedDB slots, weekly autosave, SHA-256 JSON export/import, defensive schema/reference/ledger validation, v1 migration, size/depth limits, stale-tab revision protection and storage-error recovery. Switched validation to Zod's jitless mode for CSP without unsafe-eval. Closed save dialogs during layout cleanup before detachment.

### Corrections found during testing

T&M now bills actual productive effort and closes the final partial week once. Exhausted QA cannot farm XP or billable effort. Quotes always recalculate from the original template. Delayed unaffordable effects create balanced liabilities. Support consumes real employee capacity; segment price/quality expectations and friendly research traits are connected to simulation. All progress bars have accessible names and observed contrast/focus defects were fixed.

### Rendering and release work

Cropped transparent sprite margins and skipped unchanged Canvas frames while retaining smooth walking/camera interpolation. Added seeded balance reports, production E2E, asset checks, actual browser video, offline single-file build, dependency notices, CSP smoke, reproducible-build comparison and safe archive packaging. Native cross-browser and human balance/usability gates remain open; this is not a production-approved release.

## 2026-10-21 — tiếp tục W5 LOCAL trên macOS

- Giữ toàn bộ V4 art và gameplay/balance T0.3; bot có đầu vào concept/segment tùy chọn để mở rộng đo cân bằng.
- Chạy lại 900 Retail campaigns; bổ sung 1200 Creative/Education campaigns và 270 policy runs ghép seed. Kết quả/giới hạn ở docs/BALANCE_REPORT.md.
- Sửa favicon 404; regression bootstrap kiểm tài nguyên, console và pixel Canvas thật. Điều hướng E2E WebKit dùng Option-Tab đúng mặc định macOS, giữ assertion focus.
- Portable Chrome/Edge browser harness cho soak/profile/offline/security trên macOS; strict soak gate theo thời gian thực/mẫu/whole-dist hash, có ba regression tests.
- Art validator mặc định read-only; packager xuất ngoài root với CRC/SHA256, chặn self-inclusion và ghi đè.
- Chọn Node 24 qua .nvmrc; khai báo engines khớp dependency hiện có, không nâng package version. Không global config, remote push, upload hoặc deploy.
- Native Safari còn gate visual/full validation; human novice/campaign/audio/screen-reader/art acceptance vẫn mở. docs/PLAYTEST_PROTOCOL.md là phiếu chưa thực hiện.
