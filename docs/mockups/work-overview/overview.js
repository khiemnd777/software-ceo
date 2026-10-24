const $ = (selector) => document.querySelector(selector);
let locale = "vi",
  filter = "all",
  selected = null,
  tab = "overview",
  opener = null;
const t = (vi, en) => (locale === "vi" ? vi : en);
const projects = [
  {
    id: "retail",
    title: ["Cổng quản lý cửa hàng", "Retail operations portal"],
    client: "Mộc Retail",
    price: "$28,500",
    type: "TIME & MATERIALS",
    state: "signed",
    due: 84,
    dev: "40,5",
    devEn: "40.5",
    scope: "32–52",
    qa: "13,6",
    qaEn: "13.6",
    debt: 1,
    quality: 100,
    team: true,
    attention: true,
  },
  {
    id: "academy",
    title: ["Cổng tiến độ học viên", "Learner progress portal"],
    client: "Bright Academy",
    price: "$42,000",
    type: "FIXED PRICE",
    state: "quoted",
    due: 126,
  },
  {
    id: "studio",
    title: ["Tự động hóa studio", "Studio workflow automation"],
    client: "North Studio",
    price: "$32,000",
    type: "FIXED PRICE",
    state: "quoted",
    due: 112,
  },
  {
    id: "booking",
    title: ["Hệ thống đặt lịch", "Booking system"],
    client: "An Clinic",
    price: "$24,000",
    type: "FIXED PRICE",
    state: "qualified",
    due: 95,
  },
  {
    id: "customer",
    title: ["Cổng chăm sóc khách hàng", "Customer service portal"],
    client: "Blue Services",
    price: "$36,000",
    type: "FIXED PRICE",
    state: "lead",
    due: 109,
  },
  {
    id: "reports",
    title: ["Báo cáo vận hành", "Operations reporting"],
    client: "Mộc Retail",
    price: "$18,000",
    type: "FIXED PRICE",
    state: "accepted",
    due: 51,
    dev: "28,0",
    devEn: "28.0",
    scope: "28",
    qa: "5,2",
    qaEn: "5.2",
    quality: 100,
    debt: 0,
  },
];
const title = (p) => p.title[locale === "vi" ? 0 : 1];
const dataset = () =>
  $("#scene").value === "empty"
    ? []
    : projects.slice(0, $("#scene").value === "six" ? 6 : 3);
const stateLabel = (p) =>
  p.attention
    ? t("Thiếu Dev", "Needs developer")
    : p.state === "accepted"
      ? t("Đã nghiệm thu", "Accepted")
      : p.state === "signed"
        ? t("Đang làm", "In progress")
        : p.state === "lead"
          ? t("Cơ hội mới", "New lead")
          : t("Chờ ký", "Awaiting signature");
