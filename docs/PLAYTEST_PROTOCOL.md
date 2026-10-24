# Phiếu playtest W5 LOCAL — CHƯA THỰC HIỆN

Không đánh dấu PASS chỉ vì có phiếu này. Ghi quan sát thật, build digest, ngày, trình duyệt/OS và kết quả. Dùng dữ liệu game giả lập; không thu thông tin cá nhân của người tham gia.

## Người mới — 15 phút đầu

Điều kiện: người chơi chưa xem bot/guide; người quan sát không hướng dẫn cách thắng. Mở production LOCAL, bắt đầu Outsourcing Standard với seed được ghi lại. Chỉ giải thích cách thao tác máy nếu cần.

1. Tạo công ty; yêu cầu người chơi nói mục tiêu tuần đầu bằng lời của họ.
2. Để họ tìm và ký hợp đồng, phân công phát triển/QA, xử lý chất lượng và đi qua một tuần.
3. Yêu cầu chỉ ra tiền mặt, doanh thu và khoản phải thu; hỏi điều gì sẽ trả payroll, điều gì chưa phải tiền có thể chi.
4. Quan sát một quyết định có đánh đổi (policy hoặc scope). Ghi họ dự đoán kết quả gì và kết quả thực tế.
5. Yêu cầu lưu, xuất JSON, reload và phục hồi. Ghi có cần trợ giúp hay mất trạng thái không.

Ghi cho mỗi bước: thời điểm, hành vi, hiểu đúng/chưa đúng, lỗi/điểm kẹt, lời người chơi, mức trợ giúp. Không lấy ý kiến “thích/không thích” thay bằng chứng hoàn thành nhiệm vụ. Không coi số tiền cuối phiên là thước đo học hiểu.

## Campaign và challenge có quan sát

Điều kiện: người chơi thật; build cố định; ghi model/concept/difficulty/seed; có thể chia nhiều buổi bằng save. Không hứa thời lượng 4–7 giờ trước khi đo.

- Ghi thời lượng thực, số lần tạm dừng và quyết định mỗi tuần, đoạn chỉ chờ, điểm không biết làm gì.
- Ghi lúc áp lực tiền/nhân sự/chất lượng biến mất, chiến lược lặp không cần suy nghĩ, và lý do tiếp tục chơi.
- Thử ít nhất một challenge; ghi cả thất bại và hồi phục, không chỉ tìm lời giải bằng bot.
- Sau phiên, chọn vấn đề cần sửa từ quan sát. Chỉ điều chỉnh T0.3 với mục tiêu cụ thể và chạy lại regression/balance; không đổi tỷ lệ thắng theo một mục tiêu tùy ý.

## Accessibility, audio và art

- Người dùng assistive technology thực: làm quản lý, quyết định, save/recovery qua bàn phím và screen reader. Ghi công cụ, phiên bản, nhãn/focus/đọc trạng thái và chỗ không thể tiếp tục.
- Người nghe thật: bật/tắt nhạc/SFX, chỉnh volume, nghe qua phiên kéo dài; ghi độ rõ, âm lượng tương đối và mệt mỏi.
- Owner xem đủ role/cycle/hướng và hai office; ghi các frame/pose cụ thể cần sửa. V4 vẫn là baseline đã duyệt, không thay phong cách khi chưa có quyết định.

## Native Safari còn thiếu

WebDriver hiện bị chặn bởi Allow remote automation chưa bật. Có thể chủ dự án tự bật để chạy tự động hoặc kiểm tra trực tiếp trên cửa sổ Safari đang hiển thị. Không thay tùy chọn này tự động.

Native UI smoke đã xác minh create/day 7/save/reload/Continue. Canvas native đã được xác minh bằng pixel/rAF probe và ảnh tab game hiển thị thực. Lần chụp trống trước đó có lỗi noWindowsAvailable; không kết luận là lỗi renderer. Chạy lại đủ Canvas/camera/ba loops/save/import/export/keyboard/audio/background-tab trên native Safari. Playwright WebKit không thay gate này.

## Mẫu kết quả

- Build digest / OS / browser / ngày:
- Kịch bản / seed / thời lượng thực:
- Quan sát và mức trợ giúp từng bước:
- Lỗi tái hiện cùng dữ liệu thử:
- Đạt / không đạt / chưa xác minh, lý do:
- Quyết định tiếp theo và người chấp thuận:
