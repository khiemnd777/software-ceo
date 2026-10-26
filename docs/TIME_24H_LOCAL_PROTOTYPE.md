# Mô phỏng LOCAL: thời gian 24h, hai ngày làm việc

Cập nhật: 2026-10-26, theo Approve lịch chuẩn09:00–12:00/13:00–18:00 và tăng ca18:00–20:00. Trạng thái: **OWNER APPROVED MOCKUP — 2026-10-26; GAME CHƯA TÍCH HỢP**. Khiêm đã Approve dựng mô phỏng LOCAL hai ngày để so sánh bình thường/tăng ca trước khi tích hợp. **Kế hoạch tích hợp đang chờ duyệt triển khai**, xem [TIME_24H_INTEGRATION_PLAN.md](TIME_24H_INTEGRATION_PLAN.md). Các mục chờ review dưới đây là checkpoint lịch sử; Approve mới nhất chốt bản mockup hiện hành.

## TIME-24H-WINDOW-LIGHT — 2026-10-26 — ánh nắng/trăng LOCAL chờ review

Owner đã review bản công tắc/màn hình và Approve riêng ánh sáng qua cửa sổ. Đã thêm windowLight.ts: vệt nắng ấm/trăng xanh bạc theo từng ô kính, có khoảng tối của thanh chia cửa; hướng/chiều dài/cường độ theo cùng cung thiên thể và weatherFrame với bầu trời. Góc thấp cho vệt dài, gần trưa ngắn; mây/mưa làm yếu ánh sáng. Công tắc không đổi nguồn sáng ngoài trời. Đây là ánh sáng 2D theo phong cách V4, chưa có mô hình thiên văn/chiếu sáng vật lý hoặc bóng đổ động của nội thất.

Floor được cache riêng, vệt sáng clip vào sàn và vẽ dưới nội thất/nhân vật/tường; vẫn theo camera khi pan/zoom. Chỉ screen-blend vùng có ánh sáng, cache căn phòng theo độ tối thực và clock15 thay vì mọi phút. Ánh sáng theo raw visualTime liên tục, Pause giữ vị trí; Giảm hiệu ứng bỏ viền mềm, không thêm chuyển động độc lập với giờ. Giữ monitor emission, clock15, model/art/save/game. Có mốc xem nhanh07:00 và12:00.

Verified: baseline20 → 23tests, build riêng30inputs, strict typecheck/lint/format PASS. Edge/CUA4bố cục1280/1920 ×UI100/150 không tràn/cắt controls; pan/zoom PASS. Pixel nắng07:00 AOFF: trời quang[221,215,200], nhiều mây[212,207,194], mưa gió[208,204,192]. Pixel trăng00:00 AOFF: quang[88,101,114], mưa gió[73,81,89]; pixel tủ che phía trước giữ[51,52,51]. Toggle đèn giữ sources/geometry. Bản cuối giữ đúng pixel trăng sau tối ưu. Console không warn/error.

Hai bản ghi6s: bình minh756khung và qua00:00 721khung, hai phòng cùng nguồn sáng; ánh sáng đổi trong lúc HUD giữ mốc15phút. Giảm hiệu ứng+Pause6s/721khung giữ rawminute/nguồn sáng/paint count. Hai smoke10s với Canvas hiển thị, bitmap1512×960/canvas, tách đọc pixel: nắng1196mẫu/mean8,36ms/p959ms/max58,4ms; hoàng hôn+mưa gió1191mẫu/mean8,40ms/p959,2ms/max25ms; không gap>100ms. Các lượt đọc pixel đồng thời chậm được giữ làm diagnostic, không dùng để kết luận hiệu năng trang review. Đây là display-rAF trên một host, không chứng nhận GPU/fullgame/thiết bị khác.

193snapshot model bằng bản trước;564file bảo vệ game/art/dist/clock/sky/switch/monitor giữSHA256. Evidence, before, logs, recordings, pixel, ảnh vàreceipt: `evidence/time-24h/window-light-2026-10-26/`. Fullgame verify/E2E/soak/balance/nativeSafariFirefox/hidden-tab mới/axe/human screen reader NOT_RUN. Owner visual acceptance OPEN. Không tích hợp game, push/upload/deploy.

Review http://127.0.0.1:4204/docs/mockups/time-24h/; tab00:00/AOFF/BON/Pause/120giây-ngày/1×. Reload09:00/cảhaiON. Bước tiếp theo khuyến nghị: Khiêm xem07:00/12:00/17:00/00:00, thử công tắc/thời tiết và phản hồi hoặc chốt hình ảnh. Tích hợp game cần kế hoạch và Approve riêng.

### Hình học và giới hạn của ánh sáng cửa sổ

`officeWindows()` dùng đúng các cửa tại x1/3,7/6,4 của phòng8×9. Hai pane tách tại thanh x+1 tới x+1,04, với kính z0,83–1,72 và sàn z0,13. Từ tiến trình cung trời, renderer suy ra độ dốc/hướng quy ước, chiếu góc kính xuống mặt sàn và clip polygon vào giới hạn phòng. Màu nắng nội suy liên tục; alpha lấy từ đúng thiên thể đang nhìn thấy, gồm suy giảm theo độ che mây. Không dùng RNG, vị trí mặt trời thực theo địa lý/mùa, chi phí điện hoặc luật WP mới.

