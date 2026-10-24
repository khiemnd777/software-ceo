# Đầu nữ V3 — thiết kế đã được Khiêm duyệt

## CHARACTER-COMPLETION-EH — 2026-10-22 — E sẵn sàng review, F–H đã duyệt phạm vi

Khiêm xác nhận “Duyệt E—H”. Toàn bộ E–H được duyệt triển khai LOCAL; giữ mốc review hai mẫu cơ sở trước diễn hoạt và review clip trước nhân rộng. Không cần xin lại quyền thực hiện F–H. Authorization: evidence/character-eh/authorization-eh.json; kế hoạch/trạng thái: docs/CHARACTER_COMPLETION_EH.md.

E đã có bản sao nguồn Blender chuẩn hóa và hai GLB toàn thân, giữ đúng đầu nữ V3 đã duyệt. Quần mới có lưới quad nối hông và vòng hỗ trợ gối; bỏ đường may khóa quần rời khỏi bề mặt. Model/ảnh/source V3, V2, A–C và source/shipping assets game giữ hash. GLB E là mesh subdivision để review, chưa phải LOD shipping hoặc rig. 15 ảnh render từ GLB nhập lại; bộ lỗi trước giữ riêng trong iteration01–04.

Verified: npm run verify baseline PASS51tests/9files,3QA harness,typecheck/lint/build; warning bundle514kB có trước. Binary GLB và hash15ảnh PASS;21chi tiết đầu nữ khớp tam giác bản duyệt ở dung sai1micromet. Audit nguồn PASS: hai quần toàn quad,mỗi quần một khối liên thông,ba vòng biên vải chủ đích,transform chuẩn. Chrome sandbox bật PASS14góc/mẫu +ảnh hai mẫu,download/ref khớp bytes,desktop1440×1050/mobile390×844 không tràn,zero errors/failed/external requests. 363tệp có trước giữ hash trước cập nhật hồ sơ; lượt này chỉ đổi hồ sơ quyết định. Receipt evidence/character-eh/checkpoint-e.json.

Review: http://127.0.0.1:4192/art-source/character-eh/review-e.html; server loopback chỉ22file cố định,không mở repo; trang đầu nữ V3 cũ giữ nguyên. Mốc E visual acceptance OPEN, theo plan “Dừng cho Khiêm chốt hai mẫu cơ sở trước diễn hoạt.” Bước tiếp theo: Khiêm review hai mẫu E để tiếp tục F trong quyền E–H đã có. F/G/H chưa thực hiện; chưa rig/clip/biến thể/sprite/game integration. Không chạy E2E/profile/soak game tại E,không rebuild standalone/push/upload/deploy.


Checkpoint 2026-10-22. Khiêm nhận xét tóc nữ sai và mặt nữ chưa đẹp trong V2, sau đó duyệt kế hoạch sửa riêng đầu nữ. Sau khi nhận bản V3 và trang đối chiếu, Khiêm xác nhận: **“Xác nhận thiết kế này.” V3 đầu nữ: APPROVED về thiết kế.** V2 nữ: mặt/tóc bị từ chối. Quyết định mới chỉ chốt đầu nữ V3 đã review, không tự duyệt model nam/toàn thân, rig, biến thể, game integration hoặc release. Các kiểm tra kỹ thuật dưới đây là kết quả của lượt dựng trước, không phải kiểm thử mới.

Nguồn Blender và GLB hiện tại khớp hash trong manifest của bản đã review. Ghi nhận riêng tại `evidence/character-female-head-v3/owner-approval.json`; giữ nguyên receipt kỹ thuật trước duyệt để bảo toàn lịch sử. Chỉ cập nhật hồ sơ quyết định, không sửa model, ảnh, source game hoặc trang review.

## Phạm vi và điểm dừng

Dựng lại mặt nữ, mí/mắt hạnh nhân, má/mũi/môi/cằm; tóc bob ngang cằm, mái vuốt lệch, để lộ một tai. Giữ model nam, thân nữ và trang phục. Bàn giao đầu nữ tĩnh, ba góc chính diện/3-4/nghiêng, bản màu/clay và đối chiếu mockup/V2 trong cùng trang review. Dừng tại review đầu nữ, chưa rig, thêm tóc dài/trang phục hoặc tích hợp game.

Hướng trang phục đã duyệt trước vẫn còn: nam quần dài/quần đùi; nữ chân váy dài/chân váy ngắn/quần dài; nữ tóc ngắn/tóc dài. Chân váy là phần dưới riêng, không thay bằng đầm. Đây chưa phải kết quả của lượt sửa đầu nữ.

