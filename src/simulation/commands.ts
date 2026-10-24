import type { State, Command, Assignment } from "./types";
import { copy } from "../content/catalog";
import { EVENTS } from "../content/events";
import { action, need, uid, log, clamp, month, RuleError } from "./helpers";
import { spend, book, monthlyCosts, settleLiabilities } from "./finance";
import { applyEffect } from "./events";
import { resolveAppearance } from "../characters/resolve";
export function validateAssignment(s: State, a: Assignment) {
  const w = s.work.find((w) => w.id === a.target);
  need(
    w || (a.target === "market" && s.product.exists),
    "Không tìm thấy công việc.",
    "Work not found.",
  );
  need(
    [
      "develop",
      "qa",
      "fix",
      "refactor",
      "research",
      "growth",
      "support",
    ].includes(a.kind),
    "Loại việc không hợp lệ.",
    "Invalid assignment kind.",
  );
  if (w?.kind === "contract")
    need(
      s.contracts.some(
        (x) => x.workId === w.id && ["signed", "accepted"].includes(x.stage),
      ),
      "Ký hợp đồng trước khi phân công.",
      "Sign the contract before assigning work.",
    );
  if (a.target === "market")
    need(
      a.kind === "growth" || a.kind === "research" || a.kind === "support",
      "Thị trường nhận việc nghiên cứu, tăng trưởng hoặc hỗ trợ khách.",
      "Market assignments must be research, growth or customer support.",
    );
  if (a.kind === "support")
    need(
      a.target === "market",
      "Chọn Thị trường để hỗ trợ khách.",
      "Select Market for customer support.",
    );
  if (w?.kind === "experiment")
    need(
      a.kind === "research",
      "Thử nghiệm cần công việc nghiên cứu.",
      "Experiments require research.",
    );
}
const sameAssignments = (a: Assignment[], b: Assignment[]) =>
  a.length === b.length &&
  a.every((v, i) => v.target === b[i].target && v.kind === b[i].kind);
