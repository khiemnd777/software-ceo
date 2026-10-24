---
name: ceo-canvas-v4
description: Implement or debug Software CEO native Canvas 2D rendering, isometric camera, hit testing, depth, sprite animation and measured rendering performance while preserving approved V4 art. Not for a new visual style or replacement game engine.
---

# Canvas 2D và baseline V4

## Khi dùng và đầu vào
Dùng cho camera, zoom/pan, hit test, depth/occlusion, sprite animation, Canvas performance hoặc review art trong họ V4. Không tự thay phong cách hoặc engine.

Đọc `docs/ART_BASELINE_APPROVAL.md`, `docs/ART_PIPELINE.md`, `docs/ADR-001.md` và issue/screenshot. Đối chiếu `public/assets/manifest.json`, `public/assets/animation-frames.json` khi thay bố cục/atlas. Baseline gốc nằm ở `art-source/v4/`; nhãn UNAPPROVED lịch sử không hủy quyết định owner sau đó.

## Phạm vi source
`src/renderer/Office.tsx`, `src/app/assets.ts`, `tests/e2e/` và scripts profile/art check. Chỉ sửa `public/`, `art-source/` hoặc scripts authoring khi nhiệm vụ cho phép rõ thay art; checkpoint giữ V4 không tự regenerate assets. Mọi đường dẫn tính từ root dự án.

## Cách thực hiện
1. Tái hiện ở build/viewport/DPR đã ghi; xác định lỗi projection, camera transform, hit test, anchor, atlas row hay sort key. Kiểm tra chuyển đổi tọa độ màn hình ↔ world và hit test sau pan/zoom.
2. Giữ Native `CanvasRenderingContext2D`, 2.5D isometric sprites và HTML management UI. GLB/VTK là authoring, không thêm runtime 3D hoặc backend.
3. Giữ tỉ lệ/camera/foot anchors và depth của desk/chair/person/props. Kiểm tra ảnh thật về hướng monitor, cổ/thân, bàn tay, chân/chair và clipping; hashes không thay review hình ảnh.
4. Renderer chỉ chiếu state. Cosmetic interpolation không dùng business RNG, không dispatch tick theo frame và không sửa cash/work. Kiểm tra pause/hidden tab/reduced motion; UI clock là ranh giới riêng.
5. Phân biệt 8 authored poses/giây với rAF/display clock và số Canvas paints. Chạy `npm run test:profile` một mình trên fixture public-command, hai viewport 1280×720 và 1920×1080 khi hiệu năng bị tác động; ghi môi trường/GPU limits. Không suy hiệu năng GPU từ JS heap.
6. Chạy `python3 scripts/check-assets.py` bằng Python có Pillow; mặc định read-only art, có ghi evidence. Không dùng `--update-metadata` để làm gate xanh. Nếu thay renderer, chạy E2E liên quan và kiểm Canvas pixel thật; snapshot DOM không chứng minh Canvas đã vẽ.

## Đầu ra và nghiệm thu
Giao before/after hoặc ảnh kiểm tra thật, lỗi gốc, files và checks phù hợp. Với nhiệm vụ giữ baseline, so SHA256 public/art-source trước/sau. Current art có 480 frames, 60 GLB first poses theo pipeline; không gọi đó là skeletal rig hay 480 GLB. Thiếu visual owner acceptance phải ghi OPEN. Theo `ceo-local-qa-handoff` để cập nhật checkpoint.

## Ví dụ áp dụng
- Dùng: “Click nhân viên sai sau khi zoom” → kiểm inverse camera/hit test và E2E tại zoom/pan tương ứng; không đổi simulation.
- Không dùng: “Đổi toàn bộ V4 thành ảnh AI/new engine” → ngoài phạm vi giữ V4, cần quyết định owner riêng; skill không tự cấp quyền.
