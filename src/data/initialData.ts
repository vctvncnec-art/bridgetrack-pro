import { BridgeTask, UserProfile, ProjectInfo } from '../types/bridge';
import { DIGITIZED_PHUOC_AN_TASKS, PHUOC_AN_USERS, PHUOC_AN_PROJECT_INFO } from './phuocAnData';

export const INITIAL_USERS: UserProfile[] = PHUOC_AN_USERS;
export const INITIAL_BRIDGE_TASKS: BridgeTask[] = DIGITIZED_PHUOC_AN_TASKS;
export const INITIAL_PROJECT_INFO: ProjectInfo = PHUOC_AN_PROJECT_INFO;

export const SHEET_HEADERS = [
  'Mã CV',
  'Hạng mục WBS',
  'Tên công việc / Nhiệm vụ',
  'Phụ trách / Kỹ sư',
  'Email kỹ sư',
  'Chức danh / Đội thi công',
  'Ngày bắt đầu',
  'Ngày kết thúc',
  'Tiến độ (%)',
  'Trạng thái',
  'Mức ưu tiên',
  'Đơn vị tính',
  'KL Thiết kế',
  'KL Lũy kế',
  'Vị trí thi công',
  'Thời tiết / Thủy văn',
  'Ghi chú kỹ thuật / An toàn',
  'Cập nhật lúc'
];

export const USERS_SHEET_HEADERS = [
  'Email',
  'Họ và tên',
  'Vai trò',
  'Chức danh hiện trường'
];

export const PROJECT_INFO_SHEET_HEADERS = [
  'Thuộc tính',
  'Giá trị thông tin',
  'Ghi chú hướng dẫn'
];
