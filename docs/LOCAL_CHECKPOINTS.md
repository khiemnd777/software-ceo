# Lịch sử checkpoint LOCAL

## TIME-24H-INTEGRATION — 2026-10-26 — T0.4 / save v3, sẵn sàng review LOCAL

Owner đã duyệt D1–D8 và G0–G8. Đã tích hợp lịch 24h theo bước 15 phút; ca 09–12, 13–18 và OT 18–20; work/health theo giờ; accrual và settlement tháng; save v3/migration/backup transaction. Office thật có thời tiết, đồng hồ, công tắc, màn hình đang làm và ánh sáng cửa sổ. Giữ V4, ghế/gears, phân công thủ công tối đa 2 slot, draft và Office mounted. Không đưa model A/B hoặc seek/rewind của mockup vào game.

Verified: npm run verify PASS với 105 unit tests và 3 QA harness tests; typecheck/lint/build PASS. Production Edge E2E 46/46 PASS. Art 8 ngoại hình/1.152 khung; 301 file art/mockup/fixtures giữ SHA. Ba suite 900 + 1.200 market + 270 policy không có lỗi invariant hoặc command bị từ chối; policy đóng đủ ngày 180. Profile 12 nhân viên/mưa gió/DPR1–2 có 8 mẫu khoảng 60 FPS, p95 16,7–16,8 ms; axe 7 ngữ cảnh không báo vi phạm.

Soak 30 phút 23,8 giây/30 mẫu PASS: build SHA giữ nguyên, 0 runtime errors, 1 document, 292 listeners; heap sau warm-up 7,64–8,19 MiB. Memory control xác nhận cây panel bị inspector giữ: 1.839→632 nodes khi đổi target sang Canvas. Không coi kết quả này là chứng nhận mọi loại leak hoặc GPU.

OPEN: owner review; Outsourcing/Tough thắng 98→90/100 seed (8 thiếu khách quay lại, 2 margin<15%); human pacing 24/60/120, novice/campaign, screen reader, native Safari và native hidden-tab. Firefox/WebKit không launch được vì runtime trong thư mục tạm thiếu file. Không chỉnh tham số để xóa cờ balance.

Báo cáo: docs/TIME_24H_INTEGRATION_REPORT.md và docs/ADR-002_INTRADAY_CLOCK.md. Receipt/logs/hashes/diff/ảnh: evidence/time-24h/integration-2026-10-26/. Preview http://127.0.0.1:4194/; tab fixture 12 nhân viên, 09:00/Pause/đèn OFF. Dùng origin riêng; không đổi save ở origin cũ. Giữ mockup 4204. Không Git write/push/upload/deploy hoặc tạo ZIP mới.

Bước tiếp theo khuyến nghị: Khiêm review game LOCAL và cờ balance, chấp nhận hoặc nêu phần cần chỉnh. Thay đổi mới cần kế hoạch/Approve riêng; human playtest cần người tham gia, không thay bằng bot.

## TIME-24H-INTEGRATION-PLAN-001 — 2026-10-26 — kế hoạch, CHƯA TÍCH HỢP

Owner đã Approve toàn bộ mockup và yêu cầu lập kế hoạch tỉ mỉ trước integration; chưa cho triển khai. Đã source-review clock5giây/ngày, work/health theo ngày/tuần, monthly cost và savev2. Báo cáo: [TIME_24H_INTEGRATION_PLAN.md](TIME_24H_INTEGRATION_PLAN.md).

Proposed D1–D8: giữ lịch09–12/13–18/OT18–20;60giây/ngày mặc định với24/60/120setting; giữ7ngày làm/tuần và neoT0.3 khi quy đổi56giờ/tuần, ghiT0.4; health theo giờ hiệu chỉnh; accrual thực và chốt tháng; savev3/backup/cầu nối một kỳ cũ; hình ảnh đã duyệt, weather không tiêu RNG nghiệp vụ. Chín gateG0–G8 có ranh giới, owning files, acceptance/replay/RNG/cents/migration/3playbook/visual/performance/soak.

Verified hiện tại chỉ là source review và kiểm file bảo vệ không đổi. Không chạy verify/E2E/balance/profile của game mới vì chưa implementation. Không đổi source/game/mockup bundle/art/save/settings; không mở server mới hoặc Git/remote write. Gói D1–D8 và triển khai vẫn chờ owner duyệt. Bước tiếp theo: Khiêm đọc báo cáo, Approve gói đề xuất để bắt đầu integration LOCAL, hoặc chỉ định điểm cần chỉnh trước code.

## TIME-24H-WINDOW-LIGHT — 2026-10-26 — ánh nắng/trăng LOCAL chờ review

Owner đã review bản công tắc/màn hình và Approve riêng ánh sáng qua cửa sổ. Đã thêm windowLight.ts: vệt nắng ấm/trăng xanh bạc theo từng ô kính, có khoảng tối của thanh chia cửa; hướng/chiều dài/cường độ theo cùng cung thiên thể và weatherFrame với bầu trời. Góc thấp cho vệt dài, gần trưa ngắn; mây/mưa làm yếu ánh sáng. Công tắc không đổi nguồn sáng ngoài trời. Đây là ánh sáng 2D theo phong cách V4, chưa có mô hình thiên văn/chiếu sáng vật lý hoặc bóng đổ động của nội thất.

Floor được cache riêng, vệt sáng clip vào sàn và vẽ dưới nội thất/nhân vật/tường; vẫn theo camera khi pan/zoom. Chỉ screen-blend vùng có ánh sáng, cache căn phòng theo độ tối thực và clock15 thay vì mọi phút. Ánh sáng theo raw visualTime liên tục, Pause giữ vị trí; Giảm hiệu ứng bỏ viền mềm, không thêm chuyển động độc lập với giờ. Giữ monitor emission, clock15, model/art/save/game. Có mốc xem nhanh07:00 và12:00.

Verified: baseline20 → 23tests, build riêng30inputs, strict typecheck/lint/format PASS. Edge/CUA4bố cục1280/1920 ×UI100/150 không tràn/cắt controls; pan/zoom PASS. Pixel nắng07:00 AOFF: trời quang[221,215,200], nhiều mây[212,207,194], mưa gió[208,204,192]. Pixel trăng00:00 AOFF: quang[88,101,114], mưa gió[73,81,89]; pixel tủ che phía trước giữ[51,52,51]. Toggle đèn giữ sources/geometry. Bản cuối giữ đúng pixel trăng sau tối ưu. Console không warn/error.

Hai bản ghi6s: bình minh756khung và qua00:00 721khung, hai phòng cùng nguồn sáng; ánh sáng đổi trong lúc HUD giữ mốc15phút. Giảm hiệu ứng+Pause6s/721khung giữ rawminute/nguồn sáng/paint count. Hai smoke10s với Canvas hiển thị, bitmap1512×960/canvas, tách đọc pixel: nắng1196mẫu/mean8,36ms/p959ms/max58,4ms; hoàng hôn+mưa gió1191mẫu/mean8,40ms/p959,2ms/max25ms; không gap>100ms. Các lượt đọc pixel đồng thời chậm được giữ làm diagnostic, không dùng để kết luận hiệu năng trang review. Đây là display-rAF trên một host, không chứng nhận GPU/fullgame/thiết bị khác.

193snapshot model bằng bản trước;564file bảo vệ game/art/dist/clock/sky/switch/monitor giữSHA256. Evidence, before, logs, recordings, pixel, ảnh vàreceipt: `evidence/time-24h/window-light-2026-10-26/`. Fullgame verify/E2E/soak/balance/nativeSafariFirefox/hidden-tab mới/axe/human screen reader NOT_RUN. Owner visual acceptance OPEN. Không tích hợp game, push/upload/deploy.

Review http://127.0.0.1:4204/docs/mockups/time-24h/; tab00:00/AOFF/BON/Pause/120giây-ngày/1×. Reload09:00/cảhaiON. Bước tiếp theo khuyến nghị: Khiêm xem07:00/12:00/17:00/00:00, thử công tắc/thời tiết và phản hồi hoặc chốt hình ảnh. Tích hợp game cần kế hoạch và Approve riêng.

