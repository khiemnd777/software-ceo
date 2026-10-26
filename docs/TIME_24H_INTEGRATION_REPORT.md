# TIME-24H-INTEGRATION — báo cáo LOCAL

2026-10-26 · Owner đã duyệt D1–D8 và G0–G8 · T0.4 / save v3.

**Trạng thái:** đã tích hợp vào game thật, hoàn tất kiểm chứng tự động LOCAL và sẵn sàng owner review. Cờ balance và human acceptance vẫn OPEN; chưa phải bản phát hành. Preview riêng: http://127.0.0.1:4194/. Mockup cũ tại4204 và art được giữ nguyên.

## 1. Hành vi đã tích hợp

- Ngày1 bắt đầu00:00/Pause. Đồng hồ tường và HUD cùng mốc15 phút. Mỗi ngày96khoảng; trời, quỹ đạo nắng/trăng và vệt sáng cửa sổ dùng pha liên tục của cùng clock.
- Làm09–12 và13–18; nghỉ12–13; OT18–20 khi policy bật và còn việc. Ngoài giờ không tạoWP. Người ngoài giờ vẫn có trong roster/finder; vị trí ghế không bị dồn lại.
- Mọi task develop/QA/fix/refactor/research/growth/support dùng cùng nguồn eligibility. Chỉ phần việc thực tạo effort/XP/labor; caps và discovery được giữ. Defect/QA có budget theo ngày/employee/slot/kind, không reroll bằng đổi assignment.
- 224quarter chuẩn/tuần; OT rate0,8 trong56quarter bổ sung/tuần, cho +20% khi giữ các yếu tố cố định. Không nhân thêm OT1,2 vào actual work. Energy/morale phát sinh theo giờ và carry qua đêm; bỏ lần cộng/trừ health theo tuần.
- Lương base và OPEX phát sinh theo thời gian; premium chỉ lúc thực làmOT. Pending được hiển thị riêng, chưa trừ cash. Cuối tháng mới post/pay; giữ grace14ngày. Labor dự án là phân bổ, không trả thêm lần hai. Forecast tính phần ca còn lại, không đọc hidden actual scope.
- Nhịp mặc định60 giây/ngày ở1×; settings24/60/120, speed1/2/4. Pause/speed giữ phần lẻ; load/new/jump reset phần lẻ. Delta bất thường>1giây và hidden event làm Pause, không catch-up.
- Office thật có5 weather tự động theo seed/ngày bằng hash riêng, không tiêu RNG nghiệp vụ. Có công tắc vật lý bên trái clock; đèn phòng không che Project. Working monitors sáng khi tắt đèn, code/terminal8fps và gear tiếp tục khi Pause; reduced motion giữ tĩnh.
- Ánh nắng ấm/trăng xanh bạc theo ô cửa, clip vào sàn và ở dưới nội thất/nhân vật/ghế. Giữ V4/G–H; không thay engine hoặc thêm ground/city background. Đây là ánh sáng2D theo mẫu đã duyệt.

## 2. Calendar và public commands

| Điểm | Contract |
|---|---|
| Mở ngày | collectDue → eventsDay → productDay; opened bảo vệ chỉ chạy1 lần |
| Mỗi15 phút | eligibility → work → health → accrual |
| Đóng ngày | contracts/experiments → weekly → productMonth/payroll → warnings/insolvency/progression; ghi lastClosedDay rồi sang00:00 |
| Critical/outcome | Dừng batch tại đúng ranh giới; resume không lặp opening |
| +15 phút | advanceTime1 |
| Qua ngày | Số quarter còn lại đến00:00; ở00:00 tiến đủ96 |
| Đến giờ làm | Đến09:00, hoặc13:00 khi đang nghỉ trưa; nếu đã qua khung thì09:00 ngày sau |
| tick(days) | Adapter public tương thích, vẫn chạy cùng interval engine; không còn engine daily thứ hai |
| Quý | Cửa sổ đổi trọng tâm tính từ lastClosedDay90/180…; không mở sớm đầu ngày90 |
| Scene lights | Command riêng, không tốn lượt/cost/WP/RNG |

Chi tiết health/cents/RNG và các phương án loại bỏ: ADR-002_INTRADAY_CLOCK.md. Không thay các hệ số khác chỉ để tăng tỷ lệ bot thắng.

## 3. Save và dữ liệu cũ

Save v3 giữ clock, pending cents/carry, budget RNG/discovery và đèn phòng. Save giữa ca roundtrip/replay giống nhau; load luôn Pause.

v1→v2→v3: ngàyN đã đóng chuyển sang ngàyN+1/00:00, không gọi opening/work/RNG khi decode. Kỳ v2 đang dở giữ settlement cũ thêm đúng một kỳ; không dựng lịch sử accrual thiếu dữ liệu. Từ kỳ sau dùng rule mới.

