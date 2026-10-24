---
name: ceo-simulation-economy
description: Implement or debug Software CEO deterministic simulation, staff work, contracts, subscriptions, funding, progression and ledger rules. Use for domain behavior changes; not for purely visual Canvas or HTML styling.
---

# Mô phỏng và kinh tế Software CEO

## Khi dùng và đầu vào
Dùng khi sửa luật hoặc chuyển trạng thái của Product, Outsourcing, Venture Startup, nhân sự, lịch, tài chính hoặc progression. Không dùng riêng cho màu HUD, camera hoặc đóng gói.

Đọc yêu cầu đang được phép, `docs/GDD_v1.1_Web_Canvas.md`, `docs/BALANCE_DECISIONS.md` và tests của luật bị tác động. Đối chiếu `PROJECT_STATE.md` và `docs/ADR-001.md`; dùng v1.0 chỉ khi v1.1 không quy định. Chưa có quyết định balance mới thì giữ T0.3.

## Phạm vi source
- Luật: `src/simulation/`, `src/gameplay/`, `src/content/`.
- Ranh giới điều phối: `src/app/store.ts`; kiểm tra UI caller nếu command thay đổi.
- Kiểm chứng: `tests/simulation/`, `tests/app-clock.test.ts`, `tests/foundation.test.ts`. State shape thay đổi cần kiểm tra persistence cùng `ceo-save-recovery`.

Các đường dẫn trong skill tính từ root chứa `package.json`, không từ thư mục skill.

## Cách thực hiện
1. Mô tả actor, command, điều kiện hợp lệ, state trước/sau và invariant cần giữ. Xác định cả command bị từ chối và thao tác lặp.
2. Theo luồng `GameStore.dispatch` → `transition` → owning rule → selectors/UI. `transition` clone state; `RuleError` trả state đầu vào. Không viết luật kinh tế trong React hoặc renderer.
3. Giữ deterministic replay theo seed/RNG/state và chuỗi command. Core không gọi DOM, storage, network, `Date.now()` hoặc `Math.random()`; thời gian thực nằm ở app clock.
4. Tiền là USD cents nguyên an toàn; phân biệt revenue, cash, receivable, chi phí và funding. Đối chiếu `src/simulation/finance.ts` cùng ledger khi thay đổi chuyển tiền. Không bơm cash hay sửa state trực tiếp để fixtures qua gate.
5. Giữ baseline: tuần 7 ngày, tháng 30 ngày, campaign 1080 ngày; base 6 WP; 3 CEO actions/tuần; Product bắt đầu 35 × $79; Fixed Price 20/40/40; payroll grace 14 ngày. Thay số đã duyệt cần yêu cầu cụ thể, ghi balance version/quyết định và đánh giá save cũ.
6. Thêm regression qua public command cho nguyên nhân lỗi, replay, input không bị mutate và ledger liên quan. Chạy `npm run test:simulation`; chọn tests clock/persistence khi ranh giới đó thay đổi; chạy `npm run verify` trước checkpoint runtime.

## Đầu ra và nghiệm thu
Nêu luật thay đổi, nguồn quyết định, files, command test và kết quả thật. Đạt khi hành vi mong đợi, từ chối input sai, replay và invariants liên quan đều được kiểm chứng. Ghi rõ phần chưa chạy. Chuyển thay đổi balance sang `ceo-balance-playtest`; cập nhật checkpoint theo `ceo-local-qa-handoff`.

## Ví dụ áp dụng
- Dùng: “Invoice đã ghi doanh thu nhưng cash tăng trước ngày thu” → lần theo finance/contract và test ngày trước/đúng hạn.
- Không dùng: “Nút Tài chính tràn ở UI 150%” → `ceo-ui-accessibility`, không đổi ledger.
