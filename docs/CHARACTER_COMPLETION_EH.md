# Hoàn thiện nhân vật E–H

Ngày 2026-10-22. Khiêm xác nhận thiết kế đầu nữ V3, sau đó **“Duyệt E—H”**. Phạm vi E–H đã được duyệt triển khai LOCAL; không cần xin lại quyền thực hiện từng bước. Kế hoạch được duyệt vẫn có mốc review hai mẫu cơ sở trước diễn hoạt và review clip thật trước nhân rộng. Việc chưa qua các mốc review không đồng nghĩa phạm vi F–H chưa được duyệt.

## Phạm vi và trạng thái

| Bước | Kết quả | Trạng thái hiện hành sau G–H |
|---|---|---|
| E | Chuẩn hóa hai mẫu nam/nữ; giữ đầu nữ V3; toàn thân/cận mặt/clay/camera game | APPROVED — “Chốt hai mẫu E, tiếp tục F”; ghi nhận tại evidence/character-f/owner-approval-e.json |
| F | Rig/trọng số chỉnh được trong Blender; idle/working/walk/stand-up/alert/meeting; tiếp xúc và xuyên hình | APPROVED — “Chốt, tiếp tục G–H.”; evidence/character-gh/owner-approval-f.json |
| G | Nam quần dài/quần đùi; nữ chân váy dài/chân váy ngắn/quần dài × tóc ngắn/dài: tổng8tổ hợp | Đã làm đủ8nguồn/GLB/sáu clip và32ảnh thật; kiểm kỹ thuật đạt; APPROVED theo “Chốt G–H, xác nhận bộ nhân vật này.” |
| H | Sprite từ model thật; mapping ngoại hình đúng giới tính; save cũ/mới; Canvas/hiệu năng/QA LOCAL | Đã tích hợp1.152sprite/8atlas/catalog/save/Canvas; verify58tests/30E2E/profile/gallery đạt; APPROVED trong phạm vi G–H đã giao |

Quyết định chốt G–H: `evidence/character-gh/owner-approval-gh.json`; không suy thành một lượt human playtest hoặc release approval. Chi tiết nguồn, kiểm chứng và giới hạn hiện hành: `docs/CHARACTER_COMPLETION_GH.md`; receipt `evidence/character-gh/checkpoint-gh.json`. Phần E bên dưới giữ hồ sơ checkpoint trước, không ghi lại nguồn/model đã được chốt.

Giữ Canvas 2D, nội thất/camera V4 và balance T0.3. Không thêm UI thay đồ hoặc nhân viên mặc định. Chân váy là phần dưới rời, không đổi thành đầm. Không push/upload/deploy/release hoặc rebuild standalone khi chưa được giao riêng.

## E — nguồn và thay đổi thực tế

`scripts/character-eh/prepare-base.py` đọc bản Blender V3, tạo bản sao hai mẫu theo đơn vị mét, đưa transform vào tọa độ mesh và đưa tâm bàn chân về gốc từng mẫu. Các modifier subdivision và độ dày vải giữ trong nguồn Blender để chỉnh tiếp. Model nam kế thừa nguồn V2; thân nữ/trang phục kế thừa cùng nguồn. Không thay kiểu mặt/tóc đã chốt.

Đầu nữ được nhập từ đúng `female-head-v3.glb` đã duyệt. Kiểm độc lập đối chiếu tập tam giác theo21chi tiết ở GLB toàn thân với GLB đầu nữ, dung sai tọa độ1micromet; không chỉ kiểm tên hoặc số đỉnh. Nguồn V3/model A–C/V2, các ảnh và receipts cũ được giữ nguyên.

Lưới quần cũ là kết quả remesh điêu khắc. E dựng lưới quad có hai ống chân, dải nối đáy/hông và vòng eo thống nhất;652đỉnh/628quad mỗi mẫu, năm vòng hỗ trợ quanh gối. Đây mới là lưới ở tư thế nghỉ; chưa chứng minh skinning hoặc biến dạng. Không gọi remesh cũ hoặc GLB tĩnh là rig.

Hai GLB review là mesh đã áp subdivision, không phải LOD/shipping mesh được tối ưu. Mẫu nam khoảng463nghìn tam giác, nữ khoảng263nghìn tam giác; nguồn điều khiển được giữ riêng. Giảm lưới/weights và tác động thị giác phải được kiểm tại F/H, không dùng số tam giác hiện tại làm bằng chứng hiệu năng runtime.

`render-e.py` nhập lại hai GLB cuối rồi render15ảnh: mỗi giới bảy ảnh (chính diện/3-4/nghiêng/sau/clay/cận mặt/camera game) và một ảnh hai mẫu. Studio dùng Cycles CPU32samples. Ảnh camera game256×256, cùng camera[6,-6,5.698979486]/target[0,0,.8]/parallelScale1.45; viewer hiển thị267px theo tỷ lệ65×sqrt(2)pixel/m của Canvas ở zoom1. Đây là tư thế đứng trong gallery riêng, chưa là screenshot gameplay.

Nguồn/artifacts: `art-source/character-eh/base-models-e.blend`, hai `*-base-e.glb`, `manifest-e.json` và `review-reimported-e.blend`. Scripts tại `scripts/character-eh/`; bằng chứng tại `evidence/character-eh/`.

