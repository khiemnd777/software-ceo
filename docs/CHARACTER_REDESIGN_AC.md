# Nhân vật mới — A–C / chờ review model thật tại D

Ngày: 2026-10-21. Phạm vi được owner giao: thực hiện A–C, dừng tại D.
Sau khi owner review model thật mới trình kế hoạch hoàn thiện. Không tự tiếp tục E–H.

## Quyết định và nguồn

- Owner duyệt hướng low-poly mượt, tinh tế, bề mặt liền mạch; không lộ khớp cầu hoặc các bộ phận ghép vào nhau.
- Nam: tóc ngắn, quần dài hoặc quần đùi. Nữ: tóc ngắn hoặc tóc dài, phối áo với chân váy dài / chân váy ngắn / quần dài. Chân váy rời, không phải đầm.
- Có tám tổ hợp tham chiếu, không thêm tám nhân viên mặc định và không thêm UI thay trang phục.
- Mockup AI đã được duyệt về hướng thẩm mỹ. Mockup không phải model, topology, rig hay bằng chứng chuyển động.
- Bản sao mockup trong `art-source/character-redesign-ac/references/`. Bảng `approved-male-outfits.png` chỉ dùng hai mẫu nam; các đầm nữ trong bảng đó đã bị thay thế bởi `approved-female-outfits-hair.png`.
- V4 gốc, nội thất, camera, Canvas runtime và balance T0.3 được giữ trong phạm vi này. Quyết định mới cho phép dựng lại nhân vật thử, chưa thay art đang chạy trong game.

## Đã làm — Verified

- Công cụ dựng riêng: `scripts/character-review/build.py`, chỉ dùng NumPy có sẵn. Không cài dependency mới hoặc sửa cấu hình global.
- Tám GLB thử từ hai mẫu cơ sở nam/nữ, một bảng màu. Đây là bộ thử tư thế/tóc/trang phục, chưa phải sản xuất đầy đủ năm vai trò và 12 tracks.
- Vai/thân/tay áo là mesh isosurface nối liền. Quần có pelvis/chân nối liền; validator kiểm số thành phần liên thông, không suy chất lượng từ smooth shading.
- Mỗi GLB có 15 joint được điều khiển độc lập, tối đa bốn trọng số mỗi vertex, inverse bind matrices và sáu clip: idle, working, walk, stand-up, alert, meeting.
- Đây là linear blend skinning thật trong GLB. Chưa có bộ IK tương tác, control rig của DCC hoặc mô phỏng vải/tóc. Các joint không dùng hierarchy giải phẫu đầy đủ; clip hiện điều khiển endpoint theo công thức.
- Chân váy có một morph target hiệu chỉnh độ dẹt khi ngồi, cùng clip chuyển trọng số; không gọi đó là cloth physics. Phần thân vốn bị trang phục che được lược bớt với vùng chồng dưới gấu.
- Khung review đọc trực tiếp accessor, skin, morph và animation trong GLB bằng WebGL2 LOCAL. Đây là công cụ authoring riêng; không thêm WebGL vào renderer game.
- Nội thất review lấy từ GLB V4 gốc, chỉ giữ các node trước nhân vật cũ. Không sửa file V4.
- Ảnh và clip trong `evidence/character-redesign-ac/final/` được chụp từ model thật. Không dùng ảnh AI làm texture hoặc pixel thay cho render model.

## Kiểm tra và bằng chứng

