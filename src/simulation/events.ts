import type { State, Effect, EventTemplate } from "./types";
import { copy } from "../content/catalog";
import { EVENTS } from "../content/events";
import { clamp, uid, rng, log, mean } from "./helpers";
import { book } from "./finance";
export function applyEffect(s: State, e: Effect, source: string) {
  if (e.cash) {
    if (e.cash > 0)
      book(
        s,
        "otherRevenue",
        copy("Kết quả quyết định CEO", "CEO decision outcome"),
        { cash: e.cash, revenue: e.cash },
      );
    else {
      const amount = -e.cash,
        paid = Math.min(s.cash, amount);
      book(
        s,
        "eventExpense",
        copy("Chi phí từ quyết định trước", "Cost of an earlier decision"),
        { cash: -paid, expense: amount, liability: amount - paid },
      );
      if (amount > paid)
        s.liabilities.push({
          id: uid(s, "liability"),
          label: copy("Chi phí quyết định chưa trả", "Unpaid decision cost"),
          amount: amount - paid,
          kind: "operations",
          created: s.day,
          deadline: null,
        });
    }
  }
  if (e.reputation) s.reputation = clamp(s.reputation + e.reputation);
  for (const person of s.employees) {
    if (e.morale) person.morale = clamp(person.morale + e.morale);
    if (e.energy) person.energy = clamp(person.energy + e.energy);
  }
  if (e.fit && s.product.exists) s.product.fit = clamp(s.product.fit + e.fit);
  if (e.reliability && s.product.exists)
    s.product.reliability = clamp(s.product.reliability + e.reliability);
  if (e.awareness && s.product.exists)
    s.product.awareness = clamp(s.product.awareness + e.awareness);
  if (e.debt) {
    s.product.debt = clamp(s.product.debt + e.debt);
    for (const w of s.work)
      if (w.status !== "released") w.debt = clamp(w.debt + e.debt);
  }
  if (e.demand)
    for (const m of Object.values(s.market))
      m.demand = Math.max(30, m.demand + e.demand);
  const c = s.contracts.find((c) => c.stage === "signed");
  if (c) {
    if (e.trust) c.trust = clamp(c.trust + e.trust);
    if (e.scope) {
      const w = s.work.find((w) => w.id === c.workId);
      if (w) {
        w.actual += e.scope;
        w.estimated += e.scope;
        w.status = "active";
        c.estimated += e.scope;
        c.changeCount++;
      }
    }
    if (e.price) c.price += e.price;
  }
  if (e.deferInvoice) {
    const i = s.invoices.find((i) => !i.paid);
    if (i) i.clears = Math.max(s.day + e.deferInvoice, i.clears);
  }
  if (e.promise) {
    const target = e.promise === "salary" ? s.employees[0] : undefined;
    s.promises.push({
      id: uid(s, "promise"),
      label:
        e.promise === "salary"
          ? copy("Xem xét tăng lương", "Complete a salary review")
          : e.promise === "growth"
            ? copy("Cam kết tăng khách hàng", "Customer growth commitment")
            : copy("Giữ lịch giao hàng", "Deliver on time"),
      recipient: copy(
        target?.name ?? c?.client ?? "Đội ngũ",
        target?.name ?? c?.client ?? "Team",
      ),
      due: s.day + 30,
      kind: e.promise,
      target: target?.id ?? c?.id ?? "product",
      goal: target ? Math.round(target.salary * 1.1) : s.product.paid + 15,
      status: "open",
      created: s.day,
    });
  }
  log(
    s,
    "info",
    copy("Tác động đã ghi nhận", "Decision effect applied"),
    copy(
      "Xem lịch sử và các chỉ số liên quan để theo dõi kết quả.",
      "Check history and related metrics to follow the outcome.",
    ),
    source,
  );
}
function relevant(s: State, e: EventTemplate) {
  if (s.day < e.minDay) return false;
  if (e.category === "people" && !s.employees.length) return false;
  if (
    e.id === "promise-conflict" &&
    s.promises.filter((p) => p.status === "open").length < 2
  )
    return false;
  if (e.id === "late-payment" && !s.invoices.some((i) => !i.paid)) return false;
  if (e.id === "churn-warning" && s.product.churnRate < 0.04) return false;
  switch (e.context) {
    case "contract":
      return s.contracts.some((c) => c.stage === "signed");
    case "product":
      return s.product.launched;
    case "startup":
      return s.strategy === "startup" || s.secondary === "startup";
    case "morale":
      return mean(s.employees.map((e) => e.morale)) < 60;
    case "cash":
      return s.cash < 1500000;
    case "funded":
      return s.venture.rounds > 0;
    default:
      return true;
  }
}
export function eventsDay(s: State) {
  for (const d of s.deferred.filter((d) => d.due <= s.day)) {
    applyEffect(s, d.effect, d.source);
    log(
      s,
      "info",
      copy("Hệ quả từ quyết định trước", "An earlier decision takes effect"),
      d.message,
      d.source,
    );
  }
  s.deferred = s.deferred.filter((d) => d.due > s.day);
  for (const e of s.events.filter((e) => !e.resolved && e.expires <= s.day)) {
    e.resolved = true;
    const t = EVENTS.find((t) => t.id === e.templateId),
      fallback = t?.choices.at(-1);
    if (
      fallback &&
      fallback.cost === 0 &&
      !fallback.immediate.promise &&
      !fallback.immediate.scope
    ) {
      applyEffect(s, fallback.immediate, e.id);
      if (fallback.delay)
        s.deferred.push({
          id: uid(s, "delay"),
          due: s.day + fallback.delay.days,
          effect: fallback.delay.effect,
          message: fallback.delay.message,
          source: e.id,
        });
    }
    log(
      s,
      "info",
      copy("Cơ hội đã hết hạn", "Decision window closed"),
      copy(
        "CEO không phản hồi. Phương án giữ kế hoạch hiện tại và hệ quả đã nêu được áp dụng.",
        "No response was approved. The stated default and its consequences apply.",
      ),
      e.id,
    );
  }
  if (s.day % 21 === 7 && !s.events.some((e) => !e.resolved)) {
    const recent = s.events.slice(-4).map((e) => e.templateId);
    const choices = EVENTS.filter(
      (e) => relevant(s, e) && !recent.includes(e.id),
    );
    if (choices.length) {
      const t = choices[Math.floor(rng(s) * choices.length)];
      s.events.push({
        id: uid(s, "event"),
        templateId: t.id,
        announced: s.day,
        due: s.day + 7,
        expires: s.day + 21,
        resolved: false,
      });
      log(
        s,
        "warning",
        copy("Tín hiệu cần theo dõi", "Something to watch"),
        t.warning,
        t.id,
      );
    }
  }
  for (const p of s.promises.filter((p) => p.status === "open")) {
    const employee = s.employees.find((e) => e.id === p.target);
    const contract = s.contracts.find((c) => c.id === p.target);
    const kept =
      p.kind === "salary"
        ? !!employee && employee.salary >= p.goal
        : p.kind === "delivery"
          ? !!contract && contract.finalAccepted
          : p.kind === "feature"
            ? s.product.features.includes(p.target)
            : s.product.paid >= p.goal;
    if (kept) {
      p.status = "kept";
      s.reputation = clamp(s.reputation + 3);
      log(s, "good", copy("Đã giữ lời hứa", "Promise kept"), p.label, p.id);
    } else if (s.day >= p.due) {
      p.status = "broken";
      s.reputation = clamp(s.reputation - 5);
      for (const e of s.employees)
        e.morale = clamp(e.morale - (e.traits.includes("outspoken") ? 8 : 4));
      log(
        s,
        "warning",
        copy("Cam kết không hoàn thành", "Promise broken"),
        p.label,
        p.id,
      );
    }
  }
}
