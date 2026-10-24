# Thiết kế lại UI quản lý — LOCAL, 2026-10-21

## UI-RUNTIME-INTEGRATION-009 — thiết kế đã vào React

Owner đã duyệt tích hợp bộ sáu mockup vào game thật. Quyết định và ranh giới hiện tại: [MANAGEMENT_UI_RUNTIME.md](MANAGEMENT_UI_RUNTIME.md). Runtime ở cổng 4183; các checkpoint mockup 006/007 bên dưới và trong tài liệu riêng là lịch sử prototype. Danh sách/chi tiết dùng state thực, không có fixture hoặc thanh chọn tình huống trong sản phẩm. Source mới tại src/ui/DecisionBoard.tsx; các panel và CSS được cập nhật. Giữ lệnh nghiệp vụ, V4, T0.3, save schema và VI/EN.


## UI-WALL-NAME-005 — 2026-10-21

Owner duyệt thay chữ SOFTWARE CEO trên tường bằng tên công ty. `OfficeProps.companyName` là dữ liệu trình bày optional: game truyền `s.name`, setup truyền tên đang nhập, menu không truyền tên. Renderer trim tên để hiển thị; chuỗi rỗng/khoảng trắng hoặc không có prop dùng SOFTWARE CEO. Không đổi dữ liệu tên trong state/save.

Giữ vị trí, transform isometric, màu #285648 và font system-ui đậm của biển V4. Vùng chữ rộng tối đa 220 đơn vị Canvas trước transform/camera; cỡ chữ giảm từ 19 xuống tối thiểu 12px. Nếu vẫn dài, renderer loại dần Unicode code points rồi thêm dấu …, tránh cắt đôi surrogate pair. Đây là kích thước world-space, không phải CSS pixels cố định ở mọi mức zoom.

Cache nền theo dõi companyName bên cạnh tier/language. Thay tên đánh dấu dirty để redraw cả khi pause/reduced motion; không reset camera, không thêm command, không dùng RNG hoặc sửa simulation. Việc thu nhỏ/rút gọn chỉ tính khi vẽ lại nền.

Regression `tests/e2e/company-wall-name.spec.ts`: quan sát fillText thật và measureText thật, không mock rasterization; fallback menu/empty/whitespace, preview tên VI, tên W dài/Unicode, create game, return menu; import hai state chỉ khác tên trên cùng Canvas đang pause, so hash pixel trước/sau; tier 2, EN/UI150%, zoom/pan/fit. Ảnh thực tại evidence/company-wall-name/. Gate cuối và giới hạn xem receipt.json trong thư mục đó. Các fixture chỉ phục vụ renderer, không chứng minh kinh tế/upgrade hoặc người chơi thật.

---

## UI-IDE-DARK-004 — 2026-10-21

Owner đã Approve kế hoạch thiết kế lại toàn bộ lớp UI theo phong cách IDE dark mode. Quyết định này thay giao diện sáng của các checkpoint bên dưới; bố cục quản lý thu gọn, navigation, draft và các hành động nghiệp vụ giữ nguyên.

Hệ thống màu semantic nằm ở đầu `src/ui/style.css`: nền #0D1117, panel #161B22, title bar #010409, chữ #E6EDF3, chữ phụ #A3B0BF, accent #79C0FF và primary #1F6FEB. Success/warning/danger có màu chữ và nền riêng; trạng thái vẫn có nhãn chữ. Form native dùng `color-scheme: dark`, checkbox/range có accent, focus có viền rõ. Title bar, HUD, tab navigation, section tabs, roster, bảng, biểu đồ, inbox, tutorial, toast, dialog và outcome dùng chung palette. Góc bo nhỏ và viền mảnh thay cho card bo tròn lớn. Browser theme-color đồng bộ nền tối.

Font toàn HTML UI là monospace theo hệ điều hành: ui-monospace → SFMono-Regular → Menlo → Consolas → Liberation Mono → monospace. Không tải font hoặc thêm dependency. Điều này giữ offline/standalone và hỗ trợ fallback chữ Việt, nhưng hình dáng glyph có thể khác theo host. Các nhãn được vẽ trong Canvas thuộc renderer V4, giữ nguyên.

Brand dùng ký hiệu </> + CEO. Tab đang chọn dùng viền xanh và màu nền riêng, không thêm terminal nhập lệnh hoặc thuật ngữ code vào quy trình nghiệp vụ. Bố cục quản lý mặc định và roster gọn đã duyệt vẫn là nền tảng. Cột hành động roster tăng từ 190 lên 225px: monospace khiến Assignments/Details xuống hai hàng ở bản EN, làm giảm số nhân viên hiển thị tại 1920×1080. Sửa độ rộng cột; giữ assertion ít nhất 5 hàng và chiều cao hàng khởi đầu 88–104px.