Lớp sàn được tách khỏi foreground; screen blend chỉ áp dụng bounding rectangle của vệt sáng, sau đó foreground tường/bàn/ghế/nhân vật che ánh sáng. Chưa tô sáng mặt bàn hoặc nhân vật, chưa tạo bóng di chuyển của nội thất. Các bóng sprite hiện có giữ nguyên. Pause dừng rawtime nên vệt sáng đứng yên; monitor Working vẫn dùng nhịp UI riêng đã duyệt. Giảm hiệu ứng giữ nguồn sáng theo giờ và bỏ nét viền bổ sung, không đóng băng ngày/đêm khi thời gian đang chạy.

Harness `viewport.html?profile=1` bỏ getImageData và đo riêng khi Canvas hiển thị. `viewport.html` đọc pixel để QA. Hai loại lượt chạy được giữ tách biệt. Bộ ghi6s/đo10s tự dừng playback khi hết thời lượng, chỉ trong harness. Các crop screenshot lỗi được giữ ở capture-diagnostic/sun-viewport-clip; ảnh sun-0700/moon-0000 là screenshot toàn viewport đã xem lại.

## TIME-24H-WORKING-MONITORS — 2026-10-26 — mockup LOCAL chờ review

Khiêm báo công tắc đè lên Project và Approve sửa vị trí, thêm màn hình sáng/code–terminal khi đang làm việc. Công tắc chuyển sang bên trái đồng hồ, plate 24×32 worldpx tại y8,75; target tối thiểu 44px mở rộng về phía tường trống, không lấn clock/Project. Focus ring theo plate. Mỗi màn hình chỉ phát sáng khi người ở bàn có working=true; nghỉ trưa/bàn trống tối, không animate. Mặt kính dùng đúng anchor/skew của desk.png; mask theo thứ tự vật thể/nhân vật/ghế và UI để giữ che khuất. Không sửa art.

Hoạt ảnh code/terminal/cursor chạy bằng nhịp UI 8fps, tiếp tục khi Pause; không làm thời gian/công việc chạy. Giảm hiệu ứng giữ frame tĩnh; guard không tích thời gian khi document.hidden. Cache mask khi phòng thay đổi và chỉ tô lại tile màn hình khi code đổi, không vẽ lại nội thất theo nhịp này. Giữ clock15, trời/thời tiết liên tục và model riêng trong RAM; chưa tích hợp game.

Verified Node24: baseline18 → 20 tests, isolated build29inputs, strict typecheck/lint/format PASS. Edge/CUA: click Project hiện thông báo đúng và không toggle đèn; Tab/Space/Enter PASS; pan/zoom và mặt kính đi cùng camera. 09:00 hai màn hình đang làm sáng khi đèn OFF; 12:00 nghỉ trưa và20:00 nghỉ đều không có tile phát sáng; 18:30 A nghỉ/tối, B tăng ca/sáng dù cả hai OFF. Bốn bố cục1280×720/1920×1080 ×UI100/150 không tràn ngang/cắt controls, target≥44px. Bản ghi Pause6s/639khung giữ09:00, pixel màn hình thay đổi qua code/terminal; sau warmup worldPass giữ4, chỉ paints tăng. Giảm hiệu ứng6s/680khung giữ tick0/pixel/paint count. Console không warn/error.

193 snapshot business giống bản trước;560file bảo vệ (game/art/dist/model/sky/clock) giữ SHA256. Smoke display-rAF10,015s ở1920/UI100,Pause,2phòng/2màn hình hoạt ảnh:598mẫu,mean16,77ms,p9525,3ms,max67,1ms,23khung>33ms,không gap>100ms. Không coi smoke này là chứng nhận60FPS/fullgame/GPU. Fullgame verify/E2E/soak/balance, nhiều nhân viên/8appearances, native hidden-tab/Safari/Firefox, axe/human screen reader NOT_RUN.

Evidence/bản trước/log/pixel/recordings/ảnh/receipt: `evidence/time-24h/working-monitors-2026-10-26/`. Review http://127.0.0.1:4204/docs/mockups/time-24h/; tab18:30, cả haiOFF,Pause,120giây/ngày,1×. Reload mặc định09:00/cả haiON. Owner visual acceptance OPEN; không push/upload/deploy. Bước tiếp theo khuyến nghị: Khiêm xem công tắc và màn hình tăng ca ở18:30, phản hồi hoặc chốt mockup. Tích hợp game cần kế hoạch/Approve riêng.

### Chi tiết implementation của màn hình

`workingMonitors.ts` sở hữu tọa độ mặt kính và cache tile. Mặt kính bên trong sprite desk.png bắt đầu tại source(204,85), rộng59/cao35,5px, shear0,5; transform dùng cùng atlas anchor/scale/camera. Glass nghỉ được tô tối trước nhân vật. Lớp phát sáng composited sau ambient shade, nhưng destination-out mask giữ phần bị sprite/nhân vật/ghế/hardware/UI che. Vòng64frame luân phiên code/terminal, tăng dòng và nháy cursor; đây là hình ảnh, không thực thi command và không dùng RNG nghiệp vụ. Tile được cắt theo bitmap/DPR, cache mask và tái sử dụng canvas, giải phóng khi bàn không còn working hoặc unmount.

`wallSwitch.ts` giữ trạng thái đèn và quy tắc shade cũ; đổi vị trí/plate và geometry hit target. Test hình học tại zoom0,3/0,46/0,54/1/2,4 kiểm target chứa plate, tách Project và clock, ẩn ngoài khung. Nội dung công tắc bên dưới là checkpoint lịch sử trước sửa overlap; vị trí hiện hành theo mục này.

## Công tắc đèn trên tường — 2026-10-26

