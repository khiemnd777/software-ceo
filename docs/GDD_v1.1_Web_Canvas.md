# SOFTWARE CEO: BUILD · SHIP · SURVIVE
## GAME DESIGN DOCUMENT — GDD v1.1 (WEB + CANVAS)

| Thuộc tính | Đặc tả |
|---|---|
| Ngày chốt bản thiết kế | 21/10/2026 |
| Trạng thái | Design baseline v1.1 — Web Edition — chưa triển khai source code |
| Thể loại | Business Tycoon / Management Simulation / Strategy |
| Độ sâu | **Balanced Tycoon**: quy tắc có chiều sâu, cách chơi dễ tiếp cận |
| Hình ảnh | **2.5D Isometric**, vẽ bằng HTML Canvas 2D; sprites với phối cảnh giả lập, pan/zoom; không dùng 3D runtime trong MVP |
| Người chơi | Người yêu thích tycoon phổ thông; không cần kiến thức lập trình |
| Nền tảng ưu tiên | **Web browser, desktop-first**; URL mở là chơi, không cài đặt/launcher, không yêu cầu đăng nhập; tablet/mobile qua browser thuộc kế hoạch responsive từng giai đoạn |
| Thời lượng mục tiêu | Kịch bản ngắn 60–120 phút; campaign 36 tháng mô phỏng khoảng 4–7 giờ |
| Định hướng thương mại | Chưa quyết định; MVP là bản chơi qua URL, không tích hợp thanh toán hoặc pay-to-win |
| Đơn vị tiền | USD giả lập; số liệu là **tham số cân bằng game**, không phải benchmark doanh nghiệp thực tế |

> **High concept:** Từ một văn phòng nhỏ, người chơi điều hành công ty phần mềm với vai trò CEO. Tuyển người, bán hàng, phát triển phần mềm, giữ lời hứa, quản lý dòng tiền và đưa công ty vượt qua khủng hoảng. Chọn Product, Outsourcing hoặc Venture Startup làm **chiến lược khởi đầu**, không phải lớp nhân vật cố định.


> **Thay đổi so với v1.0 (21/10/2026):** Chuyển PC-native dự kiến sang web-first. Render thế giới game bằng Canvas 2D theo góc isometric thay cho 3D runtime. Quản lý công ty bằng HTML/CSS. Save cục bộ bằng IndexedDB. Không yêu cầu người chơi cài đặt, đăng nhập hoặc kết nối đến backend để chạy mô phỏng. **Các quy tắc gameplay, financial invariants và ba playbook giữ nguyên**, trừ khi được ghi rõ bên dưới.

---

## 1. TẦM NHÌN, ĐỐI TƯỢNG VÀ RANH GIỚI

### 1.1. Player fantasy

Người chơi có cảm giác **“chính tôi đã tạo nên công ty này”**: từ ngày phải tự gặp khách hàng, đến khi có đội ngũ tự vận hành và đủ nguồn lực triển khai chiến lược lớn. Những câu chuyện đáng nhớ xuất phát từ quan hệ nhân-quả: thắng hợp đồng nhưng giao trễ, sản phẩm có nhiều người dùng mà hết tiền, mất nhân viên trụ cột ngay trước ngày phát hành.

### 1.2. Bốn trụ cột thiết kế

1. **Decisions Have Consequences:** Mỗi quyết định đáng kể đều có lợi ích, chi phí, thời gian tác động và rủi ro có thể hiểu được.
2. **People Build Companies:** Năng lực, động lực, mệt mỏi, cộng tác và phát triển nhân sự tác động trực tiếp đến vận hành.
3. **Software Is a Living Product:** Tính năng, lỗi, kiểm thử, technical debt và hỗ trợ khách hàng không kết thúc ở ngày phát hành.
4. **Readable, Not Trivial:** Chỉ hiển thị những chỉ số người chơi có thể hành động; dùng dự báo, giải thích nguyên nhân và hỗ trợ ra quyết định thay vì bắt ghi nhớ jargon.

### 1.3. Nguyên tắc UX cho người chơi phổ thông

- Mỗi màn hình trả lời một câu hỏi: **“Công ty đang thế nào?”, “Vì sao?”, “Tôi có thể làm gì?”**.
- Không yêu cầu người chơi viết code, chọn framework thực tế, đọc hợp đồng pháp lý dài hoặc tính toán kế toán thủ công.
- Thuật ngữ nghề nghiệp luôn đi kèm tên dễ hiểu; ví dụ **Runway — số tháng có thể duy trì công ty**.
- Các rủi ro nghiêm trọng có cảnh báo trước và có ít nhất một cách phản ứng khả thi trong đa số tình huống.
- Độ phức tạp mở theo tiến trình; giai đoạn đầu chỉ cần biết Cash, Team, Work, Customers và Trust.

### 1.4. Không phải mục tiêu của v1.0

Không mô phỏng lập trình ở cấp dòng code, không mạng xã hội đa người chơi, không có thành phố mở, không mô phỏng đầy đủ pháp lý/thuế/chứng khoán, không cần AI hội thoại/LLM, không bắt người chơi trang trí từng vật dụng văn phòng, không mô phỏng hàng nghìn nhân viên độc lập.

---

## 2. BA CHIẾN LƯỢC KHỞI ĐẦU

Ba lựa chọn mở bằng **playbook**: tài nguyên, nhân sự, dự án, hướng dẫn và mục tiêu khác nhau; đều dùng chung mô phỏng và có khả năng chuyển hướng.

| | PRODUCT | OUTSOURCING | VENTURE STARTUP |
|---|---|---|---|
| Lời hứa trải nghiệm | “Xây thứ khách hàng sẵn sàng trả tiền” | “Biến dự án thành lợi nhuận và danh tiếng” | “Tìm mô hình có thể tăng trưởng trước khi hết vốn” |
| Tiền mặt mở đầu (T0) | $70.000 | $45.000 | $100.000 |
| Nhân sự ban đầu | 1 Dev + 1 Designer/Generalist | 1 Dev + 1 QA | 1 Dev + 1 Growth Generalist |
| Tài sản ban đầu | 1 MVP nhỏ; 35 khách hàng trả phí, gói $79/tháng | 1 hợp đồng trị giá $30.000; deposit 20% khi ký | 1 giả thuyết sản phẩm chưa kiểm chứng; chưa có khách hàng |
| Áp lực nổi bật | Thu hút/giữ chân khách hàng, MRR, chất lượng | Estimation, deadline, scope creep, thanh toán | Validation, runway, pitch, pha loãng cổ phần |
| Nguồn thu chính | Subscription | Milestone contract payments | Ban đầu có thể bằng 0; sau đó subscription/pilot + vốn đầu tư |
| Hướng dẫn đầu game | Giải thích nhu cầu → phát triển → phát hành → giữ chân | Báo giá → làm dự án → QA → nghiệm thu → thu tiền | Giả thuyết → experiment → MVP → traction → gọi vốn |

**Quy tắc chuyển hướng:** Công ty Outsourcing có thể đầu tư vào 1 sản phẩm nội bộ; công ty Product có thể nhận hợp đồng để nuôi sản phẩm; Startup có thể ký paid pilot. Ở MVP, người chơi được giữ **1 nguồn thu phụ** song song. Chuyển trọng tâm chiến lược tại mỗi kỳ đánh giá quý tốn 1 CEO Action; mục tiêu campaign được cập nhật và xác nhận trước khi đổi.

**Phân biệt Product với Startup:** Cả hai đều có thể làm SaaS. Product bắt đầu với sản phẩm đã có tín hiệu thị trường và tối ưu **kinh doanh bền vững**; Startup bắt đầu với giả thuyết chưa được xác nhận và tối ưu **học nhanh – tăng trưởng – runway – vốn**.

---

## 3. CẤU TRÚC PHIÊN CHƠI VÀ VÒNG LẶP CỐT LÕI

### 3.1. Game loop

