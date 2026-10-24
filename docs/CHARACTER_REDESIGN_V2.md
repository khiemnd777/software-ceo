# Nhân vật V2 — mẫu cơ sở để duyệt mỹ thuật

Ngày 2026-10-21. Owner đánh giá model A–C cũ 0/10 và duyệt kế hoạch làm lại từ đầu. **Kết quả duyệt mỹ thuật của bản cũ: REJECTED. Bản V2: OPEN, chờ Khiêm review.**

## Phạm vi đã duyệt và điểm dừng

Làm hai mẫu tĩnh trong Blender: một nam và một nữ. Bàn giao nguồn `.blend`, hai GLB, ảnh trước/ngang/sau, cận mặt, clay, tỷ lệ camera game và vòng xoay. Dừng ở review hai mẫu cơ sở trước rig, chuyển động, nhân rộng trang phục/tóc hoặc tích hợp game.

Giữ yêu cầu: low-poly với bề mặt mượt, tỷ lệ tinh tế, tránh khối cầu ở khớp và các phần người rời nhau. Nam có định hướng quần dài/quần đùi; nữ có chân váy dài/chân váy ngắn/quần dài và tóc ngắn/tóc dài. **Chân váy là phần dưới riêng, không thay bằng đầm.** Lần này cả hai mẫu dùng quần dài; nam tóc ngắn, nữ tóc bob. Những lựa chọn còn lại chưa được dựng lại trong V2.

Mockup vẫn là hướng art đã duyệt, không phải bằng chứng model thật đạt chất lượng. Độ giống mockup, tính hấp dẫn của mặt/tóc/tỷ lệ và cảm giác tổng thể cần owner quyết định.

## Skill và công cụ đã dùng

