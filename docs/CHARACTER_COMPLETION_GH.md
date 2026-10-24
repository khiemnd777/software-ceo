# Nhân vật G–H — tích hợp LOCAL

Ngày 2026-10-22. Khiêm xác nhận **“Chốt, tiếp tục G–H.”**: chuyển động F được chốt và tiếp tục phạm vi E–H đã duyệt. G và H đã triển khai, kiểm kỹ thuật LOCAL đạt. **Bộ nhân vật G–H APPROVED** theo xác nhận tiếp theo “Chốt G–H, xác nhận bộ nhân vật này.”. Quyết định/hashes tại `evidence/character-gh/owner-approval-gh.json`; technical checkpoint bên dưới giữ lịch sử trước duyệt.

- Gallery: http://127.0.0.1:4195/art-source/character-gh/review.html
- Game production preview đã kiểm: http://127.0.0.1:4194/
- Receipt tổng: `evidence/character-gh/checkpoint-gh.json`.
- Nguồn quyết định F: `evidence/character-gh/owner-approval-f.json`. Receipt F cũ giữ nguyên trạng thái tại thời điểm được lập.

## G — tám tổ hợp từ rig F

| Mẫu | Trang phục dưới | Tóc |
|---|---|---|
| Nam | Quần dài | Ngắn |
| Nam | Quần đùi | Ngắn |
| Nữ | Quần dài | Ngắn / dài |
| Nữ | Chân váy dài rời | Ngắn / dài |
| Nữ | Chân váy ngắn rời | Ngắn / dài |

Nguồn chỉnh được và GLB ở `art-source/character-gh/`; định danh, giới tính và tổ hợp do `src/characters/catalog.json` quy định. Mỗi GLB có 22 xương biến dạng và đủ sáu clip F: idle, working, walk, stand-up, alert, meeting. Nguồn Blender giữ điều khiển/IK từ F. Nguồn F/E/V3 đã duyệt không bị ghi lại.

Quần đùi cắt từ lưới quad F, giữ dải đáy/hông. Phần chân lộ ra dùng lưới liên tục với vòng hỗ trợ gối, đầu dưới nằm trong giày. Chân váy là lưới A-line nối quanh eo, gấu mở và độ dày 3 mm; lớp lót bên trong không lộ ngoài váy. Tóc dài chỉ kéo dài phần tóc sau bob; mặt, mái lệch, phần vén tai và các chi tiết còn lại giữ bản duyệt.

Kiểm độc lập `validate-g.py` đọc binary GLB: chỉ số/trọng số/normal hợp lệ, tối đa bốn ảnh hưởng mỗi đỉnh, đủ clip/22 xương; đối chiếu ma trận xương tại 17 thời điểm mỗi clip với F. Mặt/tóc ngắn giữ 21 chi tiết; tóc dài giữ 20 chi tiết và chỉ đổi phần tóc sau. Sai số mặt dưới 1 micromet; pose xương khớp F. Sampled ground/desk interior không có xuyên hình trong phép kiểm này. Đây không phải chứng nhận mọi va chạm hoặc mô phỏng vải.

`study.py` nhập lại đúng GLB cuối và render 32 ảnh: mỗi mẫu có góc 3/4, sau, ngồi làm việc và đi bộ. `contact-sheet.py` đối chiếu hash toàn bộ 32 ảnh trước khi ghép tám ảnh; chỉ đổi kích thước đồng đều và thêm nhãn, không sửa hình nhân vật. Gallery dùng ảnh này, không giả trình xem 3D có thể chỉnh sửa.

## H — sprite thật và Canvas

`render-sprites.py` nhập GLB, lấy pose xương thật, dùng camera và tỷ lệ V4. Tám mẫu × chín track × 16 khung = **1.152 khung**. Chín track được runtime dùng: idle, working, meeting, alert, stand, turnRight, walkRight, turnLeft, walkLeft. Sáu clip nguồn F được giữ; turn là chuyển tiếp 3D từ tư thế đứng sang đầu chu kỳ đi, không kéo méo ảnh 2D.

