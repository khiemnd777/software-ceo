# ADR-002 — Lịch15phút và tích hợp24h (D1–D8/G0–G8)

2026-10-26. Owner đã duyệt TIME-24H-INTEGRATION-PLAN-001 D1–D8/G0–G8. Trạng thái implementation đang thực hiện, không phải nghiệm thu.

- Một ngày nghiệp vụ bắt đầu từ1; clock.minute là đầu khoảng15phút. clock.lastClosedDay là số ngày đã đóng. clock.opened bảo vệ opening hooks. Đóng ngày luôn ghi nhận ngày hiện hành trước chuyển day+1; outcome dùng lastClosedDay để đọc ngày kết thúc.
- Mở ngày: collectDue/eventsDay/productDay một lần. Khoảng làm: work→health→accrual. Đóng ngày: contracts/experiments→weekly (bỏ health tuần)→productMonth/payroll→warnings/insolvency/progression. Critical tại opening hoặc interval dừng batch ngay; tiếp tục không chạy opening lần nữa.
- Năng lực nền/224quarter chuẩn/tuần. OT18–20 có rate0,8; capacity không nhân OT1,2. Working/idle/presence dùng cùng eligibility theo task. Lương base phát sinh khi còn được thuê; premiumOT chỉ khi runnable ở đầu khoảng.
- Energy/hour: thường−0,6; OT−1,2 (Driven thêm−3/14); trưa+23/35; ngoài giờ+13/35; Steady thường ngoài giờ thêm2/105. Morale trưa+0,05; nghỉ18–22 +3/560/h; OT−177/560/h; Energy thấp khi làm chuẩn thêm−2,5/(7×8)/h. Không cộng trừ health lần nữa ở weekly. Các neo không chạm clamp: E+10/−12 (Driven−15,Steady+12); M+0,5/−4 mỗi tuần.
- Payroll denominator14400: mỗi quarter base salary×5, premium salary×12; chia/tách carry sau từng nhân viên để giữ safe integer. OPEX denominator2880. Work labor có carry fractionalcent riêng và chỉ là phân bổ. Pending cents không thay cash/ledger; monthly settlement mới post; carry chưa đủcent được giữ qua kỳ.
- Defect/QA roll budget xác định lazy một lần theo employee+assignment-slot+kind+day, không reset khi đổi target/policy; phát sinh khi exposure WP chạm roll và tối đa một occurrence/budget/day. Research/discovery có budget tích lũy theo target, bắt đầu từ min(1, daily base capacity) ở lần đầu, không hoàn tất bằng WP cực nhỏ. Snapshot giữa ca giữ budget/exposure/RNG. Stream mới không hứa byte-identical T0.3.
- Newgame00:00/day1/Pause. v2dayN đã đóng→v3dayN+1/00:00, lastClosedDayN, openedfalse, không chạy hook/RNG khi load. Kỳ tài chính v2 đang dở dùng settlement cũ một lần; không cộng accrual mới lên cùng kỳ.
- IndexedDB upgrade tạo backup store riêng, transaction ghi save kiểmrevision và giữ original legacy payload trước overwrite. Decode chỉ migrate RAM. Backup có đường export gốc; quota/conflict abort cả transaction.
- App accumulator theo game-time; Pause/speed giữ phaseRAM; restore/newgame/jump reset. Gap bất thường>1s Pause và bỏ delta. Renderer lấy visualTime chung, không mutate simulation. Weather hash riêng theo seed/day, lights lưu trong scene, không cost/action.

Loại bỏ: hai engine daily/intraday cùng chạy; nhân OT hai lần; RNG mỗiquarter không budget; suy diễn historical accrual v2; import docs/mockups từ runtime; đổi art hoặc chỉnh số chỉ để bot thắng.

Kiểm chứng/nhật ký gate: evidence/time-24h/integration-2026-10-26/. Các mức sức khỏe/RNG là contract triển khai đã cụ thể hóa trong G0, còn human acceptance giữ OPEN. Lịch quý dùng lastClosedDay cho cửa sổ đổi trọng tâm, mở sau khi ngày90/180 đã đóng; không mở sớm vào đầu ngày90.

Rà renderer: giữ path mask ghế đã duyệt gồm seat-rim344/366/343; cache badge có alpha để không tạo viền đen trên foreground trong suốt. Cache ánh sáng cửa dùng weather from/to/alpha, tránh vệt sáng cũ khi tải save khác seed tại cùng giờ. Escape ngoài panel chỉ đóng tooltip, không lên lịch đổi focus vào finder. Các thay đổi này bảo toàn hợp đồng UI/Canvas trong gói đã duyệt.