1. **Quan sát:** CEO Dashboard, Inbox, cash forecast, tiến độ công việc, trạng thái nhân viên.
2. **Lựa chọn:** Chọn mục tiêu và tối đa 3 **CEO Actions** quan trọng trong tuần; các thao tác phân công cơ bản không tốn action.
3. **Thực thi:** Nhân viên làm việc, thị trường phản hồi, doanh thu/chi phí phát sinh; hình ảnh văn phòng phản ánh trạng thái.
4. **Phản hồi:** Báo cáo sprint/tuần, khách hàng, sự kiện, tiền vào/ra, thay đổi KPI.
5. **Thích ứng:** Thay đổi ưu tiên, chính sách, đội ngũ hoặc chiến lược cho tuần tiếp theo.

### 3.2. Thời gian

- **1 tick = 1 ngày mô phỏng**, cập nhật công việc và chi phí phát sinh theo lịch.
- **Tuần:** phân công nguồn lực, sprint, CEO Inbox, event, review; điểm ra quyết định chính.
- **Tháng:** payroll, thuê văn phòng, hosting, quảng cáo, subscription billing, invoices, financial review.
- **Quý:** strategy review, mở thị trường, cân nhắc mô hình và vốn.
- **Năm:** Company Review, mở khóa giai đoạn phát triển, tổng kết và mục tiêu mới.
- Điều khiển **Pause / x1 / x2 / x4**; mặc định 1 ngày ≈ 5 giây ở x1 (tinh chỉnh theo playtest); auto-pause khi có sự kiện trọng yếu hoặc quyết định cần phê duyệt.
- Chỉ **1–3 quyết định thực sự quan trọng/tuần** là nhịp độ mong muốn; không bắt người chơi dùng hết CEO Actions.

### 3.3. CEO Actions

- Mỗi tuần có **3 CEO Actions**. Ví dụ: ký hợp đồng, tuyển người, đàm phán Change Request, thay chính sách delivery, khởi động chiến dịch marketing lớn, pitching, pivot.
- Thao tác không tốn action: xem số liệu, đổi camera, kiểm tra ứng viên, kéo task vào ưu tiên, phân bổ nhân sự trong ngân sách đã duyệt, điều chỉnh nhịp thời gian.
- **Emergency Override:** cho phép mượn 1 action nếu xảy ra khủng hoảng, tuần sau giảm 1 action; tối đa 1 lần/chu kỳ tháng. Tránh game over chỉ vì thiếu 1 điểm hành động.
- Các thiết lập duy trì thành **standing policies**; game không buộc CEO phê duyệt công việc lặp lại mỗi ngày.

### 3.4. Nhịp cảm xúc

Mỗi năm có chuỗi: khởi sự → cơ hội → đánh đổi → thành quả/khủng hoảng → củng cố. Sự kiện đặc biệt chỉ có ý nghĩa nếu dẫn đến thay đổi kế hoạch, không chỉ là pop-up cộng/trừ chỉ số.

---

## 4. CÁC THỰC THỂ VÀ CHỈ SỐ CHUNG

### 4.1. Entity / state

| Đối tượng | Dữ liệu gameplay bắt buộc |
|---|---|
| Company | cash, liabilities, reputation, focus strategy, unlocked capabilities, week, CEO Actions |
| Employee | role, skill (1–5), salary, morale, energy, traits (tối đa 2), assignment, onboarding |
| Team / Assignment | người thực hiện, loại công việc, workload còn lại, focus split |
| Project | hợp đồng, scope, estimated work, deadline, payment milestones, bugs, debt, quality, client trust |
| Product | features, fit, reliability, bugs, debt, plan price, active paid customers, MRR |
| Client / Segment | ngân sách, độ nhạy giá, kỳ vọng, trust, nhu cầu, cơ hội mua lại |
| Contract | value, type, milestones, late payment profile, agreed change requests |
| Venture | experiments, evidence, traction, runway, cap table, investor offers |
| Event | trigger, severity, warning, choices, outcomes, expiry, seed |

### 4.2. Bộ KPI

**Luôn hiển thị:** Cash, Monthly Net Cash Flow (thu/chi thực), Team Morale, Trust/Reputation, Active Objective. **Theo từng hướng:** Product = MRR, New/Churned Customers, Reliability; Outsourcing = Estimated Margin, Work Remaining, On-time Risk, Invoices Due; Startup = Runway, Traction, Validated Evidence, Founder Equity.

**Thang 0–100:** morale, energy, reputation, client trust, product-market fit, reliability, debt (nợ cao = xấu). Chỉ số tác động phải có tooltip: nguyên nhân tăng/giảm và hành động cải thiện.

**Định nghĩa:** *Cash* là tiền đang có. *Profit* là doanh thu ghi nhận trừ chi phí ghi nhận. *Cash Flow* chỉ phản ánh tiền thực vào/ra. Ba đại lượng không đồng nghĩa. *Runway* = số tháng đủ tiền duy trì nếu tỷ lệ đốt tiền gần đây không đổi.

---

## 5. SIMULATION RULES — LUẬT NỀN TẢNG

> **T0** là tập tham số cân bằng đầu tiên; không phải số liệu kinh tế đời thực. Game logic độc lập engine hiển thị; cùng seed + cùng chuỗi lựa chọn phải cho cùng trạng thái.

### 5.1. Năng lực làm việc (Work Points — WP)

WP là đơn vị trừu tượng đo khối lượng hoàn thành; không phải số dòng code và không phải giờ công thực tế.

```text
Employee WP/week = 6 × SkillFactor × RoleFit × MoraleFactor
                   × EnergyFactor × FocusFactor × ProcessFactor
                   × DebtFactor (chỉ công việc phát triển)
SkillFactor    = 0.70 + 0.12 × SkillLevel       [SkillLevel 1..5]
RoleFit        = 0.70..1.00                     [đúng chuyên môn đạt 1.00]
MoraleFactor   = 0.80 + 0.004 × Morale          [Morale 0..100]
EnergyFactor   = 0.65 + 0.0035 × Energy         [Energy 0..100]
FocusFactor    = 1.00 nếu 1 assignment; 0.85 nếu 2
ProcessFactor  = 0.90..1.10
DebtFactor     = max(0.65, 1 - 0.0035 × TechnicalDebt)
```

MVP giới hạn **2 assignment/người**. UI hiển thị **ước tính WP/tuần** và lý do thay đổi. Tổng WP theo chuyên môn dùng cho công việc tương ứng: development, QA, research, marketing, sales, project coordination. Không ép tất cả hoạt động dùng công thức giống nhau; các hệ thống chuyển WP sang tác động riêng.

### 5.2. Scope, uncertainty và estimation

- Mỗi feature/task có **Estimated Work** (đơn vị WP) và **Actual Work** tạo cố định lúc sinh hạng mục.
- MVP: Actual Work trong khoảng **80–130%** Estimated Work; mức biến động bị ảnh hưởng bởi clarity của yêu cầu, kinh nghiệm ước lượng và change request.
- Người chơi thấy **estimated range + confidence** (ví dụ 26–34 WP, độ tin cậy vừa); không biết exact actual work trước khi discovery.
- Làm rõ yêu cầu/research giảm **độ rộng dự báo** và nguy cơ phát sinh công việc; không tự động làm biến mất mọi rủi ro.
- Khi công việc hoàn thành hoặc phát hiện scope mới, dự báo được cập nhật; không tùy tiện chỉnh Actual Work đã sinh theo hướng trừng phạt người chơi.

### 5.3. Delivery policy

| Chính sách | Dev WP | Lỗi phát sinh (tương đối) | Debt phát sinh / 20 Dev WP hoàn thành |
|---|---:|---:|---:|
| Ship Fast | ×1,20 | ×1,50 | +3 |
| Balanced | ×1,00 | ×1,00 | +1 |
| Quality First | ×0,85 | ×0,65 | +0 |

- Lỗi tiềm ẩn phát sinh ở mức **0,14 defect token / Dev WP** trước modifiers; được tạo bằng RNG có seed. Mỗi token mang severity Minor/Major/Critical.
- QA WP giúp **phát hiện** lỗi; Dev WP mới **sửa** lỗi (1–3 WP tùy severity). QA tốt nâng độ tin cậy của chỉ số chất lượng; QA không phải nút tự sửa mọi lỗi.
- Một phần lỗi tiềm ẩn vẫn có thể thoát ra sau phát hành và trở thành support incident; khả năng xảy ra phụ thuộc lượng lỗi tiềm ẩn, test effort và policy.
- **Debt 0–100** tích tụ qua delivery; tăng Debt làm chậm Dev WP theo công thức ở 5.1. Task Refactor tiêu tốn Dev WP để giảm Debt; không cộng ngay tính năng/doanh thu.
- **Quality Score sơ bộ:** `clamp(0,100, 100 − 20×CriticalKnown − 5×MajorKnown − 1×MinorKnown − 0,2×Debt)`. UI ghi rõ đây là **ước lượng từ lỗi đã phát hiện**, không chứng nhận sản phẩm không có lỗi ẩn.
- Gate phát hành bình thường: **không còn CriticalKnown** và **Quality Score ≥70**. CEO có thể **Override Release** bằng action, hiện cảnh báo và nhận rủi ro uy tín/sự cố đáng kể.

