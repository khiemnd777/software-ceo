# TIME-24H-INTEGRATION-PLAN-001 — Kế hoạch tích hợp toàn bộ mockup vào game

Ngày: 2026-10-26 · Bản: 1.1 · Phạm vi: game LOCAL.

**Trạng thái: OWNER ĐÃ DUYỆT D1–D8/G0–G8; ĐÃ TÍCH HỢP LOCAL, CHỜ REVIEW.** Các mục hiện trạng dưới đây ghi baseline trước implementation. Hành vi cuối, kiểm chứng, cờ balance và giới hạn được ghi trong [TIME_24H_INTEGRATION_REPORT.md](TIME_24H_INTEGRATION_REPORT.md). Không push/deploy. Human acceptance vẫn OPEN.

## 1. Kết luận

Đây là thay đổi xuyên suốt simulation, clock, finance, persistence, UI và Canvas. Không thể hoàn thành đúng yêu cầu bằng cách chỉ đưa bầu trời/đồng hồ vào renderer rồi giữ công việc chạy một lần mỗi ngày.

Khuyến nghị: tích hợp toàn bộ trải nghiệm đã duyệt; dùng một lịch nghiệp vụ 24h, chuyển trạng thái theo 15 phút; giữ neo năng lực/kinh tế T0.3 khi quy đổi và ghi thành balance T0.4 sau khi được duyệt. Giữ mô hình thử làm tài liệu đối chiếu, không import model giả hoặc UI so sánh hai phương án vào game thật.

## 2. Baseline trước tích hợp, đã xác minh từ source

| Thành phần | Hiện trạng | Hệ quả khi tích hợp |
|---|---|---|
| App clock | `src/app/store.ts`: đủ 5.000ms × speed thì dispatch một tick ngày; đổi speed/restore xóa accumulator | Cần bước 15 phút, giữ phần thời gian đang chạy khi Pause/đổi speed |
| App lifecycle | `src/app/App.tsx`: timer100ms, hidden tự Pause, autosave dựa s.day chia hết7 | Cần tách nhịp mô phỏng/đồ họa; autosave sau đóng tuần, không tự lưu nhầm đầu ngày7 |
| Daily engine | `src/simulation/engine.ts`: tăng day; collect/events/product/work/contracts/experiments; weekly/monthly; insolvency/progression | Phải chia mở ngày, khoảng làm việc, đóng ngày; mỗi hook chạy đúng một lần |
| Năng lực | `work.ts`: capacity là WP/tuần; runWork chia7 và số assignments; capacity đã nhân OT1,2 | Không được vừa giữ ×1,2 vừa cộng2h OT; /40 giờ trong mockup không tương thích7 ngày làm hiện tại |
| Tác động công việc | Develop/QA/fix/refactor/research/growth/support có caps, RNG, XP, effort và labor riêng | Chia nhỏ tiến độ phải giữ đúng các tác động, không chỉ tăng w.done |
| Sức khỏe | Weekly: thường E+10, OT E−12 (Driven−15), Steady thường+12; morale có điều kiện | Chuyển sang giờ phải bỏ phần cộng/trừ trùng ở weekly |
| Payroll/chi phí | finance.ts tính salary/month, OT×1,2 theo policy tại kỳ chốt; lương/OPEX ghi theo tháng; grace14ngày | Cần ghi nhận thời lượng OT thực, tách phát sinh với cash đã trả và có phương án kỳ dở của save cũ |
| Forecast | selectors.ts dùng capacity/tuần, dự báo số ngày và labor/chi phí theo ngày | Cần xét ca còn lại, giờ OT, pending cost; không đọc actual scope khi chưa discovery |
| People projection | simulateModel.officePeople dựa assignment runnable, chưa có giờ/presence | Cần nguồn trạng thái dùng chung cho work, presence, gear và monitor |
| Save | State/schema/envelope v2; checksum trước migration v1→v2; DB hiện v2; revision trong transaction | Cần schema mới cho clock/accrual, migration chain và bảo toàn payload cũ |
| Renderer | Office.tsx thật và LitOffice.tsx trong mockup là hai bản riêng | Chuyển helper có chọn lọc; giữ renderer thật và các sửa chair/gear/interaction đã có |
| Tài liệu/QA | guide ghi5giây/ngày; tests/bots/fixtures dùng tick(days), các mốc day7/30/1080 | Cần chuyển đồng bộ, không đổi expected hàng loạt để làm xanh |