Khiêm đãreview/đồng ý clock15 và Approve dựng công tắc nhỏ bên phải đồng hồ, chỉmockupLOCAL. `wallSwitch.ts` vẽ plate36×48worldpx, x0,035/y5,35/z1,55 cùngbasis tường vớiclock, rockerI/O vàindicator. MỗiScenarioCard giữlightsOn riêng, mặc địnhtrue trongRAM; seek/replay giữ lựa chọn, reload trở lại bật. Không thêm luật chi phí điện/năng suất hoặc save/schema.

HTMLbutton không có nền thường trực, đặt đúng tâmplate theo camera; target tối thiểu44×44CSSpx và lớn theo plate khizoom cao, ẩn nếu cảtarget không nằm trongcanvas. Tab/Enter/Space,aria-pressed vàtitle Bật/Tắt hỗ trợ thao tác; focusring hai màu đọc được trên nền sáng/tối. Trong first visual check, CSS aria-pressed chung làmhit target thành ô xanh; đã sửa bằngselector riêng trước functional checks và bổ sungfocusring tương phản.

Khi bật, giữ phòng ấm như trước. Khi tắt, drawWallLamp bỏglow và đổifilament, lớpforeground dùngsource-atop để chỉ tô trên pixelphòng, không phủ nền trời. Độ tô tối0,18 ban ngày tới0,76 ban đêm theo nightpalette. Clock/công tắc vàUIoverlay vẽ sau shading để đọc được; Working vẫn dùng nhịpUI/cache riêng. `visualTime`, sky/rain/cloud source và displayClock không đổi. Đây là ánh sáng đồ họa trongmockup, chưa mô phỏng chiếu sáng vật lý/thời tiết lên nội thất hoặc tác động kinh tế.

Verified18tests (16cũ+2shade/hit target),build28inputs/typecheck/lint/format PASS. NativeEdge/CUA kiểmclick/kbd/independence/pause vàcamera: target44px theo pan/zoom; click sau move đúng; offscreenẩn vàFitkhôi phục. PixelAon[238,229,213],offday[197,192,181],offnight[66,73,77], Bgiữ nguyên khi chỉA đổi; cùngtime/skyframe/exterior; windowview vẫn nguyên ởprobe. Clockbright1226 giữ rõ.193snapshot model trùng,559file bảo vệ gồmgame/art/dist/model/sky/clock15 giữhash. Smoke10s1280×720/UI100,2phòng/1Dev,Aoff/Bon:325samples,mean30,91ms,p9550,1ms,max91,6ms,không gap>100ms. Đây làdisplay-rAF, không phảiPASS60FPS/fullgame/GPU; chưa cóbaseline đồng môi trường cho kết luận regression. Không lặpfullgame verify/E2E/FPS/soak/balance/nativeSafariFirefox/axe/human screen reader.

Bốn bố cục1280×720/1920×1080 ×UI100/150 PASS, không tràn/cắt controls, target tối thiểu44px. Finalfocus dùngoutline vàng+vòngngoài xanhđậm; nativeTab xác nhận đúngstyle. Console zero warning/error. Tab bàn giao00:00,AOFF/BON,Pause120giây/ngày1× để so sánh; reload mặc địnhON cảhai ở09:00.

Evidence `evidence/time-24h/wall-light-switch-2026-10-26/`: before,logs,unit tests,camera,keyboard,lighting-pixels,profile,ảnh ngày/đêm vàreceipt. Bước tiếp theo: owner review vị tríplate/độ tối vàchốt hoặcphản hồi; gameintegration cần kế hoạch/Approve riêng.

## Đồng hồ hiển thị theo bước 15 phút — 2026-10-26

Khiêm đã chấp nhận nền trống/bầu trời liên tục và Approve riêng đổi đồng hồ theo15phút/step, chỉmockupLOCAL. `displayClock.ts` lấy khoảng bước từ `RULES.stepMinutes`, làm tròn xuống trước khi gọi `timeLabel`. Chỉ thay readout:09:07→09:00,09:15→09:15,23:59→23:45,00:00→00:00. HUD/nhãn giờ/đồng hồ Canvas/accessible label cùng dùng hàm này. `visualTime`, rAF, sky palette/quỹ đạo/pha thời tiết vẫn liên tục; không đổi luật, dữ liệu mô phỏng hoặc renderer game. Phần HUD theo từng phút ở checkpoint trước được thay bằng quyết định mới này.

Verified:16tests (6model+3lighting+5weather+2displayClock), build27inputs/typecheck/lint/format PASS. Ba bản ghi6giây 1×banngày/2×quanửađêm/4×banngày có571khung; mọi nhãn clock cùng mốc15 và thiên thể vẫn đổi vị trí giữa các mốc. Probe pixel glyph giữ cùngsignature trong mỗi bước, đổi signature giữa các bước. Pause thủ công tại phút544,37 (~09:04) vẫn hiển thị09:00; snapshot DOM và actualSky giữ nguyên qua hai lần đọc;+15phút về09:15 khớp cảhai Canvas. Các boundary09:14,9999/09:15/23:59,9999/00:00/48h cóunit test.193snapshot business trước/sau bằng nhau;558file bảo vệ gồm outdoorWeather/sceneLighting/model/game/art/dist/style giữhash.

Source chính: `displayClock.ts`, `displayClock.test.ts`, `main.tsx`, `wallClock.ts`, accessible label trong`LitOffice.tsx`; QA recorder thêm wallClocks/canvasClocks/pixelClock. Evidence `evidence/time-24h/clock-step-15-2026-10-26/` gồm before,logs,recordings,summary,pause,ảnh09:00-held/09:15 vàreceipt. Không chạy lại fullgame verify/E2E/FPS/soak/balance/nativeSafariFirefox/axe/layout matrix. Không phát sinh bằng chứng mới để đóng các giới hạn hiệu năng đã nêu ở dưới. Game integration vẫn NOT_AUTHORIZED. Bước tiếp theo: tải lại mockup, Chạy từ09:00 để reviewclock15 và chốt/phản hồi.

