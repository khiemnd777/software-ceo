# Nhân vật F — rig và chuyển động thật

Ngày 2026-10-22. Khiêm chốt hai mẫu E: **“Chốt hai mẫu E, tiếp tục F”**. Quyền triển khai E–H đã có; F vẫn giữ mốc review clip thật trước khi nhân rộng G. Ghi nhận quyết định: `evidence/character-f/owner-approval-e.json`. Nguồn E/V3 đã duyệt được đọc, không ghi lại.

## Đầu ra F

Mỗi giới có một nguồn Blender chỉnh được (`*-controls-f.blend`), một nguồn bake (`*-baked-f.blend`) và một GLB chứa sáu clip (`*-rigged-f.glb`). Manifest SHA256 tại `art-source/character-f/manifest-f.json`. Bản `*-reimported-f.blend` là scene đã nhập lại chính GLB đó để render, không thay nguồn điều khiển.

Rig có 22 xương biến dạng và 14 xương điều khiển. Tay/chân dùng bốn chuỗi IK hai xương, có điều khiển hướng khuỷu/gối và không kéo dài xương. Trọng số tuyến tính chuẩn glTF, tối đa bốn ảnh hưởng mỗi đỉnh trong file xuất; subdivision trong nguồn đi trước armature. Không dùng biến dạng riêng chỉ chạy được trong Blender rồi giả thành GLB.

| Clip | Chuyển động | Phát review |
|---|---|---|
| `idle` | Ngồi nghỉ, thở nhẹ, tay trên đùi | Lặp |
| `working` | Tay ở bàn phím, chuyển động nhỏ ở thân/tay/đầu | Lặp; chưa có rig ngón tay |
| `walk` | Hai chu kỳ bước trong 2 giây, vung tay ngược chân cùng bên | Một lượt; có dịch chuyển gốc 0,92 m |
| `stand-up` | Từ ngồi sang đứng; chân bước lùi nhẹ để thoát mép bàn | Một lượt |
| `alert` | Cử chỉ phản ứng khi ngồi | Lặp cử chỉ |
| `meeting` | Cử chỉ trao đổi bằng một tay khi ngồi | Lặp cử chỉ |

Sáu clip dài 2 giây, bake ở 24 fps (49 mẫu gồm hai đầu). Mốc thời gian GLB bắt đầu ở 1/24 giây theo frame 1 của Blender; validator dùng thời điểm thật của sampler, không giả định clip bắt đầu ở 0. Gallery quy đổi thời gian tương đối về 0–2 giây.

## Review

Trang: **http://127.0.0.1:4193/art-source/character-f/review.html**. Hai mẫu chạy cùng clip/thời điểm; có góc 3/4, nghiêng, phát/dừng, tốc độ 0,5×, kéo từng khung và ảnh chi tiết 900 px. Chuỗi ảnh 384 px ở 8 fps được render từ GLB nhập lại. Đây là bộ xem ảnh chuyển động, chưa là renderer 3D thời gian thực hoặc screenshot gameplay.

Nội thất dùng đúng `art-source/v4/models/01_workstation_typing.glb`, bỏ nhân vật cũ khi dựng scene review. Model hướng về màn hình thật. Clip đi bộ dùng sàn trống; các clip ngồi/đứng dùng bàn ghế V4. Server `serve-review.py` chỉ phục vụ 428 đường dẫn cố định trên loopback, giữ các trang review cũ.

## Bằng chứng kỹ thuật

- `validate.py`: giải mã binary GLB độc lập với Blender; kiểm accessor/indices/normals, weights, 22 joints, sáu clip, bind pose và vertex chuyển động thực. Kiểm cả chuyển động sau khi bỏ dịch chuyển gốc. Đầu nữ 21 chi tiết khớp hình học V3 trong dung sai 1 micromet.
- Kiểm mỗi clip tại 17 thời điểm, lấy toàn bộ đỉnh đế giày và mẫu vertex cơ thể. Không xuyên sàn hoặc hộp bảo thủ bên trong mặt bàn ở các mẫu đã kiểm. Kiểm này không chứng nhận mọi va chạm tóc/vải/bàn ghế.
- Regression nhịp đi bộ so vị trí tay/chân sau 1 giây, kiểm tay ngược chân cùng bên tại tiếp đất, hông nâng khi chân trụ đi dưới thân, và đo dịch chuyển gốc 0,92 m. Sai khác vị trí chu kỳ dưới 0,002 mm.
- `audit-saved.py`: mở lại hai nguồn điều khiển đã lưu; kiểm 22 DEF/14 CTRL, bốn chuỗi IK, sáu action, trọng số của toàn bộ vertex nguồn và sai số mục tiêu IK dưới 0,1 mm.
- `render.py`: so 180 vị trí khớp mỗi giới giữa nguồn điều khiển và GLB nhập lại trước render. Sai khác tối đa khoảng 0,001 mm. Mỗi giới có 204 khung preview và bảy ảnh chi tiết; receipt chứa hash từng ảnh và đúng hash GLB đầu vào.
- `package-review.py`: kiểm kích thước/hash 422 ảnh, chuyển động pixel của 24 tổ hợp giới/clip/góc; ghép GIF từ các frame thật. GIF giữ cuối clip rồi phát lại để review, không chứng minh `walk` hoặc `stand-up` lặp liên tục.
- `browser.mjs`: Chrome 156.0.8078.47, sandbox bật; PASS24 tổ hợp mẫu/clip/góc, phát/dừng/0,5×/scrub/keyboard/modal/download. Desktop1440×1050 và mobile390×844 không tràn; thanh phát nằm trọn viewport sau scroll. Zero page errors/failed/external requests. Receipt `browser/receipt.json`; checkpoint tổng hợp `checkpoint-f.json`.

