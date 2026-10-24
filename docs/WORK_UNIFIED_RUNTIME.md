# Công việc → Phân công — tích hợp LOCAL

> Cập nhật 2026-10-24: bố cục Work/People độc lập bên dưới là lịch sử. Runtime hiện điều hành trong Simulate; xem [SIMULATE_RUNTIME.md](SIMULATE_RUNTIME.md). Commands và invariants phân công vẫn giữ nguyên.

Owner duyệt mockup ghép và kế hoạch tích hợp ngày 2026-10-21. Phạm vi là game LOCAL; không gồm standalone/ZIP, push, upload hoặc deploy. Giao diện được viết bằng React, không nhúng iframe hoặc fixture mockup.

## Luồng người chơi

- Công việc mặc định là bảng tổng quan. Tìm kiếm/lọc/sắp xếp dùng dữ liệu campaign thật. Chọn tên để xem Chi tiết; Phân công mở vùng rộng theo đúng work target.
- Chi tiết giữ các hành động hợp đồng đã có, gồm qualify/quote/sign, thay đổi scope, nghiệm thu, rủi ro giao hàng và hóa đơn. Product roadmap/MVP và Experiments giữ các hành động tương ứng.
- Nhân sự mở cùng editor theo nhân viên. Phân công hỗ trợ từ Market chọn đúng target Market. Feature roadmap chọn đúng feature work; work experiments chỉ có task Research.
- Editor hiển thị đầy đủ hai assignment, sửa/bỏ đúng slot hoặc thêm/thay một slot được chọn. Hai task cùng target nhưng khác kind vẫn chỉnh độc lập.
- Bản nháp tách theo target và nhân viên. Mỗi bản nháp chứa snapshot assignment lúc bắt đầu soạn. Thay đổi lựa chọn không ghi simulation hoặc tiêu lượt CEO.
- Chuyển màn hình, đổi target, lọc và tìm không xóa bản nháp. Về tổng quan khôi phục query/filter/sort/scroll; navigation mới không tạo bản sao editor.
- Tải save/Continue hoặc tạo game mới xóa UI session, lấy phân công thật từ campaign được mở. Bản nháp không ghi IndexedDB/JSON; reload bỏ phần chưa áp dụng. Save schema giữ nguyên.

## Command và ranh giới dữ liệu

`assignBatch` nhận nhóm employeeId, expected assignments, assignments mong muốn. Simulation clone state theo transition hiện có; kiểm toàn bộ trước khi ghi. Validation target/task dùng cùng hàm với command assign cũ. Giữ giới hạn hai việc, không trùng target+kind, hợp đồng signed/accepted, Market research/growth/support, experiment research, support chỉ tại Market.

So sánh snapshot theo assignment của từng người, không theo revision hoặc ngày: tick không làm bản nháp hết hiệu lực. Nếu người đã rời công ty hoặc assignment khác snapshot, cả nhóm bị từ chối và bản nháp còn. Nếu trạng thái đã đúng kết quả yêu cầu, retry được chấp nhận. Không chỉnh employee/job còn lại tùy tiện; UI chọn rõ slot muốn thay. Cash, RNG và CEO actions không đổi do giao việc; tutorial assign giữ ý nghĩa cũ.

`WorkSession` thuộc App và tách khỏi State của simulation. Các điều kiện khóa UI hỗ trợ người chơi; command vẫn là nơi kiểm chứng cuối cùng. UI không tự ghi vào game state.

## Components và kiểm chứng

Source: `src/ui/WorkWorkspace.tsx`, `src/ui/workSession.ts`, phần chi tiết giữ tại `src/ui/Panels.tsx`; entry routes tại `App.tsx`, `EmployeeRoster.tsx`, `BusinessPanels.tsx`; command/types tại `src/simulation/`.

Tests: `tests/simulation/assignment-batch.test.ts` kiểm rollback cả nhóm, retry, concurrency snapshot, giữ slot, duplicate/cap/unsigned/missing employee và deterministic replay. `tests/e2e/work-unified.spec.ts` kiểm state thật qua export/import, draft navigation, reset khi load, EN/VI/UI100/150, six-row fixture hợp lệ, 5 hàng ở1280×720, editor layouts và focus cycle/Escape. Các E2E cũ được đổi đường thao tác để mở inspector/editor; giữ các assertion gameplay, cash, invoices, staffing, startup funding, focus, spacing và accessibility.

