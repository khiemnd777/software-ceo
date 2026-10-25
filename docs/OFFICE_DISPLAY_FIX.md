# Sửa hiển thị văn phòng — LOCAL 2026-10-24

## Phạm vi đã duyệt

Khiêm Approve kế hoạch bốn mục: nhãn ở trên cảnh và giữ kích thước qua zoom/fit; huy hiệu trạng thái; đẩy sofa xa bàn; sửa nhân viên vẽ đè lên ghế. Không đổi simulation, tiền, phân công, save/schema hoặc thiết kế art V4/G–H.

## Hành vi và cách sửa

- `src/renderer/officeOverlay.ts`: vẽ nhãn và huy hiệu sau khi hoàn tất đồ vật; chuyển về tọa độ màn hình với DPR, không giữ camera scale. Huy hiệu 24 CSS px; nhãn Canvas 13 CSS px. Chọn/hover hiện tên và diễn giải. Giữ nhãn trong biên và tìm vị trí tránh chồng; nhãn đang chọn được ưu tiên. Đối tượng ngoài khung không tạo nhãn nổi giả ở mép màn hình. Nhãn tên quá dài có ellipsis; tên đầy đủ vẫn có trong bảng nhân viên.
- Ba trạng thái giữ đúng dữ liệu hiện có: bánh răng xanh ngọc khi `working`; ký hiệu nghỉ xám xanh khi idle; tam giác `!` hổ phách khi morale <30 hoặc energy <25. Cảnh báo ưu tiên và ghi cả hai nguyên nhân nếu cùng thấp. Idle chỉ có nghĩa không thực hiện công việc ở thời điểm đó, không suy ra chưa được giao việc. Không thêm animation nhấp nháy hoặc luật gameplay.
- `src/ui/SimulateWorkspace.tsx`, `src/ui/simulate.css`: nhãn HTML có kích thước riêng với UI scale, không phóng theo camera; bố trí trong biên và tránh nhau, hiện tên đầy đủ/trạng thái. Khi bật điểm tương tác, dùng nhãn HTML và không vẽ lặp tên bằng Canvas. Tìm kiếm/bàn phím và các bảng quản lý giữ nguyên; bảng/dialog ở trên lớp nhãn.
- `src/renderer/Office.tsx`: sofa từ `(1.2, height−1)` sang `(0.9, height−0.5)`, tạo khoảng hở với bàn/chỗ ngồi và giữ sofa trong sàn ở hai office tiers. Giữ opacity của bàn trống như hiện có.
- Ghế giữ nguyên tâm/asset. Ghế nền vẫn vẽ trước nhân viên; mask vùng lưng/spine và tay ghế phía camera được vẽ theo depth phía trước. Mask dùng tọa độ pixel của sprite ghế 512×512 đã khóa; không phủ cả mặt ghế/chân ghế lên chân người và không tái tạo art. Nếu thay asset ghế ở nhiệm vụ sau, phải kiểm lại mask này.

## Kiểm chứng

- Baseline `npm run verify`: PASS 64 tests/12 files + 3 QA harness, typecheck/lint/build.
- Cuối `npm run verify`: PASS 66 tests/13 files + 3 QA harness, typecheck/lint/build.
- Edge 156.0.4314.42 production với Chromium sandbox bật: bộ đầy đủ cuối PASS 40/40, gồm 5 regression hiển thị; zero skipped/flaky/unexpected. Kết quả: `evidence/office-display-fix/browser/results.json`.
- 16 cấu hình hai office tiers × VI/EN × UI100/150 × 1280×720/1920×1080, mỗi cấu hình kiểm bật/tắt điểm tương tác (32 trạng thái), DPR2: nhãn trong biên/không chồng; kích thước giữ qua zoom in/out/fit. Huy hiệu giữ 24px và nhãn Canvas 13px, vẽ sau mọi sprite. Chọn qua huy hiệu, giải thích hai cảnh báo và Escape đạt.
- Pixel thực 12 lưng ghế khớp sprite nguồn ở điểm nội thất được chọn; ghế nền còn ở phía sau. 96 mẫu = 8 ngoại hình × 12 mốc idle/stand/turn/walk/sit; ảnh được xem, paused pixels không đổi. Đây là fixture hiển thị tổng hợp, không phải chứng cứ tiến trình kinh tế hoặc playtest người thật.
- Art check read-only: PASS 480 frames/60 GLB references và 1.152 character frames/8 models. 274 tệp `public/` + `art-source/` giữ SHA256. Không dùng `--update-metadata`.
- Bằng chứng ở `evidence/office-display-fix/`: logs baseline/cuối, iterations giữ riêng, ảnh/pixel/matrix, preservation, receipt. Browser dùng context riêng; không đọc/ghi slot chơi cá nhân.

## Giới hạn và nghiệm thu

Owner visual/usability acceptance OPEN. Native Safari, human screen reader, novice/campaign, soak và balance mới NOT_RUN. Profile riêng 12 nhân viên, bốn mẫu 10 giây, 1280×720/1920×1080: rAF 60,07–60,11Hz; p95 16,7–16,8ms; zero frame >33ms. Đây là display clock của host này, không phải 60 authored poses/giây hoặc benchmark GPU chung. 44 file dist giữ hash xuyên E2E/profile; 7 context axe zero selected-rule violations, zero browser errors/external requests. Kiểm giới hạn zoom min/max, pan và fit tại UI150 cũng đạt 5/5 trạng thái về bounds/nonoverlap. Native tab visibility chưa xác nhận (`realTabSwitchHidden=false`). Cảnh báo bundle >500kB có trước vẫn còn. Không rebuild standalone/ZIP, push/upload hoặc deploy.

Bước tiếp theo: Khiêm lưu tiến trình rồi review LOCAL trên cùng origin `http://localhost:4183/`, kiểm nhãn/sofa/lưng ghế và chốt visual acceptance hoặc gửi vị trí cần chỉnh tiếp.
