# TASKS — W5 LOCAL, CP6 2026-10-21

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

- [x] Dựng ba trạng thái Simulate / Simulate + Work / Simulate + People đúng Approve.
- [x] Giữ giao việc thủ công và quản lý hiện có, dùng dữ liệu mẫu tách khỏi campaign.
- [x] Kiểm và sửa bố cục thực ở1280×720/1920×1080,UI100/150; bàn phím/draft/Canvas/clock/range đạt.
- [x] Lưu evidence, hash176tệp và cập nhật hồ sơ checkpoint.
- [ ] Khiêm review/chốt thiết kế; tích hợp game cần kế hoạch/Approve riêng.

Review LOCAL: http://127.0.0.1:4201/docs/mockups/simulate-work-people/. Chỉ tiếng Việt và dữ liệu tổng hợp; owner usability/layout acceptance OPEN. Không kiểm lại full game verify/E2E/balance/soak/native Safari vì source/gamebuild không đổi; không rebuild standalone/ZIP/push/upload/deploy. Bước tiếp theo: Khiêm thử ba trạng thái, phản hồi/chốt diện tích văn phòng và bảng; tích hợp game cần kế hoạch/Approve riêng.

## CHARACTER-COMPLETION-GH — 2026-10-22 — bộ nhân vật G–H APPROVED

- [x] Chốt F theo “Chốt, tiếp tục G–H.”; tiếp tục quyền E–H đã có.
- [x] G: nam quần dài/quần đùi; nữ quần dài/chân váy dài/chân váy ngắn × tóc ngắn/dài, đủ8tổ hợp; nguồn Blender/GLB/sáu clip và32ảnh thật.
- [x] H:1.152khung từ model/rig thật;9tracks/16frames/8fps, atlas lossless/foot anchor/root normalization và Canvas đã tích hợp.
- [x] Appearance catalog và fallback save cũ ổn định; tạo người/tuyển dụng/save mới giữ metadata; regression toàn state/RNG không đổi nghiệp vụ.
- [x] Verify58tests/11files +3QA harness;30/30E2E;Canvas/save/gallery/profile riêng đạt; fixed44distfiles, nguồn E/F/V3/art lịch sử giữ hash.
- [x] Owner xác nhận “Chốt G–H, xác nhận bộ nhân vật này.”; bộ nhân vật G–H APPROVED. Quyết định: evidence/character-gh/owner-approval-gh.json.

Docs/giới hạn: docs/CHARACTER_COMPLETION_GH.md. Receipt evidence/character-gh/checkpoint-gh.json. Không có UI thay đồ/rig ngón tay/mặt/physics/LOD runtime3D; không soak/native Safari/standalone mới hoặc push/upload/deploy. Bước tiếp theo: giữ G–H làm baseline cho các lượt phát triển nhân vật sau; thay đổi mới cần kế hoạch và Approve riêng. Đóng gói/phát hành vẫn cần nhiệm vụ được duyệt riêng. Các task dưới giữ lịch sử mốc trước, không yêu cầu duyệt lại F.

## CHARACTER-RIG-F — 2026-10-22 — dừng tại mốc duyệt chuyển động

- [x] Chốt E theo “Chốt hai mẫu E, tiếp tục F”; giữ model/ảnh/source E và V3.
- [x] F: hai rig Blender chỉnh được; mỗi mẫu có idle/working/walk/stand-up/alert/meeting trong GLB thật.
- [x] Sửa mục tiêu IK/mặt phẳng gối, đồng bộ tay/chân và nhịp nâng hông đi bộ; giữ bản thử iteration01–03 và logs.
- [x] Kiểm GLB/source/frame/contact và browser;422ảnh,24tổ hợp mẫu/clip/góc, desktop/mobile, playback/scrub/download đạt. Không thay source/shipping assets game.
- [ ] Owner motion review F: http://127.0.0.1:4193/art-source/character-f/review.html. Chưa chuyển G trước mốc này.
- [ ] G: hai tổ hợp nam và sáu tổ hợp nữ; chân váy rời và tóc ngắn/dài đúng thiết kế đã duyệt.
- [ ] H: sprite từ model thật, xử lý root motion walk, mapping ngoại hình/giới tính, save cũ/mới, Canvas và QA LOCAL.

Quyền G–H đã có trong E–H; không xin Approve kế hoạch lại sau mỗi gate. Chi tiết/giới hạn: docs/CHARACTER_RIG_F.md; receipt evidence/character-f/checkpoint-f.json. Chưa có rig ngón tay/khuôn mặt/vật lý vải/tóc hoặc kiểm hiệu năng game; không rebuild standalone/push/upload/deploy. Bước tiếp theo: chốt hoặc sửa clip F trước khi tiếp tục G.

## CHARACTER-COMPLETION-EH — 2026-10-22 — E sẵn sàng review, F–H đã duyệt phạm vi