## TIME-24H-WORKING-MONITORS — 2026-10-26 — mockup LOCAL chờ review

Khiêm báo công tắc đè lên Project và Approve sửa vị trí, thêm màn hình sáng/code–terminal khi đang làm việc. Công tắc chuyển sang bên trái đồng hồ, plate 24×32 worldpx tại y8,75; target tối thiểu 44px mở rộng về phía tường trống, không lấn clock/Project. Focus ring theo plate. Mỗi màn hình chỉ phát sáng khi người ở bàn có working=true; nghỉ trưa/bàn trống tối, không animate. Mặt kính dùng đúng anchor/skew của desk.png; mask theo thứ tự vật thể/nhân vật/ghế và UI để giữ che khuất. Không sửa art.

Hoạt ảnh code/terminal/cursor chạy bằng nhịp UI 8fps, tiếp tục khi Pause; không làm thời gian/công việc chạy. Giảm hiệu ứng giữ frame tĩnh; guard không tích thời gian khi document.hidden. Cache mask khi phòng thay đổi và chỉ tô lại tile màn hình khi code đổi, không vẽ lại nội thất theo nhịp này. Giữ clock15, trời/thời tiết liên tục và model riêng trong RAM; chưa tích hợp game.

Verified Node24: baseline18 → 20 tests, isolated build29inputs, strict typecheck/lint/format PASS. Edge/CUA: click Project hiện thông báo đúng và không toggle đèn; Tab/Space/Enter PASS; pan/zoom và mặt kính đi cùng camera. 09:00 hai màn hình đang làm sáng khi đèn OFF; 12:00 nghỉ trưa và20:00 nghỉ đều không có tile phát sáng; 18:30 A nghỉ/tối, B tăng ca/sáng dù cả hai OFF. Bốn bố cục1280×720/1920×1080 ×UI100/150 không tràn ngang/cắt controls, target≥44px. Bản ghi Pause6s/639khung giữ09:00, pixel màn hình thay đổi qua code/terminal; sau warmup worldPass giữ4, chỉ paints tăng. Giảm hiệu ứng6s/680khung giữ tick0/pixel/paint count. Console không warn/error.

193 snapshot business giống bản trước;560file bảo vệ (game/art/dist/model/sky/clock) giữ SHA256. Smoke display-rAF10,015s ở1920/UI100,Pause,2phòng/2màn hình hoạt ảnh:598mẫu,mean16,77ms,p9525,3ms,max67,1ms,23khung>33ms,không gap>100ms. Không coi smoke này là chứng nhận60FPS/fullgame/GPU. Fullgame verify/E2E/soak/balance, nhiều nhân viên/8appearances, native hidden-tab/Safari/Firefox, axe/human screen reader NOT_RUN.

Evidence/bản trước/log/pixel/recordings/ảnh/receipt: `evidence/time-24h/working-monitors-2026-10-26/`. Review http://127.0.0.1:4204/docs/mockups/time-24h/; tab18:30, cả haiOFF,Pause,120giây/ngày,1×. Reload mặc định09:00/cả haiON. Owner visual acceptance OPEN; không push/upload/deploy. Bước tiếp theo khuyến nghị: Khiêm xem công tắc và màn hình tăng ca ở18:30, phản hồi hoặc chốt mockup. Tích hợp game cần kế hoạch/Approve riêng.

## TIME-24H-WALL-LIGHT-SWITCH — 2026-10-26 — công tắc trên tường sẵn sàng review

Khiêm đã chấp nhận clock15/bầu trời và Approve dựng công tắc nhỏ bên phải đồng hồ. Mỗi văn phòng có trạng thái đèn riêng, mặc định bật, chỉRAM. Công tắc I/O vẽ cùng mặt phẳng tường; nút HTML trong suốt theo camera, vùng bấm tối thiểu44px, hỗ trợ Tab/Enter/Space, title và aria-pressed. Ẩn target khi ngoài canvas, Căn giữa khôi phục. Nhãn Đèn văn phòng đồng bộ. Tắt: bỏ glow/filament sáng, chỉ tô tối lớp phòng theo sáng tự nhiên; clock/công tắc/overlay giữ đọc rõ. Không đổi bầu trời,clock15,model,cost/save hoặc game.

Verified: baseline16→18tests; build riêng28inputs/typecheck/lint/format PASS. Edge/CUA: click, Tab/Enter/Space; toggle khiPause không đổi time/business; hai phòng độc lập; pan/zoom vẫn click đúng, ra ngoài khung ẩn target vàFit khôi phục. Pixel sàn A: bật[238,229,213],tắt ban ngày[197,192,181],tắt ban đêm[66,73,77]; B không đổi khi chỉtoggleA; sky/exterior giữ nguyên;clockbright1226 ở00:00 giữ đọc rõ.193snapshot business bằng nhau;559file bảo vệ giữSHA256. Smoke display-rAF10giây:325mẫu,mean30,91ms,p9550,1ms,max91,6ms; hiệu năng vẫn dao động, không coi làPASS60FPS/game/GPU. Fullgame verify/E2E/FPS/soak/balance/native browsers/axe/human screen reader NOT_RUN.

Bốn bố cục1280/1920 ×UI100/150 không tràn/cắt controls, target44px; console zero warn/error. Review http://127.0.0.1:4204/docs/mockups/time-24h/;tab00:00/AOFF/BON/Pause/120giây-ngày/1×; reload mặc địnhcảhaiON09:00. Evidence: evidence/time-24h/wall-light-switch-2026-10-26/; chi tiết docs/TIME_24H_LOCAL_PROTOTYPE.md. Bản trước trongbefore;clock15/bầu trời là baseline owner chấp nhận, công tắc chờ review. Chưa tích hợp game/push/upload/deploy. Bước tiếp theo: Khiêm tải lại, thử công tắc cạnh đồng hồ ở00:00, phản hồi/chốt vị trí và độ tối.

## TIME-24H-CLOCK-15 — 2026-10-26 — đồng hồ theo bước 15 phút, chờ review

Khiêm đã review/đồng ý nền trống và bầu trời chuyển động liên tục, rồi Approve riêng chỉnh đồng hồ. Đã thêm displayClock.ts dùng RULES.stepMinutes: làm tròn xuống mốc15phút chỉ khi hiển thị. HUD, nhãn giờ, hai đồng hồ treo tường và nhãn accessible cùng09:00→09:15→09:30→09:45; tại09:07 vẫn09:00. Giữ raw visualTime cho bầu trời/thời tiết. Không đổi model, coefficients, lịch làm, art/save hoặc tích hợp game.

Verified Node24: baseline14→cuối16tests; build riêng27inputs/typecheck/lint/format PASS. Edge/CUA:3bản ghi6giây ở1×/2×/4×,571khung; HUD/nhãn/accessible cùngmốc15, pixel chữ giữ nguyên trong bước và đổi khi qua bước, thiên thể vẫn đổi vị trí trong mỗi bước. Qua23:45→00:00 đúng; Pause thủ công tại09:04 hiển thị09:00 và giữ cả clock/sky; nút+15 đưa tất cả về09:15.193snapshot business giống trước;558file bảo vệ, gồm code bầu trời/thời tiết/lighting/model/game/art/dist, giữSHA256. Console zero warning/error. Không chạy lại fullgame verify/E2E/FPS/soak/balance/native browsers/axe hoặc toàn bộ ma trận layout; giữ các giới hạn hiệu năng/human review từ checkpoint trước.

Review http://127.0.0.1:4204/docs/mockups/time-24h/;09:00/Nắng/120giây-ngày/1×/Pause. Evidence/bản trước/log/recordings/pixel signatures/ảnh: evidence/time-24h/clock-step-15-2026-10-26/; docs/TIME_24H_LOCAL_PROTOTYPE.md. Bầu trời được owner chấp nhận; thay đổi clock15 chờ review. Tích hợp game/push/upload/deploy NOT_AUTHORIZED. Bước tiếp theo: Khiêm tải lại mockup và bấmChạy để xác nhận đồng hồ nhảy15phút trong khi trời/thời tiết liên tục; phản hồi hoặc chốt.

