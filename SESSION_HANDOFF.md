# SESSION HANDOFF — Software CEO LOCAL

## GIT-DELIVERY-TIME-24H — 2026-10-26 — owner yêu cầu commit/push

Khiêm đã yêu cầu commit và push gói tích hợp 24h trên branch main tới origin/main (https://github.com/khiemnd777/software-ceo.git). Commit lưu source, tests, tài liệu và mockup đã duyệt; evidence/dist tiếp tục giữ LOCAL theo .gitignore. Danh sách phạm vi: evidence/time-24h/git-delivery-2026-10-26/intended-files.txt.

Kiểm trước Git: source khớp SHA của bản bàn giao; không có thay đổi ứng dụng mới trong nhiệm vụ Git. Kiểm chứng của bản này: verify 105 unit + 3 QA harness PASS, 46 Edge E2E PASS, ba suite mô phỏng và soak 30 phút PASS. SHA commit, đối chiếu remote và kết quả push được ghi trong delivery-receipt.json cùng thư mục evidence Git khi hoàn tất; có thể xác minh bằng Git log/remote main.

Cờ balance Outsourcing/Tough và human acceptance vẫn OPEN. Push Git không xác nhận production hoặc triển khai game. Bước tiếp theo: review commit trên GitHub hoặc game LOCAL; mọi deploy cần quyền riêng.

## TIME-24H-INTEGRATION — 2026-10-26 — T0.4 / save v3, sẵn sàng review LOCAL

Owner đã duyệt D1–D8 và G0–G8. Đã tích hợp lịch 24h theo bước 15 phút; ca 09–12, 13–18 và OT 18–20; work/health theo giờ; accrual và settlement tháng; save v3/migration/backup transaction. Office thật có thời tiết, đồng hồ, công tắc, màn hình đang làm và ánh sáng cửa sổ. Giữ V4, ghế/gears, phân công thủ công tối đa 2 slot, draft và Office mounted. Không đưa model A/B hoặc seek/rewind của mockup vào game.

Verified: npm run verify PASS với 105 unit tests và 3 QA harness tests; typecheck/lint/build PASS. Production Edge E2E 46/46 PASS. Art 8 ngoại hình/1.152 khung; 301 file art/mockup/fixtures giữ SHA. Ba suite 900 + 1.200 market + 270 policy không có lỗi invariant hoặc command bị từ chối; policy đóng đủ ngày 180. Profile 12 nhân viên/mưa gió/DPR1–2 có 8 mẫu khoảng 60 FPS, p95 16,7–16,8 ms; axe 7 ngữ cảnh không báo vi phạm.

Soak 30 phút 23,8 giây/30 mẫu PASS: build SHA giữ nguyên, 0 runtime errors, 1 document, 292 listeners; heap sau warm-up 7,64–8,19 MiB. Memory control xác nhận cây panel bị inspector giữ: 1.839→632 nodes khi đổi target sang Canvas. Không coi kết quả này là chứng nhận mọi loại leak hoặc GPU.

OPEN: owner review; Outsourcing/Tough thắng 98→90/100 seed (8 thiếu khách quay lại, 2 margin<15%); human pacing 24/60/120, novice/campaign, screen reader, native Safari và native hidden-tab. Firefox/WebKit không launch được vì runtime trong thư mục tạm thiếu file. Không chỉnh tham số để xóa cờ balance.

Báo cáo: docs/TIME_24H_INTEGRATION_REPORT.md và docs/ADR-002_INTRADAY_CLOCK.md. Receipt/logs/hashes/diff/ảnh: evidence/time-24h/integration-2026-10-26/. Preview http://127.0.0.1:4194/; tab fixture 12 nhân viên, 09:00/Pause/đèn OFF. Dùng origin riêng; không đổi save ở origin cũ. Giữ mockup 4204. Không Git write/push/upload/deploy hoặc tạo ZIP mới.

Bước tiếp theo khuyến nghị: Khiêm review game LOCAL và cờ balance, chấp nhận hoặc nêu phần cần chỉnh. Thay đổi mới cần kế hoạch/Approve riêng; human playtest cần người tham gia, không thay bằng bot.

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

## TIME-24H-GROUND-COURTYARD — 2026-10-25 — mockup tầng trệt có sân sẵn sàng review

Khiêm đã chấp nhận bầu trời/thời tiết, sau đó Approve đổi nền theo phương án tầng trệt có sân. Đã có mặt đất/sân lát cùng isometric và camera với văn phòng, mép móng tiếp đất, bóng sát chân, bậc xuống lối đi, bồn cây/cây, đường tiếp cận và nhà xa. Bỏ cảnh đồi/đường dùng phối cảnh màn hình phía sau tấm sàn. Giữ mây/nắng/trăng/sao và5thời tiết; sân ướt có phản sáng nhỏ, đèn lối đi ban đêm. Scene420/480px và fit chừa sân/khoảng trời. Chỉ mockup, giữ game/art/model/clock/save; chưa tích hợp game.

Verified Node24: baseline/cuối12tests PASS;build riêng27inputs/strict typecheck/lint/format PASS.193snapshot simulation giống trước;558file bảo vệ giữSHA256. Edge quaCUA:5preset/ngày–đêm/pan–zoom,4bố cục1280/1920 ×UI100/150 không tràn ngang/cắt controls; pixel sàn/đèn/clock giữ ổn định, sân/đất đổi mưa/đêm;Pause giữ phase/sky,giảm hiệu ứng dùngpha0. Smoke display-rAF10giây1920×1080/UI150,mưa gió:507mẫu,mean19,72ms,p9541,6ms; có khung chậm, không kết luận60FPS hoặc profile game/GPU. Fullgame verify/E2E/FPS/soak/balance/nativeSafariFirefox/axe/human playtest NOT_RUN.

Review http://127.0.0.1:4204/docs/mockups/time-24h/;09:00ngày1,Nắng,Pause,120giây/ngày/1×. Evidence/bản trước/ảnh/log/hash/replay/browser/profile tại evidence/time-24h/ground-courtyard-2026-10-25/; docs/TIME_24H_LOCAL_PROTOTYPE.md. Owner visual acceptance của nền sân OPEN; phần thời tiết đã được owner chấp nhận. Tích hợp/push/upload/deploy NOT_AUTHORIZED. Bước tiếp theo: Khiêm xem điểm tiếp đất, sân/lối đi và cảnh xa để phản hồi hoặc chốt mockup; tích hợp cần kế hoạch vàApprove riêng.

## TIME-24H-OUTDOOR-WEATHER — 2026-10-25 — mockup cảnh ngoài trời sẵn sàng review

Khiêm Approve cảnh ngoài trời và thời tiết. Đã có bầu trời/đồi/nhà xa/cây/lối đi; mặt trời ban ngày, trăng/sao ban đêm;5presetNắng/Nhiều mây/Mưa/Gió/Mưa gió. Mây trôi, mưa nghiêng, cây lay khiChạy; Pause giữ pha, giảm hiệu ứng dùng cảnh tĩnh. Hai phương án chung weather/phase. Sky layer riêng dưới văn phòng, kính clip nhìn xuyên ra cùng cảnh; underfloor kín che khe tile; giữ đèn/đồng hồ rõ. Scene340/400px có khoảng trời50px. Chỉ mockup, không thêm business rules hoặc sửa game/art/save.

Verified Node24:12tests(6model+3lighting+3weather),build riêng/strict typecheck/lint/format PASS. Edge quaCUA:5preset tạo sky pixels khác nhau nhưng hai phương án trùng nhau; sàn/đèn/clock giữ màu;zoom/pan và4bố cục1280/1920 ×UI100/150 đạt;Pause/reduced/đổi preset bảo toàn state;193snapshot simulation giống bản trước.559file bảo vệ giữSHA256. Smoke display-rAF10giây mưa gió:589mẫu,mean16,98ms,p9518,3ms,visible; không coi là profile game60FPS/12người hoặc nghiệm thu GPU. Lượt đo trước bản vá underfloor tĩnh; bản cuối đã kiểm seam pixels và chụp lại6ảnh.

Review http://127.0.0.1:4204/docs/mockups/time-24h/; pause09:00 ngày1,Nắng,120giây/ngày/1×. ChọnThời tiết rồiChạy để xem chuyển động;00:00 để xem trăng/sao. Receipt/log/ảnh/ROI/profile/floor-seal/replay/bản trước: evidence/time-24h/outdoor-weather-2026-10-25/; docs/TIME_24H_LOCAL_PROTOTYPE.md. Owner visual acceptance OPEN; tích hợpNOT_AUTHORIZED. Full game verify/E2E/FPS/soak/balance/native browsers/axe/human playtest NOT_RUN; hidden-tab giữ giới hạn cũ. Không push/upload/deploy/đóng gói. Bước tiếp theo: Khiêm review5preset/ngày–đêm, phản hồi/chốt hình ảnh; tích hợp cần kế hoạch vàApprove riêng.

## TIME-24H-WALL-CLOCK — 2026-10-25 — đồng hồ treo tường trong mockup, chờ review

Khiêm Approve thêm đồng hồ treo tường vào mockup LOCAL để xem trước. wallClock.ts vẽHH:MM24h trên tường trái phía trên sofa, đúng phối cảnh/world/camera; LitOffice lấy cùng phút mô phỏng với HUD. Mặt tối/chữ ấm đọc được ban ngày/đêm, đứng yên khiPause; giảm hiệu ứng không đóng băng đồng hồ. Canvas có nhãn accessible chứa giờ. Chỉ sửa docs/mockups/time-24h và hồ sơ/evidence; chưa tích hợp game/art/save/rules.

Verified Node24:9tests model/lighting hiện có+build riêng/strict typecheck/lint/format PASS. Edge quaCUA: chữ số pixel thật09/18/20/00; Pause giữ signature chữ; HUD/hai wall clocks/accessible label cùng09:15; giảm hiệu ứng vẫn09:30; Chạy4× chuyển giờ rồi dừng; pan/zoom/min0.3 với font12px;4bố cục1280/1920 ×UI100/150 không tràn/cắt controls.193snapshot business trước/sau giống nhau;560file bảo vệ giữSHA256;zero browser warnings/errors. Không thêm unit tests mô phỏng lời gọi Canvas. Receipt/log/ảnh/ROI/bản trước tại evidence/time-24h/wall-clock-2026-10-25/; docs/TIME_24H_LOCAL_PROTOTYPE.md.

Review http://127.0.0.1:4204/docs/mockups/time-24h/; tab pause20:00 ngày1,120giây/ngày ở1×. Server loopback được khởi động lại vì process trước đã dừng; chỉ30route. Owner visual acceptance OPEN; integration NOT_AUTHORIZED. Full game verify/E2E/FPS/soak/native browsers/axe/human playtest NOT_RUN; hidden-tab giữSOURCE_REVIEW_ONLY. Không push/upload/deploy/đóng gói. Bước tiếp theo: Khiêm xem đồng hồ trên tường phía trên sofa để phản hồi/chốt vị trí và độ rõ; tích hợp cần kế hoạch/Approve riêng.

## OFFICE-GEARS-CHAIR-V2 — 2026-10-25 — đã sửa LOCAL, chờ nghiệm thu trực quan

Khiêm Approve hai mục. Working có hai bánh răng to–nhỏ8/6răng quay ngược, chu kỳ4/3giây; nhịpUI30fps riêng tiếp tục khi Pause, static khi giảm chuyển động và ngừng khi document hidden. Cache nền nhỏ theo ID/DPR khôi phục viền trước mỗi frame, không vẽ lại văn phòng theo nhịp UI; tile tái sử dụng/thu hồi theo lifecycle. Mask mép mặt ghế sửa phần chân bên xa còn đè lên ghế, giữ chân gần ở phía trước; không đổi tâm/atlas. Source: Office.tsx/officeOverlay.ts; tests mở rộng office-display.spec.ts; profile-browser.mjs tách world pass/badge blit. Giữ game rules/save/T0.3/V4/G–H; prototype24h thay đổi song song ngoài task được giữ nguyên và ghi riêng trong preservation.

Verified Node24: baseline/cuối66tests/13files+3QA harness/typecheck/lint/build PASS. Edge156 sandbox: lượt đầy đủ40PASS/2timeout trùng hai đợtSleep901giây; rerun hai ca cùng build/timeout/assertions2/2PASS(12,7s). Tổng42ca được xác nhận đạt; không coi đây là một lượt42/42 liên tục.12pixel lưng/36pixel mép ghế/12pixel chân gần trên đủ8ngoại hình đạt;96mẫu tư thế và16cấu hình/32trạng thái bật–tắt điểm tương tác có trong bộ E2E. Working quay khi Pause không thêm world pass/đổi pixel ngoài badge; giảm chuyển động và hidden/resume emulated đạt.20khung QA,5cặp pha lặp khớp pixel tuyệt đối. Profile riêng12người4×10giây: rAF60,04–60,10Hz,p9516,7ms;7context axe zero selected-rule violations,zero browser errors/external requests.274file public/art-source và44distfiles giữ hash; art480+1.152frames PASS. Warning JS>500kB có trước:618,28→620,10kB.

Chi tiết docs/OFFICE_GEARS_CHAIR_V2.md; evidence/office-gears-chair-v2/receipt.json,working-gears.gif,chair-before-after.png và logs/traces giữ nguyên. Game cùng origin http://localhost:4183/; preview kiểm127.0.0.1:4186. Không đọc/ghi slot chơi cá nhân. Owner visual acceptance OPEN; nativeSafari/human screenreader/novice/campaign/soak/balance mới/native hidden-tab NOT_RUN. Không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm lưu tiến trình rồi review Working khi Pause và vùng chân trái/ghế, chốt nghiệm thu hoặc chỉ tư thế còn lỗi.

## TIME-24H-LIGHTING-EXTERIOR — 2026-10-25 — mockup ánh sáng sẵn sàng review

Khiêm đã xem/đồng ý cơ chế thời gian và lịch làm; sau đó Approve sửa hình ảnh ngoài trời/cửa sổ/trong phòng. Đã tạo LitOffice/sceneLighting riêng trong docs/mockups/time-24h/: nền ngoài trời và kính cùng palette theo giờ, cửa kính clip theo world/camera, bốn đèn tường ấm sáng liên tục, vùng sáng tự nhiên nhỏ sát cửa. Bỏ phủ tối toàn cảnh; khung cửa cuối nằm trong tường. Giữ lịch09–12/13–18h, tăng ca18–20h và mọi hệ số/kết quả. Chưa tích hợp game hoặc thay art/save.

Verified Node24:9tests (6model+3lighting), build riêng/strict typecheck/lint/format PASS;193snapshot simulation trước/sau giống hoàn toàn. Edge quaCUA: pixel thực09/18/20/00, camera fit/zoom/pan cho kính/nền đổi và sàn/đèn giữ sáng;4bố cục1280/1920 ×UI100/150 không tràn/cắt controls;zero console warning/error.24input và bundle cuối giữ hash qua bàn giao. Có6file game/dist/test ngoài scope thay đổi song song; giữ nguyên, ghi concurrent-changes.json và rebuild/kiểm mockup với overlay hiện có; 552/558file bảo vệ không đổi, model/tests model giữSHA256. Không tuyên bố toàn bộ game/dist bất biến.

Review http://127.0.0.1:4204/docs/mockups/time-24h/; tab pause20:00 ngày1,120giây/ngày ở1×; nút00:00/09:00 để so sánh nhanh. Ảnh bốn giờ/receipt/pixel/hash/bản trước: evidence/time-24h/lighting-2026-10-25/; chi tiết docs/TIME_24H_LOCAL_PROTOTYPE.md. Owner lighting acceptance OPEN; tích hợp NOT_AUTHORIZED. Full game verify/E2E/FPS/soak/balance/native browsers/axe/human playtest NOT_RUN; hidden-tab vẫn SOURCE_REVIEW_ONLY. Không push/upload/deploy/đóng gói. Bước tiếp theo: Khiêm review đèn/kính/nền và chốt hình ảnh; tích hợp cần kế hoạch/Approve riêng.

## TIME-24H-SCHEDULE-0900-1800 — 2026-10-25 — mockup cập nhật, chờ owner review

Khiêm Approve cập nhật mockup theo lịch09–12h/13–18h, nghỉ trưa12–13h, tăng ca18–20h; chưa tích hợp game. Đã dùng SCHEDULE chung cho luật ca, vùng biểu đồ, mốc Trước/Tiếp và nút nhanh; mở tại09:00 ngày1. Giữ hệ số thử và ánh sáng theo giờ;17–18h là ca chuẩn, chỉ hồi Morale trong khung17–22h khi đã nghỉ. Tổng giờ chuẩn vẫn8h/ngày. Bản trước được sao lưu tại evidence/time-24h/schedule-2026-10-25/before/; bằng chứng/checkpoint24-10 giữ làm lịch sử.

Verified Node24: baseline5tests → cuối6tests model PASS; build riêng/strict typecheck/lint/format PASS. Edge quaCUA: ca sáng3h/chiều5h;17:45 còn làm chuẩn,18:00 A tan ca/B tăng ca,20:00 cả hai nghỉ; bảng13mốc và biểu đồ theo lịch mới. Phát trọn48h ở2×/4× cho cùng kết quả;4bố cục1280×720/1920×1080 ×UI100/150 không tràn/cắt controls, zero console warnings/errors. Sau48h: A2,63WP/Energy80/Morale75,34/$368; B3,05WP/Energy55,2/Morale73,22/$488 (chi phí tích lũy).556tệp source/public/art/dist/tests/scripts/mockup khác giữSHA256. Hồ sơ: docs/TIME_24H_LOCAL_PROTOTYPE.md; receipt/log/ảnh mới: evidence/time-24h/schedule-2026-10-25/.

Review http://127.0.0.1:4204/docs/mockups/time-24h/; tab để tạm dừng09:00 ngày1,120giây/ngày ở1×. Owner acceptance OPEN; hệ số chưa chốt. Game/save/T0.3/art giữ nguyên, không rebuild game/standalone/ZIP/push/upload/deploy. Full game verify/E2E/balance/soak/FPS/axe/native browsers/human playtest NOT_RUN; hidden-tab vẫn SOURCE_REVIEW_ONLY. Bước tiếp theo: Khiêm review18–20h ngày1 và09h ngày2, phản hồi/chốt mockup; tích hợp cần kế hoạch và Approve riêng.

## TIME-24H-LOCAL-PROTOTYPE — 2026-10-24 — sẵn sàng owner review

Khiêm Approve mô phỏng LOCAL hai ngày so sánh bình thường/tăng ca trước tích hợp. Đã dựng riêng tại docs/mockups/time-24h/: cùng một Dev/dự án, A làm08–12/13–17h, B thêm17–19h; clock24h, sáng–tối, WP theo giờ thực làm, hồi sức khi nghỉ, tinh thần tích lũy và chi phí tách lương/vận hành. Một timeline15phút dùng chung; Phát lại/Trước/Tiếp/slider, nhịp24/60/120giây và1×/2×/4×. Dữ liệu/hệ số mẫu ghi rõ Proposed; không import runtime/store/transitions/persistence, không tích hợp hoặc sửa game/save/T0.3/V4/G–H.

Verified Node24: build riêng/strict typecheck/ESLint/Prettier PASS;5tests model PASS. Edge thật quaCUA:4bố cục1280×720/1920×1080 ×UI100/150 không tràn/cắt controls; nghỉ trưa/tan ca/qua đêm, slider keyboard/giảm hiệu ứng/bảng13mốc đạt; chạy trọn48h ở2×/4× cho cùng kết quả. Console zero warning/error. Kết thúc: A2,61WP/Energy80/Morale75,40/$368; B3,03WP/Energy55,2/Morale73,28/$488 (chi phí tích lũy, chưa trả cash).556file bảo vệ source/art/dist/tests/scripts/mockup cũ giữSHA256. Evidence/receipt: evidence/time-24h/; chi tiết docs/TIME_24H_LOCAL_PROTOTYPE.md.

Review http://127.0.0.1:4204/docs/mockups/time-24h/; server loopback chỉ30route. Owner visual/gameplay acceptance OPEN; hệ số và nhịp chưa chốt. Hidden-tab auto-pause SOURCE_REVIEW_ONLY, chưa xác nhận chuyển tab ẩn quaCUA. Full game verify/E2E/balance/soak/FPS/axe/native Safari/Firefox/human playtest NOT_RUN; không rebuild game/standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm xem17–19h ngày1 và08h ngày2, phản hồi/chốt prototype; tích hợp cần kế hoạch/Approve riêng.

## OFFICE-DISPLAY-FIX — 2026-10-24 — đã sửa LOCAL, chờ nghiệm thu hình ảnh

Khiêm Approve kế hoạch bốn mục. Nhãn Canvas vẽ sau đồ vật trong tọa độ màn hình, giữ chữ13px/huy hiệu24px qua zoom/fit; nhãn HTML giữ theo UI scale, tránh chồng/cắt, hiện tên đầy đủ/trạng thái và không lặp tên Canvas khi bật điểm tương tác. Bánh răng/nghỉ/cảnh báo thay chấm trạng thái; cảnh báo giải thích cả tinh thần/năng lượng thấp. Sofa dịch xa bàn. Lưng/tay ghế phía camera dùng mask từ sprite gốc để che nhân viên đúng depth; không đổi tâm nhân vật, art V4/G–H, simulation/T0.3 hoặc save/schema.

Verified Node24: baseline64tests/12files → cuối66tests/13files +3QA harness/typecheck/lint/build PASS. Edge156.0.4314.42 production40/40E2E,0skipped/flaky/unexpected.16cấu hình ×bật/tắt điểm tương tác=32trạng thái; hai tiers/VI–EN/UI100–150/1280–1920/DPR2 và zoom/fit đạt.12pixel lưng ghế khớp nguồn;96mẫu tư thế tám ngoại hình đã xem.5trạng thái camera fit/min/max/pan/restore tạiUI150 không chồng/cắt. Art480+1.152frames PASS;274tệp public/art-source giữSHA256. Profile riêng12người4×10giây: rAF60,07–60,11Hz,p9516,7–16,8ms;7context axe zero selected-rule violations;zero browser errors/external requests.44distfiles giữ hash qua E2E/profile;ảnh browser lịch sử được phục hồi bytes. Warning JS>500kB có trước:614,05→618,28kB.

Chi tiết: docs/OFFICE_DISPLAY_FIX.md; receipt/ảnh/log: evidence/office-display-fix/. Game cùng origin http://localhost:4183/; preview kiểm chứng127.0.0.1:4186. Không thao tác slot chơi cá nhân. Owner visual/usability acceptance OPEN; nativeSafari/human screenreader/novice/campaign/soak/balance mới NOT_RUN; native tab visibility chưa xác nhận. Không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm lưu tiến trình rồi review cùng origin LOCAL, chốt nhãn/huy hiệu/sofa/lưng ghế hoặc phản hồi vị trí cần chỉnh.

## COMPACT-HUD-INTEGRATION — 2026-10-24 — đã tích hợp game LOCAL

Khiêm “Chốt thiết kế, tích hợp game.” Thiết kế icon APPROVED và tích hợp LOCAL đã hoàn tất: HUD icon+số/tooltip, Uy tín–Lượt CEO riêng; tutorial một dòng/CTA mũi tên/giải thích nổi, giữ commands và VI/EN. KPI lấy dữ liệu thật theo ba mô hình; không mang dữ liệu mẫu vào game. V4/G–H, T0.3, renderer/simulation/persistence/schema và mockup đã chốt giữ nguyên.

Verified Node24: baseline/cuối64tests/12files+3QA harness/typecheck/lint/build PASS; Edge production35/35E2E,0skipped/flaky/unexpected;36tổ hợp ba mô hình×VI/EN×UI100/125/150×1280/1920 không tràn/cắt;6vùng axe đạt. Tooltip/hover/focus/Escape, state export trước–sau và hoàn thành policy đạt.44distfiles giữ hash suốt browser;302tệp bảo vệ giữ SHA256. Warning JS>500kB có trước,611.64→614.05kB. Evidence/receipt: evidence/compact-hud/integration/; chi tiết docs/COMPACT_HUD_INTEGRATION.md.

Game http://localhost:4183/ đã mở lại cùng origin, Continue đúng saveKNA SOFTWARE ngày154/$64,100 và để tạm dừng; UI thậtHUD64+tutorial48px,scene835px tạiCSS1874×991. Preview kiểm thử4186. Design APPROVED; owner runtime usability acceptance OPEN. Native Safari/human screen reader/novice/soak/FPS/balance mới NOT_RUN; không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm xem tooltip/hướng dẫn trên save hiện có, phản hồi hoặc nghiệm thu LOCAL. Các nhãn chưa chốt/chưa cho tích hợp trong checkpoint mockup dưới đây là lịch sử đã được quyết định này thay thế.

## COMPACT-HUD-ICONS — 2026-10-24 — mockup icon sẵn sàng review

Khiêm “Approve phương án này.” cho đổi nhãn KPI và nút hướng dẫn sang SVG trong mockup. Đã dùng tiền/công việc/nhân sự/ngôi sao/tia chớp; giữ số, tên nhiệm vụ và accessible names. Nút Mở dùng mũi tên, Giải thích dùng dấu hỏi; chín tooltip hỗ trợ pointer/focus và Escape. 1280×720/UI150 HUD vừa một hàng, scene tăng thêm28px so với mockup chữ. Chỉ sửa docs/mockups/compact-hud/, không tích hợp game.

Verified: Node24 build riêng/strict typecheck/ESLint/Prettier PASS; Edge8tổ hợp trước/sau×1280/1920×UI100/150 không tràn/cắt nút; chín tooltip keyboard/aria-describedby/Escape, năm KPI/focus return và hướng dẫn/policy/CTA đạt; console cuối zero error/warn.381tệp source/public/art-source/dist/mockup cũ giữ hash. Evidence/receipt mới tại evidence/compact-hud/icons/; docs/COMPACT_HUD_MOCKUP.md ghi hiện hành, evidence trước giữ nguyên.

Review http://127.0.0.1:4203/docs/mockups/compact-hud/; tab Edge giữ mở. Owner visual/usability acceptance OPEN; game integration NOT_AUTHORIZED. Human screen reader/native Safari/full game verify/E2E/soak NOT_RUN. Bước tiếp theo: Khiêm xem ý nghĩa icon, tooltip và UI150 rồi phản hồi/chốt mẫu; tích hợp cần kế hoạch/Approve riêng.

## COMPACT-HUD-MOCKUP — 2026-10-24 — sẵn sàng owner review

Khiêm yêu cầu “Cho xem mockup trước”. Đã dựng mockup độc lập tại docs/mockups/compact-hud/: HUD gọn, Uy tín/Lượt CEO riêng, tutorial một dòng với CTA và giải thích mở theo yêu cầu; có Hiện tại/Đề xuất và UI100/150. Dữ liệu mẫu chỉ trong RAM, tái sử dụng Office/art hiện có; không import bootstrap/store/persistence. Hiện tại là bố cục dựng lại từ source/ảnh, số đo so sánh trong mockup; chưa đo lại game đang chạy.

Verified Node24: build riêng/strict typecheck/ESLint/Prettier PASS. Edge8tổ hợp1280×720/1920×1080×UI100/150×trước/sau không tràn ngang/cắt nút trên; năm KPI/hướng dẫn/policy/Escape/focus return đạt. UI100 phần trên212→112px; UI150 tiết kiệm85–113px trong mockup. Console cuối zero error/warn.381tệp source/public/art-source/dist/mockup cũ giữ SHA256. Receipt evidence/compact-hud/receipt.json; chi tiết docs/COMPACT_HUD_MOCKUP.md.

Review LOCAL http://127.0.0.1:4203/docs/mockups/compact-hud/; server chỉ30route loopback. Owner usability acceptance OPEN, tích hợp game NOT_AUTHORIZED. Full game verify/E2E/balance/soak/FPS/native Safari/screen reader NOT_RUN; không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm xem Hiện tại/Đề xuất, mở giải thích và thử UI150; phản hồi hoặc chốt. Tích hợp cần kế hoạch/Approve riêng.

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

Server: `python3 docs/mockups/simulate-work-people/serve.py`, loopback4201 chỉ28route cố định; giữ process/tab4183 đang chơi. Build riêng: Node24 `node docs/mockups/simulate-work-people/build.mjs`; QA: Node24 `node evidence/simulate-work-people-mockup/check.mjs`. Runtime Node24: /Users/khiemnguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node. Không chạy Vite/build game cho mockup.

Verified: build riêng/typecheck/lint/Prettier PASS; Edge 155.0.4283.62 với Chromium sandbox bật đạt12 nhóm tương tác,12 tổ hợp ba trạng thái ×1280×720/1920×1080 ×UI100/150 và4 ảnh editor. Đã kiểm draft/batch/giới hạn2việc/chốngtrùng/khóa chưa ký/focus/Escape/Canvas selection/zoom/clock/reload/range. Zero browser errors/failed/external requests; không gọi browser storage trong lượt đo.176tệp source/public/tests/package/standalone/mockup cũ giữ SHA256. Receipt: evidence/simulate-work-people-mockup/browser-2026-10-22T03-50-30.714Z/receipt.json.

Review LOCAL: http://127.0.0.1:4201/docs/mockups/simulate-work-people/. Chỉ tiếng Việt và dữ liệu tổng hợp; owner usability/layout acceptance OPEN. Không kiểm lại full game verify/E2E/balance/soak/native Safari vì source/gamebuild không đổi; không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm thử ba trạng thái, phản hồi/chốt diện tích văn phòng và bảng; tích hợp game cần kế hoạch/Approve riêng.

## CHARACTER-COMPLETION-GH — 2026-10-22 — E–H đã chốt, bộ nhân vật G–H APPROVED

Quyết định mới nhất: “Chốt G–H, xác nhận bộ nhân vật này.” — G–H APPROVED, lưu tại evidence/character-gh/owner-approval-gh.json. Quyền triển khai trước đó: “Chốt, tiếp tục G–H.” đã chốt clip F; G/H đã triển khai trong kế hoạch E–H, không hỏi lại quyền. Kết quả:8nguồn Blender/GLB,32ảnh model,1.152sprite thật/8atlas, catalog appearance và tích hợp Canvas/save. Nguồn F/E/V3 và art cũ giữ nguyên; owner-approval-f.json tại evidence/character-gh/ ghi quyết định mới mà không sửa receipt F lịch sử. Docs chính: docs/CHARACTER_COMPLETION_GH.md; checkpoint evidence/character-gh/checkpoint-gh.json.

Runtime đang dùng Node24: game4194 production preview; gallery4195 bằng scripts/character-gh/serve-review.py,59file cố định trênloopback. Mở http://127.0.0.1:4195/art-source/character-gh/review.html và http://127.0.0.1:4194/. Tab/campaign cũ ởlocalhost:4183 không bị thao tác. Storage khác hostname/port là khác origin; muốn xem campaign cũ ở4194 cần tự xuất/import save. Giữ sources đã chốt, không tự rebuild Blender chỉ để đọc bằng chứng.

Verify cuối58tests/11files +3QA harness/typecheck/lint/build;30/30E2E trên44distfiles cố định. Browser xác nhận8atlas thực sự được Canvas vẽ, old-v2 state không đổi qua native import/export, new metadata roundtrip, pause/reduced motion/hit test đạt. Profile riêng4×10giây1280/1920 đạt~60rAF/s, p95<=16,8ms trên Chrome156/M3Pro; post-GC+286.696bytes, nodes/listeners giữ nguyên. Gallery8×4ảnh/8×9tracks, play/pause/scrub/Escape/focus/download/desktop/mobile đạt. Không diễn giải thành60pose/s hoặc chứng minh mọi máy.

Save version2 giữ; appearance optional, lookup danh tính catalog được viết rõ, unknown legacy fallback ID/variant ổn định; không đoán giới tính từ tên. Code cũ có strict schema có thể không đọc save mới có appearance. Public assets role cũ giữ để bảo toàn lịch sử, không được runtime tải. G/H đã được owner chốt; xác nhận không thay bằng chứng playtest hoặc kiểm nền tảng mới; native Safari/soak mới, rig ngón tay/mặt/physics và standalone mới chưa có. Warning JS588,55kB giữ. Bước tiếp theo: giữ G–H làm baseline cho các lượt phát triển nhân vật sau; thay đổi mới cần kế hoạch và Approve riêng. Đóng gói/phát hành vẫn cần nhiệm vụ được duyệt riêng. Không push/upload/deploy. Các mục dưới là lịch sử trước checkpoint này.

## CHARACTER-RIG-F — 2026-10-22 — chờ Khiêm review sáu clip

Owner chốt hai mẫu E: “Chốt hai mẫu E, tiếp tục F”. F đã dựng xong hai nguồn điều khiển/bake và hai GLB sáu clip tại art-source/character-f/. Nguồn E/V3 giữ hash. Nguồn hiện hành ở thư mục gốc character-f; iteration01–03 là bản thử bị thay thế, không dùng cho review cuối. Không tự rebuild nguồn đã chốt để đọc bằng chứng.

Review: http://127.0.0.1:4193/art-source/character-f/review.html. Server scripts/character-f/serve-review.py chỉ428routes loopback; giữ server/trang E/V3 cũ. Đủ hai mẫu, sáu clip, hai góc, phát/dừng/0,5×/scrub/ảnh900px và download rig/GLB. Scripts kiểm chính: validate.py, audit-saved.py, render.py, package-review.py, browser.mjs; lệnh/runtime cụ thể tại docs/CHARACTER_RIG_F.md. Receipt cuối evidence/character-f/checkpoint-f.json, gồm source/frame/GLB/browser hashes; Chrome PASS24 tổ hợp và desktop/mobile, không có lỗi/request ngoài.

Đang dừng tại review chuyển động F, không phải xin lại kế hoạch E–H. Sau chốt clip, tiếp tục G: nam quần dài/quần đùi; nữ chân váy dài/ngắn/quần dài × tóc ngắn/dài; rồi H. Walk có root motion0,92m/2s: H phải xử lý khi bake sprite để tránh cộng hai lần với Canvas. Chưa có rig ngón tay/khuôn mặt hoặc chứng nhận toàn bộ va chạm. Game/source/save/shipping assets giữ nguyên; không chạy verify/E2E/profile game mới ở F, không rebuild standalone/push/upload/deploy.

## CHARACTER-COMPLETION-EH — 2026-10-22 — E sẵn sàng review, F–H đã duyệt phạm vi

Khiêm xác nhận “Duyệt E—H”. Toàn bộ E–H được duyệt triển khai LOCAL; giữ mốc review hai mẫu cơ sở trước diễn hoạt và review clip trước nhân rộng. Không cần xin lại quyền thực hiện F–H. Authorization: evidence/character-eh/authorization-eh.json; kế hoạch/trạng thái: docs/CHARACTER_COMPLETION_EH.md.

E đã có bản sao nguồn Blender chuẩn hóa và hai GLB toàn thân, giữ đúng đầu nữ V3 đã duyệt. Quần mới có lưới quad nối hông và vòng hỗ trợ gối; bỏ đường may khóa quần rời khỏi bề mặt. Model/ảnh/source V3, V2, A–C và source/shipping assets game giữ hash. GLB E là mesh subdivision để review, chưa phải LOD shipping hoặc rig. 15 ảnh render từ GLB nhập lại; bộ lỗi trước giữ riêng trong iteration01–04.

Verified: npm run verify baseline PASS51tests/9files,3QA harness,typecheck/lint/build; warning bundle514kB có trước. Binary GLB và hash15ảnh PASS;21chi tiết đầu nữ khớp tam giác bản duyệt ở dung sai1micromet. Audit nguồn PASS: hai quần toàn quad,mỗi quần một khối liên thông,ba vòng biên vải chủ đích,transform chuẩn. Chrome sandbox bật PASS14góc/mẫu +ảnh hai mẫu,download/ref khớp bytes,desktop1440×1050/mobile390×844 không tràn,zero errors/failed/external requests. 363tệp có trước giữ hash trước cập nhật hồ sơ; lượt này chỉ đổi hồ sơ quyết định. Receipt evidence/character-eh/checkpoint-e.json.

Review: http://127.0.0.1:4192/art-source/character-eh/review-e.html; server loopback chỉ22file cố định,không mở repo; trang đầu nữ V3 cũ giữ nguyên. Mốc E visual acceptance OPEN, theo plan “Dừng cho Khiêm chốt hai mẫu cơ sở trước diễn hoạt.” Bước tiếp theo: Khiêm review hai mẫu E để tiếp tục F trong quyền E–H đã có. F/G/H chưa thực hiện; chưa rig/clip/biến thể/sprite/game integration. Không chạy E2E/profile/soak game tại E,không rebuild standalone/push/upload/deploy.


## CHARACTER-FEMALE-HEAD-V3 — 2026-10-22 — thiết kế đầu nữ đã duyệt

Owner đã Approve sửa riêng mặt và tóc nữ sau khi từ chối V2. Nguồn Blender hoàn tất được audit sau gián đoạn, không dựng lại. GLB đầu nữ được xuất/nhập lại và render9 ảnh cuối:3góc màu/clay và3ảnh V2 cùng camera. Trang LOCAL mới: http://127.0.0.1:4191/art-source/character-female-head-v3/review.html. Server4191 chỉ phục vụ14file theo allowlist; không dùng các URL mockup cũ qua server này. Nguồn/scripts/evidence: character-female-head-v3; docs/CHARACTER_FEMALE_HEAD_V3.md có lệnh và giới hạn.

Audit/GLB/hash PASS;105mesh bối cảnh giữ nguyên;727tệp snapshot lúc tiếp tục giữ hash.17drift paths thuộc runtime khác đã có trước được giữ, không revert. Chrome sandbox bật PASS6tổ hợp góc/màu,1440×1050/390×844, zero errors/failed/external requests/overflow. Không chạy lại game verify/E2E/balance/soak; không đổi source game/male/body/outfits. Receipt evidence/character-female-head-v3/final-receipt.json.

Khiêm xác nhận “Xác nhận thiết kế này.”: đầu nữ V3 APPROVED về thiết kế. Hash Blender/GLB khớp bản đã review; receipt duyệt riêng evidence/character-female-head-v3/owner-approval.json, giữ receipt kỹ thuật cũ. Chỉ cập nhật hồ sơ, không sửa model/ảnh/source game; ghi chú cạnh gãy tóc vẫn còn để chuẩn hóa lưới mà giữ hình dáng đã duyệt. Plan E–H đề xuất trong docs/CHARACTER_FEMALE_HEAD_V3.md; ưu tiên E chuẩn hóa/chốt hai mẫu toàn thân, chờ Approve triển khai riêng. Chưa rig, tóc dài/chân váy/quần đùi, sprite pipeline, appearance mapping hoặc tích hợp game; không push/upload/deploy.

## WORK-UNIFIED-RUNTIME-013 — 2026-10-21 — tích hợp LOCAL đã kiểm chứng

Owner chốt mockup và Approve kế hoạch tích hợp Công việc → Phân công. Đã triển khai bằng React, dữ liệu/commands thật: bảng tổng quan gọn, Chi tiết theo dự án giữ các hành động hợp đồng/Product/Startup, editor vùng rộng, cùng entry từ Nhân sự/Market. Bản nháp/query/filter/sort/scroll thuộc UI session của App, giữ khi chuyển màn hình/dự án; tải save hoặc tạo game mới khởi tạo lại. Bản nháp không lưu qua reload, save schema không đổi.

Thêm assignBatch ở simulation: kiểm toàn nhóm trước khi ghi, CAS snapshot theo assignment từng người, retry safe, giữ slot còn lại, tối đa2 việc, không trùng và target/task hợp lệ. Tick không làm hết hiệu lực bản nháp. Giữ assign/unassign cũ, T0.3, V4 và công thức năng suất. Source chính: src/ui/WorkWorkspace.tsx, workSession.ts, Panels.tsx, App.tsx, simulation/commands.ts và types.ts; xem docs/WORK_UNIFIED_RUNTIME.md.

Verified Node24: npm run verify trước PASS46 tests/8files, sau PASS51tests/9files; 3QA harness/typecheck/lint/build. Edge full30/30 E2E, zero skipped/flaky/unexpected, 135,58giây trên fixed production dist35files. Dev4183 đạt3/3 regression bằng context riêng. VI/EN, UI100/150,1280×720/1920×1080; ma trận24 tổng quan và8 editor, bảng6work hợp lệ, ít nhất5 hàng trọn ở1280×720/UI100; vòng Tab/Shift+Tab/Escape/focus return đạt. Gameplay delivery→invoice→cash, Product/Startup/MVP/funding, save/import/reload/conflict/outcomes đạt trong full suite. Không hạ assertion/quality gates.

179 tệp public/art-source giữ hash; 237 tệp baseline giữ nguyên,14 tệp source/tests hiện có đổi đúng phạm vi. Package/lock/Vite config/standalone giữ hash; hai mockup và bản ghép giữ nguyên. 248 tệp evidence root lịch sử được phục hồi bytes; kết quả mới tách full-suite-artifacts/ và browser/ trong evidence/work-unified-runtime/. Các lượt lỗi/setup/fixture/layout/focus được giữ riêng. Receipt cuối: evidence/work-unified-runtime/receipt.json.

Game dev: http://localhost:4183/; dùng đúng hostname đang chơi vì localhost và127.0.0.1 không dùng chung storage. Owner runtime visual acceptance, native Safari/human screen reader còn OPEN. Không đo FPS/soak/balance mới; warning JS khoảng514kB còn. Không rebuild standalone/ZIP, push/upload/deploy. Bước tiếp theo: Khiêm review Công việc → Phân công trong game; lưu campaign vào slot trước khi chủ động reload tab cũ nếu cần.

## WORK-UNIFIED-MOCKUP-012 — 2026-10-21 — chờ owner review

Owner Approve ghép hai mockup thành một luồng, chưa tích hợp game. Bản riêng tại `docs/mockups/work-unified/`: tổng quan gọn → Phân công theo dự án trong vùng rộng → Về tổng quan; tên dự án mở Chi tiết, tab Phân công mở cùng editor. Editor giữ mounted và bản nháp qua đổi dự án/Tài chính; tổng quan giữ search/filter/sort/scroll. Dữ liệu đội ngũ dùng chung trong mockup; Áp dụng cập nhật tổng quan và Chi tiết. Fixture thống nhất ngày77; chỉ tiếng Việt, dữ liệu bộ nhớ, reload đặt lại; không đọc/ghi save thật.

Verified và receipt cuối: `evidence/work-unified-mockup/receipt.json`; kiểm Edge profile riêng, các ảnh overview/editor. Lần test đầu timeout do locator nhân viên bị bộ lọc Chưa phân công che, đã sửa bước test; giữ browser-initial.log/failure. Lượt kiểm tiếp theo PASS 7 nhóm tương tác/4 layout, zero page errors; xem ảnh thấy editor quá ít diện tích nên thu gọn summary và ẩn tutorial khi giao việc. Kiểm cuối PASS: 7 nhóm tương tác, 4 tổ hợp 1280×720/1920×1080 và UI100/150, zero page errors/overflow; hàng nhân viên đầu không bị che, tổng quan ít nhất5 hàng ở1280×720/UI100. Log: browser-final.log. 265 tệp bảo vệ giữ hash. Không suy PASS game từ mockup. Manifest bảo vệ 265 tệp ứng dụng/art/build/hai mockup cũ/package/standalone.

Mở http://127.0.0.1:4191/docs/mockups/work-unified/. Hai mockup cũ giữ nguyên. Owner usability acceptance, EN, screen reader/native Safari và runtime integration còn OPEN. Không chạy lại verify/E2E/balance/soak/profile game, không rebuild/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm thử luồng ghép, phản hồi hoặc chốt thiết kế; tích hợp game cần kế hoạch/Approve riêng.

## ASSIGNMENTS-MOCKUP-011 — 2026-10-21 — chờ review thiết kế

Owner yêu cầu dựng mockup sau đề xuất giao việc theo dự án. Đã tạo `docs/mockups/assignments/` độc lập, VI, dark theme: chọn dự án một lần, bảng cả đội, lọc/tìm nhân viên, bản nháp theo dự án, áp dụng nhiều hàng, thay đúng một việc và giữ việc còn lại, giới hạn hai việc, khóa dự án chưa ký. Chuyển Tài chính rồi quay lại giữ dự án/bộ lọc/bản nháp. Dữ liệu minh họa chỉ ở bộ nhớ; reload đặt lại. Không tích hợp game, không đổi source/save/balance/art hoặc build.

Verified: `node --check docs/mockups/assignments/app.js` PASS; `node evidence/assignments-mockup/check.mjs` trên Edge profile riêng PASS 6 nhóm tương tác, 4 layout (1280×720/1920×1080, UI100/150), zero horizontal overflow/page errors. Lần launch đầu trong sandbox bị SIGABRT/EPERM; lần chạy được duyệt ngoài sandbox PASS. Receipt/ảnh: `evidence/assignments-mockup/`. Kiểm ảnh 1440px thực; chỉnh badge theo nội dung sau lần chụp đầu. Không chạy verify/E2E game cho mockup độc lập. Owner visual acceptance, human speed/keyboard/screen reader và runtime integration còn OPEN.

Mở http://127.0.0.1:4191/docs/mockups/assignments/ qua server LOCAL hiện có. File entry cũng mở trực tiếp được. Bước tiếp theo: Khiêm review thao tác; chỉ tích hợp vào game sau kế hoạch/Approve riêng. Không push/upload/deploy/ZIP.

## UI-WORK-OVERVIEW-MOCKUP-011 — 2026-10-21 — chờ owner review

Owner yêu cầu xem mockup trước khi sửa màn hình Công việc. Đã dựng docs/mockups/work-overview/: bảng toàn chiều ngang, hàng56px, Dev/QA/team/hạn giao hiện cùng lúc; chọn hàng mở ngăn chi tiết ba phần; search/filter/sort;3/6/rỗng, VI/EN, UI100/150. URL LOCAL: http://127.0.0.1:4191/docs/mockups/work-overview/index.html. Chỉ dữ liệu mẫu và thao tác xem; không thực thi commands hoặc đọc save.

Verified Edge:24 tổ hợp layout,9 nhóm tương tác, zero console/page errors. Ít nhất5 hàng tại1280×720/UI100 kể cả thanh review; ngăn chi tiết không tràn, Tab/Shift+Tab/Escape/focus return đạt. Node syntax/Prettier đạt.259 tệp game/art/build/mockup cũ/package/standalone giữ hash. Lỗi4 hàng/favicon đầu giữ nguyên trong evidence/ui-work-overview-mockup/; receipt.json ghi kết quả cuối. Tài liệu: docs/WORK_OVERVIEW_MOCKUP.md.

Trạng thái PROPOSED, chưa tích hợp game. Không chạy lại verify/E2E/balance/soak/profile của game hoặc rebuild/push/deploy. Bước tiếp theo: Khiêm review mockup; chỉ tích hợp sau khi chốt bố cục và Approve kế hoạch runtime riêng.


## UI-BUTTON-SPACING-010 — 2026-10-21 — sửa khoảng cách nút

Owner Approve rà và sửa sáu màn hình quản lý và các dialog. Đã tái hiện bằng browser: hành động giao hàng có rủi ro chạm nhóm nghiệm thu, Phân công hỗ trợ chạm Khảo sát khách hàng; text-button không có padding ngang. Sửa tại src/ui/Panels.tsx, BusinessPanels.tsx, style.css và src/app/App.tsx: dùng button-row/gap8px có flex-wrap cho giao hàng, hỗ trợ/khảo sát và hai overlay kết quả; text-button padding ngang12px. Giữ commands, confirmation, điều kiện khóa và copy.

Verified: npm run verify trước/sau PASS (46 unit tests/8 files, 3 QA harness, typecheck/lint/build); final typecheck/lint và scoped Prettier PASS. Edge155.0.4283.62 full27/27 E2E, zero skipped/flaky/unexpected, 125,23 giây trên production build cố định. Regression mới đo600 mẫu: 144 mẫu sáu màn hình qua ba mô hình kinh doanh, EN/VI, UI100/150, 1280×720/1920×1080; thêm320 lựa chọn inspector và136 mẫu dialog/overlay. Không chạm viền/tràn ngang trong các mẫu đã đo; nhóm action gap tối thiểu8px, controls gọn khác4px, dung sai0,5px. Kiểm confirmation/Escape/focus và save/overwrite; fixtures tổng hợp chỉ chứng minh UI.

Dev localhost:4183 cũng đạt4/4 spacing regressions trên context Edge cô lập, zero skipped/flaky/unexpected. 35 dist files giữ hash xuyên full E2E. 221 protected existing files giữ nguyên, chỉ bốn UI source files thay đổi; V4/T0.3/simulation/gameplay/store/renderer/audio/persistence và tests cũ giữ bytes. Đã giữ lỗi baseline và lỗi setup test đầu, không hạ assertion; bằng chứng lịch sử root được phục hồi, captures hiện tại tách trong full-suite-artifacts/. Chi tiết: docs/MANAGEMENT_UI_RUNTIME.md; regression tests/e2e/button-spacing.spec.ts; runner spacing.playwright.config.ts; receipt/ảnh/log tại evidence/ui-button-spacing/.

Owner visual acceptance và native Safari còn OPEN; chưa đo performance mới, warning bundle JS khoảng500kB còn. Không rebuild standalone/ZIP, balance/soak/profile, push/upload/deploy. Bước tiếp theo: Khiêm lưu campaign vào slot rồi review nút trong game4183 bằng đúng hostname đang chơi; tải lại nếu tab còn giao diện cũ. Đóng gói là task riêng cần kế hoạch/Approve.

## UI-RUNTIME-INTEGRATION-009 — 2026-10-21 — tích hợp game thật

Owner đã duyệt kế hoạch đưa bộ thiết kế sáu màn hình vào runtime. Đã triển khai React tại src/ui/: DecisionBoard/NextMove, danh sách và chi tiết hợp đồng/tính năng/nhân viên/phân khúc/hóa đơn/chính sách/sự kiện, hướng dẫn bước tiếp theo, điều kiện khóa rõ ràng, VI/EN và bố cục UI100/150. Commands và confirmation nghiệp vụ giữ nguyên. Chọn xem không thay campaign hoặc tiêu lượt CEO. Tài liệu: docs/MANAGEMENT_UI_RUNTIME.md; evidence: evidence/ui-runtime-integration/.

Kiểm chứng cuối: Edge 155.0.4283.62 đạt 23/23 E2E, zero skipped/flaky/unexpected trên production build cố định; toàn bộ dist được đối chiếu trước/sau. Ma trận 48 tổ hợp quản lý và 8 tổ hợp roster đạt VI/EN, UI100/150, 1280×720/1920×1080, không tràn ngang; cột danh sách lấp đúng grid, sampled axe zero violations. Dev 4183 được kiểm và chụp cả sáu màn hình bằng context cô lập, zero console/page errors. Npm verify trước/sau đạt 46 unit tests/8 files + 3 QA harness, typecheck/lint/build. Các lỗi đầu được giữ nguyên, không hạ assertions hai người khởi đầu, ít nhất năm hàng ở 1080p, focus, tiền hoặc invariants của save.

Game dev hiện chạy tại http://127.0.0.1:4183/ (Node24, npm run dev -- --port 4183 --strictPort); cổng 4173 dùng production preview cho QA. Giữ đúng hostname đang chơi: localhost và 127.0.0.1 không dùng chung storage. Lưu vào slot trước khi tải lại tab cũ. Prototype 4191, standalone và ZIP cũ chưa đại diện cho bản tích hợp này.

T0.3, simulation/gameplay/content/store/renderer/audio/persistence, public/art-source, package files và mockup giữ nguyên theo manifest. Browser test dùng context riêng. Vite còn warning bundle JS khoảng 500 kB; build đạt, chưa đo lại performance. Owner visual acceptance, native Safari đầy đủ, novice/screen-reader/audio human gates còn OPEN. Không chạy lại balance/soak/profile, không rebuild standalone/ZIP, push/upload/deploy. Bước tiếp theo: Khiêm review sáu màn hình trên campaign đang chơi; đóng gói là task riêng cần kế hoạch/Approve.


## DEV-ENTRY-SCAN-008 — 2026-10-21 — lỗi quét dependency đã sửa LOCAL

Owner OK kế hoạch giới hạn optimizeDeps.entries tại index.html. Đã thêm một cấu hình trong vite.config.ts; không sửa các HTML chẩn đoán Safari hoặc mockup. Nguyên nhân: discovery mặc định quét evidence/native-safari-probe.html có tham chiếu probe.mjs không tồn tại đúng tên.

Verified: npm run verify trước/sau PASS (typecheck/lint, 46 tests/8 files, 3 QA harness, build). Cold start cache riêng trên LOCAL 4184 tái hiện scan failure trước sửa; sau sửa optimizer hoàn tất với react/react-dom/client/zod và không có scan error/warning. Raw log là tiêu chí đối chiếu vì Vite có thể ghi scan error nhưng vẫn tạo metadata cho dependencies được plugin include. Diagnostic logger cuối bắt cả error và warning; giữ log ban đầu, gồm lần sandbox chặn listen EPERM. Cổng 4184 đã tự đóng.

Game dev đang chạy tại http://127.0.0.1:4183/ qua npm run dev -- --port 4183 --strictPort --force; Node24/Vite7.3.7. Edge menu/Canvas/@vite/client tải được, zero console errors; IAB menu VI được mở. Không tạo công ty mới hoặc sửa save. 224 tệp source/art/mockup/package/standalone/probe giữ hash; dist sau sửa khớp bản build baseline trước sửa. Evidence/receipt: evidence/vite-entry-scan/. Chỉ smoke startup/menu, không full gameplay E2E/Safari/balance/soak; không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: owner mở game 4183 để tiếp tục; những gate UI mockup/human trước đó vẫn OPEN.


## UI-MANAGEMENT-MOCKUP-007 — 2026-10-21 — chờ duyệt thiết kế

Owner Approve kế hoạch mở rộng mockup Công việc sang năm màn hình Nhân sự, Thị trường, Tài chính, Chiến lược, Nhật ký. Đã dựng prototype VI với theme/components dùng chung, ba tình huống/màn hình và các biến thể rỗng/khóa. Navigation nối sáu màn hình; chỉ dữ liệu minh họa trong bộ nhớ thay đổi. Source game, T0.3, V4, save và build giữ nguyên theo manifest/receipt; không tích hợp vào ứng dụng.

Verified Edge: 88 tổ hợp layout (60 cơ bản + 12 biến thể + 16 hồi quy Công việc), không tràn ngang; 16 nhóm kiểm tra tương tác, chi phí/phản hồi, draft/navigation và Tab/Escape, dialog UI150 ở 1280×720. Console error log rỗng. Node syntax/Prettier/static links được kiểm riêng; không chạy lại verify/E2E/balance/soak/profile của game.

Mở http://127.0.0.1:4191/docs/mockups/management/index.html#people khi server LOCAL hiện có còn chạy, hoặc mở file HTML và giữ cả docs/mockups/. Theme tách tại docs/mockups/shared/theme.css; Work đổi navigation/theme refs, gameplay mẫu cũ giữ lại. Docs: docs/MANAGEMENT_UI_MOCKUP.md. Evidence: evidence/ui-management-mockup/. Owner visual acceptance, human playtest, EN, screen reader, Safari và runtime integration vẫn OPEN. Bước tiếp theo: owner review bộ sáu màn hình, chốt thiết kế rồi duyệt kế hoạch tích hợp riêng. Không push/upload/deploy hoặc tạo ZIP game.


## UI-WORK-MOCKUP-006 — 2026-10-21 — chờ duyệt thiết kế

Owner Approved bước dựng mockup LOCAL sau đề xuất thiết kế lại Công việc. Đã tạo docs/mockups/work/index.html độc lập, VI, ba tình huống chờ ký/thiếu QA/sẵn sàng giao; tình huống cuối có biến thể nghiệm thu hợp đồng và phát hành Product. Danh sách gọn + chi tiết dự án, hành động theo trạng thái, tiến độ/QA và đội ngũ cạnh nhau trên desktop rộng, dialog phân công và xác nhận, lọc hoàn tất, UI100/150. Không tích hợp vào game hoặc đổi luật/save/art.

Verified: Node syntax/format cho mockup; Edge 16 tổ hợp hai viewport/UI100-150/bốn biến thể không tràn ngang; các luồng ký-hủy/phân công/việc thứ hai/nghiệm thu/phát hành/lọc và Tab/Escape. Đã sửa lỗi focus vòng Tab của chính mockup; giữ evidence lỗi đầu. Source/build/art bảo vệ được đối chiếu hash; receipt và ảnh tại evidence/ui-work-mockup/. Không chạy lại verify/E2E/balance/soak game cho checkpoint thiết kế này.

Bản review: http://127.0.0.1:4191/docs/mockups/work/index.html (cần server LOCAL đang có), hoặc mở file HTML trực tiếp. Chi tiết/giới hạn: docs/WORK_UI_MOCKUP.md. Owner visual acceptance, playtest, EN, screen reader, native Safari và tích hợp runtime còn OPEN. Bước tiếp theo: owner review mockup; chỉ tích hợp sau khi duyệt thiết kế/phạm vi. Không push/upload/deploy hoặc đổi bản game hiện hành.


## CHARACTER-REDESIGN-V2 — 2026-10-21 — chờ duyệt mỹ thuật hai mẫu cơ sở

Owner từ chối model A–C cũ, đánh giá 0/10, rồi duyệt kế hoạch làm lại từ đầu trong Blender. Trạng thái mỹ thuật A–C: **REJECTED**. Không dùng các kiểm tra kỹ thuật của bản cũ làm kết quả nghiệm thu art.

V2 chỉ gồm một nam tóc ngắn và một nữ tóc bob, cùng quần dài, tư thế tĩnh. Nguồn Blender và hai GLB độc lập ở art-source/character-redesign-v2/; nguồn authoring/export/render/check ở scripts/character-redesign-v2/. Đã xuất rồi nhập lại GLB trong Blender để kiểm; không có rig hoặc animation. Gallery LOCAL: http://127.0.0.1:4191/art-source/character-redesign-v2/review.html. Tài liệu và giới hạn: docs/CHARACTER_REDESIGN_V2.md.

Hướng art/mỹ thuật: giữ mockup nam/nữ đã duyệt, bề mặt mượt, tránh khớp cầu và các phần người rời nhau; tỷ lệ đầu đã giảm để gần dáng trưởng thành hơn. Vẫn giữ hướng trang phục tiếp theo: nam quần dài/quần đùi; nữ chân váy dài/chân váy ngắn/quần dài, tóc ngắn/tóc dài. Chân váy riêng, không thay bằng đầm. Chưa nhân rộng các biến thể này trong V2.

Bộ review dùng render từ chính GLB nhập lại: trước/ngang/sau, cận mặt, clay, camera và tỷ lệ pixel game, 24 góc xoay model tĩnh. Đây là gallery ảnh có thanh kéo, không phải renderer 3D thời gian thực và không chứng minh deformation. Evidence/receipts của V2 tách ở evidence/character-redesign-v2/; source/public/dist/V4/generated/game tests/package/standalone và model/viewer/evidence A–C cũ được khóa 629 hash từ đầu lượt làm lại.

Kiểm chứng V2 cuối: export/reimport hai GLB PASS; đọc binary độc lập PASS (finite/index/normals, zero-area=0, origin/unit/ground); 13 ảnh và 24 góc xoay khớp hash GLB hiện tại, GIF 24 frames. Chrome gallery desktop 1440×1050/mobile 390×844 PASS: đổi góc, kéo/phát/dừng/reset, mở mockup, zoom pixel 267/534; zero page errors/failed requests/external requests. 629 tệp bảo vệ giữ nguyên hash. Receipt tổng: evidence/character-redesign-v2/final-receipt.json. Đây không phải pass mỹ thuật, deformation hoặc game acceptance.

**Điểm dừng: owner art acceptance OPEN.** Chưa rig, retopology diễn hoạt, tóc dài, quần đùi/chân váy, sprite pipeline, appearance mapping, game integration, performance hoặc release. Không push/upload/deploy; không đổi game hoặc cấu hình global. Đã đọc hướng dẫn character-design/3d-modeling và skill pipeline liên quan, không cài/đăng ký skill native mới. Blender 4.5.3 LTS chạy cô lập từ DMG chính thức trong /private/tmp, đã đối chiếu checksum/chữ ký.

Bước tiếp theo: Khiêm review hai mẫu cơ sở trong trang V2. Sau phản hồi mới trình kế hoạch hoàn thiện; không tự tiếp tục sản xuất toàn bộ biến thể hoặc thay art game.

## CHARACTER-REDESIGN-AC — bản ghi lịch sử, đã bị owner từ chối 0/10

Các trạng thái OPEN/PASS trong phần này là ghi nhận trước khi owner bác bỏ mỹ thuật; không phải trạng thái nghiệm thu hiện tại.

Owner duyệt mockup nam/nữ và kế hoạch A–C, yêu cầu dừng tại D; sau review mới trình kế hoạch hoàn thiện. Đã dựng tám GLB thử từ hai mẫu cơ sở, một bảng màu, 15 joints/four-weight skinning, sáu clip và corrective morph cho chân váy khi ngồi. Nguồn: scripts/character-review/; artifacts: art-source/character-redesign-ac/. Viewer WebGL2 chỉ phục vụ authoring LOCAL, không thay Canvas runtime của game.

Baseline npm run verify PASS: typecheck/lint, 46 tests/8 files, ba QA harness và build. GLB validator PASS tám model/240 pose lấy mẫu, gồm topology liên thông và bind/weights/normals; không phải collision hoặc art certification. Bộ ảnh/clip Chrome thật và receipt tại evidence/character-redesign-ac/final/; xem docs/CHARACTER_REDESIGN_AC.md cho phạm vi và giới hạn.

Model thật còn đơn giản hơn mockup ở khuôn mặt, tóc, bàn tay và trang phục; khoảng 30–34 nghìn triangles, chưa tối ưu shipping. Owner acceptance D OPEN. Chưa tích hợp appearanceId/avatar/save, chưa sản xuất năm vai trò/12 tracks, chưa profile/soak game mới. src/public/V4/generated cũ/dist và evidence cũ giữ hash khi kiểm; PLAY_SOFTWARE_CEO.html đổi trong phiên ngoài các writer của A–C, chưa xác định nguồn, đã giữ nguyên bytes hiện tại. Không tuyên bố toàn bộ baseline byte-identical.

Không push/upload/deploy hoặc cài dependency/global config. Bước tiếp theo: Khiêm review model thật, nêu điểm cần giữ/sửa; sau phản hồi mới trình kế hoạch tiếp theo, không tự tiếp tục E–H.


## UI-WALL-NAME-005 — 2026-10-21

Owner đã Approve: tường Văn phòng hiển thị tên công ty (`s.name`), phần tạo công ty xem trước tên đang nhập; menu/chưa có tên/rỗng/khoảng trắng dùng SOFTWARE CEO. Giữ vị trí, màu, font và transform biển V4. Chữ fit vùng 220 đơn vị world-space, giảm 19→12px rồi rút gọn bằng … nếu cần; tên đầy đủ trong state/save giữ nguyên. Cache nền theo dõi companyName để đổi tên ngay cả khi pause/load save, không reset camera.

Source: src/renderer/Office.tsx và hai nơi gọi Office trong src/app/App.tsx. Regression mới tests/e2e/company-wall-name.spec.ts quan sát Canvas fillText/metrics thật và so hash pixel; kiểm VI/EN, tên dài/Unicode, fallback, create/return-menu, load save trên cùng Canvas đang pause, hai office tiers, DPR2, zoom/pan/fit, 1280×720 và 1920×1080, UI150% sample. Docs PLAYER_GUIDE/UI_REDESIGN đã cập nhật.

Verify trước/sau PASS 46 unit tests/8 files + 3 QA harness/typecheck/lint/build; final typecheck/lint PASS sau sửa assertion Unicode. Chrome full E2E 21/21 (71.0s), WebKit wall regression 2/2 (4.8s), zero skipped/flaky/unexpected. Art QA read-only PASS 480 frames/60 GLB references; 174 protected files giữ bytes. Standalone offline/save/export/reload/import PASS, zero external requests/page errors. Bằng chứng lịch sử 712 files giữ nguyên; receipt và ảnh tại evidence/company-wall-name/.

Preview 127.0.0.1:4183 và PLAY_SOFTWARE_CEO.html đã cập nhật. Không đổi art assets, UI dark theme, core/luật/save, không chạy lại balance/soak/profile, không ZIP/push/upload/deploy. Owner visual acceptance và full native Safari còn OPEN. Bước tiếp theo: owner lưu tiến trình rồi tải lại preview để xem tên công ty trên tường.


## UI-IDE-DARK-004 — 2026-10-21

Owner đã Approve kế hoạch và đã triển khai toàn bộ lớp UI theo phong cách IDE dark mode: palette semantic tập trung, font monospace có sẵn trên hệ điều hành, title bar/tab viền xanh, control góc nhỏ, HUD/bảng/roster/dialog/inbox/tutorial/toast/outcome cùng theme. Canvas art V4 và T0.3 giữ nguyên. Cột hành động roster 225px giữ Assignments/Details cùng hàng; không giảm yêu cầu ít nhất 5 hàng tại 1920×1080. Standalone lấy theme-color từ index production để đồng bộ theme.

Verify trước/sau PASS: typecheck/lint, 46 unit tests/8 files + 3 QA harness, build. Chrome 156 full E2E 19/19 (64.6s); WebKit 26.0 UI regression 5/5 (40.3s). VI/EN, 1280×720 và 1920×1080, UI100/150%: quản lý 48 tổ hợp, roster 8, menu/setup/dialog 8, office 8. Mỗi target 60 lượt axe zero selected-rule violations; không chứng nhận WCAG hoặc human screen reader. Starting roster giữ hai hàng 92px. Lượt đầu có một lỗi EN roster làm chỉ thấy 4 hàng ở 1080p; đã sửa độ rộng cột, giữ logs/trace và assertions gốc.

174 protected files byte-identical; 35 dist files giữ nguyên hash qua final Chrome/WebKit. Standalone file:// Chrome offline/save/export/reload/import PASS, zero external requests/page errors; theme-color/CSS/monospace khớp dist. Bằng chứng lịch sử 428 files được giữ bytes; outputs mới tại evidence/ui-ide-dark/, receipt.json và preview.png. Source/decisions: src/ui/style.css, src/app/App.tsx, index.html, scripts/build-standalone.mjs, tests/e2e/ide-theme.spec.ts; docs/UI_REDESIGN.md và PLAYER_GUIDE đã cập nhật.

Preview 127.0.0.1:4183 và PLAY_SOFTWARE_CEO.html đã là bản IDE dark mới. Owner acceptance, human screen reader và native Safari đầy đủ còn OPEN. Không chạy lại balance/soak/profile, không ZIP/push/upload/deploy. Bước tiếp theo: owner lưu tiến trình rồi tải lại preview, thử các tab và Chi tiết nhân viên để nghiệm thu.


## UI-ROSTER-003 — 2026-10-21

Đã triển khai phương án owner duyệt: Đội ngũ dùng hàng gọn, các cột chung cho nhận diện/tình trạng/lương/phân công; hai nút Phân công/Chi tiết. Hàng thông thường 92px ở UI100%; hai người ban đầu và hành động hiển thị trọn ở 1280×720. Hộp Chi tiết chứa đặc điểm/hòa nhập/năng suất và thao tác lương/đào tạo/thôi việc. Giữ confirmation/command/cost; Tuyển dụng không đổi. Source: src/ui/EmployeeRoster.tsx, PeoplePanel, style.css; docs/UI_REDESIGN.md và PLAYER_GUIDE cập nhật.

Verify trước/sau PASS 46 tests/8 files + 3 QA harness/typecheck/lint/build. Chrome full E2E 17/17 (49.8s); Edge 2/2 (11.0s), WebKit 2/2 (6.2s) cho roster/dialog/actions/12 staff/tên dài/VI-EN/UI100-150%/hai viewport. Năm axe dialog samples mỗi browser zero selected-rule violations. Đã sửa vòng Tab và trả focus bằng nút mở thực tế, gồm sau khi thôi việc. Các failure logs giữ riêng; không giảm assertions. Standalone cập nhật và smoke offline/save/export/reload/import PASS.

171 protected files byte-identical; V4/T0.3/core/renderer giữ nguyên. Không soak/profile/balance/ZIP/push/deploy. Native Safari và human acceptance còn OPEN. Receipt: evidence/ui-roster-receipt.json; ảnh/browser receipts tách theo ui-roster-chrome/, ui-roster-edge/, ui-roster-webkit/. Bằng chứng E2E lịch sử giữ nguyên; outputs mới ở ui-roster-run/. Preview 127.0.0.1:4183 và PLAY_SOFTWARE_CEO.html đã là bản mới. Bước tiếp theo: owner lưu tiến trình rồi tải lại preview, xem Nhân sự → Chi tiết để nghiệm thu.


## UI-DEFAULT-002 — 2026-10-21

Theo yêu cầu mới của owner, bố cục quản lý thu gọn là mặc định duy nhất cho cả sáu màn hình. Đã bỏ nút Tập trung/Focus, state chuyển chế độ và CSS mode; dùng management-shell trực tiếp. Hướng dẫn vẫn có thể mở/thu gọn riêng. Quyết định này thay phần chọn mode của UI-REDESIGN-001 bên dưới.

Verify trước/sau PASS 46 tests/8 files + 3 QA harness, typecheck/lint/build. Chrome full E2E 15/15 PASS; WebKit regression 48 tổ hợp PASS, gồm không còn nút chế độ ở VI/EN và giữ mở/thu hướng dẫn. Standalone đã cập nhật và smoke offline/save/export/reload/import PASS. 171 protected files giữ nguyên; native Safari/human gates vẫn OPEN. Không ZIP/push/deploy. Evidence: evidence/ui-default-layout-receipt.json; preview 127.0.0.1:4183 và PLAY_SOFTWARE_CEO.html là bản mới. Bước tiếp theo: owner lưu tiến trình rồi tải lại preview để xem bố cục mặc định.


## UI-REDESIGN-001 — 2026-10-21

WebKit 26.0 regression cuối cũng PASS 48 tổ hợp + sáu axe samples; select/nút phân công đạt ít nhất 40px, HTML select style 44px. Chrome full E2E cuối 15/15, 46.8 giây. Đã cập nhật `PLAY_SOFTWARE_CEO.html` từ dist đã kiểm; smoke Chrome file:// offline/save/export/reload/import PASS, zero external requests/page errors. Receipt `evidence/ui-redesign-receipt.json`; browser receipts/ảnh tách tại `evidence/ui-redesign-chrome/` và `evidence/ui-redesign-webkit/`. ZIP CP6 giữ nguyên.

Đã thiết kế lại sáu màn hình quản lý theo yêu cầu owner: `ManagementPage`/`ManagementSection` với thanh chọn mục sticky, giữ draft khi đổi mục, Focus thu gọn HUD/hướng dẫn, card/bảng/chữ rõ hơn, Nhật ký có tìm kiếm/lọc. Văn phòng/V4/T0.3/command/save giữ nguyên. `docs/UI_REDESIGN.md` ghi quyết định, trade-off và evidence.

Verify trước/sau PASS 46 tests/8 files + 3 QA harness, typecheck/lint/build. Chrome 156 full E2E **15/15 PASS**; regression mới kiểm 48 tổ hợp VI/EN, UI 100/150%, 1280×720/1920×1080, sáu màn hình, zero overflow và six sampled axe scans zero violations. Focus ở 1280×720: 495px so với 434.25px khi tắt, tăng 60,75 px. 171 protected files byte-identical; không chạy lại balance/soak/profile cho thay đổi bố cục. Kết quả CP6 về hiệu năng không áp cho build UI mới.

Preview đúng game: `http://127.0.0.1:4183` (`npm run preview -- --port 4183 --strictPort`); port 4173 đang do ứng dụng khác sử dụng, giữ nguyên process. Evidence: `ui-redesign-verify.log`, `ui-redesign-e2e.log`, `ui-redesign-browser.json`, `ui-redesign-preservation.json`, ảnh `ui-redesign-*.png`; outputs E2E mới ở `evidence/ui-redesign-run/`, bytes evidence lịch sử đã giữ nguyên. Hai test locator failures giữ riêng, không coi là PASS.

Owner/human acceptance và native Safari đầy đủ còn OPEN. Không push/deploy/upload; chưa tạo ZIP mới. ZIP CP6 chưa chứa thiết kế UI mới; standalone hiện đã cập nhật và kiểm offline. Bước tiếp: owner thử Phân công/Tuyển dụng/Hóa đơn/Nhật ký trên preview; chỉ đóng gói bản mới nếu được yêu cầu.


## AGENT-SETUP-002 — 2026-10-21

Bộ hiện có tám skills. Dùng `$ceo-game-design` cho vòng lặp/lựa chọn/onboarding và design brief; `$ceo-game-audio` cho cue sheet/mix review/audio lifecycle. Đã thêm routing vào AGENTS.md; sáu skills cũ giữ nguyên. Đọc hai skill tương ứng trước khi dùng, không nạp cả bộ.

Đã verify cấu trúc 8/8, 48 refs; app-server discovery nhận đủ 8 repo/enabled, zero errors. Thực tế đã áp dụng qua `docs/GAME_DESIGN_SKILL_TRIAL.md` và `docs/GAME_AUDIO_SKILL_TRIAL.md`; chín ca self-review trong `evidence/agent-setup-002-scenarios.md`. Browser trial Chrome 156 cô lập PASS bảy nhóm checks, zero errors; production HTTP 35 files khớp dist. `evidence/agent-setup-002-runtime-trial.json` và `agent-setup-002-design-week.png` là bằng chứng mới.

Observations chưa sửa: cash.mp3 có asset nhưng chưa thấy caller src; tutorial ngày 7 có thể vẫn hướng dẫn observe khi đi bằng footer. Đã lập đề xuất/phiếu đo, không coi là lỗi đã xác nhận cần sửa ngay. Human novice/listening/fatigue và native Safari đầy đủ giữ OPEN. Visibility audio chỉ emulated; không kết luận native lifecycle.

Không sửa game/audio/V4/T0.3 hoặc global config; protected SHA256 275 app/art/build files và 12 skill files cũ không đổi. Không chạy lại npm verify/build/broad suites trong lượt setup này. Preview 4173 đã có sẵn, không đổi process; không ZIP mới/push/deploy. Receipt và hash cuối: `evidence/agent-setup-002-receipt.json`, `agent-setup-002-preservation.json`. UI picker/automatic model selection vẫn chưa được thử; runtime discovery đã kiểm trực tiếp.

## AGENT-SETUP-001 — 2026-10-21

Đọc `AGENTS.md` để chọn trong sáu skills project-local; chỉ nạp skill thuộc nhiệm vụ. `docs/AGENT_SETUP.md` ghi cấu trúc, validation, discovery và giới hạn. Ví dụ: `$ceo-balance-playtest` cho quan sát W5; `$ceo-save-recovery` cho save; `$ceo-local-qa-handoff` cho checkpoint.

Verify trước setup PASS 46/8 + 3 harness, typecheck/lint/build; 6/6 skills qua validator chính thức, 41 refs tồn tại. App-server `skills/list` với cwd dự án đã nhận 6 `repo`/enabled, zero errors; chưa chứng minh UI picker/automatic selection của cửa sổ hiện tại. Evidence: `agent-setup-validation.json`, `agent-setup-discovery.json`, `agent-setup-scenarios.md`, `agent-setup-preservation.json` trong evidence/.

Không sửa game/art/global config, không push/deploy hoặc tạo ZIP mới. Archive CP6 không chứa skills vừa thêm. Gates native/human phía dưới còn mở. PyYAML cho validator chỉ ở `/private/tmp/software-ceo-agent-validator` (có thể mất sau cleanup); dùng `PYTHONPATH` trỏ đó nếu còn, không mặc định đã cài global. Không cần validator/Python để chơi game.

## CP6 — 2026-10-21

Đọc PROJECT_STATE.md, RELEASE_CHECKLIST.md, TASKS.md, docs/BALANCE_REPORT.md và docs/LOCAL_CHECKPOINTS.md. Giữ art V4 và T0.3. Không làm lại kiến trúc/style. Bản chuyển không có Git metadata; diff đã đối chiếu với ZIP gốc.

## Chạy trên máy này

Dùng Node 24.19.0 đã kiểm chứng. Node mặc định 23.11 nằm ngoài dải hỗ trợ một số dev dependencies; `.nvmrc` chọn 24. Có thể dùng runtime đã có:

```bash
export PATH=/Users/khiemnguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
npm ci
npm run verify
npm run dev
```

Dev: http://127.0.0.1:5173. Production: `npm run preview`, http://127.0.0.1:4173. Đừng giả định tiến trình phiên trước còn chạy. PLAY_SOFTWARE_CEO.html đã test offline file:// trên Chrome 156.

Python hệ thống chưa có Pillow. Art QA đã PASS bằng Python bundled, chỉ đọc V4 và ghi evidence:

```bash
/Users/khiemnguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/check-assets.py
```

Không cần Python/VTK để chơi hoặc build web. `--update-metadata` chỉ dùng khi authoring art có chủ đích, không dùng trong gate build cố định.

## Gate đã đóng trên macOS

Verify 46 tests/8 files + 3 QA harness tests, typecheck/lint/build PASS. Chrome/Edge/Playwright Firefox/WebKit mỗi target 14/14 production E2E. Soak 30 phút 13 giây, 30 samples, zero errors; whole-dist/fixture hashes không đổi. Profile độc lập 60.05–60.09 Hz ở hai viewport, 12 nhân viên; 14 axe states zero selected-rule violations. Audio, standalone, CSP, clean build 35/35 SHA256 files và audit zero advisories PASS.

Final rebuild vẫn cùng hash với soak/profile: `31409388a652d40af262816e76470c46eae458d7980aa3fea99e02edf7132b32` (SHA256 của manifest dist, không phải ZIP). Hồ sơ cũ ghi 51 tests/8 files nhưng source nhận vào chỉ có 43/7; không báo khôi phục các tests chưa biết nguồn.

Không cần chạy lại 30 phút nếu chỉ đọc hồ sơ. Nếu sửa runtime/build, chọn regression tương ứng và chạy lại gate trên build mới, giữ build cố định trong lượt đo:

```bash
npm run build
npm run preview
# Terminal khác, chạy tuần tự:
CEO_BROWSER=chrome npm run test:soak
CEO_BROWSER=chrome npm run test:profile
```

Không chạy FPS profile đồng thời soak/balance/browser stress. Pose authored 8 fps, display clock và Canvas paints là hai phép đo khác nhau.

## Browser matrix và Safari còn thiếu

```bash
CEO_BASE_URL=http://127.0.0.1:4173 npm run test:e2e
CEO_BROWSER=msedge CEO_BASE_URL=http://127.0.0.1:4173 npm run test:e2e
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/software-ceo-playwright CEO_BROWSER=firefox CEO_BASE_URL=http://127.0.0.1:4173 npm run test:e2e
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/software-ceo-playwright CEO_BROWSER=webkit CEO_BASE_URL=http://127.0.0.1:4173 npm run test:e2e
```

Default macOS là Chrome channel. Giữ riêng e2e-results.json theo target trước lượt tiếp. Binaries tạm có thể cần `npx playwright install firefox webkit`; đã đo Firefox 142.0.1/WebKit 26.0 theo Playwright 1.56.1, không phải mọi phiên bản mới hơn. WebKit không thay native Safari. macOS WebKit dùng Option-Tab trong E2E, assertion focus không giảm.

Native Safari 26.6.2 đã smoke create/Canvas/day7/manual save/reload/Continue/native JSON import. Full matrix chưa xong: Allow remote automation chưa bật; download permission của site chưa được cấp; fixture campaign lớn chưa chọn được qua native chooser. Không tự bật quyền hoặc sửa file quarantine. Xem local-native-safari-smoke.json; cần owner thực hiện/cho phép phần native còn thiếu. Native background-tab có quan sát hẹp, chưa chứng nhận mọi OS lifecycle.

## Cân bằng và người chơi

`npm run test:balance`: 900 Retail, 892 thắng/900 sống. `npm run test:balance:markets`: 1200 Creator/Creative và Team/Education, 1200 thắng/sống. `npm run test:balance:policy`: 270 matched runs cùng quote/team/cadence. Zero invariant/rejected; chưa đổi thông số T0.3. Thực hiện docs/PLAYTEST_PROTOCOL.md với người thật trước khi chỉnh late-game pressure/difficulty. Phiếu chưa phải kết quả playtest.

## Đóng gói và quyền hạn

ZIP checkpoint hiện tại: `../checkpoints/Software_CEO_LOCAL_W5_2026-10-21.zip`, receipt CRC/SHA256 cạnh ZIP. Tạo checkpoint mới bằng tên mới:

```bash
npm run build:standalone
CEO_BROWSER=chrome node scripts/test-standalone.mjs
node scripts/repro-build.mjs
python3 scripts/package.py Software_CEO_Local_Next_Checkpoint.zip
```

Packager ghi vào `../checkpoints/`, ngoài root; chặn self-inclusion/overwrite, loại node_modules/caches/ZIP và kiểm required entries/CRC. `--output-dir /private/tmp` là lựa chọn tạm khi cần.

Tiếp tục LOCAL S0–W5 được phép; không hỏi lại cho sửa/test thường lệ. Giao tiếp tiếng Việt; không delegate coding. Không remote push, trả phí, hosted preview, Library upload, publication hoặc deploy khi chưa có quyền riêng. Cập nhật bốn hồ sơ sau mỗi checkpoint. Không hứa làm việc bất đồng bộ sau khi kết thúc phản hồi.
