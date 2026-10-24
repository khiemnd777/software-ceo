# Hồ sơ dự án trong Simulate — mockup LOCAL

Ngày 2026-10-24. **READY_FOR_OWNER_REVIEW**; nghiệm thu trải nghiệm của owner còn OPEN. Khiêm đã “Duyệt.” kế hoạch thay riêng hộp Dự án đang chọn sau khi thử bản Simulate thống nhất. Phạm vi là mockup, giữ cơ chế phân công và chưa tích hợp game.

Mở [mockup LOCAL](http://127.0.0.1:4202/docs/mockups/simulate-unified/), tải lại trang nếu tab còn hộp cũ. Chọn Bảng dự án → một dự án. Bản review trong in-app browser đã mở sẵn hồ sơ Cổng quản lý cửa hàng, UI100%, tạm dừng.

## Kết quả thiết kế

- Header chỉ có một tên dự án, nút Đổi dự án và đóng. Thông tin khách hàng, trạng thái hợp đồng và hạn giao nằm ngay dưới header.
- Ba mục trong cùng hộp: Tiến độ & nhân sự, Hợp đồng/Chi tiết, Hoạt động. Không mở thêm dialog chi tiết hợp đồng; confirmation cho hành động hiện có vẫn giữ.
- Phát triển và QA có chỉ báo riêng. Khi chưa khám phá phạm vi, UI dùng khoảng ước lượng công khai, không hiển thị actual ẩn. Hoàn tất phát triển không đồng nghĩa đủ điều kiện chất lượng/nghiệm thu. Thử nghiệm dùng nhãn Nghiên cứu và không hiện QA không áp dụng.
- Nhân sự hiện tại là hàng gọn: tên, chuyên môn/kỹ năng, nhiệm vụ và số việc. Chỉ một người mở editor khi chọn Chỉnh. Thêm nhân sự cho tìm/lọc người, xem việc ở dự án khác và chọn cách thêm/thay đúng slot.
- Dự kiến sau áp dụng hiển thị từng người, phân công trước → sau và nút chỉnh/bỏ. Đây là bản nháp, không phải lịch chạy tự động. Nhóm Đã tham gia ghi rõ chưa có dữ liệu lịch sử theo người; không dựng lịch sử giả hoặc thêm schema.
- Thanh Hủy/Áp dụng nằm ngoài vùng cuộn với diện tích riêng. Không che nội dung. Cửa sổ thấp/UI150% cần cuộn dọc để xem hết thông tin.
- Hợp đồng giữ điều khoản, báo giá/ký, dự báo, nghiệm thu, scope change và confirmation hiện có. Tóm tắt phân biệt cọc còn phân bổ, doanh thu ghi nhận và hóa đơn chưa thu. Hoạt động chỉ đọc history có cause khớp work/contract của dự án.

## Bảo toàn cơ chế và dữ liệu

`ProjectDossier.tsx` là UI mới trong mockup. Dùng `makeDraft`, `draftAssignments`, `assignmentsEqual` và command `assignBatch` hiện có; giữ tối đa hai việc, chống trùng, giữ việc khác, kiểm xung đột, Apply theo nhóm và Hủy theo dự án. Tick không tự làm mất draft. Chỉ core transition được cập nhật fixture RAM.

`projectView.ts` là phép chiếu UI cho tiến độ/preview. Forecast và cổng chất lượng dùng selectors/core hiện có. Không thêm luật, tự phân công, lịch nhân sự hoặc đổi T0.3.

`ContractDetail.tsx` là bản sao cô lập của hàm private cùng tên trong `src/ui/Panels.tsx`, vì hàm gốc không export. Audit đối chiếu nguyên thân hàm để giữ commands, guards và confirmation; không sửa/export lại game source. Đây là lựa chọn cho prototype, chưa phải kiến trúc tích hợp game. Renderer/fixture/assets hiện hành giữ nguyên.

Source thay đổi thuộc `docs/mockups/simulate-unified/`: main, build, ProjectDossier, projectView, ContractDetail, project.css và bundle riêng. Bản trước được giữ tại `evidence/simulate-project-dossier/before/`. Không nhập persistence/bootstrap game; không đọc/ghi save thật. Không đổi package/dependencies hoặc build/standalone đã có, không push/upload/deploy.

## Kiểm chứng thực tế

**Verified** — `evidence/simulate-project-dossier/static-checks.json`:

- Build riêng, typecheck, ESLint và Prettier PASS trên Node24.19.0.
- 10 tests core/model/view PASS, gồm năm test có trước và năm test mới về phạm vi ẩn/ước lượng, phát triển xong nhưng thiếu QA, preview giữ việc khác, trùng/quá hai việc/xung đột và draft không đổi.
- Bundle input audit không có game bootstrap/store/persistence. 188 tệp trong manifest bảo vệ giữ SHA256; sáu tệp còn lại của mockup gốc không thuộc thay đổi cũng được đối chiếu snapshot. Không coi manifest này là audit toàn bộ art-source.
- Thân ContractDetail sao chép khớp source gốc; audit trong receipt.

**Verified** — `evidence/simulate-project-dossier/ui-receipt.json`:

- 18 mục tương tác trên in-app browser: editor gọn; preview chưa đổi state thật; giữ draft qua tab/đóng/mở/đổi dự án; thêm người; batch hai người; chống trùng; giữ slot của dự án khác; Hủy đúng dự án; conflict; khóa chưa ký; nghiệm thu giữa kỳ → hóa đơn chưa thu → history đúng dự án; bàn phím và focus.
- Kiểm giới hạn ký bằng command gốc: dự án thứ ba bị từ chối do đã có hai dự án khách hàng đang hoạt động. Không sửa giới hạn để vượt test. Assertion đầu kỳ vọng ký thành công là sai fixture assumption; đã ghi lại và sửa phép kiểm theo luật hiện hành.
- 20 ảnh/đo layout: tổng quan, editor, preview, hợp đồng và hoạt động × hai viewport × UI100/150. Không tràn ngang; vùng cuộn kết thúc trước footer; Apply lộ qua DOM hit test và thao tác thành công trên cả bốn cấu hình.
- CSS viewport thực khoảng1278×721/1921×1078 do browser zoom33% có sẵn, không đổi zoom người dùng. Không gọi đây là số đo đúng1280×720/1920×1080.
- Product smoke: tạo roadmap, mở hồ sơ, giao Dev và giữ hành động phát hành. Startup smoke: tạo MVP/thử nghiệm, chỉ cho Nghiên cứu ở thử nghiệm, giữ chi tiết và phát hành MVP. Ma trận20 ảnh dùng Outsourcing; Product/Startup smoke ởUI100.
- Thay đổi cuối chỉ bỏ QA/chất lượng không áp dụng cho thử nghiệm; smoke Startup và `project-final.png` dùng bundle cuối. Không lặp toàn ma trận Outsourcing sau thay đổi nhánh này.
- Không có browser warning/error trong lượt cuối. Tab đánh dấu deliverable; viewport override đã reset. Ảnh bàn giao `project-final.png`; các ảnh ma trận và trước sửa giữ riêng.

**Unknown / NOT_RUN** — owner visual/usability acceptance, native Safari và screen reader. Không chạy full game verify/E2E/balance/soak/FPS mới vì source/build game giữ nguyên. Các test mockup không chứng minh tích hợp runtime hoặc thời gian thao tác của người chơi đã tốt hơn.

## Chạy lại

Từ root repo với Node24 có sẵn:

```sh
node docs/mockups/simulate-unified/build.mjs
node evidence/simulate-project-dossier/check-static.mjs
python3 docs/mockups/simulate-unified/serve.py
```

Server4202 đã có vẫn dùng cùng allowlist loopback. Không chạy thêm server nếu cổng đang do server mockup này dùng. Bundle và entry đều ở đường dẫn cũ; trang đã mở cần reload để nhận mã mới. Không reload tab game thật để xem thay đổi này.

Bước tiếp theo: Khiêm thử Hồ sơ dự án → Chỉnh/Thêm nhân sự → xem preview → Áp dụng và xem Hợp đồng/Hoạt động; chốt hoặc nêu điểm cần sửa. Tích hợp game cần kế hoạch/Approve riêng.
