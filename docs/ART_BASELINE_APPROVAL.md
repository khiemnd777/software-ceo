# Software CEO — Approved Art Baseline (Owner Decision)

## Nhân vật hiện hành — G–H APPROVED, 2026-10-22

Khiêm xác nhận **“Chốt G–H, xác nhận bộ nhân vật này.”** Bộ tám ngoại hình và kết quả G–H đã giao được chốt làm baseline nhân vật hiện hành: nam quần dài/quần đùi; nữ quần dài/chân váy dài/chân váy ngắn × tóc ngắn/dài. Giữ mặt nữ V3, sáu clip F và 1.152 sprite từ model/rig thật. Camera, nội thất và phong cách văn phòng V4 tiếp tục giữ nguyên.

Quyết định và hash nguồn/model/atlas: `evidence/character-gh/owner-approval-gh.json`. Kỹ thuật trước duyệt: `evidence/character-gh/checkpoint-gh.json`, giữ nguyên nhãn OPEN lịch sử; quyết định mới này thay trạng thái chờ duyệt đó. Phạm vi/giới hạn: `docs/CHARACTER_COMPLETION_GH.md`.

Xác nhận không thêm quyền đóng gói, push/upload/deploy hoặc production release; không thay bằng chứng native Safari/soak/human playtest chưa thực hiện. Bước tiếp theo: dùng G–H làm chuẩn nhân vật; thay đổi thiết kế mới cần kế hoạch và Approve riêng.

## Quyết định V4 trước đó — giữ làm lịch sử và chuẩn nội thất/camera

**Decision recorded:** The owner accepted the V4 art experiment and subsequently approved its use as the baseline for expansion and art-lock direction.

**Approved reference:** `art/Software_CEO_Art_Review_v4/` with the real 3D GLB model, review renders and actual transparent sprite samples. The historical filenames and original `README.md` say UNAPPROVED because the artifacts were generated *before* the user accepted them. Preserve the original readme for provenance; its old status label is superseded by the later explicit user approval.

**Acceptance scope:** V4's general stylized low-poly visual standard, proportions, workstation arrangement, model-based render/sprite direction and improved physically plausible sitting/monitor orientation. This approval does not mean that the static V4 geometry already has rigged animation, complete art coverage or final production-ready polish.

**Non-negotiable artistic standards:** low-poly for performance, not primitive-only blockout; coherent warm modern office atmosphere; no twisted necks, impossible head/torso relations, incorrect chair or monitor facing, hands clipping desktops, feet floating or penetrating furniture, inconsistent perspective, ugly composition, accidental model distortion or static renders mislabeled as animations.

**Platform:** 3D can be used for authoring and sprite export. Gameplay rendering remains HTML Canvas 2D with 2.5D isometric sprites, unless the owner separately approves a renderer change.

**Implication for execution:** It is authorized to build upon the approved V4 family, while genuinely implementing missing rig/animation/assets and validating physical correctness from multiple actual 3D camera views.