Áp dụng hướng dẫn character-design/3d-modeling đã đọc ở lượt V2 và nguyên tắc nguồn → export → reimport. Nguồn và tình trạng skill ghi tại [CHARACTER_REDESIGN_V2.md](CHARACTER_REDESIGN_V2.md); không cài hoặc đăng ký skill mới. Blender 4.5.3 LTS ARM64 chạy từ bộ chính thức đã đối chiếu checksum/chữ ký trong thư mục tạm, không đổi cấu hình global.

## Nguồn đã lưu và tiếp tục sau gián đoạn

`art-source/character-female-head-v3/female-head-v3.blend` được lưu lúc 21:49:43 ngày 21/10, sau source authoring lúc 21:49:39. Khi tiếp tục, chỉ mở kiểm tra nguồn đã lưu; không dựng lại và không ghi lại file authoring. `saved-artifact-audit.json` đối chiếu 10.368 đỉnh mặt, 3.200 đỉnh bề mặt mắt hạnh nhân theo công thức source hiện tại; sai số lớn nhất dưới 6e-8. 105 mesh bối cảnh ngoài đầu nữ giữ hash hình học.

- Source Blender SHA256: `f3dc02a397c1e0f0749f49f2d4c250fe9a4dc52b48087a8776e36defb826e9fe`.
- `build.py` SHA256: `cf277c23f998a8263896b8e5c57871a31ea3d2f7bcbbd9058643bdfafba3eb8d`.
- GLB đầu nữ SHA256: `e01ce899621463c5bcbf7970442ffd9096a339605ec09821f41f6288fddd686a`.

Nguồn điều khiển giữ mặt/mí/môi trên bề mặt có các vòng lưới nối nhau. Tóc gồm bề mặt da đầu, phần sau bob, mái vuốt lệch và phần tóc vén tai. File GLB là bản tĩnh đã bake/giảm lưới; chưa là topology diễn hoạt. GLB có 21 mesh, 21.458 tam giác, 437.464 bytes; các số này là thông tin file, không là tiêu chí đạt mỹ thuật hoặc ngân sách shipping đã duyệt.

## Artifacts và trang review

- `scripts/character-female-head-v3/build.py`: source authoring đã hoàn tất, giữ nguyên khi tiếp tục.
- `inspect-saved.py`: mở file Blender, đối chiếu hình học/source, không save hoặc rebuild.
- `export-review.py`: xuất đầu nữ rồi nhập lại GLB, đưa đầu V2 và V3 vào cùng studio/camera để render.
- `art-source/character-female-head-v3/`: source Blender, GLB, scene reimport, manifest và `review.html`.
- `evidence/character-female-head-v3/`: log, audit, preservation, 9 ảnh cuối, receipts và browser screenshots.

Ảnh review cuối là `new-{front,three-quarter,profile}.png`, sáu ảnh màu/clay tổng cộng; ba ảnh `previous-*.png` là V2 cùng camera/ánh sáng. Render Cycles CPU 48 samples, 1000×1100. Các ảnh `*-study.png` là vòng dựng trước đó, không dùng làm ảnh cuối. Mockup được hiển thị từ nguyên bản `approved-body.png` bằng vùng nhìn SVG; file tham chiếu không bị sửa.

URL LOCAL: **http://127.0.0.1:4191/art-source/character-female-head-v3/review.html**. Đây là gallery ảnh render từ GLB nhập lại, có chuyển ba góc và màu/clay; không phải trình xem 3D thời gian thực. Nguồn Blender vẫn có thân người và model nam để đối chiếu, GLB chỉ chứa đầu nữ.

Server `serve-review.py` chỉ bind 127.0.0.1:4191, phục vụ 14 đường dẫn file cố định của lượt review này. Không phục vụ thư mục gốc repo, source game hoặc các mockup cũ. Lần mở server gốc bị auto-review từ chối vì phạm vi quá rộng; đã dùng allowlist thay thế. Không đổi quyền browser/OS hoặc tắt sandbox.

## Kiểm chứng thực tế

`validate.py` PASS: đọc binary GLB độc lập, kiểm magic/version/chunks/buffer bounds/accessors, dữ liệu hữu hạn, indices, số tam giác, normals, zero-area=0, vùng tọa độ đầu nữ. Không có rig/animation/camera/light/texture ngoài. Source Blender và script authoring khớp audit; 9 ảnh cuối khớp hash GLB/receipt. Đây là kiểm tra tùy chỉnh, không phải Khronos validator, chứng nhận collision hoặc deformation.

`browser-check.mjs` PASS Chrome sandbox bật: sáu tổ hợp góc/màu, ảnh decode 1000×1100, trạng thái nút/đối chiếu đúng góc, mockup và ba file tải xuống khớp bytes. Desktop 1440×1050 và mobile 390×844 không tràn ngang; zero page/console errors, failed requests và external requests. Sáu đường dẫn ngoài allowlist trả 404 đúng yêu cầu. Đã xem ảnh desktop/mobile, profile và clay thực tế.

