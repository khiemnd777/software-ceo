"""Summarize measured game-bot runs without claiming human difficulty validation."""
import json
from pathlib import Path
r=json.loads(Path('evidence/balance-900.json').read_text());groups=[x for x in r['summaries'] if x['policy']=='all'];runs=r['runs']
f=lambda v:f'${v:,.0f}'
rows='\n'.join(f"| {g['strategy']} | {g['difficulty']} | {g['victories']}/100 | {f(g['medianCash'])} | {f(g['p10Cash'])}–{f(g['p90Cash'])} | {g['meanMargin']*100:.1f}% | {g['meanStaff']:.1f} |" for g in groups)
policies=[]
for p in ['quality','balanced','fast']:
 a=[x for x in runs if x['policy']==p];policies.append(f"| {p} | {len(a)} | {sum(x['victory'] for x in a)} | {sum(x['incidents'] for x in a)/len(a):.2f} | {sum(x['defects'] for x in a)/len(a):.2f} |")
passive='\n'.join(f"| {x['strategy']} | {x['day']} | {x['status']} |" for x in r['passive'])
staff=json.loads(Path('evidence/deadline-staffing.json').read_text())['results'];staffrows='\n'.join(f"| {x['policy']} | {x['contracts']} | {x['onTime']*100:.0f}% | {f(x['cash'])} | {'Thắng' if x['won'] else 'Không đạt'} |" for x in staff)
text=f'''# Báo cáo cân bằng T0.3

## Kết quả đã chạy

**900 chiến dịch, {sum(x['victory'] for x in runs)} đạt mục tiêu; {sum(x['status']!='insolvent' for x in runs)} sống sót; {sum(bool(x['errors']) for x in runs)} run có lỗi invariant; {sum(x['rejected'] for x in runs)} lệnh bot bị từ chối.** Thời gian tính: {r['elapsedMs']/1000:.3f} giây. Mỗi campaign chạy 1.080 ngày trừ khi công ty mất khả năng thanh toán.

Nguồn số liệu: `evidence/balance-900.json` và `evidence/balance-900.csv`. Phiên bản trước được giữ trong balance-T0.2.*. Source digest của simulation/gameplay/content: `{r['sourceDigest']}`. Kết quả này không phụ thuộc browser, tốc độ hoạt ảnh hay giờ trên máy.

## Phương pháp và giới hạn

Ba mô hình × ba độ khó × seed 1–100. Seed modulo ba chọn Quality First (34 seed/nhóm), Balanced (33) hoặc Ship Fast (33). Bot gọi cùng public commands như giao diện: phân công, QA, sửa lỗi, event, marketing, tuyển người hỗ trợ và vay khi cần. Không bơm tiền, sửa WP, thay scope hay bỏ cổng chất lượng vào state.

Bot có quyền đọc state đầy đủ, kể cả actual scope trong logic hoàn thành. Vì vậy đây là người vận hành rất có thông tin; không tương đương người mới chơi. Bot Outsourcing giữ hai người, làm một dự án nối tiếp. Bot Product/Startup chủ động tuyển hỗ trợ khi queue tăng. Nhóm Fast Outsourcing chọn T&M có trần; các nhóm kia chọn Fixed Price. **So sánh policy ở đây là so sánh toàn bộ cách vận hành, có yếu tố gây nhiễu; không phải thí nghiệm giữ nguyên mọi thứ chỉ thay policy.**

Các invariant được kiểm trong quá trình chơi gồm tiền không âm và sổ cái cân bằng. Schema/reference/ledger validation chạy lại ở trạng thái cuối. Những kiểm tra không biến một run bot thành playtest con người hoặc chứng nhận game đã cân bằng thương mại.

## Theo mô hình và độ khó

Tiền là USD giả lập. Biên lợi nhuận là ba tháng gần nhất; không phải biên lợi nhuận toàn đời công ty.

| Mô hình | Độ khó | Đạt mục tiêu | Tiền cuối trung vị | P10–P90 tiền cuối | Biên LN trung bình | Nhân sự TB |
|---|---|---:|---:|---:|---:|---:|
{rows}

Product và Startup tăng tiền rất mạnh sau khi tối ưu fit, retention và hỗ trợ. Bot thắng mọi seed ở hai mô hình này. Chưa đủ bằng chứng rằng nửa sau chiến dịch còn áp lực chiến lược phù hợp với người chơi. Chênh lệch độ khó, nhất là Outsourcing, còn yếu theo mẫu đo này: Tough không có tỷ lệ thắng thấp hơn Standard. Đây là mục cần ưu tiên điều chỉnh bằng lượt chơi có quan sát.

## Ba cách vận hành

| Policy của bot | Số run | Đạt mục tiêu | Incident TB | Lỗi còn lại TB |
|---|---:|---:|---:|---:|
{chr(10).join(policies)}

Các số trên có thể mô tả mẫu, không chứng minh Fast là tối ưu hay Quality vô dụng. Muốn đo tác động nhân quả của policy, chạy bộ seed ghép cặp, giữ cùng hợp đồng/nhân sự/giá và chỉ thay chính sách, rồi đo thời gian giao, chi phí, lỗi và lợi nhuận. Domain test có một cặp tình huống cho thấy khác biệt quan sát được; chưa đủ để kết luận meta dài hạn.

## Đối chứng không quản lý

Giữ công ty khởi tạo seed 42, Standard, chỉ cho ngày chạy, không ký/giao việc/thu hồi khủng hoảng:

| Hướng | Ngày kết thúc | Trạng thái |
|---|---:|---|
{passive}

Điều này xác nhận bỏ mặc công ty có hậu quả trong luật hiện tại. Nó không đo mức khó của một chiến lược yếu nhưng vẫn có thao tác.

## Challenge deadline và quyết định tuyển người

Bot mặc định hai người chỉ hoàn thành hai hợp đồng trong 180 ngày, nên không đạt mục tiêu ba hợp đồng. Một kịch bản riêng seed 42, Standard tuyển thêm Dev ngay từ đầu, dùng Fixed Price, QA/sửa lỗi và từ chối scope bổ sung. Không thay state ngoài public commands.

| Policy | Hợp đồng xong | Mốc đúng hạn | Tiền cuối | Kết quả |
|---|---:|---:|---:|---|
{staffrows}

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
4. Cân bằng các concept ngoài lựa chọn Retail mặc định của bộ 900 run; catalog khác có kiểm tra cấu trúc và test cơ chế, chưa có 900 run riêng cho từng concept.

Không tăng mức khó chỉ để ép tỷ lệ thắng về một con số tùy ý. Bước tiếp theo là thử ghép cặp policy và playtest người mới, rồi chỉnh tham số với mục tiêu cụ thể, giữ baseline và chạy lại regression. Bản hiện tại giữ nguyên các mức vốn/WP/milestone chủ đạo của GDD.
'''
Path('docs/BALANCE_REPORT.md').write_text(text)
print('Wrote measured T0.3 balance report')