### 5.4. Nhân sự và sức khỏe tổ chức

- Nhân viên: Skill 1–5; Morale và Energy 0–100; 1 Role chính + tối đa 2 Trait; salary/tháng.
- **Overtime policy** theo team: thêm tối đa khoảng **20% WP** ngắn hạn; tiêu hao Energy, giảm Morale nếu kéo dài và phát sinh chi phí trả thêm. Cơ chế này không được trở thành chiến lược tối ưu dài hạn.
- T0: mỗi tuần overtime liên tục làm Energy −12 và Morale −4; tuần làm việc bình thường hồi Energy +10. Không trả lương đúng hạn: Morale −15 và tăng nguy cơ nghỉ việc.
- Nhân viên mới có **2 tuần onboarding**: hiệu suất 50% rồi 75%, sau đó bình thường.
- Skill tăng khi làm công việc phù hợp và có mentoring; tuyển Senior cho năng lực sớm nhưng chi phí cao.
- Khi Morale thấp kéo dài, có thể xuất hiện thông báo **Retention Risk** trước khi nhân viên quyết định nghỉ. Không dùng random quit vô cớ.
- Trait ví dụ: Fast Learner, Meticulous, Mentor, Client-Friendly, Creative, Conflict-Prone; phải có mặt tích cực hoặc đánh đổi, không có “nhân viên hoàn hảo”.

### 5.5. Hệ thống tiền

```text
Cash(end of day) = Cash(start of day)
                 + Cleared Customer Payments + Investment Cash In
                 − Payroll Paid − Office/Hosting/Marketing Paid
                 − Other Paid Expenses

Runway (months) = Cash / AvgMonthlyCashBurn, nếu AvgMonthlyCashBurn > 0
                    = "Self-sustaining" nếu AvgMonthlyCashBurn <= 0
```

- Payment milestone **không đồng nghĩa** tiền đã về tài khoản: invoice có ngày đến hạn và độ trễ thanh toán.
- Subscription ghi doanh thu theo billing cycle; churn và refund ảnh hưởng tháng sau.
- Hệ thống lưu **accounts receivable** và **unpaid liabilities** riêng. Không biến hóa đơn chưa trả thành tiền mặt.
- Nếu không đủ tiền payroll, game tạo **Payroll Crisis** và cho tối đa **14 ngày mô phỏng** để giải quyết; hết hạn mà vẫn không thể thanh toán → Insolvency Ending. Cảnh báo forecast phải xuất hiện sớm, không chỉ khi tiền bằng 0.
- MVP không mô phỏng chi tiết tax, loan underwriting, foreign exchange hay báo cáo kế toán nhiều chuẩn.

### 5.6. Tác động từ quan hệ và uy tín

Reputation là thang 0–100; tăng khi giao hàng đúng hẹn, sản phẩm ổn định và giữ cam kết; giảm khi trễ, sự cố nghiêm trọng hoặc thất hứa. Reputation cao mở ra leads tốt và candidate tốt nhưng **không tự động biến mọi deal thành thắng**. Quan hệ từng khách hàng (Client Trust) quản lý độc lập với uy tín công ty.

### 5.7. Randomness và fairness

- PRNG có seed theo campaign; cùng seed + cùng action trace tái lập kết quả.
- Random dùng cho thị trường, ứng viên, biến động estimation và event; **không bốc thăm thay thế hậu quả chiến lược**.
- Event gây thiệt hại lớn phải có **telegraph/precursor** tối thiểu 1–2 tuần trong đa số trường hợp (nhân viên bất mãn, tiền sắp cạn, sản phẩm chất lượng thấp).
- Mỗi tuần tối đa 1 major event; hệ thống lựa chọn theo context; không hiển thị event vô nghĩa ở hướng chơi hiện tại.
- Sau sự kiện: hiển thị *What happened / Why / What could have helped*.

---

## 6. BA HỆ THỐNG KINH DOANH

### 6.1. Product Management

**Luồng:** Chọn thị trường → xem feedback → xếp roadmap → phát triển/QA → release → acquire/retain → reinvest.

**Chỉ số:** Market Fit (0–100), Awareness, Leads, Conversion, Paid Customers, MRR, Churn, Reliability, Support Load, CAC ở dạng giải thích đơn giản.

**Mô phỏng monthly cohort giản lược:**

```text
New Customers  = floor(Leads × ConversionRate)
Churned        = round(ActiveCustomers × MonthlyChurnRate)
ActiveCustomers(next) = max(0, ActiveCustomers + NewCustomers − Churned)
MRR            = ActiveCustomers × SubscriptionPrice
```

- Leads đến từ nền tảng thị trường, marketing, referral và uy tín. Conversion chịu tác động của fit, chất lượng, mức giá và cạnh tranh.
- Với mô hình **freemium** (mặc định Startup), theo dõi **Free Active Users**: `FreeActiveNext = round(FreeActive × MonthlyRetention) + NewActivatedUsers − FreeToPaidConversions`, với `NewActivatedUsers = floor(Leads × ActivationRate)` và `FreeToPaidConversions = floor(FreeActive × PaidConversionRate)`. **MAU** = Free Active Users + Paid Customers; không đếm một người vào cả hai nhóm. Giai đoạn Product đầu game dùng funnel direct-paid đơn giản ở trên.
- **T0 funnel direct-paid (minh họa):** `Leads = round(BaseDemand + MonthlyMarketingSpend/50 + 0,1×ActiveCustomers + ReputationBonus)`; `ConversionRate = clamp(3%, 22%, 12% + 0,1 điểm % × (MarketFit−50) + Quality/Price adjustments)`. BaseDemand phụ thuộc phân khúc. Hệ thống luôn cho thấy yếu tố nào đóng góp leads/chuyển đổi.
- **T0 churn:** `MonthlyChurnRate = clamp(1%,18%, 4% + 0,04 điểm % × (50−MarketFit) + 0,03 điểm % × (80−Reliability))`; ví dụ khi Fit 50 và Reliability 80 thì churn cơ sở khoảng 4%/tháng. Customer trust/competitive pressure có thể tạo modifier nhỏ, có chú thích.
- T0: gói $79/tháng, 35 paying customers; marketing cải thiện leads nhưng không tự sửa retention.
- **Market Fit** tăng khi release feature phù hợp nhu cầu đã khảo sát (T0 +4..8), pilot/experiment xác nhận giả thuyết (T0 +5..12); feature không phù hợp mang lại ít hoặc không có fit. Dữ liệu feedback giúp người chơi biết khách hàng cần gì.
- Feature chọn theo **customer needs cards**; xây sai nhu cầu không bảo đảm tăng Market Fit.
- Tăng giá có thể tăng revenue/customer nhưng giảm conversion và tăng churn; player thấy preview dạng khoảng, không có lựa chọn “tăng giá không đánh đổi”.
- Release có quá nhiều lỗi → support incidents, trust/churn xấu đi; bắt buộc duy trì phần mềm sau phát hành.

### 6.2. Outsourcing / Contract Delivery

**Luồng:** Lead → Qualification → Estimate → Quote & Negotiate → Contract → Plan → Deliver → QA → Acceptance → Invoice → Collect → Repeat Business.

MVP có **Fixed Price** (độ rủi ro scope cao) và **Time & Materials** (cash ổn định hơn, khó thắng một số khách). Thông tin hợp đồng hiển thị theo ngôn ngữ phổ thông: giá, số tuần, việc phải làm, khoản ứng trước, điểm nghiệm thu, lợi nhuận dự kiến, khoảng rủi ro.