Khung nguồn 192×192; 16 khung / 2 giây, phát 8 khung/giây. Các track nghỉ có thể đi qua lại cùng pose; từng track đã có ít nhất tám pose xương và ảnh nhìn thấy khác nhau. Không tạo nhiễu render để giả chuyển động. Script giữ hash pose, PNG, GLB, camera và thời gian nguồn trong receipts và `sprite-provenance.json`.

Walk F có root motion +0,92 m / 2 giây. Khi render sprite, bỏ dịch chuyển này và chuẩn hóa gốc về cùng tọa độ; Canvas dịch nhân vật 0,46 m/giây. Không cộng hai lần. `characterMotion.ts` điều khiển chu kỳ ngồi → đứng → xoay/đi → quay về → ngồi; dùng đồng hồ mỹ thuật và ID ổn định, không gọi RNG hoặc commands nghiệp vụ. Pause, hidden-tab và giảm chuyển động giữ cơ chế của Office.

`pack-sprites.py` cắt alpha, giữ offset so với chân và đóng gói WebP lossless. Tám atlas có tổng payload **5.627.976 byte**, kích thước giải mã **37.781.504 byte (khoảng 36 MiB)** nếu tải cả tám. Runtime tải theo ngoại hình cần dùng. Tổng này không bao gồm nội thất, bộ nhớ GPU hoặc toàn bộ ứng dụng.

`Office.tsx` nhận ngoại hình của từng người, đọc atlas/rect/offset mới và giữ camera, scale, depth, hit test, bàn/ghế V4. Không thêm engine 3D. GLB có subdivision tương đối nặng chỉ dùng offline; đây không phải bộ LOD cho runtime 3D. Atlas theo role cũ và nguồn V4 giữ nguyên để bảo toàn lịch sử; renderer hiện tại dùng atlas nhân vật mới, không tải năm atlas role cũ.

## Danh tính, save và RNG

`appearance?: AppearanceId` là metadata tùy chọn của Employee/Candidate; giới tính, trang phục, tóc nằm trong catalog. Catalog gán rõ ngoại hình cho 24 archetype hư cấu và hai người khởi đầu. Không suy giới tính theo cách viết tên. Không thêm nhân viên, UI thay đồ, lượt RNG hoặc công thức kinh tế.

Save thiếu metadata vẫn đọc được. Renderer ưu tiên appearance hợp lệ; sau đó đối chiếu đúng danh tính từ catalog cũ; với danh tính lạ không có dữ liệu giới tính, chọn preset ổn định từ ID/variant. Fallback này chỉ là ngoại hình, không khẳng định biết giới tính của nhân vật lạ. Không dùng schema default hoặc ghi thêm trường chỉ vì mở/vẽ save cũ. Khi tuyển ứng viên cũ, command chốt appearance trước khi đổi ID sang nhân viên để tránh đổi hình.

State/save version vẫn là 2; schema chỉ mở rộng bằng trường optional được kiểm bằng enum. Bản save v2 trước sửa được import/export qua UI và so toàn bộ state, không thêm trường. Save mới roundtrip giữ appearance. Các bản ứng dụng cũ có schema strict có thể từ chối save mới có appearance; không cam kết mở save mới bằng build cũ.

Trước sửa simulation đã chụp sáu bộ state thật (ba chiến lược × hai seed), sau hire công khai + 35 ngày; regression so toàn bộ state/RNG sau khi bỏ riêng trường appearance mới. Fixtures được khóa chống tự tạo lại từ code đã sửa. Kết quả khớp; không lấy full balance mới làm bằng chứng ở checkpoint này.

## Kiểm chứng thực tế

