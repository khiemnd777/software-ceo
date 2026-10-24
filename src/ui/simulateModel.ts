import type { State, Locale } from "../simulation/types";
import type { OfficePerson } from "../renderer/Office";
import type { Camera } from "../renderer/Office";
import type { WorkSession } from "./workSession";
import { deliveryForecast } from "../simulation/selectors";

export function visibleProjects(
  s: State,
  session: WorkSession,
  locale: Locale,
) {
  return s.work
    .map((w) => {
      const c = s.contracts.find((c) => c.workId === w.id);
      const completed = c?.stage === "accepted" || w.status === "released";
      const eligible =
        w.kind !== "contract" ||
        (!!c && ["signed", "accepted"].includes(c.stage));
      const forecast = c ? deliveryForecast(s, c) : null;
      return {
        w,
        c,
        completed,
        eligible,
        attention:
          c?.stage === "signed" &&
          (forecast?.maxDays === null || forecast?.late),
      };
    })
    .filter(
      (r) =>
        (session.filter === "all" ||
          (session.filter === "active" && r.eligible && !r.completed) ||
          (session.filter === "offers" && !r.eligible) ||
          (session.filter === "completed" && r.completed)) &&
        `${r.w.label[locale]} ${r.c?.client ?? ""}`
          .toLocaleLowerCase(locale)
          .includes(session.query.trim().toLocaleLowerCase(locale)),
    )
    .sort(
      (a, b) =>
        (session.sort === "deadline"
          ? (a.c?.deadline ?? Infinity) - (b.c?.deadline ?? Infinity)
          : Number(b.attention) - Number(a.attention)) ||
        a.w.id.localeCompare(b.w.id),
    )
    .map((r) => r.w);
}

export type Context =
  | { kind: "employee"; id: string }
  | { kind: "project"; id: string }
  | {
      kind:
        | "projects"
        | "team"
        | "recruitment"
        | "customers"
        | "finance"
        | "meeting"
        | "history"
        | "inbox"
        | "session"
        | "settings";
    };

export const places = [
  { id: "projects", name: "Bảng dự án", icon: "work", x: 0.1, y: 5.4, z: 1.65 },
  {
    id: "finance",
    name: "Bàn tài chính",
    icon: "finance",
    x: 0.8,
    y: 0.9,
    z: 1.65,
  },
  { id: "customers", name: "Khách hàng", icon: "market", x: 7, y: 0.8, z: 1.5 },
  { id: "team", name: "Đội ngũ", icon: "people", x: 6.6, y: 2, z: 0.7 },
  { id: "meeting", name: "Bàn họp", icon: "strategy", x: 6.3, y: 6.7, z: 0.8 },
  {
    id: "recruitment",
    name: "Đón ứng viên",
    icon: "people",
    x: 6.9,
    y: 8.35,
    z: 0.9,
  },
] as const;

export const seats = [
  { x: 2.2, y: 2.4 },
  { x: 4.6, y: 2.4 },
  { x: 2.2, y: 4.8 },
  { x: 4.6, y: 4.8 },
  { x: 2.2, y: 7.1 },
  { x: 4.6, y: 7.1 },
  { x: 7, y: 2.4 },
  { x: 9.4, y: 2.4 },
  { x: 7, y: 4.8 },
  { x: 9.4, y: 4.8 },
  { x: 7, y: 7.1 },
  { x: 9.4, y: 7.1 },
];

export function project(camera: Camera, x: number, y: number, z = 0) {
  return {
    x: camera.x + (x - y) * 65 * camera.zoom,
    y:
      camera.y +
      ((x + y) * 32.5 - z * 65 * Math.SQRT2 * Math.cos(Math.PI / 6)) *
        camera.zoom,
  };
}

export function officePeople(s: State): OfficePerson[] {
  return s.employees.map((e) => {
    const active = e.assignments.find((a) => {
      const w = s.work.find((w) => w.id === a.target);
      if (a.target === "market")
        return a.kind === "support" ? s.product.support > 0 : true;
      if (!w) return false;
      if (a.kind === "develop") return w.status === "active";
      if (a.kind === "fix") return w.bugs.some((b) => b.known);
      if (a.kind === "refactor") return w.debt + s.product.debt > 0;
      if (a.kind === "research") return w.status !== "released";
      return w.qa < w.actual * 0.2 || w.bugs.some((b) => !b.known);
    });
    return { ...e, working: !!active, taskKind: active?.kind };
  });
}

export function title(context: Context, s: State, locale: Locale = "vi") {
  if (context.kind === "employee")
    return (
      s.employees.find((e) => e.id === context.id)?.name ??
      (locale === "vi"
        ? "Nhân viên đã rời công ty"
        : "This teammate has left the company")
    );
  if (context.kind === "project")
    return (
      s.work.find((w) => w.id === context.id)?.label[locale] ??
      (context.id === "market"
        ? locale === "vi"
          ? "Thị trường / Khách hàng"
          : "Market / Customers"
        : locale === "vi"
          ? "Dự án đã kết thúc"
          : "Project ended")
    );
  if (locale === "en")
    return {
      projects: "Project board",
      team: "Office teammates",
      recruitment: "Meet candidates",
      customers: "Customers & opportunities",
      finance: "Financial position",
      meeting: "Management meeting",
      history: "Company story",
      inbox: "CEO decisions",
      session: "Company progress",
      settings: "Settings",
    }[context.kind];
  return {
    projects: "Bảng dự án",
    team: "Đồng đội trong văn phòng",
    recruitment: "Đón ứng viên",
    customers: "Khách hàng & cơ hội",
    finance: "Tình hình tài chính",
    meeting: "Cuộc họp điều hành",
    history: "Câu chuyện công ty",
    inbox: "Việc cần CEO quyết định",
    session: "Tiến trình phiên chơi",
    settings: "Tùy chọn quan sát",
  }[context.kind];
}

export function navigateContext(
  view: string,
  s: State,
  selected: string,
): Context | null {
  if (view === "office") return null;
  if (view === "people")
    return selected && s.employees.some((e) => e.id === selected)
      ? { kind: "employee", id: selected }
      : { kind: "team" };
  const map = {
    work: "projects",
    market: "customers",
    finance: "finance",
    strategy: "meeting",
    history: "history",
  } as const;
  return view in map ? { kind: map[view as keyof typeof map] } : null;
}

export const placeName = (id: (typeof places)[number]["id"], locale: Locale) =>
  locale === "vi"
    ? places.find((p) => p.id === id)!.name
    : {
        projects: "Project board",
        finance: "Finance desk",
        customers: "Customers",
        team: "Team",
        meeting: "Meeting table",
        recruitment: "Meet candidates",
      }[id];
