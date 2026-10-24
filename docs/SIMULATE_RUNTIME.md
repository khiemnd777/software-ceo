# Simulate — tích hợp game LOCAL

Ngày 2026-10-24. Trạng thái: **LOCAL kỹ thuật PASS, sẵn sàng Khiêm chơi/review**.

Khiêm duyệt: “Duyệt kế hoạch tích hợp, triển khai LOCAL, và bàn giao bản game chạy thật trên LOCAL.” Thiết kế thống nhất và Hồ sơ dự án được dùng trong React của game, kết nối store/commands thật. Không chạy fixture hoặc clock của mockup trong ứng dụng.

## Kết quả và cách chơi

Game: http://localhost:4183/. Production preview đã kiểm: http://127.0.0.1:4186/.

Dùng đúng browser và hostname của save cũ. `localhost` và `127.0.0.1`, hoặc hai port khác nhau, không chia sẻ IndexedDB. Test chạy bằng context riêng; không đọc, ghi đè hoặc xóa slot cá nhân của Khiêm. Server chỉ bind loopback. Khi server cần khởi động lại, dùng Node 24 theo `.nvmrc`:

```bash
export PATH=/Users/khiemnguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
npm run dev -- --port 4183 --strictPort
# Hoặc build đã lưu, ở terminal riêng:
npm run preview -- --port 4186 --strictPort
```

Văn phòng giữ mounted khi điều hành. Chọn người/địa điểm, chỉ số HUD hoặc Tìm trong văn phòng (Ctrl/Cmd+K) để mở thông tin ngay trong Simulate. Bảng dự án, người, ứng viên, khách hàng, tài chính, chiến lược, nhật ký và hộp thư dùng dữ liệu campaign thật. SaveManager, menu/setup, xác nhận, outcome và cài đặt âm thanh/VI–EN dùng luồng hiện có.

Hồ sơ dự án có khách hàng/trạng thái/hạn giao; ba mục Tiến độ & nhân sự, Hợp đồng/Chi tiết, Hoạt động. Tiến độ thực hiện và QA tách riêng. Phạm vi ẩn vẫn là khoảng ước lượng. Nhân sự hiện tại là hàng gọn, mở từng editor; bản nháp hiển thị trước → sau; footer Áp dụng nằm ngoài vùng cuộn.

Giữ giao việc thủ công, hai việc/người, giảm tập trung 15%, sửa đúng slot, giữ việc khác, `assignBatch` và kiểm snapshot assignment. Tick không làm bản nháp hết hiệu lực; thay assignment thật hoặc người rời công ty chặn nhóm xung đột. Bản nháp theo dự án tồn tại trong phiên khi đổi đối tượng, không ghi vào save. Load/new game reset UI session nhưng Canvas vẫn giữ mounted khi đổi save.

Không thêm tự giao việc, lịch nhân sự tương lai hoặc dữ liệu lịch sử giả. “Dự kiến sau áp dụng” là bản nháp phân công, không phải lịch công việc. Game chưa lưu danh sách nhân sự lịch sử theo dự án; UI nêu rõ giới hạn này.

## Thành phần và ranh giới

- `src/ui/SimulateWorkspace.tsx`, `simulate.css`: không gian thống nhất, thông tin theo đối tượng, tìm kiếm, HUD, thời gian và các entry quản lý.
- `src/ui/ProjectDossier.tsx`, `project-dossier.css`, `projectView.ts`: hồ sơ, projections tiến độ và editor phân công. Tiền/cổng chất lượng/dự báo dùng selectors và commands có sẵn.
- `src/ui/ContractDetail.tsx`: tách thành phần hợp đồng hiện có từ `Panels.tsx`; game và WorkPanel dùng cùng thành phần. WorkWorkspace cũ giữ cho các mockup lịch sử còn import.
- `src/ui/simulateModel.ts`: context, projection điểm tương tác theo camera, nhân sự Canvas, lọc/sắp xếp dự án.
- `src/renderer/Office.tsx`: thông báo camera khi pan/zoom/size đổi để điểm HTML bám Canvas; không dispatch simulation theo frame. DPR có sàn 1 để Canvas không mờ ở browser zoom thấp, trần vẫn 2.
- `src/app/App.tsx`: dùng workspace mới, giữ store/timer/autosave/confirmation/audio; reset session khi load/new game.
- Tests E2E dùng entry của Simulate và giữ assertions về commands, tiền, nhân sự, save/load và accessibility. Các helper profile/soak/stress/standalone được cập nhật selectors cho bố cục mới. Chỉ profile đã thực thi; các suite dài/standalone không được suy thành PASS.

## Kiểm chứng đã chạy

