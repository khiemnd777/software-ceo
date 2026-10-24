# Bộ giao diện quản lý — mockup LOCAL 07

Ngày: 2026-10-21. Owner đã Approve kế hoạch mở rộng mockup `Công việc` sang Nhân sự, Thị trường, Tài chính, Chiến lược và Nhật ký. Trạng thái thiết kế: **PROPOSED — chờ owner visual acceptance**. Phạm vi đã thực hiện là prototype, không tích hợp game.

## Mở bản review

- Trang chính: http://127.0.0.1:4191/docs/mockups/management/index.html#people (cần HTTP server LOCAL hiện có).
- Cũng có thể mở docs/mockups/management/index.html trực tiếp. Giữ cả thư mục docs/mockups/ để các file CSS, JS và điều hướng tương đối hoạt động khi offline.
- Điều hướng dưới nối sáu màn hình; Văn phòng nằm ngoài bộ mockup này. Mỗi màn hình mới có ba tình huống ở thanh review tím. Chọn UI 100/150%; Nhân sự/Tuyển dụng có biến thể còn chỗ/đủ chỗ/hết ứng viên; Thị trường/Giá có biến thể chưa có sản phẩm.
- Chỉ dữ liệu trong bộ nhớ trang thay đổi. Năm màn hình mới giữ draft khi chuyển mục bằng navigation; sang trang HTML Công việc hoặc reload sẽ tạo lại dữ liệu minh họa. Đây không phải một campaign dùng chung state/save.

## Thiết kế và nguồn

Áp dụng ceo-game-design, ceo-ui-accessibility, ceo-local-qa-handoff. Quyết định từ AGENTS.md hiện hành, GDD v1.1 §9, theme IDE dark và mockup 06. Tham chiếu source theo phạm vi, không dùng lỗi UI hiện có làm luật game.

| Màn hình | Quyết định và bố cục | Tình huống |
|---|---|---|
| Nhân sự | Quỹ lương/số chỗ/cần chú ý; danh sách nhân viên và chi tiết; tuyển dụng với phí, lương và hòa nhập | Đội ngũ; năng lượng thấp; tuyển dụng; đủ chỗ/hết ứng viên |
| Thị trường | Nhu cầu và khách hàng; so sánh phân khúc; chọn giá/ngân sách và đọc đánh đổi trước xác nhận | Phân khúc; giá/tăng trưởng; cơ hội; chưa có sản phẩm |
| Tài chính | Tiền mặt tách phải thu; danh sách khoản thu và chi tiết; dòng tiền thực có bảng tương đương | Chưa thu; quá hạn; chưa có hóa đơn |
| Chiến lược | Tiến độ mục tiêu; so sánh chính sách; điều kiện mở khóa văn phòng; cam kết | Mục tiêu; chính sách; chưa mở khóa |
| Nhật ký | Báo cáo tuần với dữ liệu đã ghi nhận; tìm/lọc sự kiện và đọc chi tiết | Báo cáo tuần; timeline; trước ngày 7; không có kết quả |

Source: src/ui/Panels.tsx, BusinessPanels.tsx, EmployeeRoster.tsx; rules tại src/simulation/commands.ts, src/gameplay/product.ts và contracts.ts; POLICIES/SEGMENTS/TRAITS tại src/content/catalog.ts. Mẫu Product trước đó dùng retail-reports trong src/content/products.ts.

## Các phản hồi có thể thử