## Nền trống và bầu trời chuyển động mượt — 2026-10-26

Khiêm không chấp nhận nền tầng trệt có sân và đã Approve kế hoạch đổi về nền trống, giữ bầu trời/nắng/trăng/sao/năm thời tiết, làm mượt ngày–đêm và quỹ đạo thiên thể. Đã bỏ sân/cỏ/đường/cây/nhà xa và callback cảnh mặt đất; `courtyard.ts` được lưu trong evidence bản trước rồi bỏ khỏi mockup. Nền ngoài văn phòng chỉ còn bầu trời gradient, mây, mặt trời/mặt trăng/sao và mưa. Đèn, cửa kính, nội thất và đồng hồ giữ lại; chưa tích hợp game.

Nguyên nhân bước nhảy đã xác minh: trước đó renderer lấy `frame.minute`, được làm tròn theo bước15phút game (1,25giây thực ở120giây/ngày/1×); sao và thiên thể bật/tắt tại mốc giờ, màu mây đổi nhánh ngày/đêm. Nay một `visualTime` chung trong RAM được cập nhật bằngrequestAnimationFrame; hai Canvas đọc cùng thời gian liên tục. React/HUD cập nhật theo phút game, luật/biểu đồ/chỉ số vẫn dùng timeline15phút hiện có. Đồng hồ tường lấy phút từ cùng nguồn. Pause đóng băng thời gian/pha; đổi nhịp/tốc độ giữ thời điểm; seek đặt trực tiếp mốc đã chọn; hidden dừng và không chạy bù. Native hidden-tab chưa kiểm lại.

Mặt trời đi theo cung5–19h, trăng17–07h, cùng hướng trái→phải; đây là quỹ đạo đồ họa theo giờ game, không mô phỏng thiên văn theo mùa/vị trí địa lý. Trăng/mặt trời tăng giảm alpha tại lúc mọc/lặn;52ngôi sao giữ vị trí và mờ/sáng theo độ tối. Màu mây, màu trời và sương đổi liên tục thay vì nhánh màu cứng. Mây/mưa cập nhật theo khung hình; giảm hiệu ứng giữ pha mây/mưa bằng0 nhưng ngày–đêm/đồng hồ vẫn theo giờ game. Có nút Xem bình minh05:00 và Xem hoàng hôn17:00 để review nhanh.

Bầu trời, lớp phòng tĩnh và lớp văn phòng có alpha được tách riêng. Khi chỉ bầu trời đổi, renderer ghép lại lớp văn phòng đã cache; chỉ dựng lại nội thất khi pose/đồng hồ/camera/selection/asset thay đổi. Nhờ đó bầu trời có thể đổi mỗi khung mà không vẽ lại toàn bộ nội thất mỗi khung. Kính/sàn kín và trật tự chiều sâu vẫn dùng bố cục V4 của mockup.

Verified: baseline12→14tests PASS (6model+3lighting+5weather), build riêng26inputs/typecheck/lint/format PASS.193snapshot nghiệp vụ giống bản trước;554file bảo vệ giữSHA256. Bản ghi qua bình minh/hoàng hôn/00:00 và1×/2×/4× xác nhận vị trí đổi giữa các bước15phút và hai phương án có cùng khung bầu trời. Bốn bố cục1280×720/1920×1080 ×UI100/150 không tràn ngang/cắt controls.

Evidence: `evidence/time-24h/smooth-sky-2026-10-25/` (bắt đầu25-10, hoàn thành26-10), gồm bản trước, source diff, hashes, unit logs, bản ghi chuyển động và pixel/ảnh. Lượt đo1920×1080/UI150 trước cache cómean29,86ms,p9551,7ms; sau cachemean17,30ms,p9518,7ms,578mẫu/10,01giây, còn7khung>33ms và2khoảng>100ms. Lượt đo ổn định sau khi tài nguyên đã tải:1920×1080/UI150,597mẫu,mean16,75ms,p9518,6ms,max35,3ms,2khung>33ms,không khoảng>100ms. Lượt đo1280×720/UI100 cuối:552mẫu,mean18,12ms,p9533,2ms,max52ms,32khung>33ms,không khoảng>100ms. Các phép đo mưa gió còn dao động, không kết luận60FPS hoặc chứng nhận GPU/fullgame. Lượt đo1280 đầu bị gián đoạn trong lúc đọc báo cáo AX lớn; đã giữ log và thu gọn phần hiển thị báo cáo QA trước khi đo lại. Native Safari/Firefox/fullgame verify/E2E/FPS/soak/balance/axe/human playtest NOT_RUN.

Đã chạy trọn48h ở24giây/ngày/4×: tự dừng tại2880phút, kết quả A2,63WP/E80/M75,3/$368 và B3,05WP/E55,2/M73,2/$488 như trước. Phát lại rồiPause đạt; pan/zoom/căn giữa đạt; Pause giữ actualSky và sky pixels, giảm hiệu ứng giữphase0. Ảnh thật gồm năm thời tiết,06:00,18:30,00:00 và camera; màu sàn mẫu trong từng cảnh ổn định qua ảnh. Tab bàn giao05:00, Nắng,120giây/ngày/1×,Pause; console zero warning/error.

Bước tiếp theo: Khiêm mở mockup LOCAL, bấm Xem bình minh hoặc Xem hoàng hôn rồi Chạy để review chuyển động; chốt hoặc phản hồi hình ảnh. Tích hợp game cần kế hoạch/Approve riêng.

