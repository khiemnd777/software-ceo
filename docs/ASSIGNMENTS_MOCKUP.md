# Phân công theo dự án — mockup LOCAL

## ASSIGNMENTS-MOCKUP-011 — 2026-10-21 — chờ review thiết kế

Owner yêu cầu dựng mockup sau đề xuất giao việc theo dự án. Đã tạo `docs/mockups/assignments/` độc lập, VI, dark theme: chọn dự án một lần, bảng cả đội, lọc/tìm nhân viên, bản nháp theo dự án, áp dụng nhiều hàng, thay đúng một việc và giữ việc còn lại, giới hạn hai việc, khóa dự án chưa ký. Chuyển Tài chính rồi quay lại giữ dự án/bộ lọc/bản nháp. Dữ liệu minh họa chỉ ở bộ nhớ; reload đặt lại. Không tích hợp game, không đổi source/save/balance/art hoặc build.

Verified: `node --check docs/mockups/assignments/app.js` PASS; `node evidence/assignments-mockup/check.mjs` trên Edge profile riêng PASS 6 nhóm tương tác, 4 layout (1280×720/1920×1080, UI100/150), zero horizontal overflow/page errors. Lần launch đầu trong sandbox bị SIGABRT/EPERM; lần chạy được duyệt ngoài sandbox PASS. Receipt/ảnh: `evidence/assignments-mockup/`. Kiểm ảnh 1440px thực; chỉnh badge theo nội dung sau lần chụp đầu. Không chạy verify/E2E game cho mockup độc lập. Owner visual acceptance, human speed/keyboard/screen reader và runtime integration còn OPEN.

Mở http://127.0.0.1:4191/docs/mockups/assignments/ qua server LOCAL hiện có. File entry cũng mở trực tiếp được. Bước tiếp theo: Khiêm review thao tác; chỉ tích hợp vào game sau kế hoạch/Approve riêng. Không push/upload/deploy/ZIP.

## Phạm vi

Verified chỉ áp dụng bản minh họa. Batch apply kiểm toàn bộ thay đổi trước khi ghi vào bộ nhớ mockup; chưa chứng minh command transaction trong game. Chỉ hỗ trợ các task hợp đồng minh họa; Product/Market/Experiments cần đặc tả khi tích hợp. Bản nháp chưa lưu qua reload.
