import { copy } from "./catalog";
import type { Copy, Segment } from "../simulation/types";
export const CONCEPTS: {
  id: string;
  name: Copy;
  segment: Segment;
  description: Copy;
}[] = [
  {
    id: "retail",
    name: copy("Mộc · vận hành cửa hàng", "Moc · retail operations"),
    segment: "retail",
    description: copy(
      "Giảm nhập liệu, giữ tồn kho chính xác và chăm sóc khách mua lại.",
      "Reduce data entry, maintain accurate stock and earn repeat business.",
    ),
  },
  {
    id: "team",
    name: copy("Orbit · công việc & lịch học", "Orbit · work and learning"),
    segment: "education",
    description: copy(
      "Một nơi cho lịch trình, mục tiêu và tiến bộ của các nhóm đào tạo.",
      "One place for schedules, goals and progress for learning teams.",
    ),
  },
  {
    id: "creator",
    name: copy("Frame · cộng tác sáng tạo", "Frame · creative collaboration"),
    segment: "creative",
    description: copy(
      "Từ bản nháp đến phê duyệt: ít email hơn, phản hồi rõ hơn.",
      "From draft to approval: fewer emails, clearer feedback.",
    ),
  },
];
export interface Feature {
  id: string;
  concept: string;
  name: Copy;
  need: Copy;
  effort: number;
  fit: number;
  reach: number;
  retention: number;
  risk: number;
}
export const FEATURES: Feature[] = [
  {
    id: "stock-sync",
    concept: "retail",
    name: copy("Đồng bộ tồn kho", "Stock synchronization"),
    need: copy(
      "Chủ cửa hàng đang đối chiếu tồn kho bằng tay.",
      "Store owners reconcile stock by hand.",
    ),
    effort: 15,
    fit: 8,
    reach: 2,
    retention: 0.003,
    risk: 1.15,
  },
  {
    id: "quick-checkout",
    concept: "retail",
    name: copy("Thanh toán nhanh", "Fast checkout"),
    need: copy(
      "Hàng chờ dài làm người mua rời đi.",
      "Long checkout lines lose customers.",
    ),
    effort: 12,
    fit: 7,
    reach: 5,
    retention: 0.001,
    risk: 1,
  },
  {
    id: "retail-reports",
    concept: "retail",
    name: copy("Báo cáo doanh thu", "Sales insights"),
    need: copy(
      "Quản lý muốn biết mặt hàng nào đáng nhập thêm.",
      "Managers need to know which products to restock.",
    ),
    effort: 10,
    fit: 6,
    reach: 4,
    retention: 0.001,
    risk: 0.8,
  },
  {
    id: "loyalty",
    concept: "retail",
    name: copy("Khách hàng thân thiết", "Loyalty program"),
    need: copy(
      "Cửa hàng muốn khách quay lại mà không giảm giá mọi đơn.",
      "Stores want repeat visits without discounting every sale.",
    ),
    effort: 14,
    fit: 6,
    reach: 7,
    retention: 0.003,
    risk: 1,
  },
  {
    id: "supplier-orders",
    concept: "retail",
    name: copy("Đơn mua nhà cung cấp", "Supplier ordering"),
    need: copy(
      "Đặt hàng qua tin nhắn đang gây bỏ sót.",
      "Ordering through messages causes missed purchases.",
    ),
    effort: 18,
    fit: 7,
    reach: 3,
    retention: 0.003,
    risk: 1.1,
  },
  {
    id: "retail-export",
    concept: "retail",
    name: copy("Xuất dữ liệu kế toán", "Accounting export"),
    need: copy(
      "Kế toán mất hàng giờ sao chép dữ liệu.",
      "Bookkeepers spend hours copying data.",
    ),
    effort: 9,
    fit: 5,
    reach: 5,
    retention: 0.002,
    risk: 0.85,
  },
  {
    id: "calendar",
    concept: "team",
    name: copy("Lịch trình dùng chung", "Shared calendar"),
    need: copy(
      "Lớp học và công việc trùng lịch.",
      "Lessons and tasks collide on the calendar.",
    ),
    effort: 12,
    fit: 8,
    reach: 4,
    retention: 0.002,
    risk: 0.9,
  },
  {
    id: "learning-board",
    concept: "team",
    name: copy("Bảng tiến độ học tập", "Learning progress board"),
    need: copy(
      "Người hướng dẫn chưa nhìn rõ ai cần hỗ trợ.",
      "Coaches cannot see who needs support.",
    ),
    effort: 15,
    fit: 8,
    reach: 3,
    retention: 0.003,
    risk: 1,
  },
  {
    id: "private-spaces",
    concept: "team",
    name: copy("Không gian riêng tư", "Private workspaces"),
    need: copy(
      "Nhóm cần phân quyền tài liệu theo lớp.",
      "Teams need class-level access to documents.",
    ),
    effort: 20,
    fit: 7,
    reach: 2,
    retention: 0.004,
    risk: 1.3,
  },
  {
    id: "reminders",
    concept: "team",
    name: copy("Nhắc lịch thông minh", "Thoughtful reminders"),
    need: copy(
      "Học viên thường quên mốc cần nộp.",
      "Learners often miss assignment deadlines.",
    ),
    effort: 8,
    fit: 5,
    reach: 7,
    retention: 0.002,
    risk: 0.8,
  },
  {
    id: "team-reports",
    concept: "team",
    name: copy("Báo cáo cho người hướng dẫn", "Coach reports"),
    need: copy(
      "Huấn luyện viên cần số liệu dễ giải thích.",
      "Coaches need understandable progress summaries.",
    ),
    effort: 13,
    fit: 6,
    reach: 5,
    retention: 0.002,
    risk: 0.9,
  },
  {
    id: "templates",
    concept: "team",
    name: copy("Mẫu kế hoạch tái sử dụng", "Reusable plans"),
    need: copy(
      "Các nhóm đang tạo lại cùng một lộ trình.",
      "Teams keep recreating the same learning plans.",
    ),
    effort: 10,
    fit: 6,
    reach: 6,
    retention: 0.002,
    risk: 0.75,
  },
  {
    id: "proofing",
    concept: "creator",
    name: copy("Góp ý trên thiết kế", "Visual proofing"),
    need: copy(
      "Phản hồi rời rạc khiến thiết kế phải làm lại.",
      "Scattered feedback causes rework.",
    ),
    effort: 15,
    fit: 8,
    reach: 5,
    retention: 0.003,
    risk: 1.1,
  },
  {
    id: "version-history",
    concept: "creator",
    name: copy("Lịch sử phiên bản", "Version history"),
    need: copy(
      "Nhóm thường gửi nhầm bản cũ cho khách.",
      "Teams send outdated versions to clients.",
    ),
    effort: 12,
    fit: 7,
    reach: 3,
    retention: 0.004,
    risk: 1,
  },
  {
    id: "client-portal",
    concept: "creator",
    name: copy("Cổng duyệt cho khách", "Client approval portal"),
    need: copy(
      "Khách muốn một chỗ để duyệt và theo dõi.",
      "Clients want one place for review and approval.",
    ),
    effort: 18,
    fit: 8,
    reach: 7,
    retention: 0.002,
    risk: 1.2,
  },
  {
    id: "asset-library",
    concept: "creator",
    name: copy("Thư viện tài nguyên", "Shared asset library"),
    need: copy(
      "Nhóm mất thời gian tìm đúng logo và file gốc.",
      "Teams waste time finding source files and logos.",
    ),
    effort: 14,
    fit: 6,
    reach: 4,
    retention: 0.002,
    risk: 0.9,
  },
  {
    id: "creative-brief",
    concept: "creator",
    name: copy("Bản yêu cầu sáng tạo", "Creative briefs"),
    need: copy(
      "Yêu cầu chưa rõ làm số vòng sửa tăng.",
      "Unclear briefs increase revision rounds.",
    ),
    effort: 9,
    fit: 5,
    reach: 6,
    retention: 0.002,
    risk: 0.8,
  },
  {
    id: "handoff",
    concept: "creator",
    name: copy("Bàn giao có cấu trúc", "Organized handoff"),
    need: copy(
      "Bàn giao cuối dự án vẫn rơi rớt file.",
      "Final deliveries still miss important files.",
    ),
    effort: 11,
    fit: 6,
    reach: 5,
    retention: 0.003,
    risk: 0.85,
  },
];
export const EXPERIMENTS = [
  {
    id: "interviews",
    name: copy("Phỏng vấn khách hàng", "Customer interviews"),
    hypothesis: copy(
      "Khách có vấn đề đủ thường xuyên để tìm giải pháp.",
      "Customers face the problem often enough to seek a solution.",
    ),
    cost: 60000,
    effort: 6,
    sample: 20,
    threshold: 0.5,
    evidence: 16,
  },
  {
    id: "landing",
    name: copy("Trang giới thiệu thử nghiệm", "Landing page test"),
    hypothesis: copy(
      "Thông điệp đủ rõ để khách để lại sự quan tâm.",
      "The value proposition earns a sign-up.",
    ),
    cost: 120000,
    effort: 8,
    sample: 200,
    threshold: 0.12,
    evidence: 17,
  },
  {
    id: "pilot",
    name: copy("Thử nghiệm với khách trả tiền", "Paid pilot test"),
    hypothesis: copy(
      "Khách sẵn sàng trả tiền cho kết quả cụ thể.",
      "Customers will pay for a concrete outcome.",
    ),
    cost: 200000,
    effort: 12,
    sample: 10,
    threshold: 0.4,
    evidence: 24,
  },
  {
    id: "prototype",
    name: copy("Kiểm tra prototype", "Prototype usability test"),
    hypothesis: copy(
      "Người dùng tự hoàn thành công việc cốt lõi.",
      "Users can complete the core task independently.",
    ),
    cost: 90000,
    effort: 9,
    sample: 25,
    threshold: 0.65,
    evidence: 20,
  },
  {
    id: "offer",
    name: copy("So sánh hai đề nghị giá", "A/B offer test"),
    hypothesis: copy(
      "Một mức giá tạo chuyển đổi tốt hơn sau khi cân nhắc doanh thu.",
      "A price offer improves conversion without destroying revenue.",
    ),
    cost: 150000,
    effort: 8,
    sample: 100,
    threshold: 0.18,
    evidence: 18,
  },
  {
    id: "referral",
    name: copy("Kiểm tra giới thiệu bạn bè", "Referral test"),
    hypothesis: copy(
      "Người dùng sẵn lòng giới thiệu công cụ với đồng nghiệp.",
      "Users will recommend the tool to a colleague.",
    ),
    cost: 100000,
    effort: 7,
    sample: 40,
    threshold: 0.25,
    evidence: 18,
  },
];
export const TERMS = [
  {
    id: "patient",
    name: copy("Nhà đầu tư đồng hành", "Patient operator"),
    amount: 10000000,
    equity: 15,
    evidence: 45,
    goal: 70,
    deadline: 360,
    description: copy(
      "Ít vốn hơn, giữ 85% cổ phần. Cam kết 70 khách trả phí trong 12 tháng.",
      "Less capital; retain 85%. Commit to 70 paying customers within 12 months.",
    ),
  },
  {
    id: "seed",
    name: copy("Quỹ hạt giống", "Seed partner"),
    amount: 15000000,
    equity: 25,
    evidence: 35,
    goal: 100,
    deadline: 360,
    description: copy(
      "$150.000 lấy 25% cổ phần sau đầu tư. Cam kết 100 khách trả phí trong 12 tháng.",
      "$150,000 for 25% post-money equity. Commit to 100 paying customers within 12 months.",
    ),
  },
  {
    id: "growth",
    name: copy("Quỹ tăng trưởng", "Growth fund"),
    amount: 25000000,
    equity: 35,
    evidence: 55,
    goal: 150,
    deadline: 360,
    description: copy(
      "Nhiều vốn, giữ 65% cổ phần. Cam kết 150 khách trả phí trong 12 tháng.",
      "More capital; retain 65%. Commit to 150 paying customers within 12 months.",
    ),
  },
];