Phạm vi source: `src/ui/style.css`, brand trong `src/app/App.tsx`, meta theme-color trong `index.html`, đồng bộ meta của `scripts/build-standalone.mjs` từ production index. Regression bổ sung `tests/e2e/ide-theme.spec.ts` kiểm computed dark surfaces/monospace, overflow, menu/setup, settings/save/about, office/inbox, confirmation và axe; ảnh dùng testInfo.outputPath. Các bài test cũ tiếp tục kiểm 48 tổ hợp quản lý và 8 tổ hợp roster, focus/confirmation/commands/save/import/export.

Đã đối chiếu 174 protected files thuộc public/art-source, simulation/content, renderer/audio, persistence, store và package files: không đổi bytes. Verify trước/sau PASS 46 unit tests/8 files + 3 QA harness/typecheck/lint/build. Chrome 19/19 E2E (64.6s), WebKit 5/5 UI regression (40.3s); mỗi target 60 lượt axe zero selected-rule violations. Standalone file:// offline/save/export/reload/import PASS. Build/browser receipts và giới hạn kiểm chứng nằm tại `evidence/ui-ide-dark/receipt.json`. Bằng chứng cũ được khôi phục bytes sau mỗi lượt test; outputs mới lưu riêng trong thư mục task. Lượt đầu có một roster failure được giữ nguyên; không đổi expected hoặc giảm assertions.

Unknown: owner/human usability, human screen reader và full native Safari còn OPEN. WebKit automation không thay Safari. Không chạy lại balance/soak/profile cho thay đổi lớp trình bày; kết quả hiệu năng CP6 không phải số đo của build này. Không tạo ZIP mới, push, upload hoặc deploy. Bước tiếp theo: owner lưu tiến trình, tải lại preview 127.0.0.1:4183 và xem các tab/Chi tiết nhân viên để nghiệm thu giao diện.

---

## Mục đích và phạm vi

Owner yêu cầu đề xuất và cải thiện Công việc, Nhân sự, Thị trường, Tài chính, Chiến lược và Nhật ký vì khó nhìn, khó tập trung, viewport nhỏ. Thực hiện bằng `ceo-game-design`, `ceo-ui-accessibility`, `ceo-local-qa-handoff`. Nguồn: GDD v1.1 §9.1–9.4, §18.5; PROJECT_STATE/TASKS; source UI thực. Giữ bottom navigation, art V4, T0.3 và mọi command/confirmation. Chỉ LOCAL.

Actor là người chơi CEO. Luồng cần hỗ trợ: quan sát dữ liệu → chọn một nhiệm vụ → xem chi phí/hậu quả → thực hiện command → đọc phản hồi. Lọc UI không dùng lượt CEO, không đổi ngày, không ghi game state.

## Verified — hiện trạng trước sửa

`management` vốn đã dùng toàn bộ chiều ngang workspace. Vấn đề không phải sáu màn hình bị nhốt trong sidebar: HUD/company bar/tutorial/navigation làm giảm chiều cao, nội dung nối dài, cỡ chữ phụ có nơi 0.6–0.75rem, thiếu điều hướng bên trong màn hình. Cards của nhiều nhiệm vụ cùng hiển thị; phân công/tuyển dụng/hóa đơn dễ nằm dưới nhiều nội dung khác.

Đây là source review và quan sát kỹ thuật, chưa phải kết quả nghiên cứu người chơi. Preview 4173 trên máy hiện do ứng dụng khác sử dụng; phiên này chạy đúng Software CEO tại 127.0.0.1:4183, không thay process 4173.

## Phương án đã triển khai

Khung `ManagementPage`/`ManagementSection` tạo điều hướng mục luôn thấy khi cuộn. Mặc định Tất cả để khám phá nội dung; chọn một mục để chỉ xem nhiệm vụ đó. Sections ẩn vẫn mounted, nên draft trong dropdown phân công/giá/ngân sách được giữ khi đổi mục trong cùng màn hình. Đổi màn hình qua navigation vẫn theo lifecycle hiện có.