Đã đọc hướng dẫn `character-design`, `3d-modeling` cùng các tệp patterns/sharp_edges/validations liên quan tại [skills-for-antigravity](https://github.com/omer-metin/skills-for-antigravity/tree/main/skills). Áp dụng: kiểm silhouette/tỷ lệ trước, dựng mặt–tóc–tay–trang phục tiếp, xem nhiều góc và đúng tỷ lệ hiển thị, tách gate mỹ thuật khỏi rig/animation. Đây là **tài liệu hướng dẫn đã đọc**, chưa cài hoặc đăng ký thành skill native trong runtime. Không nhận các tuyên bố kinh nghiệm cá nhân trong tài liệu làm năng lực đã chứng minh.

Đã đọc skill local `game-studio:web-3d-asset-pipeline` cho nguyên tắc nguồn → export → reimport, `ceo-canvas-v4` cho ranh giới art game, và `ceo-local-qa-handoff` cho evidence. Không dùng skill gameplay để thay thiết kế nhân vật.

Blender **4.5.3 LTS ARM64** lấy từ máy chủ Blender chính thức. SHA256 DMG: `73ea841053b55404bb3a71a9a22366f1f8821787fe5c899f8b55a7fff929d01b`. Đối chiếu checksum và xác minh chữ ký Developer ID Stichting Blender Foundation thành công. Chạy trực tiếp từ DMG mount read-only trong `/private/tmp/software-ceo-blender-v2/`; không cài vào Applications, không đổi cấu hình global.

## Artifacts và cách dựng

- `scripts/character-redesign-v2/build.py`: authoring bằng Blender Python. Mặt/mũi/má dùng chung bề mặt điều khiển; mắt có mí và mống mắt; tóc là bề mặt liền có relief nông; vai–tay áo dùng cùng topology; cẳng tay–bàn tay được hợp thể tích; giày có đáy phẳng kín.
- `art-source/character-redesign-v2/characters-v2.blend`: nguồn điều khiển có subdivision và các chi tiết đặt tên. Quần và tay có bước remesh; đây chưa phải topology để biến dạng khi diễn hoạt.
- `export.py`: bake các modifier, giảm số tam giác theo nhóm chi tiết, đưa origin về giữa bàn chân, xuất hai GLB tĩnh, rồi nhập lại vào scene kiểm.
- `male-static-v2.glb`: 34.887 tam giác, 715.624 bytes. `female-static-v2.glb`: 34.525 tam giác, 707.192 bytes. Thông số/hashes đầy đủ tại `manifest.json`. Đây chưa phải ngân sách shipping/LOD đã duyệt.
- `export-review-v2.blend`: hai GLB đã nhập lại, không dùng control cage để thay file xuất trong ảnh review.
- `render.py`: Cycles CPU, 32 samples cho ảnh tĩnh và 16 samples cho 24 góc xoay. Vòng xoay chỉ xoay model tĩnh, không phải bằng chứng rig hoặc chuyển động cơ thể.
- `review.html`: gallery LOCAL với các ảnh render thật và thanh kéo góc xoay. Không phải WebGL renderer thời gian thực.

Ảnh/GIF và receipts nằm trong `evidence/character-redesign-v2/`. Các tệp `*-study.png` và `iterations/` là vòng dựng trung gian; trang review dùng các ảnh có trong `render-receipt.json` và `turntable-receipt.json`.

## Kiểm chứng và giới hạn

Kết quả lượt V2 cuối: export/reimport PASS; validator binary PASS hai GLB, không có tam giác zero-area; hash 13 ảnh/24 góc khớp hai GLB cuối; GIF 24 frames; Chrome gallery desktop/mobile PASS; 629 tệp bảo vệ giữ nguyên. Receipt tổng: `evidence/character-redesign-v2/final-receipt.json`. Art acceptance vẫn OPEN.

`validate.py` đọc trực tiếp GLB, kiểm magic/version/chunks/buffers, hash, indices, số tam giác, dữ liệu hữu hạn, normals, tam giác không có diện tích, tọa độ origin, mặt đất và kích thước theo mét. Kiểm không có resource ngoài, rig/skin hoặc animation. Đây không phải Khronos validator và không chứng nhận không collision.

Camera/kích thước game lấy từ `public/assets/manifest.json` và phép đổi pixel trong `src/renderer/Office.tsx`: camera `[6,-6,5.698979486]`, target `[0,0,0.8]`, parallelScale `1.45`, 65×√2 pixel/m tại zoom 1. Ảnh 267×267/534×534 hiển thị đúng pixel. Ánh sáng vẫn là studio Blender; chưa phải lighting của pipeline VTK shipping, chưa phải ảnh game đã tích hợp.

`preservation-baseline.json` khóa hash 629 tệp có trước: source game, assets/V4/generated, dist, test, package/lock, standalone, toàn bộ model/viewer/evidence A–C cũ. Kiểm lại bằng `validate.py`. Không chạy lại suite simulation/soak vì game không đổi. Các kết quả npm verify ở checkpoint A–C là lịch sử, không báo là lượt chạy V2.

Kiểm trang review bằng Chrome LOCAL: tải đủ ảnh, đổi các góc, kéo/phát vòng xoay, zoom pixel, mở đối chiếu mockup, kiểm lỗi và kích thước desktop/mobile. Receipt và ảnh browser riêng trong thư mục evidence V2. Không có remote write/upload/deploy.

Các gate còn mở: owner art acceptance; retopology để rig; deformation khi ngồi/đi; tóc dài và các trang phục còn lại; sprite/bake lighting; appearance mapping; hiệu năng/soak; game integration và release. Xuất GLB hoặc pass kiểm số học không đóng những gate này.

## Tái tạo LOCAL

Chạy từ root repo bằng Blender/Python/Node có sẵn trong môi trường. Blender cần chạy ngoài sandbox filesystem của tiến trình trên host hiện tại; không đổi OS permissions.

```sh
Blender --background --factory-startup --python scripts/character-redesign-v2/build.py -- --source-only
Blender --background --factory-startup --python scripts/character-redesign-v2/export.py
Blender --background --factory-startup --python scripts/character-redesign-v2/render.py
Blender --background --factory-startup --python scripts/character-redesign-v2/render.py -- --turntable
python3 scripts/character-redesign-v2/package-review.py
python3 scripts/character-redesign-v2/validate.py
node scripts/character-redesign-v2/browser-check.mjs
```

`Blender` ở trên là binary `/private/tmp/software-ceo-blender-v2/mount/Blender.app/Contents/MacOS/Blender`. Server review: `http://127.0.0.1:4191/art-source/character-redesign-v2/review.html`.

## Bước tiếp theo

Khiêm review hai mẫu cơ sở trong trang mới, chỉ rõ điểm giữ/sửa. Sau phản hồi mới trình kế hoạch hoàn thiện; chưa tự rig, sản xuất tám biến thể hoặc thay art game.
