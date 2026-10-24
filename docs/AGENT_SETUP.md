# Bộ skills Software CEO — AGENT-SETUP-002

Checkpoint LOCAL ngày 2026-10-21. Theo phê duyệt mới, bổ sung ceo-game-design và ceo-game-audio vào sáu skills đã có. Đây là thiết lập agent; không thay game, balance, art hoặc cấu hình global. W5 vẫn còn native Safari đầy đủ và human acceptance.

## Cấu trúc đã tạo

`AGENTS.md` ở project root dẫn tới tám `.agents/skills/<name>/SKILL.md`. Mỗi skill có `agents/openai.yaml` với tên hiển thị tiếng Việt, mô tả ngắn và prompt `$skill-name`. Automatic invocation giữ mặc định; không khai báo thêm model, tool dependency hoặc external plugin.

| Skill | Công việc chính |
|---|---|
| `ceo-game-design` | Vòng lặp chơi, meaningful choices, onboarding, progression và design brief |
| `ceo-game-audio` | Cue sheet, mix review, opt-in/mute/lifecycle và kế hoạch nghe thử |
| `ceo-simulation-economy` | Pure transitions, staff/WP, ba mô hình kinh doanh, ledger |
| `ceo-balance-playtest` | T0.3 controls, matched seeds, human observations |
| `ceo-canvas-v4` | Canvas camera/hit test/depth/animation, giữ baseline V4 |
| `ceo-ui-accessibility` | HTML management UI, EN/VI, keyboard/focus/UI scale |
| `ceo-save-recovery` | IndexedDB, slots, import/export, validation/migration/conflicts |
| `ceo-local-qa-handoff` | Gates theo rủi ro, evidence, checkpoint và ZIP khi được giao |

Mỗi skill nêu trigger/non-trigger, inputs/nguồn, owning files, workflow, guardrails, output, acceptance và ví dụ đúng/sai phạm vi. Path trong skill tính từ project root. Không sao chép GDD hoặc scripts sang skill. `skill-creator` là công cụ authoring dùng trong checkpoint; không import các Noah skills.

## Kiểm chứng thực tế

| Lớp kiểm chứng | Kết quả và giới hạn |
|---|---|
| Baseline ứng dụng | 275 protected files vẫn khớp baseline SETUP-001; không rerun npm verify/build ở checkpoint chỉ đổi docs/skills này. Verify trước sửa ở SETUP-001 đã PASS 46 tests/8 files + 3 harness, typecheck/lint/build; log cũ giữ nguyên. |
| Schema | `skill-creator/scripts/quick_validate.py`: 8/8 valid. UI metadata hợp lệ; 48 source references tồn tại. `evidence/agent-setup-002-validation.json`. |
| Runtime discovery | Codex app-server `skills/list`, explicit project cwd, `forceReload: true`: 8/8 scope `repo`, `enabled: true`, zero errors. `evidence/agent-setup-002-discovery.json`. |
| Cách áp dụng | Đã đọc hai skills mới và áp dụng thành `docs/GAME_DESIGN_SKILL_TRIAL.md`, `docs/GAME_AUDIO_SKILL_TRIAL.md`; chín tình huống có kết quả trong `evidence/agent-setup-002-scenarios.md`. Không phải independent review/automatic model selection. |
| Browser trial | Chrome 156.0.8078.47 context riêng, bảy nhóm checks PASS, zero console/page/HTTP errors: luồng tuần đầu, real Audio playback/volume/mute/reload và visibility emulation. 35 HTTP files khớp dist. `evidence/agent-setup-002-runtime-trial.json` và ảnh design-week. |
| Giữ ứng dụng/art/skills cũ | SHA256 đối chiếu 275 files, trong đó public/art-source 153 và dist 35; thêm 12 files của sáu skills cũ. `evidence/agent-setup-002-preservation.json`. |
| Full suites/human | Không chạy lại broad E2E matrix, soak, balance hoặc human acceptance; native Safari và người thật vẫn còn gate. |

Discovery được đo bằng process app-server cục bộ dùng CODEX_HOME tạm ở `/private/tmp/software-ceo-agent-setup-home`, không đổi cấu hình global, không tạo thread hoặc gọi model. Kết quả này chứng minh runtime parser/discovery theo project cwd. Chưa xác minh UI picker của cửa sổ desktop hiện tại hoặc automatic selection trong một model turn mới. Không cần yêu cầu restart dựa trên bằng chứng hiện có.

Validator dùng lại PyYAML 6.0.3 tại `/private/tmp/software-ceo-agent-validator` từ SETUP-001; không cài mới, đổi lockfile hoặc Python global. Ghi hai skills mới cần escalation vì sandbox bảo vệ `.agents`. Preview 4173 đã có sẵn: sandbox chặn truy cập/bind; lần bind có escalation xác nhận port đang dùng, sau đó chỉ đọc và so hash server hiện có. Không dừng/đổi server hoặc browser permissions.

Hai skills do dự án tự viết, tham khảo nguyên tắc community game-design/game-audio đã khảo sát; không cài bộ cộng đồng hoặc scripts ngoài. Rà audio phát hiện cash.mp3 có asset nhưng chưa có caller trong src; trial tuần đầu ghi tutorial vẫn hiện observe khi đi bằng footer. Hai quan sát này chưa phải quyết định sửa game.

## Lịch sử AGENT-SETUP-001

Sáu skills ban đầu + AGENTS.md được tạo theo phê duyệt “Approved agreement”; validator 6/6, 41 refs, discovery 6 repo/enabled zero errors; manual review 14 tình huống. Verify trước sửa PASS 46 tests/8 files + 3 harness, typecheck/lint/build. Bằng chứng `evidence/agent-setup-validation.json`, `agent-setup-discovery.json`, `agent-setup-scenarios.md`, `agent-setup-preservation.json`, `agent-setup-prechange-verify.log` giữ nguyên; không gọi kết quả này là lần verify mới.

## Sử dụng và bảo trì

Ví dụ yêu cầu: “Dùng `$ceo-save-recovery` kiểm tra stale-tab conflict” hoặc “Dùng `$ceo-balance-playtest` tổng hợp quan sát novice”. Tên có thể được chọn theo mô tả khi runtime cung cấp danh mục; AGENTS.md cũng dẫn đường đọc trực tiếp. Chỉ đọc các skill liên quan đến task.

Khi sửa skill: dùng `skill-creator`, validate YAML/frontmatter và metadata, kiểm refs, thử lại tình huống có thể đổi quyết định. Kiểm discovery bằng công cụ runtime hiện có; không giả định phiên bản tương lai giữ nguyên API. Tách file-authored, schema-valid, discovered và observed behavior trong receipt.

Checkpoint này chưa được đóng gói thành ZIP mới. `Software_CEO_LOCAL_W5_2026-10-21.zip` là archive CP6, không chứa bộ skills vừa tạo. Không upload/push/deploy; quyền LOCAL S0–W5 không bao gồm phát hành bên ngoài.
