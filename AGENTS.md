# Software CEO — hướng dẫn LOCAL cho Codex

Trao đổi với Khiêm bằng tiếng Việt. Source/product copy giữ conventions EN/VI hiện có. Dự án là game desktop-first TypeScript/React/Vite, Canvas 2D isometric và IndexedDB; không cần backend/login.

## Lập kế hoạch và Approve trước khi triển khai

Policy này chỉ áp dụng cho repo Software CEO, trong mọi thread làm việc với repo này:

- Luôn lập và trình bày kế hoạch cho mọi task.
- Không triển khai hoặc sửa code cho đến khi Khiêm trực tiếp **Approve kế hoạch của task đó**.
- Mỗi yêu cầu mới sau đó, kể cả trong cùng conversation đã có kế hoạch được Approve và đã triển khai, đều phải có kế hoạch và **Approve mới** trước khi sửa code. Không dùng Approve cũ để triển khai yêu cầu mới.
- Approve chỉ có hiệu lực trong phạm vi kế hoạch đã duyệt. Các bước sửa/test thường lệ thuộc đúng phạm vi đó được tiếp tục, không cần hỏi lại sau mỗi gate.
- Được khảo sát read-only để chuẩn bị kế hoạch. Quyền push, deploy, thao tác phá hủy hoặc ghi ra dịch vụ ngoài vẫn cần phê duyệt riêng.

Đây là yêu cầu mới nhất của owner, thay thế các chỉ dẫn cũ cho phép tự tiếp tục sửa code LOCAL S0–W5 trong mandate, handoff hoặc tài liệu khác. Phạm vi LOCAL không thay thế Approve cho từng yêu cầu mới.

## Bắt đầu và nguồn quyết định

Đọc `PROJECT_STATE.md`, `SESSION_HANDOFF.md`, `RELEASE_CHECKLIST.md`, `TASKS.md`, rồi source/tests thuộc nhiệm vụ. Đối chiếu yêu cầu mới nhất của owner → `docs/EXECUTION_MANDATE.md` → `docs/GDD_v1.1_Web_Canvas.md` → v1.0 ở chỗ v1.1 im lặng. `docs/ART_BASELINE_APPROVAL.md` ghi quyết định V4 đã duyệt, thay nhãn UNAPPROVED lịch sử. Không coi lỗi code hiện có là luật đúng.

Giữ baseline art V4 và balance T0.3 khi chưa có nhiệm vụ thay đổi cụ thể. Luồng: input → validated command → pure simulation transition → UI/Canvas projections → save. Luật nghiệp vụ không nằm trong renderer/React; không thêm engine 3D, cloud sync hoặc dịch vụ ngoài.

## Chọn skill theo công việc

Chỉ đọc skill liên quan; không nạp cả bộ cho mọi task. Path tính từ root dự án.

| Công việc | Skill |
|---|---|
| Vòng lặp chơi, lựa chọn, onboarding, progression và design brief | [.agents/skills/ceo-game-design/SKILL.md](.agents/skills/ceo-game-design/SKILL.md) |
| Cue sheet, nhạc/SFX, mix, audio lifecycle và nghe thử | [.agents/skills/ceo-game-audio/SKILL.md](.agents/skills/ceo-game-audio/SKILL.md) |
| Luật game, WP, staff, ledger, ba mô hình kinh doanh | [.agents/skills/ceo-simulation-economy/SKILL.md](.agents/skills/ceo-simulation-economy/SKILL.md) |
| Balance, matched seeds, novice/campaign quan sát | [.agents/skills/ceo-balance-playtest/SKILL.md](.agents/skills/ceo-balance-playtest/SKILL.md) |
| Camera, hit test, depth, animation, Canvas performance | [.agents/skills/ceo-canvas-v4/SKILL.md](.agents/skills/ceo-canvas-v4/SKILL.md) |
| HUD/dialog/tutorial, EN/VI, keyboard/focus, UI scale | [.agents/skills/ceo-ui-accessibility/SKILL.md](.agents/skills/ceo-ui-accessibility/SKILL.md) |
| IndexedDB, slots, import/export, migration/conflicts | [.agents/skills/ceo-save-recovery/SKILL.md](.agents/skills/ceo-save-recovery/SKILL.md) |
| Local gates, evidence, đóng gói và checkpoint | [.agents/skills/ceo-local-qa-handoff/SKILL.md](.agents/skills/ceo-local-qa-handoff/SKILL.md) |

Dùng thêm `skill-creator` khi sửa bộ skills; `git-workflow` khi có Git thực và nhiệm vụ Git. Không áp quy trình Noah sang game này. Không delegate coding theo mandate hiện hành; review độc lập chỉ khi được phép và có công cụ phù hợp.

## Lệnh và kiểm chứng

Node 24 theo `.nvmrc`; lệnh chi tiết/runtime có sẵn trong `SESSION_HANDOFF.md`.

- `npm ci`, `npm run verify`: typecheck, lint, unit tests, QA harness, production build. Chạy trước sửa ứng dụng; sau sửa chọn regression phù hợp rồi verify.
- `npm run dev`: 127.0.0.1:5173; `npm run preview`: 127.0.0.1:4173. Kiểm process/build trước khi dùng.
- `CEO_BASE_URL=http://127.0.0.1:4173 npm run test:e2e`: production browser flow.
- `npm run test:balance`, `npm run test:balance:markets`, `npm run test:balance:policy`: ba suite có mục đích riêng.
- `npm run test:assets`: Python có Pillow, mặc định không sửa art. Không dùng `--update-metadata` trong kiểm chứng giữ baseline.
- Soak/profile và packaging: theo `docs/TESTING.md` và skill QA; không chạy FPS profile cùng browser stress/balance.

## Quyền và bàn giao

Phạm vi công việc là LOCAL S0–W5; mọi task tuân theo policy lập kế hoạch và Approve ở trên. Yêu cầu chỉ phân tích/thiết lập không tự mở quyền sửa ứng dụng. Không push/remote write, upload, hosted preview, deploy, trả phí hay đổi credentials nếu chưa có quyền riêng. Không tự đổi browser/OS permissions để vượt gate; không sửa cấu hình global.

Bản chuyển hiện không có `.git`; không tự khởi tạo Git hoặc remote. Giữ thay đổi người dùng và bằng chứng cũ. Cập nhật bốn hồ sơ sau mỗi checkpoint; ghi lệnh và kết quả thực, phân biệt Verified / Proposed / Unknown. WebKit không thay Safari, bot không thay người chơi, schema-valid không thay runtime discovery. Chưa đủ gate thì giữ OPEN/NOT TESTED; không gọi LOCAL build là production approved.

Kết thúc báo cáo bằng 1–3 bước tiếp theo cụ thể, có kết quả và điều kiện quyền hạn. Đây không phải quyền triển khai các đề xuất mới.
