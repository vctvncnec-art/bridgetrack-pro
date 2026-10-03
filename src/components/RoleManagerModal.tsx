import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Trash2, 
  Save, 
  X, 
  Check, 
  AlertCircle,
  FileSpreadsheet,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/bridge';

interface RoleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  currentProfile: UserProfile;
  onUpdateUsers: (users: UserProfile[]) => void;
  onSwitchActiveRole: (role: UserRole) => void;
  isGoogleConnected: boolean;
}

export const RoleManagerModal: React.FC<RoleManagerModalProps> = ({
  isOpen,
  onClose,
  users,
  currentProfile,
  onUpdateUsers,
  onSwitchActiveRole,
  isGoogleConnected,
}) => {
  const [userList, setUserList] = useState<UserProfile[]>(users);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('TEAM_MEMBER');
  const [newRoleTitle, setNewRoleTitle] = useState('Kỹ sư hiện trường');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    if (userList.some(u => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setStatusMsg('Email này đã tồn tại trong danh sách phân quyền.');
      return;
    }

    const updated = [
      ...userList,
      {
        email: newEmail.trim().toLowerCase(),
        name: newName.trim(),
        role: newRole,
        roleTitle: newRoleTitle.trim() || 'Kỹ sư hiện trường'
      }
    ];

    setUserList(updated);
    setNewEmail('');
    setNewName('');
    setStatusMsg('Đã thêm nhân sự vào danh sách. Nhấn "Lưu Phân Quyền" để cập nhật lên Google Sheets.');
  };

  const handleRoleChange = (email: string, role: UserRole) => {
    const updated = userList.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        let roleTitle = u.roleTitle;
        if (role === 'ADMIN') roleTitle = 'Giám đốc Điều hành / Tổng Chỉ huy';
        else if (role === 'PROJECT_MANAGER') roleTitle = 'Chỉ huy phó / Quản lý gói thầu';
        else if (role === 'TEAM_MEMBER') roleTitle = 'Kỹ sư hiện trường';
        return { ...u, role, roleTitle };
      }
      return u;
    });
    setUserList(updated);
  };

  const handleDeleteUser = (email: string) => {
    if (userList.length <= 1) {
      setStatusMsg('Không thể xóa toàn bộ người dùng dự án.');
      return;
    }
    const updated = userList.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    setUserList(updated);
  };

  const handleSaveAll = () => {
    onUpdateUsers(userList);
    setStatusMsg('Đã lưu phân quyền thành công!');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Phân Quyền Người Dùng & Quản Trị Hệ Thống (RBAC)
              </h3>
              <p className="text-xs text-slate-500">
                Liên kết trực tiếp với sheet "PhanQuyenNhanSu" trên Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {statusMsg && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Quick Role Simulation / Switch for testing & demo */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Chế độ trải nghiệm vai trò (Role Preview)
              </h4>
              <span className="text-[11px] text-blue-700 font-medium">
                Đang đóng vai: <strong>{currentProfile.roleTitle}</strong>
              </span>
            </div>
            <p className="text-xs text-blue-800/80 mb-3">
              Chuyển đổi vai trò để kiểm tra tức thì các giới hạn quyền hạn:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSwitchActiveRole('ADMIN')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  currentProfile.role === 'ADMIN'
                    ? 'border-rose-500 bg-rose-100/60 font-bold text-rose-900 ring-2 ring-rose-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Quản trị viên
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Toàn quyền thêm, sửa, xóa, phân quyền & xuất nhập Excel</div>
              </button>

              <button
                type="button"
                onClick={() => onSwitchActiveRole('PROJECT_MANAGER')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  currentProfile.role === 'PROJECT_MANAGER'
                    ? 'border-amber-500 bg-amber-100/60 font-bold text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Quản lý dự án
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Phân công nhiệm vụ, cập nhật tiến độ, duyệt khối lượng</div>
              </button>

              <button
                type="button"
                onClick={() => onSwitchActiveRole('TEAM_MEMBER')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  currentProfile.role === 'TEAM_MEMBER'
                    ? 'border-blue-500 bg-blue-100/60 font-bold text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Thành viên nhóm
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Xem và cập nhật tiến độ công việc được giao</div>
              </button>
            </div>
          </div>

          {/* User List Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Danh Sách Kỹ Sư & Phân Quyền Dữ Liệu ({userList.length})
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
              {userList.map(u => (
                <div key={u.email} className="p-3 bg-white hover:bg-slate-50/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 truncate">{u.name}</span>
                      <span className="text-[11px] text-slate-400 truncate">({u.email})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{u.roleTitle}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.email, e.target.value as UserRole)}
                      className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="ADMIN">Quản trị viên</option>
                      <option value="PROJECT_MANAGER">Quản lý dự án</option>
                      <option value="TEAM_MEMBER">Thành viên nhóm</option>
                    </select>

                    <button
                      onClick={() => handleDeleteUser(u.email)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Xóa quyền truy cập"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New User */}
          <form onSubmit={handleAddUser} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              Thêm Kỹ sư / Thành viên mới vào Dự án Cầu
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Họ và tên kỹ sư (VD: KS. Hoàng Văn Nam)..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <input
                type="email"
                required
                placeholder="Email Google (VD: nam.hoang@gmail.com)..."
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Chức vụ hiện trường (VD: Kỹ sư Trắc đạc)..."
                value={newRoleTitle}
                onChange={e => setNewRoleTitle(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as UserRole)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="TEAM_MEMBER">Thành viên nhóm (Chỉ cập nhật việc của mình)</option>
                <option value="PROJECT_MANAGER">Quản lý dự án (Phân công & duyệt tiến độ)</option>
                <option value="ADMIN">Quản trị viên (Toàn quyền hệ thống)</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm vào danh sách</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Tự động cập nhật sheet "PhanQuyenNhanSu"</span>
          </div>
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Phân Quyền</span>
          </button>
        </div>
      </div>
    </div>
  );
};
