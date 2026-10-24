# Báo cáo cân bằng T0.3

## Kết quả đã chạy lại LOCAL macOS (2026-10-21)

**900 chiến dịch, 892 đạt mục tiêu; 900 sống sót; 0 run có lỗi invariant; 0 lệnh bot bị từ chối.** Thời gian tính: 143.763 giây. Mỗi campaign chạy 1.080 ngày trừ khi công ty mất khả năng thanh toán.

Nguồn số liệu: `evidence/balance-900.json` và `evidence/balance-900.csv`. Phiên bản trước được giữ trong balance-T0.2.*. Source digest của simulation/gameplay/content: `7745c43a4ca8979f87e06ea20e2deabdb4ca18dbb9263db025629342956bf4b5`. Kết quả này không phụ thuộc browser, tốc độ hoạt ảnh hay giờ trên máy.

## Phương pháp và giới hạn

Ba mô hình × ba độ khó × seed 1–100. Seed modulo ba chọn Quality First (34 seed/nhóm), Balanced (33) hoặc Ship Fast (33). Bot gọi cùng public commands như giao diện: phân công, QA, sửa lỗi, event, marketing, tuyển người hỗ trợ và vay khi cần. Không bơm tiền, sửa WP, thay scope hay bỏ cổng chất lượng vào state.

Bot có quyền đọc state đầy đủ, kể cả actual scope trong logic hoàn thành. Vì vậy đây là người vận hành rất có thông tin; không tương đương người mới chơi. Bot Outsourcing giữ hai người, làm một dự án nối tiếp. Bot Product/Startup chủ động tuyển hỗ trợ khi queue tăng. Nhóm Fast Outsourcing chọn T&M có trần; các nhóm kia chọn Fixed Price. **So sánh policy ở đây là so sánh toàn bộ cách vận hành, có yếu tố gây nhiễu; không phải thí nghiệm giữ nguyên mọi thứ chỉ thay policy.**

Các invariant được kiểm trong quá trình chơi gồm tiền không âm và sổ cái cân bằng. Schema/reference/ledger validation chạy lại ở trạng thái cuối. Những kiểm tra không biến một run bot thành playtest con người hoặc chứng nhận game đã cân bằng thương mại.

## Theo mô hình và độ khó

Tiền là USD giả lập. Biên lợi nhuận là ba tháng gần nhất; không phải biên lợi nhuận toàn đời công ty.

| Mô hình | Độ khó | Đạt mục tiêu | Tiền cuối trung vị | P10–P90 tiền cuối | Biên LN trung bình | Nhân sự TB |
|---|---|---:|---:|---:|---:|---:|
| outsourcing | friendly | 97/100 | $365,450 | $317,050–$411,050 | 46.4% | 2.0 |
| outsourcing | standard | 97/100 | $354,200 | $305,800–$399,800 | 46.4% | 2.0 |
| outsourcing | tough | 98/100 | $347,450 | $295,050–$393,050 | 48.5% | 2.0 |
| product | friendly | 100/100 | $1,334,886 | $1,217,536–$1,477,295 | 78.5% | 5.0 |
| product | standard | 100/100 | $1,286,256 | $1,163,434–$1,395,062 | 78.2% | 5.0 |
| product | tough | 100/100 | $1,007,193 | $900,111–$1,084,243 | 74.8% | 4.8 |
| startup | friendly | 100/100 | $1,519,929 | $1,287,460–$1,815,332 | 77.6% | 6.4 |
| startup | standard | 100/100 | $1,494,929 | $1,254,808–$1,790,332 | 77.6% | 6.4 |
| startup | tough | 100/100 | $1,246,817 | $1,085,001–$1,496,627 | 74.7% | 5.9 |

Product và Startup tăng tiền rất mạnh sau khi tối ưu fit, retention và hỗ trợ. Bot thắng mọi seed ở hai mô hình này. Chưa đủ bằng chứng rằng nửa sau chiến dịch còn áp lực chiến lược phù hợp với người chơi. Chênh lệch độ khó, nhất là Outsourcing, còn yếu theo mẫu đo này: Tough không có tỷ lệ thắng thấp hơn Standard. Đây là mục cần ưu tiên điều chỉnh bằng lượt chơi có quan sát.