## Tầng trệt có sân — 2026-10-25

Khiêm đã chấp nhận mây/nắng/trăng/sao và năm chế độ thời tiết, nhưng yêu cầu đổi cảnh nền vì văn phòng trông lơ lửng. Theo Approve phương án tầng trệt có sân, mockup bổ sung `courtyard.ts`: nền cỏ có dải cắt, sân lát nối sát móng, bậc xuống lối đi, vỉa hè/đường tiếp cận, bồn cây thấp, cây ngoài trời và nhà xa có cửa sổ. Cảnh nền gần dùng chính hàm isometric và camera văn phòng; mặt đất ở z=-0,15 tiếp xúc đáy móng, sàn phòng z=0,13. Bóng đổ thu sát chân công trình; không thêm chân trụ hoặc khoảng trống dưới sàn. Nội thất/camera projection V4 và dữ liệu game không thay đổi.

`outdoorWeather.ts` giữ logic thời tiết và bầu trời đã được chấp nhận; thay cảnh đồi/đường/cây dùng tọa độ màn hình bằng callback sân trong world coordinates, trước lớp mưa. Khi mưa, sân sẫm và có vệt phản sáng nhỏ; ban đêm sân/cây tối, đèn lối đi sáng. Mưa nằm ngoài phòng và nhìn qua kính. Camera fit chừa cả sân trước và khoảng trời; scene cao420px, desktop lớn480px để không phải thu văn phòng quá nhỏ. Đây là bố cục cắt mở để xem nội thất, chưa mô phỏng cửa ra vào hoặc nhân viên đi ngoài sân.

Verified: build riêng27inputs, strict typecheck/lint/format và12test model/lighting/weather PASS.193trạng thái mô phỏng giống trước, SHA256 timeline `b598857cce1f6224dff10d215d70d7b5ab6bd2165dc6253ef09295a35be1a7d8`;558file bảo vệ gồm source/art/dist/model/clock/lighting/main giữ nguyên. Browser Edge quaCUA đã xem năm thời tiết, ngày/đêm,pan/zoom,4bố cục1280×720/1920×1080 ×UI100/150; không tràn ngang/cắt controls. Sàn mẫu `[238,229,213,255]`, đèn `[255,241,189,255]`; sân/đất đổi theo mưa/đêm. Hai cảnh ở cùng camera có sky signatures giống nhau.

Smoke display-rAF10giây ở1920×1080/UI150, hai văn phòng trong mockup,mưa gió:507mẫu, mean19,72ms,p9541,6ms. Có khung chậm; không kết luận đạt60FPS. Đây không phải profile game12người/GPU; fullgame verify/E2E/FPS/soak/balance/nativeSafariFirefox/axe/human playtest NOT_RUN.

Evidence: `evidence/time-24h/ground-courtyard-2026-10-25/`, gồm bản trước, ảnh thực ngày/đêm/năm thời tiết,logs,hashes,replay,pixel/layout/camera vàprofile. Link review giữ http://127.0.0.1:4204/docs/mockups/time-24h/. Bản tầng trệt chờ owner visual acceptance; chưa tích hợp game. Bước tiếp theo: Khiêm review điểm tiếp đất, tỷ lệ sân và bố cục cảnh xa; tích hợp cần kế hoạch/Approve riêng.

## Cảnh ngoài trời và thời tiết — 2026-10-25

Khiêm Approve cảnh ngoài trời có mây/nắng/trăng/sao và năm chế độNắng/Nhiều mây/Mưa/Gió/Mưa gió. Đã tạo `outdoorWeather.ts` và tests riêng trong mockup. Bầu trời nhiều lớp có đồi, nhà xa, hàng cây, lối đi; mặt trời theo giờ ban ngày, trăng/sao ban đêm; mây che bầu trời, mưa nghiêng theo gió, cây lay. Chế độNắng đổi nhãn thànhTrời quang khi ban đêm. Đây là cảnh thời tiết giả lập do người xem chọn, không lấy dữ liệu thời tiết thật và không tạo tác động nghiệp vụ mới.

Canvas ngoài trời riêng nằm dưới lớp văn phòng được cache. Kính là vùng clip nhìn xuyên ra cùng cảnh, không vẽ lại toàn bầu trời trong từng ô cửa. Mưa chỉ nằm trên lớp ngoài trời. Lớp sàn kín bên dưới các tile che cả khe subpixel để thời tiết không lọt vào phòng. Đèn và đồng hồ giữ sáng. Chừa50px khoảng trời trong fit camera; scene340px, desktop lớn400px để đọc được môi trường.

Hai phương án nhận cùng preset và cùng pha chuyển động. Pha cosmetic cập nhật theo thời gian thực có giới hạn chỉ khiChạy, độc lập RNG/nghiệp vụ; tốc độ1×/2×/4× không nhân tốc độ rơi mưa. Seek đặt pha theo mốc phút, Phát lại đặt pha0; Pause/hidden giữ pha, giảm hiệu ứng dùng pha0 tĩnh. Ngày/đêm vẫn theo đồng hồ khi giảm hiệu ứng; có thể thay đổi theo bước15phút. Pha này chỉ ở RAM, chưa thêm vào save game. Sky cache cập nhật tối đa20Hz, lớp tĩnh chỉ dựng lại khi giờ/camera/asset thay đổi; không gọi business transition từ renderer.

