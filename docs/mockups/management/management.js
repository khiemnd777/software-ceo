// Design-only fixtures. No simulation, storage, network or game commands are called.
const $ = (id) => document.getElementById(id);
const money = (n) => "$" + n.toLocaleString("en-US");
const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const safe = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const badge = (text, tone = "info") =>
  `<span class="badge ${tone}">${icon(tone === "ok" ? "check" : tone === "info" ? "clock" : "alert")}${text}</span>`;
const link = (label, href) =>
  `<a class="action-link" href="${href}">${label}${icon("arrow")}</a>`;
const button = (
  label,
  action,
  { primary = false, disabled = false, value = "" } = {},
) =>
  `<button ${primary ? 'class="primary"' : 'class="quiet"'} data-action="${action}" ${value ? `data-value="${value}"` : ""} ${disabled ? "disabled" : ""}>${label}</button>`;
const line = (label, value) =>
  `<div class="info-line"><span>${label}</span><strong>${value}</strong></div>`;
const section = (title, content) =>
  `<section><h3>${title}</h3>${content}</section>`;
const metric = (label, value, caption, tone = "") =>
  `<div class="summary-cell"><small>${label}</small><strong class="${tone}">${value}</strong><p>${caption}</p></div>`;
const meter = (label, value, max, caption, tone = "") =>
  `<div class="health-track ${tone}"><div class="track-label"><span>${label}</span><strong>${value} / ${max}</strong></div><div class="bar" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><span style="width:${Math.min(100, (value / max) * 100)}%"></span></div><p>${caption}</p></div>`;
const next = (title, text, action, tone = "info") =>
  `<section class="next ${tone}" aria-label="Bước tiếp theo"><div class="next-label">${icon(tone === "ok" ? "check" : tone === "info" ? "arrow" : "alert")}BƯỚC TIẾP THEO</div><h3>${title}</h3><p>${text}</p>${action ? `<div class="next-bottom">${action}</div>` : ""}</section>`;
const empty = (title, text, action = "", symbol = "work") =>
  `<section class="detail empty-panel"><div class="empty-icon">${icon(symbol)}</div><h2>${title}</h2><p>${text}</p>${action ? `<div class="action-row">${action}</div>` : ""}</section>`;
const heading = (name, subtitle, chapter) =>
  `<div class="screen-intro"><div><div class="chapter">${chapter}</div><h1>${name}<span class="blue">.</span></h1><p>${subtitle}</p></div><div class="week"><strong class="blue">${current().actions} / 3</strong> lượt CEO<br><small>Làm mới mỗi 7 ngày</small></div></div>`;
const job = (
  id,
  name,
  subtitle,
  status,
  foot,
  selected,
  tone = "info",
  extra = "",
) =>
  `<button class="job" data-select="${id}" aria-pressed="${selected}" aria-controls="detail"><div class="row">${badge(status, tone)}</div><strong>${name}</strong><p>${subtitle}</p>${extra}<div class="job-foot">${foot}</div></button>`;
const inspector = (
  title,
  subtitle,
  body,
  { initials = "", tone = "info", status = "", purple = false } = {},
) =>
  `<section class="detail" id="detail" aria-label="${safe(title)}"><div class="inspector-head">${initials ? `<div class="portrait ${purple ? "purple" : ""}">${initials}</div>` : ""}<div><div class="section-kicker">${pages[page].kicker}</div><h2>${title}</h2><p>${subtitle}</p></div>${status ? badge(status, tone) : ""}</div><div class="content-pad">${body}</div></section>`;
const split = (left, right) =>
  `<div class="screen-split"><aside class="selection-list" aria-label="Danh sách lựa chọn">${left}</aside>${right}</div>`;
const tabs = (items) =>
  `<nav class="body-tabs" aria-label="Các mục ${pages[page].name}">${items.map(([label, scene]) => `<button data-scene="${scene}" aria-pressed="${current().scene === scene}">${label}</button>`).join("")}</nav>`;
const queueTitle = (title, count) =>
  `<div class="queue-title"><h3>${title}</h3><span>${count}</span></div>`;
const pages = {
  people: {
    name: "Nhân sự",
    kicker: "ĐỘI NGŨ / NĂNG LỰC",
    scenes: ["01 · Đội ngũ", "02 · Cần chăm sóc", "03 · Tuyển dụng"],
  },
  market: {
    name: "Thị trường",
    kicker: "THỊ TRƯỜNG / KHÁCH HÀNG",
    scenes: ["01 · Phân khúc", "02 · Giá & tăng trưởng", "03 · Cơ hội"],
  },
  finance: {
    name: "Tài chính",
    kicker: "DÒNG TIỀN / KHOẢN PHẢI THU",
    scenes: ["01 · Chờ thanh toán", "02 · Quá hạn", "03 · Chưa có hóa đơn"],
  },
  strategy: {
    name: "Chiến lược",
    kicker: "CHIẾN DỊCH / ĐIỀU HÀNH",
    scenes: ["01 · Mục tiêu", "02 · Chính sách", "03 · Chưa mở khóa"],
  },
  history: {
    name: "Nhật ký",
    kicker: "BÁO CÁO / DÒNG SỰ KIỆN",
    scenes: ["01 · Báo cáo tuần", "02 · Dòng sự kiện", "03 · Trước ngày 7"],
  },
};
const initial = (key) => ({
  scene: 0,
  selected:
    key === "people"
      ? "minh"
      : key === "market"
        ? "retail"
        : key === "finance"
          ? "moc"
          : key === "strategy"
            ? "quality"
            : "invoice",
  cash: 38200,
  actions: 3,
  variant: "normal",
  hired: [],
  trained: [],
  followed: [],
  policy: "balanced",
  price: 79,
  draftPrice: 79,
  budget: 1000,
  draftBudget: 1000,
  query: "",
  severity: "all",
});
const states = Object.fromEntries(
  Object.keys(pages).map((key) => [key, initial(key)]),
);
let page = pages[location.hash.slice(1)] ? location.hash.slice(1) : "people";
let dialogOpener = null,
  pendingAction = null,
  toastTimer;