## TIME-24H-SMOOTH-SKY — 2026-10-26 — nền trống và chuyển động liên tục, chờ review

Khiêm không chấp nhận nền sân, sau đó Approve bỏ cảnh mặt đất và làm mượt bầu trời. Đã bỏ sân/cỏ/đường/cây/nhà xa; giữ mây/nắng/trăng/sao và 5 thời tiết. Một visualTime chung cập nhật theo rAF cho hai Canvas; HUD/đồng hồ theo phút game, công việc vẫn theo timeline 15 phút. Màu trời/mây chuyển dần; thiên thể theo cung liên tục, alpha mọc/lặn, sao mờ/sáng dần. Có nút Xem bình minh 05:00 và Xem hoàng hôn 17:00. Foreground có alpha được cache riêng để không vẽ lại toàn bộ nội thất chỉ vì bầu trời đổi. Chỉ mockup; không tích hợp game hoặc đổi art/save/rules.

Verified Node24: baseline 12 → cuối 14 tests; build riêng 26 inputs/typecheck/lint/format PASS. 193 snapshot nghiệp vụ giống trước, 554 file bảo vệ giữ SHA256. Edge/CUA bản cuối: 5 bản ghi 6 giây qua bình minh, hoàng hôn, 00:00 và tốc độ 1×/2×/4×; tổng 1.794 khung, mọi khung kế tiếp có thời gian mới, hai phương án khớp bầu trời. Bố cục 1280/1920 × UI100/150 không tràn ngang/cắt controls. Lượt đo ổn định 1920×1080/UI150 sau cache: 597 mẫu/10,01s, mean16,75ms, p9518,6ms, 2 khung >33ms, không khoảng >100ms. 1280×720/UI100: 552 mẫu, mean18,12ms, p9533,2ms, max52ms, 32 khung >33ms. Mưa gió còn dao động; chỉ smoke display-rAF, không chứng nhận 60FPS/game/GPU. Các lượt trước tối ưu/cold start giữ trong evidence.

48h ở24giây/ngày/4× tự dừng đúng2880phút, kết quả như trước; Phát lại/Pause/pan/zoom/giảm hiệu ứng đạt, console zero warn/error. Review http://127.0.0.1:4204/docs/mockups/time-24h/; tab05:00/Nắng/120giây-ngày/1×/Pause. Evidence/bản trước/ảnh/log/hash/replay/recordings: evidence/time-24h/smooth-sky-2026-10-25/ (bắt đầu 25-10, hoàn thành 26-10); giải thích trong docs/TIME_24H_LOCAL_PROTOTYPE.md. Owner visual acceptance OPEN. Fullgame verify/E2E/FPS/soak/balance/native Safari/Firefox/axe/human playtest/native hidden-tab mới NOT_RUN. Không push/upload/deploy. Bước tiếp theo: Khiêm chọn Xem bình minh hoặc Xem hoàng hôn rồi Chạy để phản hồi/chốt mockup; tích hợp cần kế hoạch và Approve riêng.

## OFFICE-GEARS-CHAIR-V2 — 2026-10-25 — đã sửa LOCAL, chờ nghiệm thu trực quan

Khiêm Approve hai mục. Working có hai bánh răng to–nhỏ8/6răng quay ngược, chu kỳ4/3giây; nhịpUI30fps riêng tiếp tục khi Pause, static khi giảm chuyển động và ngừng khi document hidden. Cache nền nhỏ theo ID/DPR khôi phục viền trước mỗi frame, không vẽ lại văn phòng theo nhịp UI; tile tái sử dụng/thu hồi theo lifecycle. Mask mép mặt ghế sửa phần chân bên xa còn đè lên ghế, giữ chân gần ở phía trước; không đổi tâm/atlas. Source: Office.tsx/officeOverlay.ts; tests mở rộng office-display.spec.ts; profile-browser.mjs tách world pass/badge blit. Giữ game rules/save/T0.3/V4/G–H; prototype24h thay đổi song song ngoài task được giữ nguyên và ghi riêng trong preservation.

Verified Node24: baseline/cuối66tests/13files+3QA harness/typecheck/lint/build PASS. Edge156 sandbox: lượt đầy đủ40PASS/2timeout trùng hai đợtSleep901giây; rerun hai ca cùng build/timeout/assertions2/2PASS(12,7s). Tổng42ca được xác nhận đạt; không coi đây là một lượt42/42 liên tục.12pixel lưng/36pixel mép ghế/12pixel chân gần trên đủ8ngoại hình đạt;96mẫu tư thế và16cấu hình/32trạng thái bật–tắt điểm tương tác có trong bộ E2E. Working quay khi Pause không thêm world pass/đổi pixel ngoài badge; giảm chuyển động và hidden/resume emulated đạt.20khung QA,5cặp pha lặp khớp pixel tuyệt đối. Profile riêng12người4×10giây: rAF60,04–60,10Hz,p9516,7ms;7context axe zero selected-rule violations,zero browser errors/external requests.274file public/art-source và44distfiles giữ hash; art480+1.152frames PASS. Warning JS>500kB có trước:618,28→620,10kB.

Chi tiết docs/OFFICE_GEARS_CHAIR_V2.md; evidence/office-gears-chair-v2/receipt.json,working-gears.gif,chair-before-after.png và logs/traces giữ nguyên. Game cùng origin http://localhost:4183/; preview kiểm127.0.0.1:4186. Không đọc/ghi slot chơi cá nhân. Owner visual acceptance OPEN; nativeSafari/human screenreader/novice/campaign/soak/balance mới/native hidden-tab NOT_RUN. Không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm lưu tiến trình rồi review Working khi Pause và vùng chân trái/ghế, chốt nghiệm thu hoặc chỉ tư thế còn lỗi.

## OFFICE-DISPLAY-FIX — 2026-10-24 — đã sửa LOCAL, chờ nghiệm thu hình ảnh

Khiêm Approve kế hoạch bốn mục. Nhãn Canvas vẽ sau đồ vật trong tọa độ màn hình, giữ chữ13px/huy hiệu24px qua zoom/fit; nhãn HTML giữ theo UI scale, tránh chồng/cắt, hiện tên đầy đủ/trạng thái và không lặp tên Canvas khi bật điểm tương tác. Bánh răng/nghỉ/cảnh báo thay chấm trạng thái; cảnh báo giải thích cả tinh thần/năng lượng thấp. Sofa dịch xa bàn. Lưng/tay ghế phía camera dùng mask từ sprite gốc để che nhân viên đúng depth; không đổi tâm nhân vật, art V4/G–H, simulation/T0.3 hoặc save/schema.

Verified Node24: baseline64tests/12files → cuối66tests/13files +3QA harness/typecheck/lint/build PASS. Edge156.0.4314.42 production40/40E2E,0skipped/flaky/unexpected.16cấu hình ×bật/tắt điểm tương tác=32trạng thái; hai tiers/VI–EN/UI100–150/1280–1920/DPR2 và zoom/fit đạt.12pixel lưng ghế khớp nguồn;96mẫu tư thế tám ngoại hình đã xem.5trạng thái camera fit/min/max/pan/restore tạiUI150 không chồng/cắt. Art480+1.152frames PASS;274tệp public/art-source giữSHA256. Profile riêng12người4×10giây: rAF60,07–60,11Hz,p9516,7–16,8ms;7context axe zero selected-rule violations;zero browser errors/external requests.44distfiles giữ hash qua E2E/profile;ảnh browser lịch sử được phục hồi bytes. Warning JS>500kB có trước:614,05→618,28kB.