| Phép kiểm | Kết quả và bằng chứng |
|---|---|
| Baseline `npm run verify` trước sửa | PASS 58 tests/11 files + 3 QA harness, typecheck/lint/build; `evidence/simulate-runtime/baseline-verify.log` |
| Cuối `npm run verify` | PASS 64 tests/12 files + 3 QA harness, typecheck/lint/build; `verify-delivery.log` |
| Full Edge E2E trên production preview 4186 | **30/30**, 0 skipped/flaky/unexpected, 161.1 giây; `delivery/results.json` |
| Dev trực tiếp `localhost:4183` | **3/3** Work/Simulate regressions; `dev-handoff/results.json` |
| UI matrix | VI/EN × 1280×720 / 1920×1080 × UI100/150; sáu context quản lý 48 tổ hợp, ba playbook 24 tổ hợp, dossier 8 tổ hợp, đội 12 người/tên dài 8 tổ hợp; keyboard/roving tabs/Escape/focus/không che footer theo tests |
| Luồng game | Outsourcing delivery → hóa đơn → tiền về; Product; Startup experiment/MVP/funding/đổi trọng tâm; lương/đào tạo/thôi việc; outcome; manual slots/JSON/import/reload/stale tab/storage denied; emulated visibility |
| Art QA | 480 khung gốc và 1.152 khung G–H PASS; `assets/art-validation.json`, `assets/characters-art-validation.json` |
| Hash bảo vệ | 81 tệp baseline quan trọng, gồm 40 public và 14 mockup; 234 art-source giữ nguyên. Simulation/gameplay/store/persistence/audio/content và package/lock/config giữ hash. `receipt.json` và manifests |
| Profile riêng | Edge 156.0.4314.42 headless macOS/arm64, Chromium sandbox bật. 12 nhân viên, hai viewport, 4 mẫu × 10 giây sau warmup: rAF 60.02–60.10 Hz, p95 16.7–16.8 ms; 0 frame >33.34 ms. Đây là nhịp hiển thị, không phải 60 pose/giây. `profile-delivery/browser-profile.json` |
| Audio/network/axe trong profile | Nhạc chạy sau gesture, mute dừng; 0 page/HTTP errors/external requests; 7 context không có selected-rule axe violations. Heap sau 40 lần đổi context: ~17.85 → 17.67 MB sau GC, không gồm GPU/decoded images |
| Build cố định trong profile | 44 dist files + fixture giữ hash trước/sau; `buildStable: true`. Dist digest cuối `d68882dec8b783847a2f1e0d95b1a470119a32fbad4366b5c7505fa1f47afb03` |
| Quan sát in-app browser | Tạo công ty kiểm thử riêng, ký hợp đồng, soạn Dev/QA, Áp dụng 2 rồi ngày 1: tiến độ/nhân sự thật cập nhật. CSS1921×1078 không tràn ngang ở zoom33% có sẵn; không đổi zoom. Tab dev 4183 hiển thị menu game và không có warning/error |

Lệnh E2E/profile đã dùng (Node 24 nằm trên PATH):

```bash
CEO_BROWSER=msedge CEO_E2E_RUN=delivery node node_modules/@playwright/test/cli.js test --config simulate.playwright.config.ts
CEO_BROWSER=msedge CEO_BASE_URL=http://localhost:4183/ CEO_E2E_RUN=dev-handoff node node_modules/@playwright/test/cli.js test --config simulate.playwright.config.ts tests/e2e/work-unified.spec.ts
CEO_BROWSER=msedge CEO_BASE_URL=http://127.0.0.1:4186/ CEO_EVIDENCE_DIR=evidence/simulate-runtime/profile-delivery node scripts/profile-browser.mjs
/Users/khiemnguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/check-assets.py --output-dir evidence/simulate-runtime/assets
```

Giữ lượt lỗi ban đầu: E2E pilot phát hiện tên tab đổi khi thêm badge làm sai Home; đã giữ tên truy cập ổn định/focus tab. Full-first còn selector `.company-path` của bố cục cũ; thay bằng assertion hướng chính trong HUD/chiến lược thật, không bỏ assertion 85% cổ phần. Lượt dùng Python hệ thống thiếu Pillow giữ diagnostic; runtime bundled chạy art QA thành công. Các báo cáo final độc lập được giữ riêng, không sửa failure thành PASS.

## Giới hạn

- Thiết kế và kế hoạch tích hợp đã được duyệt. Khiêm chưa nghiệm thu usability của runtime mới; trạng thái này **OPEN**.
- Native Safari/Firefox/WebKit, human screen reader, listening fatigue và playtest người mới **NOT_RUN** ở checkpoint này. Axe không phải chứng nhận WCAG.
- Không chạy 30 phút soak hoặc balance mới: rules/store/persistence/audio/content không đổi. Headless tab switch không cho `document.hidden`; chỉ emulated visibility E2E được ghi PASS, không suy thành kiểm chứng OS lifecycle.
- Warning bundle >500 kB có trước, bundle hiện 611.64 kB (gzip176.77 kB). Chưa tối ưu chunk ngoài phạm vi nhiệm vụ.
- Không rebuild `PLAY_SOFTWARE_CEO.html`/ZIP; các bản đó thuộc checkpoint trước. Không push/upload/deploy hoặc mở dịch vụ ngoài.
- Ảnh IAB có padding đen do capture ở zoom33%; ảnh review rõ ở `evidence/simulate-runtime/handoff-dossier.png` là production Edge E2E, có fixture sáu dự án cho matrix. Không dùng ảnh đó làm bằng chứng chiến dịch do người chơi tạo.

Bước tiếp theo khuyến nghị: Khiêm mở game tại localhost:4183 bằng Edge đang giữ save cũ, chọn Tiếp tục, thử giao việc/nhân sự ngay trong Simulate và phản hồi. Chỉnh sửa mới hoặc đóng gói/phát hành cần kế hoạch và phê duyệt theo phạm vi tương ứng.