const current = () => states[page];
const staff = [
  {
    id: "minh",
    name: "Minh Nguyễn",
    role: "Developer",
    initials: "MN",
    salary: 3500,
    skill: 3,
    morale: 78,
    energy: 81,
    trait: "Tham vọng",
    task: "Phát triển · Mộc Retail",
  },
  {
    id: "linh",
    name: "Linh Trần",
    role: "QA",
    initials: "LT",
    salary: 3000,
    skill: 3,
    morale: 74,
    energy: 85,
    trait: "Tỉ mỉ",
    task: "Chưa phân công",
  },
];
const candidates = [
  {
    id: "an",
    name: "An Phạm",
    role: "Developer",
    initials: "AP",
    salary: 3000,
    skill: 3,
    trait: "Tham vọng",
  },
  {
    id: "mai",
    name: "Mai Lê",
    role: "QA",
    initials: "ML",
    salary: 2600,
    skill: 2,
    trait: "Tỉ mỉ",
  },
];
const segments = [
  {
    id: "retail",
    name: "Vận hành bán lẻ",
    need: "Quản lý hàng hóa, doanh thu và khách quen.",
    demand: 80,
    quality: 80,
    trend: 4,
  },
  {
    id: "creative",
    name: "Nhóm sáng tạo",
    need: "Tổ chức nội dung và làm việc cùng khách hàng.",
    demand: 90,
    quality: 72,
    trend: -2,
  },
  {
    id: "education",
    name: "Dịch vụ giáo dục",
    need: "Theo dõi học viên và tiến độ của từng nhóm.",
    demand: 70,
    quality: 88,
    trend: 3,
  },
];
const policies = {
  fast: {
    name: "Giao nhanh",
    speed: "+20%",
    defects: "×1,5",
    debt: "+3 / 20 WP",
    description: "Đẩy nhanh giao hàng, đổi lại nhiều lỗi và nợ kỹ thuật hơn.",
  },
  balanced: {
    name: "Cân bằng",
    speed: "Chuẩn",
    defects: "×1",
    debt: "+1 / 20 WP",
    description: "Giữ nhịp phát triển chuẩn và chi phí sửa chữa vừa phải.",
  },
  quality: {
    name: "Chất lượng trước",
    speed: "−15%",
    defects: "×0,65",
    debt: "Không tạo nợ mới",
    description: "Đi chậm hơn để giảm lỗi và tránh phát sinh nợ kỹ thuật mới.",
  },
};
const invoices = [
  {
    id: "moc",
    name: "Mộc Retail",
    label: "Hóa đơn cuối kỳ",
    amount: 12000,
    due: 49,
    paid: false,
  },
  {
    id: "deposit",
    name: "Mộc Retail",
    label: "Đặt cọc khi ký",
    amount: 6000,
    due: 0,
    paid: true,
  },
];
const events = [
  {
    id: "invoice",
    day: 42,
    type: "good",
    title: "Dự án đã nghiệm thu giữa kỳ",
    text: "Mộc Retail đã nghiệm thu mốc giữa kỳ. Hóa đơn có kỳ hạn thanh toán; tiền chưa về ngay khi nghiệm thu.",
    effect: "Đã lập hóa đơn. Khoản phải thu được theo dõi riêng với tiền mặt.",
    route: "finance",
  },
  {
    id: "qa",
    day: 40,
    type: "info",
    title: "Đã phân công QA",
    text: "Linh Trần nhận việc QA cho dự án Mộc Retail. Phân công không dùng lượt CEO và không tự tạo điểm việc.",
    effect: "Đội ngũ đã cập nhật. QA tiến triển khi thời gian game chạy.",
    route: "work",
  },
  {
    id: "scope",
    day: 37,
    type: "warning",
    title: "Khách đề nghị thêm phạm vi",
    text: "Yêu cầu thêm 6 WP đã được ghi nhận. Cần cân nhắc tính phí, nhận miễn phí, lùi hạn hoặc từ chối.",
    effect: "Chưa ghi nhận lựa chọn xử lý trong sự kiện này.",
    route: "work",
  },
  {
    id: "policy",
    day: 35,
    type: "info",
    title: "Đã chọn chính sách Cân bằng",
    text: "Chính sách được duy trì cho đến khi người chơi thay đổi. Tốc độ chuẩn, lỗi ×1, nợ kỹ thuật +1 mỗi 20 WP.",
    effect: "Các hệ số áp dụng cho phần việc tiếp theo.",
    route: "strategy",
  },
  {
    id: "payroll",
    day: 30,
    type: "critical",
    title: "Thiếu tiền tại kỳ trả lương",
    text: "Một khoản lương chưa được thanh toán vào ngày 30. Đây là ghi nhận tại thời điểm xảy ra; kiểm tra Tài chính để xem tình trạng hiện tại.",
    effect:
      "Phát sinh nợ lương tại thời điểm ghi nhận. Sự kiện không xác nhận nợ vẫn còn ở ngày 42.",
    route: "finance",
  },
  {
    id: "open",
    day: 0,
    type: "good",
    title: "Công ty bắt đầu hoạt động",
    text: "KNA Software bắt đầu hành trình xây dựng đội ngũ và tìm khách hàng.",
    effect:
      "Hai nhân viên khởi đầu. Các quyết định tiếp theo sẽ được ghi vào nhật ký.",
    route: "people",
  },
];

