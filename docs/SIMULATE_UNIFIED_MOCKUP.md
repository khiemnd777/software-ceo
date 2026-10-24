# Simulate thống nhất — mockup LOCAL

Hộp dự án đã được thay theo kế hoạch owner duyệt ngày2026-10-24. Hướng hiện hành và lệnh kiểm tra mới ở [Hồ sơ dự án](SIMULATE_PROJECT_DOSSIER_MOCKUP.md). Phần dưới giữ hồ sơ checkpoint Simulate ban đầu; không dùng các kết quả cũ để chứng nhận hộp dự án mới.

Trạng thái: **PROPOSED / READY_FOR_OWNER_REVIEW**, ngày 2026-10-23. Khiêm chốt hướng bằng “Deal”: Simulate bao gồm các chức năng, giữ thao tác và cơ chế hiện tại; chỉ dựng mockup, chưa tích hợp game. Quyết định này thay hướng ba trạng thái của mockup trước.

Mở [bản review LOCAL](http://127.0.0.1:4202/docs/mockups/simulate-unified/). Server chỉ nghe loopback. Đây là dữ liệu mẫu trong bộ nhớ; tải lại đặt về fixture ban đầu. Thanh review chuyển giữa Outsourcing, Product và Startup để xem phạm vi chức năng.

## Luồng thiết kế

Một không gian Simulate luôn giữ Canvas mounted, toàn chiều rộng. Người chơi chọn đối tượng ngay trong cảnh; thông tin và thao tác của đối tượng nổi trong cùng không gian. Không có chế độ Work/People hoặc thanh điều hướng sang các màn hình đó. Điểm tương tác bám camera khi kéo, căn giữa và phóng.

| Đối tượng hoặc vị trí | Thao tác trong Simulate |
| --- | --- |
| Nhân viên / Đội ngũ | Xem vai trò, tinh thần, năng lượng, lương, traits; phân công, đào tạo, tăng lương, thôi việc |
| Bảng dự án | Theo dõi đầu việc; chọn dự án; phân công và chi tiết hợp đồng/nghiệm thu; roadmap/release của Product; MVP/thử nghiệm của Startup |
| Đón ứng viên | Tuyển dụng với điều kiện và confirmation hiện có |
| Khách hàng | Cơ hội, báo giá và các hoạt động thị trường hiện có theo mô hình |
| Bàn tài chính | Tiền mặt, chi phí và các công cụ tài chính hiện có |
| Bàn họp | Chính sách và lựa chọn điều hành hiện có |
| HUD / Hộp thư / Nhật ký | Mở đúng nội dung liên quan trong Simulate; thời gian vẫn có pause/1×/2×/4×/ngày tiếp |
| Tìm trong văn phòng | Tìm nhân viên, đầu việc, vị trí và tiện ích; Ctrl/Cmd+K, Escape và focus return |

Phân công vẫn do người chơi quyết định. Giữ bản nháp trong phiên, chọn nhiệm vụ, Áp dụng theo nhóm, tối đa hai việc, không trùng, khóa công việc chưa đủ điều kiện và giữ việc khác. Không thêm tự giao việc hoặc điều chỉnh balance T0.3. Footer phân công nằm trong luồng cuộn của vùng đối tượng; không che các hàng khi UI150% trên cửa sổ thấp.

## Phạm vi kỹ thuật

- Entry độc lập: `docs/mockups/simulate-unified/main.tsx`; fixture, ánh xạ đối tượng và CSS nằm cùng thư mục.
- Tái sử dụng read-only `WorkPanel`, `PeoplePanel`, `MarketPanel`, `FinancePanel`, `StrategyPanel`, `HistoryPanel`, `Inbox`, Product/Startup và `transition` hiện có. Lệnh chỉ thay đổi fixture tổng hợp trong RAM.
- `Scene.tsx` là bản sao cô lập của renderer hiện hành: thêm báo camera để định vị điểm HTML và chặn raster DPR dưới 1 để cảnh rõ ở browser zoom thấp. Giữ asset, chiếu isometric và chuyển động V4/G–H. Không sửa renderer game hoặc art.
- Lưu/tải phiên mẫu chỉ là snapshot trong RAM; không nhập bootstrap/store/persistence/SaveManager. Reload xóa phiên mẫu và bản nháp. Đây không phải triển khai save game, audio hay onboarding hoàn chỉnh.
- Build riêng bằng esbuild đã có; không thêm dependency, không rebuild game/standalone/ZIP, không push/upload/deploy. Bản mockup cũ tại `simulate-work-people` giữ nguyên làm lịch sử, không còn là hướng thiết kế hiện hành.

## Kiểm chứng

**Verified** — `evidence/simulate-unified-mockup/static-checks.json`:

- Typecheck riêng, ESLint, Prettier và build mockup PASS trên Node 24.19.0.
- Năm test về ba fixture/projection không sửa state/RNG, phân công đúng người, lỗi batch atomic khi trùng/quá hai việc/chưa ký, camera và ánh xạ điều hướng PASS.
- Bundle không nhập bootstrap/persistence. 183 tệp source, public assets, tests, cấu hình, dist/standalone và mockup cũ trong manifest giữ SHA256. Manifest này không phải audit toàn bộ thư mục art-source.

**Verified** — `evidence/simulate-unified-mockup/ui-receipt.json` trên in-app browser:

- 15 mục tương tác được ghi nhận, gồm phân công thật trên fixture, giữ draft, tuyển dụng hủy/xác nhận, điểm theo zoom, Product/Startup, MVP/thử nghiệm, tìm kiếm, snapshot RAM và dialog hợp đồng.
- Sáu địa điểm mở nội dung tương ứng, Canvas giữ chiều rộng; tám mẫu nhân viên/phân công ở hai viewport và UI100/150 không tràn ngang.
- Kiểm ảnh phát hiện footer sticky che nội dung ở cỡ chữ150%. Sau sửa, kiểm lại bốn bố cục: ô phân công lộ qua DOM hit test, cuộn tới Áp dụng và cập nhật thành công. Ảnh `*-rows-final.png`, `*-applied-final.png`, `employee-*-final.png` thay các ảnh ma trận trước sửa footer.
- Lượt cuối không có browser warning/error. `overview-final.png` và `person-final.png` là ảnh bàn giao. Tab review đã mở; viewport override tạm đã reset.
- Viewport CSS thực tế khoảng1278×721 và1921×1078 do browser zoom33% có sẵn; không đổi zoom của người dùng. Không gọi đây là kiểm đúng1280×720/1920×1080.

**Unknown / NOT_RUN** — owner usability/visual acceptance còn OPEN. Chưa có native Safari, screen reader, human playtest, full game E2E, balance, soak hay FPS mới. Những kiểm tra trên chỉ chứng minh mockup trong phạm vi ghi nhận, không chứng minh game đã được tích hợp hoặc gameplay mới đã được chấp nhận.

## Chạy lại LOCAL

Từ root dự án, dùng Node24 trong môi trường hiện có:

```sh
node docs/mockups/simulate-unified/build.mjs
node evidence/simulate-unified-mockup/check-static.mjs
python3 docs/mockups/simulate-unified/serve.py
```

Server dùng cổng4202 và allowlist bundle/ảnh có sẵn; không mở directory listing hoặc source. Nếu cổng đang được server của mockup này dùng, mở URL hiện có. Không dừng tiến trình khác để lấy cổng.

Bước tiếp theo: Khiêm thử chọn nhân viên, dự án và các vị trí để chốt trải nghiệm Simulate thống nhất hoặc nêu điểm cần sửa. Tích hợp game cần kế hoạch và Approve riêng sau review.
