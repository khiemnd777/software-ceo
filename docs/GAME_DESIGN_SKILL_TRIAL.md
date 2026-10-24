# Thử ceo-game-design — tuần đầu Outsourcing

AGENT-SETUP-002, 2026-10-21. Đã đọc skill và áp dụng vào source cùng một lượt thao tác production LOCAL. Đây là kết quả thử skill, không phải quyết định đổi gameplay hoặc human playtest.

## Câu hỏi và mục tiêu người chơi

Tuần đầu Outsourcing có lựa chọn và phản hồi để người chơi hiểu hậu quả, hay chủ yếu ký rồi chờ? Actor là người mới điều hành công ty Standard: giữ đủ tiền, đưa hợp đồng qua phát triển/QA và hiểu tiền cọc khác doanh thu. GDD v1.1 §1–3, §9.4 và §11.4 là nguồn mục tiêu; T0.3/V4 giữ nguyên.

## Verified — source và hành vi vừa thử

- Vòng lặp GDD: quan sát → lựa chọn → thực thi → phản hồi → thích ứng. Mục tiêu 1–3 quyết định quan trọng/tuần; không ép tiêu hết 3 actions.
- `src/ui/Tutorial.tsx` có sáu bước observe/assign/policy/decision/review/income. `src/simulation/commands.ts` phân công không tiêu CEO action, đổi policy có tiêu action; flags tutorial theo thao tác không phải thước đo hiểu biết.
- Chrome 156.0.8078.47, context trống 1280×720, production LOCAL. Ký hợp đồng: cash hiển thị từ $45,000 lên $51,000. Phân công Dev/QA, chọn Chất lượng trước, tiến bảy ngày và mở Nhật ký thành công. Review hiển thị thay đổi cash $6,000, 13.3 điểm việc hoàn thành và tinh thần 77%; lịch sử có QA phát hiện lỗi và lời nhắc Dev sửa.
- Ảnh đã xem: `evidence/agent-setup-002-design-week.png`. JSON: `evidence/agent-setup-002-runtime-trial.json`. 35/35 files HTTP khớp dist bằng SHA256. Đây là một mẫu thao tác, không phải matched-seed balance experiment.
- Trong lượt đi bằng footer thay vì nút tutorial, ngày 7 tutorial ở 3/6 và vẫn hiển thị “Nhìn tiền và công việc”. `Tutorial.tsx` ghi observe khi bấm control của bước đó. Đây là một quan sát tái hiện, chưa đủ kết luận gây khó hiểu cho người mới.

## Brief cho phép thử tiếp theo — Proposed

Giả thuyết: người mới có thể nhận biết lựa chọn về policy/QA nhưng không tự nối cash tăng với tiền cọc và nghĩa vụ giao hàng. Tutorial còn bước đầu sau khi đã làm việc có thể làm họ phân vân; cần quan sát thay vì tự đổi flags.

Hai cách tiếp cận cần kiểm trước khi chọn thay đổi:

1. Giữ UI hiện tại, chạy novice protocol và hỏi người chơi giải thích cash/revenue/receivable sau khi ký và sau review tuần. Chi phí là thời gian quan sát; lợi ích là tránh sửa điều chưa có bằng chứng.
2. Nếu quan sát xác nhận người chơi bị kẹt bởi tutorial, lập đề xuất riêng về điều kiện ghi nhận bước hoặc phản hồi theo ngữ cảnh. Phải kiểm cách đi bằng footer và nút tutorial; không tự đánh dấu “đã hiểu” từ navigation.

Không thêm forced event, cash drain, action limit hoặc đổi policy multipliers. Cần giữ khả năng phục hồi qua đổi phân công Dev sang fix khi QA đã phát hiện lỗi; lợi ích/nguy cơ của policy phải đọc được trước khi chọn. Không yêu cầu âm thanh để hoàn thành quyết định.

## Acceptance và Unknown

Theo `docs/PLAYTEST_PROTOCOL.md`, novice 15 phút ghi actor ẩn danh, build/browser/seed, từng hành động, lời giải thích và mức trợ giúp. Đo completion thực, nhận biết lý do cash thay đổi, lựa chọn có trade-off và đoạn chỉ chờ. GDD §11.4 đặt các mục tiêu ≥80% tutorial/15 phút, ≥70% giải thích cash giảm, ≥70% nêu ít nhất hai trade-offs/45 phút; chưa có mẫu người chơi để tính các tỷ lệ này.

Chưa xác minh novice comprehension, nhịp campaign dài, replayability hoặc tác động thật của tutorial hiện tại. Browser automation thành công không đóng các gate này. Brief chỉ hoàn tất khi các đề xuất, nguồn và phép thử phân biệt rõ; gameplay implementation chưa được cho phép ở checkpoint này.