369 tệp có trước được đối chiếu: 363 giữ hash và sáu hồ sơ checkpoint có before/after tại `checkpoint-doc-updates.json`. Nguồn ứng dụng, shipping assets, save, balance và art được duyệt giữ trong `preservation-baseline.json`. Các hồ sơ checkpoint được cập nhật riêng, không cho phép ngoại lệ thay source/art. Không chạy lại verify/E2E/profile game ở F vì không đổi ứng dụng hoặc shipping assets. Lượt verify trước E là bằng chứng lịch sử, không phải phép đo runtime F/H.

## Các lỗi thử và cách sửa

- `iteration01`: mục tiêu tay đứng lên/đi bộ vượt tầm và mặt phẳng gối sai ở tư thế ngồi. Sửa mục tiêu trong tầm xương; hiệu chỉnh pole ở tư thế làm việc có gối gập thay vì tư thế nghỉ gần thẳng.
- `iteration02`: tay đi bộ vung chậm hơn chu kỳ chân. Dừng render thử, giữ nguồn/ảnh/log, sửa tần số và pha tay; thêm regression trên GLB.
- `iteration03`: ảnh chuỗi ở điểm chân đi qua dưới thân cho thấy hông hạ sai nhịp, làm dáng đi khụy. Sửa pha và biên độ nâng hông, thêm regression độ nâng hông giữa nhịp; kiểm riêng bốn tư thế đi bộ của mỗi mẫu trước render cả bộ.
- Kiểm đầu nữ ban đầu dùng hash tọa độ làm tròn 6 chữ số, gây sai giả ở biên làm tròn dù chênh số học nhỏ hơn dung sai. Thay bằng đối chiếu số học thật của tập tam giác, vẫn giữ dung sai 1 micromet.
- Gallery lượt đầu có selector trùng thuộc tính trạng thái của `body`; giới hạn selector vào đúng nút. Giữ lỗi và bản HTML/script tại `browser-iteration01/`. Lượt mobile sau đó bổ sung ảnh/kiểm thanh phát nằm trong viewport, giữ bộ trước tại `browser-iteration02/`.
- Regression gait đầu tiên giả định sampler bắt đầu 0; file thực bắt đầu 1/24 giây. Giữ log lỗi, sửa truy vấn về thời điểm bắt đầu thật. Không giảm ngưỡng kiểm.

## Giới hạn và bước G–H

F chưa có rig khuôn mặt/ngón tay, vật lý tóc/vải, LOD shipping hoặc sprite/Canvas integration. Hai mẫu vẫn dùng đầu/trang phục cơ sở E đã chốt. Không gọi kiểm GLB tùy biến là chứng nhận Khronos; không dùng Chrome hoặc hash để thay duyệt mỹ thuật của Khiêm.

**Owner motion acceptance: OPEN.** Dừng tại đây cho Khiêm review sáu clip. Nếu clip được chốt, tiếp tục G rồi H trong quyền E–H đã duyệt: hai mẫu nam và sáu tổ hợp nữ; chân váy là phần dưới rời, nữ có tóc ngắn/dài. H phải bỏ dịch chuyển gốc khi bake sprite đi bộ để tránh cộng hai lần với di chuyển Canvas; kiểm riêng vòng lặp và chuyển trạng thái sprite, mapping ngoại hình/giới tính, save cũ/mới và hiệu năng. Chưa push/upload/deploy hoặc rebuild standalone.

## Lệnh tái lập LOCAL

Blender 4.5.3 LTS hiện dùng tại `/private/tmp/software-ceo-blender-v2/mount/Blender.app/Contents/MacOS/Blender`; Python có NumPy/Pillow và Node24 dùng runtime sẵn của Codex. Không cần cài global.

```sh
BLENDER_F='/private/tmp/software-ceo-blender-v2/mount/Blender.app/Contents/MacOS/Blender'
PYTHON_F='/Users/khiemnguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3'
NODE_F='/Users/khiemnguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
"$BLENDER_F" --background --factory-startup --python-exit-code 1 --python scripts/character-f/build.py
"$BLENDER_F" --background --factory-startup --python-exit-code 1 --python scripts/character-f/audit-saved.py
"$BLENDER_F" --background --factory-startup --python-exit-code 1 --python scripts/character-f/render.py -- female all
"$BLENDER_F" --background --factory-startup --python-exit-code 1 --python scripts/character-f/render.py -- male all
"$PYTHON_F" scripts/character-f/validate.py
"$PYTHON_F" scripts/character-f/package-review.py
"$PYTHON_F" scripts/character-f/serve-review.py
"$NODE_F" scripts/character-f/browser.mjs
```

Chỉ chạy authoring khi cần sửa nguồn mới trong phạm vi được duyệt. Với review/kiểm chứng, đọc các receipt và nguồn đã lưu; không tự rebuild đầu E/V3 hoặc ghi đè bằng chứng cũ.
