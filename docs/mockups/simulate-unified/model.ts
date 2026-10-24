import type { State } from "../../../src/simulation/types";
import type { OfficePerson } from "./Scene";
import type { Camera } from "./Scene";

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

export function title(context: Context, s: State) {
  if (context.kind === "employee")
    return (
      s.employees.find((e) => e.id === context.id)?.name ??
      "Nhân viên đã rời công ty"
    );
  if (context.kind === "project")
    return (
      s.work.find((w) => w.id === context.id)?.label.vi ??
      (context.id === "market"
        ? "Thị trường / Khách hàng"
        : "Dự án đã kết thúc")
    );
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