- Tuyển dụng: xác nhận phí 15% lương tháng, một lượt CEO, tăng quỹ lương; nhân viên mới chưa được phân công, năng suất tuần đầu 50% và tuần hai 75%. Khi văn phòng đủ chỗ, nút tuyển bị khóa và hiện lý do. Biến thể đủ chỗ là snapshot năm người/quỹ lương $15,100; không tự thêm ba nhân viên vào state mẫu hai người.
- Đào tạo: $2,000, một lượt, +55 XP, năng lượng −8; mẫu XP ban đầu chưa đủ lên cấp nên kỹ năng không tự tăng. Prototype chỉ minh họa một lần đào tạo/người, không phải toàn bộ lifecycle đào tạo.
- Đặt giá/ngân sách: draft giữ khi đổi màn hình; mỗi xác nhận dùng một lượt CEO. MRR kỳ hiện tại và tiền mặt không tự tăng. Tác động định tính; không chứa công thức forecast hoặc cam kết số khách.
- Nhắc thanh toán: một lượt, đánh dấu đã nhắc, tiền mặt giữ nguyên; hiển thị cam kết tối đa hai ngày theo rule collect. Không chạy thời gian hoặc tự thu tiền.
- Chính sách: xem lựa chọn không áp dụng ngay; xác nhận dùng một lượt. Hệ số và copy theo POLICIES; chỉ tác động công việc tiếp theo, không xóa lỗi/nợ cũ.
- Nhật ký: tìm theo nội dung/ngày, lọc mức độ, trạng thái không có kết quả và xóa bộ lọc. Trước ngày 7 không hiện báo cáo tuần; danh sách sớm chỉ có sự kiện ngày 0. Sự kiện quá khứ không được trình bày như tình trạng hiện tại hoặc nguyên nhân tài chính đã được suy luận.
- Công việc: navigation hai chiều với năm màn hình; sau nghiệm thu mở Tài chính, sau phát hành mở Thị trường. Deep link từ Nhân sự mở tình huống QA của Công việc. Không đồng bộ số liệu giữa các fixture độc lập.

## Verified

- Node 24: syntax management.js và script trích từ Work; Prettier check cho năm tệp prototype/theme. Kiểm liên kết tương đối và static asset references LOCAL; không dùng storage/network API hoặc thêm dependency.
- Edge thật: **88 tổ hợp** = 60 tổ hợp năm màn hình/ba tình huống × hai viewport × UI100/150, thêm 12 biến thể rỗng/khóa, cộng 16 hồi quy Công việc sau tách theme. Không có tràn ngang ở document hoặc nội dung chi tiết trong các trạng thái đo.
- **16 nhóm kiểm tra tương tác**: tuyển/hủy/capacity/empty, vòng focus và Escape, chi phí tuyển/hòa nhập, đào tạo, draft và navigation, giá, ngân sách, nhắc thu, policy, văn phòng khóa, báo cáo sớm, search/filter/empty/reset, no-product metrics, năm lượt navigation hai chiều với Work, nghiệm thu Work → Finance, dialog UI150 tại 1280×720.
- Dialog UI150 nằm trong viewport 1280×720 và không tràn ngang. Edge console error log rỗng trong lượt kiểm.
- Ảnh và evidence tại evidence/ui-management-mockup/. Receipt cuối ghi hash prototype, số tệp game/art/build bảo vệ và kết quả đối chiếu.
- Lượt formatter đầu phát hiện cặp thẻ navigation không khớp sau khi chuyển span sang anchor ở Work. Đã thay toàn bộ khối navigation bằng cấu trúc rõ ràng, formatter và hồi quy navigation/layout sau đó đạt. Không coi lỗi này là lỗi game hoặc bỏ qua kết quả ban đầu.

## Giới hạn

Prototype tiếng Việt, dữ liệu tổng hợp, chỉ bao phủ các tình huống đã nêu. Không có gameplay simulation, save, tuyển người/thu tiền thật, forecast từ năng lực thật, toàn bộ campaign hoặc mọi command hiện hành. Browser proof là Edge; không thay native Safari, human screen reader, novice playtest hay owner acceptance. Không chạy lại npm run verify/E2E/balance/soak/profile hoặc đóng gói game cho thay đổi prototype này. Không push, upload, deploy hay thay bản game đang chơi.

## Bước tiếp theo

1. Owner review cả sáu màn hình, thử các tình huống và chốt điểm cần chỉnh.
2. Sau khi chốt thiết kế, lập kế hoạch tích hợp riêng vào game, gồm các command thực, nhiều dự án/nhân viên, ba playbooks, VI/EN, keyboard và persistence. Chỉ sửa ứng dụng khi owner Approve kế hoạch đó.