Nguồn chi tiết: `src/app/{store,App}.ts*`, `src/simulation/{engine,work,finance,selectors,types,commands,create}.ts`, `src/gameplay/{contracts,product,startup,progression}.ts`, `src/persistence/{schema,saves,settings}.ts`, `src/ui/{simulateModel,SimulateWorkspace}.ts*`, `src/renderer/Office.tsx` và các tests tương ứng.

23 tests và hai lượt smoke của mockup là bằng chứng của bản thử trước nhiệm vụ này. Chúng **không phải** kết quả kiểm chứng game sau tích hợp.

## 3. Gói quyết định khuyến nghị — Proposed, cần duyệt cùng kế hoạch

| ID | Đề xuất | Lý do / ảnh hưởng |
|---|---|---|
| D1 | Giữ lịch09–12,12–13 nghỉ trưa,13–18; OT18–20; ngoài giờ còn lại. Giữ7 ngày làm/tuần,30ngày/tháng,1080ngày/campaign | Lịch ngày đã duyệt; cuối tuần nghỉ là một thay đổi balance riêng |
| D2 | Game mặc định60giây/ngày tại1×; Settings có24/60/120; giữ1×/2×/4× | 120giây phù hợp review nhưng tương đương36giờ/campaign ở1×. 60giây cho18giờ ở1× hoặc4,5giờ ở4× trước Pause; đây là nhịp thử, chưa là kết luận human playtest |
| D3 | T0.4: chuẩn hóa WP theo56 giờ chuẩn/tuần; OT hai giờ với hiệu suất0,8; sức khỏe theo giờ được hiệu chỉnh về neo tuần T0.3 | Giữ +20% năng lực OT trong fixture cùng skill/E/M; không bê các mức mệt của model thử vào campaign |
| D4 | Lương cơ bản và OPEX phát sinh theo thời gian; OT theo thời lượng làm thêm thực. Tổng hợp ghi sổ/thanh toán tháng; grace14ngày giữ nguyên | Tắt OT trước ngày trả lương không xóa chi phí đã phát sinh; không trừ cash mỗi15phút |
| D5 | Game mới bắt đầu ngày1 lúc00:00, Pause; không chạy bù9giờ để giống điểm mở mockup09:00 | Tránh tặng hồi sức/chi phí/lịch sử chưa diễn ra. HTML roster/finder dùng được ngoài giờ |
| D6 | Save v3; load giữ Pause. v1/v2 migrate trong RAM; payload cũ được giữ trước lần ghi đè đầu tiên. Kỳ tài chính cũ đang dở dùng cầu nối một kỳ | Không suy diễn lương/OT quá khứ từ dữ liệu không được lưu |
| D7 | Thời tiết tự động, thuần đồ họa, xác định từ seed+lịch bằng hash riêng; đèn office lưu theo công ty, mặc địnhON | Weather không tiêu RNG nghiệp vụ; toggle đèn không tiêu CEO action hoặc thêm cost/WP |
| D8 | Chỉ đưa tính năng chơi vào game; công cụ tua lùi, chọn48h, bảng A/B và dữ liệu mẫu giữ trong mockup/QA | Game thật không tua lùi ledger/RNG bằng thanh timeline |

Nếu owner muốn dùng nguyên hệ số sức khỏe của mockup hoặc120giây/ngày làm mặc định, cần đổi D2/D3 trong báo cáo trước khi triển khai. Đây là lựa chọn khác có tác động campaign, không phải sửa tên biến.

### 3.1. Sai lệch nếu chép nguyên model thử

- Game hiện chia WP theo7ngày; 8giờ/ngày là56giờ/tuần. Chia6WP cho40giờ nhưng vẫn làm7ngày sẽ tăng năng lực chuẩn40% trước các hệ số khác.
- Mockup: E chuẩn −2,5/giờ, OT−5, trưa+2, ngoài giờ+1,2. Một ngày chuẩn có delta0; một ngày OT có delta−12,4. Bảy ngày OT là−86,8 trước clamp, khác−12/tuần hiện hành.
- Morale mockup: chuẩn+0,17/ngày (=+1,19/tuần); OT−0,89/ngày (=−6,23/tuần). Hiện tại thường+0,5 hoặc−2 tùy Energy; OT−4/tuần.
- $20/$30/giờ và $1vận hành/giờ là dữ liệu mẫu. Game dùng salary từng nhân viên, rent theo office tier, marketing, hosting và các khoản tài chính hiện hữu.

### 3.2. Hiệu chỉnh sức khỏe đề xuất ban đầu cho D3

