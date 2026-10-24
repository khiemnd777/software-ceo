# UI quản lý trong game — tích hợp LOCAL 009

Ngày: 2026-10-21. Owner đã duyệt kế hoạch tích hợp bộ thiết kế Công việc và năm màn hình quản lý vào game thật. Đây là triển khai React dùng campaign, selectors và commands hiện có. Prototype tại docs/mockups/ được giữ làm tham chiếu lịch sử.

## Luồng và phạm vi

Người chơi chọn đối tượng → đọc tình trạng và tác động → dùng hành động nghiệp vụ → nhận state/feedback từ game. Chọn xem chi tiết không tiêu lượt CEO và không ghi vào campaign/save.

| Màn hình | Thay đổi |
|---|---|
| Công việc | Danh sách hợp đồng/cơ hội và tính năng bên trái; chi tiết bên phải. Điều khoản và ký đặt trong bước tiếp theo. Chưa có QA hiện Chưa kiểm thử. Phân công trống bị khóa và có đường về Hợp đồng. Đội ngũ dự án dùng assignments thật. |
| Nhân sự | Quỹ lương cơ bản, chỗ ngồi, người chưa phân công, năng lượng thấp; roster gọn và chi tiết người đang chọn. Tên dài rút gọn ở hàng, đầy đủ ở chi tiết. Đào tạo/lương/thôi việc giữ dialog và confirmation hiện có. |
| Thị trường | Danh sách phân khúc và nhu cầu thật; vùng chi tiết nối tới khách hàng/giá. Xem phân khúc không đổi mục tiêu sản phẩm. Draft giá/ngân sách và funnel forecast giữ implementation hiện có. Chưa có sản phẩm có lời giải thích. |
| Tài chính | Tiền mặt, phải thu, nợ và runway giữ nguồn thật. Chọn hóa đơn để xem hạn/trạng thái, nhắc một lần bằng command collect. Nhắc không tăng tiền mặt. Bảng đối chiếu đầy đủ và ledger giữ lại. Biểu đồ ghi đúng doanh thu/chi phí. |
| Chiến lược | Mục tiêu và nguồn thu hiện có; chọn xem chính sách rồi dùng nút áp dụng. Mặc định xem chính sách đang dùng. Điều kiện ngày/uy tín/tiền/lượt cho văn phòng được hiện rõ. Cam kết giữ dữ liệu thật. |
| Nhật ký | Báo cáo tuần, tìm/lọc và danh sách sự kiện; xem một bản ghi với ngày và nội dung đã lưu. Không suy luận sự kiện lịch sử thành tình trạng hiện tại. |

`DecisionBoard.tsx` chỉ giữ lựa chọn trình bày; `NextMove` hiển thị hướng dẫn theo state. `ManagementJump` chuyển mục trong cùng màn hình, giữ các phần được mount để draft không mất. VI/EN theo locale hiện có. Ở UI150 và viewport hẹp, các vùng chuyển xuống hàng; không cần cuộn ngang. Header, điều khiển thời gian, Văn phòng Canvas và navigation dưới giữ vai trò hiện có. Không thêm toolbar tình huống/review hoặc dữ liệu mẫu của mockup vào sản phẩm.

## Ranh giới

Không sửa simulation/gameplay/content/store/renderer/audio/persistence, T0.3, art V4, dependencies hoặc schema lưu. UI dùng các điều kiện để giải thích/khóa control; command boundary vẫn xác thực khi thực hiện. Không chuyển công thức kế toán hoặc năng lực vào component mới. Không đổi site storage của người dùng; browser QA dùng context riêng.

Game dev: http://127.0.0.1:4183/ (`npm run dev -- --port 4183 --strictPort`, Node24). Giữ nguyên hostname đang dùng để tiếp tục nhìn thấy đúng dữ liệu trình duyệt: localhost và 127.0.0.1 là hai origin khác nhau. Prototype 4191 và standalone/ZIP cũ không đại diện cho bản React này.

## Kiểm chứng và giới hạn