- **Estimated Margin** = `(contract price − estimated allocated labor cost − estimated project expenses) / contract price`; overhead công ty được trình bày **riêng** trong P&L và Cash Flow, tránh trừ trùng.
- Mẫu Fixed Price: giá $30.000; **20% đặt cọc, 40% nghiệm thu giữa kỳ, 40% nghiệm thu cuối**, thanh toán có thể trễ có cảnh báo.
- Actual Scope = baseline actual effort + **approved** change requests + sự cố phát sinh đã được giải thích. Client có thể yêu cầu ngoài hợp đồng; CEO quyết định miễn phí, đề nghị CR, từ chối hoặc đánh đổi timeline.
- Đúng hạn và đạt chất lượng → tăng trust, referral, khả năng hợp đồng tiếp; giao muộn / có lỗi → giảm trust, giữ lại payment hoặc bảo hành tốn WP.
- Không dùng thanh “progress 100% = nhận đủ tiền”: nghiệm thu và thu tiền là hai bước độc lập.

### 6.3. Venture Startup

**Luồng:** Hypothesis → Customer Discovery → Experiment → MVP → Measure Traction → Pivot/Persevere → Pitch → Grow.

- **Validation Evidence** tăng khi experiment cho tín hiệu phù hợp thị trường; không tăng chỉ vì lập kế hoạch hoặc tiêu tiền.
- **Traction** lấy từ khách hàng thật (paying users, pilots, retention) thay vì chỉ số vanity; trước PMF, chi marketing lớn có diminishing returns.
- **Runway** luôn nằm trên màn hình; các sự kiện “cơ hội gọi vốn” phụ thuộc evidence và traction.
- **Funding Offer** gồm tiền nhận, tỷ lệ cổ phần mới, điều kiện/mốc cam kết đơn giản. T0 ví dụ: `$150.000` cho `25% post-money equity`.
- **Dilution:** `Existing ShareholdingAfter = Before × (1 − NewInvestorShare)`; hiển thị chính xác phần trăm founder còn lại sau vòng gọi vốn. Không mô phỏng ESOP phức tạp trong MVP.
- Pivot tốn thời gian và một phần tài sản sản phẩm, đổi lại có thể tìm thị trường phù hợp; không phải nút random tăng Market Fit.
- MVP tối đa 1 funding round trong một campaign ngắn; cơ chế sâu hơn thuộc Early Access.

### 6.4. Hệ thống thị trường dùng chung

Ba phân khúc ban đầu: **Retail Operations, Creative Teams, Education Services**. Mỗi phân khúc có Demand, Budget, Competition, Price Sensitivity và Quality Expectation (hiển thị dưới dạng Low/Medium/High). Một số xu hướng được báo trước theo quý, tạo cơ hội thay đổi roadmap và sales pitch.

---

## 7. CEO, CHÍNH SÁCH, SỰ KIỆN VÀ CAM KẾT

### 7.1. Standing Policies

CEO chọn delivery policy, overtime, pay bands, marketing budget envelope, QA release rule. Policies tự thi hành đến khi đổi, giúp người chơi xử lý bằng **quản trị** thay vì click từng việc.

### 7.2. Promise System

Một lời hứa gồm: **người nhận, cam kết, hạn chót, mức thưởng tin cậy, hậu quả, trạng thái**. Ví dụ: bàn giao dự án trước Week 18; hoàn tất salary review vào cuối quý; ship feature khi đã hứa với 1 customer segment. Game ghi cam kết trong **Promise Ledger** và liên kết với dự báo khả năng thực hiện.

Nếu CEO chấp nhận quá nhiều cam kết, hệ thống hiển thị conflict: hai lời hứa cùng tranh nguồn lực, lịch giao hoặc ngân sách. Giữ lời mang lại trust; vỡ cam kết gây hậu quả tỷ lệ với độ quan trọng và mức kỳ vọng.

### 7.3. Event architecture

Mỗi event có: Trigger → Warning (nếu nghiêm trọng) → Choice (2–4 phương án) → Immediate Effects → Delayed Effects → Explanation. Các hiệu ứng trì hoãn phải được lưu trong simulation state để không biến mất sau khi đóng pop-up.

Nhóm event: people, delivery, customer, product, market, finance, investor và positive opportunity. Nhịp mục tiêu: khoảng 1 meaningful event mỗi 2–4 tuần; major events hiếm hơn; điều chỉnh bằng playtest, không spam cửa sổ.

**Ví dụ — Client Crisis:** khách muốn thêm module ngoài scope khi còn 18 ngày. Chọn làm miễn phí, đề nghị CR, chỉ ưu tiên lỗi hiện có, hoặc overtime; các lựa chọn tác động trust, cash, capacity, morale và release quality theo những con đường khác nhau. Kết quả không phải “đúng/sai” tuyệt đối.

---

## 8. OFFICE WORLD — HTML CANVAS 2.5D ISOMETRIC

### 8.1. Visual direction

- Stylized low-poly **được pre-render thành sprite 2D** hoặc vẽ vector giản lược; màu sáng, ấm, hình khối rõ, nhân vật đọc được trạng thái khi camera zoom vừa.
- **Camera 2.5D trên Canvas 2D:** pan và zoom, một góc isometric cố định trong MVP. Không xoay camera 90° vì sprite pre-rendered cần asset theo góc nhìn mới; không có free camera/3D physics.
- Văn phòng là một **living dashboard**, không phải trò xây nhà thuần túy. Khi dev làm tính năng, QA test, Sales họp, đội khủng hoảng, trạng thái được biểu đạt bằng animation/props/icon nhẹ.
- Hiệu năng ưu tiên: ít nhân vật hoạt ảnh cùng lúc; xa camera dùng animation giản lược.

### 8.2. Gameplay trong môi trường

- Click bàn nhân viên → People Detail và Assignment.
- Click meeting room → Upcoming Decisions / Customer Meetings.
- Click kanban board → Work Board.
- Click finance desk → Cash Flow.
- Click entrance/recruitment terminal → Candidate Pool.
- Trạng thái màu, icon và animation chỉ **gợi ý**, không được là nguồn thông tin duy nhất; mọi dữ liệu phải đọc được bằng panel HTML với text/icon độc lập Canvas.

### 8.3. Văn phòng và nâng cấp

3 cấp môi trường: **Small Office (2–5 nhân viên), Growing Office (6–12), Expanded Office (13–25; post-MVP)**. MVP có 2 cấp đầu, tối đa 12 nhân viên. Nâng cấp tác động công suất chỗ ngồi, chi phí thuê và morale nhỏ; không cần đặt từng chiếc ghế. Nội thất mỹ thuật không bán điểm năng suất vô hạn.

---

## 9. UI / UX SPECIFICATION

### 9.1. IA và navigation

**Home (Office View)** có 4 vùng:

1. **Top HUD:** Cash / trend, morale, trust, week/date, pause/speed; metric quan trọng theo chiến lược.
2. **Canvas Center:** Office 2.5D, clickable entity, camera pan/zoom, status badges. Các panel giao diện là HTML/CSS chứ không vẽ form trên Canvas.
3. **Right CEO Inbox:** việc cần quyết định, rủi ro, deadlines, promises; có thể collapse.
4. **Bottom Navigation:** `Office · Work · People · Market · Finance · Strategy`.

### 9.2. Màn hình chức năng

| Màn hình | Câu hỏi người chơi | Nội dung và hành động |
|---|---|---|
| Office | Điều gì đang xảy ra? | World view, alerts, fast selection, zoom |
| CEO Inbox | Tôi cần quyết định điều gì? | Deadline, urgency, preview, cost CEO Action, snooze/default |
| Work Board | Công việc có kịp không? | Project/Product cards, current sprint, WP, bugs, debt, quality, milestone |
| People | Có đúng đội ngũ không? | Roster, skills, morale/energy, assignments, recruit, training |
| Market | Có ai mua thứ tôi làm không? | Leads, client cards, deals, product segment fit, competitors, marketing |
| Finance | Tiền sẽ còn bao lâu? | Cash Flow chart, burn, payroll, invoices, receivables, runway forecast |
| Strategy | Công ty định đi đâu? | Goals, quarterly focus, Promise Ledger, delivery policies, funding |
| Decision Modal | Lựa chọn nào đáng đánh đổi? | 2–4 choices, instant cost, predicted short/long impact, uncertainty |
| Weekly Review | Tuần vừa qua thay đổi gì? | Before/after KPI, drivers, next-week flags |