727 tệp trong snapshot lúc tiếp tục giữ nguyên hash, gồm source/public/dist/tests/package/standalone, V2/A–C cùng source Blender và build.py đầu nữ đã hoàn tất. 17 khác biệt đã có giữa snapshot đầu lượt và lúc tiếp tục thuộc công việc runtime song song, được ghi trong `resume-preservation-baseline.json` và giữ nguyên; không báo chúng là thay đổi của đầu nữ hoặc khôi phục đè lên. Bốn hồ sơ checkpoint chỉ được thêm mục mới, giữ nguyên phần nội dung có trước.

Không chạy lại npm verify/E2E/balance/soak của game vì source game và assets shipping không đổi trong lượt này. Không dùng các kết quả lịch sử làm bằng chứng của V3. Không push/upload/deploy/rebuild game hoặc đóng gói standalone.

## Nhận xét mỹ thuật và giới hạn

Nhận xét tự review trước khi Khiêm duyệt: vùng rẽ ngôi còn cạnh gãy/mặt lưới; phân mảng tóc và độ mềm của khuôn mặt vẫn khác mockup. Khiêm đã xem bản V3 và xác nhận thiết kế. Giữ nhận xét này làm ghi chú kỹ thuật khi chuẩn hóa lưới; không tự thiết kế lại đầu nữ đã duyệt. Nếu tối ưu lưới làm thay đổi hình dáng nhìn thấy, cần đối chiếu lại với bản duyệt.

Gate thiết kế đầu nữ V3: APPROVED theo xác nhận trực tiếp của Khiêm. Các gate còn OPEN: toàn bộ mẫu cơ sở/toàn thân; retopology/rig/deformation; biến thể tóc/trang phục; bake sprite/lighting; appearance mapping; game integration/performance và release.

## Lệnh kiểm chứng

Sau khi đã có source Blender hoàn tất, không cần chạy lại authoring để kiểm hoặc mở review:

```sh
Blender --background --factory-startup --python scripts/character-female-head-v3/inspect-saved.py
Blender --background --factory-startup --python scripts/character-female-head-v3/export-review.py
python3 scripts/character-female-head-v3/validate.py
python3 scripts/character-female-head-v3/serve-review.py
node scripts/character-female-head-v3/browser-check.mjs
```

`Blender` là `/private/tmp/software-ceo-blender-v2/mount/Blender.app/Contents/MacOS/Blender`. Python/Node dùng runtime có sẵn; binary thực và log ghi trong evidence. `export-review.py` ghi đè các file review V3 khi chủ động tái xuất; không cần lặp sau kiểm chứng hiện tại. Receipt tổng: `evidence/character-female-head-v3/final-receipt.json`.

## Bước tiếp theo

Kế hoạch tiếp theo chỉ là đề xuất, chờ Approve triển khai riêng:

1. **E — Chuẩn hóa hai mẫu cơ sở.** Dùng đầu nữ V3 đã duyệt trên thân nữ hiện có, đối chiếu cùng mẫu nam V2; chuẩn hóa lưới để rig, xử lý đường nối/normal, giữ silhouette và tỷ lệ. Bàn giao toàn thân/cận mặt/clay và ảnh đúng camera, kích thước game. Dừng cho Khiêm chốt hai mẫu cơ sở trước diễn hoạt.
2. **F — Rig và diễn hoạt.** Dựng bộ xương/trọng số có thể chỉnh trong Blender; idle, working, walk, stand-up, alert, meeting. Kiểm cổ/vai/khuỷu/gối, tiếp xúc bàn/ghế/chân, clip xuyên vải/tóc trong cả chuyển động. Duyệt clip thật trước nhân rộng.
3. **G — Tám tổ hợp ngoại hình.** Nam: quần dài/quần đùi; nữ: ba lựa chọn chân váy dài/chân váy ngắn/quần dài × hai tóc ngắn/dài. Kiểm biến dạng tóc dài/chân váy khi ngồi/đi; dùng chân váy rời, không thay bằng đầm. Không thêm nhân viên mặc định hoặc UI thay đồ.
4. **H — Sprite, tích hợp LOCAL và QA.** Render atlas từ model thật theo camera V4; ghép ngoại hình đúng giới tính cho save mới/cũ, không suy giới tính từ tên và không thay business RNG. Giữ Canvas 2D; kiểm anchor/occlusion, save, nhiều nhân viên và hiệu năng trên build cố định. Chạy verify/E2E/asset checks và profile phù hợp trước bàn giao. Release/push/upload/deploy không thuộc phê duyệt thiết kế.

Ưu tiên đề xuất: Approve **E** để có hai mẫu toàn thân chuẩn trước. F–H chưa triển khai; mỗi phạm vi tiếp theo phải được Khiêm duyệt theo policy của repo.