Đơn vị điểm/giờ game. Bộ tham số này đã được owner duyệt và áp dụng theo ADR-002_INTRADAY_CLOCK.md, có fixture neo tuần.

| Trạng thái | Energy | Morale |
|---|---:|---:|
| Làm chuẩn | −0,6 | 0 ở điều kiện sức khỏe bình thường |
| Làm OT | −1,2 | −0,3160714286 |
| Nghỉ trưa | +0,6571428571 | +0,05 |
| Ngoài giờ | +0,3714285714 | +0,0053571429 trong khung18–22 khi đã nghỉ |

Trong fixture không chạm0/100, làm đủ ca7ngày: E thường+10/tuần, OT−12/tuần; M thường+0,5/tuần, OT−4/tuần. Driven/Steady và điều kiện Energy<25 có bảng hiệu chỉnh riêng theo neo hiện hành; không cộng thêm health tuần lần nữa. Clamp, ngày làm thiếu, task kết thúc sớm và hồi sức thực sẽ làm kết quả khác fixture; cần matched-seed tests và playtest. Không cam kết campaign mới giống từng byte T0.3.

## 4. Trải nghiệm sẽ được tích hợp

| Phần đã duyệt | Hành vi trong game thật |
|---|---|
| Thời gian24h | HUD và clock treo tường cùng HH:MM, giữ bước15phút, cùng ngày nghiệp vụ |
| Công việc theo lịch | Chỉ tạo WP trong09–12/13–18 và OT18–20 nếu hợp lệ; Energy/Morale phản hồi theo giờ và ảnh hưởng năng lực |
| Nhân viên | Trong giờ làm: working nếu có việc thực thi, idle nếu chưa có; trưa nghỉ; ngoài giờ rời bàn. Roster/quản lý vẫn truy cập được |
| OT | Standing policy theo team, giữ chi phí CEO action đang có; chỉ nhân viên còn việc runnable làm thêm. Đổi policy có hiệu lực từ khoảng15phút kế tiếp, không hồi tố |
| Bầu trời | Nền trống đã duyệt; mây, nắng, trăng, sao,5thời tiết; chuyển liên tục theo visual time |
| Đèn | Nút nhỏ trên tường bên trái clock;44px target; camera-aware; HTML/keyboard thay thế; độc lập ánh sáng ngoài trời |
| Màn hình | Working phát sáng khi tắt đèn, code/terminal8fps theo nhịp UI; idle/empty tối; giữ che khuất sprite; Pause vẫn animate như Working gear; reduced motion tĩnh |
| Ánh sáng cửa | Nắng ấm/trăng xanh bạc xuống sàn qua từng pane, có bóng thanh kính; thời tiết điều chỉnh độ sáng; dưới nội thất và theo camera |
| Chi phí | Phân biệt đã phát sinh/chưa thanh toán với cash đã chi, cùng dữ liệu thật của công ty |

Giữ art V4/G–H, hai office tier5/12người, tối đa2assignment/người, các ba playbook và hệ thống chất lượng/thu tiền hiện có. Phạm vi ánh sáng giữ mức2D đã review; các bóng sprite hiện có được giữ, chưa thêm shadow casting3D hoặc tô lại mặt bàn/nhân vật.

## 5. Contract thời gian và ranh giới chuyển trạng thái

### 5.1. Một nguồn nghiệp vụ, một pha nội suy

- State v3 có ngày hiện hành, minuteOfDay chia hết15 trong0…1425, cờ dayOpened và lastClosedDay. Day là ngày nghiệp vụ đang hiện hành; nhật ký/hóa đơn dùng cùng nguồn.
- App giữ phần lẻ của bước trong RAM. Renderer nội suy minuteOfDay→mốc kế tiếp, không chạy luật kinh tế hoặc tự dispatch tick.
- HUD/clock tường dùng mốc đã commit; trời/thiên thể/vệt sáng dùng thời gian nội suy. Đổi speed/Pause giữ phần lẻ; restore/new game/jump chủ động reset pha. Save bảo toàn mốc nghiệp vụ15phút; pha khung đồ họa không phải dữ liệu nghiệp vụ cần phục hồi.
- Mỗi bước là khoảng[t,t+15).09:00 bắt đầu làm;12:00 bắt đầu trưa;13:00 trở lại;18:00 A nghỉ/B OT;20:00 tất cả nghỉ. Một ngày96bước,32bước chuẩn và tối đa8bước OT.
- Mở ngày khi dayOpened=false tại00:00; chạy hooks mở ngày một lần rồi đánh dấu. Cuối23:45–24:00 chạy đóng ngày một lần, ghi lastClosedDay, sang ngày kế tiếp00:00/dayOpened=false. Status tổng kết hiển thị ngày vừa đóng, không chạy thêm ngày mới.
- Các bước/command dùng E/M và phân công đầu khoảng; thay đổi trong UI áp dụng cho khoảng chưa thực hiện. Không ghi lại kết quả của các khoảng đã qua.