| Màn hình | Tổ chức nội dung |
|---|---|
| Công việc | Hợp đồng; Sản phẩm khi có; Thử nghiệm theo business line; Phân công. Không hiện vùng hợp đồng rỗng nếu công ty đã có sản phẩm. |
| Nhân sự | Đội ngũ dùng hàng nhân viên gọn; Tuyển dụng giữ nguyên. Phân công/Chi tiết hiện trực tiếp; lương/đào tạo/thôi việc trong hộp Chi tiết. |
| Thị trường | Phân khúc; Khách hàng & giá khi có sản phẩm; Cơ hội và Thử nghiệm theo business line. |
| Tài chính | Tổng quan; Hóa đơn; Sổ giao dịch. Giữ phân biệt cash/revenue/receivable, các xác nhận vay. |
| Chiến lược | Mục tiêu & hướng đi; Điều hành; Cam kết. Giữ funding/pivot và xác nhận hiện có. |
| Nhật ký | Báo cáo tuần; Dòng sự kiện. Tìm nội dung/ngày và lọc thông tin/tích cực/cảnh báo/khẩn cấp; có empty state và số kết quả. |

Theo yêu cầu owner ngày 2026-10-21, HUD thu gọn là **bố cục mặc định duy nhất** cho sáu màn hình quản lý. Không có state, nút, setting hoặc lớp CSS chọn Focus. Hướng dẫn mặc định thu gọn và vẫn có nút mở/thu gọn riêng. Văn phòng giữ bố cục hiện có. Tăng tương phản bề mặt/card, cỡ chữ phụ, cấu trúc bảng, lưới phân công và trạng thái navigation. Root scroll reset sau khi đổi mục; tắt browser scroll anchoring trong workspace. Kiểm thử chờ hiệu ứng End kết thúc trước khi đổi mục. HTML select/nút phân công có target 44px trên WebKit.

Các số so sánh Focus bật/tắt bên dưới là bằng chứng lịch sử UI-REDESIGN-001; từ UI-DEFAULT-002 không còn hai chế độ.

Trade-off: Tất cả vẫn dài ở công ty lớn; người chơi dùng bộ lọc mục để tập trung. Không thêm full-screen OS API hoặc tự đổi browser zoom. UI 150% giữ chữ lớn và cuộn dọc; không thể hiển thị đồng thời toàn bộ thông tin trên 720px.

## Acceptance và bằng chứng

- Trước sửa: `npm run verify` PASS 46 tests/8 files + 3 QA harness, typecheck/lint/build. Log `evidence/ui-redesign-pre-verify.log`.
- Sau sửa: `npm run verify`, kết quả thật tại `evidence/ui-redesign-verify.log`.
- `tests/e2e/management-workspace.spec.ts`: 48 tổ hợp (VI/EN × 100/150% × 1280×720/1920×1080 × sáu màn hình); không overflow ngang document/workspace; vùng quản lý >45% chiều cao; chọn mục qua Enter; sticky nav; scroll reset; giữ draft; tìm kiếm/lọc/empty recovery. Sáu mẫu VI 100% 1280px chạy axe theo WCAG2A/AA/21AA. Không phải chứng nhận WCAG hoặc human screen reader.
- Ma trận đo đầu: Chrome 156.0.8078.47, vùng quản lý 495px khi bật Focus so với 434.25px khi tắt tại 1280×720, tăng 60.75px. Kết quả build cuối xem `evidence/ui-redesign-browser.json` và full E2E log.
- Hai lượt test đầu timeout vì locator `getByLabel(..., exact: true)` cho select chứa options. Đã sửa test tìm đúng accessible combobox; không giảm assertions. Logs giữ tại `evidence/ui-redesign-initial-test-failure/`.
- Hash các files public/art-source/simulation/gameplay/content/renderer trước và sau trong `evidence/ui-redesign-preservation*.json`; không dùng kết quả balance cũ làm phép đo mới.
- Ảnh từng màn hình tại `evidence/ui-redesign-<0..5>-<vi|en>-<100|150>.png`; index theo thứ tự sáu màn hình trong tiêu đề.

## Unknown / Proposed

Chưa có owner acceptance, novice playtest hoặc human screen reader cho thiết kế mới. Native Safari full gate của CP6 còn mở. Các phép đo soak/profile CP6 thuộc build cũ, không coi là bằng chứng hiệu năng của build UI mới. Không sửa renderer/clock/audio/save hoặc balance; không chạy lại campaign balance và soak 30 phút cho thay đổi bố cục này.

Đề xuất tiếp theo: owner thử chọn Phân công, Tuyển dụng, Hóa đơn và tìm một sự kiện để đánh giá khả năng tập trung. Nếu cần thay mặc định Tất cả bằng một mục theo từng playbook, xác nhận dựa trên chơi thử trước khi đổi navigation behavior. Đã cập nhật PLAY_SOFTWARE_CEO.html từ dist mới và smoke Chrome file:// offline/save/export/reload/import PASS. Chưa tạo ZIP mới; ZIP CP6 vẫn chứa phiên bản trước thay đổi.

