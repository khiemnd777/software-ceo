# Working hai bánh răng và che khuất chân trái — LOCAL 2026-10-25

## Phạm vi đã duyệt

Khiêm Approve kế hoạch hai mục: Working là hai bánh răng to–nhỏ quay liên tục, kể cả Pause; sửa phần chân bên trái còn được vẽ lên ghế khi ngồi. Giữ giảm chuyển động, nhãn cố định qua zoom/fit và baseline V4/G–H. Không đổi thời gian/gameplay/save hoặc tích hợp prototype 24h.

## Nguyên nhân và thay đổi

- `src/renderer/Office.tsx`: mask trước chỉ xử lý lưng/tay ghế, chưa đủ vùng mép mặt ghế phải nằm trước chân bên xa. Thêm vùng mép ghế từ sprite gốc, gồm phần đáy có alpha đầy đủ; giữ phần chân gần camera ở phía trước. Không đổi tâm, chân neo hoặc atlas nhân vật. Gate mới kiểm riêng chân xa và chân gần, thay vì suy ra từ pixel lưng ghế.
- `src/renderer/officeOverlay.ts`: huy hiệu Working 24 CSS px có bánh răng 8 răng lớn và 6 răng nhỏ. Chu kỳ quay tương ứng 4 giây/vòng và 3 giây/vòng, ngược chiều. Những tư thế giống nhau sau một bước răng dùng cùng phép quay raster. Biểu tượng idle/cảnh báo và nội dung trạng thái không đổi.
- Nhịp UI riêng tối đa30fps khi có huy hiệu Working, không phụ thuộc tốc độ/Pause của mô phỏng. Pause giữ nhân vật/game state nhưng bánh răng tiếp tục quay. Reduced motion giữ cả hai bánh răng đứng yên. Document hidden dừng nhịp UI; visibility event đặt lại mốc đo để tránh cộng thời gian ẩn.
- Giữa các lần nhân vật đổi pose, chỉ khôi phục nền huy hiệu rồi vẽ hai bánh răng. Nền là tile Canvas nhỏ theo DPR, được chụp trước khi vẽ bánh răng và tái sử dụng theo ID. Tile giữ cả viền/antialias để không tích lũy màu; không đọc ngược pixel từ GPU trong runtime, không vẽ lại cả văn phòng theo nhịp bánh răng. Thu hồi tile khi huy hiệu biến mất hoặc Office unmount; số tile tối đa bằng số Working nhìn thấy.

## Kiểm chứng và bằng chứng

- Baseline/cuối `npm run verify`: PASS66tests/13files +3QA harness, typecheck/lint/build. Log mới nhất `evidence/office-gears-chair-v2/verify-final4.log`.
- Regression pixel: 12pixel lưng ghế;36pixel mép ghế che chân xa;12pixel chân/quần gần camera phải giữ ở phía trước. Fixture có đủ8ngoại hình. Pixel chân gần khớp atlas nhân vật trong dung sai raster; không hạ assertion để che lỗi mask.
- Hai bánh răng: hai kích thước, hướng quay ngược, tỷ lệ góc4/3; quay khi Pause mà không thêm world pass hoặc đổi pixel ngoài huy hiệu. Reduced motion, hidden/resume emulated đạt. Native hidden-tab chưa xác nhận.
- Đã ghi20khung từ browser thật khi Pause để làm GIF QA phóng to; những mẫu cùng pha lặp có pixel khớp tuyệt đối sau khi sửa cache. Giữ ảnh/data lỗi viền/vùng xóa nền của iterations để truy vết.
- Edge156.0.4314.42 sandbox bật: lượt đầy đủ cuối40PASS/2timeout; hai timeout ở Working/Startup trùng hai đợt Sleep901giây của host. Chạy lại đúng hai ca trên cùng build, giữ nguyên timeout/assertions:2/2PASS trong12,7giây. Tổng42ca có kết quả đạt trên build cuối; không gọi đây là một lượt42/42 không gián đoạn. Logs/traces timeout và sleep-wake-evidence.txt được giữ nguyên. Profile riêng12người,4×10giây: rAF60,04–60,10Hz,p9516,7ms,zero browser errors/external requests;7context axe zero selected-rule violations;44file dist giữ hash qua E2E/rerun/profile. worldPasses và workingBadgeBlits được đo riêng; không suy thành60authored poses/giây hoặc benchmark GPU chung. Kiểm ảnh 96mẫu tư thế,16cấu hình/32trạng thái bật/tắt điểm tương tác, zoom/fit và các luồng game/save thuộc bộ E2E.
- Art QA read-only:480frames/60GLB references và1.152character frames/8models PASS;274file public/art-source giữSHA256. Không regenerate art hoặc dùng `--update-metadata`.
- Phạm vi sửa source: `src/renderer/Office.tsx`, `src/renderer/officeOverlay.ts`; mở rộng `tests/e2e/office-display.spec.ts`; `scripts/profile-browser.mjs` thêm bộ đếm world pass/badge blit để phân biệt vẽ văn phòng với vá huy hiệu. Các file prototype24h đổi ngoài lượt sửa này được ghi riêng trong preservation; không ghi đè. Bốn hồ sơ và checkpoint history được cập nhật bằng cách giữ nội dung hiện có.

## Giới hạn và bước tiếp theo

Owner visual acceptance OPEN. Native Safari/human screen reader/novice/campaign/soak/balance mới NOT_RUN; native tab visibility chưa xác nhận. Warning bundle >500kB có trước vẫn còn. Không rebuild standalone/ZIP hoặc push/upload/deploy.

Bằng chứng: `evidence/office-gears-chair-v2/receipt.json`, `chair-before-after.png`, `working-gears.gif`, `browser/`, `profile/`, `gear-frames/timing.json`, `preservation.json`. GIF là ảnh lấy mẫu browser thật được phóng to cho QA, không phải art asset mới.

Bước tiếp theo: Khiêm lưu tiến trình rồi review cùng origin LOCAL `http://localhost:4183/`, xem Working khi Pause và vùng mép ghế/chân trái, chốt nghiệm thu hoặc chỉ rõ tư thế còn lỗi.