### 5.2. Thứ tự các nhóm luật

| Nhóm | Thời điểm | Nội dung / invariant |
|---|---|---|
| Mở ngày |00:00, một lần | CollectDue → events/deferred/promises → productDay theo thứ tự đã rà; không lặp96lần |
| Trong ngày | Mỗi15phút | Xác định eligibility → WP và mọi side effect tương ứng → health → accrual. Khoảng nghỉ không tạo WP |
| Đóng ngày | Sau khoảng cuối | contractsDay/T&M/incidents → experimentsDay → weekly nếu ngày7 → productMonth/monthlyExpenses nếu ngày30 → warnings/insolvency/progression theo thứ tự được khóa bằng test |
| Tuần | Sau đóng ngày7 | Actions, retention, review; phần E/M chuyển sang theo giờ được loại khỏi weekly |
| Tháng | Sau đóng ngày30 | Chốt accrual, doanh thu/thu tiền theo contract hiện hữu, lương/OPEX, báo cáo; không chốt thêm khi reload |

Đây là thứ tự đề xuất; G0 phải lập bảng mọi call đang phụ thuộc s.day và chứng minh những thay đổi so với daily() cũ. Không đổi deadline/invoice thành thời gian máy. Deadline theo ngày cho phép hoàn tất/giao trước khi ngày hạn đóng; cảnh báo và overdue dùng cùng selector ngày/giờ.

### 5.3. Public commands và app scheduler

- Thêm command advanceTime với số bước hữu hạn được validation. Transition clone đầu vào một lần mỗi command/batch, không clone mỗi frame hình ảnh.
- Tick(days) trong fixtures/bots được chuyển thành adapter qua cùng96bước/ngày; không giữ một nhánh dailyWork riêng khiến kết quả khác game.
- Batch/UI jump dừng khi xuất hiện critical event, outcome hoặc lỗi; trả số bước đã đi và phần còn lại. Không vượt sự kiện chỉ vì người dùng bấm Qua ngày.
- Giữ Play/Pause/1×/2×/4×, thêm+15phút. Qua ngày tiến tới00:00 kế tiếp; khi đang00:00 thì qua một ngày đủ. Menu có Đến giờ làm để người mới không phải chờ hết đêm.
- Hidden/sleep không chạy bù. Delta bất thường như sleep phải bỏ và Pause, không lấy1000ms từ khoảng hở dài rồi vô tình tiến một quarter; xử lý backlog bình thường có giới hạn. Pha thời gian dựa game-time đã tiêu, không dựa Date.now hoặc số frame.
- Không phát SFX click cho mỗi advanceTime; giữ audio pause/visibility hiện có. Không kích hoạt autosave mỗi quarter.

## 6. Work, sức khỏe và RNG

### 6.1. Năng lực

Loại multiplier OT khỏi capacity nền, giữ skill/role/focus/process/debt/onboarding/traits/policy. Với capacity nền C WP/tuần và n assignments: mỗi bước chuẩn cho C/(7×32×n), OT cho0,8 lần lượng đó.32bước chuẩn+8bước OT bằng1,2 lần ca chuẩn khi giữ nguyên các điều kiện năng lực. E/M cập nhật theo giờ sẽ tạo hậu quả thực cho ngày hôm sau.

Rà đủ develop/QA/fix/refactor/research/growth/support; caps và lượng used thực mới tăng effort/XP/labor. Task hết việc không đốt tiếp WP hay lương OT. Research/discovery có flag/hiệu ứng một lần cần budget/guard rõ, tránh hoàn tất nghiên cứu chỉ vì một phần WP cực nhỏ ở quarter đầu. G0 khóa semantics cho từng nhánh trước tách runWork.

WP hiện round0,001. Không round mất phần dư trên từng quarter; dùng precision/carry có contract và chỉ round ở ranh giới đã chọn. Phải đối soát progress/effort/labor/XP khi task chỉ còn phần lẻ, hai assignments, QA đổi sangfix, market support về0 hoặc pivot đang hạn chế task.

### 6.2. Defect và QA