Build cuối: Chrome full E2E 15/15 (46.8s), WebKit regression 48 tổ hợp PASS (17.5s), sáu axe mẫu mỗi browser zero selected-rule violations. Browser evidence tách trong ui-redesign-chrome/ và ui-redesign-webkit/. Receipt tổng hợp ui-redesign-receipt.json. Native WebKit automation không thay native Safari.

## UI-DEFAULT-002 — 2026-10-21

Theo yêu cầu mới của owner, bố cục quản lý thu gọn là mặc định duy nhất cho cả sáu màn hình. Đã bỏ nút Tập trung/Focus, state chuyển chế độ và CSS mode; dùng management-shell trực tiếp. Hướng dẫn vẫn có thể mở/thu gọn riêng. Quyết định này thay phần chọn mode của UI-REDESIGN-001 bên dưới.

Verify trước/sau PASS 46 tests/8 files + 3 QA harness, typecheck/lint/build. Chrome full E2E 15/15 PASS; WebKit regression 48 tổ hợp PASS, gồm không còn nút chế độ ở VI/EN và giữ mở/thu hướng dẫn. Standalone đã cập nhật và smoke offline/save/export/reload/import PASS. 171 protected files giữ nguyên; native Safari/human gates vẫn OPEN. Không ZIP/push/deploy. Evidence: evidence/ui-default-layout-receipt.json; preview 127.0.0.1:4183 và PLAY_SOFTWARE_CEO.html là bản mới. Bước tiếp theo: owner lưu tiến trình rồi tải lại preview để xem bố cục mặc định.



## UI-ROSTER-003 — thiết kế Đội ngũ đã được owner duyệt

Mục tiêu: so sánh người và tình trạng làm việc ngay trong danh sách, giảm khoảng trống card. Thay hai card lớn bằng danh sách hàng dùng chung cột: avatar/tên/vai trò/kỹ năng; tinh thần/năng lượng; lương/tháng; phân công; hai nút Phân công/Chi tiết. Roster rộng tối đa 1440px. Hàng thông thường 92px ở UI100%; tên dài và UI150% được xuống dòng. Không thêm mode chọn mật độ. Tuyển dụng giữ nguyên.

Chi tiết là HTML dialog có thông tin hòa nhập, năng suất và mô tả đặc điểm. Xem lại lương/thôi việc đi qua confirmation hiện có; đào tạo giữ command trực tiếp. Dialog đóng trước confirmation hoặc toast để tránh modal chồng và lỗi bị che. Tab/Shift-Tab quay vòng trong dialog; Escape/nút đóng trả focus về nút Chi tiết. Khi thôi việc xóa nút kích hoạt cũ, focus về danh sách. Chi phí, CEO Actions, serverless/save và balance không đổi.

Source: src/ui/EmployeeRoster.tsx; PeoplePanel chỉ compose roster và giữ nguyên tuyển dụng. Dùng selector capacity hiện có cho năng suất, không chuyển luật game vào renderer/UI. Tests mới: tests/e2e/people-roster.spec.ts.

Acceptance: thấy trọn 2 nhân viên và nút chính ở 1280×720/UI100%; ít nhất 5 hàng ở 1920×1080/UI100% trong fixture 12 người; không overflow ngang ở VI/EN, hai viewport và UI100/150%; dialog thao tác bằng keyboard, confirmation/cancel và lỗi hết lượt giữ đúng kết quả. Tên dài 80 ký tự và hòa nhập trong fixture chỉ phục vụ layout, không phải kết quả chơi thật.

Các phát hiện trong quá trình thực hiện được giữ bằng log: unused destructured dispatch sau khi di chuyển code; vòng Tab native đi ra browser chrome; WebKit không focus nút khi bấm chuột và cần trả focus rõ ràng sau xóa nhân viên. Đã sửa; không giảm assertions. Evidence cuối theo ui-roster-verify.log, ui-roster-e2e.log, ui-roster-edge.log, ui-roster-webkit.log và receipt. Human usability/screen reader và native Safari đầy đủ vẫn chưa nghiệm thu.

Kết quả cuối: verify PASS 46 unit/8 files + 3 QA harness; Chrome 17/17 E2E; Edge 2/2 và WebKit 2/2 people regression; standalone offline PASS. Chi tiết số đo/hash/browser receipts: evidence/ui-roster-receipt.json.