Chi tiết: docs/OFFICE_DISPLAY_FIX.md; receipt/ảnh/log: evidence/office-display-fix/. Game cùng origin http://localhost:4183/; preview kiểm chứng127.0.0.1:4186. Không thao tác slot chơi cá nhân. Owner visual/usability acceptance OPEN; nativeSafari/human screenreader/novice/campaign/soak/balance mới NOT_RUN; native tab visibility chưa xác nhận. Không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm lưu tiến trình rồi review cùng origin LOCAL, chốt nhãn/huy hiệu/sofa/lưng ghế hoặc phản hồi vị trí cần chỉnh.

## SIMULATE-RUNTIME — 2026-10-24 — đã tích hợp game LOCAL

Khiêm “Duyệt kế hoạch tích hợp, triển khai LOCAL, và bàn giao bản game chạy thật trên LOCAL.” Đã đưa Simulate thống nhất và Hồ sơ dự án vào React/game thật. Văn phòng luôn mounted; chọn người/địa điểm/HUD/tìm kiếm mở quản lý trong cùng không gian. Hồ sơ tách Dev/QA, hàng nhân sự gọn/editor từng người, preview trước→sau, Hợp đồng/Chi tiết và Hoạt động; footer Apply ngoài cuộn. Giữ phân công thủ công, tối đa2việc, 15% giảm tập trung, draft/batch/CAS, save/audio/tutorial/VI–EN. Không đổi rules, kinh tế T0.3, V4/G–H hoặc schema; không thêm lịch/nhân sự lịch sử giả.

Verified Node24: baseline58tests/11files → cuối64tests/12files +3QA harness/typecheck/lint/build PASS. Edge production30/30 E2E,0skipped/flaky/unexpected; dev localhost4183 đạt3/3. VI/EN,1280×720/1920×1080,UI100/150; commands/save/import/conflict/outcome và keyboard/layout đạt. Art480+1.152frames PASS;81tệp baseline bảo vệ và234art-source giữ hash. Profile12người độc lập4×10giây: rAF60.02–60.10Hz,p9516.7–16.8ms;7context axe zero selected-rule violations;44dist+fixture giữ hash trước/sau. Giữ failures/diagnostics; receipt evidence/simulate-runtime/receipt.json; chi tiết docs/SIMULATE_RUNTIME.md.

**Game đang chạy:** http://localhost:4183/; production preview kiểm chứng http://127.0.0.1:4186/. Dùng đúng browser/hostname/port của save cũ; E2E dùng context riêng, không động slot cá nhân. Tab game LOCAL đã mở để bàn giao. Owner runtime usability acceptance OPEN; native Safari/Firefox/WebKit/human screen reader/new balance/soak NOT_RUN. Warning JS611.64kB còn. Standalone/ZIP giữ bản cũ; không push/upload/deploy. Bước tiếp theo khuyến nghị: Khiêm mở Edge localhost4183, Tiếp tục save cũ và review giao việc/nhân sự trong Simulate. Các checkpoint mockup bên dưới là lịch sử; trạng thái chưa cho tích hợp trong đó đã được quyết định lần này thay thế.

## SIMULATE-PROJECT-DOSSIER — 2026-10-24 — sẵn sàng owner review

Khiêm “Duyệt.” kế hoạch thiết kế lại riêng hộp Dự án đang chọn trong mockup. Đã thay bằng Hồ sơ dự án: một tên/khách/trạng thái/hạn giao, tiến độ phát triển và QA riêng, nhân sự hàng gọn/editor từng người, preview trước→sau, Hợp đồng và Hoạt động trong cùng hộp. Footer Apply có vùng riêng ngoài cuộn. Giữ giới hạn2việc, chống trùng, draft/batch/CAS và việc khác qua helpers/commands hiện có. Đã tham gia ghi rõ chưa có dữ liệu lịch sử; không thêm lịch nhân sự, schema hoặc tự giao việc.

Verified: build riêng/typecheck/lint/Prettier và10tests core/model/view PASS;188tệp bảo vệ giữ hash. Browser ghi18mục tương tác và20mẫu layout ở CSS1278×721/1921×1078,UI100/150: không tràn, footer không che nội dung, Apply dùng được. Product/Startup/MVP/thử nghiệm smoke đạt; zero warning/error cuối. Giới hạn2dự án khách hàng được core giữ; assertion ký dự án thứ ba đã sửa theo luật, giữ diagnostic. Chi tiết docs/SIMULATE_PROJECT_DOSSIER_MOCKUP.md; receipt evidence/simulate-project-dossier/receipt.json.

Review LOCAL cùng URL http://127.0.0.1:4202/docs/mockups/simulate-unified/; tải lại tab mockup để nhận hộp mới. Giữ source game, renderer/art V4/G–H, T0.3, save và build hiện có; chưa tích hợp game. Owner usability acceptance OPEN. Full game verify/E2E/balance/soak/FPS/native Safari/screen reader NOT_RUN; không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm thử Chỉnh/Thêm nhân sự/preview/Apply và Hợp đồng/Hoạt động, phản hồi hoặc chốt; tích hợp cần kế hoạch/Approve riêng.

## SIMULATE-UNIFIED-MOCKUP — 2026-10-23 — sẵn sàng owner review

Khiêm xác nhận “Deal” cho hướng một Simulate bao gồm mọi chức năng, giữ cơ chế hiện tại và chỉ dựng mockup. Bản mới tại docs/mockups/simulate-unified/: nhân viên/dự án/địa điểm mở thao tác theo đối tượng trong cùng Canvas; không có mode hoặc màn hình Work/People. Giữ phân công thủ công, draft/batch và điều kiện hiện hành; dùng read-only UI/core trên ba fixture RAM. Snapshot mẫu chỉ ở bộ nhớ, reload đặt lại; không import bootstrap/store/persistence hoặc đọc save game. Bản ba trạng thái trước giữ làm lịch sử, đã được thay hướng bởi clarification của owner.

Verified: build/typecheck/lint/Prettier riêng và5test model/core PASS;183tệp bảo vệ giữ SHA256. In-app browser ghi15mục tương tác,6địa điểm,8mẫu nhân viên/phân công ởUI100/150; không tràn ngang. Sau khi ảnh chỉ ra footer sticky che hàng ởUI150, đã sửa trong mockup và kiểm lại4bố cục: ô giao việc lộ qua hit test DOM, cuộn/Apply thành công. CSS viewport thực khoảng1278×721/1921×1078 do zoom33% có sẵn, không đổi zoom. Zero warning/error ở lượt cuối. Receipt: evidence/simulate-unified-mockup/receipt.json; chi tiết docs/SIMULATE_UNIFIED_MOCKUP.md.

Review LOCAL: http://127.0.0.1:4202/docs/mockups/simulate-unified/. Owner usability/visual acceptance OPEN; tích hợp game NOT_AUTHORIZED. Source game, V4/G–H, T0.3 và build hiện có giữ nguyên. Không chạy full game verify/E2E/balance/soak/FPS/native Safari/screen reader/human playtest mới; không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm thử đối tượng trong Simulate, phản hồi/chốt thiết kế; tích hợp cần kế hoạch/Approve riêng.

## SIMULATE-WORK-PEOPLE-MOCKUP — 2026-10-22 — sẵn sàng owner review

Khiêm Approve dựng ba trạng thái Simulate / Simulate + Work / Simulate + People; giữ cơ chế hiện tại, chưa tích hợp game. Đã tạo mockup độc lập tại docs/mockups/simulate-work-people/, dùng read-only imports của Office/WorkPanel/PeoplePanel và transition hiện có trên fixture tổng hợp trong bộ nhớ. Văn phòng giữ mounted; Work/People mở bảng bên phải, chỉnh rộng42–60%, chi tiết/confirmation nằm trong vùng bảng. Không thêm tự giao việc hoặc đổi balance. Reload đặt lại fixture, không import bootstrap/store/persistence của game.