Không nhân số lần thử RNG lên32–40lần/ngày bằng cách gọi nguyên nhánh Bernoulli cũ mỗi quarter. Khuyến nghị giữ cơ hội/cap theo employee-assignment-day bằng exposure/budget tích lũy và roll có seed, lưu khi cần để save giữa ca replay đúng. Phát sinh/phát hiện phải xảy ra trước khi người chơi được release; không dồn hết defect tới cuối ngày sau khi đã giao hàng.

G0 phải đặc tả reset/carry khi đổi assignment, hết việc, hire/fire hoặc policy đổi; chống đổi assignment để reroll/lấy thêm cap. Các nhánh generate severity/QA/discovery và thứ tự RNG được kiểm riêng. Cùng save/seed/commands mới phải replay giống nhau ở mọi speed; không hứa RNG tương lai trùng T0.3 sau khi đã đổi granularity. Weather dùng hash riêng, không gọi rng(s).

## 7. Chi phí, cents và chống khai thác OT

- Base payroll tích lũy theo thời gian nhân viên còn được thuê, kể cả nghỉ/lunch/idle. Tháng chuẩn30ngày đủ thời gian phải bằng salary tháng trong fixture rate cố định.
- OT premium chỉ tăng cho khoảng OT thực sự làm. Để giữ neo +20% cho tháng đủ OT2h/ngày: premium mỗi quarter OT là20% × (salary/30) /8. Không dùng rate mẫu$30/h và không cộng multiplier1,2 lần nữa lên toàn bộ payroll cuối tháng.
- Rent/standing OPEX được theo dõi theo rate có hiệu lực; thay budget/tier không sửa chi phí quá khứ. Các khoản riêng như severance, invoices, bridge loan, interest và product billing giữ event/cadence của chúng, không nhân thành chi phí15phút.
- Tiền luôn cents nguyên; giữ remainder nguyên có denominator rõ cho payroll/OPEX/labor. Round ở settlement/allocation xác định; chia nhỏ số bước không được làm lệch tổng tháng.
- Pending cost chưa thanh toán không trừ cash. Chốt ledger theo tháng/các event thật; không tạo96×12ledger entries/ngày. Cash/revenue/AR/liability/deferred/capital tiếp tục đối soát theo finance hiện có.
- work.labor là chi phí phân bổ cho dự án, không phải một lần thanh toán thứ hai. Finance/forecast/UI cùng selectors, gồm phần còn lại của ca và OT.
- Test exploit: bật OT chỉ phút cuối tháng, tắt trước payroll, bật khi không có việc, đổi salary trước/sau ca, fire/hire giữa kỳ, cùng một khoảng được gửi lại, save/restore trước chốt tháng.

## 8. Save v3 và migration — phần rủi ro cao

### 8.1. Dữ liệu cần lưu

Ngày/quarter/cờ mở-đóng ngày; accrual và remainder; exposure/budget RNG chưa hoàn tất; actual OT liên quan; officeLightsOn. Weather mode suy ra từ seed/lịch; camera/cloud phase/code cursor là RAM. DaySeconds là setting người chơi, không làm đổi mô hình nghiệp vụ.

Envelope/schema version và IndexedDB version là hai contract riêng. Tăng DB version nếu cần object store backup; không mặc định thay cả hai chỉ vì cùng đang là2.

### 8.2. Chuyển save cũ

1. Kiểm byte/depth/envelope/checksum trên dữ liệu gốc. v1 qua bước v2 hiện có rồi mới v3; validate v3 nghiêm ngặt.
2. Với save v2 đã hoàn tất day=N, đề xuất map sang ngàyN+1 lúc00:00, chưa chạy opening hooks; lastClosedDay=N. Không cấp thêm WP/hồi sức/tiền, không trừ lại chi phí và không tiêu RNG khi load. Giữ tất cả ID, timestamps cũ, invoices/liabilities/deferred/promises và history.
3. Thông báo ngắn sự thay đổi ngày hiển thị và luật theo giờ, luật mới áp dụng về sau. Load luôn Pause; không tự chạy ngàyN+1. Outcome cũ giữ status/outcome và ngày kết thúc từ lastClosedDay.
4. Save giữa ca phải giữ quarter, health, effort, accrual, remainder và RNG exposure. Roundtrip sau đó đi tiếp phải tương đương bản không reload.

### 8.3. Kỳ lương/OPEX đang dở

Save v2 không lưu đầy đủ lịch sử salary/OT theo giờ. Không thể suy ra chính xác pending cost của17ngày đầu tháng bằng salary/policy hiện tại.