Khiêm xác nhận “Duyệt E—H”. Toàn bộ E–H được duyệt triển khai LOCAL; giữ mốc review hai mẫu cơ sở trước diễn hoạt và review clip trước nhân rộng. Không cần xin lại quyền thực hiện F–H. Authorization: evidence/character-eh/authorization-eh.json; kế hoạch/trạng thái: docs/CHARACTER_COMPLETION_EH.md.

E đã có bản sao nguồn Blender chuẩn hóa và hai GLB toàn thân, giữ đúng đầu nữ V3 đã duyệt. Quần mới có lưới quad nối hông và vòng hỗ trợ gối; bỏ đường may khóa quần rời khỏi bề mặt. Model/ảnh/source V3, V2, A–C và source/shipping assets game giữ hash. GLB E là mesh subdivision để review, chưa phải LOD shipping hoặc rig. 15 ảnh render từ GLB nhập lại; bộ lỗi trước giữ riêng trong iteration01–04.

Verified: npm run verify baseline PASS51tests/9files,3QA harness,typecheck/lint/build; warning bundle514kB có trước. Binary GLB và hash15ảnh PASS;21chi tiết đầu nữ khớp tam giác bản duyệt ở dung sai1micromet. Audit nguồn PASS: hai quần toàn quad,mỗi quần một khối liên thông,ba vòng biên vải chủ đích,transform chuẩn. Chrome sandbox bật PASS14góc/mẫu +ảnh hai mẫu,download/ref khớp bytes,desktop1440×1050/mobile390×844 không tràn,zero errors/failed/external requests. 363tệp có trước giữ hash trước cập nhật hồ sơ; lượt này chỉ đổi hồ sơ quyết định. Receipt evidence/character-eh/checkpoint-e.json.

Review: http://127.0.0.1:4192/art-source/character-eh/review-e.html; server loopback chỉ22file cố định,không mở repo; trang đầu nữ V3 cũ giữ nguyên. Mốc E visual acceptance OPEN, theo plan “Dừng cho Khiêm chốt hai mẫu cơ sở trước diễn hoạt.” Bước tiếp theo: Khiêm review hai mẫu E để tiếp tục F trong quyền E–H đã có. F/G/H chưa thực hiện; chưa rig/clip/biến thể/sprite/game integration. Không chạy E2E/profile/soak game tại E,không rebuild standalone/push/upload/deploy.


## CHARACTER-FEMALE-HEAD-V3 — 2026-10-22 — thiết kế đầu nữ đã duyệt

- [x] Thực hiện plan đã duyệt: mặt/mí/mắt/má/mũi/môi/cằm và tóc bob mái lệch/vén tai nữ; giữ nam/thân/trang phục.
- [x] Audit file nguồn đã lưu, tiếp tục export/reimport GLB/render9ảnh; không dựng lại authoring sau gián đoạn.
- [x] Binary/hash/source audit PASS;105mesh giữ hình học;727tệp bảo vệ giữ hash từ lúc tiếp tục,17drift paths runtime trước đó giữ nguyên.
- [x] Trang review 3góc/màu/clay/mockup/V2; Chrome sandbox bật PASS6tổ hợp,desktop/mobile không tràn,zero errors/failed/external requests. Server4191 chỉ allowlist14file.
- [x] Khiêm xác nhận “Xác nhận thiết kế này.”: đầu nữ V3 APPROVED về thiết kế; owner-approval.json ghi riêng, nguồn/GLB khớp bản review. Không sửa model/ảnh/source game ở lượt ghi nhận.
- [x] Trình plan E–H hoàn thiện trong docs/CHARACTER_FEMALE_HEAD_V3.md; ưu tiên E chuẩn hóa/chốt hai mẫu toàn thân.
- [ ] Approve triển khai bước tiếp theo. Chưa rig/biến thể/tích hợp game/release; không push/upload/deploy.

Review: http://127.0.0.1:4191/art-source/character-female-head-v3/review.html. Docs docs/CHARACTER_FEMALE_HEAD_V3.md; receipt kỹ thuật evidence/character-female-head-v3/final-receipt.json giữ lịch sử trước duyệt. Bước tiếp theo đề xuất: Approve E để có hai mẫu toàn thân chuẩn; các scope sau cần kế hoạch/Approve riêng.

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


## AGENT-SETUP-002 — đã hoàn thành 2026-10-21

- [x] Thêm ceo-game-design và ceo-game-audio cùng UI metadata; cập nhật AGENTS.md, không sửa sáu skills cũ.
- [x] Validate 8/8 skills, 48 source refs; runtime discovery 8 repo/enabled zero errors.
- [x] Áp dụng thành hai brief source-backed; thử chín tình huống và luồng tuần đầu/audio thực trên context Chrome 156 riêng: bảy nhóm checks PASS, zero errors, 35 files HTTP khớp dist. Visibility emulated được ghi riêng.
- [x] Giữ SHA256 275 application/art/build files + 12 existing skill files; không sửa game/audio/V4/T0.3/global config, không push/deploy/ZIP mới.
- [x] Cập nhật bốn hồ sơ, docs/AGENT_SETUP.md, checkpoint history và evidence SETUP-002. Các P0 human/native bên dưới vẫn mở; hai observations về tutorial/cash cue chỉ dùng làm đầu vào review/playtest, chưa được giao sửa.

