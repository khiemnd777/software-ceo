# Thử ceo-game-audio — cue sheet và kiểm tra runtime

AGENT-SETUP-002, 2026-10-21. Đã đọc skill, lần theo caller và thử browser cô lập. Không regenerate WAV/MP3/Ogg, thay mapping, chỉnh mix hoặc gửi asset ra dịch vụ ngoài.

## Verified — cue sheet hiện tại

Nguồn: `src/audio/player.ts`, dispatch/lifecycle trong `src/app/App.tsx`, `src/persistence/settings.ts`, `src/ui/SettingsDialog.tsx`, `public/assets/audio/manifest.json` và `docs/ART_PIPELINE.md`.

| Cue/nhạc | Caller và ý nghĩa hiện có | Giới hạn kiểm chứng |
|---|---|---|
| Studio Hours | Music opt-in sau gesture, loop; master ×0.55 | Media clock thực chạy; chưa nghe loop seam hoặc fatigue |
| click | Command thành công, trừ release/decide/tick/tutorial | Đã thấy click.mp3 phát sau ký hợp đồng; không có nghĩa đã thu đủ tiền |
| decision | Command `decide` thành công | Đã đối chiếu source; không phát sinh event decision trong lượt browser này |
| release | Command `release` thành công | Đã đối chiếu source; không hoàn thành release trong lượt browser này |
| alert | Command bị từ chối, trừ tick/tutorial | Source mapping; không chứng nhận mọi cảnh báo tài chính đều phát cue |
| cash | Có asset/manifest; tìm caller toàn bộ src chưa có nhánh phát cash cue | Asset-only ở hiện trạng đã rà; chưa nối emitter, không tự kết luận đây là bug theo GDD |

App có phản hồi bằng toast/history/UI; cue không được dùng làm nguồn xác định tiền đã thu. Những tình huống decision/release/alert vẫn cần đối chiếu visual equivalent và nghe thử thực khi nằm trong phạm vi nghiệm thu tương ứng.

## Verified — thử kỹ thuật vừa chạy

Chrome 156.0.8078.47 headless trên production LOCAL, browser context riêng, không đụng storage/profile người dùng. Dùng lớp Audio quan sát kế thừa native Audio; không mock hoặc bypass `play()`. Preview 35/35 files khớp dist bằng SHA256. Kết quả `evidence/agent-setup-002-runtime-trial.json` PASS, zero console/page/HTTP errors trong mẫu.

- Mở context mới: nhạc/SFX unchecked và chưa tạo Audio element.
- Bật nhạc qua UI: real currentTime tiến, readyState 4, error null. Master 0.4 cho music volume 0.22; cue click dùng 0.4. Đây là giá trị API, không phải chênh lệch loudness cảm nhận.
- Tắt SFX: nhạc vẫn enabled và chạy. Tắt nhạc: music paused, preference SFX vẫn enabled. Không suy ra toàn bộ cue interruption cases từ một lượt này.
- Phát visibilitychange với document.hidden mô phỏng: tất cả Audio quan sát bị pause. Khôi phục visible thì nhạc chạy theo preference. Đây là kiểm app handler, không phải native tab/OS hoặc Safari acceptance.
- Tắt cả hai rồi reload: preferences vẫn tắt, volume vẫn 0.4, không tạo Audio element mới.

## Proposed — kế hoạch nghe thử

Giữ nguyên tracks/mix; người nghe thực bật nhạc và SFX trong phiên game, ghi thiết bị/browser/volume, mức rõ của click/decision/alert, cảm giác khi cue lặp, loop seam và mệt mỏi. Nếu muốn phản hồi cho khoản thu, trước tiên xác nhận nhu cầu bằng quan sát, rồi lập đề xuất trigger đúng lúc ledger ghi cleared cash; không lấy thao tác ký hoặc invoice issue làm bằng chứng tiền đã về.

Không tự thêm ducking/crossfade, adaptive music hoặc âm mới từ hướng dẫn chung. Nếu được duyệt sửa audio sau này, đo waveform/peak/RMS hoặc loudness với phương pháp/đơn vị rõ, rồi kiểm người nghe. Không đặt mục tiêu LUFS tùy ý trong setup.

## Unknown

Chưa nghe bởi người thật; chưa đo LUFS/true peak, nhận biết cue, mức lấn nhạc/SFX, fatigue hoặc loop seam. Chưa kiểm native Safari audio lifecycle. PASS media clock không đóng human audio gate và không chứng minh âm phát ra đúng thiết bị. V4, source audio và toàn bộ runtime giữ nguyên hash.
