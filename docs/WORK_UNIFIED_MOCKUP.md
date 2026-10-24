# Công việc → Phân công — mockup ghép LOCAL

Owner đã chốt giao diện và duyệt tích hợp LOCAL. Runtime đã kiểm tại WORK-UNIFIED-RUNTIME-013; xem docs/WORK_UNIFIED_RUNTIME.md. Nội dung checkpoint012 bên dưới là hồ sơ lịch sử.

## WORK-UNIFIED-MOCKUP-012 — 2026-10-21 — chờ owner review

Owner Approve ghép hai mockup thành một luồng, chưa tích hợp game. Bản riêng tại `docs/mockups/work-unified/`: tổng quan gọn → Phân công theo dự án trong vùng rộng → Về tổng quan; tên dự án mở Chi tiết, tab Phân công mở cùng editor. Editor giữ mounted và bản nháp qua đổi dự án/Tài chính; tổng quan giữ search/filter/sort/scroll. Dữ liệu đội ngũ dùng chung trong mockup; Áp dụng cập nhật tổng quan và Chi tiết. Fixture thống nhất ngày77; chỉ tiếng Việt, dữ liệu bộ nhớ, reload đặt lại; không đọc/ghi save thật.

Verified và receipt cuối: `evidence/work-unified-mockup/receipt.json`; kiểm Edge profile riêng, các ảnh overview/editor. Lần test đầu timeout do locator nhân viên bị bộ lọc Chưa phân công che, đã sửa bước test; giữ browser-initial.log/failure. Lượt kiểm tiếp theo PASS 7 nhóm tương tác/4 layout, zero page errors; xem ảnh thấy editor quá ít diện tích nên thu gọn summary và ẩn tutorial khi giao việc. Kiểm cuối PASS: 7 nhóm tương tác, 4 tổ hợp 1280×720/1920×1080 và UI100/150, zero page errors/overflow; hàng nhân viên đầu không bị che, tổng quan ít nhất5 hàng ở1280×720/UI100. Log: browser-final.log. 265 tệp bảo vệ giữ hash. Không suy PASS game từ mockup. Manifest bảo vệ 265 tệp ứng dụng/art/build/hai mockup cũ/package/standalone.

Mở http://127.0.0.1:4191/docs/mockups/work-unified/. Hai mockup cũ giữ nguyên. Owner usability acceptance, EN, screen reader/native Safari và runtime integration còn OPEN. Không chạy lại verify/E2E/balance/soak/profile game, không rebuild/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm thử luồng ghép, phản hồi hoặc chốt thiết kế; tích hợp game cần kế hoạch/Approve riêng.

## Luồng review

1. Mở tổng quan; thử tìm kiếm, lọc, sắp xếp và 3/6 dự án.
2. Bấm Phân công ở hàng dự án hoặc tên dự án → tab Phân công → Mở bảng phân công.
3. Sửa công việc/cách áp dụng cho nhiều người. Qua Tài chính rồi quay lại hoặc về tổng quan và mở dự án khác; bản nháp còn.
4. Áp dụng để cập nhật dữ liệu minh họa dùng chung. Tên/nhóm đội ngũ ở tổng quan và Chi tiết phản ánh kết quả.
5. Về tổng quan giữ các điều kiện xem trước đó. Dự án chưa ký khóa phân công.

## Giới hạn

Bản ghép tách riêng và sao chép UI từ hai prototype; iframe chỉ là cách cô lập CSS cho review, không phải kiến trúc runtime đề xuất. Batch apply chỉ kiểm và cập nhật bộ nhớ minh họa; chưa chứng minh transactional commands của game. Một bộ dữ liệu đã thống nhất ngày77 thay cho hai thời điểm khác nhau ở hai bản cũ. Fixture 6 dự án là tình huống bố cục, không thay giới hạn campaign. Phần VI được review; không tuyên bố EN đã kiểm. Thay đổi kích thước hoặc điều kiện mô phỏng chỉ dành review LOCAL.