Chỉ tải thì raw slot/file cũ vẫn nguyên. Lần ghi đè đầu giữ raw payload/revision gốc vào legacy-backups trong cùng IndexedDB transaction. Quota hoặc conflict hủy cả hai thao tác. Save dialog có “Xuất bản gốc”; browser test đã tải JSON gốc và so byte chính xác. Không migrate dữ liệu ở origin game cũ của người chơi trong phiên này; QA dùng origin4194/context riêng.

## 4. Kiểm chứng đã hoàn tất

Evidence root: evidence/time-24h/integration-2026-10-26/.

| Gate | Bằng chứng |
|---|---|
| Baseline trước sửa | baseline-verify.log PASS; frozen before/src/tests/scripts/dist; baseline900 seed và hashes |
| Type/lint/unit/QA harness/build | verify-handoff.log PASS:105 unit +3 harness; typecheck/lint/build PASS |
| Lịch/health/work/cost/replay | intraday, intraday-regression, app-clock: biên ca, neo thường/OT/Driven/Steady, +20%actualfrozen, cap/XP, no reroll, cents, hire giữa tháng,2/7/30/90ngày và save giữa ca;1080qua ba playbook |
| Persistence | v1/v2/v3/checksum/future/corrupt/revision/backup/quota; legacy byte export thật, manual slots/autosave/import/reload, stale two-tab và storage denial |
| Production E2E | e2e-final.json/log:46/46Edge PASS,3,7phút; các luồng cũ giữ assertions sau adapter calendar |
| Canvas/UI |5/12 nhân viên,8 appearances/poses/chair pixels/gear; VI/EN×2viewport×3scale; switch target≥44px; Project click không toggle; lunch/OT/offhours;5 weather; continuous sky/light trong held quarter; Pause/reduced-motion |
| Art | assets.log/art-validation.json PASS;8 models/1152 frames. 301 file public/art-source/mockup/fixtures giữ SHA; xem protected-file-check.json và receipt |
| Balance | final-balance/:900+1200+270lượt, zero invariant failures và zero rejected commands |
| Profile | profile-dpr1 và profile-dpr2;12 nhân viên/12 màn hình/mưa gió,1280×720 và1920×1080,2lặp mỗi viewport/DPR; không đọc pixel khi đo |
| Axe/audio |7ngữ cảnh/DPR, zero reported violations; music.currentTime tăng/readyState4 sau opt-in, mute dừng; không phải human accessibility/listening proof |
| Soak | soak/soak-30min.json PASS:30 phút 23,8 giây thực,30 mẫu, SHA đầu/cuối trùng,0 errors,1 document,292 listeners |

Hai sửa đáng chú ý từ kiểm hồi quy: mask seat-rim của ghế được giữ đúng baseline, cache badge có alpha không để viền đen; Escape ngoài panel không được đổi focus. Test giữ nguyên kiểm pixel ghế/near-leg và gear, chỉ bổ sung vùng code/terminal được phép đổi khi Pause.

Test ngày cũ chuyển sang ngày đang hiện hành/lastClosedDay; “Ngày tiếp” đổi “Qua ngày”; fixture render phải đi qua public command đến09:00. Golden T0.3 giữ nguyên để kiểm migration, không ép engine T0.4 có cùng future RNG. Bot ngừng cố hire khi văn phòng đầy và dùng QA tối thiểu1; không nới rule game để bot qua.

## 5. Đối chứng T0.3–T0.4

900 seed ghép theo strategy/difficulty/policy, baseline chạy lại từ before/source đã khóa. Toàn bộ900 summary cuối giống lượt T0.4 ban đầu sau sửa guard bot. Không cộng các lượt rerun vào số seed độc lập.

| Nhóm100 seed | MedianWP đổi | Medianexpense đổi | Thắng trước→sau | Sống trước→sau |
|---|---:|---:|---:|---:|
| Outsourcing Friendly |−4,97%|0%|97→94|100→100|
| Outsourcing Standard |−4,97%|0%|97→94|100→100|
| Outsourcing Tough |−5,06%|0%|98→90|100→100|
| Product Friendly |+0,61%|+2,20%|100→100|100→100|
| Product Standard |+0,02%|+1,79%|100→100|100→100|
| Product Tough |−0,18%|−0,13%|100→100|100→100|
| Startup Friendly |−0,18%|+0,54%|100→100|100→100|
| Startup Standard |−0,18%|+0,39%|100→100|100→100|
| Startup Tough |−0,66%|+1,88%|100→100|100→100|