### 9.3. UX hierarchy

Mỗi decision modal dùng cùng mẫu: **Situation → Choices → Effects Preview → Confidence → Confirm**. Con số không chắc chắn thể hiện bằng *range* và mức confidence; không giả vờ dự báo đúng tuyệt đối. Mọi thay đổi chính sách có preview chi phí và các rủi ro liên quan.

Icon có text label, không dùng màu đơn độc, các nút click tối thiểu khoảng 40px; font body ở màn hình 1080p nên tương đương tối thiểu 14–16px; hỗ trợ scale UI 100–150%, keyboard navigation, tooltip theo yêu cầu, giảm motion, confirmation với quyết định không thể hoàn tác. Thiết kế cho 1920×1080, kiểm tra không tràn ở 1280×720.

### 9.4. Tutorial / First-time user experience

**Playable tutorial 10–15 phút**: (1) nhìn Cash/Work, (2) giao 1 task, (3) chọn policy, (4) giải quyết 1 tình huống, (5) nhận review tuần, (6) đọc payment hoặc first new customer. Chỉ dạy metric khi metric trở thành đối tượng quyết định. Có tooltips “Learn More”; tutorial không bắt học mọi vai trò kỹ thuật.

### 9.5. Game flow

Main Menu → New Company → Choose Starting Path → Name & Logo → Difficulty → Office Intro → Guided Week 1–4 → Free Simulation → Quarter Review → Year Review → Outcome / Continue Sandbox.

---

## 10. PROGRESSION, THẮNG / THUA VÀ CHƠI LẠI

### 10.1. Stages

| Giai đoạn | Quy mô | Mở khóa |
|---|---:|---|
| Founder | 2–5 nhân sự | 1 team, dự án/sản phẩm đầu tiên, cash basics |
| Small Studio | 6–12 | Parallel work, team policies, ủy quyền một phần, marketing/sales nâng cao |
| Growing Company | 13–25 | Nhiều team, middle management, phòng ban (post-MVP) |
| Established Company | 26–100 | Portfolio, executive team, nhiều địa điểm (future) |
| Tech Enterprise | 100+ | M&A, multi-business, international market (future) |

### 10.2. Game modes

- **Career Campaign:** 36 tháng mô phỏng; mục tiêu rõ theo strategy; sau mốc campaign, có thể tiếp tục Sandbox.
- **Challenge Scenarios:** 6–12 tháng; mục tiêu đặc thù (cứu công ty hết tiền, giao hàng đúng hạn, đưa sản phẩm đạt fit), dùng lại hệ thống mô phỏng.
- **Sandbox:** không ép thắng ở tháng 36; vẫn có failure theo quy tắc insolvency.

### 10.3. Campaign success at Month 36 (T0)

**Product:** MRR ≥ $20.000, churn ≤5%/tháng và Operating Cash Flow dương trong ít nhất 3 tháng liên tiếp.

**Outsourcing:** trailing 3-month operating margin ≥15%, ≥85% milestones đúng hạn và ít nhất 2 khách hàng quay lại.

**Startup:** Market Fit ≥60, Traction đạt ≥1.000 monthly active users **hoặc** MRR ≥$10.000, và runway ≥9 tháng; phần thưởng cao hơn khi founder giữ tỷ lệ cổ phần lớn. Equity là thước đo đánh đổi, không phải điều kiện thất bại ẩn.

**Hybrid:** Khi đổi chiến lược tại Quarter Review, người chơi chọn **primary victory track** mới. Company Legacy Score tổng hợp bền vững, chất lượng, uy tín và people health; mục tiêu không đổi âm thầm.

Không đạt thắng không đồng nghĩa thua ngay: hiển thị company review và cho tiếp tục xây dựng. **Thua cứng** chỉ khi insolvency theo 5.5 hoặc ở challenge có điều kiện thất bại minh định từ đầu.

### 10.4. Replayability

Seed thị trường, candidate pool, hợp đồng, client personality, order của event và nhu cầu phân khúc tạo run khác nhau. Có bảng Company Legacy, achievement nội bộ, New Game+ chỉ ở tương lai (không bắt buộc MVP). Không dùng leaderboard online trong MVP.

---

## 11. CƠ CHẾ CÂN BẰNG (BALANCING)

### 11.1. Economy starting set (T0)

| Chỉ số mẫu | Product | Outsourcing | Startup |
|---|---:|---:|---:|
| Cash ban đầu | $70.000 | $45.000 | $100.000 |
| Headcount | 2 | 2 | 2 |
| Payroll dự kiến/tháng | $6.500 | $6.000 | $7.500 |
| Fixed operations/tháng | $2.000 | $2.000 | $3.000 |
| Doanh thu sẵn có | 35×$79 = $2.765 MRR | Hợp đồng $30.000, deposit $6.000 (thu khi ký) | $0 |
| Áp lực tuần đầu | Churn/roadmap | Deadline/collection | Evidence/runway |

Các con số là **đầu vào tuning**. Marketing, hosting biến thiên và dự báo runway phải phản ánh đúng khoản phát sinh; không dùng bảng ví dụ để thay thế simulation thực.

### 11.2. Difficulty

| Difficulty | Tác động | Nguyên tắc |
|---|---|---|
| Friendly | +25% starting cash; warnings sớm hơn; context tips nhiều hơn | Không xóa các hệ thống quan trọng |
| Standard | Theo T0 | Chế độ chuẩn cân bằng |
| Tough | −15% starting cash; thị trường cạnh tranh hơn, buffer deadline nhỏ hơn | Không random trừng phạt vô lý |

### 11.3. Cân bằng chống chiến thuật thống trị

- **Chỉ tuyển Senior:** hiệu suất cao nhưng payroll lớn và kỳ vọng nghề nghiệp cao.
- **Chỉ Ship Fast:** có tiến độ ngắn hạn nhưng Debt/Incidents/Churn tăng.
- **Chỉ chạy marketing:** leads tăng nhưng churn sẽ nuốt tăng trưởng nếu fit/quality thấp.
- **Luôn overtime:** WP tăng ngắn hạn, suy giảm morale/energy và tăng cost.
- **Nhận mọi hợp đồng:** utilization cao nhưng quá tải, trễ deadline, cash flow biến động.
- **Funding liên tục:** runway tăng nhưng equity dilution và milestones phải trả giá.
- **Phớt lờ QA:** tuần đầu rẻ, nguy cơ post-release tăng; không phải lỗi 100% ngay tức thì.

### 11.4. Kiểm thử cân bằng

- Automated deterministic simulations: cùng seed và sequence actions cho kết quả đúng bằng nhau.
- So sánh **100 seeds**/strategy/difficulty với 3 kiểu policy bots (conservative/balanced/aggressive) để phát hiện các cực trị, không dùng bot win-rate làm thước đo cuối cùng.
- Playtest người chơi mới: mục tiêu ≥80% hoàn thành tutorial trong 15 phút không cần hướng dẫn miệng; ≥70% diễn giải được tại sao cash giảm; ≥70% báo cáo ít nhất 2 quyết định có trade-off rõ sau 45 phút.
- Quan sát các tình huống mất cân bằng: snowball vô hạn, không thể phục hồi sau 1 lỗi nhỏ, payroll crisis không đủ cảnh báo, quyết định lặp gây nhàm chán.

---

## 12. CONTENT SPEC — BỘ NỘI DUNG MVP

| Loại nội dung | Số lượng mục tiêu | Ghi chú |
|---|---:|---|
| Starting playbooks | 3 | Product / Outsourcing / Startup |
| Market segments | 3 | Retail Operations / Creative Teams / Education Services |
| Roles | 5 | Developer, QA, Designer, Sales/Growth, PM/Ops |
| Employee archetypes | 24 | Biến thể skill, wage, 2 traits, tên/ngoại hình seedable |
| Contract templates | 6 | Fixed Price + Time & Materials; scope/giá/timing đa dạng |
| Product concepts | 3 | Project tool, Retail SaaS, Creator/Team workflow |
| Feature cards | 18 | 6 feature/concept; có customer need, effort, risk, retention/acquisition effect |
| Experiment cards | 6 | Interview, landing page, paid pilot, prototype test, A/B offer, referral test |
| Investor term sheet types | 3 | Một round/campaign trong MVP |
| Event templates | 18 | 6 people/delivery, 5 client/product, 4 finance/market, 3 opportunity/investor |
| Office environments | 2 | Small Office / Growing Office |
| Short challenge scenarios | 3 | Một thử thách đặc trưng mỗi path, ưu tiên sau campaign core |
| Tutorial steps | 6 | Dạy dần theo context |

