# Công việc — bản thiết kế LOCAL 06

Ngày: 2026-10-21. Trạng thái: **PROPOSED — chờ owner duyệt thiết kế**.

Owner đã Approved bước dựng mockup sau đề xuất review UI. Checkpoint này chỉ tạo bản thiết kế độc lập; không tích hợp vào game. Nguồn quyết định: AGENTS.md hiện hành, GDD v1.1 §9, quyết định IDE dark tại docs/UI_REDESIGN.md. Áp dụng ceo-game-design, ceo-ui-accessibility và ceo-local-qa-handoff.

Checkpoint 007 mở rộng navigation sang năm màn hình khác và tách theme dùng chung. Evidence/receipt của checkpoint 006 bên dưới là lịch sử trước thay đổi đó. Bản hiện tại và phạm vi mới: [Bộ giao diện quản lý](MANAGEMENT_UI_MOCKUP.md).

## Mở và thử

- File HTML LOCAL: [mockup](mockups/work/index.html). Từ checkpoint 007, dùng theme chung tại mockups/shared/theme.css; khi mở offline cần giữ cả thư mục mockups/. Không cần package hoặc build.
- Preview trên HTTP server LOCAL đang có: http://127.0.0.1:4191/docs/mockups/work/index.html. URL chỉ hoạt động khi server này đang chạy.
- Dùng thanh tím phía trên để chọn ba tình huống và UI 100/150%. Thanh này thuộc công cụ review, không phải thành phần game đề xuất.
- Tình huống 03 có hai biến thể: nghiệm thu hợp đồng và phát hành Product.
- Mọi thao tác chỉ thay đổi dữ liệu trong bộ nhớ của trang mockup. Reload đưa về tình huống ban đầu; không đọc hoặc ghi save của game.

## Proposed — thiết kế

Người chơi CEO quan sát công việc → đọc điểm nghẽn → chọn người/hành động → xem chi phí/điều kiện → thực hiện → đọc phản hồi.

- Giữ palette và font monospace của IDE dark hiện hành. Danh sách gọn bên trái; chi tiết dự án bên phải. Lọc Tất cả/Cần xử lý/Hoàn tất.
- Đặt một hành động chính theo tình huống, ngay dưới phần nhận diện dự án. Không đặt tìm cơ hội làm ưu tiên cố định.
- Tách phát triển và kiểm thử. Không dùng chất lượng 100% thay cho trạng thái đã kiểm thử; không biểu diễn QA như giai đoạn chỉ bắt đầu sau khi Dev xong.
- Ở desktop rộng, tiến độ và đội ngũ đặt cạnh nhau. Bố cục nhỏ hơn cho cuộn dọc; không yêu cầu cuộn ngang.
- Hợp đồng chưa ký: giải thích khóa phân công, không hiện select trống và nút giao việc khả dụng.
- Phân công: chọn loại việc, xem người đang làm gì; mặc định thay thế. Thêm việc thứ hai có nhắc chia đều thời gian và giảm tập trung 15%.
- QA được phân công không tự tăng WP hoặc đạt nghiệm thu. Nghiệm thu tách hóa đơn/khoản phải thu khỏi tiền mặt. Phát hành không cam kết khách hàng/doanh thu tức thì.
- Dialog có xác nhận, Escape, vòng Tab và trả focus. Ký hợp đồng hiện một lượt CEO, tiền cọc và hạn giao trước khi xác nhận.

Giá trị và tiến độ là mẫu minh họa, không phải save runtime. Mẫu Product dùng tên/effort/fit từ `retail-reports` trong src/content/products.ts: Báo cáo doanh thu, 10 WP, +6 fit đúng phân khúc; mẫu chọn actual work 10 WP. T0.3 không thay đổi.

## Verified — phạm vi kiểm tra

- Node 24: trích inline script và `node --check` PASS; Prettier cho duy nhất file mockup.
- Edge thật: 16 tổ hợp = 1280×720/1920×1080 × UI100/150 × chờ ký/thiếu QA/sẵn sàng nghiệm thu/sẵn sàng phát hành. Không tràn ngang ở document hoặc phần tử bên trong chi tiết.
- Thử ký/hủy, focus dialog, QA không làm tăng tiến độ/lượt CEO, xem hậu quả việc thứ hai, nghiệm thu không tăng tiền mặt, phát hành Product, lọc sau hoàn tất, dialog UI150 tại 1280×720. Kết quả cụ thể ở evidence/ui-work-mockup/browser-checks.json.
- Lượt đầu Shift+Tab khỏi control đầu dialog trả focus về BODY. Đã thêm vòng Tab rõ ràng và kiểm lại dialog ký/phân công cùng Escape/focus return. Bản ghi lỗi đầu giữ tại initial-focus-failure.json.
- Ảnh từng trạng thái và receipt nằm trong evidence/ui-work-mockup/. Manifest bảo vệ src/public/dist/art-source/package/standalone được lập trước thay đổi; xem receipt cho số tệp và kết quả đối chiếu cuối.
- Trình duyệt tích hợp đọc được trang nhưng screenshot API không dùng được trong phiên này. Kiểm kích thước/ảnh và tương tác thực hiện trên Edge; không gọi đó là bằng chứng nhiều browser.

## Unknown và ranh giới

Chưa có owner visual acceptance, novice playtest, screen reader người thật, VI/EN runtime hoặc native Safari. Mockup chỉ có tiếng Việt. Nút điều hướng dưới là phần minh họa; Tài chính/Thị trường không nằm trong prototype. Không có simulation, forecast tính từ năng lực thật, nhiều dự án, Startup hoặc command/save integration. Không dùng số kiểm mockup làm kết quả E2E game; không chạy lại npm run verify, balance, soak, profile hoặc đóng gói game.

## Bước tiếp theo

1. Owner review ba tình huống và nêu điểm cần chỉnh. Thiết kế vẫn PROPOSED cho đến khi được duyệt.
2. Sau khi owner duyệt thiết kế và phạm vi tích hợp, triển khai UI Công việc qua command/selectors hiện có; kiểm các trường hợp nhiều dự án, Product/Startup, VI/EN, keyboard, save và quality gates. Giữ art V4, balance T0.3; không push/upload/deploy.
