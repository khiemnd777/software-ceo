import type { Copy, Role, Segment, Policy } from "../simulation/types";
export const copy = (vi: string, en: string): Copy => ({ vi, en });
export const BALANCE = {
  version: "T0.3",
  daySeconds: 5,
  monthDays: 30,
  weekDays: 7,
  campaignDays: 1080,
  baseWP: 6,
  baseDefects: 0.14,
  startingCash: { product: 7000000, outsourcing: 4500000, startup: 10000000 },
  policy: {
    fast: { speed: 1.2, defects: 1.5, debt: 3 },
    balanced: { speed: 1, defects: 1, debt: 1 },
    quality: { speed: 0.85, defects: 0.65, debt: 0 },
  },
} as const;
export const POLICIES: Record<Policy, { name: Copy; description: Copy }> = {
  fast: {
    name: copy("Giao nhanh", "Ship fast"),
    description: copy(
      "Năng suất +20%. Lỗi ×1,5. Nợ kỹ thuật +3 / 20 điểm việc.",
      "+20% speed. Defects ×1.5. +3 debt / 20 work points.",
    ),
  },
  balanced: {
    name: copy("Cân bằng", "Balanced"),
    description: copy(
      "Tốc độ chuẩn. Lỗi ×1. Nợ kỹ thuật +1 / 20 điểm việc.",
      "Standard speed. Defects ×1. +1 debt / 20 work points.",
    ),
  },
  quality: {
    name: copy("Chất lượng trước", "Quality first"),
    description: copy(
      "Tốc độ −15%. Lỗi ×0,65. Không tạo nợ mới.",
      "−15% speed. Defects ×0.65. No new delivery debt.",
    ),
  },
};
export const ROLES: Record<Role, Copy> = {
  developer: copy("Lập trình", "Developer"),
  qa: copy("Kiểm thử", "QA"),
  designer: copy("Thiết kế", "Designer"),
  growth: copy("Kinh doanh", "Sales / Growth"),
  ops: copy("Điều phối", "PM / Operations"),
};
export const SEGMENTS: Record<
  Segment,
  {
    name: Copy;
    demand: number;
    budget: Copy;
    sensitivity: number;
    quality: number;
    need: Copy;
  }