Kết quả cuối xem `evidence/ui-runtime-integration/receipt.json` và các log cùng thư mục. Verify trước/sau PASS: 46 unit tests/8 files, 3 QA harness, typecheck/lint/build. Edge155.0.4283.62 full23/23 E2E trên fixed production build, zero skipped/flaky/unexpected; dist hash trước/sau khớp. Ma trận 48 tổ hợp quản lý và 8 tổ hợp roster, sampled axe zero violations, keyboard/focus và save/command flows đạt. Dev4183 smoke và ảnh thực sáu màn hình, zero console/page errors. Cột danh sách được đo lấp đúng grid để chặn width/max-width cũ; hai nhân viên khởi đầu và ít nhất năm hàng tại1080p vẫn giữ assertions cũ. Các lượt đầu giữ nguyên, gồm lỗi selector chính sách cũ, roster vượt viewport và fixture hóa đơn thiếu bút toán phải thu. Đã sửa nguyên nhân; không hạ assertions năm hàng/1080p, hai người khởi đầu, kết quả tiền, focus hoặc các invariants của save.

Kiểm chứng tự động và ảnh không thay owner visual acceptance, novice playtest, human screen reader hoặc native Safari. Không chạy lại balance/soak/profile vì luật và renderer giữ nguyên; kết quả hiệu năng cũ không được gán cho build mới. Vite có cảnh báo bundle JS khoảng 500 kB; build vẫn thành công, chưa đo lại performance cho bản này. Không rebuild standalone, đóng ZIP, push, upload hoặc deploy trong task này.

## Bước tiếp theo

1. Khiêm mở game 4183 với hostname đang chơi, lưu vào slot rồi tải lại nếu tab còn giao diện cũ; review sáu màn hình bằng campaign hiện có.
2. Nếu cần bản HTML/ZIP mang đi, lập kế hoạch đóng gói riêng và chỉ thực hiện khi owner duyệt.


## Khoảng cách nút — UI-BUTTON-SPACING-010

Owner duyệt rà sáu màn hình quản lý và các dialog. Build cũ tái hiện hai lỗi bằng bounding rectangles: nút giao hàng có rủi ro chạm nhóm nghiệm thu; nút Phân công hỗ trợ chạm nút Khảo sát khách hàng. `.text-button` cũng có padding ngang bằng 0 nên nhãn sát viền trong dialog nhân viên và các hành động phụ.

Bản sửa đưa hành động giao hàng vào cùng `.button-row` với nghiệm thu; gom hỗ trợ/khảo sát vào `.button-row`; padding ngang `.text-button` là 12px. Hai overlay kết quả công ty dùng `.button-row` thay margin-right để giữ cả khoảng cách dọc khi xuống dòng. Tái sử dụng flex-wrap và gap 8px hiện có; giữ commands, điều kiện khóa, confirmation, save và V4/T0.3.

Regression `tests/e2e/button-spacing.spec.ts` đo viền nút trong layout thật: các nút cùng `.button-row` cách ít nhất 8px (dung sai 0,5px); các nút khác không chạm nhau, gồm thanh chọn mục/roster có gap gọn 4px. Kiểm cả nút disabled, các lựa chọn chi tiết, EN/VI, UI100/150 và 1280×720/1920×1080. Fixtures tổng hợp chỉ mở các nhánh giao hàng/phát hành để kiểm UI, không phải bằng chứng balance.

Lệnh lặp lại trên production preview: `CEO_SPACING_RUN=review CEO_BROWSER=msedge CEO_BASE_URL=http://127.0.0.1:4173 npx playwright test -c spacing.playwright.config.ts tests/e2e/button-spacing.spec.ts`. Kết quả thực, log baseline lỗi, ảnh và manifest nằm tại `evidence/ui-button-spacing/`; xem receipt.json cho các lượt hoàn tất và giới hạn. Browser dùng context riêng, không truy cập campaign đang chơi. Không rebuild standalone/ZIP hoặc phát hành từ checkpoint này.

Kết quả checkpoint010: verify trước/sau PASS46 unit tests/8 files +3 harness; full Edge27/27 E2E,600 layout samples; dev localhost:4183 đạt4/4 regressions trên context riêng. Các giới hạn native/human và bundle warning giữ như receipt.