Verified: build riêng/typecheck/lint/Prettier PASS; Edge 155.0.4283.62 với Chromium sandbox bật đạt12 nhóm tương tác,12 tổ hợp ba trạng thái ×1280×720/1920×1080 ×UI100/150 và4 ảnh editor. Đã kiểm draft/batch/giới hạn2việc/chốngtrùng/khóa chưa ký/focus/Escape/Canvas selection/zoom/clock/reload/range. Zero browser errors/failed/external requests; không gọi browser storage trong lượt đo.176tệp source/public/tests/package/standalone/mockup cũ giữ SHA256. Receipt: evidence/simulate-work-people-mockup/browser-2026-10-22T03-50-30.714Z/receipt.json.

Review LOCAL: http://127.0.0.1:4201/docs/mockups/simulate-work-people/. Chỉ tiếng Việt và dữ liệu tổng hợp; owner usability/layout acceptance OPEN. Không kiểm lại full game verify/E2E/balance/soak/native Safari vì source/gamebuild không đổi; không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm thử ba trạng thái, phản hồi/chốt diện tích văn phòng và bảng; tích hợp game cần kế hoạch/Approve riêng.

## CHARACTER-GH-APPROVED — 2026-10-22 — owner xác nhận bộ nhân vật

Khiêm chốt “Chốt G–H, xác nhận bộ nhân vật này.” Ghi nhận G–H APPROVED, đủ8mẫu/nguồn Blender/GLB/clip/sprite và tích hợp LOCAL đã giao. Quyết định/hashes: evidence/character-gh/owner-approval-gh.json. Bộ này là baseline nhân vật hiện hành; camera/nội thất V4 vẫn giữ.

Lượt này chỉ đối chiếu hash và cập nhật hồ sơ;1.517artifacts của checkpoint trước cùng44distfiles khớp trước sửa tài liệu. Giữ nguyên model, ảnh, clip, atlas, source/tests/gamebuild và technical checkpoint cũ. Không chạy lại verify/E2E/profile hoặc coi duyệt này là native Safari/human playtest mới. Receipt xác nhận: evidence/character-gh/approval-receipt.json. Không rebuild standalone/ZIP hoặc push/upload/deploy.

Bước tiếp theo: giữ G–H làm baseline cho các lượt phát triển sau; thay đổi mới cần kế hoạch/Approve riêng. Các mục dưới là lịch sử trước duyệt G–H.

## CHARACTER-COMPLETION-GH — 2026-10-22 — F APPROVED, G/H LOCAL kỹ thuật PASS

Khiêm chốt F: “Chốt, tiếp tục G–H.” Đã làm đủ8tổ hợp nam/nữ/trang phục/tóc từ rig F,giữ nguồn E/F/V3;32ảnh GLB nhập lại,1.152sprite thật/8atlas,9tracks/16frames/8fps, bỏ root motion trước Canvas. Catalog appearance explicit và optional save metadata, legacy read-only fallback/roundtrip giữ; regression so state/RNG trên6fixture trước sửa khớp. Nội thất/camera/balance và art cũ giữ hash.

Verified:58tests/11files +3QA harness/typecheck/lint/build;30/30E2E/0skipped/flaky/unexpected trên44distfiles cố định;8GLB và1.152+480frame pixels đạt. Canvas vẽ8atlas thực, save/pause/reduced motion/hit test/two desktop layouts đạt. Gallery32views/72sprite tracks,desktop/mobile/download/focus đạt. Profile riêng4×10giây1280×720/1920×1080 trên Chrome156/M3Pro đạt rAF~60/s,p95 16,7–16,8ms,pan/post-GC; không phải60pose/s hoặc soak. Receipt evidence/character-gh/checkpoint-gh.json; docs/CHARACTER_COMPLETION_GH.md.

Review gallery4195/game4194, **owner art/runtime acceptance G–H OPEN**. JS588,55kB còn warning; atlas mới36MiB decoded khi đủ8. Oldroleatlases giữ lịch sử nhưng không được renderer tải. Không có native Safari/soak/standalone mới hoặc push/upload/deploy. Bước tiếp theo: Khiêm review/chốt kết quả hoặc nêu mẫu/góc/chuyển động cần sửa.

## CHARACTER-RIG-F — 2026-10-22 — E APPROVED, F sẵn sàng review chuyển động

Khiêm chốt hai mẫu E và yêu cầu tiếp tục F. Đã dựng hai rig chỉnh được và hai GLB sáu clip; nguồn E/V3 cùng source/shipping art game giữ nguyên. Audit nguồn đã lưu, binary GLB/weights/bind pose/vertex motion, head preservation, nhịp gait và sampled contact PASS. 422ảnh GLB nhập lại khớp hash; Chrome sandbox bật PASS24tổ hợp mẫu/clip/góc, playback/scrub/modal/download và desktop/mobile; zero errors/failed/external requests. 369tệp có trước đối chiếu,363giữ hash,6hồ sơ checkpoint có cập nhật ghi rõ before/after.

Receipt: evidence/character-f/checkpoint-f.json; chi tiết docs/CHARACTER_RIG_F.md. Review http://127.0.0.1:4193/art-source/character-f/review.html, chỉ428file loopback. Owner motion acceptance OPEN; G/H đã duyệt phạm vi nhưng chờ clip F được chốt. Chưa rig ngón tay/khuôn mặt, cloth/hair physics, shipping LOD, sprite/game integration hoặc game performance proof. Không chạy verify/E2E/profile game mới, rebuild standalone, push/upload/deploy. Bước tiếp theo: Khiêm review clip F để tiếp tục G–H.

## WORK-UNIFIED-RUNTIME-013 — 2026-10-21 — tích hợp LOCAL đã kiểm chứng

Owner chốt mockup và Approve kế hoạch tích hợp Công việc → Phân công. Đã triển khai bằng React, dữ liệu/commands thật: bảng tổng quan gọn, Chi tiết theo dự án giữ các hành động hợp đồng/Product/Startup, editor vùng rộng, cùng entry từ Nhân sự/Market. Bản nháp/query/filter/sort/scroll thuộc UI session của App, giữ khi chuyển màn hình/dự án; tải save hoặc tạo game mới khởi tạo lại. Bản nháp không lưu qua reload, save schema không đổi.

Thêm assignBatch ở simulation: kiểm toàn nhóm trước khi ghi, CAS snapshot theo assignment từng người, retry safe, giữ slot còn lại, tối đa2 việc, không trùng và target/task hợp lệ. Tick không làm hết hiệu lực bản nháp. Giữ assign/unassign cũ, T0.3, V4 và công thức năng suất. Source chính: src/ui/WorkWorkspace.tsx, workSession.ts, Panels.tsx, App.tsx, simulation/commands.ts và types.ts; xem docs/WORK_UNIFIED_RUNTIME.md.

Verified Node24: npm run verify trước PASS46 tests/8files, sau PASS51tests/9files; 3QA harness/typecheck/lint/build. Edge full30/30 E2E, zero skipped/flaky/unexpected, 135,58giây trên fixed production dist35files. Dev4183 đạt3/3 regression bằng context riêng. VI/EN, UI100/150,1280×720/1920×1080; ma trận24 tổng quan và8 editor, bảng6work hợp lệ, ít nhất5 hàng trọn ở1280×720/UI100; vòng Tab/Shift+Tab/Escape/focus return đạt. Gameplay delivery→invoice→cash, Product/Startup/MVP/funding, save/import/reload/conflict/outcomes đạt trong full suite. Không hạ assertion/quality gates.

179 tệp public/art-source giữ hash; 237 tệp baseline giữ nguyên,14 tệp source/tests hiện có đổi đúng phạm vi. Package/lock/Vite config/standalone giữ hash; hai mockup và bản ghép giữ nguyên. 248 tệp evidence root lịch sử được phục hồi bytes; kết quả mới tách full-suite-artifacts/ và browser/ trong evidence/work-unified-runtime/. Các lượt lỗi/setup/fixture/layout/focus được giữ riêng. Receipt cuối: evidence/work-unified-runtime/receipt.json.