## Ba cách vận hành

| Policy của bot | Số run | Đạt mục tiêu | Incident TB | Lỗi còn lại TB |
|---|---:|---:|---:|---:|
| quality | 306 | 298 | 0.05 | 0.70 |
| balanced | 297 | 297 | 0.04 | 0.80 |
| fast | 297 | 297 | 0.03 | 1.07 |

Các số trên có thể mô tả mẫu, không chứng minh Fast là tối ưu hay Quality vô dụng. Bộ 270 lượt ghép cặp được bổ sung bên dưới giữ cùng hợp đồng/nhân sự/giá và quy tắc vận hành. Kết quả chưa đủ để kết luận meta dài hạn.

## Đối chứng không quản lý

Giữ công ty khởi tạo seed 42, Standard, chỉ cho ngày chạy, không ký/giao việc/thu hồi khủng hoảng:

| Hướng | Ngày kết thúc | Trạng thái |
|---|---:|---|
| outsourcing | 194 | insolvent |
| product | 644 | insolvent |
| startup | 314 | insolvent |

Điều này xác nhận bỏ mặc công ty có hậu quả trong luật hiện tại. Nó không đo mức khó của một chiến lược yếu nhưng vẫn có thao tác.

## Challenge deadline và quyết định tuyển người

Bot mặc định hai người chỉ hoàn thành hai hợp đồng trong 180 ngày, nên không đạt mục tiêu ba hợp đồng. Một kịch bản riêng seed 42, Standard tuyển thêm Dev ngay từ đầu, dùng Fixed Price, QA/sửa lỗi và từ chối scope bổ sung. Không thay state ngoài public commands.

| Policy | Hợp đồng xong | Mốc đúng hạn | Tiền cuối | Kết quả |
|---|---:|---:|---:|---|
| quality | 3 | 100% | $50,710 | Thắng |
| balanced | 3 | 100% | $68,710 | Thắng |
| fast | 3 | 100% | $76,710 | Thắng |

Trace đầy đủ: evidence/deadline-staffing.json. Hai challenge Rescue và Market fit cũng có run seed 42 đạt mục tiêu trong báo cáo 900-run. Đây là bằng chứng có lời giải, không phải chứng minh mọi seed đều cân bằng.

## Các quyết định T0.2 → T0.3

- Support trở thành hàng đợi dùng năng lực nhân viên thực; bot phải dành nhân lực giải quyết. Không có cơ chế xóa queue miễn phí.
- T&M dùng effort thực, kể cả QA và sửa lỗi hợp lệ; chặn farm QA/XP khi không còn công việc.
- Chiết khấu báo giá tính từ template gốc để việc đổi đi đổi lại không tăng giá hoặc trust vô hạn.
- Tiền chi từ hiệu ứng chậm được ghi thành liability nếu thiếu cash, tránh làm ngày game kẹt.
- Trait Client-Friendly có +8% research; mô tả Fast Learner khớp +20% XP hiện thực.
- Độ nhạy giá và kỳ vọng chất lượng của ba phân khúc đã đi vào conversion/churn.

## Chưa được chốt bằng số liệu này

1. Người mới có hiểu được trong 15 phút hay không; chưa có người tham gia playtest.
2. Thời lượng 4–7 giờ và chất lượng quyết định từng tuần; bot không đo được cảm giác chơi.
3. Áp lực cuối campaign, khác biệt Friendly/Standard/Tough và chiến lược trội; cần thử ghép cặp và quan sát người chơi.
4. Độ khó cảm nhận của các concept ngoài Retail: 1200 lượt dài hạn đã được bổ sung bên dưới, nhưng chưa có playtest người thật.

Không tăng mức khó chỉ để ép tỷ lệ thắng về một con số tùy ý. Bộ policy ghép cặp đã hoàn tất bên dưới; bước tiếp theo là playtest người mới, rồi chỉnh tham số với mục tiêu cụ thể, giữ baseline và chạy lại regression. Bản hiện tại giữ nguyên các mức vốn/WP/milestone chủ đạo của GDD.

## Đo bổ sung LOCAL macOS — 2026-10-21

