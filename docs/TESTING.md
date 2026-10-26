# Test setup, evidence and limits

## Simulate LOCAL — 2026-10-24

Entry game đã chuyển sang Simulate thống nhất. Tests E2E và profile dùng điểm tương tác/tìm kiếm trong văn phòng; xem [SIMULATE_RUNTIME.md](SIMULATE_RUNTIME.md) cho lệnh và bằng chứng mới. `scripts/profile-browser.mjs` nhận `CEO_BASE_URL` và `CEO_EVIDENCE_DIR`, kiểm hash whole-dist/fixture trước–sau; Chromium desktop dùng sandbox bật. `simulate.playwright.config.ts` giữ evidence từng lượt qua `CEO_E2E_RUN`, mặc định preview4186 và nhận `CEO_BASE_URL` cho server đang chạy.

Soak/stress/standalone selectors đã theo UI mới, nhưng các suite này **NOT_RUN** ở checkpoint Simulate. Không chạy test standalone trên file HTML cũ rồi coi đó là kết quả runtime mới; chỉ chạy khi đã có nhiệm vụ rebuild riêng. Các evidence lâu hơn bên dưới giữ giá trị trong phạm vi/build của chúng.

## Repeatable local checks

`npm ci` uses the committed lockfile. `npm run verify` runs TypeScript, ESLint, all Vitest tests and the Vite production build. `npm run test:simulation` runs the pure domain suites independently of a browser. `npm run test:content` validates catalog counts, IDs, localized copy, costs, references and initial scenarios. `python3 scripts/check-assets.py` validates the actual shipped atlas frames and GLB source references; install Pillow from requirements-art.txt if absent.

The 900-run command is `npm run test:balance`. It overwrites evidence/balance-900.json and .csv with seed-level results, group aggregates, a source digest and an explicit methodology. It is a headless simulation test, not a browser benchmark or beginner playtest. T0.2 is retained as historical evidence; T0.4 is the current balance version; T0.3 is retained for comparison.

## Dev dependency scan — checkpoint 008

`vite.config.ts` đặt `optimizeDeps.entries: ["index.html"]` để quét dependency từ entry game. Các trang HTML trong evidence/, art-source/ và docs/mockups/ không phải entry của ứng dụng. Giữ artifact chẩn đoán lịch sử; không cài tên script trong artifact như npm dependency. Khi cần xác minh cold start: `npm run dev -- --port 4183 --strictPort --force` và đọc đầy đủ log sau ready. Metadata optimizer có thể vẫn tồn tại khi một bước scan lỗi; kiểm cả scan error/warning và tải trang runtime. Phép kiểm cache riêng/receipt của bản sửa nằm trong evidence/vite-entry-scan/.

## Browser selection

`npm run test:e2e` defaults to the supplied Sparticuz Chromium binary on Linux. On macOS it defaults to the installed Chrome channel; on other platforms it defaults to Playwright's Chromium. Browser downloads must be installed or available for the selected target.

```bash
npx playwright install chromium firefox webkit
CEO_BROWSER=chromium npm run test:e2e
CEO_BROWSER=firefox npm run test:e2e
CEO_BROWSER=webkit npm run test:e2e
CEO_BROWSER=chrome npm run test:e2e
CEO_BROWSER=msedge npm run test:e2e
```

The environment-variable syntax above is for a POSIX shell; on PowerShell use `$env:CEO_BROWSER = "firefox"` before the command. Chrome/Edge channels require those actual browsers installed. WebKit on Linux does not establish native macOS Safari support. In the historic Linux environment those targets were unavailable; failed CDN logs are retained. Current macOS matrix evidence is recorded below and in local-browser-matrix.json.

For a production-build E2E pass, run `npm run build` and then:

```bash
CEO_BASE_URL=http://127.0.0.1:4173 npm run test:e2e
```

Tests use one worker to avoid simulation/input race noise. No tests are skipped to improve the reported result. E2E scenarios cover first-week play, contract-to-cash, Product release, Startup experiment/funding/focus change, three slots/autosave/reload/export/import/corruption recovery, locales, UI scale, keyboard, audio preferences, real two-tab stale-save conflict, denied storage and application visibility handling. The visibility test emulates a visibility event; it is not a native OS background-tab certification.

