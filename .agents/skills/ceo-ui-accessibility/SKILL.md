---
name: ceo-ui-accessibility
description: Implement or verify Software CEO React management UI, HUD, dialogs, tutorial, EN/VI, keyboard focus, UI scaling and accessible alternatives to Canvas. Not for balance tuning, sprite authoring or a visual redesign of V4.
---

# UI quản lý và khả năng tiếp cận

## Khi dùng và đầu vào
Dùng khi sửa HUD/panels, tutorial, settings/dialogs, copy EN/VI, keyboard/focus, UI scale hoặc lựa chọn không phụ thuộc Canvas. Không dùng cho luật domain hoặc art redesign.

Đọc issue, phần UI/controls của `docs/GDD_v1.1_Web_Canvas.md`, `docs/PLAYER_GUIDE.md`, `docs/FEATURE_TEST_MATRIX.md` và tests liên quan. Xác định actor, nhiệm vụ, ngôn ngữ, viewport, UI scale và trạng thái game tái hiện.

## Phạm vi source
`src/ui/`, `src/app/App.tsx`, `src/audio/player.ts`, `src/persistence/settings.ts`, tests UI/E2E. `src/app/store.ts` là command boundary; không viết công thức tài chính trong JSX. Path tính từ project root.

## Cách thực hiện
1. Theo luồng task từ control → command → phản hồi state/error. Dùng selectors/formatters hiện có; copy giúp người chơi hiểu cash/revenue/receivable, không đưa TODO/note nội bộ thành product copy.
2. Giữ HTML semantic và accessible names; Canvas selection cần đường quản lý tương đương bằng HTML. Kiểm focus mở/đóng dialog, focus return, Escape, thao tác Tab/Enter/Space và trạng thái disabled/error. Không bắt buộc thao tác chuột cho quyết định kinh doanh.
3. Kiểm cả VI/EN tại 1280×720, 1920×1080, scale 100%–150%; tránh tràn ngang, text/action bị che. Desktop-first không tự mở scope mobile redesign.
4. Kiểm reduced motion, thông tin không phụ thuộc màu và audio opt-in sau gesture; mute/music/SFX độc lập. Playback tự động không chứng minh human mix quality hay listening fatigue.
5. Tái sử dụng `tests/e2e/`, `scripts/accessibility-extra.mjs` và profile khi phù hợp; đọc script/fixtures trước chạy. Trên macOS WebKit, Option-Tab có thể cần cho buttons theo default browser; giữ assertion focus. Không đổi OS/browser permission để vượt gate.
6. Với thay đổi runtime, chạy regression đúng task và `npm run verify`; kiểm rendered UI thực. Axe PASS chỉ áp dụng rules/states đã đo; screen reader cần người dùng/công cụ thực. Không tuyên bố WCAG certification từ automated scan.

## Đầu ra và nghiệm thu
Nêu task trước/sau, ảnh/state được xem, viewport/scale/language, keyboard steps và lỗi còn lại. Đạt khi actor hoàn thành task qua HTML/keyboard, focus và phản hồi đúng trong scope đã kiểm. Không đổi baseline art V4. Handoff theo `ceo-local-qa-handoff`; data loss/import lỗi dùng thêm `ceo-save-recovery`.

## Ví dụ áp dụng
- Dùng: “Dialog lưu mất focus sau import ở UI 150%” → tái hiện dialog lifecycle, focus return, hai ngôn ngữ; phối hợp save nếu state thay đổi.
- Không dùng: “Tăng churn để game khó hơn” → `ceo-balance-playtest` và `ceo-simulation-economy`.