Game dev: http://localhost:4183/; dùng đúng hostname đang chơi vì localhost và127.0.0.1 không dùng chung storage. Owner runtime visual acceptance, native Safari/human screen reader còn OPEN. Không đo FPS/soak/balance mới; warning JS khoảng514kB còn. Không rebuild standalone/ZIP, push/upload/deploy. Bước tiếp theo: Khiêm review Công việc → Phân công trong game; lưu campaign vào slot trước khi chủ động reload tab cũ nếu cần.

## UI-WORK-OVERVIEW-MOCKUP-011 — 2026-10-21 — chờ owner review

Owner yêu cầu xem mockup trước khi sửa màn hình Công việc. Đã dựng docs/mockups/work-overview/: bảng toàn chiều ngang, hàng56px, Dev/QA/team/hạn giao hiện cùng lúc; chọn hàng mở ngăn chi tiết ba phần; search/filter/sort;3/6/rỗng, VI/EN, UI100/150. URL LOCAL: http://127.0.0.1:4191/docs/mockups/work-overview/index.html. Chỉ dữ liệu mẫu và thao tác xem; không thực thi commands hoặc đọc save.

Verified Edge:24 tổ hợp layout,9 nhóm tương tác, zero console/page errors. Ít nhất5 hàng tại1280×720/UI100 kể cả thanh review; ngăn chi tiết không tràn, Tab/Shift+Tab/Escape/focus return đạt. Node syntax/Prettier đạt.259 tệp game/art/build/mockup cũ/package/standalone giữ hash. Lỗi4 hàng/favicon đầu giữ nguyên trong evidence/ui-work-overview-mockup/; receipt.json ghi kết quả cuối. Tài liệu: docs/WORK_OVERVIEW_MOCKUP.md.

Trạng thái PROPOSED, chưa tích hợp game. Không chạy lại verify/E2E/balance/soak/profile của game hoặc rebuild/push/deploy. Bước tiếp theo: Khiêm review mockup; chỉ tích hợp sau khi chốt bố cục và Approve kế hoạch runtime riêng.


## UI-BUTTON-SPACING-010 — 2026-10-21 — sửa khoảng cách nút

Owner Approve rà và sửa sáu màn hình quản lý và các dialog. Đã tái hiện bằng browser: hành động giao hàng có rủi ro chạm nhóm nghiệm thu, Phân công hỗ trợ chạm Khảo sát khách hàng; text-button không có padding ngang. Sửa tại src/ui/Panels.tsx, BusinessPanels.tsx, style.css và src/app/App.tsx: dùng button-row/gap8px có flex-wrap cho giao hàng, hỗ trợ/khảo sát và hai overlay kết quả; text-button padding ngang12px. Giữ commands, confirmation, điều kiện khóa và copy.

Verified: npm run verify trước/sau PASS (46 unit tests/8 files, 3 QA harness, typecheck/lint/build); final typecheck/lint và scoped Prettier PASS. Edge155.0.4283.62 full27/27 E2E, zero skipped/flaky/unexpected, 125,23 giây trên production build cố định. Regression mới đo600 mẫu: 144 mẫu sáu màn hình qua ba mô hình kinh doanh, EN/VI, UI100/150, 1280×720/1920×1080; thêm320 lựa chọn inspector và136 mẫu dialog/overlay. Không chạm viền/tràn ngang trong các mẫu đã đo; nhóm action gap tối thiểu8px, controls gọn khác4px, dung sai0,5px. Kiểm confirmation/Escape/focus và save/overwrite; fixtures tổng hợp chỉ chứng minh UI.

Dev localhost:4183 cũng đạt4/4 spacing regressions trên context Edge cô lập, zero skipped/flaky/unexpected. 35 dist files giữ hash xuyên full E2E. 221 protected existing files giữ nguyên, chỉ bốn UI source files thay đổi; V4/T0.3/simulation/gameplay/store/renderer/audio/persistence và tests cũ giữ bytes. Đã giữ lỗi baseline và lỗi setup test đầu, không hạ assertion; bằng chứng lịch sử root được phục hồi, captures hiện tại tách trong full-suite-artifacts/. Chi tiết: docs/MANAGEMENT_UI_RUNTIME.md; regression tests/e2e/button-spacing.spec.ts; runner spacing.playwright.config.ts; receipt/ảnh/log tại evidence/ui-button-spacing/.

Owner visual acceptance và native Safari còn OPEN; chưa đo performance mới, warning bundle JS khoảng500kB còn. Không rebuild standalone/ZIP, balance/soak/profile, push/upload/deploy. Bước tiếp theo: Khiêm lưu campaign vào slot rồi review nút trong game4183 bằng đúng hostname đang chơi; tải lại nếu tab còn giao diện cũ. Đóng gói là task riêng cần kế hoạch/Approve.

## UI-RUNTIME-INTEGRATION-009 — 2026-10-21

Owner duyệt tích hợp sáu màn hình vào React/game thật. DecisionBoard/NextMove và các panel dùng state/commands thực; giữ T0.3, V4, save schema, VI/EN. Npm verify trước/sau PASS 46 unit tests/8 files + 3 harness/typecheck/lint/build; Edge155 full23/23 E2E trên fixed production build; 48 tổ hợp quản lý và 8 tổ hợp roster, sampled axe, keyboard/focus và save/commands. Dev4183 smoke/ảnh sáu màn hình đạt, context cô lập. Source/art/mockup/evidence cũ đối chiếu hash; xem evidence/ui-runtime-integration/receipt.json. Giữ diagnostic failures, không hạ assertion/invariants. Bản sửa cuối bỏ width/padding/max-width kế thừa của sidebar/roster cũ. Human/native acceptance còn OPEN; warning JS khoảng500kB, không đo performance mới. Không standalone/ZIP/push/upload/deploy. Chi tiết: docs/MANAGEMENT_UI_RUNTIME.md. Bước tiếp: owner review game đang chơi bằng đúng hostname4183.


## DEV-ENTRY-SCAN-008 — 2026-10-21

Sửa vite.config.ts: optimizeDeps.entries chỉ index.html. Verify trước/sau PASS 46 tests + 3 harness/typecheck/lint/build; cold scan lỗi được tái hiện trước sửa và hết sau sửa; menu runtime 4183 PASS trên Edge. Evidence/receipt: evidence/vite-entry-scan/. 224 protected files giữ hash, final dist khớp baseline build. Không sửa evidence/mockup cũ, save, standalone hoặc thực hiện remote actions.

## UI-MANAGEMENT-MOCKUP-007 — 2026-10-21

Bộ sáu màn hình prototype LOCAL, owner đã Approve dựng mockup. Chi tiết: docs/MANAGEMENT_UI_MOCKUP.md; artifacts docs/mockups/management/, docs/mockups/shared/ và navigation Work; evidence/ui-management-mockup/. Edge 88 tổ hợp layout/16 nhóm flows, game runtime chưa tích hợp; không đổi core/art/save/build hoặc tạo ZIP/phát hành.

## UI-WORK-MOCKUP-006 — 2026-10-21

Checkpoint thiết kế độc lập: docs/WORK_UI_MOCKUP.md; mockup tại docs/mockups/work/index.html; bằng chứng Edge/layout/flows/ảnh và manifest tại evidence/ui-work-mockup/. Owner Approved dựng mockup, thiết kế và tích hợp game còn chờ duyệt. Không chạy hoặc thay build/game/art/save, không tạo ZIP hay phát hành.

Hồ sơ trước khi chuyển là bằng chứng lịch sử; mọi kết quả macOS bên dưới đã thực chạy.

## Checkpoint LOCAL macOS — 2026-10-21, CP1