Verified:12tests (6model+3lighting+3weather), build riêng/typecheck/lint/format PASS. Pixel thật của5preset khác nhau nhưng trùng nhau giữa hai phương án; sàn/đèn/chữ đồng hồ không đổi. Qua zoom/pan vẫn giữ mảng kính/đồng hồ;4bố cục1280/1920 ×UI100/150 không tràn/cắt controls. Pause giữ phase và sky hash; giảm hiệu ứng dùng pha0; đổi thời tiết không đổi phút hoặc business state.193snapshot simulation trước/sau bằng nhau;559file bảo vệ và model/wallClock/art/dist giữSHA256.

Đo smoke rAF10giây khi mưa gió chạy, viewport1280×720 với hai văn phòng/1Dev:589mẫu, mean16,98ms, p9518,3ms, document visible. Đây là callback display, không phải60FPS vẽ thời tiết hoặc profile game12người; phép đo diễn ra trước sửa cuối chỉ thêm underfloor tĩnh. Hiệu năng dài hạn/đa thiết bị vẫn chưa được chứng nhận.

Evidence hiện hành: `evidence/time-24h/outdoor-weather-2026-10-25/`: receipt/log, pixel/camera/layout, profile10s, floor-seal, replay, sáu ảnh và bản trước trong `before/`. Tab bàn giao09:00 ngày1, Nắng,120giây/ngày/1×, đangPause. Để xem mây/mưa/gió chuyển động, chọnThời tiết rồi bấmChạy; đổi preset tựPause để so sánh. Owner visual acceptance OPEN; chưa tích hợp game. Full game verify/E2E/soak/balance/native browsers/human playtest/axe không chạy lại; native hidden-tab vẫn giới hạn cũ.

## Đồng hồ treo tường — 2026-10-25

Khiêm Approve bổ sung đồng hồ số24h vào mockup để xem trước. `wallClock.ts` vẽ khung/mặt/chữHH:MM trực tiếp trên mảng tường trái phía trên sofa, trước lớp nội thất. Đồng hồ cùng mặt phẳng phối cảnh với tường và cùng camera; không phải HTML nổi trên cảnh. Đồng hồ lấy `lightingMinute` thực của mô phỏng, độc lập giờ máy, animation và lựa chọn giảm hiệu ứng. Mặt tối/chữ ấm giữ độ tương phản cả ban ngày và đêm. Canvas có accessible label chứa giờ; HUD/nhãn giờ sẵn có tiếp tục là đường đọc HTML.

Verified:9test model/lighting hiện có tiếp tục đạt, build/typecheck/lint/format PASS; không thêm unit test mô phỏng lời gọi Canvas. Kiểm browser thật: pixel chữ số khác nhau ở09/18/20/00; Pause giữ signature vùng chữ; HUD/hai đồng hồ/nhãn accessibility cùng09:15; giảm hiệu ứng vẫn hiển thị09:30; Chạy4× chuyển giờ rồi dừng đúng trạng thái; pan/zoom/min zoom0.3 (font12px),4bố cục1280/1920 × UI100/150 đạt. Toàn bộ193snapshot simulation trước/sau trùng nhau.560file bảo vệ (game/art/dist/model/lighting và tests tương ứng) giữSHA256.

Evidence mới: `evidence/time-24h/wall-clock-2026-10-25/`; có bản mockup trước sửa trong `before/`, receipt/log, pixel/clock region, camera/layout, ảnh đầy đủ và ảnh cắt có ngữ cảnh `wall-clock-preview.png`. Tab bàn giao20:00 ngày1 đang Pause ở120giây/ngày,1×. LOCAL visual acceptance OPEN; chưa tích hợp game. Full game verify/E2E/FPS/soak/native browsers/human screen reader/axe không chạy lại; gate hidden-tab cũ vẫn SOURCE_REVIEW_ONLY.

## Cập nhật ánh sáng — 2026-10-25

Khiêm đã xem và đồng ý cơ chế thời gian/lịch làm trong mockup, sau đó Approve sửa ánh sáng: ngày–đêm thuộc không gian bên ngoài và cửa sổ; trong phòng có đèn sáng. Kết quả hình ảnh mới chờ owner review; chưa có quyền tích hợp game.

- Renderer riêng `docs/mockups/time-24h/LitOffice.tsx` giữ projection/art/nhân vật và tương tác từ bản game tại thời điểm fork; nguồn và SHA256 trong `evidence/time-24h/lighting-2026-10-25/renderer-origin.json`. Không sửa renderer ứng dụng.
- `sceneLighting.ts` dùng một palette cho nền ngoài trời và kính cửa sổ. Kính được clip/map trong tọa độ thế giới nên đi cùng tường khi pan/zoom. Khung cửa cuối được giới hạn vào mép tường trong mockup.
- Bốn đèn tường sáng ấm liên tục; không thêm tiền điện, policy đèn hoặc quy tắc nghiệp vụ. Ánh sáng tự nhiên chỉ ảnh hưởng nhẹ vùng sát cửa sổ. Bỏ hoàn toàn hai lớp phủ tối/ấm toàn cảnh.
- Có nút xem nhanh00:00/09:00 cùng mốc18:00/20:00. Bàn giao cảnh20:00 ngày1 đang pause để xem sự khác nhau ngoài trời/trong phòng.
- Verified:9tests (6mô hình+3palette), build/typecheck/lint/format;4bố cục desktop/UI; pixel thật tại09/18/20/00 và sau zoom/pan; toàn bộ193snapshot business giống trước. Điểm sàn `[238,229,213]`, đèn `[255,241,189]` giữ nguyên qua bốn giờ; kính và nền tối xuống ban đêm. Đây là các điểm đo đại diện, không phải chứng minh mọi pixel nội thất bất biến.
- Trong lúc làm có6file ngoài scope thay đổi song song (renderer/overlay/testE2E/dist). Task này không ghi các file đó; giữ nguyên thay đổi quan sát được và build/kiểm lại mockup với dependency hiện có.552/558file bảo vệ không đổi; model và test model giữ SHA256. Không tuyên bố toàn bộ game/dist bất biến. Chi tiết: `concurrent-changes.json`.

