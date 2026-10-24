# Software CEO — Build · Ship · Survive

**Bản chơi cục bộ 0.9.0 · cân bằng T0.3 · TypeScript / React / Vite / Canvas 2D.**

Bạn điều hành một công ty phần mềm: chọn Product, Outsourcing hoặc Startup; tuyển người, giao việc, kiểm thử, giao hàng, thu tiền, chăm sóc khách và giữ lời hứa. Ba hướng dùng chung mô phỏng deterministic và đội ngũ. Có chiến dịch 36 tháng, Sandbox, ba challenge, hai văn phòng và tối đa 12 nhân viên.

Đây là bản bàn giao có source, art thật và bằng chứng kiểm thử. **Chưa được duyệt phát hành production**: xem `RELEASE_CHECKLIST.md` để biết chính xác mục đạt, mục chưa đạt và giới hạn môi trường. Không có deployment công khai.

## Chơi ngay từ file

Mở **`PLAY_SOFTWARE_CEO.html`** bằng trình duyệt desktop. File này chứa toàn bộ mã, sprite và âm thanh cần để chơi, không gọi server. Đã kiểm tra mở bằng `file://` khi tắt mạng trong Chrome 156 trên macOS (lượt LOCAL 2026-10-21), gồm New Company, save, reload, export và import. Các browser khác có thể áp dụng chính sách lưu dữ liệu cho file cục bộ khác nhau; cách chạy localhost bên dưới là phương án chuẩn của dự án.

Chọn **Bắt đầu công ty mới**, đặt tên, chọn mô hình, độ khó, seed và chế độ. Game bắt đầu ở trạng thái tạm dừng. Âm thanh mặc định tắt; bật trong Cài đặt nếu muốn. Hướng dẫn sáu bước theo tình trạng công ty xuất hiện ngay trong game.

## Chạy source

Dùng **Node.js 24 LTS** và npm (có `.nvmrc`); Node 22 từ 22.13 cũng nằm trong dải hỗ trợ dependency. Node 23/25 không thuộc dải hỗ trợ của bộ test hiện tại. Mở terminal trong thư mục `software-ceo` đã giải nén:

```bash
npm ci
npm run dev
```

Mở địa chỉ localhost mà Vite in ra, mặc định `http://127.0.0.1:5173`. Lệnh này chỉ phục vụ game trên máy của bạn.

Để chạy bản production:

```bash
npm run build
npm run preview
```

Bản static nằm ở `dist/`. Vite preview mặc định dùng cổng 4173. Không mở trực tiếp `dist/index.html` bằng `file://`; dùng preview server hoặc file HTML tự chứa phía trên.

## Điều khiển

| Thao tác | Điều khiển |
|---|---|
| Chạy / tạm dừng | Space khi không nhập liệu, hoặc cụm thời gian |
| Tốc độ | 1× / 2× / 4×; 1× tương ứng 5 giây/ngày game |
| Từng ngày | Nút Ngày tiếp khi muốn kiểm tra quyết định từng bước |
| Di chuyển văn phòng | Kéo chuột hoặc phím mũi tên khi Canvas có focus |
| Thu phóng | Con lăn, nút +/−; phím 0 căn giữa |
| Chọn nhân viên / khu vực | Click sprite hoặc dùng menu quản trị tương đương |
| Bàn phím | Tab / Shift+Tab, Enter, Space; macOS Safari/WebKit dùng Option-Tab khi giữ mặc định; Escape đóng dialog |
| Cỡ chữ / chuyển động | Cài đặt: 100%, 125%, 150%; Giảm chuyển động |
| Ngôn ngữ | VI / EN |

Desktop mục tiêu: 1280×720 đến 1920×1080. Mobile portrait chưa là trải nghiệm được hỗ trợ hoàn chỉnh; có thông báo trong giao diện.

## Ba cách kinh doanh

- **Outsourcing:** lead → làm rõ yêu cầu → báo giá Fixed Price hoặc T&M → ký → phát triển / QA / sửa lỗi → nghiệm thu → hóa đơn → tiền về. Tiền đặt cọc, doanh thu, phải thu và tiền mặt tách biệt. Có scope change, deadline, trust và khách quay lại.
- **Product:** bắt đầu với 35 khách trả phí, $79/tháng; chọn tính năng đúng thị trường, phát hành có kiểm thử, điều chỉnh giá/marketing, giải quyết support và giữ khách. Marketing không xóa lỗi hoặc nợ kỹ thuật.
- **Startup:** kiểm chứng giả thuyết qua experiment có mẫu và kết quả; xây MVP, tạo traction, pitch và chọn một vòng gọi vốn với điều khoản pha loãng rõ ràng. Có pivot và cam kết nhà đầu tư.