## Performance and persistence stress

With production preview on port 4173:

```bash
npx tsx scripts/make-qa-fixtures.ts
npx tsx scripts/make-profile-fixture.ts
node scripts/profile-browser.mjs
node scripts/stress-load-dom.mjs
node scripts/soak.mjs 30
```

The 12-staff fixture is built through ordinary game commands: play, earn revenue/funding, upgrade, hire, assign and advance time. It has no injected capital or altered scope. The separate profile fixture resolves a due event through a public command to provide an uninterrupted animation window.

`profile-browser.mjs` records requestAnimationFrame intervals, actual visible Canvas repaint counts, camera dragging, network payload, audio playback/mute, axe results and post-GC heap after view changes. Authored sprite poses have eight frames per second. Camera and walking interpolate on the display clock. The optimized renderer skips identical paused frames and redundant redraws between authored poses. A 60 Hz display clock is not a claim that each sprite contains 60 unique animation poses per second.

Run FPS profiling alone. The software-rendered headless browser can consume several CPU cores; concurrent browser tests distorted earlier 1080p measurements. Those earlier samples are diagnostic evidence, not the final target acceptance sample. GPU/decoded-image memory is not represented by the JS heap metric. Real consumer hardware and other native browsers still need their own measurements.

The soak alternates x1/x2/x4, cycles seven panels, changes viewport and camera, and imports the same fixture every four minutes to stress repeated loads and keep staffing comparable. Financial/event auto-pauses remain part of the real app. It measures 30 actual wall-clock minutes, not merely 30 simulated minutes; it is not an uninterrupted single-company campaign.

### Avoid a measurement trap

The CDP path used by Playwright's native file upload retained detached DOM nodes in inspector-native structures during repeated imports. A heap snapshot and a File/DataTransfer control identified the difference: 16 CDP uploads accumulated 479 listeners, while 16 equivalent imports using a real File and the input change event held 242 listeners and 335 DOM nodes after warm-up. The native upload path is still covered by E2E. Memory/soak uses the latter input path to avoid measuring inspector-retained nodes as app leaks. The save dialog also closes its captured element during layout cleanup, before removal.

## Static and standalone checks

`node scripts/repro-build.mjs` builds from fresh npm ci in a temporary directory and compares every dist file, including source maps. Remove obsolete generated hashed chunks before the final comparison if a file-sync environment restores deleted build outputs. Do not omit a mismatched current entry file from the comparison.

`npm run build:standalone` embeds the same production code, PNG/WebP and MP3 into PLAY_SOFTWARE_CEO.html. `node scripts/test-standalone.mjs` opens it by file:// with networking disabled, exercises actual save/export/reload/import, and records its SHA256. The standalone wrapper is separate from the normal static-host distribution.

## Release evidence policy

Only actual outputs are marked PASS. Scripts existing on disk do not constitute executed tests. No bot run establishes novice usability, meaningful weekly decisions, expected 4–7 hour campaign duration, sound mixing quality, native Safari compatibility or universal hardware performance. These remaining gates are listed in RELEASE_CHECKLIST.md.

## Tiếp tục LOCAL macOS — 2026-10-21