| Lệnh / phép kiểm | Kết quả |
|---|---|
| `npm run verify` trước sửa | PASS 51 tests / 9 files, 3 QA harness, typecheck/lint/build |
| `npm run verify` cuối | PASS 58 tests / 11 files, 3 QA harness, typecheck/lint/build |
| `python scripts/character-gh/validate-g.py` | PASS 8 GLB, mặt/clip/weights/contact và bảo toàn nguồn cũ |
| `python scripts/check-assets.py --output-dir evidence/character-gh/assets` | PASS 480 khung V4 lịch sử + 1.152 khung mới, pixel atlas khớp PNG/pose nguồn |
| Playwright toàn bộ suite, `scripts/character-gh/e2e.config.ts` | PASS 30/30, 0 skipped/flaky/unexpected; 102,39 giây |
| `node --import tsx scripts/character-gh/browser.mjs` | PASS 8 atlas được Canvas vẽ thật, save cũ/mới, pause/giảm chuyển động, hit test và hai viewport desktop |
| `node --import tsx scripts/character-gh/profile.mjs` | PASS 4×10 giây riêng biệt: 1280×720 / 1920×1080, đủ stand/turn/walk thật, pan và post-GC |
| `node --import tsx scripts/character-gh/gallery.mjs` | PASS 8 mẫu × 4 ảnh và 8 × 9 sprite tracks, playback/pause/scrub/Escape/focus/download, desktop/mobile |
| Python AST, `node --check`, hash fixed dist | PASS 13 scripts, 44 dist files giữ nguyên xuyên các lượt browser QA |

Node 24; Python/Pillow/NumPy từ runtime LOCAL có sẵn; Blender 4.5.3 LTS dùng offline. Chrome 156.0.8078.47 với Chromium sandbox bật. Không đổi package/lock/global config.

E2E chạy từ cwd tạm ghi tại `e2e-workspace.json`, dùng bản sao synthetic fixtures; 67 tệp bằng chứng được sao lại vào `full-suite-evidence/`. Không ghi đè bằng chứng root lịch sử. `e2e-results.json`, logs, browser/gallery/profile receipts và dist manifest nằm riêng trong `evidence/character-gh/`.

Profile Apple M3 Pro / ANGLE Metal, DPR1: rAF khoảng 60,00/giây; p95 16,7–16,8 ms; từng mẫu có 311–498 visible Canvas paints. Post-GC heap tăng 286.696 byte sau các vòng đổi màn hình, số nodes/listeners giữ nguyên. rAF/paints khác 8 pose sprite mỗi giây. Đây là bốn mẫu ngắn trên máy này, không phải soak hoặc cam kết mọi thiết bị. JS heap không đo bộ nhớ atlas/GPU.

JS bundle cuối 588,55 kB, gzip170,18 kB; warning trên500 kB đã có từ baseline514,46 kB và vẫn hiện. Metadata frame mới làm bundle tăng; không tắt warning hoặc thay gate.

## Lỗi được giữ lại

- Mẫu quần đùi đầu có da đùi xuyên phần quần đang che. Đã giảm thể tích phần da bị che và thêm front-ray coverage check trên hình học đã biến dạng; không đổi chân lộ ra. Nguồn/ảnh/báo cáo cũ ở `iteration01/`.
- Node24/E2E ban đầu từ chối JSON import thiếu import attribute. Đã thêm `with { type: "json" }` vào catalog import, chạy lại verify và full E2E; giữ log/report lỗi đầu và dist manifest trước sửa.
- Lượt gọi tsx CLI ban đầu bị sandbox chặn IPC; dùng `node --import tsx` cho cùng script. Không tắt sandbox của Chrome hoặc assertions.

## Phạm vi bàn giao và phần còn mở

G/H implementation, QA LOCAL và mốc owner acceptance đã chốt. Quyết định này không chứng minh có lượt human playtest hoặc kiểm nền tảng mới. Nguồn/ảnh/receipts E/F/V3 và V4 cũ giữ hash. Bảy tệp cũ sửa đúng phạm vi: Office, App, simulation create/commands/types, persistence schema, asset checker; các file mới và hồ sơ checkpoint được liệt kê bằng hash trong receipt.

Chưa có rig ngón tay/khuôn mặt, vật lý vải/tóc, LOD runtime 3D, native Safari mới, soak dài hoặc human playtest mới. Không rebuild standalone/ZIP, push/upload/deploy. Bản standalone/ZIP cũ chưa đại diện G–H.

**Bước tiếp theo đề nghị:** Giữ bộ G–H làm baseline nhân vật cho các lượt phát triển sau; chỉnh sửa mới cần kế hoạch/Approve riêng. Đóng gói/phát hành là task riêng, chưa được thực hiện ở mốc xác nhận này.
