import React from 'react';
import { BridgeTask } from '../types/bridge';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  HardHat, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface BridgeVisualizationProps {
  tasks: BridgeTask[];
  onSelectWbs: (wbs: string) => void;
  selectedWbs: string | null;
}

export const BridgeVisualization: React.FC<BridgeVisualizationProps> = ({
  tasks,
  onSelectWbs,
  selectedWbs,
}) => {
  // Key structural sections of Phuoc An Bridge Project (Gói thầu số 40: T40-T41 đến T62)
  const sections = [
    {
      id: 'Chuẩn Bị',
      name: 'Mặt Bằng & Trạm Trộn BTXM',
      type: 'prep',
      description: 'Trạm điện 560kVA, máy đào, bãi trữ',
      span: 'Chuẩn Bị',
    },
    {
      id: 'Cọc Khoan Nhồi',
      name: 'Cọc Khoan Nhồi D1200 (Mũi 1-3)',
      type: 'pile',
      description: 'Đã xong T41-T45, T59, T60, đang làm T47, T51, T52, T61, T62',
      span: 'Cọc Nhồi',
    },
    {
      id: 'Bệ Móng Trụ',
      name: 'Bệ Trụ T41 - T62 (Cừ Larsen & Bê Tông)',
      type: 'substructure_footing',
      description: 'Đã hoàn thành bệ T41 đến T45, đang thi công bệ T46',
      span: 'Bệ Móng',
    },
    {
      id: 'Thân Trụ (VK Leo)',
      name: 'Thân Trụ (8 Bộ Ván Khuôn Leo)',
      type: 'substructure_pier',
      description: 'Đã đúc xong T41 (đợt 1-8), T42 (đợt 1-6), T43 (đợt 1-5), T44 (đợt 1-2)',
      span: 'Thân Trụ',
    },
    {
      id: 'Sản Xuất Dầm',
      name: 'Bãi Đúc Dầm Super-T Hiện Trường',
      type: 'beam_cast',
      description: 'Đã đúc 38/110 phiến dầm Super-T, căng kéo cáp DUL',
      span: 'Đúc Dầm',
    },
    {
      id: 'Lao Lắp Dầm',
      name: 'Lao Lắp Dầm, Mặt Cầu & Hoàn Thiện',
      type: 'erection',
      description: 'Lao dầm nhịp T40-T62, bản liên tục nhiệt, thảm BTN & thử tải',
      span: 'Lao Dầm & HT',
    },
  ];

  const getSectionStats = (sectionId: string) => {
    const sectionTasks = tasks.filter(t => 
      t.wbs.toLowerCase().includes(sectionId.toLowerCase()) || 
      sectionId.toLowerCase().includes(t.wbs.toLowerCase())
    );

    if (sectionTasks.length === 0) {
      return { count: 0, progress: 0, hasDelayed: false, statusText: 'Chưa có việc' };
    }

    const count = sectionTasks.length;
    const progress = Math.round(sectionTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / count);
    const hasDelayed = sectionTasks.some(t => t.status === 'Chậm tiến độ');
    const isCompleted = sectionTasks.every(t => t.status === 'Hoàn thành');

    return {
      count,
      progress,
      hasDelayed,
      isCompleted,
      statusText: isCompleted ? 'Đã hoàn thành' : hasDelayed ? 'Có việc trễ' : `${progress}% hoàn tất`
    };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Sơ Họa Chuỗi Thi Công Tuyến Cầu Phước An (Trụ T40-T41 Đến Trụ T62)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bấm vào từng phân đoạn để lọc nhanh nhiệm vụ chi tiết và tiến độ phân công hiện trường
          </p>
        </div>
        {selectedWbs && (
          <button
            onClick={() => onSelectWbs('')}
            className="text-xs text-amber-600 font-semibold hover:text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200"
          >
            Hiển thị tất cả ({tasks.length} CV)
          </button>
        )}
      </div>

      {/* Interactive Visual Bridge schematic */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {sections.map(sec => {
          const stats = getSectionStats(sec.id);
          const isSelected = selectedWbs?.toLowerCase() === sec.id.toLowerCase();

          return (
            <button
              key={sec.id}
              onClick={() => onSelectWbs(isSelected ? '' : sec.id)}
              className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer ${
                isSelected 
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50' 
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
              }`}
            >
              {/* Progress bar line at top */}
              <div 
                className={`absolute top-0 left-0 h-1 transition-all ${
                  stats.hasDelayed 
                    ? 'bg-rose-500' 
                    : stats.isCompleted 
                    ? 'bg-emerald-500' 
                    : 'bg-amber-500'
                }`}
                style={{ width: `${stats.progress}%` }}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600 px-1.5 py-0.5 rounded bg-slate-200">
                    {sec.span}
                  </span>
                  {stats.hasDelayed ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  ) : stats.isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <span className="text-xs font-bold text-slate-700">{stats.progress}%</span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-2">
                  {sec.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {sec.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">
                  {stats.count} nhiệm vụ
                </span>
                <span className={`font-semibold ${
                  stats.hasDelayed ? 'text-rose-600' : 'text-slate-600'
                }`}>
                  {stats.statusText}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