Review LOCAL: **http://127.0.0.1:4192/art-source/character-eh/review-e.html**. Server giới hạn22đường dẫn file cố định trên127.0.0.1, không phục vụ source repo hoặc thư mục. Server/trang đầu nữ V3 cũ không bị sửa. Gallery là ảnh GLB nhập lại, không giả trình xem rig thời gian thực.

## Lỗi đã phát hiện và giữ bằng chứng

- Lượt đầu có lỗi số đỉnh vòng nối eo (17thay vì18); Blender đã dừng assert. Giữ `prepare-e-initial.log`.
- Kiểm ảnh phát hiện hông quần bị thắt dưới áo. Sửa bán kính vòng hông để nối với thể tích hai ống chân, kiểm lại ảnh cả nam/nữ. Bản lỗi ở `iteration01/`, không dùng làm review cuối.
- Validator ban đầu dùng tên node làm khóa, gặp giới hạn độ dài tên trong Blender khi nối hậu tố export. Sửa exporter ghi `source_part` trong glTF extras để giữ định danh đầy đủ; validator vẫn đối chiếu hình học từng tam giác, không giảm assertion. Giữ log lỗi đầu.
- Kiểm ảnh ghép phát hiện giày bị cắt ở mép dưới; tăng vùng nhìn camera, giữ nguyên model. Kiểm góc nghiêng tiếp tục phát hiện đường may khóa quần cũ nổi ra trước quần retopology; bỏ chi tiết rời này khỏi bản E. Giữ ảnh/source của các lượt trước trong `iteration02/` và `iteration03/`; bộ cuối render lại từ GLB tương ứng, không dùng lẫn hash hoặc ảnh lượt trước.

## Kiểm chứng và giới hạn

- `npm run verify` trước authoring PASS: typecheck/lint,51tests/9files,3QA harness, production build. Log `verify-baseline.log`. Warning bundle JS514kB đã có trước thay đổi art; không đổi dependency hoặc quality gate.
- `validate-e.py`: kiểm binary GLB, chunk/buffer/accessor bounds, finite/index/unit normals, zero-area, tọa độ/mặt đất, source hash và đầu nữ; kiểm quần toàn quad và các tệp có trước theo baseline. Kết quả cuối ở `validation-e.json`.
- `audit-source-e.py` mở nguồn E đã lưu, không save/rebuild: transform mesh đã áp; mỗi quần một thành phần liên thông, toàn quad, ba vòng biên chủ đích (eo và hai gấu), không có chỗ nối non-manifold. Đây không phải chứng nhận biến dạng.
- `browser-e.mjs`: kiểm14góc/mẫu và ảnh hai mẫu, camera game256px/267px, downloads/ref bytes, desktop/mobile, request errors và deny-list server. Kết quả ở `browser-e/receipt.json`.
- Receipt checkpoint E ở `checkpoint-e.json`; kết quả kỹ thuật không thay duyệt mỹ thuật hoặc biến dạng. Không chạy lại E2E/profile/soak game tại E vì chưa sửa source/shipping assets. Verify baseline không phải kết quả H.

F đã có rig và sáu clip thật cho mỗi giới; nguồn, giới hạn và kiểm chứng tại docs/CHARACTER_RIG_F.md, receipt evidence/character-f/checkpoint-f.json giữ lịch sử trước duyệt. Quyết định chốt F ghi riêng trong evidence/character-gh/owner-approval-f.json. G/H đã có đủ biến thể và tích hợp LOCAL; bằng chứng hiện hành tại docs/CHARACTER_COMPLETION_GH.md. Các mẫu thử A–C bị từ chối được giữ làm lịch sử, không dùng làm nguồn mới.

## H — phát hiện ở mốc E và cách xử lý

Trước bước H, `Employee`/`Candidate` có `variant`, chưa có trường giới tính riêng. `OfficePerson` chưa nhận `variant`; Canvas chọn atlas theo role, nên tên/variant không thay mẫu nam/nữ. Đây là hiện trạng đã đọc từ `types.ts`, `create.ts`, `schema.ts`, `App.tsx`, `Office.tsx` tại E, không phải tình trạng sau tích hợp H.

H đã thêm định danh ngoại hình do catalog quy định và trường appearance optional; giới tính/trang phục/tóc nằm trong catalog. Lookup danh tính cũ được viết rõ, không đoán giới tính từ cách viết tên; fallback danh tính lạ dùng ID/variant ổn định. Không thêm lượt RNG nghiệp vụ, không đổi seed/RNG/kinh tế hoặc ghi trường mới chỉ vì render save cũ. Save cũ/new roundtrip và state/RNG được kiểm bằng fixture trước sửa; chi tiết/giới hạn tương thích build cũ tại docs/CHARACTER_COMPLETION_GH.md.

## Điểm tiếp theo

E và F đã được chốt; G/H đã triển khai trong quyền đã có. Bước tiếp theo: giữ G–H làm baseline cho các lượt phát triển nhân vật sau; thay đổi mới cần kế hoạch và Approve riêng. Đóng gói/phát hành vẫn cần nhiệm vụ được duyệt riêng. G–H APPROVED theo xác nhận trực tiếp, không suy từ technical PASS; chưa rebuild standalone/ZIP hoặc push/upload/deploy.
