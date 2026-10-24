# Model thật A–C — chờ review D

`models/` là tám GLB thử có skin, sáu clip và morph hiệu chỉnh chân váy khi ngồi; không phải sprite/model production đã được owner duyệt.
`references/` là ảnh mockup AI được duyệt về định hướng; không dùng ảnh này làm texture.
`review.html`/`review.js` là công cụ authoring LOCAL, không được import vào game.

Mở `http://127.0.0.1:4191/art-source/character-redesign-ac/review.html` sau khi chạy `python3 -m http.server 4191 --bind 127.0.0.1` tại root repo.
Chọn model/clip/góc; kéo để xoay; có pause, thanh thời gian và xem lưới tam giác.

Nguồn/tái tạo/kiểm chứng/giới hạn: `docs/CHARACTER_REDESIGN_AC.md`.
Ảnh/clip/receipt: `evidence/character-redesign-ac/`. Model metadata và hash: `models-manifest.json`.

Điểm dừng: owner review model thật tại D. Sau review mới trình kế hoạch hoàn thiện. Không tự tiếp tục tích hợp.