## AGENT-SETUP-001 — đã hoàn thành 2026-10-21

- [x] Tạo sáu `.agents/skills/ceo-*/SKILL.md` + UI metadata và root AGENTS.md trong phạm vi setup đã duyệt.
- [x] Verify trước sửa PASS 46 tests/8 files + 3 harness, typecheck/lint/build; validator 6/6, 41 refs tồn tại.
- [x] Native app-server discovery nhận 6 scope repo/enabled, zero errors; manual read-only scenario review 14 ca. Chưa kiểm UI picker/automatic model selection.
- [x] Giữ SHA256 275 protected files, gồm 153 public/art-source và 35 dist files; không đổi game/global config, push/deploy hoặc đóng gói ZIP mới.
- [x] Cập nhật bốn hồ sơ, `docs/AGENT_SETUP.md`, checkpoint history và evidence setup. Dùng skills cho các P0 W5 bên dưới khi có điều kiện native/người thật; không tự đóng các gates này.

## Đã hoàn thành trong lượt tiếp tục

- [x] Đọc hồ sơ/GDD/source và chạy test/build trước sửa: 43 tests/7 files, typecheck/lint/build PASS.
- [x] Portable macOS browser harness, default E2E Chrome, Node 24 .nvmrc/engine metadata; không nâng dependency.
- [x] Sửa favicon 404; bootstrap regression kiểm resources/console/pixel Canvas thật.
- [x] Bot thêm concept/segment tùy chọn, default Retail unchanged; 3 regression tests.
- [x] Chạy lại Retail 900: 892 thắng, 900 sống, zero invariant/rejected.
- [x] Creative/Education Product/Startup 1200: 1200 thắng/sống, zero invariant/rejected.
- [x] 270 matched-seed policy runs cùng quote/team/scope response/cadence; lưu delivery/labor/hidden defects/cash/trace.
- [x] Chrome/Edge/Playwright Firefox/WebKit mỗi target 14/14 E2E, zero skipped/flaky/unexpected.
- [x] Native Safari smoke create/Canvas/day7/save/reload/Continue/native JSON file import; full suite còn thiếu bên dưới.
- [x] V4 giữ nguyên 153 public/art-source files; 480 frame/60 GLB art check read-only và content counts PASS.
- [x] Full soak 30 phút 13 giây thực trên fixed dist; 30 samples, zero errors, dist/fixture hashes unchanged, warm DOM/listeners flat.
- [x] FPS profile độc lập: 12 staff, hai viewport, bốn mẫu 60.05–60.09 Hz, zero >33 ms; actual Canvas paints riêng.
- [x] 14 sampled axe states zero violations; audio playback/mute, standalone offline, CSP/DPR2, clean build 35/35 và audit zero advisories.
- [x] Final verify: 46 tests/8 files + 3 QA harness tests, typecheck/lint/build PASS; rebuild khớp build đã soak/profile.
- [x] Cập nhật bốn hồ sơ, diff/inventory từ ZIP gốc và portable ZIP LOCAL với CRC/SHA256 receipt ngoài root.
- [x] Chuẩn bị docs/PLAYTEST_PROTOCOL.md; chưa có participant evidence.

## P0 — còn cần môi trường native / người thật

- [ ] Hoàn tất native Safari full loops/outcomes/export/import/keyboard/audio/lifecycle. WebDriver chưa được bật; download permission chưa cấp; large-fixture chooser chưa xác nhận được. Owner thực hiện hoặc cho phép phần thiết lập cần thiết; không tự bật quyền.
- [ ] Novice 15 phút: comprehension cash/revenue/receivable, QA/fix, một trade-off và save/recovery; ghi quan sát thực.
- [ ] Sustained campaign/challenge: session length, weekly decision density, late-game tension và đoạn chỉ chờ.
- [ ] Human screen reader, audio mix/listening fatigue và owner acceptance expanded art cycles.

## P1 — sau bằng chứng quan sát

- [ ] Chỉnh late-campaign pressure/difficulty nếu human evidence xác nhận; giữ T0.3 baseline và chạy lại regression/balance.
- [ ] Mở rộng native OS visibility/lifecycle và phần cứng/phiên bản browser mục tiêu; không dùng headless/emulated data làm chứng nhận chung. Firefox đã đo là Playwright 142.0.1.
- [ ] Nếu cần Git workflow, thống nhất repository/remote với owner; thư mục hiện là bản giải nén không có .git. Không tự tạo remote hoặc push.

## W6 — ngoài quyền LOCAL

- [ ] Remote push, hosted preview/HTTPS/cache/headers/rollback, Library saving và production/public release cần quyền riêng. Không thực hiện từ mandate này.