**Yêu cầu nội dung:** Event text ngắn, tông nhẹ và giàu tình huống nhưng không lố; feedback câu chuyện có thể vui mà không xúc phạm nghề nghiệp. Lời thoại và thông báo dễ dịch EN/VI; engine không hardcode ngôn ngữ. 18 event templates được kích hoạt theo trigger và có parameter variation; không dùng thuần random vô hạn.

**Ví dụ cụm event:** scope creep, payment delay, key employee burnout, poaching attempt, urgent production bug, competitor price cut, lucky referral, unexpected renewal, proposal discount request, staffing mismatch, user churn spike, cloud cost increase, investor term sheet, launch window, team conflict, positive press mention, client wants pilot, promise deadline conflict.

---

## 13. MVP SCOPE, VERTICAL SLICE VÀ PHẠM VI LOẠI TRỪ

### 13.1. Prototype — chứng minh core loop

**Bao gồm:** một căn phòng nhỏ, tối đa 3 nhân viên, một hợp đồng, task WP, tiền, lương, tiến độ, policy, 2–3 sự kiện, Pause/Speed, một chu trình thanh toán. **Exit:** người chơi đưa được 3 quyết định có tác động nhìn thấy trong 15–20 phút; hệ thống cho phép thất bại vì lựa chọn hợp lý, không vì lỗi/ẩn số vô nghĩa.

### 13.2. Vertical Slice — ưu tiên Outsourcing

**Bao gồm:** 1 hợp đồng từ lead tới collected cash; estimate range, deadline, QA, bugs, tech debt giản lược, CR, client trust, hiring/assignment, cash forecast, Office View + CEO Inbox. **Exit:** hoàn thành được hợp đồng theo ít nhất 2 chiến lược khác nhau; trễ/QA thiếu/cash delay có hậu quả được giải thích.

### 13.3. MVP Playable — ba hướng, một simulation core

**Must have:** 3 starting playbooks; 5 roles; 2 office tiers; WP/scheduling; cash/payroll/receivable; fixed-price và T&M; 1 sản phẩm subscription; startup validation/fundraising một vòng; reputation/trust; 3 policy; decisions/events/promises; UI screens; tutorial; 36-month campaign; save/load; pause x1/x2/x4; standard/friendly/tough; basic audio/VFX/animation; **chơi qua URL không cài đặt/đăng nhập; local save qua IndexedDB**; chơi tiếp Sandbox; tiếng Anh và tiếng Việt là mục tiêu localization (vertical slice có thể chỉ một ngôn ngữ).

**MVP giới hạn:** ≤12 nhân viên, ≤2 dự án khách hàng đồng thời, ≤1 sản phẩm riêng, ≤1 funding round, một văn phòng active, không có multi-location, không có M&A, không có multiplayer, không có DLC/in-app purchases, không có LLM.

### 13.4. MoSCoW

- **Must:** một vòng lặp ra quyết định đáng chơi; đúng đắn cashflow; software lifecycle; 3 hướng kinh doanh khác nhau; cảnh báo/giải thích; save/load; onboarding.
- **Should:** 2 cấp văn phòng, candidate traits, promise conflicts, trend chart, contextual events, localization EN/VI.
- **Could:** decorative office customization, nhiều skin nhân vật, thêm phân khúc, achievements.
- **Won't in MVP:** stock market/IPO, multiple sites, enterprise governance, detailed legal/tax, multiplayer, generated LLM dialog, simulation thousands of individual employees.

### 13.5. Acceptance criteria / Definition of Done

**Logic & Simulation**

1. Một seed + một chuỗi quyết định tái tạo cùng WP, customer count, contract results, cash và event outcome sau load.
2. Chi phí lương trả theo tháng; deposit/invoice chỉ tăng cash khi đã cleared; màn hình Finance khớp ledger 100% trong test cases.
3. Product có acquisition, churn và MRR tác động thực đến cash; Outsourcing có estimate→delivery→acceptance→collection; Startup có evidence→offer→dilution→runway.
4. QA và refactor có opportunity cost; policy Fast/Quality tạo đường đánh đổi rõ khi chạy test với cùng seed.
5. Forecast trễ hạn, cạn tiền và morale xuống thấp có cảnh báo có thể hành động; quyết định quan trọng hiển thị estimate/risk.
6. Không dead-end vô lý: trạng thái không thể tiếp tục phải có failure screen với lý do, lịch sử nguyên nhân và lựa chọn retry/restart.

**UX & Gameplay**

7. Người mới hoàn thành onboarding trong tối đa 15 phút theo mục tiêu playtest; UI không buộc hiểu thuật ngữ code để chơi.
8. Cả 3 hướng đều có tuần mở đầu, nguồn thu/tiến trình khác nhau và mục tiêu campaign rõ; có thể chuyển trọng tâm tại Quarter Review.
9. Player có thể tạm dừng, đổi tốc độ, xem timeline và hiểu tác động delayed effects.
10. Office và mọi tương tác quan trọng đều có đường truy cập từ UI; không bắt camera hunting.

**Engineering/Quality Targets**

11. Save/load bảo toàn RNG state và pending events; autosave cuối mỗi tuần + manual save; có schema version cho save.
12. Mục tiêu 60 FPS trong Chrome/Edge/Firefox/Safari desktop tại 1280×720 và 1920×1080 sau profiling; simulation phải giữ determinism khi FPS thấp hoặc tab chuyển sang background.
13. Giao diện không tràn/cắt thao tác quan trọng ở 1280×720; hỗ trợ UI scale, keyboard navigation và lựa chọn giảm motion.
14. Có log simulation và test matrix cho 3 archetype × 3 difficulty × 100 seeds để hỗ trợ cân bằng.

---

## 14. KẾ HOẠCH TRIỂN KHAI THIẾT KẾ (KHÔNG PHẢI CODE PLAN)

| Cột mốc | Sản phẩm kiểm chứng | Câu hỏi cần trả lời |
|---|---|---|
| M0 — Paper/Economy Prototype | Bảng trạng thái, rule sheet, mô phỏng thủ công theo tuần | Trade-off có thú vị và đủ rõ không? |
| M1 — Graybox Prototype | Office blockout, HUD, 1 contract, WP, cash, 3 decisions | Chơi được 20 phút và thấy hệ quả chưa? |
| M2 — Vertical Slice | Outsourcing hoàn chỉnh với QA, acceptance, invoice, events | Lặp lại có đáng chơi không, không biến thành spreadsheet? |
| M3 — Shared Simulation | Product + Startup dùng core chung | Ba chiến lược có khác biệt mà không tạo 3 game riêng không? |
| M4 — MVP Content/Polish | Tutorial, nội dung, UI, balancing, save/load, animation/audio | Người mới chơi và hiểu được sau 15 phút không? |

Không đưa ra timeline/cost phát triển khi chưa chốt team, trình dựng Canvas, pipeline sprite và kết quả vertical slice.

---

## 15. RISKS, TRADE-OFFS VÀ NGUYÊN TẮC GIẢI QUYẾT

| Rủi ro | Phương án |
|---|---|
| Quá nhiều số liệu như spreadsheet | Layered UI, KPI theo path, chỉ số có “why” và “what next” |
| Quá ít chiều sâu, chỉ bấm nút chờ | Promise conflicts, real cashflow, delayed consequences, nhân sự có tình huống |
| Startup và Product trùng nhau | Khác trạng thái ban đầu, victory track, validation/funding loop |
| Ba chế độ nhân ba scope | Shared company/work/finance/people core; khác rule module và scenario data |
| Ngẫu nhiên làm người chơi ức chế | Seeded RNG, warning, confidence, decision trail, recovery routes |
| Office building lấn át CEO gameplay | Office là visualization/soft upgrade, không micro furniture |
| Overtime / Ship Fast thành meta vô đối | Burnout, defects, debt, churn, diminishing returns |
| Economic death spiral quá sớm | Cash forecast, crisis grace period, Friendly mode, rescue options |
| AI đối thủ tạo bất công | Đối thủ giả lập bằng market signals minh bạch, chưa cần agent NPC |
| Nhiều loại metrics khó kiểm thử | Entity schema + invariant + seed replay + acceptance matrix |

