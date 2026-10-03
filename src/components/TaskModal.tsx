import React, { useState, useEffect } from 'react';
import { BridgeTask, UserProfile } from '../types/bridge';
import { X, Save, AlertCircle, HardHat, Calendar, MapPin, CheckCircle, Mail } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: BridgeTask) => void;
  taskToEdit?: BridgeTask | null;
  existingTasks: BridgeTask[];
  allUsers: UserProfile[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  existingTasks,
  allUsers,
}) => {
  const [formData, setFormData] = useState<Partial<BridgeTask>>({
    id: '',
    wbs: 'Móng & Cọc',
    title: '',
    assignee: '',
    assigneeEmail: '',
    assigneeRole: 'Kỹ sư hiện trường',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    progress: 0,
    status: 'Chưa bắt đầu',
    priority: 'Trung bình',
    unit: 'm³',
    plannedQty: 100,
    actualQty: 0,
    location: '',
    weatherNotes: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setFormData(taskToEdit);
    } else {
      const nextNum = existingTasks.length + 1;
      const nextId = `CV-${String(nextNum).padStart(2, '0')}`;
      const defaultUser = allUsers[1] || allUsers[0];
      setFormData({
        id: nextId,
        wbs: 'Móng & Cọc',
        title: '',
        assignee: defaultUser ? defaultUser.name : 'KS. Nguyễn Văn Dũng',
        assigneeEmail: defaultUser ? defaultUser.email : 'dung.nguyen@cau-bridge.vn',
        assigneeRole: defaultUser ? defaultUser.roleTitle : 'Kỹ sư Cọc & Địa kỹ thuật',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        progress: 0,
        status: 'Chưa bắt đầu',
        priority: 'Trung bình',
        unit: 'm³',
        plannedQty: 100,
        actualQty: 0,
        location: 'Trụ T1 - Lòng sông',
        weatherNotes: '',
        notes: '',
      });
    }
    setError(null);
  }, [taskToEdit, isOpen, existingTasks, allUsers]);

  if (!isOpen) return null;

  const handleSelectAssignee = (name: string) => {
    const matched = allUsers.find(u => u.name === name);
    if (matched) {
      setFormData({
        ...formData,
        assignee: matched.name,
        assigneeEmail: matched.email,
        assigneeRole: matched.roleTitle
      });
    } else {
      setFormData({ ...formData, assignee: name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setError('Vui lòng nhập tên hạng mục công việc');
      return;
    }
    if (!formData.id?.trim()) {
      setError('Vui lòng nhập mã công việc');
      return;
    }

    onSave({
      ...(formData as BridgeTask),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {taskToEdit ? 'Chỉnh Sửa & Phân Công Nhiệm Vụ Thi Công' : 'Thêm Nhiệm Vụ Mới'}
              </h3>
              <p className="text-xs text-slate-500">
                Tự động ghi vào Google Sheets và kích hoạt thông báo nhắc việc
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã công việc *</label>
              <input
                type="text"
                required
                value={formData.id || ''}
                onChange={e => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="CV-01"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phân đoạn WBS Kết Cấu Cầu *</label>
              <select
                value={formData.wbs || 'Cọc Khoan Nhồi'}
                onChange={e => setFormData({ ...formData, wbs: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
              >
                <option value="Chuẩn Bị">Chuẩn Bị & Mặt Bằng Thi Công</option>
                <option value="Cọc Khoan Nhồi">Cọc Khoan Nhồi D1200 / D1500 (Mũi 1-3)</option>
                <option value="Bệ Móng Trụ">Bệ Móng Trụ (Cừ Larsen & Bê Tông)</option>
                <option value="Thân Trụ (VK Leo)">Thân Trụ (8 Bộ Ván Khuôn Leo)</option>
                <option value="Sản Xuất Dầm">Sản Xuất Dầm Super-T (Bãi Hiện Trường)</option>
                <option value="Lao Lắp Dầm">Lao Lắp Dầm & Dầm Ngang</option>
                <option value="Mặt Cầu & Hoàn Thiện">Bản Mặt Cầu, Khe Co Giãn & Gờ Lan Can</option>
                <option value="Hoàn Thiện">Thử Tải Cầu & Nghiệm Thu Bàn Giao</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên hạng mục thi công chi tiết *</label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Đổ bê tông đốt K1 dầm hộp đúc hẫng trụ T2..."
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
            />
          </div>

          {/* Assignee selection with quick role mapping */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Phân công Kỹ sư / Phụ trách hiện trường
              </label>
              <span className="text-[11px] text-slate-500">Tự động điền email & chức danh</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Họ và tên Kỹ sư</label>
                <div className="flex gap-2">
                  <select
                    value={formData.assignee || ''}
                    onChange={e => handleSelectAssignee(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="">-- Chọn kỹ sư từ danh sách --</option>
                    {allUsers.map(u => (
                      <option key={u.email} value={u.name}>{u.name} ({u.roleTitle})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email nhận thông báo</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.assigneeEmail || ''}
                    onChange={e => setFormData({ ...formData, assigneeEmail: e.target.value })}
                    placeholder="email@cau-bridge.vn"
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chức danh / Tổ đội thi công</label>
              <input
                type="text"
                value={formData.assigneeRole || ''}
                onChange={e => setFormData({ ...formData, assigneeRole: e.target.value })}
                placeholder="VD: Chỉ huy phó Hiện trường / Đội đúc dầm"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày hoàn thành dự kiến *</label>
              <input
                type="date"
                required
                value={formData.endDate || ''}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái thi công</label>
              <select
                value={formData.status || 'Chưa bắt đầu'}
                onChange={e => setFormData({ ...formData, status: e.target.value as BridgeTask['status'] })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold"
              >
                <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                <option value="Đang thi công">Đang thi công</option>
                <option value="Chậm tiến độ">Chậm tiến độ</option>
                <option value="Nghiệm thu">Nghiệm thu</option>
                <option value="Hoàn thành">Hoàn thành</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mức ưu tiên</label>
              <select
                value={formData.priority || 'Trung bình'}
                onChange={e => setFormData({ ...formData, priority: e.target.value as BridgeTask['priority'] })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="Khẩn cấp">Khẩn cấp</option>
                <option value="Cao">Cao</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Thấp">Thấp</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiến độ: <span className="text-amber-600 font-bold">{formData.progress || 0}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress || 0}
                onChange={e => setFormData({ ...formData, progress: Number(e.target.value) })}
                className="w-full mt-2 accent-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn vị tính</label>
              <input
                type="text"
                value={formData.unit || ''}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                placeholder="m³, Tấn, Cọc, Phiến..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khối lượng Thiết kế</label>
              <input
                type="number"
                value={formData.plannedQty || 0}
                onChange={e => setFormData({ ...formData, plannedQty: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khối lượng Lũy kế</label>
              <input
                type="number"
                value={formData.actualQty || 0}
                onChange={e => setFormData({ ...formData, actualQty: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Vị trí hiện trường cụ thể</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder="VD: Trụ giữa sông T2 (Lý trình Km 1+240)"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Thời tiết / Thủy văn ảnh hưởng</label>
            <input
              type="text"
              value={formData.weatherNotes || ''}
              onChange={e => setFormData({ ...formData, weatherNotes: e.target.value })}
              placeholder="VD: Nước sông dâng cao, gió cấp 5, tạm dừng ca đêm..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú kỹ thuật & An toàn</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="VD: Cần lưu ý cáp neo chống lật khi căng kéo..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow"
            >
              <Save className="w-4 h-4" />
              <span>{taskToEdit ? 'Lưu thay đổi' : 'Tạo nhiệm vụ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
