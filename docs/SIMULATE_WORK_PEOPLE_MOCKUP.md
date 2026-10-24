# Mockup Simulate / Work / People

## Phạm vi đã duyệt

Khiêm Approve dựng ba trạng thái để review. Giữ nguyên giao việc thủ công và cơ chế quản lý hiện tại. Chưa tích hợp vào game, chưa duyệt thiết kế cuối hoặc phát hành.

Review tại [mockup LOCAL](http://127.0.0.1:4201/docs/mockups/simulate-work-people/).

## Cách review

1. Chọn **01 Simulate**: xem văn phòng và điều khiển thời gian/camera.
2. Chọn **02 Simulate + Work**: mở dự án, Phân công, chọn từng người/loại việc, rồi Áp dụng. Văn phòng luôn hiện ở bên trái.
3. Chuyển sang **03 Simulate + People**, rồi về Work: bản nháp và bộ lọc giữ trong phiên. People vẫn có Đội ngũ, Tuyển dụng, Phân công và Chi tiết với các hành động hiện có.
4. Bấm nhân viên trực tiếp trong văn phòng để mở People đúng người. Chọn bảng trong văn phòng để mở Work.
5. Kéo **Độ rộng bảng** từ42% đến60%. Dùng **×** hoặc Escape để đóng bảng. Chi tiết nhân viên/dự án mở trong vùng bảng.
6. Có thể chọn UI100/150, Giảm chuyển động hoặc Ẩn thanh review. Reload đặt lại toàn bộ dữ liệu mẫu.

## Cấu trúc và ranh giới

- `docs/mockups/simulate-work-people/main.tsx`: entry React riêng, trạng thái phiên và bố cục.
- `fixture.ts`: dữ liệu tổng hợp, không lấy từ campaign/tab đang chơi.
- `style.css`: chỉ điều chỉnh trình bày trong mockup, không sửa CSS game.
- `build.mjs`: build bundle độc lập qua esbuild đã có trong repo. `app.js`/`app.css` là bản giao để review.
- `serve.py`: loopback4201, chỉ28route bundle/hình đã liệt kê, không serve source, save, directory listing hoặc toàn bộ repo.

Tái sử dụng read-only `src/renderer/Office.tsx`, `src/ui/Panels.tsx`, `WorkWorkspace.tsx`, `EmployeeRoster.tsx`, `workSession.ts` và simulation transition. Các thao tác chạy trên fixture trong bộ nhớ nên không cần viết bản sao luật game. Bundle audit từ chối import `src/persistence/`, `src/app/App.tsx`, `src/app/store.ts` hoặc `src/main.tsx`. Các màn ngoài ba trạng thái chỉ báo phạm vi xem thử.

V4, bộ nhân vật G–H, T0.3 và source game giữ nguyên. Không thêm tự giao việc, giảm số thao tác hoặc tự đổi đội ngũ.

## Kiểm chứng

Node24.19.0: build/typecheck/lint/Prettier riêng đạt. Server Python được kiểm cú pháp. Không chạy build/verify/E2E game vì không sửa ứng dụng.

Edge155.0.4283.62 với Chromium sandbox bật:12 nhóm tương tác,12 tổ hợp ba trạng thái ×hai viewport1280×720/1920×1080 ×UI100/150; thêm4 ảnh assignment editor. Đã kiểm draft qua chuyển trạng thái, batch Apply, hai việc/chốngtrùng, dự án chưa ký, query/sort, dialog/focus/Tab/Escape, Canvas hit test/camera, ngày tiếp/4×/pause, reload, chỉnh bảng và thanh review. Ảnh cuối đã xem trực tiếp; HUD150 không tràn sang thanh thời gian, thanh trạng thái có vùng riêng ngoài Canvas.

Zero browser errors, failed requests hoặc external requests. Không ghi nhận lời gọi Storage/IndexedDB trong lượt đo.176tệp có trước thuộc source/public/tests/build hiện có/package/standalone/mockup cũ giữ SHA256.

- Receipt cuối và ảnh: `evidence/simulate-work-people-mockup/browser-2026-10-22T03-50-30.714Z/`.
- `latest.json`, `static-checks.json`, `protected-before.json`, `bundle-inputs.json`, `delivered-files.json`: chỉ mục bằng chứng, checks và hashes.
- Các lượt lỗi locator, assertion theo nhãn cũ và lần kiểm trước sửa bố cục nằm trong thư mục browser riêng; không tính là PASS của bản cuối.

## Lệnh tiếp tục

```sh
export PATH=/Users/khiemnguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
node docs/mockups/simulate-work-people/build.mjs
python3 docs/mockups/simulate-work-people/serve.py
node evidence/simulate-work-people-mockup/check.mjs
```

Server4201 đang chạy cho lượt review này. Nếu khởi động lại, kiểm port trước; không dừng game4183 hoặc dịch vụ khác. Không rebuild khi đang đối chiếu hashes của lượt browser đã chốt.

## Còn mở

Owner layout/usability acceptance OPEN. Chỉ giao copy tiếng Việt; EN, native Safari và human screen reader chưa kiểm. Mockup không chứng minh acceptance hoặc performance của game sau tích hợp. UI150 dùng cuộn dọc cho bảng dài.

Bước tiếp theo: Khiêm thử ba trạng thái và chốt/tinh chỉnh diện tích quan sát, kích thước bảng và cách mở chi tiết. Chỉ lập kế hoạch tích hợp sau khi có kết luận review; cần Approve riêng trước sửa game. Không push/upload/deploy/ZIP/standalone mới.
