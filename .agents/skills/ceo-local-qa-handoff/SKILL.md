---
name: ceo-local-qa-handoff
description: Verify Software CEO local changes with risk-appropriate tests, fixed-build browser evidence, V4 preservation and checkpoint handoff; package a local archive when requested. Not authorization for remote push, upload, hosting or deployment.
---

# QA và bàn giao LOCAL

## Khi dùng và đầu vào
Dùng trước/sau thay đổi đáng kể, chốt checkpoint, bàn giao hoặc tạo ZIP LOCAL khi nhiệm vụ yêu cầu. Không biến đọc docs/sửa skill thành full soak game; không dùng gate LOCAL để cấp phép phát hành.

Đọc `PROJECT_STATE.md`, `SESSION_HANDOFF.md`, `RELEASE_CHECKLIST.md`, `TASKS.md`, `package.json` và phần phù hợp của `docs/TESTING.md`. Kiểm source/evidence thực, không kế thừa số test PASS như hiện trạng mới. Node 24 theo `.nvmrc`; Python art check cần Pillow, dùng runtime sẵn có, không cài global.

## Phạm vi source
QA scripts/configs/tests, `evidence/`, bốn hồ sơ trên và `docs/LOCAL_CHECKPOINTS.md` khi thêm checkpoint. Tất cả path tính từ project root. Thay application cần skill owning module; skill này không cấp thêm quyền sửa luật/art.

## Cách thực hiện
1. Trước sửa ứng dụng, đọc source và chạy `npm run verify`; ghi build/test baseline và lỗi có sẵn. Giữ SHA256 public/art-source khi yêu cầu giữ V4. Bản nhận hiện không có Git metadata: dùng manifest/diff bằng chứng, không tự git init/remote.
2. Chọn regression theo rủi ro. Runtime thay đổi: `npm run verify` + tests/browser task bị tác động. Docs/agent setup: schema/links/discovery và kiểm hành vi áp dụng; không giả test game đã chạy lại. Không nâng dependencies hay giảm assertions để vượt gate.
3. Browser tests dùng production preview LOCAL 127.0.0.1:4173; xác minh process/build thực. `CEO_BASE_URL=http://127.0.0.1:4173 npm run test:e2e`; chọn channel `CEO_BROWSER` theo harness. Ghi version và giữ evidence từng target trước khi bị ghi đè. Playwright WebKit không thay native Safari; không tự bật automation/download permission.
4. Nếu cần soak/profile, build trước, giữ toàn bộ dist và fixture không đổi. Chạy `npm run test:soak` đủ thời lượng thật 30–60 phút và đọc samples/errors/hash; chạy `npm run test:profile` riêng, không đồng thời balance/soak/browser stress. Phân biệt rAF, paints, authored poses và post-GC heap; không chứng nhận mọi GPU/OS từ một host.
5. Khi nhiệm vụ yêu cầu artifact, dùng scripts hiện có: `npm run build:standalone`, `node scripts/test-standalone.mjs`, `node scripts/repro-build.mjs`, `python3 scripts/package.py <new-name>.zip`. Đọc options trước chạy. ZIP ngoài root, tên mới, không ghi đè; `--output-dir /private/tmp` khi cần. Kiểm required entries/CRC, SHA256 và sidecars; archive cũ không tự chứa thay đổi mới.
6. Sau checkpoint cập nhật đồng bộ bốn hồ sơ: thay đổi/lý do, commands/kết quả, build/evidence path, phần chưa kiểm chứng, bước tiếp theo. Giữ failures/interrupted runs như lịch sử; không sửa thành PASS. Dist/source manifests và archive digest là các loại hash khác nhau.

## Đầu ra và nghiệm thu
Receipt rõ Verified / Proposed / Unknown, files, test log và giới hạn. Tách authored skill, schema-valid, runtime-discovered và behavioral trial; file Markdown không tự chứng minh runtime đã nhận. Nếu có API discovery thì kiểm trực tiếp và ghi phạm vi; không yêu cầu restart khi chưa có dấu hiệu cần.

Giữ human novice/campaign/screen-reader/audio/art gates mở nếu chưa quan sát. Không push, upload Library, hosted preview, dùng dịch vụ trả phí hoặc deploy khi chưa có quyền riêng. Kết thúc bằng 1–3 lựa chọn tiếp theo có kết quả và điều kiện cụ thể; tiếp tục phần đã được phép mà không hỏi lại.

## Ví dụ áp dụng
- Dùng: “Chốt sửa focus save dialog” → regression UI/save, verify, evidence và bốn hồ sơ; soak chỉ khi lifecycle/memory bị tác động.
- Không dùng: “QA xanh thì tự publish game” → báo LOCAL evidence, giữ release NOT AUTHORIZED; không tự deploy.