export function sharedCommand(s: State, c: Command): boolean {
  switch (c.type) {
    case "assign": {
      const e = s.employees.find((e) => e.id === c.employeeId);
      need(e, "Không tìm thấy nhân viên.", "Employee not found.");
      validateAssignment(s, c);
      if (c.append) {
        need(
          e.assignments.length < 2,
          "Mỗi nhân viên nhận tối đa 2 việc.",
          "Maximum two assignments per employee.",
        );
        need(
          !e.assignments.some(
            (a) => a.target === c.target && a.kind === c.kind,
          ),
          "Đã phân công việc này.",
          "Already assigned.",
        );
        e.assignments.push({ target: c.target, kind: c.kind });
      } else e.assignments = [{ target: c.target, kind: c.kind }];
      if (!s.tutorial.seen.includes("assign")) s.tutorial.seen.push("assign");
      return true;
    }
    case "assignBatch": {
      need(
        c.changes.length > 0 && c.changes.length <= s.employees.length,
        "Nhóm phân công không hợp lệ.",
        "Invalid assignment batch.",
      );
      const seen = new Set<string>();
      for (const row of c.changes) {
        need(
          !seen.has(row.employeeId),
          "Nhân viên bị lặp trong nhóm.",
          "Duplicate employee in batch.",
        );
        seen.add(row.employeeId);
        const e = s.employees.find((e) => e.id === row.employeeId);
        need(e, "Không tìm thấy nhân viên.", "Employee not found.");
        need(
          sameAssignments(e.assignments, row.assignments) ||
            sameAssignments(e.assignments, row.expected),
          `${e.name}: phân công đã đổi. Xem lại bản nháp.`,
          `${e.name}: assignments changed. Review the draft.`,
        );
        need(
          row.assignments.length <= 2,
          "Mỗi nhân viên nhận tối đa 2 việc.",
          "Maximum two assignments per employee.",
        );
        const unique = new Set<string>();
        for (const a of row.assignments) {
          validateAssignment(s, a);
          const key = `${a.target}:${a.kind}`;
          need(!unique.has(key), "Đã phân công việc này.", "Already assigned.");
          unique.add(key);
        }
      }
      for (const row of c.changes) {
        s.employees.find((e) => e.id === row.employeeId)!.assignments =
          row.assignments.map((a) => ({ ...a }));
      }
      if (
        c.changes.some((r) => r.assignments.length) &&
        !s.tutorial.seen.includes("assign")
      )
        s.tutorial.seen.push("assign");
      return true;
    }
    case "unassign": {
      const e = s.employees.find((e) => e.id === c.employeeId);
      need(e, "Không tìm thấy nhân viên.", "Employee not found.");
      e.assignments = [];
      return true;
    }
    case "policy":
      need(
        ["fast", "balanced", "quality"].includes(c.policy) &&
          c.policy !== s.policy,
        "Chọn một chính sách khác.",
        "Choose a different policy.",
      );
      action(s);
      s.policy = c.policy;
      log(
        s,
        "info",
        copy("Đã đổi chính sách giao hàng", "Delivery policy changed"),
        copy(
          "Tốc độ, lỗi và nợ kỹ thuật sẽ thay đổi cho phần việc tiếp theo.",
          "Speed, defects and debt change for future work.",
        ),
        "policy",
      );
      if (!s.tutorial.seen.includes("policy")) s.tutorial.seen.push("policy");
      return true;
    case "overtime":
      need(
        c.enabled !== s.overtime,
        "Chính sách đã được áp dụng.",
        "Policy is already active.",
      );
      action(s);
      s.overtime = c.enabled;
      log(
        s,
        "info",
        copy("Đã đổi chính sách tăng ca", "Overtime policy changed"),
        copy(
          "Tăng ca: +20% việc và lương; mỗi tuần −12 năng lượng, −4 tinh thần.",
          "Overtime: +20% work and payroll; −12 energy and −4 morale weekly.",
        ),
        "overtime",
      );
      return true;
    case "hire": {
      const candidate = s.candidates.find((x) => x.id === c.candidateId);
      need(
        candidate,
        "Ứng viên không còn trong danh sách.",
        "Candidate is no longer available.",
      );
      need(
        s.employees.length < (s.officeTier === 1 ? 5 : 12),
        "Văn phòng đã đủ chỗ.",
        "Office capacity reached.",
      );
      action(s);
      spend(
        s,
        Math.round(candidate.salary * 0.15),
        copy("Chi phí tuyển dụng", "Recruitment fee"),
      );
      s.employees.push({
        ...candidate,
        appearance: resolveAppearance(candidate),
        id: uid(s, "employee"),
        traits: [...candidate.traits],
        morale: 75,
        energy: 90,
        hiredDay: s.day,
        assignments: [],
        xp: 0,
        retentionSince: null,
        lastRaise: s.day,
      });
      s.candidates = s.candidates.filter((x) => x.id !== c.candidateId);
      log(
        s,
        "good",
        copy("Đón đồng đội mới", "Welcome a new teammate"),
        copy(
          `${candidate.name}: tuần đầu 50% năng suất, tuần hai 75%.`,
          `${candidate.name}: 50% output in week one, 75% in week two.`,
        ),
        "hire",
      );
      return true;
    }
    case "dismiss": {
      const e = s.employees.find((e) => e.id === c.employeeId);
      need(e, "Không tìm thấy nhân viên.", "Employee not found.");
      action(s);
      spend(
        s,
        Math.round(e.salary * 0.5),
        copy("Trợ cấp thôi việc", "Severance"),
      );
      s.employees = s.employees.filter((x) => x.id !== e.id);
      for (const other of s.employees) other.morale = clamp(other.morale - 5);
      log(
        s,
        "warning",
        copy("Nhân viên rời công ty", "Employee leaves"),
        copy(
          `${e.name} đã được trả trợ cấp nửa tháng lương.`,
          `${e.name} received half a month of severance.`,
        ),
        e.id,
      );
      return true;
    }
    case "raise": {
      const e = s.employees.find((e) => e.id === c.employeeId);
      need(e, "Không tìm thấy nhân viên.", "Employee not found.");
      need(
        s.day - e.lastRaise >= 30,
        "Chỉ xem lại lương một lần mỗi tháng.",
        "Salary can be reviewed once per month.",
      );
      action(s);
      e.salary = Math.round(e.salary * 1.1);
      e.lastRaise = s.day;
      e.morale = clamp(e.morale + 12);
      log(
        s,
        "good",
        copy("Lương tăng 10%", "Salary increased by 10%"),
        copy(
          `${e.name}: tăng chi phí lương từ kỳ trả kế tiếp.`,
          `${e.name}: payroll increases from the next payment cycle.`,
        ),
        e.id,
      );
      return true;
    }
    case "train": {
      const e = s.employees.find((e) => e.id === c.employeeId);
      need(e, "Không tìm thấy nhân viên.", "Employee not found.");
      need(e.skill < 5, "Đã đạt kỹ năng tối đa.", "Already at maximum skill.");
      action(s);
      spend(s, 200000, copy("Đào tạo chuyên môn", "Professional training"));
      e.xp += 55;
      e.energy = clamp(e.energy - 8);
      if (e.xp >= 160) {
        e.xp -= 160;
        e.skill++;
      }
      return true;
    }
    case "decide": {
      const event = s.events.find((e) => e.id === c.eventId && !e.resolved);
      need(
        event && s.day >= event.due && s.day < event.expires,
        "Quyết định chưa mở hoặc đã hết hạn.",
        "Decision is not open or has expired.",
      );
      const template = EVENTS.find((e) => e.id === event.templateId);
      const choice = template?.choices.find((x) => x.id === c.choiceId);
      need(choice, "Lựa chọn không hợp lệ.", "Invalid choice.");
      action(s, choice.actions);
      spend(s, choice.cost, choice.label, "decision");
      applyEffect(s, choice.immediate, event.id);
      if (choice.delay)
        s.deferred.push({
          id: uid(s, "delay"),
          due: s.day + choice.delay.days,
          effect: choice.delay.effect,
          message: choice.delay.message,
          source: event.id,
        });
      event.resolved = true;
      event.choice = choice.id;
      s.metrics.decisions++;
      log(s, "info", template!.title, choice.description, event.id);
      if (!s.tutorial.seen.includes("decision"))
        s.tutorial.seen.push("decision");
      return true;
    }
    case "emergencyAction":
      need(
        s.actions === 0,
        "Hãy sử dụng lượt hiện có trước.",
        "Use existing actions first.",
      );
      need(
        s.cash < monthlyCosts(s) ||
          s.liabilities.some((l) => l.kind === "payroll"),
        "Lượt khẩn cấp chỉ dùng khi có rủi ro thiếu tiền.",
        "Emergency actions require a cash crisis.",
      );
      need(
        s.lastEmergencyMonth !== month(s),
        "Chỉ mượn một lượt trong mỗi tháng.",
        "Only one emergency action per month.",
      );
      s.actions++;
      s.borrowedActions++;
      s.lastEmergencyMonth = month(s);
      log(
        s,
        "warning",
        copy("Đã mượn lượt CEO", "CEO action borrowed"),
        copy("Tuần sau còn 2 lượt CEO.", "Next week has only 2 CEO actions."),
        "emergency",
      );
      return true;
    case "loan": {
      need(
        [1000000, 2000000].includes(c.amount),
        "Khoản vay chỉ có mức $10.000 hoặc $20.000.",
        "Bridge loans are $10,000 or $20,000.",
      );
      const owed = s.liabilities
        .filter((l) => l.kind === "loan")
        .reduce((v, l) => v + l.amount, 0);
      need(
        owed + c.amount <= 2000000,
        "Tổng vay cầu nối tối đa $20.000.",
        "Bridge debt is capped at $20,000.",
      );
      action(s);
      const id = uid(s, "loan");
      book(s, "loan", copy("Vay cầu nối", "Bridge loan"), {
        cash: c.amount,
        liability: c.amount,
        reference: id,
      });
      s.liabilities.push({
        id,
        amount: c.amount,
        kind: "loan",
        label: copy(
          "Vay cầu nối, lãi 2%/tháng",
          "Bridge loan, 2% monthly interest",
        ),
        created: s.day,
        deadline: null,
      });
      settleLiabilities(s);
      s.reputation = clamp(s.reputation - 2);
      return true;
    }
    case "repay": {
      const loans = s.liabilities.filter((l) => l.kind === "loan");
      need(loans.length, "Không có khoản vay.", "No loan to repay.");
      const total = loans.reduce((v, l) => v + l.amount, 0);
      need(
        s.cash >= total,
        "Không đủ tiền trả hết khoản vay.",
        "Not enough cash to repay the loan.",
      );
      action(s);
      book(
        s,
        "loan-repayment",
        copy("Hoàn trả vốn vay", "Loan principal repayment"),
        { cash: -total, liability: -total },
      );
      s.liabilities = s.liabilities.filter((l) => l.kind !== "loan");
      return true;
    }
    case "upgradeOffice":
      need(
        s.officeTier === 1,
        "Đã ở cấp văn phòng cao nhất của MVP.",
        "Already at the maximum MVP office tier.",
      );
      need(
        s.day >= 30 && s.reputation >= 50,
        "Mở khóa sau tháng đầu và uy tín 50.",
        "Unlocks after month one at 50 reputation.",
      );
      action(s);
      spend(
        s,
        1200000,
        copy("Chuyển sang văn phòng lớn", "Move to a larger office"),
      );
      s.officeTier = 2;
      for (const e of s.employees) e.morale = clamp(e.morale + 3);
      log(
        s,
        "good",
        copy("Văn phòng mới", "New office"),
        copy(
          "Sức chứa 12 người. Phí văn phòng tăng $1.800/tháng.",
          "Capacity is now 12. Monthly office costs rise by $1,800.",
        ),
        "office",
      );
      return true;
    case "continueSandbox":
      need(
        s.status === "review",
        "Chưa đến kỳ tổng kết.",
        "Campaign review is not available yet.",
      );
      s.status = "playing";
      s.mode = "sandbox";
      return true;
    case "tutorial":
      need(
        [
          "observe",
          "assign",
          "policy",
          "decision",
          "review",
          "income",
        ].includes(c.step),
        "Bước hướng dẫn không hợp lệ.",
        "Invalid tutorial step.",
      );
      if (!s.tutorial.seen.includes(c.step)) s.tutorial.seen.push(c.step);
      s.tutorial.completed = s.tutorial.seen.length >= 6;
      return true;
    default:
      return false;
  }
}
export function unknownCommand(): never {
  throw new RuleError(
    "Hành động chưa khả dụng.",
    "This action is not available.",
  );
}