Mỗi tuần có ba lượt CEO. Phân công cơ bản không tốn lượt; tối đa hai assignment/người. Thêm hướng kinh doanh phụ chia sẻ nguồn lực hiện có. Đổi trọng tâm trong bảy ngày đầu quý và phải xác nhận mục tiêu mới.

Hướng dẫn đầy đủ, ví dụ kế toán và mục tiêu thắng: **`docs/PLAYER_GUIDE.md`**.

## Lưu game

Ba slot thủ công và một autosave theo tuần dùng IndexedDB. Save gồm clock, RNG, sự kiện chờ, lời hứa và toàn bộ công ty. Export/import là JSON có checksum SHA-256, schema validation và kiểm tra cân bằng sổ cái. Có migration từ envelope v1 được tài liệu hóa. Checksum phát hiện dữ liệu thay đổi, không phải chữ ký chống gian lận.

Dữ liệu thuộc browser/profile và origin đang dùng; đổi cổng hoặc đổi file có thể tạo vùng lưu khác. Xóa dữ liệu site hoặc chính sách private browsing có thể xóa save. Xuất JSON để chuyển máy và giữ bản sao. Khi hai tab cùng sửa một slot, bản có revision cũ bị từ chối thay vì âm thầm ghi đè. Nếu browser chặn IndexedDB, vẫn có thể xuất JSON.

## Kiểm thử và dựng asset

```bash
npm run verify
npm run test:simulation
npm run test:e2e
npm run test:content
npm run test:balance
npm run test:balance:markets
npm run test:balance:policy
```

`verify` chạy TypeScript, ESLint, unit/integration tests, QA harness tests và build. `test:e2e` tự mở dev server nếu chưa chạy. Trên macOS, E2E mặc định dùng Chrome channel đã cài. Trên môi trường Linux đã dùng, browser thực là `@sparticuz/chromium` 141; xem `docs/TESTING.md` để dùng browser cài trên máy khác và phân biệt engine với nhãn Chrome/Edge.

Các phép kiểm tra production cần `npm run preview` đang chạy ở cổng 4173:

```bash
npx tsx scripts/make-qa-fixtures.ts
npx tsx scripts/make-profile-fixture.ts
npm run test:profile
npm run test:soak
```

Build và kiểm tra file tự chứa:

```bash
npm run build:standalone
node scripts/test-standalone.mjs
```

Art **đã có sẵn**, không cần Python/VTK để chạy hoặc build web. Muốn tái dựng source 3D, sprite hoặc nhạc: xem `docs/ART_PIPELINE.md`. Gameplay chỉ dùng Canvas 2D; không có 3D engine tại runtime.

## Cấu trúc source

| Thư mục | Trách nhiệm |
|---|---|
| `src/simulation` | State, RNG, reducer, command, work, ledger, selectors |
| `src/gameplay` | Contracts, Product, Startup, progression |
| `src/content` | Tham số cân bằng và nội dung EN/VI |
| `src/renderer` | Canvas isometric, camera, depth sort, animation |
| `src/ui`, `src/app` | Giao diện HTML/React, vòng đời, clock và điều hướng |
| `src/persistence` | IndexedDB, checksum, migration, validation, settings |
| `src/audio` | Nhạc/SFX theo tương tác và visibility |
| `art-source` | V4 gốc, pose/prop GLB, source âm thanh và review thật |
| `public/assets` | Atlas WebP, sprite PNG, audio và metadata |
| `tests`, `scripts` | Regression, browser, balance, art, packaging |
| `evidence` | Kết quả máy chạy, screenshot và fixture có nguồn gốc |

`PROJECT_STATE.md` ghi trạng thái bàn giao; `SESSION_HANDOFF.md` ghi lệnh tiếp tục chính xác. Không cần tạo lại kiến trúc hoặc một prompt triển khai mới.

## Nguồn gốc và giới hạn

GDD v1.1 là thiết kế có thẩm quyền, v1.0 bổ trợ. `docs/ART_BASELINE_APPROVAL.md` ghi quyết định V4 đã được chủ dự án chấp nhận; tên UNAPPROVED lịch sử được giữ để bảo toàn provenance. 480 frame chuyển động là chuỗi pose 3D có chỉnh hình học và render thật; không tuyên bố có skeletal rig hoặc 480 GLB animation clips.

`docs/LICENSES.md` và `docs/THIRD_PARTY_NOTICES.txt` lưu nguồn gốc và thông báo phụ thuộc. Không có tài khoản, backend, analytics hoặc dữ liệu gameplay gửi ra dịch vụ ngoài. Chưa thực hiện remote push, hosted preview hay phát hành công khai.