Khuyến nghị cầu nối: nếu N không chia hết30, kỳ đang dở tiếp tục chốt theo quy tắc monthly cũ một lần; không cộng thêm accrual mới lên kỳ đó. UI ghi rõ kỳ chuyển đổi. Sau chốt kỳ, dùng accrual v3 cho toàn bộ các kỳ tiếp theo. Nếu N chia hết30 hoặc game mới thì dùng v3 ngay. Các khoản nợ cũ được giữ và không chốt lại. Đây là ngoại lệ cần được duyệt cùng D6, không giấu dưới migration default.

### 8.4. Bảo toàn và phục hồi

Decode/migrate trong RAM không tự ghi đè slot. Trước lần ghi v3 đầu vào slot v1/v2, transaction kiểm expectedRevision và giữ nguyên payload/revision cũ trong backup cục bộ; nếu backup hoặc write thất bại thì cả transaction rollback. Giữ3manual slots+auto, stale-tab protection, quota/denied/blocked-upgrade và JSON export.

Autosave chuyển sang sự kiện đóng tuần/thay đổi cần lưu đã định nghĩa, không dựa đơn giản s.day%7=0. Save hàng cũ/cá nhân không dùng làm fixture cho agent. Recovery dùng bản build cũ cùng payload cũ hoặc restore snapshot nguồn LOCAL; không hứa build cũ đọc được save v3. Không force-downgrade DB hoặc xóa storage.

## 9. Renderer, UI và ownership dự kiến

| Vùng | Files hiện hữu / đề xuất | Nội dung |
|---|---|---|
| Lịch/luật | simulation/types.ts, engine.ts; mới clock.ts/schedule.ts |96bước, begin/close, phase, commands/invariants |
| Work/health | simulation/work.ts, commands.ts; mới health.ts khi cần | Work budget, caps, RNG, health theo giờ; giữ max2assignments |
| Finance | finance.ts, selectors.ts; accrual helper | Pending/settlement/carry, forecast, legacy bridge |
| App clock | app/store.ts, App.tsx | Accumulator, speed/Pause/hidden, visual interpolation, autosave, audio |
| Save/settings | persistence/schema.ts,saves.ts,settings.ts; SaveManager/SettingsDialog | v3/migration/backup,60s default,24/60/120setting, lights |
| Canvas | renderer/Office.tsx; helpers mới renderer/lighting hoặc tương đương | Chuyển sceneLighting/outdoorWeather/wallClock/wallSwitch/workingMonitors/windowLight theo owning boundary |
| UI | simulateModel.ts, SimulateWorkspace.tsx,common.tsx,panels/Tutorial/CSS | Presence/working shared selector, HUD/date/cost/schedule, finder ngoài giờ, EN/VI,focus |
| QA/docs | tests/app-clock,persistence,simulation,e2e; scripts/balance/profile/soak; guide/matrix/ADRs | Fixture/bot contract mới, evidence cố định build, hướng dẫn và bốn checkpoint |

Giữ Office thật mounted khi đổi context, phân công thủ công và session drafts hiện có. Giữ employee/seat identity khi ngoài giờ: thêm presence thay vì lọc array làm lệch visualPeople[i] của roster. Rà mọi Office consumer; preview tạo công ty dùng giờ/đèn cố định cho ảnh mẫu và không dispatch business tick. Không thay nguyên file bằng LitOffice fork. Chuyển helper thành nguồn dùng chung đúng hướng dependency; mockup có thể dùng helper chung nhưng runtime không import docs/mockups hoặc model.ts. Các prop/hit target mới phải tham gia tránh che Project/clock/office labels.

UI có lịch giờ rõ và trạng thái nghỉ/làm, đọc được bằng HTML. Nhân viên ngoài giờ vẫn được tìm/quản lý qua roster/finder; clock/đèn có keyboard route, target44px. Không hiển thị note kỹ thuật, test controls hoặc số mẫu trong game.

## 10. Giai đoạn triển khai sau khi kế hoạch được Approve