---

## 16. MẪU 8 TUẦN ĐẦU — OUTSOURCING TUTORIAL CAMPAIGN

| Tuần | Tình huống | Quyết định / khái niệm được dạy |
|---|---|---|
| 1 | Khách hàng đề nghị dự án $30k | Estimate, proposal, deposit |
| 2 | Dev bắt đầu, QA có việc chuẩn bị | Task assignment, WP, weekly review |
| 3 | Bảng tiến độ cho thấy confidence giảm | Ưu tiên, re-estimate, policy |
| 4 | Nhân viên mệt vì overtime | Energy, morale, cost |
| 5 | Khách muốn bổ sung yêu cầu | Change Request vs client trust |
| 6 | QA phát hiện lỗi major | Quality gate, fix, tech debt |
| 7 | Đạt nghiệm thu giai đoạn | Invoice issued ≠ cash received |
| 8 | Tiền chưa về đúng lịch, payroll sắp tới | Cash forecast, collection, CEO priorities |

Các biến cố được **dẫn dắt** ở lần chơi tutorial để dạy cơ chế; từ run tiếp theo, kết quả phụ thuộc seed và quyết định, không cố định thất bại.

---

## 17. DECISION RECORD — NHỮNG ĐIỂM ĐÃ CHỐT

**Đã chốt:** Balanced Tycoon; target casual tycoon audience; **Web browser + HTML Canvas 2D cho văn phòng isometric 2.5D**; desktop-first, single-player, không cần cài đặt/đăng nhập; 3 chiến lược khởi đầu có thể hybrid; simulation-led; visual office là living dashboard; mục tiêu trước tiên chứng minh Outsourcing vertical slice; v1.1 chỉ làm thiết kế, chưa source code.

**Giả định triển khai để tiếp tục đặc tả (có thể đổi sau playtest):** campaign 36 tháng; đơn vị USD; 3 CEO Actions/tuần; ≤12 nhân viên MVP; 1 funding round; 3 phân khúc; 18 event templates; tình trạng cash crises có thời gian khắc phục; 2 ngôn ngữ mục tiêu.

**Cần xác nhận bằng prototype/playtest, không khóa cứng:** tốc độ thời gian, hệ số Work Points, chi phí/giá sản phẩm, nhịp sự kiện, mục tiêu chiến thắng, mức phức tạp UI, pixel-art hay pre-render low-poly sprite, trải nghiệm touch/responsive, scope localization và độ dài một run.

### Design north star

> **Mỗi tuần, người chơi cần có ít nhất một quyết định mà hai phương án đều có lý do để lựa chọn. Sau vài tuần, người chơi phải nhìn thấy và hiểu được hậu quả từ quyết định ấy.**



---

## 18. WEB-FIRST TECHNOLOGY DECISION (ARCHITECTURE BASELINE)

### 18.1. Phạm vi quyết định

- **Runtime:** Các trình duyệt hiện đại (Chrome, Edge, Firefox, Safari). Người chơi truy cập URL qua HTTPS, mở menu và bắt đầu New Company.
- **Render:** Native HTML Canvas 2D, orthographic/isometric 2.5D bằng sprites và 2D transforms. Không có mesh/lighting/physics 3D thật.
- **Management UI:** React + HTML/CSS cho HUD, modal, bảng, biểu đồ, form và accessibility.
- **Programming Language:** TypeScript. **Build:** Vite; output là thư mục static HTML/CSS/JS/assets.
- **Game Engine:** Simulation Core viết độc lập renderer và UI framework. Không phụ thuộc DOM, Canvas hoặc React trong rule modules.
- **Game Persistence:** IndexedDB cho saves/snapshots; localStorage chỉ cho một số thiết lập nhỏ. Cho phép export/import file save JSON.
- **Distribution:** CDN/static host, ưu tiên Cloudflare Pages. Không có backend/API trong MVP; không có authentication.

**Tại sao không dùng Unity WebGL hoặc engine 3D:** Nhu cầu MVP chỉ có một văn phòng isometric, 12 nhân viên tối đa, một góc camera, tương tác click. Canvas 2D giảm độ phức tạp build, tải tài nguyên và vận hành; không cần giả lập đầy đủ 3D. **Đánh đổi:** Không có camera orbit tự do hoặc góc nhìn 3D thật.

**Trường hợp chuyển renderer:** Nếu playtest/art direction đòi nhiều particles, ánh sáng động hoặc hàng trăm sprites, có thể thử PixiJS với renderer WebGL. PixiJS vẫn xuất hình qua phần tử canvas nhưng **WebGL khác Canvas 2D API**; không đồng nhất hai công nghệ. Simulation Core và domain UI phải giữ độc lập để đổi renderer mà không viết lại logic game.

### 18.2. Logical architecture

| Lớp | Ownership | Không được làm |
|---|---|---|
| Simulation Core | Company state, clock, commands, RNG, deterministic updates, financial ledger, game rules | Không truy cập DOM, Canvas, React, browser storage |
| Game Application | Command dispatcher, scene navigation, derived selectors, pause/speed | Không viết nghiệp vụ tài chính trực tiếp trong UI |
| Canvas Office Renderer | Tiles/sprites, animation interpolation, camera, hit testing, selection highlights | Không tính salary, churn, WP hoặc random events |
| HTML Management UI | HUD, CEO Inbox, Work Board, People, Finance, dialogs | Không tự thay đổi simulation state ngoài Game Commands |
| Persistence | IndexedDB snapshots, schema migration, import/export, validation | Không giả định local browser saves là cloud save |
| Content | Scenario/config, events, employee archetypes, localization, asset manifests | Không hardcode nội dung vào game loop |

**State flow:** Player input → Validated Game Command → Simulation Core → New State + Game Events → UI/Canvas projections → Save snapshot.

**Testing principle:** Gameplay phải chạy được ở môi trường test không có browser để replay simulation theo seed và kiểm tra accounting invariants.

### 18.3. Sim Time & Render Time

- Canvas vẽ theo `requestAnimationFrame` với animation interpolation.
- Simulation dùng **fixed-step virtual clock**, không dùng thời gian khung hình làm đơn vị logic. FPS thấp không được làm thay đổi kết quả kế toán hoặc xác suất sự kiện.
- Pause/Speed thay đổi số bước simulation theo thời gian thực có kiểm soát; không cho tích lũy bước vô hạn nếu máy bị lag.
- Khi tab bị ẩn, tự pause; khi người chơi quay lại, hiển thị trạng thái trước đó và thông báo ngắn. **Không tự chạy bù số giờ đã rời tab.**
- Random events phải sử dụng seeded PRNG do core quản lý; save/load khôi phục RNG state và deferred effects.

### 18.4. Rendering & Isometric Scene Specification

- **Scene MVP:** 1 văn phòng đang hoạt động, 2 office tiers; floor tile, walls, desks, meeting zone, 2–12 NPC, kanban board, finance corner, click hotspots.
- **Projection:** Tile grid Cartesian (x, y) chiếu sang 2D isometric bằng phép biến đổi tọa độ nhất quán. Sprite có anchor tại chân vật thể để tính depth sort.
- **Layer order:** Floor → furniture/walls → staff → contextual markers → selection overlay; occlusion dựa trên vị trí chân trong world, không theo thứ tự spawn.
- **Camera:** Pan bằng drag, zoom bằng wheel/controls, fit-to-office button. Góc nhìn cố định. Không xoay 90 độ trong MVP.
- **Interaction:** Pointer events, hit regions và selection trên Canvas; lựa chọn nhân viên/tòa nhà mở panel HTML tương ứng. Nếu click thất bại, có navigation tương đương bằng HTML.
- **Animation:** Idle, Working, Meeting, Walking, Alert cho NPC; tối thiểu 4–6 trạng thái icon/animation được map từ simulation state. Animation không ảnh hưởng Work Points.
- **Asset pipeline:** Ban đầu vẽ bằng primitive shapes để kiểm chứng; visual assets dùng sprite sheets WebP/PNG được dựng từ low-poly hoặc minh họa 2D. Chỉ tải sprites phù hợp scene hiện tại. 
- **DPI:** Resize theo CSS pixel và devicePixelRatio có giới hạn hợp lý, tránh canvas backing buffer quá lớn.
- **Performance:** Cache static floor/walls, object pooling hoặc batching khi cần; không để React re-render mỗi frame.