Giữ nguyên T0.3, toàn bộ luật gameplay và art V4. Bot chỉ thêm đầu vào concept/segment tùy chọn; mặc định Retail giữ nguyên. Kiểm thử regression đối chiếu đầu vào Retail tường minh và mặc định.

### Creative và Education

1.200 campaign: `creator/creative` và `team/education` × Product/Startup × ba độ khó × seed 1–100. Policy luân phiên theo seed giống bộ Retail. Tất cả chạy đủ 1.080 ngày, thắng và sống sót; không lệnh bị từ chối hoặc lỗi invariant. Outsourcing dùng catalog hợp đồng riêng nên không lặp cùng bot chỉ đổi concept Product.

| Concept | Mô hình | Độ khó | Thắng | Tiền cuối trung vị (USD) |
|---|---|---|---:|---:|
| team / education | product | friendly | 100/100 | 1,284,490.50 |
| team / education | product | standard | 100/100 | 1,232,566.00 |
| team / education | product | tough | 100/100 | 937,084.00 |
| team / education | startup | friendly | 100/100 | 1,519,743.56 |
| team / education | startup | standard | 100/100 | 1,493,649.50 |
| team / education | startup | tough | 100/100 | 1,234,436.36 |
| creator / creative | product | friendly | 100/100 | 1,547,326.50 |
| creator / creative | product | standard | 100/100 | 1,483,282.00 |
| creator / creative | product | tough | 100/100 | 1,191,393.00 |
| creator / creative | startup | friendly | 100/100 | 1,699,548.18 |
| creator / creative | startup | standard | 100/100 | 1,674,288.18 |
| creator / creative | startup | tough | 100/100 | 1,372,718.22 |

Kết quả củng cố vấn đề dư tiền cuối campaign ở cả ba concept; không chứng minh độ khó phù hợp với người mới. Không đổi tham số trước khi có playtest con người. Nguồn: `evidence/local-balance-markets.json`; thời gian chạy 116.86 giây.

### Policy với seed ghép cặp

270 lượt: 30 seed × ba độ khó × ba policy. Giữ đội hai người, một Fixed Price, chiết khấu 0, không tuyển/tăng lương/overtime/vay/marketing, cùng quy tắc từ chối scope và QA/fix/accept, quyết định mỗi ngày. Xác minh snapshot khởi tạo work/team/quote bằng nhau trong từng cặp. Sau giao, bỏ phân công; đo cash cùng ngày 180 và lao động tại lúc giao.

| Độ khó | Policy | Giao xong | Đúng hạn | Ngày giao TB | Chi phí lao động TB (USD) |
|---|---|---:|---:|---:|---:|
| friendly | quality | 30/30 | 29 | 55.47 | 7,019.94 |
| friendly | balanced | 30/30 | 30 | 50.57 | 6,592.31 |
| friendly | fast | 30/30 | 29 | 49.17 | 6,669.47 |
| standard | quality | 30/30 | 29 | 55.47 | 7,019.94 |
| standard | balanced | 30/30 | 30 | 50.57 | 6,592.31 |
| standard | fast | 30/30 | 29 | 49.17 | 6,669.47 |
| tough | quality | 30/30 | 25 | 55.47 | 7,021.02 |
| tough | balanced | 30/30 | 28 | 50.57 | 6,592.73 |
| tough | fast | 30/30 | 29 | 49.17 | 6,669.82 |

Không còn lỗi ẩn ở lúc giao trong mẫu này. Cash ngày 180 bằng nhau giữa policy trong cùng độ khó vì chỉ giao cùng một hợp đồng rồi ngừng bán, và cùng payroll cố định; labor phân bổ theo effort vẫn khác. Không suy ra mọi policy có lợi nhuận như nhau trong chiến dịch liên tục.

Các seed ghép cặp đo tác động tổng của policy dưới cùng quy tắc vận hành; việc chuyển sang Fast/Quality tốn một CEO action theo luật hiện tại, và policy có thể làm thay đổi các lần RNG/sự kiện về sau. Bot vẫn biết actual scope. Đây không phải thí nghiệm tách riêng từng multiplier hoặc playtest con người. Dữ liệu từng cặp, delivery và toàn bộ trace: `evidence/local-policy-matched.json`.