| Gate | Đầu ra cụ thể | Điều kiện qua gate |
|---|---|---|
| G0 — khóa contract và baseline | ADR clock/date/settlement, bảng health/trait/RNG/branch-work, public-command mapping; baseline verify+balance traces riêng | Các lựa chọn D1–D8 đã duyệt; semantics không còn mâu thuẫn, fixture chuẩn đối soát được |
| G1 — clock/domain | Contract v3 và module lịch/15min/day hooks thuần, public API và clock tests trên fixture; chưa chuyển runtime từng phần | 96bước/ngày; mở/đóng một lần; speed không đổi kết quả; dừng critical đúng ranh giới |
| G2 — work/health | Mọi task branch theo ca, OT/health/RNG/carry | Không WP lúc nghỉ; +20% fixture tĩnh; health neo tuần; không double health hoặc RNG farming |
| G3 — finance/cross-playbook | Accrual, settlement, forecasts; hooks Product/Outsourcing/Startup | Cents/ledger đối soát; tháng/tuần/deadline/event không lặp; chống OT toggle exploit |
| G4 — lát cắt state/save/runtime | Chuyển đồng bộ State/create/schema/envelope/engine/store sangv3; migrate chain, legacy-month bridge, backups/revisions, settings | Old slots giữ nguyên trước save; v3 giữa ca roundtrip; failure giữ dữ liệu; load Pause |
| G5 — Canvas | Bầu trời5modes, clock, đèn, monitor, ánh sáng cửa trên Office thật |5/12staff,8appearances, các working state; occlusion/hit/camera đúng; không đổi art |
| G6 — UI/lifecycle | Controls, HUD/date, schedule/cost feedback, EN/VI/tutorial/finders | Render cả2viewport×3scale×2locale; draft/mounted/focus/audio/hidden không regression |
| G7 — tích hợp/đối chứng | Toàn verify/E2E, replay48h/7d/30d/90d/1080d; balance seed suites | Rules/save/accounting PASS; bot adapter và tests phản ánh contract mới có lý do |
| G8 — hiệu năng/handoff | Fullgame profile riêng, soak30–60phút, receipt/hashes/ảnh/video; bốn checkpoint | Không leak/backlog; đạt mục tiêu hiển thị trong môi trường ghi nhận; owner review game LOCAL |

G1–G3 có thể được xây trong module thuần/test fixture trước khi nối vào runtime. Việc đổi State sangv3 phải đi cùng codec/schema/create/engine/store tại G4, để không tạo checkpoint statev3 nhưng codec vẫnv2. Chỉ có một đường luật authoritative khi chuyển xong.

Thực hiện tuần tự, không delegate coding. Một Approve kế hoạch cho phép các bước sửa/test thường lệ trong đúng gói đã duyệt; không xin lại sau từng gate. Nếu G0 hoặc bằng chứng cho thấy cần đổi mô hình/số ngoài gói này, báo thay đổi trước khi làm phần đó. Chưa có ước lượng thời lượng đáng tin cho toàn bộ; phần chi phối là RNG/cost migration và kiểm hồi quy ba playbook, không phải vẽ bầu trời.

## 11. Ma trận nghiệm thu bắt buộc

| Nhóm | Ca kiểm / kết quả cần đạt |
|---|---|
| Biên ca |08:45→09:00,11:45→12:00,12:45→13:00,17:45→18:00,19:45→20:00,23:45→00:00; đúng interval và không cộng lặp |
| Presence/work | Normal/OT; no assignment, task done,2assignments, partial remaining, lunch, ngoài giờ; Canvas và domain cùng trạng thái |
| Determinism | Cùng seed+commands tại1/2/4×, cadence16/100/250ms, command batch vs từng bước; cùng business state/RNG/cents |
| Health | Full regular/OT tuần, Driven/Steady, thấpEnergy, clamps, partialOT; bỏ weekly double count; hậu quả carry qua đêm |
| Mỗi loại việc | Develop/QA/fix/refactor/research/growth/support; XP/debt/bug/effort/caps/discovery đúng, không release trước RNG defects |
| Kinh tế |30ngày rate cố định ra salary/OPEX đúng; OT từng khoảng; salary/tier/budget đổi giữa kỳ; cents carry, labor không trả hai lần |
| Hook lịch | Ngày7/30/90/1080; invoice due/clears, deferred/promises, event expiry, weeklyT&M/partial final week, payroll+14, quarterly review |
| Pause/jump | Pause/speed giữ pha; hidden/sleep không catch-up; +15/Qua ngày/Đến giờ làm dừng critical/outcome; không tua ngược |
| Save | v1/v2/v3,quarter giữa ca,cuối tháng/tuần,legacy bridge; roundtrip/replay; future/corrupt/checksum;2tab conflict/quota/blocked upgrade |
| Canvas | Hai office tiers,5/12staff,8ngoại hình,pose working/idle; ngày/trăng/5weather; lightsON/OFF; glow clipping/rugs/props/chair; camera pan/zoom/offscreen/fit |
| Clock/motion | HUD/tường/accessible cùng quarter; trời/vệt sáng vẫn đổi trong quarter; Pause đóng băng thiên thể, code/gear tiếp tục; reduced motion theo contract |
| UI | VI/EN ×1280×720/1920×1080 ×100/125/150%; keyboard/focus,44px, Project không bị switch che; finder và chọn người ngoài giờ |
| Ba playbook | Product release/support/monthly billing; Fixed-price20/40/40 & collection; T&M effort/cap; Startup experiment/funding/pivot; quarter/campaign/Sandbox |
| Hiệu năng | Profile không đọc pixel đồng thời, tách display-rAF/world passes/dirty tiles; store commits không theo frame;12staff/DPR1–2/mưa gió; heap/backlog/soak |
| Human | So nhịp24/60/120 và cách hiểu giờ làm/cost trong novice15phút/campaign; bot/axe không thay người chơi hoặc screen reader |