Các lượt lỗi được giữ riêng ở `evidence/work-unified-runtime/`: selectors cài đặt cũ, fixture nháp vượt giới hạn hai active contract/deposit (schema từ chối đúng), caption/date wrapping chỉ hiện4 hàng, và vòng Tab cuối inspector. Không hạ gates; sửa fixture/layout/focus và chạy lại. Receipt cuối là nguồn kết quả thực tế, không dùng kiểm mockup thay runtime.

Chưa chứng minh native Safari, human screen reader hoặc performance mới. Bundle JS warning trên500kB còn; không hạ ngưỡng warning. T0.3, art V4, persistence schema, audio và các mô hình doanh thu giữ nguyên.

## Review tiếp theo

Khiêm thử game4183 bằng đúng hostname đang chơi, kiểm đổi dự án/màn hình, thêm/thay việc và quay lại tổng quan. Owner nghiệm thu giao diện runtime vẫn là bước tiếp theo. Không dùng kết quả LOCAL như production approval.

## Kết quả cuối

## WORK-UNIFIED-RUNTIME-013 — 2026-10-21 — tích hợp LOCAL đã kiểm chứng

Owner chốt mockup và Approve kế hoạch tích hợp Công việc → Phân công. Đã triển khai bằng React, dữ liệu/commands thật: bảng tổng quan gọn, Chi tiết theo dự án giữ các hành động hợp đồng/Product/Startup, editor vùng rộng, cùng entry từ Nhân sự/Market. Bản nháp/query/filter/sort/scroll thuộc UI session của App, giữ khi chuyển màn hình/dự án; tải save hoặc tạo game mới khởi tạo lại. Bản nháp không lưu qua reload, save schema không đổi.

Thêm assignBatch ở simulation: kiểm toàn nhóm trước khi ghi, CAS snapshot theo assignment từng người, retry safe, giữ slot còn lại, tối đa2 việc, không trùng và target/task hợp lệ. Tick không làm hết hiệu lực bản nháp. Giữ assign/unassign cũ, T0.3, V4 và công thức năng suất. Source chính: src/ui/WorkWorkspace.tsx, workSession.ts, Panels.tsx, App.tsx, simulation/commands.ts và types.ts; xem docs/WORK_UNIFIED_RUNTIME.md.

Verified Node24: npm run verify trước PASS46 tests/8files, sau PASS51tests/9files; 3QA harness/typecheck/lint/build. Edge full30/30 E2E, zero skipped/flaky/unexpected, 135,58giây trên fixed production dist35files. Dev4183 đạt3/3 regression bằng context riêng. VI/EN, UI100/150,1280×720/1920×1080; ma trận24 tổng quan và8 editor, bảng6work hợp lệ, ít nhất5 hàng trọn ở1280×720/UI100; vòng Tab/Shift+Tab/Escape/focus return đạt. Gameplay delivery→invoice→cash, Product/Startup/MVP/funding, save/import/reload/conflict/outcomes đạt trong full suite. Không hạ assertion/quality gates.

179 tệp public/art-source giữ hash; 237 tệp baseline giữ nguyên,14 tệp source/tests hiện có đổi đúng phạm vi. Package/lock/Vite config/standalone giữ hash; hai mockup và bản ghép giữ nguyên. 248 tệp evidence root lịch sử được phục hồi bytes; kết quả mới tách full-suite-artifacts/ và browser/ trong evidence/work-unified-runtime/. Các lượt lỗi/setup/fixture/layout/focus được giữ riêng. Receipt cuối: evidence/work-unified-runtime/receipt.json.

Game dev: http://localhost:4183/; dùng đúng hostname đang chơi vì localhost và127.0.0.1 không dùng chung storage. Owner runtime visual acceptance, native Safari/human screen reader còn OPEN. Không đo FPS/soak/balance mới; warning JS khoảng514kB còn. Không rebuild standalone/ZIP, push/upload/deploy. Bước tiếp theo: Khiêm review Công việc → Phân công trong game; lưu campaign vào slot trước khi chủ động reload tab cũ nếu cần.