- `npm run verify` trước authoring: typecheck/lint, 46 unit tests/8 files, ba QA harness và production build PASS. Log: `evidence/character-redesign-ac/verify-baseline.log`.
- `python3 scripts/character-review/build.py`: dựng tám GLB. Manifest chứa số vertices/triangles, clip, kích thước và SHA256 của từng file.
- `python3 scripts/character-review/validate.py`: decode GLB độc lập, kiểm index, dữ liệu hữu hạn, unit normals, trọng số, inverse bind, topology liên thông và 240 pose lấy mẫu. Đây không phải Khronos validator hoặc chứng nhận không collision.
- `node scripts/character-review/capture.mjs --final`: Chrome headless với browser sandbox bật, chụp sáu trạng thái/góc trên mỗi GLB; ghi clip sáu đoạn. Receipt chứa browser version, hash GLB trước/sau, số lỗi và thời gian video thực.
- Các vòng ảnh cũ giữ tại root evidence và `iteration-*/`. Một vòng validation đã phát hiện normal collar chưa chuẩn hóa; exporter đã sửa và validator chạy lại. Không đổi assertion để đạt PASS. Một lượt ghi video còn giữ trạng thái pause sau chụp ảnh; đã sửa điều khiển play và bổ sung kiểm thời gian/pixel trước–sau cho từng đoạn video. Kiểm pixel tiếp tục phát hiện clip meeting chỉ giữ pose; đã thêm gesture theo thời gian, đồng thời validator kiểm chuyển động vertex giữa các frame cho cả sáu clip. Các lượt cũ không được dùng làm bằng chứng animation cuối.
- `preservation.json`: đối chiếu 1.107 file baseline. `src`, `public`, V4/generated cũ, `dist`, scripts/tests cũ và evidence cũ giữ hash tại thời điểm kiểm. Riêng `PLAY_SOFTWARE_CEO.html` đổi trong phiên; source A–C không ghi file đó, chưa xác định nguồn thay đổi. Giữ nguyên bytes hiện tại, không phục hồi đè lên công việc khác. Không tuyên bố toàn bộ 1.107 file byte-identical.

## Giới hạn cần owner review — Unknown / OPEN

- Model thử còn đơn giản hơn mockup ở tóc, khuôn mặt, bàn tay, trang phục và vật liệu. Chưa đạt art lock hoặc mức hoàn thiện của ảnh AI.
- Mỗi mẫu khoảng 30–34 nghìn tam giác, chưa tối ưu thành asset shipping. Chưa xác lập ngân sách triangle/atlas/bộ nhớ sau đo.
- Walk là chu kỳ tại chỗ; stand-up là chuyển pose, chưa chứng minh đường đi thực hoặc tiếp xúc chân trong toàn bộ transition.
- Chân váy, tóc dài và tiếp xúc bàn ghế chỉ được review ở những pose/góc đã chụp. Không chứng nhận mọi frame, mọi góc hoặc mọi biến dạng.
- Chưa kiểm GLB bằng DCC độc lập hoặc official validator. Viewer tự viết và validator đều có giới hạn.
- Chưa có source/product integration, appearanceId, avatar, save migration, production atlases hoặc 3.840 frame; chưa có profile/soak của game dùng art mới.
- Camera “của game” dùng cùng vị trí/orthographic scale; đây là scene review riêng, không phải screenshot gameplay mới.

## Cách mở và tái tạo

Python/Node dùng runtime sẵn có theo SESSION_HANDOFF. Cần NumPy và Pillow cho authoring/gallery; Chrome có sẵn cho capture. Không cần thư viện 3D tải từ CDN.

```sh
python3 scripts/character-review/build.py
python3 scripts/character-review/validate.py
python3 -m http.server 4191 --bind 127.0.0.1
# Mở http://127.0.0.1:4191/art-source/character-redesign-ac/review.html
# Terminal khác, sau khi model đã cố định:
node scripts/character-review/capture.mjs --final
python3 scripts/character-review/gallery.py
```

Server trên là LOCAL; không publish. Trình duyệt cần WebGL2 cho công cụ xem model.
Capture ghi vào thư mục final của riêng task; trước một vòng có ý nghĩa mới, giữ bộ cũ bằng tên iteration mới thay vì ghi đè lịch sử cần thiết.

## D — điểm dừng bắt buộc

Owner xem hình dáng, khuôn mặt/tóc, vai/khuỷu/gối, tỷ lệ, trang phục và clip ngồi/đi/đứng lên. Gate D vẫn OPEN.
Sau phản hồi, agent trình kế hoạch phù hợp cho sửa mẫu hoặc sản xuất/tích hợp/QA. Không coi duyệt mockup trước đó là duyệt model thật hiện tại hoặc quyền tiếp tục E–H.

Bước tiếp theo: Khiêm review bộ model thật và nêu các điểm cần giữ/sửa; khi có phản hồi mới trình kế hoạch tiếp theo để duyệt.
