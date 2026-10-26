# Balance decisions and versioning

Current balance version: **T0.4** (owner approved D1–D8, 2026-10-26). Full measured results, methodology and remaining concerns are in BALANCE_REPORT.md. T0.2 run data is retained for comparison.

The implementation preserves the GDD's starting capital, initial payroll/playbooks, 6 WP base, skill/role/morale/energy/focus/process/debt factors, policy multipliers, Product's 35 × $79 starting cohort, fixed-price 20/40/40, 14-day payroll grace period and campaign targets. Calendar conventions are 7-day weeks, 30-day months and 1080-day campaigns.

Parameters left open by the GDD were made explicit in content: segment demand Retail 80, Creative 90, Education 70 monthly leads before modifiers; pricing conversion penalty −3.5 percentage points per +100% vs $79 multiplied by segment sensitivity; price-related churn +2.5 points per +100%, again sensitivity-adjusted; segment quality expectations affect retention/conversion. These are fictional game parameters, not industry benchmarks.

T0.2 added real daily support demand so growing products consume staff capacity. T0.3 connected segment sensitivity/quality and the Client-Friendly research trait, corrected trait copy, and preserved anti-farming and delayed-liability accounting fixes.

T0.4 defaults to 60 real seconds per day at x1, with 24/60/120 settings. 1080 days therefore take 18 hours at x1 before pauses or skips; x4 would take 4.5 hours. Actual session length and decision density need a human playtest. Late-game cash and weak difficulty separation are recorded concerns, not hidden by the 892/900 goal-completion result.

## T0.4 — lịch trong ngày đã duyệt

Nguồn quyết định: TIME_24H_INTEGRATION_PLAN.md D1–D8 và ADR-002_INTRADAY_CLOCK.md. Không còn multiplier OT trong actual work. 224quarter chuẩn/tuần; 56quarter OT/tuần ở rate0,8 cho +20% khi giữ các yếu tố cố định. Health/hour thay health/week, có neo Driven/Steady và carry qua đêm. Lương/OPEX phát sinh theo khoảng15phút; premium chỉ khi đang làm OT; monthly payment/ledger/grace giữ cadence. Weather hash và đèn không thay RNG/tiền/lượt.

900matched seeds, 1200market và270policy dùng engine mới, output riêng trong evidence/time-24h/integration-2026-10-26/. Bot không chứng minh độ khó hoặc cảm nhận người chơi. Cờ cần review: Outsourcing/Tough thắng98→90/100 trong đối chứng ban đầu; không điều chỉnh tham số để làm xanh. Xem báo cáo integration và dữ liệu final-balance cho số cuối.