- Dùng Node 24 LTS đã kiểm chứng (host mặc định Node 23.11 nằm ngoài engine range của Vitest và eslint-visitor-keys); không đổi lockfile/dependency. `npm run verify` chạy cả QA harness. Python 3 + Pillow cho kiểm tra art; không cần VTK để chơi/build/test game.
- `npm run test:assets` chỉ kiểm tra public metadata, không sửa V4. Chỉ authoring chủ đích mới dùng `python3 scripts/check-assets.py --update-metadata`; không dùng trong gate build cố định.
- Soak/profile/standalone/security smoke dùng `scripts/browser-runtime.mjs`: macOS mặc định channel Chrome; đặt `CEO_BROWSER=msedge` hoặc `chromium` khi phù hợp. CDP metrics chỉ hỗ trợ Chromium. E2E vẫn dùng cấu hình ma trận trong playwright.config.ts.
- Playwright Firefox/WebKit đã cài tại `/private/tmp/software-ceo-playwright` trên phiên này. Chạy với `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/software-ceo-playwright`; đường dẫn tạm có thể không còn sau cleanup/reboot. Firefox là bản automation của Playwright, không phải ứng dụng Firefox cá nhân. WebKit không phải native Safari.
- macOS WebKit dùng Option-Tab (`Alt+Tab`) để duyệt các nút khi giữ mặc định bàn phím; Chrome/Edge/Firefox dùng Tab. Bằng chứng so sánh: local-webkit-keyboard-diagnosis.json. Test giữ nguyên assertion nút nhận focus.
- `node scripts/soak.mjs 30` chỉ nhận 30–60 phút. Kiểm tra đủ mẫu/thời gian thực, lỗi console/page/HTTP, SHA256 toàn bộ dist ở đầu/cuối. Đọc chuỗi heap/nodes/listeners sau warm-up; PASS tự động không chứng minh mọi host không có leak. Không sửa/rebuild dist trong lượt đo.
- `npm run test:balance:markets`: 1200 Product/Startup runs trên Creator/Creative và Team/Education. `npm run test:balance:policy`: 270 lượt ghép seed, giữ quote/team/scope response/cadence. Xem giới hạn và kết quả ở BALANCE_REPORT.md.
- `python3 scripts/package.py Software_CEO_LOCAL_W5_2026-10-21.zip --output-dir /private/tmp` tạo ZIP ngoài root, xác minh CRC/entries và sidecar SHA256/JSON; không ghi đè delivery cũ. Không upload/push/deploy.
- Native Safari WebDriver bị chặn do Allow remote automation chưa bật; Canvas/create/save/reload/Continue/native file import smoke có phạm vi riêng trong evidence/local-native-safari-smoke.json. Canvas native chưa được xác minh. PLAYTEST_PROTOCOL.md là phiếu để thực hiện, không phải bằng chứng đã có người tham gia.

Phiên bản automation đã cài theo Playwright 1.56.1: Firefox 142.0.1 (v1495), WebKit 26.0 (v2215). Không suy ra đã kiểm app Firefox cá nhân hoặc mọi phiên bản mới hơn. Chrome/Edge channel dùng app đã cài trên máy; xem version trong local-browser-matrix.json.

Python hệ thống trên host này chưa có Pillow. Art QA đã chạy bằng `/Users/khiemnguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/check-assets.py`; không cài Python dependency global. Kiểm tra này chỉ đọc art và ghi evidence.

## T0.4 /24h — chạy evidence riêng

Các suite balance/profile/soak nhận CEO_EVIDENCE_DIR; Playwright nhận CEO_E2E_RESULTS và CEO_TEST_OUTPUT. Dùng thư mục mới để giữ lịch sử. Node --import tsx scripts/balance.ts tương đương npm test:balance khi sandbox không cho tsx mở IPC pipe. Không tắt sandbox browser.

Lượt tích hợp2026-10-26 dùng production127.0.0.1:4194 (originQAriêng), Edge. Profile nhận CEO_PROFILE_FIXTURE/CEO_PROFILE_DPR; soak nhận CEO_SOAK_FIXTURE và giữdist. Các fixture 12 nhân viên/mưa gió được tạo bằng publiccommands, trace riêng. scripts/intraday-memory.mjs là chẩn đoán sau soak, tách khỏiFPS; CEO_MEMORY_CONTROL=1 chuyển targetPlaywright sangCanvas để kiểm retainedpanel.

Kết quả: docs/TIME_24H_INTEGRATION_REPORT.md và evidence/time-24h/integration-2026-10-26/receipt.json. Giữ các lượtFAILbanđầu/launchblocked; không cộngrerun thànhseed/testđộc lập. Runtime Firefox/WebKit trong tmp đã thiếu file ởphiênnày, khác bằngchứng2026-10-21. Nativehidden chưa xác minh vìprobe trảhidden=false.