function notify(message) {
  clearTimeout(toastTimer);
  $("toast").textContent = message;
  $("toast").hidden = false;
  toastTimer = setTimeout(() => ($("toast").hidden = true), 7000);
}
function limit(cost = 0) {
  if (current().actions < 1) return "Đã hết lượt CEO trong tuần.";
  if (current().cash < cost) return "Tiền mặt hiện tại không đủ chi phí này.";
  return "";
}
function sceneControls() {
  $("scenarios").innerHTML = pages[page].scenes
    .map(
      (text, i) =>
        `<button data-scene="${i}" aria-pressed="${current().scene === i}">${text}</button>`,
    )
    .join("");
  const variant =
    (page === "people" && current().scene === 2) ||
    (page === "market" && current().scene === 1);
  $("variant-wrap").hidden = !variant;
  if (variant) {
    const options =
      page === "people"
        ? [
            ["normal", "Còn chỗ"],
            ["full", "Đầy 5 chỗ"],
            ["empty", "Hết ứng viên"],
          ]
        : [
            ["normal", "Đã có sản phẩm"],
            ["empty", "Chưa có sản phẩm"],
          ];
    $("review-variant").innerHTML = options
      .map(
        ([value, text]) =>
          `<option value="${value}" ${current().variant === value ? "selected" : ""}>${text}</option>`,
      )
      .join("");
  }
}
function render({ focus = false } = {}) {
  sceneControls();
  document.title = pages[page].name + " — Software CEO · Mockup LOCAL";
  $("cash").textContent = money(current().cash);
  $("strategy-label").textContent =
    page === "market" ? " / PRODUCT" : " / OUTSOURCING";
  const day =
    page === "history" && (current().scene === 2 || current().earlyOnly)
      ? 3
      : page === "strategy" && current().scene === 2
        ? 24
        : 42;
  $("day").textContent = `THÁNG ${Math.floor(day / 30) + 1} · NGÀY ${day}`;
  document.querySelectorAll("[data-page]").forEach((a) => {
    const active = a.dataset.page === page;
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $("screen").innerHTML = {
    people: renderPeople,
    market: renderMarket,
    finance: renderFinance,
    strategy: renderStrategy,
    history: renderHistory,
  }[page]();
  if (focus) $("screen").focus({ preventScroll: true });
}
function renderPeople() {
  const p = current(),
    recruit = p.scene === 2,
    low = p.scene === 1;
  const people = [
    ...staff,
    ...p.hired.map((id) => ({
      ...candidates.find((c) => c.id === id),
      morale: 75,
      energy: 90,
      task: "Chưa phân công",
      new: true,
    })),
  ];
  const selected =
    (recruit ? candidates : people).find((e) => e.id === p.selected) ||
    (recruit ? candidates.find((e) => !p.hired.includes(e.id)) : people[0]);
  let html = heading(
    "Nhân sự",
    "Đúng người, đúng việc và đủ sức cho chặng tiếp theo.",
    "02 / CON NGƯỜI TẠO NÊN CÔNG TY",
  );
  html += `<div class="summary-grid">${metric("ĐỘI NGŨ", `${p.variant === "full" ? 5 : people.length} / 5`, "Chỗ ngồi trong văn phòng")}${metric("QUỸ LƯƠNG / THÁNG", money(p.variant === "full" ? 15100 : people.reduce((n, e) => n + e.salary, 0)), "Lương mới làm tăng chi phí định kỳ")}${metric("CẦN CHÚ Ý", low ? "1 người" : "0 người", low ? "Năng lượng thấp · Minh Nguyễn" : "Đội ngũ chưa có cảnh báo", low ? "gold" : "green")}</div>`;
  html += tabs([
    ["Đội ngũ", low ? 1 : 0],
    ["Tuyển dụng", 2],
  ]);
  if (recruit) {
    const available =
      p.variant === "empty"
        ? []
        : candidates.filter((e) => !p.hired.includes(e.id));
    const person = available.find((e) => e.id === p.selected) || available[0];
    const left =
      queueTitle("Ứng viên", `${available.length} HỒ SƠ`) +
      (available.length
        ? available
            .map((e) =>
              job(
                e.id,
                e.name,
                e.role,
                `Kỹ năng ${e.skill}/5`,
                `<span>${money(e.salary)} / tháng</span><span>Phí ${money(Math.round(e.salary * 0.15))}</span>`,
                person.id === e.id,
              ),
            )
            .join("")
        : '<div class="selection-empty">Không còn ứng viên trong danh sách hiện tại.</div>');
    if (!person)
      return (
        html +
        split(
          left,
          empty(
            "Chưa có ứng viên để tuyển",
            "Bạn vẫn có thể xem năng lực, phân công và chăm sóc đội ngũ hiện tại.",
            button("Xem đội ngũ", "scene", { value: "0" }),
            "team",
          ),
        )
      );
    const fee = Math.round(person.salary * 0.15),
      blocked = p.variant === "full",
      reason = blocked ? "Văn phòng đã đủ 5 chỗ." : limit(fee);
    const body =
      next(
        blocked ? "Văn phòng đã đủ chỗ." : "Thêm năng lực cho đội ngũ.",
        blocked
          ? "Cần mở rộng văn phòng trước khi tuyển thêm. Không thể vượt số chỗ ngồi hiện có."
          : `Tuyển ${person.name} tốn ${money(fee)} ngay, thêm ${money(person.salary)} lương mỗi tháng và dùng 1 lượt CEO.`,
        button(blocked ? "Chưa thể tuyển" : "Tuyển · 1 lượt CEO", "hire", {
          primary: true,
          disabled: !!reason,
          value: person.id,
        }),
        blocked ? "" : "info",
      ) +
      (reason ? `<p class="funds-limit">${reason}</p>` : "") +
      `<div class="detail-columns">${section("Năng lực & đặc điểm", line("Vai trò", person.role) + line("Kỹ năng", person.skill + " / 5") + `<div class="tag-row"><span class="trait">${person.trait}</span></div>`)}${section("Thời gian hòa nhập", meter("Tuần đầu", 50, 100, "Năng suất ban đầu bằng 50%.") + meter("Tuần thứ hai", 75, 100, "Năng suất tăng lên 75% trong tuần hai."))}</div>`;
    return (
      html +
      split(
        left,
        inspector(person.name, person.role + " · Ứng viên", body, {
          initials: person.initials,
          status: "Chưa tuyển",
          purple: person.role === "QA",
        }),
      )
    );
  }
  const person = selected,
    energy =
      (low && person.id === "minh" ? 31 : person.energy) -
      (p.trained.includes(person.id) ? 8 : 0);
  const left =
    queueTitle("Đội ngũ", `${people.length} NGƯỜI`) +
    people
      .map((e) => {
        const en = low && e.id === "minh" ? 31 : e.energy;
        return job(
          e.id,
          e.name,
          e.role,
          en < 40
            ? "Năng lượng thấp"
            : e.new
              ? "Đang hòa nhập"
              : e.task === "Chưa phân công"
                ? "Chưa phân công"
                : "Đang làm",
          `<span>${money(e.salary)} / tháng</span><span>${en}% năng lượng</span>`,
          person.id === e.id,
          en < 40 ? "" : e.new ? "info" : "ok",
          `<div class="meter-mini ${en < 40 ? "low" : ""}" aria-hidden="true"><span style="width:${en}%"></span></div>`,
        );
      })
      .join("");
  const needCare = low && person.id === "minh";
  const call = needCare
    ? next(
        "Minh cần được giảm áp lực.",
        "Năng lượng thấp làm giảm năng lực làm việc. Kiểm tra phân công và chế độ tăng ca trước khi giao thêm việc.",
        link("Xem chính sách làm việc", "#strategy"),
        "",
      )
    : person.new
      ? next(
          "Đồng đội mới đang hòa nhập.",
          "Tuần đầu chỉ có 50% năng suất. Phân công phù hợp và dành thời gian để nhân viên hòa nhập.",
          link("Mở bảng Công việc", "../work/index.html#blocked"),
          "info",
        )
      : next(
          person.task === "Chưa phân công"
            ? "Linh đang sẵn sàng nhận việc."
            : "Minh đang phát triển dự án Mộc Retail.",
          person.task === "Chưa phân công"
            ? "Đội ngũ có người kiểm thử đang rảnh. Xem Công việc để chọn dự án và loại việc phù hợp."
            : "Kiểm tra tiến độ và QA của dự án trước khi thêm việc thứ hai.",
          link("Mở bảng Công việc", "../work/index.html#blocked"),
          "info",
        );
  const body =
    call +
    `<div class="detail-columns">${section("Tình trạng", meter("Tinh thần", person.morale, 100, "Ảnh hưởng đến năng lực làm việc.") + meter("Năng lượng", energy, 100, needCare ? "Đang cần được chú ý." : "Đọc cùng khối lượng công việc hiện tại.", needCare ? "warning" : ""))}${section("Năng lực & phân công", line("Kỹ năng", person.skill + " / 5") + line("Lương mỗi tháng", money(person.salary)) + line("Đang làm", person.task) + `<div class="tag-row"><span class="trait">${person.trait}</span></div>` + `<div class="action-row">${button(p.trained.includes(person.id) ? "Đã đào tạo" : "Đào tạo · $2,000", "train", { disabled: p.trained.includes(person.id) || !!limit(2000), value: person.id })}</div><p class="section-caption">Đào tạo dùng 1 lượt CEO, cộng 55 XP và giảm 8 năng lượng. Không đảm bảo tăng kỹ năng ngay.</p>`)}</div>`;
  return (
    html +
    split(
      left,
      inspector(
        person.name,
        person.role +
          " · " +
          (person.new ? "Nhân viên mới" : "Thành viên đội ngũ"),
        body,
        {
          initials: person.initials,
          status: needCare
            ? "Cần chăm sóc"
            : person.new
              ? "Đang hòa nhập"
              : "Đang hoạt động",
          tone: needCare ? "" : "info",
          purple: person.role === "QA",
        },
      ),
    )
  );
}
function renderMarket() {
  const p = current();
  let html = heading(
    "Thị trường",
    "Hiểu nhu cầu trước khi tăng chi cho tăng trưởng.",
    "03 / KHÁCH HÀNG & CƠ HỘI",
  );
  const noProduct = p.scene === 1 && p.variant === "empty";
  html += `<div class="summary-grid">${metric("KHÁCH TRẢ PHÍ", noProduct ? "0" : "35", noProduct ? "Chưa có sản phẩm" : "Kỳ gần nhất: +8 mới · −3 rời đi")}${metric("MRR KỲ HIỆN TẠI", noProduct ? "$0" : "$2,765", noProduct ? "Chưa có doanh thu thuê bao" : "35 khách × $79 / tháng", "green")}${metric("HỖ TRỢ CÒN LẠI", noProduct ? "0 WP" : "18,4 WP", noProduct ? "Chưa phát sinh yêu cầu hỗ trợ" : "Tăng ngân sách không xử lý việc hỗ trợ", noProduct ? "" : "gold")}</div>`;
  html += tabs([
    ["Phân khúc", 0],
    ["Giá & tăng trưởng", 1],
    ["Cơ hội", 2],
  ]);
  if (p.scene === 0) {
    const selected = segments.find((e) => e.id === p.selected) || segments[0];
    const left =
      queueTitle("Phân khúc", "3 THỊ TRƯỜNG") +
      segments
        .map((e) =>
          job(
            e.id,
            e.name,
            e.need,
            e.id === "retail" ? "Đang phục vụ" : "Đang tham khảo",
            `<span>${e.demand} nhu cầu / tháng</span><span>Chất lượng ${e.quality}+</span>`,
            selected.id === e.id,
            e.id === "retail" ? "ok" : "info",
          ),
        )
        .join("");
    const body =
      next(
        selected.id === "retail"
          ? "Giữ chất lượng theo kỳ vọng khách hàng."
          : "So sánh trước khi thay đổi hướng phục vụ.",
        selected.id === "retail"
          ? "Khách bán lẻ quan tâm đến quản lý hàng hóa và thông tin kinh doanh. Đọc nhu cầu cùng độ tin cậy và hàng đợi hỗ trợ."
          : "Bạn đang xem thông tin tham khảo. Xem phân khúc không thay đổi thị trường mục tiêu của sản phẩm.",
        button("Xem giá & tăng trưởng", "scene", { primary: true, value: "1" }),
      ) +
      `<div class="detail-columns">${section("Tín hiệu thị trường", line("Nhu cầu cơ sở / tháng", selected.demand) + line("Kỳ vọng chất lượng", selected.quality + " / 100") + line("Biến động quý", (selected.trend > 0 ? "+" : "") + selected.trend))}${section("Năng lực phục vụ", meter("Độ phù hợp sản phẩm", 58, 100, "Chỉ số hiện tại của Retail SaaS.") + meter("Độ tin cậy", 82, 100, "Lỗi ẩn và sự cố có thể làm khách rời đi."))}</div>`;
    return (
      html +
      split(
        left,
        inspector(selected.name, selected.need, body, {
          status:
            selected.id === "retail" ? "Phân khúc hiện tại" : "Chỉ đang xem",
          tone: selected.id === "retail" ? "ok" : "info",
        }),
      )
    );
  }
  if (p.scene === 1) {
    if (p.variant === "empty")
      return (
        html +
        empty(
          "Chưa có sản phẩm để định giá",
          "Tạo sản phẩm trước khi thiết lập giá và ngân sách marketing. Cơ hội Outsourcing vẫn dùng chung nguồn lực của công ty.",
          button("Xem cơ hội", "scene", { value: "2" }),
          "market",
        )
      );
    return (
      html +
      inspector(
        "Retail SaaS",
        "Giá & ngân sách cho kỳ tiếp theo",
        next(
          "Cân bằng tăng trưởng với khả năng phục vụ.",
          "Ngân sách tạo thêm cơ hội tiếp cận. Giá cao hơn có thể giảm chuyển đổi và tăng rời bỏ; không bảo đảm số khách mới.",
          button("Xem hàng đợi hỗ trợ", "support", { primary: false }),
        ) +
          `<div class="field-grid"><label class="control-field">Giá gói / tháng<select id="price" aria-label="Giá gói mỗi tháng">${[79, 99, 129].map((n) => `<option value="${n}" ${p.draftPrice === n ? "selected" : ""}>${money(n)}</option>`).join("")}</select><small>Giá đang đặt: ${money(p.price)} / tháng.</small></label><label class="control-field">Marketing / tháng<select id="budget" aria-label="Ngân sách marketing mỗi tháng">${[0, 1000, 2000, 3000].map((n) => `<option value="${n}" ${p.draftBudget === n ? "selected" : ""}>${money(n)}</option>`).join("")}</select><small>Ngân sách đang đặt: ${money(p.budget)} / tháng.</small></label></div><div id="pricing-preview" class="preview-strip"></div><div class="action-row">${button("Áp dụng giá · 1 lượt", "price", { primary: true, disabled: p.draftPrice === p.price || !!limit() })}${button("Áp dụng ngân sách · 1 lượt", "budget", { disabled: p.draftBudget === p.budget || !!limit() })}</div><p class="section-caption">Mỗi thay đổi dùng 1 lượt CEO. MRR kỳ hiện tại không tự tăng khi đặt giá mới; kết quả cần được theo dõi ở kỳ thu tiếp theo.</p>`,
        { status: "Chờ quyết định" },
      )
    );
  }
  return (
    html +
    inspector(
      "Khách hàng tiếp theo",
      "Outsourcing · Nguồn thu phụ",
      next(
        "Cơ hội mới cũng cần người thực hiện.",
        "Mọi dự án dùng chung đội ngũ. Xem năng lực còn trống và hạn giao trước khi tìm thêm việc.",
        p.leadFound
          ? link("Xem Công việc", "../work/index.html")
          : button("Tìm cơ hội · 1 lượt CEO", "lead", {
              primary: true,
              disabled: !!limit(),
            }),
      ) +
        `<div class="detail-columns">${section("Năng lực hiện tại", line("Dự án đang chạy", "1 dự án") + line("Công việc còn lại", "16 WP") + line("QA", "Chưa có người phụ trách"))}${section("Trước khi nhận thêm", `<p class="section-caption">Hợp đồng mới cần được làm rõ yêu cầu, báo giá và ký riêng. Tìm thấy cơ hội không đồng nghĩa đã nhận tiền hoặc có hợp đồng.</p><div class="action-row">${link("Xem Công việc", "../work/index.html#blocked")}</div>`)}</div>`,
      { status: p.leadFound ? "Đã tìm cơ hội" : "Chưa cam kết" },
    )
  );
}
function renderFinance() {
  const p = current(),
    emptyState = p.scene === 2,
    overdue = p.scene === 1,
    selected = invoices.find((i) => i.id === p.selected) || invoices[0],
    followed = p.followed.includes(selected.id),
    due = overdue ? 39 : selected.due;
  let html = heading(
    "Tài chính",
    "Tiền có thể chi, khoản đang chờ và kỳ hạn cần theo dõi.",
    "04 / GIỮ CÔNG TY VẬN HÀNH",
  );
  html += `<div class="summary-grid">${metric("TIỀN MẶT", money(p.cash), "Dùng để trả lương và chi phí", "green")}${metric("KHOẢN PHẢI THU", emptyState ? "$0" : "$12,000", "Chưa phải tiền mặt")}${metric("CHI PHÍ / THÁNG", "$9,300", "Gồm lương và chi phí hoạt động")}</div>`;
  if (emptyState)
    return (
      html +
      empty(
        "Chưa có hóa đơn",
        "Nghiệm thu tạo khoản phải thu. Tiền chỉ về khi hóa đơn được thanh toán; tiền cọc nhận trước được theo dõi riêng.",
        link("Mở Công việc", "../work/index.html"),
        "money",
      )
    );
  const left =
    queueTitle("Hóa đơn & khoản thu", "2 KHOẢN") +
    invoices
      .map((i) =>
        job(
          i.id,
          i.name,
          i.label,
          i.paid
            ? "Đã nhận cọc"
            : p.followed.includes(i.id)
              ? "Đã nhắc thanh toán"
              : overdue
                ? "Quá hạn"
                : "Chưa thu",
          `<span>${money(i.amount)}</span><span>${i.paid ? "Ngày 0" : `Hạn ngày ${overdue ? 39 : i.due}`}</span>`,
          selected.id === i.id,
          i.paid ? "ok" : overdue ? "" : "info",
        ),
      )
      .join("") +
    '<div class="notice"><strong>Tiền mặt ≠ doanh thu</strong><p>Cọc là tiền nhận trước. Hóa đơn chưa thu chưa thể dùng để chi.</p></div>';
  const call = selected.paid
    ? next(
        "Khoản cọc đã vào tiền mặt.",
        "Tiền cọc $6,000 được nhận khi ký. Tại thời điểm nhận, cọc là tiền trả trước; doanh thu được ghi nhận theo các mốc nghiệm thu.",
        "",
        "ok",
      )
    : followed
      ? next(
          "Đã liên hệ nhắc thanh toán.",
          "Khách cam kết thanh toán trong tối đa 2 ngày. Tiền mặt hiện vẫn giữ nguyên; không tự đánh dấu hóa đơn đã thu.",
          "",
          "info",
        )
      : next(
          overdue
            ? "Hóa đơn đã quá hạn 3 ngày."
            : "Theo dõi kỳ hạn thanh toán.",
          overdue
            ? "Một khoản phải thu đang trễ hạn. Nhắc thanh toán dùng 1 lượt CEO và đẩy thời điểm thanh toán về tối đa 2 ngày."
            : "Hóa đơn đến hạn vào ngày 49. Bạn có thể chờ hoặc dùng lượt CEO để nhắc thanh toán.",
          button("Nhắc thanh toán · 1 lượt", "collect", {
            primary: true,
            disabled: !!limit(),
            value: selected.id,
          }),
          overdue ? "" : "info",
        );
  const cashTable =
    '<table class="small-table"><caption class="muted" style="text-align:left;margin-top:20px">Dòng tiền thực theo tháng · USD</caption><thead><tr><th>Tháng</th><th>Tiền vào</th><th>Tiền ra</th></tr></thead><tbody><tr><td>Tháng 1</td><td>$6,000</td><td>$9,300</td></tr><tr><td>Tháng 2 đến ngày 42</td><td>$0</td><td>$3,500</td></tr></tbody></table>';
  const body =
    call +
    `<div class="detail-columns">${section("Thông tin khoản thu", line("Giá trị", money(selected.amount)) + line("Kỳ hạn", selected.paid ? "Đã nhận ngày 0" : "Ngày " + due) + line("Trạng thái", selected.paid ? "Đã nhận cọc" : followed ? "Đang chờ tiền về" : "Chưa thu") + line("Liên quan", "Mộc Retail"))}${section("Dòng tiền thực", `<div class="chart" role="img" aria-label="Tháng 1 tiền vào 6.000, tiền ra 9.300 USD. Tháng 2 đến ngày 42 tiền vào 0, tiền ra 3.500 USD."><div class="chart-month"><div class="chart-bar" style="height:90px"></div><div class="chart-bar out" style="height:140px"></div></div><div class="chart-month"><div class="chart-bar" style="height:0"></div><div class="chart-bar out" style="height:53px"></div></div></div><div class="chart-labels"><span>THÁNG 1</span><span>THÁNG 2 · ĐẾN NGÀY 42</span></div><div class="chart-legend"><span><i></i>Tiền vào</span><span><i class="out"></i>Tiền ra</span></div>` + cashTable)}</div><details class="details"><summary>Cách đọc tiền mặt, doanh thu và phải thu</summary><p>Tiền mặt trả các khoản chi. Doanh thu là giá trị được ghi nhận theo nghiệp vụ. Khoản phải thu là tiền khách còn nợ; chưa thể dùng khoản này để trả lương.</p></details>`;
  return (
    html +
    split(
      left,
      inspector(
        selected.label,
        selected.name + " · " + money(selected.amount),
        body,
        {
          status: selected.paid
            ? "Đã nhận"
            : followed
              ? "Đã nhắc"
              : overdue
                ? "Quá hạn"
                : "Chưa thu",
          tone: selected.paid ? "ok" : overdue ? "" : "info",
        },
      ),
    )
  );
}
function renderStrategy() {
  const p = current();
  let html = heading(
    "Chiến lược",
    "Chọn điều đáng đánh đổi và theo dõi lời đã hứa.",
    "05 / ĐIỀU HÀNH DÀI HẠN",
  );
  html += tabs([
    ["Mục tiêu", 0],
    ["Chính sách", 1],
    ["Văn phòng", 2],
  ]);
  if (p.scene === 0) {
    const goals = [
      ["Biên hoạt động 3 tháng ≥15%", 12, 15, "%"],
      ["Mốc đúng hẹn ≥85%", 80, 85, "%"],
      ["Khách hàng quay lại", 1, 2, " khách"],
    ];
    const left =
      queueTitle("Hướng đi", "OUTSOURCING") +
      `<div class="notice"><strong>Chiến dịch 36 tháng</strong>Ngày tổng kết: 1080.<br>Chính sách hiện tại: ${policies[p.policy].name}.</div><div class="action-row">${button("So sánh chính sách", "scene", { value: "1" })}</div>`;
    const body =
      next(
        "Còn khoảng cách tới mục tiêu chiến dịch.",
        "Biên hoạt động và tỷ lệ đúng hẹn chưa đạt mục tiêu. Xem chính sách và năng lực trước khi chọn nhận thêm việc.",
        button("Xem chính sách", "scene", { primary: true, value: "1" }),
      ) +
      goals
        .map(
          ([title, value, max, unit]) =>
            `<div class="goal"><h3>${title}</h3><div class="track-label"><span>Hiện tại ${value}${unit}</span><strong>Mục tiêu ${max}${unit}</strong></div><div class="bar" role="progressbar" aria-label="${title}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><span style="width:${(value / max) * 100}%"></span></div></div>`,
        )
        .join("") +
      `<section class="promise-list"><h3>Cam kết đang theo dõi</h3><div class="promise"><div><strong>Giao dự án Mộc Retail đúng hạn</strong><small>Hạn ngày 70 · Còn 28 ngày</small></div>${badge("Đang mở")}</div><div class="promise"><div><strong>Giữ chất lượng của lần giao trước</strong><small>Đã ghi nhận ở ngày 35</small></div>${badge("Đã giữ lời", "ok")}</div></section>`;
    return (
      html +
      split(
        left,
        inspector(
          "Mục tiêu Outsourcing",
          "Tiến độ hiện tại · Chưa phải kết quả tổng kết",
          body,
          { status: "Đang tiến triển" },
        ),
      )
    );
  }
  if (p.scene === 1) {
    const chosen = policies[p.selected] || policies.quality,
      selected = policies[p.selected] ? p.selected : "quality",
      same = selected === p.policy;
    return (
      html +
      inspector(
        "Chính sách giao hàng",
        "Duy trì cho tới khi bạn thay đổi",
        `<div class="policy-grid">${Object.entries(policies)
          .map(
            ([key, v]) =>
              `<button class="policy-choice" data-select="${key}" aria-pressed="${key === selected}">${badge(key === p.policy ? "Đang áp dụng" : "1 lượt CEO", key === p.policy ? "ok" : "info")}<h3>${v.name}</h3><div class="policy-stat">Tốc độ<strong>${v.speed}</strong></div><div class="policy-stat">Lỗi / nợ kỹ thuật<strong>${v.defects}</strong><span>${v.debt}</span></div></button>`,
          )
          .join(
            "",
          )}</div><div class="preview-strip"><strong>Đang xem: ${chosen.name}</strong><p>${chosen.description}</p><p>Hệ số ảnh hưởng phần việc tiếp theo. Không xóa lỗi hoặc nợ kỹ thuật đã phát sinh.</p></div><div class="action-row">${button(same ? "Đang áp dụng" : "Áp dụng · 1 lượt CEO", "policy", { primary: true, disabled: same || !!limit(), value: selected })}<small>Chỉ đổi sau khi xác nhận.</small></div>`,
        { status: policies[p.policy].name, tone: "ok" },
      )
    );
  }
  return (
    html +
    inspector(
      "Mở rộng văn phòng",
      "Từ 5 lên 12 chỗ ngồi",
      next(
        "Chưa đạt điều kiện nâng cấp.",
        "Hiện là ngày 24 và uy tín 45. Nâng cấp mở sau tháng đầu, khi uy tín đạt ít nhất 50.",
        button("Chưa thể nâng cấp", "upgrade", {
          primary: true,
          disabled: true,
        }),
        "",
      ) +
        `<div class="detail-columns">${section("Điều kiện mở khóa", line("Thời gian", "Ngày 24 / 30") + line("Uy tín", "45 / 50"))}${section("Chi phí khi đã mở khóa", line("Chi phí chuyển văn phòng", "$12,000") + line("Lượt CEO", "1 lượt") + line("Phí văn phòng tăng", "$1,800 / tháng"))}</div><p class="section-caption">Xem điều kiện không tiêu tiền hoặc lượt CEO. Ngày và uy tín không tự tăng khi mở màn hình.</p>`,
      { status: "Chưa mở khóa", tone: "" },
    )
  );
}
function renderHistory() {
  const p = current();
  let html = heading(
    "Nhật ký",
    "Đọc điều đã xảy ra để quyết định tuần tiếp theo.",
    "06 / MỖI QUYẾT ĐỊNH ĐỀU CÓ DẤU VẾT",
  );
  html += tabs([
    ["Báo cáo tuần", 0],
    ["Dòng sự kiện", 1],
  ]);
  if (p.scene === 2)
    return (
      html +
      empty(
        "Báo cáo đầu tiên mở vào ngày 7",
        "Hiện là ngày 3. Công ty chưa kết thúc tuần đầu; chưa có dữ liệu báo cáo tuần.",
        button("Xem sự kiện đã có", "early-history", { primary: true }),
        "history",
      )
    );
  if (p.scene === 0) {
    html += `<div class="summary-grid">${metric("TIỀN MẶT THAY ĐỔI", "−$3,500", "Tuần 6 · Ngày 36–42")}${metric("CÔNG VIỆC HOÀN THÀNH", "12,8 WP", "Khối lượng thực hiện trong tuần", "blue")}${metric("TINH THẦN CUỐI TUẦN", "76%", "Đọc cùng tình trạng từng người")}</div>`;
    return (
      html +
      inspector(
        "Tuần 6 · Ngày 36–42",
        "Báo cáo tuần gần nhất",
        next(
          "Xem các sự kiện liên quan trước khi đổi hướng.",
          "Tiền mặt giảm và công việc vẫn tiến triển. Những con số này chưa tự giải thích nguyên nhân; đọc các ghi nhận trong tuần để hiểu thêm.",
          button("Mở dòng sự kiện", "scene", { primary: true, value: "1" }),
        ) +
          `<section><h3>Ghi nhận trong tuần</h3><div class="week-events">${events
            .filter((e) => e.day >= 36)
            .map(
              (e) =>
                `<div class="week-event"><span>Ngày ${e.day}</span><div><strong>${e.title}</strong><p>${e.effect}</p></div>${button("Đọc sự kiện", "event", { value: e.id })}</div>`,
            )
            .join("")}</div></section>`,
        { status: "Đã ghi nhận", tone: "ok" },
      )
    );
  }
  const rows = filteredEvents(),
    selected = rows.find((e) => e.id === p.selected) || rows[0];
  const left = `<div class="log-search"><label for="search">Tìm nội dung hoặc ngày</label><input class="search-input" id="search" type="search" value="${safe(p.query)}" placeholder="Ví dụ: QA, hóa đơn, 42"><label class="control-field">Loại sự kiện<select id="severity" aria-label="Loại sự kiện">${[
    ["all", "Tất cả"],
    ["info", "Thông tin"],
    ["good", "Tích cực"],
    ["warning", "Cảnh báo"],
    ["critical", "Khẩn cấp"],
  ]
    .map(
      ([key, label]) =>
        `<option value="${key}" ${p.severity === key ? "selected" : ""}>${label}</option>`,
    )
    .join(
      "",
    )}</select></label></div><div id="event-results" aria-live="polite">${eventList(rows, selected)}</div>`;
  return (
    html +
    split(
      left,
      selected
        ? eventDetail(selected)
        : empty(
            "Không có sự kiện phù hợp",
            "Thử từ khóa khác hoặc bỏ bộ lọc để xem lại các ghi nhận hiện có.",
            button("Xóa bộ lọc", "clear-history"),
            "history",
          ),
    )
  );
}
function filteredEvents() {
  const p = current();
  return (p.earlyOnly ? [events.at(-1)] : events).filter(
    (e) =>
      (p.severity === "all" || e.type === p.severity) &&
      `${e.title} ${e.text} ${e.day}`
        .toLocaleLowerCase("vi")
        .includes(p.query.trim().toLocaleLowerCase("vi")),
  );
}
function eventList(rows, selected) {
  return (
    queueTitle("Sự kiện", `${rows.length} KẾT QUẢ`) +
    `<div class="event-list">` +
    rows
      .map((e) =>
        job(
          e.id,
          e.title,
          `Ngày ${e.day}`,
          {
            good: "Tích cực",
            info: "Thông tin",
            warning: "Cảnh báo",
            critical: "Khẩn cấp",
          }[e.type],
          `<span>Đọc ghi nhận →</span>`,
          e.id === selected?.id,
          e.type === "good"
            ? "ok"
            : e.type === "critical"
              ? "danger"
              : e.type === "warning"
                ? ""
                : "info",
        ),
      )
      .join("") +
    (rows.length
      ? ""
      : '<div class="selection-empty">Không tìm thấy ghi nhận theo bộ lọc này.</div>') +
    "</div>"
  );
}
function eventDetail(e) {
  return inspector(
    e.title,
    `Ngày ${e.day} · Ghi nhận tại thời điểm xảy ra`,
    `<p class="event-detail">${e.text}</p><div class="event-effect"><small>KẾT QUẢ ĐÃ GHI NHẬN</small>${e.effect}</div><p class="section-caption">Nhật ký giữ nội dung sự kiện cũ. Màn hình liên quan phản ánh tình trạng hiện tại, có thể đã thay đổi sau sự kiện.</p><div class="action-row">${link("Mở " + (e.route === "work" ? "Công việc" : pages[e.route].name), e.route === "work" ? "../work/index.html#blocked" : "#" + e.route)}</div>`,
    { status: "Sự kiện đã ghi", tone: "info" },
  );
}
function updatePricing() {
  const p = current(),
    node = $("pricing-preview");
  if (!node) return;
  node.innerHTML = `<strong>Dự kiến đặt: ${money(p.draftPrice)} / khách / tháng · Marketing ${money(p.draftBudget)} / tháng</strong><p>${p.draftPrice > p.price ? "Giá cao hơn tăng doanh thu mỗi khách, đồng thời gây áp lực giảm chuyển đổi và tăng rời bỏ." : p.draftPrice < p.price ? "Giá thấp hơn giảm doanh thu mỗi khách; nhu cầu và chất lượng vẫn ảnh hưởng kết quả." : "Giá gói giữ nguyên."} ${p.draftBudget > p.budget ? "Ngân sách cao hơn tăng chi phí định kỳ; không tự giảm tỷ lệ khách rời đi." : p.draftBudget < p.budget ? "Ngân sách thấp hơn giảm chi cho tiếp cận khách hàng." : "Ngân sách giữ nguyên."}</p>`;
  document.querySelector('[data-action="price"]').disabled =
    p.draftPrice === p.price || !!limit();
  document.querySelector('[data-action="budget"]').disabled =
    p.draftBudget === p.budget || !!limit();
}
function showDecision(
  title,
  text,
  effects,
  commit,
  source,
  label = "Xác nhận",
) {
  $("dialog-title").textContent = title;
  $("dialog-copy").textContent = text;
  $("dialog-effects").innerHTML = effects
    .map((e) => `<span>${safe(e)}</span>`)
    .join("");
  $("dialog-confirm").textContent = label;
  dialogOpener = source;
  pendingAction = commit;
  $("action-dialog").showModal();
}
function closeDecision() {
  pendingAction = null;
  $("action-dialog").close();
  if (dialogOpener?.isConnected) dialogOpener.focus();
  else $("screen").focus({ preventScroll: true });
}
function spendAction(cost = 0) {
  const error = limit(cost);
  if (error) {
    notify(error);
    return false;
  }
  current().actions--;
  current().cash -= cost;
  return true;
}
function changeScene(scene) {
  const p = current();
  p.scene = scene;
  p.variant = "normal";
  p.selected =
    page === "people"
      ? scene === 2
        ? "an"
        : "minh"
      : page === "market"
        ? "retail"
        : page === "finance"
          ? "moc"
          : page === "strategy"
            ? "quality"
            : "invoice";
  if (page === "history") {
    p.query = "";
    p.severity = "all";
    p.earlyOnly = false;
  }
  render();
  updatePricing();
  window.scrollTo({ top: 0, behavior: "instant" });
}
function navigate() {
  const key = location.hash.slice(1);
  if (!pages[key]) return;
  page = key;
  render({ focus: true });
  updatePricing();
  window.scrollTo({ top: 0, behavior: "instant" });
  $("toast").hidden = true;
}
document.addEventListener("click", (e) => {
  const node = e.target.closest("button");
  if (!node) return;
  if (node.dataset.scene !== undefined) {
    changeScene(Number(node.dataset.scene));
    return;
  }
  if (node.dataset.select) {
    current().selected = node.dataset.select;
    render();
    updatePricing();
    document
      .querySelector(`[data-select="${node.dataset.select}"]`)
      ?.focus({ preventScroll: true });
    return;
  }
  const p = current(),
    value = node.dataset.value;
  switch (node.dataset.action) {
    case "scene":
      changeScene(Number(value));
      break;
    case "hire": {
      const candidate = candidates.find((c) => c.id === value),
        fee = Math.round(candidate.salary * 0.15);
      showDecision(
        "Tuyển " + candidate.name + "?",
        `${candidate.role} · Kỹ năng ${candidate.skill}/5.\nPhí tuyển ${money(fee)} trả ngay, lương ${money(candidate.salary)} mỗi tháng.\nTuần đầu 50% năng suất; tuần hai 75%.`,
        [
          "1 lượt CEO",
          money(fee) + " ngay",
          money(candidate.salary) + " / tháng",
        ],
        () => {
          if (
            p.variant === "full" ||
            p.hired.includes(value) ||
            staff.length + p.hired.length >= 5
          )
            return false;
          if (!spendAction(fee)) return false;
          p.hired.push(value);
          p.scene = 0;
          p.selected = value;
          notify(
            "Đã tuyển " + candidate.name + " · Chưa phân công · Đang hòa nhập.",
          );
          return true;
        },
        node,
        "Tuyển · 1 lượt CEO",
      );
      break;
    }
    case "train":
      showDecision(
        "Đào tạo chuyên môn?",
        `Chi phí $2,000.\nCộng 55 XP, năng lượng −8. Kỹ năng chỉ tăng khi đủ ngưỡng XP; không đảm bảo lên cấp ngay.`,
        ["1 lượt CEO", "$2,000 ngay", "Năng lượng −8"],
        () => {
          if (p.trained.includes(value) || !spendAction(2000)) return false;
          p.trained.push(value);
          notify(
            "Đã đào tạo · +55 XP · Năng lượng −8 · Kỹ năng giữ nguyên trong tình huống này.",
          );
          return true;
        },
        node,
      );
      break;
    case "price": {
      const amount = p.draftPrice;
      showDecision(
        "Đặt giá gói " + money(amount) + "?",
        `Áp dụng giá cho kỳ thu tiếp theo.\nGiá cao hơn gây áp lực giảm chuyển đổi và tăng rời bỏ. MRR kỳ hiện tại giữ nguyên.`,
        ["1 lượt CEO", "Chưa có tiền về ngay"],
        () => {
          if (amount === p.price || !spendAction()) return false;
          p.price = amount;
          notify(
            "Đã đặt giá " +
              money(amount) +
              " cho kỳ tiếp theo · MRR kỳ hiện tại giữ nguyên.",
          );
          return true;
        },
        node,
      );
      break;
    }
    case "budget": {
      const amount = p.draftBudget;
      showDecision(
        "Đổi ngân sách marketing?",
        `Ngân sách mới ${money(amount)} / tháng.\nKhông đảm bảo số khách mới và không tự sửa tỷ lệ rời bỏ.`,
        ["1 lượt CEO", money(amount) + " / tháng"],
        () => {
          if (amount === p.budget || !spendAction()) return false;
          p.budget = amount;
          notify(
            "Đã đặt ngân sách " +
              money(amount) +
              " / tháng · Chưa phát sinh doanh thu tức thì.",
          );
          return true;
        },
        node,
      );
      break;
    }
    case "support":
      showDecision(
        "Hàng đợi hỗ trợ · 18,4 WP",
        "Khách hàng tạo yêu cầu mới mỗi ngày. Ops, QA và Growth có độ phù hợp vai trò cao với hỗ trợ khách.\nXem năng lực đội ngũ trước khi tăng chi marketing.",
        [],
        () => {
          location.hash = "people";
          return true;
        },
        node,
        "Xem đội ngũ",
      );
      break;
    case "lead":
      showDecision(
        "Tìm thêm cơ hội?",
        `Tốn 1 lượt CEO.\nCơ hội mới chưa phải hợp đồng đã ký; mọi dự án vẫn chia sẻ nguồn lực đội ngũ.`,
        ["1 lượt CEO", "Chưa có tiền về"],
        () => {
          if (!spendAction()) return false;
          p.leadFound = true;
          notify(
            "Đã tìm cơ hội trong tình huống minh họa. Xem Công việc để review hợp đồng trước khi ký.",
          );
          return true;
        },
        node,
      );
      break;
    case "collect":
      showDecision(
        "Nhắc thanh toán với Mộc Retail?",
        `Hóa đơn $12,000.\nKhách cam kết thanh toán trong tối đa 2 ngày sau khi nhắc. Tiền mặt chưa tăng ở thao tác này.`,
        ["1 lượt CEO", "Không thu tiền tức thì"],
        () => {
          if (p.followed.includes(value) || !spendAction()) return false;
          p.followed.push(value);
          notify(
            "Đã nhắc thanh toán · Chờ tiền về trong tối đa 2 ngày · Tiền mặt giữ nguyên.",
          );
          return true;
        },
        node,
      );
      break;
    case "policy": {
      const chosen = policies[value];
      showDecision(
        "Áp dụng " + chosen.name + "?",
        `${chosen.description}\nTốc độ ${chosen.speed}; lỗi ${chosen.defects}; nợ kỹ thuật ${chosen.debt}.\nChỉ áp dụng cho phần việc tiếp theo.`,
        ["1 lượt CEO", "Duy trì tới khi thay đổi"],
        () => {
          if (value === p.policy || !spendAction()) return false;
          p.policy = value;
          notify(
            "Đã áp dụng " +
              chosen.name +
              " · Lỗi và nợ kỹ thuật cũ giữ nguyên.",
          );
          return true;
        },
        node,
      );
      break;
    }
    case "event":
      p.scene = 1;
      p.selected = value;
      p.query = "";
      p.severity = "all";
      render();
      break;
    case "early-history":
      p.scene = 1;
      p.earlyOnly = true;
      p.selected = "open";
      render();
      break;
    case "clear-history":
      p.query = "";
      p.severity = "all";
      render();
      $("search")?.focus();
      break;
  }
});
$("scale").addEventListener("change", (e) => {
  const scale = Number(e.target.value) / 100;
  $("game-frame").style.zoom = scale;
  document.documentElement.style.setProperty("--ui-scale", scale);
});
$("review-variant").addEventListener("change", (e) => {
  current().variant = e.target.value;
  render();
  updatePricing();
});
document.addEventListener("change", (e) => {
  if (e.target.id === "price") {
    current().draftPrice = Number(e.target.value);
    updatePricing();
  }
  if (e.target.id === "budget") {
    current().draftBudget = Number(e.target.value);
    updatePricing();
  }
  if (e.target.id === "severity") {
    current().severity = e.target.value;
    refreshHistory(false);
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "search") {
    current().query = e.target.value;
    refreshHistory(true);
  }
});
function refreshHistory(keepInput) {
  const p = current(),
    rows = filteredEvents(),
    selected = rows.find((e) => e.id === p.selected) || rows[0];
  $("event-results").innerHTML = eventList(rows, selected);
  const board = document.querySelector(".screen-split");
  board.lastElementChild.outerHTML = selected
    ? eventDetail(selected)
    : empty(
        "Không có sự kiện phù hợp",
        "Thử từ khóa khác hoặc bỏ bộ lọc để xem lại các ghi nhận hiện có.",
        button("Xóa bộ lọc", "clear-history"),
        "history",
      );
  if (keepInput) $("search").focus();
}
$("dialog-close").addEventListener("click", closeDecision);
$("dialog-cancel").addEventListener("click", closeDecision);
$("dialog-confirm").addEventListener("click", () => {
  const commit = pendingAction;
  if (!commit) return;
  const committed = commit();
  if (committed === false) return;
  closeDecision();
  render();
  updatePricing();
  $("screen").focus({ preventScroll: true });
});
$("action-dialog").addEventListener("cancel", (e) => {
  e.preventDefault();
  closeDecision();
});
$("action-dialog").addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const items = [
    ...$("action-dialog").querySelectorAll(
      "button:not(:disabled),select,input",
    ),
  ].filter((el) => el.getClientRects().length);
  if (e.shiftKey && document.activeElement === items[0]) {
    e.preventDefault();
    items.at(-1).focus();
  } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
    e.preventDefault();
    items[0].focus();
  }
});
window.addEventListener("hashchange", navigate);
render();
updatePricing();
