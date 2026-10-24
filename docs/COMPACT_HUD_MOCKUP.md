# Mockup HUD gọn — 2026-10-24

**Quyết định hiện hành:** Khiêm đã “Chốt thiết kế, tích hợp game.” Bản icon APPROVED và đã tích hợp LOCAL; xem [bàn giao game](COMPACT_HUD_INTEGRATION.md). Các trạng thái OPEN/NOT_AUTHORIZED bên dưới giữ làm lịch sử trước quyết định này.

## Bản icon — hiện hành, 2026-10-24

Owner Approve phương án đổi nhãn sang icon. Bản Đề xuất hiện dùng SVG tiền, công việc, nhân sự, ngôi sao và tia chớp kèm số. Tên nhiệm vụ hướng dẫn giữ bằng chữ; Mở thành mũi tên, Giải thích thành dấu hỏi. Chín nút icon có tooltip hỗ trợ pointer entry, focus, hover trên tooltip và Escape; accessible names giữ tên nghiệp vụ. Tooltip keyboard/aria-describedby đã kiểm trực tiếp; không coi đây là human screen-reader acceptance.

UI100: phần trên112px, như bản chữ gọn. UI150: phần trên148px ở cả1280 và1920; tại1280 văn phòng482px thay vì454px, tăng thêm28px do HUD vừa một hàng. Trên1920×1080, văn phòng878px ởUI100 và842px ởUI150. Tám tổ hợp trước/sau×khung nhìn×UI không tràn ngang/cắt nút. Năm KPI/CTA/help/policy/Escape/focus return đạt; console cuối không error/warn. Typecheck strict/ESLint/Prettier/build riêng40inputs PASS;381tệp bảo vệ giữ hash. Receipt và ảnh mới tại `evidence/compact-hud/icons/`; bằng chứng bản chữ bên dưới giữ lịch sử.

Owner acceptance OPEN. Chỉ mockup VI; tích hợp game chưa được duyệt, game/save/art không sửa. Full game verify/E2E/balance/soak/FPS/native Safari/human screen reader NOT_RUN ở lượt này. Bước tiếp theo: Khiêm thử icon/tooltip/UI150, phản hồi hoặc chốt; tích hợp cần kế hoạch/Approve riêng.

## Bản dùng nhãn chữ — lịch sử trước cập nhật icon

## Phạm vi đã giao

Khiêm yêu cầu “Cho xem mockup trước”. Bản độc lập tại `docs/mockups/compact-hud/`, chỉ tiếng Việt, dùng dữ liệu tổng hợp trong RAM và Office renderer/art hiện có. Không đọc/ghi save, không import bootstrap/store/persistence. Source game, art và dist không sửa. Tích hợp game chưa được duyệt.

## Thiết kế — Proposed

HUD giữ nhãn và số chính; tách Uy tín / Lượt CEO; logo thu gọn. Chi phí và số phân công xem qua KPI. Tutorial giữ tiến độ, tên bước và CTA trên một dòng; giải thích mở trong văn phòng mà không lấy thêm chiều cao. Ở 1280/UI150, HUD xuống hai hàng để giữ chữ dễ đọc.

Dùng Hiện tại / Đề xuất ở thanh dưới cùng để so sánh cùng snapshot. Hiện tại là bản dựng lại phân cấp bố cục từ source và ảnh owner, không phải bản chụp hay số đo mới của game đang chạy. Số KPI được lấy làm ví dụ từ ảnh owner; không phải số tính từ campaign đang lưu. Nút thời gian và quản lý mở nội dung minh họa; không chạy simulation hay áp dụng policy. Thanh xem mockup cao 48px, không thuộc UI game dự kiến tích hợp.

## Kết quả — Verified

| Khung CSS | UI | Phần trên trước → sau | Văn phòng trước → sau |
|---|---|---|---|
| 1280×720 | 100% | 212 → 112px | 418 → 518px |
| 1280×720 | 150% | 261 → 176px | 369 → 454px |
| 1920×1080 | 100% | 212 → 112px | 778 → 878px |
| 1920×1080 | 150% | 261 → 148px | 729 → 842px |

Kiểm trong Edge qua iframe cùng origin có kích thước CSS cố định, không đổi browser/OS zoom. Tám tổ hợp không tràn ngang/cắt nút phần trên. Desktop thật CSS1874×991 cũng kiểm UI100/150. Năm KPI mở chi tiết; hướng dẫn mở giải thích rồi xem policy; Escape đóng dialog, focus trả KPI/CTA đúng. Mở giải thích giữ scene789px tại desktop UI100. Console cuối trả zero error/warn entries. Không suy thành WCAG hoặc human usability acceptance.

Node24: build riêng `node docs/mockups/compact-hud/build.mjs`, strict TypeScript cho entry mockup và dependency graph, ESLint entry, Prettier sáu file đều PASS. Bundle40inputs không bootstrap/store/persistence. Manifest381tệp source/public/art-source/dist/mockup cũ giữ hash. Receipt `evidence/compact-hud/receipt.json`; ảnh và số đo cùng thư mục.

## Chạy lại

```sh
node docs/mockups/compact-hud/build.mjs
python3 docs/mockups/compact-hud/serve.py
```

Node24 dùng `/Users/khiemnguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`. Server chỉ bind127.0.0.1:4203, whitelist30routes (bundle, trang kiểm viewport, ảnh hiện có); không mở toàn repo. Review: http://127.0.0.1:4203/docs/mockups/compact-hud/.

## Chưa kiểm — Unknown / NOT_RUN

Owner usability acceptance OPEN. Full game verify/E2E, balance/soak/FPS, native Safari, human screen reader NOT_RUN vì không sửa ứng dụng. Chưa tích hợp game; không rebuild standalone/ZIP/push/upload/deploy.

Bước tiếp theo: Khiêm xem mockup và phản hồi hoặc chốt thiết kế. Tích hợp cần kế hoạch và Approve riêng.
