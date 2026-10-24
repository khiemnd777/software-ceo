---
name: ceo-balance-playtest
description: Evaluate Software CEO economy balance or W5 human playtests using matched seeds, controlled policy experiments and observed player behavior. Use for difficulty and decision-density evidence; not as a substitute for domain bug fixes or native browser QA.
---

# Balance và playtest W5

## Khi dùng và đầu vào
Dùng khi đánh giá độ khó, áp lực cuối campaign, decision density hoặc tổ chức/phân tích playtest. Không dùng tỷ lệ bot thắng làm bằng chứng người mới hiểu game.

Đọc `docs/BALANCE_DECISIONS.md`, `docs/BALANCE_REPORT.md`, `docs/PLAYTEST_PROTOCOL.md`, phần GDD liên quan và `TASKS.md`. Đầu vào cần model/concept/segment/difficulty/seed, build identity, giả thuyết và tiêu chí quan sát. Thiếu người tham gia thì chuẩn bị phiếu, giữ kết quả human là NOT TESTED.

## Phạm vi source
Owning files: `scripts/balance.ts`, `scripts/balance-markets.ts`, `scripts/policy-experiment.ts`, balance reports và evidence. Nếu sửa tham số trong `src/content/` hoặc luật trong `src/gameplay/`, áp dụng thêm `ceo-simulation-economy`. Mọi đường dẫn tính từ project root.

## Cách thực hiện
1. Ghi giả thuyết có thể bác bỏ và giữ T0.3 làm đối chứng. Phân biệt lỗi nghiệp vụ với tham số cần điều chỉnh; không đổi số chỉ để đạt win-rate tùy ý.
2. Khi so policy, ghép cùng seed/model/segment/difficulty và giữ quote, team, scope response, cadence tương đương. Nếu nhiều yếu tố thay đổi, không quy toàn bộ kết quả cho policy.
3. Chọn suite phù hợp: `npm run test:balance` (Retail), `npm run test:balance:markets` (Creative/Education), `npm run test:balance:policy` (matched policies). Ghi phiên bản script, input, số runs thực, rejected commands và invariant failures; không coi script tồn tại là đã chạy.
4. So before/after theo delivery, labor, hidden defects, cash/runway, survival, outcome và trace của seed bất thường. Giữ kết quả baseline riêng; không ghi đè báo cáo cũ để che regression. Không chạy balance đồng thời FPS profile.
5. Với người thật, dùng protocol: novice 15 phút, sustained campaign/challenge, mức trợ giúp, dự đoán/kết quả, thời lượng và đoạn chỉ chờ. Không ghi danh tính riêng tư; chỉ mã participant cục bộ. Không bịa feedback hoặc lấy bot làm participant.
6. Chỉ sửa balance trong phạm vi đã được phép và có lý do từ dữ liệu. Lưu quyết định trong `docs/BALANCE_DECISIONS.md`, ảnh hưởng save/balanceVersion, chạy regression/domain và suite liên quan rồi tổng hợp checkpoint.

## Đầu ra và nghiệm thu
Báo cáo gồm giả thuyết, controls, mẫu, số liệu trước/sau, giới hạn, kết luận và quyết định tiếp theo. Đạt khi mỗi kết luận trỏ tới dữ liệu thực; human/bot, thời gian mô phỏng/thời gian thật và quan sát/suy luận được tách rõ. 1080 × 5 giây chỉ là 90 phút x1 trước pause; không suy ra campaign người thật dài 4–7 giờ.

## Ví dụ áp dụng
- Dùng: “Policy Quality có thực sự tăng lợi nhuận?” → matched seeds, giữ team/quote/cadence, xem cả defects và labor.
- Không dùng: “Bot dư tiền nên đánh dấu novice PASS” → từ chối kết luận; giữ human gate mở, dùng protocol để quan sát.