Evidence hiện hành: `evidence/time-24h/lighting-2026-10-25/` có receipt, hash input/build, ảnh bốn giờ, pixel/camera/layout, replay và bản mockup trước sửa trong `before/`. Receipt của các checkpoint trước giữ làm lịch sử. Full game verify/E2E, FPS/soak, native browser và human playtest không chạy lại; tự pause khi ẩn tab vẫn chỉ SOURCE_REVIEW_ONLY.

## Mục tiêu và cách xem

Mở <http://127.0.0.1:4204/docs/mockups/time-24h/>. Khi reload, bản thử mở tại09:00 ngày1, tạm dừng, sau chín giờ nghỉ giống nhau từ trạng thái 00:00. Hai phương án dùng một đồng hồ và một nhân viên mẫu có cùng skill, dự án và trạng thái ban đầu. Chỉ B làm thêm 18:00–20:00 cả hai ngày.

- Chạy/Tạm dừng; Phát lại từ 00:00 ngày 1; Trước/Tiếp qua mốc ca; +15 phút; thanh thời gian cho toàn bộ 48 giờ.
- Các mốc nhanh: 18:00 ngày 1, 20:00 ngày 1, 09:00 ngày 2, kết thúc hai ngày.
- Nhịp x1 có 24/60/120 giây/ngày; mặc định120. Tốc độ1×/2×/4× chỉ thay đổi nhịp phát, không thay đổi mô hình.
- Hai cảnh Canvas dùng art V4/G–H sẵn có; nhân viên chỉ xuất hiện khi làm hoặc nghỉ trưa. Ánh sáng bình minh/ngày/hoàng hôn/đêm đọc cùng phút mô phỏng với trạng thái làm/nghỉ. Giảm hiệu ứng giữ ánh sáng ổn định và dừng chuyển động nhân vật, không đổi kết quả.
- Tiến độ, năng lượng, tinh thần, chi phí và giờ đã làm cập nhật mỗi15phút game. Biểu đồ có bốn chỉ số, hai đường so sánh và bảng dữ liệu HTML tại các mốc đã đi qua.
- Khi ẩn tab, mô phỏng tự pause; trở lại không chạy bù. Reload đặt lại dữ liệu RAM, không phục hồi từ storage.

## Mô hình thử — Proposed

Nguồn: `docs/mockups/time-24h/model.ts`. Đây là mô hình riêng, **không thay luật hoặc balance T0.3 của game**. Hai ngày liên tiếp là ngày làm việc, chưa mô phỏng tuần/ngày nghỉ đầy đủ.

| Tham số | Giá trị thử |
|---|---|
| Nhân viên | 1 Dev mẫu, skill3, một assignment; Energy80, Morale75 lúc00:00 ngày1 |
| Dự án | 4 WP; chưa có QA/deadline/doanh thu trong phép so sánh |
| Ca chuẩn | 09–12h và13–18h; nghỉ trưa12–13h |
| Tăng ca | Chỉ B:18–20h mỗi ngày |
| WP/giờ chuẩn | `6 × (0.7+0.12×skill) × (0.8+0.004×morale) × (0.65+0.0035×energy) / 40` |
| Chuẩn hóa WP | Giữ tham chiếu6WP/tuần; thử quy đổi40giờ/tuần, chưa nghiệm thu balance dài hạn |
| WP tăng ca | WP/giờ chuẩn ×0.8; không nhân thêm hệ số overtime1.2 hiện hành |
| Energy/giờ | Chuẩn−2.5, tăng ca−5, trưa+2, ngoài giờ+1.2 |
| Morale/giờ | Tăng ca−0.5, trưa+0.05, nghỉ trong khung17–22h+0.03, chỉ khi đã tan ca; nghỉ đêm không reset Morale |
| Lương tích lũy | Chuẩn$20/giờ; tăng ca$30/giờ; dữ liệu mẫu, không phải benchmark |
| Vận hành | $1/giờ theo toàn bộ24h; vẫn phát sinh trong giờ nghỉ |

Lịch chuẩn mới vẫn có tám giờ làm: ba giờ buổi sáng, năm giờ buổi chiều. Giữ nguyên hệ số hồi sức, lương và khung hồi Morale17–22h; thời gian17–18h nay là giờ làm nên không được cộng hồi Morale. Các kết quả đã tính lại, không giữ số cũ bằng cách đổi hệ số. Ánh sáng vẫn theo giờ trong ngày, không dịch bình minh/hoàng hôn theo ca.

Core tính tiến độ từ Energy/Morale **đầu bước**, sau đó cập nhật sức khỏe/chi phí. Chỉ giờ làm tạo WP. Không reset chỉ số lúc nửa đêm. Tiền tính bằng USD cents nguyên; chi phí tích lũy **không phải cash đã trả**. Không có business RNG trong prototype. Cùng mốc phút luôn cho cùng trạng thái; tua lùi đọc lại timeline xác định, không mutate hoặc cộng lặp.

## Kết quả mô hình — Verified trong phạm vi prototype

