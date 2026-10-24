# Công việc — mockup tổng quan gọn 011

Ngày 2026-10-21. Owner yêu cầu **xem mockup trước** sau khi phản hồi bản runtime quá lớn, khó quan sát tổng thể. Trạng thái **PROPOSED — chờ review**, chỉ tạo prototype; chưa được duyệt sửa game theo bố cục này.

Mở LOCAL: http://127.0.0.1:4191/docs/mockups/work-overview/index.html. Hoặc mở index.html trực tiếp và giữ overview.css/overview.js cùng thư mục.

## Thiết kế

- Mặc định là bảng toàn chiều ngang, mỗi hàng hiện dự án/khách hàng/giá, trạng thái, hạn giao, Dev, QA và người đang làm. Hàng UI100 cao56px, nút ít nhất40px; chữ chính14px. Giữ palette/font IDE dark và các vùng HUD/company/tutorial/navigation để đánh giá trong ngữ cảnh game.
- Chọn tên hoặc Chi tiết mở ngăn bên phải. Tổng quan, Phân công và Điều khoản nằm trong ngăn; đóng bằng ×, Về tổng quan hoặc Escape. Không giữ một thẻ chi tiết lớn thường trực cạnh danh sách.
- Cảnh báo là một dòng ngắn trong chi tiết. Không có khối Next move lớn chiếm màn hình tổng quan. Tìm kiếm, lọc, sắp xếp hạn giao và trạng thái không có kết quả có thể thử.
- Thanh review tím chọn 3 hợp đồng theo ảnh, 6 công việc, trạng thái rỗng, VI/EN và UI100/150. Có thể ẩn thanh review để xem diện tích sản phẩm. Phần này không thuộc UI game đề xuất.

Ba hợp đồng đầu dùng thông tin người dùng đã đưa: ngày53, giá trị/trần, hạn giao, WP/QA và Minh đang refactor/Linh đang QA. Các dữ liệu bổ sung là mẫu tổng hợp. Không đọc save, storage hoặc state của browser đang chơi. Không thực thi ký/assign/nghiệm thu; các nút của prototype chỉ mở thông tin. Footer và điều khiển thời gian minh họa ngữ cảnh, không điều hướng/tick game.

Phạm vi chưa rõ thể hiện 32–52WP, không đổi thành % hoàn thành hoặc giả vờ đã biết actual scope. QA hiển thị điểm kiểm thử và lỗi đã biết; nghiệm thu tách tiền mặt. Hướng dẫn phân công nói rõ đổi Dev từ refactor sẽ tạm dừng giảm nợ; việc thứ hai chia thời gian và giảm tập trung15%. Nguồn: ảnh owner, src/ui/Panels.tsx, GDDv1.1§9. Áp dụng ceo-game-design, ceo-ui-accessibility, ceo-local-qa-handoff.

## Verified và giới hạn

Edge155.0.4283.62:24 tổ hợp = VI/EN×UI100/150×1280×720/1920×1080×3 tình huống. Không tràn ngang document/main hoặc ngăn chi tiết. Tại1280×720/UI100 có thanh review vẫn thấy đủ5 hàng; hàng UI100 cao56px. Chín nhóm tương tác:8 tổ hợp mở ngăn/tab, Tab/Shift+Tab, Escape/focus return; nhóm còn lại kiểm search/filter/reset/sort và ẩn/hiện review. Zero console/page errors ở lượt cuối. Node syntax và Prettier được kiểm riêng.

Lượt đầu chỉ thấy4 hàng và browser favicon404. Đã sửa khoảng cách/header trong khu Công việc, hàng56px và data favicon; giữ failure.json/browser-initial.log. SHA256259 tệp source/public/art-source/dist/mockup cũ/package/standalone giữ nguyên. Receipt, ảnh và log: evidence/ui-work-overview-mockup/.

Không dùng kiểm mockup làm bằng chứng game runtime; không chạy verify/E2E/balance/soak/profile của game cho task này. Chưa có human usability, screen-reader hoặc native Safari proof. Game4183 giữ bản hiện tại; không đóng gói/push/upload/deploy.

## Bước tiếp theo

Khiêm xem ba hợp đồng, thử6 công việc và mở/đóng ngăn chi tiết. Sau khi chốt bố cục mới lập phạm vi tích hợp vào runtime, cần owner Approve riêng.
