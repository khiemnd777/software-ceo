---
name: ceo-game-design
description: Design or review Software CEO player experience, core loops, meaningful choices, onboarding, progression and replayability against the approved GDD. Use for design briefs and source-backed experience reviews; not for silently changing balance, implementing features or replacing V4.
---

# Thiết kế trải nghiệm Software CEO

## Khi dùng và đầu vào
Dùng khi cần giải thích một lựa chọn có đáng chơi không, vì sao người chơi chỉ chờ, tutorial có dạy đúng lúc hoặc progression có mở thêm quyết định. Không dùng riêng cho bug cash, focus dialog, camera hoặc chỉnh một tham số balance.

Đầu vào: câu hỏi thiết kế, actor/playbook, giai đoạn campaign, mục tiêu của người chơi, source/build liên quan, quan sát có thật và phạm vi được phép. Nếu chưa có người tham gia, chỉ review source và thiết kế phép thử; không viết feedback giả.

Đọc phần liên quan của `docs/GDD_v1.1_Web_Canvas.md` (1–3, 9–11), `docs/BALANCE_DECISIONS.md`, `docs/PLAYTEST_PROTOCOL.md`, `TASKS.md`. V4 theo `docs/ART_BASELINE_APPROVAL.md`. Ý tưởng từ nguồn cộng đồng chỉ là tham khảo, không thay GDD hoặc quyết định owner.

## Phạm vi và ranh giới
Path tính từ project root. Review source đọc `src/ui/Tutorial.tsx`, `src/ui/BusinessPanels.tsx`, `src/content/events.ts`, `src/gameplay/progression.ts` và owning rules theo câu hỏi. Design brief/playtest artifacts thuộc docs/evidence của task. Skill này mặc định tạo phân tích/đặc tả; chỉ sửa game khi task hiện tại cho phép rõ implementation.

Không trùng việc với `ceo-balance-playtest`: skill này xác định trải nghiệm/lựa chọn cần kiểm; balance skill thiết kế đối chứng seed và đo hậu quả. Luật/command cần `ceo-simulation-economy`; UI cần `ceo-ui-accessibility`; nghiệm thu checkpoint cần `ceo-local-qa-handoff`.

## Quy trình
1. Ghi rõ câu hỏi và phân loại nguồn: yêu cầu đã duyệt, hiện trạng source, quan sát người chơi, giả thuyết. Player fantasy là xây công ty qua quyết định và hậu quả; không biến game thành bảng thao tác kỹ thuật hoặc bộ câu hỏi có một đáp án đúng.
2. Vẽ bằng lời luồng ngắn: quan sát → lựa chọn → thực thi → phản hồi → thích ứng. Với mỗi lựa chọn, ghi thông tin có trước, alternatives, cost/action/capacity, thời gian hậu quả, uncertainty, cơ hội phục hồi và phản hồi giúp người chơi hiểu nguyên nhân. Kiểm cách chơi khi tắt audio/giảm motion và qua HTML keyboard.
3. Giữ khác biệt ba playbooks: Product tối ưu sản phẩm bền vững; Outsourcing cân scope/QA/deadline/collection; Startup cân evidence/traction/runway/equity. Giữ một nguồn thu phụ và quy tắc chuyển hướng đã duyệt; không thêm multiplayer, backend hoặc cơ chế ngoài MVP bằng design brief.
4. Đối chiếu nhịp GDD: 1–3 quyết định quan trọng/tuần là mục tiêu, không ép tiêu hết 3 actions. Tách số click/assignment với quyết định thực. Giữ T0.3, lịch/tick và điều kiện thắng hiện có trong review; không thêm forced events, adaptive difficulty hay cash drain như thay đổi mặc định.
5. Tutorial: xác định bước dạy thông tin đúng lúc người chơi cần quyết định. Sáu tutorial flags hoặc click hết hướng dẫn không chứng minh hiểu cash/revenue/receivable. Dùng protocol novice 15 phút; các tỷ lệ mục tiêu GDD §11.4 là tiêu chí đo, không phải kết quả. Không suy 4–7 giờ campaign từ simulated days.
6. Viết brief có actor/mục tiêu, hành vi hiện tại kèm nguồn, vấn đề/giả thuyết, phương án và trade-offs, scope, acceptance, phép thử và quyết định cần owner. Với late-game tension/replayability, chỉ đề xuất dựa trên quan sát hoặc ghi rõ giả thuyết; không tăng grind để kéo thời lượng.
7. Thử brief trên ít nhất một tình huống hiện có: người mới chọn policy, đợi khoản thu hoặc xem quarterly review. Nếu chỉ đọc source, ghi SOURCE REVIEW; nếu dùng browser/bot, ghi đúng loại evidence; human experience chỉ đóng gate sau quan sát người thật.

## Đầu ra và nghiệm thu
Giao một design brief ngắn, có Verified / Proposed / Unknown, đường dẫn source, chuỗi hành động/hậu quả và phép đo đủ để bác bỏ giả thuyết. Đạt khi không tự đổi scope/rules/art, acceptance gắn mục tiêu người chơi và mọi kết luận trải nghiệm được đánh dấu đúng mức bằng chứng. Nếu chỉ được giao setup/review, không chỉnh source/content/asset hoặc tự biến Proposed thành Approved.

## Ví dụ thử
- Dùng: “Tuần đầu Outsourcing có phải chỉ ký rồi chờ?” → đối chiếu tutorial, assignment/policy/QA, invoice feedback; đưa task quan sát và tiêu chí hiểu hậu quả, không tự thêm event.
- Dùng: “Giữ nguồn thu phụ có tạo lựa chọn khác biệt?” → lập brief về capacity/risk theo progression, ghi phần chưa quan sát.
- Không dùng: “Thuê bao tính tiền sai” → simulation-economy; “Đổi art sang phong cách mới” → ngoài quyền giữ V4.

Tham khảo nguyên tắc, không cài/import package: [community game-design](https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/game-development/game-design/SKILL.md).
