import type { State, Command, Contract } from "../simulation/types";
import { copy, CONTRACTS } from "../content/catalog";
import { action, need, uid, rng, clamp, log } from "../simulation/helpers";
import { book } from "../simulation/finance";
import { makeWork, quality } from "../simulation/work";
export function createLead(s: State, templateIndex?: number) {
  let index = templateIndex;
  if (index === undefined) {
    const weights = CONTRACTS.map((t) => {
      const previous = s.contracts
        .filter((c) => c.client === t.client && c.stage === "accepted")
        .at(-1);
      return previous
        ? previous.trust >= 60
          ? 1 + (previous.trust - 60) / 12
          : 0.08
        : 1;
    });
    let draw = rng(s) * weights.reduce((a, b) => a + b, 0);
    index = weights.length - 1;
    for (let i = 0; i < weights.length; i++) {
      draw -= weights[i];
      if (draw <= 0) {
        index = i;
        break;
      }
    }
  }
  const t = CONTRACTS[index];
  const previous = s.contracts
    .filter((c) => c.client === t.client && c.stage === "accepted")
    .at(-1);
  const id = uid(s, "contract");
  const w = makeWork(s, t.name, "contract", t.work, { projectId: id });
  const c: Contract = {
    id,
    templateId: t.id,
    client: t.client,
    segment: t.segment,
    type: t.type,
    stage: "lead",
    workId: w.id,
    price: t.price,
    rate: Math.round(t.price / t.work),
    estimated: t.work,
    deadline: s.day + t.days - (s.difficulty === "tough" ? 7 : 0),
    trust: previous
      ? clamp(previous.trust * 0.8 + s.reputation * 0.2)
      : 55 + s.reputation * 0.15,
    deposit: 0,
    midAccepted: false,
    finalAccepted: false,
    lateProfile: t.late,
    revenue: 0,
    invoiced: 0,
    changeCount: 0,
    changePending: false,
    discount: 0,
    completedDay: null,
  };
  s.contracts.push(c);
  return c;
}
export function invoice(
  s: State,
  c: Contract,
  amount: number,
  label: Contract["client"] | undefined,
  earned: number = amount,
) {
  if (amount <= 0 && earned <= 0) return;
  const id = uid(s, "invoice");
  const text = copy(
    `${label ?? c.client} — hóa đơn`,
    `${label ?? c.client} — invoice`,
  );
  const deferred = Math.min(c.deposit, Math.max(0, earned - amount));
  book(s, "invoice", text, {
    receivable: amount,
    revenue: earned,
    deferred: -deferred,
    reference: id,
  });
  c.deposit -= deferred;
  c.revenue += earned;
  c.invoiced += amount;
  if (amount > 0)
    s.invoices.push({
      id,
      projectId: c.id,
      label: text,
      amount,
      issued: s.day,
      due: s.day + 7,
      clears:
        s.day +
        7 +
        Math.floor(
          rng(s) *
            (Math.round(
              c.lateProfile * (c.trust < 45 ? 1.8 : c.trust > 75 ? 0.65 : 1),
            ) +
              1),
        ),
      paid: false,
      expedited: false,
    });
  log(
    s,
    "good",
    copy("Đã lập hóa đơn", "Invoice issued"),
    copy(
      "Doanh thu đã ghi nhận. Tiền chỉ tăng khi khách thanh toán.",
      "Revenue is booked. Cash increases only when payment clears.",
    ),
    id,
  );
}
export function contractCommand(s: State, cmd: Command): boolean {
  if (cmd.type === "findLead") {
    need(
      s.strategy === "outsourcing" ||
        s.secondary === "outsourcing" ||
        s.strategy === "startup",
      "Bật nguồn thu phụ Outsourcing trước.",
      "Enable Outsourcing as a secondary business first.",
    );
    need(
      s.contracts.filter((c) =>
        ["lead", "qualified", "quoted"].includes(c.stage),
      ).length < 4,
      "Đang có quá nhiều cơ hội chưa xử lý.",
      "Handle existing leads first.",
    );
    action(s);
    createLead(s);
    return true;
  }
  if (
    !["qualify", "quote", "sign", "accept", "change", "collect"].includes(
      cmd.type,
    )
  )
    return false;
  if (cmd.type === "collect") {
    const i = s.invoices.find((i) => i.id === cmd.invoiceId && !i.paid);
    need(
      i && !i.expedited,
      "Hóa đơn đã thu hoặc đã được đẩy nhanh.",
      "Invoice is settled or already expedited.",
    );
    action(s);
    i.expedited = true;
    i.clears = Math.min(i.clears, s.day + 2);
    log(
      s,
      "info",
      copy("Đã liên hệ thu tiền", "Collection follow-up sent"),
      copy(
        "Khách cam kết thanh toán trong tối đa 2 ngày.",
        "The client committed to pay within 2 days.",
      ),
      i.id,
    );
    return true;
  }
  if (!("contractId" in cmd)) return false;
  const c = s.contracts.find((c) => c.id === cmd.contractId);
  need(c, "Không tìm thấy hợp đồng.", "Contract not found.");
  const w = s.work.find((w) => w.id === c.workId)!;
  switch (cmd.type) {
    case "qualify":
      need(
        c.stage === "lead",
        "Cơ hội đã được đánh giá.",
        "Lead already qualified.",
      );
      c.stage = "qualified";
      w.discovered = true;
      log(
        s,
        "info",
        copy("Đã làm rõ yêu cầu", "Requirements clarified"),
        copy(
          "Ước lượng được thu hẹp theo phạm vi đã khảo sát; khối lượng thực không bị thay đổi.",
          "Estimate uncertainty narrows after discovery; actual work is unchanged.",
        ),
        c.id,
      );
      return true;
    case "quote":
      need(
        ["lead", "qualified", "quoted"].includes(c.stage),
        "Không thể đổi báo giá sau khi ký.",
        "A signed quote cannot be changed.",
      );
      need(
        Number.isFinite(cmd.discount) &&
          cmd.discount >= 0 &&
          cmd.discount <= 0.15,
        "Chiết khấu tối đa 15%.",
        "Discount must be 0–15%.",
      );
      need(
        ["fixed", "tm"].includes(cmd.contractType),
        "Loại hợp đồng không hợp lệ.",
        "Invalid contract type.",
      );
      c.stage = "quoted";
      c.type = cmd.contractType;
      c.price = Math.round(
        CONTRACTS.find((t) => t.id === c.templateId)!.price *
          (1 - cmd.discount),
      );
      c.trust = clamp(c.trust + (cmd.discount - c.discount) * 50);
      c.discount = cmd.discount;
      c.rate = Math.round(c.price / c.estimated);
      return true;
    case "sign":
      need(
        c.stage === "quoted",
        "Hãy gửi báo giá trước khi ký.",
        "Prepare a quote before signing.",
      );
      need(
        s.contracts.filter((x) => x.stage === "signed").length < 2,
        "Tối đa hai dự án khách hàng cùng lúc.",
        "Maximum two active client projects.",
      );
      action(s);
      c.stage = "signed";
      c.deadline =
        s.day +
        (CONTRACTS.find((t) => t.id === c.templateId)?.days ?? 70) -
        (s.difficulty === "tough" ? 7 : 0) -
        (s.mode === "deadline" ? 14 : 0);
      c.deposit = c.type === "fixed" ? Math.round(c.price * 0.2) : 0;
      if (c.deposit)
        book(
          s,
          "deposit",
          copy(`${c.client} — đặt cọc 20%`, `${c.client} — 20% deposit`),
          { cash: c.deposit, deferred: c.deposit, reference: c.id },
        );
      s.promises.push({
        id: uid(s, "promise"),
        label: copy("Giao dự án đúng hạn", "Deliver the project on time"),
        recipient: copy(c.client, c.client),
        due: c.deadline,
        kind: "delivery",
        target: c.id,
        goal: 1,
        status: "open",
        created: s.day,
      });
      log(
        s,
        "good",
        copy("Hợp đồng có hiệu lực", "Contract signed"),
        copy(
          "Phân công Dev để phát triển và QA để kiểm tra. Đặt cọc là tiền nhận trước, chưa phải toàn bộ doanh thu.",
          "Assign development and QA. The deposit is an advance, not the entire contract revenue.",
        ),
        c.id,
      );
      return true;
    case "accept": {
      need(
        c.stage === "signed",
        "Dự án không ở giai đoạn nghiệm thu.",
        "Project is not awaiting acceptance.",
      );
      const mid = cmd.milestone === "mid";
      need(
        cmd.milestone === "mid" || cmd.milestone === "final",
        "Mốc nghiệm thu không hợp lệ.",
        "Invalid milestone.",
      );
      need(
        mid ? !c.midAccepted : !c.finalAccepted,
        "Mốc này đã nghiệm thu.",
        "Milestone already accepted.",
      );
      need(
        mid ? w.done >= w.actual * 0.5 : w.done >= w.actual,
        "Công việc chưa đạt mốc nghiệm thu.",
        "Not enough completed work for this milestone.",
      );
      if (!mid)
        need(
          c.midAccepted || c.type === "tm",
          "Hãy nghiệm thu giữa kỳ trước.",
          "Accept the midpoint milestone first.",
        );
      const qaOK = w.qa >= Math.max(1, w.done * 0.12),
        qOK =
          quality(w) >= 70 && !w.bugs.some((b) => b.known && b.severity === 3);
      if (!qaOK || !qOK) {
        need(
          cmd.override,
          "Chưa đạt kiểm thử hoặc chất lượng. Phân công QA và Dev sửa lỗi.",
          "Quality gate not met. Assign QA and fix known defects.",
        );
        action(s);
        c.trust = clamp(c.trust - 15);
        s.reputation = clamp(s.reputation - 5);
        log(
          s,
          "warning",
          copy("CEO vượt cổng chất lượng", "CEO overrides quality gate"),
          copy(
            "Rủi ro lỗi ẩn, hỗ trợ và mất niềm tin đã được chấp nhận.",
            "The company accepted incident, support and trust risks.",
          ),
          c.id,
        );
      }
      if (mid) {
        c.midAccepted = true;
        if (c.type === "fixed")
          invoice(
            s,
            c,
            Math.round(c.price * 0.4),
            c.client,
            Math.round(c.price * 0.4) + c.deposit,
          );
      } else {
        c.finalAccepted = true;
        c.stage = "accepted";
        c.completedDay = s.day;
        w.status = "released";
        const outstanding = c.price - c.revenue;
        if (c.type === "fixed")
          invoice(s, c, outstanding, c.client, outstanding);
        else {
          const remaining =
            Math.min(c.price, Math.round(w.effort * c.rate)) - c.revenue;
          if (remaining > 0) invoice(s, c, remaining, c.client);
        }
        s.metrics.completedContracts++;
        if (s.metrics.clients.includes(c.client)) {
          if (!s.metrics.repeatClients.includes(c.client))
            s.metrics.repeatClients.push(c.client);
        } else s.metrics.clients.push(c.client);
        c.trust = clamp(c.trust + (s.day <= c.deadline ? 8 : -8));
        s.reputation = clamp(s.reputation + (s.day <= c.deadline ? 5 : -3));
      }
      s.metrics.milestones++;
      if (s.day <= c.deadline) s.metrics.onTime++;
      log(
        s,
        "good",
        copy(
          mid ? "Đã nghiệm thu giữa kỳ" : "Đã nghiệm thu cuối kỳ",
          mid ? "Midpoint accepted" : "Final delivery accepted",
        ),
        copy(
          "Xem ngày đến hạn hóa đơn trong Tài chính.",
          "Check invoice due dates in Finance.",
        ),
        c.id,
      );
      return true;
    }
    case "change":
      need(
        c.stage === "signed" && c.changePending,
        "Hiện không có yêu cầu thay đổi cần duyệt.",
        "There is no pending change request.",
      );
      action(s);
      c.changePending = false;
      if (cmd.choice === "decline") {
        c.trust = clamp(c.trust - 5);
      } else if (cmd.choice === "extend") {
        c.deadline += 14;
        c.trust = clamp(c.trust - 3);
        const p = s.promises.find(
          (p) => p.target === c.id && p.status === "open",
        );
        if (p) p.due = c.deadline;
      } else {
        need(
          cmd.choice === "paid" || cmd.choice === "free",
          "Lựa chọn không hợp lệ.",
          "Invalid choice.",
        );
        w.actual += 6;
        w.estimated += 6;
        c.estimated += 6;
        c.changeCount++;
        w.status = "active";
        if (cmd.choice === "paid") {
          c.price += 450000;
          c.trust = clamp(c.trust - 2);
        } else c.trust = clamp(c.trust + 8);
      }
      return true;
    default:
      return false;
  }
}
export function contractsDay(s: State) {
  for (const c of s.contracts.filter((c) => c.stage === "signed")) {
    const w = s.work.find((w) => w.id === c.workId)!;
    if (!c.changePending && c.changeCount === 0 && s.day === w.created + 28) {
      c.changePending = true;
      log(
        s,
        "warning",
        copy("Khách đề nghị mở rộng phạm vi", "Client requests a scope change"),
        copy(
          "Yêu cầu bổ sung chưa được đưa vào công việc. CEO quyết định tính phí, làm miễn phí, đổi lịch hoặc từ chối.",
          "Extra scope has not been added. Charge for it, include it, renegotiate the date or decline.",
        ),
        c.id,
      );
    }
    if (c.type === "tm" && s.day % 7 === 0) {
      const targetRevenue = Math.min(c.price, Math.round(w.effort * c.rate));
      const amount = targetRevenue - c.revenue;
      if (amount > 0) invoice(s, c, amount, c.client);
    }
    if (s.day === c.deadline - 14)
      log(
        s,
        "warning",
        copy("Còn 14 ngày đến lịch giao", "Delivery is due in 14 days"),
        copy(
          "Đối chiếu phần việc còn lại, QA và năng lực nhóm. Có thể đàm phán thêm thời gian.",
          "Compare remaining work, QA and team capacity. You can renegotiate the deadline.",
        ),
        c.id,
      );
    if (s.day === c.deadline + 1) {
      c.trust = clamp(c.trust - 8);
      s.reputation = clamp(s.reputation - 3);
      log(
        s,
        "warning",
        copy("Dự án đã trễ lịch", "Project is overdue"),
        copy(
          "Giữ chất lượng và trao đổi lại lịch giao để bảo vệ quan hệ.",
          "Protect quality and renegotiate delivery to preserve the relationship.",
        ),
        c.id,
      );
    }
  }
  for (const w of s.work.filter((w) => w.status === "released")) {
    const hidden = w.bugs.filter((b) => !b.known);
    if (hidden.length && s.day % 7 === 0 && rng(s) < 0.35) {
      const b = hidden[0];
      b.known = true;
      b.revealed = s.day;
      s.metrics.incidents++;
      s.reputation = clamp(s.reputation - b.severity);
      const c = s.contracts.find((c) => c.workId === w.id);
      if (c) c.trust = clamp(c.trust - b.severity * 2);
      if (w.kind === "feature" || w.kind === "mvp") {
        s.product.reliability = clamp(s.product.reliability - b.severity * 4);
        s.product.support += b.severity;
      }
      log(
        s,
        "warning",
        copy(
          "Lỗi được phát hiện sau phát hành",
          "A post-release defect appears",
        ),
        copy(
          `${w.label.vi}: phân công Dev sửa lỗi để giảm tải hỗ trợ.`,
          `${w.label.en}: assign a developer to reduce support load.`,
        ),
        w.id,
      );
    }
  }
}
