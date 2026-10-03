import React, { useState } from 'react';
import { 
  Building2, 
  RefreshCw, 
  ExternalLink, 
  FileSpreadsheet, 
  Plus, 
  Bell,
  Upload,
  Download,
  FolderOpen,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import { UserProfile, UserRole, AppNotification, ProjectInfo } from '../types/bridge';

interface NavbarProps {
  user: User | null;
  currentProfile: UserProfile;
  allUsers: UserProfile[];
  onSwitchProfileRole: (role: UserRole) => void;
  spreadsheetId: string | null;
  spreadsheetTitle: string;
  projectInfo?: ProjectInfo;
  isSyncing: boolean;
  onSync: () => void;
  onOpenCreateSheetModal: () => void;
  onOpenSelectSheetModal: () => void;
  onOpenNewTaskModal: () => void;
  onOpenImportModal: () => void;
  onExportExcel: () => void;
  onOpenNotificationCenter: () => void;
  onOpenRoleManagerModal: () => void;
  onOpenProjectInfoModal: () => void;
  onLoadPhuocAnData: () => void;
  unreadCount: number;
  onLogout: () => void;
  onLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentProfile,
  allUsers,
  onSwitchProfileRole,
  spreadsheetId,
  spreadsheetTitle,
  projectInfo,
  isSyncing,
  onSync,
  onOpenCreateSheetModal,
  onOpenSelectSheetModal,
  onOpenNewTaskModal,
  onOpenImportModal,
  onExportExcel,
  onOpenNotificationCenter,
  onOpenRoleManagerModal,
  onOpenProjectInfoModal,
  onLoadPhuocAnData,
  unreadCount,
  onLogout,
  onLogin,
}) => {
  const sheetUrl = spreadsheetId 
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    : null;

  const canAddTask = currentProfile.role === 'ADMIN' || currentProfile.role === 'PROJECT_MANAGER';

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Quản trị viên (Toàn quyền)',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: ShieldAlert
        };
      case 'PROJECT_MANAGER':
        return {
          label: 'Quản lý dự án / Chỉ huy',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: ShieldCheck
        };
      case 'TEAM_MEMBER':
        return {
          label: 'Thành viên / Kỹ sư hiện trường',
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          icon: UserCheck
        };
    }
  };

  const badgeInfo = getRoleBadge(currentProfile.role);
  const RoleIcon = badgeInfo.icon;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">BridgeTrack Pro</span>
                <span 
                  className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 max-w-[180px] md:max-w-xs truncate"
                  title={projectInfo?.name || 'Dự án Cầu'}
                >
                  {projectInfo?.name || 'Cầu Phước An'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block max-w-[260px] md:max-w-md truncate" title={projectInfo?.package}>
                {projectInfo?.package || 'Gói thầu số 40: Xây lắp cầu dẫn từ trụ T40-T41 đến trụ T62'}
              </p>
            </div>
          </div>

          {/* Connected Sheet Status & Quick Actions */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
            {spreadsheetId ? (
              <div className="flex items-center gap-2 max-w-[180px] xl:max-w-xs truncate">
                <span className="text-slate-400">Sheet:</span>
                <span className="font-medium text-slate-200 truncate" title={spreadsheetTitle}>
                  {spreadsheetTitle || 'Cầu Phước An - Gói 40'}
                </span>
                <a
                  href={sheetUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 transition-colors p-1 shrink-0"
                  title="Mở Google Sheets trực tiếp"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <span className="text-slate-400">Chưa kết nối Google Sheet</span>
            )}

            {spreadsheetId && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="ml-1 p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors disabled:opacity-50"
                title="Đồng bộ 2 chiều từ Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            )}
          </div>

          {/* Action buttons, Excel Import/Export & Role switcher */}
          <div className="flex items-center gap-2">
            {/* Quick Button: Load Cầu Phước An Full Data */}
            <button
              onClick={onLoadPhuocAnData}
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors cursor-pointer"
              title="Khôi phục hoặc nạp toàn bộ 76 công việc số hóa của dự án Cầu Phước An"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Nạp Tiến Độ Cầu Phước An</span>
              <span className="xl:hidden">Cầu Phước An</span>
            </button>

            {/* Project Info Sheet Button */}
            <button
              onClick={onOpenProjectInfoModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Cập nhật thông tin dự án (Sheet: ThongTinDuAn)"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Thông Tin Dự Án</span>
            </button>

            {/* Excel Import button */}
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              title="Nhập dự án mới từ file Excel (.xlsx)"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Nhập Excel</span>
            </button>

            {/* Excel Export button */}
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              title="Xuất bảng tiến độ ra Excel"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Xuất Excel</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotificationCenter}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Thông báo & Nhắc việc thi công"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Add Task Button (Visible if Admin or Project Manager) */}
            {canAddTask && (
              <button
                onClick={onOpenNewTaskModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow transition-colors active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Thêm nhiệm vụ</span>
              </button>
            )}

            {/* User Profile & Role Switcher / RBAC Selector */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
              <button
                onClick={onOpenRoleManagerModal}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${badgeInfo.bg}`}
                title="Xem và chỉnh sửa phân quyền người dùng (RBAC)"
              >
                <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">{currentProfile.roleTitle}</span>
                <span className="xl:hidden">{currentProfile.role === 'ADMIN' ? 'Admin' : currentProfile.role === 'PROJECT_MANAGER' ? 'Quản lý' : 'Thành viên'}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {user ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title={`Đăng xuất (${user.email})`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLogin}
                  className="gsi-material-button inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-900 rounded-lg font-medium text-xs shadow hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="gsi-material-button-icon w-3.5 h-3.5">
                    <svg viewBox="0 0 48 48" className="w-full h-full">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="hidden sm:inline">Google</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
