# Tích hợp HUD gọn — Software CEO LOCAL, 2026-10-24

## Quyết định và phạm vi

Khiêm: **“Chốt thiết kế, tích hợp game.”** Thiết kế mockup icon được chốt và được phép tích hợp LOCAL theo kế hoạch đã trình: HUD icon+số, tooltip chuột/bàn phím, hướng dẫn một dòng với CTA mũi tên và nút giải thích dấu hỏi; kiểm VI/EN, các cỡ UI và các luồng game. Các nhãn OPEN/NOT_AUTHORIZED trong checkpoint mockup cũ là lịch sử, đã được quyết định này thay thế trong phạm vi tích hợp.

Đã tích hợp vào game thật, dùng dữ liệu và commands hiện có. Không mang số mẫu của mockup vào game. V4/G–H, T0.3, simulation/gameplay/renderer/persistence và save schema giữ nguyên. Không thêm dependency. Không rebuild standalone/ZIP/push/upload/deploy.

## Hành vi hiện hành — Verified

- HUD: tiền mặt, KPI theo mô hình, đội ngũ, uy tín, lượt CEO là icon+số; icon của Product là biểu đồ, Startup là đồng hồ, Outsourcing là bảng việc. Uy tín và lượt CEO tách nút, cùng mở Chiến lược. Lưu/Cài đặt/EN–VI giữ luồng hiện có.
- Chi phí vận hành, số đầu việc, số người được phân công và mô hình công ty nằm trong tooltip; các bảng quản lý vẫn có đầy đủ dữ liệu. Tooltip xuất hiện khi pointer vào hoặc focus, giữ khi trỏ lên nội dung, đóng khi rời/focus ra/Escape/click; có accessible name và aria-describedby.
- Tutorial mặc định một dòng, giữ tiến độ, tên nhiệm vụ và CTA. Giải thích mở nổi phía trên văn phòng, có vùng cuộn khi cần; không lấy thêm chiều cao. Escape/đóng trả focus về dấu hỏi. CTA trong giải thích trả focus về nút còn mounted trước khi điều hướng; không giữ opener đã bị gỡ khỏi DOM.
- Xem tooltip, bảng Tài chính và mở/đóng giải thích không đổi campaign: so sánh hai JSON export thực từ UI cho thấy state giống hoàn toàn. Mở Strategy chưa hoàn thành policy; bấm Giữ chính sách hiện tại vẫn hoàn thành bước thứ sáu mà không tiêu lượt/đổi policy.

## Kiểm chứng

Node24: `npm run verify` trước và sau thay đổi đều PASS — typecheck, ESLint,64tests/12files,3QA harness và production build. Prettier7file thay đổi PASS. Warning bundle>500kB đã có trước:611.64→614.05kB JS; không tắt warning.

Regression production cố định: `CEO_BROWSER=msedge CEO_BASE_URL=http://127.0.0.1:4186 CEO_E2E_RUN=compact-hud-final node node_modules/@playwright/test/cli.js test --config simulate.playwright.config.ts` — **35/35 PASS,0skipped,0flaky,0unexpected**,~182giây. Chromium sandbox bật, profile thử riêng; không dùng slot cá nhân cho tests. Suite cũ30test giữ coverage save/import/export/conflict/ba mô hình/dossier/keyboard/audio/visibility; thêm5test HUD/tutorial. Assertion đổi mô hình trong startup-funding chuyển sang hover/kiểm tooltip vì nhãn hiện đã được chuyển đúng vào tooltip; không giảm hành vi cần kiểm.

36tổ hợp:3mô hình×VI/EN×UI100/125/150×1280×720/1920×1080. Không tràn ngang/cắt nút/tên nhiệm vụ; mở giải thích không đổi scene height. Sáu lượt axe theo mô hình/ngôn ngữ trên vùng HUD/tutorial không có vi phạm trong các rules đã chạy; không suy thành chứng nhận hoặc human screen-reader acceptance.

| Khung CSS | UI | HUD + hướng dẫn | Chiều cao văn phòng |
|---|---|---|---|
| 1280×720 | 100% | 112px | 564px |
| 1280×720 | 150% | 148px | 528px |
| 1920×1080 | 100% | 112px | 924px |
| 1920×1080 | 150% | 148px | 888px |

44distfiles giữ hash trong toàn lượt browser;302tệp art/public, simulation/gameplay/renderer/persistence và mockup đã chốt giữ SHA256. Diff chỉ đổi UI và tests liên quan. Review diff do agent chính thực hiện, không chạy reviewer độc lập. Giữ diagnostics lần launch Edge bị sandbox hệ điều hành chặn tại e2e-initial.log; không suy lỗi đó thành bug game. Lượt chạy được cấp quyền sau đó vẫn giữ Chromium sandbox, đạt5/5focused rồi35/35full. Evidence cũ do tests ghi vào đường cố định đã sao lưu; kết quả mới ở integration/browser-final, file cũ được phục hồi.

## Bàn giao game thật

Đang chạy dev cùng origin của save cũ: **http://localhost:4183/**. Tab game cũ đã được người dùng đóng trước lượt kiểm; đã mở tab mới và bấm Continue. UI thực đọc đúng **KNA SOFTWARE, ngày154, tiền mặt$64,100**,5/6tutorial. Không tăng ngày; game để tạm dừng. CSS1874×991:HUD64px+tutorial48px,scene835px,không tràn. Console tab cuối không error/warn. Ảnh: `evidence/compact-hud/integration/game-local.png`; thông số: local-handoff.json. Production preview kiểm thử: http://127.0.0.1:4186/.

## Files và evidence

- `src/ui/SimulateWorkspace.tsx`, `Tutorial.tsx`, `TooltipButton.tsx`, `simulate.css`, `common.tsx`.
- `tests/e2e/compact-hud.spec.ts`; điều chỉnh assertion semantic trong startup-funding.spec.ts.
- `evidence/compact-hud/integration/receipt.json`, verify-baseline.log, verify-final.log, e2e-full.log, layouts-final.json, before/diff/manifests.
- Full browser results: `evidence/simulate-runtime/compact-hud-final/results.json` và test-results cùng thư mục.

## Giới hạn — Unknown / NOT_RUN

Thiết kế owner APPROVED; kiểm kỹ thuật LOCAL PASS. Owner nghiệm thu thao tác trên bản tích hợp vẫn chờ người chơi. Native Safari, human screen reader, novice playtest, soak/FPS/balance mới NOT_RUN; không cần chạy lại rules/art khi các tệp đó giữ nguyên. Đây không phải phê duyệt production/public release.

Bước tiếp theo: Khiêm xem HUD, mở tooltip và hướng dẫn trên bản lưu đang tạm dừng; phản hồi hoặc nghiệm thu LOCAL. Đóng gói/phát hành cần nhiệm vụ được duyệt riêng.