- Đã đọc bốn hồ sơ tiếp tục, GDD v1.1, execution mandate, art approval và source/tests liên quan.
- Đây là thư mục giải nén, không có `.git` ở root hoặc thư mục cha; không tạo remote/commit/push/deploy.
- `npm ci` theo lockfile hoàn tất; dùng Node 24.19.0 có sẵn vì Node mặc định 23.11 ngoài engine range của Vitest và một dependency ESLint. Không nâng dependency.
- Trước khi sửa source/scripts: `npm run verify` PASS: typecheck, lint, **43 tests/7 files**, production build. Bằng chứng: `evidence/local-prechange-verify.log`.
- Hồ sơ cũ ghi 51 tests/8 files; bản chuyển sang chỉ chứa 43 tests/7 files. Không coi số cũ là kết quả đã chạy trên máy này. Chưa xác định file/test lịch sử bị thiếu.
- Đã lưu SHA256 của 186 source/art files tại `evidence/local-baseline-manifest.json` để đối chiếu V4.
- Chrome/Edge/Firefox/Safari được cài trên host. E2E Chrome đang chạy; chưa kết luận PASS trước khi có kết quả.
- Tiếp tục: portable browser harness, soak 30 phút trên build cố định, production E2E, profile độc lập, matched-seed và Creative/Education. Human playtests vẫn chưa thực hiện.

## Checkpoint LOCAL CP2 — 2026-10-21

- Pre-fix production E2E: actual Chrome 13/13, actual Edge 13/13, Playwright Firefox 13/13. WebKit 13/14: keyboard test used Tab but macOS WebKit default requires Option-Tab; diagnosis confirms BUTTON focus with Option-Tab, same assertion retained. Final 14-case matrix is running.
- Native Safari WebDriver is blocked by disabled Allow remote automation; no security setting was changed. Limited native UI smoke is underway separately.
- 1200 Creative/Education Product/Startup campaigns completed: 1200 wins/survivors, no rejected commands or invariant failures. 270 matched policy runs completed; fixed team, quote, scope response and cadence; no balance parameter changes. See evidence/local-balance-markets.json and local-policy-matched.json.
- Root cause of Chrome console 404: implicit favicon.ico. Added explicit empty local data icon; V4 files unchanged. Added a bootstrap resource regression case.
- Earlier soak attempt retained in local-soak-before-favicon.*; it is not PASS. Full soak restarted only after verify/build PASS; source/build now frozen.
- Browser scripts now select native channels on macOS. Soak validates 30+ real minutes, sample completeness and whole-dist hash before/after; three harness regression tests PASS.

## CP3 — 2026-10-21

Chuyển bốn hồ sơ sang trạng thái macOS hiện hành; giữ CP1/CP2 tại đây. Full final 30-minute soak đang chạy; profile độc lập còn chờ. Chrome/Edge/WebKit final 14/14; Firefox final đang chạy. Clean build, standalone, CSP, audit, content/art PASS. Native Safari UI smoke hẹp; chưa xác minh Canvas, không coi WebKit thay native. V4 và các luật T0.3 giữ nguyên.

## CP4 — 2026-10-21

- Hoàn thành matrix final: Chrome 156/Edge 155/Playwright Firefox/WebKit, mỗi target 14/14, zero skipped/flaky/unexpected; kiểm pixel Canvas thật.
- Native Safari: Canvas visible tab và rAF/pixel probe PASS; không sửa renderer hoặc bật WebDriver. Smoke create/day7/save/reload/Continue, vẫn thiếu full native matrix và participant tests.
- Thêm Node 24 .nvmrc, engine range khớp dependency; package versions không đổi.
- Art validator read-only kiểm đủ 480 frames/60 GLB, zero đổi hash public/art-source.
- Lưu source diff/inventory đối chiếu ZIP gốc vì bản chuyển không có Git.
- Soak đang chạy, độc lập FPS profile còn chờ; không đánh dấu full W5 complete.

## CP5 — soak hoàn tất, 2026-10-21

Chrome 156 macOS: 30 phút 13 giây thực, 30 samples, zero console/page/HTTP errors; full-dist hash 31409388a652d40af262816e76470c46eae458d7980aa3fea99e02edf7132b32 ở đầu/cuối. Fixture hash cũng không đổi. DOM 289/listeners 228 sau warm-up; final post-GC heap 6,401,200 bytes. Số heap này không là chứng nhận mọi host không leak. Profile FPS độc lập đang thực hiện sau khi soak process đã exit 0.

## CP6 — đóng technical checkpoint LOCAL, 2026-10-21

- Profile riêng sau khi soak exit: Chrome 156/macOS, 12 staff, 1280/1920, bốn 10-second samples sau 4-second warm-up: 60.048–60.095 Hz, zero >33ms; actual paints 81/281/80/80. Audio actual playing/mute PASS, 14 axe states zero selected-rule violations. First-play encoded resources 1,254,153 bytes.
- Final verify PASS: 46 tests/8 files + 3 harness tests, typecheck/lint/build; rebuilt dist 35 files byte-identical với soak/profile hash.
- V4/public 153 file hashes không đổi. 900 Retail +1200 non-Retail campaigns và 270 matched policy runs; không chỉnh T0.3.
- Native Safari smoke có Canvas và native file import thật. Full native suite, quyền automation/download, large-fixture chooser và human acceptance vẫn mở. Không đổi browser security settings.
- Bốn hồ sơ hiện hành đã hợp nhất trạng thái cuối, không dùng kết quả lịch sử làm PASS mới. ZIP LOCAL ở ../checkpoints/Software_CEO_LOCAL_W5_2026-10-21.zip, CRC/SHA256 receipt cạnh ZIP; không push/upload/deploy.

## AGENT-SETUP-001 — bộ skills LOCAL, 2026-10-21

- Theo phê duyệt owner, tạo root AGENTS.md và sáu skills `ceo-simulation-economy`, `ceo-balance-playtest`, `ceo-canvas-v4`, `ceo-ui-accessibility`, `ceo-save-recovery`, `ceo-local-qa-handoff`, mỗi skill có agents/openai.yaml.
- Verify trước sửa PASS 46 tests/8 files + 3 harness, typecheck/lint/build. Validator 6/6 valid, metadata/ref checks PASS (41 paths tồn tại).
- Codex app-server cục bộ (temporary CODEX_HOME, không thread/model) `skills/list` nhận 6 repo enabled, zero errors. Chưa kiểm desktop picker/automatic model selection. Manual self-review 14 tình huống read-only theo source; không gọi independent review.
- So protected SHA256 275 files, trong đó public/art-source 153 và dist 35 không đổi. T0.3/V4 giữ nguyên. Không rerun browser/soak cho docs-only setup.
- PyYAML 6.0.3 chỉ cài ở /private/tmp cho validator; không sửa global hoặc project dependencies. .agents write và temporary dependency download dùng sandbox escalation theo scope đã duyệt.
- Bốn hồ sơ + docs/AGENT_SETUP.md + evidence/agent-setup-* đã cập nhật; không tạo ZIP mới. ZIP CP6 không chứa setup. Human/native W5 gates giữ mở; không push/upload/deploy.

## AGENT-SETUP-002 — game design và game audio, 2026-10-21

- Theo phê duyệt owner bổ sung đúng hai project-local skills ceo-game-design/ceo-game-audio cùng metadata; thêm hai routing rows trong AGENTS.md. Không cài bộ cộng đồng, global config hoặc dependency mới.
- Official validator 8/8, 48 source refs; local Codex app-server skills/list nhận tám repo/enabled zero errors. Không tạo thread/model/subagent; UI picker/automatic selection chưa thử.
- Đã đọc hai skills và tạo docs/GAME_DESIGN_SKILL_TRIAL.md, docs/GAME_AUDIO_SKILL_TRIAL.md. Manual self-review chín ca, không independent acceptance.
- Chrome 156.0.8078.47 context riêng PASS bảy nhóm checks: week-one UI, real Audio playback/volume, independent mute, emulated visibility and reload preferences. Zero console/page/HTTP errors; 35/35 HTTP files SHA256 khớp dist. Screenshot tuần đầu đã xem. Native Safari/human listening/comprehension vẫn chưa xác minh.
- Source review: cash.mp3 có asset nhưng chưa có caller; trial ngày 7/tutorial3/6 vẫn observe khi dùng footer. Ghi observations và Proposed tests, không thay gameplay/audio trong scope setup-only.
- SHA256 đối chiếu 275 app/art/build files, gồm 153 public/art-source và 35 dist, cộng 12 files của sáu skills cũ giữ nguyên. Không rerun verify/build/full matrix/soak/balance. Không ZIP mới/push/deploy; ZIP CP6 không chứa setup.
- Bốn hồ sơ, AGENT_SETUP.md và evidence agent-setup-002 cập nhật; giữ toàn bộ CP6/SETUP-001 evidence như lịch sử.