Lệnh dự kiến sau implementation: Node24, npm run verify; focused clock/domain/persistence; npm run test:assets; production LOCAL E2E với đúng build/URL; ba suite test:balance/test:balance:markets/test:balance:policy; profile rồi soak chạy riêng. Ghi run mới vào evidence riêng, không ghi đè kết quả T0.3. Nếu scripts hiện tại chưa hỗ trợ output riêng, bổ sung option output trong phạm vi QA trước chạy.

Mục tiêu tự động: zero invariant/replay/ledger/migration failures. Neo tĩnh WP/health/cost phải đạt phép đối soát đã nêu. Với campaign matched-seed, so tiến độ, cash/runway, quality/defects, survival/outcome và rejected commands; chênh trên10% ở median WP/cost hoặc trên5điểm phần trăm outcome/survival là cờ cần phân tích, không tự sửa tham số để đạt xanh. Human pacing và độ khó vẫn OPEN tới khi quan sát thật.

## 12. Rủi ro, hạn chế và điều kiện bàn giao

1. **Cao — nhân đôi luật:** runWork/health/monthly hooks còn chạy ở daily cũ. Kiểm một nguồn transition, trace số lần và budget.
2. **Cao — save/chi phí quá khứ:** thiếu lịch sử accrual. Dùng bridge một kỳ và backup transactional, không tự dựng giao dịch cũ.
3. **Cao — RNG/quality:** nhiều Bernoulli hoặc deferred defect làm lệch risk/farming. Kiểm branch/caps và release giữa ca.
4. **Cao — ngày/critical/autosave:** s.day cũ là ranh giới sau tick. Khóa date selectors, opened/closed markers và weekly autosave trước wiring UI.
5. **Trung bình — forecast và các script ngày:** dời tính toán sang ca có thể lệchdeadline/hire/onboarding. Public-command traces và calendar fixtures phải giải thích delta.
6. **Trung bình — rendererfork/12staff:** giữ sửa chair/gears, desk alpha và UI overlay; so art hash và ảnh thật, không chỉ DOM.
7. **Trung bình — hiệu năng:**96bước/ngày, clone state, dynamic light và12staff. Batch quanta, cache theo nội dung, đo trước tối ưu; bulk bot dùng cùng luật, chỉ tối ưu khoảng nghỉ nếu chứng minh tương đương.
8. **Chưa biết — trải nghiệm campaign:** nhịp60s và hệ số mới chưa được người chơi thử. Đây là đề xuất thử có đo, không phải balanced/production approved.

Bàn giao sau tích hợp phải có: build/source/art digests; file/rule changes; logs; seed/replay/accounting; migration/backup proof; ảnh/recording game thật; performance/soak; giới hạn NOT_RUN; cập nhật PROJECT_STATE/SESSION_HANDOFF/RELEASE_CHECKLIST/TASKS và guide/matrix/ADRs. Owner review game LOCAL là gate riêng. Không push, upload, deploy hoặc ghi dịch vụ ngoài trong kế hoạch này.

## 13. Trạng thái sau Approve

Owner đã duyệt D1–D8 và G0–G8. Implementation LOCAL đã nối toàn bộ domain/save/runtime/UI/Canvas. Báo cáo, lệnh thực, evidence và các mục OPEN tại TIME_24H_INTEGRATION_REPORT.md. G8 soak30phút thực đã hoàn tất, build cố định; owner review và human pacing vẫn OPEN. Không coi kết quả bot/axe/headless là nghiệm thu người chơi.

Bước tiếp theo: Khiêm review game LOCAL và cờ Outsourcing/Tough trong báo cáo; nếu cần chỉnh, lập phạm vi điều chỉnh mới trước code.