> = {
  retail: {
    name: copy("Vận hành bán lẻ", "Retail operations"),
    demand: 80,
    budget: copy("Vừa", "Medium"),
    sensitivity: 1.1,
    quality: 80,
    need: copy(
      "Chính xác tồn kho và tiết kiệm thời gian.",
      "Accurate inventory and less manual work.",
    ),
  },
  creative: {
    name: copy("Nhóm sáng tạo", "Creative teams"),
    demand: 90,
    budget: copy("Vừa", "Medium"),
    sensitivity: 1.25,
    quality: 72,
    need: copy(
      "Phản hồi, duyệt thiết kế và cộng tác.",
      "Fast feedback, approvals and collaboration.",
    ),
  },
  education: {
    name: copy("Dịch vụ giáo dục", "Education services"),
    demand: 70,
    budget: copy("Cao", "High"),
    sensitivity: 0.8,
    quality: 88,
    need: copy(
      "Lịch học, bảo mật và theo dõi tiến bộ.",
      "Scheduling, privacy and learner progress.",
    ),
  },
};
export const TRAITS: Record<string, { name: Copy; description: Copy }> = {
  learner: {
    name: copy("Học nhanh", "Fast learner"),
    description: copy(
      "Kinh nghiệm chuyên môn tăng nhanh hơn 20%.",
      "Gains role experience 20% faster.",
    ),
  },
  meticulous: {
    name: copy("Tỉ mỉ", "Meticulous"),
    description: copy(
      "Tìm lỗi tốt hơn; phát triển chậm 5%.",
      "Better QA; development 5% slower.",
    ),
  },
  mentor: {
    name: copy("Dìu dắt", "Mentor"),
    description: copy(
      "Tăng học hỏi của đồng đội; mất 5% năng suất riêng.",
      "Improves team learning; sacrifices 5% own output.",
    ),
  },
  friendly: {
    name: copy("Hiểu khách hàng", "Client friendly"),
    description: copy(
      "Nghiên cứu +8%; không tăng tốc viết phần mềm.",
      "Research +8%; no development speed bonus.",
    ),
  },
  creative: {
    name: copy("Sáng tạo", "Creative"),
    description: copy("Nghiên cứu +12%; QA −5%.", "+12% research; −5% QA."),
  },
  driven: {
    name: copy("Tham vọng", "Driven"),
    description: copy(
      "Năng suất +8%; tăng ca mất nhiều năng lượng hơn.",
      "+8% output; overtime drains more energy.",
    ),
  },
  steady: {
    name: copy("Điềm tĩnh", "Steady"),
    description: copy(
      "Hồi phục tốt hơn; học chậm hơn 10%.",
      "Recovers better; learns 10% slower.",
    ),
  },
  outspoken: {
    name: copy("Thẳng thắn", "Outspoken"),
    description: copy(
      "QA +10%; nhạy cảm khi thất hứa.",
      "+10% QA; more sensitive to broken promises.",
    ),
  },
};
export const ARCHETYPES: {
  id: string;
  name: string;
  role: Role;
  skill: number;
  salary: number;
  traits: string[];
}[] = [
  ["dev-junior", "Minh Nguyễn", "developer", 2, 270000, ["learner", "driven"]],
  [
    "dev-careful",
    "Linh Phạm",
    "developer",
    3,
    350000,
    ["meticulous", "steady"],
  ],
  ["dev-senior", "Alex Trần", "developer", 5, 620000, ["mentor", "outspoken"]],
  ["dev-builder", "An Lê", "developer", 4, 460000, ["driven", "creative"]],
  ["dev-pragmatic", "Sofia Vũ", "developer", 3, 340000, ["steady", "friendly"]],
  ["dev-intern", "Hải Đỗ", "developer", 1, 190000, ["learner", "creative"]],
  ["qa-junior", "Thảo Nguyễn", "qa", 2, 240000, ["meticulous", "learner"]],
  ["qa-analyst", "Jamie Lê", "qa", 3, 300000, ["meticulous", "steady"]],
  ["qa-lead", "Mai Trần", "qa", 5, 540000, ["mentor", "outspoken"]],
  ["qa-explorer", "Đức Phạm", "qa", 4, 420000, ["creative", "driven"]],
  ["qa-client", "Kim Vũ", "qa", 3, 310000, ["friendly", "meticulous"]],
  ["ux-junior", "Nhi Trần", "designer", 2, 260000, ["creative", "learner"]],
  ["ux-senior", "Robin Lê", "designer", 5, 560000, ["mentor", "creative"]],
  ["ux-product", "Bảo Nguyễn", "designer", 3, 320000, ["friendly", "creative"]],
  ["ux-system", "Emma Phạm", "designer", 4, 440000, ["meticulous", "steady"]],
  ["growth-junior", "Tú Lê", "growth", 2, 260000, ["friendly", "learner"]],
  ["growth-sales", "Quân Trần", "growth", 3, 350000, ["friendly", "driven"]],
  ["growth-senior", "Sam Nguyễn", "growth", 5, 590000, ["mentor", "driven"]],
  [
    "growth-research",
    "Hân Phạm",
    "growth",
    4,
    450000,
    ["creative", "outspoken"],
  ],
  ["growth-calm", "Tâm Vũ", "growth", 3, 330000, ["friendly", "steady"]],
  ["ops-junior", "Vy Đỗ", "ops", 2, 250000, ["steady", "learner"]],
  ["ops-organizer", "Chris Phạm", "ops", 3, 330000, ["meticulous", "friendly"]],
  ["ops-lead", "Phương Lê", "ops", 5, 550000, ["mentor", "steady"]],
  ["ops-resolver", "Long Nguyễn", "ops", 4, 430000, ["outspoken", "driven"]],
].map(([id, name, role, skill, salary, traits]) => ({
  id: id as string,
  name: name as string,
  role: role as Role,
  skill: skill as number,
  salary: salary as number,
  traits: traits as string[],
}));
export interface ContractTemplate {
  id: string;
  name: Copy;
  client: string;
  segment: Segment;
  price: number;
  work: number;
  days: number;
  late: number;
  type: "fixed" | "tm";
}
export const CONTRACTS: ContractTemplate[] = [
  {
    id: "retail-launch",
    name: copy("Cổng quản lý cửa hàng", "Retail operations portal"),
    client: "Mộc Retail",
    segment: "retail",
    price: 3000000,
    work: 40,
    days: 70,
    late: 5,
    type: "fixed",
  },
  {
    id: "studio-flow",
    name: copy("Luồng duyệt thiết kế", "Creative approvals"),
    client: "North Studio",
    segment: "creative",
    price: 2400000,
    work: 30,
    days: 56,
    late: 2,
    type: "fixed",
  },
  {
    id: "school-booking",
    name: copy("Đăng ký lớp học", "Class booking system"),
    client: "Bright Academy",
    segment: "education",
    price: 3600000,
    work: 46,
    days: 84,
    late: 8,
    type: "fixed",
  },
  {
    id: "retail-care",
    name: copy("Chăm sóc hệ thống bán hàng", "Retail system care"),
    client: "Mộc Retail",
    segment: "retail",
    price: 2800000,
    work: 36,
    days: 70,
    late: 3,
    type: "tm",
  },
  {
    id: "studio-ops",
    name: copy("Tự động hóa studio", "Studio workflow automation"),
    client: "North Studio",
    segment: "creative",
    price: 3200000,
    work: 38,
    days: 77,
    late: 4,
    type: "tm",
  },
  {
    id: "school-portal",
    name: copy("Cổng theo dõi học viên", "Learner progress portal"),
    client: "Bright Academy",
    segment: "education",
    price: 4200000,
    work: 50,
    days: 91,
    late: 7,
    type: "tm",
  },
];