## UI-REDESIGN-001 — 2026-10-21

WebKit 26.0 regression cuối cũng PASS 48 tổ hợp + sáu axe samples; select/nút phân công đạt ít nhất 40px, HTML select style 44px. Chrome full E2E cuối 15/15, 46.8 giây. Đã cập nhật `PLAY_SOFTWARE_CEO.html` từ dist đã kiểm; smoke Chrome file:// offline/save/export/reload/import PASS, zero external requests/page errors. Receipt `evidence/ui-redesign-receipt.json`; browser receipts/ảnh tách tại `evidence/ui-redesign-chrome/` và `evidence/ui-redesign-webkit/`. ZIP CP6 giữ nguyên.

Đã thiết kế lại sáu màn hình quản lý theo yêu cầu owner: `ManagementPage`/`ManagementSection` với thanh chọn mục sticky, giữ draft khi đổi mục, Focus thu gọn HUD/hướng dẫn, card/bảng/chữ rõ hơn, Nhật ký có tìm kiếm/lọc. Văn phòng/V4/T0.3/command/save giữ nguyên. `docs/UI_REDESIGN.md` ghi quyết định, trade-off và evidence.

Verify trước/sau PASS 46 tests/8 files + 3 QA harness, typecheck/lint/build. Chrome 156 full E2E **15/15 PASS**; regression mới kiểm 48 tổ hợp VI/EN, UI 100/150%, 1280×720/1920×1080, sáu màn hình, zero overflow và six sampled axe scans zero violations. Focus ở 1280×720: 495px so với 434.25px khi tắt, tăng 60,75 px. 171 protected files byte-identical; không chạy lại balance/soak/profile cho thay đổi bố cục. Kết quả CP6 về hiệu năng không áp cho build UI mới.

Preview đúng game: `http://127.0.0.1:4183` (`npm run preview -- --port 4183 --strictPort`); port 4173 đang do ứng dụng khác sử dụng, giữ nguyên process. Evidence: `ui-redesign-verify.log`, `ui-redesign-e2e.log`, `ui-redesign-browser.json`, `ui-redesign-preservation.json`, ảnh `ui-redesign-*.png`; outputs E2E mới ở `evidence/ui-redesign-run/`, bytes evidence lịch sử đã giữ nguyên. Hai test locator failures giữ riêng, không coi là PASS.

Owner/human acceptance và native Safari đầy đủ còn OPEN. Không push/deploy/upload; chưa tạo ZIP mới. ZIP CP6 chưa chứa thiết kế UI mới; standalone hiện đã cập nhật và kiểm offline. Bước tiếp: owner thử Phân công/Tuyển dụng/Hóa đơn/Nhật ký trên preview; chỉ đóng gói bản mới nếu được yêu cầu.


## UI-DEFAULT-002 — 2026-10-21

Theo yêu cầu mới của owner, bố cục quản lý thu gọn là mặc định duy nhất cho cả sáu màn hình. Đã bỏ nút Tập trung/Focus, state chuyển chế độ và CSS mode; dùng management-shell trực tiếp. Hướng dẫn vẫn có thể mở/thu gọn riêng. Quyết định này thay phần chọn mode của UI-REDESIGN-001 bên dưới.

Verify trước/sau PASS 46 tests/8 files + 3 QA harness, typecheck/lint/build. Chrome full E2E 15/15 PASS; WebKit regression 48 tổ hợp PASS, gồm không còn nút chế độ ở VI/EN và giữ mở/thu hướng dẫn. Standalone đã cập nhật và smoke offline/save/export/reload/import PASS. 171 protected files giữ nguyên; native Safari/human gates vẫn OPEN. Không ZIP/push/deploy. Evidence: evidence/ui-default-layout-receipt.json; preview 127.0.0.1:4183 và PLAY_SOFTWARE_CEO.html là bản mới. Bước tiếp theo: owner lưu tiến trình rồi tải lại preview để xem bố cục mặc định.


## UI-ROSTER-003 — 2026-10-21

Đã triển khai phương án owner duyệt: Đội ngũ dùng hàng gọn, các cột chung cho nhận diện/tình trạng/lương/phân công; hai nút Phân công/Chi tiết. Hàng thông thường 92px ở UI100%; hai người ban đầu và hành động hiển thị trọn ở 1280×720. Hộp Chi tiết chứa đặc điểm/hòa nhập/năng suất và thao tác lương/đào tạo/thôi việc. Giữ confirmation/command/cost; Tuyển dụng không đổi. Source: src/ui/EmployeeRoster.tsx, PeoplePanel, style.css; docs/UI_REDESIGN.md và PLAYER_GUIDE cập nhật.

Verify trước/sau PASS 46 tests/8 files + 3 QA harness/typecheck/lint/build. Chrome full E2E 17/17 (49.8s); Edge 2/2 (11.0s), WebKit 2/2 (6.2s) cho roster/dialog/actions/12 staff/tên dài/VI-EN/UI100-150%/hai viewport. Năm axe dialog samples mỗi browser zero selected-rule violations. Đã sửa vòng Tab và trả focus bằng nút mở thực tế, gồm sau khi thôi việc. Các failure logs giữ riêng; không giảm assertions. Standalone cập nhật và smoke offline/save/export/reload/import PASS.

171 protected files byte-identical; V4/T0.3/core/renderer giữ nguyên. Không soak/profile/balance/ZIP/push/deploy. Native Safari và human acceptance còn OPEN. Receipt: evidence/ui-roster-receipt.json; ảnh/browser receipts tách theo ui-roster-chrome/, ui-roster-edge/, ui-roster-webkit/. Bằng chứng E2E lịch sử giữ nguyên; outputs mới ở ui-roster-run/. Preview 127.0.0.1:4183 và PLAY_SOFTWARE_CEO.html đã là bản mới. Bước tiếp theo: owner lưu tiến trình rồi tải lại preview, xem Nhân sự → Chi tiết để nghiệm thu.


## UI-IDE-DARK-004 — 2026-10-21

Owner duyệt kế hoạch IDE dark mode; đã đổi toàn HTML UI sang palette tối/monospace/tab và control chung, giữ V4/T0.3/save/renderer. Verify trước/sau PASS 46 unit/8 files + 3 QA harness/typecheck/lint/build. Chrome 19/19 E2E, WebKit 5/5 UI regression, mỗi target 60 axe scans zero selected-rule violations. Đã sửa cột roster 225px sau một failure EN; giữ trace/log và assertions. 174 protected files và 35 final dist files giữ hash qua browser runs. Standalone offline/save/export/reload/import PASS; preview 127.0.0.1:4183 và PLAY_SOFTWARE_CEO.html là bản mới. Receipt evidence/ui-ide-dark/receipt.json. Owner/human/native Safari gates còn OPEN; không soak/profile/balance/ZIP/push/upload/deploy.

## UI-WALL-NAME-005 — 2026-10-21

Theo Approve của owner, tên công ty thay SOFTWARE CEO trên tường; preview theo input, fallback SOFTWARE CEO, fit/ellipsis 220 world units, cache redraw theo tên kể cả pause/load. Verify 46/8 + 3 harness/typecheck/lint/build PASS; Chrome 21/21 (71.0s), WebKit 2/2 (4.8s). Canvas pixels/metrics thật, VI/EN, Unicode, DPR2, tier1/2 và camera đã kiểm. Art QA 480 frames/60 GLB PASS; 174 protected files giữ bytes. Standalone offline/save/export/reload/import PASS. Receipt evidence/company-wall-name/receipt.json. Owner/native Safari gates còn OPEN; không balance/soak/profile/ZIP/push/deploy.
