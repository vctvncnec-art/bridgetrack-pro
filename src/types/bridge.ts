export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';

export interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
  roleTitle: string; // VD: Tổng Chỉ huy trưởng, Quản lý dự án, Kỹ sư hiện trường
  assignedWbs?: string[]; // Phân đoạn phụ trách nếu có
}

export interface ProjectInfo {
  name: string;
  package: string;
  timeframe: string;
  chiefEngineer: string;
  consultantLead: string;
  keyEquipment: string;
  location?: string;
  investor?: string; // Ban QLDA / Chủ đầu tư
  updatedAt?: string;
}

export interface BridgeTask {
  id: string; // Mã công việc, ví dụ: CV-01
  wbs: string; // Phân chia công việc: Mố M1, Trụ T1, Trụ T2, Dầm Super-T, Bản mặt cầu, Cọc khoan nhồi, v.v.
  title: string; // Tên hạng mục công việc
  assignee: string; // Kỹ sư / Đội trưởng chịu trách nhiệm
  assigneeEmail?: string; // Email kỹ sư để phân quyền & nhắc việc
  assigneeRole: string; // Chỉ huy trưởng, Kỹ sư hiện trường, Đội thi công cốt thép, v.v.
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  progress: number; // 0 - 100%
  status: 'Chưa bắt đầu' | 'Đang thi công' | 'Chậm tiến độ' | 'Nghiệm thu' | 'Hoàn thành';
  priority: 'Khẩn cấp' | 'Cao' | 'Trung bình' | 'Thấp';
  unit: string; // Đơn vị tính: m3, tấn, cọc, phiến, m2
  plannedQty: number; // Khối lượng thiết kế
  actualQty: number; // Khối lượng lũy kế thực tế
  location: string; // Vị trí thi công (Mố Nam, Trụ giữa sông T2, Kho bãi đúc dầm,...)
  weatherNotes?: string; // Tình hình thời tiết/thủy văn ảnh hưởng
  notes?: string; // Ghi chú kỹ thuật, lưu ý an toàn
  updatedAt: string; // ISO string
}

export interface AppNotification {
  id: string;
  type: 'overdue' | 'due_soon' | 'new_assignment' | 'status_changed' | 'system';
  title: string;
  message: string;
  taskId?: string;
  createdAt: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface ConstructionMember {
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  assignedTasksCount: number;
}