**Cờ OPEN:** Outsourcing/Tough−8điểm phần trăm thắng, vượt ngưỡng5pp của kế hoạch. Trong10 seed chuyển từ thắng sang thua:8 seed thiếu2khách quay lại;2 seed còn margin<15% (41 và98). onTime của10 seed vẫn≥93,5%, reputation100; không phải mất khả năng trả lương. Đây là điều kiện thất bại đã xác minh. Suy luận: thay nhịp/RNG/lịch giao làm đổi chuỗi khách/thu nhập; chưa cô lập từng nguyên nhân bằng controlled ablation. Không tự chỉnh threshold hoặc RNG để xóa cờ.

1200 market runs vẫn1200/1200thắng/sống; điều này tiếp tục cho thấy bot có thông tin không thay độ khó người chơi.270 policy hoàn tất270/270 hợp đồng và cùng đóng ngày180; adapter kiểm bằng lastClosedDay, không dừng sớm ngày179. Bản run trước sửa horizon được giữ riêng; mean delivery muộn hơn khoảng1,1–1,37ngày lịch so T0.3, gồm thay quy ước day0→day1, không quy hết thành chậm thực. Mean labor giảm khoảng1,7–2,7%. Policy groups trong900là chiến thuật vận hành khác nhau; suite270mới giữ quote/team/rules cố định.

## 6. Hiệu năng, giới hạn và phần chưa xác minh

Profile Edge156.0.4314.42 headless macOS/arm64, sandbox bật; build/fixture giữ nguyên trong mỗi lượt.8 mẫu10 giây sau warmup4 giây: khoảng60,07–60,10 FPS, p9516,7–16,8 ms. Có12 màn hình vàweather rain-wind tại điểm ghi nhận. World passes được đo riêng với final canvas blits; không suy từ sốblit ra FPS. Sau40 lần đổi panel, post-GC JS heap giảm ở cảDPR; không bao gồm decoded image/GPU memory hoặc mọi loại leak.

Soak đủ30 phút 23,8 giây/30 mẫu: build SHA đầu/cuối trùng và trùng build hiện tại;0 errors,1 document,292 listeners. Từ mẫu5trở đi post-GC heap khoảng7,64–8,19 MiB. Nodes tăng nhẹ theo probe; chẩn đoán riêng120 lượt finder/panel giữ liveDOM 310 và listeners406 sau warm-up. Heap snapshot chỉ ra cây panel cuối bị Playwright InjectedScript/InspectorDOMAgent giữ. Control chuyển target sangCanvas rồiGC:1839→632 nodes,406→292 listeners,liveDOM 310. Các canvas/image off-DOM còn lại là cache Office đang sống; không gọi số detached roots là số component bị leak. Không suy thành bảo đảm không leak trên mọi thiết bị. Evidence memory/, memory-control/, retainer-paths.txt.

- Firefox/WebKit automation không khởi động được: Firefox thiếu libmozglue.dylib, WebKit thiếu pw_run.sh trong thư mục tạm. Giữ logs FAIL-launch, không gọi4 case/engine là app test đã chạy.
- Native hidden-tab chưa có bằng chứng: cả probe headless và CUA trả document.hidden=false. Emulated visibility và gap/sleep unit/E2E PASS; không đổi browser/OS permissions để vượt gate.
- Human pacing24/60/120, novice15 phút, campaign thật, screen reader và native Safari vẫn NOT_RUN.
- Bundle warning>500kB đã có trước thay đổi. Không nâng dependencies hoặc tắt gate để làm xanh.
- Security/standalone/accessibility-extra/challenge helper được cập nhật nhãn Qua ngày hoặc mốc lastClosedDay để dùng với build mới; không chạy lại những workflow xuất artifact này. Artifact standalone/ZIP cũ chưa chứa integration.
- Owner review game LOCAL và cờ balance vẫn OPEN. Không push/upload/deploy; không tạo ZIP mới hoặc khẳng định archive cũ đã chứa tích hợp này.

## 7. Files và ranh giới

Domain: simulation/clock,workStatus,health,accrual,engine,work,finance,selectors/types/create; gameplay/progression. Runtime: app/store/App; persistence/schema/saves/settings. UI: SimulateWorkspace,simulateModel,SaveManager,SettingsDialog,Panels,ContractDetail. Canvas: Office/officeOverlay và renderer/lighting/. QA: tests intraday/e2e/save, adapter fixture và scripts có option output riêng.

Runtime không import docs/mockups hoặc model A/B. Không tích hợp các seek/rewind/compare controls của mockup. Cùng một Office được giữ mounted khi đổi panel; phân công thủ công/tối đa2slot/draft không bị tự ghi lại.

Tab review đã giữ ở09:00/Pause,12 nhân viên/mưa gió/đènOFF; màn hình vẫn sáng. Đây là fixture public-command, không phải tiến trình người chơi. Ảnh native-review-09-office-off.png.

Bước tiếp theo: owner review game LOCAL và quyết định chấp nhận hoặc yêu cầu điều chỉnh có phạm vi; human playtest nhịp/balance là bước cần duyệt riêng. Remote release không thuộc gói này.
