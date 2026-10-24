---
name: ceo-game-audio
description: Design or review Software CEO music, SFX cue semantics, mix, looping and listening-fatigue acceptance; verify opt-in, independent mute and audio lifecycle against the existing browser runtime. Not permission to regenerate assets, buy samples, use external services or change simulation.
---

# Thiết kế và kiểm chứng âm thanh Software CEO

## Khi dùng và đầu vào
Dùng cho âm thanh có diễn đạt đúng hành động/kết quả, music/SFX có lấn nhau, lặp gây mệt, loop/volume hoặc opt-in/mute/hidden-tab. Không dùng cho generic camera/UI styling hay mặc định viết lại nhạc.

Đầu vào: sự kiện cần phản hồi, actor/task, build/browser, settings và clip/asset được phép kiểm. Đọc `docs/ART_PIPELINE.md` mục Audio, `public/assets/audio/manifest.json`, `src/audio/player.ts`, audio dispatch/lifecycle ở `src/app/App.tsx`, `src/ui/SettingsDialog.tsx`, `src/persistence/settings.ts`. Ràng buộc MVP và first-play budget ở `docs/GDD_v1.1_Web_Canvas.md`; human gate theo `docs/PLAYTEST_PROTOCOL.md`. Path tính từ project root.

## Phạm vi và ranh giới
Review/design outputs thuộc docs/evidence của task. Implementation, chỉ khi được giao rõ: audio player, app cue mapping, settings và tests liên quan. `scripts/build-audio.py` ghi WAV/MP3/Ogg và metadata vào art-source/public: không chạy chỉ để review hoặc thử skill. Không sửa V4, game rules, simulation RNG, time hoặc saves; không mua/download sample hoặc gửi asset lên dịch vụ ngoài khi chưa có quyền.

Nguồn hiện có là Studio Hours và năm cues click/decision/cash/release/alert. Có asset trong manifest không chứng minh đã được runtime gọi đúng chỗ: lần theo app command → kết quả → cue thực. Không gọi âm báo quyết định thành “tiền đã thu” nếu ledger chưa xác nhận.

## Quy trình
1. Lập cue sheet: hành động/trạng thái, trigger thành công/thất bại, ý nghĩa cho người chơi, file/mapping thực, thời gian/phạm vi lặp và fallback bằng hình/chữ. Ghi rõ cue chưa nối runtime; không thêm emitter hoặc âm mới trong scope setup.
2. Giữ opt-in: settings mới có music=false, sfx=false; browser unlock sau gesture. Music và SFX tắt độc lập, master volume có giới hạn. Không dùng autoplay bypass hoặc sửa permissions để test PASS. Nhạc có thể chạy ở menu khi user bật; không tự ép mute mỗi khi game pause nếu chưa có yêu cầu.
3. Đọc runtime trước mô tả: music hiện dùng volume ×0.55, cues dùng volume, throttle cues 65 ms và cache theo tên. Đây là implementation, không phải chứng cứ mix dễ nghe. Kiểm hidden-tab pause, resume theo preferences/gesture, khi tắt SFX thì dừng cue đang phát. Không cho audio quyết định simulation state.
4. Kiểm kỹ thuật với context/browser thử nghiệm cô lập: mặc định tắt, bật bằng UI, `currentTime` tiến/readyState/error, music/SFX mute độc lập, volume, reload preferences và visibility lifecycle. Có thể quan sát real Audio elements bằng instrumentation giữ nguyên native playback; không mock `play()` rồi báo có âm thật. Ghi emulated lifecycle riêng với native tab/OS evidence.
5. Đo âm lượng/loop khi task cần: waveform/peak/RMS hoặc loudness bằng công cụ sẵn có, ghi đơn vị/phương pháp; không đặt chuẩn LUFS hay tuyên bố không clipping nếu chưa đo. Playback kỹ thuật không chứng minh người thật nghe được, semantic clarity hoặc listening fatigue.
6. Human listening: dùng phiên game thật, ghi thiết bị/browser/volume, số lần cue lặp, nghe nhạc và SFX cùng nhau, ý nghĩa nhận biết, phần bị lấn, loop seam và mệt mỏi. Không ghi tên riêng người tham gia; kết quả không có người nghe vẫn NOT TESTED. Mọi đề xuất ducking/crossfade/cue mới là Proposed cho tới khi được duyệt.
7. Khi được phép thay runtime, phối hợp UI accessibility cho controls/text alternatives và QA cho tests/browser tương ứng; khi thay audio asset phải có quyền riêng trong scope, giữ nguồn/license và kiểm manifest/payload. Không chạy full performance suite cho một review chỉ đọc.

## Đầu ra và nghiệm thu
Giao cue sheet/mix review với Verified / Proposed / Unknown, source/build identity, phương pháp kiểm, trạng thái opt-in/mute/lifecycle và kế hoạch nghe thử. Đạt khi chỉ kết luận trong phạm vi evidence, thông tin quan trọng có visual equivalent và toàn bộ thay đổi thực nằm trong quyền hiện tại. Với setup-only: file game/audio/art phải giữ SHA256, không đánh dấu human audio gate PASS từ media clock.

## Ví dụ thử
- Dùng: “Có cash.mp3 nên chắc thu tiền đã có âm?” → kiểm manifest và tất cả cue callers; nếu chưa gọi, ghi asset-only và đề xuất riêng, không nối tự động.
- Dùng: “Mute SFX có dừng nhạc không, đổi tab có pause?” → kiểm player/configure và thử browser cô lập, ghi native/emulated rõ.
- Không dùng: “Tự tạo nhạc mới rồi upload dịch vụ mix” → cần scope/permission riêng; không thực hiện từ quyền setup.

Tham khảo nguyên tắc, không cài/import package: [community game-audio](https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/game-development/game-audio/SKILL.md).
