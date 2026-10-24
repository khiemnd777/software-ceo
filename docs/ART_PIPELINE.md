# V4-derived art and audio pipeline

## Nhân vật hiện hành G–H — 2026-10-22

Nhân vật runtime đã chuyển sang bộ G–H theo kế hoạch E–H được duyệt và quyết định “Chốt, tiếp tục G–H.” Rig F/mặt nữ V3 đã chốt; **bộ nhân vật G–H APPROVED** theo “Chốt G–H, xác nhận bộ nhân vật này.”; quyết định/hashes tại `evidence/character-gh/owner-approval-gh.json`. Camera, nội thất và baseline V4 gốc giữ nguyên. Quy trình V4 bên dưới được giữ như lịch sử; bộ nhân vật hiện hành dùng `scripts/character-gh/`, không dùng builder role cũ để tái tạo G–H.

Nguồn: `art-source/character-gh/` có8Blender/GLB/sáu clip mỗi mẫu. Shipping: `public/assets/characters/manifest.json` và8WebP lossless,9tracks×16frames×8models=1.152khung thật,8fps. RenderGLB offline dùng đúng camera V4, bỏ root motion0,92m/2s trước Canvas dịch0,46m/s. Foot offsets/tight alpha crop được kiểm độc lập; runtime không tải GLB. Tổng8atlas5.627.976bytes,37.781.504bytes decoded; tải theo ngoại hình. Bộ480frames/5roleatlases cũ giữ byte để bảo toàn lịch sử nhưng không được Office hiện tại tải.

Catalog `src/characters/` định danh rõ2nam/6nữ/trang phục/tóc, không suy giới tính từ tên. `appearance` optional giữ save cũ; source/tests/limits tại `docs/CHARACTER_COMPLETION_GH.md`. Kiểm art mới: `python3 scripts/check-assets.py --output-dir evidence/character-gh/assets`; không dùng `--update-metadata` trong QA. Gallery http://127.0.0.1:4195/art-source/character-gh/review.html và game4194. Receipt `evidence/character-gh/checkpoint-gh.json` tách bằng chứng mới khỏi V4/E/F cũ.

Nguồn GLB subdivision chỉ phục vụ offline, chưa phải LOD runtime3D. Chưa có ngón tay/khuôn mặt/hair-cloth physics. Bước tiếp theo: giữ G–H làm baseline cho các lượt phát triển nhân vật sau; thay đổi mới cần kế hoạch và Approve riêng. Đóng gói/phát hành vẫn cần nhiệm vụ được duyệt riêng. Mốc xác nhận này không tạo standalone/ZIP hoặc deploy.

## Source of truth

The owner's approval is in ART_BASELINE_APPROVAL.md. The exact supplied V4 source is retained under art-source/v4, including seven real GLBs, original renders/sprites, the Python geometry builders and the historical README. Initial integrity checks matched 40 kit records. V4 contains geometry, not finished rigged animation.

## Rebuild

The game does not require these tools. To regenerate authoring outputs, use Python 3.12 with requirements-art.txt and FFmpeg installed. VTK needs an available offscreen EGL or X display.

```bash
python -m pip install -r requirements-art.txt
VTK_DEFAULT_OPENGL_WINDOW=vtkEGLRenderWindow python scripts/build-assets.py
VTK_DEFAULT_OPENGL_WINDOW=vtkEGLRenderWindow python scripts/build-production-art.py
python scripts/check-assets.py
python scripts/build-audio.py
```

Use a virtual environment on a normal workstation. The private /tmp package directory used on the production host is not a dependency of the delivered game.

`build-assets.py` preserves a shared orthographic camera, world scale and foot origin. `build-production-art.py` authors explicit 3D poses: limb endpoints, torso/head transforms, hand movement, stepping, turning and seated transitions. The renderer projects actual geometry to transparent raster frames. This is a frame-sequence workflow, not a skeletal rig or a GLB animation-track export.

There are five role palettes, 12 states/directions and eight unique frames per track: **480 frames**. Each role's atlas is 2048×3072 WebP, with a 256px frame grid. Eight frames per second drive pose animation; walking movement between world positions is independently interpolated. Static furniture uses PNG. The gameplay renderer is CanvasRenderingContext2D; it does not load GLB or VTK.

The 12 tracks are idle, working, meeting, alert, walk, walkBack, stand, turn, walkRight, walkLeft, turnRight and turnLeft. The five roles share an approved silhouette with different clothing/hair/skin palettes. They are not 24 independently sculpted character bodies.

Seven additional props have actual geometry/source: chair, plant, meeting table and chairs, pantry, sofa, finance shelving and entry/reception. Tier one has five seats; tier two has twelve. Desks, chairs, people and props are separate depth-sorted objects. Floor and walls are cached. Draw calls crop transparent margins and skip frames whose visible content has not changed.

## Verify the assets

- public/assets/manifest.json: camera, pixels/metre, anchors, bounding boxes, atlas rows and source references.
- public/assets/animation-frames.json: per-frame UVs, alpha bounds and visible-pixel hashes.
- art-source/generated/ANIMATION_SOURCE.json: role palettes and authored frame recipe.
- art-source/generated/frame-hashes.json: canonical visible RGBA hashes; fully transparent RGB normalized because lossless WebP does not preserve meaningless RGB behind alpha zero.
- art-source/generated/raw-render-frame-hashes.json: original raw renderer hashes retained for provenance.
- art-source/generated/*_0.glb: 60 actual first-pose GLBs, one for each role/state. All eight poses are reproducible from scripts, not separately claimed as 480 GLB files.
- review-working-side.png, review-walking-side.png, animation-contact-sheet.png and GIFs: actual offline rendered reviews.
- evidence/W5-*.png and W5-canvas-gameplay.webm: actual browser evidence, when present.

check-assets.py decodes the shipped atlases, checks all frame crops, eight distinct visible images per track, source header existence and equality with rendered visible pixels. It does not prove all joint/furniture collision cases; side-angle and Canvas composition are reviewed visually. ART_QA_REPORT.md separates those checks.

## Audio

scripts/build-audio.py synthesizes the original 92 BPM piece Studio Hours (approximately 41.739 seconds) and click, decision, cash, release and alert cues. There are no imported samples. Source WAV is retained in art-source/audio; MP3 and Ogg are in public/assets/audio. The browser uses MP3 for compatibility. Audio is opt-in, starts after a user gesture and pauses on hidden-tab events; music and effects can be muted independently.

No image-generation service, external marketplace asset or unprovided animated model is claimed by this pipeline.