### 18.5. Responsive & Input

**MVP target:** desktop/laptop 1280×720 đến 1920×1080 với chuột và bàn phím. Desktop Safari là target thực thụ, không chỉ Chrome.

**Tablet landscape:** responsive layout và pointer/touch support ở mức beta; kiểm thử khả năng click và đóng panels.

**Mobile portrait:** không bảo đảm trải nghiệm tycoon đầy đủ trong MVP; plan riêng cho compact navigation và fullscreen panel. Trò chơi web **không đồng nghĩa tự động tối ưu mọi màn hình**.

**Accessibility:** quản lý các tác vụ và quyết định chính bằng panel HTML có focus order, keyboard shortcuts, accessible labels; Canvas là phần thế giới minh họa, không là đường điều hướng duy nhất.

---

## 19. SAVE/LOAD, SECURITY & DEPLOYMENT

### 19.1. Local Saves

- Auto-save mỗi tuần mô phỏng; tối thiểu 3 save slots cho người chơi.
- Snapshot chứa save schema version, company state, in-game clock, RNG state, pending events/promises, scenario version, và checksum/validation metadata.
- Lưu tại IndexedDB; restore sau reload trong cùng browser/profile; export/import file để chuyển thiết bị thủ công.
- Cảnh báo rằng xóa dữ liệu website, private browsing hoặc chính sách lưu trữ trình duyệt có thể làm mất save. **Không hứa cloud save** khi chưa có server/account.
- Khi phát hành update, schema migration phải bảo vệ dữ liệu; nếu save không tương thích, UI phải thông báo rõ thay vì âm thầm reset.

### 19.2. Static Hosting

- Build thành static files; deploy HTTPS lên Cloudflare Pages hoặc host tương đương.
- Tạo preview URL để QA trước release; production chỉ nhận release đã đạt acceptance criteria.
- URL mở trực tiếp menu game, không cần plugin browser, app install, Steam, tài khoản hoặc server-side session.
- Nếu muốn hỗ trợ offline sau lần tải đầu: service worker/PWA cache là **option ở bản sau**; không coi đó là điều kiện để chơi online không cần cài đặt.
- Không cần lưu PII; không thu thập dữ liệu cá nhân trong MVP; telemetry là tùy chọn và cần chính sách minh bạch nếu thêm sau này.

### 19.3. Web Performance Budgets (T0)

| Metric | Mục tiêu để thử nghiệm |
|---|---|
| Target refresh | 60 FPS desktop sau profiling; giảm hiệu ứng khi thiết bị yếu |
| Simulation outcome | Quyết định replay theo seed bất kể FPS/refresh rate |
| Scene population | 12 nhân viên, 1 văn phòng active |
| First playable | Ưu tiên tải asset theo scene, không đợi tải toàn bộ content |
| Initial download | Ngân sách thử nghiệm dưới 15 MB ở first-play, cần kiểm chứng khi có sprites/audio thật |
| Input responsiveness | Ưu tiên phản hồi click trực quan ngay, phần tính toán game không blocking UI dài |
| Save behavior | Tự động mỗi tuần, manual save, recovery sau reload |
| Browser support | Chrome, Edge, Firefox, Safari desktop phiên bản còn được hỗ trợ |

Mục tiêu performance là **budget**, không phải số đo đã kiểm chứng.

---

## 20. WEB MVP — STAGED IMPLEMENTATION & ACCEPTANCE

### 20.1. Stages

| Stage | Nội dung | Exit criteria |
|---|---|---|
| W0 — Canvas Proof | Isometric tile map, camera pan/zoom, 3 NPC, click hit-tests, accessible HTML panel | Mở URL browser là dùng được; không cài app; click chính xác |
| W1 — Sim Graybox | Fixed-step clock, cash, payroll, WP, project progress, policy, seeded RNG, 3 CEO Decisions | 15–20 phút gameplay có trade-off thực; FPS không làm sai logic |
| W2 — Outsourcing Vertical Slice | Contract, milestone, QA, CR, invoice, collection, cash crises, weekly review | Kết thúc hợp đồng theo ít nhất 2 chiến lược; báo cáo giải thích hậu quả |
| W3 — Three-Path MVP | Product subscription/churn + Startup validation/funding trên core chung | Ba playbooks chơi độc lập, giữ gameplay khác nhau; có chuyển hướng nhẹ |
| W4 — Release-ready Web MVP | Save slots, tutorial, 18 events, 2 office tiers, animation, EN/VI, QA cross-browser, deployment | Public URL chạy ổn định, không login/cài đặt, có lưu và phục hồi |

### 20.2. Browser-Specific Definition of Done

1. Người dùng mở URL HTTPS trên desktop Chrome/Firefox/Edge/Safari và có thể New Game mà không cài đặt app.
2. Office hiển thị bằng HTML Canvas 2D; ít nhất các NPC, progress và context alert thay đổi khi game state thay đổi.
3. Cùng Game Command + seed tạo trạng thái mô phỏng giống nhau trước và sau reload; engine test chạy độc lập trình duyệt.
4. Tất cả nghiệp vụ quản trị có thể thao tác qua HTML UI, không phụ thuộc việc click chính xác một sprite nhỏ.
5. Sau reload, save tự động khôi phục đúng company cash, clock, employees, contracts, pending events và RNG state.
6. Xóa dữ liệu browser được giải thích rõ; export/import thực sự phục hồi được game.
7. Không có sự kiện bất ngờ tiến triển khi người chơi chuyển tab và quay lại nếu chưa bấm Resume.
8. Finance ledger không xuất hiện sai lệch vì render hoặc refresh rate; payroll, invoice, revenue/cash được kiểm thử.
9. Game hoạt động 30 phút liên tục ở x1/x2/x4 không tích lũy số lượng sprites hoặc event listeners mất kiểm soát.
10. Không có modal, action hoặc thông tin bắt buộc bị cắt ở 1280×720; có chỉ báo rõ khi mobile viewport chưa hỗ trợ.
11. Bundle production không yêu cầu backend/API; static deployment và rollback đã được thử nghiệm.
12. Không phát hành production trước khi cross-browser smoke test và save migration test đạt yêu cầu.

### 20.3. Scope Exclusions

Không có WebSocket/realtime backend, cloud multiplayer, cloud save xuyên thiết bị, microtransactions, in-browser developer console, 3D physics, 3D free camera hay tự động render bằng AI trong MVP.

---

## 21. DECISION CHANGE LOG

| ID | Quyết định | Trạng thái | Ảnh hưởng |
|---|---|---|---|
| ADR-WEB-001 | Phát hành bằng web URL; không app/launcher | Chốt | Thay thế native PC distribution |
| ADR-WEB-002 | Office isometric bằng Canvas 2D | Chốt | Giữ 2.5D, bỏ 3D runtime và rotate tự do |
| ADR-WEB-003 | React/HTML quản trị, không vẽ form trong Canvas | Đề xuất baseline | UI/accessibility dễ quản lý |
| ADR-WEB-004 | Simulation Core độc lập UI/renderer | Chốt kiến trúc | Có thể test seed và đổi renderer |
| ADR-WEB-005 | Không backend/login ở MVP | Chốt MVP | Không có cloud save; dùng IndexedDB/export |
| ADR-WEB-006 | Desktop-first, tablet hỗ trợ dần | Đề xuất baseline | Chưa cam kết mobile portrait MVP |
| ADR-WEB-007 | Tạm giữ nguyên balancing rules v1.0 | Chốt | Platform pivot không đổi core game |

**Tài liệu này điều chỉnh GDD v1.0 và thay thế các mục nền tảng, render, save/load, UI và delivery tương ứng. Chưa viết source code.**


*End of GDD v1.1 — Web Edition — Design only; no source code.*
