import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  X, 
  Save, 
  FileSpreadsheet, 
  HardHat, 
  Calendar, 
  MapPin, 
  Layers, 
  UserCheck, 
  Sparkles 
} from 'lucide-react';
import { ProjectInfo } from '../types/bridge';
import { PHUOC_AN_PROJECT_INFO } from '../data/phuocAnData';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectInfo: ProjectInfo;
  onSaveProjectInfo: (info: ProjectInfo) => void;
  isGoogleConnected: boolean;
}

export const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({
  isOpen,
  onClose,
  projectInfo,
  onSaveProjectInfo,
  isGoogleConnected,
}) => {
  const [formData, setFormData] = useState<ProjectInfo>(projectInfo);

  useEffect(() => {
    if (isOpen) {
      setFormData(projectInfo);
    }
  }, [isOpen, projectInfo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProjectInfo(formData);
    onClose();
  };

  const handleResetToPhuocAn = () => {
    setFormData(PHUOC_AN_PROJECT_INFO);
  };

  const handleSetTemplateForNewProject = () => {
    setFormData({
      name: 'Dự án Cầu mới (Ví dụ: Cầu Rạch Miễu 2 / Cầu Đại Ngãi)',
      package: 'Gói thầu số ...: Xây lắp cầu chính & đường dẫn',
      timeframe: '01/01/2027 - 31/12/2028 (730 ngày)',
      chiefEngineer: 'Kỹ sư Chỉ huy trưởng BCH',
      consultantLead: 'Trưởng đoàn Tư vấn giám sát',
      keyEquipment: '4 búa rung, 3 giàn khoan cọc nhồi, 6 bộ ván khuôn, 2 cẩu nổi',
      location: 'Tỉnh / Thành phố',
      investor: 'Ban Quản lý Dự án...'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Cập Nhật Thông Tin Dự Án (Tab Sheet: "ThongTinDuAn")
              </h3>
              <p className="text-xs text-slate-500">
                Lưu trữ các thông số dự án vào Google Sheet để dễ dàng tái sử dụng khi sang dự án khác
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
          {/* Quick presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <span className="font-semibold text-amber-900">Mẫu thiết lập nhanh:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToPhuocAn}
                className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-md text-amber-900 font-medium transition-colors"
              >
                Cầu Phước An (Gói 40)
              </button>
              <button
                type="button"
                onClick={handleSetTemplateForNewProject}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-semibold transition-colors flex items-center gap-1 shadow-xs"
              >
                <Sparkles className="w-3 h-3" />
                <span>Mẫu Dự Án Cầu Khác</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên dự án công trình cầu *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-slate-900"
                placeholder="VD: Dự án Cầu Phước An"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gói thầu / Lý trình xây dựng *
              </label>
              <input
                type="text"
                required
                value={formData.package}
                onChange={e => setFormData({ ...formData, package: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="VD: Gói thầu số 40: Xây lắp cầu dẫn từ trụ T40-T41 đến trụ T62"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian thi công (Tiến độ) *
              </label>
              <input
                type="text"
                required
                value={formData.timeframe}
                onChange={e => setFormData({ ...formData, timeframe: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                placeholder="17/08/2026 - 30/06/2027 (309 ngày)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa điểm / Vị trí xây dựng
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="VD: Phú Mỹ (Bà Rịa - Vũng Tàu) - Nhơn Trạch (Đồng Nai)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chỉ huy trưởng Ban chỉ huy (BCH) *
              </label>
              <input
                type="text"
                required
                value={formData.chiefEngineer}
                onChange={e => setFormData({ ...formData, chiefEngineer: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="Nguyễn Ngọc Sơn (Chỉ huy trưởng)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trưởng TVGS Hiện trường *
              </label>
              <input
                type="text"
                required
                value={formData.consultantLead}
                onChange={e => setFormData({ ...formData, consultantLead: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="Lê Anh Thắng (Trưởng TVGS Hiện trường - TECC02)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ban Quản lý Dự án / Chủ đầu tư
              </label>
              <input
                type="text"
                value={formData.investor || ''}
                onChange={e => setFormData({ ...formData, investor: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="VD: Ban QLDA Giao thông Khu vực Cái Mép - Thị Vải"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thiết bị, xe máy chính huy động trên công trường
              </label>
              <textarea
                rows={2}
                value={formData.keyEquipment}
                onChange={e => setFormData({ ...formData, keyEquipment: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                placeholder="3 mũi cọc khoan nhồi, 8 bộ ván khuôn leo, 4 bộ cừ Larsen IV, 2 cẩu tháp, 4 cẩu xích, giá lao dầm"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isGoogleConnected 
                ? 'Thông tin này sẽ được lưu đồng bộ trực tiếp vào trang tính "ThongTinDuAn" trên Google Sheet của bạn.'
                : 'Đăng nhập Google để lưu các thông số này vĩnh viễn vào tab "ThongTinDuAn" trên Google Sheet.'
              }
            </span>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thông Tin Dự Án</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