function status(p) {
  return `<span class="status ${p.attention ? "warning" : p.state === "accepted" ? "success" : ""}"><span class="status-icon" aria-hidden="true">${p.attention ? "!" : p.state === "accepted" ? "✓" : "○"}</span>${stateLabel(p)}</span>`;
}
const value = (p, k) => (locale === "en" ? (p[k + "En"] ?? p[k]) : p[k]);
function render() {
  document.documentElement.lang = locale;
  document.documentElement.dataset.scale = $("#scale").value;
  $("#language").textContent = t("EN", "VI");
  $("#workspace").setAttribute("aria-label", t("Công việc", "Work"));
  $("#search").placeholder = t(
    "Tìm dự án, khách hàng…",
    "Search projects or clients…",
  );
  $("#close-detail").setAttribute(
    "aria-label",
    t("Đóng chi tiết", "Close details"),
  );
  $("#filters").setAttribute("aria-label", t("Lọc công việc", "Filter work"));
  $("#detail-tabs").setAttribute(
    "aria-label",
    t("Các phần chi tiết", "Detail sections"),
  );
  document
    .querySelectorAll("[data-vi]")
    .forEach((el) => (el.textContent = el.dataset[locale]));
  const all = dataset();
  $("#total-count").textContent = all.length;
  $("#overview-strip").innerHTML =
    `<span><b>${all.filter((p) => p.state === "signed").length}</b>${t("đã ký", "signed")}</span><span><b>${all.filter((p) => ["lead", "qualified", "quoted"].includes(p.state)).length}</b>${t("chờ cam kết", "awaiting commitment")}</span><span class="attention"><b>${all.filter((p) => p.attention).length}</b>${t("cần phân công lại", "need reassignment")}</span><span><b>${all.length ? "2/2" : "—"}</b>${t("nhân viên có việc", "staff assigned")}</span>`;
  $("#filters").innerHTML = [
    ["all", t("Tất cả", "All")],
    ["signed", t("Đã ký", "Signed")],
    ["offers", t("Cơ hội", "Opportunities")],
    ["accepted", t("Hoàn tất", "Completed")],
  ]
    .map(
      ([id, label]) =>
        `<button data-filter="${id}" aria-pressed="${filter === id}">${label}</button>`,
    )
    .join("");
  const q = $("#search").value.trim().toLocaleLowerCase(locale);
  let rows = all.filter(
    (p) =>
      (filter === "all" ||
        (filter === "offers" &&
          ["lead", "qualified", "quoted"].includes(p.state)) ||
        p.state === filter) &&
      `${title(p)} ${p.client}`.toLocaleLowerCase(locale).includes(q),
  );
  rows.sort((a, b) =>
    $("#sort").value === "deadline"
      ? a.due - b.due
      : Number(!!b.attention) - Number(!!a.attention),
  );
  $("#work-rows").innerHTML = rows
    .map(
      (p) =>
        `<tr data-id="${p.id}"><td><button class="project-open" data-open="${p.id}" aria-label="${t("Xem", "Inspect")} ${title(p)}"><span>${title(p)}</span><small>${p.client} · ${p.price}</small></button></td><td>${status(p)}</td><td><strong class="due-number">${p.due}</strong><small>${p.state === "accepted" ? t("Đã giao", "Delivered") : t(`còn ${p.due - 53} ngày`, `${p.due - 53} days left`)}</small></td><td>${p.dev ? `<strong>${value(p, "dev")} WP</strong><small>${p.state === "accepted" ? t("Phạm vi", "Scope") : t("Ước tính", "Estimate")} ${p.scope}</small>` : `<span class="muted">—</span><small>${t("Chưa ký", "Unsigned")}</small>`}</td><td>${p.qa ? `<strong>${value(p, "qa")} WP</strong><small>${t("0 lỗi đã biết", "0 known defects")}</small>` : `<span class="muted">—</span><small>${t("Chưa kiểm thử", "Not tested")}</small>`}</td><td>${p.team ? `<div class="team-line">Minh <span class="role">· ${t("Giảm nợ", "Refactor")}</span></div><div class="team-line">Linh <span class="role">· QA</span></div>` : `<span class="muted">${p.state === "accepted" ? t("Đã kết thúc", "Completed") : t("Chưa phân công", "Unassigned")}</span>`}</td><td><button class="row-action" data-open="${p.id}" aria-label="${t("Chi tiết", "Details")} ${title(p)}">${t("Chi tiết", "Details")} ↗</button></td></tr>`,
    )
    .join("");
  $("#empty").hidden = rows.length > 0;
  $("#empty").innerHTML = all.length
    ? `<strong>${t("Không có công việc phù hợp", "No matching work")}</strong>${t("Thử từ khóa hoặc bộ lọc khác.", "Try another search or filter.")}<br><button id="reset">${t("Xóa bộ lọc", "Clear filters")}</button>`
    : `<strong>${t("Chưa có công việc", "No work yet")}</strong>${t("Cơ hội mới sẽ xuất hiện ở đây để bạn so sánh trước khi cam kết.", "New opportunities appear here to compare before committing.")}`;
  $("#result-count").textContent =
    `${rows.length} ${t("công việc đang hiển thị", "work items shown")}`;
  if (selected) renderDetail();
}
function renderDetail() {
  const p = projects.find((p) => p.id === selected);
  $("#detail-type").textContent = p.type;
  $("#detail-title").textContent = title(p);
  $("#detail-client").textContent = `${p.client} · ${p.price}`;
  $("#detail-tabs").innerHTML = [
    ["overview", t("Tổng quan", "Overview")],
    ["team", t("Phân công", "Assignments")],
    ["terms", t("Điều khoản", "Terms")],
  ]
    .map(
      ([id, label]) =>
        `<button data-tab="${id}" aria-pressed="${tab === id}">${label}</button>`,
    )
    .join("");
  const fact = (key, val) =>
    `<div class="fact"><dt>${key}</dt><dd>${val}</dd></div>`;
  if (tab === "overview") {
    $("#detail-body").innerHTML =
      `${p.attention ? `<div class="notice"><span>! ${t("Minh đang giảm nợ; phần phát triển còn thiếu người.", "Minh is refactoring; remaining development has no capacity.")}</span><button data-go="team">${t("Xem phân công", "Review assignments")} →</button></div>` : `<div class="notice info">${p.state === "accepted" ? t("Đã nghiệm thu. Tiền mặt chỉ tăng khi hóa đơn được thanh toán.", "Accepted. Cash increases when invoice payments clear.") : t("Xem điều khoản và năng lực đội ngũ trước khi cam kết.", "Review terms and team capacity before committing.")}</div>`}<dl class="facts">${fact(t("Trạng thái", "Status"), status(p))}${fact(t("Giao trước ngày", "Due day"), p.due)}${fact(t("Phát triển", "Development"), p.dev ? `${value(p, "dev")} WP` : t("Chưa bắt đầu", "Not started"))}${fact(t("Phạm vi", "Scope"), p.dev ? `${p.scope} WP${p.state === "accepted" ? "" : t(" (ước tính)", " (estimate)")}` : t("Xem sau khi làm rõ", "Review after qualification"))}${fact("QA", p.qa ? `${value(p, "qa")} WP` : t("Chưa kiểm thử", "Not tested"))}${fact(t("Chất lượng từ lỗi đã biết", "Known-defect quality"), p.qa ? `${p.quality}%` : t("Chưa kiểm thử", "Not tested"))}${fact(t("Nợ kỹ thuật", "Technical debt"), p.debt ?? "—")}</dl><h3>${t("Dự báo giao hàng", "Delivery forecast")}</h3><p>${p.attention ? t("Chưa có ước tính thời gian vì thiếu năng lực phát triển. Cần thêm QA: 0,0 WP. Sửa lỗi đã biết: 0,0 WP.", "Time estimate unavailable while development capacity is missing. Additional QA: 0.0 WP. Known repair work: 0.0 WP.") : t("Thời gian và biên lợi nhuận được cập nhật theo phân công thực tế trong game.", "Time and margin estimates update with actual game assignments.")}</p>`;
  } else if (tab === "team") {
    $("#detail-body").innerHTML = p.team
      ? `<div class="notice"><span>! ${t("Thiếu người phát triển; QA đang có người phụ trách.", "Development lacks capacity; QA has an assignee.")}</span></div><div class="teammate"><strong>Minh Nguyễn</strong><span>${t("Lập trình · Kỹ năng 3/5", "Developer · Skill 3/5")}</span><p>${t("Đang làm: Giảm nợ kỹ thuật", "Current task: Refactor")}</p></div><div class="teammate"><strong>Linh Trần</strong><span>QA · ${t("Kỹ năng", "Skill")} 3/5</span><p>${t("Đang làm: QA", "Current task: QA")}</p></div><h3>${t("Đánh đổi khi phân công", "Assignment trade-offs")}</h3><p>${t("Chuyển Minh sang Phát triển giúp tiếp tục làm dự án, nhưng tạm dừng giảm nợ. Giao việc thứ hai chia đều thời gian và giảm tập trung 15%.", "Moving Minh to development resumes project work but pauses refactoring. A second task splits time equally and reduces focus by 15%.")}</p>`
      : `<div class="notice info">${t("Chưa có người đang làm dự án này.", "Nobody is currently assigned to this project.")}</div><p>${p.state === "accepted" ? t("Dự án đã nghiệm thu. Xem các công việc còn mở để phân bổ đội ngũ.", "This project is accepted. Review open work to allocate the team.") : t("Ký hợp đồng trước khi phân công. Xem năng lực và hạn giao trước khi nhận thêm việc.", "Sign the contract before assigning work. Review capacity and deadlines before taking on more work.")}</p>`;
  } else {
    $("#detail-body").innerHTML =
      `<dl class="facts">${fact(t("Loại hợp đồng", "Contract type"), p.type)}${fact(t("Giá trị / trần ngân sách", "Price / budget cap"), p.price)}${fact(t("Hạn giao", "Due day"), p.due)}</dl><h3>${t("Thanh toán", "Payment")}</h3><p>${p.type === "TIME & MATERIALS" ? t("Tính phí theo điểm việc thực tế, bao gồm QA và sửa lỗi; không vượt trần ngân sách. Không có tiền cọc.", "Bill actual work points, including QA and fixes, up to the budget cap. No deposit.") : t("Cọc 20% khi ký. 40% giữa kỳ. 40% cuối kỳ. Tiền cọc là tiền nhận trước; doanh thu và khoản phải thu được ghi nhận theo mốc.", "20% deposit on signing, 40% midpoint, 40% final acceptance. Deposits are advances; revenue and receivables are booked at milestones.")}</p><h3>${t("Lượt CEO & rủi ro", "CEO action & risk")}</h3><p>${t("Ký hợp đồng dùng một lượt CEO. Nghiệm thu không có nghĩa tiền đã về tài khoản. Hóa đơn có kỳ hạn và khách có thể trả chậm.", "Signing costs one CEO action. Acceptance does not mean cash has cleared. Invoices have due dates and clients may pay late.")}</p>`;
  }
}
function openDetail(id, trigger) {
  selected = id;
  tab = "overview";
  opener = trigger;
  renderDetail();
  $("#inspector").showModal();
  $("#close-detail").focus();
}
$("#work-rows").addEventListener("click", (e) => {
  const b = e.target.closest("[data-open]");
  if (b) openDetail(b.dataset.open, b);
});
$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest("[data-filter]");
  if (b) {
    filter = b.dataset.filter;
    render();
    $("#filters").querySelector(`[data-filter="${filter}"]`).focus();
  }
});
$("#detail-tabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-tab]");
  if (b) {
    tab = b.dataset.tab;
    renderDetail();
    $("#detail-tabs").querySelector(`[data-tab="${tab}"]`).focus();
  }
});
$("#detail-body").addEventListener("click", (e) => {
  const b = e.target.closest("[data-go]");
  if (b) {
    tab = b.dataset.go;
    renderDetail();
    $("#detail-tabs").querySelector(`[data-tab="${tab}"]`).focus();
  }
});
$("#empty").addEventListener("click", (e) => {
  if (e.target.closest("#reset")) {
    filter = "all";
    $("#search").value = "";
    render();
    $("#search").focus();
  }
});
["#close-detail", "#back-to-board"].forEach((id) =>
  $(id).addEventListener("click", () => $("#inspector").close()),
);
$("#inspector").addEventListener("close", () => {
  selected = null;
  opener?.focus();
});
$("#inspector").addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const controls = [
    ...$("#inspector").querySelectorAll("button,input,select,a[href]"),
  ].filter((el) => !el.disabled && el.getClientRects().length);
  const first = controls[0],
    last = controls.at(-1);
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
$("#search").addEventListener("input", render);
$("#sort").addEventListener("change", render);
$("#scale").addEventListener("change", render);
$("#scene").addEventListener("change", () => {
  filter = "all";
  $("#search").value = "";
  render();
});
$("#language").addEventListener("click", () => {
  locale = locale === "vi" ? "en" : "vi";
  render();
});
$("#hide-review").addEventListener("click", () => {
  $(".review").hidden = true;
  document.body.classList.add("review-hidden");
  $("#show-review").hidden = false;
  $("#workspace").focus();
});
$("#show-review").addEventListener("click", () => {
  $(".review").hidden = false;
  document.body.classList.remove("review-hidden");
  $("#show-review").hidden = true;
  $("#hide-review").focus();
});
render();
