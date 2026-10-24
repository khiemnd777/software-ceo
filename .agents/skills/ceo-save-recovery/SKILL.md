---
name: ceo-save-recovery
description: Implement or debug Software CEO IndexedDB slots, autosave, JSON import/export, checksum and schema validation, migrations and stale-tab conflicts. Use for state recovery and data preservation; not for adding cloud accounts or backend synchronization.
---

# Save và phục hồi an toàn

## Khi dùng và đầu vào
Dùng cho autosave/manual slots, Continue, export/import, corruption, migration hoặc stale-tab conflict. Không tự thêm cloud sync/login/backend.

Đọc `src/persistence/saves.ts`, `src/persistence/schema.ts`, `src/ui/SaveManager.tsx`, tests persistence/E2E và `docs/ADR-001.md`. Đầu vào: thao tác tái hiện, schema/build, slot/revision và fixture game giả lập; không lấy save cá nhân hoặc xóa storage người chơi để tiện test. Path tính từ project root.

## Phạm vi source
`src/persistence/`, `src/ui/SaveManager.tsx`, app save/load callers, `tests/persistence/`, tests save E2E. State contract nằm ở `src/simulation/types.ts`; thay contract phải phối hợp `ceo-simulation-economy`.

## Cách thực hiện
1. Tái hiện với bản sao fixture trên profile/storage thử nghiệm. Ghi expected revision và state trước/sau; giữ file gốc để phục hồi.
2. Tôn trọng ba manual slots `1/2/3` và `auto`. Kiểm conflict trong transaction, không read-check-write ngoài transaction rồi giả định an toàn. Stale tab phải nhận lỗi rõ, không âm thầm ghi đè.
3. Import là input không tin cậy: kiểm byte limit 10 MiB, canonical depth tối đa 32, envelope/schema version/checksum, strict state schema, finite/safe values, ID/reference và ledger invariants. SHA-256 checksum phát hiện thay đổi, không phải chữ ký/authentication.
4. Kiểm checksum trước migration; v1 → v2 phải giữ dữ liệu/ý nghĩa, bổ sung defaults có nguồn. Future/unsupported schema, JSON sai, checksum sai hoặc state không hợp lệ phải từ chối mà không thay công ty hiện tại. Không “sửa” save bằng cách bỏ validation.
5. Giữ simulated day, RNG, next IDs, pending events/effects, invoices và ledger qua roundtrip. Restore chủ động pause/reset app accumulator theo `src/app/store.ts`; không coi thời gian tab đóng là tick bù hay yêu cầu persist cosmetic frame clock.
6. Regression bằng IndexedDB test thật/fake-indexeddb và browser download → reload → import → tiếp tục command. Kiểm storage denied, blocked upgrade, quota/error, stale revisions. Chạy `npm test -- tests/persistence`, tests caller bị tác động, `npm run verify` trước checkpoint runtime; chọn native browser theo gate còn thiếu.

## Đầu ra và nghiệm thu
Giao lỗi gốc, preservation/migration contract, regression và kết quả thực. Đạt khi roundtrip/replay tương đương về game state, lỗi giữ state cũ, conflict không ghi đè và original fixture còn nguyên. Browser test phải phân biệt real download/native import với mocked File input. Lỗi storage là lỗi cần báo, không fallback giả thành công. Cập nhật checkpoint theo `ceo-local-qa-handoff`.

## Ví dụ áp dụng
- Dùng: “Hai tab ghi cùng slot làm mất save mới” → revision/transaction test rồi hai-tab browser repro.
- Không dùng: “Thêm đăng nhập và cloud backup” → scope mới cần quyết định owner; không dùng skill làm quyền tạo backend.