| Thời điểm | Bình thường | Tăng ca |
|---|---:|---:|
| Energy lúc09:00 ngày2 | 90.8 | 78.4 |
| Morale lúc09:00 ngày2 | 75.17 | 74.11 |
| WP/giờ chuẩn lúc09:00 ngày2 | khoảng0.169 | khoảng0.161 |
| WP sau48h | khoảng2.63 | khoảng3.05 |
| Energy sau48h | 80.0 | 55.2 |
| Morale sau48h | 75.34 | 73.22 |
| Lương tích lũy sau48h | $320 | $440 |
| Vận hành sau48h | $48 | $48 |
| Tổng chi phí sau48h | $368 | $488 |

Đây là hậu quả của các tham số thử đã công khai, không phải bằng chứng tham số đã cân bằng hoặc có người chơi chấp thuận. Không có cơ chế burnout/nghỉ việc/rủi ro lỗi/tài chính tháng được thêm vào game.

Bằng chứng lần đầu giữ tại `evidence/time-24h/`. Bản trước đổi lịch được sao lưu vào `evidence/time-24h/schedule-2026-10-25/before/`; receipt/log/ảnh của lần đổi lịch thuộc thư mục cha của bản sao lưu này. Các checkpoint2026-10-24 trong bốn hồ sơ là lịch sử, không phải lịch hiện hành.

## Phạm vi và kiểm chứng

Files mới chỉ ở `docs/mockups/time-24h/`, tài liệu này và `evidence/time-24h/schedule-2026-10-25/`; cập nhật bốn hồ sơ checkpoint. Task chỉ ghi mockup/tài liệu/evidence; không sửa source game, art, dependency, schema, slot, cổng game4183 hoặc mockup khác. Có thay đổi game/dist song song được ghi riêng ở mục cập nhật ánh sáng. Server read-only chỉ bind127.0.0.1:4204, allowlist30route, CSP chặn network của script và không có endpoint ghi. Bundle chỉ dùng renderer/appearance metadata từ game; không import bootstrap/store, transitions, gameplay hoặc persistence. Static `content/catalog.ts` được renderer dùng để resolve ngoại hình.

Node24: `/Users/khiemnguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.

```sh
node docs/mockups/time-24h/build.mjs
node --import tsx --test docs/mockups/time-24h/model.test.ts docs/mockups/time-24h/sceneLighting.test.ts
node node_modules/typescript/bin/tsc --noEmit --strict --target ES2022 --lib ES2022,DOM,DOM.Iterable --module ESNext --moduleResolution Bundler --jsx react-jsx --skipLibCheck --allowImportingTsExtensions --resolveJsonModule --types vite/client,node docs/mockups/time-24h/main.tsx docs/mockups/time-24h/model.ts docs/mockups/time-24h/model.test.ts docs/mockups/time-24h/sceneLighting.test.ts
node node_modules/eslint/bin/eslint.js docs/mockups/time-24h/main.tsx docs/mockups/time-24h/LitOffice.tsx docs/mockups/time-24h/sceneLighting.ts docs/mockups/time-24h/sceneLighting.test.ts docs/mockups/time-24h/model.ts docs/mockups/time-24h/model.test.ts docs/mockups/time-24h/build.mjs docs/mockups/time-24h/viewport.js --max-warnings=0
python3 docs/mockups/time-24h/serve.py
```

Đã đạt build riêng, strict typecheck, lint và6test mô hình: ranh giới ca/trưa/tăng ca; đầu vào giống nhau và replay xác định; không tạo việc/lương lúc nghỉ; hậu quả qua đêm; đối soát giờ/tiền/48h; đồng hồ và ánh sáng chu kỳ. Browser Edge thật qua CUA: bố cục1280×720/1920×1080 × UI100/150 không tràn ngang/cắt controls. Regression2026-10-25 kiểm ca sáng3giờ/chiều5giờ,17:45 còn làm chuẩn,18:00 tan ca/tăng ca,20:00 nghỉ và09:00 ngày2. Phát trọn48h ở2×/4× được đối chiếu với trạng thái cuối mô hình. Chi tiết ở receipt của lần đổi lịch.

Diện tích viewport được kiểm bằng iframe same-origin với kích thước nội tại thật; ảnh chụp cửa sổ chính ở1466×790. Snapshot DOM không thay bằng chứng Canvas: ảnh thực ngày/hoàng hôn/đêm đã chụp và xem; lần sửa ánh sáng có thêm đo pixel trong harness same-origin. Không tuyên bố đã đo FPS mới hoặc đã chạy mọi browser.

Diagnostics được giữ: build guard đầu tiên từ chối cả appearance catalog tĩnh của Office; đã giới hạn lại để cho phép đúng catalog đó, vẫn cấm transitions/storage. Sandbox ban đầu không cho bind loopback; server đã chạy với quyền cục bộ được duyệt. Một số probe CUA không hỗ trợ Canvas API trong DOM read-only và chờ selector quá thời hạn; chuyển sang ảnh thực và đọc trạng thái sau khi phát xong, không thay assertion để báo PASS.

**NOT_RUN:** full game verify/E2E, balance suite, soak/FPS, native Safari/Firefox, axe và human screen reader/playtest. Source ứng dụng không đổi nên không rebuild game. **OPEN:** owner visual/gameplay acceptance; cân bằng dài hạn; lịch tuần/ngày nghỉ, payroll tháng và migration clock khi tích hợp. Không đóng gói, push/upload/deploy.

## Bước tiếp theo

1. Khuyến nghị: Khiêm xem ngày1 lúc18–20h và sáng ngày2; phản hồi nhịp120giây, mức hụt sức/tinh thần và chi phí. Điều kiện: chỉ review LOCAL.
2. Sau khi chốt hoặc yêu cầu chỉnh prototype, trình kế hoạch tích hợp riêng; cần Approve mới trước khi sửa game/save/balance.
